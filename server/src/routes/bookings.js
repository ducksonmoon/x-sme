const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const moment = require('moment');
const { checkBookingLimit, trackUsage } = require('../utils/planEnforcement');
const realtimeService = require('../services/realtimeService');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateBooking = [
  body('businessId').isString().withMessage('Business ID is required'),
  body('serviceId').isString().withMessage('Service ID is required'),
  body('customerName').trim().isLength({ min: 2, max: 100 }).withMessage('Customer name must be between 2 and 100 characters'),
  body('customerPhone').matches(/^(\+98|0)?9\d{9}$/).withMessage('Invalid Iranian phone number'),
  body('customerEmail').optional().isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required (HH:MM)'),
  body('endTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required (HH:MM)'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes too long')
];

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, businessId, status, date } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (businessId) where.businessId = businessId;
    if (status) where.status = status;
    if (date) where.date = new Date(date);

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          business: {
            select: { id: true, name: true, phone: true }
          },
          service: {
            select: { id: true, name: true, price: true }
          },
          payments: {
            where: { status: 'SUCCESS' },
            select: { id: true, amount: true, gateway: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        business: {
          select: { id: true, name: true, phone: true, email: true, address: true }
        },
        service: {
          select: { id: true, name: true, price: true, duration: true }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        },
        reminders: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create booking
// @route   POST /api/bookings
// @access  Public
router.post('/', validateBooking, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      businessId,
      serviceId,
      staffId, // Add staff ID support
      customerName,
      customerPhone,
      customerEmail,
      date,
      startTime,
      endTime,
      notes
    } = req.body;

    // Validate required fields
    if (!endTime) {
      return res.status(400).json({
        success: false,
        error: 'End time is required'
      });
    }

    // Validate that endTime is after startTime
    const startMoment = moment(startTime, 'HH:mm');
    const endMoment = moment(endTime, 'HH:mm');
    
    if (!startMoment.isValid() || !endMoment.isValid()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid time format. Use HH:MM format'
      });
    }
    
    if (endMoment.isSameOrBefore(startMoment)) {
      return res.status(400).json({
        success: false,
        error: 'End time must be after start time'
      });
    }

    console.log(`[Booking Request] Customer: ${customerName}, Selected Time: ${startTime} - ${endTime}, Date: ${date}, Service: ${serviceId}`);

    // Check if business, service, and staff (if provided) exist
    const [business, service] = await Promise.all([
      prisma.business.findUnique({
        where: { id: businessId },
        include: { settings: true }
      }),
      prisma.service.findUnique({
        where: { id: serviceId },
        include: {
          staff: {
            include: {
              staff: true
            }
          }
        }
      })
    ]);

    if (!business || !service) {
      return res.status(404).json({
        success: false,
        error: 'Business or service not found'
      });
    }

    if (service.businessId !== businessId) {
      return res.status(400).json({
        success: false,
        error: 'Service does not belong to this business'
      });
    }

    // Validate staff if provided
    let assignedStaff = null;
    if (staffId) {
      assignedStaff = await prisma.staff.findUnique({
        where: { id: staffId },
        include: {
          services: {
            where: { serviceId }
          }
        }
      });

      if (!assignedStaff) {
        return res.status(404).json({
          success: false,
          error: 'Staff member not found'
        });
      }

      if (assignedStaff.businessId !== businessId) {
        return res.status(400).json({
          success: false,
          error: 'Staff member does not belong to this business'
        });
      }

      // Check if staff is assigned to this service
      if (assignedStaff.services.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Staff member is not assigned to this service'
        });
      }

      if (!assignedStaff.isActive) {
        return res.status(400).json({
          success: false,
          error: 'Staff member is not active'
        });
      }
    }

    // **BUSINESS LOGIC: Check booking limits based on subscription plan**
    const bookingLimitCheck = await checkBookingLimit(businessId);
    if (!bookingLimitCheck.allowed) {
      return res.status(403).json({
        success: false,
        error: bookingLimitCheck.reason,
        ...(bookingLimitCheck.usage && { usage: bookingLimitCheck.usage })
      });
    }

    // **ENHANCED BUSINESS LOGIC: Comprehensive time slot availability check**
    // Use the provided endTime instead of calculating from service duration
    const availabilityCheck = await validateTimeSlotAvailability(
      businessId, 
      serviceId, 
      date, 
      startTime, 
      endTime
    );

    if (!availabilityCheck.canBook) {
      return res.status(400).json({
        success: false,
        error: availabilityCheck.message,
        details: {
          hasConflictingBooking: !!availabilityCheck.conflictingBooking,
          timeSlotExists: !!availabilityCheck.timeSlot,
          timeSlotBooked: availabilityCheck.timeSlot?.isBooked || false
        }
      });
    }

          // If no time slot exists, create one for consistency
      let timeSlot = availabilityCheck.timeSlot;
      if (!timeSlot) {
        try {
          timeSlot = await prisma.timeSlot.create({
            data: {
              serviceId,
              date: new Date(date),
              startTime,
              endTime,
              isBooked: true, // Mark as booked immediately
              capacity: 1, // One booking taken
              maxCapacity: 1, // Default capacity
              isPeakHour: false,
              notes: null,
            }
          });
          console.log(`[Time Slot Created] New slot ${startTime}-${endTime} created for ${date}`);
        } catch (error) {
          // If time slot creation fails, we can still proceed with the booking
          console.warn('Failed to create time slot:', error);
        }
      }

    // Calculate amounts
    const totalAmount = service.price;
    const depositAmount = business.settings?.depositRequired 
      ? totalAmount * (business.settings.depositPercentage / 100)
      : null;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        businessId,
        serviceId,
        staffId, // Include staff assignment
        customerName,
        customerPhone,
        customerEmail,
        date: new Date(date),
        startTime,
        endTime,
        totalAmount,
        depositAmount,
        notes,
        status: 'PENDING'
      },
      include: {
        business: {
          select: { name: true, phone: true, settings: true }
        },
        service: {
          select: { name: true, price: true, duration: true }
        },
        staff: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    console.log(`[Booking Created] ID: ${booking.id}, Customer: ${customerName}, Time: ${startTime}-${endTime} (Selected: ${startTime}-${endTime}), Date: ${date}`);

    // **ENHANCED BUSINESS LOGIC: Mark the time slot as booked and update capacity**
    if (timeSlot) {
      try {
        // Check current capacity
        const currentSlot = await prisma.timeSlot.findUnique({
          where: { id: timeSlot.id }
        });
        
        if (currentSlot) {
          // Update capacity and mark as booked if at max capacity
          const newCapacity = currentSlot.capacity + 1;
          const isFullyBooked = newCapacity >= currentSlot.maxCapacity;
          
          const updatedTimeSlot = await prisma.timeSlot.update({
            where: { id: timeSlot.id },
            data: { 
              isBooked: isFullyBooked,
              capacity: newCapacity
            }
          });
          
          console.log(`[Time Slot Booked] Slot ${timeSlot.id} updated - Capacity: ${newCapacity}/${currentSlot.maxCapacity}, isBooked: ${updatedTimeSlot.isBooked}`);
          
          // Verify the update was successful
          const verifySlot = await prisma.timeSlot.findUnique({
            where: { id: timeSlot.id }
          });
          console.log(`[Time Slot Verification] Slot ${timeSlot.id} verification - capacity: ${verifySlot?.capacity}/${verifySlot?.maxCapacity}, isBooked: ${verifySlot?.isBooked}`);
          
          if (verifySlot?.capacity !== newCapacity) {
            console.error(`[Time Slot Error] Failed to update capacity for slot ${timeSlot.id} - verification failed`);
          }
        }
      } catch (error) {
        console.error('Failed to update time slot booking status and capacity:', error);
      }
    } else {
      console.warn(`[Time Slot Warning] No time slot found to mark as booked for booking ${booking.id}`);
    }

    // Create confirmation reminder
    if (business.settings?.smsEnabled || business.settings?.telegramEnabled) {
      await prisma.reminder.create({
        data: {
          bookingId: booking.id,
          type: 'CONFIRMATION',
          channel: business.settings.telegramEnabled ? 'TELEGRAM' : 'SMS',
          scheduledAt: moment().add(5, 'minutes').toDate()
        }
      });
    }

    // **BUSINESS LOGIC: Track booking usage for subscription**
    await trackUsage(businessId, 'booking', totalAmount);

    // **REAL-TIME: Emit booking created event**
    realtimeService.emitBookingCreated(booking);

    // **REAL-TIME: Emit time slot booked event if time slot exists**
    if (timeSlot) {
      realtimeService.emitTimeSlotBooked(businessId, serviceId, timeSlot, booking);
    }

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully',
      timeSlot: {
        id: timeSlot?.id,
        exists: !!timeSlot,
        wasCreated: !availabilityCheck.timeSlot,
        isBooked: true
      },
      debug: {
        selectedTimeSlot: `${startTime} - ${endTime}`,
        bookedTimeSlot: `${booking.startTime} - ${booking.endTime}`,
        timeSlotMatches: startTime === booking.startTime && endTime === booking.endTime
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Public
router.put('/:id/status', [
  body('status').isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).withMessage('Invalid status')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Get the current booking to check previous status
    const currentBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        business: {
          select: { name: true, phone: true, settings: true }
        },
        service: {
          select: { name: true, price: true }
        }
      }
    });

    if (!currentBooking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { 
        status,
        notes: status === 'CANCELLED' ? currentBooking.notes : null
      },
      include: {
        business: {
          select: { name: true, phone: true }
        },
        service: {
          select: { name: true, price: true }
        }
      }
    });

    // **ENHANCED BUSINESS LOGIC: Handle time slot availability based on status change**
    const queryDate = new Date(updatedBooking.date);
    const startOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate());
    const endOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 23, 59, 59, 999);
    
    const timeSlot = await prisma.timeSlot.findFirst({
      where: {
        serviceId: updatedBooking.serviceId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        startTime: updatedBooking.startTime,
        endTime: updatedBooking.endTime,
      }
    });

    if (timeSlot) {
      try {
        // If booking is cancelled or no-show, free up the time slot
        if (status === 'CANCELLED' || status === 'NO_SHOW') {
          await prisma.timeSlot.update({
            where: { id: timeSlot.id },
            data: { isBooked: false }
          });
        }
        // If booking is confirmed or pending, ensure time slot is booked
        else if (status === 'CONFIRMED' || status === 'PENDING') {
          await prisma.timeSlot.update({
            where: { id: timeSlot.id },
            data: { isBooked: true }
          });
        }
        // For completed status, keep the slot booked (historical record)
      } catch (error) {
        console.warn('Failed to update time slot booking status:', error);
      }
    }

    // Create reminder for status change
    if (status === 'CONFIRMED' && updatedBooking.business.settings?.smsEnabled) {
      await prisma.reminder.create({
        data: {
          bookingId: updatedBooking.id,
          type: 'REMINDER',
          channel: 'SMS',
          scheduledAt: moment(updatedBooking.date).subtract(updatedBooking.business.settings.reminderTime, 'minutes').toDate()
        }
      });
    }

    // **REAL-TIME: Emit booking updated event**
    realtimeService.emitBookingUpdated(updatedBooking, currentBooking.status);

    // **REAL-TIME: Emit time slot availability change if applicable**
    if (timeSlot) {
      if (status === 'CANCELLED' || status === 'NO_SHOW') {
        realtimeService.emitTimeSlotFreed(updatedBooking.businessId, updatedBooking.serviceId, timeSlot);
      } else if (status === 'CONFIRMED' || status === 'PENDING') {
        realtimeService.emitTimeSlotBooked(updatedBooking.businessId, updatedBooking.serviceId, timeSlot, updatedBooking);
      }
    }

    res.json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Public
router.put('/:id/cancel', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        business: {
          select: { settings: true }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check cancellation policy
    const bookingDate = moment(booking.date);
    const now = moment();
    const hoursUntilBooking = bookingDate.diff(now, 'hours');

    if (hoursUntilBooking < 24) {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel booking within 24 hours'
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        notes: reason ? `${booking.notes || ''}\nCancellation reason: ${reason}`.trim() : booking.notes
      },
      include: {
        business: {
          select: { name: true, phone: true }
        },
        service: {
          select: { name: true, price: true }
        }
      }
    });

    // **ENHANCED BUSINESS LOGIC: Free up the time slot when booking is cancelled**
    const queryDate = new Date(booking.date);
    const startOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate());
    const endOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 23, 59, 59, 999);
    
    const timeSlot = await prisma.timeSlot.findFirst({
      where: {
        serviceId: booking.serviceId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        startTime: booking.startTime,
        endTime: booking.endTime,
      }
    });

    if (timeSlot) {
      try {
        await prisma.timeSlot.update({
          where: { id: timeSlot.id },
          data: { isBooked: false }
        });
      } catch (error) {
        console.warn('Failed to free up time slot after cancellation:', error);
      }
    }

    // Create cancellation reminder
    if (booking.business.settings?.smsEnabled) {
      await prisma.reminder.create({
        data: {
          bookingId: booking.id,
          type: 'CANCELLATION',
          channel: 'SMS',
          scheduledAt: moment().add(5, 'minutes').toDate()
        }
      });
    }

    // **REAL-TIME: Emit booking cancelled event**
    realtimeService.emitBookingCancelled(updatedBooking, reason);

    // **REAL-TIME: Emit time slot freed event if time slot exists**
    if (timeSlot) {
      realtimeService.emitTimeSlotFreed(booking.businessId, booking.serviceId, timeSlot);
    }

    res.json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get bookings for a specific business
// @route   GET /api/bookings/business/:businessId
// @access  Business owner, Staff, Admin
router.get('/business/:businessId', async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 10, status, date, serviceId } = req.query;
    const skip = (page - 1) * limit;

    const where = { businessId };
    
    // Handle status parameter - can be single value or comma-separated values
    if (status) {
      if (status.includes(',')) {
        // Parse comma-separated values into array
        const statusArray = status.split(',').map(s => s.trim()).filter(s => s);
        where.status = { in: statusArray };
      } else {
        // Single status value
        where.status = status.trim();
      }
    }
    
    // Handle optional serviceId filter
    if (serviceId) {
      where.serviceId = serviceId;
    }
    
    if (date) where.date = new Date(date);

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          service: {
            select: { id: true, name: true, price: true }
          },
          payments: {
            where: { status: 'SUCCESS' },
            select: { id: true, amount: true, gateway: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Business owner, Staff, Admin
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Get the current booking first
    const currentBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: {
          select: { id: true, name: true, price: true }
        }
      }
    });

    if (!currentBooking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        service: {
          select: { id: true, name: true, price: true }
        }
      }
    });

    // **ENHANCED BUSINESS LOGIC: Handle time slot availability based on status change**
    await updateTimeSlotAvailability(booking, status);

    res.json({
      success: true,
      ...booking
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Debug endpoint to check time slot and booking status
// @route   GET /api/bookings/debug/:businessId/:serviceId/:date
// @access  Public (for debugging)
router.get('/debug/:businessId/:serviceId/:date', async (req, res, next) => {
  try {
    const { businessId, serviceId, date } = req.params;

    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate());
    const endOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 23, 59, 59, 999);

    // Get all time slots for this date/service
    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        serviceId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { startTime: 'asc' }
    });

    // Get all bookings for this date/service
    const bookings = await prisma.booking.findMany({
      where: {
        businessId,
        serviceId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        customerName: true,
        startTime: true,
        endTime: true,
        status: true,
        createdAt: true
      },
      orderBy: { startTime: 'asc' }
    });

    res.json({
      success: true,
      debug: {
        date,
        businessId,
        serviceId,
        timeSlots: timeSlots.map(slot => ({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBooked: slot.isBooked,
          createdAt: slot.createdAt,
          updatedAt: slot.updatedAt
        })),
        bookings: bookings,
        summary: {
          totalTimeSlots: timeSlots.length,
          bookedTimeSlots: timeSlots.filter(s => s.isBooked).length,
          availableTimeSlots: timeSlots.filter(s => !s.isBooked).length,
          totalBookings: bookings.length,
          activeBookings: bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status)).length
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// **HELPER FUNCTION: Validate time slot availability**
async function validateTimeSlotAvailability(businessId, serviceId, date, startTime, endTime) {
  try {
    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate());
    const endOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 23, 59, 59, 999);
    
    // Check if time slot exists in database
    const timeSlot = await prisma.timeSlot.findFirst({
      where: {
        serviceId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        startTime,
        endTime,
      }
    });

    // Check for conflicting bookings
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        businessId,
        serviceId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          }
        ]
      }
    });

    // Check capacity if time slot exists
    let canBook = !conflictingBooking;
    let message = 'Time slot is available';
    
    if (conflictingBooking) {
      canBook = false;
      message = 'Time slot conflicts with existing booking';
    } else if (timeSlot) {
      if (timeSlot.isBooked) {
        canBook = false;
        message = 'Time slot is already fully booked';
      } else if (timeSlot.capacity >= timeSlot.maxCapacity) {
        canBook = false;
        message = 'Time slot has reached maximum capacity';
      }
    }
    
    return {
      isValid: true,
      timeSlot,
      conflictingBooking,
      canBook,
      message
    };
  } catch (error) {
    console.error('Error validating time slot availability:', error);
    return {
      isValid: false,
      error: error.message,
      canBook: false,
      message: 'Error checking availability'
    };
  }
}

// **HELPER FUNCTION: Manage time slot availability**
async function updateTimeSlotAvailability(booking, status) {
  try {
    const queryDate = new Date(booking.date);
    const startOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate());
    const endOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 23, 59, 59, 999);
    
    const timeSlot = await prisma.timeSlot.findFirst({
      where: {
        serviceId: booking.serviceId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        startTime: booking.startTime,
        endTime: booking.endTime,
      }
    });

    if (timeSlot) {
      // Get current capacity and determine new capacity based on status change
      const currentCapacity = timeSlot.capacity;
      let newCapacity = currentCapacity;
      let shouldBeBooked = true;
      
      // Determine capacity change based on status
      if (status === 'CANCELLED' || status === 'NO_SHOW') {
        // Decrease capacity when booking is cancelled
        newCapacity = Math.max(0, currentCapacity - 1);
        shouldBeBooked = newCapacity >= timeSlot.maxCapacity;
      } else if (status === 'CONFIRMED' || status === 'PENDING') {
        // Keep current capacity for active bookings
        shouldBeBooked = newCapacity >= timeSlot.maxCapacity;
      }
      // For 'COMPLETED' status, keep current capacity for historical purposes
      
      await prisma.timeSlot.update({
        where: { id: timeSlot.id },
        data: { 
          isBooked: shouldBeBooked,
          capacity: newCapacity
        }
      });
      
      console.log(`[Time Slot Update] Slot ${booking.startTime}-${booking.endTime} for ${booking.date.toISOString().split('T')[0]} - Capacity: ${newCapacity}/${timeSlot.maxCapacity}, isBooked: ${shouldBeBooked} due to booking status: ${status}`);
    } else {
      console.warn(`[Time Slot Warning] No time slot found for booking ${booking.id} at ${booking.startTime}-${booking.endTime} on ${booking.date.toISOString().split('T')[0]}`);
    }
  } catch (error) {
    console.error('Failed to update time slot availability:', error);
  }
}

module.exports = router; 
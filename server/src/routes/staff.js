const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateStaff = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('specialization').optional().isString(),
  body('bio').optional().isString(),
  body('experience').optional().isString(),
  body('isActive').optional().isBoolean(),
  body('workingHours').optional().isArray(),
  body('serviceIds').optional().isArray(),
];

// @route   GET /api/staff
// @desc    Get all staff for a business
// @access  Private (Business owners and staff only)
router.get('/', authenticate, authorize('BUSINESS_OWNER', 'STAFF'), async (req, res, next) => {
  try {
    const { businessId } = req.query;
    
    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: 'Business ID is required'
      });
    }

    const staff = await prisma.staff.findMany({
      where: { businessId },
      include: {
        staff_services: {
          include: {
            services: {
              select: {
                id: true,
                name: true,
                price: true,
                duration: true
              }
            }
          }
        },
        staff_working_hours: {
          orderBy: { dayOfWeek: 'asc' }
        },
        staff_breaks: true,
        staff_time_off: {
          where: {
            startDate: { gte: new Date() }
          },
          orderBy: { startDate: 'asc' }
        },
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/staff/:id
// @desc    Get single staff member
// @access  Private (Business owners and staff only)
router.get('/:id', authenticate, authorize('BUSINESS_OWNER', 'STAFF'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        staff_services: {
          include: {
            services: {
              select: {
                id: true,
                name: true,
                price: true,
                duration: true
              }
            }
          }
        },
        staff_working_hours: {
          orderBy: { dayOfWeek: 'asc' }
        },
        staff_breaks: true,
        staff_time_off: {
          where: {
            startDate: { gte: new Date() }
          },
          orderBy: { startDate: 'asc' }
        },
        _count: {
          select: { bookings: true }
        }
      }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/staff
// @desc    Create new staff member
// @access  Private (Business owners only)
router.post('/', authenticate, authorize('BUSINESS_OWNER'), validateStaff, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      businessId,
      firstName,
      lastName,
      email,
      phone,
      specialization,
      bio,
      experience,
      isActive = true,
      workingHours = [],
      serviceIds = []
    } = req.body;

    // Create staff member
    const staff = await prisma.staff.create({
      data: {
        businessId,
        firstName,
        lastName,
        email,
        phone,
        specialization,
        bio,
        experience,
        isActive
      }
    });

    // Add working hours if provided
    if (workingHours.length > 0) {
      await prisma.staff_working_hours.createMany({
        data: workingHours.map(wh => ({
          staffId: staff.id,
          dayOfWeek: wh.dayOfWeek,
          startTime: wh.startTime,
          endTime: wh.endTime,
          isActive: wh.isActive !== false
        }))
      });
    }

    // Assign services if provided
    if (serviceIds.length > 0) {
      await prisma.staff_services.createMany({
        data: serviceIds.map(serviceId => ({
          staffId: staff.id,
          serviceId,
          customPrice: null // Can be set later
        }))
      });
    }

    // Fetch the created staff with relations
    const createdStaff = await prisma.staff.findUnique({
      where: { id: staff.id },
      include: {
        staff_services: {
          include: {
            services: {
              select: {
                id: true,
                name: true,
                price: true,
                duration: true
              }
            }
          }
        },
        staff_working_hours: {
          orderBy: { dayOfWeek: 'asc' }
        },
        staff_breaks: true,
        staff_time_off: true,
        _count: {
          select: { bookings: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: createdStaff
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/staff/:id
// @desc    Update staff member
// @access  Private (Business owners only)
router.put('/:id', authenticate, authorize('BUSINESS_OWNER'), validateStaff, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      specialization,
      bio,
      experience,
      isActive,
      workingHours,
      serviceIds
    } = req.body;

    // Check if staff exists
    const existingStaff = await prisma.staff.findUnique({
      where: { id }
    });

    if (!existingStaff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    // Update staff member
    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        specialization,
        bio,
        experience,
        isActive
      }
    });

    // Update working hours if provided
    if (workingHours) {
      // Delete existing working hours
      await prisma.staff_working_hours.deleteMany({
        where: { staffId: id }
      });

      // Create new working hours
      if (workingHours.length > 0) {
        await prisma.staff_working_hours.createMany({
          data: workingHours.map(wh => ({
            staffId: id,
            dayOfWeek: wh.dayOfWeek,
            startTime: wh.startTime,
            endTime: wh.endTime,
            isActive: wh.isActive !== false
          }))
        });
      }
    }

    // Update service assignments if provided
    if (serviceIds) {
      // Delete existing service assignments
      await prisma.staff_services.deleteMany({
        where: { staffId: id }
      });

      // Create new service assignments
      if (serviceIds.length > 0) {
        await prisma.staff_services.createMany({
          data: serviceIds.map(serviceId => ({
            staffId: id,
            serviceId,
            customPrice: null
          }))
        });
      }
    }

    // Fetch updated staff with relations
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        staff_services: {
          include: {
            services: {
              select: {
                id: true,
                name: true,
                price: true,
                duration: true
              }
            }
          }
        },
        staff_working_hours: {
          orderBy: { dayOfWeek: 'asc' }
        },
        staff_breaks: true,
        staff_time_off: true,
        _count: {
          select: { bookings: true }
        }
      }
    });

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/staff/:id
// @desc    Delete staff member
// @access  Private (Business owners only)
router.delete('/:id', authenticate, authorize('BUSINESS_OWNER'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if staff exists
    const existingStaff = await prisma.staff.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    });

    if (!existingStaff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    // Check for existing bookings
    const futureBookings = await prisma.booking.count({
      where: {
        staffId: id,
        date: { gte: new Date() },
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (futureBookings > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete staff member with ${futureBookings} future bookings. Please reassign or cancel bookings first.`
      });
    }

    // Delete staff member and related data
    await prisma.staff.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/staff/:id/availability
// @desc    Get staff availability for a specific date
// @access  Private (Business owners and staff only)
router.get('/:id/availability', authenticate, authorize('BUSINESS_OWNER', 'STAFF'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, serviceId } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date is required'
      });
    }

    const availability = await getStaffAvailability(id, date, serviceId);

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/staff/:id/time-off
// @desc    Add time off for staff member
// @access  Private (Business owners only)
router.post('/:id/time-off', authenticate, authorize('BUSINESS_OWNER'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, type, reason } = req.body;

    if (!startDate || !endDate || !type) {
      return res.status(400).json({
        success: false,
        error: 'Start date, end date, and type are required'
      });
    }

    const timeOff = await prisma.staff_time_off.create({
      data: {
        staffId: id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        reason
      }
    });

    res.status(201).json({
      success: true,
      data: timeOff
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/staff/service/:serviceId
// @desc    Get staff members assigned to a specific service
// @access  Public (for booking widget)
router.get('/service/:serviceId', async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const { date } = req.query;

    const staff = await prisma.staff.findMany({
      where: {
        isActive: true,
        staff_services: {
          some: {
            serviceId: serviceId
          }
        }
      },
      include: {
        staff_services: {
          where: {
            serviceId: serviceId
          },
          include: {
            services: {
              select: {
                id: true,
                name: true,
                price: true,
                duration: true
              }
            }
          }
        },
        staff_working_hours: {
          orderBy: { dayOfWeek: 'asc' }
        },
        staff_breaks: true,
        staff_time_off: {
          where: {
            startDate: { lte: new Date(date || new Date()) },
            endDate: { gte: new Date(date || new Date()) }
          }
        }
      },
      orderBy: { firstName: 'asc' }
    });

    // Filter out staff who are on time off for the requested date
    const availableStaff = staff.filter(member => {
      if (!date) return true;
      
      return member.staff_time_off.length === 0;
    });

    res.json({
      success: true,
      data: availableStaff
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to get staff availability
async function getStaffAvailability(staffId, date, serviceId) {
  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    include: {
      staff_working_hours: true,
      staff_breaks: true,
      staff_time_off: {
        where: {
          startDate: { lte: new Date(date) },
          endDate: { gte: new Date(date) }
        }
      },
      staff_services: serviceId ? {
        where: { serviceId }
      } : true
    }
  });

  if (!staff) {
    throw new Error('Staff member not found');
  }

  // Check if staff is on time off
  if (staff.staff_time_off.length > 0) {
    return {
      available: false,
      reason: 'Staff member is on time off',
      timeOff: staff.staff_time_off[0]
    };
  }

  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = new Date(date).getDay();
  
  // Find working hours for this day
  const workingHour = staff.staff_working_hours.find(wh => 
    wh.dayOfWeek === dayOfWeek && wh.isActive
  );

  if (!workingHour) {
    return {
      available: false,
      reason: 'Staff member is not working on this day',
      dayOfWeek
    };
  }

  // Get existing bookings for this staff member on this date
  const bookings = await prisma.booking.findMany({
    where: {
      staffId,
      date: new Date(date),
      status: { in: ['PENDING', 'CONFIRMED'] }
    },
    select: {
      startTime: true,
      endTime: true
    },
    orderBy: { startTime: 'asc' }
  });

  return {
    available: true,
    workingHours: {
      startTime: workingHour.startTime,
      endTime: workingHour.endTime
    },
    breaks: staff.staff_breaks.filter(b => b.dayOfWeek === dayOfWeek),
    existingBookings: bookings,
    staff: {
      id: staff.id,
      firstName: staff.firstName,
      lastName: staff.lastName,
      specialization: staff.specialization
    }
  };
}

module.exports = router; 
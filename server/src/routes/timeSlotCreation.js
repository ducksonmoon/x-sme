const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const timeSlotCreationService = require('../services/timeSlotCreationService');
const moment = require('moment');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateTimeSlotCreation = [
  body('businessId').notEmpty().withMessage('Business ID is required'),
  body('template').isIn(['weekly', 'daily', 'custom', 'bulk', 'smart']).withMessage('Invalid template type'),
  body('pattern').isObject().withMessage('Pattern must be an object'),
  body('conflictResolution').optional().isIn(['skip', 'overwrite', 'merge']).withMessage('Invalid conflict resolution'),
  body('preview').optional().isBoolean(),
  body('applyHolidays').optional().isBoolean(),
  body('applyBreaks').optional().isBoolean(),
];

// @route   POST /api/time-slots/create
// @desc    Create time slots with advanced business logic
// @access  Private (Business owners and staff only)
router.post('/create', authenticate, authorize('BUSINESS_OWNER', 'STAFF'), validateTimeSlotCreation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const options = {
      ...req.body,
      metadata: {
        createdBy: req.user.id,
        createdAt: new Date(),
        userAgent: req.get('User-Agent'),
        ip: req.ip
      }
    };

    const result = await timeSlotCreationService.createTimeSlots(options);

    res.json({
      success: true,
      data: result.data,
      preview: result.preview || false
    });

  } catch (error) {
    console.error('Error creating time slots:', error);
    next(error);
  }
});

// @route   POST /api/time-slots/preview
// @desc    Preview time slots before creation
// @access  Private (Business owners and staff only)
router.post('/preview', authenticate, authorize('BUSINESS_OWNER', 'STAFF'), validateTimeSlotCreation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const options = {
      ...req.body,
      preview: true // Force preview mode
    };

    const result = await timeSlotCreationService.createTimeSlots(options);

    res.json({
      success: true,
      preview: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error previewing time slots:', error);
    next(error);
  }
});

// @route   POST /api/time-slots/create-recurring
// @desc    Create recurring time slots with advanced options
// @access  Private (Business owners and staff only)
router.post('/create-recurring', authenticate, authorize('BUSINESS_OWNER', 'STAFF'), [
  body('businessId').notEmpty().withMessage('Business ID is required'),
  body('serviceId').notEmpty().withMessage('Service ID is required'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),
  body('intervalMinutes').isInt({ min: 5, max: 480 }).withMessage('Interval must be between 5 and 480 minutes'),
  body('maxCapacity').isInt({ min: 1 }).withMessage('Max capacity must be at least 1'),
  body('capacity').isInt({ min: 0 }).withMessage('Capacity must be non-negative'),
  body('repeatType').isIn(['daily', 'weekly', 'monthly']).withMessage('Repeat type must be daily, weekly, or monthly'),
  body('repeatCount').isInt({ min: 1, max: 365 }).withMessage('Repeat count must be between 1 and 365'),
  body('repeatDays').optional().isArray().withMessage('Repeat days must be an array'),
  body('excludeWeekends').optional().isBoolean().withMessage('Exclude weekends must be a boolean'),
  body('excludeHolidays').optional().isBoolean().withMessage('Exclude holidays must be a boolean'),
  body('isPeakHour').optional().isBoolean().withMessage('Is peak hour must be a boolean'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('staffId').optional().isString().withMessage('Staff ID must be a string'),
], async (req, res, next) => {
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
      serviceId,
      startDate,
      endDate,
      startTime,
      endTime,
      intervalMinutes,
      maxCapacity,
      capacity,
      repeatType,
      repeatCount,
      repeatDays = [1, 2, 3, 4, 5],
      excludeWeekends = false,
      excludeHolidays = true,
      isPeakHour = false,
      notes = '',
      staffId
    } = req.body;

    // Create base schedule for the first day
    const baseSchedule = {
      date: startDate,
      startTime,
      endTime,
      slots: timeSlotCreationService.generateDaySlots(startTime, endTime, {
        interval: intervalMinutes,
        serviceDuration: null,
        excludeLunch: false
      })
    };

    // Generate recurring schedules
    const recurringSchedules = timeSlotCreationService.generateAdvancedRecurringSlots(baseSchedule, {
      repeatType,
      repeatCount,
      repeatDays,
      excludeWeekends,
      excludeHolidays,
      startDate,
      endDate
    });

    // Create time slots for each schedule
    const allSlots = [];
    let createdCount = 0;
    let skippedCount = 0;

    for (const schedule of [baseSchedule, ...recurringSchedules]) {
      try {
        // Create slots for this schedule
        const slots = schedule.slots.map(slot => ({
          businessId,
          serviceId,
          staffId: staffId || null,
          date: schedule.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: true,
          isBooked: false,
          capacity: capacity,
          maxCapacity: maxCapacity,
          isPeakHour,
          serviceDuration: intervalMinutes,
          intervalMinutes,
          price: null,
          customPrice: null,
          notes: notes || null
        }));

        // Check for existing slots and handle conflicts
        const existingSlots = await prisma.timeSlot.findMany({
          where: {
            businessId,
            serviceId,
            date: schedule.date,
            startTime: {
              in: slots.map(s => s.startTime)
            }
          }
        });

        // Filter out conflicting slots
        const newSlots = slots.filter(slot => 
          !existingSlots.some(existing => 
            existing.startTime === slot.startTime && 
            existing.endTime === slot.endTime
          )
        );

        if (newSlots.length > 0) {
          const createdSlots = await prisma.timeSlot.createMany({
            data: newSlots
          });
          createdCount += createdSlots.count;
          allSlots.push(...newSlots);
        }

        skippedCount += slots.length - newSlots.length;

      } catch (error) {
        console.error(`Error creating slots for date ${schedule.date}:`, error);
        skippedCount += schedule.slots.length;
      }
    }

    // Emit real-time updates
    const slotsByDate = {};
    allSlots.forEach(slot => {
      if (!slotsByDate[slot.date]) {
        slotsByDate[slot.date] = [];
      }
      slotsByDate[slot.date].push(slot);
    });

    for (const [date, slots] of Object.entries(slotsByDate)) {
      const realtimeService = require('../services/realtimeService');
      realtimeService.emitAvailabilityUpdated(businessId, serviceId, date, slots);
    }

    res.json({
      success: true,
      data: {
        created: allSlots,
        createdCount,
        skippedCount,
        totalSchedules: recurringSchedules.length + 1,
        summary: {
          totalSlots: createdCount + skippedCount,
          createdSlots: createdCount,
          skippedSlots: skippedCount,
          dateRange: {
            start: startDate,
            end: recurringSchedules.length > 0 ? recurringSchedules[recurringSchedules.length - 1].date : startDate
          }
        }
      }
    });

  } catch (error) {
    console.error('Error creating recurring time slots:', error);
    next(error);
  }
});

// @route   GET /api/time-slots/templates
// @desc    Get available templates and patterns
// @access  Private (Business owners and staff only)
router.get('/templates', authenticate, authorize('BUSINESS_OWNER', 'STAFF'), async (req, res, next) => {
  try {
    const { businessId } = req.query;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: 'Business ID is required'
      });
    }

    // Get business context for smart defaults
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        workingHours: { where: { isActive: true } },
        services: { where: { isActive: true } },
        staff: { 
          where: { isActive: true },
          include: { workingHours: { where: { isActive: true } } }
        }
      }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found'
      });
    }

    const templates = {
      weekly: {
        name: 'برنامه هفتگی',
        description: 'ایجاد اسلات‌های تکراری برای هفته',
        icon: 'calendar-week',
        category: 'recurring',
        defaults: {
          daysOfWeek: business.workingHours.map(wh => wh.dayOfWeek),
          startTime: business.workingHours[0]?.startTime || '09:00',
          endTime: business.workingHours[0]?.endTime || '17:00',
          interval: 30,
          excludeLunch: true,
          lunchStart: '12:00',
          lunchEnd: '13:00'
        },
        fields: [
          { name: 'daysOfWeek', type: 'multiselect', label: 'روزهای هفته', required: true },
          { name: 'startTime', type: 'time', label: 'ساعت شروع', required: true },
          { name: 'endTime', type: 'time', label: 'ساعت پایان', required: true },
          { name: 'interval', type: 'number', label: 'فاصله زمانی (دقیقه)', min: 5, max: 120 },
          { name: 'excludeLunch', type: 'boolean', label: 'حذف زمان ناهار' },
          { name: 'lunchStart', type: 'time', label: 'شروع ناهار' },
          { name: 'lunchEnd', type: 'time', label: 'پایان ناهار' }
        ]
      },
      
      daily: {
        name: 'روز خاص',
        description: 'ایجاد اسلات برای یک روز مشخص',
        icon: 'calendar-day',
        category: 'oneTime',
        defaults: {
          startTime: '09:00',
          endTime: '17:00',
          interval: 30
        },
        fields: [
          { name: 'date', type: 'date', label: 'تاریخ', required: true },
          { name: 'startTime', type: 'time', label: 'ساعت شروع', required: true },
          { name: 'endTime', type: 'time', label: 'ساعت پایان', required: true },
          { name: 'interval', type: 'number', label: 'فاصله زمانی (دقیقه)', min: 5, max: 120 }
        ]
      },

      bulk: {
        name: 'ایجاد انبوه',
        description: 'ایجاد اسلات برای چندین هفته/ماه',
        icon: 'calendar-range',
        category: 'bulk',
        defaults: {
          excludeWeekends: false,
          excludeHolidays: true
        },
        fields: [
          { name: 'startDate', type: 'date', label: 'تاریخ شروع', required: true },
          { name: 'endDate', type: 'date', label: 'تاریخ پایان', required: true },
          { name: 'weeklyTemplate', type: 'template', label: 'الگوی هفتگی', required: true },
          { name: 'excludeWeekends', type: 'boolean', label: 'حذف آخر هفته' },
          { name: 'excludeHolidays', type: 'boolean', label: 'حذف تعطیلات' }
        ]
      },

      custom: {
        name: 'سفارشی',
        description: 'ایجاد اسلات با تنظیمات پیشرفته',
        icon: 'settings',
        category: 'advanced',
        defaults: {
          recurring: false
        },
        fields: [
          { name: 'schedules', type: 'array', label: 'برنامه‌های زمانی', required: true },
          { name: 'recurring', type: 'boolean', label: 'تکراری' },
          { name: 'recurrenceRule', type: 'object', label: 'قانون تکرار' }
        ]
      },

      smart: {
        name: 'هوشمند',
        description: 'ایجاد اسلات بر اساس تجزیه و تحلیل داده‌ها',
        icon: 'brain',
        category: 'ai',
        defaults: {
          optimizeFor: 'availability',
          learningPeriod: 30
        },
        fields: [
          { name: 'optimizeFor', type: 'select', label: 'بهینه‌سازی برای', 
            options: [
              { value: 'availability', label: 'در دسترس بودن' },
              { value: 'bookings', label: 'تعداد رزرو' },
              { value: 'revenue', label: 'درآمد' }
            ]
          },
          { name: 'learningPeriod', type: 'number', label: 'دوره یادگیری (روز)', min: 7, max: 90 }
        ]
      }
    };

    // Add business-specific suggestions
    const suggestions = {
      recommendedTemplate: getRecommendedTemplate(business),
      quickActions: generateQuickActions(business),
      recentPatterns: await getRecentPatterns(businessId)
    };

    res.json({
      success: true,
      data: {
        templates,
        suggestions,
        businessContext: {
          workingDays: business.workingHours.map(wh => wh.dayOfWeek),
          typicalHours: {
            start: business.workingHours[0]?.startTime,
            end: business.workingHours[0]?.endTime
          },
          servicesCount: business.services.length,
          staffCount: business.staff.length,
          hasMultipleStaff: business.staff.length > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting templates:', error);
    next(error);
  }
});

// @route   GET /api/time-slots/conflicts
// @desc    Check for potential conflicts before creation
// @access  Private (Business owners and staff only)
router.get('/conflicts', authenticate, authorize('BUSINESS_OWNER', 'STAFF'), async (req, res, next) => {
  try {
    const { businessId, serviceId, staffId, startDate, endDate } = req.query;

    if (!businessId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Business ID, start date, and end date are required'
      });
    }

    // Get existing data for the date range
    const whereClause = {
      businessId,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    if (serviceId) whereClause.serviceId = serviceId;
    if (staffId) whereClause.staffId = staffId;

    const [existingSlots, existingBookings, holidays, staffTimeOff] = await Promise.all([
      prisma.timeSlot.findMany({
        where: whereClause,
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
      }),
      prisma.booking.findMany({
        where: {
          ...whereClause,
          status: { in: ['PENDING', 'CONFIRMED'] }
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
      }),
      prisma.holiday.findMany({
        where: {
          businessId,
          isActive: true,
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        }
      }),
      staffId ? prisma.staff_time_off.findMany({
        where: {
          staffId,
          OR: [
            {
              startDate: { lte: new Date(endDate) },
              endDate: { gte: new Date(startDate) }
            }
          ]
        }
      }) : Promise.resolve([])
    ]);

    // Analyze conflicts by date
    const conflictAnalysis = {};
    const dateRange = moment.range(moment(startDate), moment(endDate));

    for (const date of dateRange.by('day')) {
      const dateStr = date.format('YYYY-MM-DD');
      const dayConflicts = [];

      // Check holidays
      const holiday = holidays.find(h => 
        moment(h.date).format('YYYY-MM-DD') === dateStr
      );
      if (holiday) {
        dayConflicts.push({
          type: 'holiday',
          message: holiday.name || 'تعطیل رسمی',
          severity: 'high'
        });
      }

      // Check staff time off
      const timeOff = staffTimeOff.find(to => 
        date.isBetween(moment(to.startDate), moment(to.endDate), null, '[]')
      );
      if (timeOff) {
        dayConflicts.push({
          type: 'staff_timeoff',
          message: `کارمند در مرخصی: ${timeOff.reason || 'مرخصی'}`,
          severity: 'high'
        });
      }

      // Check existing slots and bookings
      const daySlots = existingSlots.filter(s => 
        moment(s.date).format('YYYY-MM-DD') === dateStr
      );
      const dayBookings = existingBookings.filter(b => 
        moment(b.date).format('YYYY-MM-DD') === dateStr
      );

      if (daySlots.length > 0) {
        dayConflicts.push({
          type: 'existing_slots',
          message: `${daySlots.length} اسلات موجود`,
          severity: 'medium',
          count: daySlots.length
        });
      }

      if (dayBookings.length > 0) {
        dayConflicts.push({
          type: 'existing_bookings',
          message: `${dayBookings.length} رزرو موجود`,
          severity: 'high',
          count: dayBookings.length
        });
      }

      if (dayConflicts.length > 0) {
        conflictAnalysis[dateStr] = dayConflicts;
      }
    }

    // Generate summary
    const summary = {
      totalDays: dateRange.diff('days') + 1,
      conflictDays: Object.keys(conflictAnalysis).length,
      totalExistingSlots: existingSlots.length,
      totalExistingBookings: existingBookings.length,
      totalHolidays: holidays.length,
      totalStaffTimeOff: staffTimeOff.length
    };

    res.json({
      success: true,
      data: {
        conflicts: conflictAnalysis,
        summary,
        recommendations: generateConflictRecommendations(summary, conflictAnalysis)
      }
    });

  } catch (error) {
    console.error('Error checking conflicts:', error);
    next(error);
  }
});

// @route   DELETE /api/time-slots/bulk
// @desc    Bulk delete time slots with filters
// @access  Private (Business owners only)
router.delete('/bulk', authenticate, authorize('BUSINESS_OWNER'), async (req, res, next) => {
  try {
    const { businessId, serviceId, staffId, startDate, endDate, onlyEmpty } = req.query;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: 'Business ID is required'
      });
    }

    const whereClause = { businessId };
    
    if (serviceId) whereClause.serviceId = serviceId;
    if (staffId) whereClause.staffId = staffId;
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }
    
    // If onlyEmpty is true, only delete slots that are not booked
    if (onlyEmpty === 'true') {
      whereClause.isBooked = false;
    }

    // Check for existing bookings before deletion
    const slotsToDelete = await prisma.timeSlot.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    });

    const slotsWithBookings = slotsToDelete.filter(slot => slot._count.bookings > 0);
    
    if (slotsWithBookings.length > 0 && onlyEmpty !== 'true') {
      return res.status(400).json({
        success: false,
        error: `Cannot delete ${slotsWithBookings.length} slots with existing bookings`,
        conflictingSlots: slotsWithBookings.length
      });
    }

    // Perform deletion
    const result = await prisma.timeSlot.deleteMany({
      where: whereClause
    });

    res.json({
      success: true,
      data: {
        deletedCount: result.count,
        totalSlots: slotsToDelete.length,
        slotsWithBookings: slotsWithBookings.length
      }
    });

  } catch (error) {
    console.error('Error bulk deleting time slots:', error);
    next(error);
  }
});

// Helper functions
function getRecommendedTemplate(business) {
  if (business.staff.length > 1) {
    return 'bulk'; // Multi-staff businesses benefit from bulk creation
  } else if (business.services.length > 5) {
    return 'smart'; // Service-heavy businesses benefit from AI optimization
  } else {
    return 'weekly'; // Simple businesses start with weekly patterns
  }
}

function generateQuickActions(business) {
  const actions = [];

  // Quick action: Next week
  actions.push({
    id: 'next_week',
    label: 'هفته آینده',
    description: 'ایجاد اسلات برای هفته آینده',
    template: 'weekly',
    pattern: {
      daysOfWeek: business.workingHours.map(wh => wh.dayOfWeek),
      startTime: business.workingHours[0]?.startTime || '09:00',
      endTime: business.workingHours[0]?.endTime || '17:00'
    },
    dateRange: {
      startDate: moment().add(1, 'week').startOf('week').format('YYYY-MM-DD'),
      endDate: moment().add(1, 'week').endOf('week').format('YYYY-MM-DD')
    }
  });

  // Quick action: Next month
  actions.push({
    id: 'next_month',
    label: 'ماه آینده',
    description: 'ایجاد اسلات برای ماه آینده',
    template: 'bulk',
    dateRange: {
      startDate: moment().add(1, 'month').startOf('month').format('YYYY-MM-DD'),
      endDate: moment().add(1, 'month').endOf('month').format('YYYY-MM-DD')
    }
  });

  return actions;
}

async function getRecentPatterns(businessId) {
  // Get recent time slot creation patterns from metadata
  const recentSlots = await prisma.timeSlot.findMany({
    where: {
      businessId,
      createdAt: { gte: moment().subtract(30, 'days').toDate() }
    },
    select: { metadata: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  const patterns = recentSlots
    .map(slot => {
      try {
        return JSON.parse(slot.metadata || '{}');
      } catch {
        return {};
      }
    })
    .filter(metadata => metadata.createdBy === 'timeSlotCreationService')
    .slice(0, 3);

  return patterns;
}

function generateConflictRecommendations(summary, conflicts) {
  const recommendations = [];

  if (summary.totalHolidays > 0) {
    recommendations.push({
      type: 'info',
      message: `${summary.totalHolidays} روز تعطیل در این بازه زمانی وجود دارد`,
      action: 'exclude_holidays'
    });
  }

  if (summary.totalExistingBookings > 0) {
    recommendations.push({
      type: 'warning',
      message: `${summary.totalExistingBookings} رزرو موجود ممکن است با اسلات‌های جدید تداخل داشته باشد`,
      action: 'use_skip_resolution'
    });
  }

  if (summary.totalExistingSlots > 0) {
    recommendations.push({
      type: 'info',
      message: `${summary.totalExistingSlots} اسلات موجود دارید. حالت تداخل را انتخاب کنید`,
      action: 'choose_conflict_resolution'
    });
  }

  return recommendations;
}

module.exports = router; 
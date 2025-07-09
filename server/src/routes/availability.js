const express = require("express");
const { PrismaClient } = require("@prisma/client");
const moment = require("moment");
const { authenticate, authorize } = require("../middleware/auth");
const realtimeService = require("../services/realtimeService");

const router = express.Router();
const prisma = new PrismaClient();

// Utility function to validate and normalize time format
function validateAndNormalizeTime(time) {
  if (!time) return null;

  // Handle "auto" case
  if (time === "auto") {
    return null; // This will be handled by the calling function
  }

  // Convert to string if it's not already
  const timeStr = String(time).trim();

  // Handle various time formats
  let normalizedTime = timeStr;

  // If it's already in HH:MM format, validate it
  if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
    return timeStr;
  }

  // Try to parse other formats
  try {
    // Handle HHMM format (e.g., "0900" -> "09:00")
    if (/^([0-1]?[0-9]|2[0-3])[0-5][0-9]$/.test(timeStr)) {
      return `${timeStr.slice(0, -2)}:${timeStr.slice(-2)}`;
    }

    // Handle HH.MM format (e.g., "09.30" -> "09:30")
    if (/^([0-1]?[0-9]|2[0-3])\.[0-5][0-9]$/.test(timeStr)) {
      return timeStr.replace(".", ":");
    }

    // Try to parse with moment
    const parsed = moment(timeStr, [
      "HH:mm",
      "HH.mm",
      "HHmm",
      "h:mm A",
      "h.mm A",
    ]);
    if (parsed.isValid()) {
      return parsed.format("HH:mm");
    }
  } catch (error) {
    console.error("Error parsing time:", timeStr, error);
  }

  return null;
}

// @desc    Get staff-aware availability using Bookly's hierarchy
// @route   GET /api/availability/staff/:businessId/:serviceId/:date
// @access  Public
router.get("/staff/:businessId/:serviceId/:date", async (req, res, next) => {
  try {
    const { businessId, serviceId, date } = req.params;
    const { staffId, includeUnavailable } = req.query;

    console.log('Availability request:', { businessId, serviceId, date, staffId, includeUnavailable });

    if (!businessId || !serviceId || !date) {
      return res.status(400).json({
        success: false,
        error: "Business ID, Service ID, and date are required",
      });
    }

    // Use the new slot service with Bookly's hierarchy
    const slotService = require('../services/slotService');
    const availability = await slotService.getDetailedAvailability(businessId, serviceId, date, {
      staffId: staffId || null,
      includeUnavailable: includeUnavailable === 'true'
    });

    console.log('Availability result:', {
      available: availability.available,
      totalSlots: availability.slots?.length || 0,
      availableSlots: availability.totalAvailable || 0,
      bookedSlots: availability.totalBooked || 0
    });

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Error getting staff-aware availability:', error);
    next(error);
  }
});

// @desc    Get available staff for a service
// @route   GET /api/availability/staff-options/:serviceId
// @access  Public
router.get("/staff-options/:serviceId", async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const { date } = req.query;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        error: "Service ID is required",
      });
    }

    // Get staff members assigned to this service
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
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' }
        },
        staff_time_off: date ? {
          where: {
            startDate: { lte: new Date(date) },
            endDate: { gte: new Date(date) }
          }
        } : undefined
      },
      orderBy: { firstName: 'asc' }
    });

    // Filter out staff who are on time off for the requested date
    const availableStaff = staff.filter(member => {
      if (!date) return true;
      return !member.staff_time_off || member.staff_time_off.length === 0;
    });

    res.json({
      success: true,
      data: availableStaff.map(member => ({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        fullName: `${member.firstName} ${member.lastName}`,
        specialization: member.specialization,
        bio: member.bio,
        experience: member.experience,
        customPrice: member.staff_services[0]?.customPrice,
        workingHours: member.staff_working_hours,
        isAvailable: true
      }))
    });
  } catch (error) {
    console.error('Error getting staff options:', error);
    next(error);
  }
});

// @desc    Get availability for a business
// @route   GET /api/availability/:businessId
// @access  Public
router.get("/:businessId", async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { date, serviceId, days = 7 } = req.query;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: "Business ID is required",
      });
    }

    // Get business with services and working hours
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { name: "asc" },
        },
        workingHours: {
          where: { isActive: true },
          orderBy: { dayOfWeek: "asc" },
        },
        holidays: {
          where: {
            date: {
              gte: new Date(),
              lte: moment().add(parseInt(days), "days").toDate(),
            },
            isActive: true,
          },
        },
      },
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        error: "Business not found",
      });
    }

    // If specific date and service are provided, get detailed availability
    if (date && serviceId) {
      const availability = await getDetailedAvailability(
        businessId,
        serviceId,
        date
      );

      return res.json({
        success: true,
        data: {
          availableSlots: availability.availableSlots || [],
          bookedSlots: availability.allSlots?.filter(slot => slot.isBooked) || [],
          totalSlots: availability.allSlots?.length || 0,
          available: availability.available,
          reason: availability.reason,
          source: availability.source,
        },
      });
    }

    // Get availability for next N days
    const availability = await getWeeklyAvailability(
      businessId,
      parseInt(days)
    );

    res.json({
      success: true,
      data: {
        business: {
          id: business.id,
          name: business.name,
          services: business.services,
        },
        availability,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Enhanced generate time slots for a business with conflict resolution
// @route   POST /api/availability/generate/:businessId
// @access  Business owner, Staff, Admin
router.post(
  "/generate/:businessId",
  authenticate,
  authorize("BUSINESS_OWNER", "STAFF"),
  async (req, res, next) => {
    try {
      const { businessId } = req.params;
      const {
        days = 7,
        startTime = "09:00",
        endTime = "18:00",
        serviceId,
        mode = "basic",
        settings = {},
        conflictResolution = "preserve", // New: preserve, reschedule, force
      } = req.body;

      console.log('Enhanced generate time slots called with:', {
        businessId,
        mode,
        settings,
        conflictResolution,
        days
      });

      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: "Business ID is required",
        });
      }

      if (!serviceId) {
        return res.status(400).json({
          success: false,
          error: "Service ID is required",
        });
      }

      // Check if this is a new template type that should use the advanced service
      const advancedTemplates = ['weekly', 'bulk', 'custom', 'smart'];
      if (advancedTemplates.includes(mode)) {
        console.log('Using advanced time slot creation service for mode:', mode);
        
        // Use the new timeSlotCreationService
        const timeSlotCreationService = require('../services/timeSlotCreationService');
        
        // Map the request to the service format
        let pattern;
        
        if (mode === 'custom' && settings.pattern) {
          // For custom mode, use the exact pattern provided
          pattern = settings.pattern;
        } else {
          // For other modes, create pattern from settings
          pattern = {
            ...settings,
            startTime: startTime === "auto" ? "auto" : startTime,
            endTime: endTime === "auto" ? "auto" : endTime,
            daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday by default
            interval: 30,
            excludeLunch: true,
            lunchStart: settings.businessSettings?.lunchBreakStart || "12:00",
            lunchEnd: settings.businessSettings?.lunchBreakEnd || "13:00",
          };
        }
        
        const serviceOptions = {
          businessId,
          serviceId,
          template: mode,
          pattern,
          dateRange: {
            weeks: Math.ceil(days / 7),
            startDate: moment().format('YYYY-MM-DD'),
            endDate: moment().add(days, 'days').format('YYYY-MM-DD')
          },
          conflictResolution: conflictResolution === 'preserve' ? 'skip' : conflictResolution,
          preview: false,
          applyHolidays: true,
          applyBreaks: true,
          metadata: {
            source: 'dashboard',
            mode: mode,
            originalRequest: req.body
          }
        };

        console.log('🔧 Backend Debug - Service options:', {
          businessId: serviceOptions.businessId,
          serviceId: serviceOptions.serviceId, 
          template: serviceOptions.template,
          pattern: JSON.stringify(serviceOptions.pattern, null, 2),
          conflictResolution: serviceOptions.conflictResolution
        });
        
        const result = await timeSlotCreationService.createTimeSlots(serviceOptions);
        
        if (result.success) {
          // Transform the result to match the expected format
          const transformedResult = {
            success: true,
            summary: {
              totalDays: days,
              totalCreated: result.data.slotsCreated || result.data.created.length,
              totalSkipped: result.data.skipped.length,
              totalConflicts: result.data.conflicts.length,
              businessName: "Business", // TODO: Get from context
              serviceName: "Service", // TODO: Get from context
              isSmartGeneration: mode === 'smart',
              conflictResolution: conflictResolution,
              mode: mode
            },
            generatedSlots: result.data.created.map(slot => ({
              date: moment(slot.date).format('YYYY-MM-DD'),
              dayOfWeek: moment(slot.date).day(),
              dayName: moment(slot.date).format('dddd'),
              status: 'open',
              slots: [{
                id: slot.id,
                startTime: slot.startTime,
                endTime: slot.endTime,
                isBooked: slot.isBooked || false,
                isAvailable: !slot.isBooked,
                duration: slot.duration
              }],
              conflicts: []
            })),
            conflicts: result.data.conflicts.length > 0 ? {
              total: result.data.conflicts.length,
              details: result.data.conflicts
            } : undefined
          };

          console.log('Transformed result:', transformedResult);
          return res.json(transformedResult);
        } else {
          return res.status(500).json({
            success: false,
            error: result.error || 'Failed to create time slots'
          });
        }
      }

      // Extract smart settings and business settings from the request
      const smartSettings = settings.smartSettings || {};
      const businessSettings = settings.businessSettings || {};

      // Check if business exists and get working hours
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: {
          workingHours: {
            where: { isActive: true },
            orderBy: { dayOfWeek: "asc" },
          },
          holidays: {
            where: {
              date: {
                gte: new Date(),
                lte: moment().add(parseInt(days), "days").toDate(),
              },
              isActive: true,
            },
          },
        },
      });

      if (!business) {
        return res.status(404).json({
          success: false,
          error: "Business not found",
        });
      }

      // Check if service exists and belongs to this business
      const service = await prisma.service.findFirst({
        where: {
          id: serviceId,
          businessId: businessId,
          isActive: true,
        },
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          error: "Service not found or does not belong to this business",
        });
      }

      // Get existing bookings for conflict detection
      let startDate, endDate;
      
      // Check if startDate and endDate are provided in the request
      if (req.body.startDate && req.body.endDate) {
        startDate = moment(req.body.startDate);
        endDate = moment(req.body.endDate);
        console.log('Using provided date range:', startDate.format('YYYY-MM-DD'), 'to', endDate.format('YYYY-MM-DD'));
      } else {
        startDate = moment();
        endDate = moment().add(parseInt(days), "days");
        console.log('Using calculated date range:', startDate.format('YYYY-MM-DD'), 'to', endDate.format('YYYY-MM-DD'));
      }

      const existingBookings = await prisma.booking.findMany({
        where: {
          businessId,
          serviceId,
          date: {
            gte: startDate.toDate(),
            lte: endDate.toDate(),
          },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        select: {
          id: true,
          customerName: true,
          customerPhone: true,
          customerEmail: true,
          date: true,
          startTime: true,
          endTime: true,
          status: true,
          notes: true,
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      });

      const generatedSlots = [];
      const conflicts = [];
      const rescheduleOptions = [];
      let totalCreated = 0;
      let totalSkipped = 0;
      let totalConflicts = 0;

      // Determine if this is a smart generation
      const isSmartGeneration =
        mode === "smart" ||
        (smartSettings && Object.keys(smartSettings).length > 0);

      // Calculate the number of days to iterate
      const daysToIterate = endDate.diff(startDate, 'days') + 1;
      
      for (let i = 0; i < daysToIterate; i++) {
        const date = startDate.clone().add(i, "days");
        const dayOfWeek = date.day();

        // Check if it's a holiday
        const isHoliday = business.holidays.some(
          (holiday) =>
            moment(holiday.date).format("YYYY-MM-DD") ===
            date.format("YYYY-MM-DD")
        );

        if (isHoliday) {
          generatedSlots.push({
            date: date.format("YYYY-MM-DD"),
            dayOfWeek,
            dayName: date.format("dddd"),
            status: "holiday",
            slots: [],
          });
          continue;
        }

        // Get working hours for this day
        const workingHour = business.workingHours.find(
          (wh) => wh.dayOfWeek === dayOfWeek
        );

        if (!workingHour) {
          generatedSlots.push({
            date: date.format("YYYY-MM-DD"),
            dayOfWeek,
            dayName: date.format("dddd"),
            status: "closed",
            slots: [],
          });
          continue;
        }

        // Validate working hour times
        if (!workingHour.startTime || !workingHour.endTime) {
          generatedSlots.push({
            date: date.format("YYYY-MM-DD"),
            dayOfWeek,
            dayName: date.format("dddd"),
            status: "error",
            error: "Invalid working hours configuration",
            slots: [],
          });
          continue;
        }

        // Normalize working hour times
        const normalizedStartTime = validateAndNormalizeTime(
          workingHour.startTime
        );
        const normalizedEndTime = validateAndNormalizeTime(workingHour.endTime);

        if (!normalizedStartTime || !normalizedEndTime) {
          generatedSlots.push({
            date: date.format("YYYY-MM-DD"),
            dayOfWeek,
            dayName: date.format("dddd"),
            status: "error",
            error: "Invalid time format in working hours",
            slots: [],
          });
          continue;
        }

        // Use working hours if no specific times provided, otherwise use provided times
        const slotStartTime =
          startTime === "09:00" && endTime === "18:00"
            ? normalizedStartTime
            : startTime;
        const slotEndTime =
          startTime === "09:00" && endTime === "18:00"
            ? normalizedEndTime
            : endTime;

        // Handle "auto" time values for smart generation
        let finalStartTime, finalEndTime;
        if (startTime === "auto" || endTime === "auto") {
          // Use working hours for auto mode
          finalStartTime = normalizedStartTime;
          finalEndTime = normalizedEndTime;
        } else {
          // Use provided times or fallback to working hours
          finalStartTime = slotStartTime;
          finalEndTime = slotEndTime;
        }

        // Generate slots for this day
        let slots;
        try {
          if (isSmartGeneration) {
            slots = generateSmartTimeSlots(
              finalStartTime,
              finalEndTime,
              service.duration,
              smartSettings,
              businessSettings
            );
          } else {
            // For basic generation, use service duration as slot duration with 30-minute intervals
            // This creates buffer between slots equal to (interval - service duration)
            slots = generateTimeSlots(
              finalStartTime,
              finalEndTime,
              30,
              service.duration
            );
          }
        } catch (error) {
          generatedSlots.push({
            date: date.format("YYYY-MM-DD"),
            dayOfWeek,
            dayName: date.format("dddd"),
            status: "error",
            error: error.message,
            slots: [],
          });
          continue;
        }

        // Get existing bookings for this date
        const dayBookings = existingBookings.filter(
          (booking) =>
            moment(booking.date).format("YYYY-MM-DD") ===
            date.format("YYYY-MM-DD")
        );

        // Create time slots in database with conflict resolution
        const createdSlots = [];
        const dayConflicts = [];

        for (const slot of slots) {
          try {
            // Check if slot already exists
            const existingSlot = await prisma.timeSlot.findFirst({
              where: {
                serviceId,
                date: date.toDate(),
                startTime: slot.startTime,
              },
            });

            // Check for booking conflicts
            const conflictingBookings = dayBookings.filter((booking) => {
              const bookingStart = moment(
                `${date.format("YYYY-MM-DD")} ${booking.startTime}`
              );
              const bookingEnd = moment(
                `${date.format("YYYY-MM-DD")} ${booking.endTime}`
              );
              const slotStart = moment(
                `${date.format("YYYY-MM-DD")} ${slot.startTime}`
              );
              const slotEnd = moment(
                `${date.format("YYYY-MM-DD")} ${slot.endTime}`
              );

              return (
                (slotStart.isBefore(bookingEnd) &&
                  slotEnd.isAfter(bookingStart)) ||
                slotStart.isBetween(bookingStart, bookingEnd, null, "[)") ||
                slotEnd.isBetween(bookingStart, bookingEnd, null, "(]")
              );
            });

            if (conflictingBookings.length > 0) {
              totalConflicts++;

              // Handle conflict based on resolution strategy
              switch (conflictResolution) {
                case "preserve":
                  // Skip creating this slot, preserve existing bookings
                  dayConflicts.push({
                    slotTime: `${slot.startTime} - ${slot.endTime}`,
                    conflictingBookings: conflictingBookings.map((booking) => ({
                      id: booking.id,
                      customerName: booking.customerName,
                      customerPhone: booking.customerPhone,
                      time: `${booking.startTime} - ${booking.endTime}`,
                      status: booking.status,
                    })),
                    resolution: "preserved",
                  });
                  totalSkipped++;
                  continue;

                case "reschedule":
                  // Find alternative slots for conflicting bookings
                  const alternatives = await findAlternativeSlots(
                    businessId,
                    serviceId,
                    conflictingBookings,
                    slots,
                    date,
                    service.duration
                  );

                  dayConflicts.push({
                    slotTime: `${slot.startTime} - ${slot.endTime}`,
                    conflictingBookings: conflictingBookings.map((booking) => ({
                      id: booking.id,
                      customerName: booking.customerName,
                      customerPhone: booking.customerPhone,
                      time: `${booking.startTime} - ${booking.endTime}`,
                      status: booking.status,
                    })),
                    alternatives,
                    resolution: "reschedule_suggested",
                  });

                  // Create the slot but mark conflicting bookings for rescheduling
                  rescheduleOptions.push(...alternatives);
                  break;

                case "force":
                  // Create slot anyway and mark conflicting bookings as cancelled
                  for (const booking of conflictingBookings) {
                    await prisma.booking.update({
                      where: { id: booking.id },
                      data: {
                        status: "CANCELLED",
                        notes: `${
                          booking.notes || ""
                        }\n[AUTO] Cancelled due to schedule regeneration`.trim(),
                      },
                    });
                  }

                  dayConflicts.push({
                    slotTime: `${slot.startTime} - ${slot.endTime}`,
                    conflictingBookings: conflictingBookings.map((booking) => ({
                      id: booking.id,
                      customerName: booking.customerName,
                      customerPhone: booking.customerPhone,
                      time: `${booking.startTime} - ${booking.endTime}`,
                      status: "CANCELLED",
                    })),
                    resolution: "force_cancelled",
                  });
                  break;
              }
            }

            if (existingSlot) {
              // If slot exists but is booked/unavailable, make it available
              if (existingSlot.isBooked) {
                const updatedSlot = await prisma.timeSlot.update({
                  where: { id: existingSlot.id },
                  data: { isBooked: false },
                });
                createdSlots.push(updatedSlot);
                totalCreated++;
              } else {
                // Slot exists and is already available, skip
                totalSkipped++;
              }
              continue;
            }

            // Create new slot if it doesn't exist and no unresolved conflicts
            if (
              conflictResolution !== "preserve" ||
              conflictingBookings.length === 0
            ) {
              const createdSlot = await prisma.timeSlot.create({
                data: {
                  serviceId,
                  date: date.toDate(),
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  isBooked: false,
                  capacity: 0,
                  maxCapacity: 1,
                  isPeakHour: slot.isPeakHour || false,
                  notes: slot.notes || null,
                },
              });
              createdSlots.push(createdSlot);
              totalCreated++;
            }
          } catch (error) {
            totalSkipped++;
          }
        }

        generatedSlots.push({
          date: date.format("YYYY-MM-DD"),
          dayOfWeek,
          dayName: date.format("dddd"),
          status: "open",
          workingHours: {
            startTime: finalStartTime,
            endTime: finalEndTime,
          },
          slots: createdSlots,
          conflicts: dayConflicts,
        });

        conflicts.push(...dayConflicts);
      }

      // **REAL-TIME: Emit availability updated event for each day that had slots created**
      for (const daySlot of generatedSlots) {
        if (daySlot.slots && daySlot.slots.length > 0) {
          realtimeService.emitAvailabilityUpdated(
            businessId,
            serviceId,
            daySlot.date,
            daySlot.slots
          );
        }
      }

      res.json({
        success: true,
        summary: {
          totalDays: daysToIterate,
          totalCreated,
          totalSkipped,
          totalConflicts,
          businessName: business.name,
          serviceName: service.name,
          isSmartGeneration,
          conflictResolution,
        },
        generatedSlots,
        conflicts:
          conflicts.length > 0
            ? {
                total: conflicts.length,
                details: conflicts,
                rescheduleOptions:
                  rescheduleOptions.length > 0 ? rescheduleOptions : undefined,
              }
            : undefined,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Update time slot availability
// @route   PUT /api/availability/slots/:slotId
// @access  Business owner, Staff, Admin
router.put(
  "/slots/:slotId",
  authenticate,
  authorize("BUSINESS_OWNER", "STAFF"),
  async (req, res, next) => {
    try {
      const { slotId } = req.params;
      const { isAvailable } = req.body;

      // Check if slot exists
      const slot = await prisma.timeSlot.findUnique({
        where: { id: slotId },
        include: {
          services: {
            include: {
              business: {
                select: { id: true },
              },
            },
          },
        },
      });

      if (!slot) {
        return res.status(404).json({
          success: false,
          error: "Time slot not found",
        });
      }

      // Update slot with all provided data
      const updateData = {};
      
      if (typeof isAvailable !== 'undefined') {
        updateData.isBooked = !isAvailable;
      }
      
      // Handle capacity updates
      if (req.body.capacity !== undefined) {
        updateData.capacity = parseInt(req.body.capacity);
      }
      
      if (req.body.maxCapacity !== undefined) {
        updateData.maxCapacity = parseInt(req.body.maxCapacity);
      }
      
      // Handle other fields
      if (req.body.isPeakHour !== undefined) {
        updateData.isPeakHour = req.body.isPeakHour;
      }
      
      if (req.body.notes !== undefined) {
        updateData.notes = req.body.notes;
      }

      const updatedSlot = await prisma.timeSlot.update({
        where: { id: slotId },
        data: updateData,
      });

      // **REAL-TIME: Emit availability updated event**
      const queryDate = new Date(slot.date);
      const startOfDay = new Date(
        queryDate.getFullYear(),
        queryDate.getMonth(),
        queryDate.getDate()
      );
      const endOfDay = new Date(
        queryDate.getFullYear(),
        queryDate.getMonth(),
        queryDate.getDate(),
        23,
        59,
        59,
        999
      );

      // Get all time slots for this date to send complete availability update
      const allDaySlots = await prisma.timeSlot.findMany({
        where: {
          serviceId: slot.serviceId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: { startTime: "asc" },
      });

      realtimeService.emitAvailabilityUpdated(
        slot.services.business.id,
        slot.serviceId,
        slot.date.toISOString().split("T")[0],
        allDaySlots
      );

      res.json({
        success: true,
        data: updatedSlot,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Create time slot
// @route   POST /api/availability/slots
// @access  Business owner, Staff, Admin
router.post(
  "/slots",
  authenticate,
  authorize("BUSINESS_OWNER", "STAFF"),
  async (req, res, next) => {
    try {
      const {
        businessId,
        serviceId,
        date,
        startTime,
        endTime,
        isAvailable = true,
      } = req.body;

      if (!businessId || !serviceId || !date || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      // Check if business and service exist
      const business = await prisma.business.findUnique({
        where: { id: businessId },
      });

      if (!business) {
        return res.status(404).json({
          success: false,
          error: "Business not found",
        });
      }

      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          error: "Service not found",
        });
      }

      // Create the time slot
      const timeSlot = await prisma.timeSlot.create({
        data: {
          serviceId,
          date: new Date(date),
          startTime,
          endTime,
          isBooked: !isAvailable,
          capacity: req.body.capacity !== undefined ? parseInt(req.body.capacity) : 0,
          maxCapacity: req.body.maxCapacity !== undefined ? parseInt(req.body.maxCapacity) : 1,
          isPeakHour: req.body.isPeakHour || false,
          notes: req.body.notes || null,
        },
      });

      res.json({
        success: true,
        data: timeSlot,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Bulk delete specific time slots by IDs
// @route   DELETE /api/availability/slots/bulk-delete
// @access  Business owner, Staff, Admin
router.delete(
  "/slots/bulk-delete",
  authenticate,
  authorize("BUSINESS_OWNER", "STAFF"),
  async (req, res, next) => {
    try {
      console.log('Bulk delete request received for user:', req.user ? { id: req.user.id, businessId: req.user.businessId } : 'No user');
      
      const { slotIds } = req.body;

      if (!slotIds || !Array.isArray(slotIds) || slotIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Slot IDs array is required",
          received: { slotIds, type: typeof slotIds }
        });
      }

      // Validate and clean slot IDs
      const validSlotIds = slotIds.filter(id => {
        if (typeof id !== 'string' || !id.trim()) {
          console.log('Invalid slot ID found:', id, typeof id);
          return false;
        }
        return true;
      });

      if (validSlotIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No valid slot IDs provided",
          received: slotIds
        });
      }

      if (validSlotIds.length !== slotIds.length) {
        console.log('Some slot IDs were invalid:', {
          original: slotIds,
          valid: validSlotIds,
          invalid: slotIds.filter(id => !validSlotIds.includes(id))
        });
      }

      console.log('Valid slot IDs for deletion:', validSlotIds);

      // Check if all slots exist and belong to the user's business
      let slots;
      try {
        slots = await prisma.timeSlot.findMany({
          where: {
            id: { in: validSlotIds },
          },
          include: {
            services: {
              include: {
                business: true,
              },
            },
          },
        });
      } catch (prismaError) {
        console.error("Prisma query error:", prismaError);
        console.error("Query parameters:", { validSlotIds, length: validSlotIds.length });
        return res.status(500).json({
          success: false,
          error: "Database query failed",
          details: process.env.NODE_ENV === 'development' ? prismaError.message : undefined
        });
      }

      if (slots.length !== validSlotIds.length) {
        const missingIds = validSlotIds.filter(id => !slots.find(s => s.id === id));
        console.log('Bulk delete - Missing slot IDs:', missingIds);
        
        return res.status(404).json({
          success: false,
          error: "Some slots not found",
          requestedCount: validSlotIds.length,
          foundCount: slots.length,
          missingIds: missingIds
        });
      }

      // Check if all slots have valid services
      const slotsWithoutServices = slots.filter(slot => !slot.services);
      if (slotsWithoutServices.length > 0) {
        return res.status(404).json({
          success: false,
          error: "Some slots have invalid services",
          invalidSlots: slotsWithoutServices.map(s => ({ id: s.id, serviceId: s.serviceId }))
        });
      }

      // Check if all slots belong to the user's business
      const userBusinessId = req.user.businessId;
      
      // Debug logging
      console.log('User business ID:', userBusinessId);
      console.log('Slots found:', slots.length);
      
      if (!userBusinessId) {
        return res.status(403).json({
          success: false,
          error: "User business ID not found",
        });
      }
      
      const unauthorizedSlots = slots.filter(
        (slot) => !slot.services || slot.services.business.id !== userBusinessId
      );

      if (unauthorizedSlots.length > 0) {
        return res.status(403).json({
          success: false,
          error: "You can only delete slots from your own business",
          unauthorizedSlots: unauthorizedSlots.map(s => ({ id: s.id, serviceId: s.serviceId }))
        });
      }

      // Check if any slots are booked
      const bookedSlots = slots.filter((slot) => slot.isBooked);
      if (bookedSlots.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Cannot delete booked slots",
          bookedSlots: bookedSlots.map((slot) => ({
            id: slot.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            date: slot.date,
          })),
        });
      }

      // Delete the slots
      const deletedSlots = await prisma.timeSlot.deleteMany({
        where: {
          id: { in: validSlotIds },
        },
      });

      // Emit real-time updates for affected dates
      const slotsByDate = {};
      slots.forEach((slot) => {
        if (!slotsByDate[slot.date]) {
          slotsByDate[slot.date] = [];
        }
        slotsByDate[slot.date].push(slot);
      });

      for (const [date, dateSlots] of Object.entries(slotsByDate)) {
        const realtimeService = require("../services/realtimeService");
        realtimeService.emitAvailabilityUpdated(
          userBusinessId,
          dateSlots[0].serviceId,
          date,
          []
        );
      }

      res.json({
        success: true,
        message: `${deletedSlots.count} time slots deleted successfully`,
        deletedCount: deletedSlots.count,
        deletedSlots: slots.map((slot) => ({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          date: slot.date,
        })),
      });
    } catch (error) {
      console.error("Error in bulk delete:", error);
      
      // Handle Prisma-specific errors
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          error: "Duplicate slot IDs provided"
        });
      }
      
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: "One or more slots not found"
        });
      }
      
      // Log the full error for debugging
      console.error("Full error details:", {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack
      });
      
      next(error);
    }
  }
);

// @desc    Delete time slot
// @route   DELETE /api/availability/slots/:slotId
// @access  Business owner, Staff, Admin
router.delete(
  "/slots/:slotId",
  authenticate,
  authorize("BUSINESS_OWNER", "STAFF"),
  async (req, res, next) => {
    try {
      const { slotId } = req.params;

      // Check if slot exists
      const slot = await prisma.timeSlot.findUnique({
        where: { id: slotId },
      });

      if (!slot) {
        return res.status(404).json({
          success: false,
          error: "Time slot not found",
        });
      }

      // Delete the time slot
      await prisma.timeSlot.delete({
        where: { id: slotId },
      });

      res.json({
        success: true,
        message: "Time slot deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Bulk delete time slots for a service
// @route   DELETE /api/availability/slots/:serviceId/bulk
// @access  Business owner, Staff, Admin
router.delete(
  "/slots/:serviceId/bulk",
  authenticate,
  authorize("BUSINESS_OWNER", "STAFF"),
  async (req, res, next) => {
    try {
      const { serviceId } = req.params;
      const { days = 7 } = req.body;

      if (!serviceId) {
        return res.status(400).json({
          success: false,
          error: "Service ID is required",
        });
      }

      // Check if service exists
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          error: "Service not found",
        });
      }

      // Calculate date range
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(days));

      // Delete time slots within the date range
      const deletedSlots = await prisma.timeSlot.deleteMany({
        where: {
          serviceId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      res.json({
        success: true,
        message: `${deletedSlots.count} time slots deleted successfully`,
        deletedCount: deletedSlots.count,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Bulk create time slots
// @route   POST /api/availability/bulk-create
// @access  Business owner, Staff, Admin
router.post(
  "/bulk-create",
  authenticate,
  authorize("BUSINESS_OWNER", "STAFF"),
  async (req, res, next) => {
    try {
      const {
        businessId,
        serviceId,
        startTime,
        endTime,
        interval = 30,
        days,
        weeks,
        mode = "basic",
        settings = {},
      } = req.body;

      if (
        !businessId ||
        !serviceId ||
        !startTime ||
        !endTime ||
        !days ||
        !weeks
      ) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      // Extract smart settings and business settings from the request
      const smartSettings = settings.smartSettings || {};
      const businessSettings = settings.businessSettings || {};

      // Check if business exists and get working hours
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: {
          workingHours: {
            where: { isActive: true },
            orderBy: { dayOfWeek: "asc" },
          },
          holidays: {
            where: {
              date: {
                gte: new Date(),
                lte: moment().add(parseInt(days), "days").toDate(),
              },
              isActive: true,
            },
          },
        },
      });

      if (!business) {
        return res.status(404).json({
          success: false,
          error: "Business not found",
        });
      }

      // Check if service exists and belongs to this business
      const service = await prisma.service.findFirst({
        where: {
          id: serviceId,
          businessId: businessId,
          isActive: true,
        },
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          error: "Service not found or does not belong to this business",
        });
      }

      const createdSlots = [];
      const startDate = moment();
      let totalCreated = 0;
      let totalSkipped = 0;

      // Determine if this is a smart generation
      const isSmartGeneration =
        mode === "smart" ||
        (smartSettings && Object.keys(smartSettings).length > 0);

      for (let week = 0; week < weeks; week++) {
        for (const dayOfWeek of days) {
          // Calculate the next occurrence of this day of week
          const date = startDate.clone().add(week, "weeks").day(dayOfWeek);

          // If the calculated date is before the start date, add a week
          if (date.isBefore(startDate)) {
            date.add(1, "week");
          }

          // Check if it's a holiday
          const isHoliday = business.holidays.some(
            (holiday) =>
              moment(holiday.date).format("YYYY-MM-DD") ===
              date.format("YYYY-MM-DD")
          );

          if (isHoliday) {
            continue;
          }

          // Get working hours for this day
          const workingHour = business.workingHours.find(
            (wh) => wh.dayOfWeek === dayOfWeek
          );

          if (!workingHour) {
            continue;
          }

          // Use working hours if no specific times provided, otherwise use provided times
          const slotStartTime =
            startTime === "09:00" && endTime === "18:00"
              ? workingHour.startTime
              : startTime;
          const slotEndTime =
            startTime === "09:00" && endTime === "18:00"
              ? workingHour.endTime
              : endTime;

          // Generate time slots for this day
          let slots;
          try {
            if (isSmartGeneration) {
              slots = generateSmartTimeSlots(
                slotStartTime,
                slotEndTime,
                service.duration,
                smartSettings,
                businessSettings
              );
            } else {
              slots = generateTimeSlots(slotStartTime, slotEndTime, interval);
            }
          } catch (error) {
            continue;
          }

          // Create time slots in database
          for (const slot of slots) {
            try {
              // Check if slot already exists
              const existingSlot = await prisma.timeSlot.findFirst({
                where: {
                  serviceId,
                  date: date.toDate(),
                  startTime: slot.startTime,
                },
              });

              if (existingSlot) {
                // If slot exists but is booked/unavailable, make it available
                if (existingSlot.isBooked) {
                  const updatedSlot = await prisma.timeSlot.update({
                    where: { id: existingSlot.id },
                    data: { isBooked: false },
                  });
                  createdSlots.push(updatedSlot);
                  totalCreated++;
                } else {
                  // Slot exists and is already available, skip
                  totalSkipped++;
                }
                continue;
              }

              // Create new slot if it doesn't exist
              const createdSlot = await prisma.timeSlot.create({
                data: {
                  serviceId,
                  date: date.toDate(),
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  isBooked: false,
                  capacity: 0,
                  maxCapacity: 1,
                  isPeakHour: slot.isPeakHour || false,
                  notes: slot.notes || null,
                },
              });
              createdSlots.push(createdSlot);
              totalCreated++;
            } catch (error) {
              totalSkipped++;
            }
          }
        }
      }

      res.json({
        success: true,
        summary: {
          totalWeeks: weeks,
          totalDays: days.length,
          totalCreated,
          totalSkipped,
          businessName: business.name,
          serviceName: service.name,
          isSmartGeneration,
          mode,
        },
        createdSlots: createdSlots.length,
        data: createdSlots,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Get existing time slots for a service
// @route   GET /api/availability/slots/:serviceId
// @access  Business owner, Staff, Admin
router.get(
  "/slots/:serviceId",
  authenticate,
  authorize("BUSINESS_OWNER", "STAFF"),
  async (req, res, next) => {
    try {
      const { serviceId } = req.params;
      const { startDate, endDate, limit = 100 } = req.query;

      if (!serviceId) {
        return res.status(400).json({
          success: false,
          error: "Service ID is required",
        });
      }

      // Check if service exists
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: {
          business: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          error: "Service not found",
        });
      }

      // Build where clause
      const whereClause = {
        serviceId,
      };

      if (startDate && endDate) {
        whereClause.date = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      } else if (startDate) {
        whereClause.date = {
          gte: new Date(startDate),
        };
      }

      // Get time slots
      const timeSlots = await prisma.timeSlot.findMany({
        where: whereClause,
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        take: parseInt(limit),
        include: {
          services: {
            select: {
              name: true,
              duration: true,
            },
          },
        },
      });

      // Group slots by date
      const slotsByDate = timeSlots.reduce((acc, slot) => {
        const dateKey = slot.date.toISOString().split("T")[0];
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(slot);
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          service: {
            id: service.id,
            name: service.name,
            business: service.business,
          },
          totalSlots: timeSlots.length,
          availableSlots: timeSlots.filter((slot) => !slot.isBooked).length,
          bookedSlots: timeSlots.filter((slot) => slot.isBooked).length,
          slotsByDate,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Enhanced regenerate time slots with comprehensive conflict resolution and business logic
// @route   POST /api/availability/regenerate/:businessId
// @access  Business owner, Staff, Admin
router.post(
  "/regenerate/:businessId",
  authenticate,
  authorize("BUSINESS_OWNER", "STAFF"),
  async (req, res, next) => {
    try {
      const { businessId } = req.params;
      const {
        days = 7,
        startTime = "09:00",
        endTime = "18:00",
        serviceId,
        mode = "basic",
        settings = {},
        forceRegenerate = false,
        conflictResolution = "preserve", // New: preserve, reschedule, force, backup
        backupStrategy = "auto", // New: auto, manual, none
        notificationPreferences = {}, // New: customer notification settings
      } = req.body;

      // Ensure forceRegenerate is a boolean
      const shouldForceRegenerate = Boolean(forceRegenerate);

      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: "Business ID is required",
        });
      }

      if (!serviceId) {
        return res.status(400).json({
          success: false,
          error: "Service ID is required",
        });
      }

      // Extract smart settings and business settings from the request
      const smartSettings = settings.smartSettings || {};
      const businessSettings = settings.businessSettings || {};

      // Check if business exists and get working hours
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: {
          workingHours: {
            where: { isActive: true },
            orderBy: { dayOfWeek: "asc" },
          },
          holidays: {
            where: {
              date: {
                gte: new Date(),
                lte: moment().add(parseInt(days), "days").toDate(),
              },
              isActive: true,
            },
          },
          settings: true, // Include business settings for notifications
        },
      });

      if (!business) {
        return res.status(404).json({
          success: false,
          error: "Business not found",
        });
      }

      // Check if service exists and belongs to this business
      const service = await prisma.service.findFirst({
        where: {
          id: serviceId,
          businessId: businessId,
          isActive: true,
        },
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          error: "Service not found or does not belong to this business",
        });
      }

      // **ENHANCED BUSINESS LOGIC: Get existing bookings for comprehensive conflict analysis**
      const startDate = moment();
      const endDate = moment().add(parseInt(days), "days");

      const existingBookings = await prisma.booking.findMany({
        where: {
          businessId,
          serviceId,
          date: {
            gte: startDate.toDate(),
            lte: endDate.toDate(),
          },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        select: {
          id: true,
          customerName: true,
          customerPhone: true,
          customerEmail: true,
          date: true,
          startTime: true,
          endTime: true,
          status: true,
          notes: true,
          totalAmount: true,
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      });

      // **BUSINESS LOGIC: Pre-regeneration backup creation**
      let backupData = null;
      if (backupStrategy === "auto" || backupStrategy === "manual") {
        const existingSlots = await prisma.timeSlot.findMany({
          where: {
            serviceId,
            date: {
              gte: startDate.toDate(),
              lte: endDate.toDate(),
            },
          },
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
        });

        backupData = {
          timestamp: new Date().toISOString(),
          businessId,
          serviceId,
          serviceName: service.name,
          dateRange: {
            start: startDate.format("YYYY-MM-DD"),
            end: endDate.format("YYYY-MM-DD"),
          },
          originalSlots: existingSlots,
          originalBookings: existingBookings,
          regenerationSettings: {
            mode,
            settings,
            conflictResolution,
            forceRegenerate: shouldForceRegenerate,
          },
        };

        // Store backup in database or file system (simplified for demo)
        console.log("Backup created:", {
          slotsCount: existingSlots.length,
          bookingsCount: existingBookings.length,
          dateRange: backupData.dateRange,
        });
      }

      const generatedSlots = [];
      const conflicts = [];
      const rescheduleOptions = [];
      const customerNotifications = [];
      let totalCreated = 0;
      let totalDeleted = 0;
      let totalSkipped = 0;
      let totalConflicts = 0;
      let totalBookingsAffected = 0;

      const isSmartGeneration =
        mode === "smart" ||
        (smartSettings && Object.keys(smartSettings).length > 0);

      // **BUSINESS LOGIC: Analyze impact before proceeding**
      const impactAnalysis = {
        affectedBookings: existingBookings.length,
        totalRevenue: existingBookings.reduce(
          (sum, booking) => sum + parseFloat(booking.totalAmount),
          0
        ),
        uniqueCustomers: new Set(existingBookings.map((b) => b.customerPhone))
          .size,
        peakDayImpact: {},
      };

      // Group bookings by date for impact analysis
      existingBookings.forEach((booking) => {
        const dateKey = moment(booking.date).format("YYYY-MM-DD");
        if (!impactAnalysis.peakDayImpact[dateKey]) {
          impactAnalysis.peakDayImpact[dateKey] = { count: 0, revenue: 0 };
        }
        impactAnalysis.peakDayImpact[dateKey].count++;
        impactAnalysis.peakDayImpact[dateKey].revenue += parseFloat(
          booking.totalAmount
        );
      });

      for (let i = 0; i < parseInt(days); i++) {
        const date = startDate.clone().add(i, "days");
        const dayOfWeek = date.day();

        const isHoliday = business.holidays.some(
          (holiday) =>
            moment(holiday.date).format("YYYY-MM-DD") ===
            date.format("YYYY-MM-DD")
        );

        if (isHoliday) {
          generatedSlots.push({
            date: date.format("YYYY-MM-DD"),
            dayOfWeek,
            dayName: date.format("dddd"),
            status: "holiday",
            slots: [],
          });
          continue;
        }

        const workingHour = business.workingHours.find(
          (wh) => wh.dayOfWeek === dayOfWeek
        );

        if (!workingHour) {
          generatedSlots.push({
            date: date.format("YYYY-MM-DD"),
            dayOfWeek,
            dayName: date.format("dddd"),
            status: "closed",
            slots: [],
          });
          continue;
        }

        // **ENHANCED BUSINESS LOGIC: Handle existing bookings based on strategy**
        const dayBookings = existingBookings.filter(
          (booking) =>
            moment(booking.date).format("YYYY-MM-DD") ===
            date.format("YYYY-MM-DD")
        );

        // If force regenerate is enabled, handle existing data
        if (shouldForceRegenerate) {
          const queryDate = date.toDate();
          const startOfDay = new Date(
            queryDate.getFullYear(),
            queryDate.getMonth(),
            queryDate.getDate()
          );
          const endOfDay = new Date(
            queryDate.getFullYear(),
            queryDate.getMonth(),
            queryDate.getDate(),
            23,
            59,
            59,
            999
          );

          // Delete existing time slots
          const deletedSlots = await prisma.timeSlot.deleteMany({
            where: {
              serviceId,
              date: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
          });
          totalDeleted += deletedSlots.count;

          // Handle existing bookings based on conflict resolution strategy
          if (dayBookings.length > 0) {
            totalBookingsAffected += dayBookings.length;

            switch (conflictResolution) {
              case "force":
                // Cancel all bookings for this day
                for (const booking of dayBookings) {
                  await prisma.booking.update({
                    where: { id: booking.id },
                    data: {
                      status: "CANCELLED",
                      notes: `${
                        booking.notes || ""
                      }\n[AUTO] Cancelled due to schedule regeneration on ${new Date().toISOString()}`.trim(),
                    },
                  });

                  // Prepare customer notification
                  customerNotifications.push({
                    type: "cancellation",
                    bookingId: booking.id,
                    customerName: booking.customerName,
                    customerPhone: booking.customerPhone,
                    customerEmail: booking.customerEmail,
                    originalTime: `${booking.startTime} - ${booking.endTime}`,
                    date: date.format("YYYY-MM-DD"),
                    reason: "Schedule regeneration",
                  });
                }
                break;

              case "reschedule":
                // Find alternatives for existing bookings
                const alternatives = await findAlternativeSlots(
                  businessId,
                  serviceId,
                  dayBookings,
                  [], // Will be populated with new slots
                  date,
                  service.duration
                );
                rescheduleOptions.push(...alternatives);

                // Prepare reschedule notifications
                dayBookings.forEach((booking) => {
                  customerNotifications.push({
                    type: "reschedule_required",
                    bookingId: booking.id,
                    customerName: booking.customerName,
                    customerPhone: booking.customerPhone,
                    customerEmail: booking.customerEmail,
                    originalTime: `${booking.startTime} - ${booking.endTime}`,
                    date: date.format("YYYY-MM-DD"),
                    alternatives:
                      alternatives.find(
                        (alt) => alt.originalBooking.id === booking.id
                      )?.suggestedSlots || [],
                  });
                });
                break;

              case "preserve":
                // Keep bookings, but note the conflicts
                dayBookings.forEach((booking) => {
                  conflicts.push({
                    date: date.format("YYYY-MM-DD"),
                    slotTime: `${booking.startTime} - ${booking.endTime}`,
                    conflictingBookings: [booking],
                    resolution: "preserved",
                    impact: "Slot generation limited to avoid this booking",
                  });
                });
                totalConflicts += dayBookings.length;
                break;
            }
          }
        }

        // Validate working hour times
        if (!workingHour.startTime || !workingHour.endTime) {
          generatedSlots.push({
            date: date.format("YYYY-MM-DD"),
            dayOfWeek,
            dayName: date.format("dddd"),
            status: "error",
            error: "Invalid working hours configuration",
            slots: [],
          });
          continue;
        }

        // Normalize working hour times
        const normalizedStartTime = validateAndNormalizeTime(
          workingHour.startTime
        );
        const normalizedEndTime = validateAndNormalizeTime(workingHour.endTime);

        if (!normalizedStartTime || !normalizedEndTime) {
          generatedSlots.push({
            date: date.format("YYYY-MM-DD"),
            dayOfWeek,
            dayName: date.format("dddd"),
            status: "error",
            error: "Invalid time format in working hours",
            slots: [],
          });
          continue;
        }

        // Use working hours if no specific times provided, otherwise use provided times
        const slotStartTime =
          startTime === "09:00" && endTime === "18:00"
            ? normalizedStartTime
            : startTime;
        const slotEndTime =
          startTime === "09:00" && endTime === "18:00"
            ? normalizedEndTime
            : endTime;

        // Handle "auto" time values for smart generation
        let finalStartTime, finalEndTime;
        if (startTime === "auto" || endTime === "auto") {
          finalStartTime = normalizedStartTime;
          finalEndTime = normalizedEndTime;
        } else {
          finalStartTime = slotStartTime;
          finalEndTime = slotEndTime;
        }

        // Generate slots for this day
        let slots;
        try {
          if (isSmartGeneration) {
            slots = generateSmartTimeSlots(
              finalStartTime,
              finalEndTime,
              service.duration,
              smartSettings,
              businessSettings
            );
          } else {
            // For basic generation, use service duration as slot duration with 30-minute intervals
            // This creates buffer between slots equal to (interval - service duration)
            slots = generateTimeSlots(
              finalStartTime,
              finalEndTime,
              30,
              service.duration
            );
          }
        } catch (error) {
          generatedSlots.push({
            date: date.format("YYYY-MM-DD"),
            dayOfWeek,
            dayName: date.format("dddd"),
            status: "error",
            error: error.message,
            slots: [],
          });
          continue;
        }

        // Create time slots in database
        const createdSlots = [];
        for (const slot of slots) {
          try {
            // Check if slot already exists
            const existingSlot = await prisma.timeSlot.findFirst({
              where: {
                serviceId,
                date: date.toDate(),
                startTime: slot.startTime,
              },
            });

            if (existingSlot) {
              if (existingSlot.isBooked) {
                const updatedSlot = await prisma.timeSlot.update({
                  where: { id: existingSlot.id },
                  data: { isBooked: false },
                });
                createdSlots.push(updatedSlot);
                totalCreated++;
              } else {
                totalSkipped++;
              }
              continue;
            }

            // Create new slot if it doesn't exist
            const createdSlot = await prisma.timeSlot.create({
              data: {
                serviceId,
                date: date.toDate(),
                startTime: slot.startTime,
                endTime: slot.endTime,
                isBooked: false,
                capacity: 0,
                maxCapacity: 1,
                isPeakHour: slot.isPeakHour || false,
                notes: slot.notes || null,
              },
            });
            createdSlots.push(createdSlot);
            totalCreated++;
          } catch (error) {
            totalSkipped++;
          }
        }

        generatedSlots.push({
          date: date.format("YYYY-MM-DD"),
          dayOfWeek,
          dayName: date.format("dddd"),
          status: "open",
          workingHours: {
            startTime: finalStartTime,
            endTime: finalEndTime,
          },
          slots: createdSlots,
          bookingsAffected: dayBookings.length,
        });
      }

      // **BUSINESS LOGIC: Process customer notifications if enabled**
      if (customerNotifications.length > 0 && business.settings?.smsEnabled) {
        for (const notification of customerNotifications.slice(0, 10)) {
          // Limit to prevent spam
          try {
            await prisma.reminder.create({
              data: {
                bookingId: notification.bookingId,
                type:
                  notification.type === "cancellation"
                    ? "CANCELLATION"
                    : "REMINDER",
                channel: "SMS",
                scheduledAt: moment().add(5, "minutes").toDate(),
              },
            });
          } catch (error) {
            console.error("Failed to create notification reminder:", error);
          }
        }
      }

      res.json({
        success: true,
        summary: {
          totalDays: parseInt(days),
          totalCreated,
          totalDeleted,
          totalSkipped,
          totalConflicts,
          totalBookingsAffected,
          businessName: business.name,
          serviceName: service.name,
          isSmartGeneration,
          shouldForceRegenerate,
          conflictResolution,
          backupCreated: backupData !== null,
        },
        impactAnalysis,
        generatedSlots,
        conflicts:
          conflicts.length > 0
            ? {
                total: conflicts.length,
                details: conflicts,
              }
            : undefined,
        rescheduleOptions:
          rescheduleOptions.length > 0 ? rescheduleOptions : undefined,
        customerNotifications:
          customerNotifications.length > 0
            ? {
                total: customerNotifications.length,
                details: customerNotifications,
                notificationsSent: business.settings?.smsEnabled
                  ? Math.min(customerNotifications.length, 10)
                  : 0,
              }
            : undefined,
        backup: backupData
          ? {
              timestamp: backupData.timestamp,
              slotsBackedUp: backupData.originalSlots.length,
              bookingsBackedUp: backupData.originalBookings.length,
            }
          : undefined,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Test endpoint to verify booking query works
// @route   GET /api/availability/test-booking-query/:businessId
// @access  Business owner, Staff, Admin
router.get(
  "/test-booking-query/:businessId",
  authenticate,
  authorize("BUSINESS_OWNER", "STAFF"),
  async (req, res, next) => {
    try {
      const { businessId } = req.params;
      const { serviceId } = req.query;

      if (!businessId || !serviceId) {
        return res.status(400).json({
          success: false,
          error: "Business ID and Service ID are required",
        });
      }

      // Test the same query that was failing
      const startDate = moment();
      const endDate = moment().add(7, "days");

      const existingBookings = await prisma.booking.findMany({
        where: {
          businessId,
          serviceId,
          date: {
            gte: startDate.toDate(),
            lte: endDate.toDate(),
          },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        select: {
          id: true,
          customerName: true,
          customerPhone: true,
          customerEmail: true,
          date: true,
          startTime: true,
          endTime: true,
          status: true,
          notes: true,
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      });

      res.json({
        success: true,
        message: "Booking query test successful",
        data: {
          bookingsFound: existingBookings.length,
          bookings: existingBookings,
          dateRange: {
            start: startDate.format("YYYY-MM-DD"),
            end: endDate.format("YYYY-MM-DD"),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Helper function to get detailed availability for a specific date and service
async function getDetailedAvailability(businessId, serviceId, date) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      services: {
        where: { isActive: true },
      },
      workingHours: {
        where: { isActive: true },
      },
      holidays: {
        where: {
          date: new Date(date),
          isActive: true,
        },
      },
    },
  });

  if (!business) {
    return {
      available: false,
      reason: "Business not found",
      slots: [],
    };
  }

  // Check if the specific service exists and belongs to this business
  const service = business.services.find((s) => s.id === serviceId);

  if (!service) {
    return {
      available: false,
      reason: "Service not found",
      slots: [],
    };
  }

  if (business.holidays.length > 0) {
    return {
      available: false,
      reason: "Holiday",
      slots: [],
    };
  }

  const dayOfWeek = new Date(date).getDay();
  const workingHour = business.workingHours.find(
    (wh) => wh.dayOfWeek === dayOfWeek
  );

  if (!workingHour) {
    return {
      available: false,
      reason: "Closed",
      slots: [],
    };
  }

  // Validate working hour times
  if (!workingHour.startTime || !workingHour.endTime) {
    return {
      available: false,
      reason: "Invalid working hours configuration",
      slots: [],
    };
  }

  // Normalize working hour times
  const normalizedStartTime = validateAndNormalizeTime(workingHour.startTime);
  const normalizedEndTime = validateAndNormalizeTime(workingHour.endTime);

  if (!normalizedStartTime || !normalizedEndTime) {
    return {
      available: false,
      reason: "Invalid time format in working hours",
      slots: [],
    };
  }

  // Get existing time slots from database
  const queryDate = new Date(date);
  const startOfDay = new Date(
    queryDate.getFullYear(),
    queryDate.getMonth(),
    queryDate.getDate()
  );
  const endOfDay = new Date(
    queryDate.getFullYear(),
    queryDate.getMonth(),
    queryDate.getDate(),
    23,
    59,
    59,
    999
  );

  const existingSlots = await prisma.timeSlot.findMany({
    where: {
      serviceId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  // Get booked slots
  const bookedSlots = await prisma.booking.findMany({
    where: {
      businessId,
      serviceId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { startTime: true, endTime: true, status: true },
  });

  console.log(`[Availability Debug] Date: ${date}, Service: ${serviceId}`);
  console.log(
    `[Availability Debug] Existing slots count: ${existingSlots.length}`
  );
  console.log(`[Availability Debug] Booked slots count: ${bookedSlots.length}`);
  console.log(
    `[Availability Debug] Booked slots:`,
    bookedSlots.map((b) => ({
      start: b.startTime,
      end: b.endTime,
      status: b.status,
    }))
  );

  let finalSlots = [];

  // If we have database slots, use them as the primary source
  if (existingSlots.length > 0) {
    finalSlots = existingSlots
      .map((slot) => {
        const isBookedByBooking = bookedSlots.some(
          (booked) =>
            booked.startTime === slot.startTime &&
            booked.endTime === slot.endTime
        );

        const slotResult = {
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: !slot.isBooked && !isBookedByBooking,
          isBooked: slot.isBooked || isBookedByBooking,
          capacity: slot.capacity,
          maxCapacity: slot.maxCapacity,
          isPeakHour: slot.isPeakHour,
          notes: slot.notes,
        };

        console.log(
          `[Availability Debug] Slot ${slot.startTime}-${slot.endTime}: dbBooked=${slot.isBooked}, hasBooking=${isBookedByBooking}, available=${slotResult.isAvailable}`
        );

        return slotResult;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  } else {
    return {
      available: false,
      reason: "No time slots found in database",
      slots: [],
      source: "database_only",
    };
  }

  // Sort all slots by start time and return with availability status
  const sortedSlots = finalSlots.sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  // Filter for available slots only
  const availableSlots = sortedSlots.filter((slot) => slot.isAvailable);

  return {
    available: availableSlots.length > 0,
    service: {
      id: service.id,
      name: service.name,
      duration: service.duration,
      price: service.price,
    },
    slots: availableSlots, // Return only available slots for frontend compatibility
    availableSlots: availableSlots, // Also provide available ones explicitly
    allSlots: sortedSlots, // Provide all slots for debugging/admin purposes
    source: "database",
  };
}

// Helper function to get weekly availability
async function getWeeklyAvailability(businessId, days) {
  const availability = [];
  const startDate = moment();

  for (let i = 0; i < days; i++) {
    const date = startDate.clone().add(i, "days");
    const dayOfWeek = date.day();

    // Get working hours for this day
    const workingHour = await prisma.workingHour.findFirst({
      where: {
        businessId,
        dayOfWeek,
        isActive: true,
      },
    });

    // Check if it's a holiday
    const holiday = await prisma.holiday.findFirst({
      where: {
        businessId,
        date: date.toDate(),
        isActive: true,
      },
    });

    let status = "closed";
    if (holiday) {
      status = "holiday";
    } else if (workingHour) {
      status = "open";
    }

    availability.push({
      date: date.format("YYYY-MM-DD"),
      dayOfWeek,
      dayName: date.format("dddd"),
      status,
      workingHours: workingHour
        ? {
            startTime: workingHour.startTime,
            endTime: workingHour.endTime,
          }
        : null,
      holiday: holiday
        ? {
            reason: holiday.reason,
          }
        : null,
    });
  }

  return availability;
}

// Helper function to generate time slots
function generateTimeSlots(
  startTime,
  endTime,
  intervalMinutes = 30,
  slotDuration = null
) {
  // Handle null/undefined time values
  if (!startTime || !endTime) {
    throw new Error("Start time and end time are required");
  }

  // Handle "auto" case
  if (startTime === "auto" || endTime === "auto") {
    throw new Error(
      "Auto time values should be resolved before calling generateTimeSlots"
    );
  }

  // Normalize time formats
  const normalizedStartTime = validateAndNormalizeTime(startTime);
  const normalizedEndTime = validateAndNormalizeTime(endTime);

  if (!normalizedStartTime || !normalizedEndTime) {
    throw new Error(
      `Invalid time format. Use HH:MM format (e.g., "09:00", "18:30"). Received: startTime="${startTime}", endTime="${endTime}"`
    );
  }

  // Validate interval
  if (intervalMinutes <= 0 || intervalMinutes > 1440) {
    throw new Error("Invalid interval. Must be between 1 and 1440 minutes");
  }

  const slots = [];
  const start = new Date(`2000-01-01T${normalizedStartTime}:00`);
  const end = new Date(`2000-01-01T${normalizedEndTime}:00`);

  // Validate that start time is before end time
  if (start >= end) {
    throw new Error(
      `Start time (${normalizedStartTime}) must be before end time (${normalizedEndTime})`
    );
  }

  // Create a copy of start time to avoid mutating the original
  let currentTime = new Date(start);

  while (currentTime < end) {
    const slotStart = currentTime.toTimeString().slice(0, 5);

    // Calculate end time for this slot
    // If slotDuration is specified, use it; otherwise use intervalMinutes for both duration and interval
    const actualSlotDuration = slotDuration || intervalMinutes;
    const slotEndTime = new Date(currentTime);
    slotEndTime.setMinutes(slotEndTime.getMinutes() + actualSlotDuration);
    const slotEnd = slotEndTime.toTimeString().slice(0, 5);

    // Move to next slot start time
    currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);

    // Only add slot if slot end time doesn't exceed the end time
    if (slotEndTime <= end) {
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
      });
    }
  }

  // Sort slots by start time to ensure proper ordering
  return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

// Helper function to generate smart time slots for SMEs
function generateSmartTimeSlots(
  startTime,
  endTime,
  serviceDuration,
  smartSettings = {},
  businessSettings = {}
) {
  // Handle null/undefined time values
  if (!startTime || !endTime) {
    throw new Error("Start time and end time are required");
  }

  // Handle "auto" case
  if (startTime === "auto" || endTime === "auto") {
    throw new Error(
      "Auto time values should be resolved before calling generateSmartTimeSlots"
    );
  }

  // Normalize time formats
  const normalizedStartTime = validateAndNormalizeTime(startTime);
  const normalizedEndTime = validateAndNormalizeTime(endTime);

  if (!normalizedStartTime || !normalizedEndTime) {
    throw new Error(
      `Invalid time format. Use HH:MM format (e.g., "09:00", "18:30"). Received: startTime="${startTime}", endTime="${endTime}"`
    );
  }

  // Validate service duration
  if (!serviceDuration || serviceDuration <= 0 || serviceDuration > 480) {
    throw new Error(
      "Invalid service duration. Must be between 1 and 480 minutes"
    );
  }

  const slots = [];
  const start = new Date(`2000-01-01T${normalizedStartTime}:00`);
  const end = new Date(`2000-01-01T${normalizedEndTime}:00`);

  // Validate that start time is before end time
  if (start >= end) {
    throw new Error(
      `Start time (${normalizedStartTime}) must be before end time (${normalizedEndTime})`
    );
  }

  // Calculate buffer between slots (not included in slot duration)
  // Try to get buffer from businessSettings first, then smartSettings, with fallback
  const bufferMinutes =
    businessSettings.bufferBetweenSlots !== undefined
      ? businessSettings.bufferBetweenSlots
      : smartSettings.bufferBetweenSlots !== undefined
      ? smartSettings.bufferBetweenSlots
      : 15;

  // The interval is service duration + buffer, but the actual slot endTime is only service duration
  const intervalMinutes = serviceDuration + bufferMinutes;

  // Get business settings with defaults
  const lunchBreakStart = businessSettings.lunchBreakStart || "12:00";
  const lunchBreakEnd = businessSettings.lunchBreakEnd || "13:00";
  const peakHoursStart = businessSettings.peakHoursStart || "10:00";
  const peakHoursEnd = businessSettings.peakHoursEnd || "16:00";

  // Create a copy of start time to avoid mutating the original
  let currentTime = new Date(start);
  let totalSlotsGenerated = 0;
  let slotsSkippedForLunch = 0;
  let peakHourSlots = 0;

  while (currentTime < end) {
    const slotStart = currentTime.toTimeString().slice(0, 5);

    // Calculate end time for this slot (only service duration, not including buffer)
    const slotEndTime = new Date(currentTime);
    slotEndTime.setMinutes(slotEndTime.getMinutes() + serviceDuration);
    const slotEnd = slotEndTime.toTimeString().slice(0, 5);

    // Move to next slot start time (service duration + buffer for interval between slots)
    currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);

    // Only add slot if slot end time doesn't exceed the working hours end time
    if (slotEndTime <= end) {
      // Check if slot conflicts with lunch break
      const slotStartMoment = moment(`2000-01-01T${slotStart}:00`);
      const slotEndMoment = moment(`2000-01-01T${slotEnd}:00`);
      const lunchStartMoment = moment(`2000-01-01T${lunchBreakStart}:00`);
      const lunchEndMoment = moment(`2000-01-01T${lunchBreakEnd}:00`);

      // Skip slots that overlap with lunch break
      if (smartSettings.includeLunchBreak !== false) {
        const overlapsLunch =
          (slotStartMoment.isBefore(lunchEndMoment) &&
            slotEndMoment.isAfter(lunchStartMoment)) ||
          slotStartMoment.isBetween(
            lunchStartMoment,
            lunchEndMoment,
            null,
            "[]"
          ) ||
          slotEndMoment.isBetween(lunchStartMoment, lunchEndMoment, null, "[]");

        if (overlapsLunch) {
          slotsSkippedForLunch++;
          continue;
        }
      }

      // Check if slot is in peak hours
      const peakStartMoment = moment(`2000-01-01T${peakHoursStart}:00`);
      const peakEndMoment = moment(`2000-01-01T${peakHoursEnd}:00`);
      const isPeakHour = slotStartMoment.isBetween(
        peakStartMoment,
        peakEndMoment,
        null,
        "[]"
      );

      if (isPeakHour) {
        peakHourSlots++;
      }

      // Add slot with additional metadata for smart features
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        isPeakHour,
        serviceDuration,
        intervalMinutes,
        metadata: {
          lunchBreakAvoided: smartSettings.includeLunchBreak !== false,
          peakHourOptimized: smartSettings.optimizeForPeakHours || false,
          serviceDurationOptimized: smartSettings.useServiceDuration || false,
        },
      });
      totalSlotsGenerated++;
    }
  }

  // Apply peak hour optimization if enabled
  if (smartSettings.optimizeForPeakHours) {
    // Sort slots to prioritize peak hours, then by start time
    slots.sort((a, b) => {
      if (a.isPeakHour && !b.isPeakHour) return -1;
      if (!a.isPeakHour && b.isPeakHour) return 1;
      // If both have same peak hour status, sort by start time
      return a.startTime.localeCompare(b.startTime);
    });
  } else {
    // Sort slots by start time when peak hour optimization is disabled
    slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  return slots;
}

// Helper function to find alternative slots for rescheduling
async function findAlternativeSlots(
  businessId,
  serviceId,
  conflictingBookings,
  availableSlots,
  baseDate,
  serviceDuration
) {
  const alternatives = [];

  for (const booking of conflictingBookings) {
    const bookingDuration = moment(booking.endTime, "HH:mm").diff(
      moment(booking.startTime, "HH:mm"),
      "minutes"
    );

    // Find slots within the same day first
    const sameDayOptions = availableSlots
      .filter((slot) => {
        const slotStart = moment(
          `${baseDate.format("YYYY-MM-DD")} ${slot.startTime}`
        );
        const slotEnd = moment(
          `${baseDate.format("YYYY-MM-DD")} ${slot.endTime}`
        );
        const slotDuration = slotEnd.diff(slotStart, "minutes");

        return slotDuration >= bookingDuration;
      })
      .slice(0, 3); // Limit to 3 options

    // Find slots in next 7 days if same day options are limited
    const futureDateOptions = [];
    if (sameDayOptions.length < 2) {
      for (let i = 1; i <= 7; i++) {
        const futureDate = baseDate.clone().add(i, "days");
        const dayOfWeek = futureDate.day();

        // Get working hours for future date
        const workingHour = await prisma.workingHour.findFirst({
          where: {
            businessId,
            dayOfWeek,
            isActive: true,
          },
        });

        if (workingHour) {
          // Generate a few slots for this day
          const futureSlots = generateTimeSlots(
            workingHour.startTime,
            workingHour.endTime,
            30
          ).slice(0, 2);
          futureDateOptions.push(
            ...futureSlots.map((slot) => ({
              ...slot,
              date: futureDate.format("YYYY-MM-DD"),
              dayName: futureDate.format("dddd"),
            }))
          );
        }

        if (futureDateOptions.length >= 3) break;
      }
    }

    alternatives.push({
      originalBooking: {
        id: booking.id,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        originalTime: `${booking.startTime} - ${booking.endTime}`,
        originalDate: baseDate.format("YYYY-MM-DD"),
      },
      suggestedSlots: [
        ...sameDayOptions.map((slot) => ({
          ...slot,
          date: baseDate.format("YYYY-MM-DD"),
          dayName: baseDate.format("dddd"),
          priority: "same_day",
        })),
        ...futureDateOptions.map((slot) => ({
          ...slot,
          priority: "future_day",
        })),
      ].slice(0, 5), // Limit total suggestions to 5
    });
  }

  return alternatives;
}

module.exports = router;

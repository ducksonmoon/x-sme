const { PrismaClient } = require('@prisma/client');
const moment = require('moment');
const realtimeService = require('./realtimeService');

const prisma = new PrismaClient();

class TimeSlotCreationService {
  constructor() {
    this.defaultInterval = 30; // minutes
    this.maxSlotsPerBatch = 1000; // prevent memory issues
  }

  /**
   * Create time slots with intelligent business logic
   */
  async createTimeSlots(options) {
    const {
      businessId,
      serviceId,
      staffId = null,
      template = 'weekly', // weekly, daily, custom, bulk, smart
      pattern = {},
      dateRange = {},
      conflictResolution = 'skip', // skip, overwrite, merge
      preview = false, // return preview without creating
      applyHolidays = true,
      applyBreaks = true,
      metadata = {}
    } = options;

    try {
      console.log('TimeSlotCreationService: Creating slots with options:', {
        businessId,
        serviceId,
        template,
        pattern,
        preview,
        conflictResolution
      });

      // Validate inputs
      await this.validateInputs(options);

      // Get business context
      const context = await this.getBusinessContext(businessId, serviceId, staffId);

      // Generate slot patterns based on template
      const slotPatterns = await this.generateSlotPatterns(template, pattern, context);

      // Apply date range and generate actual slots
      const proposedSlots = await this.generateActualSlots(slotPatterns, dateRange, context);

      // Apply business rules (holidays, breaks, existing bookings)
      const processedSlots = await this.applyBusinessRules(proposedSlots, context, {
        applyHolidays,
        applyBreaks,
        conflictResolution
      });

      // If preview mode, return without creating
      if (preview) {
        return {
          success: true,
          preview: true,
          data: {
            slotsToCreate: processedSlots.valid,
            conflicts: processedSlots.conflicts,
            summary: this.generateSummary(processedSlots),
            businessRules: this.getAppliedRules(context)
          }
        };
      }

      // Create slots in database
      const result = await this.createSlotsInDatabase(processedSlots.valid, metadata);

      // Emit real-time updates
      const slotsByDate = this.groupSlotsByDate(result.created);
      for (const [date, slots] of Object.entries(slotsByDate)) {
        realtimeService.emitAvailabilityUpdated(businessId, serviceId, date, slots);
      }

      return {
        success: true,
        data: {
          created: result.created,
          skipped: result.skipped,
          conflicts: processedSlots.conflicts,
          summary: this.generateSummary(processedSlots),
          slotsCreated: result.created.length
        }
      };

    } catch (error) {
      console.error('Error creating time slots:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive business context
   */
  async getBusinessContext(businessId, serviceId, staffId) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        workingHours: { where: { isActive: true } },
        holidays: { 
          where: { 
            isActive: true,
            date: { gte: moment().startOf('day').toDate() }
          }
        },
        settings: true
      }
    });

    if (!business) {
      throw new Error('Business not found');
    }

    const service = serviceId ? await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        business: {
          include: {
            workingHours: { where: { isActive: true } }
          }
        }
      }
    }) : null;

    if (serviceId && !service) {
      throw new Error('Service not found');
    }

    const staff = staffId ? await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        staff_working_hours: { where: { isActive: true } },
        staff_breaks: { where: { isActive: true } },
        staff_time_off: {
          where: {
            startDate: { lte: moment().add(1, 'year').toDate() },
            endDate: { gte: moment().toDate() }
          }
        }
      }
    }) : null;

    return {
      business,
      service,
      staff,
      interval: business?.settings?.bufferBetweenSlots || this.defaultInterval,
      maxAdvanceDays: business?.settings?.advanceBookingDays || 60,
      bufferTime: business?.settings?.bufferBetweenSlots || 0
    };
  }

  /**
   * Generate slot patterns based on template type
   */
  async generateSlotPatterns(template, pattern, context) {
    console.log('generateSlotPatterns called with template:', template, 'pattern:', pattern);
    
    switch (template) {
      case 'weekly':
        console.log('Routing to generateWeeklyPattern');
        return this.generateWeeklyPattern(pattern, context);
      case 'daily':
        console.log('Routing to generateDailyPattern');
        return this.generateDailyPattern(pattern, context);
      case 'custom':
        console.log('Routing to generateCustomPattern');
        return this.generateCustomPattern(pattern, context);
      case 'bulk':
        console.log('Routing to generateBulkPattern');
        return this.generateBulkPattern(pattern, context);
      case 'smart':
        console.log('Routing to generateSmartPattern');
        return this.generateSmartPattern(pattern, context);
      default:
        throw new Error(`Unknown template type: ${template}`);
    }
  }

  /**
   * Generate weekly recurring pattern
   */
  generateWeeklyPattern(pattern, context) {
    const {
      daysOfWeek = [1, 2, 3, 4, 5], // Monday to Friday
      startTime = '09:00',
      endTime = '17:00',
      interval = context.interval,
      duration = null, // service duration or custom
      excludeLunch = true,
      lunchStart = '12:00',
      lunchEnd = '13:00'
    } = pattern;

    const weeklySlots = [];

    daysOfWeek.forEach(dayOfWeek => {
      // Get working hours from hierarchy (staff > service > business)
      const workingHours = this.getWorkingHoursForDay(dayOfWeek, context);
      
      if (!workingHours) return;

      const dayStartTime = startTime === 'auto' ? workingHours.startTime : startTime;
      const dayEndTime = endTime === 'auto' ? workingHours.endTime : endTime;

      // Generate time slots for the day
      const slots = this.generateDaySlots(dayStartTime, dayEndTime, {
        interval,
        duration: duration || context.service?.duration,
        excludeLunch,
        lunchStart,
        lunchEnd
      });

      weeklySlots.push({
        dayOfWeek,
        slots,
        workingHours: { startTime: dayStartTime, endTime: dayEndTime }
      });
    });

    return weeklySlots;
  }

  /**
   * Generate daily one-time pattern
   */
  generateDailyPattern(pattern, context) {
    const {
      date,
      startTime = '09:00',
      endTime = '17:00',
      interval = context.interval,
      duration = null
    } = pattern;

    const dayOfWeek = moment(date).day();
    const workingHours = this.getWorkingHoursForDay(dayOfWeek, context);
    
    if (!workingHours) {
      return [{
        date,
        slots: [],
        reason: 'No working hours defined for this day'
      }];
    }

    const slots = this.generateDaySlots(startTime, endTime, {
      interval,
      duration: duration || context.service?.duration
    });

    return [{
      date,
      dayOfWeek,
      slots,
      workingHours: { startTime, endTime }
    }];
  }

  /**
   * Generate custom pattern with advanced options
   */
  generateCustomPattern(pattern, context) {
    console.log('🔧 generateCustomPattern called with:', {
      pattern: JSON.stringify(pattern, null, 2),
      contextInterval: context.interval,
      contextServiceDuration: context.service?.duration
    });

    const {
      schedules = [], // Array of { date, startTime, endTime, interval?, duration? }
      recurring = false,
      recurrenceRule = null // { frequency: 'weekly', interval: 1, count: 10 }
    } = pattern;

    console.log('🔧 Extracted schedules:', schedules.length, 'schedules');

    const customSlots = [];

    schedules.forEach((schedule, index) => {
      console.log(`🔧 Processing schedule ${index + 1}:`, {
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        interval: schedule.interval,
        duration: schedule.duration,
        contextInterval: context.interval,
        contextServiceDuration: context.service?.duration
      });

      const slots = this.generateDaySlots(schedule.startTime, schedule.endTime, {
        interval: schedule.interval || context.interval,
        duration: schedule.duration || context.service?.duration
      });

      console.log(`🔧 Generated ${slots.length} slots for schedule ${index + 1}`);

      customSlots.push({
        date: schedule.date,
        dayOfWeek: moment(schedule.date).day(),
        slots,
        workingHours: { 
          startTime: schedule.startTime, 
          endTime: schedule.endTime 
        }
      });

      // Handle recurrence
      if (recurring && recurrenceRule) {
        const recurringSlots = this.generateRecurringSlots(schedule, recurrenceRule);
        customSlots.push(...recurringSlots);
      }
    });

    console.log('🔧 Total custom slots generated:', customSlots.length, 'days');
    console.log('🔧 Custom slots summary:', customSlots.map(cs => ({
      date: cs.date,
      dayOfWeek: cs.dayOfWeek,
      slotsCount: cs.slots.length
    })));

    return customSlots;
  }

  /**
   * Generate bulk pattern for multiple weeks/months
   */
  generateBulkPattern(pattern, context) {
    const {
      startDate,
      endDate,
      weeklyTemplate, // Reference to weekly pattern
      excludeWeekends = false,
      excludeHolidays = true
    } = pattern;

    // If weeklyTemplate is not provided, generate a default weekly pattern
    let actualWeeklyTemplate = weeklyTemplate;
    if (!actualWeeklyTemplate) {
      // Generate a default weekly pattern for bulk generation
      const defaultWeeklyPattern = {
        daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
        startTime: 'auto',
        endTime: 'auto',
        interval: context.interval || 30,
        excludeLunch: true,
        lunchStart: '12:00',
        lunchEnd: '13:00'
      };
      actualWeeklyTemplate = this.generateWeeklyPattern(defaultWeeklyPattern, context);
    }

    const bulkSlots = [];
    const start = moment(startDate);
    const end = moment(endDate);

    // Generate weekly patterns for each week in the range
    while (start.isSameOrBefore(end, 'week')) {
      const weekStart = start.clone().startOf('week');
      
      for (let i = 0; i < 7; i++) {
        const currentDate = weekStart.clone().add(i, 'days');
        
        if (currentDate.isAfter(end)) break;
        if (excludeWeekends && [0, 6].includes(currentDate.day())) continue;
        
        const dayOfWeek = currentDate.day();
        const weeklyDay = actualWeeklyTemplate.find(w => w.dayOfWeek === dayOfWeek);
        
        if (weeklyDay) {
          bulkSlots.push({
            date: currentDate.format('YYYY-MM-DD'),
            dayOfWeek,
            slots: weeklyDay.slots,
            workingHours: weeklyDay.workingHours
          });
        }
      }
      
      start.add(1, 'week');
    }

    return bulkSlots;
  }

  /**
   * Generate smart pattern based on existing data and AI insights
   */
  async generateSmartPattern(pattern, context) {
    const {
      optimizeFor = 'availability', // availability, bookings, revenue
      learningPeriod = 30, // days to analyze
      suggestions = true
    } = pattern;

    // Analyze historical data
    const insights = await this.analyzeHistoricalData(context, learningPeriod);
    
    // Generate optimized pattern based on insights
    const optimizedPattern = this.optimizePattern(insights, optimizeFor, context);
    
    return optimizedPattern;
  }

  /**
   * Generate time slots for a specific day
   */
  generateDaySlots(startTime, endTime, options = {}) {
    const {
      interval = 30,
      duration = null,
      excludeLunch = false,
      lunchStart = '12:00',
      lunchEnd = '13:00'
    } = options;

    console.log('🔧 generateDaySlots called with:', {
      startTime,
      endTime,
      options,
      resolvedInterval: interval,
      resolvedDuration: duration || interval
    });

    const slots = [];
    const start = moment(startTime, 'HH:mm');
    const end = moment(endTime, 'HH:mm');
    const slotDuration = duration || interval;

    console.log('🔧 Time validation:', {
      startValid: start.isValid(),
      endValid: end.isValid(),
      startAfterEnd: start.isAfter(end),
      timeDiff: end.diff(start, 'minutes'),
      slotDuration
    });

    if (!start.isValid() || !end.isValid()) {
      console.log('❌ Invalid time format detected');
      return slots;
    }

    if (start.isAfter(end)) {
      console.log('❌ Start time is after end time');
      return slots;
    }

    let slotCount = 0;
    while (start.clone().add(slotDuration, 'minutes').isSameOrBefore(end)) {
      const slotStart = start.format('HH:mm');
      const slotEnd = start.clone().add(slotDuration, 'minutes').format('HH:mm');

      // Check if slot conflicts with lunch break
      if (excludeLunch && this.isInLunchBreak(slotStart, slotEnd, lunchStart, lunchEnd)) {
        console.log(`🔧 Skipping slot ${slotStart}-${slotEnd} due to lunch break`);
        start.add(interval, 'minutes');
        continue;
      }

      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        duration: slotDuration
      });

      slotCount++;
      start.add(interval, 'minutes');
    }

    console.log(`🔧 Generated ${slots.length} day slots`);
    return slots;
  }

  /**
   * Apply business rules to proposed slots
   */
  async applyBusinessRules(proposedSlots, context, options) {
    const { applyHolidays, applyBreaks, conflictResolution } = options;
    const validSlots = [];
    const conflicts = [];

    for (const daySlots of proposedSlots) {
      const processedDay = await this.processDaySlots(daySlots, context, {
        applyHolidays,
        applyBreaks,
        conflictResolution
      });

      validSlots.push(...processedDay.valid);
      conflicts.push(...processedDay.conflicts);
    }

    return { valid: validSlots, conflicts };
  }

  /**
   * Process slots for a specific day
   */
  async processDaySlots(daySlots, context, options) {
    const { date, slots } = daySlots;
    const { applyHolidays, applyBreaks, conflictResolution } = options;
    
    const validSlots = [];
    const conflicts = [];

    // Check if date is a holiday
    if (applyHolidays && this.isHoliday(date, context.business.holidays)) {
      conflicts.push({
        type: 'holiday',
        date,
        message: 'Date is marked as holiday'
      });
      return { valid: [], conflicts };
    }

    // Check staff time off
    if (context.staff && this.isStaffTimeOff(date, context.staff.staff_time_off)) {
      conflicts.push({
        type: 'timeoff',
        date,
        staffId: context.staff.id,
        message: 'Staff member is on time off'
      });
      return { valid: [], conflicts };
    }

    // Get existing bookings and slots for this date
    const existingData = await this.getExistingDataForDate(date, context);

    for (const slot of slots) {
      const slotData = {
        ...slot,
        date,
        serviceId: context.service?.id
      };

      // Check for conflicts
      const conflict = this.checkSlotConflicts(slotData, existingData, context);
      
      if (conflict) {
        const resolution = await this.resolveConflict(conflict, conflictResolution, slotData);
        
        if (resolution.action === 'skip') {
          conflicts.push(resolution.conflict);
          continue;
        } else if (resolution.action === 'merge') {
          slotData.merged = true;
          slotData.originalSlot = resolution.originalSlot;
        }
      }

      // Apply staff breaks
      if (applyBreaks && context.staff) {
        const breakConflict = this.checkBreakConflicts(slotData, context.staff.staff_breaks);
        if (breakConflict) {
          conflicts.push(breakConflict);
          continue;
        }
      }

      validSlots.push(slotData);
    }

    return { valid: validSlots, conflicts };
  }

  /**
   * Create validated slots in database
   */
  async createSlotsInDatabase(validSlots, metadata) {
    const created = [];
    const skipped = [];

    // Group slots by business, service, staff for efficient creation
    const groupedSlots = this.groupSlotsByContext(validSlots);

    for (const [contextKey, slots] of Object.entries(groupedSlots)) {
      try {
        // Batch create slots
        const batchSize = 100;
        for (let i = 0; i < slots.length; i += batchSize) {
          const batch = slots.slice(i, i + batchSize);
          
          // Create each slot individually to get the full objects back
          const createdSlots = [];
          for (const slot of batch) {
            try {
              // Check if slot already exists before creating
              const existingSlot = await prisma.timeSlot.findFirst({
                where: {
                  serviceId: slot.serviceId,
                  date: new Date(slot.date),
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
                } else {
                  // Slot exists and is already available, skip
                  console.log(`Skipping existing slot: ${slot.date} ${slot.startTime}-${slot.endTime}`);
                }
                continue;
              }

              // Create new slot if it doesn't exist
              try {
                const createdSlot = await prisma.timeSlot.create({
                  data: {
                    serviceId: slot.serviceId,
                    date: new Date(slot.date),
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    isBooked: false,
                    capacity: slot.capacity || 0,
                    maxCapacity: slot.maxCapacity || 1,
                    isPeakHour: slot.isPeakHour || false,
                    notes: slot.notes || null,
                  }
                });
                createdSlots.push(createdSlot);
              } catch (createError) {
                // Handle unique constraint violation
                if (createError.code === 'P2002' && createError.meta?.target?.includes('serviceId')) {
                  console.log(`Slot already exists (unique constraint): ${slot.date} ${slot.startTime}-${slot.endTime}`);
                  // Try to find and update the existing slot if it's booked
                  const existingSlot = await prisma.timeSlot.findFirst({
                    where: {
                      serviceId: slot.serviceId,
                      date: new Date(slot.date),
                      startTime: slot.startTime,
                    },
                  });
                  if (existingSlot && existingSlot.isBooked) {
                    const updatedSlot = await prisma.timeSlot.update({
                      where: { id: existingSlot.id },
                      data: { isBooked: false },
                    });
                    createdSlots.push(updatedSlot);
                  }
                } else {
                  throw createError; // Re-throw other errors
                }
              }
            } catch (error) {
              console.error(`Error creating individual slot:`, error);
              skipped.push(slot);
            }
          }

          created.push(...createdSlots);
        }
      } catch (error) {
        console.error(`Error creating slots for context ${contextKey}:`, error);
        skipped.push(...slots);
      }
    }

    return { created, skipped };
  }

  /**
   * Get working hours for a specific day using hierarchy
   */
  getWorkingHoursForDay(dayOfWeek, context) {
    // Priority: Staff > Service > Business
    if (context.staff?.staff_working_hours) {
      const staffHours = context.staff.staff_working_hours.find(wh => wh.dayOfWeek === dayOfWeek);
      if (staffHours) return staffHours;
    }

    // Fallback to business working hours
    if (context.business?.workingHours) {
      return context.business.workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
    }

    return null;
  }

  /**
   * Check if a time slot conflicts with lunch break
   */
  isInLunchBreak(slotStart, slotEnd, lunchStart, lunchEnd) {
    const slotStartMoment = moment(slotStart, 'HH:mm');
    const slotEndMoment = moment(slotEnd, 'HH:mm');
    const lunchStartMoment = moment(lunchStart, 'HH:mm');
    const lunchEndMoment = moment(lunchEnd, 'HH:mm');

    return slotStartMoment.isBefore(lunchEndMoment) && slotEndMoment.isAfter(lunchStartMoment);
  }

  /**
   * Check if a date is a holiday
   */
  isHoliday(date, holidays) {
    return holidays.some(holiday => 
      moment(holiday.date).format('YYYY-MM-DD') === moment(date).format('YYYY-MM-DD')
    );
  }

  /**
   * Check if staff is on time off
   */
  isStaffTimeOff(date, timeOffs) {
    return timeOffs.some(timeOff => 
      moment(date).isBetween(timeOff.startDate, timeOff.endDate, 'day', '[]')
    );
  }

  /**
   * Get existing data for a specific date
   */
  async getExistingDataForDate(date, context) {
    const existingSlots = await prisma.timeSlot.findMany({
      where: {
        serviceId: context.service?.id,
        date: new Date(date)
      }
    });

    const existingBookings = await prisma.booking.findMany({
      where: {
        businessId: context.business.id,
        serviceId: context.service?.id,
        date: new Date(date),
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    return { slots: existingSlots, bookings: existingBookings };
  }

  /**
   * Check for slot conflicts
   */
  checkSlotConflicts(slotData, existingData, context) {
    // Check for overlapping slots
    const overlappingSlot = existingData.slots.find(existingSlot => 
      slotData.startTime < existingSlot.endTime && 
      slotData.endTime > existingSlot.startTime
    );

    if (overlappingSlot) {
      return {
        type: 'slot_overlap',
        existingSlot: overlappingSlot,
        newSlot: slotData,
        message: 'Time slot overlaps with existing slot'
      };
    }

    // Check for overlapping bookings
    const overlappingBooking = existingData.bookings.find(booking => 
      slotData.startTime < booking.endTime && 
      slotData.endTime > booking.startTime
    );

    if (overlappingBooking) {
      return {
        type: 'booking_overlap',
        existingBooking: overlappingBooking,
        newSlot: slotData,
        message: 'Time slot conflicts with existing booking'
      };
    }

    return null;
  }

  /**
   * Resolve conflicts based on resolution strategy
   */
  async resolveConflict(conflict, resolution, slotData) {
    switch (resolution) {
      case 'skip':
        return { action: 'skip', conflict };
      
      case 'overwrite':
        if (conflict.type === 'slot_overlap') {
          await prisma.timeSlot.delete({ where: { id: conflict.existingSlot.id } });
        }
        return { action: 'overwrite' };
      
      case 'merge':
        return { action: 'merge', originalSlot: conflict.existingSlot };
      
      default:
        return { action: 'skip', conflict };
    }
  }

  /**
   * Check for break conflicts
   */
  checkBreakConflicts(slotData, breaks) {
    const conflictingBreak = breaks.find(breakItem => {
      const breakStart = moment(breakItem.startTime, 'HH:mm');
      const breakEnd = moment(breakItem.endTime, 'HH:mm');
      const slotStart = moment(slotData.startTime, 'HH:mm');
      const slotEnd = moment(slotData.endTime, 'HH:mm');

      return slotStart.isBefore(breakEnd) && slotEnd.isAfter(breakStart);
    });

    if (conflictingBreak) {
      return {
        type: 'break_conflict',
        break: conflictingBreak,
        slot: slotData,
        message: 'Time slot conflicts with staff break'
      };
    }

    return null;
  }

  /**
   * Group slots by context for efficient processing
   */
  groupSlotsByContext(slots) {
    const grouped = {};
    
    slots.forEach(slot => {
      const key = `${slot.serviceId}-${slot.date}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(slot);
    });

    return grouped;
  }

  /**
   * Generate summary of processed slots
   */
  generateSummary(processedSlots) {
    const { valid, conflicts } = processedSlots;
    
    return {
      totalProposed: valid.length + conflicts.length,
      totalValid: valid.length,
      totalConflicts: conflicts.length,
      conflictTypes: conflicts.reduce((acc, conflict) => {
        acc[conflict.type] = (acc[conflict.type] || 0) + 1;
        return acc;
      }, {}),
      dateRange: valid.length > 0 ? {
        start: moment.min(valid.map(s => moment(s.date))).format('YYYY-MM-DD'),
        end: moment.max(valid.map(s => moment(s.date))).format('YYYY-MM-DD')
      } : null
    };
  }

  /**
   * Get applied business rules
   */
  getAppliedRules(context) {
    return {
      workingHours: context.business?.workingHours?.length || 0,
      holidays: context.business?.holidays?.length || 0,
      staffBreaks: context.staff?.staff_breaks?.length || 0,
      staffTimeOff: context.staff?.staff_time_off?.length || 0,
      interval: context.interval,
      maxAdvanceDays: context.maxAdvanceDays
    };
  }

  /**
   * Validate input parameters
   */
  async validateInputs(options) {
    const { businessId, serviceId, template, pattern } = options;

    if (!businessId) {
      throw new Error('Business ID is required');
    }

    if (!template) {
      throw new Error('Template type is required');
    }

    if (!pattern || typeof pattern !== 'object') {
      throw new Error('Pattern configuration is required');
    }

    // Validate business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      throw new Error('Business not found');
    }

    // Validate service exists if provided
    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId }
      });

      if (!service) {
        throw new Error('Service not found');
      }

      if (service.businessId !== businessId) {
        throw new Error('Service does not belong to this business');
      }
    }
  }

  /**
   * Generate actual slots from patterns
   */
  async generateActualSlots(slotPatterns, dateRange, context) {
    const actualSlots = [];

    for (const pattern of slotPatterns) {
      if (pattern.date) {
        // Single day pattern
        actualSlots.push(pattern);
      } else if (pattern.dayOfWeek !== undefined) {
        // Weekly pattern - apply to date range
        const { weeks = 1, startDate = moment().format('YYYY-MM-DD') } = dateRange;
        const start = moment(startDate);
        
        for (let week = 0; week < weeks; week++) {
          const weekStart = start.clone().add(week, 'weeks').startOf('week');
          const targetDate = weekStart.clone().add(pattern.dayOfWeek, 'days');
          
          actualSlots.push({
            date: targetDate.format('YYYY-MM-DD'),
            dayOfWeek: pattern.dayOfWeek,
            slots: pattern.slots,
            workingHours: pattern.workingHours
          });
        }
      }
    }

    return actualSlots;
  }

  /**
   * Analyze historical data for smart generation
   */
  async analyzeHistoricalData(context, learningPeriod) {
    const endDate = moment();
    const startDate = endDate.clone().subtract(learningPeriod, 'days');

    const bookings = await prisma.booking.findMany({
      where: {
        businessId: context.business.id,
        serviceId: context.service?.id,
        date: {
          gte: startDate.toDate(),
          lte: endDate.toDate()
        },
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      },
      orderBy: { date: 'asc' }
    });

    return {
      totalBookings: bookings.length,
      peakDays: this.findPeakDays(bookings),
      peakHours: this.findPeakHours(bookings),
      popularTimeSlots: this.findPopularTimeSlots(bookings),
      noShowRate: this.calculateNoShowRate(bookings),
      cancellationRate: this.calculateCancellationRate(bookings),
      revenueByDay: this.calculateRevenueByDay(bookings),
      seasonalTrends: this.findSeasonalTrends(bookings)
    };
  }

  /**
   * Optimize pattern based on insights
   */
  optimizePattern(insights, optimizeFor, context) {
    switch (optimizeFor) {
      case 'availability':
        return this.optimizeForAvailability(insights, context);
      case 'bookings':
        return this.optimizeForBookings(insights, context);
      case 'revenue':
        return this.optimizeForRevenue(insights, context);
      default:
        return this.optimizeForAvailability(insights, context);
    }
  }

  /**
   * Generate recurring slots
   */
  generateRecurringSlots(schedule, recurrenceRule) {
    const { frequency = 'weekly', interval = 1, count = 10 } = recurrenceRule;
    const recurringSlots = [];
    const start = moment(schedule.date);

    for (let i = 1; i < count; i++) {
      const nextDate = start.clone().add(i * interval, frequency);
      
      recurringSlots.push({
        date: nextDate.format('YYYY-MM-DD'),
        dayOfWeek: nextDate.day(),
        slots: schedule.slots,
        workingHours: { 
          startTime: schedule.startTime, 
          endTime: schedule.endTime 
        }
      });
    }

    return recurringSlots;
  }

  /**
   * Generate advanced recurring slots with more options
   */
  generateAdvancedRecurringSlots(baseSchedule, options) {
    const {
      repeatType = 'daily', // daily, weekly, monthly
      repeatCount = 7,
      repeatDays = [1, 2, 3, 4, 5], // days of week (0=Sunday, 1=Monday, etc.)
      excludeWeekends = false,
      excludeHolidays = true,
      startDate,
      endDate
    } = options;

    const recurringSlots = [];
    const start = moment(startDate || baseSchedule.date);
    const end = endDate ? moment(endDate) : start.clone().add(repeatCount, repeatType);

    let currentDate = start.clone();
    let createdCount = 0;

    while (currentDate.isSameOrBefore(end) && createdCount < repeatCount) {
      const dayOfWeek = currentDate.day();
      const dateStr = currentDate.format('YYYY-MM-DD');

      // Check if we should create slots for this day
      let shouldCreate = false;

      switch (repeatType) {
        case 'daily':
          shouldCreate = true;
          break;
        case 'weekly':
          shouldCreate = repeatDays.includes(dayOfWeek);
          break;
        case 'monthly':
          // Create on the same day of month
          shouldCreate = currentDate.date() === start.date();
          break;
      }

      // Apply exclusions
      if (shouldCreate) {
        if (excludeWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
          shouldCreate = false;
        }
        
        if (excludeHolidays) {
          // This would need holiday data from context
          // For now, we'll skip weekends as holidays
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            shouldCreate = false;
          }
        }
      }

      if (shouldCreate) {
        recurringSlots.push({
          date: dateStr,
          dayOfWeek: dayOfWeek,
          slots: baseSchedule.slots,
          workingHours: {
            startTime: baseSchedule.startTime,
            endTime: baseSchedule.endTime
          }
        });
        createdCount++;
      }

      // Move to next date based on repeat type
      switch (repeatType) {
        case 'daily':
          currentDate.add(1, 'day');
          break;
        case 'weekly':
          currentDate.add(1, 'week');
          break;
        case 'monthly':
          currentDate.add(1, 'month');
          break;
      }
    }

    return recurringSlots;
  }

  /**
   * Group slots by date for real-time updates
   */
  groupSlotsByDate(slots) {
    const grouped = {};
    
    slots.forEach(slot => {
      const date = moment(slot.date).format('YYYY-MM-DD');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });

    return grouped;
  }

  /**
   * Find peak days from historical data
   */
  findPeakDays(bookings) {
    const dayCounts = {};
    
    bookings.forEach(booking => {
      const day = moment(booking.date).day();
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    return Object.entries(dayCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day]) => parseInt(day));
  }

  /**
   * Find peak hours from historical data
   */
  findPeakHours(bookings) {
    const hourCounts = {};
    
    bookings.forEach(booking => {
      const hour = moment(booking.startTime, 'HH:mm').hour();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([hour]) => parseInt(hour));
  }

  /**
   * Find popular time slots
   */
  findPopularTimeSlots(bookings) {
    const slotCounts = {};
    
    bookings.forEach(booking => {
      const slot = `${booking.startTime}-${booking.endTime}`;
      slotCounts[slot] = (slotCounts[slot] || 0) + 1;
    });

    return Object.entries(slotCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([slot]) => slot);
  }

  /**
   * Calculate no-show rate
   */
  calculateNoShowRate(bookings) {
    const noShows = bookings.filter(b => b.status === 'NO_SHOW').length;
    return bookings.length > 0 ? (noShows / bookings.length) * 100 : 0;
  }

  /**
   * Calculate cancellation rate
   */
  calculateCancellationRate(bookings) {
    const cancellations = bookings.filter(b => b.status === 'CANCELLED').length;
    return bookings.length > 0 ? (cancellations / bookings.length) * 100 : 0;
  }

  /**
   * Calculate revenue by day
   */
  calculateRevenueByDay(bookings) {
    const revenueByDay = {};
    
    bookings.forEach(booking => {
      const day = moment(booking.date).day();
      revenueByDay[day] = (revenueByDay[day] || 0) + parseFloat(booking.totalAmount);
    });

    return revenueByDay;
  }

  /**
   * Find seasonal trends
   */
  findSeasonalTrends(bookings) {
    const monthlyCounts = {};
    
    bookings.forEach(booking => {
      const month = moment(booking.date).month();
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    return monthlyCounts;
  }

  /**
   * Optimize for availability
   */
  optimizeForAvailability(insights, context) {
    const { peakDays, peakHours } = insights;
    
    // Generate more slots on peak days and peak hours
    const optimizedPattern = {
      daysOfWeek: peakDays.length > 0 ? peakDays : [1, 2, 3, 4, 5],
      startTime: peakHours.length > 0 ? `${peakHours[0]}:00` : '09:00',
      endTime: peakHours.length > 0 ? `${peakHours[peakHours.length - 1] + 1}:00` : '17:00',
      interval: context.interval,
      excludeLunch: true
    };

    return this.generateWeeklyPattern(optimizedPattern, context);
  }

  /**
   * Optimize for bookings
   */
  optimizeForBookings(insights, context) {
    const { popularTimeSlots, peakDays } = insights;
    
    // Use popular time slots and peak days
    const optimizedPattern = {
      daysOfWeek: peakDays.length > 0 ? peakDays : [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '17:00',
      interval: context.interval,
      excludeLunch: true
    };

    return this.generateWeeklyPattern(optimizedPattern, context);
  }

  /**
   * Optimize for revenue
   */
  optimizeForRevenue(insights, context) {
    const { revenueByDay, peakHours } = insights;
    
    // Focus on high-revenue days and peak hours
    const highRevenueDays = Object.entries(revenueByDay)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day]) => parseInt(day));

    const optimizedPattern = {
      daysOfWeek: highRevenueDays.length > 0 ? highRevenueDays : [1, 2, 3, 4, 5],
      startTime: peakHours.length > 0 ? `${peakHours[0]}:00` : '09:00',
      endTime: peakHours.length > 0 ? `${peakHours[peakHours.length - 1] + 1}:00` : '17:00',
      interval: context.interval,
      excludeLunch: true
    };

    return this.generateWeeklyPattern(optimizedPattern, context);
  }
}

module.exports = new TimeSlotCreationService(); 
const { PrismaClient } = require('@prisma/client');
const moment = require('moment');

const prisma = new PrismaClient();

class SlotService {
  constructor() {
    this.defaultInterval = 30; // minutes
    this.maxBookingDays = 90; // days ahead
  }

  /**
   * Generate available time slots following Bookly's hierarchy:
   * 1. Staff Working Hours (highest priority)
   * 2. Service Working Hours (medium priority)
   * 3. Business Working Hours (lowest priority)
   */
  async generateAvailableSlots(businessId, serviceId, date, options = {}) {
    try {
      const {
        interval = this.defaultInterval,
        includeBooked = false,
        maxSlots = 50,
        staffId = null
      } = options;

      // Get business with all related data
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: {
          workingHours: {
            where: { isActive: true },
            orderBy: { dayOfWeek: 'asc' }
          },
          holidays: {
            where: {
              date: new Date(date),
              isActive: true
            }
          }
        }
      });

      if (!business) {
        throw new Error('Business not found');
      }

      // Check if it's a holiday
      if (business.holidays.length > 0) {
        return {
          available: false,
          reason: 'Holiday',
          slots: [],
          holiday: business.holidays[0]
        };
      }

      // Get service details
      const service = await prisma.service.findUnique({
        where: { id: serviceId }
      });

      if (!service || service.businessId !== businessId) {
        throw new Error('Service not found or does not belong to this business');
      }

      // Get staff members assigned to this service
      const staff = await this.getAvailableStaffForService(serviceId, date, staffId);

      // If specific staff requested, use only that staff member
      let availableStaff = staff;
      if (staffId) {
        availableStaff = staff.filter(s => s.id === staffId);
        if (availableStaff.length === 0) {
          return {
            available: false,
            reason: 'Requested staff member not available',
            slots: []
          };
        }
      }

      // Generate slots for each available staff member
      const allSlots = [];
      
      for (const staffMember of availableStaff) {
        const staffSlots = await this.generateStaffSlots(
          businessId,
          serviceId,
          date,
          staffMember,
          service,
          business,
          { interval, includeBooked }
        );
        
        // Add staff information to each slot
        staffSlots.forEach(slot => {
          slot.staffId = staffMember.id;
          slot.staffName = `${staffMember.firstName} ${staffMember.lastName}`;
          slot.staffSpecialization = staffMember.specialization;
        });
        
        allSlots.push(...staffSlots);
      }

      // If no slots were generated for any staff member, try to generate default slots
      if (allSlots.length === 0) {
        console.warn('No slots generated for any staff member, generating default slots');
        
        // Generate default slots using business working hours
        const dayOfWeek = new Date(date).getDay();
        const businessWorkingHour = business.workingHours.find(wh => 
          wh.dayOfWeek === dayOfWeek && wh.isActive
        );
        
        if (businessWorkingHour) {
          const defaultSlots = this.generateTimeSlots(
            businessWorkingHour.startTime,
            businessWorkingHour.endTime,
            interval,
            service.duration
          );
          
          // Add default staff information
          defaultSlots.forEach(slot => {
            slot.staffId = 'default';
            slot.staffName = 'Any Staff';
            slot.staffSpecialization = 'General';
            slot.workingHoursSource = 'business';
          });
          
          allSlots.push(...defaultSlots);
        }
      }

      // Sort slots by start time
      const sortedSlots = allSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

      // Remove duplicates and limit slots
      const uniqueSlots = this.removeDuplicateSlots(sortedSlots);
      const limitedSlots = maxSlots ? uniqueSlots.slice(0, maxSlots) : uniqueSlots;

      return {
        available: limitedSlots.length > 0,
        business: {
          id: business.id,
          name: business.name,
          phone: business.phone
        },
        service: {
          id: service.id,
          name: service.name,
          duration: service.duration,
          price: service.price
        },
        date: date,
        slots: limitedSlots,
        totalAvailable: limitedSlots.filter(s => s.isAvailable).length,
        totalBooked: limitedSlots.filter(s => !s.isAvailable).length,
        staffOptions: availableStaff.map(s => ({
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
          specialization: s.specialization
        }))
      };
    } catch (error) {
      console.error('Error generating available slots:', error);
      throw error;
    }
  }

  /**
   * Generate time slots for a specific staff member following Bookly's hierarchy
   */
  async generateStaffSlots(businessId, serviceId, date, staff, service, business, options = {}) {
    const { interval = this.defaultInterval, includeBooked = false } = options;
    
    const dayOfWeek = new Date(date).getDay();
    
    // Step 1: Determine working hours using Bookly's hierarchy
    const workingHours = this.getWorkingHoursHierarchy(staff, service, business, dayOfWeek);
    
    if (!workingHours) {
      return []; // No working hours defined for this day
    }

    // Step 2: Generate all possible time slots
    const allSlots = this.generateTimeSlots(
      workingHours.startTime,
      workingHours.endTime,
      interval,
      service.duration
    );
      
    // Step 3: Apply staff breaks
    const slotsWithBreaks = this.applyStaffBreaks(allSlots, staff.staff_breaks, dayOfWeek);

    // Step 4: Get booked slots for this staff member
    const bookedSlots = await this.getStaffBookedSlots(businessId, serviceId, date, staff.id);

    // Step 5: Filter out conflicting slots
    const availableSlots = this.filterAvailableSlots(slotsWithBreaks, bookedSlots, service.duration);

    return availableSlots.map(slot => ({
      ...slot,
      price: this.getStaffServicePrice(staff, serviceId, service.price),
      duration: service.duration,
      workingHoursSource: workingHours.source
    }));
  }

  /**
   * Get working hours following Bookly's hierarchy:
   * 1. Staff Working Hours (highest priority)
   * 2. Service Working Hours (medium priority)
   * 3. Business Working Hours (lowest priority)
   */
  getWorkingHoursHierarchy(staff, service, business, dayOfWeek) {
    // Priority 1: Staff Working Hours
    const staffWorkingHour = staff.staff_working_hours.find(wh => 
      wh.dayOfWeek === dayOfWeek && wh.isActive
    );
    
    if (staffWorkingHour) {
      return {
        startTime: staffWorkingHour.startTime,
        endTime: staffWorkingHour.endTime,
        source: 'staff'
      };
    }

    // Priority 2: Service Working Hours (skipped - not implemented in current schema)
    // Services inherit working hours from business level

    // Priority 3: Business Working Hours
    const businessWorkingHour = business.workingHours.find(wh => 
      wh.dayOfWeek === dayOfWeek && wh.isActive
    );
    
    if (businessWorkingHour) {
      return {
        startTime: businessWorkingHour.startTime,
        endTime: businessWorkingHour.endTime,
        source: 'business'
      };
    }

    // If no working hours found, return default business hours for the day
    // This ensures we always have some working hours to generate slots
    console.warn(`No working hours found for day ${dayOfWeek}, using default business hours`);
    
    // Default business hours (9 AM to 6 PM)
    const defaultHours = {
      0: { startTime: '09:00', endTime: '18:00' }, // Sunday
      1: { startTime: '09:00', endTime: '18:00' }, // Monday
      2: { startTime: '09:00', endTime: '18:00' }, // Tuesday
      3: { startTime: '09:00', endTime: '18:00' }, // Wednesday
      4: { startTime: '09:00', endTime: '18:00' }, // Thursday
      5: { startTime: '09:00', endTime: '18:00' }, // Friday
      6: { startTime: '09:00', endTime: '16:00' }  // Saturday
    };

    const defaultHour = defaultHours[dayOfWeek];
    if (defaultHour) {
      return {
        startTime: defaultHour.startTime,
        endTime: defaultHour.endTime,
        source: 'default'
      };
    }

    return null; // No working hours found
  }

  /**
   * Get available staff for a service on a specific date
   */
  async getAvailableStaffForService(serviceId, date, specificStaffId = null) {
    const whereClause = {
      isActive: true,
      staff_services: {
        some: {
          serviceId: serviceId
        }
      }
    };

    if (specificStaffId) {
      whereClause.id = specificStaffId;
      }

    const staff = await prisma.staff.findMany({
      where: whereClause,
      include: {
        staff_services: {
          where: {
            serviceId: serviceId
          }
        },
        staff_working_hours: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' }
        },
        staff_breaks: {
          where: { isActive: true }
        },
        staff_time_off: {
          where: {
            startDate: { lte: new Date(date) },
            endDate: { gte: new Date(date) }
          }
        }
      },
      orderBy: { firstName: 'asc' }
    });

    // Filter out staff who are on time off
    return staff.filter(member => member.staff_time_off.length === 0);
  }

  /**
   * Apply staff breaks to time slots
   */
  applyStaffBreaks(slots, breaks, dayOfWeek) {
    const dayBreaks = breaks.filter(b => b.dayOfWeek === dayOfWeek && b.isActive);
    
    if (dayBreaks.length === 0) {
    return slots;
  }

    return slots.filter(slot => {
      return !dayBreaks.some(breakTime => {
        const slotStart = moment(slot.startTime, 'HH:mm');
        const slotEnd = moment(slot.endTime, 'HH:mm');
        const breakStart = moment(breakTime.startTime, 'HH:mm');
        const breakEnd = moment(breakTime.endTime, 'HH:mm');

        // Check if slot overlaps with break time
        return slotStart.isBefore(breakEnd) && slotEnd.isAfter(breakStart);
      });
    });
  }

  /**
   * Get booked slots for a specific staff member
   */
  async getStaffBookedSlots(businessId, serviceId, date, staffId) {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          businessId,
          staffId,
          date: new Date(date),
          status: { in: ['PENDING', 'CONFIRMED'] }
        },
        select: {
          startTime: true,
          endTime: true,
          status: true
        },
        orderBy: { startTime: 'asc' }
      });

      return bookings.map(booking => ({
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status
      }));
    } catch (error) {
      console.error('Error getting staff booked slots:', error);
      return [];
    }
  }

  /**
   * Get staff-specific service price
   */
  getStaffServicePrice(staff, serviceId, defaultPrice) {
    const staffService = staff.staff_services.find(s => s.serviceId === serviceId);
    return staffService?.customPrice || defaultPrice;
  }

  /**
   * Generate time slots between start and end time
   */
  generateTimeSlots(startTime, endTime, intervalMinutes, serviceDuration) {
    const slots = [];
    const start = moment(startTime, 'HH:mm');
    const end = moment(endTime, 'HH:mm');

    while (start.isBefore(end)) {
      const slotStart = start.format('HH:mm');
      
      // Calculate slot end time based on service duration
      const slotEnd = start.clone().add(serviceDuration, 'minutes');
      const slotEndTime = slotEnd.format('HH:mm');

      // Check if slot fits within working hours
      if (slotEnd.isSameOrBefore(end)) {
        slots.push({
          startTime: slotStart,
          endTime: slotEndTime,
          duration: serviceDuration,
          isAvailable: true
        });
      }

      // Move to next slot based on interval
      start.add(intervalMinutes, 'minutes');
    }

    return slots;
  }

  /**
   * Filter available slots by removing conflicts
   */
  filterAvailableSlots(allSlots, bookedSlots, serviceDuration) {
    return allSlots.map(slot => {
      const isBooked = bookedSlots.some(booked => {
        const slotStart = moment(slot.startTime, 'HH:mm');
        const slotEnd = moment(slot.endTime, 'HH:mm');
        const bookedStart = moment(booked.startTime, 'HH:mm');
        const bookedEnd = moment(booked.endTime, 'HH:mm');

        // Check for time overlap
        return slotStart.isBefore(bookedEnd) && slotEnd.isAfter(bookedStart);
      });

      return {
        ...slot,
        isAvailable: !isBooked,
        isBooked: isBooked
      };
    });
  }

  /**
   * Remove duplicate time slots
   */
  removeDuplicateSlots(slots) {
    const seen = new Set();
    return slots.filter(slot => {
      const key = `${slot.startTime}-${slot.endTime}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Get detailed availability for a specific service and date
   */
  async getDetailedAvailability(businessId, serviceId, date, options = {}) {
    const { staffId = null, includeUnavailable = false } = options;
    
    try {
      const result = await this.generateAvailableSlots(businessId, serviceId, date, {
        staffId,
        includeBooked: includeUnavailable,
        maxSlots: 100
      });

      // Group slots by staff if multiple staff members
      const slotsByStaff = {};
      result.slots.forEach(slot => {
        if (!slotsByStaff[slot.staffId]) {
          slotsByStaff[slot.staffId] = {
            staffId: slot.staffId,
            staffName: slot.staffName,
            staffSpecialization: slot.staffSpecialization,
            slots: []
          };
        }
        slotsByStaff[slot.staffId].slots.push(slot);
      });

      return {
        ...result,
        slotsByStaff: Object.values(slotsByStaff),
        summary: {
          totalSlots: result.slots.length,
          availableSlots: result.totalAvailable,
          bookedSlots: result.totalBooked,
          staffCount: Object.keys(slotsByStaff).length
        }
      };
    } catch (error) {
      console.error('Error getting detailed availability:', error);
      throw error;
    }
  }

  /**
   * Book a time slot for a specific staff member
   */
  async bookTimeSlot(businessId, serviceId, staffId, date, startTime, endTime, bookingData) {
    try {
      // Validate that the slot is available
      const availability = await this.generateAvailableSlots(businessId, serviceId, date, {
        staffId,
        maxSlots: 1000
      });

      const requestedSlot = availability.slots.find(slot => 
        slot.startTime === startTime && 
        slot.endTime === endTime && 
        slot.staffId === staffId
      );

      if (!requestedSlot) {
        throw new Error('Requested time slot not found');
      }

      if (!requestedSlot.isAvailable) {
        throw new Error('Requested time slot is not available');
      }

      // Create the booking
      const booking = await prisma.booking.create({
        data: {
          businessId,
          serviceId,
          staffId,
          date: new Date(date),
          startTime,
          endTime,
          ...bookingData
        },
        include: {
          business: { select: { name: true } },
          service: { select: { name: true, duration: true } },
          staff: { select: { firstName: true, lastName: true } }
        }
      });

      return {
        success: true,
        booking,
        slot: requestedSlot
      };
    } catch (error) {
      console.error('Error booking time slot:', error);
      throw error;
    }
  }

  // Get weekly availability for a business
  async getWeeklyAvailability(businessId, startDate = null, days = 7) {
    try {
      const start = startDate ? moment(startDate) : moment();
      const availability = [];

      for (let i = 0; i < days; i++) {
        const date = start.clone().add(i, 'days');
        const dayOfWeek = date.day();
        
        // Get working hours for this day
        const workingHour = await prisma.workingHour.findFirst({
          where: {
            businessId,
            dayOfWeek,
            isActive: true
          }
        });

        // Check if it's a holiday
        const holiday = await prisma.holiday.findFirst({
          where: {
            businessId,
            date: date.toDate(),
            isActive: true
          }
        });

        let status = 'closed';
        let workingHours = null;
        let holidayInfo = null;

        if (holiday) {
          status = 'holiday';
          holidayInfo = {
            reason: holiday.reason
          };
        } else if (workingHour) {
          status = 'open';
          workingHours = {
            startTime: workingHour.startTime,
            endTime: workingHour.endTime
          };
        }

        availability.push({
          date: date.format('YYYY-MM-DD'),
          dayOfWeek,
          dayName: date.format('dddd'),
          status,
          workingHours,
          holiday: holidayInfo
        });
      }

      return availability;
    } catch (error) {
      console.error('Error getting weekly availability:', error);
      throw error;
    }
  }

  // Check if a specific time slot is available
  async isSlotAvailable(businessId, serviceId, date, startTime, endTime) {
    try {
      // Check if business is open on this date
      const dayOfWeek = new Date(date).getDay();
      const workingHour = await prisma.workingHour.findFirst({
        where: {
          businessId,
          dayOfWeek,
          isActive: true
        }
      });

      if (!workingHour) {
        return { available: false, reason: 'Business closed on this day' };
      }

      // Check if slot is within working hours
      if (startTime < workingHour.startTime || endTime > workingHour.endTime) {
        return { available: false, reason: 'Slot outside working hours' };
      }

      // Check for holidays
      const holiday = await prisma.holiday.findFirst({
        where: {
          businessId,
          date: new Date(date),
          isActive: true
        }
      });

      if (holiday) {
        return { available: false, reason: 'Holiday' };
      }

      // Check for conflicting bookings
      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          businessId,
          serviceId,
          date: new Date(date),
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

      if (conflictingBooking) {
        return { available: false, reason: 'Slot already booked' };
      }

      return { available: true };
    } catch (error) {
      console.error('Error checking slot availability:', error);
      throw error;
    }
  }

  // Get business capacity for a specific date
  async getBusinessCapacity(businessId, date) {
    try {
      const dayOfWeek = new Date(date).getDay();
      
      // Get working hours
      const workingHour = await prisma.workingHour.findFirst({
        where: {
          businessId,
          dayOfWeek,
          isActive: true
        }
      });

      if (!workingHour) {
        return { totalSlots: 0, availableSlots: 0, bookedSlots: 0 };
      }

      // Get all services for the business
      const services = await prisma.service.findMany({
        where: {
          businessId,
          isActive: true
        },
        select: { id: true, duration: true }
      });

      let totalSlots = 0;
      let bookedSlots = 0;

      for (const service of services) {
        const slots = this.generateTimeSlots(
          workingHour.startTime,
          workingHour.endTime,
          this.defaultInterval,
          service.duration
        );

        totalSlots += slots.length;

        // Count booked slots for this service
        const booked = await prisma.booking.count({
          where: {
            businessId,
            serviceId: service.id,
            date: new Date(date),
            status: { in: ['PENDING', 'CONFIRMED'] }
          }
        });

        bookedSlots += booked;
      }

      return {
        totalSlots,
        availableSlots: totalSlots - bookedSlots,
        bookedSlots,
        utilizationRate: totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting business capacity:', error);
      throw error;
    }
  }

  // Optimize slot intervals based on business patterns
  async optimizeSlotIntervals(businessId, serviceId) {
    try {
      // Get recent booking patterns
      const recentBookings = await prisma.booking.findMany({
        where: {
          businessId,
          serviceId,
          createdAt: {
            gte: moment().subtract(30, 'days').toDate()
          }
        },
        select: {
          startTime: true,
          endTime: true,
          date: true
        }
      });

      if (recentBookings.length === 0) {
        return this.defaultInterval;
      }

      // Analyze booking patterns to suggest optimal interval
      // This is a simplified version - you could implement more sophisticated analysis
      const intervals = [15, 30, 45, 60];
      const utilizationRates = [];

      for (const interval of intervals) {
        const rate = this.calculateUtilizationRate(recentBookings, interval);
        utilizationRates.push({ interval, rate });
      }

      // Return interval with highest utilization rate
      const optimal = utilizationRates.reduce((prev, current) => 
        current.rate > prev.rate ? current : prev
      );

      return optimal.interval;
    } catch (error) {
      console.error('Error optimizing slot intervals:', error);
      return this.defaultInterval;
    }
  }

  // Calculate utilization rate for a given interval
  calculateUtilizationRate(bookings, interval) {
    // Simplified calculation - you could implement more sophisticated logic
    const totalPossibleSlots = bookings.length * (60 / interval);
    const actualBookings = bookings.length;
    
    return actualBookings / totalPossibleSlots;
  }
}

module.exports = new SlotService(); 
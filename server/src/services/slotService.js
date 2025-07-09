const { PrismaClient } = require('@prisma/client');
const moment = require('moment');

const prisma = new PrismaClient();

class SlotService {
  constructor() {
    this.defaultInterval = 30; // minutes
    this.maxBookingDays = 90; // days ahead
  }

  // Generate available time slots for a business on a specific date
  async generateAvailableSlots(businessId, serviceId, date, options = {}) {
    try {
      const {
        interval = this.defaultInterval,
        includeBooked = false,
        maxSlots = 50
      } = options;

      // Get business with working hours and holidays
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

      // Get working hours for the day
      const dayOfWeek = new Date(date).getDay();
      const workingHour = business.workingHours.find(wh => wh.dayOfWeek === dayOfWeek);

      if (!workingHour) {
        return {
          available: false,
          reason: 'Closed',
          slots: []
        };
      }

      // Get service details
      const service = await prisma.service.findUnique({
        where: { id: serviceId }
      });

      if (!service || service.businessId !== businessId) {
        throw new Error('Service not found or does not belong to this business');
      }

      // Generate all possible slots
      const allSlots = this.generateTimeSlots(
        workingHour.startTime,
        workingHour.endTime,
        interval,
        service.duration
      );

      // Get booked slots for this date and service
      const bookedSlots = await this.getBookedSlots(businessId, serviceId, date);

      // Filter out conflicting slots
      const availableSlots = this.filterAvailableSlots(allSlots, bookedSlots, service.duration);

      // Limit number of slots if specified
      const limitedSlots = maxSlots ? availableSlots.slice(0, maxSlots) : availableSlots;

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
        workingHours: {
          startTime: workingHour.startTime,
          endTime: workingHour.endTime
        },
        slots: includeBooked ? {
          available: limitedSlots,
          booked: bookedSlots
        } : limitedSlots,
        totalAvailable: availableSlots.length,
        totalBooked: bookedSlots.length
      };
    } catch (error) {
      console.error('Error generating available slots:', error);
      throw error;
    }
  }

  // Generate time slots between start and end time
  generateTimeSlots(startTime, endTime, intervalMinutes, serviceDuration) {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    while (start < end) {
      const slotStart = start.toTimeString().slice(0, 5);
      
      // Calculate slot end time
      const slotEnd = new Date(start.getTime() + (serviceDuration * 60 * 1000));
      const slotEndTime = slotEnd.toTimeString().slice(0, 5);

      // Check if slot fits within working hours
      if (slotEnd <= end) {
        slots.push({
          startTime: slotStart,
          endTime: slotEndTime,
          duration: serviceDuration
        });
      }

      // Move to next slot
      start.setMinutes(start.getMinutes() + intervalMinutes);
    }

    return slots;
  }

  // Get booked slots for a specific date and service
  async getBookedSlots(businessId, serviceId, date) {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          businessId,
          serviceId,
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
      console.error('Error getting booked slots:', error);
      return [];
    }
  }

  // Filter available slots by removing conflicting ones
  filterAvailableSlots(allSlots, bookedSlots, serviceDuration) {
    return allSlots.filter(slot => {
      // Check if slot conflicts with any booked slot
      return !bookedSlots.some(booked => {
        return this.slotsOverlap(slot, booked);
      });
    });
  }

  // Check if two time slots overlap
  slotsOverlap(slot1, slot2) {
    const slot1Start = new Date(`2000-01-01T${slot1.startTime}`);
    const slot1End = new Date(`2000-01-01T${slot1.endTime}`);
    const slot2Start = new Date(`2000-01-01T${slot2.startTime}`);
    const slot2End = new Date(`2000-01-01T${slot2.endTime}`);

    return slot1Start < slot2End && slot1End > slot2Start;
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
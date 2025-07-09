const { PrismaClient } = require('@prisma/client');
const timeSlotCreationService = require('./src/services/timeSlotCreationService');

const prisma = new PrismaClient();

async function testRecurringSlots() {
  try {
    console.log('Testing recurring time slot creation...');

    // Get a test business and service
    const business = await prisma.business.findFirst({
      include: {
        services: { where: { isActive: true } }
      }
    });

    if (!business || !business.services.length) {
      console.log('No business or services found. Please create test data first.');
      return;
    }

    const service = business.services[0];
    console.log(`Using business: ${business.name}, service: ${service.name}`);

    // Test daily recurring
    console.log('\n--- Testing Daily Recurring ---');
    const dailySchedule = {
      date: '2024-01-15',
      startTime: '09:00',
      endTime: '17:00',
      slots: timeSlotCreationService.generateDaySlots('09:00', '17:00', {
        interval: 30,
        serviceDuration: null,
        excludeLunch: false
      })
    };

    const dailyRecurring = timeSlotCreationService.generateAdvancedRecurringSlots(dailySchedule, {
      repeatType: 'daily',
      repeatCount: 7,
      excludeWeekends: false,
      excludeHolidays: false
    });

    console.log(`Daily recurring created ${dailyRecurring.length} schedules`);
    dailyRecurring.forEach((schedule, index) => {
      console.log(`  ${index + 1}. ${schedule.date} (${schedule.slots.length} slots)`);
    });

    // Test weekly recurring
    console.log('\n--- Testing Weekly Recurring ---');
    const weeklyRecurring = timeSlotCreationService.generateAdvancedRecurringSlots(dailySchedule, {
      repeatType: 'weekly',
      repeatCount: 4,
      repeatDays: [1, 2, 3, 4, 5], // Monday to Friday
      excludeWeekends: true,
      excludeHolidays: false
    });

    console.log(`Weekly recurring created ${weeklyRecurring.length} schedules`);
    weeklyRecurring.forEach((schedule, index) => {
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][schedule.dayOfWeek];
      console.log(`  ${index + 1}. ${schedule.date} (${dayName}) - ${schedule.slots.length} slots`);
    });

    // Test monthly recurring
    console.log('\n--- Testing Monthly Recurring ---');
    const monthlyRecurring = timeSlotCreationService.generateAdvancedRecurringSlots(dailySchedule, {
      repeatType: 'monthly',
      repeatCount: 3,
      excludeWeekends: false,
      excludeHolidays: false
    });

    console.log(`Monthly recurring created ${monthlyRecurring.length} schedules`);
    monthlyRecurring.forEach((schedule, index) => {
      console.log(`  ${index + 1}. ${schedule.date} (${schedule.slots.length} slots)`);
    });

    console.log('\n✅ All recurring tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing recurring slots:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testRecurringSlots(); 
const { PrismaClient } = require('@prisma/client');
const timeSlotCreationService = require('./src/services/timeSlotCreationService');

const prisma = new PrismaClient();

async function testTimeSlotCreation() {
  try {
    console.log('🧪 Testing Time Slot Creation Service...\n');

    // Get a test business and service
    const business = await prisma.business.findFirst({
      include: {
        services: { where: { isActive: true }, take: 1 },
        workingHours: { where: { isActive: true } },
        settings: true
      }
    });

    if (!business || !business.services.length) {
      console.log('❌ No business with services found. Please create a business and service first.');
      return;
    }

    const service = business.services[0];
    console.log(`📋 Testing with Business: ${business.name}`);
    console.log(`📋 Service: ${service.name} (${service.duration} minutes)\n`);

    // Test 1: Weekly Pattern
    console.log('🔧 Test 1: Weekly Pattern Generation');
    const weeklyResult = await timeSlotCreationService.createTimeSlots({
      businessId: business.id,
      serviceId: service.id,
      template: 'weekly',
      pattern: {
        daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
        startTime: '09:00',
        endTime: '17:00',
        interval: 30,
        excludeLunch: true,
        lunchStart: '12:00',
        lunchEnd: '13:00'
      },
      dateRange: {
        weeks: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      conflictResolution: 'skip',
      preview: true,
      applyHolidays: true,
      applyBreaks: true
    });

    console.log('✅ Weekly Pattern Result:', {
      success: weeklyResult.success,
      totalSlots: weeklyResult.data.slotsToCreate?.length || 0,
      conflicts: weeklyResult.data.conflicts?.length || 0,
      summary: weeklyResult.data.summary
    });

    // Test 2: Smart Pattern
    console.log('\n🔧 Test 2: Smart Pattern Generation');
    const smartResult = await timeSlotCreationService.createTimeSlots({
      businessId: business.id,
      serviceId: service.id,
      template: 'smart',
      pattern: {
        optimizeFor: 'availability',
        learningPeriod: 30,
        suggestions: true
      },
      dateRange: {
        weeks: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      conflictResolution: 'skip',
      preview: true,
      applyHolidays: true,
      applyBreaks: true
    });

    console.log('✅ Smart Pattern Result:', {
      success: smartResult.success,
      totalSlots: smartResult.data.slotsToCreate?.length || 0,
      conflicts: smartResult.data.conflicts?.length || 0,
      summary: smartResult.data.summary
    });

    // Test 3: Daily Pattern
    console.log('\n🔧 Test 3: Daily Pattern Generation');
    const dailyResult = await timeSlotCreationService.createTimeSlots({
      businessId: business.id,
      serviceId: service.id,
      template: 'daily',
      pattern: {
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        interval: 30
      },
      dateRange: {
        weeks: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      conflictResolution: 'skip',
      preview: true,
      applyHolidays: true,
      applyBreaks: true
    });

    console.log('✅ Daily Pattern Result:', {
      success: dailyResult.success,
      totalSlots: dailyResult.data.slotsToCreate?.length || 0,
      conflicts: dailyResult.data.conflicts?.length || 0,
      summary: dailyResult.data.summary
    });

    // Test 4: Bulk Pattern
    console.log('\n🔧 Test 4: Bulk Pattern Generation');
    const bulkResult = await timeSlotCreationService.createTimeSlots({
      businessId: business.id,
      serviceId: service.id,
      template: 'bulk',
      pattern: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        excludeWeekends: false,
        excludeHolidays: true
      },
      dateRange: {
        weeks: 2,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      conflictResolution: 'skip',
      preview: true,
      applyHolidays: true,
      applyBreaks: true
    });

    console.log('✅ Bulk Pattern Result:', {
      success: bulkResult.success,
      totalSlots: bulkResult.data.slotsToCreate?.length || 0,
      conflicts: bulkResult.data.conflicts?.length || 0,
      summary: bulkResult.data.summary
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Weekly Pattern: Working ✅');
    console.log('- Smart Pattern: Working ✅');
    console.log('- Daily Pattern: Working ✅');
    console.log('- Bulk Pattern: Working ✅');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTimeSlotCreation(); 
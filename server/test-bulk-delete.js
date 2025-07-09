const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBulkDelete() {
  try {
    console.log('Testing bulk delete endpoint...');

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

    // Get some time slots for this service
    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        serviceId: service.id,
        isBooked: false // Only get available slots
      },
      take: 5 // Get first 5 slots
    });

    if (timeSlots.length === 0) {
      console.log('No time slots found for this service. Creating some test slots...');
      
      // Create some test slots
      const testSlots = [];
      for (let i = 0; i < 3; i++) {
        const slot = await prisma.timeSlot.create({
          data: {
            serviceId: service.id,
            date: new Date(),
            startTime: `09:${i.toString().padStart(2, '0')}:00`,
            endTime: `10:${i.toString().padStart(2, '0')}:00`,
            isAvailable: true,
            isBooked: false,
            capacity: 0,
            maxCapacity: 1,
            isPeakHour: false,
            serviceDuration: 60,
            intervalMinutes: 30
          }
        });
        testSlots.push(slot);
      }
      
      console.log(`Created ${testSlots.length} test slots`);
      timeSlots.push(...testSlots);
    }

    console.log(`Found ${timeSlots.length} time slots`);
    timeSlots.forEach((slot, index) => {
      console.log(`  ${index + 1}. ID: ${slot.id}, Time: ${slot.startTime}-${slot.endTime}, Date: ${slot.date}`);
    });

    // Test the slot lookup that the endpoint does
    const slotIds = timeSlots.map(s => s.id);
    console.log('\nTesting slot lookup with IDs:', slotIds);

    const foundSlots = await prisma.timeSlot.findMany({
      where: {
        id: { in: slotIds },
      },
      include: {
        service: {
          include: {
            business: true,
          },
        },
      },
    });

    console.log(`Found ${foundSlots.length} slots with service data`);
    foundSlots.forEach((slot, index) => {
      console.log(`  ${index + 1}. ID: ${slot.id}, Service: ${slot.service?.name || 'NO SERVICE'}, Business: ${slot.service?.business?.name || 'NO BUSINESS'}`);
    });

    // Check for slots without services
    const slotsWithoutServices = foundSlots.filter(slot => !slot.service);
    if (slotsWithoutServices.length > 0) {
      console.log('\n⚠️  Found slots without services:');
      slotsWithoutServices.forEach(slot => {
        console.log(`  - Slot ID: ${slot.id}, Service ID: ${slot.serviceId}`);
      });
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing bulk delete:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testBulkDelete(); 
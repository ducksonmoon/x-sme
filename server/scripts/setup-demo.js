const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupDemo() {
  try {
    console.log('🚀 Setting up demo data...');

    // Create demo business
    const business = await prisma.business.upsert({
      where: { id: 'demo-business-123' },
      update: {},
      create: {
        id: 'demo-business-123',
        name: 'Demo Beauty Salon',
        description: 'A demo beauty salon for testing',
        phone: '+989123456789',
        email: 'info@demo-beauty.ir',
        address: 'Tehran, Iran',
        website: 'https://demo-beauty.ir',
        isActive: true
      }
    });

    console.log('✅ Created demo business:', business.name);

    // Create business settings
    const settings = await prisma.businessSettings.upsert({
      where: { businessId: business.id },
      update: {},
      create: {
        businessId: business.id,
        advanceBookingDays: 30,
        bufferBetweenSlots: 15,
        includeLunchBreak: true,
        lunchBreakStart: '12:00',
        lunchBreakEnd: '13:00',
        maxBookingsPerSlot: 1,
        maxSlotsPerDay: 20,
        optimizeForPeakHours: true,
        peakHoursStart: '10:00',
        peakHoursEnd: '16:00',
        respectWorkingHours: true,
        sameDayBooking: true,
        useServiceDuration: true
      }
    });

    console.log('✅ Created business settings');

    // Create demo services
    const services = await Promise.all([
      prisma.service.upsert({
        where: { id: 'service-1' },
        update: {},
        create: {
          id: 'service-1',
          businessId: business.id,
          name: 'Haircut',
          description: 'Professional haircut service',
          duration: 60,
          price: 150000,
          isActive: true
        }
      }),
      prisma.service.upsert({
        where: { id: 'service-2' },
        update: {},
        create: {
          id: 'service-2',
          businessId: business.id,
          name: 'Manicure',
          description: 'Professional manicure service',
          duration: 45,
          price: 80000,
          isActive: true
        }
      }),
      prisma.service.upsert({
        where: { id: 'service-3' },
        update: {},
        create: {
          id: 'service-3',
          businessId: business.id,
          name: 'Facial',
          description: 'Professional facial treatment',
          duration: 90,
          price: 200000,
          isActive: true
        }
      })
    ]);

    console.log('✅ Created', services.length, 'services');

    // Create demo working hours for business
    const workingHours = await Promise.all([
      // Sunday
      prisma.workingHour.upsert({
        where: { businessId_dayOfWeek: { businessId: business.id, dayOfWeek: 0 } },
        update: {},
        create: {
          businessId: business.id,
          dayOfWeek: 0,
          startTime: '09:00',
          endTime: '18:00',
          isActive: true
        }
      }),
      // Monday
      prisma.workingHour.upsert({
        where: { businessId_dayOfWeek: { businessId: business.id, dayOfWeek: 1 } },
        update: {},
        create: {
          businessId: business.id,
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '18:00',
          isActive: true
        }
      }),
      // Tuesday
      prisma.workingHour.upsert({
        where: { businessId_dayOfWeek: { businessId: business.id, dayOfWeek: 2 } },
        update: {},
        create: {
          businessId: business.id,
          dayOfWeek: 2,
          startTime: '09:00',
          endTime: '18:00',
          isActive: true
        }
      }),
      // Wednesday
      prisma.workingHour.upsert({
        where: { businessId_dayOfWeek: { businessId: business.id, dayOfWeek: 3 } },
        update: {},
        create: {
          businessId: business.id,
          dayOfWeek: 3,
          startTime: '09:00',
          endTime: '18:00',
          isActive: true
        }
      }),
      // Thursday
      prisma.workingHour.upsert({
        where: { businessId_dayOfWeek: { businessId: business.id, dayOfWeek: 4 } },
        update: {},
        create: {
          businessId: business.id,
          dayOfWeek: 4,
          startTime: '09:00',
          endTime: '18:00',
          isActive: true
        }
      }),
      // Friday
      prisma.workingHour.upsert({
        where: { businessId_dayOfWeek: { businessId: business.id, dayOfWeek: 5 } },
        update: {},
        create: {
          businessId: business.id,
          dayOfWeek: 5,
          startTime: '09:00',
          endTime: '18:00',
          isActive: true
        }
      }),
      // Saturday
      prisma.workingHour.upsert({
        where: { businessId_dayOfWeek: { businessId: business.id, dayOfWeek: 6 } },
        update: {},
        create: {
          businessId: business.id,
          dayOfWeek: 6,
          startTime: '09:00',
          endTime: '16:00',
          isActive: true
        }
      })
    ]);

    console.log('✅ Created working hours for', workingHours.length, 'days');

    // Create demo staff members
    const staffMembers = await Promise.all([
      prisma.staff.upsert({
        where: { id: 'staff-1' },
        update: {},
        create: {
          id: 'staff-1',
          businessId: business.id,
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah@demo-beauty.ir',
          phone: '+989123456790',
          specialization: 'Hair Stylist',
          bio: 'Experienced hair stylist with 5 years of experience',
          experience: '5 years',
          isActive: true
        }
      }),
      prisma.staff.upsert({
        where: { id: 'staff-2' },
        update: {},
        create: {
          id: 'staff-2',
          businessId: business.id,
          firstName: 'Maria',
          lastName: 'Garcia',
          email: 'maria@demo-beauty.ir',
          phone: '+989123456791',
          specialization: 'Nail Technician',
          bio: 'Professional nail technician specializing in manicures and pedicures',
          experience: '3 years',
          isActive: true
        }
      }),
      prisma.staff.upsert({
        where: { id: 'staff-3' },
        update: {},
        create: {
          id: 'staff-3',
          businessId: business.id,
          firstName: 'Emma',
          lastName: 'Wilson',
          email: 'emma@demo-beauty.ir',
          phone: '+989123456792',
          specialization: 'Facial Specialist',
          bio: 'Certified facial specialist with expertise in skin treatments',
          experience: '4 years',
          isActive: true
        }
      })
    ]);

    console.log('✅ Created', staffMembers.length, 'staff members');

    // Assign services to staff members
    await Promise.all([
      // Sarah - Haircut
      prisma.staffService.upsert({
        where: { staffId_serviceId: { staffId: 'staff-1', serviceId: 'service-1' } },
        update: {},
        create: {
          staffId: 'staff-1',
          serviceId: 'service-1',
          customPrice: 150000,
          isActive: true
        }
      }),
      // Maria - Manicure
      prisma.staffService.upsert({
        where: { staffId_serviceId: { staffId: 'staff-2', serviceId: 'service-2' } },
        update: {},
        create: {
          staffId: 'staff-2',
          serviceId: 'service-2',
          customPrice: 80000,
          isActive: true
        }
      }),
      // Emma - Facial
      prisma.staffService.upsert({
        where: { staffId_serviceId: { staffId: 'staff-3', serviceId: 'service-3' } },
        update: {},
        create: {
          staffId: 'staff-3',
          serviceId: 'service-3',
          customPrice: 200000,
          isActive: true
        }
      })
    ]);

    console.log('✅ Assigned services to staff members');

    // Create working hours for staff members (inheriting from business)
    const staffWorkingHours = [];
    
    for (const staff of staffMembers) {
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const businessHour = workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
        if (businessHour) {
          staffWorkingHours.push({
            staffId: staff.id,
            dayOfWeek,
            startTime: businessHour.startTime,
            endTime: businessHour.endTime,
            isActive: true
          });
        }
      }
    }

    // Create staff working hours
    for (const staffHour of staffWorkingHours) {
      await prisma.staffWorkingHour.upsert({
        where: { staffId_dayOfWeek: { staffId: staffHour.staffId, dayOfWeek: staffHour.dayOfWeek } },
        update: {},
        create: staffHour
      });
    }

    console.log('✅ Created working hours for all staff members');

    // Create demo admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@x-sme.com' },
      update: {},
      create: {
        email: 'admin@x-sme.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('✅ Created admin user:', adminUser.email);

    // Create demo business owner
    const businessOwnerPassword = await bcrypt.hash('owner123', 10);
    const businessOwner = await prisma.user.upsert({
      where: { email: 'owner@demo-beauty.ir' },
      update: {},
      create: {
        email: 'owner@demo-beauty.ir',
        password: businessOwnerPassword,
        firstName: 'Demo',
        lastName: 'Owner',
        role: 'BUSINESS_OWNER',
        businessId: business.id,
        isActive: true
      }
    });

    console.log('✅ Created business owner:', businessOwner.email);

    console.log('🎉 Demo setup completed successfully!');
    console.log('\n📋 Demo Data Summary:');
    console.log('- Business: Demo Beauty Salon (demo-business-123)');
    console.log('- Services: 3 services (Haircut, Manicure, Facial)');
    console.log('- Staff: 3 staff members with working hours');
    console.log('- Working Hours: Sunday-Saturday (inherited from business)');
    console.log('- Admin User: admin@x-sme.com / admin123');
  console.log('- Business Owner: owner@demo-beauty.ir / owner123');
  
} catch (error) {
    console.error('❌ Error setting up demo data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupDemo()
  .then(() => {
    console.log('✅ Demo setup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Demo setup failed:', error);
  process.exit(1);
  }); 
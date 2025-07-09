const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create demo businesses
    const demoBusiness = await prisma.business.upsert({
      where: { id: 'demo-business-123' },
      update: {},
      create: {
        id: 'demo-business-123',
        name: "دمو سالن زیبایی",
        description: "یک سالن زیبایی برای تمام نیازهای شما",
        address: "تهران, ایران",
        phone: '+98-21-12345678',
        email: 'demo@beautysalon.ir',
        website: 'https://demo-beauty.ir',
        logo: 'https://via.placeholder.com/150x150/3b82f6/ffffff?text=Demo',
        isActive: true,
        timezone: 'Asia/Tehran',
        theme: 'light'
      }
    });

    console.log('✅ Created demo business:', demoBusiness.name);

    // Create business settings
    const businessSettings = await prisma.businessSettings.upsert({
      where: { businessId: 'demo-business-123' },
      update: {},
      create: {
        businessId: 'demo-business-123',
        depositRequired: false,
        depositPercentage: 0,
        cancellationPolicy: '24h',
        reminderTime: 60,
        smsEnabled: true,
        telegramEnabled: false
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
          businessId: 'demo-business-123',
          name: 'اصلاح مو',
          description: 'خدمات اصلاح مو',
          duration: 60, // minutes
          price: 150000.00, // Decimal
          isActive: true
        }
      }),
      prisma.service.upsert({
        where: { id: 'service-2' },
        update: {},
        create: {
          id: 'service-2',
          businessId: 'demo-business-123',
          name: 'مانیکور و پدیکور',
          description: 'خدمات مانیکور و پدیکور',
          duration: 90, // minutes
          price: 200000.00, // Decimal
          isActive: true
        }
      }),
      prisma.service.upsert({
        where: { id: 'service-3' },
        update: {},
        create: {
          id: 'service-3',
          businessId: 'demo-business-123',
          name: 'پاکسازی صورت',
          description: 'خدمات پاکسازی صورت',
          duration: 120, // minutes
          price: 300000.00, // Decimal
          isActive: true
        }
      })
    ]);

    console.log('✅ Created demo services:', services.length);

    // Create demo working hours
    const workingHours = await Promise.all([
      // Monday
      prisma.workingHour.upsert({
        where: { businessId_dayOfWeek: { businessId: 'demo-business-123', dayOfWeek: 1 } },
        update: {},
        create: {
          businessId: 'demo-business-123',
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '18:00',
          isActive: true
        }
      }),
      // Tuesday
      prisma.workingHour.upsert({
        where: { businessId_dayOfWeek: { businessId: 'demo-business-123', dayOfWeek: 2 } },
        update: {},
        create: {
          businessId: 'demo-business-123',
          dayOfWeek: 2,
          startTime: '09:00',
          endTime: '18:00',
          isActive: true
        }
      }),
      // Wednesday
      prisma.workingHour.upsert({
        where: { businessId_dayOfWeek: { businessId: 'demo-business-123', dayOfWeek: 3 } },
        update: {},
        create: {
          businessId: 'demo-business-123',
          dayOfWeek: 3,
          startTime: '09:00',
          endTime: '18:00',
          isActive: true
        }
      }),
      // Thursday
      prisma.workingHour.upsert({
        where: { businessId_dayOfWeek: { businessId: 'demo-business-123', dayOfWeek: 4 } },
        update: {},
        create: {
          businessId: 'demo-business-123',
          dayOfWeek: 4,
          startTime: '09:00',
          endTime: '18:00',
          isActive: true
        }
      }),
      // Friday
      prisma.workingHour.upsert({
        where: { businessId_dayOfWeek: { businessId: 'demo-business-123', dayOfWeek: 5 } },
        update: {},
        create: {
          businessId: 'demo-business-123',
          dayOfWeek: 5,
          startTime: '09:00',
          endTime: '18:00',
          isActive: true
        }
      }),
      // Saturday
      prisma.workingHour.upsert({
        where: { businessId_dayOfWeek: { businessId: 'demo-business-123', dayOfWeek: 6 } },
        update: {},
        create: {
          businessId: 'demo-business-123',
          dayOfWeek: 6,
          startTime: '09:00',
          endTime: '16:00',
          isActive: true
        }
      })
    ]);

    console.log('✅ Created working hours for', workingHours.length, 'days');

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
        businessId: 'demo-business-123',
        isActive: true
      }
    });

    console.log('✅ Created business owner:', businessOwner.email);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Demo Data Summary:');
    console.log('- Business: Demo Beauty Salon (demo-business-123)');
    console.log('- Services: 3 services (Haircut, Manicure, Facial)');
    console.log('- Working Hours: Monday-Saturday');
    console.log('- Admin User: admin@x-sme.com / admin123');
    console.log('- Business Owner: owner@demo-beauty.ir / owner123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('✅ Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }); 
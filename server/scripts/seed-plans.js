const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const plans = [
  {
    name: 'استارتر',
    nameEn: 'starter',
    description: 'مناسب برای کسب‌وکارهای کوچک و شروع کننده',
    setupFee: 1000000, // 1M IRR
    monthlyFee: 0, // Free monthly
    yearlyFee: 0, // Free yearly
    commissionRate: 0.15, // 15% commission
    bookingsLimit: 50,
    servicesLimit: 3,
    smsLimit: 100,
    features: [
      'BASIC_WIDGET',
      'SINGLE_BUSINESS',
      'EMAIL_SUPPORT',
      'BASIC_ANALYTICS',
      'PAYMENT_GATEWAY_INTEGRATION',
      'PERSIAN_CALENDAR'
    ],
    sortOrder: 1
  },
  {
    name: 'حرفه‌ای',
    nameEn: 'professional',
    description: 'بهترین انتخاب برای اکثر کسب‌وکارها',
    setupFee: 2500000, // 2.5M IRR
    monthlyFee: 599000, // 599K IRR monthly
    yearlyFee: 5990000, // 5.99M IRR yearly (2 months free)
    commissionRate: 0.05, // 5% commission
    bookingsLimit: 500,
    servicesLimit: 20,
    smsLimit: 1000,
    features: [
      'ADVANCED_WIDGET',
      'UNLIMITED_BUSINESSES',
      'SMS_TELEGRAM_NOTIFICATIONS',
      'PRIORITY_SUPPORT',
      'ADVANCED_ANALYTICS',
      'API_ACCESS',
      'CUSTOM_BRANDING',
      'DETAILED_REPORTS',
      'PERSIAN_CALENDAR',
      'MULTI_PAYMENT_GATEWAYS',
      'STAFF_MANAGEMENT'
    ],
    sortOrder: 2
  },
  {
    name: 'سازمانی',
    nameEn: 'enterprise',
    description: 'راه‌حل سفارشی برای شرکت‌های بزرگ',
    setupFee: 10000000, // 10M IRR
    monthlyFee: 2000000, // 2M IRR monthly
    yearlyFee: 20000000, // 20M IRR yearly (2 months free)
    commissionRate: 0.02, // 2% commission
    bookingsLimit: null, // Unlimited
    servicesLimit: null, // Unlimited
    smsLimit: null, // Unlimited
    features: [
      'ENTERPRISE_WIDGET',
      'UNLIMITED_BUSINESSES',
      'CUSTOM_INTEGRATIONS',
      'DEDICATED_ACCOUNT_MANAGER',
      'SUPPORT_24_7',
      'SLA_GUARANTEE',
      'DEDICATED_TRAINING',
      'DEDICATED_SERVER',
      'ADVANCED_SECURITY',
      'WHITE_LABEL',
      'CUSTOM_DEVELOPMENT',
      'MULTI_LOCATION',
      'ADVANCED_API',
      'PRIORITY_FEATURES'
    ],
    sortOrder: 3
  }
];

async function seedPlans() {
  try {
    console.log('🌱 Starting plan seeding...');

    // Clear existing plans
    await prisma.plan.deleteMany({});
    console.log('🗑️ Cleared existing plans');

    // Create new plans
    for (const planData of plans) {
      const plan = await prisma.plan.create({
        data: planData
      });
      console.log(`✅ Created plan: ${plan.name} (${plan.nameEn})`);
    }

    console.log('🎉 Plan seeding completed successfully!');
    
    // Display created plans
    const createdPlans = await prisma.plan.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    console.log('\n📋 Created Plans:');
    console.log('='.repeat(80));
    createdPlans.forEach(plan => {
      console.log(`
📦 ${plan.name} (${plan.nameEn})
   Setup Fee: ${plan.setupFee.toLocaleString()} IRR
   Monthly: ${plan.monthlyFee.toLocaleString()} IRR
   Yearly: ${plan.yearlyFee.toLocaleString()} IRR
   Commission: ${(plan.commissionRate * 100)}%
   Bookings Limit: ${plan.bookingsLimit || 'Unlimited'}
   Features: ${plan.features.length} features
      `);
    });

  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedPlans()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedPlans, plans }; 
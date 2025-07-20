const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const plans = [
  {
    name: 'پایه',
    nameEn: 'starter',
    description: 'مناسب برای تست‌کنندگان و کسب‌وکارهای انفرادی',
    setupFee: 0, // Free setup
    monthlyFee: 0, // Free monthly
    yearlyFee: 0, // Free yearly
    commissionRate: 0, // No commission
    bookingsLimit: 60, 
    servicesLimit: 1, 
    smsLimit: 0, 
    features: [
      'BASIC_WIDGET',
      'SINGLE_BUSINESS',
      'EMAIL_SUPPORT',
      'BASIC_ANALYTICS',
      'ZARINPAL_GATEWAY',
      'PERSIAN_CALENDAR',
      'POWERED_BY_BRANDING'
    ],
    sortOrder: 1
  },
  {
    name: 'رشد',
    nameEn: 'growth',
    description: 'مناسب برای کسب‌وکارهای شلوغ و میکرو SME',
    setupFee: 500000, 
    monthlyFee: 500000,
    yearlyFee: 5000000,
    commissionRate: 0.05,
    bookingsLimit: null,
    servicesLimit: 3,
    smsLimit: 0,
    features: [
      'ADVANCED_WIDGET',
      'SINGLE_BUSINESS',
      'EMAIL_SUPPORT',
      'BASIC_ANALYTICS',
      'TWO_PAYMENT_GATEWAYS',
      'PERSIAN_CALENDAR',
      'SMS_TELEGRAM_NOTIFICATIONS',
      'STAFF_MANAGEMENT',
      'MINIMAL_BRANDING'
    ],
    sortOrder: 2
  },
  {
    name: 'حرفه‌ای',
    nameEn: 'pro',
    description: 'مناسب برای کلینیک‌ها و زنجیره‌ها',
    setupFee: 1000000,
    monthlyFee: 1000000,
    yearlyFee: 10000000,
    commissionRate: 0,
    bookingsLimit: null, 
    servicesLimit: null,
    smsLimit: null,
    features: [
      'ENTERPRISE_WIDGET',
      'UNLIMITED_BUSINESSES',
      'PRIORITY_SUPPORT',
      'ADVANCED_ANALYTICS',
      'ALL_PAYMENT_GATEWAYS',
      'PERSIAN_CALENDAR',
      'SMS_TELEGRAM_NOTIFICATIONS',
      'STAFF_MANAGEMENT',
      'WHITE_LABEL_BRANDING',
      'API_ACCESS',
      'DETAILED_REPORTS',
      'MULTI_LOCATION',
      'ADVANCED_API'
    ],
    sortOrder: 3
  },
  {
    name: 'سازمانی',
    nameEn: 'enterprise',
    description: 'مناسب برای SaaS و آژانس‌های توسعه',
    setupFee: 0, // Quote-based
    monthlyFee: 0, // Quote-based
    yearlyFee: 0, // Quote-based
    commissionRate: 0.01, // 1% commission
    bookingsLimit: null,
    servicesLimit: null,
    smsLimit: null,
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
      'WHITE_LABEL_SDK',
      'CUSTOM_DEVELOPMENT',
      'MULTI_LOCATION',
      'ADVANCED_API',
      'PRIORITY_FEATURES',
      'NO_BRANDING'
    ],
    sortOrder: 4
  }
];

async function seedPlans() {
  try {
    console.log('🌱 Starting plan seeding...');

    // First, let's check for any existing plans with conflicting names
    const existingPlans = await prisma.plan.findMany();
    console.log(`Found ${existingPlans.length} existing plans`);

    // Update existing plans or create new ones
    for (const planData of plans) {
      const existingPlan = await prisma.plan.findFirst({
        where: { nameEn: planData.nameEn }
      });

      if (existingPlan) {
        // Check if there's a name conflict with another plan
        const nameConflict = await prisma.plan.findFirst({
          where: { 
            name: planData.name,
            nameEn: { not: planData.nameEn }
          }
        });

        if (nameConflict) {
          console.log(`⚠️ Name conflict detected: ${planData.name} already exists with nameEn: ${nameConflict.nameEn}`);
          // Update the conflicting plan's name to avoid conflict
          await prisma.plan.update({
            where: { id: nameConflict.id },
            data: { name: `${nameConflict.name} (Old)` }
          });
          console.log(`✅ Renamed conflicting plan: ${nameConflict.name} -> ${nameConflict.name} (Old)`);
        }

        // Update existing plan
        const plan = await prisma.plan.update({
          where: { id: existingPlan.id },
          data: planData
        });
        console.log(`✅ Updated plan: ${plan.name} (${plan.nameEn})`);
      } else {
        // Check if there's a name conflict before creating
        const nameConflict = await prisma.plan.findFirst({
          where: { name: planData.name }
        });

        if (nameConflict) {
          console.log(`⚠️ Name conflict detected: ${planData.name} already exists`);
          // Update the conflicting plan's name to avoid conflict
          await prisma.plan.update({
            where: { id: nameConflict.id },
            data: { name: `${nameConflict.name} (Old)` }
          });
          console.log(`✅ Renamed conflicting plan: ${nameConflict.name} -> ${nameConflict.name} (Old)`);
        }

        // Create new plan
        const plan = await prisma.plan.create({
          data: planData
        });
        console.log(`✅ Created plan: ${plan.name} (${plan.nameEn})`);
      }
    }

    console.log('🎉 Plan seeding completed successfully!');
    
    // Clean up old plans that are no longer needed (but don't delete if they have subscriptions)
    const oldProfessionalPlan = await prisma.plan.findFirst({
      where: { nameEn: 'professional' }
    });
    
    if (oldProfessionalPlan) {
      // Check if this plan has any subscriptions
      const subscriptionCount = await prisma.subscription.count({
        where: { planId: oldProfessionalPlan.id }
      });
      
      if (subscriptionCount === 0) {
        await prisma.plan.delete({
          where: { id: oldProfessionalPlan.id }
        });
        console.log('🗑️ Removed old professional plan');
      } else {
        console.log(`⚠️ Keeping old professional plan (${subscriptionCount} subscriptions reference it)`);
      }
    }
    
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
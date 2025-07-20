const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateSubscriptions() {
  try {
    console.log('🔄 Starting subscription migration...');

    // Get all subscriptions with old plans
    const oldSubscriptions = await prisma.subscription.findMany({
      include: {
        plan: true,
        business: true
      }
    });

    console.log(`Found ${oldSubscriptions.length} subscriptions to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const subscription of oldSubscriptions) {
      const oldPlan = subscription.plan;
      
      // Skip if already using new plan structure
      if (['starter', 'growth', 'pro', 'enterprise'].includes(oldPlan.nameEn)) {
        console.log(`⏭️ Skipping ${subscription.business.name} - already using new plan: ${oldPlan.nameEn}`);
        skippedCount++;
        continue;
      }

      // Map old plans to new plans
      let newPlanNameEn;
      let migrationReason;

      if (oldPlan.nameEn === 'professional') {
        // Professional → Pro (upgrade)
        newPlanNameEn = 'pro';
        migrationReason = 'Upgraded from Professional to Pro plan';
      } else if (oldPlan.nameEn === 'starter') {
        // Starter → Starter (same)
        newPlanNameEn = 'starter';
        migrationReason = 'Updated to new Starter plan structure';
      } else if (oldPlan.nameEn === 'enterprise') {
        // Enterprise → Enterprise (same)
        newPlanNameEn = 'enterprise';
        migrationReason = 'Updated to new Enterprise plan structure';
      } else {
        console.log(`⚠️ Unknown plan type: ${oldPlan.nameEn} for ${subscription.business.name}`);
        skippedCount++;
        continue;
      }

      // Find the new plan
      const newPlan = await prisma.plan.findFirst({
        where: { nameEn: newPlanNameEn }
      });

      if (!newPlan) {
        console.log(`❌ New plan not found: ${newPlanNameEn}`);
        skippedCount++;
        continue;
      }

      // Update subscription to new plan
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { 
          planId: newPlan.id,
          // Keep existing billing cycle and dates
        }
      });

      console.log(`✅ Migrated ${subscription.business.name}: ${oldPlan.name} → ${newPlan.name} (${migrationReason})`);
      migratedCount++;
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Migrated: ${migratedCount} subscriptions`);
    console.log(`⏭️ Skipped: ${skippedCount} subscriptions`);
    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  migrateSubscriptions()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateSubscriptions }; 
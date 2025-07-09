const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking users and their business assignments...\n');

    // Get all users
    const users = await prisma.user.findMany({
      include: {
        business: true
      }
    });

    console.log(`Found ${users.length} users:\n`);

    users.forEach(user => {
      console.log(`👤 User: ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Business ID: ${user.businessId || 'None'}`);
      console.log(`   Business Name: ${user.business?.name || 'No business assigned'}`);
      console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
      console.log('');
    });

    // Check if there are any businesses
    const businesses = await prisma.business.findMany();
    console.log(`Found ${businesses.length} businesses:\n`);

    businesses.forEach(business => {
      console.log(`🏢 Business: ${business.name} (${business.id})`);
      console.log(`   Email: ${business.email}`);
      console.log(`   Active: ${business.isActive ? 'Yes' : 'No'}`);
      console.log('');
    });

    // Check business owners without businesses
    const businessOwnersWithoutBusiness = users.filter(user => 
      user.role === 'BUSINESS_OWNER' && !user.businessId
    );

    if (businessOwnersWithoutBusiness.length > 0) {
      console.log('⚠️  Business owners without businesses:');
      businessOwnersWithoutBusiness.forEach(user => {
        console.log(`   - ${user.firstName} ${user.lastName} (${user.email})`);
      });
      console.log('');
    }

    // Check if there are businesses without owners
    const businessesWithoutOwners = businesses.filter(business => 
      !users.some(user => user.businessId === business.id && user.role === 'BUSINESS_OWNER')
    );

    if (businessesWithoutOwners.length > 0) {
      console.log('⚠️  Businesses without owners:');
      businessesWithoutOwners.forEach(business => {
        console.log(`   - ${business.name} (${business.id})`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixBusinessAssignments() {
  try {
    console.log('🔧 Fixing business assignments...\n');

    // Get all users
    const users = await prisma.user.findMany();
    const businesses = await prisma.business.findMany();

    console.log(`Found ${users.length} users and ${businesses.length} businesses\n`);

    // Check if we need to create a default business
    if (businesses.length === 0) {
      console.log('📝 Creating default business...');
      
      const defaultBusiness = await prisma.business.create({
        data: {
          name: 'Default Business',
          description: 'Default business for testing',
          phone: '+989123456789',
          email: 'default@business.com',
          address: 'Default Address',
          isActive: true,
          settings: {
            create: {
              depositRequired: false,
              depositPercentage: 0,
              cancellationPolicy: '24h',
              reminderTime: 60,
              smsEnabled: true,
              telegramEnabled: false
            }
          }
        }
      });

      console.log(`✅ Created default business: ${defaultBusiness.name} (${defaultBusiness.id})`);
      businesses.push(defaultBusiness);
    }

    // Find business owners without businesses
    const businessOwnersWithoutBusiness = users.filter(user => 
      user.role === 'BUSINESS_OWNER' && !user.businessId
    );

    if (businessOwnersWithoutBusiness.length > 0) {
      console.log(`🔗 Assigning businesses to ${businessOwnersWithoutBusiness.length} business owners...`);

      for (let i = 0; i < businessOwnersWithoutBusiness.length; i++) {
        const user = businessOwnersWithoutBusiness[i];
        const business = businesses[i % businesses.length]; // Round-robin assignment

        await prisma.user.update({
          where: { id: user.id },
          data: { businessId: business.id }
        });

        console.log(`✅ Assigned ${business.name} to ${user.firstName} ${user.lastName} (${user.email})`);
      }
    } else {
      console.log('✅ All business owners already have businesses assigned');
    }

    // Create a test business owner if none exist
    const existingBusinessOwners = users.filter(user => user.role === 'BUSINESS_OWNER');
    
    if (existingBusinessOwners.length === 0) {
      console.log('👤 Creating test business owner...');
      
      const hashedPassword = await bcrypt.hash('owner123', 12);
      const testBusinessOwner = await prisma.user.create({
        data: {
          email: 'owner@test.com',
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'Owner',
          role: 'BUSINESS_OWNER',
          businessId: businesses[0].id,
          isActive: true
        }
      });

      console.log(`✅ Created test business owner: ${testBusinessOwner.email} (password: owner123)`);
    }

    // Create some sample services for businesses that don't have any
    for (const business of businesses) {
      const existingServices = await prisma.service.findMany({
        where: { businessId: business.id }
      });

      if (existingServices.length === 0) {
        console.log(`📦 Creating sample services for ${business.name}...`);
        
        const sampleServices = [
          {
            name: 'Sample Service 1',
            description: 'A sample service for testing',
            duration: 60,
            price: 100000,
            isActive: true
          },
          {
            name: 'Sample Service 2',
            description: 'Another sample service',
            duration: 90,
            price: 150000,
            isActive: true
          }
        ];

        for (const service of sampleServices) {
          await prisma.service.create({
            data: {
              ...service,
              businessId: business.id
            }
          });
        }

        console.log(`✅ Created ${sampleServices.length} sample services for ${business.name}`);
      }
    }

    console.log('\n✅ Business assignments fixed successfully!');
    console.log('\n📋 Test credentials:');
    console.log('   Business Owner: owner@test.com / owner123');
    console.log('   Admin: admin@x-sme.com / admin123');

  } catch (error) {
    console.error('❌ Error fixing business assignments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBusinessAssignments(); 
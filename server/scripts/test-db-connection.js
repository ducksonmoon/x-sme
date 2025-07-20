const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test domain query
    const domains = await prisma.domain.findMany({
      take: 5,
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    console.log(`📊 Found ${domains.length} domains in database`);
    
    if (domains.length > 0) {
      console.log('\n📋 Sample domains:');
      domains.forEach(domain => {
        console.log(`   - ${domain.domain} (${domain.type}) - ${domain.business?.name || 'No business'}`);
      });
    }
    
    // Test pending domains
    const pendingDomains = await prisma.domain.findMany({
      where: {
        status: 'PENDING'
      }
    });
    
    console.log(`\n⏳ Found ${pendingDomains.length} pending domains`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 
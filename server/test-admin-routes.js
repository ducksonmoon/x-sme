const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test if we can query users
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);
    
    // Test if we can query businesses
    const businessCount = await prisma.business.count();
    console.log(`✅ Found ${businessCount} businesses in database`);
    
    // Test if we can query bookings
    const bookingCount = await prisma.booking.count();
    console.log(`✅ Found ${bookingCount} bookings in database`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testAdminUser() {
  try {
    console.log('\nTesting admin user creation...');
    
    // Check if admin user exists
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!adminUser) {
      console.log('Creating admin user...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true
        }
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    return adminUser;
  } catch (error) {
    console.error('❌ Failed to create/admin user:', error.message);
    return null;
  }
}

async function generateTestToken(user) {
  try {
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );
    return token;
  } catch (error) {
    console.error('❌ Failed to generate token:', error.message);
    return null;
  }
}

async function testAdminRoutes() {
  try {
    console.log('\nTesting admin routes...');
    
    const adminUser = await testAdminUser();
    if (!adminUser) {
      console.log('❌ Cannot test admin routes without admin user');
      return;
    }
    
    const token = await generateTestToken(adminUser);
    if (!token) {
      console.log('❌ Cannot test admin routes without token');
      return;
    }
    
    console.log('✅ Test token generated');
    console.log(`Token: ${token.substring(0, 20)}...`);
    
    // Test analytics query
    console.log('\nTesting analytics query...');
    const analyticsResult = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        }
      },
      select: {
        createdAt: true,
        status: true
      }
    });
    console.log(`✅ Analytics query successful, found ${analyticsResult.length} recent bookings`);
    
    // Test users query
    console.log('\nTesting users query...');
    const usersResult = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true
      }
    });
    console.log(`✅ Users query successful, found ${usersResult.length} users`);
    
    // Test businesses query
    console.log('\nTesting businesses query...');
    const businessesResult = await prisma.business.findMany({
      include: {
        _count: {
          select: { bookings: true, services: true }
        }
      }
    });
    console.log(`✅ Businesses query successful, found ${businessesResult.length} businesses`);
    
  } catch (error) {
    console.error('❌ Admin routes test failed:', error.message);
  }
}

async function main() {
  console.log('🔍 Testing X-SME Admin Routes\n');
  
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.log('\n❌ Cannot proceed without database connection');
    process.exit(1);
  }
  
  await testAdminRoutes();
  
  console.log('\n✅ All tests completed');
  await prisma.$disconnect();
}

main().catch(console.error); 
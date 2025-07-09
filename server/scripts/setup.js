#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

console.log('🚀 X-SME Backend Setup Script');
console.log('==============================\n');

async function createDirectories() {
  console.log('📁 Creating necessary directories...');
  
  const directories = [
    'logs',
    'uploads',
    'backups',
    'keys',
    'public'
  ];

  for (const dir of directories) {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    } else {
      console.log(`ℹ️  Directory already exists: ${dir}`);
    }
  }
}

async function checkEnvironmentFile() {
  console.log('\n🔧 Checking environment configuration...');
  
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', 'env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Created .env file from env.example');
      console.log('⚠️  Please update .env file with your actual configuration values');
    } else {
      console.log('❌ env.example file not found');
      process.exit(1);
    }
  } else {
    console.log('ℹ️  .env file already exists');
  }
}

async function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  try {
    execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.log('❌ Failed to install dependencies');
    process.exit(1);
  }
}

async function generatePrismaClient() {
  console.log('\n🗄️  Generating Prisma client...');
  
  try {
    execSync('npx prisma generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Prisma client generated successfully');
  } catch (error) {
    console.log('❌ Failed to generate Prisma client');
    process.exit(1);
  }
}

async function runMigrations() {
  console.log('\n🔄 Running database migrations...');
  
  try {
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.log('❌ Failed to run database migrations');
    console.log('⚠️  Make sure your database is running and DATABASE_URL is configured correctly');
    process.exit(1);
  }
}

async function createDefaultAdmin() {
  console.log('\n👤 Creating default admin user...');
  
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await prisma.user.create({
      data: {
        email: 'admin@x-sme.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('✅ Default admin user created');
    console.log('📧 Email: admin@x-sme.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the default password after first login');
  } catch (error) {
    console.log('❌ Failed to create default admin user:', error.message);
  }
}

async function createSampleData() {
  console.log('\n📊 Creating sample data...');
  
  try {
    // Create sample business
    const business = await prisma.business.create({
      data: {
        name: 'Sample Beauty Salon',
        description: 'A sample beauty salon for testing',
        phone: '+989123456789',
        email: 'info@samplebeauty.com',
        address: 'Sample Address, Tehran',
        isActive: true
      }
    });

    // Create sample business owner
    const hashedPassword = await bcrypt.hash('owner123', 12);
    const businessOwner = await prisma.user.create({
      data: {
        email: 'owner@samplebeauty.com',
        password: hashedPassword,
        firstName: 'Business',
        lastName: 'Owner',
        role: 'BUSINESS_OWNER',
        businessId: business.id,
        isActive: true
      }
    });

    // Create business settings
    await prisma.businessSettings.create({
      data: {
        businessId: business.id,
        depositRequired: true,
        depositPercentage: 20,
        cancellationPolicy: '24h',
        reminderTime: 60,
        smsEnabled: true,
        telegramEnabled: false
      }
    });

    // Create sample services
    const services = [
      {
        name: 'Hair Cut',
        description: 'Professional hair cutting service',
        duration: 60,
        price: 150000
      },
      {
        name: 'Manicure',
        description: 'Professional manicure service',
        duration: 45,
        price: 80000
      },
      {
        name: 'Facial',
        description: 'Relaxing facial treatment',
        duration: 90,
        price: 200000
      }
    ];

    for (const service of services) {
      await prisma.service.create({
        data: {
          ...service,
          businessId: business.id,
          isActive: true
        }
      });
    }

    // Create working hours
    const workingHours = [
      { dayOfWeek: 0, startTime: '09:00', endTime: '18:00' }, // Sunday
      { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' }, // Monday
      { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' }, // Tuesday
      { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' }, // Wednesday
      { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' }, // Thursday
      { dayOfWeek: 5, startTime: '09:00', endTime: '18:00' }, // Friday
      { dayOfWeek: 6, startTime: '09:00', endTime: '18:00' }  // Saturday
    ];

    for (const wh of workingHours) {
      await prisma.workingHour.create({
        data: {
          ...wh,
          businessId: business.id,
          isActive: true
        }
      });
    }

    console.log('✅ Sample data created successfully');
    console.log('🏢 Sample business: Sample Beauty Salon');
    console.log('👤 Business owner: owner@samplebeauty.com / owner123');
    console.log('📧 Admin: admin@x-sme.com / admin123');
  } catch (error) {
    console.log('❌ Failed to create sample data:', error.message);
  }
}

async function runTests() {
  console.log('\n🧪 Running tests...');
  
  try {
    execSync('npm test', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ All tests passed');
  } catch (error) {
    console.log('❌ Some tests failed');
    console.log('⚠️  You can still run the application, but please check the test failures');
  }
}

async function main() {
  try {
    await createDirectories();
    await checkEnvironmentFile();
    await installDependencies();
    await generatePrismaClient();
    await runMigrations();
    await createDefaultAdmin();
    await createSampleData();
    await runTests();

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update .env file with your actual configuration values');
    console.log('2. Configure payment gateway credentials');
    console.log('3. Set up SMS and Telegram services');
    console.log('4. Start the server: npm run dev');
    console.log('5. Access the API at: http://localhost:3001');
    console.log('6. Check health endpoint: http://localhost:3001/health');
    
    console.log('\n🔐 Default credentials:');
    console.log('Admin: admin@x-sme.com / admin123');
    console.log('Business Owner: owner@samplebeauty.com / owner123');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { main }; 
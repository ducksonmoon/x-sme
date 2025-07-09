const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Setting up X-SME demo environment...');

try {
  // Run database migrations
  console.log('📊 Running database migrations...');
  execSync('npx prisma migrate dev', { stdio: 'inherit' });
  
  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Seed the database
  console.log('🌱 Seeding database with demo data...');
  execSync('npm run db:seed', { stdio: 'inherit' });
  
  console.log('✅ Demo environment setup completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Start the server: npm start');
  console.log('2. Start the client: cd ../client && npm run dev');
  console.log('3. Visit: http://localhost:3000');
  console.log('\n🔑 Demo credentials:');
  console.log('- Admin: admin@x-sme.com / admin123');
  console.log('- Business Owner: owner@demo-beauty.ir / owner123');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
} 
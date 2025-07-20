#!/usr/bin/env node

/**
 * Domain Instructions Setup Runner for X-SME Iranian Platform
 * 
 * This script runs the domain instructions setup for Iranian users
 * with Persian language support and Iranian DNS providers.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Domain Instructions Setup for X-SME Iranian Platform...\n');

try {
  // Check if we're in the right directory
  const currentDir = process.cwd();
  console.log(`📍 Current directory: ${currentDir}`);
  
  // Run the comprehensive setup script
  console.log('\n📋 Running comprehensive domain instructions setup...');
  execSync('node set-domain-instructions.js', { 
    stdio: 'inherit',
    cwd: path.join(__dirname)
  });
  
  console.log('\n✅ Domain instructions setup completed successfully!');
  console.log('\n📝 What was done:');
  console.log('   • Added Persian language instructions for all domain types');
  console.log('   • Included Iranian DNS providers (Parsijoo, IranHost, Hostinger)');
  console.log('   • Added international provider support (Cloudflare, GoDaddy, Namecheap)');
  console.log('   • Updated all pending domains with instructions');
  console.log('   • Created reusable instruction templates');
  
  console.log('\n🎯 Next steps:');
  console.log('   1. Check the domains page in your application');
  console.log('   2. Verify that instructions are displayed in Persian');
  console.log('   3. Test the instructions modal for different domain types');
  console.log('   4. Ensure all DNS provider instructions are available');
  
} catch (error) {
  console.error('\n❌ Error running domain instructions setup:');
  console.error(error.message);
  process.exit(1);
} 
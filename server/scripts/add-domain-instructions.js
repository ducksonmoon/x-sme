const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Simple function to add instructions to a specific domain
async function addInstructionsToDomain(domainId, instructions) {
  try {
    console.log(`🔧 Adding instructions to domain ID: ${domainId}`);

    const domain = await prisma.domain.findUnique({
      where: { id: domainId },
      include: {
        business: {
          select: { id: true, name: true }
        }
      }
    });

    if (!domain) {
      throw new Error(`Domain with ID ${domainId} not found`);
    }

    // Update domain with instructions
    const updatedDomain = await prisma.domain.update({
      where: { id: domainId },
      data: {
        metadata: {
          ...domain.metadata,
          instructions: instructions,
          lastInstructionUpdate: new Date()
        }
      }
    });

    console.log(`✅ Successfully added instructions to ${domain.domain}`);
    return updatedDomain;

  } catch (error) {
    console.error('❌ Error adding instructions:', error);
    throw error;
  }
}

// Function to generate instructions for a domain in Persian
function generateInstructionsForDomain(domain, businessId) {
  const mainDomain = process.env.MAIN_DOMAIN || 'x-sme.ir';
  
  if (domain.type === 'SUBDOMAIN') {
    return {
      domain: domain.domain,
      type: domain.type,
      records: [
        {
          type: 'CNAME',
          name: domain.domain.split('.')[0], // Extract subdomain name
          value: `widget.${mainDomain}`,
          description: 'زیردامنه شما را به سرور ویجت ما متصل می‌کند'
        },
        {
          type: 'TXT',
          name: domain.domain.split('.')[0],
          value: `xsme-verification=${businessId}`,
          description: 'مالکیت زیردامنه را تایید می‌کند'
        }
      ],
      instructions: [
        '1. وارد پنل مدیریت دامنه یا ارائه‌دهنده DNS خود شوید',
        '2. به بخش مدیریت DNS یا تنظیمات DNS بروید',
        '3. یک رکورد CNAME با جزئیات زیر اضافه کنید:',
        `   - نام: ${domain.domain.split('.')[0]}`,
        `   - مقدار: widget.${mainDomain}`,
        '   - TTL: 3600 (یا پیش‌فرض)',
        '4. یک رکورد TXT با جزئیات زیر اضافه کنید:',
        `   - نام: ${domain.domain.split('.')[0]}`,
        `   - مقدار: xsme-verification=${businessId}`,
        '   - TTL: 3600 (یا پیش‌فرض)',
        '5. تغییرات را ذخیره کنید و منتظر انتشار DNS بمانید (تا 48 ساعت)',
        '6. روی "تایید دامنه" کلیک کنید تا بررسی کنید که رکوردها درست تنظیم شده‌اند'
      ],
      notes: [
        'تغییرات DNS ممکن است تا 48 ساعت طول بکشد تا در سراسر جهان منتشر شود',
        'مطمئن شوید که رکوردهای A یا CNAME متضاد برای زیردامنه را حذف کرده‌اید',
        'رکورد TXT فقط برای تایید نیاز است و پس از فعال‌سازی می‌تواند حذف شود',
        'می‌توانید از هر نام زیردامنه‌ای استفاده کنید (booking، widget، reserve و غیره)',
        'زیردامنه در آدرس زیر قابل دسترسی خواهد بود: زیردامنه شما'
      ]
    };
  } else {
    // Custom domain
    return {
      domain: domain.domain,
      type: domain.type,
      records: [
        {
          type: 'CNAME',
          name: '@',
          value: `widget.${mainDomain}`,
          description: 'دامنه شما را به سرور ویجت ما متصل می‌کند'
        },
        {
          type: 'TXT',
          name: '@',
          value: `xsme-verification=${businessId}`,
          description: 'مالکیت دامنه را تایید می‌کند'
        }
      ],
      instructions: [
        '1. وارد پنل مدیریت دامنه یا ارائه‌دهنده DNS خود شوید',
        '2. به بخش مدیریت DNS یا تنظیمات DNS بروید',
        '3. یک رکورد CNAME با جزئیات زیر اضافه کنید:',
        '   - نام: @ (یا برای دامنه اصلی خالی بگذارید)',
        `   - مقدار: widget.${mainDomain}`,
        '   - TTL: 3600 (یا پیش‌فرض)',
        '4. یک رکورد TXT با جزئیات زیر اضافه کنید:',
        '   - نام: @ (یا برای دامنه اصلی خالی بگذارید)',
        `   - مقدار: xsme-verification=${businessId}`,
        '   - TTL: 3600 (یا پیش‌فرض)',
        '5. تغییرات را ذخیره کنید و منتظر انتشار DNS بمانید (تا 48 ساعت)',
        '6. روی "تایید دامنه" کلیک کنید تا بررسی کنید که رکوردها درست تنظیم شده‌اند'
      ],
      notes: [
        'تغییرات DNS ممکن است تا 48 ساعت طول بکشد تا در سراسر جهان منتشر شود',
        'مطمئن شوید که رکوردهای A یا CNAME متضاد را حذف کرده‌اید',
        'رکورد TXT فقط برای تایید نیاز است و پس از فعال‌سازی می‌تواند حذف شود',
        'اگر زیردامنه www دارید، ممکن است نیاز به رکوردهای جداگانه داشته باشید',
        'برخی ارائه‌دهندگان ممکن است نیاز داشته باشند که نماد @ را حذف کنید و فیلد نام را خالی بگذارید'
      ]
    };
  }
}

// Function to update all pending domains with instructions
async function updateAllPendingDomains() {
  try {
    console.log('🔧 Updating all pending domains with instructions...\n');

    const domains = await prisma.domain.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        business: {
          select: { id: true, name: true }
        }
      }
    });

    console.log(`Found ${domains.length} pending domains\n`);

    for (const domain of domains) {
      console.log(`📝 Processing: ${domain.domain} (${domain.type})`);
      
      const instructions = generateInstructionsForDomain(domain, domain.businessId);
      
      await addInstructionsToDomain(domain.id, instructions);
    }

    console.log(`\n🎉 Successfully updated ${domains.length} domains`);

  } catch (error) {
    console.error('❌ Error updating domains:', error);
    throw error;
  }
}

// Function to update a specific domain by domain name
async function updateDomainByName(domainName) {
  try {
    console.log(`🔧 Updating domain: ${domainName}`);

    const domain = await prisma.domain.findFirst({
      where: { domain: domainName },
      include: {
        business: {
          select: { id: true, name: true }
        }
      }
    });

    if (!domain) {
      throw new Error(`Domain ${domainName} not found`);
    }

    const instructions = generateInstructionsForDomain(domain, domain.businessId);
    
    await addInstructionsToDomain(domain.id, instructions);
    
    console.log(`✅ Successfully updated ${domainName}`);

  } catch (error) {
    console.error('❌ Error updating domain:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Domain Instructions Addition Script');
    console.log('=====================================\n');

    // Check command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      // No arguments - update all pending domains
      await updateAllPendingDomains();
    } else if (args[0] === '--domain' && args[1]) {
      // Update specific domain
      await updateDomainByName(args[1]);
    } else if (args[0] === '--help') {
      console.log('Usage:');
      console.log('  node add-domain-instructions.js                    # Update all pending domains');
      console.log('  node add-domain-instructions.js --domain example.com # Update specific domain');
      console.log('  node add-domain-instructions.js --help              # Show this help');
      return;
    } else {
      console.log('Invalid arguments. Use --help for usage information.');
      return;
    }

    console.log('\n🎉 Domain instructions addition completed successfully!');

  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  addInstructionsToDomain,
  generateInstructionsForDomain,
  updateAllPendingDomains,
  updateDomainByName
}; 
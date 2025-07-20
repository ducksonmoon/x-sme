const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Predefined domain instruction templates in Persian
const domainInstructionTemplates = {
  CUSTOM: {
    records: [
      {
        type: 'CNAME',
        name: '@',
        value: 'widget.x-sme.ir',
        description: 'دامنه شما را به سرور ویجت ما متصل می‌کند'
      },
      {
        type: 'TXT',
        name: '@',
        value: 'xsme-verification={businessId}',
        description: 'مالکیت دامنه را تایید می‌کند'
      }
    ],
    instructions: [
      '1. وارد پنل مدیریت دامنه یا ارائه‌دهنده DNS خود شوید',
      '2. به بخش مدیریت DNS یا تنظیمات DNS بروید',
      '3. یک رکورد CNAME با جزئیات زیر اضافه کنید:',
      '   - نام: @ (یا برای دامنه اصلی خالی بگذارید)',
      '   - مقدار: widget.x-sme.ir',
      '   - TTL: 3600 (یا پیش‌فرض)',
      '4. یک رکورد TXT با جزئیات زیر اضافه کنید:',
      '   - نام: @ (یا برای دامنه اصلی خالی بگذارید)',
      '   - مقدار: xsme-verification={businessId}',
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
  },
  SUBDOMAIN: {
    records: [
      {
        type: 'CNAME',
        name: 'booking',
        value: 'widget.x-sme.ir',
        description: 'زیردامنه شما را به سرور ویجت ما متصل می‌کند'
      },
      {
        type: 'TXT',
        name: 'booking',
        value: 'xsme-verification={businessId}',
        description: 'مالکیت زیردامنه را تایید می‌کند'
      }
    ],
    instructions: [
      '1. وارد پنل مدیریت دامنه یا ارائه‌دهنده DNS خود شوید',
      '2. به بخش مدیریت DNS یا تنظیمات DNS بروید',
      '3. یک رکورد CNAME با جزئیات زیر اضافه کنید:',
      '   - نام: booking (یا نام زیردامنه مورد نظر شما)',
      '   - مقدار: widget.x-sme.ir',
      '   - TTL: 3600 (یا پیش‌فرض)',
      '4. یک رکورد TXT با جزئیات زیر اضافه کنید:',
      '   - نام: booking (یا نام زیردامنه مورد نظر شما)',
      '   - مقدار: xsme-verification={businessId}',
      '   - TTL: 3600 (یا پیش‌فرض)',
      '5. تغییرات را ذخیره کنید و منتظر انتشار DNS بمانید (تا 48 ساعت)',
      '6. روی "تایید دامنه" کلیک کنید تا بررسی کنید که رکوردها درست تنظیم شده‌اند'
    ],
    notes: [
      'تغییرات DNS ممکن است تا 48 ساعت طول بکشد تا در سراسر جهان منتشر شود',
      'مطمئن شوید که رکوردهای A یا CNAME متضاد برای زیردامنه را حذف کرده‌اید',
      'رکورد TXT فقط برای تایید نیاز است و پس از فعال‌سازی می‌تواند حذف شود',
      'می‌توانید از هر نام زیردامنه‌ای استفاده کنید (booking، widget، reserve و غیره)',
      'زیردامنه در آدرس زیر قابل دسترسی خواهد بود: booking.yourdomain.com'
    ]
  }
};

const providerInstructions = {
  'iranhost': {
    additionalSteps: [
      '1. در ایران هاست، به "پنل مدیریت" بروید',
      '2. روی "مدیریت دامنه" کلیک کنید',
      '3. دامنه مورد نظر را انتخاب کنید',
      '4. به بخش "DNS Zone Editor" بروید',
      '5. روی "Add Record" کلیک کنید',
      '6. نوع رکورد را انتخاب کنید (CNAME یا TXT)',
      '7. مقادیر را وارد کنید و ذخیره کنید'
    ],
    notes: [
      'ایران هاست معمولاً انتشار DNS سریعی دارد',
      'تغییرات معمولاً در کمتر از 2 ساعت اعمال می‌شود',
      'در صورت مشکل با پشتیبانی تماس بگیرید'
    ]
  },
  'hostinger': {
    additionalSteps: [
      '1. در Hostinger، به "Domains" بروید',
      '2. روی دامنه مورد نظر کلیک کنید',
      '3. به بخش "DNS / Nameservers" بروید',
      '4. روی "Manage" کلیک کنید',
      '5. روی "Add Record" کلیک کنید',
      '6. نوع رکورد را انتخاب کنید',
      '7. مقادیر را وارد کنید و ذخیره کنید'
    ],
    notes: [
      'Hostinger معمولاً انتشار DNS خوبی دارد',
      'تغییرات ممکن است تا 48 ساعت طول بکشد',
      'مطمئن شوید که رکوردهای قبلی را حذف کرده‌اید'
    ]
  },
  'cloudflare': {
    additionalSteps: [
      '1. در Cloudflare، به بخش "DNS" بروید',
      '2. مطمئن شوید که ابر نارنجی برای رکورد CNAME خاموش است',
      '3. TTL را روی "Auto" یا "1 minute" تنظیم کنید',
      '4. "Proxy status" را برای هر دو رکورد خاموش کنید'
    ],
    notes: [
      'Cloudflare ممکن است رکوردهای DNS را به شدت کش کند',
      'ممکن است نیاز به پاک کردن کش داشته باشید',
      'مطمئن شوید که آیکون ابر نارنجی خاکستری (فقط DNS) است'
    ]
  },
  'godaddy': {
    additionalSteps: [
      '1. در GoDaddy، به "DNS Management" بروید',
      '2. روی "Add" کلیک کنید تا رکورد جدید ایجاد کنید',
      '3. برای رکورد CNAME، "CNAME" را از منوی کشویی انتخاب کنید',
      '4. برای رکورد TXT، "TXT" را از منوی کشویی انتخاب کنید',
      '5. مطمئن شوید که نام کامل دامنه را در فیلد مقدار وارد کرده‌اید'
    ],
    notes: [
      'GoDaddy ممکن است زمان بیشتری برای انتشار DNS نیاز داشته باشد',
      'مطمئن شوید که پس از افزودن هر رکورد تغییرات را ذخیره کنید',
      'ممکن است تا 72 ساعت برای انتشار کامل نیاز باشد'
    ]
  },
  'namecheap': {
    additionalSteps: [
      '1. در Namecheap، به "Domain List" → "Manage" → "Advanced DNS" بروید',
      '2. از دکمه "Add New Record" برای افزودن رکوردهای جدید استفاده کنید',
      '3. برای CNAME، "CNAME Record" را از منوی کشویی انتخاب کنید',
      '4. برای TXT، "TXT Record" را از منوی کشویی انتخاب کنید',
      '5. TTL را روی "Automatic" برای به‌روزرسانی سریع‌تر تنظیم کنید'
    ],
    notes: [
      'Namecheap معمولاً زمان انتشار DNS خوبی دارد',
      'مطمئن شوید که رکوردهای متضاد موجود را حذف کرده‌اید',
      'تنظیم TTL روی "Automatic" برای به‌روزرسانی سریع‌تر توصیه می‌شود'
    ]
  }
};

async function updateDomainInstructions() {
  try {
    console.log('🔧 Updating domain instructions in database...\n');

    // Get all domains that need instructions
    const domains = await prisma.domain.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log(`Found ${domains.length} domains to update\n`);

    let updatedCount = 0;

    for (const domain of domains) {
      console.log(`📝 Processing domain: ${domain.domain} (${domain.type})`);

      // Generate instructions based on domain type
      const template = domainInstructionTemplates[domain.type] || domainInstructionTemplates.CUSTOM;
      
      // Replace placeholders with actual values
      const instructions = {
        domain: domain.domain,
        type: domain.type,
        records: template.records.map(record => ({
          ...record,
          value: record.value.replace('{businessId}', domain.businessId)
        })),
        instructions: template.instructions.map(instruction => 
          instruction.replace('{businessId}', domain.businessId)
        ),
        notes: template.notes
      };

      // Update domain with instructions
      await prisma.domain.update({
        where: { id: domain.id },
        data: {
          metadata: {
            ...domain.metadata,
            instructions: instructions,
            lastInstructionUpdate: new Date()
          }
        }
      });

      console.log(`✅ Updated instructions for ${domain.domain}`);
      updatedCount++;
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} domains`);
    
    // Display summary
    if (domains.length > 0) {
      console.log('\n📋 Updated Domains:');
      domains.forEach(domain => {
        console.log(`   - ${domain.domain} (${domain.type}) - ${domain.business.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error updating domain instructions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function addProviderInstructions() {
  try {
    console.log('\n🔧 Adding provider-specific instructions...\n');

    // Create a new table or add to existing metadata for provider instructions
    const providerData = {
      providers: providerInstructions,
      lastUpdated: new Date()
    };

    console.log('✅ Provider instructions prepared');
    console.log('\n📋 Available Providers:');
    Object.keys(providerInstructions).forEach(provider => {
      console.log(`   - ${provider}`);
    });

    return providerData;

  } catch (error) {
    console.error('❌ Error adding provider instructions:', error);
    throw error;
  }
}

async function createInstructionTemplates() {
  try {
    console.log('\n🔧 Creating instruction templates...\n');

    const templates = {
      custom: domainInstructionTemplates.CUSTOM,
      subdomain: domainInstructionTemplates.SUBDOMAIN,
      providers: providerInstructions,
      metadata: {
        version: '1.0',
        created: new Date(),
        description: 'Domain verification instruction templates'
      }
    };

    console.log('✅ Instruction templates created');
    console.log('\n📋 Template Types:');
    console.log('   - Custom Domain Instructions');
    console.log('   - Subdomain Instructions');
    console.log('   - Provider-specific Instructions');

    return templates;

  } catch (error) {
    console.error('❌ Error creating instruction templates:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Domain Instructions Setup Script');
    console.log('====================================\n');

    // Update existing domains
    await updateDomainInstructions();
    
    // Add provider instructions
    await addProviderInstructions();
    
    // Create instruction templates
    await createInstructionTemplates();

    console.log('\n🎉 Domain instructions setup completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Verify that domains have been updated with instructions');
    console.log('2. Test the instructions endpoint: GET /api/domains/:id/instructions');
    console.log('3. Check that the frontend displays instructions correctly');
    console.log('4. Consider adding more provider-specific instructions as needed');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  updateDomainInstructions,
  addProviderInstructions,
  createInstructionTemplates,
  domainInstructionTemplates,
  providerInstructions
}; 
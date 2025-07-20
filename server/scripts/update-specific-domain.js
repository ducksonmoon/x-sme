const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateSpecificDomain() {
  try {
    console.log('🔧 Updating specific domain with Persian instructions...\n');

    // Get the specific domain we know exists
    const domain = await prisma.domain.findFirst({
      where: {
        domain: 'x-sme.ir'
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

    if (!domain) {
      console.log('❌ Domain x-sme.ir not found');
      return;
    }

    console.log(`📝 Found domain: ${domain.domain} (${domain.type}) - ${domain.business.name}`);

    // Create Persian instructions
    const instructions = {
      domain: domain.domain,
      type: domain.type,
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
          value: `xsme-verification=${domain.businessId}`,
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
        `   - مقدار: xsme-verification=${domain.businessId}`,
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

    // Update domain with instructions
    const updatedDomain = await prisma.domain.update({
      where: { id: domain.id },
      data: {
        metadata: {
          ...domain.metadata,
          instructions: instructions,
          lastInstructionUpdate: new Date()
        }
      }
    });

    console.log(`✅ Successfully updated domain: ${updatedDomain.domain}`);
    console.log('📋 Instructions added:');
    console.log(`   - Records: ${instructions.records.length}`);
    console.log(`   - Instructions: ${instructions.instructions.length}`);
    console.log(`   - Notes: ${instructions.notes.length}`);

  } catch (error) {
    console.error('❌ Error updating domain:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSpecificDomain();
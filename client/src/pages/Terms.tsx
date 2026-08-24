import React from "react";
import { motion } from "framer-motion";

const sections = [
  {
    title: "پذیرش شرایط",
    body: "با استفاده از این سایت یا سفارش خدمات از مریخ، شرایط استفاده زیر را می‌پذیرید.",
  },
  {
    title: "خدمات ارائه‌شده",
    body: "مریخ خدمات طراحی و توسعه وب‌سایت، نرم‌افزار سفارشی، اپلیکیشن و راهکارهای هوش مصنوعی، و همچنین نرم‌افزارهای آماده (مدیریت انبار و کنترل کیفیت) ارائه می‌دهد. جزئیات هر پروژه — از جمله دامنه کار، زمان‌بندی و هزینه — پیش از شروع، جداگانه و به‌صورت مکتوب با مشتری توافق می‌شود.",
  },
  {
    title: "مالکیت معنوی",
    body: "مالکیت کد و طراحی نهایی هر پروژه سفارشی، پس از تسویه کامل هزینه توافق‌شده، به مشتری منتقل می‌شود. تا پیش از آن، حقوق مالکیت معنوی نزد مریخ باقی می‌ماند.",
  },
  {
    title: "محدوده مسئولیت",
    body: "مریخ برای کیفیت کاری که تحویل می‌دهد تلاش می‌کند، اما مسئولیتی در قبال خسارات ناشی از استفاده نادرست از محصول تحویل‌شده یا خدماتی که خارج از توافق مکتوب پروژه است، نمی‌پذیرد.",
  },
  {
    title: "تغییرات در شرایط",
    body: "این شرایط ممکن است در آینده به‌روزرسانی شود. نسخه فعلی همیشه در همین صفحه در دسترس است.",
  },
  {
    title: "تماس",
    body: "برای هر سوالی درباره این شرایط، از طریق صفحه تماس با ما در ارتباط باشید.",
  },
];

const Terms: React.FC = () => {
  return (
    <div className="overflow-hidden">
      <section className="py-20 md:py-28 bg-paper">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-ink mb-6">
              شرایط استفاده
            </h1>
            <p className="text-lg text-ink-soft leading-relaxed">
              قوانین و شرایطی که همکاری شما با مریخ بر اساس آن‌ها انجام
              می‌شود.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-line-soft">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex flex-col gap-10">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <h2 className="text-lg font-bold text-ink mb-2.5">
                  {section.title}
                </h2>
                <p className="text-sm text-ink-soft leading-relaxed">
                  {section.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;

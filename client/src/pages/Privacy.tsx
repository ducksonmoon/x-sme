import React from "react";
import { motion } from "framer-motion";

const sections = [
  {
    title: "چه اطلاعاتی جمع‌آوری می‌کنیم",
    body: "زمانی که فرم تماس در سایت را پر می‌کنید، نام، ایمیل و متن پیام شما را دریافت می‌کنیم. این اطلاعات فقط برای پاسخ‌گویی به درخواست شما استفاده می‌شود.",
  },
  {
    title: "نحوه استفاده از اطلاعات",
    body: "از اطلاعاتی که ارسال می‌کنید فقط برای پیگیری درخواست شما و ارتباط درباره پروژه احتمالی استفاده می‌کنیم. این اطلاعات برای تبلیغات یا هدف دیگری استفاده نمی‌شود.",
  },
  {
    title: "اشتراک‌گذاری با اشخاص ثالث",
    body: "اطلاعات شما را نمی‌فروشیم و در اختیار شرکت یا شخص ثالثی قرار نمی‌دهیم، مگر در مواردی که قانون ملزم کند.",
  },
  {
    title: "کوکی‌ها",
    body: "این سایت در حال حاضر از کوکی‌های ردیابی یا تبلیغاتی استفاده نمی‌کند. اگر در آینده ابزار تحلیل ترافیک اضافه شود، این بخش به‌روزرسانی خواهد شد.",
  },
  {
    title: "امنیت اطلاعات",
    body: "برای محافظت از اطلاعاتی که در اختیارمان می‌گذارید تلاش می‌کنیم، اما هیچ روش انتقال اطلاعات از طریق اینترنت صددرصد ایمن نیست.",
  },
  {
    title: "تماس برای سوالات حریم خصوصی",
    body: "اگر درباره این سیاست حریم خصوصی سوالی دارید، از طریق صفحه تماس با ما در ارتباط باشید.",
  },
];

const Privacy: React.FC = () => {
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
              حریم خصوصی
            </h1>
            <p className="text-lg text-ink-soft leading-relaxed">
              این صفحه توضیح می‌دهد مریخ چه اطلاعاتی از شما جمع‌آوری می‌کند و
              با آن‌ها چه می‌کند.
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

export default Privacy;

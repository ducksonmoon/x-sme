import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Target,
  Users,
  Award,
  Rocket,
  Code2,
  Globe,
  Brain,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@components/ui/button";

const values = [
  {
    icon: Target,
    title: "تمرکز بر نتیجه",
    description:
      "هر پروژه را با نگاه به هدف کسب‌وکار مشتری طراحی و اجرا می‌کنیم، نه فقط تحویل کد.",
  },
  {
    icon: Users,
    title: "همکاری نزدیک",
    description:
      "در طول پروژه در ارتباط مستقیم با تیم شما هستیم تا هیچ جزئیاتی از دست نرود.",
  },
  {
    icon: Award,
    title: "کیفیت فنی",
    description:
      "معماری تمیز، کد قابل نگهداری و توجه به امنیت و مقیاس‌پذیری در همه پروژه‌ها.",
  },
  {
    icon: Rocket,
    title: "رشد مستمر",
    description:
      "از وب و نرم‌افزار تا هوش مصنوعی، دائماً روی فناوری‌های جدید سرمایه‌گذاری می‌کنیم.",
  },
];

const expertise = [
  {
    icon: Globe,
    title: "وب‌سایت",
    description: "وب‌سایت‌های شرکتی، فروشگاهی و اختصاصی برای کسب‌وکارهای B2B و B2C.",
  },
  {
    icon: Code2,
    title: "نرم‌افزار و API",
    description: "نرم‌افزار سفارشی، پنل‌های مدیریتی و سرویس‌های API مقیاس‌پذیر.",
  },
  {
    icon: Brain,
    title: "هوش مصنوعی",
    description: "راهکارهای مبتنی بر هوش مصنوعی برای اتوماسیون و تحلیل داده.",
  },
];

const About: React.FC = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="py-20 md:py-28 bg-paper">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-ink mb-6">
              درباره ما
            </h1>
            <p className="text-lg text-ink-soft leading-relaxed">
              ما تیمی از توسعه‌دهندگان و طراحان هستیم که به شرکت‌ها کمک می‌کنیم
              با وب‌سایت، نرم‌افزار و راهکارهای هوش مصنوعی، کسب‌وکار خود را
              دیجیتال کنند و رشد دهند. از ایده اولیه تا پشتیبانی پس از
              راه‌اندازی، در کنار مشتریان خود هستیم.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Expertise */}
      <section className="py-20 bg-white border-t border-line-soft">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">
              حوزه‌های تخصصی
            </h2>
            <p className="text-ink-soft max-w-2xl mx-auto">
              سه ستون اصلی کاری ما که در کنار هم، یک راهکار کامل دیجیتال را
              برای کسب‌وکار شما می‌سازند.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {expertise.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border border-line border-t-[3px] border-t-mars rounded-md p-7"
              >
                <item.icon className="w-8 h-8 text-navy-700 mb-4" />
                <h3 className="text-lg font-bold text-ink mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-paper border-t border-line-soft">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">
              ارزش‌های ما
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center bg-white rounded-md p-6 border border-line"
              >
                <value.icon className="w-7 h-7 mx-auto text-mars-dark mb-4" />
                <h3 className="font-semibold text-ink mb-2">{value.title}</h3>
                <p className="text-sm text-ink-soft">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white border-t border-line-soft">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-ink mb-4">
            می‌خواهید با ما همکاری کنید؟
          </h2>
          <p className="text-ink-soft mb-8">
            درباره پروژه خود با ما صحبت کنید تا بهترین راهکار را پیشنهاد دهیم.
          </p>
          <Button asChild size="lg" className="bg-mars text-paper hover:bg-[oklch(62%_0.15_35)] hover:text-paper">
            <Link to="/contact" className="flex items-center gap-2">
              تماس با ما
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About;

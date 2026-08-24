import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  ShieldCheck,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { Button } from "@components/ui/button";
import LogoMark from "@components/LogoMark";
import { services, portfolio } from "@/data/site";

interface Product {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
}

const MotionLink = motion(Link);

const products: Product[] = [
  {
    icon: Package,
    title: "مدیریت انبار",
    description:
      "کنترل موجودی، ورود و خروج کالا و گزارش‌گیری انبار در یک نرم‌افزار ساده و آماده استفاده.",
    features: [
      "رهگیری لحظه‌ای موجودی در چند انبار",
      "اسکن بارکد و ثبت سریع تراکنش",
      "هشدار کمبود موجودی و سفارش مجدد",
      "داشبورد گزارش‌گیری و خروجی اکسل",
    ],
  },
  {
    icon: ShieldCheck,
    title: "کنترل کیفیت (QA)",
    description:
      "مدیریت تست، ثبت مغایرت‌ها و پیگیری کیفیت محصول یا خط تولید، برای تیم‌های کوچک و متوسط.",
    features: [
      "مدیریت چک‌لیست و سناریوهای تست",
      "ثبت و پیگیری مغایرت تا رفع نهایی",
      "گزارش کیفیت به تفکیک محصول/خط",
      "همکاری تیمی و تاریخچه کامل تست‌ها",
    ],
  },
];

const process = [
  { title: "شناخت نیاز", description: "بررسی اهداف کسب‌وکار شما و تدوین راهکار مناسب." },
  { title: "طراحی", description: "طراحی تجربه کاربری و معماری فنی متناسب با پروژه." },
  { title: "توسعه", description: "پیاده‌سازی با تمرکز بر کیفیت، سرعت و مقیاس‌پذیری." },
  { title: "پشتیبانی", description: "تحویل، آموزش و پشتیبانی مستمر پس از راه‌اندازی." },
];

const trustNames = ["Tabeshraad", "Nipou", "Zarandooz", "FBC", "Jamnevisi"];

const Home: React.FC = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row items-center gap-12 py-24 md:py-28">
          <div className="flex-1 flex flex-col items-start gap-6 min-w-0">
            <span className="text-xs font-bold tracking-wider text-mars-dark uppercase">
              استودیوی وب، نرم‌افزار و هوش مصنوعی مریخ
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-ink leading-tight">
              نرم‌افزار و وب‌سایتی که{" "}
              <span className="text-mars">واقعاً</span> کار می‌کند
            </h1>
            <p className="text-lg md:text-xl text-ink-soft leading-relaxed max-w-xl">
              مدیریت انبار و کنترل کیفیت را به‌صورت آماده تحویل می‌دهیم؛
              وب‌سایت، نرم‌افزار سفارشی و راهکار هوش مصنوعی را از صفر برایتان
              می‌سازیم.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
              <Button asChild size="lg" className="bg-mars text-paper hover:bg-[oklch(62%_0.15_35)] hover:text-paper">
                <a href="#products" className="flex items-center gap-2">
                  مشاهده محصولات
                  <ArrowLeft className="w-4 h-4" />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild className="border-line text-ink hover:border-navy-700">
                <a href="#services" className="flex items-center gap-2">
                  خدمات سفارشی
                  <ArrowLeft className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
          <div className="flex-shrink-0 relative w-[280px] h-[280px] md:w-[340px] md:h-[340px] flex items-center justify-center">
            <span className="absolute top-[18%] left-[12%] w-1.5 h-1.5 rounded-full bg-mars animate-pulse" />
            <span
              className="absolute top-[70%] left-[20%] w-1 h-1 rounded-full bg-navy-700 animate-pulse"
              style={{ animationDelay: "0.9s" }}
            />
            <span
              className="absolute top-[12%] right-[10%] w-1.5 h-1.5 rounded-full bg-navy-700 animate-pulse"
              style={{ animationDelay: "1.8s" }}
            />
            <LogoMark large />
          </div>
        </div>
      </section>

      {/* Trust strip (marquee) */}
      <section className="marquee-wrap border-t border-b border-line-soft overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl py-6 flex items-center gap-7">
          <span className="text-sm font-semibold text-ink-faint whitespace-nowrap shrink-0">
            با مریخ ساخته‌اند
          </span>
          <div
            className="overflow-hidden flex-1"
            style={{
              maskImage:
                "linear-gradient(to left, transparent, black 8%, black 92%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to left, transparent, black 8%, black 92%, transparent)",
            }}
          >
            <div className="marquee-track">
              {[...trustNames, ...trustNames].map((name, i) => (
                <span
                  key={i}
                  className="font-bold text-base text-ink-soft"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-24 bg-white border-b border-line-soft">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col gap-3 max-w-xl mb-12">
            <span className="text-xs font-bold tracking-wider text-mars-dark uppercase">
              محصولات مریخ
            </span>
            <h2 className="text-3xl font-bold text-ink">
              نرم‌افزارهای آماده برای کسب‌وکار شما
            </h2>
            <p className="text-ink-soft leading-relaxed">
              جدا از پروژه‌های سفارشی، مریخ نرم‌افزارهایی آماده و
              مقرون‌به‌صرفه برای کسب‌وکارهای کوچک و متوسط ارائه می‌دهد.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border border-line border-t-[3px] border-t-mars rounded-md p-8"
              >
                <div className="w-9 h-9 flex items-center justify-center text-navy-700 mb-5">
                  <product.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-ink mb-2.5">
                  {product.title}
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed mb-5">
                  {product.description}
                </p>
                <div className="flex flex-col gap-2.5 mb-6">
                  {product.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-mars-dark mt-0.5 shrink-0" />
                      <span className="text-sm text-ink-soft">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" asChild className="border-line text-ink hover:border-navy-700 h-11 text-sm">
                  <Link to="/contact">درخواست دمو</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div className="flex flex-col gap-3 max-w-xl">
              <span className="text-xs font-bold tracking-wider text-mars-dark uppercase">
                خدمات سفارشی
              </span>
              <h2 className="text-3xl font-bold text-ink">
                فراتر از محصولات آماده، پروژه اختصاصی خودتان را بسازید
              </h2>
            </div>
            <Link
              to="/services"
              className="flex items-center gap-2 text-sm font-bold text-mars-dark hover:underline shrink-0"
            >
              مشاهده همه خدمات
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group border border-line rounded-md p-7 hover:border-mars/40 hover:bg-mars-tint/30 transition-colors"
              >
                <div className="w-11 h-11 rounded-lg bg-mars-tint flex items-center justify-center mb-5 transition-transform group-hover:-rotate-6 group-hover:scale-110">
                  <service.icon className="w-5 h-5 text-mars-dark" />
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="py-24 bg-white border-y border-line-soft">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div className="flex flex-col gap-3 max-w-xl">
              <span className="text-xs font-bold tracking-wider text-mars-dark uppercase">
                نمونه‌کارها
              </span>
              <h2 className="text-3xl font-bold text-ink">
                پروژه‌هایی که ساخته‌ایم
              </h2>
            </div>
            <Link
              to="/portfolio"
              className="flex items-center gap-2 text-sm font-bold text-mars-dark hover:underline shrink-0"
            >
              مشاهده همه نمونه‌کارها
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.map((item, index) => (
              <MotionLink
                key={item.name}
                to={`/portfolio/${item.slug}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group flex flex-col gap-4 border border-line rounded-md p-6 hover:border-mars/40 hover:bg-mars-tint/20 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-lg font-bold text-ink">{item.name}</span>
                  <ArrowLeft className="w-4 h-4 text-mars-dark shrink-0 transition-transform group-hover:-translate-x-1" />
                </div>
                <p className="text-sm text-ink-soft leading-relaxed flex-1">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium text-mars-dark bg-mars-tint px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </MotionLink>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col gap-3 max-w-xl mb-16">
            <span className="text-xs font-bold tracking-wider text-mars-dark uppercase">
              فرآیند
            </span>
            <h2 className="text-3xl font-bold text-ink">از ایده تا اجرا</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-12">
            {process.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-mars text-paper flex items-center justify-center font-extrabold text-sm">
                    {index + 1}
                  </div>
                  {index !== process.length - 1 && (
                    <div className="hidden md:block flex-1 h-px bg-line" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-ink mb-1.5">{step.title}</h3>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA (the one bold moment) */}
      <section className="relative overflow-hidden bg-navy-950">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(600px 300px at 50% -20%, oklch(62% 0.16 38 / 16%), transparent 65%)",
          }}
        />
        <div className="relative container mx-auto px-4 max-w-4xl py-24 text-center flex flex-col items-center gap-5">
          <LogoMark variant="dark" />
          <h2 className="text-3xl font-bold text-white max-w-xl">
            پروژه بعدی شما، اینجا شروع می‌شود
          </h2>
          <p className="text-white/60 max-w-xl leading-relaxed">
            چه دنبال نرم‌افزار آماده باشید، چه یک وب‌سایت یا پروژه سفارشی —
            برایمان بنویسید چه چیزی می‌سازیم.
          </p>
          <Button asChild size="lg" className="bg-mars text-paper hover:bg-[oklch(62%_0.15_35)] hover:text-paper mt-2">
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

export default Home;

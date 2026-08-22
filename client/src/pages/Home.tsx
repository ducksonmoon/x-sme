import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe,
  Code2,
  Brain,
  Smartphone,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  Sparkles,
  Layers,
  Rocket,
} from "lucide-react";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Badge } from "@components/ui/badge";

interface Service {
  icon: React.ElementType;
  title: string;
  description: string;
  points: string[];
}

interface PortfolioItem {
  name: string;
  description: string;
  url: string;
  tags: string[];
}

const services: Service[] = [
  {
    icon: Globe,
    title: "طراحی و توسعه وب‌سایت",
    description:
      "طراحی وب‌سایت‌های شرکتی، فروشگاهی و اختصاصی با تمرکز بر تجربه کاربری و سرعت.",
    points: ["وب‌سایت شرکتی و فروشگاهی", "طراحی UI/UX اختصاصی", "بهینه‌سازی SEO و سرعت"],
  },
  {
    icon: Code2,
    title: "توسعه نرم‌افزار و API",
    description:
      "طراحی و پیاده‌سازی نرم‌افزارهای سفارشی، پنل‌های مدیریتی و سرویس‌های API برای کسب‌وکارها.",
    points: ["نرم‌افزار سفارشی B2B/B2C", "طراحی و توسعه API", "یکپارچه‌سازی سیستم‌ها"],
  },
  {
    icon: Brain,
    title: "راهکارهای هوش مصنوعی",
    description:
      "پیاده‌سازی راهکارهای مبتنی بر هوش مصنوعی برای اتوماسیون، تحلیل داده و بهبود فرآیندها.",
    points: ["اتوماسیون فرآیندها با AI", "چت‌بات و دستیار هوشمند", "تحلیل و پردازش داده"],
  },
  {
    icon: Smartphone,
    title: "اپلیکیشن و محصولات دیجیتال",
    description:
      "ساخت اپلیکیشن‌های وب و موبایل به‌عنوان محصول مستقل برای شرکت‌ها و استارتاپ‌ها.",
    points: ["اپلیکیشن وب و موبایل", "MVP و محصولات استارتاپی", "پشتیبانی و توسعه مستمر"],
  },
];

const portfolio: PortfolioItem[] = [
  {
    name: "Tabeshraad",
    description: "طراحی وب‌سایت شرکتی",
    url: "https://tabeshraad.co/",
    tags: ["وب‌سایت"],
  },
  {
    name: "Nipou",
    description: "طراحی وب‌سایت شرکتی",
    url: "https://nipoucompany.com/",
    tags: ["وب‌سایت"],
  },
  {
    name: "Zarandooz",
    description: "توسعه اپلیکیشن، سرویس‌های API و وب‌سایت",
    url: "https://zarandooz.app/",
    tags: ["اپلیکیشن", "API", "وب‌سایت"],
  },
  {
    name: "FBC",
    description: "توسعه نرم‌افزار",
    url: "https://fbc.ir/",
    tags: ["نرم‌افزار"],
  },
  {
    name: "Jamnevisi",
    description: "طراحی وب‌سایت و خدمات آنلاین",
    url: "https://jamnevisi.ir/",
    tags: ["وب‌سایت", "خدمات"],
  },
];

const process = [
  { title: "شناخت نیاز", description: "بررسی اهداف کسب‌وکار شما و تدوین راهکار مناسب." },
  { title: "طراحی", description: "طراحی تجربه کاربری و معماری فنی متناسب با پروژه." },
  { title: "توسعه", description: "پیاده‌سازی با تمرکز بر کیفیت، سرعت و مقیاس‌پذیری." },
  { title: "پشتیبانی", description: "تحویل، آموزش و پشتیبانی مستمر پس از راه‌اندازی." },
];

const Home: React.FC = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative py-24 md:py-32">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100 px-4 py-1.5 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              شریک فنی کسب‌وکار شما
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              طراحی وب‌سایت، نرم‌افزار و{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                راهکارهای هوش مصنوعی
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
              ما به شرکت‌ها در حوزه B2B و B2C کمک می‌کنیم تا با وب‌سایت، نرم‌افزار،
              API و راهکارهای هوش مصنوعی، کسب‌وکار خود را رشد دهند.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25"
              >
                <Link to="/contact" className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  شروع پروژه با ما
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#portfolio" className="flex items-center">
                  مشاهده نمونه‌کارها
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              خدمات ما
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              از طراحی وب‌سایت تا نرم‌افزارهای سفارشی و راهکارهای هوش مصنوعی، یک تیم فنی برای همه نیازهای دیجیتال شما.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4">
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start text-sm text-gray-600"
                        >
                          <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              نمونه‌کارها
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              بخشی از پروژه‌هایی که برای کسب‌وکارها طراحی و توسعه داده‌ایم.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group"
              >
                <Card className="h-full border-gray-200 group-hover:border-blue-300 group-hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {item.name}
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </CardTitle>
                    </div>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-blue-100 text-blue-700 hover:bg-blue-100"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              فرآیند همکاری
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              از ایده تا اجرا، مسیری شفاف و ساختاریافته برای هر پروژه.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-xl font-bold mb-4">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Layers className="w-10 h-10 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            پروژه بعدی خود را با ما شروع کنید
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            چه به یک وب‌سایت جدید نیاز دارید، چه یک نرم‌افزار سفارشی یا راهکار
            هوش مصنوعی، تیم ما آماده همکاری است.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50"
          >
            <Link to="/contact" className="flex items-center">
              <Rocket className="w-4 h-4 mr-2" />
              تماس با ما
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;

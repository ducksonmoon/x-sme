import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  CreditCard,
  MessageSquare,
  BarChart3,
  Users,
  Globe,
  Smartphone,
  Shield,
  Zap,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Palette,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";

const Features: React.FC = () => {
  const mainFeatures = [
    {
      icon: Calendar,
      title: "مدیریت زمان‌بندی هوشمند",
      description:
        "سیستم پیشرفته رزرو با قابلیت تنظیم ساعات کاری، تعطیلات و مدیریت اتوماتیک اسلات‌های زمانی.",
      benefits: ["رزرو آنلاین ۲۴/۷", "مدیریت تعطیلات", "جلوگیری از تداخل"],
    },
    {
      icon: CreditCard,
      title: "پرداخت امن و محلی",
      description:
        "یکپارچگی با تمام درگاه‌های پرداخت معتبر ایران برای تجربه پرداخت سریع و ایمن.",
      benefits: [
        "پاسارگاد، سامان، زرین‌پال",
        "پرداخت آنلاین ایمن",
        "تسویه خودکار",
      ],
    },
    {
      icon: MessageSquare,
      title: "یادآوری‌های هوشمند",
      description:
        "سیستم یادآوری خودکار از طریق پیامک و تلگرام برای کاهش غیبت مشتریان.",
      benefits: ["یادآوری پیامکی", "اطلاع‌رسانی تلگرام", "کاهش ۷۰٪ غیبت"],
    },
    {
      icon: BarChart3,
      title: "آنالیتیکس پیشرفته",
      description:
        "گزارش‌های تفصیلی از عملکرد کسب‌وکار، درآمد، و رضایت مشتریان.",
      benefits: ["گزارش‌های آماری", "تحلیل درآمد", "پیش‌بینی فروش"],
    },
    {
      icon: Users,
      title: "مدیریت تیم",
      description: "سیستم دسترسی مبتنی بر نقش برای مدیران، کارکنان و مشتریان.",
      benefits: ["سطوح دسترسی", "مدیریت کاربران", "کنترل اجازات"],
    },
    {
      icon: Globe,
      title: "کار با هر پلتفرمی",
      description:
        "ویجت قابل تعمیم که در هر وب‌سایتی کار می‌کند - با پشتیبانی ویژه WordPress.",
      benefits: [
        "کار در هر پلتفرم",
        "پلاگین اختصاصی WordPress",
        "نصب ۳ دقیقه‌ای",
      ],
    },
  ];

  const additionalFeatures = [
    {
      icon: Smartphone,
      title: "موبایل فرندلی",
      description: "بهینه‌سازی کامل برای موبایل",
    },
    {
      icon: Shield,
      title: "امنیت بالا",
      description: "رمزگذاری پیشرفته و حفاظت از داده‌ها",
    },
    {
      icon: Zap,
      title: "سرعت بالا",
      description: "بارگذاری سریع و عملکرد بهینه",
    },
    {
      icon: Clock,
      title: "پشتیبانی ۲۴/۷",
      description: "تیم پشتیبانی آماده کمک همیشگی",
    },
  ];

  const useCases = [
    {
      title: "سالن‌های زیبایی",
      description: "مدیریت نوبت آرایش، کوتاهی مو، و سایر خدمات زیبایی",
      features: ["رزرو خدمات متنوع", "مدیریت آرایشگران", "پکیج‌های خدمات"],
    },
    {
      title: "کلینیک‌ها و مطب‌ها",
      description: "سیستم نوبت‌دهی برای پزشکان و مراکز درمانی",
      features: ["تقویم پزشک", "تاریخچه ویزیت", "یادآوری دارو"],
    },
    {
      title: "موسسات آموزشی",
      description: "مدیریت کلاس‌ها، دوره‌ها و رزرو جلسات خصوصی",
      features: ["مدیریت دوره‌ها", "حضور و غیاب", "پرداخت شهریه"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              <Star className="w-3 h-3 mr-2" />
              ویژگی‌های پیشرفته
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              همه چیز که نیاز دارید
              <span className="text-blue-600 block">در یک پلتفرم</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              X-SME مجموعه کاملی از ابزارهای مدرن برای مدیریت کسب‌وکار شما ارائه
              می‌دهد. از رزرو آنلاین تا آنالیتیکس پیشرفته، همه چیز اینجاست.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              ویژگی‌های اصلی
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              ابزارهای قدرتمندی که کسب‌وکار شما را به سطح بعدی می‌برد
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="space-y-3">
                      {feature.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              مزایای اضافی
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              ویژگی‌های بیشتری که تجربه شما را کامل می‌کند
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WordPress Integration Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <div className="text-5xl font-bold text-white">+</div>
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur text-white text-3xl font-bold">
                W
              </div>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              کار با هر پلتفرمی - ویژه WordPress
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              ویجت ما در هر وب‌سایتی کار می‌کند - HTML، React، Vue، Drupal،
              Joomla و... اما چون WordPress محبوب‌ترین پلتفرم است (۴۰٪+
              وب‌سایت‌ها)، پلاگین اختصاصی برایش ساخته‌ایم.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white/10 backdrop-blur border-0 text-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">نصب سریع همه‌جا</h3>
                  <p className="text-white/80 leading-relaxed">
                    فقط ۲ خط کد برای هر سایت - و پلاگین ۳ دقیقه‌ای ویژه
                    WordPress
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white/10 backdrop-blur border-0 text-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">آسان برای همه</h3>
                  <p className="text-white/80 leading-relaxed">
                    کپی-پیست ساده برای همه سایت‌ها + رابط آسان ویژه WordPress
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white/10 backdrop-blur border-0 text-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Palette className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">سازگاری جهانی</h3>
                  <p className="text-white/80 leading-relaxed">
                    کار با هر فریمورک، تم و پلتفرم - ریسپانسیو در همه دستگاه‌ها
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
              asChild
            >
              <Link to="/widget-docs#wordpress-guide">
                راهنمای کامل WordPress
                <ArrowRight className="w-5 h-5 mr-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              مناسب برای هر کسب‌وکار
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              راه‌حل ما برای انواع مختلف کسب‌وکارها طراحی شده است
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl text-gray-900">
                      {useCase.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {useCase.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {useCase.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="py-16 px-8">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                  آماده شروع هستید؟
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                  همین حالا شروع کنید و ببینید چطور X-SME می‌تواند کسب‌وکارتان
                  را متحول کند
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary" className="text-lg">
                    مشاهده دمو
                    <ArrowRight className="w-5 h-5 mr-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    شروع رایگان
                    <ArrowRight className="w-5 h-5 mr-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Features;

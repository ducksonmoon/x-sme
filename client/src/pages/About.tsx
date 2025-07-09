import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Target,
  Award,
  Heart,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Rocket,
  Eye,
  Star,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  CheckCircle,
  CreditCard,
  Code,
  Database,
  Cloud,
  Smartphone,
  MessageSquare,
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

const About: React.FC = () => {
  const coreValues = [
    {
      icon: Users,
      title: "مشتری محوری",
      description:
        "ما همیشه نیازهای کسب‌وکارهای کوچک و متوسط ایران را در اولویت قرار می‌دهیم",
      features: ["۹۸٪ رضایت مشتری", "پشتیبانی ۲۴/۷", "مشاوره رایگان"],
      color: "bg-blue-500",
    },
    {
      icon: Rocket,
      title: "نوآوری مداوم",
      description:
        "با استفاده از جدیدترین تکنولوژی‌ها همیشه در مقدمه تحولات دیجیتال هستیم",
      features: ["۵۰+ ویژگی جدید سالانه", "تکنولوژی روز دنیا", "تحقیق و توسعه"],
      color: "bg-purple-500",
    },
    {
      icon: Award,
      title: "کیفیت بی‌نظیر",
      description:
        "تمام محصولات ما با بالاترین استانداردهای کیفیت و امنیت طراحی می‌شوند",
      features: ["تست کامل محصولات", "امنیت پیشرفته", "کیفیت تضمینی"],
      color: "bg-green-500",
    },
    {
      icon: Heart,
      title: "پشتیبانی دل‌سوزانه",
      description: "تیم پشتیبانی ما با تخصص در تمام لحظات کنار شماست",
      features: ["پاسخ فوری", "حل مشکل ۱۰۰٪", "راهنمایی کامل"],
      color: "bg-orange-500",
    },
  ];

  const milestones = [
    {
      year: "۱۴۰۱",
      title: "تأسیس X-SME",
      description: "شروع سفر ما با هدف کمک به کسب‌وکارهای کوچک ایرانی",
      icon: Rocket,
      stat: "شروع",
    },
    {
      year: "۱۴۰۲",
      title: "اولین ۱۰۰ مشتری",
      description: "رسیدن به ۱۰۰ مشتری راضی و شروع رشد سریع",
      icon: TrendingUp,
      stat: "۱۰۰ مشتری",
    },
    {
      year: "۱۴۰۳",
      title: "گسترش سراسری",
      description: "ارائه خدمات در سراسر کشور و رسیدن به ۵۰۰ مشتری",
      icon: Globe,
      stat: "۵۰۰ مشتری",
    },
    {
      year: "آینده",
      title: "محصولات جدید",
      description: "راه‌اندازی ویژگی‌های نوین و توسعه بین‌المللی",
      icon: Star,
      stat: "۱۰۰۰+ مشتری",
    },
  ];

  const techStack = [
    {
      title: "Frontend",
      tech: "React & TypeScript",
      description: "رابط کاربری مدرن و کامپوننت قابل تعمیم",
      features: ["عملکرد سریع", "UI مدرن", "نصب آسان"],
      icon: Code,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Backend",
      tech: "Node.js & Express",
      description: "سرور قدرتمند برای مدیریت رزروها و پردازش پرداخت‌ها",
      features: ["API سریع", "مقیاس‌پذیری", "امنیت بالا"],
      icon: Database,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Database",
      tech: "PostgreSQL",
      description: "پایگاه داده قابل اعتماد برای ذخیره اطلاعات",
      features: ["قابلیت اطمینان", "عملکرد بالا", "ایمنی داده‌ها"],
      icon: Database,
      color: "from-purple-500 to-indigo-500",
    },
    {
      title: "Payment",
      tech: "درگاه‌های ایرانی",
      description: "یکپارچگی با پاسارگاد، سامان و زرین‌پال",
      features: ["پرداخت محلی", "تراکنش امن", "تسویه سریع"],
      icon: CreditCard,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Notifications",
      tech: "SMS & Telegram",
      description: "سیستم یادآوری هوشمند برای کاهش غیبت",
      features: ["پیامک فارسی", "تلگرام بات", "یادآوری خودکار"],
      icon: MessageSquare,
      color: "from-pink-500 to-rose-500",
    },
    {
      title: "Infrastructure",
      tech: "Cloud Hosting",
      description: "میزبانی ابری با آپتایم بالا و عملکرد سریع",
      features: ["۹۹.۹٪ آپتایم", "CDN سریع", "پشتیبان‌گیری"],
      icon: Cloud,
      color: "from-gray-500 to-slate-500",
    },
  ];

  const stats = [
    { label: "محلی‌سازی", value: "۱۰۰٪", description: "طراحی ویژه ایران" },
    {
      label: "درگاه پرداخت",
      value: "۳+",
      description: "پاسارگاد، سامان، زرین‌پال",
    },
    { label: "تکنولوژی", value: "React", description: "سریع و قابل اعتماد" },
    { label: "در دسترس", value: "۲۴/۷", description: "سرویس پیوسته" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge className="inline-flex items-center gap-2 mb-6 bg-blue-50 text-blue-700 border-blue-200">
              <MapPin className="w-4 h-4" />
              تهران، ایران
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              اولین ویجت رزرو
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ساخت ایران
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-4xl mx-auto">
              نخستین سیستم رزرو آنلاین که مخصوص کسب‌وکارهای ایرانی طراحی شده
              است. ویجت هوشمند و سبکی که در کمتر از ۵ دقیقه در وب‌سایت شما نصب
              می‌شود.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {stat.label}
                      </div>
                      <div className="text-xs text-gray-600">
                        {stat.description}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              چرا این محصول؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              مشکل واقعی و راه‌حل محلی
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Problem */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-6 flex items-center justify-center shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    مشکل موجود
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    کسب‌وکارهای خدماتی ایران مشتریان زیادی از دست می‌دهند چون
                    سیستم رزرو مناسبی ندارند. زنگ‌های مکرر، دفتر کاغذی و حضور ۲۴
                    ساعته پشت تلفن کسل‌کننده و غیرعملی است.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "۷۰٪ مشتریان وقت خودشان رزرو نکنند، نمی‌آیند",
                      "راه‌حل‌های خارجی گران و بدون درگاه پرداخت",
                      "سیستم‌های محلی پیچیده یا قدیمی هستند",
                      "هیچ سیستمی با پیامک و تلگرام ایرانی کار نمی‌کند",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Solution */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-6 flex items-center justify-center shadow-lg">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    راه‌حل ما
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    ویجت ساده‌ای که فقط با کپی یک کد به سایت شما اضافه می‌شود و
                    بلافاصله مشتریانتان می‌توانند نوبت بگیرند، بیعانه پرداخت
                    کنند و یادآوری دریافت کنند.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "نصب ۵ دقیقه‌ای - فقط یک کد کپی کنید",
                      "درگاه‌های ایرانی: پاسارگاد، سامان، زرین‌پال",
                      "یادآوری هوشمند با پیامک و تلگرام",
                      "کاهش ۸۰٪ غیبت مشتریان با سیستم بیعانه",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ارزش‌های بنیادی ما
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              اصول و ارزش‌هایی که در DNA ما نهفته و ما را در مسیر موفقیت
              راهنمایی می‌کنند
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {coreValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full group">
                  <CardContent className="p-8">
                    <div
                      className={`w-16 h-16 ${value.color} rounded-2xl mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <value.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {value.description}
                    </p>
                    <ul className="space-y-3">
                      {value.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${value.color}`}
                          ></div>
                          <span className="text-sm text-gray-600">
                            {feature}
                          </span>
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

      {/* Company Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              سفر موفقیت ما
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نگاهی به مراحل مهم رشد و توسعه X-SME
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full text-center">
                  <CardContent className="p-8">
                    <Badge
                      variant="outline"
                      className="text-blue-600 border-blue-300 mb-4"
                    >
                      {milestone.year}
                    </Badge>
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                      <milestone.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {milestone.description}
                    </p>
                    <div className="text-2xl font-bold text-blue-600">
                      {milestone.stat}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              تکنولوژی مدرن و محلی
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              پشته فناوری انتخاب شده برای ایجاد بهترین تجربه کاربری و عملکرد
              بالا
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full overflow-hidden">
                  <div
                    className={`bg-gradient-to-br ${tech.color} p-6 text-center text-white`}
                  >
                    <tech.icon className="w-8 h-8 mx-auto mb-3" />
                    <h3 className="text-xl font-bold mb-1">{tech.title}</h3>
                    <p className="text-sm opacity-90">{tech.tech}</p>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {tech.description}
                    </p>
                    <ul className="space-y-2">
                      {tech.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full bg-gradient-to-r ${tech.color}`}
                          ></div>
                          <span className="text-sm text-gray-600">
                            {feature}
                          </span>
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center backdrop-blur">
              <Rocket className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              آماده شروع هستید؟
            </h2>
            <p className="text-xl text-blue-100 mb-8 opacity-95 max-w-3xl mx-auto leading-relaxed">
              آیا می‌خواهید مشتریانتان ۲۴ ساعته بتوانند نوبت بگیرند؟ دیگر نگران
              غیبت ناگهانی نباشید؟ در کمتر از ۵ دقیقه سیستم رزرو حرفه‌ای داشته
              باشید؟
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                مشاهده دمو
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
              >
                <Phone className="w-5 h-5 mr-2" />
                صحبت با سازنده
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
              >
                <Mail className="w-5 h-5 mr-2" />
                اطلاعات بیشتر
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-blue-100 opacity-90">
              <div className="text-center">
                <div className="text-2xl font-bold">محلی</div>
                <div className="text-sm">طراحی ویژه ایران</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">ساده</div>
                <div className="text-sm">نصب با یک خط کد</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">مقرون‌به‌صرفه</div>
                <div className="text-sm">هزینه یکباره کم</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;

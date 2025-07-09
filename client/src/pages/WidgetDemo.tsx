import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Code,
  Copy,
  Check,
  Play,
  Phone,
  CheckCircle,
  Rocket,
  Calendar,
  PlayCircle,
  Zap,
  ArrowRight,
  Globe,
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
import BookingWidget from "@components/BookingWidget";

const WidgetDemo: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const embedCode = `<!-- مرحله ۱: اضافه کردن اسکریپت -->
<script src="https://widget.x-sme.ir/widget.js"></script>

<!-- مرحله ۲: اضافه کردن ویجت -->
<div id="xsme-booking-widget" 
     data-business-id="your-business-id"
     data-theme="light"
     data-primary-color="#3b82f6"
     data-border-radius="8">
</div>

<!-- مرحله ۳: تنظیم رویدادها (اختیاری) -->
<script>
// رویداد تکمیل رزرو
window.xsmeOnBookingComplete = function(booking) {
    console.log('رزرو تکمیل شد:', booking);
    alert('رزرو شما با موفقیت ثبت شد!');
    
    // ارسال به گوگل آنالیتیکس
    if (window.gtag) {
        gtag('event', 'booking_complete', {
            booking_id: booking.id,
            service_name: booking.serviceName,
            amount: booking.amount
        });
    }
};

// رویداد انتخاب سرویس
window.xsmeOnServiceSelected = function(service) {
    console.log('سرویس انتخاب شد:', service);
};

// رویداد خطا
window.xsmeOnError = function(error) {
    console.error('خطا در ویجت:', error);
};
</script>`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-blue-100 text-blue-700 border-blue-200 text-lg px-6 py-2">
              <Play className="w-4 h-4 mr-2" />
              دمو زنده ویجت
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              ببینید چطور کار می‌کند
              <span className="text-blue-600 block">ویجت رزرو هوشمند</span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
              مشتریان راحت نوبت می‌گیرند و شما ۲۴ ساعت درآمد دارید
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="text-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                <PlayCircle className="ml-2 h-5 w-5" />
                مشاهده دمو
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Phone className="ml-2 h-5 w-5" />
                مشاوره رایگان
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 border-indigo-200">
              🎯 امتحان کنید
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              همین الان امتحان کنید
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              ویجت رزرو را تست کنید و ببینید چطور کار می‌کند
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
            {/* Widget Demo */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <Card className="border-0 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-3">
                      <Calendar className="w-6 h-6" />
                      ویجت رزرو آنلاین
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm">زنده</span>
                    </div>
                  </div>
                  <CardDescription className="text-white/80">
                    همین الان مثل مشتری واقعی تجربه کنید
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <BookingWidget businessId="demo-business-123" />
                </CardContent>
              </Card>
            </motion.div>

            {/* Configuration Panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 space-y-6"
            >
              {/* WordPress Integration Highlight */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        هر پلتفرمی + WordPress ویژه
                      </h3>
                      <p className="text-blue-100 text-sm">
                        در هر سایتی کار می‌کند - WordPress فقط ۳ دقیقه!
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-300" />
                      <span>کار با هر سایت و پلتفرم</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-300" />
                      <span>پلاگین ویژه WordPress</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-300" />
                      <span>نصب آسان بدون کدنویسی</span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full mt-4 bg-white text-blue-600 hover:bg-gray-100"
                    asChild
                  >
                    <a href="/widget-docs#wordpress-guide">
                      راهنمای WordPress
                      <ArrowRight className="w-4 h-4 mr-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Embed Code */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Code className="h-5 w-5 text-indigo-600" />
                    کد نصب
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    کپی کنید و در سایت خود قرار دهید
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">
                        کد HTML شما:
                      </h4>
                      <Button
                        size="sm"
                        className={`transition-all duration-300 ${
                          copied
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                        onClick={copyToClipboard}
                      >
                        {copied ? (
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="flex items-center"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            کپی شد!
                          </motion.div>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            کپی کن
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="relative">
                      <div className="bg-gray-800 px-4 py-2 rounded-t-lg border-b border-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-gray-400 text-xs ml-3">
                            widget-embed.html
                          </span>
                        </div>
                      </div>
                      <pre
                        className="bg-gray-900 text-gray-100 p-4 rounded-b-lg text-sm overflow-x-auto border border-gray-300 font-mono"
                        dir="ltr"
                        style={{
                          direction: "ltr",
                          textAlign: "left",
                          unicodeBidi: "embed",
                        }}
                      >
                        <code
                          className="language-html"
                          dir="ltr"
                          style={{ direction: "ltr", textAlign: "left" }}
                        >
                          {embedCode}
                        </code>
                      </pre>
                    </div>
                  </div>
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3 text-green-700 mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-semibold block">
                          همین! فقط این کد را در سایت قرار دهید
                        </span>
                        <p className="text-sm text-green-600">
                          نصب کمتر از ۵ دقیقه • بدون دانش فنی
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
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
              چرا ویجت ما بهترین است؟
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              ویژگی‌هایی که ویجت ما را از بقیه متمایز می‌کند
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "نصب فوری",
                description: "کمتر از ۵ دقیقه کار دارد",
              },
              {
                icon: Phone,
                title: "ریسپانسیو",
                description: "در همه دستگاه‌ها عالی کار می‌کند",
              },
              {
                icon: Code,
                title: "سفارشی‌سازی کامل",
                description: "رنگ، فونت و طراحی دلخواه شما",
              },
              {
                icon: CheckCircle,
                title: "امن و مطمئن",
                description: "تمام اطلاعات محرمانه محافظت می‌شود",
              },
              {
                icon: Calendar,
                title: "تقویم فارسی",
                description: "مخصوص کسب‌وکارهای ایرانی طراحی شده",
              },
              {
                icon: Rocket,
                title: "سرعت بالا",
                description: "بارگذاری سریع و عملکرد بهینه",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-6 flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
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
            <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center backdrop-blur">
              <Rocket className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              آماده شروع هستید؟
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              ۷ روز رایگان، بدون نیاز به کارت اعتباری
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                className="text-lg bg-white text-blue-600 hover:bg-gray-100"
              >
                <Zap className="mr-2 h-5 w-5" />
                شروع رایگان ۷ روزه
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg border-white text-white hover:bg-white hover:text-blue-600"
              >
                <Phone className="mr-2 h-5 w-5" />
                مشاوره تلفنی
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>بدون نیاز به کارت اعتباری</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>لغو آسان</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>پشتیبانی ۲۴/۷</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default WidgetDemo;

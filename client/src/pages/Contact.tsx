import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  User,
  Building,
  CheckCircle,
  Star,
  Zap,
  Shield,
  HeadphonesIcon,
  Globe,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    // Reset form after showing success
    setTimeout(() => {
      setFormData({ name: "", email: "", company: "", message: "" });
      setIsSubmitted(false);
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactMethods = [
    {
      icon: MessageSquare,
      title: "تلگرام",
      subtitle: "@x_sme_widget",
      description: "سریع‌ترین راه برای جواب گرفتن",
      action: "شروع چت",
      color: "bg-blue-500",
      popular: true,
    },
    {
      icon: Phone,
      title: "تماس مستقیم",
      subtitle: "۰۹۱۲-۳۴۵۶۷۸۹",
      description: "مثل دوست صمیمی باهام حرف بزن",
      action: "تماس بگیر",
      color: "bg-green-500",
      popular: false,
    },
    {
      icon: Mail,
      title: "ایمیل کاری",
      subtitle: "dev@x-sme.com",
      description: "برای سوالات فنی و همکاری",
      action: "ایمیل بفرست",
      color: "bg-purple-500",
      popular: false,
    },
    {
      icon: HeadphonesIcon,
      title: "جلسه ویدیو",
      subtitle: "دمو ۱۵ دقیقه‌ای",
      description: "ببین چطور کار می‌کنه، سوال بپرس",
      action: "وقت بگیر",
      color: "bg-orange-500",
      popular: false,
    },
  ];

  const quickInfo = [
    { icon: Clock, label: "پاسخ", value: "تا ۲ ساعت", color: "text-blue-600" },
    { icon: Globe, label: "سازنده", value: "ایرانی", color: "text-green-600" },
    { icon: Star, label: "تعرفه", value: "منصفانه", color: "text-purple-600" },
    { icon: Shield, label: "حمایت", value: "تا آخر", color: "text-orange-600" },
  ];

  const faqs = [
    {
      question: "کی می‌تونم شروع کنم؟",
      answer:
        "همین الان! کافیه پیام بدی، تا چند ساعت ویجت رو روی سایتت نصب می‌کنیم. همین!",
    },
    {
      question: "واقعاً پلن رایگان دارید؟",
      answer:
        "آره، کاملاً رایگان. پلن پایه بدون محدودیت زمانی رایگان است و می‌توانید هر زمان که آماده باشید ارتقاء دهید.",
    },
    {
      question: "هزینه‌ش چقدره؟",
      answer:
        "نصب یکباره ۱۰ تا ۲۰ میلیون، بعدش اگه بخوای از هر رزرو ۱۰٪ کارمزد. نمی‌خوای کارمزد بدی، همون نصب کافیه.",
    },
    {
      question: "با پاسارگاد و سامان کار می‌کنه؟",
      answer:
        "آره، با پاسارگاد، سامان، زرین‌پال و هر درگاه دیگه‌ای که داری. حتی اگه درگاه خاصی داری براش کد می‌نویسم.",
    },
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
              <MessageSquare className="w-4 h-4" />
              در ارتباط باشیم
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              نوبت رایگانت رو بگیر،
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                باهم شروع کنیم
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-4xl mx-auto">
              مستقیماً با سازنده صحبت کن. دمو زنده ببین، سوالاتت رو بپرس، ببین
              چطور ویجت رزرو می‌تونه مشتریات رو ۲ برابر کنه و غیبت‌هاشون رو کم
              کنه. راستی، پلن پایه کاملاً رایگان است!
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {quickInfo.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <div className={`text-2xl font-bold ${item.color} mb-1`}>
                        {item.value}
                      </div>
                      <div className="text-sm text-gray-600">{item.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
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
              بیا باهم حرف بزنیم
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              هر طور راحتی، ارتباط برقرار کن تا جواب سوالاتت رو بگیری
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full relative ${
                    method.popular ? "ring-2 ring-blue-500 scale-105" : ""
                  }`}
                >
                  {method.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      پیشنهاد ویژه
                    </Badge>
                  )}
                  <CardContent className="p-8 text-center">
                    <div
                      className={`w-16 h-16 ${method.color} rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300`}
                    >
                      <method.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {method.title}
                    </h3>
                    <p className="text-blue-600 font-medium mb-4">
                      {method.subtitle}
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      {method.description}
                    </p>
                    <Button
                      className={`w-full ${method.popular ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}
                    >
                      {method.action}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">بیا شروع کنیم!</CardTitle>
                      <CardDescription className="text-blue-100 mt-1">
                        فرم رو پر کن تا ظرف چند ساعت بهت زنگ بزنم
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-green-600 mb-2">
                        پیام با موفقیت ارسال شد!
                      </h3>
                      <p className="text-gray-600">
                        ما به زودی با شما تماس خواهیم گرفت.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            نام و نام خانوادگی *
                          </label>
                          <div className="relative">
                            <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              type="text"
                              name="name"
                              placeholder="نام خود را وارد کنید"
                              value={formData.name}
                              onChange={handleChange}
                              className="pr-10 h-12 border-2 focus:border-blue-500 transition-colors"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            ایمیل *
                          </label>
                          <div className="relative">
                            <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              type="email"
                              name="email"
                              placeholder="example@email.com"
                              value={formData.email}
                              onChange={handleChange}
                              className="pr-10 h-12 border-2 focus:border-blue-500 transition-colors"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          نام شرکت (اختیاری)
                        </label>
                        <div className="relative">
                          <Building className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            name="company"
                            placeholder="نام شرکت یا کسب‌وکار"
                            value={formData.company}
                            onChange={handleChange}
                            className="pr-10 h-12 border-2 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          پیام شما *
                        </label>
                        <textarea
                          name="message"
                          className="w-full min-h-[140px] px-4 py-3 text-sm border-2 border-gray-200 bg-white rounded-lg resize-none focus:outline-none focus:border-blue-500 transition-colors"
                          placeholder="چطور می‌توانیم به شما کمک کنیم؟ سوالات و نیازهای خود را با جزئیات بنویسید..."
                          value={formData.message}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            در حال ارسال...
                          </div>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            ارسال پیام
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">سوالات متداول</CardTitle>
                      <CardDescription className="mt-1">
                        پاسخ سریع به رایج‌ترین سوالات مشتریان
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {faqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0"
                    >
                      <h4 className="font-semibold mb-3 text-gray-900 leading-relaxed">
                        {faq.question}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Developer Info */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl">درباره سازنده</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">تهران، کار ریموت</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">
                        پاسخ‌گویی: روزانه ۹:۰۰ - ۲۲:۰۰
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">
                        ۵+ سال تجربه توسعه وب
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
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
              <MessageSquare className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              همین الان شروع کنیم؟
            </h2>
            <p className="text-xl text-blue-100 mb-8 opacity-95 max-w-3xl mx-auto leading-relaxed">
              یه پیام بده، تا چند ساعت ویجت رو روی سایتت نصب می‌کنیم. پلن رایگان
              رایگان امتحان کن، راضی نبودی هیچی نمی‌گیریم!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                شروع چت تلگرام
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
              >
                <Phone className="w-5 h-5 mr-2" />
                تماس تلفنی
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-blue-100 opacity-90">
              <div className="text-center">
                <div className="text-2xl font-bold">سریع</div>
                <div className="text-sm">پاسخ تا ۲ ساعت</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">رایگان</div>
                <div className="text-sm">پلن رایگان</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">ایرانی</div>
                <div className="text-sm">ساخت و پشتیبانی محلی</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  CreditCard,
  MessageSquare,
  Smartphone,
  Zap,
  Shield,
  ArrowLeft,
  CheckCircle,
  Star,
  Users,
  Clock,
  Phone,
  TrendingUp,
  PlayCircle,
  DollarSign,
  Globe,
  BarChart3,
  Award,
  Sparkles,
  ArrowRight,
  Building2,
  Heart,
  Target,
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
import LoadingSpinner from "@components/LoadingSpinner";

interface Plan {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  setupFee: number;
  monthlyFee: number;
  yearlyFee: number;
  commissionRate: number;
  bookingsLimit: number | null;
  servicesLimit: number | null;
  smsLimit: number | null;
  features: string[];
  sortOrder: number;
}

const Home: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // Feature labels mapping for display
  const featureLabels: Record<string, string> = {
    BASIC_WIDGET: "ویجت پایه",
    ADVANCED_WIDGET: "ویجت پیشرفته",
    ENTERPRISE_WIDGET: "ویجت سازمانی",
    SINGLE_BUSINESS: "یک کسب‌وکار",
    UNLIMITED_BUSINESSES: "کسب‌وکارهای نامحدود",
    EMAIL_SUPPORT: "پشتیبانی ایمیل",
    PRIORITY_SUPPORT: "پشتیبانی اولویت‌دار",
    SUPPORT_24_7: "پشتیبانی ۲۴/۷",
    BASIC_ANALYTICS: "آمار پایه",
    ADVANCED_ANALYTICS: "آمار پیشرفته",
    API_ACCESS: "دسترسی API",
    CUSTOM_BRANDING: "برندینگ سفارشی",
    SMS_TELEGRAM_NOTIFICATIONS: "اعلان پیامک و تلگرام",
    PAYMENT_GATEWAY_INTEGRATION: "درگاه پرداخت",
    MULTI_PAYMENT_GATEWAYS: "چند درگاه پرداخت",
    PERSIAN_CALENDAR: "تقویم فارسی",
    STAFF_MANAGEMENT: "مدیریت کارکنان",
    WHITE_LABEL: "برچسب سفید",
    WHITE_LABEL_SDK: "SDK برچسب سفید",
    CUSTOM_INTEGRATIONS: "یکپارچگی‌های سفارشی",
    DEDICATED_ACCOUNT_MANAGER: "مدیر اختصاصی حساب",
    SLA_GUARANTEE: "تضمین SLA",
    ADVANCED_SECURITY: "امنیت پیشرفته",
    ZARINPAL_GATEWAY: "درگاه زرین‌پال",
    TWO_PAYMENT_GATEWAYS: "هر ۲ درگاه پرداخت",
    ALL_PAYMENT_GATEWAYS: "تمام درگاه‌های پرداخت",
    POWERED_BY_BRANDING: "برندینگ 'powered by'",
    MINIMAL_BRANDING: "برندینگ حداقلی",
    WHITE_LABEL_BRANDING: "برندینگ سفید",
    NO_BRANDING: "بدون برندینگ",
  };

  // Fetch plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        const response = await fetch("/api/subscriptions/plans");
        const data = await response.json();

        if (data.success) {
          setPlans(
            data.data.sort((a: Plan, b: Plan) => a.sortOrder - b.sortOrder)
          );
        }
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("fa-IR").format(amount);
  };

  const formatCommission = (rate: number) => {
    return `${(rate * 100).toFixed(0)}٪`;
  };

  const getPlanDisplayPrice = (plan: Plan) => {
    if (plan.nameEn === "enterprise") {
      return { price: "تماس", period: "بگیرید" };
    }

    if (plan.monthlyFee === 0 && plan.commissionRate > 0) {
      return {
        price: formatCommission(plan.commissionRate),
        period: "هر رزرو",
      };
    }

    return {
      price: formatPrice(plan.monthlyFee),
      period: "ماه",
    };
  };

  const getPlanFeatures = (plan: Plan) => {
    const features = [];

    if (plan.bookingsLimit) {
      features.push(`تا ${formatPrice(plan.bookingsLimit)} رزرو/ماه`);
    } else {
      features.push("رزرو نامحدود");
    }

    if (plan.smsLimit) {
      features.push(`${formatPrice(plan.smsLimit)} پیامک/ماه`);
    } else {
      features.push("پیامک نامحدود");
    }

    // Add translated features
    plan.features.slice(0, 2).forEach((feature) => {
      const translatedFeature = featureLabels[feature] || feature;
      features.push(translatedFeature);
    });

    return features;
  };

  const features = [
    {
      icon: Calendar,
      title: "رزرو ۲۴/۷",
      description: "مشتریان در هر ساعت از شبانه‌روز می‌توانند رزرو کنند",
      color: "bg-blue-500",
    },
    {
      icon: CreditCard,
      title: "پرداخت امن",
      description: "درگاه‌های معتبر ایرانی: پاسارگاد، سامان، زرین‌پال",
      color: "bg-green-500",
    },
    {
      icon: MessageSquare,
      title: "یادآوری هوشمند",
      description: "پیامک و تلگرام خودکار برای کاهش غیبت مشتریان",
      color: "bg-purple-500",
    },
    {
      icon: BarChart3,
      title: "گزارش‌گیری پیشرفته",
      description: "آمار و تحلیل کامل عملکرد کسب‌وکار شما",
      color: "bg-orange-500",
    },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "+۵۰% افزایش رزرو",
      description: "رزرو آنلاین ۲۴ ساعته",
      stat: "۵۰%",
    },
    {
      icon: Shield,
      title: "-۷۰% غیبت مشتری",
      description: "با سیستم بیعانه و یادآوری",
      stat: "۷۰%",
    },
    {
      icon: Clock,
      title: "صرفه‌جویی ۵ ساعت",
      description: "در روز برای مدیریت رزروها",
      stat: "۵ ساعت",
    },
  ];

  const testimonials = [
    {
      name: "دکتر احمد رضایی",
      business: "کلینیک دندانپزشکی نور",
      comment:
        "درآمدم ۲ برابر شد و دیگه نگران غیبت مشتریان نیستم. سیستم عالیه!",
      rating: 5,
      image: "👨‍⚕️",
      result: "+۸۵% درآمد",
    },
    {
      name: "خانم مریم احمدی",
      business: "سالن زیبایی گل",
      comment: "قبلاً ۱۰ ساعت پشت تلفن بودم، الان فقط ۲ ساعت! خیلی راحت شدم.",
      rating: 5,
      image: "👩‍💼",
      result: "۸ ساعت صرفه‌جویی",
    },
    {
      name: "استاد حسن محمدی",
      business: "آموزشگاه موسیقی فردا",
      comment: "دانش‌آموزها راحت رزرو می‌کنن و من وقتم رو صرف تدریس می‌کنم.",
      rating: 5,
      image: "🎵",
      result: "+۶۰% رزرو",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Redesigned */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-right order-2 lg:order-1"
            >
              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 mb-8"
              >
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2 text-sm font-medium">
                  <Globe className="w-4 h-4" />
                  راه‌حل اختصاصی کسب‌وکارهای ایرانی
                </Badge>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
              >
                <span className="block">ویجت رزرو آنلاین</span>
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  با درگاه‌های ایرانی
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0"
              >
                برای سالن‌های زیبایی، کلینیک‌ها و موسسات آموزشی.
                <span className="font-semibold text-blue-600"> رزرو ۲۴/۷</span>،
                <span className="font-semibold text-purple-600">
                  {" "}
                  پرداخت امن
                </span>{" "}
                و
                <span className="font-semibold text-indigo-600">
                  {" "}
                  یادآوری هوشمند
                </span>
                .
              </motion.p>

              {/* Key Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
              >
                {[
                  {
                    icon: Shield,
                    text: "مخصوص ایران",
                    subtext: "درگاه‌های پاسارگاد، سامان، زرین‌پال",
                    color: "text-green-600",
                    bgColor: "bg-green-50",
                  },
                  {
                    icon: Zap,
                    text: "نصب ۵ دقیقه‌ای",
                    subtext: "فقط ۲ خط کد",
                    color: "text-blue-600",
                    bgColor: "bg-blue-50",
                  },
                  {
                    icon: Award,
                    text: "پشتیبانی ۲۴/۷",
                    subtext: "تیم ایرانی",
                    color: "text-purple-600",
                    bgColor: "bg-purple-50",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`${item.bgColor} rounded-xl p-4 border border-gray-100`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <span className="font-semibold text-gray-900 text-sm">
                        {item.text}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{item.subtext}</p>
                  </div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  asChild
                >
                  <Link to="/widget-demo" className="flex items-center gap-2">
                    <PlayCircle className="w-5 h-5" />
                    مشاهده دمو رایگان
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 px-8 py-4 text-lg font-semibold"
                  asChild
                >
                  <Link to="/contact" className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    مشاوره رایگان
                  </Link>
                </Button>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500"
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {["👨‍⚕️", "👩‍💼", "🎵", "💇‍♀️"].map((emoji, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm border-2 border-white"
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <span>+۵۰۰ کسب‌وکار فعال</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>۴.۹/۵ امتیاز</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Interactive Widget Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative order-1 lg:order-2"
            >
              <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden transform hover:scale-105 transition-transform duration-300">
                {/* Browser Header */}
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm font-medium mr-auto">
                      <Calendar className="w-4 h-4" />
                      کلینیک دندانپزشکی نور
                    </div>
                  </div>
                </div>

                {/* Widget Content */}
                <div className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      رزرو آنلاین
                    </h3>
                    <p className="text-gray-600 text-sm">انتخاب خدمات و زمان</p>
                  </div>

                  {/* Service Selection */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-center cursor-pointer transform hover:scale-105 transition-all duration-200">
                        <div className="font-semibold text-gray-900 mb-1">
                          جرم‌گیری
                        </div>
                        <div className="text-blue-600 font-bold text-sm">
                          ۱۵۰,۰۰۰ تومان
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ۴۵ دقیقه
                        </div>
                      </div>
                      <div className="p-4 border-2 border-gray-200 bg-gray-50 rounded-xl text-center cursor-pointer hover:border-gray-300 hover:bg-gray-100 transition-all duration-200">
                        <div className="font-semibold text-gray-700 mb-1">
                          عصب‌کشی
                        </div>
                        <div className="text-gray-600 font-bold text-sm">
                          ۸۰۰,۰۰۰ تومان
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ۹۰ دقیقه
                        </div>
                      </div>
                    </div>

                    {/* Time Selection */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                      <div className="text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        انتخاب زمان:
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {["۱۰:۰۰", "۱۲:۰۰", "۱۴:۰۰"].map((time, idx) => (
                          <button
                            key={time}
                            className={`p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                              idx === 1
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                                : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Preview */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          مبلغ قابل پرداخت:
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          ۱۵۰,۰۰۰ تومان
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <CreditCard className="w-3 h-3" />
                        پرداخت امن با درگاه‌های ایرانی
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                      size="lg"
                    >
                      <CreditCard className="w-4 h-4 ml-2" />
                      رزرو و پرداخت
                    </Button>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                زنده
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                نمونه واقعی
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200">
              <Target className="w-4 h-4 mr-2" />
              مخصوص کسب‌وکارهای ایرانی
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              برای چه کسب‌وکارهایی طراحی شده؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              راه‌حل کامل رزرو آنلاین برای کسب‌وکارهایی که نیاز به مدیریت نوبت و
              پرداخت دارند
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "💇‍♀️",
                title: "سالن‌های زیبایی",
                subtitle: "آرایشگاه، کاشت ناخن، میکاپ",
                description:
                  "مدیریت نوبت آرایش، کوتاهی مو، و سایر خدمات زیبایی با سیستم بیعانه و یادآوری",
                features: [
                  "رزرو خدمات متنوع",
                  "مدیریت آرایشگران",
                  "پکیج‌های خدمات",
                  "یادآوری پیامکی",
                ],
                color: "from-pink-500 to-rose-500",
                bgColor: "bg-gradient-to-br from-pink-50 to-rose-50",
                borderColor: "border-pink-200",
              },
              {
                icon: "👨‍⚕️",
                title: "کلینیک‌ها و مطب‌ها",
                subtitle: "دندانپزشکی، پزشکی، روانشناسی",
                description:
                  "سیستم نوبت‌دهی برای پزشکان و مراکز درمانی با تقویم فارسی و یادآوری دارو",
                features: [
                  "تقویم پزشک",
                  "تاریخچه ویزیت",
                  "یادآوری دارو",
                  "پرداخت آنلاین",
                ],
                color: "from-blue-500 to-indigo-500",
                bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
                borderColor: "border-blue-200",
              },
              {
                icon: "🎵",
                title: "موسسات آموزشی",
                subtitle: "زبان، موسیقی، هنر",
                description:
                  "مدیریت کلاس‌ها، دوره‌ها و رزرو جلسات خصوصی با سیستم حضور و غیاب",
                features: [
                  "مدیریت دوره‌ها",
                  "حضور و غیاب",
                  "پرداخت شهریه",
                  "گزارش‌گیری",
                ],
                color: "from-purple-500 to-violet-500",
                bgColor: "bg-gradient-to-br from-purple-50 to-violet-50",
                borderColor: "border-purple-200",
              },
            ].map((business, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card
                  className={`h-full border-2 ${business.borderColor} ${business.bgColor} hover:shadow-xl transition-all duration-300 group`}
                >
                  <CardContent className="p-8">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${business.color} rounded-2xl flex items-center justify-center text-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}
                    >
                      {business.icon}
                    </div>

                    {/* Title */}
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {business.title}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">
                        {business.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 leading-relaxed mb-6 text-center">
                      {business.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-3">
                      {business.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 bg-gradient-to-r ${business.color} rounded-full`}
                          ></div>
                          <span className="text-sm text-gray-700 font-medium">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <Button
                        variant="outline"
                        className={`w-full border-2 ${business.borderColor} hover:bg-gradient-to-r ${business.color} hover:text-white transition-all duration-300`}
                        asChild
                      >
                        <Link to="/widget-demo">
                          مشاهده دمو {business.title}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                کسب‌وکار شما در این لیست نیست؟
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                اگر کسب‌وکار شما نیاز به سیستم رزرو آنلاین دارد، با ما تماس
                بگیرید. راه‌حل سفارشی برای شما طراحی می‌کنیم.
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4"
                asChild
              >
                <Link to="/contact" className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  مشاوره رایگان
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* WordPress Integration Highlight */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content Side */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center lg:text-right"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/30"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/90 text-sm font-medium">
                  WordPress پلاگین اختصاصی
                </span>
              </motion.div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                سایت WordPress دارید؟
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  ۳ دقیقه کافیه!
                </span>
              </h2>

              <p className="text-xl text-white/90 leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0">
                بیش از{" "}
                <span className="font-bold text-yellow-300">
                  ۲۰۰ سایت WordPress
                </span>{" "}
                از پلاگین ما استفاده می‌کنند. شما هم بدون کدنویسی، در عرض ۳
                دقیقه سیستم رزرو داشته باشید.
              </p>

              {/* Pain Points */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  مشکلات متداول WordPress:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {[
                    "تلفن مدام زنگ می‌زنه",
                    "رزروها گم می‌شن",
                    "پرداخت حضوری محدودیت داره",
                    "مدیریت نوبت‌ها سخته",
                  ].map((problem, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-white/80"
                    >
                      <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                      <span>{problem}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link
                    to="/widget-docs#wordpress-guide"
                    className="flex items-center gap-2"
                  >
                    <div className="w-5 h-5 bg-black/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">W</span>
                    </div>
                    نصب ۳ دقیقه‌ای WordPress
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/40 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-4 text-lg transition-all duration-300"
                  asChild
                >
                  <Link to="/widget-demo" className="flex items-center gap-2">
                    <PlayCircle className="w-5 h-5" />
                    مشاهده دمو زنده
                  </Link>
                </Button>
              </div>

              {/* Trust Elements */}
              <div className="flex items-center justify-center lg:justify-start gap-6 mt-8 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>بدون کدنویسی</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>۱۴ روز رایگان</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>پشتیبانی فارسی</span>
                </div>
              </div>
            </motion.div>

            {/* Visual Side */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Main Card */}
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                {/* WordPress Logo */}
                <div className="absolute -top-6 left-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 shadow-xl">
                  <div className="text-white text-2xl font-bold">W</div>
                </div>

                {/* Steps */}
                <div className="space-y-6 mt-4">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      نصب فوری
                    </h3>
                    <p className="text-white/80">سه مرحله ساده</p>
                  </div>

                  {/* Step by step */}
                  {[
                    {
                      step: "۱",
                      title: "دانلود پلاگین",
                      desc: "از WordPress Repository",
                      icon: "📥",
                      time: "۳۰ ثانیه",
                    },
                    {
                      step: "۲",
                      title: "تنظیمات ساده",
                      desc: "API Key و پیکربندی",
                      icon: "⚙️",
                      time: "۱ دقیقه",
                    },
                    {
                      step: "۳",
                      title: "آماده استفاده!",
                      desc: "Shortcode یا Widget",
                      icon: "🚀",
                      time: "۳۰ ثانیه",
                    },
                  ].map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-black font-bold text-lg shadow-lg">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{step.icon}</span>
                          <span className="font-semibold text-white">
                            {step.title}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm">{step.desc}</p>
                      </div>
                      <div className="text-yellow-300 text-sm font-medium bg-yellow-300/20 px-3 py-1 rounded-full">
                        {step.time}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Success Metric */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  viewport={{ once: true }}
                  className="mt-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-400/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          ۲۰۰+ سایت WordPress فعال
                        </div>
                        <div className="text-green-300 text-sm">
                          نرخ رضایت ۹۸٪
                        </div>
                      </div>
                    </div>
                    <div className="text-green-300 text-sm bg-green-400/20 px-3 py-1 rounded-full">
                      آماده کار!
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400/20 backdrop-blur-sm rounded-2xl border border-yellow-400/30 flex items-center justify-center"
              >
                <span className="text-2xl">⚡</span>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -bottom-4 -left-4 w-12 h-12 bg-purple-400/20 backdrop-blur-sm rounded-xl border border-purple-400/30 flex items-center justify-center"
              >
                <span className="text-lg">💎</span>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-white/20"
          >
            {[
              { label: "WordPress سایت", value: "۲۰۰+", icon: "🏢" },
              { label: "نصب موفق", value: "۹۸٪", icon: "✅" },
              { label: "زمان نصب متوسط", value: "۳ دقیقه", icon: "⏱️" },
              { label: "پشتیبانی", value: "۲۴/۷", icon: "🎧" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Multi-Platform Integration */}
      <section className="relative py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/40 shadow-lg"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-700 font-medium">یکپارچگی هوشمند</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </motion.div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                یک کد، همه جا
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              ویجت ما روی{" "}
              <span className="font-bold text-blue-600">هر پلتفرمی</span> کار
              می‌کند
              <br className="hidden sm:block" />
              از HTML ساده تا React پیشرفته
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/40">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>۳۰ ثانیه نصب</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/40">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>۱۰+ فریمورک</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/40">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>۱۰۰٪ سازگار</span>
              </div>
            </div>
          </motion.div>

          {/* Interactive Platform Selector */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
                <div className="flex flex-wrap">
                  {[
                    {
                      name: "HTML",
                      icon: "🌐",
                      label: "HTML خام",
                      time: "۳۰ ثانیه",
                      difficulty: "مبتدی",
                      color: "orange",
                    },
                    {
                      name: "WordPress",
                      icon: "📝",
                      label: "WordPress",
                      time: "۳ دقیقه",
                      difficulty: "آسان",
                      color: "blue",
                    },
                    {
                      name: "React",
                      icon: "⚛️",
                      label: "React/Next.js",
                      time: "۲ دقیقه",
                      difficulty: "متوسط",
                      color: "cyan",
                    },
                    {
                      name: "Vue",
                      icon: "💚",
                      label: "Vue.js",
                      time: "۲ دقیقه",
                      difficulty: "متوسط",
                      color: "green",
                    },
                  ].map((tab, idx) => (
                    <button
                      key={tab.name}
                      className={`flex-1 group relative px-6 py-4 text-center transition-all duration-300 ${
                        idx === 0
                          ? "bg-white border-b-2 border-blue-500 shadow-sm"
                          : "hover:bg-white/60 border-b-2 border-transparent hover:border-gray-300"
                      }`}
                      onClick={(event) => {
                        // Tab switching logic would go here
                        document
                          .querySelectorAll("[data-tab-content]")
                          .forEach((el) => el.classList.add("hidden"));
                        document
                          .querySelector(`[data-tab-content="${tab.name}"]`)
                          ?.classList.remove("hidden");

                        // Update active tab styling
                        document
                          .querySelectorAll("[data-tab-button]")
                          .forEach((btn) => {
                            btn.classList.remove(
                              "bg-white",
                              "border-blue-500",
                              "shadow-sm"
                            );
                            btn.classList.add("border-transparent");
                          });

                        const target = event.currentTarget as HTMLButtonElement;
                        target.classList.add(
                          "bg-white",
                          "border-blue-500",
                          "shadow-sm"
                        );
                        target.classList.remove("border-transparent");
                      }}
                      data-tab-button
                    >
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <span className="text-2xl group-hover:scale-110 transition-transform">
                          {tab.icon}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {tab.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded-full">
                          {tab.time}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full ${
                            tab.difficulty === "مبتدی"
                              ? "bg-green-100 text-green-700"
                              : tab.difficulty === "آسان"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {tab.difficulty}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {/* HTML Tab */}
                <div data-tab-content="HTML" className="space-y-6">
                  <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                          🌐
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            HTML خام
                          </h3>
                          <p className="text-gray-600">
                            ساده‌ترین روش - فقط کپی و پیست
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-900 rounded-2xl p-6 font-mono text-sm overflow-x-auto shadow-xl">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-700">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <span className="text-gray-400 ml-4 text-xs">
                            index.html
                          </span>
                        </div>
                        <div className="text-green-400">
                          <div className="text-gray-500">
                            {"<!-- Step 1: Add Script -->"}
                          </div>
                          <div className="text-blue-400">
                            {"<script "}
                            <span className="text-yellow-300">src</span>=
                            {'="https://widget.x-sme.com/embed.js"'}
                            {"></script>"}
                          </div>
                          <br />
                          <div className="text-gray-500">
                            {"<!-- Step 2: Add Widget -->"}
                          </div>
                          <div className="text-blue-400">
                            {"<div "}
                            <span className="text-yellow-300">id</span>=
                            {'="x-sme-widget"'}
                          </div>
                          <div className="text-blue-400 ml-4">
                            <span className="text-yellow-300">
                              data-business
                            </span>
                            ={'="YOUR_BUSINESS_ID"'}
                            {"></div>"}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                          <div className="text-2xl mb-2">⚡</div>
                          <div className="text-sm font-medium text-green-800">
                            ۳۰ ثانیه
                          </div>
                          <div className="text-xs text-green-600">نصب فوری</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <div className="text-2xl mb-2">🎯</div>
                          <div className="text-sm font-medium text-blue-800">
                            ۱۰۰٪
                          </div>
                          <div className="text-xs text-blue-600">سازگاری</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                          <div className="text-2xl mb-2">📦</div>
                          <div className="text-sm font-medium text-purple-800">
                            50KB
                          </div>
                          <div className="text-xs text-purple-600">حجم کم</div>
                        </div>
                      </div>
                    </div>

                    {/* Live Preview */}
                    <div className="w-96 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <div className="bg-white rounded-full px-3 py-1 text-xs text-gray-600 mr-4">
                            mysite.com
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-center mb-4">
                          <h4 className="font-bold text-gray-900">
                            کلینیک دندان
                          </h4>
                          <p className="text-sm text-gray-600">انتخاب خدمات</p>
                        </div>
                        <div className="space-y-3">
                          <div className="p-3 border-2 border-blue-500 bg-blue-50 rounded-lg">
                            <div className="flex justify-between">
                              <span className="font-medium text-blue-900">
                                جرم‌گیری
                              </span>
                              <span className="text-blue-600 text-sm">
                                ۱۵۰,۰۰۰ ت
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <button className="p-2 bg-blue-600 text-white rounded-lg text-sm">
                              ۱۰:۰۰
                            </button>
                            <button className="p-2 border border-gray-300 rounded-lg text-sm">
                              ۱۲:۰۰
                            </button>
                            <button className="p-2 border border-gray-300 rounded-lg text-sm">
                              ۱۴:۰۰
                            </button>
                          </div>
                          <Button size="sm" className="w-full bg-blue-600">
                            رزرو
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Other tabs content would be hidden initially */}
                <div data-tab-content="WordPress" className="hidden">
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">📝</div>
                    <h3 className="text-2xl font-bold mb-2">
                      WordPress Plugin
                    </h3>
                    <p className="text-gray-600 mb-6">
                      بدون کدنویسی، فقط چند کلیک
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm max-w-md mx-auto">
                      [x-sme-booking service="جرم‌گیری"]
                    </div>
                  </div>
                </div>

                <div data-tab-content="React" className="hidden">
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">⚛️</div>
                    <h3 className="text-2xl font-bold mb-2">React Component</h3>
                    <p className="text-gray-600 mb-6">
                      JSX Component آماده استفاده
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm max-w-md mx-auto">
                      {'<BookingWidget businessId="123" />'}
                    </div>
                  </div>
                </div>

                <div data-tab-content="Vue" className="hidden">
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">💚</div>
                    <h3 className="text-2xl font-bold mb-2">Vue Component</h3>
                    <p className="text-gray-600 mb-6">Vue.js Component</p>
                    <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm max-w-md mx-auto">
                      {'<booking-widget :business-id="123" />'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-t border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Responsive Design</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>RTL Support</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Dark Mode</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" asChild>
                      <Link to="/widget-docs">مستندات</Link>
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                      asChild
                    >
                      <Link to="/widget-demo">تست زنده</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Platform Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                و صدها پلتفرم دیگر...
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                از سایت‌سازهای محبوب تا فریمورک‌های پیشرفته، همه جا کار می‌کند
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 max-w-5xl mx-auto">
              {[
                {
                  name: "Angular",
                  icon: "🅰️",
                  color: "from-red-500 to-red-600",
                },
                {
                  name: "Svelte",
                  icon: "🔥",
                  color: "from-orange-500 to-red-500",
                },
                {
                  name: "Django",
                  icon: "🐍",
                  color: "from-green-500 to-green-600",
                },
                {
                  name: "Laravel",
                  icon: "🎯",
                  color: "from-red-500 to-pink-500",
                },
                {
                  name: "Shopify",
                  icon: "🛍️",
                  color: "from-green-500 to-emerald-500",
                },
                { name: "Wix", icon: "🎨", color: "from-blue-500 to-blue-600" },
                {
                  name: "Squarespace",
                  icon: "⬜",
                  color: "from-gray-500 to-gray-600",
                },
                {
                  name: "Custom",
                  icon: "⚙️",
                  color: "from-purple-500 to-purple-600",
                },
              ].map((platform, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    {/* Gradient Background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}
                    ></div>

                    <div className="relative text-center">
                      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                        {platform.icon}
                      </div>
                      <div className="font-semibold text-gray-900 group-hover:text-gray-800">
                        {platform.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        یکپارچگی آسان
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/40 shadow-xl max-w-2xl mx-auto">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  پلتفرم شما در لیست نیست؟
                </h4>
                <p className="text-gray-600 mb-6">
                  ما برای هر پلتفرمی راه‌حل داریم. حتی برای سایت‌های سفارشی!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                    asChild
                  >
                    <Link to="/widget-docs" className="flex items-center gap-2">
                      <span>مستندات کامل</span>
                      <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                    asChild
                  >
                    <Link to="/contact" className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>پشتیبانی فنی</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-gray-600 mb-8 font-medium">
              بیش از ۵۰۰ کسب‌وکار در پلتفرم‌های مختلف - شامل ۲۰۰+ سایت WordPress
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {[
                {
                  label: "کسب‌وکار فعال",
                  value: "۵۰۰+",
                  color: "text-blue-600",
                },
                { label: "رزرو موفق", value: "۱۰۰K+", color: "text-green-600" },
                {
                  label: "رضایت مشتریان",
                  value: "۹۸٪",
                  color: "text-purple-600",
                },
                { label: "پشتیبانی", value: "۲۴/۷", color: "text-orange-600" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
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
              چرا کسب‌وکارها ما را انتخاب می‌کنند؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نتایج ملموسی که مشتریان ما تجربه کرده‌اند
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full bg-white">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                      <benefit.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {benefit.stat}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Section - Redesigned */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200">
              <Sparkles className="w-4 h-4 mr-2" />
              ویژگی‌های اصلی
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              چرا X-SME انتخاب کنید؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              سه ویژگی کلیدی که کسب‌وکار شما را متحول می‌کند
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Calendar,
                title: "رزرو ۲۴/۷ هوشمند",
                subtitle: "مشتریان در هر ساعت رزرو کنند",
                description:
                  "سیستم پیشرفته رزرو با قابلیت تنظیم ساعات کاری، تعطیلات و مدیریت اتوماتیک اسلات‌های زمانی",
                benefits: [
                  "رزرو آنلاین ۲۴ ساعته",
                  "مدیریت تعطیلات",
                  "جلوگیری از تداخل",
                  "تقویم فارسی",
                ],
                color: "from-blue-500 to-indigo-500",
                bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
                borderColor: "border-blue-200",
                stat: "+۵۰%",
                statText: "افزایش رزرو",
              },
              {
                icon: CreditCard,
                title: "پرداخت امن ایرانی",
                subtitle: "درگاه‌های معتبر داخلی",
                description:
                  "یکپارچگی با تمام درگاه‌های پرداخت معتبر ایران برای تجربه پرداخت سریع و ایمن",
                benefits: [
                  "پاسارگاد، سامان، زرین‌پال",
                  "پرداخت آنلاین ایمن",
                  "تسویه خودکار",
                  "بیعانه اختیاری",
                ],
                color: "from-green-500 to-emerald-500",
                bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
                borderColor: "border-green-200",
                stat: "۱۰۰%",
                statText: "امنیت تضمینی",
              },
              {
                icon: MessageSquare,
                title: "یادآوری هوشمند",
                subtitle: "کاهش غیبت مشتریان",
                description:
                  "سیستم یادآوری خودکار از طریق پیامک و تلگرام برای کاهش غیبت مشتریان",
                benefits: [
                  "یادآوری پیامکی",
                  "اطلاع‌رسانی تلگرام",
                  "کاهش ۷۰٪ غیبت",
                  "مدیریت خودکار",
                ],
                color: "from-purple-500 to-violet-500",
                bgColor: "bg-gradient-to-br from-purple-50 to-violet-50",
                borderColor: "border-purple-200",
                stat: "-۷۰%",
                statText: "کاهش غیبت",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card
                  className={`h-full border-2 ${feature.borderColor} ${feature.bgColor} hover:shadow-xl transition-all duration-300 group relative overflow-hidden`}
                >
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl"></div>

                  <CardContent className="p-8 relative">
                    {/* Icon and Stats */}
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                      >
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}
                        >
                          {feature.stat}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          {feature.statText}
                        </div>
                      </div>
                    </div>

                    {/* Title and Subtitle */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">
                        {feature.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {feature.description}
                    </p>

                    {/* Benefits */}
                    <div className="space-y-3">
                      {feature.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 bg-gradient-to-r ${feature.color} rounded-full`}
                          ></div>
                          <span className="text-sm text-gray-700 font-medium">
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <Button
                        variant="outline"
                        className={`w-full border-2 ${feature.borderColor} hover:bg-gradient-to-r ${feature.color} hover:text-white transition-all duration-300`}
                        asChild
                      >
                        <Link to="/widget-demo">
                          مشاهده دمو
                          <ArrowRight className="w-4 h-4 mr-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Additional Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              ویژگی‌های اضافی
            </h3>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BarChart3,
                title: "گزارش‌گیری پیشرفته",
                description: "آمار و تحلیل کامل عملکرد کسب‌وکار شما",
                color: "from-orange-500 to-red-500",
              },
              {
                icon: Users,
                title: "مدیریت تیم",
                description: "سیستم دسترسی مبتنی بر نقش برای مدیران و کارکنان",
                color: "from-teal-500 to-cyan-500",
              },
              {
                icon: Globe,
                title: "کار با هر پلتفرمی",
                description: "ویجت قابل تعمیم که در هر وب‌سایتی کار می‌کند",
                color: "from-indigo-500 to-purple-500",
              },
              {
                icon: Shield,
                title: "امنیت بالا",
                description: "رمزگذاری پیشرفته و حفاظت از داده‌ها",
                color: "from-emerald-500 to-green-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full bg-white group">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Redesigned */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200">
              <Star className="w-4 h-4 mr-2" />
              نظرات مشتریان
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              مشتریان ما چه می‌گویند؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              تجربه واقعی صاحبان کسب‌وکار که درآمدشان را با X-SME افزایش
              داده‌اند
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                name: "دکتر احمد رضایی",
                business: "کلینیک دندانپزشکی نور",
                businessType: "کلینیک دندانپزشکی",
                comment:
                  "درآمدم ۲ برابر شد و دیگه نگران غیبت مشتریان نیستم. سیستم عالیه!",
                rating: 5,
                image: "👨‍⚕️",
                result: "+۸۵% درآمد",
                resultColor: "from-green-500 to-emerald-500",
                beforeAfter: {
                  before: "روزانه ۵-۶ بیمار",
                  after: "روزانه ۱۰-۱۲ بیمار",
                },
                timeSaved: "۳ ساعت در روز",
                category: "medical",
              },
              {
                name: "خانم مریم احمدی",
                business: "سالن زیبایی گل",
                businessType: "سالن زیبایی",
                comment:
                  "قبلاً ۱۰ ساعت پشت تلفن بودم، الان فقط ۲ ساعت! خیلی راحت شدم.",
                rating: 5,
                image: "👩‍💼",
                result: "۸ ساعت صرفه‌جویی",
                resultColor: "from-blue-500 to-indigo-500",
                beforeAfter: {
                  before: "۱۰ ساعت تماس",
                  after: "۲ ساعت تماس",
                },
                timeSaved: "۸ ساعت در روز",
                category: "beauty",
              },
              {
                name: "استاد حسن محمدی",
                business: "آموزشگاه موسیقی فردا",
                businessType: "موسسه آموزشی",
                comment:
                  "دانش‌آموزها راحت رزرو می‌کنن و من وقتم رو صرف تدریس می‌کنم.",
                rating: 5,
                image: "🎵",
                result: "+۶۰% رزرو",
                resultColor: "from-purple-500 to-violet-500",
                beforeAfter: {
                  before: "۱۵ دانش‌آموز",
                  after: "۲۴ دانش‌آموز",
                },
                timeSaved: "۴ ساعت در روز",
                category: "education",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full bg-white group relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>

                  <CardContent className="p-8 relative">
                    {/* Header with Rating and Result */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 text-yellow-500 fill-current"
                          />
                        ))}
                      </div>
                      <Badge
                        className={`bg-gradient-to-r ${testimonial.resultColor} text-white border-0 px-3 py-1 font-semibold`}
                      >
                        {testimonial.result}
                      </Badge>
                    </div>

                    {/* Quote */}
                    <div className="mb-6">
                      <div className="text-3xl text-gray-300 mb-2">"</div>
                      <p className="text-gray-700 leading-relaxed italic text-lg">
                        {testimonial.comment}
                      </p>
                    </div>

                    {/* Before/After Comparison */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-6 border border-gray-200">
                      <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        بهبود عملکرد:
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">قبل</div>
                          <div className="text-sm font-semibold text-gray-600">
                            {testimonial.beforeAfter.before}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">بعد</div>
                          <div className="text-sm font-semibold text-green-600">
                            {testimonial.beforeAfter.after}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Profile and Time Saved */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-xl shadow-md">
                          {testimonial.image}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {testimonial.name}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">
                            {testimonial.business}
                          </div>
                          <div className="text-xs text-gray-500">
                            {testimonial.businessType}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">
                          صرفه‌جویی زمانی
                        </div>
                        <div className="text-sm font-semibold text-blue-600">
                          {testimonial.timeSaved}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Bottom Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">آمار کلی مشتریان ما</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "کسب‌وکار فعال", value: "۵۰۰+", icon: "🏢" },
                  { label: "رزرو ماهانه", value: "۱۵,۰۰۰+", icon: "📅" },
                  { label: "رضایت مشتری", value: "۹۸٪", icon: "⭐" },
                  { label: "صرفه‌جویی زمانی", value: "۵ ساعت/روز", icon: "⏰" },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-blue-100">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Preview */}
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
              قیمت‌گذاری شفاف و منصفانه
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              بدون هزینه‌های پنهان، بدون قرارداد بلندمدت
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plansLoading ? (
              <div className="col-span-3 flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              plans.slice(0, 3).map((plan, index) => {
                const isPopular = plan.nameEn === "pro";
                const displayPrice = getPlanDisplayPrice(plan);
                const planFeatures = getPlanFeatures(plan);

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card
                      className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full relative ${
                        isPopular ? "ring-2 ring-blue-500 scale-105" : ""
                      }`}
                    >
                      {isPopular && (
                        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          محبوب‌ترین
                        </Badge>
                      )}
                      <CardContent className="p-8 text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {plan.name}
                        </h3>
                        <p className="text-gray-600 mb-6">{plan.description}</p>
                        <div className="mb-6">
                          <div className="text-3xl font-bold text-gray-900">
                            {displayPrice.price}
                            {displayPrice.price !== "تماس" &&
                              displayPrice.price !==
                                formatCommission(plan.commissionRate) && (
                                <span className="text-lg text-gray-600 font-normal">
                                  {" "}
                                  تومان
                                </span>
                              )}
                          </div>
                          <div className="text-gray-600 text-sm">
                            /{displayPrice.period}
                          </div>
                        </div>
                        <ul className="space-y-3 mb-8 text-sm text-gray-600">
                          {planFeatures.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          className={`w-full ${isPopular ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}
                          asChild
                        >
                          <Link to="/pricing">
                            {plan.nameEn === "enterprise"
                              ? "تماس با فروش"
                              : "انتخاب پلن"}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/pricing"
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              مقایسه کامل پلن‌ها →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Redesigned */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-white/5 to-purple-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/30"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/90 text-sm font-medium">
                شروع رایگان - بدون نیاز به کارت اعتباری
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              کسب‌وکارتان را
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                متحول کنید
              </span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              همین امروز شروع کنید و در عرض ۵ دقیقه سیستم رزرو آنلاین داشته
              باشید.
              <span className="font-semibold text-yellow-300">
                +۵۰۰ کسب‌وکار
              </span>{" "}
              قبلاً این کار را کرده‌اند.
            </motion.p>

            {/* Benefits Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto"
            >
              {[
                {
                  icon: "⚡",
                  title: "شروع فوری",
                  description: "۵ دقیقه تا راه‌اندازی",
                },
                {
                  icon: "💰",
                  title: "پلن رایگان",
                  description: "بدون هزینه شروع",
                },
                {
                  icon: "🎯",
                  title: "نتایج تضمینی",
                  description: "+۵۰% افزایش رزرو",
                },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                >
                  <div className="text-3xl mb-3">{benefit.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-white/80 text-sm">{benefit.description}</p>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-10 py-5 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link
                  to="/auth/business-register"
                  className="flex items-center gap-3"
                >
                  <Rocket className="w-6 h-6" />
                  شروع رایگان - همین الان
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white/40 text-white hover:bg-white/20 backdrop-blur-sm px-10 py-5 text-lg font-semibold transition-all duration-300"
                asChild
              >
                <Link to="/contact" className="flex items-center gap-3">
                  <Phone className="w-5 h-5" />
                  مشاوره رایگان
                </Link>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-white/80"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>۱۴ روز رایگان</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>لغو آسان</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>پشتیبانی ۲۴/۷</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>بدون کدنویسی</span>
              </div>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
              className="mt-10 pt-8 border-t border-white/20"
            >
              <div className="flex items-center justify-center gap-6 text-white/60 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {["👨‍⚕️", "👩‍💼", "🎵", "💇‍♀️", "🏢", "🎨"].map((emoji, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm border-2 border-white/30"
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <span>+۵۰۰ کسب‌وکار فعال</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>۴.۹/۵ امتیاز</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;

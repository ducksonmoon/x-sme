import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Star,
  Zap,
  Crown,
  Building2,
  CreditCard,
  Users,
  MessageSquare,
  Shield,
  ArrowRight,
  Info,
  TrendingUp,
  Calendar,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Separator } from "@components/ui/separator";
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

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    CUSTOM_INTEGRATIONS: "یکپارچگی‌های سفارشی",
    DEDICATED_ACCOUNT_MANAGER: "مدیر اختصاصی حساب",
    SLA_GUARANTEE: "تضمین SLA",
    DEDICATED_TRAINING: "آموزش اختصاصی",
    DEDICATED_SERVER: "سرور اختصاصی",
    ADVANCED_SECURITY: "امنیت پیشرفته",
    CUSTOM_DEVELOPMENT: "توسعه سفارشی",
    MULTI_LOCATION: "چند مکان",
    ADVANCED_API: "API پیشرفته",
    PRIORITY_FEATURES: "ویژگی‌های اولویت‌دار",
    DETAILED_REPORTS: "گزارش‌های تفصیلی",
  };

  // Fetch plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/subscriptions/plans");
        const data = await response.json();

        if (data.success) {
          setPlans(
            data.data.sort((a: Plan, b: Plan) => a.sortOrder - b.sortOrder)
          );
        } else {
          setError("خطا در دریافت اطلاعات پلن‌ها");
        }
      } catch (err) {
        console.error("Failed to fetch plans:", err);
        setError("خطا در برقراری ارتباط با سرور");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleGetStarted = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (plan?.nameEn === "enterprise") {
      // For enterprise, show contact form or redirect to contact page
      navigate("/contact");
    } else {
      // For starter and pro plans, go to business registration
      navigate("/auth/business-register");
    }
  };

  const getPlanIcon = (planNameEn: string) => {
    switch (planNameEn) {
      case "starter":
        return Zap;
      case "professional":
        return Crown;
      case "enterprise":
        return Building2;
      default:
        return Zap;
    }
  };

  const getDiscountPercentage = (plan: Plan) => {
    if (plan.yearlyFee && plan.monthlyFee > 0) {
      const yearlyTotal = plan.monthlyFee * 12;
      const discount = ((yearlyTotal - plan.yearlyFee) / yearlyTotal) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("fa-IR").format(amount);
  };

  const formatCommission = (rate: number) => {
    return `${(rate * 100).toFixed(0)}٪`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>تلاش مجدد</Button>
        </div>
      </div>
    );
  }

  const faqs = [
    {
      question: "آیا هزینه راه‌اندازی یکباره است؟",
      answer:
        "بله، هزینه راه‌اندازی فقط یکبار در ابتدا پرداخت می‌شود و شامل نصب، پیکربندی و آموزش اولیه است.",
    },
    {
      question: "درصد هر رزرو چگونه محاسبه می‌شود؟",
      answer:
        "درصد مشخص شده از مبلغ نهایی هر رزرو که مشتری پرداخت می‌کند، کسر می‌شود. این مبلغ در انتهای ماه محاسبه و اعلام می‌شود.",
    },
    {
      question: "آیا می‌توانم پلن خود را تغییر دهم؟",
      answer:
        "بله، می‌توانید در هر زمان پلن خود را ارتقا دهید یا تغییر دهید. تفاوت هزینه متناسب با زمان باقی‌مانده محاسبه می‌شود.",
    },
    {
      question: "آیا دوره آزمایشی رایگان دارید؟",
      answer:
        "بله، ۱۴ روز دوره آزمایشی رایگان برای همه پلن‌ها ارائه می‌دهیم تا بتوانید سیستم را کاملاً تست کنید.",
    },
  ];

  const testimonials = [
    {
      name: "مریم احمدی",
      business: "سالن زیبایی گل",
      planNameEn: "professional",
      comment:
        "با استفاده از پلن حرفه‌ای، درآمدم ۴۰٪ افزایش یافت و مشتریانم راضی‌تر شدند.",
    },
    {
      name: "دکتر علی رضایی",
      business: "کلینیک دندانپزشکی",
      planNameEn: "starter",
      comment: "پلن استارتر برای شروع عالی بود. حالا به حرفه‌ای ارتقا داده‌ام.",
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
              <CreditCard className="w-3 h-3 mr-2" />
              قیمت‌گذاری شفاف
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              قیمت‌گذاری
              <span className="text-blue-600 block">ساده و منصفانه</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              بدون هزینه‌های پنهان، بدون قرارداد بلندمدت. فقط پرداخت کنید و شروع
              کنید. هر پلنی که انتخاب کنید، پشتیبانی کامل ما را خواهید داشت.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-12"
          >
            <div className="bg-gray-100 rounded-lg p-1 inline-flex">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                  billingPeriod === "monthly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ماهانه
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                  billingPeriod === "yearly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                سالانه
                {plans.some((p) => getDiscountPercentage(p) > 0) && (
                  <Badge className="mr-2 text-xs bg-green-100 text-green-700 border-green-200">
                    تا {Math.max(...plans.map((p) => getDiscountPercentage(p)))}
                    ٪ تخفیف
                  </Badge>
                )}
              </button>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const PlanIcon = getPlanIcon(plan.nameEn);
              const isPopular = plan.nameEn === "professional";
              const discount = getDiscountPercentage(plan);

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <Card
                    className={`relative h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                      isPopular ? "ring-2 ring-blue-500 scale-105" : ""
                    }`}
                  >
                    {isPopular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        محبوب‌ترین
                      </Badge>
                    )}

                    <CardHeader className="text-center pb-8">
                      <div
                        className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isPopular ? "bg-blue-100" : "bg-gray-100"}`}
                      >
                        <PlanIcon
                          className={`w-8 h-8 ${isPopular ? "text-blue-600" : "text-gray-600"}`}
                        />
                      </div>
                      <CardTitle className="text-2xl text-gray-900">
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="text-base text-gray-600">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Pricing */}
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-2">
                          هزینه راه‌اندازی
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                          {plan.nameEn === "enterprise"
                            ? "تماس بگیرید"
                            : formatPrice(plan.setupFee)}
                          {plan.nameEn !== "enterprise" && (
                            <span className="text-sm font-normal text-gray-500 mr-1">
                              تومان
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {plan.nameEn === "enterprise"
                            ? "قیمت ویژه"
                            : billingPeriod === "monthly"
                              ? plan.monthlyFee === 0
                                ? plan.commissionRate > 0
                                  ? `+ ${formatCommission(plan.commissionRate)} هر رزرو`
                                  : "رایگان"
                                : `+ ${formatPrice(plan.monthlyFee)} تومان/ماه`
                              : plan.yearlyFee === 0
                                ? plan.commissionRate > 0
                                  ? `+ ${formatCommission(plan.commissionRate)} هر رزرو`
                                  : "رایگان"
                                : `+ ${formatPrice(plan.yearlyFee)} تومان/سال ${discount > 0 ? `(${discount}% تخفیف)` : ""}`}
                        </div>
                      </div>

                      <Separator />

                      {/* Limits */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">رزروهای ماهانه:</span>
                          <span className="font-medium text-gray-900">
                            {plan.bookingsLimit
                              ? formatPrice(plan.bookingsLimit)
                              : "نامحدود"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">خدمات:</span>
                          <span className="font-medium text-gray-900">
                            {plan.servicesLimit
                              ? plan.servicesLimit
                              : "نامحدود"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">پیامک ماهانه:</span>
                          <span className="font-medium text-gray-900">
                            {plan.smsLimit
                              ? formatPrice(plan.smsLimit)
                              : "نامحدود"}
                          </span>
                        </div>
                      </div>

                      <Separator />

                      {/* Features */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-500">
                          ویژگی‌های اصلی:
                        </h4>
                        {plan.features.slice(0, 6).map((feature, idx) => {
                          const featureLabel =
                            featureLabels[feature] || feature;
                          return (
                            <div key={idx} className="flex items-center gap-3">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-gray-700">
                                {featureLabel}
                              </span>
                            </div>
                          );
                        })}
                        {plan.features.length > 6 && (
                          <div className="text-xs text-gray-500">
                            + {plan.features.length - 6} ویژگی دیگر
                          </div>
                        )}
                      </div>

                      <Button
                        className={`w-full text-lg ${
                          isPopular
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-gray-900 hover:bg-gray-800 text-white"
                        }`}
                        size="lg"
                        onClick={() => handleGetStarted(plan.id)}
                      >
                        {plan.nameEn === "enterprise"
                          ? "تماس با فروش"
                          : "شروع کنید"}
                        <ArrowRight className="w-4 h-4 mr-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
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
              محاسبه بازگشت سرمایه
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              ببینید X-SME چقدر می‌تواند روی درآمد شما تأثیر بگذارد
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Statistics */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                آمار واقعی مشتریان ما:
              </h3>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-6 bg-white border-0 shadow-lg rounded-lg">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">
                      +47%
                    </div>
                    <div className="text-sm text-gray-600">
                      افزایش متوسط درآمد
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-white border-0 shadow-lg rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">+35%</div>
                    <div className="text-sm text-gray-600">
                      افزایش مشتریان جدید
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-white border-0 shadow-lg rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      -23%
                    </div>
                    <div className="text-sm text-gray-600">
                      کاهش رزروهای لغو شده
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-white border-0 shadow-lg rounded-lg">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      -60%
                    </div>
                    <div className="text-sm text-gray-600">
                      کاهش زمان مدیریت نوبت
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Calculator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">
                    محاسبه‌گر سود
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    درآمد احتمالی خود را محاسبه کنید
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2">
                        افزایش درآمد ماهانه تخمینی
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        +۲۵ میلیون تومان
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        بر اساس متوسط مشتریان ما
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <Button
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => navigate("/auth/business-register")}
                    >
                      شروع رایگان ۱۴ روزه
                      <ArrowRight className="w-4 h-4 mr-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
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
              چرا X-SME انتخاب درست است؟
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              مزایای کلیدی که کسب‌وکار شما را متحول می‌کند
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Shield,
                title: "امنیت بالا",
                description:
                  "تمام اطلاعات با استانداردهای بین‌المللی محافظت می‌شوند",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: MessageSquare,
                title: "پشتیبانی ۲۴/۷",
                description: "تیم پشتیبانی ما همیشه آماده کمک به شماست",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: CreditCard,
                title: "پرداخت آسان",
                description: "اتصال به تمام درگاه‌های پرداخت معتبر ایرانی",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Users,
                title: "رابط کاربری ساده",
                description: "طراحی شده برای آسان‌ترین استفاده توسط مشتریان",
                color: "from-orange-500 to-red-500",
              },
              {
                icon: Star,
                title: "رضایت ۹۸%",
                description: "۹۸% مشتریان ما X-SME را پیشنهاد می‌دهند",
                color: "from-yellow-500 to-orange-500",
              },
              {
                icon: Building2,
                title: "سازگاری جهانی + WordPress",
                description:
                  "کار با هر پلتفرمی - HTML، React، Vue، Drupal و... + پلاگین ویژه WordPress",
                color: "from-indigo-500 to-purple-500",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-8 text-center">
                    <div
                      className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
                    >
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
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
              مشتریان ما چه می‌گویند؟
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              تجربه واقعی کسانی که X-SME را انتخاب کرده‌اند
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      "{testimonial.comment}"
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {testimonial.business}
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        {plans.find((p) => p.nameEn === testimonial.planNameEn)
                          ?.name || testimonial.planNameEn}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
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
              سوالات متداول
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              پاسخ سوالاتی که ممکن است درباره قیمت‌گذاری داشته باشید
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
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
            <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="py-16 px-8">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                  آماده شروع هستید؟
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                  ۱۴ روز رایگان تست کنید. بدون نیاز به کارت اعتباری.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-lg"
                    onClick={() => navigate("/auth/business-register")}
                  >
                    شروع رایگان
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                    onClick={() => navigate("/contact")}
                  >
                    مشاوره رایگان
                    <ArrowRight className="w-4 h-4 mr-2" />
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

export default Pricing;

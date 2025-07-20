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
    WHITE_LABEL_SDK: "SDK برچسب سفید",
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
      case "growth":
        return TrendingUp;
      case "pro":
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
      question: "آیا پلن رایگان دارید؟",
      answer:
        "بله، پلن پایه کاملاً رایگان است و می‌توانید بدون محدودیت زمانی از آن استفاده کنید. برای ارتقاء به پلن‌های بالاتر، هر زمان که آماده باشید می‌توانید اقدام کنید.",
    },
  ];

  const testimonials = [
    {
      name: "مریم احمدی",
      business: "سالن زیبایی گل",
      planNameEn: "pro",
      comment:
        "با استفاده از پلن پرو، درآمدم ۴۰٪ افزایش یافت و مشتریانم راضی‌تر شدند.",
    },
    {
      name: "دکتر علی رضایی",
      business: "کلینیک دندانپزشکی",
      planNameEn: "starter",
      comment: "پلن استارتر برای شروع عالی بود. حالا به گروت ارتقا داده‌ام.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>

        <div className="container mx-auto px-4 max-w-7xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            {/* Badge */}
            <Badge className="mb-6 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 transition-colors px-4 py-2 text-sm font-medium">
              <CreditCard className="w-4 h-4 mr-2" />
              قیمت‌گذاری شفاف برای کسب‌وکارهای ایرانی
            </Badge>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              <span className="block">قیمت‌گذاری</span>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                ساده و منصفانه
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              ویجت رزرو آنلاین مخصوص کسب‌وکارهای ایرانی با درگاه‌های پرداخت
              داخلی.
              <span className="font-semibold text-blue-600">
                {" "}
                بدون هزینه‌های پنهان
              </span>
              ،
              <span className="font-semibold text-purple-600">
                {" "}
                بدون قرارداد بلندمدت
              </span>
              .
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>پلن رایگان برای شروع</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>نصب ۵ دقیقه‌ای</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>پشتیبانی فارسی</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>درگاه‌های پرداخت ایرانی</span>
              </div>
            </div>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-16"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-200/50 inline-flex">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  billingPeriod === "monthly"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                ماهانه
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-300 relative ${
                  billingPeriod === "yearly"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                سالانه
                {plans.some((p) => getDiscountPercentage(p) > 0) && (
                  <Badge className="absolute -top-2 -right-2 text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-2 py-1 font-bold shadow-lg">
                    تا {Math.max(...plans.map((p) => getDiscountPercentage(p)))}
                    ٪ تخفیف
                  </Badge>
                )}
              </button>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, index) => {
              const PlanIcon = getPlanIcon(plan.nameEn);
              const isPopular = plan.nameEn === "pro";
              const discount = getDiscountPercentage(plan);

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 * index }}
                  className={`relative ${isPopular ? "lg:col-span-1 lg:row-span-1" : ""}`}
                >
                  <Card
                    className={`relative h-full border-0 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                      isPopular
                        ? "bg-gradient-to-br from-blue-50 via-white to-purple-50 shadow-2xl ring-2 ring-blue-500/20 scale-105"
                        : "bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2 text-sm font-bold shadow-lg">
                          <Star className="w-4 h-4 mr-2" />
                          محبوب‌ترین
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-6 pt-8">
                      <div
                        className={`w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center ${
                          isPopular
                            ? "bg-gradient-to-br from-blue-100 to-purple-100 shadow-lg"
                            : "bg-gradient-to-br from-gray-100 to-slate-100"
                        }`}
                      >
                        <PlanIcon
                          className={`w-10 h-10 ${
                            isPopular ? "text-blue-600" : "text-gray-600"
                          }`}
                        />
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 leading-relaxed">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8">
                      {/* Pricing */}
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">
                          هزینه راه‌اندازی
                        </div>
                        <div className="text-4xl font-bold text-gray-900 mb-3">
                          {plan.nameEn === "enterprise"
                            ? "تماس بگیرید"
                            : formatPrice(plan.setupFee)}
                          {plan.nameEn !== "enterprise" && (
                            <span className="text-lg font-normal text-gray-500 mr-1">
                              تومان
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            plan.nameEn === "enterprise"
                              ? "text-purple-600"
                              : plan.monthlyFee === 0
                                ? "text-green-600"
                                : "text-gray-600"
                          }`}
                        >
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

                      <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                      {/* Limits */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 text-center mb-4">
                          محدودیت‌ها و امکانات
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-gray-600">
                                {plan.nameEn === "enterprise"
                                  ? "N/A"
                                  : "کارکنان"}
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {plan.nameEn === "enterprise"
                                ? "N/A"
                                : plan.bookingsLimit
                                  ? plan.bookingsLimit
                                  : "نامحدود"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-600">
                                خدمات
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {plan.servicesLimit
                                ? plan.servicesLimit
                                : "نامحدود"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-purple-600" />
                              <span className="text-sm text-gray-600">
                                درگاه پرداخت
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {plan.features.includes("ZARINPAL_GATEWAY")
                                ? "زرین‌پال"
                                : plan.features.includes("TWO_PAYMENT_GATEWAYS")
                                  ? "هر ۲"
                                  : plan.features.includes(
                                        "ALL_PAYMENT_GATEWAYS"
                                      )
                                    ? "همه"
                                    : "سفارشی"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm text-gray-600">
                                برندینگ
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {plan.features.includes("POWERED_BY_BRANDING")
                                ? '"powered by"'
                                : plan.features.includes("MINIMAL_BRANDING")
                                  ? "حداقلی"
                                  : plan.features.includes(
                                        "WHITE_LABEL_BRANDING"
                                      )
                                    ? "سفید"
                                    : plan.features.includes("NO_BRANDING")
                                      ? "هیچ"
                                      : "پایه"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                      {/* Features */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 text-center mb-4">
                          ویژگی‌های کلیدی
                        </h4>
                        <div className="space-y-2">
                          {plan.features.slice(0, 5).map((feature, idx) => {
                            const featureLabel =
                              featureLabels[feature] || feature;
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                <span className="text-sm text-gray-700 font-medium">
                                  {featureLabel}
                                </span>
                              </div>
                            );
                          })}
                          {plan.features.length > 5 && (
                            <div className="text-center pt-2">
                              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                + {plan.features.length - 5} ویژگی دیگر
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div className="pt-4">
                        <Button
                          className={`w-full text-lg font-semibold py-6 transition-all duration-300 ${
                            isPopular
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                              : "bg-gradient-to-r from-gray-900 to-slate-800 hover:from-gray-800 hover:to-slate-700 text-white shadow-lg hover:shadow-xl"
                          }`}
                          size="lg"
                          onClick={() => handleGetStarted(plan.id)}
                        >
                          {plan.nameEn === "enterprise"
                            ? "تماس با فروش"
                            : "شروع کنید"}
                          <ArrowRight className="w-5 h-5 mr-2" />
                        </Button>
                      </div>
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
                      شروع رایگان
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
                  پلن رایگان برای شروع. بدون نیاز به کارت اعتباری.
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

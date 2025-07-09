import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Sparkles,
  Clock,
  BarChart3,
  Settings,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import LoadingSpinner from "./LoadingSpinner";

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

interface PlanSelectorProps {
  onPlanSelect: (plan: Plan, billingCycle: "MONTHLY" | "YEARLY") => void;
  loading?: boolean;
  className?: string;
}

const featureLabels: Record<
  string,
  { label: string; description: string; icon: React.ElementType }
> = {
  BASIC_WIDGET: {
    label: "ویجت پایه",
    description: "ویجت رزرو ساده",
    icon: CreditCard,
  },
  ADVANCED_WIDGET: {
    label: "ویجت پیشرفته",
    description: "ویجت با قابلیت‌های کامل",
    icon: Sparkles,
  },
  ENTERPRISE_WIDGET: {
    label: "ویجت سازمانی",
    description: "ویجت سفارشی‌سازی شده",
    icon: Building2,
  },
  SINGLE_BUSINESS: {
    label: "یک کسب‌وکار",
    description: "مدیریت یک کسب‌وکار",
    icon: Users,
  },
  UNLIMITED_BUSINESSES: {
    label: "کسب‌وکارهای نامحدود",
    description: "مدیریت چند کسب‌وکار",
    icon: Building2,
  },
  EMAIL_SUPPORT: {
    label: "پشتیبانی ایمیل",
    description: "پشتیبانی از طریق ایمیل",
    icon: MessageSquare,
  },
  PRIORITY_SUPPORT: {
    label: "پشتیبانی اولویت‌دار",
    description: "پاسخ سریع‌تر",
    icon: Shield,
  },
  SUPPORT_24_7: {
    label: "پشتیبانی ۲۴/۷",
    description: "پشتیبانی شبانه روزی",
    icon: Clock,
  },
  BASIC_ANALYTICS: {
    label: "آمار پایه",
    description: "گزارشات ساده",
    icon: BarChart3,
  },
  ADVANCED_ANALYTICS: {
    label: "آمار پیشرفته",
    description: "تحلیل‌های جامع",
    icon: BarChart3,
  },
  API_ACCESS: {
    label: "دسترسی API",
    description: "یکپارچگی با سیستم‌های دیگر",
    icon: Settings,
  },
  CUSTOM_BRANDING: {
    label: "برندینگ سفارشی",
    description: "لوگو و رنگ شخصی",
    icon: Sparkles,
  },
  SMS_TELEGRAM_NOTIFICATIONS: {
    label: "اعلان پیامک و تلگرام",
    description: "یادآوری خودکار",
    icon: MessageSquare,
  },
  PAYMENT_GATEWAY_INTEGRATION: {
    label: "درگاه پرداخت",
    description: "یکپارچگی با بانک‌ها",
    icon: CreditCard,
  },
  MULTI_PAYMENT_GATEWAYS: {
    label: "چند درگاه پرداخت",
    description: "انتخاب از چند بانک",
    icon: CreditCard,
  },
  PERSIAN_CALENDAR: {
    label: "تقویم فارسی",
    description: "پشتیبانی کامل از تاریخ شمسی",
    icon: Calendar,
  },
  STAFF_MANAGEMENT: {
    label: "مدیریت کارکنان",
    description: "تعریف دسترسی‌های مختلف",
    icon: Users,
  },
  WHITE_LABEL: {
    label: "برچسب سفید",
    description: "حذف کامل برند X-SME",
    icon: Building2,
  },
  CUSTOM_INTEGRATIONS: {
    label: "یکپارچگی‌های سفارشی",
    description: "اتصال به سیستم‌های موجود",
    icon: Settings,
  },
  DEDICATED_ACCOUNT_MANAGER: {
    label: "مدیر اختصاصی حساب",
    description: "مشاور شخصی",
    icon: Users,
  },
  SLA_GUARANTEE: {
    label: "تضمین SLA",
    description: "تضمین زمان پاسخگویی",
    icon: Shield,
  },
  DEDICATED_TRAINING: {
    label: "آموزش اختصاصی",
    description: "دوره‌های آموزشی شخصی",
    icon: Users,
  },
  DEDICATED_SERVER: {
    label: "سرور اختصاصی",
    description: "سرور مجزا برای شما",
    icon: Building2,
  },
  ADVANCED_SECURITY: {
    label: "امنیت پیشرفته",
    description: "حفاظت حرفه‌ای از اطلاعات",
    icon: Shield,
  },
  CUSTOM_DEVELOPMENT: {
    label: "توسعه سفارشی",
    description: "ویژگی‌های اختصاصی",
    icon: Settings,
  },
  MULTI_LOCATION: {
    label: "چند مکان",
    description: "مدیریت شعب مختلف",
    icon: Building2,
  },
  ADVANCED_API: {
    label: "API پیشرفته",
    description: "API کامل و قدرتمند",
    icon: Settings,
  },
  PRIORITY_FEATURES: {
    label: "ویژگی‌های اولویت‌دار",
    description: "دسترسی زودتر به قابلیت‌ها",
    icon: Star,
  },
  DETAILED_REPORTS: {
    label: "گزارش‌های تفصیلی",
    description: "آنالیز کامل عملکرد",
    icon: BarChart3,
  },
};

const PlanSelector: React.FC<PlanSelectorProps> = ({
  onPlanSelect,
  loading = false,
  className = "",
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">(
    "MONTHLY"
  );

  // Fetch plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/subscriptions/plans");
        const data = await response.json();

        if (data.success) {
          setPlans(data.data);
          // Auto-select the "Professional" plan as recommended
          const proPlan = data.data.find(
            (p: Plan) => p.nameEn === "professional"
          );
          if (proPlan) {
            setSelectedPlan(proPlan);
          }
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleContinue = () => {
    if (selectedPlan) {
      onPlanSelect(selectedPlan, billingCycle);
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

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case "استارتر":
        return Zap;
      case "حرفه‌ای":
        return Crown;
      case "سازمانی":
        return Building2;
      default:
        return CreditCard;
    }
  };

  const isPlanPopular = (plan: Plan) => plan.nameEn === "professional";

  if (plansLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          انتخاب پلن مناسب
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          بهترین پلن را برای نیازهای کسب‌وکار خود انتخاب کنید. می‌توانید بعداً
          تغییر دهید.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 inline-flex">
          <button
            onClick={() => setBillingCycle("MONTHLY")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingCycle === "MONTHLY"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            ماهانه
          </button>
          <button
            onClick={() => setBillingCycle("YEARLY")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingCycle === "YEARLY"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            سالانه
            {plans.some((p) => getDiscountPercentage(p) > 0) && (
              <Badge variant="secondary" className="mr-2 text-xs">
                تا ۲۰٪ تخفیف
              </Badge>
            )}
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => {
          const PlanIcon = getPlanIcon(plan.name);
          const isSelected = selectedPlan?.id === plan.id;
          const isPopular = isPlanPopular(plan);
          const discount = getDiscountPercentage(plan);

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card
                className={`relative h-full cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-primary-500 shadow-lg shadow-primary-500/10 scale-105"
                    : isPopular
                      ? "border-primary-300 shadow-md"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
                }`}
                onClick={() => handlePlanSelect(plan)}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary-500">
                    <Star className="w-3 h-3 mr-1" />
                    محبوب‌ترین
                  </Badge>
                )}

                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <PlanIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Pricing */}
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      هزینه راه‌اندازی
                    </div>
                    <div className="text-3xl font-bold mb-2">
                      {plan.setupFee.toLocaleString()}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mr-1">
                        تومان
                      </span>
                    </div>

                    {/* Monthly/Yearly Fee */}
                    {billingCycle === "MONTHLY" ? (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        +{" "}
                        {plan.monthlyFee === 0
                          ? "رایگان"
                          : `${plan.monthlyFee.toLocaleString()} تومان/ماه`}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        +{" "}
                        {plan.yearlyFee === 0
                          ? "رایگان"
                          : `${plan.yearlyFee.toLocaleString()} تومان/سال`}
                        {discount > 0 && (
                          <span className="text-green-600 dark:text-green-400 mr-2">
                            ({discount}% تخفیف)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Commission */}
                    {plan.commissionRate > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        + {plan.commissionRate * 100}% کمیسیون هر رزرو
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Limits */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        رزروهای ماهانه:
                      </span>
                      <span className="font-medium">
                        {plan.bookingsLimit
                          ? plan.bookingsLimit.toLocaleString()
                          : "نامحدود"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        خدمات:
                      </span>
                      <span className="font-medium">
                        {plan.servicesLimit ? plan.servicesLimit : "نامحدود"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        پیامک ماهانه:
                      </span>
                      <span className="font-medium">
                        {plan.smsLimit
                          ? plan.smsLimit.toLocaleString()
                          : "نامحدود"}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      ویژگی‌های اصلی:
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {plan.features.slice(0, 8).map((feature, idx) => {
                        const featureInfo = featureLabels[feature];
                        if (!featureInfo) return null;

                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {featureInfo.label}
                            </span>
                          </div>
                        );
                      })}
                      {plan.features.length > 8 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          + {plan.features.length - 8} ویژگی دیگر
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selection Button */}
                  <Button
                    className={`w-full ${
                      isSelected
                        ? "bg-primary-600 text-white"
                        : isPopular
                          ? "bg-primary-600 text-white hover:bg-primary-700"
                          : "variant-outline"
                    }`}
                    size="lg"
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {isSelected ? "انتخاب شده" : "انتخاب پلن"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Continue Button */}
      {selectedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Button
            onClick={handleContinue}
            disabled={loading}
            size="lg"
            className="px-8"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                در حال پردازش...
              </div>
            ) : (
              <>
                ادامه با پلن {selectedPlan.name}
                <ArrowRight className="w-4 h-4 mr-2" />
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Trial Notice */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300">
          <Info className="w-4 h-4" />
          <span className="text-sm">
            ۱۴ روز رایگان آزمایش کنید - بدون نیاز به کارت اعتباری
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlanSelector;

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Zap,
  TrendingUp,
  Crown,
  Building2,
  ArrowRight,
  CreditCard,
  Calendar,
  MessageSquare,
  Settings,
  Star,
  Shield,
  Sparkles,
  AlertTriangle,
  Info,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import LoadingSpinner from "./LoadingSpinner";
import toast from "react-hot-toast";

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
  isActive: boolean;
  sortOrder: number;
}

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: Plan;
  availablePlans: Plan[];
  currentBillingCycle: "MONTHLY" | "YEARLY";
}

const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  availablePlans,
  currentBillingCycle,
}) => {
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">(
    currentBillingCycle
  );
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Filter out current plan and inactive plans
  const upgradePlans = availablePlans.filter(
    (plan) =>
      plan.id !== currentPlan.id &&
      plan.isActive &&
      !plan.name.includes("(Old)")
  );

  const upgradeMutation = useMutation({
    mutationFn: async (data: {
      planId: string;
      billingCycle: "MONTHLY" | "YEARLY";
    }) => {
      const response = await fetch("/api/subscriptions/plan", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      toast.success("پلن شما با موفقیت ارتقا یافت!");
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "خطا در ارتقای پلن");
    },
  });

  const handleUpgrade = async () => {
    if (!selectedPlan) return;

    // Redirect to payment page
    const params = new URLSearchParams({
      planId: selectedPlan.id,
      billingCycle,
    });

    window.location.href = `/dashboard/payment?${params.toString()}`;
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

  const getPlanColor = (planNameEn: string) => {
    switch (planNameEn) {
      case "starter":
        return "from-blue-500 to-cyan-500";
      case "growth":
        return "from-green-500 to-emerald-500";
      case "pro":
        return "from-purple-500 to-pink-500";
      case "enterprise":
        return "from-orange-500 to-red-500";
      default:
        return "from-blue-500 to-cyan-500";
    }
  };

  const formatPrice = (amount: number) => {
    return amount.toLocaleString("fa-IR");
  };

  const getDiscountPercentage = (plan: Plan) => {
    if (plan.yearlyFee && plan.monthlyFee > 0) {
      const yearlyTotal = plan.monthlyFee * 12;
      const discount = ((yearlyTotal - plan.yearlyFee) / yearlyTotal) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const featureLabels: Record<
    string,
    { label: string; description: string; icon: React.ElementType }
  > = {
    BASIC_BOOKING: {
      label: "رزرو پایه",
      description: "سیستم رزرو ساده",
      icon: Calendar,
    },
    ADVANCED_BOOKING: {
      label: "رزرو پیشرفته",
      description: "رزرو با قابلیت‌های پیشرفته",
      icon: Calendar,
    },
    UNLIMITED_BOOKINGS: {
      label: "رزرو نامحدود",
      description: "بدون محدودیت رزرو",
      icon: Calendar,
    },
    BASIC_SMS: {
      label: "پیامک پایه",
      description: "ارسال پیامک ساده",
      icon: MessageSquare,
    },
    ADVANCED_SMS: {
      label: "پیامک پیشرفته",
      description: "پیامک با قالب‌های سفارشی",
      icon: MessageSquare,
    },
    UNLIMITED_SMS: {
      label: "پیامک نامحدود",
      description: "بدون محدودیت پیامک",
      icon: MessageSquare,
    },
    BASIC_REPORTS: {
      label: "گزارشات پایه",
      description: "گزارشات ساده",
      icon: TrendingUp,
    },
    ADVANCED_REPORTS: {
      label: "گزارشات پیشرفته",
      description: "گزارشات تفصیلی",
      icon: TrendingUp,
    },
    DETAILED_REPORTS: {
      label: "گزارش‌های تفصیلی",
      description: "آنالیز کامل عملکرد",
      icon: TrendingUp,
    },
    STAFF_MANAGEMENT: {
      label: "مدیریت کارکنان",
      description: "مدیریت تیم",
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
    ZARINPAL_GATEWAY: {
      label: "درگاه زرین‌پال",
      description: "پرداخت از طریق زرین‌پال",
      icon: CreditCard,
    },
    TWO_PAYMENT_GATEWAYS: {
      label: "هر ۲ درگاه پرداخت",
      description: "انتخاب از بین ۲ درگاه پرداخت",
      icon: CreditCard,
    },
    ALL_PAYMENT_GATEWAYS: {
      label: "تمام درگاه‌های پرداخت",
      description: "دسترسی به تمام درگاه‌های پرداخت",
      icon: CreditCard,
    },
    POWERED_BY_BRANDING: {
      label: "برندینگ 'powered by'",
      description: "نمایش برند X-SME",
      icon: Shield,
    },
    MINIMAL_BRANDING: {
      label: "برندینگ حداقلی",
      description: "برندینگ کم‌تر",
      icon: Shield,
    },
    WHITE_LABEL_BRANDING: {
      label: "برندینگ سفید",
      description: "بدون برند X-SME",
      icon: Shield,
    },
    NO_BRANDING: {
      label: "بدون برندینگ",
      description: "کاملاً سفارشی",
      icon: Shield,
    },
    WHITE_LABEL_SDK: {
      label: "SDK برچسب سفید",
      description: "SDK کاملاً سفارشی",
      icon: Settings,
    },
    CUSTOM_INTEGRATIONS: {
      label: "ادغام‌های سفارشی",
      description: "ادغام با سیستم‌های موجود",
      icon: Settings,
    },
    DEDICATED_ACCOUNT_MANAGER: {
      label: "مدیر حساب اختصاصی",
      description: "پشتیبانی شخصی و اختصاصی",
      icon: Users,
    },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ارتقای پلن
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    پلن فعلی: {currentPlan.name}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Billing Cycle Toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <Button
                  variant={billingCycle === "MONTHLY" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingCycle("MONTHLY")}
                  className="flex-1"
                >
                  ماهانه
                </Button>
                <Button
                  variant={billingCycle === "YEARLY" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingCycle("YEARLY")}
                  className="flex-1"
                >
                  سالانه
                  {billingCycle === "YEARLY" && (
                    <Badge className="ml-2 bg-green-500 text-white text-xs">
                      تا ۲۰٪ تخفیف
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {upgradePlans.map((plan) => {
                const PlanIcon = getPlanIcon(plan.nameEn);
                const isSelected = selectedPlan?.id === plan.id;
                const discount = getDiscountPercentage(plan);
                const price =
                  billingCycle === "YEARLY" ? plan.yearlyFee : plan.monthlyFee;

                return (
                  <motion.div
                    key={plan.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`relative cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "ring-2 ring-purple-500 shadow-lg border-purple-200 dark:border-purple-700"
                          : "hover:shadow-md border-gray-200 dark:border-gray-700"
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}

                      <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-3">
                          <div
                            className={`w-16 h-16 bg-gradient-to-br ${getPlanColor(
                              plan.nameEn
                            )} rounded-2xl flex items-center justify-center shadow-lg`}
                          >
                            <PlanIcon className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                          {plan.name}
                        </CardTitle>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {plan.description}
                        </p>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Pricing */}
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                              {price === 0 ? "رایگان" : `${formatPrice(price)}`}
                            </span>
                            {price > 0 && (
                              <span className="text-gray-600 dark:text-gray-400">
                                تومان
                              </span>
                            )}
                          </div>
                          {billingCycle === "YEARLY" && discount > 0 && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              {discount}٪ تخفیف
                            </Badge>
                          )}
                          {price > 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {billingCycle === "MONTHLY" ? "ماهانه" : "سالانه"}
                            </p>
                          )}
                        </div>

                        <Separator />

                        {/* Features */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            ویژگی‌های کلیدی:
                          </h4>
                          <div className="space-y-1">
                            {plan.features.slice(0, 5).map((feature, index) => {
                              const featureInfo = featureLabels[feature];
                              if (!featureInfo) return null;
                              const FeatureIcon = featureInfo.icon;
                              return (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                                >
                                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <span>{featureInfo.label}</span>
                                </div>
                              );
                            })}
                            {plan.features.length > 5 && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                +{plan.features.length - 5} ویژگی دیگر
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Limits */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            محدودیت‌ها:
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex justify-between">
                              <span>کارکنان:</span>
                              <span>
                                {plan.nameEn === "enterprise"
                                  ? "نامحدود"
                                  : plan.bookingsLimit
                                    ? `${plan.bookingsLimit} نفر`
                                    : "نامحدود"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>خدمات:</span>
                              <span>
                                {plan.servicesLimit
                                  ? `${plan.servicesLimit} خدمت`
                                  : "نامحدود"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>پیامک:</span>
                              <span>
                                {plan.smsLimit
                                  ? `${plan.smsLimit} پیامک`
                                  : "نامحدود"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Selected Plan Details */}
            {selectedPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      ارتقا به {selectedPlan.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      تمام ویژگی‌های جدید بلافاصله در دسترس خواهند بود
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      ویژگی‌های جدید:
                    </h4>
                    <div className="space-y-2">
                      {selectedPlan.features
                        .filter(
                          (feature) => !currentPlan.features.includes(feature)
                        )
                        .slice(0, 6)
                        .map((feature, index) => {
                          const featureInfo = featureLabels[feature];
                          if (!featureInfo) return null;
                          const FeatureIcon = featureInfo.icon;
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg"
                            >
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <FeatureIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {featureInfo.label}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {featureInfo.description}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      اطلاعات صورتحساب:
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          هزینه{" "}
                          {billingCycle === "MONTHLY" ? "ماهانه" : "سالانه"}:
                        </span>
                        <span className="font-medium">
                          {billingCycle === "YEARLY"
                            ? selectedPlan.yearlyFee === 0
                              ? "رایگان"
                              : `${formatPrice(selectedPlan.yearlyFee)} تومان`
                            : selectedPlan.monthlyFee === 0
                              ? "رایگان"
                              : `${formatPrice(selectedPlan.monthlyFee)} تومان`}
                        </span>
                      </div>
                      {selectedPlan.setupFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            هزینه راه‌اندازی:
                          </span>
                          <span className="font-medium">
                            {formatPrice(selectedPlan.setupFee)} تومان
                          </span>
                        </div>
                      )}
                      {selectedPlan.commissionRate > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            کمیسیون:
                          </span>
                          <span className="font-medium">
                            {(selectedPlan.commissionRate * 100).toFixed(0)}٪
                          </span>
                        </div>
                      )}
                      {billingCycle === "YEARLY" &&
                        getDiscountPercentage(selectedPlan) > 0 && (
                          <div className="flex justify-between text-green-600 dark:text-green-400">
                            <span>تخفیف سالانه:</span>
                            <span className="font-medium">
                              {getDiscountPercentage(selectedPlan)}٪
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={onClose}>
                انصراف
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.open("/pricing", "_blank")}
                >
                  <Info className="w-4 h-4 ml-2" />
                  مقایسه کامل
                </Button>
                <Button
                  onClick={handleUpgrade}
                  disabled={!selectedPlan || isUpgrading}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg"
                >
                  {isUpgrading ? (
                    <>
                      <LoadingSpinner size="sm" className="ml-2" />
                      در حال ارتقا...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 ml-2" />
                      ارتقای پلن
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlanUpgradeModal;

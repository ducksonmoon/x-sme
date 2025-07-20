import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  Crown,
  TrendingUp,
  Zap,
  X,
  ArrowRight,
  Star,
  Award,
  Clock,
  Users,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import PlanUpgradeModal from "./PlanUpgradeModal";

interface DashboardUpgradeBannerProps {
  businessId: string;
}

const DashboardUpgradeBanner: React.FC<DashboardUpgradeBannerProps> = ({
  businessId,
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Fetch subscription data
  const { data: subscription } = useQuery({
    queryKey: ["subscription", businessId],
    queryFn: async () => {
      if (businessId) {
        const response = await fetch(
          `/api/subscriptions/business/${businessId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
      }
      return Promise.resolve(null);
    },
    enabled: !!businessId,
  });

  // Fetch available plans
  const { data: plans } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const response = await fetch("/api/subscriptions/plans", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
  });

  if (!subscription?.plan || !plans || dismissed) return null;

  const plan = subscription.plan;
  const usage = subscription.usage || {};
  const isTrial = subscription.status === "TRIAL";
  const isStarterPlan = plan.nameEn === "starter";

  // Calculate usage percentages
  const bookingsPercentage = plan.bookingsLimit
    ? (usage.bookingsThisMonth || 0) / plan.bookingsLimit
    : 0;
  const servicesPercentage = plan.servicesLimit
    ? (usage.servicesCreated || 0) / plan.servicesLimit
    : 0;
  const smsPercentage = plan.smsLimit
    ? (usage.smsUsed || 0) / plan.smsLimit
    : 0;

  // Determine upgrade reason
  const getUpgradeReason = () => {
    if (isTrial) {
      return {
        title: "دوره آزمایشی شما به پایان می‌رسد",
        description:
          "برای ادامه استفاده از تمام امکانات، پلن خود را ارتقا دهید",
        icon: Clock,
        color: "from-blue-500 to-purple-500",
        urgency: "high",
      };
    }

    if (
      bookingsPercentage >= 0.8 ||
      servicesPercentage >= 0.8 ||
      smsPercentage >= 0.8
    ) {
      return {
        title: "نزدیک به محدودیت پلن",
        description: "شما به محدودیت‌های پلن فعلی نزدیک شده‌اید",
        icon: TrendingUp,
        color: "from-amber-500 to-orange-500",
        urgency: "medium",
      };
    }

    if (isStarterPlan) {
      return {
        title: "ارتقا به پلن حرفه‌ای",
        description: "از امکانات پیشرفته‌تر و پشتیبانی بهتر بهره‌مند شوید",
        icon: Crown,
        color: "from-purple-500 to-pink-500",
        urgency: "low",
      };
    }

    return null;
  };

  const upgradeReason = getUpgradeReason();
  if (!upgradeReason) return null;

  const ReasonIcon = upgradeReason.icon;

  const getPlanBenefits = () => {
    const nextPlan = plans.find((p: any) => {
      if (isStarterPlan) return p.nameEn === "growth";
      if (plan.nameEn === "growth") return p.nameEn === "pro";
      return p.nameEn === "enterprise";
    });

    if (!nextPlan) return [];

    const benefits = [];
    if (
      nextPlan.bookingsLimit &&
      (!plan.bookingsLimit || nextPlan.bookingsLimit > plan.bookingsLimit)
    ) {
      benefits.push(`${nextPlan.bookingsLimit} رزرو ماهانه`);
    }
    if (
      nextPlan.servicesLimit &&
      (!plan.servicesLimit || nextPlan.servicesLimit > plan.servicesLimit)
    ) {
      benefits.push(`${nextPlan.servicesLimit} خدمت`);
    }
    if (
      nextPlan.smsLimit &&
      (!plan.smsLimit || nextPlan.smsLimit > plan.smsLimit)
    ) {
      benefits.push(`${nextPlan.smsLimit} پیامک`);
    }
    if (nextPlan.features) {
      const newFeatures = nextPlan.features.filter(
        (f: string) => !plan.features.includes(f)
      );
      benefits.push(
        ...newFeatures.slice(0, 2).map((f: string) => {
          const featureLabels: Record<string, string> = {
            ADVANCED_REPORTS: "گزارشات پیشرفته",
            STAFF_MANAGEMENT: "مدیریت کارکنان",
            MULTI_LOCATION: "چند مکان",
            ALL_PAYMENT_GATEWAYS: "تمام درگاه‌های پرداخت",
            WHITE_LABEL_BRANDING: "برندینگ سفید",
            CUSTOM_INTEGRATIONS: "ادغام‌های سفارشی",
            DEDICATED_ACCOUNT_MANAGER: "مدیر حساب اختصاصی",
          };
          return featureLabels[f] || f;
        })
      );
    }
    return benefits.slice(0, 3);
  };

  const benefits = getPlanBenefits();

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 dark:from-gray-800 dark:via-blue-900/10 dark:to-purple-900/10">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${upgradeReason.color} rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <ReasonIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {upgradeReason.title}
                      </h3>
                      {upgradeReason.urgency === "high" && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          مهم
                        </Badge>
                      )}
                      {upgradeReason.urgency === "medium" && (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                          توصیه
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {upgradeReason.description}
                    </p>

                    {/* Usage Progress */}
                    {(bookingsPercentage > 0.5 ||
                      servicesPercentage > 0.5 ||
                      smsPercentage > 0.5) && (
                      <div className="space-y-2 mb-4">
                        {bookingsPercentage > 0.5 && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600 dark:text-gray-400">
                                رزروهای ماهانه
                              </span>
                              <span className="font-medium">
                                {usage.bookingsThisMonth || 0} /{" "}
                                {plan.bookingsLimit || "نامحدود"}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(bookingsPercentage * 100, 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                        {servicesPercentage > 0.5 && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600 dark:text-gray-400">
                                خدمات
                              </span>
                              <span className="font-medium">
                                {usage.servicesCreated || 0} /{" "}
                                {plan.servicesLimit || "نامحدود"}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(servicesPercentage * 100, 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                        {smsPercentage > 0.5 && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600 dark:text-gray-400">
                                پیامک‌ها
                              </span>
                              <span className="font-medium">
                                {usage.smsUsed || 0} /{" "}
                                {plan.smsLimit || "نامحدود"}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(smsPercentage * 100, 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Benefits */}
                    {benefits.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          با ارتقا دریافت کنید:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {benefits.map((benefit, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-full"
                            >
                              <Star className="w-3 h-3 text-green-600 dark:text-green-400" />
                              <span className="text-xs text-green-800 dark:text-green-200">
                                {benefit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => setShowUpgradeModal(true)}
                        className={`bg-gradient-to-r ${upgradeReason.color} hover:opacity-90 text-white shadow-lg`}
                      >
                        <Sparkles className="w-4 h-4 ml-2" />
                        {isTrial ? "ارتقای فوری" : "ارتقای پلن"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open("/pricing", "_blank")}
                        className="border-2"
                      >
                        <ArrowRight className="w-4 h-4 ml-2" />
                        مشاهده پلن‌ها
                      </Button>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDismissed(true)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Plan Upgrade Modal */}
      <PlanUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={plan}
        availablePlans={plans}
        currentBillingCycle={subscription.billingCycle as "MONTHLY" | "YEARLY"}
      />
    </>
  );
};

export default DashboardUpgradeBanner;

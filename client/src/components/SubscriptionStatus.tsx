import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Crown,
  Zap,
  Building2,
  Calendar,
  AlertTriangle,
  Clock,
  MessageSquare,
  Settings,
  TrendingUp,
  Award,
  Shield,
  Sparkles,
  ArrowUpRight,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import LoadingSpinner from "./LoadingSpinner";
import PlanUpgradeModal from "./PlanUpgradeModal";

interface SubscriptionStatusProps {
  businessId: string;
}

interface Subscription {
  id: string;
  status: string;
  billingCycle: string;
  trialEndsAt: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: {
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
  };
  usage: {
    bookingsThisMonth: number;
    servicesCreated: number;
    smsUsed: number;
    revenueThisMonth: number;
    commissionOwed: number;
  };
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  businessId,
}) => {
  const navigate = useNavigate();
  const [showUsageDetails, setShowUsageDetails] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Fetch subscription data
  const {
    data: subscription,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["subscription-status", businessId],
    queryFn: async () => {
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
      return data.data as Subscription;
    },
    enabled: !!businessId,
  });

  // Fetch available plans for upgrade
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TRIAL":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "TRIAL":
        return "آزمایشی";
      case "ACTIVE":
        return "فعال";
      case "CANCELLED":
        return "لغو شده";
      default:
        return status;
    }
  };

  const formatPrice = (amount: number) => {
    return amount.toLocaleString("fa-IR");
  };

  const getTrialDaysLeft = () => {
    if (!subscription?.trialEndsAt) return 0;
    const trialEnd = new Date(subscription.trialEndsAt);
    const now = new Date();
    const daysLeft = Math.ceil(
      (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(daysLeft, 0);
  };

  const isTrialExpiringSoon = () => {
    return getTrialDaysLeft() <= 3 && getTrialDaysLeft() > 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </CardContent>
      </Card>
    );
  }

  if (error || !subscription) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 mb-4">خطا در بارگذاری اطلاعات اشتراک</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              تلاش مجدد
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const PlanIcon = getPlanIcon(subscription.plan.nameEn);
  const isTrialPeriod = subscription.status === "TRIAL";
  const daysLeft = getTrialDaysLeft();
  const trialExpiringSoon = isTrialExpiringSoon();

  return (
    <div className="space-y-6">
      {/* Main Subscription Card */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
        {/* Premium Badge for Professional+ */}
        {subscription.plan.nameEn !== "starter" && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
              <Award className="w-3 h-3 ml-1" />
              Premium
            </Badge>
          </div>
        )}

        <CardHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                  subscription.plan.nameEn === "starter"
                    ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                    : subscription.plan.nameEn === "professional"
                      ? "bg-gradient-to-br from-purple-500 to-pink-500"
                      : "bg-gradient-to-br from-orange-500 to-red-500"
                }`}
              >
                <PlanIcon className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    پلن {subscription.plan.name}
                  </CardTitle>
                  <Badge
                    className={`${getStatusColor(subscription.status)} px-3 py-1 font-medium`}
                    variant="secondary"
                  >
                    {getStatusLabel(subscription.status)}
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
                  {subscription.plan.nameEn === "starter"
                    ? "پلن پایه برای شروع کسب‌وکار با امکانات اصلی"
                    : subscription.plan.nameEn === "professional"
                      ? "پلن حرفه‌ای با امکانات پیشرفته و پشتیبانی اولویت‌دار"
                      : "پلن سازمانی با امکانات نامحدود و پشتیبانی اختصاصی"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/pricing")}
                className="border-2 hover:bg-primary/5"
              >
                <ArrowUpRight className="w-4 h-4 ml-2" />
                مقایسه پلن‌ها
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard/settings")}
                className="border-2 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 ml-2" />
                تنظیمات
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Trial Warning */}
          {isTrialPeriod && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${
                trialExpiringSoon || daysLeft === 0
                  ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                  : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock
                  className={`w-5 h-5 ${
                    trialExpiringSoon || daysLeft === 0
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                />
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      trialExpiringSoon || daysLeft === 0
                        ? "text-red-700 dark:text-red-400"
                        : "text-blue-700 dark:text-blue-400"
                    }`}
                  >
                    {daysLeft === 0
                      ? "⚠️ دوره آزمایشی امروز پایان می‌یابد!"
                      : trialExpiringSoon
                        ? "⚠️ دوره آزمایشی به پایان می‌رسد!"
                        : "🎉 در دوره آزمایشی هستید"}
                  </p>
                  <p
                    className={`text-sm ${
                      trialExpiringSoon || daysLeft === 0
                        ? "text-red-600 dark:text-red-500"
                        : "text-blue-600 dark:text-blue-500"
                    }`}
                  >
                    {daysLeft === 0
                      ? "برای ادامه، پلن خود را انتخاب کنید"
                      : daysLeft > 0
                        ? `${daysLeft} روز باقی‌مانده - از تمام امکانات استفاده کنید`
                        : "دوره آزمایشی پایان یافته"}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate("/pricing")}
                  variant={
                    trialExpiringSoon || daysLeft === 0 ? "default" : "outline"
                  }
                >
                  {trialExpiringSoon || daysLeft === 0
                    ? "ارتقای پلن"
                    : "مشاهده پلن‌ها"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Pricing Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">هزینه ماهانه</p>
              <p className="text-lg font-bold">
                {subscription.plan.monthlyFee === 0
                  ? subscription.plan.commissionRate > 0
                    ? `${(subscription.plan.commissionRate * 100).toFixed(0)}٪ کمیسیون`
                    : "رایگان"
                  : `${formatPrice(subscription.plan.monthlyFee)} تومان`}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">درآمد این ماه</p>
              <p className="text-lg font-bold text-green-600">
                {formatPrice(subscription.usage.revenueThisMonth)} تومان
              </p>
            </div>
          </div>

          <Separator />

          {/* Usage Statistics */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">استفاده از منابع</h4>
            </div>

            {/* Bookings Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  رزروهای ماهانه
                </span>
                <span>
                  {subscription.usage.bookingsThisMonth}
                  {subscription.plan.bookingsLimit && (
                    <span className="text-muted-foreground">
                      {" / "}
                      {formatPrice(subscription.plan.bookingsLimit)}
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* SMS Usage */}
            {subscription.plan.smsLimit && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    پیامک‌های ارسالی
                  </span>
                  <span>
                    {subscription.usage.smsUsed} /{" "}
                    {formatPrice(subscription.plan.smsLimit)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/pricing")}
              className="flex-1"
            >
              مقایسه پلن‌ها
            </Button>
            {subscription.plan.nameEn !== "enterprise" && (
              <Button
                size="sm"
                onClick={() => setShowUpgradeModal(true)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg"
              >
                <Sparkles className="w-4 h-4 ml-2" />
                ارتقای پلن
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Upgrade Modal */}
      {plans && (
        <PlanUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentPlan={subscription.plan}
          availablePlans={plans}
          currentBillingCycle={
            subscription.billingCycle as "MONTHLY" | "YEARLY"
          }
        />
      )}
    </div>
  );
};

export default SubscriptionStatus;

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowUpRight, Sparkles, X } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import PlanUpgradeModal from "./PlanUpgradeModal";

interface UsageLimitWarningProps {
  type: "bookings" | "services" | "sms";
  current: number;
  limit: number | null;
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
  availablePlans: any[];
  billingCycle: "MONTHLY" | "YEARLY";
  onClose?: () => void;
}

const UsageLimitWarning: React.FC<UsageLimitWarningProps> = ({
  type,
  current,
  limit,
  plan,
  availablePlans,
  billingCycle,
  onClose,
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (!limit) return null;

  const percentage = (current / limit) * 100;
  const isWarning = percentage >= 80 && percentage < 100;
  const isCritical = percentage >= 100;

  if (!isWarning && !isCritical) return null;

  const getTypeInfo = () => {
    switch (type) {
      case "bookings":
        return {
          label: "رزرو",
          icon: "📅",
          description: "رزروهای ماهانه",
        };
      case "services":
        return {
          label: "خدمات",
          icon: "🛠️",
          description: "خدمات ایجاد شده",
        };
      case "sms":
        return {
          label: "پیامک",
          icon: "💬",
          description: "پیامک‌های ارسالی",
        };
      default:
        return {
          label: "استفاده",
          icon: "📊",
          description: "استفاده از منابع",
        };
    }
  };

  const typeInfo = getTypeInfo();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-4"
      >
        <Card
          className={`border-0 shadow-lg ${
            isCritical
              ? "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800"
              : "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                    isCritical
                      ? "bg-red-100 dark:bg-red-900/20"
                      : "bg-amber-100 dark:bg-amber-900/20"
                  }`}
                >
                  {typeInfo.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className={`font-medium ${
                        isCritical
                          ? "text-red-900 dark:text-red-100"
                          : "text-amber-900 dark:text-amber-100"
                      }`}
                    >
                      {isCritical ? "محدودیت رسیده!" : "نزدیک به محدودیت"}
                    </h4>
                    <Badge
                      variant="secondary"
                      className={
                        isCritical
                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
                      }
                    >
                      {Math.round(percentage)}٪
                    </Badge>
                  </div>
                  <p
                    className={`text-sm ${
                      isCritical
                        ? "text-red-700 dark:text-red-300"
                        : "text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {isCritical
                      ? `شما به حداکثر ${typeInfo.description} رسیده‌اید (${current}/${limit})`
                      : `شما ${current} از ${limit} ${typeInfo.description} استفاده کرده‌اید`}
                  </p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isCritical
                            ? "bg-gradient-to-r from-red-500 to-orange-500"
                            : "bg-gradient-to-r from-amber-500 to-yellow-500"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => setShowUpgradeModal(true)}
                className={`${
                  isCritical
                    ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                } text-white shadow-lg`}
              >
                <Sparkles className="w-4 h-4 ml-2" />
                {isCritical ? "ارتقای فوری" : "ارتقای پلن"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/pricing", "_blank")}
                className="border-2"
              >
                <ArrowUpRight className="w-4 h-4 ml-2" />
                مشاهده پلن‌ها
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan Upgrade Modal */}
      <PlanUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={plan}
        availablePlans={availablePlans}
        currentBillingCycle={billingCycle}
      />
    </>
  );
};

export default UsageLimitWarning;

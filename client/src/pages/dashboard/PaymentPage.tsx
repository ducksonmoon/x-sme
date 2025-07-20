import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Shield,
  Lock,
  Zap,
  Crown,
  Building2,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";
import { subscriptionApi } from "@/services/api";

interface PaymentPageProps {
  planId?: string;
  billingCycle?: "MONTHLY" | "YEARLY";
  gateway?: "PASARGAD" | "SAMAN" | "ZARINPAL";
}

const PaymentPage: React.FC<PaymentPageProps> = ({
  planId: propPlanId,
  billingCycle: propBillingCycle,
  gateway: propGateway,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedGateway, setSelectedGateway] = useState<
    "TEST" | "PASARGAD" | "SAMAN" | "ZARINPAL"
  >(propGateway || "TEST");
  const [isProcessing, setIsProcessing] = useState(false);

  // Get parameters from URL or props
  const planId = propPlanId || searchParams.get("planId");
  const billingCycle =
    propBillingCycle ||
    (searchParams.get("billingCycle") as "MONTHLY" | "YEARLY") ||
    "MONTHLY";
  const paymentId = searchParams.get("paymentId");

  // Fetch plan details
  const { data: plan, isLoading: loadingPlan } = useQuery({
    queryKey: ["plan", planId],
    queryFn: async () => {
      if (!planId) return null;
      const response = await subscriptionApi.getPlans();
      return response.data.data.find((p: any) => p.id === planId);
    },
    enabled: !!planId,
  });

  // Fetch current subscription
  const { data: currentSubscription } = useQuery({
    queryKey: ["current-subscription"],
    queryFn: async () => {
      const response = await subscriptionApi.getCurrentSubscription();
      return response.data.data;
    },
  });

  // Fetch payment status if paymentId exists
  const { data: paymentStatus, isLoading: loadingPayment } = useQuery({
    queryKey: ["payment-status", paymentId],
    queryFn: async () => {
      if (!paymentId) return null;
      const response =
        await subscriptionApi.getSubscriptionPaymentStatus(paymentId);
      return response.data.data;
    },
    enabled: !!paymentId,
    refetchInterval: paymentId ? 5000 : false, // Poll every 5 seconds if paymentId exists
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (data: {
      planId: string;
      billingCycle: "MONTHLY" | "YEARLY";
      gateway: "TEST" | "PASARGAD" | "SAMAN" | "ZARINPAL";
    }) => {
      const response = await subscriptionApi.createSubscriptionPayment(data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Payment creation success:", data);

      // Check if data and paymentUrl exist
      if (!data) {
        console.error("No data received from payment creation");
        toast.error("خطا در دریافت اطلاعات پرداخت");
        setIsProcessing(false);
        return;
      }

      if (!data.paymentUrl) {
        console.error("No paymentUrl in response:", data);
        toast.error("خطا در دریافت لینک پرداخت");
        setIsProcessing(false);
        return;
      }

      // Redirect to payment gateway
      window.location.href = data.paymentUrl;
    },
    onError: (error: any) => {
      console.error("Payment creation error:", error);
      toast.error(
        error.response?.data?.error || error.message || "خطا در ایجاد پرداخت"
      );
      setIsProcessing(false);
    },
  });

  // Verify payment mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: async (data: {
      paymentId: string;
      gateway: string;
      refNum: string;
      resNum?: string | undefined;
    }) => {
      const response = await subscriptionApi.verifySubscriptionPayment(data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("پرداخت با موفقیت انجام شد و پلن شما ارتقا یافت!");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || error.message || "خطا در تایید پرداخت"
      );
    },
  });

  // Handle payment creation
  const handlePayment = async () => {
    if (!planId || !selectedGateway) {
      toast.error("لطفاً درگاه پرداخت را انتخاب کنید");
      return;
    }

    setIsProcessing(true);
    createPaymentMutation.mutate({
      planId,
      billingCycle,
      gateway: selectedGateway,
    });
  };

  // Handle payment verification from callback
  useEffect(() => {
    const refNum = searchParams.get("Authority");
    const resNum = searchParams.get("ResNum");

    if (paymentId && refNum && selectedGateway) {
      verifyPaymentMutation.mutate({
        paymentId,
        gateway: selectedGateway,
        refNum,
        resNum: resNum || undefined,
      });
    }
  }, [paymentId, searchParams, selectedGateway]);

  // Calculate payment amount
  const paymentAmount = plan
    ? billingCycle === "YEARLY"
      ? plan.yearlyFee || plan.monthlyFee * 12
      : plan.monthlyFee
    : 0;

  const getDiscountPercentage = () => {
    if (!plan || billingCycle !== "YEARLY") return 0;
    const yearlyTotal = plan.monthlyFee * 12;
    const discount = ((yearlyTotal - plan.yearlyFee) / yearlyTotal) * 100;
    return Math.round(discount);
  };

  const formatPrice = (amount: number) => {
    return amount.toLocaleString("fa-IR");
  };

  const getGatewayInfo = (gateway: string) => {
    switch (gateway) {
      case "TEST":
        return {
          name: "حالت تست",
          icon: "🧪",
          description: "پرداخت آزمایشی (بدون کسر مبلغ)",
          color: "from-yellow-500 to-orange-500",
        };
      case "ZARINPAL":
        return {
          name: "زرین‌پال",
          icon: "💳",
          description: "پرداخت امن و سریع",
          color: "from-green-500 to-emerald-500",
        };
      case "PASARGAD":
        return {
          name: "پاسارگاد",
          icon: "🏦",
          description: "درگاه بانک پاسارگاد",
          color: "from-blue-500 to-indigo-500",
        };
      case "SAMAN":
        return {
          name: "سامان",
          icon: "🏛️",
          description: "درگاه بانک سامان",
          color: "from-purple-500 to-pink-500",
        };
      default:
        return {
          name: "نامشخص",
          icon: "❓",
          description: "درگاه پرداخت",
          color: "from-gray-500 to-gray-600",
        };
    }
  };

  if (loadingPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              پلن یافت نشد
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              پلن مورد نظر یافت نشد یا غیرفعال است
            </p>
          </div>
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-6 py-3"
          >
            بازگشت به داشبورد
          </Button>
        </div>
      </div>
    );
  }

  // Show payment status if paymentId exists
  if (paymentId && paymentStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                {paymentStatus.status === "SUCCESS" ? (
                  <>
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        پرداخت موفق
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        پلن شما با موفقیت ارتقا یافت
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate("/dashboard")}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl px-6 py-3"
                    >
                      بازگشت به داشبورد
                    </Button>
                  </>
                ) : paymentStatus.status === "FAILED" ? (
                  <>
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                      <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        پرداخت ناموفق
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        پرداخت با خطا مواجه شد
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate("/dashboard")}
                      className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl px-6 py-3"
                    >
                      بازگشت به داشبورد
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        در حال پردازش
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        در حال بررسی وضعیت پرداخت...
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              بازگشت
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                پرداخت ارتقای پلن
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                تکمیل پرداخت برای ارتقای پلن
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  جزئیات پرداخت
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan Details */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      {plan.nameEn === "starter" ? (
                        <Zap className="w-4 h-4 text-white" />
                      ) : plan.nameEn === "growth" ? (
                        <TrendingUp className="w-4 h-4 text-white" />
                      ) : plan.nameEn === "pro" ? (
                        <Crown className="w-4 h-4 text-white" />
                      ) : (
                        <Building2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        ارتقا به {plan.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {billingCycle === "MONTHLY" ? "ماهانه" : "سالانه"}
                      </p>
                    </div>
                  </div>

                  {currentSubscription && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      از {currentSubscription.plan.name} به {plan.name}
                    </div>
                  )}
                </div>

                {/* Payment Amount */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      مبلغ پرداخت:
                    </span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(paymentAmount)} تومان
                    </span>
                  </div>

                  {billingCycle === "YEARLY" && getDiscountPercentage() > 0 && (
                    <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                      <span>تخفیف سالانه:</span>
                      <span className="font-medium">
                        {getDiscountPercentage()}٪
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Payment Gateway Selection */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    انتخاب درگاه پرداخت:
                  </h4>
                  <div className="space-y-2">
                    {(["TEST", "ZARINPAL", "PASARGAD", "SAMAN"] as const).map(
                      (gateway) => {
                        const gatewayInfo = getGatewayInfo(gateway);
                        return (
                          <div
                            key={gateway}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                              selectedGateway === gateway
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                            onClick={() => setSelectedGateway(gateway)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{gatewayInfo.icon}</div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {gatewayInfo.name}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {gatewayInfo.description}
                                </div>
                              </div>
                              {selectedGateway === gateway && (
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 dark:text-green-100">
                        پرداخت امن
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        تمام پرداخت‌ها با استفاده از درگاه‌های معتبر و امن انجام
                        می‌شود
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Action */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-800 dark:via-blue-900/10 dark:to-indigo-900/10 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="w-10 h-10 text-white" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      تکمیل پرداخت
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      برای ارتقای پلن خود، پرداخت را تکمیل کنید
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          مبلغ نهایی:
                        </span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(paymentAmount)} تومان
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                          در حال پردازش...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 ml-2" />
                          پرداخت و ارتقای پلن
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    با کلیک روی دکمه پرداخت، به درگاه امن هدایت خواهید شد
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

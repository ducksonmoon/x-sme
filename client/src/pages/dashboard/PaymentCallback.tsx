import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  CreditCard,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";
import { subscriptionApi } from "@/services/api";

const PaymentCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [message, setMessage] = useState("در حال بررسی پرداخت...");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const paymentId = searchParams.get("paymentId");
        const authority = searchParams.get("Authority");
        const status = searchParams.get("Status");
        const refNum = searchParams.get("RefNum");

        if (!paymentId) {
          setStatus("failed");
          setMessage("شناسه پرداخت یافت نشد");
          return;
        }

        // Check if payment was successful based on gateway response
        if (status === "OK" || authority) {
          // Determine gateway from paymentId or use default
          const gateway = authority?.startsWith("test-") ? "TEST" : "ZARINPAL";

          // Verify payment with backend
          const response = await subscriptionApi.verifySubscriptionPayment({
            paymentId,
            gateway,
            refNum: authority || refNum || "",
          });

          const data = response.data;

          if (data.success) {
            setStatus("success");
            setMessage("پرداخت با موفقیت انجام شد و پلن شما ارتقا یافت!");
            toast.success("پرداخت با موفقیت انجام شد!");

            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              navigate("/dashboard");
            }, 3000);
          } else {
            setStatus("failed");
            setMessage(data.error || "خطا در تایید پرداخت");
            toast.error(data.error || "خطا در تایید پرداخت");
          }
        } else {
          setStatus("failed");
          setMessage("پرداخت ناموفق بود");
          toast.error("پرداخت ناموفق بود");
        }
      } catch (error: any) {
        setStatus("failed");
        setMessage("خطا در بررسی پرداخت");
        toast.error("خطا در بررسی پرداخت");
        console.error("Payment verification error:", error);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return (
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        );
      case "failed":
        return (
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
        );
      default:
        return (
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "from-green-500 to-emerald-500";
      case "failed":
        return "from-red-500 to-pink-500";
      default:
        return "from-blue-500 to-indigo-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                {getStatusIcon()}

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {status === "success" && "پرداخت موفق"}
                    {status === "failed" && "پرداخت ناموفق"}
                    {status === "loading" && "در حال بررسی"}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{message}</p>
                </div>

                {status === "loading" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Shield className="w-4 h-4" />
                      <span>در حال بررسی امنیت پرداخت...</span>
                    </div>
                  </div>
                )}

                {status !== "loading" && (
                  <div className="space-y-4">
                    <Button
                      onClick={() => navigate("/dashboard")}
                      className={`w-full bg-gradient-to-r ${getStatusColor()} hover:opacity-90 text-white rounded-xl px-6 py-3 font-medium`}
                    >
                      <ArrowLeft className="w-4 h-4 ml-2" />
                      بازگشت به داشبورد
                    </Button>

                    {status === "failed" && (
                      <Button
                        variant="outline"
                        onClick={() => navigate("/dashboard/settings")}
                        className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl px-6 py-3"
                      >
                        <CreditCard className="w-4 h-4 ml-2" />
                        تلاش مجدد
                      </Button>
                    )}
                  </div>
                )}

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {status === "success" && "پلن شما با موفقیت ارتقا یافت"}
                  {status === "failed" &&
                    "در صورت کسر مبلغ، طی ۲۴ ساعت بازگشت داده خواهد شد"}
                  {status === "loading" && "لطفاً صبر کنید..."}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentCallback;

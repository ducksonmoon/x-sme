import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
  Mail,
  MessageSquare,
} from "lucide-react";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";

const ServerError: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  const suggestions = [
    {
      text: "تازه‌سازی صفحه",
      action: handleRefresh,
      icon: RefreshCw,
      variant: "secondary" as const,
    },
    {
      text: "صفحه اصلی",
      href: "/",
      icon: Home,
      variant: "outline" as const,
    },
  ];

  const supportOptions = [
    {
      title: "گزارش مشکل",
      description: "مشکل را برای تیم فنی گزارش دهید",
      icon: Mail,
      href: "/contact",
      color: "text-blue-500",
    },
    {
      title: "پشتیبانی آنلاین",
      description: "با تیم پشتیبانی چت کنید",
      icon: MessageSquare,
      href: "/contact",
      color: "text-green-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* 500 Number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="text-8xl lg:text-9xl font-bold text-red-200 select-none">
              ۵۰۰
            </div>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="py-12 px-8">
                <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  خطای سرور
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed mb-4 max-w-2xl mx-auto">
                  متأسفانه در سرور مشکلی پیش آمده است. ما در حال بررسی و رفع این
                  مشکل هستیم.
                </p>
                <p className="text-sm text-gray-500">
                  لطفاً چند لحظه صبر کرده و دوباره تلاش کنید.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                >
                  {suggestion.href ? (
                    <Button
                      size="lg"
                      variant={suggestion.variant}
                      asChild
                      className={
                        suggestion.variant === "outline"
                          ? "border-blue-200 text-blue-600 hover:bg-blue-50"
                          : ""
                      }
                    >
                      <Link to={suggestion.href} className="flex items-center">
                        <suggestion.icon className="mr-2 h-4 w-4" />
                        {suggestion.text}
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      variant={suggestion.variant}
                      onClick={suggestion.action}
                      className={`flex items-center ${suggestion.variant === "secondary" ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : ""}`}
                    >
                      <suggestion.icon className="mr-2 h-4 w-4" />
                      {suggestion.text}
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Support Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">
                  نیاز به کمک دارید؟
                </CardTitle>
                <CardDescription className="text-gray-600">
                  اگر مشکل ادامه دارد، از طریق راه‌های زیر با ما در تماس باشید
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {supportOptions.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                    >
                      <Link
                        to={option.href}
                        className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <option.icon
                            className={`w-5 h-5 ${option.color} group-hover:text-blue-600`}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {option.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {option.description}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Technical Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-8"
          >
            <p className="text-xs text-gray-400">
              کد خطا: HTTP 500 | زمان: {new Date().toLocaleString("fa-IR")}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ServerError;

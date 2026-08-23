import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";

const NotFound: React.FC = () => {
  const suggestions = [
    { text: "صفحه اصلی", href: "/", icon: Home },
    { text: "درباره ما", href: "/about", icon: Search },
    { text: "تماس با ما", href: "/contact", icon: Search },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* 404 Number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="text-8xl lg:text-9xl font-bold text-blue-200 select-none">
              ۴۰۴
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
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  صفحه پیدا نشد
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                  متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد. ممکن است
                  لینک اشتباه باشد یا صفحه حذف شده باشد.
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
              <Button
                size="lg"
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link to="/" className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  بازگشت به صفحه اصلی
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.history.back()}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                برگشت به صفحه قبل
              </Button>
            </div>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">
                  شاید به دنبال این‌ها باشید
                </CardTitle>
                <CardDescription className="text-gray-600">
                  پیشنهادهایی برای ادامه گشت‌وگذار در سایت ما
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                    >
                      <Link
                        to={suggestion.href}
                        className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                      >
                        <suggestion.icon className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                          {suggestion.text}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-8"
          >
            <p className="text-sm text-gray-500">
              اگر فکر می‌کنید این یک خطا است، لطفاً با{" "}
              <Link
                to="/contact"
                className="text-blue-600 hover:underline font-medium"
              >
                تیم پشتیبانی
              </Link>{" "}
              تماس بگیرید.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;

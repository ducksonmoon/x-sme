import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search, ArrowRight, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen bg-paper flex items-center justify-center">
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
            <div className="text-8xl lg:text-9xl font-bold text-navy-100 select-none">
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
                <div className="w-16 h-16 bg-gold-tint rounded-full mx-auto mb-6 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-gold-dark" />
                </div>
                <h1 className="text-3xl font-bold text-ink mb-4">
                  صفحه پیدا نشد
                </h1>
                <p className="text-ink-soft text-lg leading-relaxed max-w-2xl mx-auto">
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
                className="bg-gold text-paper hover:bg-[oklch(66%_0.13_80)] hover:text-paper"
              >
                <Link to="/" className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  بازگشت به صفحه اصلی
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.history.back()}
                className="border-line text-ink hover:bg-gold-tint"
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
                <CardTitle className="text-lg text-ink">
                  شاید به دنبال این‌ها باشید
                </CardTitle>
                <CardDescription className="text-ink-soft">
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
                        className="flex items-center gap-3 p-4 rounded-lg border border-line hover:border-gold/40 hover:bg-gold-tint transition-all group"
                      >
                        <suggestion.icon className="w-4 h-4 text-ink-faint group-hover:text-gold-dark" />
                        <span className="text-sm font-medium text-ink-soft group-hover:text-gold-dark">
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
            <p className="text-sm text-ink-faint">
              اگر فکر می‌کنید این یک خطا است، لطفاً با{" "}
              <Link
                to="/contact"
                className="text-gold-dark hover:underline font-medium"
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

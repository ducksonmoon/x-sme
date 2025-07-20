import React from "react";
import { motion } from "framer-motion";
import { Clock, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ComingSoonProps {
  title: string;
  description: string;
  featureName: string;
  onBack?: () => void;
  estimatedRelease?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description,
  featureName,
  onBack,
  estimatedRelease = "به زودی",
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {onBack && (
            <div className="flex justify-start mb-6">
              <Button
                onClick={onBack}
                variant="ghost"
                className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                بازگشت
              </Button>
            </div>
          )}

          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl mb-6">
            <Clock className="w-10 h-10 text-white" />
          </div>

          <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            در حال توسعه
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-4">
            {title}
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        </motion.div>

        {/* Feature Preview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                امکانات پیشرفته
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                این بخش شامل قابلیت‌های پیشرفته و تحلیلی خواهد بود که به شما کمک
                می‌کند تا کسب‌وکار خود را بهتر مدیریت کنید.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  داشبورد تحلیلی پیشرفته
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  گزارش‌های تفصیلی
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  پیش‌بینی‌های هوشمند
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                زمان انتشار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                تیم ما در حال کار بر روی این ویژگی‌ها است تا تجربه کاربری بهتری
                ارائه دهد.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-500">
                    وضعیت توسعه:
                  </span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    در حال پیشرفت
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-500">
                    تخمین انتشار:
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {estimatedRelease}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                اولین نفری باشید که مطلع می‌شوید!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                وقتی این ویژگی آماده شد، به شما اطلاع خواهیم داد.
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                disabled
              >
                <Clock className="w-5 h-5 mr-2" />
                اطلاع‌رسانی فعال شد
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;

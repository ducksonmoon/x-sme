import React from "react";
import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe,
  CheckCircle,
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";

const AuthLayout: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: CheckCircle,
      title: "مدیریت آسان رزرو",
      description: "سیستم هوشمند مدیریت نوبت‌ها",
    },
    {
      icon: Shield,
      title: "پردازش امن پرداخت",
      description: "درگاه‌های پرداخت معتبر ایرانی",
    },
    {
      icon: BarChart3,
      title: "تحلیل‌های لحظه‌ای",
      description: "گزارش‌های دقیق از عملکرد",
    },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Left side - Branding and Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-16 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-400/20 rounded-full blur-xl"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg"
          >
            {/* Logo */}
            <Link
              to="/"
              className="inline-flex items-center text-3xl font-bold text-white mb-12 group"
            >
              <div className="relative mr-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg shadow-white/10">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -inset-1 bg-white/30 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold">X-SME</span>
                <span className="text-sm text-white/80 font-normal">
                  سامانه رزرو هوشمند
                </span>
              </div>
            </Link>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
            >
              کسب‌وکار خود را
              <span className="block text-blue-200">متحول کنید</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-white/90 mb-12 leading-relaxed"
            >
              رزرو، پرداخت و روابط با مشتریان را با ویجت قدرتمند رزرو ما که
              مخصوصاً برای کسب‌وکارهای کوچک ایرانی طراحی شده، مدیریت کنید.
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-6"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="flex items-start group"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 group-hover:bg-white/30 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold mb-1">شروع رایگان</h4>
                  <p className="text-white/80 text-sm">
                    ۱۴ روز آزمایشی بدون محدودیت
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
        {/* Background decoration for mobile */}
        <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-blue-100/50 to-purple-100/50"></div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/25">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  X-SME
                </span>
                <span className="text-xs text-gray-500">
                  سامانه رزرو هوشمند
                </span>
              </div>
            </Link>
          </div>

          {/* Auth Form */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-blue-500/10 border border-white/20">
            <Outlet />
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;

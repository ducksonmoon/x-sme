import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EmptyStateProps {
  onAddDomain: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAddDomain }) => {
  const benefits = [
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "سرعت بالا",
      description: "رزرو آنی بدون نیاز به تماس تلفنی",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "مدیریت آسان",
      description: "کنترل کامل روی زمان‌بندی و رزروها",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
      title: "صرفه‌جویی در هزینه",
      description: "کاهش هزینه‌های مدیریت و تبلیغات",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "دامنه خود را اضافه کنید",
      description: "دامنه سفارشی یا زیردامنه خود را وارد کنید",
    },
    {
      number: "2",
      title: "رکوردهای DNS را تنظیم کنید",
      description: "راهنمای کامل برای تنظیم DNS ارائه می‌شود",
    },
    {
      number: "3",
      title: "ویجت را فعال کنید",
      description: "ویجت رزرو روی دامنه شما نمایش داده می‌شود",
    },
  ];

  return (
    <div className="py-12">
      {/* Main Empty State */}
      <div className="text-center mb-12">
        <div className="mx-auto w-32 h-32 bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mb-8 shadow-lg">
          <svg
            className="w-16 h-16 text-purple-600 dark:text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
            />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          اولین دامنه خود را اضافه کنید
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          با اتصال دامنه سفارشی، ویجت رزرو آنلاین را روی وب‌سایت خود نمایش دهید
          و تجربه رزرو بهتری را برای مشتریان خود فراهم کنید.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            onClick={onAddDomain}
            size="lg"
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            افزودن دامنه جدید
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="flex items-center gap-3 px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-xl transition-all duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            راهنمای کامل
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Badge variant="outline" className="text-xs">
            رایگان
          </Badge>
          <span>•</span>
          <span>تنظیم در کمتر از 5 دقیقه</span>
          <span>•</span>
          <span>پشتیبانی 24/7</span>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-8">
          چرا باید دامنه سفارشی اضافه کنید؟
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="border-0 shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
                  {benefit.icon}
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Setup Steps */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-8">
          مراحل راه‌اندازی
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {step.number}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-4 w-px h-16 bg-gradient-to-b from-purple-500 to-transparent"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Features Preview */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              ویژگی‌های ویجت رزرو
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              تمام ابزارهای مورد نیاز برای مدیریت رزرو آنلاین
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "رزرو آنی",
              "مدیریت زمان‌بندی",
              "اعلان‌های خودکار",
              "گزارش‌گیری",
              "پرداخت آنلاین",
              "مدیریت کارکنان",
              "تقویم هوشمند",
              "پشتیبانی 24/7",
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <svg
                  className="w-4 h-4 text-green-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

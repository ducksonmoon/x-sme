import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BookingWidget from "@components/BookingWidget";
import { useTheme } from "@providers/ThemeProvider";
import { useLanguage } from "@providers/LanguageProvider";
import { WidgetConfig } from "../types";

const WidgetPreview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { setTheme } = useTheme();
  const { setLanguage } = useLanguage();
  const [config, setConfig] = useState<WidgetConfig | null>(null);

  useEffect(() => {
    // Parse configuration from URL parameters
    const widgetConfig: WidgetConfig = {
      businessId:
        searchParams.get("businessId") || searchParams.get("business") || "",
      theme: (searchParams.get("theme") as "light" | "dark" | "auto") || "auto",
      language: "fa",
      primaryColor:
        searchParams.get("primaryColor") ||
        searchParams.get("accentColor") ||
        "#3b82f6",
      borderRadius: parseInt(searchParams.get("borderRadius") || "8"),
      showLogo: searchParams.get("showLogo") !== "false",
      showBusinessInfo: searchParams.get("showBusinessInfo") !== "false",
      allowNotes: searchParams.get("allowNotes") !== "false",
      requireEmail: searchParams.get("requireEmail") === "true",
      maxAdvanceBooking: parseInt(
        searchParams.get("maxAdvanceBooking") || "30"
      ),
      minAdvanceBooking: parseInt(searchParams.get("minAdvanceBooking") || "2"),
      // New custom properties - only add if they have values
      ...(searchParams.get("customLogo") || searchParams.get("logo")
        ? {
            customLogo:
              searchParams.get("customLogo") || searchParams.get("logo") || "",
          }
        : {}),
      ...(searchParams.get("secondaryColor")
        ? {
            secondaryColor: searchParams.get("secondaryColor") || "",
          }
        : {}),
      embedMode: false, // Set to false for standalone preview
    };

    setConfig(widgetConfig);

    // Apply theme and language
    setTheme(
      widgetConfig.theme === "auto" ? "light" : widgetConfig.theme || "light"
    );
    setLanguage(widgetConfig.language || "fa");

    // Apply custom CSS variables for theming
    const root = document.documentElement;
    root.style.setProperty(
      "--primary-color",
      widgetConfig.primaryColor || "#3b82f6"
    );
    root.style.setProperty(
      "--border-radius",
      `${widgetConfig.borderRadius || 8}px`
    );
  }, [searchParams, setTheme, setLanguage]);

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            در حال بارگذاری ویجت...
          </h2>
          <p className="text-gray-600">لطفاً صبر کنید</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  پیش‌نمایش ویجت رزرو
                </h1>
                <p className="text-sm text-gray-600">
                  این صفحه برای تست و پیش‌نمایش ویجت شما طراحی شده است
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 space-x-reverse">
              <a
                href="/dashboard/settings?tab=widget"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                بازگشت به تنظیمات
              </a>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                چاپ صفحه
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Widget Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  ویجت رزرو شما
                </h2>
                <p className="text-sm text-gray-600">
                  این همان ویجتی است که مشتریان شما خواهند دید
                </p>
              </div>

              <div className="p-6">
                <div
                  className="w-full bg-white"
                  style={
                    {
                      "--primary-color": config.primaryColor,
                      "--border-radius": `${config.borderRadius}px`,
                    } as React.CSSProperties
                  }
                >
                  <div className="w-full max-w-none">
                    <BookingWidget
                      businessId={config.businessId}
                      {...(config.embedMode !== undefined && {
                        embedMode: config.embedMode,
                      })}
                      {...(config.theme && { theme: config.theme })}
                      {...(config.showLogo !== undefined && {
                        showLogo: config.showLogo,
                      })}
                      {...(config.primaryColor && {
                        accentColor: config.primaryColor,
                      })}
                      {...(config.customLogo && {
                        customLogo: config.customLogo,
                      })}
                      {...(config.primaryColor && {
                        primaryColor: config.primaryColor,
                      })}
                      {...(config.secondaryColor && {
                        secondaryColor: config.secondaryColor,
                      })}
                      {...(config.allowNotes !== undefined && {
                        allowNotes: config.allowNotes,
                      })}
                      {...(config.requireEmail !== undefined && {
                        requireEmail: config.requireEmail,
                      })}
                      {...(config.maxAdvanceBooking !== undefined && {
                        maxAdvanceBooking: config.maxAdvanceBooking,
                      })}
                      {...(config.minAdvanceBooking !== undefined && {
                        minAdvanceBooking: config.minAdvanceBooking,
                      })}
                      {...(config.borderRadius !== undefined && {
                        borderRadius: config.borderRadius,
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Info */}
          <div className="space-y-6">
            {/* Current Settings */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                تنظیمات فعلی
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    رنگ اصلی
                  </label>
                  <div className="flex items-center space-x-2 space-x-reverse mt-1">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: config.primaryColor }}
                    />
                    <span className="text-sm text-gray-600 font-mono">
                      {config.primaryColor}
                    </span>
                  </div>
                </div>

                {config.secondaryColor && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      رنگ ثانویه
                    </label>
                    <div className="flex items-center space-x-2 space-x-reverse mt-1">
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: config.secondaryColor }}
                      />
                      <span className="text-sm text-gray-600 font-mono">
                        {config.secondaryColor}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    گردی گوشه‌ها
                  </label>
                  <span className="text-sm text-gray-600 block mt-1">
                    {config.borderRadius}px
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    تم
                  </label>
                  <span className="text-sm text-gray-600 block mt-1">
                    {config.theme === "light"
                      ? "روشن"
                      : config.theme === "dark"
                        ? "تاریک"
                        : "خودکار"}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    نمایش لوگو
                  </label>
                  <span className="text-sm text-gray-600 block mt-1">
                    {config.showLogo ? "فعال" : "غیرفعال"}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    درخواست ایمیل
                  </label>
                  <span className="text-sm text-gray-600 block mt-1">
                    {config.requireEmail ? "اجباری" : "اختیاری"}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    یادداشت‌ها
                  </label>
                  <span className="text-sm text-gray-600 block mt-1">
                    {config.allowNotes ? "فعال" : "غیرفعال"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                اقدامات سریع
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    alert("لینک پیش‌نمایش کپی شد!");
                  }}
                  className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  کپی لینک پیش‌نمایش
                </button>

                <button
                  onClick={() => {
                    const widgetUrl = `${window.location.origin}/widget?${searchParams.toString()}`;
                    navigator.clipboard.writeText(widgetUrl);
                    alert("لینک ویجت کپی شد!");
                  }}
                  className="w-full px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  کپی لینک ویجت
                </button>

                <a
                  href={`/widget?${searchParams.toString()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-center"
                >
                  باز کردن ویجت در تب جدید
                </a>
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                راهنمای استفاده
              </h3>

              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start space-x-2 space-x-reverse">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>این صفحه برای تست ویجت شما طراحی شده است</p>
                </div>
                <div className="flex items-start space-x-2 space-x-reverse">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>می‌توانید لینک پیش‌نمایش را با دیگران به اشتراک بگذارید</p>
                </div>
                <div className="flex items-start space-x-2 space-x-reverse">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>برای تغییر تنظیمات به بخش تنظیمات ویجت مراجعه کنید</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetPreview;

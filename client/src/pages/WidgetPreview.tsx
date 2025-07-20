import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BookingWidget from "@/components/BookingWidget";
import LoadingSpinner from "@/components/LoadingSpinner";

interface PreviewConfig {
  businessId: string;
  theme: "light" | "dark" | "auto";
  primaryColor: string;
  secondaryColor: string | undefined;
  borderRadius: number;
  showLogo: boolean;
  allowNotes: boolean;
  requireEmail: boolean;
  maxAdvanceBooking: number;
  minAdvanceBooking: number;
  customLogo: string | undefined;
  language: "fa" | "en";
}

const WidgetPreview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [config, setConfig] = useState<PreviewConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const businessId = searchParams.get("businessId");
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    const previewConfig: PreviewConfig = {
      businessId,
      theme: (searchParams.get("theme") as any) || "auto",
      primaryColor: searchParams.get("primaryColor") || "#3b82f6",
      secondaryColor: searchParams.get("secondaryColor") || undefined,
      borderRadius: parseInt(searchParams.get("borderRadius") || "8"),
      showLogo: searchParams.get("showLogo") !== "false",
      allowNotes: searchParams.get("allowNotes") !== "false",
      requireEmail: searchParams.get("requireEmail") === "true",
      maxAdvanceBooking: parseInt(
        searchParams.get("maxAdvanceBooking") || "30"
      ),
      minAdvanceBooking: parseInt(searchParams.get("minAdvanceBooking") || "2"),
      customLogo: searchParams.get("customLogo") || undefined,
      language: (searchParams.get("language") as any) || "fa",
    };

    setConfig(previewConfig);
    setIsLoading(false);
  }, [searchParams]);

  const getThemeClass = (theme: string) => {
    switch (theme) {
      case "light":
        return "light";
      case "dark":
        return "dark";
      default:
        return "";
    }
  };

  const getPreviewStyles = () => {
    if (!config) return {};

    return {
      "--primary-color": config.primaryColor,
      "--secondary-color": config.secondaryColor || config.primaryColor,
      "--border-radius": `${config.borderRadius}px`,
    } as React.CSSProperties;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-slate-600 dark:text-slate-400">
            در حال بارگذاری پیش‌نمایش...
          </p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
            <RefreshCw className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              خطا در بارگذاری
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              شناسه کسب‌وکار در URL یافت نشد
            </p>
          </div>
          <Button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-6 py-3"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            بازگشت
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${getThemeClass(config.theme)}`}
      style={getPreviewStyles()}
    >
      {/* Preview Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.history.back()}
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                بازگشت
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                  پیش‌نمایش ویجت رزرو
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  شناسه کسب‌وکار: {config.businessId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">
                پیش‌نمایش زنده
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                بروزرسانی
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/w/${config.businessId}`, "_blank")}
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ExternalLink className="w-4 h-4 ml-2" />
                باز کردن در تب جدید
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Widget Preview */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Desktop Preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    پیش‌نمایش دسکتاپ
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-lg">
                  <BookingWidget
                    businessId={config.businessId}
                    theme={config.theme}
                    primaryColor={config.primaryColor}
                    {...(config.secondaryColor && {
                      secondaryColor: config.secondaryColor,
                    })}
                    borderRadius={config.borderRadius}
                    showLogo={config.showLogo}
                    allowNotes={config.allowNotes}
                    requireEmail={config.requireEmail}
                    maxAdvanceBooking={config.maxAdvanceBooking}
                    minAdvanceBooking={config.minAdvanceBooking}
                    {...(config.customLogo && {
                      customLogo: config.customLogo,
                    })}
                  />
                </div>
              </div>

              {/* Mobile Preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    پیش‌نمایش موبایل
                  </span>
                </div>
                <div className="flex justify-center">
                  <div className="w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 shadow-lg">
                    <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl p-4 h-96 overflow-hidden">
                      <BookingWidget
                        businessId={config.businessId}
                        theme={config.theme}
                        primaryColor={config.primaryColor}
                        {...(config.secondaryColor && {
                          secondaryColor: config.secondaryColor,
                        })}
                        borderRadius={config.borderRadius}
                        showLogo={config.showLogo}
                        allowNotes={config.allowNotes}
                        requireEmail={config.requireEmail}
                        maxAdvanceBooking={config.maxAdvanceBooking}
                        minAdvanceBooking={config.minAdvanceBooking}
                        {...(config.customLogo && {
                          customLogo: config.customLogo,
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Configuration Summary */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  تنظیمات فعلی
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      تم:
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {config.theme === "auto"
                        ? "خودکار"
                        : config.theme === "light"
                          ? "روشن"
                          : "تاریک"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      زبان:
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {config.language === "fa" ? "فارسی" : "English"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      نمایش لوگو:
                    </span>
                    <Badge
                      variant={config.showLogo ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {config.showLogo ? "فعال" : "غیرفعال"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      اجازه یادداشت:
                    </span>
                    <Badge
                      variant={config.allowNotes ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {config.allowNotes ? "فعال" : "غیرفعال"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      الزامی بودن ایمیل:
                    </span>
                    <Badge
                      variant={config.requireEmail ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {config.requireEmail ? "فعال" : "غیرفعال"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      حداکثر روزهای پیش‌رزرو:
                    </span>
                    <span className="text-sm font-medium">
                      {config.maxAdvanceBooking}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      حداقل روزهای پیش‌رزرو:
                    </span>
                    <span className="text-sm font-medium">
                      {config.minAdvanceBooking}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Color Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  رنگ‌های انتخاب شده
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded border border-slate-200 dark:border-slate-600"
                      style={{ backgroundColor: config.primaryColor }}
                    ></div>
                    <div>
                      <p className="text-sm font-medium">رنگ اصلی</p>
                      <p className="text-xs text-slate-500">
                        {config.primaryColor}
                      </p>
                    </div>
                  </div>
                  {config.secondaryColor && (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded border border-slate-200 dark:border-slate-600"
                        style={{ backgroundColor: config.secondaryColor }}
                      ></div>
                      <div>
                        <p className="text-sm font-medium">رنگ ثانویه</p>
                        <p className="text-xs text-slate-500">
                          {config.secondaryColor}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetPreview;

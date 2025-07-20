import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Save, Copy, Eye, Code, Palette, Settings } from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import {
  useWidgetConfig,
  useWidgetConfigActions,
  useWidgetConfigUI,
} from "@/store/widgetConfigStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";

const WidgetConfiguration: React.FC = () => {
  const { businessId, isLoading: businessLoading } = useBusiness();
  const config = useWidgetConfig();
  const { updateConfig, saveConfig, loadConfig, validateConfig } =
    useWidgetConfigActions();
  const { isSaving, hasUnsavedChanges } = useWidgetConfigUI();
  const hasLoadedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  // Default config to prevent undefined errors
  const safeConfig = {
    businessId: businessId || config?.businessId || "",
    theme: config?.theme || "auto",
    language: config?.language || "fa",
    primaryColor: config?.primaryColor || "#3b82f6",
    secondaryColor: config?.secondaryColor || "#1e40af",
    borderRadius: config?.borderRadius || 8,
    showLogo: config?.showLogo !== undefined ? config.showLogo : true,
    allowNotes: config?.allowNotes !== undefined ? config.allowNotes : true,
    requireEmail:
      config?.requireEmail !== undefined ? config.requireEmail : false,
    maxAdvanceBooking: config?.maxAdvanceBooking || 30,
    minAdvanceBooking: config?.minAdvanceBooking || 2,
    embedMode: config?.embedMode !== undefined ? config.embedMode : true,
    showBusinessInfo:
      config?.showBusinessInfo !== undefined ? config.showBusinessInfo : true,
    version: config?.version || "1.0.0",
    lastUpdated: config?.lastUpdated || new Date().toISOString(),
    customLogo: config?.customLogo || "",
  };

  // Load configuration on mount only once
  useEffect(() => {
    if (businessId && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadConfig(businessId).finally(() => {
        setIsLoading(false);
      });
    } else if (!businessId && !businessLoading) {
      setIsLoading(false);
    }
  }, [businessId, businessLoading, loadConfig]);

  const handleSave = async () => {
    if (!businessId) {
      toast.error("شناسه کسب و کار در دسترس نیست");
      return;
    }

    try {
      const validation = validateConfig();
      if (!validation.isValid) {
        toast.error(`خطا در تنظیمات: ${validation.errors.join(", ")}`);
        return;
      }

      await saveConfig(businessId);
      toast.success("تنظیمات ویجت با موفقیت ذخیره شد");
    } catch (error) {
      toast.error("خطا در ذخیره تنظیمات ویجت");
      console.error("Widget config save error:", error);
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const getBasicEmbedCode = () => {
    return `<script src="${window.location.origin}/widget.js" data-business-id="${safeConfig.businessId}"></script>`;
  };

  const getCustomEmbedCode = () => {
    const attributes = [
      `data-business-id="${safeConfig.businessId}"`,
      `data-theme="${safeConfig.theme}"`,
      `data-primary-color="${safeConfig.primaryColor}"`,
      `data-border-radius="${safeConfig.borderRadius}"`,
      `data-show-logo="${safeConfig.showLogo}"`,
      `data-allow-notes="${safeConfig.allowNotes}"`,
      `data-require-email="${safeConfig.requireEmail}"`,
      `data-max-advance-booking="${safeConfig.maxAdvanceBooking}"`,
      `data-min-advance-booking="${safeConfig.minAdvanceBooking}"`,
    ];

    if (safeConfig.secondaryColor) {
      attributes.push(`data-secondary-color="${safeConfig.secondaryColor}"`);
    }

    if (safeConfig.customLogo) {
      attributes.push(`data-custom-logo="${safeConfig.customLogo}"`);
    }

    return `<script src="${window.location.origin}/widget.js" ${attributes.join(" ")}></script>`;
  };

  const getPreviewUrl = () => {
    const params = new URLSearchParams({
      businessId: safeConfig.businessId,
      theme: safeConfig.theme,
      primaryColor: safeConfig.primaryColor,
      borderRadius: safeConfig.borderRadius.toString(),
      showLogo: safeConfig.showLogo.toString(),
      allowNotes: safeConfig.allowNotes.toString(),
      requireEmail: safeConfig.requireEmail.toString(),
      maxAdvanceBooking: safeConfig.maxAdvanceBooking.toString(),
      minAdvanceBooking: safeConfig.minAdvanceBooking.toString(),
    });

    if (safeConfig.secondaryColor) {
      params.set("secondaryColor", safeConfig.secondaryColor);
    }

    if (safeConfig.customLogo) {
      params.set("customLogo", safeConfig.customLogo);
    }

    return `${window.location.origin}/widget-preview?${params.toString()}`;
  };

  const getHostedWidgetUrl = () => {
    const params = new URLSearchParams();

    if (safeConfig.theme !== "auto") {
      params.set("theme", safeConfig.theme);
    }

    if (safeConfig.primaryColor !== "#3b82f6") {
      params.set("primaryColor", safeConfig.primaryColor);
    }

    if (safeConfig.secondaryColor) {
      params.set("secondaryColor", safeConfig.secondaryColor);
    }

    if (safeConfig.customLogo) {
      params.set("customLogo", safeConfig.customLogo);
    }

    if (safeConfig.borderRadius !== 8) {
      params.set("borderRadius", safeConfig.borderRadius.toString());
    }

    if (!safeConfig.showLogo) {
      params.set("showLogo", "false");
    }

    if (!safeConfig.allowNotes) {
      params.set("allowNotes", "false");
    }

    if (safeConfig.requireEmail) {
      params.set("requireEmail", "true");
    }

    const baseUrl = `${window.location.origin}/w/${safeConfig.businessId}`;
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  };

  if (isLoading || businessLoading || !businessId) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Widget Code Section */}
      <Card className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 border-gray-200/50 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
            <Code className="w-5 h-5 ml-2 text-blue-600 dark:text-blue-400" />
            کد ویجت
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              کد پایه
            </label>
            <div className="mb-2">
              <a
                href={`${window.location.origin}/widget.js`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                تست فایل widget.js →
              </a>
            </div>
            <div className="relative">
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <code>{getBasicEmbedCode()}</code>
              </div>
              <div className="absolute top-2 left-2 flex space-x-1 space-x-reverse">
                <Button
                  onClick={() =>
                    copyToClipboard(getBasicEmbedCode(), "کد کپی شد")
                  }
                  size="sm"
                  variant="secondary"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    const newWindow = window.open("", "_blank");
                    if (newWindow) {
                      newWindow.document.write(`
                        <html>
                          <head>
                            <title>Widget Code Preview</title>
                            <style>
                              body { font-family: monospace; padding: 20px; background: #f5f5f5; }
                              pre { background: #1f2937; color: #f9fafb; padding: 20px; border-radius: 8px; overflow-x: auto; }
                            </style>
                          </head>
                          <body>
                            <h2>Basic Widget Code:</h2>
                            <pre><code>${getBasicEmbedCode()}</code></pre>
                          </body>
                        </html>
                      `);
                      newWindow.document.close();
                    }
                  }}
                  size="sm"
                  variant="secondary"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Custom Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              کد با تنظیمات سفارشی
            </label>
            <div className="relative">
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <code>{getCustomEmbedCode()}</code>
              </div>
              <div className="absolute top-2 left-2 flex space-x-1 space-x-reverse">
                <Button
                  onClick={() =>
                    copyToClipboard(
                      getCustomEmbedCode(),
                      "کد با تنظیمات کپی شد"
                    )
                  }
                  size="sm"
                  variant="secondary"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    const newWindow = window.open("", "_blank");
                    if (newWindow) {
                      newWindow.document.write(`
                        <html>
                          <head>
                            <title>Custom Widget Code Preview</title>
                            <style>
                              body { font-family: monospace; padding: 20px; background: #f5f5f5; }
                              pre { background: #1f2937; color: #f9fafb; padding: 20px; border-radius: 8px; overflow-x: auto; }
                            </style>
                          </head>
                          <body>
                            <h2>Custom Widget Code:</h2>
                            <pre><code>${getCustomEmbedCode()}</code></pre>
                          </body>
                        </html>
                      `);
                      newWindow.document.close();
                    }
                  }}
                  size="sm"
                  variant="secondary"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hosted Widget Section */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200/50 dark:border-emerald-800/50">
        <CardHeader>
          <CardTitle className="flex items-center text-emerald-900 dark:text-emerald-100">
            <svg
              className="w-5 h-5 ml-2 text-emerald-600 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            صفحه رزرو اختصاصی
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <div className="flex items-start space-x-3 space-x-reverse">
              <svg
                className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="font-medium text-emerald-900 dark:text-emerald-100">
                  صفحه رزرو برای کسب‌وکارهای بدون وب‌سایت
                </h4>
                <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">
                  اگر وب‌سایت ندارید، می‌توانید از لینک زیر به عنوان صفحه رزرو
                  اختصاصی استفاده کنید و آن را با مشتریان خود به اشتراک بگذارید.
                </p>
              </div>
            </div>
          </div>

          {/* Hosted Widget URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              لینک صفحه رزرو شما
            </label>
            <div className="relative">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <code className="text-sm text-gray-700 dark:text-gray-300 break-all">
                  {getHostedWidgetUrl()}
                </code>
              </div>
              <div className="absolute top-1 left-1 flex space-x-1 space-x-reverse">
                <Button
                  onClick={() =>
                    copyToClipboard(getHostedWidgetUrl(), "لینک کپی شد")
                  }
                  size="sm"
                  variant="secondary"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  onClick={() => window.open(getHostedWidgetUrl(), "_blank")}
                  size="sm"
                  variant="secondary"
                >
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              کد QR برای اشتراک‌گذاری
            </label>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                    getHostedWidgetUrl()
                  )}`}
                  alt="QR Code"
                  className="w-28 h-28"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  راه‌های استفاده از کد QR:
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• چاپ روی کارت ویزیت</li>
                  <li>• نمایش در مغازه یا دفتر</li>
                  <li>• استفاده در بروشور و تبلیغات</li>
                  <li>• اشتراک‌گذاری در شبکه‌های اجتماعی</li>
                </ul>
                <Button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
                      getHostedWidgetUrl()
                    )}`;
                    link.download = `qr-code-${safeConfig.businessId}.png`;
                    link.click();
                  }}
                  size="sm"
                  variant="outline"
                  className="mt-2"
                >
                  دانلود کد QR
                </Button>
              </div>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                🔗 اشتراک‌گذاری لینک
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                این لینک را در شبکه‌های اجتماعی، پیام‌ها یا ایمیل‌ها به اشتراک
                بگذارید.
              </p>
              <Button
                onClick={() => {
                  const text = `رزرو آنلاین خدمات ما: ${getHostedWidgetUrl()}`;
                  copyToClipboard(text, "متن برای اشتراک‌گذاری کپی شد");
                }}
                size="sm"
                variant="outline"
                className="w-full"
              >
                کپی متن برای اشتراک‌گذاری
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                📱 لینک کوتاه
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                برای استفاده راحت‌تر، از سرویس‌های کوتاه‌سازی لینک استفاده کنید.
              </p>
              <Button
                onClick={() => {
                  window.open(
                    `https://tinyurl.com/create.php?url=${encodeURIComponent(
                      getHostedWidgetUrl()
                    )}`,
                    "_blank"
                  );
                }}
                size="sm"
                variant="outline"
                className="w-full"
              >
                کوتاه‌سازی لینک
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Customization */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200/50 dark:border-purple-800/50">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-900 dark:text-purple-100">
            <Palette className="w-5 h-5 ml-2 text-purple-600 dark:text-purple-400" />
            شخصی‌سازی ظاهر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                تم ظاهری
              </label>
              <select
                value={safeConfig.theme}
                onChange={(e) =>
                  updateConfig({
                    theme: e.target.value as "light" | "dark" | "auto",
                  })
                }
                className="w-full h-11 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="light">روشن</option>
                <option value="dark">تیره</option>
                <option value="auto">خودکار</option>
              </select>
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                گردی گوشه‌ها (پیکسل)
              </label>
              <Input
                type="number"
                min="0"
                max="20"
                value={safeConfig.borderRadius}
                onChange={(e) =>
                  updateConfig({
                    borderRadius: parseInt(e.target.value) || 8,
                  })
                }
                className="h-11"
              />
            </div>

            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                رنگ اصلی
              </label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="color"
                  value={safeConfig.primaryColor}
                  onChange={(e) =>
                    updateConfig({ primaryColor: e.target.value })
                  }
                  className="w-12 h-11 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <Input
                  type="text"
                  value={safeConfig.primaryColor}
                  onChange={(e) =>
                    updateConfig({ primaryColor: e.target.value })
                  }
                  className="flex-1 h-11"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                رنگ ثانویه
              </label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="color"
                  value={safeConfig.secondaryColor}
                  onChange={(e) =>
                    updateConfig({ secondaryColor: e.target.value })
                  }
                  className="w-12 h-11 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <Input
                  type="text"
                  value={safeConfig.secondaryColor}
                  onChange={(e) =>
                    updateConfig({ secondaryColor: e.target.value })
                  }
                  className="flex-1 h-11"
                  placeholder="اختیاری"
                />
              </div>
            </div>

            {/* Custom Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                لوگوی سفارشی
              </label>
              <Input
                type="url"
                value={safeConfig.customLogo}
                onChange={(e) => {
                  const url = e.target.value;
                  // Basic URL validation
                  if (url && !url.match(/^https?:\/\/.+/)) {
                    toast.error(
                      "لطفاً یک URL معتبر وارد کنید (شروع با http:// یا https://)"
                    );
                    return;
                  }
                  updateConfig({ customLogo: url });
                }}
                placeholder="https://example.com/logo.png"
                className="h-11"
              />
              {safeConfig.customLogo && (
                <p className="text-xs text-gray-500 mt-1">
                  لینک لوگو: {safeConfig.customLogo}
                </p>
              )}
            </div>

            {/* Show Logo Toggle */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <input
                type="checkbox"
                id="showLogo"
                checked={safeConfig.showLogo}
                onChange={(e) => updateConfig({ showLogo: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label
                htmlFor="showLogo"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                نمایش لوگو
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Behavior Settings */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-800/50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-900 dark:text-green-100">
            <Settings className="w-5 h-5 ml-2 text-green-600 dark:text-green-400" />
            تنظیمات عملکرد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                حداکثر روزهای پیش‌رزرو
              </label>
              <Input
                type="number"
                min="1"
                max="365"
                value={safeConfig.maxAdvanceBooking}
                onChange={(e) =>
                  updateConfig({
                    maxAdvanceBooking: parseInt(e.target.value) || 30,
                  })
                }
                className="h-11"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                حداقل ساعت پیش‌رزرو
              </label>
              <Input
                type="number"
                min="0"
                max="72"
                value={safeConfig.minAdvanceBooking}
                onChange={(e) =>
                  updateConfig({
                    minAdvanceBooking: parseInt(e.target.value) || 2,
                  })
                }
                className="h-11"
              />
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <input
                type="checkbox"
                id="allowNotes"
                checked={safeConfig.allowNotes}
                onChange={(e) => updateConfig({ allowNotes: e.target.checked })}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label
                htmlFor="allowNotes"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                امکان افزودن یادداشت
              </label>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <input
                type="checkbox"
                id="requireEmail"
                checked={safeConfig.requireEmail}
                onChange={(e) =>
                  updateConfig({ requireEmail: e.target.checked })
                }
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label
                htmlFor="requireEmail"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                الزامی بودن ایمیل
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-800/50">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900 dark:text-blue-100">
            <Eye className="w-5 h-5 ml-2 text-blue-600 dark:text-blue-400" />
            پیش‌نمایش ویجت
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              لینک پیش‌نمایش
            </label>
            <div className="relative">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <code className="text-xs text-gray-700 dark:text-gray-300 break-all">
                  {getPreviewUrl()}
                </code>
              </div>
              <div className="absolute top-1 left-1 flex space-x-1 space-x-reverse">
                <Button
                  onClick={() =>
                    copyToClipboard(getPreviewUrl(), "لینک کپی شد")
                  }
                  size="sm"
                  variant="secondary"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  onClick={() => window.open(getPreviewUrl(), "_blank")}
                  size="sm"
                  variant="secondary"
                >
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3 space-x-reverse">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  نکات مهم
                </h4>
                <ul className="mt-2 text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• لینک پیش‌نمایش برای تست ویجت استفاده می‌شود</li>
                  <li>• کد ویجت را در وب‌سایت خود قرار دهید</li>
                  <li>• تنظیمات تغییر یافته را ذخیره کنید</li>
                  <li>
                    • فایل widget.js در آدرس {window.location.origin}/widget.js
                    قرار دارد
                  </li>
                  <li>
                    • برای استفاده در وب‌سایت، کد را در &lt;head&gt; یا
                    &lt;body&gt; قرار دهید
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasUnsavedChanges}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg"
        >
          {isSaving ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <Save className="w-4 h-4 ml-2" />
              ذخیره تنظیمات ویجت
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default WidgetConfiguration;

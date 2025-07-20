import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBusiness } from "@/contexts/BusinessContext";
import { dashboardApi } from "@/services/api";
import {
  Save,
  Copy,
  Eye,
  Code,
  Palette,
  Settings,
  ExternalLink,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Globe,
  Smartphone,
  Monitor,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";

interface WidgetConfig {
  id?: string;
  businessId: string;
  theme: "light" | "dark" | "auto";
  primaryColor: string;
  secondaryColor?: string;
  borderRadius: number;
  showLogo: boolean;
  allowNotes: boolean;
  requireEmail: boolean;
  maxAdvanceBooking: number;
  minAdvanceBooking: number;
  customLogo?: string;
  customCSS?: string;
  embedMode: boolean;
  showBusinessInfo: boolean;
  language: "fa" | "en";
  version: string;
  lastUpdated?: string;
}

const EnhancedWidgetConfiguration: React.FC = () => {
  const { businessId, business } = useBusiness();
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<WidgetConfig>({
    businessId: businessId || "",
    theme: "auto",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
    borderRadius: 8,
    showLogo: true,
    allowNotes: true,
    requireEmail: false,
    maxAdvanceBooking: 30,
    minAdvanceBooking: 2,
    embedMode: true,
    showBusinessInfo: true,
    language: "fa",
    version: "1.0.0",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Fetch current widget configuration
  const { data: currentConfig, isLoading: loadingConfig } = useQuery({
    queryKey: ["widget-config", businessId],
    queryFn: () => dashboardApi.getWidgetConfig(businessId!),
    enabled: !!businessId,
  });

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: (configData: WidgetConfig) =>
      dashboardApi.updateWidgetConfig(businessId!, configData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widget-config"] });
      toast.success("تنظیمات ویجت با موفقیت ذخیره شد");
      setIsSaving(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در ذخیره تنظیمات");
      setIsSaving(false);
    },
  });

  // Load configuration when data is available
  useEffect(() => {
    if (currentConfig?.data?.data) {
      setConfig({ ...config, ...currentConfig.data.data });
    }
  }, [currentConfig]);

  // Update preview URL when config changes
  useEffect(() => {
    if (businessId) {
      const params = new URLSearchParams({
        businessId,
        theme: config.theme,
        primaryColor: config.primaryColor,
        borderRadius: config.borderRadius.toString(),
        showLogo: config.showLogo.toString(),
        allowNotes: config.allowNotes.toString(),
        requireEmail: config.requireEmail.toString(),
        maxAdvanceBooking: config.maxAdvanceBooking.toString(),
        minAdvanceBooking: config.minAdvanceBooking.toString(),
        language: config.language,
      });

      if (config.secondaryColor) {
        params.set("secondaryColor", config.secondaryColor);
      }
      if (config.customLogo) {
        params.set("customLogo", config.customLogo);
      }

      setPreviewUrl(
        `${window.location.origin}/widget-preview?${params.toString()}`
      );
    }
  }, [config, businessId]);

  const handleSave = async () => {
    if (!businessId) {
      toast.error("شناسه کسب و کار در دسترس نیست");
      return;
    }

    setIsSaving(true);
    saveConfigMutation.mutate(config);
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const getBasicEmbedCode = () => {
    return `<script src="${window.location.origin}/widget.js" data-business-id="${businessId}"></script>`;
  };

  const getAdvancedEmbedCode = () => {
    const attributes = [
      `data-business-id="${businessId}"`,
      `data-theme="${config.theme}"`,
      `data-primary-color="${config.primaryColor}"`,
      `data-border-radius="${config.borderRadius}"`,
      `data-show-logo="${config.showLogo}"`,
      `data-allow-notes="${config.allowNotes}"`,
      `data-require-email="${config.requireEmail}"`,
      `data-max-advance-booking="${config.maxAdvanceBooking}"`,
      `data-min-advance-booking="${config.minAdvanceBooking}"`,
      `data-language="${config.language}"`,
    ];

    if (config.secondaryColor) {
      attributes.push(`data-secondary-color="${config.secondaryColor}"`);
    }
    if (config.customLogo) {
      attributes.push(`data-custom-logo="${config.customLogo}"`);
    }

    return `<script src="${window.location.origin}/widget.js" ${attributes.join(" ")}></script>`;
  };

  const getHostedWidgetUrl = () => {
    return `${window.location.origin}/w/${businessId}`;
  };

  const refreshPreview = () => {
    if (previewRef.current) {
      previewRef.current.src = previewRef.current.src;
    }
  };

  if (loadingConfig) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                ظاهر ویجت
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">تم</label>
                  <select
                    value={config.theme}
                    onChange={(e) =>
                      setConfig({ ...config, theme: e.target.value as any })
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="auto">خودکار</option>
                    <option value="light">روشن</option>
                    <option value="dark">تاریک</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">زبان</label>
                  <select
                    value={config.language}
                    onChange={(e) =>
                      setConfig({ ...config, language: e.target.value as any })
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="fa">فارسی</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    رنگ اصلی
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) =>
                        setConfig({ ...config, primaryColor: e.target.value })
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={config.primaryColor}
                      onChange={(e) =>
                        setConfig({ ...config, primaryColor: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    رنگ ثانویه
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.secondaryColor || "#1e40af"}
                      onChange={(e) =>
                        setConfig({ ...config, secondaryColor: e.target.value })
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={config.secondaryColor || "#1e40af"}
                      onChange={(e) =>
                        setConfig({ ...config, secondaryColor: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  گردی گوشه‌ها (پیکسل)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={config.borderRadius}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      borderRadius: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Behavior Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                رفتار ویجت
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">نمایش لوگو</label>
                  <input
                    type="checkbox"
                    checked={config.showLogo}
                    onChange={(e) =>
                      setConfig({ ...config, showLogo: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    نمایش اطلاعات کسب‌وکار
                  </label>
                  <input
                    type="checkbox"
                    checked={config.showBusinessInfo}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        showBusinessInfo: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">اجازه یادداشت</label>
                  <input
                    type="checkbox"
                    checked={config.allowNotes}
                    onChange={(e) =>
                      setConfig({ ...config, allowNotes: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    الزامی بودن ایمیل
                  </label>
                  <input
                    type="checkbox"
                    checked={config.requireEmail}
                    onChange={(e) =>
                      setConfig({ ...config, requireEmail: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    حداکثر روزهای پیش‌رزرو
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={config.maxAdvanceBooking}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        maxAdvanceBooking: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    حداقل روزهای پیش‌رزرو
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="30"
                    value={config.minAdvanceBooking}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        minAdvanceBooking: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="ml-2" />
                در حال ذخیره...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 ml-2" />
                ذخیره تنظیمات
              </>
            )}
          </Button>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          {/* Preview Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  پیش‌نمایش ویجت
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshPreview}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3 h-3 ml-1" />
                    بروزرسانی
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-xs"
                  >
                    {showPreview ? "مخفی کردن" : "نمایش"}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Monitor className="w-4 h-4" />
                  <span>دسکتاپ</span>
                  <Badge variant="secondary" className="text-xs">
                    پیش‌نمایش زنده
                  </Badge>
                </div>
                {showPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border rounded-lg overflow-hidden"
                  >
                    <iframe
                      ref={previewRef}
                      src={previewUrl}
                      className="w-full h-96 border-0"
                      title="Widget Preview"
                    />
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Embed Codes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                کدهای جاسازی
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Embed Code */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">کد پایه</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(getBasicEmbedCode(), "کد پایه کپی شد")
                    }
                  >
                    <Copy className="w-3 h-3 ml-1" />
                    کپی
                  </Button>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                  <code className="text-xs break-all">
                    {getBasicEmbedCode()}
                  </code>
                </div>
              </div>

              <Separator />

              {/* Advanced Embed Code */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">کد پیشرفته</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        getAdvancedEmbedCode(),
                        "کد پیشرفته کپی شد"
                      )
                    }
                  >
                    <Copy className="w-3 h-3 ml-1" />
                    کپی
                  </Button>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                  <code className="text-xs break-all">
                    {getAdvancedEmbedCode()}
                  </code>
                </div>
              </div>

              <Separator />

              {/* Hosted Widget URL */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">لینک مستقیم</label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(getHostedWidgetUrl(), "لینک کپی شد")
                      }
                    >
                      <Copy className="w-3 h-3 ml-1" />
                      کپی
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(getHostedWidgetUrl(), "_blank")
                      }
                    >
                      <ExternalLink className="w-3 h-3 ml-1" />
                      باز کردن
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                  <code className="text-xs break-all">
                    {getHostedWidgetUrl()}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedWidgetConfiguration;

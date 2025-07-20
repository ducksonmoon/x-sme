import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBusiness } from "@/contexts/BusinessContext";
import { widgetConfigService } from "@/services/widgetConfigService";
import {
  Settings,
  Eye,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Palette,
  Code,
  Globe,
  Smartphone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";

const WidgetConfigCard: React.FC = () => {
  const { businessId, business } = useBusiness();
  const queryClient = useQueryClient();
  const [isConfiguring, setIsConfiguring] = useState(false);

  // Fetch widget configuration
  const { data: configData, isLoading: loadingConfig } = useQuery({
    queryKey: ["widget-config", businessId],
    queryFn: () => widgetConfigService.getWidgetConfig(businessId!),
    enabled: !!businessId,
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: (config: any) =>
      widgetConfigService.updateWidgetConfig(businessId!, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widget-config"] });
      toast.success("تنظیمات ویجت بروزرسانی شد");
      setIsConfiguring(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || "خطا در بروزرسانی تنظیمات");
    },
  });

  const config =
    configData?.data || widgetConfigService.getDefaultConfig(businessId || "");

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const getBasicEmbedCode = () => {
    return `<script src="${window.location.origin}/widget.js" data-business-id="${businessId}"></script>`;
  };

  const getPreviewUrl = () => {
    return widgetConfigService.generatePreviewUrl(config);
  };

  const getHostedWidgetUrl = () => {
    return widgetConfigService.generateHostedWidgetUrl(config);
  };

  const getStatusColor = () => {
    if (!config) return "gray";
    if (config.theme === "auto" && config.primaryColor === "#3b82f6")
      return "yellow";
    return "green";
  };

  const getStatusText = () => {
    if (!config) return "تنظیم نشده";
    if (config.theme === "auto" && config.primaryColor === "#3b82f6")
      return "پیش‌فرض";
    return "شخصی‌سازی شده";
  };

  if (loadingConfig) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-700/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-blue-900 dark:text-blue-100">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            تنظیمات ویجت
          </div>
          <Badge
            variant={getStatusColor() === "green" ? "default" : "secondary"}
            className="text-xs"
          >
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Summary */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">تم:</span>
            <span className="font-medium">
              {config.theme === "auto"
                ? "خودکار"
                : config.theme === "light"
                  ? "روشن"
                  : "تاریک"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: config.primaryColor }}
            ></div>
            <span className="text-gray-600 dark:text-gray-400">رنگ:</span>
            <span className="font-medium">{config.primaryColor}</span>
          </div>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              کد جاسازی پایه
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                copyToClipboard(getBasicEmbedCode(), "کد پایه کپی شد")
              }
            >
              <Copy className="w-3 h-3 ml-1" />
              کپی
            </Button>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs font-mono break-all">
            {getBasicEmbedCode()}
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsConfiguring(true)}
            className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20"
          >
            <Settings className="w-3 h-3 ml-1" />
            تنظیمات
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(getPreviewUrl(), "_blank")}
            className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20"
          >
            <Eye className="w-3 h-3 ml-1" />
            پیش‌نمایش
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(getHostedWidgetUrl(), "_blank")}
            className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20"
          >
            <ExternalLink className="w-3 h-3 ml-1" />
            لینک مستقیم
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open("/widget-docs", "_blank")}
            className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/20"
          >
            <Code className="w-3 h-3 ml-1" />
            مستندات
          </Button>
        </div>

        {/* Configuration Modal Trigger */}
        {isConfiguring && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsConfiguring(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">تنظیمات ویجت</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsConfiguring(false)}
                >
                  بستن
                </Button>
              </div>

              {/* Quick Configuration Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">تم</label>
                    <select
                      value={config.theme}
                      onChange={(e) => {
                        const newConfig = {
                          ...config,
                          theme: e.target.value as any,
                        };
                        updateConfigMutation.mutate(newConfig);
                      }}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="auto">خودکار</option>
                      <option value="light">روشن</option>
                      <option value="dark">تاریک</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      رنگ اصلی
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => {
                          const newConfig = {
                            ...config,
                            primaryColor: e.target.value,
                          };
                          updateConfigMutation.mutate(newConfig);
                        }}
                        className="w-12 h-10 p-1 border rounded"
                      />
                      <input
                        value={config.primaryColor}
                        onChange={(e) => {
                          const newConfig = {
                            ...config,
                            primaryColor: e.target.value,
                          };
                          updateConfigMutation.mutate(newConfig);
                        }}
                        className="flex-1 p-2 border rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">نمایش لوگو</span>
                  <input
                    type="checkbox"
                    checked={config.showLogo}
                    onChange={(e) => {
                      const newConfig = {
                        ...config,
                        showLogo: e.target.checked,
                      };
                      updateConfigMutation.mutate(newConfig);
                    }}
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">اجازه یادداشت</span>
                  <input
                    type="checkbox"
                    checked={config.allowNotes}
                    onChange={(e) => {
                      const newConfig = {
                        ...config,
                        allowNotes: e.target.checked,
                      };
                      updateConfigMutation.mutate(newConfig);
                    }}
                    className="w-4 h-4"
                  />
                </div>

                {updateConfigMutation.isPending && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <LoadingSpinner size="sm" />
                    در حال بروزرسانی...
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default WidgetConfigCard;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useAuthStore } from "../store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  Settings,
  Brain,
  CalendarRange,
  CalendarDays,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Save,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Filter,
  Download,
  Upload,
  Copy,
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  ChevronDown,
  Info,
  Lightbulb,
  Target,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";

interface TimeSlotCreationProps {
  businessId: string;
  onSlotsCreated?: (slots: any[]) => void;
  onClose?: () => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  defaults: any;
  fields: any[];
}

interface ConflictSummary {
  totalDays: number;
  conflictDays: number;
  totalExistingSlots: number;
  totalExistingBookings: number;
  totalHolidays: number;
}

const TimeSlotCreation: React.FC<TimeSlotCreationProps> = ({
  businessId,
  onSlotsCreated,
  onClose,
}) => {
  const { user } = useAuthStore();

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templateData, setTemplateData] = useState<{ [key: string]: Template }>(
    {}
  );
  const [formData, setFormData] = useState<any>({});
  const [previewData, setPreviewData] = useState<any>(null);
  const [conflicts, setConflicts] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, [businessId]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/time-slots/templates?businessId=${businessId}`
      );
      const data = await response.json();

      if (data.success) {
        setTemplateData(data.data.templates);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("خطا در دریافت الگوها");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templateData[templateId];
    if (template) {
      setFormData({ ...template.defaults });
      setCurrentStep(2);
    }
  };

  const generatePreview = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/time-slots/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          template: selectedTemplate,
          pattern: formData,
          conflictResolution: formData.conflictResolution || "skip",
          applyHolidays: formData.applyHolidays !== false,
          applyBreaks: formData.applyBreaks !== false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPreviewData(data.data);
        setCurrentStep(3);
      } else {
        toast.error("خطا در تولید پیش‌نمایش");
      }
    } catch (error) {
      console.error("Error generating preview:", error);
      toast.error("خطا در تولید پیش‌نمایش");
    } finally {
      setLoading(false);
    }
  };

  const createSlots = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/time-slots/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          template: selectedTemplate,
          pattern: formData,
          conflictResolution: formData.conflictResolution || "skip",
          applyHolidays: formData.applyHolidays !== false,
          applyBreaks: formData.applyBreaks !== false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `${data.data.summary.totalSlots} اسلات با موفقیت ایجاد شد`
        );
        onSlotsCreated?.(data.data.created);
        onClose?.();
      } else {
        toast.error("خطا در ایجاد اسلات‌ها");
      }
    } catch (error) {
      console.error("Error creating slots:", error);
      toast.error("خطا در ایجاد اسلات‌ها");
    } finally {
      setSaving(false);
    }
  };

  const getTemplateIcon = (template: Template) => {
    const icons = {
      "calendar-week": Calendar,
      "calendar-day": CalendarDays,
      "calendar-range": CalendarRange,
      settings: Settings,
      brain: Brain,
    };
    return icons[template.icon as keyof typeof icons] || Calendar;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      recurring: "bg-blue-100 text-blue-800",
      oneTime: "bg-green-100 text-green-800",
      bulk: "bg-purple-100 text-purple-800",
      advanced: "bg-orange-100 text-orange-800",
      ai: "bg-pink-100 text-pink-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            ایجاد اسلات زمانی
          </h2>
          <p className="text-gray-600 mt-1">
            اسلات‌های زمانی را به صورت هوشمند و مطابق با نیازهای کسب‌وکار ایجاد
            کنید
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            <XCircle className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center space-x-8 rtl:space-x-reverse">
        {[
          { step: 1, label: "انتخاب الگو", icon: Target },
          { step: 2, label: "تنظیمات", icon: Settings },
          { step: 3, label: "پیش‌نمایش", icon: Eye },
          { step: 4, label: "تأیید", icon: CheckCircle },
        ].map(({ step, label, icon: Icon }) => (
          <div key={step} className="flex items-center">
            <div
              className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2
              ${
                currentStep >= step
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-white border-gray-300 text-gray-400"
              }
            `}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span
              className={`mr-2 text-sm font-medium ${
                currentStep >= step ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Template Selection */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  عملیات سریع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleTemplateSelect("weekly")}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-sm font-medium">هفته آینده</div>
                    <div className="text-xs text-gray-500">
                      ایجاد سریع برای هفته آینده
                    </div>
                  </button>

                  <button
                    onClick={() => handleTemplateSelect("bulk")}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <CalendarRange className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-sm font-medium">ماه آینده</div>
                    <div className="text-xs text-gray-500">
                      ایجاد انبوه برای ماه آینده
                    </div>
                  </button>

                  <button
                    onClick={() => handleTemplateSelect("smart")}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                  >
                    <Brain className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-sm font-medium">ایجاد هوشمند</div>
                    <div className="text-xs text-gray-500">
                      بر اساس تجزیه و تحلیل داده‌ها
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Template Categories */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">همه</TabsTrigger>
                <TabsTrigger value="recurring">تکراری</TabsTrigger>
                <TabsTrigger value="oneTime">یک‌بار</TabsTrigger>
                <TabsTrigger value="bulk">انبوه</TabsTrigger>
                <TabsTrigger value="ai">هوشمند</TabsTrigger>
              </TabsList>

              {["all", "recurring", "oneTime", "bulk", "ai"].map((category) => (
                <TabsContent
                  key={category}
                  value={category}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(templateData)
                      .filter(
                        ([_, template]) =>
                          category === "all" || template.category === category
                      )
                      .map(([templateId, template]) => {
                        const IconComponent = getTemplateIcon(template);
                        return (
                          <Card
                            key={templateId}
                            className={`cursor-pointer border-2 transition-all hover:shadow-lg ${
                              selectedTemplate === templateId
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => handleTemplateSelect(templateId)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-100 rounded-lg">
                                    <IconComponent className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-lg">
                                      {template.name}
                                    </CardTitle>
                                    <Badge
                                      className={getCategoryColor(
                                        template.category
                                      )}
                                    >
                                      {template.category}
                                    </Badge>
                                  </div>
                                </div>
                                {selectedTemplate === templateId && (
                                  <CheckCircle className="h-5 w-5 text-blue-500" />
                                )}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-600 text-sm">
                                {template.description}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        )}

        {/* Step 2: Configuration */}
        {currentStep === 2 && selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Configuration Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  تنظیمات {templateData[selectedTemplate]?.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template-specific form fields would go here */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Example fields for weekly template */}
                  {selectedTemplate === "weekly" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          روزهای هفته
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: 1, label: "دوشنبه" },
                            { value: 2, label: "سه‌شنبه" },
                            { value: 3, label: "چهارشنبه" },
                            { value: 4, label: "پنج‌شنبه" },
                            { value: 5, label: "جمعه" },
                            { value: 6, label: "شنبه" },
                            { value: 0, label: "یکشنبه" },
                          ].map((day) => (
                            <label
                              key={day.value}
                              className="flex items-center"
                            >
                              <input
                                type="checkbox"
                                checked={formData.daysOfWeek?.includes(
                                  day.value
                                )}
                                onChange={(e) => {
                                  const days = formData.daysOfWeek || [];
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      daysOfWeek: [...days, day.value],
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      daysOfWeek: days.filter(
                                        (d: number) => d !== day.value
                                      ),
                                    });
                                  }
                                }}
                                className="mr-2"
                              />
                              {day.label}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ساعت شروع
                          </label>
                          <Input
                            type="time"
                            value={formData.startTime || "09:00"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                startTime: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ساعت پایان
                          </label>
                          <Input
                            type="time"
                            value={formData.endTime || "17:00"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                endTime: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Advanced Options */}
                <div className="border-t pt-6">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    {showAdvanced ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    تنظیمات پیشرفته
                  </button>

                  {showAdvanced && (
                    <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            مدیریت تداخل
                          </label>
                          <select
                            value={formData.conflictResolution || "skip"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                conflictResolution: e.target.value,
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="skip">نادیده گیری</option>
                            <option value="overwrite">جایگزینی</option>
                            <option value="merge">ادغام</option>
                          </select>
                        </div>

                        <div className="flex items-center">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.applyHolidays !== false}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  applyHolidays: e.target.checked,
                                })
                              }
                              className="mr-2"
                            />
                            اعمال تعطیلات
                          </label>
                        </div>

                        <div className="flex items-center">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.applyBreaks !== false}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  applyBreaks: e.target.checked,
                                })
                              }
                              className="mr-2"
                            />
                            اعمال زمان استراحت
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                مرحله قبل
              </Button>
              <Button onClick={generatePreview} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                    در حال تولید...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 ml-2" />
                    پیش‌نمایش
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Preview */}
        {currentStep === 3 && previewData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Preview Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  خلاصه پیش‌نمایش
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {previewData.summary?.totalSlots || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      اسلات ایجاد می‌شود
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {previewData.summary?.totalConflicts || 0}
                    </div>
                    <div className="text-sm text-gray-600">تداخل</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {
                        Object.keys(previewData.summary?.slotsPerDay || {})
                          .length
                      }
                    </div>
                    <div className="text-sm text-gray-600">روز</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {previewData.businessRules?.workingHoursSource ||
                        "business"}
                    </div>
                    <div className="text-sm text-gray-600">منبع ساعات کاری</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conflicts Warning */}
            {previewData.conflicts && previewData.conflicts.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="h-5 w-5" />
                    تداخل‌های شناسایی شده
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {previewData.conflicts
                      .slice(0, 5)
                      .map((conflict: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span>{conflict.message}</span>
                        </div>
                      ))}
                    {previewData.conflicts.length > 5 && (
                      <div className="text-sm text-gray-600">
                        و {previewData.conflicts.length - 5} مورد دیگر...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                بازگشت به تنظیمات
              </Button>
              <div className="space-x-2 rtl:space-x-reverse">
                <Button
                  variant="outline"
                  onClick={generatePreview}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 ml-2" />
                  بروزرسانی پیش‌نمایش
                </Button>
                <Button onClick={createSlots} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                      در حال ایجاد...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      ایجاد اسلات‌ها
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeSlotCreation;

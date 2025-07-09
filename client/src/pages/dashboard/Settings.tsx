import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  Building2,
  CreditCard,
  Shield,
  Bell,
  Code,
  AlertTriangle,
  Save,
  Edit3,
  X,
  CheckCircle,
  Info,
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  Smartphone,
  Zap,
  Target,
  Crown,
  Award,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { dashboardApi, subscriptionApi } from "@/services/api";
import { useBusiness } from "@/contexts/BusinessContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import WidgetConfiguration from "@/components/WidgetConfiguration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

interface BusinessSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  website: string;
  logo: string;
  theme: string;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
  };
  isActive: boolean;
}

interface PaymentSettings {
  paymentRequired: boolean;
  depositRequired: boolean;
  depositPercentage: number;
  paymentGateways: {
    zarinpal: {
      enabled: boolean;
      merchantId?: string;
    };
    pasargad: {
      enabled: boolean;
      merchantId?: string;
      terminalId?: string;
    };
    saman: {
      enabled: boolean;
      merchantId?: string;
    };
  };
  currency: string;
}

interface BookingPolicySettings {
  cancellationPolicy: string;
  sameDayBooking: boolean;
  advanceBookingDays: number;
}

interface TimeManagementSettings {
  bufferBetweenSlots: number;
  maxBookingsPerSlot: number;
  maxSlotsPerDay: number;
  useServiceDuration: boolean;
  respectWorkingHours: boolean;
  includeLunchBreak: boolean;
  lunchBreakStart: string;
  lunchBreakEnd: string;
  optimizeForPeakHours: boolean;
  peakHoursStart: string;
  peakHoursEnd: string;
}

interface NotificationSettings {
  reminderTime: number;
  smsEnabled: boolean;
  telegramEnabled: boolean;
  telegramBotToken: string;
  telegramChatId: string;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { business, businessId } = useBusiness();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [isEditingBookingSettings, setIsEditingBookingSettings] =
    useState(false);
  const [isEditingNotifications, setIsEditingNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState<BusinessSettings>({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    website: "",
    logo: "",
    theme: "light",
    timezone: "Asia/Tehran",
    workingHours: {
      start: "09:00",
      end: "18:00",
    },
    isActive: true,
  });
  const [paymentData, setPaymentData] = useState<PaymentSettings>({
    paymentRequired: false,
    depositRequired: false,
    depositPercentage: 30,
    paymentGateways: {
      zarinpal: {
        enabled: true,
        merchantId: "",
      },
      pasargad: {
        enabled: false,
        merchantId: "",
        terminalId: "",
      },
      saman: {
        enabled: false,
        merchantId: "",
      },
    },
    currency: "toman",
  });

  const [bookingPolicyData, setBookingPolicyData] =
    useState<BookingPolicySettings>({
      cancellationPolicy: "24h",
      sameDayBooking: true,
      advanceBookingDays: 30,
    });

  const [timeManagementData, setTimeManagementData] =
    useState<TimeManagementSettings>({
      bufferBetweenSlots: 15,
      maxBookingsPerSlot: 1,
      maxSlotsPerDay: 20,
      useServiceDuration: true,
      respectWorkingHours: true,
      includeLunchBreak: true,
      lunchBreakStart: "12:00",
      lunchBreakEnd: "13:00",
      optimizeForPeakHours: true,
      peakHoursStart: "10:00",
      peakHoursEnd: "16:00",
    });

  const [notificationData, setNotificationData] =
    useState<NotificationSettings>({
      reminderTime: 60,
      smsEnabled: true,
      telegramEnabled: false,
      telegramBotToken: "",
      telegramChatId: "",
    });

  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ["business-settings", businessId],
    queryFn: () => {
      if (businessId) {
        return dashboardApi.getBusinessDetails(businessId);
      }
      return Promise.resolve(null);
    },
    enabled: !!businessId,
  });

  // Fetch subscription data
  const { data: subscription, isLoading: loadingSubscription } = useQuery({
    queryKey: ["subscription", businessId],
    queryFn: () => {
      if (businessId) {
        return subscriptionApi.getBusinessSubscription(businessId);
      }
      return subscriptionApi.getCurrentSubscription();
    },
    enabled: true,
  });

  // Fetch usage statistics
  const { isLoading: loadingUsage } = useQuery({
    queryKey: ["usage-stats"],
    queryFn: () => subscriptionApi.getUsageStats("6m"),
    enabled: true,
  });

  // Fetch invoices
  const { data: invoices, isLoading: loadingInvoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => subscriptionApi.getInvoices({ page: 1, limit: 5 }),
    enabled: true,
  });

  // Fetch available plans
  const { data: plans, isLoading: loadingPlans } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => subscriptionApi.getPlans(),
    enabled: true,
  });

  useEffect(() => {
    if (settings?.data?.data && !isEditing) {
      const businessData = settings.data.data;

      const workingHours = businessData.workingHours?.[0]
        ? {
            start: businessData.workingHours[0].startTime,
            end: businessData.workingHours[0].endTime,
          }
        : {
            start: "09:00",
            end: "18:00",
          };

      setFormData({
        name: businessData.name || "",
        email: businessData.email || "",
        phone: businessData.phone || "",
        address: businessData.address || "",
        description: businessData.description || "",
        website: businessData.website || "",
        logo: businessData.logo || "",
        theme: businessData.theme || "light",
        timezone: businessData.timezone || "Asia/Tehran",
        workingHours,
        isActive: businessData.isActive !== false,
      });
    }
  }, [settings, isEditing]);

  useEffect(() => {
    if (settings?.data?.data && !isEditingPayment) {
      const businessData = settings.data.data.settings;

      // Default payment gateway structure
      const defaultPaymentGateways = {
        zarinpal: {
          enabled: true,
          merchantId: "",
        },
        pasargad: {
          enabled: false,
          merchantId: "",
          terminalId: "",
        },
        saman: {
          enabled: false,
          merchantId: "",
        },
      };

      if (businessData?.paymentSettings) {
        // Ensure payment gateways structure is complete
        const paymentGateways = {
          zarinpal: {
            enabled:
              businessData.paymentSettings.paymentGateways?.zarinpal?.enabled ??
              true,
            merchantId:
              businessData.paymentSettings.paymentGateways?.zarinpal
                ?.merchantId ?? "",
          },
          pasargad: {
            enabled:
              businessData.paymentSettings.paymentGateways?.pasargad?.enabled ??
              false,
            merchantId:
              businessData.paymentSettings.paymentGateways?.pasargad
                ?.merchantId ?? "",
            terminalId:
              businessData.paymentSettings.paymentGateways?.pasargad
                ?.terminalId ?? "",
          },
          saman: {
            enabled:
              businessData.paymentSettings.paymentGateways?.saman?.enabled ??
              false,
            merchantId:
              businessData.paymentSettings.paymentGateways?.saman?.merchantId ??
              "",
          },
        };

        setPaymentData({
          paymentRequired:
            businessData.paymentSettings.paymentRequired ?? false,
          depositRequired:
            businessData.paymentSettings.depositRequired ?? false,
          depositPercentage:
            businessData.paymentSettings.depositPercentage ?? 30,
          paymentGateways,
          currency: businessData.paymentSettings.currency ?? "toman",
        });
      } else if (businessData?.paymentRequired !== undefined) {
        // Ensure payment gateways structure is complete
        const paymentGateways = businessData.paymentGateways
          ? {
              zarinpal: {
                enabled: businessData.paymentGateways.zarinpal?.enabled ?? true,
                merchantId:
                  businessData.paymentGateways.zarinpal?.merchantId ?? "",
              },
              pasargad: {
                enabled:
                  businessData.paymentGateways.pasargad?.enabled ?? false,
                merchantId:
                  businessData.paymentGateways.pasargad?.merchantId ?? "",
                terminalId:
                  businessData.paymentGateways.pasargad?.terminalId ?? "",
              },
              saman: {
                enabled: businessData.paymentGateways.saman?.enabled ?? false,
                merchantId:
                  businessData.paymentGateways.saman?.merchantId ?? "",
              },
            }
          : defaultPaymentGateways;

        setPaymentData({
          paymentRequired: businessData.paymentRequired || false,
          depositRequired: businessData.depositRequired || false,
          depositPercentage: businessData.depositPercentage || 30,
          paymentGateways,
          currency: businessData.currency || "toman",
        });
      } else {
        setPaymentData({
          paymentRequired: false,
          depositRequired: false,
          depositPercentage: 30,
          paymentGateways: defaultPaymentGateways,
          currency: "toman",
        });
      }
    }
  }, [settings, isEditingPayment]);

  // Load booking settings (policies + time management)
  useEffect(() => {
    if (settings?.data?.data?.settings && !isEditingBookingSettings) {
      const businessSettings = settings.data.data.settings;
      setBookingPolicyData({
        cancellationPolicy: businessSettings.cancellationPolicy || "24h",
        sameDayBooking: businessSettings.sameDayBooking ?? true,
        advanceBookingDays: businessSettings.advanceBookingDays || 30,
      });
      setTimeManagementData({
        bufferBetweenSlots: businessSettings.bufferBetweenSlots || 15,
        maxBookingsPerSlot: businessSettings.maxBookingsPerSlot || 1,
        maxSlotsPerDay: businessSettings.maxSlotsPerDay || 20,
        useServiceDuration: businessSettings.useServiceDuration ?? true,
        respectWorkingHours: businessSettings.respectWorkingHours ?? true,
        includeLunchBreak: businessSettings.includeLunchBreak ?? true,
        lunchBreakStart: businessSettings.lunchBreakStart || "12:00",
        lunchBreakEnd: businessSettings.lunchBreakEnd || "13:00",
        optimizeForPeakHours: businessSettings.optimizeForPeakHours ?? true,
        peakHoursStart: businessSettings.peakHoursStart || "10:00",
        peakHoursEnd: businessSettings.peakHoursEnd || "16:00",
      });
    }
  }, [settings, isEditingBookingSettings]);

  // Load notification settings
  useEffect(() => {
    if (settings?.data?.data?.settings && !isEditingNotifications) {
      const businessSettings = settings.data.data.settings;
      setNotificationData({
        reminderTime: businessSettings.reminderTime || 60,
        smsEnabled: businessSettings.smsEnabled ?? true,
        telegramEnabled: businessSettings.telegramEnabled ?? false,
        telegramBotToken: businessSettings.telegramBotToken || "",
        telegramChatId: businessSettings.telegramChatId || "",
      });
    }
  }, [settings, isEditingNotifications]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: BusinessSettings) => {
      if (businessId) {
        return dashboardApi.updateBusiness(businessId, data);
      }
      return Promise.reject("No business found");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
      queryClient.invalidateQueries({ queryKey: ["business-data"] });
      queryClient.invalidateQueries({ queryKey: ["my-business"] });
      setIsEditing(false);
      toast.success("تنظیمات با موفقیت بروزرسانی شد");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در بروزرسانی تنظیمات");
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: (data: PaymentSettings) => {
      if (businessId) {
        return dashboardApi.updateBusinessSettings(businessId, {
          paymentSettings: data,
        });
      }
      return Promise.reject("No business found");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
      queryClient.invalidateQueries({ queryKey: ["business-data"] });
      setIsEditingPayment(false);
      toast.success("تنظیمات پرداخت با موفقیت بروزرسانی شد");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "خطا در بروزرسانی تنظیمات پرداخت"
      );
    },
  });

  const updateBookingSettingsMutation = useMutation({
    mutationFn: (data: BookingPolicySettings & TimeManagementSettings) => {
      if (businessId) {
        return dashboardApi.updateBusinessSettings(businessId, data);
      }
      return Promise.reject("No business found");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
      queryClient.invalidateQueries({ queryKey: ["business-data"] });
      setIsEditingBookingSettings(false);
      toast.success("تنظیمات رزرو با موفقیت بروزرسانی شد");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "خطا در بروزرسانی تنظیمات رزرو"
      );
    },
  });

  const updateNotificationMutation = useMutation({
    mutationFn: (data: NotificationSettings) => {
      if (businessId) {
        return dashboardApi.updateBusinessSettings(businessId, data);
      }
      return Promise.reject("No business found");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
      queryClient.invalidateQueries({ queryKey: ["business-data"] });
      setIsEditingNotifications(false);
      toast.success("تنظیمات اعلان‌ها با موفقیت بروزرسانی شد");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "خطا در بروزرسانی تنظیمات اعلان‌ها"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const apiData: any = {};

    if (formData.name.trim()) apiData.name = formData.name.trim();
    if (formData.email.trim()) apiData.email = formData.email.trim();
    if (formData.phone.trim()) apiData.phone = formData.phone.trim();
    if (formData.address.trim()) apiData.address = formData.address.trim();
    if (formData.description.trim())
      apiData.description = formData.description.trim();
    if (formData.website.trim()) apiData.website = formData.website.trim();
    if (formData.logo.trim()) apiData.logo = formData.logo.trim();
    if (formData.theme) apiData.theme = formData.theme;
    if (formData.timezone) apiData.timezone = formData.timezone;

    apiData.isActive = formData.isActive;

    if (formData.workingHours.start && formData.workingHours.end) {
      apiData.workingHours = {
        start: formData.workingHours.start,
        end: formData.workingHours.end,
      };
    }

    console.log("Submitting form data:", apiData);
    updateSettingsMutation.mutate(apiData);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (settings?.data?.data) {
      const businessData = settings.data.data;
      const workingHours = businessData.workingHours?.[0]
        ? {
            start: businessData.workingHours[0].startTime,
            end: businessData.workingHours[0].endTime,
          }
        : {
            start: "09:00",
            end: "18:00",
          };

      setFormData({
        name: businessData.name || "",
        email: businessData.email || "",
        phone: businessData.phone || "",
        address: businessData.address || "",
        description: businessData.description || "",
        website: businessData.website || "",
        logo: businessData.logo || "",
        theme: businessData.theme || "light",
        timezone: businessData.timezone || "Asia/Tehran",
        workingHours,
        isActive: businessData.isActive !== false,
      });
    }
    setIsEditing(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentMutation.mutate(paymentData);
  };

  const handleEditPayment = () => {
    setIsEditingPayment(true);
  };

  const handleCancelPayment = () => {
    if (settings?.data?.data) {
      const businessData = settings.data.data.settings;

      // Default payment gateway structure
      const defaultPaymentGateways = {
        zarinpal: { enabled: true, merchantId: "" },
        pasargad: { enabled: false, merchantId: "", terminalId: "" },
        saman: { enabled: false, merchantId: "" },
      };

      if (businessData?.paymentSettings) {
        // Ensure payment gateways structure is complete
        const paymentGateways = {
          zarinpal: {
            enabled:
              businessData.paymentSettings.paymentGateways?.zarinpal?.enabled ??
              true,
            merchantId:
              businessData.paymentSettings.paymentGateways?.zarinpal
                ?.merchantId ?? "",
          },
          pasargad: {
            enabled:
              businessData.paymentSettings.paymentGateways?.pasargad?.enabled ??
              false,
            merchantId:
              businessData.paymentSettings.paymentGateways?.pasargad
                ?.merchantId ?? "",
            terminalId:
              businessData.paymentSettings.paymentGateways?.pasargad
                ?.terminalId ?? "",
          },
          saman: {
            enabled:
              businessData.paymentSettings.paymentGateways?.saman?.enabled ??
              false,
            merchantId:
              businessData.paymentSettings.paymentGateways?.saman?.merchantId ??
              "",
          },
        };

        setPaymentData({
          paymentRequired:
            businessData.paymentSettings.paymentRequired ?? false,
          depositRequired:
            businessData.paymentSettings.depositRequired ?? false,
          depositPercentage:
            businessData.paymentSettings.depositPercentage ?? 30,
          paymentGateways,
          currency: businessData.paymentSettings.currency ?? "toman",
        });
      } else if (businessData?.paymentRequired !== undefined) {
        // Ensure payment gateways structure is complete
        const paymentGateways = businessData.paymentGateways
          ? {
              zarinpal: {
                enabled: businessData.paymentGateways.zarinpal?.enabled ?? true,
                merchantId:
                  businessData.paymentGateways.zarinpal?.merchantId ?? "",
              },
              pasargad: {
                enabled:
                  businessData.paymentGateways.pasargad?.enabled ?? false,
                merchantId:
                  businessData.paymentGateways.pasargad?.merchantId ?? "",
                terminalId:
                  businessData.paymentGateways.pasargad?.terminalId ?? "",
              },
              saman: {
                enabled: businessData.paymentGateways.saman?.enabled ?? false,
                merchantId:
                  businessData.paymentGateways.saman?.merchantId ?? "",
              },
            }
          : defaultPaymentGateways;

        setPaymentData({
          paymentRequired: businessData.paymentRequired || false,
          depositRequired: businessData.depositRequired || false,
          depositPercentage: businessData.depositPercentage || 30,
          paymentGateways,
          currency: businessData.currency || "toman",
        });
      } else {
        setPaymentData({
          paymentRequired: false,
          depositRequired: false,
          depositPercentage: 30,
          paymentGateways: defaultPaymentGateways,
          currency: "toman",
        });
      }
    }
    setIsEditingPayment(false);
  };

  const handleBookingSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const combinedData = { ...bookingPolicyData, ...timeManagementData };
    updateBookingSettingsMutation.mutate(combinedData);
  };

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationMutation.mutate(notificationData);
  };

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const settingsData = settings?.data;

  const tabs = [
    {
      id: "general",
      name: "عمومی",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      id: "payment",
      name: "پرداخت",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
    },
    {
      id: "booking-settings",
      name: "تنظیمات رزرو",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7h8M8 7L6 21h12l-2-14M10 11v3m4-3v3"
          />
        </svg>
      ),
    },
    {
      id: "notifications",
      name: "اعلان‌ها",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5-5V9a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 01-6 0v-1m6 0H9"
          />
        </svg>
      ),
    },
    {
      id: "widget",
      name: "ویجت",
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
    },
    {
      id: "subscription",
      name: "اشتراک",
      icon: <Crown className="w-5 h-5" />,
    },
    {
      id: "danger",
      name: "خطر",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/10">
      {/* Enhanced Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4 space-x-reverse">
              <motion.button
                onClick={() => navigate("/dashboard")}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 shadow-sm"
              >
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </motion.button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <SettingsIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    تنظیمات کسب‌وکار
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    مدیریت و پیکربندی {business?.name || "کسب‌وکار"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <Badge
                className={`px-4 py-2 font-medium shadow-sm ${
                  settingsData?.data?.isActive !== false
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
                    : "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      settingsData?.data?.isActive !== false
                        ? "bg-green-200"
                        : "bg-gray-200"
                    }`}
                  />
                  {settingsData?.data?.isActive !== false ? "فعال" : "غیرفعال"}
                </div>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Tabs */}
        <div className="mb-8">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-2 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
            <nav className="flex space-x-2 space-x-reverse overflow-x-auto">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap min-w-fit ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105"
                      : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  }`}
                >
                  <div
                    className={`transition-transform duration-200 ${
                      activeTab === tab.id ? "scale-110" : ""
                    }`}
                  >
                    {tab.icon}
                  </div>
                  <span className="text-sm">{tab.name}</span>
                </motion.button>
              ))}
            </nav>
          </div>
        </div>

        {/* General Settings */}
        {activeTab === "general" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-800 dark:via-blue-900/10 dark:to-indigo-900/10 backdrop-blur-sm">
              <CardHeader className="border-b border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 dark:from-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                        اطلاعات کسب‌وکار
                      </CardTitle>
                      <p className="text-blue-700 dark:text-blue-300 mt-1 font-medium">
                        مدیریت اطلاعات اصلی و تنظیمات عمومی
                      </p>
                    </div>
                  </div>
                  {!isEditing && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleEdit}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg border-0 px-6 py-3"
                      >
                        <Edit3 className="w-4 h-4 ml-2" />
                        ویرایش اطلاعات
                      </Button>
                    </motion.div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            نام کسب‌وکار
                          </label>
                          <Input
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="نام کسب‌وکار"
                            className="h-11"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            ایمیل
                          </label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            placeholder="ایمیل"
                            className="h-11"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            تلفن
                          </label>
                          <Input
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                            placeholder="09123456789"
                            className="h-11"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            وب‌سایت
                          </label>
                          <Input
                            type="url"
                            value={formData.website}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                website: e.target.value,
                              })
                            }
                            placeholder="https://example.com"
                            className="h-11"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            آدرس
                          </label>
                          <Input
                            value={formData.address}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                address: e.target.value,
                              })
                            }
                            placeholder="آدرس کسب‌وکار"
                            className="h-11"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            لوگو (URL)
                          </label>
                          <Input
                            type="url"
                            value={formData.logo}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                logo: e.target.value,
                              })
                            }
                            placeholder="https://example.com/logo.png"
                            className="h-11"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            تم ظاهری
                          </label>
                          <select
                            value={formData.theme}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                theme: e.target.value,
                              })
                            }
                            className="w-full h-11 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="light">روشن</option>
                            <option value="dark">تیره</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            منطقه زمانی
                          </label>
                          <select
                            value={formData.timezone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                timezone: e.target.value,
                              })
                            }
                            className="w-full h-11 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="Asia/Tehran">
                              تهران (آسیا/تهران)
                            </option>
                            <option value="Asia/Istanbul">
                              استانبول (آسیا/استانبول)
                            </option>
                            <option value="Europe/London">
                              لندن (اروپا/لندن)
                            </option>
                            <option value="America/New_York">
                              نیویورک (آمریکا/نیویورک)
                            </option>
                            <option value="Asia/Dubai">دبی (آسیا/دبی)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            ساعت شروع کار
                          </label>
                          <Input
                            type="time"
                            value={formData.workingHours.start}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                workingHours: {
                                  ...formData.workingHours,
                                  start: e.target.value,
                                },
                              })
                            }
                            className="h-11"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            ساعت پایان کار
                          </label>
                          <Input
                            type="time"
                            value={formData.workingHours.end}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                workingHours: {
                                  ...formData.workingHours,
                                  end: e.target.value,
                                },
                              })
                            }
                            className="h-11"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        توضیحات
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="توضیحات کسب‌وکار"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows={4}
                      />
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="isActive"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        کسب‌وکار فعال است
                      </label>
                    </div>
                    <div className="flex space-x-3 space-x-reverse pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        type="submit"
                        disabled={updateSettingsMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 px-6"
                      >
                        {updateSettingsMutation.isPending ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4 ml-2"
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
                            ذخیره تغییرات
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        انصراف
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {settingsData?.data?.name || "نام تعیین نشده"}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {settingsData?.data?.email || "ایمیل تعیین نشده"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <span className="text-gray-600 dark:text-gray-300">
                            {settingsData?.data?.phone || "تلفن تعیین نشده"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="text-gray-600 dark:text-gray-300">
                            {settingsData?.data?.address || "آدرس تعیین نشده"}
                          </span>
                        </div>
                        {settingsData?.data?.website && (
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <Globe className="w-5 h-5 text-gray-400" />
                            <a
                              href={settingsData.data.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {settingsData.data.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-6">
                      {settingsData?.data?.logo && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            لوگو
                          </h4>
                          <img
                            src={settingsData.data.logo}
                            alt="Logo"
                            className="w-16 h-16 object-contain rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          ساعات کاری
                        </h4>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Clock className="w-5 h-5 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {settingsData?.data?.workingHours?.[0]?.startTime ||
                              "09:00"}{" "}
                            تا{" "}
                            {settingsData?.data?.workingHours?.[0]?.endTime ||
                              "18:00"}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            تم ظاهری
                          </h4>
                          <span className="text-gray-600 dark:text-gray-300">
                            {settingsData?.data?.theme === "dark"
                              ? "تیره"
                              : "روشن"}
                          </span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            منطقه زمانی
                          </h4>
                          <span className="text-gray-600 dark:text-gray-300 text-sm">
                            {settingsData?.data?.timezone || "Asia/Tehran"}
                          </span>
                        </div>
                      </div>
                      {settingsData?.data?.description && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            توضیحات
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            {settingsData.data.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Payment Settings */}
        {activeTab === "payment" && (
          <div className="space-y-6">
            <Card className="shadow-sm border-0 bg-white dark:bg-gray-800">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <svg
                        className="w-6 h-6 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-xl">تنظیمات پرداخت</CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        درگاه‌های پرداخت و پیش‌پرداخت
                      </p>
                    </div>
                  </div>
                  {!isEditingPayment && (
                    <Button
                      onClick={handleEditPayment}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      ویرایش
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isEditingPayment ? (
                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    {/* Payment Options */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        گزینه‌های پرداخت
                      </h3>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 space-x-reverse p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <input
                              type="checkbox"
                              id="paymentRequired"
                              checked={paymentData.paymentRequired}
                              onChange={(e) =>
                                setPaymentData({
                                  ...paymentData,
                                  paymentRequired: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                            />
                            <div>
                              <label
                                htmlFor="paymentRequired"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                پرداخت آنلاین الزامی
                              </label>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                مشتریان باید حتماً آنلاین پرداخت کنند
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 space-x-reverse p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <input
                              type="checkbox"
                              id="depositRequired"
                              checked={paymentData.depositRequired}
                              onChange={(e) =>
                                setPaymentData({
                                  ...paymentData,
                                  depositRequired: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                            />
                            <div>
                              <label
                                htmlFor="depositRequired"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                پیش‌پرداخت الزامی
                              </label>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                مشتریان باید بخشی از مبلغ را پیش‌پرداخت کنند
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              درصد پیش‌پرداخت
                            </label>
                            <Input
                              type="number"
                              min="10"
                              max="100"
                              value={paymentData.depositPercentage}
                              onChange={(e) =>
                                setPaymentData({
                                  ...paymentData,
                                  depositPercentage:
                                    parseInt(e.target.value) || 30,
                                })
                              }
                              className="h-11"
                              disabled={!paymentData.depositRequired}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              درصد مبلغی که مشتری باید پیش‌پرداخت کند
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              واحد پول
                            </label>
                            <select
                              value={paymentData.currency}
                              onChange={(e) =>
                                setPaymentData({
                                  ...paymentData,
                                  currency: e.target.value,
                                })
                              }
                              className="w-full h-11 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="toman">تومان</option>
                              <option value="rial">ریال</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Gateways */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        درگاه‌های پرداخت
                      </h3>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Zarinpal */}
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <div className="flex items-center space-x-3 space-x-reverse mb-4">
                            <input
                              type="checkbox"
                              id="zarinpal"
                              checked={
                                paymentData.paymentGateways?.zarinpal
                                  ?.enabled ?? false
                              }
                              onChange={(e) =>
                                setPaymentData({
                                  ...paymentData,
                                  paymentGateways: {
                                    ...paymentData.paymentGateways,
                                    zarinpal: {
                                      ...paymentData.paymentGateways?.zarinpal,
                                      enabled: e.target.checked,
                                    },
                                  },
                                })
                              }
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                              htmlFor="zarinpal"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              زرین‌پال 💳
                            </label>
                          </div>
                          {paymentData.paymentGateways?.zarinpal?.enabled && (
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                شناسه پذیرنده
                              </label>
                              <Input
                                value={
                                  paymentData.paymentGateways?.zarinpal
                                    ?.merchantId || ""
                                }
                                onChange={(e) =>
                                  setPaymentData({
                                    ...paymentData,
                                    paymentGateways: {
                                      ...paymentData.paymentGateways,
                                      zarinpal: {
                                        ...paymentData.paymentGateways
                                          ?.zarinpal,
                                        merchantId: e.target.value,
                                      },
                                    },
                                  })
                                }
                                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                className="h-9 text-sm"
                              />
                            </div>
                          )}
                        </div>

                        {/* Pasargad */}
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <div className="flex items-center space-x-3 space-x-reverse mb-4">
                            <input
                              type="checkbox"
                              id="pasargad"
                              checked={
                                paymentData.paymentGateways?.pasargad
                                  ?.enabled ?? false
                              }
                              onChange={(e) =>
                                setPaymentData({
                                  ...paymentData,
                                  paymentGateways: {
                                    ...paymentData.paymentGateways,
                                    pasargad: {
                                      ...paymentData.paymentGateways?.pasargad,
                                      enabled: e.target.checked,
                                    },
                                  },
                                })
                              }
                              className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <label
                              htmlFor="pasargad"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              پاسارگاد 🏦
                            </label>
                          </div>
                          {paymentData.paymentGateways?.pasargad?.enabled && (
                            <div className="space-y-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  شناسه پذیرنده
                                </label>
                                <Input
                                  value={
                                    paymentData.paymentGateways?.pasargad
                                      ?.merchantId || ""
                                  }
                                  onChange={(e) =>
                                    setPaymentData({
                                      ...paymentData,
                                      paymentGateways: {
                                        ...paymentData.paymentGateways,
                                        pasargad: {
                                          ...paymentData.paymentGateways
                                            ?.pasargad,
                                          merchantId: e.target.value,
                                        },
                                      },
                                    })
                                  }
                                  placeholder="123456"
                                  className="h-9 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  شناسه ترمینال
                                </label>
                                <Input
                                  value={
                                    paymentData.paymentGateways?.pasargad
                                      ?.terminalId || ""
                                  }
                                  onChange={(e) =>
                                    setPaymentData({
                                      ...paymentData,
                                      paymentGateways: {
                                        ...paymentData.paymentGateways,
                                        pasargad: {
                                          ...paymentData.paymentGateways
                                            ?.pasargad,
                                          terminalId: e.target.value,
                                        },
                                      },
                                    })
                                  }
                                  placeholder="12345678"
                                  className="h-9 text-sm"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Saman */}
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <div className="flex items-center space-x-3 space-x-reverse mb-4">
                            <input
                              type="checkbox"
                              id="saman"
                              checked={
                                paymentData.paymentGateways?.saman?.enabled ??
                                false
                              }
                              onChange={(e) =>
                                setPaymentData({
                                  ...paymentData,
                                  paymentGateways: {
                                    ...paymentData.paymentGateways,
                                    saman: {
                                      ...paymentData.paymentGateways?.saman,
                                      enabled: e.target.checked,
                                    },
                                  },
                                })
                              }
                              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <label
                              htmlFor="saman"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              سامان 💰
                            </label>
                          </div>
                          {paymentData.paymentGateways?.saman?.enabled && (
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                شناسه پذیرنده
                              </label>
                              <Input
                                value={
                                  paymentData.paymentGateways?.saman
                                    ?.merchantId || ""
                                }
                                onChange={(e) =>
                                  setPaymentData({
                                    ...paymentData,
                                    paymentGateways: {
                                      ...paymentData.paymentGateways,
                                      saman: {
                                        ...paymentData.paymentGateways?.saman,
                                        merchantId: e.target.value,
                                      },
                                    },
                                  })
                                }
                                placeholder="123456789"
                                className="h-9 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 space-x-reverse pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        type="submit"
                        disabled={updatePaymentMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 px-6"
                      >
                        {updatePaymentMutation.isPending ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4 ml-2"
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
                            ذخیره تنظیمات پرداخت
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelPayment}
                      >
                        انصراف
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {/* Current Payment Settings Display */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          تنظیمات کلی
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              پرداخت آنلاین الزامی
                            </span>
                            <Badge
                              variant={
                                paymentData.paymentRequired
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {paymentData.paymentRequired ? "فعال" : "غیرفعال"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              پیش‌پرداخت الزامی
                            </span>
                            <Badge
                              variant={
                                paymentData.depositRequired
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {paymentData.depositRequired ? "فعال" : "غیرفعال"}
                            </Badge>
                          </div>
                          {paymentData.depositRequired && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                درصد پیش‌پرداخت
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {paymentData.depositPercentage}٪
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              واحد پول
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {paymentData.currency === "toman"
                                ? "تومان"
                                : "ریال"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          درگاه‌های فعال
                        </h4>
                        <div className="space-y-2">
                          {paymentData.paymentGateways?.zarinpal?.enabled && (
                            <div className="flex items-center space-x-2 space-x-reverse p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <span className="text-lg">💳</span>
                              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                زرین‌پال
                              </span>
                            </div>
                          )}
                          {paymentData.paymentGateways?.pasargad?.enabled && (
                            <div className="flex items-center space-x-2 space-x-reverse p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                              <span className="text-lg">🏦</span>
                              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                                پاسارگاد
                              </span>
                            </div>
                          )}
                          {paymentData.paymentGateways?.saman?.enabled && (
                            <div className="flex items-center space-x-2 space-x-reverse p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <span className="text-lg">💰</span>
                              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                سامان
                              </span>
                            </div>
                          )}
                          {!paymentData.paymentGateways?.zarinpal?.enabled &&
                            !paymentData.paymentGateways?.pasargad?.enabled &&
                            !paymentData.paymentGateways?.saman?.enabled && (
                              <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  هیچ درگاه پرداختی فعال نیست
                                </span>
                              </div>
                            )}
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
                            تنظیمات پرداخت
                          </h4>
                          <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                            برای فعال کردن پرداخت آنلاین، حداقل یک درگاه پرداخت
                            باید فعال باشد. اطلاعات درگاه‌های پرداخت را از
                            ارائه‌دهنده خدمات دریافت کنید.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Booking Settings */}
        {activeTab === "booking-settings" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-green-50/30 to-blue-50/30 dark:from-gray-800 dark:via-green-900/10 dark:to-blue-900/10 backdrop-blur-sm">
              <CardHeader className="border-b border-green-200/50 dark:border-green-800/50 bg-gradient-to-r from-green-50/50 to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7h8M8 7L6 21h12l-2-14M10 11v3m4-3v3"
                        />
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-900 to-blue-900 dark:from-green-100 dark:to-blue-100 bg-clip-text text-transparent">
                        تنظیمات رزرو
                      </CardTitle>
                      <p className="text-green-700 dark:text-green-300 mt-1 font-medium">
                        سیاست‌ها، زمان‌بندی و قوانین رزرو
                      </p>
                    </div>
                  </div>
                  {!isEditingBookingSettings && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => setIsEditingBookingSettings(true)}
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg border-0 px-6 py-3"
                      >
                        <Edit3 className="w-4 h-4 ml-2" />
                        ویرایش تنظیمات
                      </Button>
                    </motion.div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isEditingBookingSettings ? (
                  <form
                    onSubmit={handleBookingSettingsSubmit}
                    className="space-y-8"
                  >
                    {/* Booking Policies Section */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200/50 dark:border-green-800/50">
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-6 flex items-center">
                        <svg
                          className="w-6 h-6 ml-2 text-green-600 dark:text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        سیاست‌های رزرو
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            سیاست لغو رزرو
                          </label>
                          <select
                            value={bookingPolicyData.cancellationPolicy}
                            onChange={(e) =>
                              setBookingPolicyData({
                                ...bookingPolicyData,
                                cancellationPolicy: e.target.value,
                              })
                            }
                            className="w-full h-11 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="24h">24 ساعت قبل</option>
                            <option value="12h">12 ساعت قبل</option>
                            <option value="6h">6 ساعت قبل</option>
                            <option value="2h">2 ساعت قبل</option>
                            <option value="1h">1 ساعت قبل</option>
                            <option value="no-cancellation">
                              بدون امکان لغو
                            </option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            حداکثر روزهای پیش‌رزرو
                          </label>
                          <Input
                            type="number"
                            min="1"
                            max="365"
                            value={bookingPolicyData.advanceBookingDays}
                            onChange={(e) =>
                              setBookingPolicyData({
                                ...bookingPolicyData,
                                advanceBookingDays:
                                  parseInt(e.target.value) || 30,
                              })
                            }
                            className="h-11"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <input
                            type="checkbox"
                            id="sameDayBooking"
                            checked={bookingPolicyData.sameDayBooking}
                            onChange={(e) =>
                              setBookingPolicyData({
                                ...bookingPolicyData,
                                sameDayBooking: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <label
                            htmlFor="sameDayBooking"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            امکان رزرو در همان روز
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Time Management Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-6 flex items-center">
                        <svg
                          className="w-6 h-6 ml-2 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        مدیریت زمان
                      </h3>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              فاصله بین بازه‌ها (دقیقه)
                            </label>
                            <Input
                              type="number"
                              min="0"
                              max="120"
                              value={timeManagementData.bufferBetweenSlots}
                              onChange={(e) =>
                                setTimeManagementData({
                                  ...timeManagementData,
                                  bufferBetweenSlots:
                                    parseInt(e.target.value) || 0,
                                })
                              }
                              className="h-11"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              حداکثر رزرو در هر بازه
                            </label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={timeManagementData.maxBookingsPerSlot}
                              onChange={(e) =>
                                setTimeManagementData({
                                  ...timeManagementData,
                                  maxBookingsPerSlot:
                                    parseInt(e.target.value) || 1,
                                })
                              }
                              className="h-11"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              حداکثر بازه در روز
                            </label>
                            <Input
                              type="number"
                              min="1"
                              max="50"
                              value={timeManagementData.maxSlotsPerDay}
                              onChange={(e) =>
                                setTimeManagementData({
                                  ...timeManagementData,
                                  maxSlotsPerDay:
                                    parseInt(e.target.value) || 20,
                                })
                              }
                              className="h-11"
                            />
                          </div>
                        </div>

                        {/* Lunch Break Settings */}
                        <div>
                          <div className="flex items-center space-x-3 space-x-reverse mb-4">
                            <input
                              type="checkbox"
                              id="includeLunchBreak"
                              checked={timeManagementData.includeLunchBreak}
                              onChange={(e) =>
                                setTimeManagementData({
                                  ...timeManagementData,
                                  includeLunchBreak: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                              htmlFor="includeLunchBreak"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              استراحت ناهار
                            </label>
                          </div>
                          {timeManagementData.includeLunchBreak && (
                            <div className="grid grid-cols-2 gap-4 pr-7">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  شروع استراحت
                                </label>
                                <Input
                                  type="time"
                                  value={timeManagementData.lunchBreakStart}
                                  onChange={(e) =>
                                    setTimeManagementData({
                                      ...timeManagementData,
                                      lunchBreakStart: e.target.value,
                                    })
                                  }
                                  className="h-11"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  پایان استراحت
                                </label>
                                <Input
                                  type="time"
                                  value={timeManagementData.lunchBreakEnd}
                                  onChange={(e) =>
                                    setTimeManagementData({
                                      ...timeManagementData,
                                      lunchBreakEnd: e.target.value,
                                    })
                                  }
                                  className="h-11"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Peak Hours Settings */}
                        <div>
                          <div className="flex items-center space-x-3 space-x-reverse mb-4">
                            <input
                              type="checkbox"
                              id="optimizeForPeakHours"
                              checked={timeManagementData.optimizeForPeakHours}
                              onChange={(e) =>
                                setTimeManagementData({
                                  ...timeManagementData,
                                  optimizeForPeakHours: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                              htmlFor="optimizeForPeakHours"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              بهینه‌سازی برای ساعات شلوغی
                            </label>
                          </div>
                          {timeManagementData.optimizeForPeakHours && (
                            <div className="grid grid-cols-2 gap-4 pr-7">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  شروع ساعات شلوغی
                                </label>
                                <Input
                                  type="time"
                                  value={timeManagementData.peakHoursStart}
                                  onChange={(e) =>
                                    setTimeManagementData({
                                      ...timeManagementData,
                                      peakHoursStart: e.target.value,
                                    })
                                  }
                                  className="h-11"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  پایان ساعات شلوغی
                                </label>
                                <Input
                                  type="time"
                                  value={timeManagementData.peakHoursEnd}
                                  onChange={(e) =>
                                    setTimeManagementData({
                                      ...timeManagementData,
                                      peakHoursEnd: e.target.value,
                                    })
                                  }
                                  className="h-11"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Other Options */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <input
                              type="checkbox"
                              id="useServiceDuration"
                              checked={timeManagementData.useServiceDuration}
                              onChange={(e) =>
                                setTimeManagementData({
                                  ...timeManagementData,
                                  useServiceDuration: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                              htmlFor="useServiceDuration"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              استفاده از مدت زمان سرویس
                            </label>
                          </div>
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <input
                              type="checkbox"
                              id="respectWorkingHours"
                              checked={timeManagementData.respectWorkingHours}
                              onChange={(e) =>
                                setTimeManagementData({
                                  ...timeManagementData,
                                  respectWorkingHours: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                              htmlFor="respectWorkingHours"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              احترام به ساعات کاری
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 space-x-reverse pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        type="submit"
                        disabled={updateBookingSettingsMutation.isPending}
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6"
                      >
                        {updateBookingSettingsMutation.isPending ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 ml-2" />
                            ذخیره تنظیمات رزرو
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditingBookingSettings(false)}
                      >
                        انصراف
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Booking Policies Display */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200/50 dark:border-green-800/50">
                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center">
                          <svg
                            className="w-6 h-6 ml-2 text-green-600 dark:text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          سیاست‌های رزرو
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              سیاست لغو:
                            </span>
                            <span className="text-sm font-medium text-green-900 dark:text-green-100">
                              {bookingPolicyData.cancellationPolicy === "24h" &&
                                "24 ساعت قبل"}
                              {bookingPolicyData.cancellationPolicy === "12h" &&
                                "12 ساعت قبل"}
                              {bookingPolicyData.cancellationPolicy === "6h" &&
                                "6 ساعت قبل"}
                              {bookingPolicyData.cancellationPolicy === "2h" &&
                                "2 ساعت قبل"}
                              {bookingPolicyData.cancellationPolicy === "1h" &&
                                "1 ساعت قبل"}
                              {bookingPolicyData.cancellationPolicy ===
                                "no-cancellation" && "بدون امکان لغو"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              حداکثر پیش‌رزرو:
                            </span>
                            <span className="text-sm font-medium text-green-900 dark:text-green-100">
                              {bookingPolicyData.advanceBookingDays} روز
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              رزرو همان روز:
                            </span>
                            <Badge
                              variant={
                                bookingPolicyData.sameDayBooking
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {bookingPolicyData.sameDayBooking
                                ? "فعال"
                                : "غیرفعال"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Time Management Display */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                          <svg
                            className="w-6 h-6 ml-2 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          مدیریت زمان
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                {timeManagementData.bufferBetweenSlots}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                دقیقه فاصله
                              </div>
                            </div>
                            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                {timeManagementData.maxBookingsPerSlot}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                رزرو در بازه
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              حداکثر بازه روزانه:
                            </span>
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              {timeManagementData.maxSlotsPerDay}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              استراحت ناهار:
                            </span>
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              {timeManagementData.includeLunchBreak
                                ? `${timeManagementData.lunchBreakStart} - ${timeManagementData.lunchBreakEnd}`
                                : "غیرفعال"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              ساعات شلوغی:
                            </span>
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              {timeManagementData.optimizeForPeakHours
                                ? `${timeManagementData.peakHoursStart} - ${timeManagementData.peakHoursEnd}`
                                : "غیرفعال"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Notifications Settings */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <Card className="shadow-sm border-0 bg-white dark:bg-gray-800">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <svg
                        className="w-6 h-6 text-orange-600 dark:text-orange-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-5-5V9a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 01-6 0v-1m6 0H9"
                        />
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        تنظیمات اعلان‌ها
                      </CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        پیامک، تلگرام و یادآوری‌ها
                      </p>
                    </div>
                  </div>
                  {!isEditingNotifications && (
                    <Button
                      onClick={() => setIsEditingNotifications(true)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      ویرایش
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isEditingNotifications ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        زمان یادآوری (دقیقه قبل از موعد)
                      </label>
                      <Input
                        type="number"
                        min="5"
                        max="1440"
                        value={notificationData.reminderTime}
                        onChange={(e) =>
                          setNotificationData({
                            ...notificationData,
                            reminderTime: parseInt(e.target.value) || 60,
                          })
                        }
                        className="h-11 max-w-xs"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <input
                          type="checkbox"
                          id="smsEnabled"
                          checked={notificationData.smsEnabled}
                          onChange={(e) =>
                            setNotificationData({
                              ...notificationData,
                              smsEnabled: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <label
                          htmlFor="smsEnabled"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          ارسال پیامک
                        </label>
                      </div>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <input
                          type="checkbox"
                          id="telegramEnabled"
                          checked={notificationData.telegramEnabled}
                          onChange={(e) =>
                            setNotificationData({
                              ...notificationData,
                              telegramEnabled: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <label
                          htmlFor="telegramEnabled"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          ارسال از طریق تلگرام
                        </label>
                      </div>
                    </div>
                    {notificationData.telegramEnabled && (
                      <div className="space-y-4 pr-7">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            توکن ربات تلگرام
                          </label>
                          <Input
                            type="text"
                            value={notificationData.telegramBotToken}
                            onChange={(e) =>
                              setNotificationData({
                                ...notificationData,
                                telegramBotToken: e.target.value,
                              })
                            }
                            placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                            className="h-11"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            شناسه چت تلگرام
                          </label>
                          <Input
                            type="text"
                            value={notificationData.telegramChatId}
                            onChange={(e) =>
                              setNotificationData({
                                ...notificationData,
                                telegramChatId: e.target.value,
                              })
                            }
                            placeholder="@your_channel یا 123456789"
                            className="h-11"
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex space-x-4 space-x-reverse">
                      <Button
                        type="button"
                        onClick={handleNotificationSubmit}
                        loading={updateNotificationMutation.isPending}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        ذخیره تنظیمات
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditingNotifications(false)}
                      >
                        انصراف
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          زمان یادآوری
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {notificationData.reminderTime} دقیقه قبل
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          پیامک
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {notificationData.smsEnabled ? "فعال" : "غیرفعال"}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          تلگرام
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {notificationData.telegramEnabled
                            ? "فعال"
                            : "غیرفعال"}
                        </p>
                      </div>
                    </div>
                    {notificationData.telegramEnabled && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                          تنظیمات تلگرام
                        </h4>
                        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          <p>
                            <span className="font-medium">توکن ربات:</span>{" "}
                            {notificationData.telegramBotToken
                              ? "تنظیم شده"
                              : "تنظیم نشده"}
                          </p>
                          <p>
                            <span className="font-medium">شناسه چت:</span>{" "}
                            {notificationData.telegramChatId || "تنظیم نشده"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Widget Settings */}
        {activeTab === "widget" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 dark:from-gray-800 dark:via-purple-900/10 dark:to-indigo-900/10 backdrop-blur-sm">
              <CardHeader className="border-b border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg
                        className="w-8 h-8 text-white"
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
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-900 to-indigo-900 dark:from-purple-100 dark:to-indigo-100 bg-clip-text text-transparent">
                        تنظیمات ویجت
                      </CardTitle>
                      <p className="text-purple-700 dark:text-purple-300 mt-1 font-medium">
                        شخصی‌سازی ظاهر و عملکرد ویجت رزرو
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <WidgetConfiguration />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Subscription Settings */}
        {activeTab === "subscription" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 dark:from-gray-800 dark:via-purple-900/10 dark:to-blue-900/10 backdrop-blur-sm">
              <CardHeader className="border-b border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-900 to-blue-900 dark:from-purple-100 dark:to-blue-100 bg-clip-text text-transparent">
                      اطلاعات اشتراک
                    </CardTitle>
                    <p className="text-purple-700 dark:text-purple-300 mt-1 font-medium">
                      وضعیت پلن و اشتراک فعلی
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loadingSubscription ||
                loadingUsage ||
                loadingInvoices ||
                loadingPlans ? (
                  <div className="flex items-center justify-center h-64">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200/50 dark:border-purple-800/50">
                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
                          پلن فعلی
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              نام پلن:
                            </span>
                            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                              {subscription?.data?.data?.plan?.name ||
                                subscription?.data?.data?.plan?.nameEn ||
                                "بدون پلن"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              وضعیت:
                            </span>
                            <Badge
                              variant="default"
                              className={
                                subscription?.data?.data?.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800"
                                  : subscription?.data?.data?.status === "TRIAL"
                                    ? "bg-blue-100 text-blue-800"
                                    : subscription?.data?.data?.status ===
                                        "CANCELLED"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {subscription?.data?.data?.status === "ACTIVE"
                                ? "فعال"
                                : subscription?.data?.data?.status === "TRIAL"
                                  ? "آزمایشی"
                                  : subscription?.data?.data?.status ===
                                      "CANCELLED"
                                    ? "لغو شده"
                                    : subscription?.data?.data?.status ===
                                        "PAST_DUE"
                                      ? "معوقه"
                                      : subscription?.data?.data?.status ===
                                          "SUSPENDED"
                                        ? "تعلیق"
                                        : "نامشخص"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {subscription?.data?.data?.status === "TRIAL"
                                ? "پایان آزمایشی:"
                                : "تاریخ تجدید:"}
                            </span>
                            <span className="text-sm font-medium">
                              {subscription?.data?.data?.trialEndsAt
                                ? new Date(
                                    subscription.data.data.trialEndsAt
                                  ).toLocaleDateString("fa-IR")
                                : subscription?.data?.data?.currentPeriodEnd
                                  ? new Date(
                                      subscription.data.data.currentPeriodEnd
                                    ).toLocaleDateString("fa-IR")
                                  : "تعیین نشده"}
                            </span>
                          </div>
                          {subscription?.data?.data?.billingCycle && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                چرخه صورتحساب:
                              </span>
                              <span className="text-sm font-medium">
                                {subscription.data.data.billingCycle ===
                                "MONTHLY"
                                  ? "ماهانه"
                                  : "سالانه"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                          آمار استفاده
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600 dark:text-gray-400">
                                رزروهای ماهانه
                              </span>
                              <span className="font-medium">
                                {subscription?.data?.data?.usage
                                  ?.bookingsThisMonth || 0}{" "}
                                /{" "}
                                {subscription?.data?.data?.plan
                                  ?.bookingsLimit || "نامحدود"}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                                style={{
                                  width: subscription?.data?.data?.plan
                                    ?.bookingsLimit
                                    ? `${Math.min(((subscription?.data?.data?.usage?.bookingsThisMonth || 0) / subscription.data.data.plan.bookingsLimit) * 100, 100)}%`
                                    : "0%",
                                }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600 dark:text-gray-400">
                                پیامک‌های ماهانه
                              </span>
                              <span className="font-medium">
                                {subscription?.data?.data?.usage?.smsUsed || 0}{" "}
                                /{" "}
                                {subscription?.data?.data?.plan?.smsLimit ||
                                  "نامحدود"}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                                style={{
                                  width: subscription?.data?.data?.plan
                                    ?.smsLimit
                                    ? `${Math.min(((subscription?.data?.data?.usage?.smsUsed || 0) / subscription.data.data.plan.smsLimit) * 100, 100)}%`
                                    : "0%",
                                }}
                              ></div>
                            </div>
                          </div>
                          {subscription?.data?.data?.usage
                            ?.revenueThisMonth && (
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600 dark:text-gray-400">
                                  درآمد ماهانه
                                </span>
                                <span className="font-medium">
                                  {Number(
                                    subscription.data.data.usage
                                      .revenueThisMonth
                                  ).toLocaleString()}{" "}
                                  تومان
                                </span>
                              </div>
                              {subscription?.data?.data?.usage?.commissionOwed >
                                0 && (
                                <div className="text-xs text-amber-600 dark:text-amber-400">
                                  کمیسیون:{" "}
                                  {Number(
                                    subscription.data.data.usage.commissionOwed
                                  ).toLocaleString()}{" "}
                                  تومان
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200/50 dark:border-amber-800/50">
                        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-4">
                          اطلاعات صورتحساب
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              هزینه ماهانه:
                            </span>
                            <span className="text-lg font-bold text-amber-900 dark:text-amber-100">
                              {subscription?.data?.data?.plan?.monthlyFee
                                ? `${Number(subscription.data.data.plan.monthlyFee || 0).toLocaleString()} تومان`
                                : "رایگان"}
                            </span>
                          </div>
                          {subscription?.data?.data?.plan?.yearlyFee && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                هزینه سالانه:
                              </span>
                              <span className="text-sm font-medium">
                                {Number(
                                  subscription?.data?.data?.plan?.yearlyFee || 0
                                ).toLocaleString()}{" "}
                                تومان
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              آخرین صورتحساب:
                            </span>
                            <span className="text-sm font-medium">
                              {invoices?.data?.data?.[0]
                                ? new Date(
                                    invoices.data.data[0].createdAt
                                  ).toLocaleDateString("fa-IR")
                                : "بدون صورتحساب"}
                            </span>
                          </div>
                          {subscription?.data?.data?.plan?.setupFee > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                هزینه راه‌اندازی:
                              </span>
                              <span className="text-sm font-medium">
                                {Number(
                                  subscription?.data?.data?.plan?.setupFee
                                ).toLocaleString()}{" "}
                                تومان
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200/50 dark:border-green-800/50">
                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                          اقدامات
                        </h3>
                        <div className="space-y-3">
                          {subscription?.data?.data?.status !== "CANCELLED" && (
                            <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg">
                              <Award className="w-4 h-4 ml-2" />
                              ارتقاء پلن
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            className="w-full border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20"
                            onClick={() => navigate("/dashboard/analytics")}
                          >
                            <TrendingUp className="w-4 h-4 ml-2" />
                            مشاهده گزارشات
                          </Button>
                          {invoices?.data?.data?.length > 0 && (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => navigate("/dashboard/invoices")}
                            >
                              مشاهده صورتحساب‌ها
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!loadingPlans && plans?.data?.data?.length > 0 && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex items-start space-x-4 space-x-reverse">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          سایر پلن‌های موجود
                        </h4>
                        <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed mb-4">
                          با ارتقاء به پلن‌های بالاتر، از امکانات پیشرفته‌تری
                          مانند رزرو نامحدود، گزارشات تفصیلی، پشتیبانی
                          اولویت‌دار و درگاه‌های پرداخت متنوع‌تر بهره‌مند شوید.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          {plans?.data?.data?.slice(0, 4).map((plan: any) => (
                            <div
                              key={plan.id}
                              className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800"
                            >
                              <div className="font-medium text-blue-900 dark:text-blue-100">
                                {plan.name}
                              </div>
                              <div className="text-sm text-blue-700 dark:text-blue-300">
                                {plan.monthlyFee
                                  ? `${Number(plan.monthlyFee).toLocaleString()} تومان/ماه`
                                  : "رایگان"}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {plan.bookingsLimit
                                  ? `${plan.bookingsLimit} رزرو`
                                  : "رزرو نامحدود"}{" "}
                                •
                                {plan.smsLimit
                                  ? ` ${plan.smsLimit} پیامک`
                                  : " پیامک نامحدود"}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                            onClick={() => navigate("/pricing")}
                          >
                            مقایسه پلن‌ها
                          </Button>
                          {subscription?.data?.data?.status === "TRIAL" && (
                            <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                              دوره آزمایشی فعال است!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Danger Zone */}
        {activeTab === "danger" && (
          <div className="space-y-6">
            <Card className="shadow-sm border-0 bg-white dark:bg-gray-800">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                    <svg
                      className="w-6 h-6 text-red-600 dark:text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl text-red-600 dark:text-red-400">
                      منطقه خطر
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      عملیات غیرقابل بازگشت
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="border border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-900/10">
                    <div className="flex items-start space-x-4 space-x-reverse">
                      <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                        <svg
                          className="w-6 h-6 text-red-600 dark:text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-red-900 dark:text-red-100">
                          غیرفعال کردن کسب‌وکار
                        </h4>
                        <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                          با غیرفعال کردن کسب‌وکار، ویجت رزرو غیرفعال خواهد شد و
                          مشتریان قادر به رزرو نخواهند بود.
                        </p>
                        <Button
                          variant="outline"
                          className="mt-3 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          غیرفعال کردن کسب‌وکار
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-900/10">
                    <div className="flex items-start space-x-4 space-x-reverse">
                      <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                        <svg
                          className="w-6 h-6 text-red-600 dark:text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-red-900 dark:text-red-100">
                          حذف کسب‌وکار
                        </h4>
                        <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                          این عملیات غیرقابل بازگشت است. تمام داده‌ها، رزروها و
                          تنظیمات حذف خواهند شد.
                        </p>
                        <Button
                          variant="outline"
                          className="mt-3 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          حذف کسب‌وکار
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;

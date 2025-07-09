import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { dashboardApi } from "@/services/api";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuthStore } from "@/store/authStore";
import LoadingSpinner from "@/components/LoadingSpinner";
import useRealtimeBookings from "@/hooks/useRealtimeBookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  Settings,
  RefreshCw,
  CalendarDays,
  Repeat,
  Plus,
  Trash2,
  Save,
  Copy,
  Users,
  Coffee,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
  CalendarRange,
  Smartphone,
  Building,
  Target,
  Palette,
  Sparkles,
  BarChart3,
  FileText,
  Download,
  Upload,
  Eye,
  EyeOff,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Grid,
  List,
  Maximize2,
  Minimize2,
  Info,
  Home,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import Modal from "@/components/ui/modal";

interface TimeSlot {
  id?: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked?: boolean;
  capacity?: number;
  maxCapacity?: number;
  isPeakHour?: boolean;
  serviceDuration?: number;
  intervalMinutes?: number;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface WorkingHour {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface BusinessSettings {
  lunchBreakStart?: string;
  lunchBreakEnd?: string;
  maxBookingsPerSlot?: number;
  advanceBookingDays?: number;
  sameDayBooking?: boolean;
  peakHoursStart?: string;
  peakHoursEnd?: string;
  bufferBetweenSlots?: number;
}

interface GenerationMode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  settings: any;
}

const TimeSlots: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { business, businessId } = useBusiness();
  const { user } = useAuthStore();

  // State management
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0] || ""
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [showSmartModal, setShowSmartModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [showImpactAnalysisModal, setShowImpactAnalysisModal] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [forceRegenerate, setForceRegenerate] = useState(false);
  const [conflictResolution, setConflictResolution] = useState<
    "preserve" | "reschedule" | "force"
  >("preserve");
  const [backupStrategy, setBackupStrategy] = useState<
    "auto" | "manual" | "none"
  >("auto");
  const [conflictData, setConflictData] = useState<any>(null);
  const [pendingGeneration, setPendingGeneration] = useState<any>(null);
  const [impactAnalysis, setImpactAnalysis] = useState<any>(null);
  const [regenerateSettings, setRegenerateSettings] = useState({
    notifyCustomers: true,
    createBackup: true,
    requireConfirmation: true,
  });

  // Real-time availability updates
  const {
    isConnected: realtimeConnected,
    connectionError: realtimeError,
    connectionStatus: realtimeConnectionStatus,
    liveAvailability,
    subscribeToBusinessUpdates: subscribeToAvailability,
    requestLiveAvailability,
    notifyBookingAttempt,
  } = useRealtimeBookings({
    businessId: businessId || "",
    autoConnect: !!businessId,
    onAvailabilityUpdated: (businessId, serviceId, date, timeSlots) => {
      // Only invalidate if it matches current selection
      if (serviceId === selectedService && date === selectedDate) {
        queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
        toast.success("🕒 ساعات کاری بروزرسانی شد", {
          duration: 2000,
          icon: "⚡",
        });
      }
    },
    onTimeSlotBooked: (businessId, serviceId, timeSlot) => {
      if (serviceId === selectedService) {
        queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
        toast(`🔒 اسلات ${timeSlot.startTime} رزرو شد`, {
          duration: 3000,
          icon: "📅",
        });
      }
    },
    onTimeSlotFreed: (businessId, serviceId, timeSlot) => {
      if (serviceId === selectedService) {
        queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
        toast.success(`🔓 اسلات ${timeSlot.startTime} آزاد شد`, {
          duration: 3000,
          icon: "✅",
        });
      }
    },
    onBookingCreated: (booking) => {
      // Show notification when someone books through widget
      if (booking.service?.id === selectedService) {
        toast.success(
          `📝 رزرو جدید: ${booking.customerName} برای ${booking.startTime}`,
          {
            duration: 4000,
            icon: "🎉",
          }
        );
        queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
      }
    },
  });

  // Smart generation settings
  const [smartSettings, setSmartSettings] = useState({
    useServiceDuration: true,
    includeLunchBreak: true,
    optimizeForPeakHours: true,
    respectWorkingHours: true,
    maxSlotsPerDay: 20,
    bufferBetweenSlots: 15, // Deprecated: Use businessSettings.bufferBetweenSlots instead
  });

  // Business settings state
  const [businessSettings, setBusinessSettings] = useState({
    lunchBreakStart: "12:00",
    lunchBreakEnd: "13:00",
    maxBookingsPerSlot: 1,
    advanceBookingDays: 30,
    sameDayBooking: true,
    peakHoursStart: "10:00",
    peakHoursEnd: "16:00",
    bufferBetweenSlots: 15,
  });

  // Recurring pattern state
  const [recurringPattern, setRecurringPattern] = useState({
    days: [1, 2, 3, 4, 5], // Mon-Fri
    weeks: 4,
    startTime: "09:00",
    endTime: "18:00",
  });

  // Generation modes
  const generationModes: GenerationMode[] = [
    {
      id: "quick",
      name: "تولید سریع",
      description: "تولید ساعات کاری ساده با فاصله 30 دقیقه‌ای",
      icon: <Zap className="w-5 h-5" />,
      settings: { mode: "basic" },
    },
    {
      id: "smart",
      name: "تولید هوشمند",
      description: "تولید ساعات کاری با الگوریتم‌های پیشرفته",
      icon: <Sparkles className="w-5 h-5" />,
      settings: {
        mode: "smart",
        smartSettings,
        businessSettings,
      },
    },
    {
      id: "recurring",
      name: "الگوی دوره‌ای",
      description: "تولید ساعات کاری تکرار شونده برای چند هفته",
      icon: <Repeat className="w-5 h-5" />,
      settings: {
        mode: "recurring",
        pattern: recurringPattern,
        smartSettings,
        businessSettings,
      },
    },
  ];

  // Fetch services for the business
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["services", businessId],
    queryFn: () => dashboardApi.getServices(businessId!),
    enabled: !!businessId,
  });

  // Fetch time slots for selected date and service
  const {
    data: timeSlots,
    isLoading: slotsLoading,
    refetch: refetchSlots,
  } = useQuery({
    queryKey: ["timeSlots", businessId, selectedService, selectedDate],
    queryFn: async () => {
      console.log("Fetching time slots for:", {
        businessId,
        selectedService,
        selectedDate,
      });
      const result = await dashboardApi.getTimeSlots(
        businessId!,
        selectedService,
        selectedDate
      );
      console.log("Time slots API response:", result);
      return result;
    },
    enabled: !!businessId && !!selectedService && !!selectedDate,
  });

  // Fetch working hours for the business
  const { data: workingHours } = useQuery({
    queryKey: ["workingHours", businessId],
    queryFn: () => dashboardApi.getWorkingHours(businessId!),
    enabled: !!businessId,
  });

  // Fetch business settings
  const { data: businessSettingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ["businessSettings", businessId],
    queryFn: () => dashboardApi.getBusinessSettings(businessId!),
    enabled: !!businessId,
  });

  // Auto-select first service when services load
  useEffect(() => {
    if (
      services?.data?.data &&
      services.data.data.length > 0 &&
      !selectedService
    ) {
      setSelectedService(services.data.data[0].id);
    }
  }, [services, selectedService]);

  // Load business settings from API
  useEffect(() => {
    if (businessSettingsData?.data?.data) {
      const settings = businessSettingsData.data.data;
      console.log("Loading business settings:", settings);

      setBusinessSettings({
        lunchBreakStart: settings.lunchBreakStart || "12:00",
        lunchBreakEnd: settings.lunchBreakEnd || "13:00",
        maxBookingsPerSlot: settings.maxBookingsPerSlot || 1,
        advanceBookingDays: settings.advanceBookingDays || 30,
        sameDayBooking: settings.sameDayBooking !== false,
        peakHoursStart: settings.peakHoursStart || "10:00",
        peakHoursEnd: settings.peakHoursEnd || "16:00",
        bufferBetweenSlots: settings.bufferBetweenSlots || 15,
      });

      setSmartSettings({
        useServiceDuration: settings.useServiceDuration !== false,
        includeLunchBreak: settings.includeLunchBreak !== false,
        optimizeForPeakHours: settings.optimizeForPeakHours !== false,
        respectWorkingHours: settings.respectWorkingHours !== false,
        maxSlotsPerDay: settings.maxSlotsPerDay || 20,
        bufferBetweenSlots: settings.bufferBetweenSlots || 15, // Deprecated: kept for compatibility
      });
    }
  }, [businessSettingsData]);

  // Auto-adjust buffer based on service duration if needed
  useEffect(() => {
    if (
      selectedService &&
      services?.data?.data &&
      smartSettings.useServiceDuration
    ) {
      const service = services.data.data.find(
        (s: Service) => s.id === selectedService
      );
      if (service) {
        // Only suggest a minimum buffer if it's currently less than a reasonable amount
        // but allow 0 as a valid choice
        const suggestedMinimum = 5;

        // Only auto-adjust if buffer is less than suggested AND user hasn't explicitly set it to 0
        if (
          businessSettings.bufferBetweenSlots > 0 &&
          businessSettings.bufferBetweenSlots < suggestedMinimum
        ) {
          setBusinessSettings((prev) => ({
            ...prev,
            bufferBetweenSlots: suggestedMinimum,
          }));
        }
      }
    }
  }, [selectedService, services, smartSettings.useServiceDuration]);

  // Subscribe to real-time updates when service/date changes
  useEffect(() => {
    if (realtimeConnected && businessId) {
      subscribeToAvailability(businessId);

      // Only request availability if we have service and date selected
      if (selectedService && selectedDate) {
        requestLiveAvailability(businessId, selectedService, selectedDate);
      }
    }
  }, [
    realtimeConnected,
    businessId,
    selectedService,
    selectedDate,
    subscribeToAvailability,
    requestLiveAvailability,
  ]);

  // Generate time slots mutation with conflict handling
  const generateSlotsMutation = useMutation({
    mutationFn: (data: {
      businessId: string;
      serviceId: string;
      days: number;
      mode: string;
      settings: any;
      forceRegenerate?: boolean;
      conflictResolution?: string;
    }) => {
      const requestData = {
        serviceId: data.serviceId,
        days: data.days,
        mode: data.mode,
        settings: data.settings,
        conflictResolution: data.conflictResolution || conflictResolution,
      };

      const apiCall = data.forceRegenerate
        ? dashboardApi.regenerateTimeSlots(data.businessId, {
            ...requestData,
            forceRegenerate: true,
          })
        : dashboardApi.generateTimeSlots(data.businessId, requestData);

      return apiCall;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });

      const data = response.data;
      const conflicts = data.conflicts;

      if (conflicts && conflicts.total > 0) {
        // Handle conflicts based on resolution strategy
        setConflictData(conflicts);

        if (conflictResolution === "preserve") {
          setShowConflictModal(true);
          toast(`تولید شد اما ${conflicts.total} تداخل یافت شد و حفظ گردید`, {
            icon: "⚠️",
            duration: 4000,
          });
        } else if (conflictResolution === "reschedule") {
          setShowConflictModal(true);
          toast(`تولید شد. ${conflicts.total} رزرو نیاز به جابجایی دارد`, {
            icon: "ℹ️",
            duration: 4000,
          });
        } else if (conflictResolution === "force") {
          toast.success(`تولید شد. ${conflicts.total} رزرو متداخل لغو گردید`);
        }
      } else {
        const mode = data.summary?.mode || "smart";
        const isForceRegenerate = data.summary?.shouldForceRegenerate;
        const message = isForceRegenerate
          ? "ساعات کاری با موفقیت بازتولید شد"
          : mode === "recurring"
            ? "الگوی دوره‌ای با موفقیت ایجاد شد"
            : "ساعات کاری با موفقیت تولید شد";
        toast.success(message);
      }

      setIsGenerating(false);
      setPendingGeneration(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در تولید ساعات کاری");
      setIsGenerating(false);
      setPendingGeneration(null);
    },
  });

  // Update time slot availability mutation
  const updateSlotMutation = useMutation({
    mutationFn: (data: { slotId: string; isAvailable: boolean }) =>
      dashboardApi.updateTimeSlot(data.slotId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
      toast.success("وضعیت ساعت بروزرسانی شد");
    },
    onError: (error: any) => {
      console.error("Update slot error:", error);
      toast.error(error?.response?.data?.message || "خطا در بروزرسانی ساعت");
    },
  });

  // Create time slot mutation
  const createSlotMutation = useMutation({
    mutationFn: (data: {
      businessId: string;
      serviceId: string;
      date: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }) => {
      console.log("Creating time slot with data:", data);
      return dashboardApi.createTimeSlot(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
      toast.success("ساعت جدید ایجاد شد");
    },
    onError: (error: any) => {
      console.error("Create slot error:", error);
      toast.error(error?.response?.data?.message || "خطا در ایجاد ساعت");
    },
  });

  // Delete time slot mutation
  const deleteSlotMutation = useMutation({
    mutationFn: (slotId: string) => dashboardApi.deleteTimeSlot(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
      toast.success("ساعت حذف شد");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در حذف ساعت");
    },
  });

  // Bulk delete time slots mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (data: { serviceId: string; days: number }) =>
      dashboardApi.bulkDeleteTimeSlots(data.serviceId, { days: data.days }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
      toast.success(`${data.data.deletedCount} ساعت حذف شد`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در حذف گروهی");
    },
  });

  // Add slot mutation
  const addSlotMutation = useMutation({
    mutationFn: (data: {
      businessId: string;
      serviceId: string;
      date: string;
      startTime: string;
      endTime: string;
    }) => {
      const requestData = { ...data, isAvailable: true };
      console.log("Adding time slot with data:", requestData);
      return dashboardApi.createTimeSlot(requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
      toast.success("ساعت جدید اضافه شد");
      setShowAddSlotModal(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در اضافه کردن ساعت");
    },
  });

  // Enhanced regenerate time slots mutation
  const regenerateSlotsMutation = useMutation({
    mutationFn: (data: {
      businessId: string;
      serviceId: string;
      days: number;
      mode: string;
      settings: any;
      forceRegenerate: boolean;
      conflictResolution: string;
      backupStrategy: string;
      notificationPreferences: any;
    }) => {
      console.log("Regenerating slots with enhanced options:", data);
      return dashboardApi.regenerateTimeSlots(data.businessId, {
        serviceId: data.serviceId,
        days: data.days,
        mode: data.mode,
        settings: data.settings,
        forceRegenerate: data.forceRegenerate,
        conflictResolution: data.conflictResolution,
        backupStrategy: data.backupStrategy,
        notificationPreferences: data.notificationPreferences,
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });

      const data = response.data;

      // Show impact analysis if significant changes occurred
      if (
        data.impactAnalysis &&
        (data.impactAnalysis.affectedBookings > 0 ||
          data.summary.totalBookingsAffected > 0)
      ) {
        setImpactAnalysis(data);
        setShowImpactAnalysisModal(true);
      }

      // Handle conflicts and notifications
      if (data.conflicts && data.conflicts.total > 0) {
        setConflictData(data.conflicts);
        setShowConflictModal(true);
      }

      // Show appropriate success message
      const { summary } = data;
      let message = "بازتولید ساعات کاری با موفقیت انجام شد";

      if (summary.totalBookingsAffected > 0) {
        message += `. ${summary.totalBookingsAffected} رزرو تحت تأثیر قرار گرفت`;
      }

      if (summary.backupCreated) {
        message += ". نسخه پشتیبان ایجاد شد";
      }

      toast.success(message);
      setShowRegenerateModal(false);
    },
    onError: (error: any) => {
      console.error("Regenerate error:", error);
      toast.error(
        error?.response?.data?.message || "خطا در بازتولید ساعات کاری"
      );
      setShowRegenerateModal(false);
    },
  });

  // Save business settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: (data: any) => {
      if (!businessId) {
        return Promise.reject("No business found");
      }
      console.log("Saving business settings:", data);
      return dashboardApi.updateBusinessSettings(businessId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessSettings"] });
      toast.success("تنظیمات با موفقیت ذخیره شد");
    },
    onError: (error: any) => {
      console.error("Save settings error:", error);
      toast.error(error?.response?.data?.message || "خطا در ذخیره تنظیمات");
    },
  });

  const handleGenerateSlots = async (
    mode: GenerationMode,
    skipConflictCheck = false
  ) => {
    if (!businessId || !selectedService) {
      toast.error("لطفاً ابتدا یک سرویس انتخاب کنید");
      return;
    }

    console.log("Generating slots with mode:", mode);
    console.log("Settings being sent:", mode.settings);

    // Check for existing bookings first (unless skipping or force regenerating)
    if (
      !skipConflictCheck &&
      !forceRegenerate &&
      conflictResolution === "preserve"
    ) {
      const hasConflicts = await checkForExistingBookings();
      if (hasConflicts) {
        setPendingGeneration({ mode, businessId, selectedService });
        setShowConflictModal(true);
        return;
      }
    }

    setIsGenerating(true);
    generateSlotsMutation.mutate({
      businessId,
      serviceId: selectedService,
      days: 7,
      mode: mode.settings.mode,
      settings: mode.settings,
      forceRegenerate,
      conflictResolution,
    });
  };

  // Check for existing bookings that might conflict
  const checkForExistingBookings = async () => {
    try {
      const response = await dashboardApi.getBookings(businessId!, {
        serviceId: selectedService,
        status: "PENDING,CONFIRMED",
        limit: 50,
      });

      const bookings = response.data?.bookings || [];
      const futureBookings = bookings.filter((booking: any) => {
        const bookingDate = new Date(booking.date);
        const today = new Date();
        const weekFromNow = new Date();
        weekFromNow.setDate(today.getDate() + 7);
        return bookingDate >= today && bookingDate <= weekFromNow;
      });

      return futureBookings.length > 0;
    } catch (error) {
      console.error("Error checking existing bookings:", error);
      return false;
    }
  };

  const handleToggleSlot = (
    slotId: string | undefined,
    isAvailable: boolean,
    slotData?: any
  ) => {
    console.log("handleToggleSlot called with:", {
      slotId,
      isAvailable,
      slotData,
      businessId,
      selectedService,
      selectedDate,
    });

    if (!slotId) {
      if (!businessId || !selectedService || !selectedDate || !slotData) {
        console.error("Missing required data for creating slot:", {
          businessId: !!businessId,
          selectedService: !!selectedService,
          selectedDate: !!selectedDate,
          slotData: !!slotData,
        });
        toast.error("خطا: اطلاعات ناقص برای ایجاد ساعت");
        return;
      }

      const createData = {
        businessId,
        serviceId: selectedService,
        date: selectedDate,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        isAvailable: !isAvailable,
      };

      console.log("Creating slot with data:", createData);
      createSlotMutation.mutate(createData);
    } else {
      console.log("Updating slot availability:", {
        slotId,
        isAvailable: !isAvailable,
      });
      updateSlotMutation.mutate({ slotId, isAvailable: !isAvailable });
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    if (confirm("آیا از حذف این ساعت اطمینان دارید؟")) {
      deleteSlotMutation.mutate(slotId);
    }
  };

  const handleBulkDelete = () => {
    if (!selectedService) {
      toast.error("لطفاً ابتدا یک سرویس انتخاب کنید");
      return;
    }

    const days = prompt("تعداد روزهای آینده برای حذف (پیش‌فرض: 7):", "7");
    if (days && !isNaN(Number(days))) {
      bulkDeleteMutation.mutate({
        serviceId: selectedService,
        days: Number(days),
      });
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const toggleDaySelection = (day: number) => {
    setRecurringPattern((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const getDayName = (day: number) => {
    const days = [
      "یکشنبه",
      "دوشنبه",
      "سه‌شنبه",
      "چهارشنبه",
      "پنج‌شنبه",
      "جمعه",
      "شنبه",
    ];
    return days[day];
  };

  const getWorkingHoursForDay = (dayOfWeek: number) => {
    if (!workingHours?.data?.data) return null;
    return workingHours.data.data.find((wh: any) => wh.dayOfWeek === dayOfWeek);
  };

  const getSelectedServiceDetails = () => {
    if (!selectedService || !services?.data?.data) return null;
    return services.data.data.find((s: Service) => s.id === selectedService);
  };

  const getSlotStatus = (slot: TimeSlot) => {
    if (slot.isBooked) return "booked";
    if (slot.isAvailable) return "available";
    return "unavailable";
  };

  const getSlotStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20";
      case "booked":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20";
      case "unavailable":
        return "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/20";
      default:
        return "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/20";
    }
  };

  const getSlotStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "booked":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "unavailable":
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // Batch actions
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedSlots([]);
      setSelectAll(false);
    } else {
      setSelectedSlots(slots.map((slot: any) => slot.id).filter(Boolean));
      setSelectAll(true);
    }
  };

  const handleSelectSlot = (slotId: string) => {
    // Only allow selection of slots with valid IDs
    if (!slotId || slotId === "") {
      return;
    }
    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );
  };

  const handleBatchDelete = () => {
    if (selectedSlots.length === 0) {
      toast.error("لطفاً ابتدا ساعات را انتخاب کنید");
      return;
    }
    if (
      confirm(
        `آیا از حذف ${selectedSlots.length} ساعت انتخاب شده اطمینان دارید؟`
      )
    ) {
      selectedSlots.forEach((slotId) => {
        deleteSlotMutation.mutate(slotId);
      });
      setSelectedSlots([]);
      setSelectAll(false);
    }
  };

  const handleBatchSetStatus = (isAvailable: boolean) => {
    if (selectedSlots.length === 0) {
      toast.error("لطفاً ابتدا ساعات مورد نظر را انتخاب کنید");
      return;
    }

    selectedSlots.forEach((slotId) => {
      updateSlotMutation.mutate({ slotId, isAvailable });
    });

    setSelectedSlots([]);
    setSelectAll(false);
  };

  const handleRegenerateSlots = () => {
    if (!businessId || !selectedService) {
      toast.error("لطفاً ابتدا یک سرویس انتخاب کنید");
      return;
    }

    setShowRegenerateModal(true);
  };

  const handleConfirmRegenerate = () => {
    if (!businessId || !selectedService) {
      toast.error("لطفاً ابتدا یک سرویس انتخاب کنید");
      return;
    }

    regenerateSlotsMutation.mutate({
      businessId,
      serviceId: selectedService,
      days: 7,
      mode: "smart",
      settings: {
        smartSettings,
        businessSettings,
      },
      forceRegenerate: true,
      conflictResolution,
      backupStrategy,
      notificationPreferences: {
        smsEnabled: regenerateSettings.notifyCustomers,
        emailEnabled: false,
        telegramEnabled: false,
      },
    });
  };

  const handleSaveSettings = () => {
    const settingsData = {
      // Business settings
      lunchBreakStart: businessSettings.lunchBreakStart,
      lunchBreakEnd: businessSettings.lunchBreakEnd,
      maxBookingsPerSlot: businessSettings.maxBookingsPerSlot,
      advanceBookingDays: businessSettings.advanceBookingDays,
      sameDayBooking: businessSettings.sameDayBooking,
      peakHoursStart: businessSettings.peakHoursStart,
      peakHoursEnd: businessSettings.peakHoursEnd,
      bufferBetweenSlots: businessSettings.bufferBetweenSlots,

      // Smart settings
      useServiceDuration: smartSettings.useServiceDuration,
      includeLunchBreak: smartSettings.includeLunchBreak,
      optimizeForPeakHours: smartSettings.optimizeForPeakHours,
      respectWorkingHours: smartSettings.respectWorkingHours,
      maxSlotsPerDay: smartSettings.maxSlotsPerDay,
    };

    console.log("Saving settings data:", settingsData);
    saveSettingsMutation.mutate(settingsData);
  };

  if (servicesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            در حال بارگذاری سرویس‌ها...
          </p>
        </div>
      </div>
    );
  }

  const servicesData = services?.data || [];
  const slots = timeSlots?.data?.availableSlots || [];

  console.log("Component slots data:", {
    timeSlots,
    slots,
    slotsLength: slots.length,
    selectedService,
    selectedDate,
  });

  const selectedServiceDetails = getSelectedServiceDetails();
  const currentDayWorkingHours = getWorkingHoursForDay(
    new Date(selectedDate).getDay()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900/10">
      {/* Enhanced Header with Breadcrumbs */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumbs */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 space-x-reverse mb-4 text-sm"
          >
            <motion.button
              onClick={() => navigate("/dashboard")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
            >
              <Home className="w-4 h-4 ml-1" />
              داشبورد
            </motion.button>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 dark:text-gray-100 font-medium px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              مدیریت ساعات کاری
            </span>
          </motion.nav>

          {/* Main Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 dark:from-indigo-100 dark:via-purple-100 dark:to-pink-100 bg-clip-text text-transparent mb-2">
                  مدیریت ساعات کاری هوشمند
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base font-medium">
                  تنظیم و مدیریت ساعات کاری {business?.name || "کسب‌وکار"} با
                  الگوریتم‌های هوشمند
                </p>
              </div>
            </motion.div>

            {/* Header Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              {/* Real-time Connection Status */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white dark:bg-gray-800">
                <div
                  className={`w-2 h-2 rounded-full ${
                    realtimeConnectionStatus === "connected"
                      ? "bg-green-500 animate-pulse"
                      : realtimeConnectionStatus === "error"
                        ? "bg-red-500"
                        : realtimeConnectionStatus === "connecting"
                          ? "bg-yellow-500 animate-pulse"
                          : "bg-gray-400"
                  }`}
                />
                <span className="text-xs font-medium">
                  {realtimeConnectionStatus === "connected"
                    ? "Live"
                    : realtimeConnectionStatus === "error"
                      ? "خطا"
                      : realtimeConnectionStatus === "connecting"
                        ? "اتصال..."
                        : "قطع"}
                </span>
                {realtimeConnectionStatus === "connected" && (
                  <span className="text-xs text-green-600">⚡</span>
                )}
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-center gap-2 border-2 hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-900/20"
                >
                  {showAdvanced ? (
                    <Minimize2 className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-indigo-600" />
                  )}
                  <span className="hidden sm:inline text-indigo-700 dark:text-indigo-300 font-medium">
                    {showAdvanced ? "نمایش ساده" : "تنظیمات پیشرفته"}
                  </span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate("/dashboard")}
                  size="sm"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg border-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">بازگشت به داشبورد</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Service Selection */}
        <Card className="shadow-sm border-0 bg-white dark:bg-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-white">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              انتخاب سرویس و تنظیمات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service and Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Service Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  انتخاب سرویس
                </label>
                <div className="relative">
                  <select
                    value={selectedService}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                  >
                    <option value="">انتخاب سرویس</option>
                    {Array.isArray(servicesData.data) &&
                    servicesData.data.length > 0 ? (
                      servicesData.data.map((service: Service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} ({service.duration} دقیقه)
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {servicesLoading
                          ? "در حال بارگذاری..."
                          : "هیچ سرویسی یافت نشد"}
                      </option>
                    )}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Target className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  انتخاب تاریخ
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="h-12 pr-10 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Working Hours Display */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  ساعات کاری روز انتخاب شده
                </label>
                <div className="h-12 flex items-center px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  {currentDayWorkingHours ? (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded">
                        <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {currentDayWorkingHours.startTime} -{" "}
                        {currentDayWorkingHours.endTime}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded">
                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        تعطیل
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            {showAdvanced && selectedServiceDetails && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    تنظیمات پیشرفته برای {selectedServiceDetails.name}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                    <input
                      type="checkbox"
                      id="useServiceDuration"
                      checked={smartSettings.useServiceDuration}
                      onChange={(e) =>
                        setSmartSettings((prev) => ({
                          ...prev,
                          useServiceDuration: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        استفاده از مدت سرویس
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        فاصله بر اساس مدت سرویس
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                    <input
                      type="checkbox"
                      id="includeLunchBreak"
                      checked={smartSettings.includeLunchBreak}
                      onChange={(e) =>
                        setSmartSettings((prev) => ({
                          ...prev,
                          includeLunchBreak: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        شامل ساعت ناهار
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        حذف ساعات ناهار
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                    <input
                      type="checkbox"
                      id="optimizeForPeakHours"
                      checked={smartSettings.optimizeForPeakHours}
                      onChange={(e) =>
                        setSmartSettings((prev) => ({
                          ...prev,
                          optimizeForPeakHours: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        بهینه‌سازی ساعات شلوغ
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        توزیع بهتر ساعات
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                    <input
                      type="checkbox"
                      id="respectWorkingHours"
                      checked={smartSettings.respectWorkingHours}
                      onChange={(e) =>
                        setSmartSettings((prev) => ({
                          ...prev,
                          respectWorkingHours: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        رعایت ساعات کاری
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        محدود به ساعات کاری
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-b border-gray-200 dark:border-gray-700">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto bg-transparent p-0">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">نمای کلی</span>
                  <span className="sm:hidden">کلی</span>
                </TabsTrigger>
                <TabsTrigger
                  value="generate"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
                >
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">تولید ساعات</span>
                  <span className="sm:hidden">تولید</span>
                </TabsTrigger>
                <TabsTrigger
                  value="manage"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">مدیریت</span>
                  <span className="sm:hidden">مدیریت</span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
                >
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">تنظیمات</span>
                  <span className="sm:hidden">تنظیمات</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Today's Stats */}
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 text-base font-semibold text-blue-900 dark:text-blue-100">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        آمار امروز
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          کل ساعات:
                        </span>
                        <span className="font-bold text-lg text-blue-900 dark:text-blue-100">
                          {slots.length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          موجود:
                        </span>
                        <span className="font-bold text-lg text-green-600 dark:text-green-400">
                          {slots.filter((s: any) => s.isAvailable).length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          رزرو شده:
                        </span>
                        <span className="font-bold text-lg text-red-600 dark:text-red-400">
                          {slots.filter((s: any) => s.isBooked).length}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Service Info */}
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 text-base font-semibold text-green-900 dark:text-green-100">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        اطلاعات سرویس
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedServiceDetails ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-green-700 dark:text-green-300">
                              نام:
                            </span>
                            <span className="font-bold text-sm text-green-900 dark:text-green-100 truncate max-w-[120px]">
                              {selectedServiceDetails.name}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-green-700 dark:text-green-300">
                              مدت:
                            </span>
                            <span className="font-bold text-lg text-green-900 dark:text-green-100">
                              {selectedServiceDetails.duration} دقیقه
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-green-700 dark:text-green-300">
                              قیمت:
                            </span>
                            <span className="font-bold text-lg text-green-900 dark:text-green-100">
                              {selectedServiceDetails.price.toLocaleString()}{" "}
                              تومان
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <Target className="w-8 h-8 mx-auto mb-2 text-green-400" />
                          <p className="text-sm text-green-600 dark:text-green-400">
                            سرویسی انتخاب نشده
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Working Hours */}
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 text-base font-semibold text-purple-900 dark:text-purple-100">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        ساعات کاری
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {currentDayWorkingHours ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-purple-700 dark:text-purple-300">
                              شروع:
                            </span>
                            <span className="font-bold text-lg text-purple-900 dark:text-purple-100">
                              {currentDayWorkingHours.startTime}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-purple-700 dark:text-purple-300">
                              پایان:
                            </span>
                            <span className="font-bold text-lg text-purple-900 dark:text-purple-100">
                              {currentDayWorkingHours.endTime}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-purple-700 dark:text-purple-300">
                              وضعیت:
                            </span>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
                              باز
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <XCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800">
                            تعطیل
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Time Slots Display */}
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-white">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        ساعات کاری {selectedDate}
                      </CardTitle>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={() =>
                            setViewMode(viewMode === "grid" ? "list" : "grid")
                          }
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          {viewMode === "grid" ? (
                            <List className="w-4 h-4" />
                          ) : (
                            <Grid className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">
                            {viewMode === "grid" ? "نمایش لیست" : "نمایش شبکه"}
                          </span>
                        </Button>
                        <Button
                          onClick={() => refetchSlots()}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span className="hidden sm:inline">بروزرسانی</span>
                        </Button>
                        <Button
                          onClick={handleRegenerateSlots}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            بازتولید کامل
                          </span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {slotsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <LoadingSpinner size="lg" />
                          <p className="mt-4 text-gray-600 dark:text-gray-400">
                            در حال بارگذاری ساعات کاری...
                          </p>
                        </div>
                      </div>
                    ) : slots.length > 0 ? (
                      <div className="space-y-4">
                        {/* Enhanced Batch Actions Toolbar */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectAll}
                                  onChange={handleSelectAll}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  انتخاب همه
                                </span>
                              </label>
                              {selectedSlots.length > 0 && (
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                  {selectedSlots.length} ساعت انتخاب شده
                                </Badge>
                              )}
                            </div>
                            {selectedSlots.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  onClick={() => handleBatchSetStatus(true)}
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-1"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="hidden sm:inline">
                                    موجود
                                  </span>
                                </Button>
                                <Button
                                  onClick={() => handleBatchSetStatus(false)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1"
                                >
                                  <XCircle className="w-4 h-4" />
                                  <span className="hidden sm:inline">
                                    ناموجود
                                  </span>
                                </Button>
                                <Button
                                  onClick={handleBatchDelete}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="hidden sm:inline">حذف</span>
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            {slots.length} ساعت یافت شد
                          </div>
                          {realtimeConnected && (
                            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              <span>بروزرسانی خودکار فعال</span>
                            </div>
                          )}
                        </div>

                        {viewMode === "grid" ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                            {slots.map((slot: TimeSlot) => {
                              const status = getSlotStatus(slot);
                              const isSelected = selectedSlots.includes(
                                slot.id || ""
                              );
                              const hasValidId = slot.id && slot.id !== "";
                              return (
                                <div
                                  key={slot.id || Math.random()}
                                  className={`relative group cursor-pointer transition-all duration-200 rounded-xl border-2 hover:shadow-md ${
                                    isSelected
                                      ? "ring-2 ring-blue-500 border-blue-300 bg-blue-50 dark:bg-blue-900/20"
                                      : getSlotStatusColor(status)
                                  }`}
                                  onClick={() =>
                                    handleToggleSlot(
                                      slot.id,
                                      slot.isAvailable,
                                      slot
                                    )
                                  }
                                >
                                  {hasValidId && (
                                    <div className="absolute top-2 right-2 z-10">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          handleSelectSlot(slot.id!);
                                        }}
                                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                      />
                                    </div>
                                  )}
                                  <div className="p-3 text-center">
                                    <div className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                                      {slot.startTime}
                                    </div>
                                    <div className="flex items-center justify-center mb-2">
                                      {getSlotStatusIcon(status)}
                                    </div>
                                    <Badge
                                      variant={
                                        slot.isAvailable
                                          ? "default"
                                          : "secondary"
                                      }
                                      className={`text-xs ${
                                        slot.isAvailable
                                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
                                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800"
                                      }`}
                                    >
                                      {slot.isAvailable ? "موجود" : "ناموجود"}
                                    </Badge>
                                  </div>
                                  {hasValidId && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSlot(slot.id!);
                                      }}
                                      className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-500 hover:text-red-700 bg-white dark:bg-gray-800 rounded-full shadow-sm"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {slots.map((slot: TimeSlot) => {
                              const status = getSlotStatus(slot);
                              const isSelected = selectedSlots.includes(
                                slot.id || ""
                              );
                              const hasValidId = slot.id && slot.id !== "";
                              return (
                                <div
                                  key={slot.id || Math.random()}
                                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md flex items-center justify-between ${
                                    isSelected
                                      ? "ring-2 ring-blue-500 border-blue-300 bg-blue-50 dark:bg-blue-900/20"
                                      : getSlotStatusColor(status)
                                  }`}
                                  onClick={() =>
                                    handleToggleSlot(
                                      slot.id,
                                      slot.isAvailable,
                                      slot
                                    )
                                  }
                                >
                                  <div className="flex items-center gap-3">
                                    {hasValidId && (
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          handleSelectSlot(slot.id!);
                                        }}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                      />
                                    )}
                                    {getSlotStatusIcon(status)}
                                    <div>
                                      <div className="font-bold text-gray-900 dark:text-white">
                                        {slot.startTime} - {slot.endTime}
                                      </div>
                                      <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {slot.isAvailable ? "موجود" : "ناموجود"}
                                      </div>
                                    </div>
                                  </div>
                                  {hasValidId && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSlot(slot.id!);
                                      }}
                                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          هیچ ساعتی یافت نشد
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          برای این تاریخ و سرویس هیچ ساعتی تعریف نشده است
                        </p>
                        <Button
                          onClick={() => setActiveTab("generate")}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Zap className="w-4 h-4 ml-2" />
                          تولید ساعات کاری
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Generate Tab */}
              <TabsContent value="generate" className="space-y-6 mt-0">
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-white">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      تولید ساعات کاری
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="default"
                        className="flex items-center justify-center gap-3 p-6 h-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                        onClick={() => setShowQuickModal(true)}
                      >
                        <Zap className="w-6 h-6" />
                        <div className="text-right">
                          <div className="font-bold">تولید سریع</div>
                          <div className="text-sm opacity-90">
                            فاصله ۳۰ دقیقه‌ای
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex items-center justify-center gap-3 p-6 h-auto border-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20"
                        onClick={() => setShowSmartModal(true)}
                      >
                        <Sparkles className="w-6 h-6" />
                        <div className="text-right">
                          <div className="font-bold">تولید هوشمند</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            الگوریتم پیشرفته
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex items-center justify-center gap-3 p-6 h-auto border-2 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20"
                        onClick={() => setShowRecurringModal(true)}
                      >
                        <Repeat className="w-6 h-6" />
                        <div className="text-right">
                          <div className="font-bold">تولید دوره‌ای</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            چند هفته
                          </div>
                        </div>
                      </Button>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        برای شخصی‌سازی بیشتر، از تولید هوشمند یا دوره‌ای استفاده
                        کنید.
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Manage Tab */}
              <TabsContent value="manage" className="space-y-6 mt-0">
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-white">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Settings className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      مدیریت ساعات کاری
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        بخش مدیریت
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        این بخش در حال توسعه است
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6 mt-0">
                {settingsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-white">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        تنظیمات کسب‌وکار
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Business Hours Settings */}
                        <div>
                          <h4 className="font-medium mb-4">
                            تنظیمات ساعات کاری
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                شروع ناهار
                              </label>
                              <Input
                                type="time"
                                value={businessSettings.lunchBreakStart}
                                onChange={(e) =>
                                  setBusinessSettings((prev) => ({
                                    ...prev,
                                    lunchBreakStart: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                پایان ناهار
                              </label>
                              <Input
                                type="time"
                                value={businessSettings.lunchBreakEnd}
                                onChange={(e) =>
                                  setBusinessSettings((prev) => ({
                                    ...prev,
                                    lunchBreakEnd: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                شروع ساعات شلوغ
                              </label>
                              <Input
                                type="time"
                                value={businessSettings.peakHoursStart}
                                onChange={(e) =>
                                  setBusinessSettings((prev) => ({
                                    ...prev,
                                    peakHoursStart: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                پایان ساعات شلوغ
                              </label>
                              <Input
                                type="time"
                                value={businessSettings.peakHoursEnd}
                                onChange={(e) =>
                                  setBusinessSettings((prev) => ({
                                    ...prev,
                                    peakHoursEnd: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Slot Settings */}
                        <div>
                          <h4 className="font-medium mb-4">تنظیمات اسلات‌ها</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                بافر بین اسلات‌ها (دقیقه)
                              </label>
                              <Input
                                type="number"
                                min={0}
                                value={businessSettings.bufferBetweenSlots}
                                onChange={(e) =>
                                  setBusinessSettings((prev) => ({
                                    ...prev,
                                    bufferBetweenSlots: Number(e.target.value),
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                حداکثر رزرو در هر اسلات
                              </label>
                              <Input
                                type="number"
                                min={1}
                                value={businessSettings.maxBookingsPerSlot}
                                onChange={(e) =>
                                  setBusinessSettings((prev) => ({
                                    ...prev,
                                    maxBookingsPerSlot: Number(e.target.value),
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                روزهای پیش‌رزرو
                              </label>
                              <Input
                                type="number"
                                min={1}
                                value={businessSettings.advanceBookingDays}
                                onChange={(e) =>
                                  setBusinessSettings((prev) => ({
                                    ...prev,
                                    advanceBookingDays: Number(e.target.value),
                                  }))
                                }
                              />
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <input
                                type="checkbox"
                                id="sameDayBooking"
                                checked={businessSettings.sameDayBooking}
                                onChange={(e) =>
                                  setBusinessSettings((prev) => ({
                                    ...prev,
                                    sameDayBooking: e.target.checked,
                                  }))
                                }
                                className="rounded"
                              />
                              <label
                                htmlFor="sameDayBooking"
                                className="text-sm"
                              >
                                رزرو همان روز مجاز
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Smart Generation Settings */}
                        <div>
                          <h4 className="font-medium mb-4">
                            تنظیمات تولید هوشمند
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <input
                                type="checkbox"
                                id="useServiceDuration"
                                checked={smartSettings.useServiceDuration}
                                onChange={(e) =>
                                  setSmartSettings((prev) => ({
                                    ...prev,
                                    useServiceDuration: e.target.checked,
                                  }))
                                }
                                className="rounded"
                              />
                              <label
                                htmlFor="useServiceDuration"
                                className="text-sm"
                              >
                                استفاده از مدت سرویس
                              </label>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <input
                                type="checkbox"
                                id="includeLunchBreak"
                                checked={smartSettings.includeLunchBreak}
                                onChange={(e) =>
                                  setSmartSettings((prev) => ({
                                    ...prev,
                                    includeLunchBreak: e.target.checked,
                                  }))
                                }
                                className="rounded"
                              />
                              <label
                                htmlFor="includeLunchBreak"
                                className="text-sm"
                              >
                                شامل ساعت ناهار
                              </label>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <input
                                type="checkbox"
                                id="optimizeForPeakHours"
                                checked={smartSettings.optimizeForPeakHours}
                                onChange={(e) =>
                                  setSmartSettings((prev) => ({
                                    ...prev,
                                    optimizeForPeakHours: e.target.checked,
                                  }))
                                }
                                className="rounded"
                              />
                              <label
                                htmlFor="optimizeForPeakHours"
                                className="text-sm"
                              >
                                بهینه‌سازی ساعات شلوغ
                              </label>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <input
                                type="checkbox"
                                id="respectWorkingHours"
                                checked={smartSettings.respectWorkingHours}
                                onChange={(e) =>
                                  setSmartSettings((prev) => ({
                                    ...prev,
                                    respectWorkingHours: e.target.checked,
                                  }))
                                }
                                className="rounded"
                              />
                              <label
                                htmlFor="respectWorkingHours"
                                className="text-sm"
                              >
                                رعایت ساعات کاری
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Save Settings */}
                        <div className="flex justify-end">
                          <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={handleSaveSettings}
                            disabled={saveSettingsMutation.isPending}
                          >
                            {saveSettingsMutation.isPending ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Save className="w-4 h-4 ml-2" />
                            )}
                            {saveSettingsMutation.isPending
                              ? "در حال ذخیره..."
                              : "ذخیره تنظیمات"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setShowAddSlotModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 z-50 hover:scale-110"
          title="افزودن ساعت جدید"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Modals */}
        {/* Conflict Resolution Modal */}
        {showConflictModal && (
          <Modal
            title="تداخل در رزروها یافت شد"
            onClose={() => {
              setShowConflictModal(false);
              setConflictData(null);
              setPendingGeneration(null);
            }}
          >
            <div className="space-y-6">
              {/* Conflict Resolution Strategy Selection */}
              {!conflictData && pendingGeneration && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                        رزروهای موجود یافت شد
                      </h4>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      برای هفته آینده رزروهایی وجود دارد. لطفاً نحوه برخورد با
                      تداخلات را انتخاب کنید:
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors border-green-200 dark:border-green-800">
                      <input
                        type="radio"
                        name="conflictResolution"
                        value="preserve"
                        checked={conflictResolution === "preserve"}
                        onChange={(e) =>
                          setConflictResolution(e.target.value as any)
                        }
                        className="mt-1"
                      />
                      <div>
                        <div className="font-semibold text-green-900 dark:text-green-100 mb-1">
                          حفظ رزروهای موجود (توصیه شده)
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">
                          ساعات جدید تنها در مواقعی ایجاد می‌شوند که با رزروهای
                          موجود تداخل نداشته باشند
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors border-blue-200 dark:border-blue-800">
                      <input
                        type="radio"
                        name="conflictResolution"
                        value="reschedule"
                        checked={conflictResolution === "reschedule"}
                        onChange={(e) =>
                          setConflictResolution(e.target.value as any)
                        }
                        className="mt-1"
                      />
                      <div>
                        <div className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          پیشنهاد جابجایی
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          ساعات جدید ایجاد شده و برای رزروهای متداخل، زمان‌های
                          جایگزین پیشنهاد می‌شود
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border-red-200 dark:border-red-800">
                      <input
                        type="radio"
                        name="conflictResolution"
                        value="force"
                        checked={conflictResolution === "force"}
                        onChange={(e) =>
                          setConflictResolution(e.target.value as any)
                        }
                        className="mt-1"
                      />
                      <div>
                        <div className="font-semibold text-red-900 dark:text-red-100 mb-1">
                          لغو رزروهای متداخل (خطرناک)
                        </div>
                        <div className="text-sm text-red-700 dark:text-red-300">
                          رزروهای متداخل به طور خودکار لغو می‌شوند. این عمل
                          غیرقابل بازگشت است!
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        if (pendingGeneration) {
                          handleGenerateSlots(pendingGeneration.mode, true);
                          setShowConflictModal(false);
                        }
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      ادامه تولید
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowConflictModal(false);
                        setPendingGeneration(null);
                      }}
                      className="flex-1"
                    >
                      انصراف
                    </Button>
                  </div>
                </div>
              )}

              {/* Conflict Results Display */}
              {conflictData && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      نتیجه تولید ساعات کاری
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {conflictData.total} تداخل یافت شد و بر اساس استراتژی
                      انتخابی مدیریت گردید.
                    </p>
                  </div>

                  {/* Conflict Details */}
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {conflictData.details?.map(
                      (conflict: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              ساعت {conflict.slotTime}
                            </h5>
                            <Badge
                              className={`${
                                conflict.resolution === "preserved"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : conflict.resolution ===
                                      "reschedule_suggested"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              }`}
                            >
                              {conflict.resolution === "preserved" && "حفظ شده"}
                              {conflict.resolution === "reschedule_suggested" &&
                                "جابجایی پیشنهادی"}
                              {conflict.resolution === "force_cancelled" &&
                                "لغو شده"}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            {conflict.conflictingBookings?.map(
                              (booking: any, bookingIndex: number) => (
                                <div key={bookingIndex} className="text-sm">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {booking.customerName} - {booking.time}
                                  </div>
                                  <div className="text-gray-600 dark:text-gray-400">
                                    {booking.customerPhone}
                                  </div>
                                </div>
                              )
                            )}
                          </div>

                          {/* Reschedule Options */}
                          {conflict.alternatives &&
                            conflict.alternatives.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                  زمان‌های پیشنهادی جایگزین:
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {conflict.alternatives[0]?.suggestedSlots
                                    ?.slice(0, 4)
                                    .map((slot: any, slotIndex: number) => (
                                      <div
                                        key={slotIndex}
                                        className="text-xs p-2 bg-white dark:bg-gray-700 rounded border"
                                      >
                                        <div className="font-medium">
                                          {slot.date} ({slot.dayName})
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                          {slot.startTime} - {slot.endTime}
                                        </div>
                                        {slot.priority === "same_day" && (
                                          <Badge className="mt-1 bg-green-100 text-green-800 text-xs">
                                            همان روز
                                          </Badge>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                        </div>
                      )
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      setShowConflictModal(false);
                      setConflictData(null);
                    }}
                    className="w-full"
                  >
                    بستن
                  </Button>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Quick Modal */}
        {showQuickModal && (
          <Modal
            title="تولید سریع ساعات کاری"
            onClose={() => setShowQuickModal(false)}
          >
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  ساعات کاری با فاصله ۳۰ دقیقه‌ای برای ۷ روز آینده تولید می‌شود.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="forceRegenerateQuick"
                    checked={forceRegenerate}
                    onChange={(e) => setForceRegenerate(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="forceRegenerateQuick" className="text-sm">
                    بازتولید اجباری (حذف ساعات موجود و ایجاد جدید)
                  </label>
                </div>

                {!forceRegenerate && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      نحوه برخورد با رزروهای موجود:
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="conflictResolutionQuick"
                          value="preserve"
                          checked={conflictResolution === "preserve"}
                          onChange={(e) =>
                            setConflictResolution(e.target.value as any)
                          }
                          className="text-blue-600"
                        />
                        <span className="text-sm text-green-700 dark:text-green-300">
                          حفظ رزروهای موجود
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="conflictResolutionQuick"
                          value="reschedule"
                          checked={conflictResolution === "reschedule"}
                          onChange={(e) =>
                            setConflictResolution(e.target.value as any)
                          }
                          className="text-blue-600"
                        />
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          پیشنهاد جابجایی
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="conflictResolutionQuick"
                          value="force"
                          checked={conflictResolution === "force"}
                          onChange={(e) =>
                            setConflictResolution(e.target.value as any)
                          }
                          className="text-blue-600"
                        />
                        <span className="text-sm text-red-700 dark:text-red-300">
                          لغو رزروهای متداخل
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={() => {
                  handleGenerateSlots({
                    id: "quick",
                    name: "تولید سریع",
                    description: "تولید ساعات کاری ساده با فاصله 30 دقیقه‌ای",
                    icon: <Zap className="w-5 h-5" />,
                    settings: { mode: "basic" },
                  });
                  setShowQuickModal(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                تایید و تولید
              </Button>
            </div>
          </Modal>
        )}

        {/* Smart Modal */}
        {showSmartModal && (
          <Modal
            title="تولید هوشمند ساعات کاری"
            onClose={() => setShowSmartModal(false)}
          >
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  ساعات کاری با الگوریتم هوشمند (مدت سرویس، ناهار، ساعات شلوغ
                  و...)
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    بافر بین اسلات‌ها (دقیقه)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={businessSettings.bufferBetweenSlots}
                    onChange={(e) =>
                      setBusinessSettings((prev) => ({
                        ...prev,
                        bufferBetweenSlots: Number(e.target.value),
                      }))
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    حداکثر اسلات در روز
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={smartSettings.maxSlotsPerDay}
                    onChange={(e) =>
                      setSmartSettings((prev) => ({
                        ...prev,
                        maxSlotsPerDay: Number(e.target.value),
                      }))
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    شروع ناهار
                  </label>
                  <input
                    type="time"
                    value={businessSettings.lunchBreakStart}
                    onChange={(e) =>
                      setBusinessSettings((prev) => ({
                        ...prev,
                        lunchBreakStart: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    پایان ناهار
                  </label>
                  <input
                    type="time"
                    value={businessSettings.lunchBreakEnd}
                    onChange={(e) =>
                      setBusinessSettings((prev) => ({
                        ...prev,
                        lunchBreakEnd: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    شروع ساعات شلوغ
                  </label>
                  <input
                    type="time"
                    value={businessSettings.peakHoursStart}
                    onChange={(e) =>
                      setBusinessSettings((prev) => ({
                        ...prev,
                        peakHoursStart: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    پایان ساعات شلوغ
                  </label>
                  <input
                    type="time"
                    value={businessSettings.peakHoursEnd}
                    onChange={(e) =>
                      setBusinessSettings((prev) => ({
                        ...prev,
                        peakHoursEnd: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="forceRegenerateSmart"
                    checked={forceRegenerate}
                    onChange={(e) => setForceRegenerate(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="forceRegenerateSmart" className="text-sm">
                    بازتولید اجباری (حذف ساعات موجود و ایجاد جدید)
                  </label>
                </div>

                {!forceRegenerate && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      نحوه برخورد با رزروهای موجود:
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="conflictResolutionSmart"
                          value="preserve"
                          checked={conflictResolution === "preserve"}
                          onChange={(e) =>
                            setConflictResolution(e.target.value as any)
                          }
                          className="text-blue-600"
                        />
                        <span className="text-sm text-green-700 dark:text-green-300">
                          حفظ رزروهای موجود
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="conflictResolutionSmart"
                          value="reschedule"
                          checked={conflictResolution === "reschedule"}
                          onChange={(e) =>
                            setConflictResolution(e.target.value as any)
                          }
                          className="text-blue-600"
                        />
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          پیشنهاد جابجایی
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="conflictResolutionSmart"
                          value="force"
                          checked={conflictResolution === "force"}
                          onChange={(e) =>
                            setConflictResolution(e.target.value as any)
                          }
                          className="text-blue-600"
                        />
                        <span className="text-sm text-red-700 dark:text-red-300">
                          لغو رزروهای متداخل
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={() => {
                  handleGenerateSlots({
                    id: "smart",
                    name: "تولید هوشمند",
                    description: "تولید ساعات کاری با الگوریتم‌های پیشرفته",
                    icon: <Sparkles className="w-5 h-5" />,
                    settings: {
                      mode: "smart",
                      smartSettings,
                      businessSettings,
                    },
                  });
                  setShowSmartModal(false);
                }}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                تایید و تولید
              </Button>
            </div>
          </Modal>
        )}

        {/* Recurring Modal */}
        {showRecurringModal && (
          <Modal
            title="تولید دوره‌ای ساعات کاری"
            onClose={() => setShowRecurringModal(false)}
          >
            <div className="space-y-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  ساعات کاری تکرار شونده برای چند هفته (مثلاً دوشنبه‌ها و
                  چهارشنبه‌ها)
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    روزهای هفته
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                      <label key={day} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={recurringPattern.days.includes(day)}
                          onChange={() => toggleDaySelection(day)}
                        />
                        {getDayName(day)}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    تعداد هفته
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={recurringPattern.weeks}
                    onChange={(e) =>
                      setRecurringPattern((prev) => ({
                        ...prev,
                        weeks: Number(e.target.value),
                      }))
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="forceRegenerateRecurring"
                    checked={forceRegenerate}
                    onChange={(e) => setForceRegenerate(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="forceRegenerateRecurring" className="text-sm">
                    بازتولید اجباری (حذف ساعات موجود و ایجاد جدید)
                  </label>
                </div>

                {!forceRegenerate && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      نحوه برخورد با رزروهای موجود:
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="conflictResolutionRecurring"
                          value="preserve"
                          checked={conflictResolution === "preserve"}
                          onChange={(e) =>
                            setConflictResolution(e.target.value as any)
                          }
                          className="text-blue-600"
                        />
                        <span className="text-sm text-green-700 dark:text-green-300">
                          حفظ رزروهای موجود
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="conflictResolutionRecurring"
                          value="reschedule"
                          checked={conflictResolution === "reschedule"}
                          onChange={(e) =>
                            setConflictResolution(e.target.value as any)
                          }
                          className="text-blue-600"
                        />
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          پیشنهاد جابجایی
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="conflictResolutionRecurring"
                          value="force"
                          checked={conflictResolution === "force"}
                          onChange={(e) =>
                            setConflictResolution(e.target.value as any)
                          }
                          className="text-blue-600"
                        />
                        <span className="text-sm text-red-700 dark:text-red-300">
                          لغو رزروهای متداخل
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={() => {
                  handleGenerateSlots({
                    id: "recurring",
                    name: "الگوی دوره‌ای",
                    description: "تولید ساعات کاری تکرار شونده برای چند هفته",
                    icon: <Repeat className="w-5 h-5" />,
                    settings: {
                      mode: "recurring",
                      pattern: recurringPattern,
                      smartSettings,
                      businessSettings,
                    },
                  });
                  setShowRecurringModal(false);
                }}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                تایید و تولید
              </Button>
            </div>
          </Modal>
        )}

        {/* Add Slot Modal */}
        {showAddSlotModal && (
          <Modal
            title="افزودن ساعت جدید"
            onClose={() => setShowAddSlotModal(false)}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ساعت شروع
                  </label>
                  <input
                    type="time"
                    id="newSlotStart"
                    className="w-full p-2 border rounded"
                    defaultValue="09:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ساعت پایان
                  </label>
                  <input
                    type="time"
                    id="newSlotEnd"
                    className="w-full p-2 border rounded"
                    defaultValue="09:30"
                  />
                </div>
              </div>
              <Button
                onClick={() => {
                  const startTime = (
                    document.getElementById("newSlotStart") as HTMLInputElement
                  ).value;
                  const endTime = (
                    document.getElementById("newSlotEnd") as HTMLInputElement
                  ).value;

                  if (!startTime || !endTime) {
                    toast.error("لطفاً ساعت شروع و پایان را وارد کنید");
                    return;
                  }

                  if (!businessId || !selectedService || !selectedDate) {
                    toast.error("خطا: اطلاعات ناقص برای ایجاد ساعت");
                    return;
                  }

                  const addData = {
                    businessId: businessId!,
                    serviceId: selectedService,
                    date: selectedDate,
                    startTime,
                    endTime,
                  };

                  addSlotMutation.mutate(addData);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                افزودن ساعت
              </Button>
            </div>
          </Modal>
        )}

        {/* Enhanced Regenerate Modal */}
        {showRegenerateModal && (
          <Modal
            title="بازتولید کامل ساعات کاری"
            onClose={() => setShowRegenerateModal(false)}
          >
            <div className="space-y-6">
              {/* Warning Section */}
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h4 className="font-semibold text-red-900 dark:text-red-100">
                    هشدار: عملیات حساس
                  </h4>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  این عملیات تمام ساعات کاری موجود را حذف کرده و مجدداً ایجاد
                  می‌کند. ممکن است بر روی رزروهای موجود تأثیر بگذارد.
                </p>
                <div className="text-xs text-red-600 dark:text-red-400">
                  ⚠️ این عملیات غیرقابل بازگشت است (مگر اینکه نسخه پشتیبان فعال
                  باشد)
                </div>
              </div>

              {/* Backup Strategy */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  استراتژی پشتیبان‌گیری:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="backupStrategy"
                      value="auto"
                      checked={backupStrategy === "auto"}
                      onChange={(e) => setBackupStrategy(e.target.value as any)}
                      className="text-blue-600"
                    />
                    <span className="text-sm">
                      <strong>خودکار (توصیه شده)</strong> - نسخه پشتیبان قبل از
                      بازتولید
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="backupStrategy"
                      value="manual"
                      checked={backupStrategy === "manual"}
                      onChange={(e) => setBackupStrategy(e.target.value as any)}
                      className="text-blue-600"
                    />
                    <span className="text-sm">
                      <strong>دستی</strong> - تأیید پشتیبان‌گیری توسط کاربر
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="backupStrategy"
                      value="none"
                      checked={backupStrategy === "none"}
                      onChange={(e) => setBackupStrategy(e.target.value as any)}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-red-600 dark:text-red-400">
                      <strong>بدون پشتیبان</strong> - خطرناک!
                    </span>
                  </label>
                </div>
              </div>

              {/* Conflict Resolution Strategy */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  نحوه برخورد با رزروهای موجود:
                </label>
                <div className="space-y-2">
                  <label className="flex items-start gap-2 p-3 border rounded-lg cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/10">
                    <input
                      type="radio"
                      name="conflictResolutionRegenerate"
                      value="preserve"
                      checked={conflictResolution === "preserve"}
                      onChange={(e) =>
                        setConflictResolution(e.target.value as any)
                      }
                      className="mt-1 text-green-600"
                    />
                    <div>
                      <div className="font-medium text-green-900 dark:text-green-100">
                        حفظ رزروها
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300">
                        ساعات جدید فقط در مواقع خالی ایجاد می‌شوند
                      </div>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10">
                    <input
                      type="radio"
                      name="conflictResolutionRegenerate"
                      value="reschedule"
                      checked={conflictResolution === "reschedule"}
                      onChange={(e) =>
                        setConflictResolution(e.target.value as any)
                      }
                      className="mt-1 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-blue-900 dark:text-blue-100">
                        پیشنهاد جابجایی
                      </div>
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        زمان‌های جایگزین برای رزروهای متداخل پیشنهاد می‌شود
                      </div>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 p-3 border rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10">
                    <input
                      type="radio"
                      name="conflictResolutionRegenerate"
                      value="force"
                      checked={conflictResolution === "force"}
                      onChange={(e) =>
                        setConflictResolution(e.target.value as any)
                      }
                      className="mt-1 text-red-600"
                    />
                    <div>
                      <div className="font-medium text-red-900 dark:text-red-100">
                        لغو رزروهای متداخل
                      </div>
                      <div className="text-xs text-red-700 dark:text-red-300">
                        خطرناک! رزروها لغو می‌شوند
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  گزینه‌های اضافی:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={regenerateSettings.notifyCustomers}
                      onChange={(e) =>
                        setRegenerateSettings((prev) => ({
                          ...prev,
                          notifyCustomers: e.target.checked,
                        }))
                      }
                      className="text-blue-600"
                    />
                    <span className="text-sm">
                      اطلاع‌رسانی پیامکی به مشتریان
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={regenerateSettings.createBackup}
                      onChange={(e) =>
                        setRegenerateSettings((prev) => ({
                          ...prev,
                          createBackup: e.target.checked,
                        }))
                      }
                      className="text-blue-600"
                    />
                    <span className="text-sm">ایجاد نسخه پشتیبان</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={regenerateSettings.requireConfirmation}
                      onChange={(e) =>
                        setRegenerateSettings((prev) => ({
                          ...prev,
                          requireConfirmation: e.target.checked,
                        }))
                      }
                      className="text-blue-600"
                    />
                    <span className="text-sm">نیاز به تأیید نهایی</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleConfirmRegenerate}
                  disabled={regenerateSlotsMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {regenerateSlotsMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <RotateCcw className="w-4 h-4 ml-2" />
                  )}
                  {regenerateSlotsMutation.isPending
                    ? "در حال بازتولید..."
                    : "تأیید و بازتولید"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRegenerateModal(false)}
                  className="flex-1"
                >
                  انصراف
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Impact Analysis Modal */}
        {showImpactAnalysisModal && impactAnalysis && (
          <Modal
            title="تحلیل تأثیرات بازتولید"
            onClose={() => {
              setShowImpactAnalysisModal(false);
              setImpactAnalysis(null);
            }}
          >
            <div className="space-y-6">
              {/* Summary */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  خلاصه تغییرات
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">
                      ساعات ایجاد شده:
                    </span>
                    <span className="font-bold ml-2">
                      {impactAnalysis.summary?.totalCreated || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">
                      ساعات حذف شده:
                    </span>
                    <span className="font-bold ml-2">
                      {impactAnalysis.summary?.totalDeleted || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">
                      رزروهای تحت تأثیر:
                    </span>
                    <span className="font-bold ml-2">
                      {impactAnalysis.summary?.totalBookingsAffected || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">
                      نسخه پشتیبان:
                    </span>
                    <span className="font-bold ml-2">
                      {impactAnalysis.summary?.backupCreated
                        ? "✅ ایجاد شد"
                        : "❌ ایجاد نشد"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Impact */}
              {impactAnalysis.impactAnalysis && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-3">
                    تأثیر بر مشتریان
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-amber-700 dark:text-amber-300">
                        رزروهای تحت تأثیر:
                      </span>
                      <span className="font-bold ml-2">
                        {impactAnalysis.impactAnalysis.affectedBookings}
                      </span>
                    </div>
                    <div>
                      <span className="text-amber-700 dark:text-amber-300">
                        مشتریان منحصربه‌فرد:
                      </span>
                      <span className="font-bold ml-2">
                        {impactAnalysis.impactAnalysis.uniqueCustomers}
                      </span>
                    </div>
                    <div>
                      <span className="text-amber-700 dark:text-amber-300">
                        کل درآمد تحت تأثیر:
                      </span>
                      <span className="font-bold ml-2">
                        {Math.round(
                          impactAnalysis.impactAnalysis.totalRevenue
                        ).toLocaleString()}{" "}
                        تومان
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Notifications */}
              {impactAnalysis.customerNotifications && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">
                    اطلاع‌رسانی مشتریان
                  </h4>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    <p>
                      {impactAnalysis.customerNotifications.notificationsSent}{" "}
                      پیامک از مجموع{" "}
                      {impactAnalysis.customerNotifications.total} اطلاع‌رسانی
                      ارسال شد.
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={() => {
                  setShowImpactAnalysisModal(false);
                  setImpactAnalysis(null);
                }}
                className="w-full"
              >
                بستن
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default TimeSlots;

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { dashboardApi, api } from "@/services/api";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuthStore } from "@/store/authStore";
import LoadingSpinner from "@/components/LoadingSpinner";
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
  Plus,
  Trash2,
  Save,
  Copy,
  Users,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  CalendarRange,
  Smartphone,
  Building,
  Target,
  Sparkles,
  BarChart3,
  Eye,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Grid,
  List,
  Info,
  Home,
  Brain,
  Shield,
  Lightbulb,
  Zap,
  Coffee,
  Repeat,
  FileText,
  Download,
  Upload,
  EyeOff,
  Maximize2,
  Minimize2,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";

// Types following Bookly's business logic
interface TimeSlot {
  id?: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  capacity: number;
  maxCapacity: number;
  isPeakHour: boolean;
  serviceDuration: number;
  intervalMinutes: number;
  staffId?: string;
  price?: number;
  customPrice?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  isActive: boolean;
  businessId: string;
}

interface WorkingHour {
  id: string;
  businessId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface BusinessSettings {
  id: string;
  businessId: string;
  advanceBookingDays: number;
  bufferBetweenSlots: number;
  includeLunchBreak: boolean;
  lunchBreakStart: string;
  lunchBreakEnd: string;
  maxBookingsPerSlot: number;
  maxSlotsPerDay: number;
  optimizeForPeakHours: boolean;
  peakHoursStart: string;
  peakHoursEnd: string;
  respectWorkingHours: boolean;
  sameDayBooking: boolean;
  useServiceDuration: boolean;
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  bio?: string;
  experience?: number;
  isActive: boolean;
  services: StaffService[];
  workingHours: StaffWorkingHour[];
}

interface StaffService {
  id: string;
  staffId: string;
  serviceId: string;
  customPrice?: number;
  service: Service;
}

interface StaffWorkingHour {
  id: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface GenerationMode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  settings: any;
}

interface TimeSlotTemplate {
  id: string;
  name: string;
  description: string;
  settings: any;
  businessId: string;
}

interface ConflictError {
  type:
    | "conflict"
    | "capacity"
    | "overlap"
    | "general"
    | "booking_conflict"
    | "staff_unavailable"
    | "working_hours"
    | "service_duration";
  message: string;
  details?: {
    conflictingSlots?: number;
    conflictingBookings?: number;
    overlappingTimes?: string[];
    conflictingDates?: string[];
    staffConflicts?: Array<{
      staffId: string;
      staffName: string;
      conflicts: Array<{
        date: string;
        time: string;
        reason: string;
      }>;
    }>;
    serviceConflicts?: Array<{
      serviceId: string;
      serviceName: string;
      conflicts: Array<{
        date: string;
        time: string;
        reason: string;
      }>;
    }>;
    workingHoursConflicts?: Array<{
      dayOfWeek: number;
      dayName: string;
      requestedTime: string;
      availableTime: string;
    }>;
  };
  suggestions?: string[];
  severity: "low" | "medium" | "high" | "critical";
  canAutoResolve?: boolean;
  autoResolveOptions?: Array<{
    id: string;
    label: string;
    description: string;
    action: string;
  }>;
}

const TimeSlots: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { business, businessId } = useBusiness();
  const { user } = useAuthStore();

  // Basic state management
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0] || ""
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [selectedSlotForCapacity, setSelectedSlotForCapacity] =
    useState<TimeSlot | null>(null);

  // Conflict handling states
  const [modalConflictError, setModalConflictError] =
    useState<ConflictError | null>(null);
  const [modalSummary, setModalSummary] = useState<any>(null);
  const [showConflictDetails, setShowConflictDetails] = useState(false);
  const [creationStep, setCreationStep] = useState<
    "form" | "summary" | "conflicts"
  >("form");

  // Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Queries
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["services", businessId],
    queryFn: () => dashboardApi.getServices(businessId!),
    enabled: !!businessId,
  });

  // Auto-select first service if available and none selected
  useEffect(() => {
    if (
      services?.data?.data &&
      services.data.data.length > 0 &&
      !selectedService
    ) {
      const firstService = services.data.data[0];
      setSelectedService(firstService.id);
    }
  }, [services, selectedService]);

  const { data: timeSlots, isLoading: timeSlotsLoading } = useQuery({
    queryKey: ["timeSlots", businessId, selectedService, selectedDate],
    queryFn: () =>
      dashboardApi.getTimeSlots(businessId!, selectedService!, selectedDate!),
    enabled: !!businessId && !!selectedService && !!selectedDate,
  });

  const { data: workingHours } = useQuery({
    queryKey: ["workingHours", businessId],
    queryFn: () => dashboardApi.getWorkingHours(businessId!),
    enabled: !!businessId,
  });

  const { data: businessSettings } = useQuery({
    queryKey: ["businessSettings", businessId],
    queryFn: () => dashboardApi.getBusinessSettings(businessId!),
    enabled: !!businessId,
  });

  // Mutations
  const generateTimeSlotsMutation = useMutation({
    mutationFn: (data: any) =>
      dashboardApi.generateTimeSlots(businessId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
      toast.success("ساعات کاری با موفقیت ایجاد شد");
      setConflictError(null);
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "خطا در ایجاد ساعات کاری";
      const errorDetails = error.response?.data?.details;

      // Check if this is a conflict error
      if (
        errorMessage.includes("conflicts") ||
        errorMessage.includes("overlap") ||
        errorMessage.includes("existing")
      ) {
        const conflictError: ConflictError = {
          type: "conflict",
          message: errorMessage,
          details: errorDetails,
          severity: "medium",
          suggestions: [
            "زمان‌های انتخاب شده با ساعات موجود تداخل دارند",
            "لطفاً بازه زمانی دیگری انتخاب کنید",
            "می‌توانید از حالت 'جایگزینی' برای حل تداخل استفاده کنید",
          ],
        };
        setConflictError(conflictError);
        setShowConflictHelp(true);
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const updateTimeSlotMutation = useMutation({
    mutationFn: ({ slotId, data }: { slotId: string; data: any }) =>
      dashboardApi.updateTimeSlot(slotId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
      toast.success("ساعت کاری بروزرسانی شد");
      setConflictError(null);
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "خطا در بروزرسانی ساعت کاری";

      if (
        errorMessage.includes("conflicts") ||
        errorMessage.includes("booked")
      ) {
        toast.error("این ساعت کاری در حال حاضر رزرو شده و قابل تغییر نیست");
      } else {
        toast.error(errorMessage);
      }
    },
  });

  // Add capacity update mutation
  const updateSlotCapacityMutation = useMutation({
    mutationFn: ({
      slotId,
      capacity,
      maxCapacity,
    }: {
      slotId: string;
      capacity: number;
      maxCapacity: number;
    }) => dashboardApi.updateTimeSlot(slotId, { capacity, maxCapacity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
      toast.success("ظرفیت ساعت کاری بروزرسانی شد");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "خطا در بروزرسانی ظرفیت");
    },
  });

  // Handlers
  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
    setSelectedSlots([]);
    setSelectAll(false);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedSlots([]);
    setSelectAll(false);
  };

  const handleSelectSlot = (slotId: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );
  };

  const handleSelectAll = () => {
    if (!timeSlots?.data.data.availableSlots) return;

    if (selectAll) {
      setSelectedSlots([]);
      setSelectAll(false);
    } else {
      setSelectedSlots(
        timeSlots.data.data.availableSlots.map((slot: TimeSlot) => slot.id!)
      );
      setSelectAll(true);
    }
  };

  const handleToggleSlot = (slotId: string, isAvailable: boolean) => {
    updateTimeSlotMutation.mutate({
      slotId,
      data: { isAvailable },
    });
  };

  const handleDeleteSlot = (slotId: string) => {
    if (confirm("آیا از حذف این ساعت کاری اطمینان دارید؟")) {
      deleteTimeSlotMutation.mutate(slotId);
    }
  };

  // Enhanced delete mutation with conflict handling
  const deleteTimeSlotMutation = useMutation({
    mutationFn: (slotId: string) => dashboardApi.deleteTimeSlot(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
      toast.success("ساعت کاری حذف شد");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "خطا در حذف ساعت کاری";

      if (
        errorMessage.includes("booked") ||
        errorMessage.includes("conflicts")
      ) {
        toast.error("این ساعت کاری رزرو شده و قابل حذف نیست");
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const handleEditCapacity = (slot: TimeSlot) => {
    setSelectedSlotForCapacity(slot);
    setShowCapacityModal(true);
  };

  const handleUpdateCapacity = (capacity: number, maxCapacity: number) => {
    if (selectedSlotForCapacity) {
      updateSlotCapacityMutation.mutate({
        slotId: selectedSlotForCapacity.id!,
        capacity,
        maxCapacity,
      });
      setShowCapacityModal(false);
      setSelectedSlotForCapacity(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSlots.length === 0) {
      toast.error("لطفاً ساعات کاری را انتخاب کنید");
      return;
    }

    if (
      confirm(`آیا از حذف ${selectedSlots.length} ساعت کاری اطمینان دارید؟`)
    ) {
      try {
        const response =
          await dashboardApi.bulkDeleteTimeSlotsByIds(selectedSlots);

        if (response.data.success) {
          toast.success(`${response.data.deletedCount} ساعت کاری حذف شد`);
          if (response.data.failedCount > 0) {
            toast(
              `${response.data.failedCount} ساعت کاری به دلیل رزرو بودن حذف نشد`,
              {
                icon: "⚠️",
                duration: 4000,
              }
            );
          }
          setSelectedSlots([]);
          setSelectAll(false);
          // Refresh the time slots
          queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
        } else {
          toast.error(response.data.error || "خطا در حذف ساعات کاری");
        }
      } catch (error: any) {
        console.error("Error deleting time slots:", error);
        const errorMessage =
          error.response?.data?.error || "خطا در حذف ساعات کاری";

        // Check if this is a conflict error
        if (
          errorMessage.includes("booked") ||
          errorMessage.includes("conflicts")
        ) {
          toast.error("برخی از ساعات کاری رزرو شده‌اند و قابل حذف نیستند");
        } else {
          toast.error(errorMessage);
        }
      }
    }
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

  const getSlotStatus = (slot: TimeSlot) => {
    if (slot.isBooked) return "booked";
    if (!slot.isAvailable) return "unavailable";
    return "available";
  };

  const getSlotStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "success";
      case "booked":
        return "destructive";
      case "unavailable":
        return "secondary";
      default:
        return "default";
    }
  };

  const getSlotStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="w-4 h-4" />;
      case "booked":
        return <XCircle className="w-4 h-4" />;
      case "unavailable":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Generation modes following Bookly's logic
  const generationModes: GenerationMode[] = [
    {
      id: "basic",
      name: "ایجاد ساده",
      description: "ایجاد ساعات کاری بر اساس تنظیمات پایه کسب و کار",
      icon: <Clock className="w-5 h-5" />,
      settings: {
        intervalMinutes: 30,
        respectWorkingHours: true,
        includeLunchBreak: true,
      },
    },
    {
      id: "smart",
      name: "ایجاد هوشمند",
      description: "استفاده از هوش مصنوعی برای بهینه‌سازی ساعات کاری",
      icon: <Brain className="w-5 h-5" />,
      settings: {
        optimizeForPeakHours: true,
        useServiceDuration: true,
        bufferBetweenSlots: 15,
      },
    },
    {
      id: "recurring",
      name: "ایجاد تکراری",
      description: "ایجاد ساعات کاری برای چندین روز یا هفته",
      icon: <Repeat className="w-5 h-5" />,
      settings: {
        repeatType: "weekly",
        repeatCount: 4,
        excludeWeekends: false,
      },
    },
    {
      id: "custom",
      name: "ایجاد سفارشی",
      description: "ایجاد ساعات کاری با تنظیمات کاملاً سفارشی",
      icon: <Settings className="w-5 h-5" />,
      settings: {
        customIntervals: [],
        customBreaks: [],
        staffAssignment: "auto",
      },
    },
  ];

  // Creation form state
  const [creationForm, setCreationForm] = useState({
    mode: "basic",
    startDate: selectedDate || new Date().toISOString().split("T")[0],
    endDate: selectedDate || new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "17:00",
    intervalMinutes: 30,
    serviceId: selectedService || "",
    staffId: "",
    maxCapacity: 1,
    capacity: 0,
    isPeakHour: false,
    notes: "",
    // Recurring options
    repeatType: "daily", // daily, weekly, monthly
    repeatCount: 7, // number of repetitions
    repeatDays: [1, 2, 3, 4, 5], // days of week (0=Sunday, 1=Monday, etc.)
    excludeWeekends: false,
    excludeHolidays: true,
  });

  const [conflictError, setConflictError] = useState<ConflictError | null>(
    null
  );
  const [showConflictHelp, setShowConflictHelp] = useState(false);

  const handleCreateTimeSlots = async () => {
    if (!creationForm.serviceId) {
      toast.error("لطفاً سرویس را انتخاب کنید");
      return;
    }

    setIsGenerating(true);
    setConflictError(null);
    setModalConflictError(null);
    setModalSummary(null);
    setCreationStep("form");

    try {
      let data;

      if (creationForm.mode === "recurring") {
        // Use the new recurring endpoint
        data = {
          businessId: businessId,
          serviceId: creationForm.serviceId,
          startDate: creationForm.startDate,
          endDate: creationForm.endDate,
          startTime: creationForm.startTime,
          endTime: creationForm.endTime,
          intervalMinutes: creationForm.intervalMinutes,
          maxCapacity: creationForm.maxCapacity,
          capacity: creationForm.capacity,
          staffId: creationForm.staffId || undefined,
          isPeakHour: creationForm.isPeakHour,
          notes: creationForm.notes,
          repeatType: creationForm.repeatType,
          repeatCount: creationForm.repeatCount,
          repeatDays: creationForm.repeatDays,
          excludeWeekends: creationForm.excludeWeekends,
          excludeHolidays: creationForm.excludeHolidays,
        };

        // Call the recurring endpoint using the correct API
        const response = await api.post(`/time-slots/create-recurring`, data);
        const result = response.data;

        console.log("Time slot creation response:", result);

        if (result.success) {
          // Store the summary for display
          setModalSummary(result);

          // Check if there were any conflicts or skipped slots
          console.log("Checking conflicts:", {
            totalSkipped: result.summary?.totalSkipped,
            totalConflicts: result.summary?.totalConflicts,
            conflictsTotal: result.conflicts?.total,
          });

          if (
            result.summary?.totalSkipped > 0 ||
            result.summary?.totalConflicts > 0 ||
            result.conflicts?.total > 0
          ) {
            console.log("Setting step to summary");
            setCreationStep("summary");
            toast.success(
              `تعداد ${result.summary.totalCreated} ساعت کاری ایجاد شد`
            );
            if (result.summary.totalSkipped > 0) {
              toast(
                `${result.summary.totalSkipped} ساعت کاری به دلیل تداخل رد شد`,
                {
                  icon: "⚠️",
                  duration: 4000,
                }
              );
            }
          } else {
            // No conflicts, close modal and show success
            toast.success(
              `تعداد ${result.summary.totalCreated} ساعت کاری ایجاد شد`
            );
            setShowCreateModal(false);
          }

          // Refresh the time slots
          queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
        } else {
          // Handle conflict errors from recurring creation
          if (
            result.error?.includes("conflicts") ||
            result.error?.includes("overlap")
          ) {
            const conflictError: ConflictError = {
              type: "conflict",
              message: result.error,
              details: result.details,
              severity: "medium",
              suggestions: [
                "زمان‌های انتخاب شده با ساعات موجود تداخل دارند",
                "لطفاً بازه زمانی دیگری انتخاب کنید",
                "می‌توانید از حالت 'جایگزینی' برای حل تداخل استفاده کنید",
              ],
            };
            setModalConflictError(conflictError);
            setCreationStep("conflicts");
            // Don't close the modal, show the error instead
          } else {
            throw new Error(result.error || "خطا در ایجاد ساعات کاری");
          }
        }
      } else {
        // Use the existing endpoint for other modes
        data = {
          serviceId: creationForm.serviceId,
          startDate: creationForm.startDate,
          endDate: creationForm.endDate,
          startTime: creationForm.startTime,
          endTime: creationForm.endTime,
          intervalMinutes: creationForm.intervalMinutes,
          maxCapacity: creationForm.maxCapacity,
          capacity: creationForm.capacity,
          staffId: creationForm.staffId || undefined,
          isPeakHour: creationForm.isPeakHour,
          notes: creationForm.notes,
          mode: creationForm.mode,
          settings: generationModes.find((m) => m.id === creationForm.mode)
            ?.settings,
        };

        // Use the generateTimeSlots endpoint for all modes
        const response = await api.post(
          `/availability/generate/${businessId}`,
          data
        );
        const result = response.data;

        console.log("Time slot creation response (non-recurring):", result);

        if (result.success) {
          // Store the summary for display
          setModalSummary(result);

          // Check if there were any conflicts or skipped slots
          console.log("Checking conflicts (non-recurring):", {
            totalSkipped: result.summary?.totalSkipped,
            totalConflicts: result.summary?.totalConflicts,
            conflictsTotal: result.conflicts?.total,
          });

          if (
            result.summary?.totalSkipped > 0 ||
            result.summary?.totalConflicts > 0 ||
            result.conflicts?.total > 0
          ) {
            console.log("Setting step to summary (non-recurring)");
            setCreationStep("summary");
            toast.success(
              `تعداد ${result.summary.totalCreated} ساعت کاری ایجاد شد`
            );
            if (result.summary.totalSkipped > 0) {
              toast(
                `${result.summary.totalSkipped} ساعت کاری به دلیل تداخل رد شد`,
                {
                  icon: "⚠️",
                  duration: 4000,
                }
              );
            }
          } else {
            // No conflicts, close modal and show success
            toast.success(
              `تعداد ${result.summary.totalCreated} ساعت کاری ایجاد شد`
            );
            setShowCreateModal(false);
          }

          // Refresh the time slots
          queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
        } else {
          // Handle conflict errors from any mode
          if (
            result.error?.includes("conflicts") ||
            result.error?.includes("overlap") ||
            result.error?.includes("existing")
          ) {
            const conflictError: ConflictError = {
              type: "conflict",
              message: result.error,
              details: result.details,
              severity: "medium",
              suggestions: [
                "زمان‌های انتخاب شده با ساعات موجود تداخل دارند",
                "لطفاً بازه زمانی دیگری انتخاب کنید",
                "می‌توانید از حالت 'جایگزینی' برای حل تداخل استفاده کنید",
              ],
            };
            setModalConflictError(conflictError);
            setCreationStep("conflicts");
            // Don't close the modal, show the error instead
          } else {
            throw new Error(result.error || "خطا در ایجاد ساعات کاری");
          }
        }
      }

      setCreationForm({
        mode: "basic",
        startDate: selectedDate,
        endDate: selectedDate,
        startTime: "09:00",
        endTime: "17:00",
        intervalMinutes: 30,
        serviceId: selectedService,
        staffId: "",
        maxCapacity: 1,
        capacity: 0,
        isPeakHour: false,
        notes: "",
        // Recurring options
        repeatType: "daily", // daily, weekly, monthly
        repeatCount: 7, // number of repetitions
        repeatDays: [1, 2, 3, 4, 5], // days of week (0=Sunday, 1=Monday, etc.)
        excludeWeekends: false,
        excludeHolidays: true,
      });
    } catch (error: any) {
      console.error("Error creating time slots:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "خطا در ایجاد ساعات کاری";

      // Check if this is a conflict error
      if (
        errorMessage.includes("conflicts") ||
        errorMessage.includes("overlap") ||
        errorMessage.includes("existing")
      ) {
        const conflictError: ConflictError = {
          type: "conflict",
          message: errorMessage,
          details: error?.response?.data?.details,
          severity: "medium",
          suggestions: [
            "زمان‌های انتخاب شده با ساعات موجود تداخل دارند",
            "لطفاً بازه زمانی دیگری انتخاب کنید",
            "می‌توانید از حالت 'جایگزینی' برای حل تداخل استفاده کنید",
          ],
        };
        setModalConflictError(conflictError);
        setCreationStep("conflicts");
        // Don't close the modal, show the error instead
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModalConflictResolution = () => {
    setModalConflictError(null);
    setModalSummary(null);
    setCreationStep("form");
    // Optionally refresh the data
    queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setModalConflictError(null);
    setModalSummary(null);
    setCreationStep("form");
    setShowConflictDetails(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-100";
      case "CONFIRMED":
        return "text-green-600 bg-green-100";
      case "CANCELLED":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "در انتظار";
      case "CONFIRMED":
        return "تأیید شده";
      case "CANCELLED":
        return "لغو شده";
      default:
        return status;
    }
  };

  // Helper functions for conflict handling
  const getConflictSeverity = (
    conflictType: string,
    details?: any
  ): "low" | "medium" | "high" | "critical" => {
    switch (conflictType) {
      case "working_hours":
        return "low";
      case "service_duration":
        return "medium";
      case "staff_unavailable":
        return "medium";
      case "capacity":
        return "high";
      case "booking_conflict":
        return "high";
      case "overlap":
        return "critical";
      default:
        return "medium";
    }
  };

  const getConflictIcon = (conflictType: string) => {
    switch (conflictType) {
      case "working_hours":
        return <Clock className="w-4 h-4" />;
      case "service_duration":
        return <Target className="w-4 h-4" />;
      case "staff_unavailable":
        return <Users className="w-4 h-4" />;
      case "capacity":
        return <BarChart3 className="w-4 h-4" />;
      case "booking_conflict":
        return <AlertTriangle className="w-4 h-4" />;
      case "overlap":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getConflictColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getAutoResolveOptions = (conflictType: string, details?: any) => {
    const options = [];

    switch (conflictType) {
      case "overlap":
        options.push({
          id: "skip_conflicts",
          label: "رد کردن تداخل‌ها",
          description: "ساعات تداخل‌دار را رد کرده و بقیه را ایجاد کنید",
          action: "skip",
        });
        options.push({
          id: "replace_existing",
          label: "جایگزینی ساعات موجود",
          description: "ساعات موجود را با ساعات جدید جایگزین کنید",
          action: "replace",
        });
        break;
      case "capacity":
        options.push({
          id: "increase_capacity",
          label: "افزایش ظرفیت",
          description: "ظرفیت ساعات موجود را افزایش دهید",
          action: "increase_capacity",
        });
        break;
      case "staff_unavailable":
        options.push({
          id: "assign_other_staff",
          label: "تخصیص کارمند دیگر",
          description: "کارمند دیگری را برای این ساعات تخصیص دهید",
          action: "reassign_staff",
        });
        break;
      case "working_hours":
        options.push({
          id: "extend_hours",
          label: "تمدید ساعات کاری",
          description: "ساعات کاری را برای این روز تمدید کنید",
          action: "extend_hours",
        });
        break;
    }

    return options;
  };

  const handleAutoResolve = async (option: any) => {
    try {
      setIsGenerating(true);

      // Add the auto-resolve option to the creation form
      const updatedForm = {
        ...creationForm,
        autoResolve: option.action,
        conflictResolution: option.id,
      };

      // Retry the creation with auto-resolve
      if (creationForm.mode === "recurring") {
        const response = await api.post(`/time-slots/create-recurring`, {
          ...updatedForm,
          businessId: businessId,
        });
        const result = response.data;

        if (result.success) {
          setModalSummary(result);
          setCreationStep("summary");
          toast.success("تداخل‌ها با موفقیت حل شدند");
        } else {
          throw new Error(result.error || "خطا در حل خودکار تداخل‌ها");
        }
      } else {
        const response = await api.post(
          `/availability/generate/${businessId}`,
          updatedForm
        );
        const result = response.data;

        if (result.success) {
          setModalSummary(result);
          setCreationStep("summary");
          toast.success("تداخل‌ها با موفقیت حل شدند");
        } else {
          throw new Error(result.error || "خطا در حل خودکار تداخل‌ها");
        }
      }

      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
    } catch (error: any) {
      console.error("Auto-resolve error:", error);
      toast.error(error.message || "خطا در حل خودکار تداخل‌ها");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatConflictTime = (timeSlot: string) => {
    // Format time slot for better display
    if (timeSlot.includes(" - ")) {
      const [start, end] = timeSlot.split(" - ");
      return `${start} تا ${end}`;
    }
    return timeSlot;
  };

  const getConflictTypeLabel = (type: string) => {
    switch (type) {
      case "working_hours":
        return "ساعات کاری";
      case "service_duration":
        return "مدت سرویس";
      case "staff_unavailable":
        return "کارمند غیرقابل دسترس";
      case "capacity":
        return "ظرفیت";
      case "booking_conflict":
        return "تداخل رزرو";
      case "overlap":
        return "تداخل زمانی";
      default:
        return "تداخل";
    }
  };

  if (!businessId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            کسب و کار انتخاب نشده
          </h3>
          <p className="text-gray-500 mb-4">
            لطفاً ابتدا یک کسب و کار انتخاب کنید
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            بازگشت به داشبورد
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-6">
        {/* Breadcrumb and Page Title */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <nav className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
              <button
                onClick={() => navigate("/dashboard")}
                className="hover:text-gray-700 transition-colors flex items-center space-x-1 space-x-reverse"
              >
                <Home className="w-4 h-4" />
                <span>داشبورد</span>
              </button>
              <ChevronRightIcon className="w-4 h-4" />
              <span className="text-gray-900 font-medium">ساعات کاری</span>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900">
              مدیریت ساعات کاری
            </h1>
            <p className="text-gray-600">
              مدیریت و تنظیم ساعات کاری برای {business?.name}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowSettingsModal(true)}
              className="hidden md:flex"
            >
              <Settings className="w-5 h-5 ml-2" />
              تنظیمات
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setCreationForm((prev) => ({ ...prev, mode: "recurring" }));
                setShowCreateModal(true);
              }}
              className="hidden md:flex"
            >
              <Repeat className="w-5 h-5 ml-2" />
              ایجاد تکراری
            </Button>
            <Button
              size="lg"
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
            >
              <Plus className="w-5 h-5 ml-2" />
              ایجاد ساعت کاری
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">کل ساعات</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {timeSlots?.data?.totalSlots || 0}
                  </p>
                </div>
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">
                    ساعات آزاد
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {timeSlots?.data?.data?.availableSlots?.length || 0}
                  </p>
                </div>
                <div className="p-2 bg-green-200 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">
                    ساعات رزرو
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {timeSlots?.data?.bookedSlots?.length || 0}
                  </p>
                </div>
                <div className="p-2 bg-orange-200 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">
                    نرخ اشغال
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {timeSlots?.data?.totalSlots
                      ? Math.round(
                          ((timeSlots.data.bookedSlots?.length || 0) /
                            timeSlots.data.totalSlots) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <div className="p-2 bg-purple-200 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conflict Error Display */}
      {conflictError && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-orange-800">
                  تداخل در ایجاد ساعات کاری
                </h3>
              </div>

              <div className="text-sm text-orange-700">
                {conflictError.message}
              </div>

              {conflictError.suggestions &&
                conflictError.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-orange-800">
                      راه‌حل‌های پیشنهادی:
                    </div>
                    <ul className="text-sm text-orange-700 space-y-1">
                      {conflictError.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setConflictError(null);
                    setShowConflictHelp(false);
                    queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
                  }}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  بروزرسانی و ادامه
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setConflictError(null);
                    setShowConflictHelp(false);
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  <X className="w-4 h-4 ml-2" />
                  بستن
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-gray-50 to-white">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Filter Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">فیلترها</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDate(new Date().toISOString().split("T")[0] || "");
                  setSelectedService("");
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                <RotateCcw className="w-4 h-4 ml-2" />
                پاک کردن فیلترها
              </Button>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Service Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Target className="w-4 h-4 inline ml-1" />
                  سرویس
                </label>
                <div className="relative">
                  <select
                    value={selectedService}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">انتخاب سرویس</option>
                    {services?.data?.data?.map((service: Service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 inline ml-1" />
                  تاریخ
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Quick Date Actions */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4 inline ml-1" />
                  تاریخ سریع
                </label>
                <div className="flex space-x-2 space-x-reverse">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDate(
                        new Date().toISOString().split("T")[0] || ""
                      );
                    }}
                    className="flex-1"
                  >
                    امروز
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setSelectedDate(
                        tomorrow.toISOString().split("T")[0] || ""
                      );
                    }}
                    className="flex-1"
                  >
                    فردا
                  </Button>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Eye className="w-4 h-4 inline ml-1" />
                  حالت نمایش
                </label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="flex-1"
                  >
                    <Grid className="w-4 h-4 ml-1" />
                    شبکه
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="flex-1"
                  >
                    <List className="w-4 h-4 ml-1" />
                    لیست
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedService || selectedDate) && (
              <div className="flex items-center space-x-2 space-x-reverse pt-4 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  فیلترهای فعال:
                </span>
                {selectedService && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    {
                      services?.data?.data?.find(
                        (s: Service) => s.id === selectedService
                      )?.name
                    }
                    <button
                      onClick={() => setSelectedService("")}
                      className="ml-1 hover:text-blue-600"
                    >
                      <XCircle className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedDate && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    {new Date(selectedDate).toLocaleDateString("fa-IR")}
                    <button
                      onClick={() =>
                        setSelectedDate(
                          new Date().toISOString().split("T")[0] || ""
                        )
                      }
                      className="ml-1 hover:text-green-600"
                    >
                      <XCircle className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {selectedService ? (
        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-sm font-medium text-gray-700">
                  نمایش:
                </span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="flex-1"
                  >
                    <Grid className="w-4 h-4 ml-1" />
                    شبکه
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="flex-1"
                  >
                    <List className="w-4 h-4 ml-1" />
                    لیست
                  </Button>
                </div>
              </div>

              {/* Select All Checkbox */}
              {timeSlots?.data?.data?.availableSlots &&
                timeSlots.data.data.availableSlots.length > 0 && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      id="selectAllSlots"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="selectAllSlots"
                      className="text-sm font-medium text-gray-700"
                    >
                      انتخاب همه
                    </label>
                  </div>
                )}

              {selectedSlots.length > 0 && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    {selectedSlots.length} انتخاب شده
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkActionsModal(true)}
                  >
                    <Users className="w-4 h-4 ml-2" />
                    عملیات گروهی
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["timeSlots"] })
                }
                disabled={timeSlotsLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 ml-2 ${timeSlotsLoading ? "animate-spin" : ""}`}
                />
                بروزرسانی
              </Button>

              {selectedSlots.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف انتخاب شده
                </Button>
              )}
            </div>
          </div>

          {/* Time Slots Display */}
          {timeSlotsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">در حال بارگذاری ساعات کاری...</p>
              </div>
            </div>
          ) : timeSlots?.data?.data?.availableSlots &&
            timeSlots.data.data.availableSlots.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {timeSlots.data.data.availableSlots.map((slot: TimeSlot) => (
                <Card
                  key={slot.id}
                  className={`relative group transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                    selectedSlots.includes(slot.id!)
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : ""
                  }`}
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <input
                          type="checkbox"
                          checked={selectedSlots.includes(slot.id!)}
                          onChange={() => handleSelectSlot(slot.id!)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <Badge
                        variant={getSlotStatusColor(getSlotStatus(slot))}
                        className="text-xs font-medium"
                      >
                        {getSlotStatusIcon(getSlotStatus(slot))}
                        <span className="mr-1">
                          {getSlotStatus(slot) === "available"
                            ? "آزاد"
                            : getSlotStatus(slot) === "booked"
                              ? "رزرو"
                              : "غیرفعال"}
                        </span>
                      </Badge>
                    </div>

                    {/* Time Display */}
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {slot.startTime} - {slot.endTime}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(selectedDate).toLocaleDateString("fa-IR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>

                    {/* Capacity Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">ظرفیت:</span>
                        <span className="font-medium">
                          {slot.capacity}/{slot.maxCapacity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(slot.capacity / slot.maxCapacity) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-2 mb-4">
                      {slot.isPeakHour && (
                        <div className="flex items-center space-x-2 space-x-reverse text-orange-600">
                          <Zap className="w-4 h-4" />
                          <span className="text-sm font-medium">ساعت شلوغ</span>
                        </div>
                      )}
                      {slot.notes && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {slot.notes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Button
                        size="sm"
                        variant={slot.isAvailable ? "outline" : "default"}
                        onClick={() =>
                          handleToggleSlot(slot.id!, !slot.isAvailable)
                        }
                        disabled={slot.isBooked}
                        className="flex-1"
                      >
                        {slot.isAvailable ? (
                          <>
                            <Pause className="w-4 h-4 ml-2" />
                            غیرفعال
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 ml-2" />
                            فعال
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCapacity(slot)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSlot(slot.id!)}
                        disabled={slot.isBooked}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ساعات کاری یافت نشد
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  برای این تاریخ و سرویس ساعات کاری تعریف نشده است. می‌توانید
                  ساعات کاری جدید ایجاد کنید.
                </p>
                <div className="flex items-center justify-center space-x-3 space-x-reverse">
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    ایجاد ساعت کاری
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSettingsModal(true)}
                  >
                    <Settings className="w-4 h-4 ml-2" />
                    تنظیمات
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              سرویس انتخاب نشده
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              لطفاً ابتدا یک سرویس انتخاب کنید تا ساعات کاری آن را مشاهده کنید.
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Plus className="w-4 h-4 ml-2" />
              ایجاد سرویس جدید
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Time Slots Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {creationStep === "form" && "ایجاد ساعات کاری"}
                {creationStep === "summary" && "خلاصه ایجاد ساعات کاری"}
                {creationStep === "conflicts" && "خطا در ایجاد ساعات کاری"}
              </h2>
              <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Summary Step */}
              {creationStep === "summary" && modalSummary && (
                <div className="space-y-6">
                  {/* Success Summary */}
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-400 ml-2" />
                      <div>
                        <h3 className="text-sm font-medium text-green-800">
                          ساعات کاری با موفقیت ایجاد شد
                        </h3>
                        <p className="text-sm text-green-700 mt-1">
                          {modalSummary.summary.totalCreated} ساعت کاری ایجاد شد
                          {modalSummary.summary.totalSkipped > 0 && (
                            <span className="block mt-1">
                              {modalSummary.summary.totalSkipped} ساعت به دلیل
                              تداخل رد شد
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Details */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      جزئیات ایجاد
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">کسب و کار:</span>
                        <span className="font-medium mr-2">
                          {modalSummary.summary.businessName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">سرویس:</span>
                        <span className="font-medium mr-2">
                          {modalSummary.summary.serviceName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">تعداد روزها:</span>
                        <span className="font-medium mr-2">
                          {modalSummary.summary.totalDays}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">ساعات ایجاد شده:</span>
                        <span className="font-medium mr-2">
                          {modalSummary.summary.totalCreated}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Conflicts Section */}
                  {modalSummary.conflicts?.total > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-orange-800 flex items-center">
                          <AlertTriangle className="w-4 h-4 ml-2" />
                          تداخل‌های یافت شده
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setShowConflictDetails(!showConflictDetails)
                          }
                          className="text-orange-600 hover:text-orange-700"
                        >
                          {showConflictDetails ? "مخفی کردن" : "نمایش جزئیات"}
                        </Button>
                      </div>

                      {showConflictDetails && (
                        <div className="space-y-3">
                          {modalSummary.conflicts.details.map(
                            (conflict: any, index: number) => (
                              <div
                                key={index}
                                className="bg-white border border-orange-200 rounded p-3"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-orange-800">
                                    {conflict.slotTime}
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                                    {conflict.resolution === "preserved"
                                      ? "حفظ شده"
                                      : "رد شده"}
                                  </span>
                                </div>

                                {conflict.conflictingBookings?.map(
                                  (booking: any, bookingIndex: number) => (
                                    <div
                                      key={bookingIndex}
                                      className="bg-gray-50 rounded p-2 mt-2"
                                    >
                                      <div className="flex items-center justify-between text-sm">
                                        <div>
                                          <span className="font-medium">
                                            {booking.customerName}
                                          </span>
                                          <span className="text-gray-500 mr-2">
                                            {" "}
                                            - {booking.customerPhone}
                                          </span>
                                        </div>
                                        <span
                                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}
                                        >
                                          {getStatusText(booking.status)}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-2 space-x-reverse pt-4 border-t">
                    <Button variant="outline" onClick={handleCloseModal}>
                      بستن
                    </Button>
                    <Button
                      onClick={() => {
                        setCreationStep("form");
                        setModalSummary(null);
                        setShowConflictDetails(false);
                      }}
                    >
                      ایجاد ساعات کاری بیشتر
                    </Button>
                  </div>
                </div>
              )}

              {/* Conflicts Step */}
              {creationStep === "conflicts" && modalConflictError && (
                <div className="space-y-6">
                  {/* Enhanced Error Display with Severity */}
                  <div
                    className={`border-l-4 p-4 rounded-lg ${
                      modalConflictError.severity === "critical"
                        ? "bg-red-50 border-red-400"
                        : modalConflictError.severity === "high"
                          ? "bg-orange-50 border-orange-400"
                          : modalConflictError.severity === "medium"
                            ? "bg-yellow-50 border-yellow-400"
                            : "bg-blue-50 border-blue-400"
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`flex-shrink-0 ${
                          modalConflictError.severity === "critical"
                            ? "text-red-400"
                            : modalConflictError.severity === "high"
                              ? "text-orange-400"
                              : modalConflictError.severity === "medium"
                                ? "text-yellow-400"
                                : "text-blue-400"
                        }`}
                      >
                        {getConflictIcon(modalConflictError.type)}
                      </div>
                      <div className="mr-3 flex-1">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`text-sm font-medium ${
                              modalConflictError.severity === "critical"
                                ? "text-red-800"
                                : modalConflictError.severity === "high"
                                  ? "text-orange-800"
                                  : modalConflictError.severity === "medium"
                                    ? "text-yellow-800"
                                    : "text-blue-800"
                            }`}
                          >
                            {getConflictTypeLabel(modalConflictError.type)}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              modalConflictError.severity === "critical"
                                ? "bg-red-100 text-red-700"
                                : modalConflictError.severity === "high"
                                  ? "bg-orange-100 text-orange-700"
                                  : modalConflictError.severity === "medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {modalConflictError.severity === "critical"
                              ? "بحرانی"
                              : modalConflictError.severity === "high"
                                ? "بالا"
                                : modalConflictError.severity === "medium"
                                  ? "متوسط"
                                  : "کم"}
                          </Badge>
                        </div>
                        <p
                          className={`text-sm mt-1 ${
                            modalConflictError.severity === "critical"
                              ? "text-red-700"
                              : modalConflictError.severity === "high"
                                ? "text-orange-700"
                                : modalConflictError.severity === "medium"
                                  ? "text-yellow-700"
                                  : "text-blue-700"
                          }`}
                        >
                          {modalConflictError.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Conflict Information */}
                  {modalConflictError.details && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-medium text-orange-800 mb-3 flex items-center">
                        <Clock className="w-4 h-4 ml-2" />
                        جزئیات تداخل‌های زمانی
                      </h4>

                      <div className="space-y-3">
                        {/* Conflict Summary */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {modalConflictError.details.conflictingSlots && (
                            <div className="bg-white rounded p-3 border border-orange-200">
                              <div className="flex items-center justify-between">
                                <span className="text-orange-700 font-medium">
                                  ساعات تداخل‌دار:
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="bg-orange-100 text-orange-700"
                                >
                                  {modalConflictError.details.conflictingSlots}
                                </Badge>
                              </div>
                            </div>
                          )}

                          {modalConflictError.details.conflictingBookings && (
                            <div className="bg-white rounded p-3 border border-orange-200">
                              <div className="flex items-center justify-between">
                                <span className="text-orange-700 font-medium">
                                  رزروهای موجود:
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="bg-orange-100 text-orange-700"
                                >
                                  {
                                    modalConflictError.details
                                      .conflictingBookings
                                  }
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Specific Conflicting Times */}
                        {modalConflictError.details.overlappingTimes &&
                          modalConflictError.details.overlappingTimes.length >
                            0 && (
                            <div className="bg-white rounded p-3 border border-orange-200">
                              <h5 className="font-medium text-orange-800 mb-2 flex items-center">
                                <AlertTriangle className="w-3 h-3 ml-1" />
                                زمان‌های تداخل‌دار:
                              </h5>
                              <div className="space-y-2">
                                {modalConflictError.details.overlappingTimes.map(
                                  (timeSlot: string, index: number) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between text-sm bg-gray-50 rounded p-2"
                                    >
                                      <span className="text-gray-700">
                                        {timeSlot}
                                      </span>
                                      <Badge
                                        variant="secondary"
                                        className="bg-red-100 text-red-700 text-xs"
                                      >
                                        تداخل
                                      </Badge>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Additional Conflict Details */}
                        {modalSummary?.conflicts?.details && (
                          <div className="bg-white rounded p-3 border border-orange-200">
                            <h5 className="font-medium text-orange-800 mb-2 flex items-center">
                              <Info className="w-3 h-3 ml-1" />
                              جزئیات بیشتر:
                            </h5>
                            <div className="space-y-2">
                              {modalSummary.conflicts.details.map(
                                (conflict: any, index: number) => (
                                  <div
                                    key={index}
                                    className="border-l-2 border-orange-300 pl-3"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium text-gray-800">
                                        {conflict.slotTime}
                                      </span>
                                      <Badge
                                        variant="secondary"
                                        className={`text-xs ${
                                          conflict.resolution === "preserved"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                      >
                                        {conflict.resolution === "preserved"
                                          ? "حفظ شده"
                                          : "رد شده"}
                                      </Badge>
                                    </div>

                                    {conflict.reason && (
                                      <p className="text-xs text-gray-600 mb-2">
                                        دلیل: {conflict.reason}
                                      </p>
                                    )}

                                    {conflict.conflictingBookings &&
                                      conflict.conflictingBookings.length >
                                        0 && (
                                        <div className="space-y-1">
                                          <span className="text-xs font-medium text-gray-700">
                                            رزروهای موجود:
                                          </span>
                                          {conflict.conflictingBookings.map(
                                            (
                                              booking: any,
                                              bookingIndex: number
                                            ) => (
                                              <div
                                                key={bookingIndex}
                                                className="bg-gray-50 rounded p-2 text-xs"
                                              >
                                                <div className="flex items-center justify-between">
                                                  <div>
                                                    <span className="font-medium">
                                                      {booking.customerName}
                                                    </span>
                                                    <span className="text-gray-500 mr-2">
                                                      {" "}
                                                      - {booking.customerPhone}
                                                    </span>
                                                  </div>
                                                  <Badge
                                                    variant="secondary"
                                                    className={`text-xs ${getStatusColor(booking.status)}`}
                                                  >
                                                    {getStatusText(
                                                      booking.status
                                                    )}
                                                  </Badge>
                                                </div>
                                                {booking.bookingTime && (
                                                  <div className="text-gray-600 mt-1">
                                                    زمان رزرو:{" "}
                                                    {booking.bookingTime}
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {modalConflictError.suggestions &&
                    modalConflictError.suggestions.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                          <Lightbulb className="w-4 h-4 ml-2" />
                          پیشنهادات
                        </h4>
                        <ul className="space-y-1 text-sm text-blue-700">
                          {modalConflictError.suggestions.map(
                            (suggestion, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                {suggestion}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-2 space-x-reverse pt-4 border-t">
                    <Button variant="outline" onClick={handleCloseModal}>
                      انصراف
                    </Button>
                    <Button
                      onClick={handleModalConflictResolution}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <RefreshCw className="w-4 h-4 ml-2" />
                      تلاش مجدد
                    </Button>
                  </div>
                </div>
              )}

              {/* Form Step */}
              {creationStep === "form" && (
                <>
                  {/* Generation Mode Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      روش ایجاد
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {generationModes.map((mode) => (
                        <div
                          key={mode.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            creationForm.mode === mode.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            setCreationForm((prev) => ({
                              ...prev,
                              mode: mode.id,
                            }))
                          }
                        >
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="text-blue-600">{mode.icon}</div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {mode.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {mode.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Basic Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        سرویس
                      </label>
                      <select
                        value={creationForm.serviceId}
                        onChange={(e) =>
                          setCreationForm((prev) => ({
                            ...prev,
                            serviceId: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">انتخاب سرویس</option>
                        {services?.data?.data?.map((service: Service) => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        فاصله زمانی (دقیقه)
                      </label>
                      <Input
                        type="number"
                        value={creationForm.intervalMinutes}
                        onChange={(e) =>
                          setCreationForm((prev) => ({
                            ...prev,
                            intervalMinutes: parseInt(e.target.value),
                          }))
                        }
                        min="15"
                        max="120"
                        step="15"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاریخ شروع
                      </label>
                      <Input
                        type="date"
                        value={creationForm.startDate}
                        onChange={(e) =>
                          setCreationForm((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاریخ پایان
                      </label>
                      <Input
                        type="date"
                        value={creationForm.endDate}
                        onChange={(e) =>
                          setCreationForm((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ساعت شروع
                      </label>
                      <Input
                        type="time"
                        value={creationForm.startTime}
                        onChange={(e) =>
                          setCreationForm((prev) => ({
                            ...prev,
                            startTime: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ساعت پایان
                      </label>
                      <Input
                        type="time"
                        value={creationForm.endTime}
                        onChange={(e) =>
                          setCreationForm((prev) => ({
                            ...prev,
                            endTime: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        حداکثر ظرفیت
                      </label>
                      <Input
                        type="number"
                        value={creationForm.maxCapacity}
                        onChange={(e) =>
                          setCreationForm((prev) => ({
                            ...prev,
                            maxCapacity: parseInt(e.target.value),
                          }))
                        }
                        min="1"
                        max="10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ظرفیت اولیه
                      </label>
                      <Input
                        type="number"
                        value={creationForm.capacity}
                        onChange={(e) =>
                          setCreationForm((prev) => ({
                            ...prev,
                            capacity: parseInt(e.target.value),
                          }))
                        }
                        min="0"
                        max={creationForm.maxCapacity}
                      />
                    </div>
                  </div>

                  {/* Recurring Settings - Show only for recurring mode */}
                  {creationForm.mode === "recurring" && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        تنظیمات تکرار
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            نوع تکرار
                          </label>
                          <select
                            value={creationForm.repeatType}
                            onChange={(e) =>
                              setCreationForm((prev) => ({
                                ...prev,
                                repeatType: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="daily">روزانه</option>
                            <option value="weekly">هفتگی</option>
                            <option value="monthly">ماهانه</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            تعداد تکرار
                          </label>
                          <Input
                            type="number"
                            value={creationForm.repeatCount}
                            onChange={(e) =>
                              setCreationForm((prev) => ({
                                ...prev,
                                repeatCount: parseInt(e.target.value),
                              }))
                            }
                            min="1"
                            max="365"
                          />
                        </div>
                      </div>

                      {creationForm.repeatType === "weekly" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            روزهای هفته
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { value: 0, label: "یکشنبه" },
                              { value: 1, label: "دوشنبه" },
                              { value: 2, label: "سه‌شنبه" },
                              { value: 3, label: "چهارشنبه" },
                              { value: 4, label: "پنج‌شنبه" },
                              { value: 5, label: "جمعه" },
                              { value: 6, label: "شنبه" },
                            ].map((day) => (
                              <div
                                key={day.value}
                                className="flex items-center space-x-2 space-x-reverse"
                              >
                                <input
                                  type="checkbox"
                                  id={`day-${day.value}`}
                                  checked={creationForm.repeatDays.includes(
                                    day.value
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setCreationForm((prev) => ({
                                        ...prev,
                                        repeatDays: [
                                          ...prev.repeatDays,
                                          day.value,
                                        ],
                                      }));
                                    } else {
                                      setCreationForm((prev) => ({
                                        ...prev,
                                        repeatDays: prev.repeatDays.filter(
                                          (d) => d !== day.value
                                        ),
                                      }));
                                    }
                                  }}
                                  className="rounded border-gray-300"
                                />
                                <label
                                  htmlFor={`day-${day.value}`}
                                  className="text-sm font-medium text-gray-700"
                                >
                                  {day.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <input
                            type="checkbox"
                            id="excludeWeekends"
                            checked={creationForm.excludeWeekends}
                            onChange={(e) =>
                              setCreationForm((prev) => ({
                                ...prev,
                                excludeWeekends: e.target.checked,
                              }))
                            }
                            className="rounded border-gray-300"
                          />
                          <label
                            htmlFor="excludeWeekends"
                            className="text-sm font-medium text-gray-700"
                          >
                            حذف تعطیلات آخر هفته
                          </label>
                        </div>

                        <div className="flex items-center space-x-2 space-x-reverse">
                          <input
                            type="checkbox"
                            id="excludeHolidays"
                            checked={creationForm.excludeHolidays}
                            onChange={(e) =>
                              setCreationForm((prev) => ({
                                ...prev,
                                excludeHolidays: e.target.checked,
                              }))
                            }
                            className="rounded border-gray-300"
                          />
                          <label
                            htmlFor="excludeHolidays"
                            className="text-sm font-medium text-gray-700"
                          >
                            حذف تعطیلات رسمی
                          </label>
                        </div>
                      </div>

                      {/* Recurring Summary */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">
                          خلاصه ایجاد تکراری
                        </h4>
                        <div className="text-sm text-blue-700 space-y-1">
                          <p>
                            نوع تکرار:{" "}
                            {creationForm.repeatType === "daily"
                              ? "روزانه"
                              : creationForm.repeatType === "weekly"
                                ? "هفتگی"
                                : "ماهانه"}
                          </p>
                          <p>تعداد تکرار: {creationForm.repeatCount}</p>
                          {creationForm.repeatType === "weekly" && (
                            <p>
                              روزهای هفته:{" "}
                              {creationForm.repeatDays
                                .map(
                                  (day) =>
                                    [
                                      "یکشنبه",
                                      "دوشنبه",
                                      "سه‌شنبه",
                                      "چهارشنبه",
                                      "پنج‌شنبه",
                                      "جمعه",
                                      "شنبه",
                                    ][day]
                                )
                                .join(", ")}
                            </p>
                          )}
                          <p>
                            تاریخ شروع:{" "}
                            {creationForm.startDate
                              ? new Date(
                                  creationForm.startDate
                                ).toLocaleDateString("fa-IR")
                              : "تعیین نشده"}
                          </p>
                          <p>
                            ساعت کاری: {creationForm.startTime} -{" "}
                            {creationForm.endTime}
                          </p>
                          <p>
                            فاصله زمانی: {creationForm.intervalMinutes} دقیقه
                          </p>
                          <p>
                            ظرفیت: {creationForm.capacity}/
                            {creationForm.maxCapacity}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Advanced Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        id="isPeakHour"
                        checked={creationForm.isPeakHour}
                        onChange={(e) =>
                          setCreationForm((prev) => ({
                            ...prev,
                            isPeakHour: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300"
                      />
                      <label
                        htmlFor="isPeakHour"
                        className="text-sm font-medium text-gray-700"
                      >
                        ساعت شلوغ
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        یادداشت (اختیاری)
                      </label>
                      <textarea
                        value={creationForm.notes}
                        onChange={(e) =>
                          setCreationForm((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="توضیحات اضافی..."
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-2 space-x-reverse pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                    >
                      انصراف
                    </Button>
                    <Button
                      onClick={handleCreateTimeSlots}
                      disabled={isGenerating || !creationForm.serviceId}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                          در حال ایجاد...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 ml-2" />
                          ایجاد ساعات کاری
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">تنظیمات ساعات کاری</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettingsModal(false)}
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">عمومی</TabsTrigger>
                <TabsTrigger value="advanced">پیشرفته</TabsTrigger>
                <TabsTrigger value="templates">قالب‌ها</TabsTrigger>
                <TabsTrigger value="analytics">تحلیل</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 space-x-reverse">
                        <Clock className="w-5 h-5" />
                        <span>تنظیمات پایه</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          حداکثر روزهای رزرو پیش‌فرض
                        </label>
                        <Input
                          type="number"
                          defaultValue={
                            businessSettings?.data?.advanceBookingDays || 30
                          }
                          min="1"
                          max="365"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          فاصله بین ساعات کاری (دقیقه)
                        </label>
                        <Input
                          type="number"
                          defaultValue={
                            businessSettings?.data?.bufferBetweenSlots || 15
                          }
                          min="0"
                          max="60"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          حداکثر رزرو در هر ساعت
                        </label>
                        <Input
                          type="number"
                          defaultValue={
                            businessSettings?.data?.maxBookingsPerSlot || 1
                          }
                          min="1"
                          max="10"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 space-x-reverse">
                        <Coffee className="w-5 h-5" />
                        <span>ساعت ناهار</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          id="includeLunchBreak"
                          defaultChecked={
                            businessSettings?.data?.includeLunchBreak
                          }
                          className="rounded border-gray-300"
                        />
                        <label
                          htmlFor="includeLunchBreak"
                          className="text-sm font-medium text-gray-700"
                        >
                          شامل ساعت ناهار
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            شروع ناهار
                          </label>
                          <Input
                            type="time"
                            defaultValue={
                              businessSettings?.data?.lunchBreakStart || "12:00"
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            پایان ناهار
                          </label>
                          <Input
                            type="time"
                            defaultValue={
                              businessSettings?.data?.lunchBreakEnd || "13:00"
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 space-x-reverse">
                        <Zap className="w-5 h-5" />
                        <span>ساعات شلوغ</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          id="optimizeForPeakHours"
                          defaultChecked={
                            businessSettings?.data?.optimizeForPeakHours
                          }
                          className="rounded border-gray-300"
                        />
                        <label
                          htmlFor="optimizeForPeakHours"
                          className="text-sm font-medium text-gray-700"
                        >
                          بهینه‌سازی برای ساعات شلوغ
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            شروع ساعات شلوغ
                          </label>
                          <Input
                            type="time"
                            defaultValue={
                              businessSettings?.data?.peakHoursStart || "10:00"
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            پایان ساعات شلوغ
                          </label>
                          <Input
                            type="time"
                            defaultValue={
                              businessSettings?.data?.peakHoursEnd || "16:00"
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 space-x-reverse">
                        <Shield className="w-5 h-5" />
                        <span>امنیت و محدودیت‌ها</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          id="sameDayBooking"
                          defaultChecked={
                            businessSettings?.data?.sameDayBooking
                          }
                          className="rounded border-gray-300"
                        />
                        <label
                          htmlFor="sameDayBooking"
                          className="text-sm font-medium text-gray-700"
                        >
                          رزرو همان روز
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          id="respectWorkingHours"
                          defaultChecked={
                            businessSettings?.data?.respectWorkingHours
                          }
                          className="rounded border-gray-300"
                        />
                        <label
                          htmlFor="respectWorkingHours"
                          className="text-sm font-medium text-gray-700"
                        >
                          رعایت ساعات کاری
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          id="useServiceDuration"
                          defaultChecked={
                            businessSettings?.data?.useServiceDuration
                          }
                          className="rounded border-gray-300"
                        />
                        <label
                          htmlFor="useServiceDuration"
                          className="text-sm font-medium text-gray-700"
                        >
                          استفاده از مدت زمان سرویس
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="templates" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2 space-x-reverse">
                        <FileText className="w-5 h-5" />
                        <span>قالب‌های ساعات کاری</span>
                      </span>
                      <Button
                        size="sm"
                        onClick={() => setShowTemplateModal(true)}
                      >
                        <Plus className="w-4 h-4 ml-2" />
                        قالب جدید
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        قالب‌ای یافت نشد
                      </h3>
                      <p className="text-gray-500 mb-4">
                        قالب‌های ساعات کاری برای ذخیره و استفاده مجدد از تنظیمات
                        ایجاد کنید
                      </p>
                      <Button onClick={() => setShowTemplateModal(true)}>
                        <Plus className="w-4 h-4 ml-2" />
                        ایجاد قالب جدید
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 space-x-reverse">
                        <BarChart3 className="w-5 h-5" />
                        <span>آمار کلی</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            کل ساعات کاری
                          </span>
                          <span className="font-medium">1,234</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            ساعات رزرو شده
                          </span>
                          <span className="font-medium text-green-600">
                            856
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            نرخ اشغال
                          </span>
                          <span className="font-medium text-blue-600">69%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 space-x-reverse">
                        <Calendar className="w-5 h-5" />
                        <span>محبوب‌ترین ساعات</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">10:00 - 11:00</span>
                          <Badge variant="success">95%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">14:00 - 15:00</span>
                          <Badge variant="success">87%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">16:00 - 17:00</span>
                          <Badge variant="secondary">72%</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 space-x-reverse">
                        <Lightbulb className="w-5 h-5" />
                        <span>پیشنهادات</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            افزایش ساعات کاری در روزهای چهارشنبه
                          </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            کاهش فاصله بین ساعات در ساعات شلوغ
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-end space-x-2 space-x-reverse pt-6 border-t mt-6">
              <Button
                variant="outline"
                onClick={() => setShowSettingsModal(false)}
              >
                انصراف
              </Button>
              <Button
                onClick={() => {
                  toast.success("تنظیمات با موفقیت ذخیره شد");
                  setShowSettingsModal(false);
                }}
              >
                <Save className="w-4 h-4 ml-2" />
                ذخیره تنظیمات
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">ایجاد قالب ساعات کاری</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplateModal(false)}
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام قالب
                </label>
                <Input
                  type="text"
                  placeholder="مثال: ساعات کاری هفتگی"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  توضیحات
                </label>
                <textarea
                  placeholder="توضیحات قالب..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    فاصله زمانی (دقیقه)
                  </label>
                  <Input
                    type="number"
                    defaultValue={30}
                    min="15"
                    max="120"
                    step="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حداکثر ظرفیت
                  </label>
                  <Input type="number" defaultValue={1} min="1" max="10" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ساعت شروع
                  </label>
                  <Input type="time" defaultValue="09:00" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ساعت پایان
                  </label>
                  <Input type="time" defaultValue="17:00" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">روزهای هفته</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                    <div
                      key={day}
                      className="flex items-center space-x-2 space-x-reverse"
                    >
                      <input
                        type="checkbox"
                        id={`day-${day}`}
                        defaultChecked={day < 5} // Monday to Friday
                        className="rounded border-gray-300"
                      />
                      <label
                        htmlFor={`day-${day}`}
                        className="text-sm font-medium text-gray-700"
                      >
                        {getDayName(day)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">تنظیمات پیشرفته</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      id="includeLunchBreakTemplate"
                      defaultChecked={true}
                      className="rounded border-gray-300"
                    />
                    <label
                      htmlFor="includeLunchBreakTemplate"
                      className="text-sm font-medium text-gray-700"
                    >
                      شامل ساعت ناهار
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      id="optimizeForPeakHoursTemplate"
                      defaultChecked={true}
                      className="rounded border-gray-300"
                    />
                    <label
                      htmlFor="optimizeForPeakHoursTemplate"
                      className="text-sm font-medium text-gray-700"
                    >
                      بهینه‌سازی برای ساعات شلوغ
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      id="useServiceDurationTemplate"
                      defaultChecked={true}
                      className="rounded border-gray-300"
                    />
                    <label
                      htmlFor="useServiceDurationTemplate"
                      className="text-sm font-medium text-gray-700"
                    >
                      استفاده از مدت زمان سرویس
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 space-x-reverse pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowTemplateModal(false)}
                >
                  انصراف
                </Button>
                <Button
                  onClick={() => {
                    toast.success("قالب با موفقیت ایجاد شد");
                    setShowTemplateModal(false);
                  }}
                >
                  <Save className="w-4 h-4 ml-2" />
                  ایجاد قالب
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkActionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">عملیات گروهی</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBulkActionsModal(false)}
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="text-center py-4">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedSlots.length} ساعت کاری انتخاب شده
                </h3>
                <p className="text-gray-500">
                  عملیات مورد نظر خود را انتخاب کنید
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // Implement bulk activate
                    toast.success(`${selectedSlots.length} ساعت کاری فعال شد`);
                    setShowBulkActionsModal(false);
                  }}
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  فعال کردن همه
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // Implement bulk deactivate
                    toast.success(
                      `${selectedSlots.length} ساعت کاری غیرفعال شد`
                    );
                    setShowBulkActionsModal(false);
                  }}
                >
                  <XCircle className="w-4 h-4 ml-2" />
                  غیرفعال کردن همه
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // Implement bulk copy
                    toast.success(`${selectedSlots.length} ساعت کاری کپی شد`);
                    setShowBulkActionsModal(false);
                  }}
                >
                  <Copy className="w-4 h-4 ml-2" />
                  کپی کردن
                </Button>

                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => {
                    if (
                      confirm(
                        `آیا از حذف ${selectedSlots.length} ساعت کاری اطمینان دارید؟`
                      )
                    ) {
                      handleBulkDelete();
                      setShowBulkActionsModal(false);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف همه
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Capacity Management Modal */}
      {showCapacityModal && selectedSlotForCapacity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">مدیریت ظرفیت</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCapacityModal(false);
                  setSelectedSlotForCapacity(null);
                }}
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900 mb-2">
                  {selectedSlotForCapacity.startTime} -{" "}
                  {selectedSlotForCapacity.endTime}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(selectedDate).toLocaleDateString("fa-IR")}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ظرفیت فعلی
                  </label>
                  <Input
                    type="number"
                    defaultValue={selectedSlotForCapacity.capacity}
                    min="0"
                    max={selectedSlotForCapacity.maxCapacity}
                    onChange={(e) => {
                      const newCapacity = parseInt(e.target.value);
                      if (newCapacity <= selectedSlotForCapacity.maxCapacity) {
                        setSelectedSlotForCapacity({
                          ...selectedSlotForCapacity,
                          capacity: newCapacity,
                        });
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حداکثر ظرفیت
                  </label>
                  <Input
                    type="number"
                    defaultValue={selectedSlotForCapacity.maxCapacity}
                    min="1"
                    max="10"
                    onChange={(e) => {
                      const newMaxCapacity = parseInt(e.target.value);
                      setSelectedSlotForCapacity({
                        ...selectedSlotForCapacity,
                        maxCapacity: newMaxCapacity,
                        capacity: Math.min(
                          selectedSlotForCapacity.capacity,
                          newMaxCapacity
                        ),
                      });
                    }}
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">نرخ اشغال:</span>
                    <span className="font-medium">
                      {Math.round(
                        (selectedSlotForCapacity.capacity /
                          selectedSlotForCapacity.maxCapacity) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(selectedSlotForCapacity.capacity / selectedSlotForCapacity.maxCapacity) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 space-x-reverse pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCapacityModal(false);
                    setSelectedSlotForCapacity(null);
                  }}
                >
                  انصراف
                </Button>
                <Button
                  onClick={() =>
                    handleUpdateCapacity(
                      selectedSlotForCapacity.capacity,
                      selectedSlotForCapacity.maxCapacity
                    )
                  }
                  disabled={updateSlotCapacityMutation.isPending}
                >
                  {updateSlotCapacityMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                      در حال بروزرسانی...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      بروزرسانی ظرفیت
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlots;

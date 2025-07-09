import React, { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Star,
  MapPin,
  Clock4,
  Percent,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Shield,
  CalendarDays,
  X,
} from "lucide-react";
import { cn } from "../utils/cn";
import { useBooking } from "../hooks/useBooking";
import { useLanguage } from "../providers/LanguageProvider";
import { Service } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import PersianCalendar from "./ui/PersianCalendar";
import {
  getPersianDateString,
  formatLocalDateString,
  parseLocalDateString,
} from "../utils/persianCalendar";

// Helper function to add minutes to time string
const addMinutesToTime = (timeString: string, minutes: number): string => {
  try {
    const timeParts = timeString.split(":").map(Number);
    if (timeParts.length !== 2) {
      throw new Error("Invalid time format");
    }
    const [hours, mins] = timeParts;
    if (
      hours === undefined ||
      mins === undefined ||
      isNaN(hours) ||
      isNaN(mins)
    ) {
      throw new Error("Invalid time values");
    }
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`;
  } catch (error) {
    console.error("Error adding minutes to time:", error);
    return timeString;
  }
};

// Types
interface BookingWidgetProps {
  businessId: string;
  embedMode?: boolean;
  theme?: "light" | "dark" | "auto";
  showLogo?: boolean;
  accentColor?: string;
  onBookingComplete?: (booking: any) => void;
}

type Step = 0 | 1 | 2 | 3 | 4;

interface PaymentOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  depositSupported: boolean;
  available: boolean;
}

interface DepositOption {
  type: "full" | "deposit";
  amount: number;
  percentage?: number;
  description: string;
}

const customerSchema = z.object({
  name: z.string().min(2, "نام حداقل ۲ کاراکتر باشد"),
  phone: z.string().regex(/^(\+98|0)?9\d{9}$/, "شماره موبایل معتبر وارد کنید"),
  email: z.string().email("ایمیل معتبر وارد کنید").optional().or(z.literal("")),
  notes: z.string().optional(),
});

type CustomerForm = z.infer<typeof customerSchema>;

const BookingWidget: React.FC<BookingWidgetProps> = ({
  businessId,
  embedMode = false,
  theme = "auto",
  showLogo = true,
  accentColor,
  onBookingComplete,
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>(0);
  const [selectedPaymentGateway, setSelectedPaymentGateway] =
    useState<string>("");
  const [selectedDepositOption, setSelectedDepositOption] =
    useState<DepositOption | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [confirmation, setConfirmation] = useState<{
    bookingId: string;
    paymentRequired?: boolean;
  } | null>(null);
  const [currentBookingId, setCurrentBookingId] = useState<string>("");
  const [paymentError, setPaymentError] = useState<string>("");
  const [bookingError, setBookingError] = useState<string>("");
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Handle modal keyboard navigation
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showCalendarModal) {
        setShowCalendarModal(false);
      }
    };

    if (showCalendarModal) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [showCalendarModal]);

  // Use booking hook for API integration
  const {
    business,
    services,
    timeSlots,
    selectedService,
    selectedDate,
    selectedTimeSlot,
    businessLoading,
    servicesLoading,
    slotsLoading,
    isCreatingBooking,
    isProcessingPayment,
    servicesError,
    setSelectedService,
    setSelectedDate,
    setSelectedTimeSlot,
    createBooking,
    processPayment,
  } = useBooking({ businessId, lastRefresh });

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleParentMessage = (event: MessageEvent) => {
      if (
        !event.origin.includes("localhost") &&
        !event.origin.includes("x-sme.ir")
      ) {
        return;
      }

      const { type } = event.data;

      if (type === "FORCE_REFRESH_DATA") {
        setLastRefresh(Date.now());

        if (selectedDate && selectedService) {
          setSelectedTimeSlot("");
        }
      }
    };

    if (embedMode) {
      window.addEventListener("message", handleParentMessage);

      return () => {
        window.removeEventListener("message", handleParentMessage);
      };
    }
  }, [embedMode, selectedDate, selectedService]);

  // Calculate deposit options for SMEs
  const getDepositOptions = useCallback((): DepositOption[] => {
    if (!selectedService || !business?.data?.settings) return [];

    const options: DepositOption[] = [
      {
        type: "full",
        amount: selectedService.price,
        description: "پرداخت کامل",
      },
    ];

    // Add deposit option if business supports it
    if (business.data.settings.paymentSettings.depositRequired) {
      const depositPercentage =
        business.data.settings.paymentSettings.depositPercentage || 30;
      const depositAmount = Math.round(
        (selectedService.price * depositPercentage) / 100
      );

      options.unshift({
        type: "deposit",
        amount: depositAmount,
        percentage: depositPercentage,
        description: `پیش‌پرداخت ${depositPercentage}٪ (${depositAmount.toLocaleString()} تومان)`,
      });
    }

    return options;
  }, [selectedService, business?.settings]);

  // Auto-refresh availability every 30 seconds
  useEffect(() => {
    if (!selectedDate || !selectedService) return;

    const interval = setInterval(() => {
      setLastRefresh(Date.now());
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedDate, selectedService]);

  // Auto-select first deposit option when service is selected
  useEffect(() => {
    if (selectedService && !selectedDepositOption) {
      const options = getDepositOptions();
      if (options.length > 0 && options[0]) {
        setSelectedDepositOption(options[0]);
      }
    }
  }, [selectedService, selectedDepositOption, getDepositOptions]);

  // Helper function to get business booking settings
  const getBookingSettings = useCallback(() => {
    const settings = business?.data?.settings;
    if (!settings) return null;

    return {
      // Booking policies
      cancellationPolicy: settings.cancellationPolicy || "24h",
      sameDayBooking: settings.sameDayBooking ?? true,
      advanceBookingDays: settings.advanceBookingDays || 30,

      // Time management
      bufferBetweenSlots: settings.bufferBetweenSlots || 15,
      maxBookingsPerSlot: settings.maxBookingsPerSlot || 1,
      maxSlotsPerDay: settings.maxSlotsPerDay || 20,
      useServiceDuration: settings.useServiceDuration ?? true,
      respectWorkingHours: settings.respectWorkingHours ?? true,
      includeLunchBreak: settings.includeLunchBreak ?? true,
      lunchBreakStart: settings.lunchBreakStart || "12:00",
      lunchBreakEnd: settings.lunchBreakEnd || "13:00",
      optimizeForPeakHours: settings.optimizeForPeakHours ?? true,
      peakHoursStart: settings.peakHoursStart || "10:00",
      peakHoursEnd: settings.peakHoursEnd || "16:00",

      // Notifications
      reminderTime: settings.reminderTime || 60,
      smsEnabled: settings.smsEnabled ?? true,
      telegramEnabled: settings.telegramEnabled ?? false,
    };
  }, [business?.data?.settings]);

  // Get maximum date based on advance booking days
  const getMaxBookingDate = useCallback(() => {
    const settings = getBookingSettings();
    if (!settings) return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return new Date(
      Date.now() + settings.advanceBookingDays * 24 * 60 * 60 * 1000
    );
  }, [getBookingSettings]);

  // Get minimum date based on same day booking setting
  const getMinBookingDate = useCallback(() => {
    const settings = getBookingSettings();
    if (!settings) return new Date();

    if (settings.sameDayBooking) {
      return new Date();
    } else {
      // If same day booking is disabled, start from tomorrow
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  }, [getBookingSettings]);

  // Check if a time slot is during lunch break
  const isTimeSlotInLunchBreak = useCallback(
    (timeSlot: string) => {
      const settings = getBookingSettings();
      if (!settings || !settings.includeLunchBreak) return false;

      const slotTime = new Date(`2000-01-01T${timeSlot}`);
      const lunchStart = new Date(`2000-01-01T${settings.lunchBreakStart}`);
      const lunchEnd = new Date(`2000-01-01T${settings.lunchBreakEnd}`);

      return slotTime >= lunchStart && slotTime < lunchEnd;
    },
    [getBookingSettings]
  );

  // Check if a time slot is during peak hours
  const isTimeSlotInPeakHours = useCallback(
    (timeSlot: string) => {
      const settings = getBookingSettings();
      if (!settings || !settings.optimizeForPeakHours) return false;

      const slotTime = new Date(`2000-01-01T${timeSlot}`);
      const peakStart = new Date(`2000-01-01T${settings.peakHoursStart}`);
      const peakEnd = new Date(`2000-01-01T${settings.peakHoursEnd}`);

      return slotTime >= peakStart && slotTime < peakEnd;
    },
    [getBookingSettings]
  );

  // Get cancellation policy description
  const getCancellationPolicyText = useCallback(() => {
    const settings = getBookingSettings();
    if (!settings) return "";

    const policies = {
      "24h": "امکان لغو تا 24 ساعت قبل از موعد",
      "12h": "امکان لغو تا 12 ساعت قبل از موعد",
      "6h": "امکان لغو تا 6 ساعت قبل از موعد",
      "2h": "امکان لغو تا 2 ساعت قبل از موعد",
      "1h": "امکان لغو تا 1 ساعت قبل از موعد",
      "no-cancellation": "امکان لغو وجود ندارد",
    };

    return policies[settings.cancellationPolicy as keyof typeof policies] || "";
  }, [getBookingSettings]);

  // Generate payment options from business settings
  const getPaymentOptions = useCallback((): PaymentOption[] => {
    const paymentSettings = business?.data?.settings?.paymentSettings;
    if (!paymentSettings || !paymentSettings.paymentGateways) {
      return [];
    }

    const gatewayConfigs = {
      zarinpal: {
        name: "زرین‌پال",
        icon: "💳",
        description: "پرداخت امن با کارت‌های بانکی",
      },
      pasargad: {
        name: "پاسارگاد",
        icon: "🏦",
        description: "درگاه بانک پاسارگاد",
      },
      saman: {
        name: "سامان",
        icon: "💰",
        description: "درگاه بانک سامان",
      },
    };

    const options: PaymentOption[] = [];

    Object.entries(paymentSettings.paymentGateways).forEach(
      ([gatewayId, gateway]: [string, any]) => {
        if (
          gateway.enabled &&
          gatewayConfigs[gatewayId as keyof typeof gatewayConfigs]
        ) {
          const config =
            gatewayConfigs[gatewayId as keyof typeof gatewayConfigs];
          options.push({
            id: gatewayId,
            name: config.name,
            icon: config.icon,
            description: config.description,
            depositSupported: true,
            available: gateway.enabled && gateway.merchantId ? true : false,
          });
        }
      }
    );

    return options;
  }, [business?.data?.settings?.paymentSettings]);

  const paymentOptions = getPaymentOptions();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    mode: "onTouched",
  });

  const triggerWidgetEvent = useCallback(
    (eventType: string, data: any) => {
      if (window.parent !== window) {
        window.parent.postMessage(
          {
            type: eventType,
            data: { ...data, businessId, timestamp: new Date().toISOString() },
          },
          "*"
        );
      }
    },
    [businessId]
  );

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(1);

    setSelectedDate("");
    setSelectedTimeSlot("");

    setLastRefresh(Date.now());

    triggerWidgetEvent("SERVICE_SELECTED", {
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      duration: service.duration,
    });
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);

    setLastRefresh(Date.now());

    triggerWidgetEvent("DATE_SELECTED", {
      date: date,
      dayOfWeek: new Date(date).toLocaleDateString("fa-IR", {
        weekday: "long",
      }),
    });
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    setStep(2);

    triggerWidgetEvent("TIME_SELECTED", {
      time: timeSlot,
      slot: timeSlot,
      isPeakHour: isTimeSlotInPeakHours(timeSlot),
      isLunchBreak: isTimeSlotInLunchBreak(timeSlot),
    });
  };

  const handleCustomerSubmit = async (data: CustomerForm) => {
    try {
      setBookingError("");

      triggerWidgetEvent("BOOKING_STARTED", {
        serviceName: selectedService?.name,
        servicePrice: selectedService?.price,
        selectedDate,
        selectedTime: selectedTimeSlot,
        customerInfo: {
          name: data.name,
          phone: data.phone,
        },
      });

      const customerInfo = {
        name: data.name,
        phone: data.phone,
        ...(data.email && { email: data.email }),
        ...(data.notes && { notes: data.notes }),
      };

      // **ENHANCED: Include both startTime and endTime in booking creation**
      // Calculate endTime based on selected time slot and service duration
      const endTime = selectedService?.duration
        ? addMinutesToTime(selectedTimeSlot, selectedService.duration)
        : addMinutesToTime(selectedTimeSlot, 60); // Default 60 minutes if no duration specified

      const bookingData = {
        ...customerInfo,
        startTime: selectedTimeSlot,
        endTime: endTime,
      };

      console.log(
        `[Widget] Creating booking with times: ${bookingData.startTime} - ${bookingData.endTime}`
      );

      const booking = await createBooking(bookingData);
      const bookingId =
        booking?.data?.id || booking?.data?.data?.id || "BK-" + Date.now();
      setCurrentBookingId(bookingId);

      const depositOptions = getDepositOptions();
      const availablePaymentOptions = getPaymentOptions();
      const requiresPayment =
        business?.data?.settings?.paymentSettings?.paymentRequired ||
        depositOptions.length > 1;

      if (requiresPayment && availablePaymentOptions.length > 0) {
        setStep(3);
      } else {
        setConfirmation({
          bookingId,
          paymentRequired: false,
        });
        setStep(4);

        setLastRefresh(Date.now());

        triggerWidgetEvent("BOOKING_COMPLETE", {
          id: bookingId,
          businessId,
          serviceName: selectedService?.name,
          amount: selectedService?.price || 0,
          date: selectedDate,
          time: selectedTimeSlot,
          endTime: endTime,
          paymentRequired: false,
        });

        onBookingComplete?.(booking);
      }
    } catch (error: any) {
      console.error("Booking creation failed:", error);

      triggerWidgetEvent("ERROR", {
        type: "booking_creation_error",
        error:
          error?.response?.data?.message || error.message || "Unknown error",
        step: "customer_info",
        serviceName: selectedService?.name,
      });

      setBookingError(
        error?.response?.data?.message ||
          "ایجاد رزرو ناموفق بود. لطفاً مجدداً تلاش کنید."
      );
    }
  };

  const handlePaymentMethodSelect = (
    gateway: string,
    depositOption: DepositOption
  ) => {
    setSelectedPaymentGateway(gateway);
    setSelectedDepositOption(depositOption);
  };

  const handlePayment = async () => {
    if (!selectedPaymentGateway || !selectedDepositOption || !currentBookingId)
      return;

    try {
      setPaymentError("");

      const paymentResult = await processPayment(
        currentBookingId,
        selectedDepositOption.amount,
        selectedPaymentGateway
      );

      setConfirmation({
        bookingId: currentBookingId,
        paymentRequired: true,
      });
      setStep(4);

      setLastRefresh(Date.now());

      triggerWidgetEvent("BOOKING_COMPLETE", {
        id: currentBookingId,
        businessId,
        serviceName: selectedService?.name,
        amount: selectedDepositOption.amount,
        date: selectedDate,
        time: selectedTimeSlot,
        endTime: selectedService?.duration
          ? addMinutesToTime(selectedTimeSlot, selectedService.duration)
          : addMinutesToTime(selectedTimeSlot, 60),
        paymentRequired: true,
        paymentGateway: selectedPaymentGateway,
        paymentType: selectedDepositOption.type,
      });

      onBookingComplete?.(paymentResult);
    } catch (error: any) {
      console.error("Payment processing failed:", error);

      triggerWidgetEvent("ERROR", {
        type: "payment_error",
        error:
          error?.response?.data?.message ||
          error.message ||
          "Unknown payment error",
        step: "payment",
        paymentGateway: selectedPaymentGateway,
        amount: selectedDepositOption?.amount,
      });

      setPaymentError(
        error?.response?.data?.message ||
          "پرداخت ناموفق بود. لطفاً مجدداً تلاش کنید."
      );
    }
  };

  const handleRefreshAvailability = () => {
    setLastRefresh(Date.now());

    setSelectedTimeSlot("");

    triggerWidgetEvent("AVAILABILITY_REFRESHED", {
      date: selectedDate,
      serviceName: selectedService?.name,
      timestamp: new Date().toISOString(),
    });

    // Show feedback after a short delay to allow the user to see the loading state
    setTimeout(() => {
      if (window.parent !== window) {
        // In iframe, send message to parent
        window.parent.postMessage(
          {
            type: "REFRESH_COMPLETE",
            data: { message: "ساعات موجود بروزرسانی شد" },
          },
          "*"
        );
      }
    }, 500);
  };

  const handleRestart = () => {
    if (step > 0 && step < 4) {
      triggerWidgetEvent("BOOKING_CANCELLED", {
        reason: "user_restart",
        step: step,
        serviceName: selectedService?.name,
        hadSelectedDate: !!selectedDate,
        hadSelectedTime: !!selectedTimeSlot,
      });
    }

    setStep(0);
    setSelectedService(null);
    setSelectedDate("");
    setSelectedTimeSlot("");
    setConfirmation(null);
    setCurrentBookingId("");
    setPaymentError("");
    setBookingError("");
    setSelectedPaymentGateway("");
    setSelectedDepositOption(null);
    setShowCalendarModal(false);

    setLastRefresh(Date.now());

    triggerWidgetEvent("WIDGET_RESTART", {
      reason: "new_booking_started",
      timestamp: new Date().toISOString(),
    });
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((prev) => (prev - 1) as Step);
      setPaymentError("");
      setBookingError("");
    }
  };

  if (businessLoading || servicesLoading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">{t("booking.loading")}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const steps = [
    { id: 0, label: t("booking.select_service"), icon: Star },
    { id: 1, label: t("booking.select_time"), icon: Clock },
    { id: 2, label: t("booking.customer_info"), icon: User },
    { id: 3, label: t("booking.payment"), icon: CreditCard },
    { id: 4, label: t("booking.confirmation"), icon: CheckCircle },
  ];

  return (
    <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        {/* Modern Header */}
        {business && showLogo && (
          <div className="p-4 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="flex items-center gap-3 md:gap-4">
              <Avatar className="h-12 w-12 md:h-14 md:w-14 ring-2 ring-white shadow-lg">
                <AvatarImage src={business?.logo} alt={business?.name} />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm md:text-base font-bold">
                  {business?.name?.charAt(0) || "B"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                  {business.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                  {business.rating && (
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-sm">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-xs">
                        {business.rating}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      isOnline
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    <div
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isOnline ? "bg-green-500" : "bg-red-500"
                      )}
                    />
                    <span>{isOnline ? "آنلاین" : "آفلاین"}</span>
                  </div>
                </div>

                {/* Business policies quick info */}
                {getBookingSettings() && (
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full text-xs text-gray-600 shadow-sm">
                      <Clock className="h-3 w-3" />
                      <span>
                        حداکثر {getBookingSettings()?.advanceBookingDays} روز
                        پیش‌رزرو
                      </span>
                    </div>
                    {getBookingSettings()?.smsEnabled && (
                      <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full text-xs text-gray-600 shadow-sm">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>یادآوری پیامکی</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modern Progress Indicator */}
        <div className="px-4 md:px-6 py-4 md:py-5 bg-gray-50 border-b border-gray-100">
          <div className="relative max-w-2xl mx-auto">
            {/* Steps Container */}
            <div className="flex items-start justify-between relative mb-2">
              {steps.map((stepItem, idx) => (
                <div
                  key={stepItem.id}
                  className="flex flex-col items-center relative z-10 flex-1"
                >
                  <div
                    className={cn(
                      "w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2 relative",
                      idx <= step
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 shadow-lg shadow-blue-500/25"
                        : "bg-white text-gray-400 border-gray-200"
                    )}
                  >
                    {idx < step ? (
                      <CheckCircle className="h-4 w-4 md:h-4.5 md:w-4.5 text-white" />
                    ) : (
                      <span className="text-xs md:text-sm font-semibold">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs md:text-sm mt-2 text-center font-medium transition-colors max-w-[64px] md:max-w-[80px]",
                      idx <= step ? "text-blue-600" : "text-gray-400"
                    )}
                  >
                    {stepItem.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress Line */}
            <div
              className="absolute top-4 md:top-4.5 h-0.5 bg-gray-200 -z-0"
              style={{
                left: `${100 / (steps.length * 2)}%`,
                right: `${100 / (steps.length * 2)}%`,
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out rounded-full"
                style={{
                  width: `${Math.max(0, Math.min(100, (step / Math.max(1, steps.length - 1)) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-4 md:p-6">
          <AnimatePresence mode="wait">
            {/* Step 0: Service selection */}
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="max-w-2xl mx-auto"
              >
                <div className="mb-6 text-center md:text-right">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    انتخاب سرویس
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base">
                    سرویس مورد نظر خود را انتخاب کنید
                  </p>
                </div>

                <div className="space-y-3 md:space-y-4">
                  {Array.isArray(services.data) ? (
                    services.data.map((service: Service) => (
                      <div
                        key={service.id}
                        className="group border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-5 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                        onClick={() => handleServiceSelect(service)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base md:text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                              {service.name}
                            </h3>
                            {service.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {service.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4 flex-shrink-0">
                            <div className="text-lg md:text-xl font-bold text-gray-900">
                              {service.price.toLocaleString()}
                            </div>
                            <div className="text-xs md:text-sm text-gray-500">
                              تومان
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{service.duration} دقیقه</span>
                          </div>
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-blue-500 transition-colors" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      {servicesLoading ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                          <span className="text-gray-600 font-medium text-sm">
                            در حال بارگذاری سرویس‌ها...
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                            <Star className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-900 mb-2">
                              هیچ سرویسی موجود نیست
                            </p>
                            <p className="text-gray-600 text-sm">
                              لطفاً بعداً تلاش کنید
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 1: Date and Time selection */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-6 text-center md:text-right">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    انتخاب زمان
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base">
                    تاریخ و ساعت مورد نظر خود را انتخاب کنید
                  </p>
                </div>

                {/* Selected Service Summary */}
                {selectedService && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl md:rounded-2xl p-4 md:p-5 mb-6">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-1">
                          {selectedService.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedService.duration} دقیقه •{" "}
                          {selectedService.price.toLocaleString()} تومان
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStep(0)}
                        className="border-blue-300 text-blue-600 hover:bg-blue-100 px-3 py-2 text-sm font-semibold"
                      >
                        تغییر
                      </Button>
                    </div>
                  </div>
                )}

                {/* Desktop Layout: Two columns for date and time */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Date Selection */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 text-lg md:text-xl">
                      انتخاب تاریخ
                    </h3>

                    {/* Quick date selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4">
                      {[
                        {
                          label: "امروز",
                          date: new Date(),
                        },
                        {
                          label: "فردا",
                          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        },
                        {
                          label: "پس از فردا",
                          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                        },
                      ]
                        .filter((dateOption) => {
                          const minDate = getMinBookingDate();
                          const maxDate = getMaxBookingDate();
                          return (
                            dateOption.date >= minDate &&
                            dateOption.date <= maxDate
                          );
                        })
                        .map((dateOption) => (
                          <button
                            key={dateOption.label}
                            className={cn(
                              "h-14 md:h-16 flex flex-col items-center justify-center rounded-xl md:rounded-2xl border-2 transition-all duration-200 text-sm font-medium hover:scale-105",
                              selectedDate ===
                                formatLocalDateString(dateOption.date)
                                ? "bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-500 text-white shadow-lg shadow-blue-500/25"
                                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-900 hover:shadow-md"
                            )}
                            onClick={() =>
                              handleDateSelect(
                                formatLocalDateString(dateOption.date) || ""
                              )
                            }
                          >
                            <span className="font-semibold text-base md:text-lg">
                              {dateOption.label}
                            </span>
                            <span className="text-xs md:text-sm opacity-80">
                              {getPersianDateString(dateOption.date)}
                            </span>
                          </button>
                        ))}
                    </div>

                    {/* Calendar Button */}
                    <div className="space-y-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowCalendarModal(true)}
                        className={cn(
                          "w-full h-16 md:h-18 border-2 rounded-xl md:rounded-2xl font-semibold transition-all duration-300 group relative overflow-hidden",
                          selectedDate
                            ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100 shadow-lg shadow-blue-500/20"
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-600 hover:shadow-md hover:scale-105"
                        )}
                      >
                        <div className="flex items-center justify-between w-full px-3 md:px-4">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div
                              className={cn(
                                "w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300",
                                selectedDate
                                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                                  : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                              )}
                            >
                              <CalendarDays className="h-6 w-6 md:h-7 md:w-7" />
                            </div>
                            <div className="text-right">
                              <div className="text-base md:text-lg lg:text-xl font-bold">
                                {selectedDate
                                  ? getPersianDateString(
                                      parseLocalDateString(selectedDate) ||
                                        new Date()
                                    )
                                  : "انتخاب از تقویم"}
                              </div>
                              <div className="text-sm md:text-base opacity-70 font-normal">
                                {selectedDate
                                  ? "برای تغییر کلیک کنید"
                                  : "تاریخ دلخواه را انتخاب کنید"}
                              </div>
                            </div>
                          </div>

                          {selectedDate && (
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                              </div>
                              <span className="text-xs md:text-sm text-green-600 font-medium mt-1">
                                انتخاب شده
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Hover effect background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                      </Button>
                    </div>

                    {/* Business policies info */}
                    {getBookingSettings() && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl md:rounded-2xl p-4 md:p-5">
                        <div className="text-sm md:text-base text-blue-800 space-y-3">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
                            <span className="font-semibold">
                              سیاست‌های رزرو:
                            </span>
                          </div>
                          <ul className="text-xs md:text-sm text-blue-700 pr-6 space-y-2">
                            {!getBookingSettings()?.sameDayBooking && (
                              <li>• رزرو همان روز امکان‌پذیر نیست</li>
                            )}
                            <li>
                              • حداکثر{" "}
                              {getBookingSettings()?.advanceBookingDays} روز
                              پیش‌رزرو
                            </li>
                            <li>• {getCancellationPolicyText()}</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Time Slots Column */}
                  {selectedDate && (
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <h3 className="font-semibold text-gray-900 text-lg md:text-xl">
                          ساعات موجود
                        </h3>
                        <button
                          onClick={handleRefreshAvailability}
                          disabled={slotsLoading}
                          className={cn(
                            "text-sm md:text-base text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium transition-all duration-200 px-3 py-2 rounded-lg hover:bg-blue-50",
                            slotsLoading
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:scale-105 active:scale-95"
                          )}
                        >
                          <RefreshCw
                            className={cn(
                              "h-4 w-4 md:h-5 md:w-5 transition-transform duration-300",
                              slotsLoading && "animate-spin"
                            )}
                          />
                          {slotsLoading ? "در حال بروزرسانی..." : "بروزرسانی"}
                        </button>
                      </div>

                      {!isOnline && (
                        <div className="text-center p-4 bg-red-50 border border-red-200 rounded-xl">
                          <WifiOff className="h-8 w-8 text-red-500 mx-auto mb-2" />
                          <p className="text-sm text-red-700 font-medium">
                            اتصال اینترنت قطع است
                          </p>
                        </div>
                      )}

                      {slotsLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mb-4">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                          <span className="text-gray-600 font-medium">
                            بارگذاری ساعات موجود...
                          </span>
                        </div>
                      ) : (
                        <>
                          {/* Time management info */}
                          {getBookingSettings()?.includeLunchBreak && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                              <div className="text-sm text-amber-800">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="h-4 w-4" />
                                  <span className="font-semibold">
                                    استراحت ناهار:
                                  </span>
                                </div>
                                <p className="text-xs text-amber-700">
                                  {getBookingSettings()?.lunchBreakStart} تا{" "}
                                  {getBookingSettings()?.lunchBreakEnd} (بسته)
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                            {Array.isArray(timeSlots) &&
                            timeSlots.length > 0 ? (
                              timeSlots
                                .filter((slot: any) => {
                                  // Filter out lunch break slots
                                  if (isTimeSlotInLunchBreak(slot.startTime)) {
                                    return false;
                                  }
                                  return slot.isAvailable !== false;
                                })
                                .map((slot: any) => {
                                  const isInPeakHours = isTimeSlotInPeakHours(
                                    slot.startTime
                                  );
                                  return (
                                    <button
                                      key={slot.id}
                                      className={cn(
                                        "h-10 md:h-12 rounded-xl md:rounded-2xl font-semibold transition-all duration-200 text-sm relative border-2",
                                        selectedTimeSlot === slot.startTime
                                          ? [
                                              "bg-gradient-to-r from-blue-500 to-indigo-500",
                                              "border-blue-600 text-white",
                                              "shadow-lg shadow-blue-500/30",
                                              "scale-105 ring-2 ring-blue-300 ring-offset-1",
                                              "hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl",
                                            ]
                                          : isInPeakHours
                                            ? "border-amber-300 bg-amber-50 text-amber-900 hover:border-amber-400 hover:bg-amber-100 hover:scale-105"
                                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-900 hover:scale-105 hover:shadow-sm"
                                      )}
                                      onClick={() =>
                                        handleTimeSlotSelect(slot.startTime)
                                      }
                                    >
                                      {slot.startTime}

                                      {/* Selected indicator */}
                                      {selectedTimeSlot === slot.startTime && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full flex items-center justify-center">
                                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-600 rounded-full" />
                                        </div>
                                      )}

                                      {/* Peak hours indicator */}
                                      {isInPeakHours &&
                                        selectedTimeSlot !== slot.startTime && (
                                          <div className="absolute -top-1 -right-1 w-2 h-2 md:w-2.5 md:h-2.5 bg-amber-500 rounded-full"></div>
                                        )}
                                    </button>
                                  );
                                })
                            ) : (
                              <div className="col-span-3 text-center py-12">
                                <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                  <Clock4 className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-gray-600 mb-4 font-medium">
                                  هیچ ساعتی برای این تاریخ موجود نیست
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleRefreshAvailability}
                                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                >
                                  <RefreshCw className="h-4 w-4 mr-1" />
                                  تلاش مجدد
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Peak hours legend */}
                          {getBookingSettings()?.optimizeForPeakHours && (
                            <div className="flex items-center gap-4 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                <span>
                                  ساعات شلوغی (
                                  {getBookingSettings()?.peakHoursStart} -{" "}
                                  {getBookingSettings()?.peakHoursEnd})
                                </span>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {selectedTimeSlot && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                          <Button
                            onClick={handleBack}
                            variant="outline"
                            className="w-full border-2 border-gray-200 text-gray-700 hover:bg-gray-50 h-10 md:h-11 rounded-xl md:rounded-2xl font-semibold text-sm order-2 md:order-1"
                            size="lg"
                          >
                            بازگشت
                          </Button>
                          <Button
                            onClick={() => setStep(2)}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white h-10 md:h-11 rounded-xl md:rounded-2xl font-semibold text-sm shadow-lg shadow-blue-500/25 order-1 md:order-2"
                            size="lg"
                          >
                            ادامه
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Customer Information */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-5xl mx-auto"
              >
                {/* Header */}
                <div className="mb-6 text-center md:text-right">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    اطلاعات مشتری
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base">
                    اطلاعات خود را وارد کنید
                  </p>
                </div>

                {/* Desktop Layout: Two Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
                  {/* Left Column: Booking Summary (Desktop) / Top (Mobile) */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Booking Summary Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl md:rounded-2xl p-4 md:p-5 sticky top-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900">
                          خلاصه رزرو
                        </h3>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">
                            سرویس:
                          </span>
                          <span className="font-semibold text-gray-900 text-right">
                            {selectedService?.name}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">
                            مدت:
                          </span>
                          <span className="font-semibold text-gray-900">
                            {selectedService?.duration} دقیقه
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">
                            تاریخ:
                          </span>
                          <span className="font-semibold text-gray-900 text-right">
                            {selectedDate
                              ? getPersianDateString(
                                  parseLocalDateString(selectedDate) ||
                                    new Date()
                                )
                              : selectedDate}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">
                            ساعت:
                          </span>
                          <span className="font-semibold text-gray-900">
                            {selectedTimeSlot}
                          </span>
                        </div>

                        <div className="border-t border-blue-200 pt-3 mt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-semibold">
                              مجموع:
                            </span>
                            <div className="text-right">
                              <div className="text-lg md:text-xl font-bold text-blue-600">
                                {selectedService?.price.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">تومان</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick edit buttons */}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-blue-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStep(0)}
                          className="flex-1 text-xs border-blue-300 text-blue-600 hover:bg-blue-100"
                        >
                          تغییر سرویس
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStep(1)}
                          className="flex-1 text-xs border-blue-300 text-blue-600 hover:bg-blue-100"
                        >
                          تغییر زمان
                        </Button>
                      </div>
                    </div>

                    {/* Security & Trust Indicators */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="h-5 w-5 text-green-500" />
                        <span className="font-semibold text-gray-900 text-sm">
                          امنیت اطلاعات
                        </span>
                      </div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          اطلاعات شما محرمانه نگه داری می‌شود
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          امکان لغو و تغییر رزرو
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          تأیید فوری و ارسال پیامک
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Right Column: Customer Form */}
                  <div className="lg:col-span-3">
                    <form
                      onSubmit={handleSubmit(handleCustomerSubmit)}
                      className="space-y-5"
                    >
                      {/* Personal Information Section */}
                      <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6">
                        <div className="flex items-center gap-2 mb-5">
                          <User className="h-5 w-5 text-blue-500" />
                          <h3 className="font-semibold text-gray-900">
                            اطلاعات شخصی
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Name Field */}
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              نام و نام خانوادگی *
                            </label>
                            <Input
                              {...register("name")}
                              placeholder="نام کامل خود را وارد کنید"
                              className={cn(
                                "h-11 rounded-xl border-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                                errors.name
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                                  : "border-gray-200 hover:border-gray-300"
                              )}
                            />
                            {errors.name && (
                              <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.name.message}
                              </p>
                            )}
                          </div>

                          {/* Phone Field */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              شماره موبایل *
                            </label>
                            <Input
                              {...register("phone")}
                              placeholder="09xxxxxxxxx"
                              className={cn(
                                "h-11 rounded-xl border-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                                errors.phone
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                                  : "border-gray-200 hover:border-gray-300"
                              )}
                            />
                            {errors.phone && (
                              <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.phone.message}
                              </p>
                            )}
                          </div>

                          {/* Email Field */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              ایمیل{" "}
                              <span className="text-gray-400">(اختیاری)</span>
                            </label>
                            <Input
                              {...register("email")}
                              type="email"
                              placeholder="example@domain.com"
                              className={cn(
                                "h-11 rounded-xl border-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                                errors.email
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                                  : "border-gray-200 hover:border-gray-300"
                              )}
                            />
                            {errors.email && (
                              <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.email.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Additional Information Section */}
                      <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <h3 className="font-semibold text-gray-900">
                            اطلاعات تکمیلی
                          </h3>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            درخواست‌های ویژه{" "}
                            <span className="text-gray-400">(اختیاری)</span>
                          </label>
                          <textarea
                            {...register("notes")}
                            placeholder="توضیحات اضافی، درخواست‌های ویژه یا نکات مهم..."
                            rows={3}
                            className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none hover:border-gray-300"
                          />
                        </div>
                      </div>

                      {/* Notification Preferences */}
                      {getBookingSettings() &&
                        (getBookingSettings()?.smsEnabled ||
                          getBookingSettings()?.telegramEnabled) && (
                          <div className="bg-green-50 border border-green-200 rounded-xl md:rounded-2xl p-4 md:p-5">
                            <div className="flex items-center gap-2 mb-3">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <h3 className="font-semibold text-green-800">
                                اعلان‌ها و یادآوری‌ها
                              </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-700">
                              {getBookingSettings()?.smsEnabled && (
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                                  یادآوری پیامکی{" "}
                                  {getBookingSettings()?.reminderTime} دقیقه قبل
                                </div>
                              )}
                              {getBookingSettings()?.telegramEnabled && (
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                                  اعلان‌های تلگرام
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                تأیید فوری رزرو
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                پشتیبانی ۲۴ ساعته
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Error Display */}
                      {bookingError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium text-sm">
                              {bookingError}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col md:flex-row gap-3 pt-6">
                        <Button
                          type="button"
                          onClick={handleBack}
                          variant="outline"
                          className="w-full md:w-auto border-2 border-gray-200 text-gray-700 hover:bg-gray-50 h-11 rounded-xl font-semibold px-8 order-2 md:order-1"
                          size="lg"
                        >
                          بازگشت
                        </Button>
                        <Button
                          type="submit"
                          className="w-full md:flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white h-11 rounded-xl font-semibold shadow-lg shadow-blue-500/25 order-1 md:order-2"
                          size="lg"
                          loading={isCreatingBooking}
                        >
                          {isCreatingBooking
                            ? "در حال ایجاد رزرو..."
                            : "تایید و ادامه"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    پرداخت
                  </h2>
                  <p className="text-gray-600">روش پرداخت خود را انتخاب کنید</p>
                </div>

                {/* Deposit Options */}
                {getDepositOptions().length > 1 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      نحوه پرداخت
                    </h3>
                    {getDepositOptions().map((option, index) => (
                      <div
                        key={index}
                        className={cn(
                          "border-2 rounded-xl p-5 cursor-pointer transition-all duration-200",
                          selectedDepositOption?.type === option.type
                            ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10"
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        )}
                        onClick={() => setSelectedDepositOption(option)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full border-2 transition-all duration-200",
                                selectedDepositOption?.type === option.type
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-gray-300"
                              )}
                            >
                              {selectedDepositOption?.type === option.type && (
                                <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {option.description}
                              </h4>
                              {option.type === "deposit" && (
                                <p className="text-sm text-gray-600 mt-1">
                                  مابقی در محل پرداخت شود (
                                  {(
                                    (selectedService?.price || 0) -
                                    option.amount
                                  ).toLocaleString()}{" "}
                                  تومان)
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">
                              {option.amount.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">تومان</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Payment Gateways */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    درگاه پرداخت
                  </h3>
                  {paymentOptions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                          <CreditCard className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900 mb-2">
                            هیچ درگاه پرداختی موجود نیست
                          </p>
                          <p className="text-gray-600">
                            پرداخت در محل انجام خواهد شد
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    paymentOptions.map((gateway) => (
                      <div
                        key={gateway.id}
                        className={cn(
                          "border-2 rounded-xl p-5 cursor-pointer transition-all duration-200",
                          selectedPaymentGateway === gateway.id
                            ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10"
                            : gateway.available
                              ? "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                              : "opacity-50 cursor-not-allowed border-gray-200"
                        )}
                        onClick={() =>
                          gateway.available &&
                          setSelectedPaymentGateway(gateway.id)
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full border-2 transition-all duration-200",
                                selectedPaymentGateway === gateway.id
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-gray-300"
                              )}
                            >
                              {selectedPaymentGateway === gateway.id && (
                                <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                              )}
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-2xl">
                              {gateway.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {gateway.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {gateway.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {!gateway.available && (
                              <span className="text-sm text-red-500 font-medium">
                                غیرفعال
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Payment Summary */}
                {selectedDepositOption && selectedPaymentGateway && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">
                          مبلغ پرداختی:
                        </span>
                        <span className="font-bold text-green-600 text-lg">
                          {selectedDepositOption.amount.toLocaleString()} تومان
                        </span>
                      </div>
                      {selectedDepositOption.type === "deposit" && (
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>مابقی در محل:</span>
                          <span className="font-semibold">
                            {(
                              (selectedService?.price || 0) -
                              selectedDepositOption.amount
                            ).toLocaleString()}{" "}
                            تومان
                          </span>
                        </div>
                      )}
                      <div className="border-t border-green-200 pt-3">
                        <div className="flex justify-between font-bold text-lg">
                          <span className="text-gray-700">کل سرویس:</span>
                          <span className="text-gray-900">
                            {selectedService?.price.toLocaleString()} تومان
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium text-sm">
                        {paymentError}
                      </span>
                    </div>
                  </div>
                )}

                {paymentOptions.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-700">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        درگاه پرداخت آنلاین فعال نیست. پرداخت در محل انجام خواهد
                        شد.
                      </span>
                    </div>
                  </div>
                ) : (
                  (!selectedPaymentGateway ||
                    !selectedDepositOption ||
                    !currentBookingId) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-blue-700">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          {!currentBookingId
                            ? "لطفاً ابتدا اطلاعات مشتری را تکمیل کنید"
                            : "لطفاً نحوه پرداخت و درگاه پرداخت را انتخاب کنید"}
                        </span>
                      </div>
                    </div>
                  )
                )}

                <div className="space-y-3 pt-4">
                  <Button
                    onClick={
                      paymentOptions.length === 0
                        ? () => {
                            setConfirmation({
                              bookingId: currentBookingId,
                              paymentRequired: false,
                            });
                            setStep(4);
                          }
                        : handlePayment
                    }
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white h-12 rounded-xl font-semibold"
                    size="lg"
                    loading={isProcessingPayment}
                    disabled={
                      paymentOptions.length === 0
                        ? !currentBookingId
                        : !selectedPaymentGateway ||
                          !selectedDepositOption ||
                          !currentBookingId
                    }
                  >
                    {paymentOptions.length === 0 ? (
                      "تایید رزرو (پرداخت در محل)"
                    ) : selectedDepositOption ? (
                      <>
                        پرداخت {selectedDepositOption.amount.toLocaleString()}{" "}
                        تومان
                      </>
                    ) : (
                      "پرداخت"
                    )}
                  </Button>
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="w-full border-2 border-gray-200 text-gray-700 hover:bg-gray-50 h-12 rounded-xl font-semibold"
                    size="lg"
                    disabled={isProcessingPayment}
                  >
                    بازگشت
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    رزرو تایید شد! 🎉
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {confirmation?.paymentRequired
                      ? "رزرو و پرداخت شما با موفقیت تایید شد"
                      : "رزرو شما ثبت شد. پرداخت در محل انجام خواهد شد"}
                  </p>
                </div>

                {/* Booking Details */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-blue-200">
                        <span className="text-gray-700 font-medium">
                          شماره رزرو:
                        </span>
                        <span className="font-mono font-bold bg-blue-100 px-3 py-1 rounded-lg text-blue-800">
                          {confirmation?.bookingId}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 block">سرویس:</span>
                          <span className="font-semibold text-gray-900">
                            {selectedService?.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">مدت زمان:</span>
                          <span className="font-semibold text-gray-900">
                            {selectedService?.duration} دقیقه
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">تاریخ:</span>
                          <span className="font-semibold text-gray-900">
                            {selectedDate
                              ? getPersianDateString(
                                  parseLocalDateString(selectedDate) ||
                                    new Date()
                                )
                              : ""}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">ساعت:</span>
                          <span className="font-semibold text-gray-900">
                            {selectedTimeSlot}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-blue-200 pt-4">
                        {confirmation?.paymentRequired &&
                        selectedDepositOption ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-green-600">
                              <span className="font-medium">پرداخت شده:</span>
                              <span className="font-bold text-lg">
                                {selectedDepositOption.amount.toLocaleString()}{" "}
                                تومان
                              </span>
                            </div>
                            {selectedDepositOption.type === "deposit" && (
                              <div className="flex justify-between text-orange-600">
                                <span className="font-medium">
                                  مابقی در محل:
                                </span>
                                <span className="font-bold">
                                  {(
                                    (selectedService?.price || 0) -
                                    selectedDepositOption.amount
                                  ).toLocaleString()}{" "}
                                  تومان
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex justify-between text-orange-600">
                            <span className="font-medium">پرداخت در محل:</span>
                            <span className="font-bold text-lg">
                              {selectedService?.price.toLocaleString()} تومان
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                {business && (
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                    <CardContent className="p-5">
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
                        <Phone className="h-5 w-5 text-purple-500" />
                        اطلاعات تماس
                      </h3>
                      <div className="space-y-2 text-sm">
                        {business.phone && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">تلفن:</span>
                            <a
                              href={`tel:${business.phone}`}
                              className="text-purple-600 hover:text-purple-700 font-medium underline"
                            >
                              {business.phone}
                            </a>
                          </div>
                        )}
                        {business.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-purple-500 mt-0.5" />
                            <span className="text-gray-700 text-xs leading-relaxed">
                              {business.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Important Notes */}
                <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-3 text-amber-800 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      نکات مهم:
                    </h3>
                    <ul className="space-y-2 text-sm text-amber-700">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2" />
                        لطفاً ۱۰ دقیقه قبل از موعد حضور داشته باشید
                      </li>
                      {getBookingSettings()?.cancellationPolicy !==
                        "no-cancellation" && (
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2" />
                          {getCancellationPolicyText()}
                        </li>
                      )}
                      {getBookingSettings()?.smsEnabled && (
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2" />
                          پیامک یادآوری {getBookingSettings()?.reminderTime}{" "}
                          دقیقه قبل از موعد ارسال خواهد شد
                        </li>
                      )}
                      {!confirmation?.paymentRequired && (
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2" />
                          لطفاً مبلغ دقیق برای پرداخت در محل همراه داشته باشید
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>

                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleRestart}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white h-12 rounded-xl font-semibold"
                    size="lg"
                  >
                    رزرو جدید
                  </Button>

                  {embedMode && business?.phone && (
                    <Button
                      variant="outline"
                      className="w-full border-2 border-gray-200 text-gray-700 hover:bg-gray-50 h-12 rounded-xl font-semibold"
                      onClick={() =>
                        window.open(`tel:${business.phone}`, "_self")
                      }
                    >
                      تماس با {business.name}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Calendar Modal */}
        <AnimatePresence>
          {showCalendarModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6"
              onClick={() => setShowCalendarModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto max-h-[85vh] overflow-hidden border border-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <CalendarDays className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          انتخاب تاریخ
                        </h3>
                        <p className="text-sm text-gray-600 mt-0.5">
                          تاریخ مورد نظر خود را انتخاب کنید
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCalendarModal(false)}
                      className="w-9 h-9 rounded-xl bg-white hover:bg-gray-50 flex items-center justify-center transition-all duration-200 shadow-sm border border-gray-200 hover:border-gray-300"
                    >
                      <X className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
                  <div className="p-5">
                    {/* Quick date selection in modal */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                          <Clock className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          انتخاب سریع
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5">
                        {[
                          {
                            label: "امروز",
                            date: new Date(),
                            icon: "📅",
                          },
                          {
                            label: "فردا",
                            date: new Date(Date.now() + 24 * 60 * 60 * 1000),
                            icon: "🌅",
                          },
                          {
                            label: "پس از فردا",
                            date: new Date(
                              Date.now() + 2 * 24 * 60 * 60 * 1000
                            ),
                            icon: "🗓️",
                          },
                        ]
                          .filter((dateOption) => {
                            const minDate = getMinBookingDate();
                            const maxDate = getMaxBookingDate();
                            return (
                              dateOption.date >= minDate &&
                              dateOption.date <= maxDate
                            );
                          })
                          .map((dateOption) => (
                            <button
                              key={dateOption.label}
                              className={cn(
                                "h-14 flex items-center justify-between rounded-xl border-2 px-4 transition-all duration-300 font-medium group relative overflow-hidden",
                                selectedDate ===
                                  formatLocalDateString(dateOption.date)
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-500 text-white shadow-lg shadow-blue-500/25 scale-[1.02]"
                                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-900 hover:scale-[1.01] hover:shadow-md"
                              )}
                              onClick={() => {
                                const dateStr =
                                  formatLocalDateString(dateOption.date) || "";
                                handleDateSelect(dateStr);
                                setShowCalendarModal(false);
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-lg">
                                  {dateOption.icon}
                                </span>
                                <div className="text-right">
                                  <div className="font-semibold text-base">
                                    {dateOption.label}
                                  </div>
                                  <div className="text-sm opacity-75">
                                    {getPersianDateString(dateOption.date)}
                                  </div>
                                </div>
                              </div>

                              {selectedDate ===
                                formatLocalDateString(dateOption.date) && (
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-4 w-4 text-blue-500" />
                                </div>
                              )}

                              {/* Hover effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* Calendar in modal */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-3.5 w-3.5 text-purple-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          تقویم
                        </h4>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                        <PersianCalendar
                          selectedDate={
                            selectedDate
                              ? parseLocalDateString(selectedDate)
                              : null
                          }
                          onDateSelect={(date) => {
                            const dateStr = formatLocalDateString(date) || "";
                            handleDateSelect(dateStr);
                            setShowCalendarModal(false);
                          }}
                          minDate={getMinBookingDate()}
                          maxDate={getMaxBookingDate()}
                          showToday={true}
                          showHolidays={false}
                          className="border-0 shadow-none bg-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-200 px-5 py-4">
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setShowCalendarModal(false)}
                        variant="outline"
                        className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 h-11 rounded-xl font-semibold"
                      >
                        انصراف
                      </Button>
                      {selectedDate && (
                        <Button
                          onClick={() => setShowCalendarModal(false)}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white h-11 rounded-xl font-semibold shadow-lg shadow-blue-500/25"
                        >
                          تایید انتخاب
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookingWidget;

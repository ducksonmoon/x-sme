import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useBusiness } from "@/contexts/BusinessContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import BookingForm from "@/components/BookingForm";
import UsageLimitWarning from "@/components/UsageLimitWarning";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PersianCalendar } from "@/components/ui/PersianCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useRealtimeBookings from "@/hooks/useRealtimeBookings";
import toast from "react-hot-toast";
import {
  getPersianDateString,
  getPersianDayName,
  formatLocalDateString,
  parseLocalDateString,
  getTehranDate,
  getCurrentPersianDate,
  toPersianDigits,
  normalizeDate,
} from "@/utils/persianCalendar";

// View modes for the bookings page
type ViewMode = "calendar" | "list" | "timeline";

const Bookings: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { business, businessId, isAdmin } = useBusiness();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [quickFilterMode, setQuickFilterMode] = useState<string>("all");
  const [connectionStatus, setConnectionStatus] =
    useState<string>("connecting");

  // Real-time booking updates
  const {
    isConnected,
    connectionError,
    connectionStatus: realtimeStatus,
    liveBookings,
    subscribeToBusinessUpdates,
    requestLiveBookings,
  } = useRealtimeBookings({
    businessId: businessId || "",
    autoConnect: !!businessId,
    onBookingCreated: (booking) => {
      queryClient.invalidateQueries({ queryKey: ["business-bookings"] });
      toast.success(`📅 رزرو جدید: ${booking.customerName}`, {
        duration: 4000,
        icon: "🔔",
      });
    },
    onBookingUpdated: (booking, previousStatus) => {
      queryClient.invalidateQueries({ queryKey: ["business-bookings"] });
      const statusText =
        {
          PENDING: "در انتظار",
          CONFIRMED: "تایید شده",
          CANCELLED: "لغو شده",
          COMPLETED: "تکمیل شده",
          NO_SHOW: "عدم حضور",
        }[booking.status] || booking.status;

      toast.success(
        `📝 بروزرسانی رزرو ${booking.customerName}: ${statusText}`,
        {
          duration: 3000,
          icon: "🔄",
        }
      );
    },
    onBookingCancelled: (booking) => {
      queryClient.invalidateQueries({ queryKey: ["business-bookings"] });
      toast.error(`❌ لغو رزرو: ${booking.customerName}`, {
        duration: 4000,
        icon: "🚫",
      });
    },
  });

  // Set up quick filter date ranges
  const getQuickFilterDates = (mode: string) => {
    const today = getTehranDate();
    const todayNormalized = normalizeDate(today);

    switch (mode) {
      case "today":
        return { start: todayNormalized, end: todayNormalized };
      case "week":
        const startOfWeek = new Date(todayNormalized);
        startOfWeek.setDate(
          todayNormalized.getDate() - todayNormalized.getDay() + 6
        ); // Saturday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return { start: startOfWeek, end: endOfWeek };
      case "month":
        const startOfMonth = new Date(
          todayNormalized.getFullYear(),
          todayNormalized.getMonth(),
          1
        );
        const endOfMonth = new Date(
          todayNormalized.getFullYear(),
          todayNormalized.getMonth() + 1,
          0
        );
        return { start: startOfMonth, end: endOfMonth };
      default:
        return { start: null, end: null };
    }
  };

  // Apply quick filter
  const handleQuickFilterChange = (mode: string) => {
    setQuickFilterMode(mode);
    const dates = getQuickFilterDates(mode);
    setSelectedDateRange(dates);
  };

  // Update connection status and subscribe when connected
  useEffect(() => {
    setConnectionStatus(realtimeStatus);

    // Subscribe to updates when connected and businessId is available
    if (isConnected && businessId) {
      subscribeToBusinessUpdates(businessId);
      requestLiveBookings(businessId);
    }
  }, [
    isConnected,
    realtimeStatus,
    businessId,
    subscribeToBusinessUpdates,
    requestLiveBookings,
  ]);

  // Fetch subscription data for usage limits
  const { data: subscription } = useQuery({
    queryKey: ["subscription", businessId],
    queryFn: async () => {
      if (businessId) {
        const response = await fetch(
          `/api/subscriptions/business/${businessId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
      }
      return Promise.resolve(null);
    },
    enabled: !!businessId,
  });

  // Fetch available plans for upgrade
  const { data: plans } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const response = await fetch("/api/subscriptions/plans", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
  });

  // Fetch bookings with enhanced filtering
  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: [
      "business-bookings",
      businessId,
      selectedStatus,
      searchTerm,
      selectedDateRange.start,
      selectedDateRange.end,
    ],
    queryFn: () => {
      if (businessId) {
        const params: any = {
          status: selectedStatus !== "all" ? selectedStatus : undefined,
          search: searchTerm || undefined,
        };

        // Add date range filtering
        if (selectedDateRange.start) {
          params.startDate = formatLocalDateString(selectedDateRange.start);
        }
        if (selectedDateRange.end) {
          params.endDate = formatLocalDateString(selectedDateRange.end);
        }

        return dashboardApi.getBookings(businessId, params);
      }
      return Promise.resolve(null);
    },
    enabled: !!businessId,
  });

  // Update booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      return dashboardApi.updateBooking(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-bookings"] });
      toast.success("وضعیت رزرو با موفقیت بروزرسانی شد");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "خطا در بروزرسانی وضعیت رزرو"
      );
    },
  });

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: bookingId, status: newStatus });
  };

  const handleBookingFormSuccess = () => {
    setShowBookingForm(false);
    // Refresh bookings list
    queryClient.invalidateQueries({ queryKey: ["business-bookings"] });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        label: "در انتظار",
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      },
      CONFIRMED: {
        label: "تایید شده",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      },
      CANCELLED: {
        label: "لغو شده",
        color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      },
      COMPLETED: {
        label: "تکمیل شده",
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  // Group bookings by date for calendar view
  const bookingsByDate = useMemo(() => {
    const bookingsData = bookings?.data?.bookings || [];
    const grouped = new Map<string, any[]>();

    bookingsData.forEach((booking: any) => {
      const dateStr = formatLocalDateString(new Date(booking.date));
      if (dateStr) {
        if (!grouped.has(dateStr)) {
          grouped.set(dateStr, []);
        }
        grouped.get(dateStr)?.push(booking);
      }
    });

    return grouped;
  }, [bookings]);

  if (loadingBookings) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const bookingsData = bookings?.data?.bookings || [];

  // Calculate summary stats
  const stats = {
    total: bookingsData.length,
    pending: bookingsData.filter((b: any) => b.status === "PENDING").length,
    confirmed: bookingsData.filter((b: any) => b.status === "CONFIRMED").length,
    completed: bookingsData.filter((b: any) => b.status === "COMPLETED").length,
    cancelled: bookingsData.filter((b: any) => b.status === "CANCELLED").length,
    totalRevenue: bookingsData
      .filter((b: any) => b.status === "COMPLETED")
      .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  مدیریت رزروها
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  مدیریت و پیگیری رزروهای {business?.name || "کسب‌وکار"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Real-time Connection Status */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === "connected"
                      ? "bg-green-500 animate-pulse"
                      : connectionStatus === "error"
                        ? "bg-red-500"
                        : "bg-yellow-500 animate-pulse"
                  }`}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {connectionStatus === "connected"
                    ? "آنلاین"
                    : connectionStatus === "error"
                      ? "خطا در اتصال"
                      : "در حال اتصال..."}
                </span>
                {connectionStatus === "connected" && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    ⚡ Live
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  بازگشت
                </Button>

                <Button
                  onClick={() => setShowBookingForm(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  رزرو جدید
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Limit Warning */}
        {subscription?.plan && plans && (
          <UsageLimitWarning
            type="bookings"
            current={subscription.usage?.bookingsThisMonth || 0}
            limit={subscription.plan.bookingsLimit}
            plan={subscription.plan}
            availablePlans={plans}
            billingCycle={subscription.billingCycle as "MONTHLY" | "YEARLY"}
          />
        )}

        {/* Enhanced Summary Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card
            className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              selectedStatus === "all"
                ? "ring-2 ring-blue-400 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800/40 dark:to-blue-700/40"
                : "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
            } border-blue-200 dark:border-blue-800 shadow-md`}
            onClick={() => setSelectedStatus("all")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    کل رزروها
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {toPersianDigits(stats.total)}
                  </p>
                </div>
                <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-xl">
                  <svg
                    className="w-5 h-5 text-blue-700 dark:text-blue-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800 shadow-md cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
            onClick={() => setSelectedStatus("PENDING")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    در انتظار
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {toPersianDigits(stats.pending)}
                  </p>
                </div>
                <div className="p-2 bg-amber-200 dark:bg-amber-800 rounded-xl">
                  <svg
                    className="w-5 h-5 text-amber-700 dark:text-amber-300"
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
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800 shadow-md cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
            onClick={() => setSelectedStatus("CONFIRMED")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    تایید شده
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    {toPersianDigits(stats.confirmed)}
                  </p>
                </div>
                <div className="p-2 bg-emerald-200 dark:bg-emerald-800 rounded-xl">
                  <svg
                    className="w-5 h-5 text-emerald-700 dark:text-emerald-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 border-blue-200 dark:border-indigo-800 shadow-md cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
            onClick={() => setSelectedStatus("COMPLETED")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-indigo-400">
                    تکمیل شده
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-indigo-100">
                    {toPersianDigits(stats.completed)}
                  </p>
                </div>
                <div className="p-2 bg-blue-200 dark:bg-indigo-800 rounded-xl">
                  <svg
                    className="w-5 h-5 text-blue-700 dark:text-indigo-300"
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
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800 shadow-md cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
            onClick={() => setSelectedStatus("CANCELLED")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    لغو شده
                  </p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {toPersianDigits(stats.cancelled)}
                  </p>
                </div>
                <div className="p-2 bg-red-200 dark:bg-red-800 rounded-xl">
                  <svg
                    className="w-5 h-5 text-red-700 dark:text-red-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-teal-100 dark:from-green-900/20 dark:to-teal-800/20 border-green-200 dark:border-teal-800 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-teal-400">
                    درآمد کل
                  </p>
                  <p className="text-lg font-bold text-green-900 dark:text-teal-100">
                    {toPersianDigits(stats.totalRevenue.toLocaleString())} ﷼
                  </p>
                </div>
                <div className="p-2 bg-green-200 dark:bg-teal-800 rounded-xl">
                  <svg
                    className="w-5 h-5 text-green-700 dark:text-teal-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters and View Mode Toggle */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                  />
                </svg>
                فیلترها و نمایش
              </CardTitle>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <Button
                  size="sm"
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  onClick={() => setViewMode("calendar")}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    viewMode === "calendar"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  تقویم
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                  لیست
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "timeline" ? "default" : "ghost"}
                  onClick={() => setViewMode("timeline")}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    viewMode === "timeline"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <svg
                    className="w-4 h-4 mr-1"
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
                  برنامه
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Quick Date Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
                فیلتر سریع:
              </span>
              {[
                { key: "all", label: "همه" },
                { key: "today", label: "امروز" },
                { key: "week", label: "این هفته" },
                { key: "month", label: "این ماه" },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  size="sm"
                  variant={
                    quickFilterMode === filter.key ? "default" : "outline"
                  }
                  onClick={() => handleQuickFilterChange(filter.key)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                    quickFilterMode === filter.key
                      ? "bg-blue-600 text-white shadow-md"
                      : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600"
                  }`}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  جستجو
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="جستجو بر اساس نام مشتری..."
                    className="pl-10 rounded-xl border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  وضعیت رزرو
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="PENDING">در انتظار تایید</option>
                  <option value="CONFIRMED">تایید شده</option>
                  <option value="COMPLETED">تکمیل شده</option>
                  <option value="CANCELLED">لغو شده</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedStatus("all");
                    setQuickFilterMode("all");
                    setSelectedDateRange({ start: null, end: null });
                  }}
                  className="flex items-center gap-2 px-4 py-2 mt-7 border-2 border-orange-300 dark:border-orange-600 text-orange-600 dark:text-orange-400 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  پاک کردن
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2 mt-7 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800/30 dark:hover:to-emerald-800/30 hover:border-green-300 dark:hover:border-green-600 rounded-xl transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  خروجی Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area with View Modes */}
        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as ViewMode)}
          className="w-full"
        >
          <TabsContent value="calendar" className="mt-0">
            {/* Calendar View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Persian Calendar */}
              <div className="lg:col-span-1">
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      تقویم شمسی
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PersianCalendar
                      selectedDate={selectedDate}
                      onDateSelect={(date) => setSelectedDate(date)}
                      showToday={true}
                      showHolidays={true}
                      className="border-0 shadow-none bg-transparent"
                    />

                    {/* Calendar Legend */}
                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                        راهنمای رنگ‌ها:
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-600 dark:text-gray-400">
                            امروز
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600 dark:text-gray-400">
                            رزرو موجود
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-gray-600 dark:text-gray-400">
                            تعطیل
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-600 dark:text-gray-400">
                            رزرو انتخابی
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Schedule */}
              <div className="lg:col-span-2">
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-green-600 dark:text-green-400"
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
                        برنامه روزانه
                        {selectedDate && (
                          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            - {getPersianDateString(selectedDate)}
                          </span>
                        )}
                      </CardTitle>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedDate
                          ? (() => {
                              const dateStr =
                                formatLocalDateString(selectedDate);
                              const dayBookings = dateStr
                                ? bookingsByDate.get(dateStr) || []
                                : [];
                              return `${toPersianDigits(dayBookings.length)} رزرو`;
                            })()
                          : "روز مورد نظر را انتخاب کنید"}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedDate ? (
                      (() => {
                        const dateStr = formatLocalDateString(selectedDate);
                        const dayBookings = dateStr
                          ? bookingsByDate.get(dateStr) || []
                          : [];

                        if (dayBookings.length === 0) {
                          return (
                            <div className="text-center py-12">
                              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <svg
                                  className="w-8 h-8 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                هیچ رزروی در این روز وجود ندارد
                              </h3>
                              <p className="text-gray-500 dark:text-gray-400 mb-4">
                                برای {getPersianDateString(selectedDate)} رزروی
                                ثبت نشده است
                              </p>
                              <Button
                                onClick={() => setShowBookingForm(true)}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-6 py-2"
                              >
                                ایجاد رزرو جدید
                              </Button>
                            </div>
                          );
                        }

                        // Sort bookings by time
                        const sortedBookings = [...dayBookings].sort((a, b) => {
                          const timeA = a.startTime || "00:00";
                          const timeB = b.startTime || "00:00";
                          return timeA.localeCompare(timeB);
                        });

                        return (
                          <div className="space-y-3">
                            {sortedBookings.map(
                              (booking: any, index: number) => (
                                <Card
                                  key={booking.id}
                                  className="transition-all duration-200 hover:shadow-md border border-gray-200 dark:border-gray-700"
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3 flex-1">
                                        {/* Time Block */}
                                        <div className="flex flex-col items-center px-3 py-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                            {toPersianDigits(
                                              booking.startTime || "نامشخص"
                                            )}
                                          </span>
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {toPersianDigits(
                                              booking.endTime || ""
                                            )}
                                          </span>
                                        </div>

                                        {/* Booking Info */}
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                              {booking.customerName}
                                            </h4>
                                            {getStatusBadge(booking.status)}
                                          </div>
                                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                              <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                                                />
                                              </svg>
                                              {booking.service?.name ||
                                                "نامشخص"}
                                            </span>
                                            <span className="flex items-center gap-1">
                                              <svg
                                                className="w-4 h-4"
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
                                              {booking.customerPhone}
                                            </span>
                                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                              <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                                />
                                              </svg>
                                              {toPersianDigits(
                                                booking.totalAmount?.toLocaleString() ||
                                                  "0"
                                              )}{" "}
                                              ﷼
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Quick Action Buttons */}
                                      <div className="flex items-center gap-2">
                                        {booking.status === "PENDING" && (
                                          <>
                                            <Button
                                              size="sm"
                                              onClick={() =>
                                                handleStatusChange(
                                                  booking.id,
                                                  "CONFIRMED"
                                                )
                                              }
                                              disabled={
                                                updateStatusMutation.isPending
                                              }
                                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg"
                                            >
                                              تایید
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() =>
                                                handleStatusChange(
                                                  booking.id,
                                                  "CANCELLED"
                                                )
                                              }
                                              disabled={
                                                updateStatusMutation.isPending
                                              }
                                              className="px-3 py-1 border-red-300 text-red-600 hover:bg-red-50 text-xs rounded-lg"
                                            >
                                              لغو
                                            </Button>
                                          </>
                                        )}
                                        {booking.status === "CONFIRMED" && (
                                          <Button
                                            size="sm"
                                            onClick={() =>
                                              handleStatusChange(
                                                booking.id,
                                                "COMPLETED"
                                              )
                                            }
                                            disabled={
                                              updateStatusMutation.isPending
                                            }
                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg"
                                          >
                                            تکمیل
                                          </Button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Notes */}
                                    {booking.notes && (
                                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                          <svg
                                            className="w-4 h-4 mt-0.5 text-gray-400"
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
                                          {booking.notes}
                                        </p>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              )
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                          <svg
                            className="w-8 h-8 text-blue-500 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          روز مورد نظر را انتخاب کنید
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          از تقویم سمت راست روز مورد نظر را انتخاب کنید تا
                          رزروهای آن روز نمایش داده شود
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            {/* Enhanced List View */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-purple-600 dark:text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    لیست رزروها
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      نمایش {toPersianDigits(bookingsData.length)} رزرو
                    </div>
                    <select
                      className="text-xs px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      defaultValue="newest"
                    >
                      <option value="newest">جدیدترین</option>
                      <option value="oldest">قدیمی‌ترین</option>
                      <option value="date">تاریخ رزرو</option>
                      <option value="amount">مبلغ</option>
                      <option value="status">وضعیت</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {bookingsData.length > 0 ? (
                  <div className="space-y-4">
                    {bookingsData.map((booking: any) => (
                      <Card
                        key={booking.id}
                        className="transition-all duration-200 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 border border-gray-200 dark:border-gray-700"
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Customer Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:bg-blue-900/20 rounded-xl">
                                  <svg
                                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {booking.customerName}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getStatusBadge(booking.status)}
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      شناسه: {booking.id.slice(-6)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Booking Details Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <svg
                                    className="w-4 h-4 text-blue-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      تاریخ
                                    </p>
                                    <p className="font-medium text-gray-700 dark:text-gray-300">
                                      {getPersianDateString(
                                        new Date(booking.date)
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <svg
                                    className="w-4 h-4 text-green-500"
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
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      زمان
                                    </p>
                                    <p className="font-medium text-gray-700 dark:text-gray-300">
                                      {toPersianDigits(
                                        booking.startTime || "نامشخص"
                                      )}{" "}
                                      - {toPersianDigits(booking.endTime || "")}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <svg
                                    className="w-4 h-4 text-purple-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                                    />
                                  </svg>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      خدمت
                                    </p>
                                    <p className="font-medium text-gray-700 dark:text-gray-300">
                                      {booking.service?.name || "نامشخص"}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <svg
                                    className="w-4 h-4 text-orange-500"
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
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      تلفن
                                    </p>
                                    <p className="font-medium text-gray-700 dark:text-gray-300">
                                      {booking.customerPhone}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                  <svg
                                    className="w-4 h-4 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                    />
                                  </svg>
                                  <div>
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                      مبلغ
                                    </p>
                                    <p className="font-bold text-green-700 dark:text-green-300">
                                      {toPersianDigits(
                                        booking.totalAmount?.toLocaleString() ||
                                          "0"
                                      )}{" "}
                                      ﷼
                                    </p>
                                  </div>
                                </div>

                                {booking.notes && (
                                  <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                    <svg
                                      className="w-4 h-4 text-yellow-600"
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
                                    <div>
                                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                        یادداشت
                                      </p>
                                      <p className="font-medium text-yellow-700 dark:text-yellow-300 text-xs">
                                        {booking.notes.length > 30
                                          ? `${booking.notes.substring(0, 30)}...`
                                          : booking.notes}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[160px]">
                              {booking.status === "PENDING" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleStatusChange(
                                        booking.id,
                                        "CONFIRMED"
                                      )
                                    }
                                    disabled={updateStatusMutation.isPending}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                  >
                                    <svg
                                      className="w-4 h-4"
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
                                    تایید رزرو
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleStatusChange(
                                        booking.id,
                                        "CANCELLED"
                                      )
                                    }
                                    disabled={updateStatusMutation.isPending}
                                    className="flex items-center gap-2 px-4 py-2 border-2 border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 hover:border-red-400 dark:hover:border-red-500 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                    لغو رزرو
                                  </Button>
                                </>
                              )}
                              {booking.status === "CONFIRMED" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleStatusChange(
                                        booking.id,
                                        "COMPLETED"
                                      )
                                    }
                                    disabled={updateStatusMutation.isPending}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    تکمیل خدمت
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleStatusChange(
                                        booking.id,
                                        "CANCELLED"
                                      )
                                    }
                                    disabled={updateStatusMutation.isPending}
                                    className="flex items-center gap-2 px-4 py-2 border-2 border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 hover:border-red-400 dark:hover:border-red-500 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                    لغو رزرو
                                  </Button>
                                </>
                              )}
                              {(booking.status === "COMPLETED" ||
                                booking.status === "CANCELLED") && (
                                <div className="flex items-center justify-center p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {booking.status === "COMPLETED"
                                      ? "تکمیل شده"
                                      : "لغو شده"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Full Notes Section */}
                          {booking.notes && (
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                              <div className="flex items-start gap-2">
                                <svg
                                  className="w-4 h-4 text-gray-400 mt-0.5"
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
                                <div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    یادداشت کامل:
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {booking.notes}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-6">
                      <svg
                        className="w-12 h-12 text-purple-500 dark:text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      هیچ رزروی یافت نشد
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                      در حال حاضر هیچ رزروی با فیلترهای انتخابی وجود ندارد. برای
                      شروع می‌توانید رزرو جدیدی ایجاد کنید.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={() => setShowBookingForm(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      >
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
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        ایجاد رزرو جدید
                      </Button>
                      <Button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedStatus("all");
                          setQuickFilterMode("all");
                          setSelectedDateRange({ start: null, end: null });
                        }}
                        variant="outline"
                        className="flex items-center gap-2 px-6 py-3 border-2 border-orange-300 dark:border-orange-600 text-orange-600 dark:text-orange-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 dark:hover:from-orange-900/20 dark:hover:to-yellow-900/20 hover:border-orange-400 dark:hover:border-orange-500 rounded-xl transition-all duration-200"
                      >
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
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        پاک کردن فیلترها
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="mt-0">
            {/* Timeline View */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
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
                    برنامه زمانی رزروها
                  </CardTitle>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    مرتب شده بر اساس تاریخ و زمان
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {bookingsData.length > 0 ? (
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-indigo-400"></div>

                    <div className="space-y-6">
                      {(() => {
                        // Group bookings by date and sort them
                        const groupedBookings = bookingsData.reduce(
                          (acc: any, booking: any) => {
                            const date = new Date(booking.date);
                            const dateKey = formatLocalDateString(date);
                            if (dateKey) {
                              if (!acc[dateKey]) {
                                acc[dateKey] = [];
                              }
                              acc[dateKey].push(booking);
                            }
                            return acc;
                          },
                          {}
                        );

                        // Sort dates and bookings within each date
                        const sortedDates = Object.keys(groupedBookings).sort(
                          (a, b) => {
                            const dateA = parseLocalDateString(a);
                            const dateB = parseLocalDateString(b);
                            return (
                              (dateA?.getTime() || 0) - (dateB?.getTime() || 0)
                            );
                          }
                        );

                        return sortedDates.map((dateKey) => {
                          const date = parseLocalDateString(dateKey);
                          const dayBookings = groupedBookings[dateKey].sort(
                            (a: any, b: any) => {
                              const timeA = a.startTime || "00:00";
                              const timeB = b.startTime || "00:00";
                              return timeA.localeCompare(timeB);
                            }
                          );

                          return (
                            <div key={dateKey} className="relative">
                              {/* Date Header */}
                              <div className="flex items-center gap-4 mb-4">
                                <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg">
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                                <div className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {date
                                      ? getPersianDateString(date)
                                      : "تاریخ نامشخص"}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {date ? getPersianDayName(date) : ""} -{" "}
                                    {toPersianDigits(dayBookings.length)} رزرو
                                  </p>
                                </div>
                              </div>

                              {/* Bookings for this date */}
                              <div className="mr-12 space-y-3">
                                {dayBookings.map(
                                  (booking: any, index: number) => (
                                    <div key={booking.id} className="relative">
                                      {/* Timeline dot for each booking */}
                                      <div
                                        className={`absolute -right-16 top-3 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 shadow-sm ${
                                          booking.status === "COMPLETED"
                                            ? "bg-green-500"
                                            : booking.status === "CONFIRMED"
                                              ? "bg-blue-500"
                                              : booking.status === "PENDING"
                                                ? "bg-yellow-500"
                                                : "bg-red-500"
                                        }`}
                                      ></div>

                                      <Card className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200">
                                        <CardContent className="p-4">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                              {/* Time Badge */}
                                              <div className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full border border-indigo-200 dark:border-indigo-800">
                                                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                                  {toPersianDigits(
                                                    booking.startTime ||
                                                      "نامشخص"
                                                  )}
                                                </span>
                                              </div>

                                              {/* Booking Info */}
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                                    {booking.customerName}
                                                  </h4>
                                                  {getStatusBadge(
                                                    booking.status
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                  <span className="flex items-center gap-1">
                                                    <svg
                                                      className="w-3 h-3"
                                                      fill="none"
                                                      stroke="currentColor"
                                                      viewBox="0 0 24 24"
                                                    >
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                                                      />
                                                    </svg>
                                                    {booking.service?.name ||
                                                      "نامشخص"}
                                                  </span>
                                                  <span className="flex items-center gap-1">
                                                    <svg
                                                      className="w-3 h-3"
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
                                                    {booking.customerPhone}
                                                  </span>
                                                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                                    <svg
                                                      className="w-3 h-3"
                                                      fill="none"
                                                      stroke="currentColor"
                                                      viewBox="0 0 24 24"
                                                    >
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                                      />
                                                    </svg>
                                                    {toPersianDigits(
                                                      booking.totalAmount?.toLocaleString() ||
                                                        "0"
                                                    )}{" "}
                                                    ﷼
                                                  </span>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="flex items-center gap-1">
                                              {booking.status === "PENDING" && (
                                                <>
                                                  <Button
                                                    size="sm"
                                                    onClick={() =>
                                                      handleStatusChange(
                                                        booking.id,
                                                        "CONFIRMED"
                                                      )
                                                    }
                                                    disabled={
                                                      updateStatusMutation.isPending
                                                    }
                                                    className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg"
                                                  >
                                                    ✓
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                      handleStatusChange(
                                                        booking.id,
                                                        "CANCELLED"
                                                      )
                                                    }
                                                    disabled={
                                                      updateStatusMutation.isPending
                                                    }
                                                    className="px-2 py-1 border-red-300 text-red-600 hover:bg-red-50 text-xs rounded-lg"
                                                  >
                                                    ✗
                                                  </Button>
                                                </>
                                              )}
                                              {booking.status ===
                                                "CONFIRMED" && (
                                                <Button
                                                  size="sm"
                                                  onClick={() =>
                                                    handleStatusChange(
                                                      booking.id,
                                                      "COMPLETED"
                                                    )
                                                  }
                                                  disabled={
                                                    updateStatusMutation.isPending
                                                  }
                                                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg"
                                                >
                                                  ✅
                                                </Button>
                                              )}
                                            </div>
                                          </div>

                                          {/* Notes in timeline */}
                                          {booking.notes && (
                                            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-3 border-yellow-400">
                                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                                📝 {booking.notes}
                                              </p>
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
                      <svg
                        className="w-12 h-12 text-indigo-500 dark:text-indigo-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      هیچ رزروی برای نمایش وجود ندارد
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                      در حال حاضر هیچ رزروی با فیلترهای انتخابی وجود ندارد تا در
                      برنامه زمانی نمایش داده شود.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={() => setShowBookingForm(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      >
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
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        ایجاد رزرو جدید
                      </Button>
                      <Button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedStatus("all");
                          setQuickFilterMode("all");
                          setSelectedDateRange({ start: null, end: null });
                        }}
                        variant="outline"
                        className="flex items-center gap-2 px-6 py-3 border-2 border-orange-300 dark:border-orange-600 text-orange-600 dark:text-orange-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 dark:hover:from-orange-900/20 dark:hover:to-yellow-900/20 hover:border-orange-400 dark:hover:border-orange-500 rounded-xl transition-all duration-200"
                      >
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
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        پاک کردن فیلترها
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Booking Form Modal */}
        {showBookingForm && (
          <BookingForm
            isOpen={showBookingForm}
            onSuccess={handleBookingFormSuccess}
            onCancel={() => setShowBookingForm(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Bookings;

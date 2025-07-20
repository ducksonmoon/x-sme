import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { usePermissions } from "@/hooks/usePermissions";
import { staffApi } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

const StaffDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { hasPermission, canView } = usePermissions();
  const [activeTab, setActiveTab] = useState<
    "overview" | "bookings" | "schedule" | "profile"
  >("overview");

  // Determine which tabs are available based on permissions
  const availableTabs = [
    {
      id: "overview",
      label: "نمای کلی",
      icon: TrendingUp,
      permission: "dashboard",
    },
    { id: "bookings", label: "رزروها", icon: Calendar, permission: "bookings" },
    {
      id: "schedule",
      label: "برنامه امروز",
      icon: Clock,
      permission: "bookings",
    },
    { id: "profile", label: "پروفایل", icon: User, permission: "profile" },
  ].filter((tab) => canView(tab.permission));

  // Set default tab to first available tab
  useEffect(() => {
    if (
      availableTabs.length > 0 &&
      !availableTabs.find((tab) => tab.id === activeTab)
    ) {
      setActiveTab(availableTabs[0]?.id as any);
    }
  }, [availableTabs, activeTab]);

  // Fetch staff profile
  const { data: staffProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["staff-profile"],
    queryFn: async () => {
      const response = await staffApi.getProfile();
      return response.data.data;
    },
    enabled: !!user?.staff,
  });

  // Fetch today's schedule
  const { data: todaySchedule, isLoading: scheduleLoading } = useQuery({
    queryKey: ["staff-schedule-today"],
    queryFn: async () => {
      const response = await staffApi.getTodaySchedule();
      return response.data.data;
    },
    enabled: !!user?.staff && canView("bookings"),
  });

  // Fetch recent bookings
  const { data: recentBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["staff-bookings"],
    queryFn: async () => {
      const response = await staffApi.getMyBookings({ limit: 10 });
      return response.data.data;
    },
    enabled: !!user?.staff && canView("bookings"),
  });

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await staffApi.updateBookingStatus(bookingId, status);
      // Refetch bookings
      window.location.reload();
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "text-green-600 bg-green-100";
      case "PENDING":
        return "text-yellow-600 bg-yellow-100";
      case "CANCELLED":
        return "text-red-600 bg-red-100";
      case "COMPLETED":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "تایید شده";
      case "PENDING":
        return "در انتظار";
      case "CANCELLED":
        return "لغو شده";
      case "COMPLETED":
        return "تکمیل شده";
      default:
        return status;
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // If no tabs are available, show no permissions message
  if (availableTabs.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            دسترسی محدود
          </h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            شما مجوز دسترسی به هیچ بخشی از سیستم را ندارید. لطفاً با مدیر سیستم
            تماس بگیرید.
          </p>
          <Button
            onClick={() => (window.location.href = "/auth/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium"
          >
            بازگشت به ورود
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">داشبورد کارمند</h1>
          <p className="text-slate-600 mt-1">
            خوش آمدید {user?.staff?.firstName} {user?.staff?.lastName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">
              {user?.staff?.firstName} {user?.staff?.lastName}
            </p>
            <p className="text-xs text-slate-500">
              {user?.staff?.specialization}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "overview" && canView("dashboard") && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">
                    رزروهای امروز
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {todaySchedule?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">
                    کل رزروها
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {staffProfile?._count?.bookings || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">خدمات</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {staffProfile?.staff_services?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Today's Schedule */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              برنامه امروز
            </h3>
            {scheduleLoading ? (
              <LoadingSpinner />
            ) : todaySchedule && todaySchedule.length > 0 ? (
              <div className="space-y-3">
                {todaySchedule.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {booking.customerName}
                        </p>
                        <p className="text-sm text-slate-600">
                          {booking.service.name} • {booking.startTime} -{" "}
                          {booking.endTime}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                    >
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">
                امروز رزروی ندارید
              </p>
            )}
          </Card>
        </div>
      )}

      {activeTab === "bookings" && canView("bookings") && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            رزروهای اخیر
          </h3>
          {bookingsLoading ? (
            <LoadingSpinner />
          ) : recentBookings && recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-slate-900">
                        {booking.customerName}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {booking.service.name} • {booking.price} تومان
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                    >
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
                    <span>
                      {new Date(booking.date).toLocaleDateString("fa-IR")}
                    </span>
                    <span>
                      {booking.startTime} - {booking.endTime}
                    </span>
                  </div>
                  {booking.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          updateBookingStatus(booking.id, "CONFIRMED")
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        تایید
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateBookingStatus(booking.id, "CANCELLED")
                        }
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        لغو
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">رزروی یافت نشد</p>
          )}
        </Card>
      )}

      {activeTab === "schedule" && canView("bookings") && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            برنامه امروز
          </h3>
          {scheduleLoading ? (
            <LoadingSpinner />
          ) : todaySchedule && todaySchedule.length > 0 ? (
            <div className="space-y-4">
              {todaySchedule.map((booking: any) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900">
                        {booking.customerName}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {booking.service.name} • {booking.service.duration}{" "}
                        دقیقه
                      </p>
                      <p className="text-sm text-slate-500">
                        {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                    >
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">
              امروز رزروی ندارید
            </p>
          )}
        </Card>
      )}

      {activeTab === "profile" && canView("profile") && staffProfile && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            اطلاعات پروفایل
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  نام و نام خانوادگی
                </label>
                <p className="text-slate-900">
                  {staffProfile.firstName} {staffProfile.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  تخصص
                </label>
                <p className="text-slate-900">
                  {staffProfile.specialization || "تعریف نشده"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  تجربه کاری
                </label>
                <p className="text-slate-900">
                  {staffProfile.experience || "تعریف نشده"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  درباره
                </label>
                <p className="text-slate-900">
                  {staffProfile.bio || "توضیحی ثبت نشده"}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  ایمیل
                </label>
                <p className="text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {staffProfile.email || "تعریف نشده"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  شماره تلفن
                </label>
                <p className="text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {staffProfile.phone || "تعریف نشده"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  کسب‌وکار
                </label>
                <p className="text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {staffProfile.businesses?.name || "تعریف نشده"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  وضعیت
                </label>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    staffProfile.isActive
                      ? "text-green-600 bg-green-100"
                      : "text-red-600 bg-red-100"
                  }`}
                >
                  {staffProfile.isActive ? "فعال" : "غیرفعال"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StaffDashboard;

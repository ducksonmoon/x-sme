import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  BarChart3,
  Plus,
  Eye,
  Clock,
  Target,
  Sparkles,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  CalendarDays,
  Activity,
  Settings as SettingsIcon,
} from "lucide-react";
import { dashboardApi, adminApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useBusiness } from "@/contexts/BusinessContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import BusinessSelector from "@/components/BusinessSelector";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import business owner dashboard components
import Services from "@/pages/dashboard/Services";
import Bookings from "@/pages/dashboard/Bookings";
import Settings from "@/pages/dashboard/Settings";
import Analytics from "@/pages/dashboard/Analytics";

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { business, businessId, isAdmin, setBusinessId } = useBusiness();
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  // For admin: fetch selected business details
  const { data: adminBusiness, isLoading: loadingAdminBusiness } = useQuery({
    queryKey: ["admin-business-details", businessId],
    queryFn: () => adminApi.getBusinessDetails(businessId!),
    enabled: !!businessId && isAdmin,
  });

  // Fetch analytics
  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["business-analytics", businessId, selectedPeriod],
    queryFn: () => {
      if (businessId) {
        return dashboardApi.getAnalytics(businessId, selectedPeriod);
      }
      return Promise.resolve(null);
    },
    enabled: !!businessId,
  });

  // Fetch recent bookings
  const { data: recentBookings, isLoading: loadingBookings } = useQuery({
    queryKey: ["recent-bookings", businessId],
    queryFn: () => {
      if (businessId) {
        return dashboardApi.getBookings(businessId, { limit: 5 });
      }
      return Promise.resolve(null);
    },
    enabled: !!businessId,
  });

  // Fetch services
  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ["business-services", businessId],
    queryFn: () => {
      if (businessId) {
        return dashboardApi.getServices(businessId);
      }
      return Promise.resolve(null);
    },
    enabled: !!businessId,
  });

  // Determine which business data to use
  const businessData = isAdmin ? adminBusiness?.data?.data : business;
  const isLoadingBusiness = isAdmin ? loadingAdminBusiness : false;

  // If admin and no business selected, show business selector
  if (isAdmin && !businessId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              داشبورد کسب‌وکار
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              لطفاً یک کسب‌وکار را انتخاب کنید
            </p>
          </div>
          <Button onClick={() => navigate("/admin")}>
            بازگشت به داشبورد مدیر
          </Button>
        </div>
        <BusinessSelector
          selectedBusinessId={businessId}
          onBusinessSelect={(id) => {
            setBusinessId(id);
          }}
        />
      </div>
    );
  }

  if (isLoadingBusiness) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          خطا در بارگذاری اطلاعات کسب‌وکار
        </p>
        {isAdmin ? (
          <Button onClick={() => navigate("/admin")} className="mt-4">
            بازگشت به داشبورد مدیر
          </Button>
        ) : (
          <Button
            onClick={() => navigate("/businesses/create")}
            className="mt-4"
          >
            ایجاد کسب‌وکار جدید
          </Button>
        )}
      </div>
    );
  }

  const analyticsData = analytics?.data;
  const bookingsData = recentBookings?.data?.bookings || [];
  const servicesData = services?.data?.data || services?.data || [];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            داشبورد کسب‌وکار
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {businessData.name}
          </p>
        </div>
        <div className="flex space-x-3 space-x-reverse">
          {isAdmin && (
            <Button onClick={() => navigate("/admin")}>
              بازگشت به داشبورد مدیر
            </Button>
          )}
          {!isAdmin && (
            <>
              <Button onClick={() => navigate("/dashboard/services")}>
                مدیریت خدمات
              </Button>
              <Button onClick={() => navigate("/dashboard/timeslots")}>
                مدیریت ساعات کاری
              </Button>
              <Button onClick={() => navigate("/dashboard/bookings")}>
                مشاهده رزروها
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Business Info Card - Only for admin */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات کسب‌وکار</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  نام کسب‌وکار
                </label>
                <p className="mt-1 font-medium">{businessData.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  صاحب
                </label>
                <p className="mt-1">
                  {businessData.owner?.firstName} {businessData.owner?.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  وضعیت
                </label>
                <div className="mt-1">
                  <Badge
                    variant={businessData.isActive ? "default" : "secondary"}
                  >
                    {businessData.isActive ? "فعال" : "غیرفعال"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  ایمیل
                </label>
                <p className="mt-1">{businessData.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different sections - Only for admin */}
      {isAdmin ? (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">نمای کلی</TabsTrigger>
            <TabsTrigger value="bookings">رزروها</TabsTrigger>
            <TabsTrigger value="services">خدمات</TabsTrigger>
            <TabsTrigger value="analytics">تحلیل‌ها</TabsTrigger>
            <TabsTrigger value="settings">تنظیمات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    کل رزروها
                  </CardTitle>
                  <svg
                    className="h-4 w-4 text-muted-foreground"
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
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {businessData.totalBookings || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    کل رزروهای ثبت شده
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    درآمد کل
                  </CardTitle>
                  <svg
                    className="h-4 w-4 text-muted-foreground"
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
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {businessData.totalRevenue
                      ? `${businessData.totalRevenue.toLocaleString()} تومان`
                      : "0 تومان"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    کل درآمد کسب‌وکار
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    خدمات فعال
                  </CardTitle>
                  <svg
                    className="h-4 w-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {businessData.activeServices || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">خدمات فعال</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    رزروهای امروز
                  </CardTitle>
                  <svg
                    className="h-4 w-4 text-muted-foreground"
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
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {businessData.todayBookings || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">رزروهای امروز</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>آخرین رزروها</CardTitle>
                </CardHeader>
                <CardContent>
                  {businessData.recentBookings &&
                  businessData.recentBookings.length > 0 ? (
                    <div className="space-y-4">
                      {businessData.recentBookings
                        .slice(0, 5)
                        .map((booking: any) => (
                          <div
                            key={booking.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">
                                {booking.customerName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(booking.date).toLocaleDateString(
                                  "fa-IR"
                                )}{" "}
                                - {booking.startTime}
                              </p>
                            </div>
                            <Badge
                              variant={
                                booking.status === "CONFIRMED"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {booking.status === "CONFIRMED"
                                ? "تایید شده"
                                : "در انتظار"}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      هیچ رزروی یافت نشد
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>خدمات</CardTitle>
                </CardHeader>
                <CardContent>
                  {businessData.services && businessData.services.length > 0 ? (
                    <div className="space-y-4">
                      {businessData.services.slice(0, 5).map((service: any) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-gray-500">
                              {service.duration} دقیقه - {service.price} تومان
                            </p>
                          </div>
                          <Badge
                            variant={service.isActive ? "default" : "secondary"}
                          >
                            {service.isActive ? "فعال" : "غیرفعال"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      هیچ خدمتی یافت نشد
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <div className="border rounded-lg p-4">
              <Bookings />
            </div>
          </TabsContent>

          <TabsContent value="services">
            <div className="border rounded-lg p-4">
              <Services />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="border rounded-lg p-4">
              <Analytics />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="border rounded-lg p-4">
              <Settings />
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        // Business owner dashboard layout
        <>
          {/* Subscription Status */}
          {businessId && <SubscriptionStatus businessId={businessId} />}

          {/* Enhanced Business Analytics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Revenue & Performance Metrics */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Performance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                            درآمد کل
                          </p>
                          <div className="space-y-1">
                            <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                              {analyticsData?.totalRevenue
                                ? `${analyticsData.totalRevenue.toLocaleString("fa-IR")} تومان`
                                : "0 تومان"}
                            </p>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-emerald-600" />
                              <span className="text-sm text-emerald-600 font-medium">
                                در{" "}
                                {selectedPeriod === "7d"
                                  ? "7 روز"
                                  : selectedPeriod === "30d"
                                    ? "30 روز"
                                    : "90 روز"}{" "}
                                گذشته
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <DollarSign className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                            کل رزروها
                          </p>
                          <div className="space-y-1">
                            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                              {analyticsData?.totalBookings || 0}
                            </p>
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-blue-600 font-medium">
                                در{" "}
                                {selectedPeriod === "7d"
                                  ? "7 روز"
                                  : selectedPeriod === "30d"
                                    ? "30 روز"
                                    : "90 روز"}{" "}
                                گذشته
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                            خدمات فعال
                          </p>
                          <div className="space-y-1">
                            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                              {
                                servicesData.filter(
                                  (service: any) => service.isActive
                                ).length
                              }
                            </p>
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-purple-600" />
                              <span className="text-sm text-purple-600 font-medium">
                                از {servicesData.length} خدمت کل
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                            رزروهای امروز
                          </p>
                          <div className="space-y-1">
                            <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                              {analyticsData?.todayBookings || 0}
                            </p>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-orange-600" />
                              <span className="text-sm text-orange-600 font-medium">
                                برنامه امروز
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    اقدامات سریع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button
                      variant="outline"
                      className="h-20 flex-col gap-2 border-2 hover:bg-blue-50 hover:border-blue-200"
                      onClick={() => navigate("/dashboard/services")}
                    >
                      <Plus className="w-5 h-5 text-blue-600" />
                      <span className="text-sm">مدیریت خدمات</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col gap-2 border-2 hover:bg-green-50 hover:border-green-200"
                      onClick={() => navigate("/dashboard/bookings")}
                    >
                      <Eye className="w-5 h-5 text-green-600" />
                      <span className="text-sm">مشاهده رزروها</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col gap-2 border-2 hover:bg-purple-50 hover:border-purple-200"
                      onClick={() => navigate("/dashboard/timeslots")}
                    >
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span className="text-sm">ساعات کاری</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col gap-2 border-2 hover:bg-gray-50 hover:border-gray-200"
                      onClick={() => navigate("/dashboard/settings")}
                    >
                      <SettingsIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-sm">تنظیمات</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - Today's Overview */}
            <div className="space-y-6">
              {/* Today's Schedule */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <CalendarDays className="w-4 h-4 text-white" />
                      </div>
                      برنامه امروز
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate("/dashboard/bookings")}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingBookings ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : bookingsData.length > 0 ? (
                    <div className="space-y-3">
                      {bookingsData
                        .filter((booking: any) => {
                          const today = new Date().toDateString();
                          const bookingDate = new Date(
                            booking.date
                          ).toDateString();
                          return today === bookingDate;
                        })
                        .slice(0, 4)
                        .map((booking: any) => (
                          <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                booking.status === "CONFIRMED"
                                  ? "bg-green-500"
                                  : booking.status === "PENDING"
                                    ? "bg-yellow-500"
                                    : booking.status === "CANCELLED"
                                      ? "bg-red-500"
                                      : "bg-blue-500"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {booking.customerName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {booking.startTime} - {booking.service?.name}
                              </p>
                            </div>
                            {booking.status === "CONFIRMED" && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            {booking.status === "PENDING" && (
                              <AlertCircle className="w-4 h-4 text-yellow-500" />
                            )}
                            {booking.status === "CANCELLED" && (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </motion.div>
                        ))}
                      {bookingsData.filter((booking: any) => {
                        const today = new Date().toDateString();
                        const bookingDate = new Date(
                          booking.date
                        ).toDateString();
                        return today === bookingDate;
                      }).length === 0 && (
                        <div className="text-center py-6">
                          <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">
                            رزروی برای امروز ندارید
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">هنوز رزروی ندارید</p>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => navigate("/widget-demo")}
                        className="text-xs"
                      >
                        نحوه دریافت رزرو یاد بگیرید
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Setup Guide */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-indigo-900 dark:text-indigo-100">
                    <Target className="w-5 h-5" />
                    راهنمای شروع سریع
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">حساب کاربری ایجاد شد</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">کسب‌وکار تنظیم شد</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(servicesData?.length || 0) > 0 ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="text-sm">خدمات اضافه کنید</span>
                      {(servicesData?.length || 0) === 0 && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => navigate("/dashboard/services")}
                          className="text-xs p-0 h-auto"
                        >
                          شروع
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">ویجت را در سایت قرار دهید</span>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => navigate("/widget-docs")}
                        className="text-xs p-0 h-auto"
                      >
                        راهنما
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Period Selector */}
          <Card>
            <CardHeader>
              <CardTitle>انتخاب بازه زمانی</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 space-x-reverse">
                <Button
                  variant={selectedPeriod === "7d" ? "default" : "outline"}
                  onClick={() => setSelectedPeriod("7d")}
                >
                  7 روز گذشته
                </Button>
                <Button
                  variant={selectedPeriod === "30d" ? "default" : "outline"}
                  onClick={() => setSelectedPeriod("30d")}
                >
                  30 روز گذشته
                </Button>
                <Button
                  variant={selectedPeriod === "90d" ? "default" : "outline"}
                  onClick={() => setSelectedPeriod("90d")}
                >
                  90 روز گذشته
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>رزروهای اخیر</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/dashboard/bookings")}
                  >
                    مشاهده همه
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingBookings ? (
                  <div className="flex items-center justify-center h-32">
                    <LoadingSpinner size="md" />
                  </div>
                ) : bookingsData.length > 0 ? (
                  <div className="space-y-4">
                    {bookingsData.map((booking: any) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{booking.customerName}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.date).toLocaleDateString("fa-IR")}{" "}
                            - {booking.startTime}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(booking.status)}
                          <p className="text-sm text-gray-500 mt-1">
                            {booking.totalAmount} تومان
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    هیچ رزروی یافت نشد
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Services Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>خدمات</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/dashboard/services")}
                  >
                    مدیریت خدمات
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingServices ? (
                  <div className="flex items-center justify-center h-32">
                    <LoadingSpinner size="md" />
                  </div>
                ) : servicesData.length > 0 ? (
                  <div className="space-y-4">
                    {servicesData.slice(0, 5).map((service: any) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-500">
                            {service.duration} دقیقه
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={service.isActive ? "default" : "secondary"}
                          >
                            {service.isActive ? "فعال" : "غیرفعال"}
                          </Badge>
                          <p className="text-sm text-gray-500 mt-1">
                            {service.price} تومان
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">هیچ خدمتی یافت نشد</p>
                    <Button onClick={() => navigate("/dashboard/services")}>
                      افزودن خدمت جدید
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>عملیات سریع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => navigate("/dashboard/services")}
                >
                  <svg
                    className="w-6 h-6 mb-2"
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
                  مدیریت خدمات
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => navigate("/dashboard/bookings")}
                >
                  <svg
                    className="w-6 h-6 mb-2"
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
                  مدیریت رزروها
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => navigate("/dashboard/settings")}
                >
                  <svg
                    className="w-6 h-6 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  تنظیمات کسب‌وکار
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;

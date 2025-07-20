import React, { useState, useMemo } from "react";
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
  ChevronLeft,
  Building2,
  Bell,
  Search,
  X,
  Menu,
  Grid3X3,
  BarChart,
  User,
  Home,
} from "lucide-react";
import { dashboardApi, adminApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useBusiness } from "@/contexts/BusinessContext";
import { useNotifications } from "@/contexts/NotificationContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import BusinessSelector from "@/components/BusinessSelector";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import DashboardUpgradeBanner from "@/components/DashboardUpgradeBanner";
import NotificationDropdown from "@/components/NotificationDropdown";
import ConditionalWidgetConfig from "@/components/ConditionalWidgetConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

// Import business owner dashboard components
import Services from "@/pages/dashboard/Services";
import Bookings from "@/pages/dashboard/Bookings";
import Settings from "@/pages/dashboard/Settings";
import Analytics from "@/pages/dashboard/Analytics";
import StaffDashboard from "@/pages/dashboard/StaffDashboard";

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { business, businessId, isAdmin, setBusinessId } = useBusiness();
  const { unreadCount } = useNotifications();
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If user is staff, show staff dashboard
  if (user?.role === "STAFF") {
    return <StaffDashboard />;
  }

  // For admin: fetch selected business details
  const { data: adminBusiness, isLoading: loadingAdminBusiness } = useQuery({
    queryKey: ["admin-business-details", businessId],
    queryFn: () => adminApi.getBusinessDetails(businessId!),
    enabled: !!businessId && isAdmin,
  });

  // Fetch analytics
  const {
    data: analytics,
    isLoading: loadingAnalytics,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["business-analytics", businessId, selectedPeriod],
    queryFn: () => {
      if (businessId) {
        return dashboardApi.getAnalytics(businessId, selectedPeriod);
      }
      return Promise.resolve(null);
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
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

  const analyticsData = analytics?.data?.data || analytics?.data || {};
  const bookingsData = recentBookings?.data?.bookings || [];
  const servicesData = services?.data?.data || services?.data || [];

  // Filter data based on search term
  const filteredBookings = useMemo(() => {
    if (!searchTerm || !bookingsData) return bookingsData;

    return bookingsData.filter(
      (booking: any) =>
        booking.customerName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.service?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.date?.includes(searchTerm) ||
        booking.startTime?.includes(searchTerm)
    );
  }, [bookingsData, searchTerm]);

  const filteredServices = useMemo(() => {
    if (!searchTerm || !servicesData) return servicesData;

    return servicesData.filter(
      (service: any) =>
        service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.price?.toString().includes(searchTerm) ||
        service.duration?.toString().includes(searchTerm)
    );
  }, [servicesData, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setSearchActive(!!value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchActive(false);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    // The query will automatically refetch due to the queryKey change
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

  // If admin and no business selected, show business selector
  if (isAdmin && !businessId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Modern Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                انتخاب کسب‌وکار
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                لطفاً کسب‌وکاری را که می‌خواهید مدیریت کنید انتخاب کنید
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <BusinessSelector
                selectedBusinessId={businessId}
                onBusinessSelect={(id) => {
                  setBusinessId(id);
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <Button
                onClick={() => navigate("/admin")}
                variant="outline"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                بازگشت به داشبورد مدیر
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingBusiness) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-slate-600 dark:text-slate-400">
            در حال بارگذاری...
          </p>
        </div>
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              خطا در بارگذاری
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              خطا در بارگذاری اطلاعات کسب‌وکار
            </p>
          </div>
          <div className="space-y-3">
            {isAdmin ? (
              <Button
                onClick={() => navigate("/admin")}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-6 py-3"
              >
                بازگشت به داشبورد مدیر
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/businesses/create")}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-6 py-3"
              >
                ایجاد کسب‌وکار جدید
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Enhanced Header with Sidebar Toggle */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Business Info & Menu */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Business Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                    {businessData.name}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    داشبورد مدیریتی
                  </p>
                </div>
              </div>
            </div>

            {/* Center Section - Search */}
            <div className="flex-1 max-w-md mx-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="جستجو در رزروها، خدمات..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-10 w-full border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl"
                />
                {searchActive && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-3">
              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                onClick={() => setSearchActive(!searchActive)}
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  onClick={() =>
                    setNotificationDropdownOpen(!notificationDropdownOpen)
                  }
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    </span>
                  )}
                </Button>
                <NotificationDropdown
                  isOpen={notificationDropdownOpen}
                  onClose={() => setNotificationDropdownOpen(false)}
                />
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <Button
                    onClick={() => navigate("/admin")}
                    variant="outline"
                    size="sm"
                    className="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">بازگشت</span>
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => navigate("/dashboard/services")}
                      variant="ghost"
                      size="sm"
                      className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                      <Grid3X3 className="w-4 h-4" />
                      خدمات
                    </Button>
                    <Button
                      onClick={() => navigate("/dashboard/bookings")}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Calendar className="w-4 h-4 ml-1" />
                      <span className="hidden sm:inline">رزروها</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {searchActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-4"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="جستجو در رزروها، خدمات..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-10 w-full border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl"
                />
                {searchActive && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 lg:hidden"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                منو
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 p-3"
                onClick={() => {
                  navigate("/dashboard");
                  setSidebarOpen(false);
                }}
              >
                <Home className="w-5 h-5" />
                داشبورد
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 p-3"
                onClick={() => {
                  navigate("/dashboard/services");
                  setSidebarOpen(false);
                }}
              >
                <Grid3X3 className="w-5 h-5" />
                خدمات
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 p-3"
                onClick={() => {
                  navigate("/dashboard/bookings");
                  setSidebarOpen(false);
                }}
              >
                <Calendar className="w-5 h-5" />
                رزروها
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 p-3"
                onClick={() => {
                  navigate("/dashboard/timeslots");
                  setSidebarOpen(false);
                }}
              >
                <Clock className="w-5 h-5" />
                ساعات کاری
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 p-3"
                onClick={() => {
                  navigate("/dashboard/settings");
                  setSidebarOpen(false);
                }}
              >
                <SettingsIcon className="w-5 h-5" />
                تنظیمات
              </Button>
            </nav>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Upgrade Banner */}
        {!isAdmin && businessId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6"
          >
            <DashboardUpgradeBanner businessId={businessId} />
          </motion.div>
        )}

        {/* Widget Configuration Card - Always rendered but conditionally visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <ConditionalWidgetConfig show={!isAdmin} />
        </motion.div>

        {/* Subscription Status */}
        {!isAdmin && businessId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <SubscriptionStatus businessId={businessId} />
          </motion.div>
        )}

        {/* Admin Dashboard Layout */}
        {isAdmin ? (
          <div className="space-y-8">
            {/* Business Overview Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                        کل رزروها
                      </p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {businessData.totalBookings || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                        درآمد کل
                      </p>
                      <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                        {businessData.totalRevenue
                          ? `${businessData.totalRevenue.toLocaleString()} تومان`
                          : "0 تومان"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                        خدمات فعال
                      </p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {businessData.activeServices || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                        رزروهای امروز
                      </p>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                        {businessData.todayBookings || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Business Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    اطلاعات کسب‌وکار
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                        نام کسب‌وکار
                      </label>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {businessData.name}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                        صاحب
                      </label>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {businessData.owner?.firstName}{" "}
                        {businessData.owner?.lastName}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                        وضعیت
                      </label>
                      <div>
                        <Badge
                          variant={
                            businessData.isActive ? "default" : "secondary"
                          }
                          className={
                            businessData.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          }
                        >
                          {businessData.isActive ? "فعال" : "غیرفعال"}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                        ایمیل
                      </label>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {businessData.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <TabsList className="grid w-full grid-cols-5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <TabsTrigger
                    value="overview"
                    className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      <span className="hidden sm:inline">نمای کلی</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="bookings"
                    className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="hidden sm:inline">رزروها</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="services"
                    className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <Grid3X3 className="w-4 h-4" />
                      <span className="hidden sm:inline">خدمات</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="analytics"
                    className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="hidden sm:inline">تحلیل‌ها</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <SettingsIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">تنظیمات</span>
                    </div>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Hosted Widget Card */}
                  <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-blue-900 dark:text-blue-100">
                        <svg
                          className="w-5 h-5 ml-2 text-blue-600 dark:text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        صفحه رزرو اختصاصی شما
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            برای مشتریان بدون وب‌سایت - لینک مستقیم رزرو
                          </p>
                          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 mb-3">
                            <code className="text-sm text-slate-700 dark:text-slate-300 break-all">
                              {`${window.location.origin}/w/${businessData.id}`}
                            </code>
                          </div>
                        </div>
                        <div className="flex space-x-2 space-x-reverse ml-4">
                          <Button
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/w/${businessData.id}`
                              );
                            }}
                          >
                            کپی لینک
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.open(
                                `${window.location.origin}/w/${businessData.id}`,
                                "_blank"
                              )
                            }
                          >
                            <Eye className="w-4 h-4 ml-1" />
                            مشاهده
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate("/dashboard/settings?tab=widget")
                            }
                          >
                            <SettingsIcon className="w-4 h-4 ml-1" />
                            تنظیمات
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
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
                                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                                >
                                  <div>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                      {booking.customerName}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      {new Date(
                                        booking.date
                                      ).toLocaleDateString("fa-IR")}{" "}
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
                          <p className="text-slate-500 text-center py-8">
                            هیچ رزروی یافت نشد
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>خدمات</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {businessData.services &&
                        businessData.services.length > 0 ? (
                          <div className="space-y-4">
                            {businessData.services
                              .slice(0, 5)
                              .map((service: any) => (
                                <div
                                  key={service.id}
                                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                                >
                                  <div>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                      {service.name}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      {service.duration} دقیقه - {service.price}{" "}
                                      تومان
                                    </p>
                                  </div>
                                  <Badge
                                    variant={
                                      service.isActive ? "default" : "secondary"
                                    }
                                  >
                                    {service.isActive ? "فعال" : "غیرفعال"}
                                  </Badge>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 text-center py-8">
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
            </motion.div>
          </div>
        ) : (
          // Business owner dashboard layout
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
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
                              {loadingAnalytics ? (
                                <div className="h-8 bg-emerald-100 dark:bg-emerald-900/20 rounded animate-pulse"></div>
                              ) : (
                                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                                  {analyticsData?.totalRevenue
                                    ? `${analyticsData.totalRevenue.toLocaleString("fa-IR")} تومان`
                                    : "0 تومان"}
                                </p>
                              )}
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
                              {loadingAnalytics ? (
                                <div className="h-8 bg-blue-100 dark:bg-blue-900/20 rounded animate-pulse"></div>
                              ) : (
                                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                                  {analyticsData?.totalBookings || 0}
                                </p>
                              )}
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
                              {loadingServices ? (
                                <div className="h-8 bg-purple-100 dark:bg-purple-900/20 rounded animate-pulse"></div>
                              ) : (
                                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                                  {
                                    servicesData.filter(
                                      (service: any) => service.isActive
                                    ).length
                                  }
                                </p>
                              )}
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
                              {loadingAnalytics ? (
                                <div className="h-8 bg-orange-100 dark:bg-orange-900/20 rounded animate-pulse"></div>
                              ) : (
                                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                                  {analyticsData?.todayBookings || 0}
                                </p>
                              )}
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

                {/* Hosted Widget Card */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-emerald-900 dark:text-emerald-100">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                      </div>
                      🔗 صفحه رزرو اختصاصی شما
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        برای مشتریان بدون وب‌سایت - لینک مستقیم رزرو آنلاین
                      </p>
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <code className="text-sm text-slate-700 dark:text-slate-300 break-all">
                          {`${window.location.origin}/w/${businessData?.id}`}
                        </code>
                      </div>
                      <div className="flex space-x-2 space-x-reverse">
                        <Button
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}/w/${businessData?.id}`
                            );
                          }}
                        >
                          کپی لینک
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(
                              `${window.location.origin}/w/${businessData?.id}`,
                              "_blank"
                            )
                          }
                        >
                          <Eye className="w-4 h-4 ml-1" />
                          مشاهده
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate("/dashboard/settings?tab=widget")
                          }
                        >
                          <SettingsIcon className="w-4 h-4 ml-1" />
                          تنظیمات ویجت
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
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
                        className="h-20 flex-col gap-2 border-2 hover:bg-blue-50 hover:border-blue-200 rounded-xl transition-all duration-200"
                        onClick={() => navigate("/dashboard/services")}
                      >
                        <Plus className="w-5 h-5 text-blue-600" />
                        <span className="text-sm">مدیریت خدمات</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2 border-2 hover:bg-green-50 hover:border-green-200 rounded-xl transition-all duration-200"
                        onClick={() => navigate("/dashboard/bookings")}
                      >
                        <Eye className="w-5 h-5 text-green-600" />
                        <span className="text-sm">مشاهده رزروها</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2 border-2 hover:bg-purple-50 hover:border-purple-200 rounded-xl transition-all duration-200"
                        onClick={() => navigate("/dashboard/timeslots")}
                      >
                        <Clock className="w-5 h-5 text-purple-600" />
                        <span className="text-sm">ساعات کاری</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2 border-2 hover:bg-slate-50 hover:border-slate-200 rounded-xl transition-all duration-200"
                        onClick={() => navigate("/dashboard/settings")}
                      >
                        <SettingsIcon className="w-5 h-5 text-slate-600" />
                        <span className="text-sm">تنظیمات</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar - Today's Overview */}
              <div className="space-y-6">
                {/* Today's Schedule */}
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
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
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
                              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50"
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
                                <p className="font-medium text-sm truncate text-slate-900 dark:text-white">
                                  {booking.customerName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
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
                            <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-slate-500 text-sm">
                              رزروی برای امروز ندارید
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">
                          هنوز رزروی ندارید
                        </p>
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
                        <span className="text-sm">
                          ویجت را در سایت قرار دهید
                        </span>
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
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>انتخاب بازه زمانی</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 space-x-reverse">
                  <Button
                    variant={selectedPeriod === "7d" ? "default" : "outline"}
                    onClick={() => handlePeriodChange("7d")}
                    disabled={loadingAnalytics}
                    className={
                      selectedPeriod === "7d"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }
                  >
                    {loadingAnalytics && selectedPeriod === "7d" ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      "7 روز گذشته"
                    )}
                  </Button>
                  <Button
                    variant={selectedPeriod === "30d" ? "default" : "outline"}
                    onClick={() => handlePeriodChange("30d")}
                    disabled={loadingAnalytics}
                    className={
                      selectedPeriod === "30d"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }
                  >
                    {loadingAnalytics && selectedPeriod === "30d" ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      "30 روز گذشته"
                    )}
                  </Button>
                  <Button
                    variant={selectedPeriod === "90d" ? "default" : "outline"}
                    onClick={() => handlePeriodChange("90d")}
                    disabled={loadingAnalytics}
                    className={
                      selectedPeriod === "90d"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }
                  >
                    {loadingAnalytics && selectedPeriod === "90d" ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      "90 روز گذشته"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle>رزروهای اخیر</CardTitle>
                      {searchTerm && (
                        <Badge variant="secondary" className="text-xs">
                          {filteredBookings.length} نتیجه
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/dashboard/bookings")}
                      className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
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
                  ) : filteredBookings.length > 0 ? (
                    <div className="space-y-4">
                      {filteredBookings.map((booking: any) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {booking.customerName}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {new Date(booking.date).toLocaleDateString(
                                "fa-IR"
                              )}{" "}
                              - {booking.startTime}
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(booking.status)}
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {booking.totalAmount} تومان
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      {searchTerm ? (
                        <div className="space-y-2">
                          <p className="text-slate-500">
                            نتیجه‌ای برای "{searchTerm}" یافت نشد
                          </p>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={clearSearch}
                          >
                            پاک کردن جستجو
                          </Button>
                        </div>
                      ) : (
                        <p className="text-slate-500">هیچ رزروی یافت نشد</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Services Overview */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle>خدمات</CardTitle>
                      {searchTerm && (
                        <Badge variant="secondary" className="text-xs">
                          {filteredServices.length} نتیجه
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/dashboard/services")}
                      className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
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
                  ) : filteredServices.length > 0 ? (
                    <div className="space-y-4">
                      {filteredServices.slice(0, 5).map((service: any) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {service.name}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {service.duration} دقیقه
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                service.isActive ? "default" : "secondary"
                              }
                            >
                              {service.isActive ? "فعال" : "غیرفعال"}
                            </Badge>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {service.price} تومان
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      {searchTerm ? (
                        <div className="space-y-2">
                          <p className="text-slate-500 mb-4">
                            نتیجه‌ای برای "{searchTerm}" یافت نشد
                          </p>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={clearSearch}
                          >
                            پاک کردن جستجو
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="text-slate-500 mb-4">
                            هیچ خدمتی یافت نشد
                          </p>
                          <Button
                            onClick={() => navigate("/dashboard/services")}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-6 py-2"
                          >
                            افزودن خدمت جدید
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Period Selector */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>انتخاب بازه زمانی</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 space-x-reverse">
                  <Button
                    variant={selectedPeriod === "7d" ? "default" : "outline"}
                    onClick={() => handlePeriodChange("7d")}
                    disabled={loadingAnalytics}
                    className={
                      selectedPeriod === "7d"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }
                  >
                    {loadingAnalytics && selectedPeriod === "7d" ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      "7 روز گذشته"
                    )}
                  </Button>
                  <Button
                    variant={selectedPeriod === "30d" ? "default" : "outline"}
                    onClick={() => handlePeriodChange("30d")}
                    disabled={loadingAnalytics}
                    className={
                      selectedPeriod === "30d"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }
                  >
                    {loadingAnalytics && selectedPeriod === "30d" ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      "30 روز گذشته"
                    )}
                  </Button>
                  <Button
                    variant={selectedPeriod === "90d" ? "default" : "outline"}
                    onClick={() => handlePeriodChange("90d")}
                    disabled={loadingAnalytics}
                    className={
                      selectedPeriod === "90d"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }
                  >
                    {loadingAnalytics && selectedPeriod === "90d" ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      "90 روز گذشته"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

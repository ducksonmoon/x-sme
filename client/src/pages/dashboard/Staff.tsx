import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import { StaffManagement } from "../../components/StaffManagement";
import { StaffScheduler } from "../../components/StaffScheduler";
import StaffPermissionsManager from "../../components/StaffPermissionsManager";
import UsageLimitWarning from "../../components/UsageLimitWarning";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { api } from "../../services/api";
import {
  Users,
  Plus,
  UserCheck,
  UserX,
  Calendar,
  Star,
  Clock,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Building2,
  AlertCircle,
  Shield,
} from "lucide-react";

const StaffPage: React.FC = () => {
  const { user } = useAuthStore();
  const [staffStats, setStaffStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "management" | "schedule" | "permissions"
  >("management");
  const [triggerAddStaff, setTriggerAddStaff] = useState(false);

  // Fetch subscription data for usage limits
  const { data: subscription } = useQuery({
    queryKey: ["subscription", user?.businessId],
    queryFn: async () => {
      if (user?.businessId) {
        const response = await fetch(
          `/api/subscriptions/business/${user.businessId}`,
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
    enabled: !!user?.businessId,
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

  useEffect(() => {
    if (user?.businessId) {
      fetchStaffStats();
    }
  }, [user?.businessId]);

  const handleAddStaffClick = () => {
    setTriggerAddStaff(true);
  };

  const handleAddStaffTriggered = () => {
    setTriggerAddStaff(false);
  };

  const fetchStaffStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/staff?businessId=${user?.businessId}`);
      if (response.data.success) {
        const staff = response.data.data;

        setStaffStats({
          total: staff.length,
          active: staff.filter((s: any) => s.isActive).length,
          inactive: staff.filter((s: any) => !s.isActive).length,
          totalBookings: staff.reduce(
            (sum: number, s: any) => sum + (s._count?.bookings || 0),
            0
          ),
        });
      }
    } catch (error) {
      console.error("Error fetching staff stats:", error);
      setError("خطا در بارگذاری اطلاعات کارکنان");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (user?.businessId) {
      fetchStaffStats();
    }
  };

  if (!user?.businessId) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            کسب‌وکار مورد نیاز
          </h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            برای مدیریت کارکنان ابتدا باید کسب‌وکار خود را ثبت کنید
          </p>
          <Button
            variant="outline"
            className="px-6 py-2 rounded-xl font-medium"
          >
            ثبت کسب‌وکار
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            خطا در بارگذاری
          </h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <Button
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium"
          >
            تلاش مجدد
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
          <h1 className="text-2xl font-bold text-slate-900">مدیریت کارکنان</h1>
          <p className="text-slate-600 mt-1">
            کارکنان خود را مدیریت کنید و ساعات کاری آن‌ها را تنظیم کنید
          </p>
        </div>
        <Button
          onClick={handleAddStaffClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          افزودن کارمند
        </Button>
      </div>

      {/* Usage Limit Warning */}
      {subscription?.plan && plans && (
        <UsageLimitWarning
          type="bookings"
          current={staffStats.total}
          limit={subscription.plan.bookingsLimit}
          plan={subscription.plan}
          availablePlans={plans}
          billingCycle={subscription.billingCycle as "MONTHLY" | "YEARLY"}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">کل کارکنان</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? "-" : staffStats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">کارکنان فعال</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? "-" : staffStats.active}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">
                کارکنان غیرفعال
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? "-" : staffStats.inactive}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">کل رزروها</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? "-" : staffStats.totalBookings}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">عملیات سریع</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleAddStaffClick}
              className="group flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div className="text-right flex-1">
                <div className="font-semibold text-slate-900 mb-1">
                  افزودن کارمند جدید
                </div>
                <div className="text-sm text-slate-600">
                  کارمند جدید به تیم اضافه کنید
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("schedule")}
              className="group flex items-center gap-4 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-700 transition-colors">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="text-right flex-1">
                <div className="font-semibold text-slate-900 mb-1">
                  مدیریت ساعات کاری
                </div>
                <div className="text-sm text-slate-600">
                  ساعات کاری کارکنان را تنظیم کنید
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("permissions")}
              className="group flex items-center gap-4 p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center group-hover:bg-orange-700 transition-colors">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="text-right flex-1">
                <div className="font-semibold text-slate-900 mb-1">
                  مدیریت دسترسی‌ها
                </div>
                <div className="text-sm text-slate-600">
                  دسترسی‌های کارکنان را مدیریت کنید
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab("management");
                setTimeout(() => {
                  const element = document.querySelector(
                    '[data-section="services"]'
                  );
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }, 100);
              }}
              className="group flex items-center gap-4 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-700 transition-colors">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="text-right flex-1">
                <div className="font-semibold text-slate-900 mb-1">
                  تخصیص خدمات
                </div>
                <div className="text-sm text-slate-600">
                  خدمات را به کارکنان تخصیص دهید
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      {!loading && staffStats.total > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              نگاه کلی عملکرد
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {staffStats.total > 0
                    ? Math.round((staffStats.active / staffStats.total) * 100)
                    : 0}
                  %
                </div>
                <div className="text-sm text-slate-600">نرخ فعالیت کارکنان</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {staffStats.active > 0
                    ? Math.round(staffStats.totalBookings / staffStats.active)
                    : 0}
                </div>
                <div className="text-sm text-slate-600">
                  میانگین رزرو به ازای هر کارمند
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {staffStats.total}
                </div>
                <div className="text-sm text-slate-600">کل اعضای تیم</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("management")}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                activeTab === "management"
                  ? "bg-blue-100 text-blue-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              مدیریت کارکنان
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                activeTab === "schedule"
                  ? "bg-blue-100 text-blue-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              برنامه کاری
            </button>
            <button
              onClick={() => setActiveTab("permissions")}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                activeTab === "permissions"
                  ? "bg-blue-100 text-blue-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              دسترسی‌ها
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {activeTab === "management" ? (
            <StaffManagement
              businessId={user.businessId}
              triggerAddStaff={triggerAddStaff}
              onAddStaffTriggered={handleAddStaffTriggered}
            />
          ) : activeTab === "schedule" ? (
            <StaffScheduler businessId={user.businessId} />
          ) : (
            <StaffPermissionsManager businessId={user.businessId} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffPage;

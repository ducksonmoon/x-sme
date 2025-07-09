import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { StaffManagement } from "../../components/StaffManagement";
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
  const [activeTab, setActiveTab] = useState<"management" | "schedule">(
    "management"
  );
  const [triggerAddStaff, setTriggerAddStaff] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  if (!user?.businessId) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            کسب‌وکار مورد نیاز
          </h3>
          <p className="text-gray-600 mb-4">
            برای مدیریت کارکنان ابتدا باید کسب‌وکار خود را ثبت کنید
          </p>
          <Button variant="outline">ثبت کسب‌وکار</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مدیریت کارکنان</h1>
          <p className="text-gray-600 mt-1">
            کارکنان خود را مدیریت کنید و ساعات کاری آن‌ها را تنظیم کنید
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">کل کارکنان</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "-" : staffStats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">کارکنان فعال</p>
              <p className="text-2xl font-bold text-green-600">
                {loading ? "-" : staffStats.active}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                کارکنان غیرفعال
              </p>
              <p className="text-2xl font-bold text-red-600">
                {loading ? "-" : staffStats.inactive}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">کل رزروها</p>
              <p className="text-2xl font-bold text-purple-600">
                {loading ? "-" : staffStats.totalBookings}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          عملیات سریع
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleAddStaffClick}
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">
                افزودن کارمند جدید
              </div>
              <div className="text-sm text-gray-600">
                کارمند جدید به تیم اضافه کنید
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">مدیریت ساعات کاری</div>
              <div className="text-sm text-gray-600">
                ساعات کاری کارکنان را تنظیم کنید
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              // Scroll to services section or switch to management tab
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
            className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">تخصیص خدمات</div>
              <div className="text-sm text-gray-600">
                خدمات را به کارکنان تخصیص دهید
              </div>
            </div>
          </button>
        </div>
      </Card>

      {/* Main Content */}
      <StaffManagement
        businessId={user.businessId}
        triggerAddStaff={triggerAddStaff}
        onAddStaffTriggered={handleAddStaffTriggered}
      />
    </div>
  );
};

export default StaffPage;

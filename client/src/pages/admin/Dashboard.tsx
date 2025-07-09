import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/api";
import { useLanguage } from "@/providers/LanguageProvider";
import LoadingSpinner from "@/components/LoadingSpinner";

// Icons
const UsersIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </svg>
);

const BusinessIcon = () => (
  <svg
    className="w-6 h-6"
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
);

const BookingIcon = () => (
  <svg
    className="w-6 h-6"
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
);

const RevenueIcon = () => (
  <svg
    className="w-6 h-6"
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
);

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [period, setPeriod] = useState("month");

  // Fetch admin analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["admin-analytics", period],
    queryFn: () => adminApi.getAdminAnalytics(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch recent businesses
  const { data: businesses, isLoading: businessesLoading } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: () => adminApi.getAllBusinesses({ limit: 5 }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch recent users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.getAllUsers({ limit: 5 }),
    staleTime: 5 * 60 * 1000,
  });

  const stats = analytics?.data?.stats || {
    totalUsers: 0,
    totalBusinesses: 0,
    totalBookings: 0,
    totalRevenue: 0,
  };

  const recentActivities = [
    ...(businesses?.data?.businesses || []).map((business: any) => ({
      id: business.id,
      type: "business",
      title: `${business.name} ثبت‌نام کرد`,
      time: new Date(business.createdAt).toLocaleDateString("fa-IR"),
      status: business.status,
    })),
    ...(users?.data?.users || []).map((user: any) => ({
      id: user.id,
      type: "user",
      title: `${user.firstName} ${user.lastName} به سیستم پیوست`,
      time: new Date(user.createdAt).toLocaleDateString("fa-IR"),
      status: user.isActive ? "فعال" : "غیرفعال",
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10);

  if (analyticsLoading || businessesLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            داشبورد مدیر
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            نمای کلی سیستم و آمار
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="block w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="week">هفته گذشته</option>
            <option value="month">ماه گذشته</option>
            <option value="year">سال گذشته</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <UsersIcon />
              </div>
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                کل کاربران
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers?.toLocaleString("fa-IR")}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">
              +12%
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
              از ماه گذشته
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <BusinessIcon />
              </div>
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                کل کسب‌وکارها
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalBusinesses?.toLocaleString("fa-IR")}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">
              +8%
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
              از ماه گذشته
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <BookingIcon />
              </div>
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                کل رزروها
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalBookings?.toLocaleString("fa-IR")}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">
              +15%
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
              از ماه گذشته
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <RevenueIcon />
              </div>
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                درآمد کل
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalRevenue?.toLocaleString("fa-IR")} تومان
              </p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">
              +23%
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
              از ماه گذشته
            </span>
          </div>
        </div>
      </div>

      {/* Charts and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            نمودار رشد
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              نمودار در حال توسعه...
            </p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            فعالیت‌های اخیر
          </h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 space-x-reverse"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "business"
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }`}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      activity.status === "فعال" ||
                      activity.status === "APPROVED"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                هیچ فعالیتی یافت نشد
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          عملیات سریع
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <UsersIcon />
            <span className="mr-2 text-sm font-medium">مدیریت کاربران</span>
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <BusinessIcon />
            <span className="mr-2 text-sm font-medium">مدیریت کسب‌وکارها</span>
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <BookingIcon />
            <span className="mr-2 text-sm font-medium">مشاهده رزروها</span>
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <RevenueIcon />
            <span className="mr-2 text-sm font-medium">گزارش مالی</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

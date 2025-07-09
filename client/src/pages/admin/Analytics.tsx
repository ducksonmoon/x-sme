import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/api";
import { useLanguage } from "@/providers/LanguageProvider";
import LoadingSpinner from "@/components/LoadingSpinner";

const AdminAnalytics: React.FC = () => {
  const { t } = useLanguage();
  const [period, setPeriod] = useState("month");
  const [chartType, setChartType] = useState("revenue");

  // Fetch analytics data
  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-analytics", period],
    queryFn: () => adminApi.getAdminAnalytics(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const stats = analytics?.data?.stats || {
    totalUsers: 0,
    totalBusinesses: 0,
    totalBookings: 0,
    totalRevenue: 0,
    newUsers: 0,
    newBusinesses: 0,
    activeBookings: 0,
    averageRevenue: 0,
  };

  const trends = analytics?.data?.trends || {
    userGrowth: [],
    businessGrowth: [],
    bookingGrowth: [],
    revenueGrowth: [],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          خطا در بارگذاری داده‌ها
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            تحلیل و آمار
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            تحلیل جامع عملکرد سیستم و روند رشد
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3 space-x-reverse">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="block px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="week">هفته گذشته</option>
            <option value="month">ماه گذشته</option>
            <option value="quarter">سه ماه گذشته</option>
            <option value="year">سال گذشته</option>
          </select>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="block px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="revenue">درآمد</option>
            <option value="users">کاربران</option>
            <option value="businesses">کسب‌وکارها</option>
            <option value="bookings">رزروها</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                کاربران جدید
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.newUsers?.toLocaleString("fa-IR")}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">
              +
              {Math.round(
                (stats.newUsers /
                  Math.max(stats.totalUsers - stats.newUsers, 1)) *
                  100
              )}
              %
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
              از دوره قبل
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                کسب‌وکارهای جدید
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.newBusinesses?.toLocaleString("fa-IR")}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">
              +
              {Math.round(
                (stats.newBusinesses /
                  Math.max(stats.totalBusinesses - stats.newBusinesses, 1)) *
                  100
              )}
              %
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
              از دوره قبل
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                رزروهای فعال
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.activeBookings?.toLocaleString("fa-IR")}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">
              +
              {Math.round(
                (stats.activeBookings /
                  Math.max(stats.totalBookings - stats.activeBookings, 1)) *
                  100
              )}
              %
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
              از دوره قبل
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
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
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                میانگین درآمد
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.averageRevenue?.toLocaleString("fa-IR")} تومان
              </p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">
              +
              {Math.round(
                (stats.averageRevenue /
                  Math.max(
                    stats.totalRevenue / Math.max(stats.totalBookings, 1) -
                      stats.averageRevenue,
                    1
                  )) *
                  100
              )}
              %
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
              از دوره قبل
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            روند{" "}
            {chartType === "revenue"
              ? "درآمد"
              : chartType === "users"
                ? "کاربران"
                : chartType === "businesses"
                  ? "کسب‌وکارها"
                  : "رزروها"}
          </h3>
          <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">
                نمودار در حال توسعه...
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Chart.js یا Recharts اضافه خواهد شد
              </p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            معیارهای عملکرد
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                نرخ تبدیل کاربر
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {Math.round(
                  (stats.newBusinesses / Math.max(stats.newUsers, 1)) * 100
                )}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{
                  width: `${Math.min((stats.newBusinesses / Math.max(stats.newUsers, 1)) * 100, 100)}%`,
                }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                میانگین رزرو به ازای کسب‌وکار
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {Math.round(
                  stats.totalBookings / Math.max(stats.totalBusinesses, 1)
                )}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${Math.min((stats.totalBookings / Math.max(stats.totalBusinesses, 1) / 10) * 100, 100)}%`,
                }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                درآمد به ازای رزرو
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {Math.round(
                  stats.totalRevenue / Math.max(stats.totalBookings, 1)
                ).toLocaleString("fa-IR")}{" "}
                تومان
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-yellow-600 h-2 rounded-full"
                style={{
                  width: `${Math.min((stats.totalRevenue / Math.max(stats.totalBookings, 1) / 100000) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            بهترین کسب‌وکارها
          </h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                      {index}
                    </span>
                  </div>
                  <div className="mr-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      کسب‌وکار {index}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      دسته‌بندی {index}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {(Math.random() * 1000000).toLocaleString("fa-IR")} تومان
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.floor(Math.random() * 100)} رزرو
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            فعالیت‌های اخیر
          </h3>
          <div className="space-y-3">
            {[
              {
                type: "user",
                text: "کاربر جدید ثبت‌نام کرد",
                time: "2 دقیقه پیش",
              },
              {
                type: "business",
                text: "کسب‌وکار جدید تایید شد",
                time: "15 دقیقه پیش",
              },
              {
                type: "booking",
                text: "رزرو جدید ایجاد شد",
                time: "1 ساعت پیش",
              },
              {
                type: "revenue",
                text: "پرداخت جدید انجام شد",
                time: "2 ساعت پیش",
              },
              {
                type: "user",
                text: "کاربر جدید ثبت‌نام کرد",
                time: "3 ساعت پیش",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 space-x-reverse"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "user"
                      ? "bg-blue-500"
                      : activity.type === "business"
                        ? "bg-green-500"
                        : activity.type === "booking"
                          ? "bg-purple-500"
                          : "bg-yellow-500"
                  }`}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.text}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useBusiness } from "@/contexts/BusinessContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Analytics: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { business, businessId, isAdmin } = useBusiness();
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

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

  if (loadingAnalytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const analyticsData = analytics?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            تحلیل‌ها و آمار
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            تحلیل‌های {business?.name || "کسب‌وکار"}
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard")}>
          بازگشت به داشبورد
        </Button>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل رزروها</CardTitle>
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
              {analyticsData?.totalBookings || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              در{" "}
              {selectedPeriod === "7d"
                ? "7 روز"
                : selectedPeriod === "30d"
                  ? "30 روز"
                  : "90 روز"}{" "}
              گذشته
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">درآمد کل</CardTitle>
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
              {analyticsData?.totalRevenue
                ? `${analyticsData.totalRevenue.toLocaleString()} تومان`
                : "0 تومان"}
            </div>
            <p className="text-xs text-muted-foreground">
              در{" "}
              {selectedPeriod === "7d"
                ? "7 روز"
                : selectedPeriod === "30d"
                  ? "30 روز"
                  : "90 روز"}{" "}
              گذشته
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              رزروهای تایید شده
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.confirmedBookings || 0}
            </div>
            <p className="text-xs text-muted-foreground">رزروهای تایید شده</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نرخ تکمیل</CardTitle>
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
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.completionRate
                ? `${analyticsData.completionRate}%`
                : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">درصد تکمیل رزروها</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزیع وضعیت رزروها</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData?.statusDistribution ? (
              <div className="space-y-4">
                {Object.entries(analyticsData.statusDistribution).map(
                  ([status, count]: [string, any]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Badge variant="outline">
                          {status === "PENDING"
                            ? "در انتظار"
                            : status === "CONFIRMED"
                              ? "تایید شده"
                              : status === "CANCELLED"
                                ? "لغو شده"
                                : status === "COMPLETED"
                                  ? "تکمیل شده"
                                  : status}
                        </Badge>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                داده‌ای برای نمایش وجود ندارد
              </p>
            )}
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>روند درآمد</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData?.revenueTrend &&
            analyticsData.revenueTrend.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.revenueTrend
                  .slice(-7)
                  .map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">
                        {new Date(item.date).toLocaleDateString("fa-IR")}
                      </span>
                      <span className="font-medium">
                        {item.revenue
                          ? `${item.revenue.toLocaleString()} تومان`
                          : "0 تومان"}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                داده‌ای برای نمایش وجود ندارد
              </p>
            )}
          </CardContent>
        </Card>

        {/* Popular Services */}
        <Card>
          <CardHeader>
            <CardTitle>محبوب‌ترین خدمات</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData?.popularServices &&
            analyticsData.popularServices.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.popularServices
                  .slice(0, 5)
                  .map((service: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-500">
                          {service.bookingCount} رزرو
                        </p>
                      </div>
                      <span className="font-medium">
                        {service.revenue
                          ? `${service.revenue.toLocaleString()} تومان`
                          : "0 تومان"}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                داده‌ای برای نمایش وجود ندارد
              </p>
            )}
          </CardContent>
        </Card>

        {/* Customer Insights */}
        <Card>
          <CardHeader>
            <CardTitle>بینش مشتریان</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">کل مشتریان</span>
                <span className="font-medium">
                  {analyticsData?.totalCustomers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">مشتریان جدید</span>
                <span className="font-medium">
                  {analyticsData?.newCustomers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">مشتریان بازگشتی</span>
                <span className="font-medium">
                  {analyticsData?.returningCustomers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  میانگین رزرو به ازای مشتری
                </span>
                <span className="font-medium">
                  {analyticsData?.avgBookingsPerCustomer || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>گزینه‌های خروجی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3 space-x-reverse">
            <Button variant="outline">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              دانلود گزارش PDF
            </Button>
            <Button variant="outline">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              دانلود گزارش Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;

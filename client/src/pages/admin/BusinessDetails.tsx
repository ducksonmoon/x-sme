import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "@/services/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const BusinessDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: business,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["business-details", id],
    queryFn: () => adminApi.getBusinessDetails(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          خطا در بارگذاری اطلاعات کسب‌وکار
        </p>
        <Button onClick={() => navigate("/admin/businesses")} className="mt-4">
          بازگشت به لیست
        </Button>
      </div>
    );
  }

  const businessData = business.data.data;

  if (!businessData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          اطلاعات کسب‌وکار یافت نشد
        </p>
        <Button onClick={() => navigate("/admin/businesses")} className="mt-4">
          بازگشت به لیست
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            جزئیات کسب‌وکار
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {businessData.name || businessData.id || "نام تعریف نشده"}
          </p>
        </div>
        <Button onClick={() => navigate("/admin/businesses")} variant="outline">
          بازگشت به لیست
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات پایه</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                نام کسب‌وکار
              </label>
              <p className="text-lg font-semibold">
                {businessData.name || "تعریف نشده"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                ایمیل
              </label>
              <p className="text-lg">{businessData.email || "تعریف نشده"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                شماره تماس
              </label>
              <p className="text-lg">{businessData.phone || "تعریف نشده"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                آدرس
              </label>
              <p className="text-lg">{businessData.address || "تعریف نشده"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                وب‌سایت
              </label>
              <p className="text-lg">
                {businessData.website ? (
                  <a
                    href={businessData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {businessData.website}
                  </a>
                ) : (
                  "تعریف نشده"
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
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
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات صاحب کسب‌وکار</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {businessData.owner && businessData.owner.id ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    نام و نام خانوادگی
                  </label>
                  <p className="text-lg font-semibold">
                    {businessData.owner.firstName || ""}{" "}
                    {businessData.owner.lastName || ""}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    ایمیل
                  </label>
                  <p className="text-lg">
                    {businessData.owner.email || "تعریف نشده"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    نقش
                  </label>
                  <p className="text-lg">
                    {businessData.owner.role || "تعریف نشده"}
                  </p>
                </div>
              </>
            ) : businessData.users && businessData.users.length > 0 ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    نام و نام خانوادگی
                  </label>
                  <p className="text-lg font-semibold">
                    {businessData.users[0].firstName || ""}{" "}
                    {businessData.users[0].lastName || ""}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    ایمیل
                  </label>
                  <p className="text-lg">
                    {businessData.users[0].email || "تعریف نشده"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    نقش
                  </label>
                  <p className="text-lg">
                    {businessData.users[0].role || "تعریف نشده"}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-500">اطلاعات صاحب کسب‌وکار موجود نیست</p>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>آمار و ارقام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">
                  {businessData._count?.services || 0}
                </div>
                <div className="text-sm text-gray-500">خدمات</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">
                  {businessData._count?.bookings || 0}
                </div>
                <div className="text-sm text-gray-500">رزروها</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات تکمیلی</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                تاریخ ثبت‌نام
              </label>
              <p className="text-lg">
                {businessData.createdAt
                  ? new Date(businessData.createdAt).toLocaleDateString("fa-IR")
                  : "تعریف نشده"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                آخرین بروزرسانی
              </label>
              <p className="text-lg">
                {businessData.updatedAt
                  ? new Date(businessData.updatedAt).toLocaleDateString("fa-IR")
                  : "تعریف نشده"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                منطقه زمانی
              </label>
              <p className="text-lg">{businessData.timezone || "تعریف نشده"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                تم
              </label>
              <p className="text-lg">{businessData.theme || "تعریف نشده"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Services */}
        <Card>
          <CardHeader>
            <CardTitle>خدمات اخیر</CardTitle>
          </CardHeader>
          <CardContent>
            {businessData.recentServices &&
            Array.isArray(businessData.recentServices) &&
            businessData.recentServices.length > 0 ? (
              <div className="space-y-3">
                {businessData.recentServices.map((service: any) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-gray-500">
                        {service.price} تومان
                      </p>
                    </div>
                    <Badge variant={service.isActive ? "default" : "secondary"}>
                      {service.isActive ? "فعال" : "غیرفعال"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">هیچ خدمتی یافت نشد</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>رزروهای اخیر</CardTitle>
          </CardHeader>
          <CardContent>
            {businessData.recentBookings &&
            Array.isArray(businessData.recentBookings) &&
            businessData.recentBookings.length > 0 ? (
              <div className="space-y-3">
                {businessData.recentBookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-sm text-gray-500">
                        {booking.totalAmount} تومان
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{booking.status}</Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(booking.createdAt).toLocaleDateString(
                          "fa-IR"
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">هیچ رزروی یافت نشد</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessDetails;

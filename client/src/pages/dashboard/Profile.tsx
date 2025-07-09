import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Fetch user profile
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => authApi.getProfile(),
    enabled: !!user,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => {
      return authApi.updateProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setIsEditing(false);
      toast.success("اطلاعات پروفایل با موفقیت بروزرسانی شد");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در بروزرسانی پروفایل");
    },
  });

  const handleEdit = () => {
    if (profile?.data) {
      const profileData = profile.data;
      setFormData({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const profileData = profile?.data || user;

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          خطا در بارگذاری اطلاعات پروفایل
        </p>
        <Button onClick={() => navigate("/dashboard")} className="mt-4">
          بازگشت به داشبورد
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
            پروفایل کاربری
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            مدیریت اطلاعات شخصی
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard")}>
          بازگشت به داشبورد
        </Button>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>اطلاعات شخصی</CardTitle>
            {!isEditing ? (
              <Button onClick={handleEdit}>ویرایش اطلاعات</Button>
            ) : (
              <Button onClick={handleCancel} variant="outline">
                انصراف
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">نام</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder="نام"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    نام خانوادگی
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder="نام خانوادگی"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    ایمیل
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="ایمیل"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    تلفن (اختیاری)
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="تلفن"
                  />
                </div>
              </div>
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  "ذخیره تغییرات"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    نام
                  </label>
                  <p className="mt-1">{profileData.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    نام خانوادگی
                  </label>
                  <p className="mt-1">{profileData.lastName}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    ایمیل
                  </label>
                  <p className="mt-1">{profileData.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    تلفن
                  </label>
                  <p className="mt-1">{profileData.phone || "ثبت نشده"}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات حساب کاربری</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  نوع کاربر
                </label>
                <p className="mt-1">
                  {profileData.role === "ADMIN"
                    ? "مدیر سیستم"
                    : "صاحب کسب‌وکار"}
                </p>
              </div>
              <Badge
                variant={profileData.role === "ADMIN" ? "default" : "secondary"}
              >
                {profileData.role === "ADMIN" ? "مدیر" : "کاربر"}
              </Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                تاریخ عضویت
              </label>
              <p className="mt-1">
                {profileData.createdAt
                  ? new Date(profileData.createdAt).toLocaleDateString("fa-IR")
                  : "نامشخص"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                آخرین ورود
              </label>
              <p className="mt-1">
                {profileData.lastLoginAt
                  ? new Date(profileData.lastLoginAt).toLocaleDateString(
                      "fa-IR"
                    )
                  : "نامشخص"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>تنظیمات امنیتی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h3 className="font-medium">تغییر رمز عبور</h3>
                <p className="text-sm text-gray-500">
                  رمز عبور خود را تغییر دهید
                </p>
              </div>
              <Button variant="outline" size="sm">
                تغییر رمز
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h3 className="font-medium">احراز هویت دو مرحله‌ای</h3>
                <p className="text-sm text-gray-500">
                  افزودن لایه امنیتی بیشتر
                </p>
              </div>
              <Button variant="outline" size="sm">
                فعال‌سازی
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Businesses */}
      {profileData.role !== "ADMIN" && (
        <Card>
          <CardHeader>
            <CardTitle>کسب‌وکارهای متصل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profileData.businesses && profileData.businesses.length > 0 ? (
                profileData.businesses.map((business: any) => (
                  <div
                    key={business.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{business.name}</h3>
                      <p className="text-sm text-gray-500">
                        {business.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Badge
                        variant={business.isActive ? "default" : "secondary"}
                      >
                        {business.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/dashboard")}
                      >
                        مدیریت
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  هیچ کسب‌وکاری یافت نشد
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;

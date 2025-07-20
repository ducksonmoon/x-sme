import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useBusiness } from "@/contexts/BusinessContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import UsageLimitWarning from "@/components/UsageLimitWarning";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import {
  Plus,
  Edit2,
  Eye,
  EyeOff,
  Clock,
  DollarSign,
  Settings,
  Search,
  Filter,
  MoreVertical,
  X,
} from "lucide-react";

interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: number;
  isActive: boolean;
}

const Services: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { business, businessId, isAdmin } = useBusiness();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    duration: 30,
    price: 0,
    isActive: true,
  });

  // Fetch subscription data for usage limits
  const { data: subscription } = useQuery({
    queryKey: ["subscription", businessId],
    queryFn: async () => {
      if (businessId) {
        const response = await fetch(
          `/api/subscriptions/business/${businessId}`,
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
    enabled: !!businessId,
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

  // Add service mutation
  const addServiceMutation = useMutation({
    mutationFn: (data: ServiceFormData) => {
      if (businessId) {
        return dashboardApi.createService(businessId, data);
      }
      return Promise.reject("No business found");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-services"] });
      handleCancel();
      toast.success("خدمت با موفقیت اضافه شد");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "خطا در افزودن خدمت"
      );
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServiceFormData }) => {
      if (!businessId) {
        return Promise.reject("No business found");
      }
      return dashboardApi.updateService(id, data, businessId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-services"] });
      handleCancel();
      toast.success("خدمت با موفقیت بروزرسانی شد");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در بروزرسانی خدمت");
    },
  });

  // Toggle service status mutation
  const toggleServiceMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
      if (!businessId) {
        return Promise.reject("No business found");
      }
      return dashboardApi.updateService(id, { isActive }, businessId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-services"] });
      toast.success("وضعیت خدمت تغییر کرد");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در تغییر وضعیت خدمت");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("نام خدمت الزامی است");
      return;
    }
    if (formData.price < 0) {
      toast.error("قیمت نمی‌تواند منفی باشد");
      return;
    }
    if (formData.duration < 1) {
      toast.error("مدت زمان باید حداقل ۱ دقیقه باشد");
      return;
    }

    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data: formData });
    } else {
      if (!businessId) {
        toast.error("کسب‌وکار یافت نشد. لطفاً صفحه را مجدداً بارگذاری کنید.");
        return;
      }
      addServiceMutation.mutate(formData);
    }
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      duration: service.duration,
      price: service.price,
      isActive: service.isActive,
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      duration: 30,
      price: 0,
      isActive: true,
    });
  };

  const handleToggleStatus = (service: any) => {
    toggleServiceMutation.mutate({
      id: service.id,
      isActive: !service.isActive,
    });
  };

  // Filter and search services
  const servicesData = services?.data?.data || [];
  const filteredServices = servicesData.filter((service: any) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && service.isActive) ||
      (filterStatus === "inactive" && !service.isActive);
    return matchesSearch && matchesFilter;
  });

  const activeServicesCount = servicesData.filter(
    (s: any) => s.isActive
  ).length;
  const totalRevenue = servicesData.reduce(
    (sum: number, s: any) => sum + s.price,
    0
  );

  if (loadingServices) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-600">در حال بارگذاری خدمات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">مدیریت خدمات</h1>
          <p className="text-slate-600 mt-1">
            مدیریت و تنظیم خدمات {business?.name || "کسب‌وکار"}
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          افزودن خدمت
        </Button>
      </div>

      {/* Usage Limit Warning */}
      {subscription?.plan && plans && (
        <UsageLimitWarning
          type="services"
          current={servicesData.length}
          limit={subscription.plan.servicesLimit}
          plan={subscription.plan}
          availablePlans={plans}
          billingCycle={subscription.billingCycle as "MONTHLY" | "YEARLY"}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">کل خدمات</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {servicesData.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">خدمات فعال</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {activeServicesCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">متوسط قیمت</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {servicesData.length > 0
                  ? Math.round(
                      totalRevenue / servicesData.length
                    ).toLocaleString()
                  : 0}
                <span className="text-sm text-slate-500 mr-1">تومان</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingService ? "ویرایش خدمت" : "افزودن خدمت جدید"}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  نام خدمت *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="نام خدمت را وارد کنید"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  قیمت (تومان) *
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: Math.max(0, Number(e.target.value)),
                    })
                  }
                  placeholder="0"
                  className="w-full"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-900 mb-2">
                توضیحات
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="توضیحات خدمت (اختیاری)"
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  مدت زمان (دقیقه) *
                </label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: Math.max(1, Number(e.target.value)),
                    })
                  }
                  placeholder="30"
                  className="w-full"
                  min="1"
                  required
                />
              </div>

              <div className="flex items-center justify-start pt-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-900">
                    خدمت فعال باشد
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
              <Button
                type="submit"
                disabled={
                  addServiceMutation.isPending ||
                  updateServiceMutation.isPending
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium"
              >
                {addServiceMutation.isPending ||
                updateServiceMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="mr-2">در حال پردازش...</span>
                  </>
                ) : editingService ? (
                  "بروزرسانی خدمت"
                ) : (
                  "افزودن خدمت"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="px-6 py-2 rounded-xl font-medium"
              >
                انصراف
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجو در خدمات..."
            className="pr-10 rounded-xl"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as "all" | "active" | "inactive")
          }
          className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">همه خدمات</option>
          <option value="active">فعال</option>
          <option value="inactive">غیرفعال</option>
        </select>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            لیست خدمات ({filteredServices.length})
          </h2>
        </div>

        {filteredServices.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {filteredServices.map((service: any) => (
              <div
                key={service.id}
                className="p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">
                        {service.name}
                      </h3>
                      <Badge
                        variant={service.isActive ? "default" : "secondary"}
                        className={`${
                          service.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-600"
                        } px-2 py-1 text-xs rounded-full`}
                      >
                        {service.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
                    </div>

                    {service.description && (
                      <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                        {service.description}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration} دقیقه</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{service.price.toLocaleString()} تومان</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                      className="px-3 py-1.5 text-xs rounded-lg"
                    >
                      <Edit2 className="w-3 h-3 ml-1" />
                      ویرایش
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(service)}
                      disabled={toggleServiceMutation.isPending}
                      className={`px-3 py-1.5 text-xs rounded-lg ${
                        service.isActive
                          ? "text-red-600 hover:bg-red-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {service.isActive ? (
                        <>
                          <EyeOff className="w-3 h-3 ml-1" />
                          غیرفعال
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 ml-1" />
                          فعال
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm || filterStatus !== "all"
                ? "خدمتی یافت نشد"
                : "هیچ خدمتی وجود ندارد"}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || filterStatus !== "all"
                ? "تنظیمات جستجو یا فیلتر را تغییر دهید"
                : "اولین خدمت خود را اضافه کنید"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium"
              >
                <Plus className="w-4 h-4 ml-2" />
                افزودن خدمت جدید
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;

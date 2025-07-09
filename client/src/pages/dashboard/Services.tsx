import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useBusiness } from "@/contexts/BusinessContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";

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
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    duration: 30,
    price: 0,
    isActive: true,
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
      setShowAddForm(false);
      setFormData({
        name: "",
        description: "",
        duration: 30,
        price: 0,
        isActive: true,
      });
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
      setEditingService(null);
      setFormData({
        name: "",
        description: "",
        duration: 30,
        price: 0,
        isActive: true,
      });
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
      description: service.description,
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

  if (loadingServices) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const servicesData = services?.data?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            مدیریت خدمات
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            مدیریت و تنظیم خدمات {business?.name || "کسب‌وکار"}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>افزودن خدمت جدید</Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingService ? "ویرایش خدمت" : "افزودن خدمت جدید"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    نام خدمت
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="نام خدمت"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    قیمت (تومان)
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
                    }
                    placeholder="قیمت"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  توضیحات
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="توضیحات خدمت"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    مدت زمان (دقیقه)
                  </label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: Number(e.target.value),
                      })
                    }
                    placeholder="مدت زمان"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    فعال
                  </label>
                </div>
              </div>
              <div className="flex space-x-3 space-x-reverse">
                <Button
                  type="submit"
                  disabled={
                    addServiceMutation.isPending ||
                    updateServiceMutation.isPending
                  }
                >
                  {addServiceMutation.isPending ||
                  updateServiceMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : editingService ? (
                    "بروزرسانی"
                  ) : (
                    "افزودن"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  انصراف
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle>لیست خدمات</CardTitle>
        </CardHeader>
        <CardContent>
          {servicesData.length > 0 ? (
            <div className="space-y-4">
              {servicesData.map((service: any) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <h3 className="font-medium">{service.name}</h3>
                      <Badge
                        variant={service.isActive ? "default" : "secondary"}
                      >
                        {service.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {service.description}
                    </p>
                    <div className="flex items-center space-x-4 space-x-reverse mt-2 text-sm text-gray-600">
                      <span>مدت: {service.duration} دقیقه</span>
                      <span>قیمت: {service.price} تومان</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      ویرایش
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toggleServiceMutation.mutate({
                          id: service.id,
                          isActive: !service.isActive,
                        })
                      }
                      disabled={toggleServiceMutation.isPending}
                    >
                      {service.isActive ? "غیرفعال" : "فعال"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">هیچ خدمتی یافت نشد</p>
              <Button onClick={() => setShowAddForm(true)}>
                افزودن خدمت جدید
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Services;

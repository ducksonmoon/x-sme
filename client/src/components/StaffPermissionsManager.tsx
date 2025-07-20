import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { permissionsApi } from "@/services/api";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Modal from "./ui/modal";
import LoadingSpinner from "./LoadingSpinner";
import { Badge } from "./ui/badge";
import {
  Shield,
  Users,
  Settings,
  Eye,
  Edit,
  Plus,
  Trash,
  Save,
  RotateCcw,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  UserCheck,
  Lock,
  Unlock,
  Key,
  Zap,
  Star,
  Calendar,
  BarChart3,
  Building,
  Cog,
  User,
  Clock,
} from "lucide-react";
import Toast, { showToast } from "./ui/toast";

interface StaffPermissionsManagerProps {
  businessId: string;
}

interface Permission {
  [page: string]: {
    [action: string]: boolean;
  };
}

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization: string;
  isActive: boolean;
  _count: {
    bookings: number;
  };
  permissions: Permission;
}

const StaffPermissionsManager: React.FC<StaffPermissionsManagerProps> = ({
  businessId,
}) => {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [permissions, setPermissions] = useState<Permission>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch available pages and actions
  const { data: availablePages, isLoading: loadingPages } = useQuery({
    queryKey: ["available-pages"],
    queryFn: async () => {
      const response = await permissionsApi.getAvailablePages();
      return response.data.data;
    },
  });

  // Fetch staff with permissions
  const { data: staffList, isLoading: loadingStaff } = useQuery({
    queryKey: ["business-staff-permissions", businessId],
    queryFn: async () => {
      const response =
        await permissionsApi.getBusinessStaffPermissions(businessId);
      return response.data.data;
    },
    enabled: !!businessId,
  });

  // Update permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({
      staffId,
      permissions,
    }: {
      staffId: string;
      permissions: Permission;
    }) => {
      return permissionsApi.updateStaffPermissions(staffId, permissions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["business-staff-permissions", businessId],
      });
      showToast("success", "دسترسی‌ها با موفقیت به‌روزرسانی شد");
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      showToast(
        "error",
        error.response?.data?.error || "خطا در به‌روزرسانی دسترسی‌ها"
      );
    },
  });

  // Set default permissions mutation
  const setDefaultPermissionsMutation = useMutation({
    mutationFn: async (staffId: string) => {
      return permissionsApi.setDefaultPermissions(staffId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["business-staff-permissions", businessId],
      });
      showToast("success", "دسترسی‌های پیش‌فرض با موفقیت تنظیم شد");
    },
    onError: (error: any) => {
      showToast(
        "error",
        error.response?.data?.error || "خطا در تنظیم دسترسی‌های پیش‌فرض"
      );
    },
  });

  const handleOpenPermissions = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setPermissions(staff.permissions);
    setIsModalOpen(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedStaff) return;

    setIsSubmitting(true);
    try {
      await updatePermissionsMutation.mutateAsync({
        staffId: selectedStaff.id,
        permissions,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefaultPermissions = async (staffId: string) => {
    if (
      confirm(
        "آیا مطمئن هستید که می‌خواهید دسترسی‌های این کارمند را به حالت پیش‌فرض بازنشانی کنید؟"
      )
    ) {
      await setDefaultPermissionsMutation.mutateAsync(staffId);
    }
  };

  const handlePermissionChange = (
    page: string,
    action: string,
    value: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [page]: {
        ...prev[page],
        [action]: value,
      },
    }));
  };

  const handleSelectAllPage = (page: string, value: boolean) => {
    if (!availablePages || !availablePages[page]) return;

    const pageActions = availablePages[page].actions;
    setPermissions((prev) => ({
      ...prev,
      [page]: pageActions.reduce(
        (acc: Record<string, boolean>, action: string) => {
          acc[action] = value;
          return acc;
        },
        {} as Record<string, boolean>
      ),
    }));
  };

  const getFilteredStaff = () => {
    if (!staffList) return [];

    let filtered = staffList;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (staff: StaffMember) =>
          staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by active status
    if (filterActive !== "all") {
      filtered = filtered.filter((staff: StaffMember) =>
        filterActive === "active" ? staff.isActive : !staff.isActive
      );
    }

    return filtered;
  };

  const getPermissionCount = (staff: StaffMember) => {
    let total = 0;
    let granted = 0;

    Object.values(staff.permissions).forEach((pagePermissions) => {
      Object.values(pagePermissions).forEach((hasPermission) => {
        total++;
        if (hasPermission) granted++;
      });
    });

    return { total, granted };
  };

  const getPermissionSummary = (staff: StaffMember) => {
    const { total, granted } = getPermissionCount(staff);
    const percentage = total > 0 ? Math.round((granted / total) * 100) : 0;

    if (percentage === 100) return "دسترسی کامل";
    if (percentage >= 75) return "دسترسی بالا";
    if (percentage >= 50) return "دسترسی متوسط";
    if (percentage >= 25) return "دسترسی کم";
    return "بدون دسترسی";
  };

  const getPageIcon = (pageKey: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      dashboard: <BarChart3 className="h-5 w-5" />,
      bookings: <Calendar className="h-5 w-5" />,
      services: <Star className="h-5 w-5" />,
      staff: <Users className="h-5 w-5" />,
      timeslots: <Clock className="h-5 w-5" />,
      analytics: <BarChart3 className="h-5 w-5" />,
      domains: <Building className="h-5 w-5" />,
      settings: <Cog className="h-5 w-5" />,
      profile: <User className="h-5 w-5" />,
    };
    return iconMap[pageKey] || <Key className="h-5 w-5" />;
  };

  const getActionLabel = (action: string) => {
    const actionMap: Record<string, string> = {
      VIEW: "مشاهده",
      CREATE: "ایجاد",
      EDIT: "ویرایش",
      DELETE: "حذف",
      MANAGE: "مدیریت",
    };
    return actionMap[action] || action;
  };

  const getActionDescription = (action: string) => {
    const descriptionMap: Record<string, string> = {
      VIEW: "مشاهده و دسترسی",
      CREATE: "ایجاد موارد جدید",
      EDIT: "تغییر موارد موجود",
      DELETE: "حذف موارد",
      MANAGE: "مدیریت کامل",
    };
    return descriptionMap[action] || action;
  };

  if (loadingPages || loadingStaff) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              مدیریت دسترسی‌ها
            </h2>
            <p className="text-slate-600 mt-1">
              کنترل دسترسی کارکنان به بخش‌های مختلف سیستم
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="جستجو در کارکنان..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 text-right"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterActive === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterActive("all")}
          >
            همه
          </Button>
          <Button
            variant={filterActive === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterActive("active")}
          >
            فعال
          </Button>
          <Button
            variant={filterActive === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterActive("inactive")}
          >
            غیرفعال
          </Button>
        </div>
      </div>

      {/* Staff List */}
      <div className="grid gap-4">
        {getFilteredStaff().map((staff: StaffMember) => {
          const { total, granted } = getPermissionCount(staff);
          const summary = getPermissionSummary(staff);

          return (
            <Card key={staff.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <h3 className="font-medium text-slate-900">
                      {staff.firstName} {staff.lastName}
                    </h3>
                    <p className="text-sm text-slate-600">{staff.email}</p>
                    <p className="text-xs text-slate-500">
                      {staff.specialization}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <Badge variant={staff.isActive ? "default" : "secondary"}>
                        {staff.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
                      <Badge variant="outline">{summary}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {granted}/{total} دسترسی
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetDefaultPermissions(staff.id)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleOpenPermissions(staff)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {getFilteredStaff().length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              کارکنانی یافت نشد
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterActive !== "all"
                ? "فیلترها یا عبارت جستجو را تغییر دهید"
                : "هیچ کارمندی با دسترسی ورود یافت نشد"}
            </p>
          </div>
        )}
      </div>

      {/* Permissions Modal */}
      {isModalOpen && selectedStaff && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Key className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    مدیریت دسترسی‌ها
                  </h2>
                  <p className="text-slate-600">
                    {selectedStaff.firstName} {selectedStaff.lastName}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => handleSetDefaultPermissions(selectedStaff.id)}
              >
                <RotateCcw className="h-4 w-4 ml-2" />
                بازنشانی به پیش‌فرض
              </Button>
            </div>

            <div className="space-y-6 max-h-96 overflow-y-auto">
              {availablePages &&
                Object.entries(availablePages).map(
                  ([pageKey, pageInfo]: [string, any]) => (
                    <Card key={pageKey} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            {getPageIcon(pageKey)}
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900">
                              {pageInfo.name}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {pageInfo.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSelectAllPage(pageKey, true)}
                          >
                            انتخاب همه
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSelectAllPage(pageKey, false)}
                          >
                            پاک کردن
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {pageInfo.actions.map((action: string) => (
                          <label
                            key={action}
                            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={permissions[pageKey]?.[action] || false}
                              onChange={(e) =>
                                handlePermissionChange(
                                  pageKey,
                                  action,
                                  e.target.checked
                                )
                              }
                              className="ml-3 h-4 w-4 text-blue-600"
                            />
                            <div className="text-right">
                              <div className="font-medium text-sm text-slate-900">
                                {getActionLabel(action)}
                              </div>
                              <div className="text-xs text-slate-500">
                                {getActionDescription(action)}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </Card>
                  )
                )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                انصراف
              </Button>
              <Button onClick={handleSavePermissions} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="ml-2" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 ml-2" />
                    ذخیره دسترسی‌ها
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StaffPermissionsManager;

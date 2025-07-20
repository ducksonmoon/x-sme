import React, { useState, useEffect } from "react";
import { Staff, StaffWorkingHour } from "../types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import Modal from "./ui/modal";
import LoadingSpinner from "./LoadingSpinner";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { api } from "../services/api";
import {
  UserPlus,
  Edit,
  Trash2,
  Clock,
  Calendar,
  Phone,
  Mail,
  Star,
  Users,
  Settings,
  Plus,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import Toast, { showToast } from "./ui/toast";

interface StaffManagementProps {
  businessId: string;
  triggerAddStaff?: boolean;
  onAddStaffTriggered?: () => void;
}

interface StaffFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  bio: string;
  experience: string;
  canLogin: boolean;
  password: string;
  workingHours: StaffWorkingHour[];
  serviceIds: string[];
}

const DAYS_OF_WEEK = [
  { value: 0, label: "یکشنبه", short: "ی" },
  { value: 1, label: "دوشنبه", short: "د" },
  { value: 2, label: "سه‌شنبه", short: "س" },
  { value: 3, label: "چهارشنبه", short: "چ" },
  { value: 4, label: "پنج‌شنبه", short: "پ" },
  { value: 5, label: "جمعه", short: "ج" },
  { value: 6, label: "شنبه", short: "ش" },
];

export const StaffManagement: React.FC<StaffManagementProps> = ({
  businessId,
  triggerAddStaff,
  onAddStaffTriggered,
}) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "bookings" | "active">("name");
  const [formData, setFormData] = useState<StaffFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
    bio: "",
    experience: "",
    canLogin: false,
    password: "",
    workingHours: [],
    serviceIds: [],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (businessId) {
      fetchStaff();
      fetchServices();
    }
  }, [businessId]);

  useEffect(() => {
    if (triggerAddStaff) {
      handleCreateStaff();
      onAddStaffTriggered?.();
    }
  }, [triggerAddStaff, onAddStaffTriggered]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/staff?businessId=${businessId}`);
      if (response.data.success) {
        setStaff(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get(`/services?businessId=${businessId}`);
      if (response.data.success) {
        setServices(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleCreateStaff = () => {
    setSelectedStaff(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      specialization: "",
      bio: "",
      experience: "",
      canLogin: false,
      password: "",
      workingHours: [],
      serviceIds: [],
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEditStaff = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setFormData({
      firstName: staffMember.firstName,
      lastName: staffMember.lastName,
      email: staffMember.email || "",
      phone: staffMember.phone || "",
      specialization: staffMember.specialization || "",
      bio: staffMember.bio || "",
      experience: staffMember.experience || "",
      canLogin: staffMember.canLogin || false,
      password: "",
      workingHours:
        staffMember.workingHours || staffMember.staff_working_hours || [],
      serviceIds:
        (staffMember.services || staffMember.staff_services)?.map(
          (s) => s.serviceId
        ) || [],
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "نام الزامی است";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "نام خانوادگی الزامی است";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "ایمیل معتبر نیست";
    }

    if (formData.phone && !/^09\d{9}$/.test(formData.phone)) {
      errors.phone = "شماره تلفن معتبر نیست";
    }

    if (formData.canLogin) {
      if (!formData.email) {
        errors.email = "ایمیل برای ورود الزامی است";
      }
      if (!formData.password || formData.password.length < 6) {
        errors.password = "رمز عبور باید حداقل 6 کاراکتر باشد";
      }
    }

    if (formData.serviceIds.length === 0) {
      errors.services = "حداقل یک خدمت باید انتخاب شود";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const url = selectedStaff ? `/staff/${selectedStaff.id}` : "/staff";
      const method = selectedStaff ? "put" : "post";

      // Clean up working hours data for API
      const cleanWorkingHours = formData.workingHours.map((wh) => ({
        dayOfWeek: wh.dayOfWeek,
        startTime: wh.startTime,
        endTime: wh.endTime,
        isActive: wh.isActive,
      }));

      const requestData = {
        ...formData,
        workingHours: cleanWorkingHours,
        businessId: selectedStaff ? undefined : businessId,
      };

      const response = await api[method](url, requestData);

      if (response.data.success) {
        setIsModalOpen(false);
        fetchStaff();
        showToast(
          "success",
          selectedStaff
            ? "کارمند با موفقیت بروزرسانی شد"
            : "کارمند با موفقیت اضافه شد"
        );
      } else {
        showToast("error", response.data.error || "خطا در ذخیره اطلاعات");
      }
    } catch (error: any) {
      console.error("Error saving staff:", error);
      showToast("error", error.response?.data?.error || "خطا در ذخیره اطلاعات");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (
      confirm(
        "آیا از حذف این کارمند اطمینان دارید؟ این عملیات قابل بازگشت نیست."
      )
    ) {
      try {
        const response = await api.delete(`/staff/${staffId}`);

        if (response.data.success) {
          fetchStaff();
          showToast("success", "کارمند با موفقیت حذف شد");
        } else {
          showToast("error", response.data.error || "خطا در حذف کارمند");
        }
      } catch (error: any) {
        console.error("Error deleting staff:", error);
        showToast("error", error.response?.data?.error || "خطا در حذف کارمند");
      }
    }
  };

  const addWorkingHour = () => {
    setFormData((prev) => ({
      ...prev,
      workingHours: [
        ...prev.workingHours,
        {
          id: "",
          staffId: "",
          dayOfWeek: 1,
          startTime: "09:00",
          endTime: "17:00",
          isActive: true,
        },
      ],
    }));
  };

  const updateWorkingHour = (
    index: number,
    field: keyof StaffWorkingHour,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: prev.workingHours.map((wh, i) =>
        i === index ? { ...wh, [field]: value } : wh
      ),
    }));
  };

  const removeWorkingHour = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: prev.workingHours.filter((_, i) => i !== index),
    }));
  };

  const getFilteredAndSortedStaff = () => {
    let filtered = staff.filter((member) => {
      const matchesSearch =
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.specialization?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecialization =
        !filterSpecialization || member.specialization === filterSpecialization;

      return matchesSearch && matchesSpecialization;
    });

    // Sort staff
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          );
        case "bookings":
          return (b._count?.bookings || 0) - (a._count?.bookings || 0);
        case "active":
          return a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getSpecializations = () => {
    const specs = staff.map((s) => s.specialization).filter(Boolean);
    return [...new Set(specs)];
  };

  const getWorkingHoursDisplay = (workingHours: StaffWorkingHour[]) => {
    console.log("Working hours data:", workingHours); // Debug log
    if (
      !workingHours ||
      !Array.isArray(workingHours) ||
      workingHours.length === 0
    ) {
      return "ساعات کاری تنظیم نشده";
    }
    const activeHours = workingHours.filter((wh) => wh.isActive !== false);
    if (activeHours.length === 0) {
      return "ساعات کاری غیرفعال";
    }
    // Sort by day of week
    const sortedHours = activeHours.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    return sortedHours
      .map((wh) => {
        const day = DAYS_OF_WEEK.find((d) => d.value === wh.dayOfWeek);
        return `${day?.short || wh.dayOfWeek} ${wh.startTime}-${wh.endTime}`;
      })
      .join(", ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const filteredStaff = getFilteredAndSortedStaff();
  const specializations = getSpecializations();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">مدیریت کارکنان</h1>
            <p className="text-gray-600 mt-1">
              {staff.length} کارمند • {staff.filter((s) => s.isActive).length}{" "}
              فعال
            </p>
          </div>
          <Button
            onClick={handleCreateStaff}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            افزودن کارمند جدید
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              جستجو
            </label>
            <Input
              placeholder="جستجو بر اساس نام یا تخصص..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تخصص
            </label>
            <select
              value={filterSpecialization}
              onChange={(e) => setFilterSpecialization(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">همه تخصص‌ها</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مرتب‌سازی
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="name">بر اساس نام</option>
              <option value="bookings">بر اساس تعداد رزرو</option>
              <option value="active">بر اساس وضعیت</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => {
                setSearchTerm("");
                setFilterSpecialization("");
                setSortBy("name");
              }}
              variant="outline"
              className="w-full"
            >
              پاک کردن فیلترها
            </Button>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((staffMember) => (
          <Card
            key={staffMember.id}
            className="bg-white rounded-2xl shadow-lg p-0 flex flex-col items-center transition-transform duration-200 hover:shadow-2xl hover:scale-[1.025] border border-gray-100"
          >
            {/* Avatar */}
            <div className="flex flex-col items-center w-full pt-6 pb-2">
              <div className="rounded-full border-4 border-blue-100 shadow-md w-20 h-20 flex items-center justify-center bg-white overflow-hidden mb-2">
                {staffMember.avatar ? (
                  <img
                    src={staffMember.avatar}
                    alt={`${staffMember.firstName} ${staffMember.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-blue-700">
                    {staffMember.firstName.charAt(0)}
                    {staffMember.lastName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="text-lg font-bold text-gray-900 text-center">
                {staffMember.firstName} {staffMember.lastName}
              </div>
              {staffMember.specialization && (
                <span className="mt-1 inline-block bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                  {staffMember.specialization}
                </span>
              )}
            </div>

            {/* Contact Info */}
            <div className="flex flex-col items-center gap-1 w-full px-6 pb-2">
              {staffMember.email && (
                <div className="flex items-center text-xs text-gray-500">
                  <Mail className="w-4 h-4 mr-1 text-gray-400" />
                  <span className="truncate">{staffMember.email}</span>
                </div>
              )}
              {staffMember.phone && (
                <div className="flex items-center text-xs text-gray-500">
                  <Phone className="w-4 h-4 mr-1 text-gray-400" />
                  <span>{staffMember.phone}</span>
                </div>
              )}
            </div>

            {/* Services */}
            <div className="w-full px-6 pb-2">
              <div className="flex flex-wrap gap-1 justify-center">
                {(staffMember.services || staffMember.staff_services)
                  ?.slice(0, 3)
                  .map((service) => (
                    <Badge
                      key={service.id}
                      variant="outline"
                      className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {service.services?.name ||
                        service.service?.name ||
                        "نامشخص"}
                    </Badge>
                  ))}
                {((staffMember.services || staffMember.staff_services)
                  ?.length || 0) > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-gray-100 text-gray-600 border-gray-200"
                  >
                    +
                    {((staffMember.services || staffMember.staff_services)
                      ?.length || 0) - 3}{" "}
                    بیشتر
                  </Badge>
                )}
              </div>
            </div>

            {/* Bio */}
            {staffMember.bio && (
              <div className="text-xs text-gray-700 bg-gray-50 px-6 py-2 rounded-md w-full text-center mb-2">
                <p className="line-clamp-2">{staffMember.bio}</p>
              </div>
            )}

            {/* Working Hours & Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-between w-full px-6 py-2 border-t border-gray-100 gap-2">
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-4 h-4 mr-1 text-gray-400" />
                <span>
                  {getWorkingHoursDisplay(
                    staffMember.workingHours ||
                      staffMember.staff_working_hours ||
                      []
                  )}
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Users className="w-4 h-4 mr-1 text-gray-400" />
                <span>{staffMember._count?.bookings || 0} رزرو</span>
              </div>
              {staffMember.experience && (
                <div className="flex items-center text-xs text-gray-500">
                  <Star className="w-4 h-4 mr-1 text-gray-400" />
                  <span>{staffMember.experience}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-2 w-full px-6 pb-6 pt-2">
              <Button
                onClick={() => handleEditStaff(staffMember)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-1" />
                ویرایش
              </Button>
              <Button
                onClick={() => handleDeleteStaff(staffMember.id)}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                حذف
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredStaff.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterSpecialization
              ? "نتیجه‌ای یافت نشد"
              : "هنوز کارمندی اضافه نشده است"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterSpecialization
              ? "فیلترهای خود را تغییر دهید یا کارمند جدیدی اضافه کنید"
              : "برای شروع، اولین کارمند خود را اضافه کنید"}
          </p>
          <Button
            onClick={handleCreateStaff}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            افزودن کارمند جدید
          </Button>
        </div>
      )}

      {/* Staff Form Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <div className="sticky top-0 z-10 bg-white pb-2 mb-4 border-b">
            <h2 className="text-xl font-bold text-gray-900 text-center py-3">
              {selectedStaff ? "ویرایش کارمند" : "افزودن کارمند جدید"}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 px-1 md:px-4">
            {/* Basic Information */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="text-base font-medium text-gray-900 mb-3">
                اطلاعات شخصی
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نام <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    className={formErrors.firstName ? "border-red-500" : ""}
                  />
                  {formErrors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نام خانوادگی <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    className={formErrors.lastName ? "border-red-500" : ""}
                  />
                  {formErrors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ایمیل
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className={formErrors.email ? "border-red-500" : ""}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    شماره تلفن
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className={formErrors.phone ? "border-red-500" : ""}
                    placeholder="09123456789"
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تخصص
                  </label>
                  <Input
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        specialization: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تجربه کاری
                  </label>
                  <Input
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        experience: e.target.value,
                      }))
                    }
                    placeholder="مثال: 5 سال"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  درباره کارمند
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md resize-none"
                  rows={2}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="توضیحات مختصری درباره کارمند..."
                />
              </div>

              {/* Login Access */}
              <div className="mt-3">
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    id="canLogin"
                    checked={formData.canLogin}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        canLogin: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600"
                  />
                  <label
                    htmlFor="canLogin"
                    className="text-sm font-medium text-gray-700"
                  >
                    امکان ورود به سیستم
                  </label>
                </div>

                {formData.canLogin && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رمز عبور <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        className={formErrors.password ? "border-red-500" : ""}
                        placeholder="حداقل 6 کاراکتر"
                      />
                      {formErrors.password && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.password}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Service Assignment */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="text-base font-medium text-gray-900 mb-3">
                خدمات
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className="flex items-center p-2 bg-white rounded-md border hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.serviceIds.includes(service.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData((prev) => ({
                            ...prev,
                            serviceIds: [...prev.serviceIds, service.id],
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            serviceIds: prev.serviceIds.filter(
                              (id) => id !== service.id
                            ),
                          }));
                        }
                      }}
                      className="mr-3 h-4 w-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {service.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {service.duration} دقیقه • {service.price} تومان
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {formErrors.services && (
                <p className="text-red-500 text-xs mt-2">
                  {formErrors.services}
                </p>
              )}
            </div>

            {/* Working Hours */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-medium text-gray-900">
                  ساعات کاری
                </h3>
                <Button
                  type="button"
                  onClick={addWorkingHour}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  افزودن ساعت کاری
                </Button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {formData.workingHours.map((wh, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 bg-white rounded-md border"
                  >
                    <select
                      value={wh.dayOfWeek}
                      onChange={(e) =>
                        updateWorkingHour(
                          index,
                          "dayOfWeek",
                          parseInt(e.target.value)
                        )
                      }
                      className="p-2 border rounded-md flex-1"
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>

                    <input
                      type="time"
                      value={wh.startTime}
                      onChange={(e) =>
                        updateWorkingHour(index, "startTime", e.target.value)
                      }
                      className="p-2 border rounded-md"
                    />

                    <span className="text-gray-500">تا</span>

                    <input
                      type="time"
                      value={wh.endTime}
                      onChange={(e) =>
                        updateWorkingHour(index, "endTime", e.target.value)
                      }
                      className="p-2 border rounded-md"
                    />

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={wh.isActive}
                        onChange={(e) =>
                          updateWorkingHour(index, "isActive", e.target.checked)
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">فعال</span>
                    </label>

                    <Button
                      type="button"
                      onClick={() => removeWorkingHour(index)}
                      variant="destructive"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {formData.workingHours.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Clock className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                  <p className="text-sm">هنوز ساعات کاری اضافه نشده است</p>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="sticky bottom-0 z-10 bg-white pt-3 border-t flex flex-col md:flex-row gap-2 md:gap-4 justify-end px-1 md:px-4 pb-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="w-full md:w-auto"
              >
                لغو
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {selectedStaff ? "بروزرسانی" : "ایجاد"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

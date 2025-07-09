import React, { useState, useEffect } from "react";
import { Staff, StaffWorkingHour } from "../types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import Modal from "./ui/modal";
import LoadingSpinner from "./LoadingSpinner";
import { Avatar } from "./ui/avatar";
import { api } from "../services/api";

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
  workingHours: StaffWorkingHour[];
  serviceIds: string[];
}

const DAYS_OF_WEEK = [
  { value: 0, label: "یکشنبه" },
  { value: 1, label: "دوشنبه" },
  { value: 2, label: "سه‌شنبه" },
  { value: 3, label: "چهارشنبه" },
  { value: 4, label: "پنج‌شنبه" },
  { value: 5, label: "جمعه" },
  { value: 6, label: "شنبه" },
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
  const [formData, setFormData] = useState<StaffFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
    bio: "",
    experience: "",
    workingHours: [],
    serviceIds: [],
  });

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
      workingHours: [],
      serviceIds: [],
    });
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
      workingHours: staffMember.workingHours || [],
      serviceIds: staffMember.services?.map((s) => s.serviceId) || [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = selectedStaff ? `/staff/${selectedStaff.id}` : "/staff";
      const method = selectedStaff ? "put" : "post";

      const response = await api[method](url, {
        ...formData,
        businessId: selectedStaff ? undefined : businessId,
      });

      if (response.data.success) {
        setIsModalOpen(false);
        fetchStaff();
      } else {
        alert(response.data.error || "خطا در ذخیره اطلاعات");
      }
    } catch (error: any) {
      console.error("Error saving staff:", error);
      alert(error.response?.data?.error || "خطا در ذخیره اطلاعات");
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (confirm("آیا از حذف این کارمند اطمینان دارید؟")) {
      try {
        const response = await api.delete(`/staff/${staffId}`);

        if (response.data.success) {
          fetchStaff();
        } else {
          alert(response.data.error || "خطا در حذف کارمند");
        }
      } catch (error: any) {
        console.error("Error deleting staff:", error);
        alert(error.response?.data?.error || "خطا در حذف کارمند");
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">مدیریت کارکنان</h2>
        <Button
          onClick={handleCreateStaff}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          افزودن کارمند جدید
        </Button>
      </div>

      {/* Staff List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((staffMember) => (
          <Card key={staffMember.id} className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-12 w-12">
                {staffMember.avatar ? (
                  <img
                    src={staffMember.avatar}
                    alt={`${staffMember.firstName} ${staffMember.lastName}`}
                  />
                ) : (
                  <div className="bg-gray-300 flex items-center justify-center h-full w-full text-gray-600">
                    {staffMember.firstName.charAt(0)}
                    {staffMember.lastName.charAt(0)}
                  </div>
                )}
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">
                  {staffMember.firstName} {staffMember.lastName}
                </h3>
                {staffMember.specialization && (
                  <p className="text-sm text-gray-600">
                    {staffMember.specialization}
                  </p>
                )}
              </div>
            </div>

            {staffMember.bio && (
              <p className="text-sm text-gray-700 mb-3">{staffMember.bio}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {staffMember.services?.map((service) => (
                <span
                  key={service.id}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {service.service.name}
                </span>
              ))}
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <div>تعداد رزروها: {staffMember._count?.bookings || 0}</div>
              <div>وضعیت: {staffMember.isActive ? "فعال" : "غیرفعال"}</div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => handleEditStaff(staffMember)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                ویرایش
              </Button>
              <Button
                onClick={() => handleDeleteStaff(staffMember.id)}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                حذف
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">هنوز کارمندی اضافه نشده است</p>
          <Button onClick={handleCreateStaff}>افزودن اولین کارمند</Button>
        </div>
      )}

      {/* Staff Form Modal */}
      {isModalOpen && (
        <Modal
          onClose={() => setIsModalOpen(false)}
          title={selectedStaff ? "ویرایش کارمند" : "افزودن کارمند جدید"}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام خانوادگی
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ایمیل
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شماره تلفن
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
            </div>

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
                درباره کارمند
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={3}
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
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
              />
            </div>

            {/* Service Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                خدمات
              </label>
              <div className="space-y-2">
                {services.map((service) => (
                  <label key={service.id} className="flex items-center">
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
                      className="mr-2"
                    />
                    {service.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Working Hours */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  ساعات کاری
                </label>
                <Button
                  type="button"
                  onClick={addWorkingHour}
                  variant="outline"
                  size="sm"
                >
                  افزودن ساعت کاری
                </Button>
              </div>

              <div className="space-y-3">
                {formData.workingHours.map((wh, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 border rounded-lg"
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
                      className="p-2 border rounded"
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
                      className="p-2 border rounded"
                    />

                    <span>تا</span>

                    <input
                      type="time"
                      value={wh.endTime}
                      onChange={(e) =>
                        updateWorkingHour(index, "endTime", e.target.value)
                      }
                      className="p-2 border rounded"
                    />

                    <Button
                      type="button"
                      onClick={() => removeWorkingHour(index)}
                      variant="destructive"
                      size="sm"
                    >
                      حذف
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                لغو
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {selectedStaff ? "بروزرسانی" : "ایجاد"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

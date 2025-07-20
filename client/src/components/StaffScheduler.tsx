import React, { useState, useEffect } from "react";
import { Staff, StaffWorkingHour, StaffTimeOff } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import Modal from "./ui/modal";
import { api } from "../services/api";
import {
  Calendar,
  Clock,
  User,
  Plus,
  X,
  AlertCircle,
  Badge,
} from "lucide-react";

interface StaffSchedulerProps {
  businessId: string;
}

interface TimeOffFormData {
  staffId: string;
  startDate: string;
  endDate: string;
  reason: string;
  type:
    | "VACATION"
    | "SICK_LEAVE"
    | "PERSONAL"
    | "HOLIDAY"
    | "TRAINING"
    | "OTHER";
}

const TIME_OFF_TYPES = [
  { value: "VACATION", label: "مرخصی استحقاقی" },
  { value: "SICK_LEAVE", label: "مرخصی استعلاجی" },
  { value: "PERSONAL", label: "مرخصی شخصی" },
  { value: "HOLIDAY", label: "تعطیلات" },
  { value: "TRAINING", label: "آموزش" },
  { value: "OTHER", label: "سایر" },
];

export const StaffScheduler: React.FC<StaffSchedulerProps> = ({
  businessId,
}) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [timeOffRequests, setTimeOffRequests] = useState<StaffTimeOff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [timeOffForm, setTimeOffForm] = useState<TimeOffFormData>({
    staffId: "",
    startDate: "",
    endDate: "",
    reason: "",
    type: "VACATION",
  });

  useEffect(() => {
    if (businessId) {
      fetchStaff();
      fetchTimeOffRequests();
    }
  }, [businessId]);

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

  const fetchTimeOffRequests = async () => {
    try {
      // This would be a new API endpoint
      const response = await api.get(
        `/staff/time-off?businessId=${businessId}`
      );
      if (response.data.success) {
        setTimeOffRequests(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching time off requests:", error);
    }
  };

  const handleTimeOffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post(
        `/staff/${timeOffForm.staffId}/time-off`,
        {
          startDate: timeOffForm.startDate,
          endDate: timeOffForm.endDate,
          reason: timeOffForm.reason,
          type: timeOffForm.type,
        }
      );

      if (response.data.success) {
        setIsTimeOffModalOpen(false);
        setTimeOffForm({
          staffId: "",
          startDate: "",
          endDate: "",
          reason: "",
          type: "VACATION",
        });
        fetchTimeOffRequests();
      } else {
        alert(response.data.error || "خطا در ثبت درخواست مرخصی");
      }
    } catch (error: any) {
      console.error("Error submitting time off:", error);
      alert(error.response?.data?.error || "خطا در ثبت درخواست مرخصی");
    }
  };

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getDayName = (dayIndex: number) => {
    const days = [
      "یکشنبه",
      "دوشنبه",
      "سه‌شنبه",
      "چهارشنبه",
      "پنج‌شنبه",
      "جمعه",
      "شنبه",
    ];
    return days[dayIndex];
  };

  const getStaffWorkingHours = (staff: Staff, dayOfWeek: number) => {
    const workingHours = staff.workingHours || staff.staff_working_hours || [];
    return workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);
  };

  const hasTimeOff = (staffId: string, date: Date) => {
    return timeOffRequests.some((timeOff) => {
      const startDate = new Date(timeOff.startDate);
      const endDate = new Date(timeOff.endDate);
      return (
        timeOff.staffId === staffId &&
        timeOff.isActive &&
        date >= startDate &&
        date <= endDate
      );
    });
  };

  const getTimeOffForStaff = (staffId: string, date: Date) => {
    return timeOffRequests.find((timeOff) => {
      const startDate = new Date(timeOff.startDate);
      const endDate = new Date(timeOff.endDate);
      return (
        timeOff.staffId === staffId &&
        timeOff.isActive &&
        date >= startDate &&
        date <= endDate
      );
    });
  };

  const weekDays = getWeekDays(selectedWeek);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            برنامه‌ریزی کارکنان
          </h2>
          <p className="text-gray-600 mt-1">
            مدیریت برنامه کاری و مرخصی‌های کارکنان
          </p>
        </div>
        <Button
          onClick={() => setIsTimeOffModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          درخواست مرخصی
        </Button>
      </div>

      {/* Week Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => {
              const newWeek = new Date(selectedWeek);
              newWeek.setDate(newWeek.getDate() - 7);
              setSelectedWeek(newWeek);
            }}
          >
            هفته قبل
          </Button>

          <div className="text-lg font-semibold">
            {selectedWeek.toLocaleDateString("fa-IR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => {
              const newWeek = new Date(selectedWeek);
              newWeek.setDate(newWeek.getDate() + 7);
              setSelectedWeek(newWeek);
            }}
          >
            هفته بعد
          </Button>
        </div>
      </Card>

      {/* Schedule Grid */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-3 text-right font-semibold bg-gray-50">
                  کارمند
                </th>
                {weekDays.map((day, index) => (
                  <th
                    key={index}
                    className="border p-3 text-center font-semibold bg-gray-50 min-w-[120px]"
                  >
                    <div>{getDayName(day.getDay())}</div>
                    <div className="text-sm text-gray-500">
                      {day.toLocaleDateString("fa-IR", {
                        month: "numeric",
                        day: "numeric",
                      })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((staffMember) => (
                <tr key={staffMember.id}>
                  <td className="border p-3 font-medium bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                        {staffMember.firstName.charAt(0)}
                        {staffMember.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {staffMember.firstName} {staffMember.lastName}
                        </div>
                        {staffMember.specialization && (
                          <div className="text-xs text-gray-500">
                            {staffMember.specialization}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {weekDays.map((day, dayIndex) => {
                    const workingHours = getStaffWorkingHours(
                      staffMember,
                      day.getDay()
                    );
                    const hasTimeOffToday = hasTimeOff(staffMember.id, day);
                    const timeOff = getTimeOffForStaff(staffMember.id, day);

                    return (
                      <td
                        key={dayIndex}
                        className="border p-2 text-center align-top"
                      >
                        {hasTimeOffToday ? (
                          <div className="bg-red-100 text-red-800 p-2 rounded text-xs">
                            <div className="font-semibold">مرخصی</div>
                            <div>{timeOff?.reason}</div>
                          </div>
                        ) : workingHours ? (
                          <div className="bg-green-100 text-green-800 p-2 rounded text-xs">
                            <div className="font-semibold">
                              {workingHours.startTime} - {workingHours.endTime}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs p-2">تعطیل</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Time Off Requests */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">درخواست‌های مرخصی اخیر</h3>
        <div className="space-y-3">
          {timeOffRequests.slice(0, 5).map((timeOff) => {
            const staffMember = staff.find((s) => s.id === timeOff.staffId);
            return (
              <div
                key={timeOff.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm">
                    {staffMember?.firstName.charAt(0)}
                    {staffMember?.lastName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">
                      {staffMember?.firstName} {staffMember?.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(timeOff.startDate).toLocaleDateString("fa-IR")}{" "}
                      - {new Date(timeOff.endDate).toLocaleDateString("fa-IR")}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {
                      TIME_OFF_TYPES.find((t) => t.value === timeOff.type)
                        ?.label
                    }
                  </div>
                  <div className="text-xs text-gray-500">{timeOff.reason}</div>
                </div>
              </div>
            );
          })}
          {timeOffRequests.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              هیچ درخواست مرخصی موجود نیست
            </p>
          )}
        </div>
      </Card>

      {/* Time Off Request Modal */}
      {isTimeOffModalOpen && (
        <Modal onClose={() => setIsTimeOffModalOpen(false)} size="lg">
          <div className="sticky top-0 z-10 bg-white pb-2 mb-4 border-b">
            <h2 className="text-xl font-bold text-gray-900 text-center py-3">
              درخواست مرخصی جدید
            </h2>
          </div>

          <form onSubmit={handleTimeOffSubmit} className="space-y-4px-4">
            {/* Staff Selection */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="text-base font-medium text-gray-900 mb-3">
                {" "}
                انتخاب کارمند
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  کارمند <span className="text-red-500">*</span>
                </label>
                <select
                  value={timeOffForm.staffId}
                  onChange={(e) =>
                    setTimeOffForm((prev) => ({
                      ...prev,
                      staffId: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2ocus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="خاب کارمند">انتخاب کارمند</option>
                  {staff.map((staffMember) => (
                    <option key={staffMember.id} value={staffMember.id}>
                      {staffMember.firstName} {staffMember.lastName}
                      {staffMember.specialization &&
                        ` - ${staffMember.specialization}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Range */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="text-base font-medium text-gray-900 mb-3">
                {" "}
                بازه زمانی
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاریخ شروع <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={timeOffForm.startDate}
                    onChange={(e) =>
                      setTimeOffForm((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2ocus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاریخ پایان <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={timeOffForm.endDate}
                    onChange={(e) =>
                      setTimeOffForm((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2ocus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Time Off Details */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="text-base font-medium text-gray-900 mb-3">
                {" "}
                جزئیات مرخصی
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع مرخصی <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={timeOffForm.type}
                    onChange={(e) =>
                      setTimeOffForm((prev) => ({
                        ...prev,
                        type: e.target.value as any,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2ocus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    {TIME_OFF_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    دلیل مرخصی
                  </label>
                  <textarea
                    value={timeOffForm.reason}
                    onChange={(e) =>
                      setTimeOffForm((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2ocus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    rows={3}
                    placeholder="دلیل درخواست مرخصی را وارد کنید..."
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-white py-4 px-4 border-t border-gray-100 rounded-b-lg flex flex-row-reverse gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTimeOffModalOpen(false)}
                className="px-6 py-2 rounded-lg font-medium"
              >
                لغو
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                ثبت درخواست
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

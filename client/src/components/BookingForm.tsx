import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardApi, api } from "@/services/api";
import { useBusiness } from "@/contexts/BusinessContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PersianCalendar from "@/components/ui/PersianCalendar";
import { Avatar } from "@/components/ui/avatar";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";

interface BookingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isOpen?: boolean;
}

interface FormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceId: string;
  staffId: string | undefined;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked?: boolean;
  price: number;
  staffId?: string;
  staffName?: string;
  staffSpecialization?: string;
}

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  bio?: string;
  avatar?: string;
  customPrice?: number;
}

const BookingForm: React.FC<BookingFormProps> = ({
  onSuccess,
  onCancel,
  isOpen = true,
}) => {
  const { businessId, business } = useBusiness();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    serviceId: "",
    staffId: undefined,
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [availableStaff, setAvailableStaff] = useState<StaffMember[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showCalendar, setShowCalendar] = useState(false);

  // Fetch services
  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ["business-services", businessId],
    queryFn: () => dashboardApi.getServices(businessId!),
    enabled: !!businessId,
  });

  // Fetch staff for selected service
  const { data: staffData, isLoading: loadingStaff } = useQuery({
    queryKey: ["service-staff", formData.serviceId, formData.date],
    queryFn: async () => {
      if (!formData.serviceId) return [];

      const dateParam = formData.date ? `?date=${formData.date}` : "";
      const response = await api.get(
        `/availability/staff-options/${formData.serviceId}${dateParam}`
      );

      return response.data.success ? response.data.data : [];
    },
    enabled: !!formData.serviceId,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (bookingData: any) => dashboardApi.createBooking(bookingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-bookings"] });
      toast.success("رزرو با موفقیت ایجاد شد");
      resetForm();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در ایجاد رزرو");
    },
  });

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      serviceId: "",
      staffId: undefined,
      date: "",
      startTime: "",
      endTime: "",
      notes: "",
    });
    setSelectedService(null);
    setSelectedStaff(null);
    setSelectedDate(null);
    setSelectedTimeSlot("");
    setAvailableSlots([]);
    setAvailableStaff([]);
    setFormErrors({});
    setShowCalendar(false);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      errors.customerName = "نام مشتری الزامی است";
    } else if (formData.customerName.trim().length < 2) {
      errors.customerName = "نام مشتری باید حداقل ۲ کاراکتر باشد";
    }

    if (!formData.customerPhone.trim()) {
      errors.customerPhone = "شماره تلفن الزامی است";
    } else if (!/^(\+98|0)?9\d{9}$/.test(formData.customerPhone)) {
      errors.customerPhone = "شماره تلفن نامعتبر است";
    }

    if (
      formData.customerEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)
    ) {
      errors.customerEmail = "ایمیل نامعتبر است";
    }

    if (!formData.serviceId) {
      errors.serviceId = "انتخاب خدمت الزامی است";
    }

    // Validate staff selection when staff are available
    if (availableStaff.length > 0 && !formData.staffId) {
      errors.staffId = "انتخاب کارمند الزامی است";
    }

    if (!selectedDate) {
      errors.date = "انتخاب تاریخ الزامی است";
    }

    if (!selectedTimeSlot) {
      errors.timeSlot = "انتخاب زمان الزامی است";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const checkAvailability = async (
    serviceId: string,
    date: Date,
    staffId?: string
  ) => {
    if (!serviceId || !date) return;

    setIsCheckingAvailability(true);
    try {
      // Use local date formatting to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      console.log(
        "Checking staff-aware availability for date:",
        dateString,
        "serviceId:",
        serviceId,
        "staffId:",
        staffId
      );

      // Use new staff-aware availability endpoint
      const staffParam = staffId ? `?staffId=${staffId}` : "";
      const response = await api.get(
        `/availability/staff/${businessId}/${serviceId}/${dateString}${staffParam}`
      );

      console.log("Staff-aware availability response:", response.data);

      if (response.data.success && response.data.data) {
        const slots = response.data.data.slots || [];
        const totalAvailable = response.data.data.totalAvailable || 0;
        const totalBooked = response.data.data.totalBooked || 0;

        console.log(
          `Found ${slots.length} total slots, ${totalAvailable} available, ${totalBooked} booked`
        );

        // Transform slots to match the expected format
        const formattedSlots = slots.map((slot: any) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable,
          isBooked: slot.isBooked || false,
          price: slot.price || 0,
          staffId: slot.staffId,
          staffName: slot.staffName,
          staffSpecialization: slot.staffSpecialization,
          workingHoursSource: slot.workingHoursSource,
        }));

        console.log("Formatted available slots:", formattedSlots);
        setAvailableSlots(formattedSlots);
      } else {
        console.warn("No availability data returned");
        console.log("Response data:", response.data);
        setAvailableSlots([]);
      }
    } catch (error: any) {
      console.error("Error checking availability:", error);
      console.error("Error details:", error.response?.data);
      toast.error("خطا در بررسی دسترسی زمان‌ها");
      setAvailableSlots([]);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  useEffect(() => {
    if (staffData) {
      setAvailableStaff(staffData);
    }
  }, [staffData]);

  useEffect(() => {
    if (formData.serviceId && selectedDate) {
      checkAvailability(formData.serviceId, selectedDate, formData.staffId);
    } else {
      setAvailableSlots([]);
    }
  }, [formData.serviceId, selectedDate, formData.staffId]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "serviceId") {
      const service = services?.data?.data?.find((s: any) => s.id === value);
      setSelectedService(service);
      setSelectedStaff(null);
      setSelectedTimeSlot("");
      setFormData((prev) => ({
        ...prev,
        startTime: "",
        endTime: "",
        staffId: undefined,
      }));
    }

    if (field === "staffId") {
      const staff = availableStaff.find((s) => s.id === value);
      setSelectedStaff(staff || null);
      setSelectedTimeSlot("");
      setFormData((prev) => ({
        ...prev,
        startTime: "",
        endTime: "",
        staffId: value || undefined,
      }));
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot("");
    // Use local date formatting to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    console.log("Selected date:", dateString);

    setFormData((prev) => ({
      ...prev,
      date: dateString,
      startTime: "",
      endTime: "",
    }));
    setShowCalendar(false);

    if (formErrors.date) {
      setFormErrors((prev) => ({ ...prev, date: "" }));
    }
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (!slot.isAvailable) {
      toast.error("این زمان قبلاً رزرو شده است. لطفاً زمان دیگری انتخاب کنید.");
      return;
    }

    setSelectedTimeSlot(slot.startTime);
    setFormData((prev) => ({
      ...prev,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));

    setFormErrors((prev) => ({
      ...prev,
      timeSlot: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("لطفاً خطاهای فرم را بررسی کنید");
      return;
    }

    const bookingData = {
      businessId: businessId!,
      serviceId: formData.serviceId,
      ...(formData.staffId && { staffId: formData.staffId }),
      customerName: formData.customerName.trim(),
      customerPhone: formData.customerPhone.trim(),
      customerEmail: formData.customerEmail.trim() || undefined,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      notes: formData.notes.trim() || undefined,
    };

    try {
      await createBookingMutation.mutateAsync(bookingData);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "خطا در ایجاد رزرو";
      const errorDetails = error?.response?.data?.details;

      // Check if this is a conflict error and provide better guidance
      if (
        errorMessage.includes("conflicts") ||
        errorMessage.includes("booked") ||
        errorMessage.includes("capacity")
      ) {
        toast.error(
          "زمان انتخاب شده در دسترس نیست. لطفاً زمان دیگری انتخاب کنید یا دسترسی زمان‌ها را بروزرسانی کنید.",
          { duration: 5000 }
        );

        // Clear the selected time slot to force user to select a new one
        setSelectedTimeSlot("");
        setFormData((prev) => ({
          ...prev,
          startTime: "",
          endTime: "",
        }));
      } else {
        toast.error(errorMessage);
      }
    }
  };

  // Calculate min and max dates for calendar
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30); // 30 days in advance

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  ایجاد رزرو جدید
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  رزرو دستی برای مشتری
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Information */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                اطلاعات مشتری
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    نام
                  </label>
                  <Input
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customerName: e.target.value,
                      }))
                    }
                    placeholder="مثال: علی احمدی"
                    className={`h-11 ${formErrors.customerName ? "border-red-500" : ""}`}
                  />
                  {formErrors.customerName && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    نام خانوادگی
                  </label>
                  <Input
                    value={formData.customerPhone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customerPhone: e.target.value,
                      }))
                    }
                    placeholder="09123456789"
                    className={`h-11 ${formErrors.customerPhone ? "border-red-500" : ""}`}
                  />
                  {formErrors.customerPhone && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.customerPhone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ایمیل
                  </label>
                  <Input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customerEmail: e.target.value,
                      }))
                    }
                    className={`h-11 ${formErrors.customerEmail ? "border-red-500" : ""}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    شماره تلفن
                  </label>
                  <Input
                    value={formData.customerPhone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customerPhone: e.target.value,
                      }))
                    }
                    className={`h-11 ${formErrors.customerPhone ? "border-red-500" : ""}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Selection */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6"
                  />
                </svg>
                انتخاب خدمت
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingServices ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    خدمت مورد نظر *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {services?.data?.data?.map((service: any) => (
                      <div
                        key={service.id}
                        onClick={() =>
                          handleInputChange("serviceId", service.id)
                        }
                        className={`
                          p-4 border-2 rounded-lg cursor-pointer transition-all
                          ${
                            formData.serviceId === service.id
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                          }
                        `}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {service.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              مدت زمان: {service.duration || 60} دقیقه
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              {service.price?.toLocaleString()} تومان
                            </p>
                            {formData.serviceId === service.id && (
                              <Badge className="mt-1 bg-blue-100 text-blue-800">
                                انتخاب شده
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {formErrors.serviceId && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.serviceId}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staff Selection */}
          {formData.serviceId && availableStaff.length > 0 && (
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-purple-600"
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
                  انتخاب کارمند
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStaff ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      کارمند مورد نظر *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableStaff.map((staff: StaffMember) => (
                        <div
                          key={staff.id}
                          onClick={() => handleInputChange("staffId", staff.id)}
                          className={`
                            p-4 border-2 rounded-lg cursor-pointer transition-all
                            ${
                              formData.staffId === staff.id
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              {staff.avatar ? (
                                <img
                                  src={staff.avatar}
                                  alt={`${staff.firstName} ${staff.lastName}`}
                                />
                              ) : (
                                <div className="bg-gray-300 flex items-center justify-center h-full w-full text-gray-600">
                                  {staff.firstName.charAt(0)}
                                  {staff.lastName.charAt(0)}
                                </div>
                              )}
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {staff.firstName} {staff.lastName}
                              </h4>
                              {staff.specialization && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {staff.specialization}
                                </p>
                              )}
                              {staff.customPrice && (
                                <p className="text-sm text-green-600 font-medium">
                                  {staff.customPrice.toLocaleString()} تومان
                                </p>
                              )}
                            </div>
                            {formData.staffId === staff.id && (
                              <Badge className="bg-purple-100 text-purple-800">
                                انتخاب شده
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {formErrors.staffId && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.staffId}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Date Selection with Persian Calendar */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-purple-600"
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
                  انتخاب تاریخ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    تاریخ رزرو *
                  </label>

                  {selectedDate && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        تاریخ انتخاب شده:{" "}
                        {selectedDate.toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                  )}

                  <PersianCalendar
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    minDate={today}
                    maxDate={maxDate}
                    className="w-full"
                  />

                  {formErrors.date && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.date}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Time Slots */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  انتخاب زمان
                </CardTitle>
              </CardHeader>
              <CardContent>
                {formData.serviceId && selectedDate ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      زمان‌های در دسترس *
                    </label>

                    {isCheckingAvailability ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner />
                        <span className="mr-2 text-gray-500">
                          در حال بررسی دسترسی...
                        </span>
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                        {availableSlots.map((slot, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleTimeSlotSelect(slot)}
                            disabled={!slot.isAvailable}
                            className={`
                              p-3 text-sm rounded-lg border transition-all relative
                              ${
                                !slot.isAvailable
                                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                  : selectedTimeSlot === slot.startTime
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 shadow-lg"
                                    : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                              }
                            `}
                          >
                            <div className="font-medium">
                              {slot.startTime} - {slot.endTime}
                            </div>
                            {slot.staffName && (
                              <div className="text-xs opacity-75 mt-1">
                                {slot.staffName}
                              </div>
                            )}
                            {!slot.isAvailable && (
                              <div className="text-xs mt-1 text-red-500 flex items-center gap-1">
                                <div className="w-1 h-1 bg-red-500 rounded-full" />
                                رزرو شده
                              </div>
                            )}
                            {selectedTimeSlot === slot.startTime && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        برای این تاریخ زمان‌ی در دسترس نیست
                      </div>
                    )}

                    {formErrors.timeSlot && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.timeSlot}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    لطفاً ابتدا خدمت و تاریخ را انتخاب کنید
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                یادداشت (اختیاری)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="یادداشت یا توضیحات اضافی برای این رزرو..."
                rows={3}
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.notes.length}/500 کاراکتر
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {selectedService && selectedDate && selectedTimeSlot && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-800 dark:text-green-200">
                  خلاصه رزرو
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      خدمت:
                    </span>
                    <p className="font-medium">{selectedService.name}</p>
                  </div>
                  {selectedStaff && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        کارمند:
                      </span>
                      <p className="font-medium">
                        {selectedStaff.firstName} {selectedStaff.lastName}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      تاریخ:
                    </span>
                    <p className="font-medium">
                      {selectedDate.toLocaleDateString("fa-IR")}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      زمان:
                    </span>
                    <p className="font-medium">
                      {formData.startTime} تا {formData.endTime}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      قیمت:
                    </span>
                    <p className="font-medium text-green-600">
                      {selectedService.price?.toLocaleString()} تومان
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              disabled={createBookingMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-11"
            >
              {createBookingMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  در حال ایجاد رزرو...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  ایجاد رزرو
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={createBookingMutation.isPending}
              className="px-6 h-11"
            >
              انصراف
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;

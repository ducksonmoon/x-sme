import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "@/services/api";
import { useBusiness } from "@/contexts/BusinessContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PersianCalendar from "@/components/ui/PersianCalendar";
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
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showCalendar, setShowCalendar] = useState(false);

  // Fetch services
  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ["business-services", businessId],
    queryFn: () => dashboardApi.getServices(businessId!),
    enabled: !!businessId,
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
      date: "",
      startTime: "",
      endTime: "",
      notes: "",
    });
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTimeSlot("");
    setAvailableSlots([]);
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

    if (!selectedDate) {
      errors.date = "انتخاب تاریخ الزامی است";
    }

    if (!selectedTimeSlot) {
      errors.timeSlot = "انتخاب زمان الزامی است";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateTimeSlots = (serviceId: string) => {
    const service = services?.data?.data?.find((s: any) => s.id === serviceId);
    if (!service) return [];

    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 18; // 6 PM
    const slotDuration = 30; // 30 minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const startTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const endDateTime = new Date(`2000-01-01T${startTime}:00`);
        endDateTime.setMinutes(
          endDateTime.getMinutes() + (service.duration || 60)
        );

        if (endDateTime.getHours() <= endHour) {
          const endTime = `${endDateTime.getHours().toString().padStart(2, "0")}:${endDateTime.getMinutes().toString().padStart(2, "0")}`;

          slots.push({
            startTime,
            endTime,
            isAvailable: true,
            price: service.price,
          });
        }
      }
    }

    return slots;
  };

  const checkAvailability = async (serviceId: string, date: Date) => {
    if (!serviceId || !date) return;

    setIsCheckingAvailability(true);
    try {
      // Use local date formatting to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      console.log(
        "Checking availability for date:",
        dateString,
        "serviceId:",
        serviceId
      );

      const allSlots = generateTimeSlots(serviceId);

      const existingBookings = await dashboardApi.getBookings(businessId!, {
        date: dateString,
        serviceId: serviceId,
      });

      console.log("Existing bookings response:", existingBookings?.data);

      const bookingsData =
        existingBookings?.data?.bookings || existingBookings?.data || [];
      console.log("Processed bookings data:", bookingsData);

      const availableSlots = allSlots.map((slot) => {
        const isBooked = bookingsData.some((booking: any) => {
          if (booking.status === "CANCELLED") return false;

          const bookingStart = booking.startTime;
          const bookingEnd = booking.endTime;

          const conflict =
            (slot.startTime >= bookingStart && slot.startTime < bookingEnd) ||
            (slot.endTime > bookingStart && slot.endTime <= bookingEnd) ||
            (slot.startTime <= bookingStart && slot.endTime >= bookingEnd);

          if (conflict) {
            console.log(
              `Slot ${slot.startTime}-${slot.endTime} conflicts with booking ${bookingStart}-${bookingEnd}`
            );
          }

          return conflict;
        });

        return {
          ...slot,
          isAvailable: !isBooked,
          isBooked: isBooked,
        };
      });

      console.log("Available slots:", availableSlots);
      setAvailableSlots(availableSlots);
    } catch (error) {
      console.error("Error checking availability:", error);
      toast.error("خطا در بررسی دسترسی زمان‌ها");
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  useEffect(() => {
    if (formData.serviceId && selectedDate) {
      checkAvailability(formData.serviceId, selectedDate);
    } else {
      setAvailableSlots([]);
    }
  }, [formData.serviceId, selectedDate]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "serviceId") {
      const service = services?.data?.data?.find((s: any) => s.id === value);
      setSelectedService(service);
      setSelectedTimeSlot("");
      setFormData((prev) => ({ ...prev, startTime: "", endTime: "" }));
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
      customerName: prev.customerName,
      customerPhone: prev.customerPhone,
      customerEmail: prev.customerEmail,
      serviceId: prev.serviceId,
      date: dateString,
      startTime: "",
      endTime: "",
      notes: prev.notes,
    }));
    setShowCalendar(false);

    if (formErrors.date) {
      setFormErrors((prev) => ({ ...prev, date: "" }));
    }
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (!slot.isAvailable) {
      toast.error("این زمان قبلاً رزرو شده است");
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
      customerName: formData.customerName.trim(),
      customerPhone: formData.customerPhone.trim(),
      customerEmail: formData.customerEmail.trim() || undefined,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      notes: formData.notes.trim() || undefined,
    };

    createBookingMutation.mutate(bookingData);
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
                    نام و نام خانوادگی *
                  </label>
                  <Input
                    value={formData.customerName}
                    onChange={(e) =>
                      handleInputChange("customerName", e.target.value)
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
                    شماره تلفن *
                  </label>
                  <Input
                    value={formData.customerPhone}
                    onChange={(e) =>
                      handleInputChange("customerPhone", e.target.value)
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ایمیل (اختیاری)
                </label>
                <Input
                  value={formData.customerEmail}
                  onChange={(e) =>
                    handleInputChange("customerEmail", e.target.value)
                  }
                  placeholder="example@email.com"
                  className={`h-11 ${formErrors.customerEmail ? "border-red-500" : ""}`}
                />
                {formErrors.customerEmail && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.customerEmail}
                  </p>
                )}
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
                            {!slot.isAvailable && (
                              <div className="text-xs mt-1 text-red-500">
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
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

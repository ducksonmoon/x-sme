import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Service, CustomerInfo } from "../types";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants";
import toast from "react-hot-toast";
import { bookingApi, api } from "@/services/api";

interface UseBookingProps {
  businessId: string;
  lastRefresh?: number;
}

export const useBooking = ({ businessId, lastRefresh }: UseBookingProps) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");

  // Get business info
  const { data: business, isLoading: businessLoading } = useQuery({
    queryKey: ["business", businessId],
    queryFn: () => bookingApi.getBusiness(businessId),
    enabled: !!businessId,
  });

  // Get services for the business
  const {
    data: services,
    isLoading: servicesLoading,
    error: servicesError,
  } = useQuery({
    queryKey: ["services", businessId],
    queryFn: async () => {
      return bookingApi.getServices(businessId);
    },
    enabled: !!businessId,
  });

  // Get staff for the selected service
  const { data: serviceStaff, isLoading: staffLoading } = useQuery({
    queryKey: ["staff", businessId, selectedService?.id, selectedDate],
    queryFn: async () => {
      if (!selectedService?.id) return [];

      // Use new staff options endpoint that filters by service
      const dateParam = selectedDate ? `?date=${selectedDate}` : "";
      const response = await api.get(
        `/availability/staff-options/${selectedService.id}${dateParam}`
      );

      return response.data.success ? response.data.data : [];
    },
    enabled: !!businessId && !!selectedService?.id,
  });

  // Get available time slots using staff-aware endpoint
  const { data: timeSlots, isLoading: slotsLoading } = useQuery({
    queryKey: [
      "timeSlots",
      businessId,
      selectedService?.id,
      selectedStaff?.id,
      selectedDate,
      lastRefresh,
    ],
    queryFn: async () => {
      // Use new staff-aware availability endpoint
      const staffParam = selectedStaff ? `?staffId=${selectedStaff.id}` : "";
      const response = await api.get(
        `/availability/staff/${businessId}/${selectedService!.id}/${selectedDate}${staffParam}`
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to fetch availability");
      }

      return response.data.data;
    },
    enabled: !!businessId && !!selectedService?.id && !!selectedDate,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (bookingData: {
      businessId: string;
      serviceId: string;
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      notes?: string;
      date: string;
      startTime: string;
      endTime: string;
    }) => bookingApi.createBooking(bookingData),
    onSuccess: (data) => {
      toast.success(SUCCESS_MESSAGES.BOOKING_CREATED);
      return data;
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || ERROR_MESSAGES.BOOKING_ERROR;
      toast.error(message);
      throw error;
    },
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: (paymentData: {
      bookingId: string;
      amount: number;
      gateway: string;
    }) => bookingApi.processPayment(paymentData),
    onSuccess: (data) => {
      toast.success(SUCCESS_MESSAGES.PAYMENT_SUCCESS);
      return data;
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || ERROR_MESSAGES.PAYMENT_ERROR;
      toast.error(message);
      throw error;
    },
  });

  const createBooking = async (
    customerInfo: CustomerInfo & { startTime?: string; endTime?: string }
  ) => {
    if (!selectedService || !selectedDate || !selectedTimeSlot) {
      throw new Error("Please select service, date, and time");
    }

    // Use provided times or fallback to selected time slot
    const bookingStartTime = customerInfo.startTime || selectedTimeSlot;
    const bookingEndTime = customerInfo.endTime || selectedTimeSlot; // This will be overridden by the component

    // Format the booking data to match backend API expectations
    const bookingData = {
      businessId,
      serviceId: selectedService.id,
      ...(selectedStaff && { staffId: selectedStaff.id }),
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      ...(customerInfo.email && { customerEmail: customerInfo.email }),
      ...(customerInfo.notes && { notes: customerInfo.notes }),
      date: selectedDate, // YYYY-MM-DD format
      startTime: bookingStartTime, // HH:MM format
      endTime: bookingEndTime, // HH:MM format
    };

    return createBookingMutation.mutateAsync(bookingData);
  };

  const processPayment = async (
    bookingId: string,
    amount: number,
    gateway: string
  ) => {
    return processPaymentMutation.mutateAsync({
      bookingId,
      amount,
      gateway: gateway.toUpperCase(), // Convert to uppercase for backend validation
    });
  };

  const checkPaymentStatus = async (paymentId: string) => {
    const response = await bookingApi.getPaymentStatus(paymentId);
    return response.data;
  };

  return {
    // Data
    business: business?.data,
    services: services?.data || [],
    serviceStaff: serviceStaff || [],
    timeSlots: timeSlots?.slots || [],
    selectedService,
    selectedStaff,
    selectedDate,
    selectedTimeSlot,

    // Loading states
    businessLoading,
    servicesLoading,
    staffLoading,
    slotsLoading,
    isCreatingBooking: createBookingMutation.isPending,
    isProcessingPayment: processPaymentMutation.isPending,

    // Actions
    setSelectedService,
    setSelectedStaff,
    setSelectedDate,
    setSelectedTimeSlot,
    createBooking,
    processPayment,
    checkPaymentStatus,

    // Errors
    bookingError: createBookingMutation.error,
    paymentError: processPaymentMutation.error,
    servicesError,
  };
};

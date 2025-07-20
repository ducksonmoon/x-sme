// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "business_owner" | "staff";
  businessId?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

// Business types
export interface Business {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  workingHours: WorkingHours[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHours {
  day: number; // 0-6 (Sunday-Saturday)
  open: string; // HH:mm format
  close: string; // HH:mm format
  isOpen: boolean;
}

// Service types
export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number;
  currency: string;
  category?: string;
  businessId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Staff types
export interface Staff {
  id: string;
  businessId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  specialization?: string;
  experience?: string;
  isActive: boolean;
  canLogin: boolean;
  createdAt: string;
  updatedAt: string;
  services?: StaffService[];
  staff_services?: StaffService[];
  workingHours?: StaffWorkingHour[];
  staff_working_hours?: StaffWorkingHour[];
  breaks?: StaffBreak[];
  staff_breaks?: StaffBreak[];
  timeOff?: StaffTimeOff[];
  staff_time_off?: StaffTimeOff[];
  _count?: {
    bookings: number;
  };
}

export interface StaffService {
  id: string;
  staffId: string;
  serviceId: string;
  customPrice?: number;
  isActive: boolean;
  service?: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
  services?: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
}

export interface StaffWorkingHour {
  id: string;
  staffId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isActive: boolean;
}

export interface StaffBreak {
  id: string;
  staffId: string;
  title: string;
  startTime: string;
  endTime: string;
  dayOfWeek?: number;
  isActive: boolean;
}

export interface StaffTimeOff {
  id: string;
  staffId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  type:
    | "VACATION"
    | "SICK_LEAVE"
    | "PERSONAL"
    | "HOLIDAY"
    | "TRAINING"
    | "OTHER";
  isActive: boolean;
}

// Booking types
export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  serviceId: string;
  businessId: string;
  staffId?: string; // Add staff assignment
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  service?: Service;
  business?: Business;
  staff?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Payment types
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  gateway: "pasargad" | "saman" | "zarinpal";
  status: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  gatewayResponse?: any;
  createdAt: string;
  updatedAt: string;
}

// Time slot types
export interface TimeSlot {
  id: string;
  businessId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  date: string;
  isAvailable: boolean;
  bookingId?: string;
}

// Analytics types
export interface Analytics {
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  bookingsByStatus: Record<string, number>;
  revenueByPeriod: RevenueData[];
  topServices: ServiceAnalytics[];
  bookingsByDay: DayData[];
}

export interface RevenueData {
  period: string;
  revenue: number;
  bookings: number;
}

export interface ServiceAnalytics {
  serviceId: string;
  serviceName: string;
  bookings: number;
  revenue: number;
}

export interface DayData {
  day: string;
  bookings: number;
  revenue: number;
}

// Widget configuration
export interface WidgetConfig {
  businessId: string;
  theme?: "light" | "dark" | "auto";
  language?: "fa";
  primaryColor?: string;
  secondaryColor?: string;
  borderRadius?: number;
  showLogo?: boolean;
  showBusinessInfo?: boolean;
  allowNotes?: boolean;
  requireEmail?: boolean;
  maxAdvanceBooking?: number; // days
  minAdvanceBooking?: number; // hours
  customLogo?: string;
  embedMode?: boolean;
}

// Form types
export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface BookingFormData {
  serviceId: string;
  staffId?: string; // Add staff selection
  date: string;
  timeSlot: string;
  customerInfo: CustomerInfo;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

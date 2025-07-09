import axios from "axios";

// Create axios instance
export const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || "http://localhost:3001/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API endpoints for the booking widget
export const bookingApi = {
  // Get business info
  getBusiness: async (businessId: string) => {
    return api.get(`/businesses/${businessId}`);
  },

  // Get services for a business
  getServices: async (businessId: string) => {
    return api.get(`/services`, { params: { businessId } });
  },

  // Get available time slots
  getAvailableSlots: async (
    businessId: string,
    serviceId: string,
    date: string
  ) => {
    return api.get(`/availability/${businessId}`, {
      params: { serviceId, date },
    });
  },

  // Create booking
  createBooking: async (bookingData: any) => {
    return api.post("/bookings", bookingData);
  },

  // Get booking by ID
  getBooking: async (bookingId: string) => {
    return api.get(`/bookings/${bookingId}`);
  },

  // Update booking
  updateBooking: async (bookingId: string, bookingData: any) => {
    return api.put(`/bookings/${bookingId}/status`, bookingData);
  },

  // Cancel booking
  cancelBooking: async (bookingId: string) => {
    return api.delete(`/bookings/${bookingId}`);
  },

  // Process payment
  processPayment: async (paymentData: any) => {
    return api.post("/payments/initiate", paymentData);
  },

  // Get payment status
  getPaymentStatus: async (paymentId: string) => {
    return api.get(`/payments/${paymentId}/status`);
  },
};

// API endpoints for dashboard
export const dashboardApi = {
  // Get user's businesses
  getBusinesses: () => api.get("/businesses/my-business"),

  // Get business details
  getBusinessDetails: (businessId: string) =>
    api.get(`/businesses/${businessId}`),

  // Create business
  createBusiness: (businessData: any) => api.post("/businesses", businessData),

  // Update business
  updateBusiness: (businessId: string, businessData: any) =>
    api.put(`/businesses/${businessId}`, businessData),

  // Get bookings for business
  getBookings: (businessId: string, params?: any) =>
    api.get(`/bookings/business/${businessId}`, { params }),

  // Create booking (manual)
  createBooking: (bookingData: any) => api.post("/bookings", bookingData),

  // Update booking
  updateBooking: (bookingId: string, bookingData: any) =>
    api.put(`/bookings/${bookingId}/status`, bookingData),

  // Get analytics
  getAnalytics: (businessId: string, period: string) =>
    api.get(`/analytics/${businessId}`, { params: { period } }),

  // Get services for business
  getServices: (businessId: string) =>
    api.get(`/services`, { params: { businessId } }),

  // Create service
  createService: (businessId: string, serviceData: any) =>
    api.post(`/services`, { ...serviceData, businessId }),

  // Update service
  updateService: (serviceId: string, serviceData: any, businessId: string) =>
    api.put(`/services/${serviceId}`, { ...serviceData, businessId }),

  // Delete service
  deleteService: (serviceId: string) => api.delete(`/services/${serviceId}`),

  // Get time slots for business
  getTimeSlots: (businessId: string, serviceId: string, date: string) =>
    api.get(`/availability/${businessId}`, { params: { serviceId, date } }),

  // Generate time slots
  generateTimeSlots: (businessId: string, data: any) =>
    api.post(`/availability/generate/${businessId}`, data),

  // Force regenerate time slots (delete existing and create new)
  regenerateTimeSlots: (businessId: string, data: any) =>
    api.post(`/availability/regenerate/${businessId}`, data),

  // Update time slot
  updateTimeSlot: (slotId: string, data: any) =>
    api.put(`/availability/slots/${slotId}`, data),

  // Create time slot
  createTimeSlot: (data: any) => api.post(`/availability/slots`, data),

  // Delete time slot
  deleteTimeSlot: (slotId: string) =>
    api.delete(`/availability/slots/${slotId}`),

  // Bulk create time slots
  bulkCreateTimeSlots: (data: any) =>
    api.post(`/availability/bulk-create`, data),

  // Bulk delete time slots
  bulkDeleteTimeSlots: (serviceId: string, data: any) =>
    api.delete(`/availability/slots/${serviceId}/bulk`, { data }),

  // Create recurring slots
  createRecurringSlots: (businessId: string, data: any) =>
    api.post(`/availability/recurring/${businessId}`, data),

  // Get working hours
  getWorkingHours: (businessId: string) =>
    api.get(`/businesses/${businessId}/working-hours`),

  // Get business settings
  getBusinessSettings: (businessId: string) =>
    api.get(`/businesses/${businessId}/settings`),

  // Update business settings
  updateBusinessSettings: (businessId: string, settingsData: any) =>
    api.put(`/businesses/${businessId}/settings`, settingsData),
};

// API endpoints for admin
export const adminApi = {
  // Get all businesses
  getAllBusinesses: (params?: any) => api.get("/admin/businesses", { params }),

  // Get business details
  getBusinessDetails: (businessId: string) =>
    api.get(`/admin/businesses/${businessId}`),

  // Create new business
  createBusiness: (businessData: any) =>
    api.post("/admin/businesses", businessData),

  // Get all users
  getAllUsers: (params?: any) => api.get("/admin/users", { params }),

  // Get available users for business assignment
  getAvailableUsers: () => api.get("/admin/users/available"),

  // Get all users for owner assignment
  getAllUsersForAssignment: () => api.get("/admin/users/all-for-assignment"),

  // Create new user
  createUser: (userData: any) => api.post("/admin/users", userData),

  // Get admin analytics
  getAdminAnalytics: (period: string) =>
    api.get("/admin/analytics", { params: { period } }),

  // Update user role
  updateUserRole: (userId: string, role: string) =>
    api.put(`/admin/users/${userId}/role`, { role }),

  // Update business status
  updateBusinessStatus: (businessId: string, isActive: boolean) =>
    api.patch(`/admin/businesses/${businessId}/status`, { isActive }),

  // Change business owner
  changeBusinessOwner: (businessId: string, ownerId: string) =>
    api.patch(`/admin/businesses/${businessId}/owner`, { ownerId }),
};

// API endpoints for subscriptions
export const subscriptionApi = {
  // Get all available plans
  getPlans: () => api.get("/subscriptions/plans"),

  // Get current subscription
  getCurrentSubscription: () => api.get("/subscriptions/current"),

  // Get subscription by business ID
  getBusinessSubscription: (businessId: string) =>
    api.get(`/subscriptions/business/${businessId}`),

  // Get usage statistics
  getUsageStats: (period = "6m") =>
    api.get("/subscriptions/usage", { params: { period } }),

  // Get invoices
  getInvoices: (params?: any) => api.get("/subscriptions/invoices", { params }),

  // Create new subscription
  createSubscription: (subscriptionData: {
    planId: string;
    billingCycle: "MONTHLY" | "YEARLY";
    businessData: any;
  }) => api.post("/subscriptions", subscriptionData),

  // Update subscription plan
  updatePlan: (planData: {
    planId: string;
    billingCycle?: "MONTHLY" | "YEARLY";
  }) => api.put("/subscriptions/plan", planData),

  // Cancel subscription
  cancelSubscription: () => api.put("/subscriptions/cancel"),

  // Track usage (internal)
  trackUsage: (usageData: {
    type: "booking" | "sms";
    businessId: string;
    amount?: number;
  }) => api.post("/subscriptions/track-usage", usageData),
};

// API endpoints for authentication
export const authApi = {
  // Login user
  login: (credentials: { email: string; password: string }) =>
    api.post("/auth/login", credentials),

  // Register user
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => api.post("/auth/register", userData),

  // Get current user profile
  getProfile: () => api.get("/auth/me"),

  // Update user profile
  updateProfile: (profileData: any) => api.put("/auth/profile", profileData),

  // Forgot password
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  // Reset password
  resetPassword: (token: string, password: string) =>
    api.post("/auth/reset-password", { token, password }),

  // Logout
  logout: () => api.post("/auth/logout"),
};

// Mock API service for development
// This provides demo data when the backend is not available

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock business data
const mockBusiness = {
  id: "demo-business-123",
  name: "دمو سالن زیبایی",
  description: "یک سالن زیبایی برای تمام نیازهای شما",
  address: "تهران, ایران",
  phone: "+98-21-12345678",
  email: "demo@beautysalon.ir",
  website: "https://demo-beauty.ir/fa",
  logo: "https://via.placeholder.com/150x150/3b82f6/ffffff?text=Demo",
  isActive: true,
  timezone: "Asia/Tehran",
  currency: "IRR",
  language: "fa",
  settings: {
    allowOnlineBooking: true,
    requireConfirmation: false,
    allowCancellation: true,
    cancellationWindow: 24,
    maxAdvanceBooking: 30,
    minAdvanceBooking: 2,
  },
};

// Mock services data
const mockServices = [
  {
    id: "service-1",
    businessId: "demo-business-123",
    name: "اصلاح مو",
    description: "خدمات اصلاح مو",
    duration: 60,
    price: 150000,
    currency: "IRR",
    isActive: true,
    category: "HAIR",
    maxCapacity: 1,
    requiresEquipment: false,
    notes: "لطفا قبل از زمان مورد نظر خود ۱۰ دقیقه حضور داشته باشید",
  },
  {
    id: "service-2",
    businessId: "demo-business-123",
    name: "مانیکور و پدیکور",
    description: "خدمات مانیکور و پدیکور",
    duration: 90,
    price: 200000,
    currency: "IRR",
    isActive: true,
    category: "NAILS",
    maxCapacity: 1,
    requiresEquipment: false,
    notes: "با خود وسایل مورد نظر خود همراه داشته باشید",
  },
  {
    id: "service-3",
    businessId: "demo-business-123",
    name: "پاکسازی صورت",
    description: "خدمات پاکسازی صورت",
    duration: 120,
    price: 300000,
    currency: "IRR",
    isActive: true,
    category: "FACIAL",
    maxCapacity: 1,
    requiresEquipment: true,
    notes: "لطفا قبل از زمان مورد نظر خود ۱۰ دقیقه حضور داشته باشید",
  },
];

// Mock available slots
const generateMockSlots = (date: string) => {
  const slots = [];
  const startHour = 9;
  const endHour = 18;

  for (let hour = startHour; hour < endHour; hour++) {
    slots.push({
      id: `slot-${date}-${hour}`,
      startTime: `${hour.toString().padStart(2, "0")}:00`,
      endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
      isAvailable: Math.random() > 0.3, // 70% chance of being available
      date: date,
    });
  }

  return slots;
};

// Mock API responses
export const mockApi = {
  // Get business info
  getBusiness: async (businessId: string) => {
    await delay(500); // Simulate network delay
    if (businessId === "demo-business-123") {
      return { data: mockBusiness };
    }
    throw new Error("Business not found");
  },

  // Get services for a business
  getServices: async (businessId: string) => {
    await delay(300);
    if (businessId === "demo-business-123") {
      return { data: mockServices };
    }
    throw new Error("Business not found");
  },

  // Get available time slots
  getAvailableSlots: async (
    businessId: string,
    _serviceId: string,
    date: string
  ) => {
    await delay(400);
    if (businessId === "demo-business-123") {
      const slots = generateMockSlots(date);
      return { data: slots };
    }
    throw new Error("Business not found");
  },

  // Create booking
  createBooking: async (bookingData: any) => {
    await delay(800);
    const booking = {
      id: `booking-${Date.now()}`,
      ...bookingData,
      status: "CONFIRMED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { data: booking };
  },

  // Get booking by ID
  getBooking: async (bookingId: string) => {
    await delay(300);
    const booking = {
      id: bookingId,
      businessId: "demo-business-123",
      serviceId: "service-1",
      customerName: "Demo Customer",
      customerPhone: "+98-912-1234567",
      customerEmail: "demo@customer.ir",
      date: new Date().toISOString().split("T")[0],
      startTime: "10:00",
      endTime: "11:00",
      status: "CONFIRMED",
      totalAmount: 150000,
      currency: "IRR",
      notes: "Demo booking",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { data: booking };
  },

  // Update booking
  updateBooking: async (bookingId: string, bookingData: any) => {
    await delay(500);
    const booking = {
      id: bookingId,
      ...bookingData,
      updatedAt: new Date().toISOString(),
    };
    return { data: booking };
  },

  // Cancel booking
  cancelBooking: async (_bookingId: string) => {
    await delay(400);
    return { data: { message: "Booking cancelled successfully" } };
  },

  // Process payment
  processPayment: async (paymentData: any) => {
    await delay(1000);
    const payment = {
      id: `payment-${Date.now()}`,
      ...paymentData,
      status: "COMPLETED",
      gateway: "DEMO",
      transactionId: `txn-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { data: payment };
  },

  // Get payment status
  getPaymentStatus: async (paymentId: string) => {
    await delay(300);
    return { data: { status: "COMPLETED", paymentId } };
  },
};

// Check if we should use mock API
export const shouldUseMockApi = () => {
  return (
    (import.meta as any).env.VITE_USE_MOCK_API === "true" ||
    ((import.meta as any).env.DEV && !(import.meta as any).env.VITE_API_URL)
  );
};

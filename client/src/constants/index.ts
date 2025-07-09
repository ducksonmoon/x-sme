// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// Business Categories
export const BUSINESS_CATEGORIES = [
  { value: "beauty_salon", label: "Beauty Salon", labelFa: "سالن زیبایی" },
  { value: "clinic", label: "Clinic", labelFa: "کلینیک" },
  {
    value: "language_institute",
    label: "Language Institute",
    labelFa: "موسسه زبان",
  },
  {
    value: "dental_clinic",
    label: "Dental Clinic",
    labelFa: "کلینیک دندانپزشکی",
  },
  { value: "spa", label: "Spa", labelFa: "اسپا" },
  { value: "massage", label: "Massage", labelFa: "ماساژ" },
  { value: "fitness", label: "Fitness Center", labelFa: "باشگاه ورزشی" },
  { value: "consulting", label: "Consulting", labelFa: "مشاوره" },
  { value: "other", label: "Other", labelFa: "سایر" },
] as const;

// Service Categories
export const SERVICE_CATEGORIES = [
  { value: "hair", label: "Hair Services", labelFa: "خدمات مو" },
  { value: "nails", label: "Nail Services", labelFa: "خدمات ناخن" },
  { value: "facial", label: "Facial Services", labelFa: "خدمات پوست" },
  { value: "massage", label: "Massage", labelFa: "ماساژ" },
  { value: "consultation", label: "Consultation", labelFa: "مشاوره" },
  { value: "treatment", label: "Treatment", labelFa: "درمان" },
  { value: "class", label: "Class", labelFa: "کلاس" },
  { value: "other", label: "Other", labelFa: "سایر" },
] as const;

// Booking Status
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

// Payment Gateways
export const PAYMENT_GATEWAYS = {
  PASARGAD: "pasargad",
  SAMAN: "saman",
  ZARINPAL: "zarinpal",
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  BUSINESS_OWNER: "business_owner",
  STAFF: "staff",
} as const;

// Time Slots
export const TIME_SLOTS = {
  DURATION: 30, // minutes
  START_HOUR: 8,
  END_HOUR: 22,
  BREAK_START: 12,
  BREAK_END: 13,
} as const;

// Widget Configuration
export const WIDGET_CONFIG = {
  DEFAULT_THEME: "light",
  DEFAULT_LANGUAGE: "fa",
  DEFAULT_PRIMARY_COLOR: "#3b82f6",
  DEFAULT_BORDER_RADIUS: 8,
  MAX_ADVANCE_BOOKING: 30, // days
  MIN_ADVANCE_BOOKING: 2, // hours
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  PHONE: {
    PATTERN: /^(\+98|0)?9\d{9}$/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  NOTES: {
    MAX_LENGTH: 500,
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "token",
  THEME: "theme",
  LANGUAGE: "language",
  WIDGET_CONFIG: "widget-config",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "خطا در اتصال به اینترنت. لطفاً اتصال خود را بررسی کنید.",
  UNAUTHORIZED: "شما مجاز به انجام این عمل نیستید.",
  FORBIDDEN: "دسترسی ممنوع.",
  NOT_FOUND: "منبع مورد نظر یافت نشد.",
  VALIDATION_ERROR: "لطفاً اطلاعات وارد شده را بررسی کنید.",
  SERVER_ERROR: "خطا در سرور. لطفاً بعداً تلاش کنید.",
  BOOKING_ERROR: "ایجاد رزرو ناموفق بود. لطفاً مجدداً تلاش کنید.",
  PAYMENT_ERROR: "پرداخت ناموفق بود. لطفاً مجدداً تلاش کنید.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  BOOKING_CREATED: "رزرو با موفقیت ایجاد شد!",
  BOOKING_UPDATED: "رزرو با موفقیت بروزرسانی شد!",
  BOOKING_CANCELLED: "رزرو با موفقیت لغو شد!",
  PAYMENT_SUCCESS: "پرداخت با موفقیت انجام شد!",
  PROFILE_UPDATED: "پروفایل با موفقیت بروزرسانی شد!",
  SERVICE_CREATED: "سرویس با موفقیت ایجاد شد!",
  SERVICE_UPDATED: "سرویس با موفقیت بروزرسانی شد!",
  SERVICE_DELETED: "سرویس با موفقیت حذف شد!",
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "YYYY/MM/DD",
  API: "YYYY-MM-DD",
  TIME: "HH:mm",
  DATETIME: "YYYY/MM/DD HH:mm",
} as const;

// Currency
export const CURRENCY = {
  IRANIAN_TOMAN: "toman",
  IRANIAN_RIAL: "rial",
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

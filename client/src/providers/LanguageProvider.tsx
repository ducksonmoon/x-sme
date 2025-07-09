import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useLanguageStore } from "@store/languageStore";

interface LanguageContextType {
  language: "fa";
  setLanguage: (language: "fa") => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const { language, setLanguage } = useLanguageStore();

  // Farsi-only translation function
  const t = (key: string): string => {
    const translations: Record<string, string> = {
      // Booking related
      "booking.title": "رزرو نوبت",
      "booking.select_service": "انتخاب سرویس",
      "booking.select_time": "انتخاب زمان",
      "booking.customer_info": "اطلاعات مشتری",
      "booking.payment": "پرداخت",
      "booking.confirmation": "تایید",
      "booking.next": "بعدی",
      "booking.previous": "قبلی",
      "booking.confirm": "تایید رزرو",
      "booking.cancel": "انصراف",
      "booking.name": "نام",
      "booking.phone": "شماره تلفن",
      "booking.email": "ایمیل",
      "booking.notes": "یادداشت",
      "booking.total": "مجموع",
      "booking.currency": "تومان",
      "booking.success": "رزرو با موفقیت انجام شد",
      "booking.error": "خطا در رزرو",
      "booking.loading": "در حال بارگذاری...",
      "booking.select_date": "انتخاب تاریخ",
      "booking.select_time_slot": "انتخاب ساعت",
      "booking.customer_details": "اطلاعات مشتری",
      "booking.payment_method": "روش پرداخت",
      "booking.booking_confirmed": "رزرو تایید شد",
      "booking.choose_service": "سرویس مورد نظر خود را انتخاب کنید",
      "booking.choose_time": "زمان مورد نظر خود را انتخاب کنید",
      "booking.change": "تغییر",
      "booking.available_times": "ساعات موجود",
      "booking.provide_details":
        "لطفاً اطلاعات خود را برای تکمیل رزرو وارد کنید",
      "booking.service": "سرویس",
      "booking.date": "تاریخ",
      "booking.time": "ساعت",
      "booking.full_name": "نام کامل",
      "booking.enter_full_name": "نام کامل خود را وارد کنید",
      "booking.phone_number": "شماره تلفن",
      "booking.enter_phone_number": "۰۹xxxxxxxxx",
      "booking.enter_email": "your@email.com",
      "booking.special_requests": "یادداشت",
      "booking.enter_special_requests": "هر درخواست ویژه یا یادداشتی...",
      "booking.continue_to_payment": "ادامه به پرداخت",
      "booking.choose_payment_method": "روش پرداخت مورد نظر خود را انتخاب کنید",
      "booking.secure_online_payment": "پرداخت آنلاین امن",
      "booking.pay_now": "پرداخت کنید",
      "booking.booking_confirmed_message":
        "رزرو شما با موفقیت تایید شد. پیام تایید برای شما ارسال شده است.",
      "booking.booking_id": "شماره رزرو",
      "booking.book_another_service": "رزرو سرویس دیگر",
      "booking.view_my_bookings": "مشاهده رزروهای من",

      // Time related
      "time.today": "امروز",
      "time.tomorrow": "فردا",
      "time.available": "موجود",
      "time.unavailable": "ناموجود",
      "time.no_slots": "هیچ ساعتی موجود نیست",
      "time.select_date": "لطفاً تاریخ را انتخاب کنید",

      // Payment related
      "payment.cash": "نقدی",
      "payment.online": "آنلاین",
      "payment.pending": "در انتظار پرداخت",
      "payment.completed": "پرداخت شده",
      "payment.failed": "ناموفق",
      "payment.zarinpal": "زرین‌پال",
      "payment.pasargad": "پاسارگاد",
      "payment.saman": "سامان",
      "payment.amount": "مبلغ",
      "payment.deposit": "پیش‌پرداخت",
      "payment.full_amount": "مبلغ کامل",

      // Business related
      "business.services": "سرویس‌ها",
      "business.contact": "تماس",
      "business.address": "آدرس",
      "business.hours": "ساعات کاری",
      "business.rating": "امتیاز",
      "business.reviews": "نظرات",

      // Common
      "common.loading": "در حال بارگذاری...",
      "common.error": "خطا",
      "common.success": "موفق",
      "common.cancel": "انصراف",
      "common.save": "ذخیره",
      "common.edit": "ویرایش",
      "common.delete": "حذف",
      "common.confirm": "تایید",
      "common.back": "بازگشت",
      "common.continue": "ادامه",
      "common.finish": "پایان",
      "common.retry": "تلاش مجدد",

      // Navigation
      "nav.home": "خانه",
      "nav.about": "درباره ما",
      "nav.contact": "تماس",
      "nav.pricing": "قیمت‌گذاری",
      "nav.features": "ویژگی‌ها",
      "nav.dashboard": "داشبورد",
      "nav.bookings": "رزروها",
      "nav.services": "سرویس‌ها",
      "nav.settings": "تنظیمات",
      "nav.profile": "پروفایل",

      // Auth
      "auth.login": "ورود",
      "auth.register": "ثبت‌نام",
      "auth.logout": "خروج",
      "auth.forgot_password": "فراموشی رمز عبور",
      "auth.reset_password": "بازنشانی رمز عبور",
      "auth.email": "ایمیل",
      "auth.password": "رمز عبور",
      "auth.confirm_password": "تایید رمز عبور",
      "auth.remember_me": "مرا به خاطر بسپار",
      "auth.sign_in": "ورود به سیستم",
      "auth.sign_up": "ثبت‌نام در سیستم",
      "auth.welcome_back": "خوش آمدید",
      "auth.sign_in_to_account": "به حساب X-SME خود وارد شوید",
      "auth.create_account": "حساب کاربری خود را ایجاد کنید",
      "auth.join_xsme": "به X-SME بپیوندید و کسب‌وکار خود را امروز مدیریت کنید",
      "auth.first_name": "نام",
      "auth.last_name": "نام خانوادگی",
      "auth.phone_number": "شماره تلفن",
      "auth.phone_optional": "شماره تلفن (اختیاری)",
      "auth.enter_email": "ایمیل خود را وارد کنید",
      "auth.enter_password": "رمز عبور خود را وارد کنید",
      "auth.enter_confirm_password": "رمز عبور خود را دوباره وارد کنید",
      "auth.enter_first_name": "نام",
      "auth.enter_last_name": "نام خانوادگی",
      "auth.enter_phone": "شماره تلفن",
      "auth.signing_in": "در حال ورود...",
      "auth.creating_account": "در حال ایجاد حساب...",
      "auth.login_failed": "ورود ناموفق بود. لطفاً دوباره تلاش کنید.",
      "auth.registration_failed": "ثبت‌نام ناموفق بود. لطفاً دوباره تلاش کنید.",
      "auth.passwords_not_match": "رمزهای عبور مطابقت ندارند",
      "auth.dont_have_account": "حساب کاربری ندارید؟",
      "auth.already_have_account": "قبلاً حساب کاربری دارید؟",
      "auth.sign_up_free": "رایگان ثبت‌نام کنید",
      "auth.sign_in_here": "اینجا وارد شوید",
      "auth.forgot_password_question": "رمز عبور خود را فراموش کرده‌اید؟",
      "auth.reset_password_title": "بازنشانی رمز عبور",
      "auth.reset_password_description":
        "ایمیل خود را وارد کنید و ما لینک بازنشانی رمز عبور را برای شما ارسال خواهیم کرد.",
      "auth.send_reset_link": "ارسال لینک بازنشانی",
      "auth.sending_reset_link": "در حال ارسال لینک...",
      "auth.reset_link_sent": "لینک بازنشانی رمز عبور ارسال شد",
      "auth.check_email": "لطفاً ایمیل خود را بررسی کنید",
      "auth.back_to_login": "بازگشت به صفحه ورود",
      "auth.demo_credentials": "اطلاعات نمونه",
      "auth.admin_demo": "مدیر:",
      "auth.business_owner_demo": "صاحب کسب‌وکار:",

      // Dashboard
      "dashboard.overview": "نمای کلی",
      "dashboard.recent_bookings": "رزروهای اخیر",
      "dashboard.total_revenue": "درآمد کل",
      "dashboard.pending_bookings": "رزروهای در انتظار",
      "dashboard.completed_bookings": "رزروهای تکمیل شده",
      "dashboard.today_bookings": "رزروهای امروز",
      "dashboard.this_week": "این هفته",
      "dashboard.this_month": "این ماه",
      "dashboard.this_year": "این سال",

      // Messages
      "message.booking_created": "رزرو با موفقیت ایجاد شد",
      "message.booking_updated": "رزرو با موفقیت بروزرسانی شد",
      "message.booking_cancelled": "رزرو لغو شد",
      "message.payment_successful": "پرداخت با موفقیت انجام شد",
      "message.payment_failed": "پرداخت ناموفق بود",
      "message.reminder_sent": "یادآوری ارسال شد",
      "message.error_occurred": "خطایی رخ داد",
      "message.try_again": "لطفاً دوباره تلاش کنید",
      "message.required_field": "این فیلد الزامی است",
      "message.invalid_email": "ایمیل نامعتبر است",
      "message.invalid_phone": "شماره تلفن نامعتبر است",

      // Home page
      "home.hero.title": "ویجت رزرو و پرداخت برای کسب‌وکارهای کوچک",
      "home.hero.subtitle": "رزرو آنلاین، پرداخت محلی، یادآوری هوشمند",
      "home.hero.description":
        "کسب‌وکار خود را با ویجت زیبا و قابل جاسازی رزرو متحول کنید. پرداخت‌های محلی را بپذیرید، یادآوری‌های هوشمند ارسال کنید و درآمد خود را افزایش دهید.",
      "home.hero.try_demo": "مشاهده دمو",
      "home.hero.view_pricing": "مشاهده قیمت‌ها",
      "home.hero.made_for_iran": "ساخته شده برای کسب‌وکارهای ایرانی",
      "home.hero.free_setup": "نصب رایگان",
      "home.hero.no_monthly_fees": "بدون هزینه ماهانه",
      "home.hero.support": "پشتیبانی ۲۴/۷",

      // Features
      "features.real_time_availability": "دسترسی لحظه‌ای",
      "features.real_time_description":
        "نمایش دسترسی زنده و تایید فوری رزرو به مشتریان شما.",
      "features.local_payments": "درگاه‌های پرداخت محلی",
      "features.local_payments_description":
        "پذیرش پرداخت از طریق پاسارگاد، سامان و زرین‌پال با پردازش امن.",
      "features.smart_reminders": "یادآوری‌های هوشمند",
      "features.smart_reminders_description":
        "یادآوری‌های خودکار پیامکی و تلگرامی برای کاهش عدم حضور.",
      "features.mobile_optimized": "بهینه‌سازی موبایل",
      "features.mobile_optimized_description":
        "طراحی زیبا و واکنش‌گرا که روی تمام دستگاه‌ها به طور کامل کار می‌کند.",
      "features.fast": "سریع",
      "features.fast_description":
        "ویجت قابل جاسازی که فوری بارگذاری می‌شود و به راحتی یکپارچه می‌شود.",
      "features.secure": "امن و قابل اعتماد",
      "features.secure_description":
        "امنیت سطح بانکی با ضمانت ۹۹.۹٪ در دسترس بودن.",
      "features.title": "همه آنچه برای رشد نیاز دارید",
      "features.subtitle":
        "ویجت رزرو جامع ما تمام ابزارهایی که کسب‌وکار شما برای ساده‌سازی عملیات و افزایش درآمد نیاز دارد را فراهم می‌کند.",

      // Stats
      "stats.businesses": "کسب‌وکار به ما اعتماد می‌کنند",
      "stats.bookings": "رزرو پردازش شده",
      "stats.uptime": "ضمانت در دسترس بودن",
      "stats.support": "پشتیبانی مشتری",

      // Testimonials
      "testimonials.title": "مشتریان ما چه می‌گویند",
      "testimonials.subtitle": "ببینید چگونه X-SME به کسب‌وکارها کمک می‌کند",

      // CTA
      "cta.title": "آماده متحول کردن کسب‌وکار خود هستید؟",
      "cta.description":
        "به صدها کسب‌وکاری بپیوندید که به X-SME برای نیازهای رزرو خود اعتماد می‌کنند.",
      "cta.get_started": "شروع کنید",

      // Pricing
      "pricing.title": "قیمت‌گذاری ساده و شفاف",
      "pricing.subtitle":
        "هیچ هزینه پنهانی. فقط پرداخت برای آنچه استفاده می‌کنید.",
      "pricing.one_time_fee": "هزینه یکبار نصب",
      "pricing.optional_commission": "کمیسیون اختیاری",
      "pricing.no_monthly_fees": "بدون هزینه ماهانه",
      "pricing.start_now": "شروع کنید",

      // Contact
      "contact.title": "با ما در تماس باشید",
      "contact.subtitle": "آماده کمک به شما هستیم",
      "contact.name": "نام",
      "contact.email": "ایمیل",
      "contact.message": "پیام",
      "contact.send": "ارسال پیام",
      "contact.address": "آدرس",
      "contact.phone": "تلفن",
      "contact.working_hours": "ساعات کاری",

      // Footer
      "footer.company": "شرکت",
      "footer.product": "محصول",
      "footer.support": "پشتیبانی",
      "footer.legal": "قانونی",
      "footer.privacy": "حریم خصوصی",
      "footer.terms": "شرایط استفاده",
      "footer.copyright": "تمامی حقوق محفوظ است",
      "footer.company_description":
        "کسب‌وکار خود را با ویجت رزرو و پرداخت محلی ما متحول کنید. مخصوصاً برای کسب‌وکارهای کوچک ایرانی ساخته شده است.",

      // Widget specific
      "widget.select_service": "سرویس خود را انتخاب کنید",
      "widget.select_time": "زمان خود را انتخاب کنید",
      "widget.enter_details": "اطلاعات خود را وارد کنید",
      "widget.make_payment": "پرداخت کنید",
      "widget.booking_confirmed": "رزرو تایید شد",
      "widget.booking_id": "شماره رزرو",
      "widget.booking_date": "تاریخ رزرو",
      "widget.booking_time": "ساعت رزرو",
      "widget.service_name": "نام سرویس",
      "widget.service_price": "قیمت سرویس",
      "widget.customer_name": "نام مشتری",
      "widget.customer_phone": "تلفن مشتری",
      "widget.booking_notes": "یادداشت‌های رزرو",
      "widget.payment_method": "روش پرداخت",
      "widget.payment_status": "وضعیت پرداخت",
      "widget.booking_status": "وضعیت رزرو",
      "widget.new_booking": "رزرو جدید",
      "widget.modify_booking": "تغییر رزرو",
      "widget.cancel_booking": "لغو رزرو",
    };

    return translations[key] || key;
  };

  useEffect(() => {
    // Always set to Farsi for Iranian SMEs
    setLanguage("fa");
  }, [setLanguage]);

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = "rtl"; // Always RTL for Farsi
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

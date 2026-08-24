import {
  Globe,
  Code2,
  Brain,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

export interface ServiceItem {
  slug: string;
  icon: LucideIcon;
  title: string;
  description: string;
  details: string[];
}

export interface PortfolioItem {
  slug: string;
  name: string;
  description: string;
  about: string;
  url: string;
  tags: string[];
}

export const services: ServiceItem[] = [
  {
    slug: "website",
    icon: Globe,
    title: "وب‌سایت",
    description:
      "طراحی و توسعه وب‌سایت‌های شرکتی و فروشگاهی با تمرکز بر تجربه کاربری، سرعت و سئو.",
    details: [
      "طراحی رابط کاربری اختصاصی، نه قالب آماده",
      "بهینه‌سازی سرعت بارگذاری و سئوی فنی",
      "پنل مدیریت محتوا برای ویرایش آسان",
    ],
  },
  {
    slug: "software-api",
    icon: Code2,
    title: "نرم‌افزار و API",
    description:
      "نرم‌افزار سفارشی، پنل‌های مدیریتی و سرویس‌های API برای یکپارچه‌سازی سیستم‌های کسب‌وکار.",
    details: [
      "پنل‌های مدیریتی و داشبورد گزارش‌گیری",
      "طراحی و توسعه API برای اتصال سیستم‌ها",
      "معماری قابل نگهداری و مقیاس‌پذیر",
    ],
  },
  {
    slug: "ai",
    icon: Brain,
    title: "هوش مصنوعی",
    description:
      "اتوماسیون فرآیندها، تحلیل داده و دستیارهای هوشمند مبتنی بر هوش مصنوعی.",
    details: [
      "اتوماسیون کارهای تکراری با هوش مصنوعی",
      "دستیارهای هوشمند برای پشتیبانی و فروش",
      "تحلیل و استخراج بینش از داده‌های شما",
    ],
  },
  {
    slug: "app",
    icon: Smartphone,
    title: "اپلیکیشن",
    description:
      "ساخت اپلیکیشن‌های وب و موبایل، از MVP استارتاپی تا محصولات مقیاس‌پذیر.",
    details: [
      "MVP سریع برای تست ایده استارتاپی",
      "اپلیکیشن وب و موبایل با یک کدبیس",
      "پشتیبانی و توسعه نسخه‌های بعدی محصول",
    ],
  },
];

export const portfolio: PortfolioItem[] = [
  {
    slug: "zarandooz",
    name: "Zarandooz",
    description: "توسعه اپلیکیشن، سرویس‌های API و وب‌سایت",
    about:
      "برای زرندوز، اپلیکیشن، سرویس‌های API پشت آن و وب‌سایت معرفی محصول را طراحی و توسعه دادیم.",
    url: "https://zarandooz.app/",
    tags: ["اپلیکیشن", "API", "وب‌سایت"],
  },
  {
    slug: "nipou",
    name: "Nipou",
    description: "طراحی وب‌سایت شرکتی",
    about: "وب‌سایت شرکتی نیپو را از صفر طراحی و توسعه دادیم.",
    url: "https://nipoucompany.com/",
    tags: ["وب‌سایت"],
  },
  {
    slug: "tabeshraad",
    name: "Tabeshraad",
    description: "طراحی وب‌سایت شرکتی",
    about: "وب‌سایت شرکتی تابش‌رعد را از صفر طراحی و توسعه دادیم.",
    url: "https://tabeshraad.co/",
    tags: ["وب‌سایت"],
  },
  {
    slug: "jamnevisi",
    name: "Jamnevisi",
    description: "طراحی وب‌سایت و خدمات آنلاین",
    about: "برای جمع‌نویسی، وب‌سایت و بخش خدمات آنلاین آن را طراحی و توسعه دادیم.",
    url: "https://jamnevisi.ir/",
    tags: ["وب‌سایت", "خدمات"],
  },
  {
    slug: "fbc",
    name: "FBC",
    description: "توسعه نرم‌افزار",
    about: "برای فولاد بهمن، نرم‌افزار اختصاصی متناسب با فرآیندهای داخلی شرکت را توسعه دادیم.",
    url: "https://fbc.ir/",
    tags: ["نرم‌افزار"],
  },
];

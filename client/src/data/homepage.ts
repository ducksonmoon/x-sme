import {
  Factory,
  Boxes,
  Workflow,
  ClipboardList,
  ScanLine,
  ChartNoAxesCombined,
  PackageCheck,
  Users,
  FileCheck2,
  Network,
  ShieldCheck,
  GitBranch,
} from "lucide-react";

/** Application scenarios describe potential scope, not additional client claims. */
export const operationalApplications = [
  {
    id: "production",
    name: "تولید و صنعت",
    english: "PRODUCTION & OPERATIONS",
    icon: Factory,
    title: "از ثبت عملیات تا گزارش مدیریت.",
    problem:
      "وقتی اطلاعات بین فرم‌ها، فایل‌ها و واحدهای مختلف پخش است، پیگیری کار و تصمیم‌گیری دشوار می‌شود.",
    approach:
      "نرم‌افزار اختصاصی را حول فرآیندهای شما تعریف می‌کنیم؛ با مسیر مشخص برای ثبت اطلاعات، پیگیری و گزارش‌گیری.",
    modules: ["ثبت فرآیندها", "دسترسی متناسب با نقش", "گزارش‌های مدیریتی"],
    flow: [
      { name: "ثبت عملیات", icon: ClipboardList },
      { name: "کنترل و پیگیری", icon: ScanLine },
      { name: "گزارش مدیریت", icon: ChartNoAxesCombined },
    ],
    result: "یک جریان قابل پیگیری برای تیم و مدیریت",
    topic: "software-api",
  },
  {
    id: "distribution",
    name: "بازرگانی و توزیع",
    english: "INVENTORY & DISTRIBUTION",
    icon: Boxes,
    title: "تصویر روشن‌تری از گردش کالا.",
    problem:
      "ثبت‌های جداگانهٔ ورود، خروج و موجودی، پاسخ‌دادن به یک سؤال ساده را سخت می‌کند: چه کالایی در دسترس است؟",
    approach:
      "از محصول مدیریت انبار تا اتصال آن به ابزارهای دیگر؛ محدودهٔ راهکار را بر اساس جریان کالا در کسب‌وکار شما مشخص می‌کنیم.",
    modules: ["ورود و خروج کالا", "گردش موجودی", "گزارش و هشدار"],
    flow: [
      { name: "ورود و خروج", icon: PackageCheck },
      { name: "موجودی انبار", icon: Boxes },
      { name: "گزارش و هشدار", icon: ChartNoAxesCombined },
    ],
    result: "اطلاعات منسجم‌تر برای تصمیم‌های روزانه",
    topic: "inventory",
  },
  {
    id: "services",
    name: "خدمات و کسب‌وکار",
    english: "SERVICE WORKFLOWS",
    icon: Workflow,
    title: "از درخواست مشتری تا پیگیری تیم.",
    problem:
      "وقتی درخواست‌ها و وضعیت کار در چند ابزار جدا ثبت می‌شوند، هماهنگی بین مشتری و تیم به پیگیری دستی وابسته می‌شود.",
    approach:
      "وب‌سایت، پنل یا اپلیکیشن را به گردش کار داخلی متصل می‌کنیم؛ با تعریف روشن مراحل، مسئولیت‌ها و وضعیت هر درخواست.",
    modules: ["ثبت درخواست", "گردش کار تیم", "اتصال از طریق API"],
    flow: [
      { name: "درخواست مشتری", icon: ClipboardList },
      { name: "گردش کار تیم", icon: Users },
      { name: "پیگیری و گزارش", icon: FileCheck2 },
    ],
    result: "یک مسیر مشترک میان مشتری، تیم و داده",
    topic: "software-api",
  },
];

export const homepageCapabilities = [
  {
    slug: "software-api",
    title: "نرم‌افزار سازمانی و API",
    english: "BUSINESS SOFTWARE & INTEGRATION",
    text: "نرم‌افزار سفارشی، پنل‌های مدیریتی و اتصال سیستم‌ها برای جریان‌های کاری کسب‌وکار.",
  },
  {
    slug: "website",
    title: "وب‌سایت شرکتی و فروشگاهی",
    english: "CORPORATE WEB & COMMERCE",
    text: "تجربهٔ وب اختصاصی با مدیریت محتوا، توجه به سرعت و سئوی فنی.",
  },
  {
    slug: "app",
    title: "محصول وب و موبایل",
    english: "WEB & MOBILE PRODUCTS",
    text: "از تعریف نسخهٔ اولیه تا توسعهٔ قابلیت‌ها؛ محصولی متناسب با کاربر و مدل کسب‌وکار.",
  },
  {
    slug: "ai",
    title: "هوش مصنوعی و اتوماسیون",
    english: "AI & PROCESS AUTOMATION",
    text: "تحلیل داده، دستیارهای هوشمند و اتوماسیون برای مسئله‌هایی با نتیجهٔ قابل ارزیابی.",
  },
];

export const engineeringPrinciples = [
  {
    icon: Network,
    title: "معماری و اتصال سیستم‌ها",
    text: "مرز سرویس‌ها، جریان داده و APIها را در طراحی مشخص می‌کنیم تا مسیر توسعهٔ بعدی روشن باشد.",
  },
  {
    icon: ShieldCheck,
    title: "آزمون و معیار پذیرش",
    text: "رفتارهای مورد انتظار و سناریوهای آزمون را در محدودهٔ پروژه تعریف می‌کنیم؛ تحویل بر اساس همین معیارها بررسی می‌شود.",
  },
  {
    icon: GitBranch,
    title: "تحویل و ادامهٔ توسعه",
    text: "مستندات، آموزش، راه‌اندازی و چارچوب پشتیبانی را از ابتدا با شما هماهنگ می‌کنیم.",
  },
];

export const deliveryStages = [
  {
    number: "۰۱",
    title: "تحلیل نیاز و فرآیند",
    text: "کاربران، جریان کار، محدودیت‌های فنی و اولویت‌های کسب‌وکار را با تیم شما بررسی می‌کنیم.",
    output: "خروجی: محدوده و نیازمندی‌های پروژه",
  },
  {
    number: "۰۲",
    title: "طراحی محصول و معماری",
    text: "تجربهٔ کاربری، مدل داده و نحوهٔ اتصال اجزا را پیش از توسعه مشخص می‌کنیم.",
    output: "خروجی: طرح محصول و برنامهٔ ساخت",
  },
  {
    number: "۰۳",
    title: "توسعه و آزمون",
    text: "نسخه‌های قابل بررسی ارائه می‌دهیم، بازخورد می‌گیریم و رفتار سیستم را با معیارهای پذیرش می‌سنجیم.",
    output: "خروجی: نسخهٔ آزموده و قابل استفاده",
  },
  {
    number: "۰۴",
    title: "استقرار و همراهی",
    text: "راه‌اندازی، آموزش و مسیر نگهداری را هماهنگ می‌کنیم؛ پشتیبانی طبق توافق پروژه ادامه دارد.",
    output: "خروجی: تحویل و برنامهٔ ادامهٔ همکاری",
  },
];

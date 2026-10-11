export const products = [
  {
    id: "inventory",
    number: "۰۱",
    name: "مدیریت انبار",
    english: "INVENTORY",
    description:
      "از ورود کالا تا تصمیم بعدی؛ تصویر روشن‌تری از موجودی کسب‌وکارتان داشته باشید.",
    features: ["موجودی و گردش کالا", "ثبت ورود و خروج", "گزارش و هشدار موجودی"],
  },
  {
    id: "quality",
    number: "۰۲",
    name: "کنترل کیفیت",
    english: "QUALITY ASSURANCE",
    description:
      "تست‌ها، مغایرت‌ها و پیگیری‌ها را به یک فرآیند قابل‌ردگیری تبدیل کنید.",
    features: [
      "چک‌لیست و سناریوی تست",
      "ثبت و پیگیری مغایرت",
      "گزارش کیفیت محصول",
    ],
  },
];

export const process = [
  {
    number: "۰۱",
    title: "اول، مسئله را می‌فهمیم.",
    text: "با تیم شما صحبت می‌کنیم؛ جریان کار، محدودیت‌ها و نتیجه‌ای که انتظار دارید را روشن می‌کنیم.",
    output: "تعریف مسئله و محدودهٔ پروژه",
  },
  {
    number: "۰۲",
    title: "بعد، اجزا را کنار هم می‌گذاریم.",
    text: "تجربهٔ کاربری و معماری فنی را هم‌زمان طراحی می‌کنیم تا ظاهر و عملکرد از یک منطق پیروی کنند.",
    output: "طرح محصول و مسیر ساخت",
  },
  {
    number: "۰۳",
    title: "قدم‌به‌قدم می‌سازیم.",
    text: "نسخه‌های قابل بررسی می‌سازیم، بازخورد می‌گیریم و پیش از تحویل، رفتار واقعی سیستم را می‌سنجیم.",
    output: "نرم‌افزار آزموده و قابل استفاده",
  },
  {
    number: "۰۴",
    title: "دایره با تحویل تمام نمی‌شود.",
    text: "راه‌اندازی، آموزش و مسیر توسعهٔ بعدی را با شما هماهنگ می‌کنیم؛ پشتیبانی در چارچوب توافق پروژه ادامه دارد.",
    output: "تحویل روشن و برنامهٔ ادامه",
  },
];

export const serviceNotes: Record<
  string,
  { english: string; lead: string; outcome: string }
> = {
  website: {
    english: "WEB EXPERIENCES",
    lead: "اولین برخورد، یک تجربهٔ خوب.",
    outcome: "وب‌سایتی که هویت شما را بیان می‌کند و استفاده از آن ساده است.",
  },
  "software-api": {
    english: "CONNECTED SOFTWARE",
    lead: "ابزارهایتان با هم کار کنند.",
    outcome: "یک جریان منسجم میان داده، تیم و ابزارهای کسب‌وکار.",
  },
  ai: {
    english: "APPLIED INTELLIGENCE",
    lead: "هوشمندی، برای یک مسئلهٔ واقعی.",
    outcome:
      "راهکاری قابل ارزیابی برای کم‌کردن کار تکراری و استفادهٔ بهتر از داده.",
  },
  app: {
    english: "DIGITAL PRODUCTS",
    lead: "ایده‌ای که می‌شود از آن استفاده کرد.",
    outcome: "محصولی که از نسخهٔ اول، راهی روشن برای رشد دارد.",
  },
};

export const projectNames: Record<string, string> = {
  zarandooz: "زرندوز",
  nipou: "نیپو",
  tabeshraad: "تابش‌رعد",
  jamnevisi: "جمع‌نویسی",
  fbc: "فولاد بهمن",
};

export const faNumber = (value: number) =>
  value.toLocaleString("fa-IR", { minimumIntegerDigits: 2 });

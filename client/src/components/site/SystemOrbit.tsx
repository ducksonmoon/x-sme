import React, { useState } from "react";
import {
  Code2,
  Globe2,
  BrainCircuit,
  Smartphone,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { CircleMark } from "@/brand/circle";

const parts = [
  {
    slug: "software-api",
    name: "نرم‌افزار",
    icon: Code2,
    title: "نرم‌افزار سازمانی و اتصال سیستم‌ها",
    text: "نرم‌افزار سفارشی، پنل مدیریتی و API متناسب با فرآیندهای کسب‌وکار شما.",
    english: "CONNECTED SOFTWARE",
  },
  {
    slug: "website",
    name: "وب‌سایت",
    icon: Globe2,
    title: "وب‌سایت شرکتی و فروشگاهی",
    text: "طراحی اختصاصی، مدیریت محتوا و تجربهٔ کاربری متناسب با مشتریان شما.",
    english: "WEB EXPERIENCES",
  },
  {
    slug: "ai",
    name: "هوش مصنوعی",
    icon: BrainCircuit,
    title: "هوش مصنوعی برای مسائل عملیاتی",
    text: "اتوماسیون کارهای تکراری و تحلیل داده، با تعریف روشن مسئله و معیار ارزیابی.",
    english: "APPLIED INTELLIGENCE",
  },
  {
    slug: "app",
    name: "اپلیکیشن",
    icon: Smartphone,
    title: "توسعهٔ محصول وب و موبایل",
    text: "از طراحی نسخهٔ اولیه تا ساخت و توسعهٔ قابلیت‌های بعدی محصول دیجیتال شما.",
    english: "DIGITAL PRODUCTS",
  },
];

export default function SystemOrbit() {
  const [active, setActive] = useState(0);
  const part = parts[active];
  return (
    <div className="system-orbit">
      <div className="system-orbit__drawing">
        <svg
          className="system-orbit__lines"
          viewBox="0 0 520 440"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="260" cy="218" r="174" />
          <circle cx="260" cy="218" r="116" />
          <path d="M260 44V102M86 218H144M376 218H434M260 334V392" />
          <circle className="system-orbit__copper" cx="383" cy="95" r="5" />
          <circle cx="137" cy="341" r="5" />
        </svg>
        <div className="system-orbit__center">
          <CircleMark theme="dark" size={120} />
          <span>دایرهٔ کسب‌وکار شما</span>
        </div>
        {parts.map((item, i) => (
          <button
            key={item.name}
            type="button"
            className={`system-orbit__part system-orbit__part--${i}${active === i ? " is-active" : ""}`}
            aria-pressed={active === i}
            aria-controls="orbit-description"
            onClick={() => setActive(i)}
          >
            <item.icon size={19} aria-hidden="true" />
            <span>{item.name}</span>
            <i />
          </button>
        ))}
        <span className="system-orbit__annotation" dir="ltr">
          PARTS → A WHOLE
        </span>
      </div>
      <div
        className="system-orbit__caption"
        id="orbit-description"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="system-orbit__label" dir="ltr">
          {part.english}
        </span>
        <h2>{part.title}</h2>
        <p>{part.text}</p>
        <Link
          to={`/services#${part.slug}`}
          aria-label={`آشنایی با خدمات ${part.name} دایره`}
        >
          کشف خدمات
          <ArrowLeft size={17} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpLeft, Check, ArrowLeft } from "lucide-react";
import { services } from "@/data/site";
import { serviceNotes, process, faNumber } from "@/data/identity";
import {
  PageMeta,
  PageIntro,
  Eyebrow,
  SectionHeading,
} from "@/components/site/Elements";

const questions = [
  {
    question: "از کجا شروع کنیم؟",
    answer:
      "از مسئله‌ای که می‌خواهید حل شود. لازم نیست مشخصات فنی آماده داشته باشید؛ در گفت‌وگوی اولیه، نیاز و محدودهٔ پروژه را با هم روشن می‌کنیم.",
  },
  {
    question: "هزینه و زمان پروژه چطور مشخص می‌شود؟",
    answer:
      "پس از شناخت نیاز، محدودهٔ کار، مراحل تحویل، زمان‌بندی و هزینه را پیشنهاد می‌دهیم. جزئیات پیش از شروع به‌صورت مکتوب توافق می‌شود.",
  },
  {
    question: "با ابزارهای فعلی کسب‌وکار ما هم کار می‌کنید؟",
    answer:
      "بله؛ امکان اتصال به سیستم‌های موجود را بررسی می‌کنیم. دسترسی به داده، محدودیت‌های فنی و مستندات سرویس‌ها تعیین می‌کنند چه ارتباطی قابل پیاده‌سازی است.",
  },
  {
    question: "بعد از تحویل چه اتفاقی می‌افتد؟",
    answer:
      "راه‌اندازی و آموزش را هماهنگ می‌کنیم. پشتیبانی و توسعهٔ بعدی بر اساس نیاز شما و چارچوب توافق پروژه مشخص می‌شود.",
  },
];

export default function Services() {
  return (
    <>
      <PageMeta
        title="راهکارهای نرم‌افزاری"
        description="طراحی و توسعهٔ نرم‌افزار و API، وب‌سایت، اپلیکیشن و هوش مصنوعی با دایره؛ از شناخت مسئله تا یک راهکار منسجم."
      />
      <PageIntro
        label="راهکارهای دایره"
        english="WAYS TO BUILD"
        title={
          <>
            از یک نیاز،
            <br />
            به یک راهکار منسجم.
          </>
        }
        description="فناوری را از روی مسئله انتخاب می‌کنیم. آنچه می‌سازیم باید با آدم‌ها، فرآیندها و آیندهٔ کسب‌وکار شما هماهنگ باشد."
      />
      <section className="site-container site-service-details">
        {services.map((service, i) => (
          <article
            id={service.slug}
            tabIndex={-1}
            key={service.slug}
            className="site-service-detail"
          >
            <div className="site-service-detail__identity">
              <span className="site-section-number">{faNumber(i + 1)} /</span>
              <service.icon size={36} aria-hidden="true" />
              <h2>{service.title}</h2>
              <span className="site-latin" dir="ltr">
                {serviceNotes[service.slug].english}
              </span>
            </div>
            <div className="site-service-detail__content">
              <h3>{serviceNotes[service.slug].lead}</h3>
              <p>{service.description}</p>
              <ul>
                {service.details.map((detail) => (
                  <li key={detail}>
                    <Check size={17} aria-hidden="true" />
                    {detail}
                  </li>
                ))}
              </ul>
              <Link
                className="site-text-link"
                to={`/contact?service=${service.slug}`}
              >
                دربارهٔ این راهکار صحبت کنیم
                <ArrowUpLeft size={19} />
              </Link>
            </div>
            <div className="site-service-detail__outcome">
              <span>نتیجه‌ای که دنبال می‌کنیم</span>
              <p>{serviceNotes[service.slug].outcome}</p>
              <ArrowLeft size={26} aria-hidden="true" />
            </div>
          </article>
        ))}
      </section>
      <section className="site-method site-section">
        <div className="site-container">
          <SectionHeading
            number="مسیر همکاری"
            title="از اولین گفت‌وگو تا روز استفاده."
          />
          <div className="site-process">
            {process.map((step) => (
              <article key={step.number}>
                <span className="site-process__number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <span className="site-process__output">{step.output}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="site-container site-section site-faq">
        <div>
          <Eyebrow english="BEFORE WE BEGIN">پیش از شروع</Eyebrow>
          <h2>
            چند پرسش،
            <br />
            چند پاسخ روشن.
          </h2>
          <p>اگر پرسش دیگری دارید، برایمان بنویسید.</p>
          <Link className="site-text-link" to="/contact">
            پرسش شما
            <ArrowUpLeft size={19} />
          </Link>
        </div>
        <div className="site-faq__items">
          {questions.map((item, i) => (
            <details key={item.question} open={i === 0}>
              <summary>
                {item.question}
                <span aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

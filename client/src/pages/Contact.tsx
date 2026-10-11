import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "@formspree/react";
import { ArrowUpLeft, Check, Mail, ArrowLeft } from "lucide-react";
import { PageIntro, PageMeta, Eyebrow } from "@/components/site/Elements";
import { CircleMark } from "@/brand/circle";

const topics = [
  ["", "انتخاب کنید"],
  ["website", "وب‌سایت"],
  ["software-api", "نرم‌افزار و API"],
  ["ai", "هوش مصنوعی"],
  ["app", "اپلیکیشن"],
  ["inventory", "دموی مدیریت انبار"],
  ["quality", "دموی کنترل کیفیت"],
  ["other", "هنوز دقیق نمی‌دانم"],
];

export default function Contact() {
  const [params] = useSearchParams();
  const requested = params.get("service") || "";
  const initialTopic = topics.some(([value]) => value === requested)
    ? requested
    : "";
  const [state, handleSubmit] = useForm("xvkpjknp");
  const fieldMessage = (field: string) => {
    const error = state.errors?.getFieldErrors(field)[0];
    if (!error) return null;
    if (error.code === "TYPE_EMAIL") return "یک نشانی ایمیل معتبر وارد کنید.";
    if (
      error.code === "REQUIRED_FIELD_EMPTY" ||
      error.code === "REQUIRED_FIELD_MISSING"
    )
      return "این فیلد را تکمیل کنید.";
    return "اطلاعات این فیلد را بررسی کنید.";
  };
  useEffect(() => {
    if (!state.errors) return;
    const field = ["name", "email", "message"].find(
      (name) => state.errors.getFieldErrors(name).length > 0,
    );
    if (field) document.getElementById(`contact-${field}`)?.focus();
  }, [state.errors]);
  return (
    <>
      <PageMeta
        title="شروع یک گفت‌وگو"
        description="دربارهٔ پروژهٔ نرم‌افزار، وب‌سایت یا ایدهٔ خود برای دایره بنویسید؛ اولین قدم، شناخت مسئلهٔ کسب‌وکار شماست."
      />
      <PageIntro
        label="ارتباط با دایره"
        english="LET’S MAKE IT CONNECT"
        title={
          <>
            از یک گفت‌وگو،
            <br />
            شروع کنیم.
          </>
        }
        description="یک ایده، یک مسئله یا کاری که وقت تیم شما را می‌گیرد. برایمان بنویسید؛ لازم نیست از همین ابتدا تمام جزئیات را بدانید."
      />
      <section className="site-container site-contact">
        <aside className="site-contact__aside">
          <Eyebrow>یک خط ارتباط مستقیم</Eyebrow>
          <a
            href="mailto:info@circlegroup.ir"
            className="site-contact__email"
            dir="ltr"
          >
            info@circlegroup.ir
            <Mail size={20} />
          </a>
          <p>
            ترجیح می‌دهید ایمیل بزنید؟
            <br />
            همین نشانی، شروع ارتباط ماست.
          </p>
          <div className="site-contact__steps">
            <span>پس از پیام شما</span>
            <ol>
              <li>
                <b>۰۱</b>
                <span>درخواست شما را می‌خوانیم.</span>
              </li>
              <li>
                <b>۰۲</b>
                <span>برای روشن‌شدن نیاز با شما ارتباط می‌گیریم.</span>
              </li>
              <li>
                <b>۰۳</b>
                <span>مسیر و محدودهٔ همکاری را مشخص می‌کنیم.</span>
              </li>
            </ol>
          </div>
          <CircleMark size={66} />
          <span className="site-latin" dir="ltr">
            A CONVERSATION. A BEGINNING.
          </span>
        </aside>
        <div className="site-contact__form">
          {state.succeeded ? (
            <div className="site-form-success" role="status">
              <span className="site-form-success__icon">
                <Check size={38} />
              </span>
              <h2>پیام شما به دایره رسید.</h2>
              <p>
                ممنون که از پروژه‌تان گفتید. برای ادامهٔ گفت‌وگو، از طریق ایمیلی
                که ثبت کردید با شما در ارتباط خواهیم بود.
              </p>
              <Link className="site-button" to="/portfolio">
                تا آن موقع، کارهای ما را ببینید
                <ArrowLeft size={18} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} aria-label="فرم درخواست پروژه">
              <div className="site-form-heading">
                <span className="site-section-number">شروع همکاری</span>
                <h2>چه چیزی در ذهن دارید؟</h2>
                <p>فیلدهای دارای * را تکمیل کنید.</p>
              </div>
              <div className="site-form-row">
                <div className="site-field">
                  <label htmlFor="contact-name">
                    نام شما <span>*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    placeholder="نام و نام خانوادگی"
                    required
                    maxLength={150}
                    aria-describedby="contact-name-error"
                    aria-invalid={Boolean(
                      state.errors?.getFieldErrors("name").length,
                    )}
                  />
                  <div id="contact-name-error">{fieldMessage("name")}</div>
                </div>
                <div className="site-field">
                  <label htmlFor="contact-email">
                    ایمیل <span>*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    dir="ltr"
                    placeholder="you@company.com"
                    required
                    maxLength={254}
                    aria-describedby="contact-email-error"
                    aria-invalid={Boolean(
                      state.errors?.getFieldErrors("email").length,
                    )}
                  />
                  <div id="contact-email-error">{fieldMessage("email")}</div>
                </div>
              </div>
              <div className="site-form-row">
                <div className="site-field">
                  <label htmlFor="contact-company">
                    نام کسب‌وکار <small>اختیاری</small>
                  </label>
                  <input
                    id="contact-company"
                    name="company"
                    autoComplete="organization"
                    placeholder="کسب‌وکار یا تیم شما"
                    maxLength={150}
                  />
                </div>
                <div className="site-field">
                  <label htmlFor="contact-service">
                    موضوع گفت‌وگو <small>اختیاری</small>
                  </label>
                  <select
                    id="contact-service"
                    name="service"
                    defaultValue={initialTopic}
                  >
                    {topics.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="site-field">
                <label htmlFor="contact-message">
                  دربارهٔ نیازتان بنویسید <span>*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  maxLength={10000}
                  placeholder="چه چیزی می‌خواهید بسازید یا کدام بخش از کارتان را بهتر کنید؟"
                  aria-describedby="contact-message-error"
                  aria-invalid={Boolean(
                    state.errors?.getFieldErrors("message").length,
                  )}
                />
                <div id="contact-message-error">{fieldMessage("message")}</div>
              </div>
              <p className="site-form-privacy">
                اطلاعات این فرم برای پیگیری درخواست شما استفاده می‌شود.{" "}
                <Link to="/privacy">حریم خصوصی</Link>
              </p>
              {state.errors && (
                <div className="site-form-error" role="alert">
                  <p>
                    ارسال پیام انجام نشد. اطلاعات فرم را بررسی کنید یا دوباره
                    تلاش کنید؛ می‌توانید از نشانی ایمیل هم با ما در ارتباط
                    باشید.
                  </p>
                </div>
              )}
              <button
                className="site-button"
                type="submit"
                disabled={state.submitting}
              >
                {state.submitting
                  ? "در حال ارسال پیام…"
                  : "ارسال پیام به دایره"}
                <ArrowUpLeft size={19} />
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

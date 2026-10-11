import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CircleMark,
  CircleLogo,
  WebsiteCredit,
  SplashScreen,
  AboutCredit,
  SidebarCredit,
  CircleButton,
  CircleInput,
  CircleBadge,
  circleColors,
} from "./index";
import "./guide.css";

function BrandGuide() {
  const [dark, setDark] = useState(false);
  const [copied, setCopied] = useState("");
  const [copyError, setCopyError] = useState(false);
  const [name, setName] = useState("");
  const palette = [
    ["سبز نفتی", "PETROL", circleColors.petrol, "رنگ اصلی، متن و سطح تیره"],
    ["کاغذی گرم", "IVORY", circleColors.ivory, "زمینهٔ اصلی و متن روی نفتی"],
    ["مسی مات", "COPPER", circleColors.copper, "جزئیات تزئینی، حدود ۵٪"],
  ];
  async function copy(hex: string) {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <main className="circle-system guide">
      <header className="guide-header">
        <CircleLogo size="sm" />
        <span dir="ltr" className="guide-eyebrow">
          CIRCLE / BRAND SYSTEM 01
        </span>
      </header>
      <section className="guide-cover">
        <div>
          <span className="guide-eyebrow">هویت دایره · نشان منتخب</span>
          <h1>
            اجزا را به یک
            <br />
            سیستم تبدیل می‌کنیم.
          </h1>
          <p>
            یک نشان، یک زبان بصری؛ برای دایره و تمام وب‌سایت‌ها و نرم‌افزارهایی
            که می‌سازیم.
          </p>
          <div className="guide-chips">
            <span>نفتی</span>
            <span>کاغذی گرم</span>
            <span>مسی</span>
          </div>
        </div>
        <div className="guide-cover-mark">
          <CircleMark theme="dark" size={280} label="نشان دایره" />
        </div>
      </section>

      <section className="guide-section">
        <div className="guide-section-title">
          <span>۰۱ / نشان و امضا</span>
          <h2>یک جهان، یک هویت منسجم.</h2>
        </div>
        <p className="guide-intro">
          فرم گرد با دو فضای داخلی از تایپوگرافی فارسی الهام می‌گیرد. دایره
          اشاره‌ای به یکپارچگی است؛ ساختار درونی، ارتباط اجزای یک سیستم را نشان
          می‌دهد. نام فارسی محور امضاست؛ نشان همیشه با همین جهت و یک رنگ استفاده
          می‌شود.
        </p>
        <div className="guide-two">
          <div
            className={`guide-logo-stage ${dark ? "guide-dark" : "guide-light"}`}
          >
            <CircleLogo
              theme={dark ? "dark" : "light"}
              size="lg"
              orientation="stacked"
            />
            <button
              className="guide-theme"
              onClick={() => setDark(!dark)}
              aria-pressed={dark}
            >
              نمایش {dark ? "روشن" : "تیره"}
            </button>
          </div>
          <div className="guide-logo-stage guide-dark">
            <CircleLogo
              theme="dark"
              size="lg"
              tagline="وب، نرم‌افزار و هوش مصنوعی"
            />
          </div>
        </div>
        <div className="guide-size-row">
          <span>اندازه‌های کاربردی</span>
          {[16, 24, 32, 48, 72].map((size) => (
            <div key={size}>
              <CircleMark size={size} />
              <small dir="ltr">{size}px</small>
            </div>
          ))}
        </div>
        <div className="guide-rules">
          <p>
            <strong>حریم نشان:</strong> حداقل یک‌چهارم عرض آن از عناصر اطراف
            فاصله داشته باشد.
          </p>
          <p>
            <strong>حداقل اندازه:</strong> نشان ۱۶px؛ نام و امضای کامل از ۲۸px
            برای نشان.
          </p>
          <p>
            <strong>فرم ثابت:</strong> کشیده، آینه‌ای، چرخان یا چندرنگ نشود.
            برای کاربرد تک‌رنگ، سیاه یا سفید مجاز است.
          </p>
        </div>
      </section>

      <section className="guide-section">
        <div className="guide-section-title">
          <span>۰۲ / رنگ‌ها</span>
          <h2>زمینهٔ آرام. تأکید دقیق.</h2>
        </div>
        <div className="guide-palette">
          {palette.map(([fa, en, hex, role], index) => (
            <button
              key={hex}
              onClick={() => copy(hex)}
              className="guide-swatch"
              aria-label={`کپی رنگ ${fa}: ${hex}`}
            >
              <span
                className="guide-swatch-color"
                style={{
                  background: hex,
                  color:
                    index === 0
                      ? circleColors.ivory
                      : index === 2
                        ? "#000000"
                        : circleColors.petrol,
                }}
              >
                <strong>{fa}</strong>
                <span dir="ltr">{en}</span>
              </span>
              <span className="guide-swatch-info">
                <b dir="ltr">{hex}</b>
                <small>{role}</small>
                <small>{copied === hex ? "کپی شد" : "کپی کد رنگ"}</small>
              </span>
            </button>
          ))}
        </div>
        <p role="status" className="guide-copy-status">
          {copyError
            ? "کپی خودکار در این مرورگر در دسترس نیست؛ کد رنگ را انتخاب و کپی کنید."
            : copied
              ? `${copied} کپی شد.`
              : "برای کپی کد، روی رنگ کلیک کنید."}
        </p>
        <div className="guide-ratio">
          <span style={{ flex: 65, background: circleColors.ivory }}>
            ۶۵٪ کاغذی
          </span>
          <span
            style={{
              flex: 30,
              background: circleColors.petrol,
              color: circleColors.ivory,
            }}
          >
            ۳۰٪ نفتی
          </span>
          <span
            style={{
              flex: 5,
              background: circleColors.copper,
              color: "#000000",
            }}
          >
            ۵٪ مسی
          </span>
        </div>
        <div className="guide-rules">
          <p>
            <strong>متن نفتی روی کاغذی گرم:</strong> کنتراست 10.69:1
          </p>
          <p>
            <strong>متن کاغذی روی نفتی:</strong> کنتراست 10.69:1
          </p>
          <p>
            <strong>مسی:</strong> برای تزئین؛ متن ریز سفید روی این رنگ استفاده
            نشود.
          </p>
        </div>
      </section>

      <section className="guide-section">
        <div className="guide-section-title">
          <span>۰۳ / تایپوگرافی و ساختار</span>
          <h2>خوانا، فارسی، منظم.</h2>
        </div>
        <div className="guide-two">
          <div className="circle-card guide-type">
            <span className="guide-eyebrow">VAZIRMATN / فارسی و لاتین</span>
            <h3>فناوری نزدیک‌تر به کسب‌وکار شما</h3>
            <p>
              متن بدنه ۱۶px، فاصلهٔ خط ۱٫۸؛ تیترها ۳۲ تا ۴۸px با وزن ۷۰۰. فاصلهٔ
              حروف فارسی تغییر نمی‌کند.
            </p>
            <small dir="ltr">Circle / Software / Web Design / Applied AI</small>
          </div>
          <div className="circle-card">
            <h3>مقیاس و فاصله</h3>
            <p dir="ltr" className="guide-token-line">
              4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96
            </p>
            <p>
              کنترل‌ها حداقل ۴۴px · گوشهٔ کنترل ۸px · کارت ۱۶px · خط مرزی ۱px
            </p>
            <p>بدنه ۱۶ · توضیح ۱۲ · متن برجسته ۲۰ · تیتر ۳۲ · تیتر اصلی ۴۸</p>
            <p>
              حرکت کوتاه ۱۶۰ تا ۳۲۰ms؛ بدون چرخش دائمی نشان. تنظیم کاهش حرکت
              کاربر رعایت می‌شود.
            </p>
          </div>
        </div>
      </section>

      <section className="guide-section">
        <div className="guide-section-title">
          <span>۰۴ / اجزای رابط</span>
          <h2>قواعدی که در محصول هم کار می‌کنند.</h2>
        </div>
        <div className="guide-two">
          <div className="circle-card guide-primitives">
            <h3>عمل اصلی، عمل دوم، وضعیت غیرفعال</h3>
            <div className="guide-actions">
              <CircleButton>شروع پروژه</CircleButton>
              <CircleButton variant="secondary">مشاهده جزئیات</CircleButton>
              <CircleButton disabled>غیرفعال</CircleButton>
            </div>
            <CircleBadge>راهکار سفارشی</CircleBadge>
          </div>
          <div className="circle-card guide-primitives">
            <label htmlFor="guide-name">نام پروژه</label>
            <CircleInput
              id="guide-name"
              className="circle-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً سیستم مدیریت موجودی"
            />
            <small>فوکوس واضح؛ وضعیت خطا با پیام متنی توضیح داده شود.</small>
            <label htmlFor="guide-invalid">نمونهٔ خطا</label>
            <CircleInput
              id="guide-invalid"
              className="circle-input"
              aria-invalid="true"
              aria-describedby="guide-error"
              defaultValue=""
            />
            <small id="guide-error" className="guide-error">
              نام پروژه را وارد کنید.
            </small>
          </div>
        </div>
      </section>

      <section className="guide-section">
        <div className="guide-section-title">
          <span>۰۵ / امضای وب‌سایت مشتری</span>
          <h2>اعتبار کوچک، هویت روشن.</h2>
        </div>
        <div className="guide-two">
          <div className="guide-sign-stage guide-light">
            <WebsiteCredit />
          </div>
          <div className="guide-sign-stage guide-dark">
            <WebsiteCredit variant="footer-dark" />
          </div>
        </div>
        <div className="guide-sign-stage guide-light">
          <WebsiteCredit variant="floating" />
        </div>
        <p className="guide-intro">
          امضا در فوتر و پس از محتوای مشتری قرار می‌گیرد. نسخهٔ کپسولی فقط در
          صورت نیاز؛ به‌صورت پیش‌فرض شناور یا ثابت روی صفحه نیست.
        </p>
      </section>

      <section className="guide-section">
        <div className="guide-section-title">
          <span>۰۶ / امضای نرم‌افزار</span>
          <h2>از شروع برنامه تا بخش درباره.</h2>
        </div>
        <div className="guide-two">
          <SplashScreen showLoadingDots />
          <div className="guide-software-stack">
            <AboutCredit version="1.0.0" />
            <AboutCredit theme="dark" version="1.0.0" />
            <div className="guide-dark">
              <SidebarCredit />
            </div>
            <div className="guide-light">
              <SidebarCredit theme="light" />
            </div>
          </div>
        </div>
        <p className="guide-intro">
          لوگوی اصلی محصول مشتری جایگاه خود را حفظ می‌کند؛ امضای دایره در
          «درباره»، تنظیمات یا پایین سایدبار قرار می‌گیرد. صفحهٔ شروع فقط زمانی
          نمایش داده شود که بارگذاری واقعی وجود دارد.
        </p>
      </section>
      <footer className="guide-footer">
        <CircleLogo size="sm" />
        <span dir="ltr">circlegroup.ir / Circle · v1</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<BrandGuide />);

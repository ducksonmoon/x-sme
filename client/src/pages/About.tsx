import React from "react";
import { CircleMark } from "@/brand/circle";
import {
  PageMeta,
  PageIntro,
  Eyebrow,
  SectionHeading,
  TextLink,
} from "@/components/site/Elements";
import { faNumber, projectNames } from "@/data/identity";
import { portfolio } from "@/data/site";

const values = [
  {
    title: "مسئله، پیش از ابزار.",
    text: "پیش از انتخاب فناوری، نیاز کسب‌وکار را می‌فهمیم. راهکار خوب باید استفادهٔ روزمره را بهتر کند.",
  },
  {
    title: "طراحی و مهندسی، کنار هم.",
    text: "تجربهٔ خوب از پیوند ظاهر، عملکرد و معماری ساخته می‌شود. این تصمیم‌ها را جدا از هم نمی‌گیریم.",
  },
  {
    title: "ارتباط روشن.",
    text: "محدوده، مراحل و تصمیم‌های پروژه را با شما مرور می‌کنیم تا همیشه بدانید کجا هستیم و قدم بعدی چیست.",
  },
  {
    title: "ساختن برای ادامه.",
    text: "کد قابل نگهداری، تحویل روشن و توجه به مسیر رشد؛ نرم‌افزار باید بتواند با کسب‌وکار شما پیش برود.",
  },
];

export default function About() {
  return (
    <>
      <PageMeta
        title="دربارهٔ دایره"
        description="داستان نام دایره و نگاه ما به ساخت نرم‌افزار؛ یک تیم طراحی و توسعه با تمرکز بر ارتباط اجزای کسب‌وکار و ساخت یک سیستم منسجم."
      />
      <PageIntro
        label="دربارهٔ دایره"
        english="THE IDEA BEHIND CIRCLE"
        title={
          <>
            همه‌چیز،
            <br />
            به هم مربوط است.
          </>
        }
        description="ما یک تیم طراحی و توسعهٔ نرم‌افزاریم. وب‌سایت، محصول دیجیتال و ابزارهای هوشمند می‌سازیم؛ با این باور که هر جزء باید جای درستی در کل داشته باشد."
      />
      <section className="site-about-story">
        <div className="site-container">
          <div className="site-about-story__visual">
            <div className="site-about-story__ring" />
            <CircleMark theme="dark" size={240} />
            <span dir="ltr">THE WORLD IS CONNECTED.</span>
          </div>
          <div className="site-about-story__copy">
            <Eyebrow>از یک علاقهٔ شخصی، تا یک نگاه مشترک</Eyebrow>
            <h2>
              چرا اسم ما
              <br />
              دایره است؟
            </h2>
            <p>
              دایره از علاقه به فرم‌های گرد آمده است؛ فرم‌هایی که از زمین تا
              بسیاری از چیزهای بنیادی پیرامون ما دیده می‌شوند. یک فرم ساده که حس
              پیوستگی و کامل‌بودن را منتقل می‌کند.
            </p>
            <p>
              این نگاه، برای ما به یک شیوهٔ کار تبدیل شده: دیدن ارتباط میان
              اجزا. نرم‌افزار فقط مجموعه‌ای از صفحه‌ها و قابلیت‌ها نیست؛ باید
              میان آدم‌ها، داده‌ها و فرآیندها نظم ایجاد کند.
            </p>
            <p className="site-about-story__statement">
              اجزا را به یک سیستم تبدیل می‌کنیم.
            </p>
          </div>
        </div>
      </section>
      <section className="site-container site-section">
        <SectionHeading number="نگاه ما" title="چهار اصل، یک روش کار." />
        <div className="site-values">
          {values.map((value, i) => (
            <article key={value.title}>
              <span className="site-section-number">{faNumber(i + 1)}</span>
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="site-container site-about-signature">
        <div>
          <Eyebrow>نشان دایره</Eyebrow>
          <h2>
            یک فرم گرد.
            <br />
            دو فضای درون.
            <br />
            یک هویت فارسی.
          </h2>
        </div>
        <div className="site-about-signature__drawing">
          <CircleMark size={190} />
          <div className="site-about-signature__rule" />
          <span>ه</span>
        </div>
        <div>
          <p>
            نشان ما از حرف «ه» در نام دایره الهام می‌گیرد. ساختار درونی و فرم
            بیرونی، دو وجه یک ایده‌اند: اجزایی متفاوت که در کنار هم یک هویت
            منسجم می‌سازند.
          </p>
          <p>
            نام فارسی محور هویت ماست؛ نفتی، کاغذی گرم و مسی، لحن آرام و دقیق آن
            را ادامه می‌دهند.
          </p>
        </div>
      </section>
      <section className="site-method site-section">
        <div className="site-container site-about-work">
          <div>
            <Eyebrow english="BUILT TOGETHER">در عمل</Eyebrow>
            <h2>
              نگاهی که در
              <br />
              کارهایمان دیده می‌شود.
            </h2>
            <p>
              از وب‌سایت شرکتی تا اپلیکیشن و نرم‌افزار اختصاصی؛ مسئله‌ها
              متفاوت‌اند، همراهی و دقت مشترک است.
            </p>
            <TextLink to="/portfolio">کشف پروژه‌ها</TextLink>
          </div>
          <div>
            {portfolio.map((item) => (
              <div key={item.slug}>
                <span>{projectNames[item.slug]}</span>
                <span>{item.tags.join(" / ")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

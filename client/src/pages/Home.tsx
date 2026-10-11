import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpLeft, Check } from "lucide-react";
import { CircleMark } from "@/brand/circle";
import { portfolio, services } from "@/data/site";
import { products, process, serviceNotes } from "@/data/identity";
import {
  Eyebrow,
  SectionHeading,
  TextLink,
  ProjectCard,
  PageMeta,
} from "@/components/site/Elements";
import SystemOrbit from "@/components/site/SystemOrbit";

export default function Home() {
  return (
    <>
      <PageMeta
        title="اجزا را به یک سیستم تبدیل می‌کنیم"
        description="دایره، شرکت طراحی و توسعهٔ نرم‌افزار، وب‌سایت، اپلیکیشن و راهکارهای هوش مصنوعی؛ یک مسیر منسجم از شناخت مسئله تا ساخت محصول."
      />
      <section className="site-container site-hero">
        <div className="site-hero__copy">
          <Eyebrow english="CIRCLE SOFTWARE COMPANY">
            شرکت نرم‌افزاری دایره
          </Eyebrow>
          <h1>
            اجزا را به یک
            <br />
            <span className="site-hero__emphasis">سیستم</span> تبدیل
            <br />
            می‌کنیم.
          </h1>
          <p className="site-lead">
            کسب‌وکار شما مجموعه‌ای از آدم‌ها، داده‌ها و ایده‌هاست. ما نرم‌افزاری
            می‌سازیم که این اجزا را به هم وصل کند.
          </p>
          <div className="site-actions">
            <Link className="site-button" to="/contact">
              از پروژه‌تان بگویید
              <ArrowUpLeft size={19} aria-hidden="true" />
            </Link>
            <TextLink to="/portfolio">کارهای دایره</TextLink>
          </div>
          <div className="site-hero__note">
            <span className="site-tiny-ring" />
            از شناخت مسئله تا ساخت و همراهی
          </div>
        </div>
        <SystemOrbit />
      </section>
      <section
        className="site-trust site-container"
        aria-label="پروژه‌های دایره"
      >
        <span>بخشی از دایرهٔ همکاری ما</span>
        <div>
          {portfolio.map((item) => (
            <Link key={item.slug} to={`/portfolio/${item.slug}`} dir="ltr">
              {item.name}
            </Link>
          ))}
        </div>
      </section>
      <section className="site-section site-container" id="work">
        <SectionHeading
          number="۰۱"
          title={
            <>
              هر مسئله،
              <br />
              یک دایرهٔ تازه.
            </>
          }
          description="پروژه‌های متفاوت، با یک نگاه مشترک: ساختن چیزی که در عمل کار کند."
        >
          <TextLink to="/portfolio">همهٔ کارهای ما</TextLink>
        </SectionHeading>
        <div className="site-selected-work">
          <ProjectCard item={portfolio[0]} featured />
          <ProjectCard item={portfolio[4]} />
          <ProjectCard item={portfolio[1]} />
        </div>
        <p className="site-art-caption">
          تصویرها، نمایش مفهومی حوزهٔ هر پروژه‌اند.
        </p>
      </section>
      <section className="site-capabilities" id="services">
        <div className="site-container">
          <SectionHeading
            number="۰۲"
            title={
              <>
                یک نگاه منسجم.
                <br />
                چند راه برای ساختن.
              </>
            }
            description="گاهی یک وب‌سایت کافی است؛ گاهی باید ابزارهای پراکندهٔ یک کسب‌وکار به هم متصل شوند."
          >
            <TextLink to="/services" light>
              راهکارهای دایره
            </TextLink>
          </SectionHeading>
          <div className="site-service-list">
            {services.map((service, index) => (
              <Link
                to={`/services#${service.slug}`}
                className="site-service-line"
                key={service.slug}
              >
                <span className="site-service-line__number">
                  {(index + 1).toLocaleString("fa-IR", {
                    minimumIntegerDigits: 2,
                  })}
                </span>
                <div className="site-service-line__title">
                  <service.icon size={24} aria-hidden="true" />
                  <h3>{service.title}</h3>
                  <span dir="ltr">{serviceNotes[service.slug].english}</span>
                </div>
                <p>{serviceNotes[service.slug].outcome}</p>
                <span className="site-arrow-circle">
                  <ArrowUpLeft size={25} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="site-section site-container" id="products">
        <SectionHeading
          number="۰۳"
          title="برای کارهای هر روز."
          description="محصولات آمادهٔ دایره برای نظم‌دادن به جریان‌های تکرارشوندهٔ کسب‌وکار."
        />
        <div className="site-products">
          {products.map((product) => (
            <article
              className={`site-product site-product--${product.id}`}
              key={product.id}
            >
              <div className="site-product__top">
                <span dir="ltr">{product.english}</span>
                <span>{product.number}</span>
              </div>
              <div className="site-product__symbol" aria-hidden="true">
                {product.id === "inventory" ? (
                  <>
                    <i />
                    <i />
                    <i />
                  </>
                ) : (
                  <>
                    <span />
                    <Check size={48} />
                  </>
                )}
              </div>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <ul>
                {product.features.map((feature) => (
                  <li key={feature}>
                    <Check size={15} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                className="site-text-link"
                to={`/contact?service=${product.id}`}
              >
                درخواست دمو
                <ArrowUpLeft size={19} />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="site-method site-section">
        <div className="site-container">
          <SectionHeading
            number="۰۴"
            title={
              <>
                کار خوب،
                <br />
                از ارتباط خوب شروع می‌شود.
              </>
            }
            description="فرآیندی روشن، تصمیم‌هایی قابل بررسی و ارتباطی که در طول ساخت ادامه دارد."
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
      <section className="site-container site-brand-story">
        <div className="site-brand-story__mark">
          <CircleMark size={160} />
          <span dir="ltr">ONE CIRCLE. MANY POSSIBILITIES.</span>
        </div>
        <div>
          <Eyebrow>چرا دایره؟</Eyebrow>
          <h2>
            جهان، از ارتباط
            <br />
            اجزایش معنا می‌گیرد.
          </h2>
          <p>
            نام دایره از علاقه به فرم‌های گرد آمده؛ از زمین تا چرخه‌هایی که
            زندگی را می‌سازند. در کار ما هم همین نگاه جاری است: نرم‌افزار خوب،
            اجزای یک کسب‌وکار را به یک کلِ قابل‌فهم تبدیل می‌کند.
          </p>
          <TextLink to="/about">با دایره آشنا شوید</TextLink>
        </div>
      </section>
    </>
  );
}

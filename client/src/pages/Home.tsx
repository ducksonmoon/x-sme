import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpLeft, Check } from "lucide-react";
import { CircleMark } from "@/brand/circle";
import { portfolio, services } from "@/data/site";
import { products } from "@/data/identity";
import {
  homepageCapabilities,
  engineeringPrinciples,
  deliveryStages,
} from "@/data/homepage";
import {
  Eyebrow,
  SectionHeading,
  TextLink,
  ProjectCard,
  PageMeta,
} from "@/components/site/Elements";
import SystemOrbit from "@/components/site/SystemOrbit";
import OperationalApplications from "@/components/site/OperationalApplications";
import "@/styles/home.css";

const selectedProjects = ["fbc", "zarandooz", "nipou"].flatMap((slug) =>
  portfolio.filter((project) => project.slug === slug),
);

export default function Home() {
  return (
    <>
      <PageMeta
        title="نرم‌افزار برای عملیات امروز، رشد فردا"
        description="دایره؛ طراحی و توسعهٔ نرم‌افزار سازمانی، API، وب‌سایت و محصول دیجیتال. از شناخت فرآیندهای کسب‌وکار تا توسعه، آزمون و استقرار."
      />
      <section className="site-container site-hero home-hero">
        <div className="site-hero__copy">
          <Eyebrow english="CIRCLE SOFTWARE COMPANY">
            شرکت نرم‌افزاری دایره
          </Eyebrow>
          <h1>
            نرم‌افزار برای
            <br />
            <span className="site-hero__emphasis">عملیات</span> امروز،
            <br />
            رشد فردا.
          </h1>
          <p className="site-lead">
            از نرم‌افزارهای سازمانی و اتصال سیستم‌ها تا وب‌سایت و محصول دیجیتال؛
            راهکارهایی متناسب با فرآیندهای واقعی کسب‌وکار شما طراحی و توسعه
            می‌دهیم.
          </p>
          <div className="site-actions">
            <Link className="site-button" to="/contact">
              بررسی نیاز کسب‌وکار
              <ArrowUpLeft size={19} aria-hidden="true" />
            </Link>
            <TextLink to="/portfolio">مشاهدهٔ پروژه‌ها</TextLink>
          </div>
          <div className="site-hero__note">
            <span className="site-tiny-ring" aria-hidden="true" />
            اجزا را به یک سیستم تبدیل می‌کنیم.
          </div>
        </div>
        <SystemOrbit />
      </section>
      <section
        className="site-trust site-container"
        aria-label="پروژه‌های دایره"
      >
        <span>تجربهٔ همکاری با</span>
        <div>
          {portfolio.map((item) => (
            <Link key={item.slug} to={`/portfolio/${item.slug}`} dir="ltr">
              {item.name}
            </Link>
          ))}
        </div>
      </section>
      <nav
        className="site-container home-section-nav"
        aria-label="بخش‌های صفحهٔ اصلی"
      >
        {[
          ["services", "توانمندی‌ها"],
          ["applications", "حوزه‌های کاربرد"],
          ["products", "محصولات"],
          ["work", "پروژه‌ها"],
          ["delivery", "روش همکاری"],
        ].map(([id, name], index) => (
          <Link key={id} to={`/#${id}`}>
            <span>
              {(index + 1).toLocaleString("fa-IR", { minimumIntegerDigits: 2 })}
            </span>
            {name}
            <ArrowUpLeft size={15} aria-hidden="true" />
          </Link>
        ))}
      </nav>
      <section
        className="site-capabilities home-capabilities"
        id="services"
        tabIndex={-1}
      >
        <div className="site-container">
          <SectionHeading
            number="۰۱"
            title="طراحی و توسعهٔ راهکارهای نرم‌افزاری"
            description="انتخاب ابزار از شناخت مسئله شروع می‌شود؛ نرم‌افزار اختصاصی، اتصال سیستم‌ها یا یک محصول دیجیتال جدید."
          >
            <TextLink to="/services" light>
              جزئیات خدمات
            </TextLink>
          </SectionHeading>
          <div className="site-service-list">
            {homepageCapabilities.map((capability, index) => {
              const Icon = services.find(
                (service) => service.slug === capability.slug,
              )!.icon;
              return (
                <Link
                  to={`/services#${capability.slug}`}
                  className="site-service-line"
                  key={capability.slug}
                >
                  <span className="site-service-line__number">
                    {(index + 1).toLocaleString("fa-IR", {
                      minimumIntegerDigits: 2,
                    })}
                  </span>
                  <div className="site-service-line__title">
                    <Icon size={24} aria-hidden="true" />
                    <h3>{capability.title}</h3>
                    <span dir="ltr">{capability.english}</span>
                  </div>
                  <p>{capability.text}</p>
                  <span className="site-arrow-circle">
                    <ArrowUpLeft size={25} aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <section
        className="site-section site-container"
        id="applications"
        tabIndex={-1}
      >
        <SectionHeading
          number="۰۲"
          title="نرم‌افزار، در متن عملیات شما"
          description="حوزه‌های کاربرد در تولید، توزیع و خدمات؛ فرآیند هر کسب‌وکار، نقطهٔ شروع طراحی راهکار است."
        />
        <OperationalApplications />
      </section>
      <section className="home-products-section" id="products" tabIndex={-1}>
        <div className="site-section site-container">
          <SectionHeading
            number="۰۳"
            title="محصولات برای فرآیندهای تکرارشونده"
            description="اگر نیاز شما با یک محصول آماده پاسخ می‌گیرد، از همان‌جا شروع می‌کنیم. امکان استفاده و محدودهٔ اتصال به سیستم‌های شما در گفت‌وگوی اولیه بررسی می‌شود."
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
                      <Check size={15} aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  className="site-text-link"
                  to={`/contact?service=${product.id}`}
                >
                  درخواست دمو
                  <ArrowUpLeft size={19} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="site-section site-container" id="work" tabIndex={-1}>
        <SectionHeading
          number="۰۴"
          title="تجربهٔ اجرا؛ از صنعت تا محصول دیجیتال"
          description="نرم‌افزار اختصاصی فولاد بهمن، اپلیکیشن و API زرندوز و وب‌سایت شرکتی نیپو؛ نمونه‌هایی از محدودهٔ کار دایره."
        >
          <TextLink to="/portfolio">همهٔ پروژه‌ها</TextLink>
        </SectionHeading>
        <div className="home-projects">
          {selectedProjects.map((item) => (
            <ProjectCard key={item.slug} item={item} />
          ))}
        </div>
        <p className="site-art-caption">
          تصویرها، نمایش مفهومی حوزهٔ هر پروژه‌اند.
        </p>
      </section>
      <section className="site-method site-section" id="delivery" tabIndex={-1}>
        <div className="site-container">
          <SectionHeading
            number="۰۵"
            title="از تحلیل نیاز تا استقرار"
            description="مراحل مشخص، خروجی قابل بررسی و محدودهٔ روشن برای تحویل و پشتیبانی؛ مسیر همکاری را پیش از شروع ساخت با شما تعریف می‌کنیم."
          >
            <TextLink to="/contact">شروع بررسی پروژه</TextLink>
          </SectionHeading>
          <div className="site-process">
            {deliveryStages.map((step) => (
              <article key={step.number}>
                <span className="site-process__number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <span className="site-process__output">{step.output}</span>
              </article>
            ))}
          </div>
          <div className="home-engineering">
            <div className="home-engineering__heading">
              <span className="site-tiny-ring" aria-hidden="true" />
              <h3>مبنای فنی همکاری</h3>
            </div>
            <div className="home-engineering__grid">
              {engineeringPrinciples.map((principle) => (
                <article key={principle.title}>
                  <principle.icon size={24} aria-hidden="true" />
                  <h4>{principle.title}</h4>
                  <p>{principle.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="site-container site-brand-story home-brand-story">
        <div className="site-brand-story__mark">
          <CircleMark size={140} />
          <span dir="ltr">CONNECTED BY DESIGN.</span>
        </div>
        <div>
          <Eyebrow>نگاه دایره به مهندسی نرم‌افزار</Eyebrow>
          <h2>یکپارچگی، از طراحی شروع می‌شود.</h2>
          <p>
            نام دایره از علاقه به فرم‌های گرد و جهانِ به‌هم‌پیوسته آمده است. این
            نگاه در کار ما به یک اصل تبدیل می‌شود: آدم‌ها، فرآیندها و داده‌ها را
            کنار هم می‌بینیم تا اجزای نرم‌افزار از یک منطق مشترک پیروی کنند.
          </p>
          <TextLink to="/about">دربارهٔ دایره</TextLink>
        </div>
      </section>
    </>
  );
}

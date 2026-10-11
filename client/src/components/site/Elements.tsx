import React from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowUpLeft } from "lucide-react";
import { CircleMark } from "@/brand/circle";
import { portfolio, type PortfolioItem } from "@/data/site";
import { projectNames } from "@/data/identity";

export function PageMeta({
  title,
  description,
  noIndex = false,
}: {
  title: string;
  description: string;
  noIndex?: boolean;
}) {
  const { pathname } = useLocation();
  const url = `https://circlegroup.ir${pathname === "/" ? "/" : pathname}`;
  return (
    <Helmet>
      <title>{title} | دایره</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={`${title} | دایره`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="twitter:title" content={`${title} | دایره`} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:url" content={url} />
      <meta
        name="robots"
        content={noIndex ? "noindex, follow" : "index, follow"}
      />
    </Helmet>
  );
}

export function Eyebrow({
  children,
  english,
}: {
  children: React.ReactNode;
  english?: string;
}) {
  return (
    <div className="site-eyebrow">
      <span className="site-dot" />
      <span>{children}</span>
      {english && (
        <span className="site-eyebrow__english" dir="ltr">
          {english}
        </span>
      )}
    </div>
  );
}

export function TextLink({
  to,
  children,
  light = false,
}: {
  to: string;
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <Link
      className={`site-text-link${light ? " site-text-link--light" : ""}`}
      to={to}
    >
      <span>{children}</span>
      <ArrowUpLeft size={19} aria-hidden="true" />
    </Link>
  );
}

export function SectionHeading({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="site-section-heading">
      <div>
        <span className="site-section-number">{number} /</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function PageIntro({
  label,
  english,
  title,
  description,
  children,
}: {
  label: string;
  english: string;
  title: React.ReactNode;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="site-page-intro site-container">
      <div>
        <Eyebrow english={english}>{label}</Eyebrow>
        <h1>{title}</h1>
        <p className="site-lead">{description}</p>
        {children}
      </div>
      <div className="site-intro-seal" aria-hidden="true">
        <span />
        <CircleMark size={94} />
        <span />
      </div>
    </section>
  );
}

/** Abstract diagrams of project scope, never presented as client screenshots. */
export function ProjectVisual({
  slug,
  large = false,
}: {
  slug: string;
  large?: boolean;
}) {
  const project = portfolio.find((item) => item.slug === slug);
  return (
    <div
      className={`project-art project-art--${slug}${large ? " project-art--large" : ""}`}
      aria-hidden="true"
    >
      <div className="project-art__orbit" />
      <div className="project-art__orbit project-art__orbit--second" />
      {slug === "zarandooz" ? (
        <>
          <div className="art-phone">
            <div className="art-phone__notch" />
            <span className="art-label">ZARANDOOZ</span>
            <div className="art-disc">
              <span />
              <span />
            </div>
            <div className="art-rule" />
            <div className="art-rule art-rule--short" />
            <div className="art-phone__grid">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="art-phone__button" />
          </div>
          <div className="art-chip art-chip--one">APP</div>
          <div className="art-chip art-chip--two">API</div>
          <div className="art-chip art-chip--three">WEB</div>
        </>
      ) : slug === "fbc" ? (
        <div className="art-dashboard">
          <div className="art-dashboard__sidebar">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="art-dashboard__main">
            <span className="art-label">FBC / SYSTEM</span>
            <div className="art-dashboard__stats">
              <i />
              <i />
              <i />
            </div>
            <div className="art-bars">
              {[42, 68, 48, 90, 61, 78, 96].map((height, i) => (
                <i key={i} style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="art-rule" />
            <div className="art-rule art-rule--short" />
          </div>
        </div>
      ) : (
        <div className="art-browser">
          <div className="art-browser__top">
            <div>
              <i />
              <i />
              <i />
            </div>
            <span>{project?.name.toUpperCase()}</span>
            <span />
          </div>
          <div className="art-browser__body">
            <div className="art-browser__nav">
              <span className="art-label">{project?.name.toUpperCase()}</span>
              <i />
              <i />
              <i />
            </div>
            <div className="art-browser__hero">
              <div>
                <div className="art-rule" />
                <div className="art-rule" />
                <div className="art-rule art-rule--short" />
                <div className="art-browser__button" />
              </div>
              <div className="art-browser__symbol">
                {slug === "jamnevisi" ? (
                  <>
                    <span />
                    <span />
                    <span />
                  </>
                ) : (
                  <div className="art-browser__sphere">
                    <i />
                    <i />
                    <i />
                  </div>
                )}
              </div>
            </div>
            <div className="art-browser__tiles">
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      )}
      <span className="project-art__index" dir="ltr">
        {slug === "zarandooz"
          ? "01"
          : slug === "nipou"
            ? "02"
            : slug === "tabeshraad"
              ? "03"
              : slug === "jamnevisi"
                ? "04"
                : "05"}{" "}
        / CIRCLE WORKS
      </span>
    </div>
  );
}

export function ProjectCard({
  item,
  featured = false,
}: {
  item: PortfolioItem;
  featured?: boolean;
}) {
  return (
    <Link
      to={`/portfolio/${item.slug}`}
      className={`site-project${featured ? " site-project--featured" : ""}`}
    >
      <ProjectVisual slug={item.slug} />
      <div className="site-project__body">
        <div>
          <span className="site-project__category">
            {item.tags.join(" / ")}
          </span>
          <h3>
            {projectNames[item.slug]} <span dir="ltr">{item.name}</span>
          </h3>
          <p>{item.description}</p>
        </div>
        <span className="site-arrow-circle">
          <ArrowUpLeft size={23} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: { title: string; body: string }[];
}) {
  return (
    <>
      <PageMeta title={title} description={intro} />
      <PageIntro
        label="اطلاعات وب‌سایت"
        english="THE DETAILS"
        title={title}
        description={intro}
      />
      <section className="site-container site-legal">
        <aside>
          <CircleMark size={48} />
          <p>
            یک همکاری خوب،
            <br />
            از شفافیت شروع می‌شود.
          </p>
          <TextLink to="/contact">گفت‌وگو با دایره</TextLink>
        </aside>
        <div>
          {sections.map((section, i) => (
            <article key={section.title}>
              <span className="site-section-number">
                {(i + 1).toLocaleString("fa-IR", { minimumIntegerDigits: 2 })}
              </span>
              <div>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export function SiteError({ server = false }: { server?: boolean }) {
  return (
    <section className="site-container site-error">
      <PageMeta
        title={server ? "خطا در نمایش صفحه" : "صفحه پیدا نشد"}
        description="برای ادامه به صفحهٔ اصلی دایره برگردید یا با ما در ارتباط باشید."
        noIndex
      />
      <div className="site-error__number" aria-hidden="true">
        <span>{server ? "۵" : "۴"}</span>
        <CircleMark size={140} />
        <span>{server ? "۰" : "۴"}</span>
      </div>
      <Eyebrow english={server ? "PLEASE TRY AGAIN" : "OUTSIDE THE CIRCLE"}>
        {server ? "یک وقفهٔ کوتاه" : "این مسیر به جایی نمی‌رسد"}
      </Eyebrow>
      <h1>
        {server
          ? "نمایش این صفحه با مشکل روبه‌رو شد."
          : "بیایید به دایره برگردیم."}
      </h1>
      <p>
        {server
          ? "می‌توانید صفحه را دوباره بارگذاری کنید. اگر مشکل ادامه داشت، از طریق صفحهٔ تماس برایمان بنویسید."
          : "ممکن است نشانی تغییر کرده باشد یا صفحه‌ای در این مسیر وجود نداشته باشد."}
      </p>
      <div className="site-actions">
        <Link to="/" className="site-button">
          صفحهٔ اصلی
          <ArrowLeft size={18} />
        </Link>
        {server ? (
          <button
            className="site-button site-button--outline"
            onClick={() => window.location.reload()}
          >
            تلاش دوباره
          </button>
        ) : (
          <TextLink to="/portfolio">دیدن کارهای دایره</TextLink>
        )}
      </div>
    </section>
  );
}

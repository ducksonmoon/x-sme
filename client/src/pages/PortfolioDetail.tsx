import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, ArrowUpLeft, ExternalLink } from "lucide-react";
import { portfolio } from "@/data/site";
import { projectNames, faNumber } from "@/data/identity";
import {
  PageMeta,
  Eyebrow,
  ProjectVisual,
  ProjectCard,
} from "@/components/site/Elements";
import NotFound from "./NotFound";

export default function PortfolioDetail() {
  const { slug } = useParams<{ slug: string }>();
  const index = portfolio.findIndex((item) => item.slug === slug);
  const item = portfolio[index];
  if (!item) return <NotFound />;
  const next = portfolio[(index + 1) % portfolio.length];
  return (
    <>
      <PageMeta
        title={`پروژهٔ ${projectNames[item.slug]}`}
        description={item.about}
      />
      <section className="site-container site-project-intro">
        <Link className="site-back" to="/portfolio">
          <ArrowRight size={18} />
          همهٔ کارهای دایره
        </Link>
        <div className="site-project-intro__heading">
          <div>
            <Eyebrow
              english={`CIRCLE WORKS / ${String(index + 1).padStart(2, "0")}`}
            >
              پروژهٔ {faNumber(index + 1)}
            </Eyebrow>
            <h1>
              {projectNames[item.slug]}
              <span dir="ltr">{item.name}</span>
            </h1>
          </div>
          <div>
            <p>{item.about}</p>
            <a
              className="site-text-link"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              بازدید از وب‌سایت
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
        <ProjectVisual slug={item.slug} large />
        <p className="site-art-caption">نمای مفهومی حوزهٔ پروژه</p>
      </section>
      <section className="site-container site-project-scope">
        <div>
          <span className="site-section-number">آنچه ساختیم</span>
          <h2>
            یک نیاز مشخص،
            <br />
            یک همراهی فنی.
          </h2>
        </div>
        <div>
          <p>{item.about}</p>
          <dl>
            <div>
              <dt>مجموعه</dt>
              <dd>{projectNames[item.slug]}</dd>
            </div>
            <div>
              <dt>حوزهٔ همکاری</dt>
              <dd>{item.tags.join("، ")}</dd>
            </div>
            <div>
              <dt>تیم طراحی و توسعه</dt>
              <dd>دایره</dd>
            </div>
          </dl>
          <Link className="site-button" to="/contact">
            پروژهٔ مشابهی دارید؟
            <ArrowUpLeft size={19} />
          </Link>
        </div>
      </section>
      <section className="site-container site-next-work">
        <div>
          <span className="site-section-number">دایرهٔ بعدی</span>
          <h2>یک پروژهٔ دیگر.</h2>
        </div>
        <ProjectCard item={next} />
      </section>
    </>
  );
}

import React, { useState } from "react";
import { portfolio } from "@/data/site";
import { PageMeta, PageIntro, ProjectCard } from "@/components/site/Elements";

const filters = ["همهٔ کارها", "وب‌سایت", "نرم‌افزار", "اپلیکیشن"];
export default function Portfolio() {
  const [filter, setFilter] = useState(filters[0]);
  const items =
    filter === filters[0]
      ? portfolio
      : portfolio.filter((item) => item.tags.includes(filter));
  return (
    <>
      <PageMeta
        title="کارهای دایره"
        description="پروژه‌های طراحی و توسعهٔ دایره برای زرندوز، نیپو، تابش‌رعد، جمع‌نویسی و فولاد بهمن؛ وب‌سایت، اپلیکیشن، API و نرم‌افزار اختصاصی."
      />
      <PageIntro
        label="کارهای دایره"
        english="SELECTED WORKS"
        title={
          <>
            مسئله‌های متفاوت.
            <br />
            یک امضای مشترک.
          </>
        }
        description="بخشی از چیزهایی که همراه کسب‌وکارها ساخته‌ایم؛ هر پروژه، پاسخی به نیاز همان مجموعه."
      />
      <section className="site-container site-portfolio">
        <div className="site-filter-row">
          <div
            className="site-filters"
            role="group"
            aria-label="فیلتر پروژه‌ها"
          >
            {filters.map((item) => (
              <button
                type="button"
                key={item}
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <span className="site-filter-count" role="status">
            {items.length.toLocaleString("fa-IR")} پروژه
          </span>
        </div>
        <div className="site-portfolio-grid">
          {items.map((item) => (
            <ProjectCard key={item.slug} item={item} />
          ))}
        </div>
        <p className="site-art-caption">
          تصویرها نمایش مفهومی حوزهٔ پروژه‌اند و اسکرین‌شات محصول نهایی نیستند.
        </p>
      </section>
    </>
  );
}

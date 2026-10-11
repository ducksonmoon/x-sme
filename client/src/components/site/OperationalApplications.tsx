import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpLeft, Check } from "lucide-react";
import { CircleMark } from "@/brand/circle";
import { operationalApplications } from "@/data/homepage";

export default function OperationalApplications() {
  const [selected, setSelected] = useState(0);
  const application = operationalApplications[selected];

  return (
    <div className="home-applications">
      <div
        className="home-application-picker"
        role="group"
        aria-label="حوزهٔ کاربرد نرم‌افزار"
      >
        {operationalApplications.map((item, index) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={selected === index}
            aria-controls="application-details"
            onClick={() => setSelected(index)}
          >
            <item.icon size={22} aria-hidden="true" />
            <span>{item.name}</span>
            <ArrowUpLeft size={17} aria-hidden="true" />
          </button>
        ))}
        <p>راهکار از شناخت فرآیند شما شروع می‌شود.</p>
      </div>
      <div className="home-application-panel" id="application-details">
        <div
          className="home-application-copy"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="home-application-label" dir="ltr">
            {application.english}
          </span>
          <h3>{application.title}</h3>
          <dl>
            <div>
              <dt>مسئلهٔ عملیاتی</dt>
              <dd>{application.problem}</dd>
            </div>
            <div>
              <dt>مسیر راهکار</dt>
              <dd>{application.approach}</dd>
            </div>
          </dl>
          <ul
            className="home-application-modules"
            aria-label="قابلیت‌های پیشنهادی"
          >
            {application.modules.map((module) => (
              <li key={module}>
                <Check size={14} aria-hidden="true" />
                {module}
              </li>
            ))}
          </ul>
        </div>
        <div className="home-application-diagram" aria-hidden="true">
          <span className="home-application-diagram__title">
            اجزا، در یک جریان
          </span>
          <ol className="home-operation-flow">
            {application.flow.map((step, index) => (
              <li key={step.name}>
                <span className="home-operation-flow__node">
                  <step.icon size={24} />
                </span>
                <span className="home-operation-flow__name">{step.name}</span>
                <span className="home-operation-flow__number" dir="ltr">
                  0{index + 1}
                </span>
              </li>
            ))}
          </ol>
          <div className="home-application-result">
            <CircleMark size={34} />
            <span>{application.result}</span>
          </div>
          <span className="home-application-diagram__caption">
            نمای مفهومی جریان کار
          </span>
        </div>
        <div className="home-application-footer">
          <span>
            محدودهٔ اجرا بر اساس نیاز و ابزارهای موجود شما تعریف می‌شود.
          </span>
          <Link
            className="site-text-link"
            to={`/contact?service=${application.topic}`}
          >
            بررسی نیاز این حوزه
            <ArrowUpLeft size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}

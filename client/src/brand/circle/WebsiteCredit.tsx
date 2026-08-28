import React from "react";
import CircleMark from "./CircleMark";

export type WebsiteCreditVariant = "footer-light" | "footer-dark" | "floating";

interface WebsiteCreditProps {
  /** "footer-light"/"footer-dark" are inline text credits for a page footer;
   * "floating" is a self-contained dark pill for a page corner, readable
   * regardless of the host site's own color scheme. */
  variant?: WebsiteCreditVariant;
  href?: string;
  className?: string;
}

/** "Built by دایره" credit for websites we build for clients. */
const WebsiteCredit: React.FC<WebsiteCreditProps> = ({
  variant = "footer-light",
  href = "https://circlegroup.ir",
  className = "",
}) => {
  if (variant === "floating") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 rounded-full bg-navy-950 px-4 py-2 shadow-lg ${className}`}
      >
        <span className="text-xs font-semibold text-navy-100">دایره</span>
        <CircleMark variant="simple" theme="dark" size={15} />
      </a>
    );
  }

  const dark = variant === "footer-dark";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 text-xs transition-colors ${
        dark
          ? "text-navy-100/60 hover:text-[oklch(80%_0.14_85)]"
          : "text-ink-faint hover:text-gold-dark"
      } ${className}`}
    >
      <span>ساخته‌شده توسط</span>
      <span
        className={`inline-flex items-center gap-1.5 font-bold ${
          dark ? "text-navy-100" : "text-ink"
        }`}
      >
        <CircleMark variant="simple" theme={dark ? "dark" : "light"} size={16} />
        دایره
      </span>
    </a>
  );
};

export default WebsiteCredit;

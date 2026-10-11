import React from "react";
import CircleMark from "./CircleMark";
import "./circle.css";

export type WebsiteCreditVariant = "footer-light" | "footer-dark" | "floating";
export interface WebsiteCreditProps {
  variant?: WebsiteCreditVariant;
  href?: string;
  className?: string;
}

/** Modest client website attribution, with no dependency on Tailwind. */
const WebsiteCredit: React.FC<WebsiteCreditProps> = ({
  variant = "footer-light",
  href = "https://circlegroup.ir",
  className = "",
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    dir="rtl"
    lang="fa"
    className={`circle-credit circle-credit--${variant} ${className}`}
    aria-label="طراحی و توسعه توسط دایره — باز کردن وب‌سایت دایره"
  >
    <span className="circle-credit__caption">طراحی و توسعه توسط</span>
    <span className="circle-credit__signature">
      <CircleMark
        variant="simple"
        theme={variant === "footer-light" ? "light" : "dark"}
        size={20}
      />
      <strong>دایره</strong>
    </span>
  </a>
);

export default WebsiteCredit;

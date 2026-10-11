import React from "react";
import CircleLogo from "./CircleLogo";
import CircleMark, { type CircleMarkTheme } from "./CircleMark";
import "./circle.css";

export interface SplashScreenProps {
  showLoadingDots?: boolean;
  className?: string;
}

/** Optional signature for software that actually needs a loading view. */
export const SplashScreen: React.FC<SplashScreenProps> = ({
  showLoadingDots = false,
  className = "",
}) => (
  <div className={`circle-software circle-splash ${className}`}>
    <CircleLogo theme="dark" size="lg" orientation="stacked" />
    {showLoadingDots && (
      <span
        className="circle-loading"
        role="status"
        aria-label="در حال بارگذاری"
      >
        <span />
        <span />
        <span />
      </span>
    )}
  </div>
);

export interface AboutCreditProps {
  version?: string;
  href?: string;
  theme?: CircleMarkTheme;
  className?: string;
}

/** Software About/settings signature; omit version when unavailable. */
export const AboutCredit: React.FC<AboutCreditProps> = ({
  version,
  href = "https://circlegroup.ir",
  theme = "light",
  className = "",
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    dir="rtl"
    lang="fa"
    className={`circle-software circle-about circle-about--${theme} ${className}`}
  >
    <CircleMark theme={theme} size={44} />
    <span>
      <strong className="circle-about__title">طراحی و توسعه توسط دایره</strong>
      <span className="circle-about__details">
        {version && (
          <span>
            نسخه <bdi>{version}</bdi>
            <span aria-hidden="true"> · </span>
          </span>
        )}
        <span dir="ltr">circlegroup.ir</span>
      </span>
    </span>
  </a>
);

export interface SidebarCreditProps {
  href?: string;
  theme?: CircleMarkTheme;
  className?: string;
}

/** Compact signature; match the theme to the host sidebar surface. */
export const SidebarCredit: React.FC<SidebarCreditProps> = ({
  href = "https://circlegroup.ir",
  theme = "dark",
  className = "",
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    dir="rtl"
    lang="fa"
    className={`circle-software circle-sidebar circle-sidebar--${theme} ${className}`}
  >
    <CircleMark variant="simple" theme={theme} size={20} />
    <span>
      ساخته‌شده با <strong>دایره</strong>
    </span>
  </a>
);

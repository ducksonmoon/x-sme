import React from "react";
import CircleMark from "./CircleMark";
import { circleHeroBackground } from "./tokens";

interface SplashScreenProps {
  /** Shows three fading dots below the wordmark -- only when the app's own
   * boot actually takes noticeable time. */
  showLoadingDots?: boolean;
  className?: string;
}

/** Full-bleed app boot/splash screen: animated mark + دایره wordmark on navy. */
export const SplashScreen: React.FC<SplashScreenProps> = ({
  showLoadingDots = false,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      style={{ background: circleHeroBackground }}
    >
      <CircleMark variant="full" theme="dark" animated size={72} />
      <p
        className="text-2xl text-white"
        style={{ fontFamily: "'Lalezar', 'Vazirmatn', Tahoma, sans-serif" }}
      >
        دایره
      </p>
      {showLoadingDots && (
        <div className="mt-1.5 flex gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[oklch(80%_0.14_85_/_90%)]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[oklch(80%_0.14_85_/_55%)]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[oklch(80%_0.14_85_/_25%)]" />
        </div>
      )}
    </div>
  );
};

interface AboutCreditProps {
  /** e.g. "1.4.0" -- shown as-is next to a version label. */
  version?: string;
  href?: string;
  className?: string;
}

/** "Built by دایره" card for an app's About screen or settings footer. */
export const AboutCredit: React.FC<AboutCreditProps> = ({
  version,
  href = "https://circlegroup.ir",
  className = "",
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-4 rounded-xl border border-line bg-white p-6 transition-colors hover:border-gold/40 ${className}`}
    >
      <CircleMark variant="full" size={40} className="shrink-0" />
      <div>
        <p className="text-sm font-semibold text-ink">
          این نرم‌افزار توسط دایره طراحی و توسعه یافته است.
        </p>
        <p className="text-xs text-ink-faint">
          {version ? `نسخه ${version}` : "نسخه [شماره نسخه]"}
          {" · "}
          <span className="text-gold-dark">circlegroup.ir</span>
        </p>
      </div>
    </a>
  );
};

interface SidebarCreditProps {
  href?: string;
  className?: string;
}

/** Compact credit row for the bottom of a dashboard's dark sidebar. */
export const SidebarCredit: React.FC<SidebarCreditProps> = ({
  href = "https://circlegroup.ir",
  className = "",
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-1.5 px-4 py-3.5 text-[11.5px] text-navy-100/60 transition-colors hover:text-[oklch(80%_0.14_85)] ${className}`}
    >
      <CircleMark variant="simple" theme="dark" size={14} />
      <span>دایره ساخته است</span>
    </a>
  );
};

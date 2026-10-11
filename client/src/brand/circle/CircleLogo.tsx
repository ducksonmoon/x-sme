import React from "react";
import CircleMark, { type CircleMarkTheme } from "./CircleMark";
import wordmark from "./wordmark.json";
import mark from "./mark.json";
import "./circle.css";

export interface CircleLogoProps {
  theme?: CircleMarkTheme;
  size?: "sm" | "md" | "lg";
  orientation?: "horizontal" | "stacked";
  showEnglish?: boolean;
  showMark?: boolean;
  tagline?: string;
  className?: string;
}

/** Persian-first lockup for Circle's site and software signatures. */
const CircleLogo: React.FC<CircleLogoProps> = ({
  theme = "light",
  size = "md",
  orientation = "horizontal",
  showEnglish = true,
  showMark = true,
  tagline,
  className = "",
}) => (
  <span
    dir="rtl"
    className={`circle-logo circle-logo--${theme} circle-logo--${size} circle-logo--${orientation} ${className}`}
  >
    {showMark && (
      <CircleMark theme={theme} size={{ sm: 28, md: 40, lg: 72 }[size]} />
    )}
    <span className="circle-logo__wordmark">
      <span className="circle-logo__name" lang="fa">
        <svg
          className="circle-logo__lettering"
          viewBox={wordmark.viewBox}
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          {wordmark.paths.map((path, index) => (
            <path key={index} d={path} />
          ))}
          {wordmark.accents.map((path, index) => (
            <path
              key={`accent-${index}`}
              d={path}
              className="circle-logo__dots"
            />
          ))}
          <g transform={wordmark.markTransform}>
            {mark.paths.map((path, index) => (
              <path key={index} d={path} fillRule="evenodd" />
            ))}
          </g>
        </svg>
        <span className="circle-visually-hidden">دایره</span>
      </span>
      {showEnglish && (
        <span className="circle-logo__english" dir="ltr">
          CIRCLE GROUP
        </span>
      )}
      {tagline && (
        <span className="circle-logo__tagline" lang="fa">
          {tagline}
        </span>
      )}
    </span>
  </span>
);

export default CircleLogo;

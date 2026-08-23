import React from "react";

interface LogoMarkProps {
  /** "light" for the mark sitting on a paper/white surface, "dark" for the navy CTA band */
  variant?: "light" | "dark";
  /** The large hero illustration uses a bigger orbit and a different viewBox */
  large?: boolean;
  /** Static marks (e.g. footer) show a fixed moon instead of the orbiting animation */
  animated?: boolean;
  className?: string;
}

const LogoMark: React.FC<LogoMarkProps> = ({
  variant = "light",
  large = false,
  animated = true,
  className = "",
}) => {
  const planetFill = variant === "dark" ? "fill-navy-950" : "fill-paper";
  const planetStroke = variant === "dark" ? "stroke-mars" : "stroke-navy-700";
  const ringStroke = variant === "dark" ? "stroke-[oklch(78%_0.03_258)]" : "stroke-line";

  if (large) {
    return (
      <svg
        width={210}
        height={210}
        viewBox="0 0 210 210"
        fill="none"
        className={`orbit-mark-lg ${className}`}
      >
        <path
          d="M 9 105 A 96 40 0 1 1 201 105"
          className={ringStroke}
          strokeWidth="1.4"
        />
        <circle className="orbit-back-dot fill-mars" cx="0" cy="0" r="7" />
        <circle
          cx="105"
          cy="105"
          r="58"
          className={`${planetFill} ${planetStroke}`}
          strokeWidth="1.6"
        />
        <path
          d="M 201 105 A 96 40 0 1 1 9 105"
          className={ringStroke}
          strokeWidth="1.4"
        />
        <circle className="orbit-front-dot fill-mars" cx="0" cy="0" r="7" />
      </svg>
    );
  }

  return (
    <svg width={34} height={34} viewBox="0 0 34 34" fill="none" className={className}>
      <path d="M 1.5 17 A 15.5 6.5 0 1 1 32.5 17" className={ringStroke} strokeWidth="1.3" />
      {animated && <circle className="orbit-back-dot fill-mars" cx="0" cy="0" r="2" />}
      <circle
        cx="17"
        cy="17"
        r="9"
        className={`${planetFill} ${planetStroke}`}
        strokeWidth="1.75"
      />
      <path d="M 32.5 17 A 15.5 6.5 0 1 1 1.5 17" className={ringStroke} strokeWidth="1.3" />
      {animated ? (
        <circle className="orbit-front-dot fill-mars" cx="0" cy="0" r="2" />
      ) : (
        <circle cx="30.2" cy="17" r="1.8" className="fill-mars" />
      )}
    </svg>
  );
};

export default LogoMark;

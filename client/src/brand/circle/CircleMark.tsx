import React from "react";
import { circleColors } from "./tokens";

export type CircleMarkVariant = "full" | "simple";
export type CircleMarkTheme = "light" | "dark";

interface CircleMarkProps {
  /** "full" is the textured double-stroke mark for large sizes (header, hero,
   * print); "simple" is a single clean stroke that stays legible down to
   * favicon size. */
  variant?: CircleMarkVariant;
  theme?: CircleMarkTheme;
  /** Slowly rotates the mark -- only meaningful on "full". */
  animated?: boolean;
  size?: number;
  className?: string;
}

const CircleMark: React.FC<CircleMarkProps> = ({
  variant = "full",
  theme = "light",
  animated = false,
  size = 56,
  className = "",
}) => {
  const uid = React.useId();
  const roughId1 = `circle-rough1-${uid}`;
  const roughId2 = `circle-rough2-${uid}`;

  const outerStroke = theme === "dark" ? circleColors.goldBright : circleColors.gold;
  const innerStroke = theme === "dark" ? circleColors.coralBright : circleColors.coral;

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      style={
        animated && variant === "full"
          ? { animation: "circle-mark-spin 46s linear infinite" }
          : undefined
      }
    >
      {variant === "full" && (
        <defs>
          <filter id={roughId1} x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency={0.035} numOctaves={2} seed={4} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={6} />
          </filter>
          <filter id={roughId2} x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency={0.042} numOctaves={2} seed={11} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={4.5} />
          </filter>
        </defs>
      )}

      <circle
        cx="100"
        cy="100"
        r="78"
        fill="none"
        stroke={outerStroke}
        strokeWidth={variant === "full" ? 9 : 18}
        strokeLinecap="round"
        strokeDasharray={variant === "full" ? "456 34" : "460 43"}
        transform="rotate(-90 100 100)"
        filter={variant === "full" ? `url(#${roughId1})` : undefined}
      />

      {variant === "full" && (
        <circle
          cx="100"
          cy="100"
          r="68"
          fill="none"
          stroke={innerStroke}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray="361 67"
          transform="rotate(40 100 100)"
          filter={`url(#${roughId2})`}
          opacity={0.6}
        />
      )}

      <circle
        cx={variant === "full" ? 58 : 55}
        cy={variant === "full" ? 30 : 28}
        r={variant === "full" ? 8 : 13}
        fill={variant === "full" ? circleColors.goldBright : innerStroke}
      />
    </svg>
  );
};

export default CircleMark;

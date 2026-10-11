import React from "react";
import { circleColors } from "./tokens";
import mark from "./mark.json";
import "./circle.css";

export type CircleMarkVariant = "full" | "simple";
export type CircleMarkTheme = "light" | "dark";
export interface CircleMarkProps {
  /** Both sizes retain the same silhouette so the identity stays consistent. */
  variant?: CircleMarkVariant;
  theme?: CircleMarkTheme;
  /** A short entrance, never continuous rotation of the brand mark. */
  animated?: boolean;
  size?: number;
  color?: string;
  /** Omit beside a wordmark; supply for a standalone meaningful image. */
  label?: string;
  className?: string;
}

const CircleMark: React.FC<CircleMarkProps> = ({
  variant = "full",
  theme = "light",
  animated = false,
  size = 56,
  color,
  label,
  className = "",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={mark.viewBox}
    width={size}
    height={size}
    fill={
      color ?? (theme === "dark" ? circleColors.ivory : circleColors.petrol)
    }
    className={`circle-mark ${animated ? "circle-mark--enter" : ""} ${className}`}
    data-variant={variant}
    role={label ? "img" : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    focusable="false"
  >
    {mark.paths.map((path, index) => (
      <path key={index} d={path} fillRule="evenodd" />
    ))}
  </svg>
);

export default CircleMark;

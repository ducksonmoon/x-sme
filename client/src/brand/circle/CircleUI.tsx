import React from "react";
import "./circle.css";

export interface CircleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const CircleButton = React.forwardRef<
  HTMLButtonElement,
  CircleButtonProps
>(({ variant = "primary", type = "button", className = "", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={`circle-system circle-button ${variant === "secondary" ? "circle-button--secondary" : ""} ${className}`}
    {...props}
  />
));
CircleButton.displayName = "CircleButton";

export const CircleInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`circle-system circle-input ${className}`}
    {...props}
  />
));
CircleInput.displayName = "CircleInput";

export const CircleCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  ...props
}) => <div className={`circle-system circle-card ${className}`} {...props} />;

export const CircleBadge: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  className = "",
  ...props
}) => <span className={`circle-system circle-badge ${className}`} {...props} />;

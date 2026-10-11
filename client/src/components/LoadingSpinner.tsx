import React from "react";
import { CircleMark } from "@/brand/circle";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  className?: string;
}

export default function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`site-loading ${className}`}
      role="status"
      aria-label="در حال بارگذاری"
    >
      <CircleMark size={{ sm: 20, md: 32, lg: 48, xl: 72 }[size]} />
      <span className="site-loading__dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="circle-visually-hidden">در حال بارگذاری…</span>
    </div>
  );
}

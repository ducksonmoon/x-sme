import React from "react";
import { type FallbackProps } from "react-error-boundary";
import { ArrowRight, RefreshCw } from "lucide-react";
import { CircleLogo } from "@/brand/circle";
import { publicAsset } from "@utils/publicPath";

export default function ErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  return (
    <div className="circle-site site-recovery">
      <CircleLogo orientation="stacked" size="lg" />
      <h1>نمایش صفحه با مشکل روبه‌رو شد.</h1>
      <p>می‌توانید دوباره تلاش کنید یا به صفحهٔ اصلی برگردید.</p>
      <div className="site-actions">
        <button className="site-button" onClick={resetErrorBoundary}>
          تلاش دوباره
          <RefreshCw size={18} />
        </button>
        <a className="site-text-link" href={publicAsset("")}>
          صفحهٔ اصلی
          <ArrowRight size={18} />
        </a>
      </div>
      {import.meta.env.DEV && (
        <details>
          <summary>جزئیات خطا برای توسعه‌دهنده</summary>
          <pre>{error.message}</pre>
        </details>
      )}
    </div>
  );
}

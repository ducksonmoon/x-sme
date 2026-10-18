import React, { Suspense, useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { ArrowLeft, RefreshCw } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import ErrorFallback from "./ErrorFallback";

function RouteLoading() {
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDelayed(true), 10000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="site-route-loading">
      <LoadingSpinner size="lg" />
      <p role="status" aria-live="polite">
        {delayed
          ? "بارگذاری بیشتر از معمول طول کشیده است."
          : "در حال آماده‌سازی صفحه…"}
      </p>
      {delayed && (
        <>
          <p>می‌توانید کمی صبر کنید یا صفحه را دوباره بارگذاری کنید.</p>
          <div className="site-actions">
            <button
              className="site-button"
              onClick={() => window.location.reload()}
            >
              بارگذاری دوباره
              <RefreshCw size={18} aria-hidden="true" />
            </button>
            <Link className="site-text-link" to="/">
              صفحهٔ اصلی
              <ArrowLeft size={18} aria-hidden="true" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function RouteContent() {
  const { pathname } = useLocation();

  return (
    <ErrorBoundary
      resetKeys={[pathname]}
      fallbackRender={(props) => <ErrorFallback {...props} embedded />}
    >
      <Suspense key={pathname} fallback={<RouteLoading />}>
        <Outlet />
      </Suspense>
    </ErrorBoundary>
  );
}

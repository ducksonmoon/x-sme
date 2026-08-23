import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "react-hot-toast";

import App from "./App";
import { ThemeProvider } from "@providers/ThemeProvider";
import { LanguageProvider } from "@providers/LanguageProvider";
import ErrorFallback from "@components/ErrorFallback";
import ToastProvider from "./components/ui/toast";

import "./styles/index.css";

// On a GitHub Pages project site (username.github.io/repo/) the app is served
// from a subpath instead of the domain root, so routes need that prefix.
// On the custom domain (or any other host) it's served from "/" as normal.
const basename = window.location.hostname.endsWith("github.io")
  ? `/${window.location.pathname.split("/")[1] ?? ""}`
  : "/";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error("Error caught by boundary:", error, errorInfo);
        // You can also log to an error reporting service here
      }}
    >
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter basename={basename}>
            <ThemeProvider>
              <LanguageProvider>
                <ToastProvider>
                  <App />
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: "#363636",
                        color: "#fff",
                      },
                      success: {
                        duration: 3000,
                        iconTheme: {
                          primary: "#22c55e",
                          secondary: "#fff",
                        },
                      },
                      error: {
                        duration: 5000,
                        iconTheme: {
                          primary: "#ef4444",
                          secondary: "#fff",
                        },
                      },
                    }}
                  />
                  {import.meta.env.DEV && (
                    <ReactQueryDevtools initialIsOpen={false} />
                  )}
                </ToastProvider>
              </LanguageProvider>
            </ThemeProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "react-error-boundary";

import App from "./App";
import { ThemeProvider } from "@providers/ThemeProvider";
import ErrorFallback from "@components/ErrorFallback";

import "./styles/index.css";
import "./styles/site.css";
import { basename } from "@utils/publicPath";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error("Error caught by boundary:", error, errorInfo);
      }}
    >
      <HelmetProvider>
        <BrowserRouter basename={basename}>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

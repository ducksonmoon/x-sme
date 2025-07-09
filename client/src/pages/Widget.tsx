import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BookingWidget from "@components/BookingWidget";
import { useTheme } from "@providers/ThemeProvider";
import { useLanguage } from "@providers/LanguageProvider";
import { WidgetConfig } from "../types";

const Widget: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { setTheme } = useTheme();
  const { setLanguage } = useLanguage();
  const [config, setConfig] = useState<WidgetConfig | null>(null);

  useEffect(() => {
    // Parse configuration from URL parameters
    const widgetConfig: WidgetConfig = {
      businessId:
        searchParams.get("businessId") || searchParams.get("business") || "",
      theme: (searchParams.get("theme") as "light" | "dark") || "light",
      language: "fa",
      primaryColor: searchParams.get("primaryColor") || "#3b82f6",
      borderRadius: parseInt(searchParams.get("borderRadius") || "8"),
      showLogo: searchParams.get("showLogo") !== "false",
      showBusinessInfo: searchParams.get("showBusinessInfo") !== "false",
      allowNotes: searchParams.get("allowNotes") !== "false",
      requireEmail: searchParams.get("requireEmail") === "true",
      maxAdvanceBooking: parseInt(
        searchParams.get("maxAdvanceBooking") || "30"
      ),
      minAdvanceBooking: parseInt(searchParams.get("minAdvanceBooking") || "2"),
    };

    setConfig(widgetConfig);

    // Apply theme and language
    setTheme(widgetConfig.theme || "light");
    setLanguage(widgetConfig.language || "fa");

    // Apply custom CSS variables for theming
    const root = document.documentElement;
    root.style.setProperty(
      "--primary-color",
      widgetConfig.primaryColor || "#3b82f6"
    );
    root.style.setProperty(
      "--border-radius",
      `${widgetConfig.borderRadius || 8}px`
    );

    // Notify parent that widget is ready
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: "WIDGET_READY", data: { config: widgetConfig } },
        "*"
      );
    }

    // Notify parent about height changes for iframe resizing
    const notifyHeightChange = () => {
      if (window.parent !== window) {
        const height = document.body.scrollHeight;
        window.parent.postMessage({ type: "RESIZE", data: { height } }, "*");
      }
    };

    // Initial height notification
    setTimeout(notifyHeightChange, 100);

    // Listen for content changes that might affect height
    const observer = new MutationObserver(notifyHeightChange);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [searchParams, setTheme, setLanguage]);

  // Listen for messages from parent
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Handle messages from parent page
      const { type, data } = event.data;

      switch (type) {
        case "UPDATE_CONFIG":
          setConfig(data);
          break;
        case "REFRESH":
          window.location.reload();
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!config) {
    return (
      <div className="w-full py-8 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            در حال بارگذاری...
          </h2>
          <p className="text-sm text-gray-600">لطفاً صبر کنید</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full bg-white"
      style={
        {
          "--primary-color": config.primaryColor,
          "--border-radius": `${config.borderRadius}px`,
        } as React.CSSProperties
      }
    >
      <div className="w-full max-w-none">
        <BookingWidget businessId={config.businessId} />
      </div>
    </div>
  );
};

export default Widget;

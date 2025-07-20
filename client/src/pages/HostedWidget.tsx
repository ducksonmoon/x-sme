import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import BookingWidget from "@components/BookingWidget";
import LoadingSpinner from "@components/LoadingSpinner";
import { useTheme } from "@providers/ThemeProvider";
import { useLanguage } from "@providers/LanguageProvider";
import { api } from "@services/api";
import { WidgetConfig, Business } from "../types";
import {
  Calendar,
  MapPin,
  Phone,
  Clock,
  Shield,
  Star,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Globe,
} from "lucide-react";

const HostedWidget: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const [searchParams] = useSearchParams();
  const { setTheme } = useTheme();
  const { setLanguage } = useLanguage();
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!businessId) {
        setError("Business ID is required");
        setLoading(false);
        return;
      }

      try {
        // Fetch business data and widget configuration in a single public request
        const response = await api.get(
          `/businesses/${businessId}/widget-config/public`
        );
        const responseData = response.data?.data || response.data;

        const businessData = responseData.business;
        const savedConfig = responseData.widgetConfig;

        setBusiness(businessData);

        // Default widget configuration
        let widgetConfig: WidgetConfig = {
          businessId: businessId,
          theme: "auto",
          language: "fa",
          primaryColor: "#3b82f6",
          borderRadius: 8,
          showLogo: true,
          showBusinessInfo: true,
          allowNotes: true,
          requireEmail: false,
          maxAdvanceBooking: 30,
          minAdvanceBooking: 2,
          embedMode: false, // Hosted widgets are not embedded
        };

        // Apply saved configuration if available
        if (savedConfig) {
          widgetConfig = {
            ...widgetConfig,
            ...savedConfig,
            businessId: businessId, // Always use the URL business ID
            embedMode: false, // Always false for hosted widgets
          };
        }

        // URL parameters can still override for testing/preview (optional)
        const urlOverrides: Partial<WidgetConfig> = {};

        if (searchParams.get("theme")) {
          urlOverrides.theme = searchParams.get("theme") as
            | "light"
            | "dark"
            | "auto";
        }
        if (searchParams.get("primaryColor")) {
          urlOverrides.primaryColor = searchParams.get("primaryColor")!;
        }
        if (searchParams.get("secondaryColor")) {
          urlOverrides.secondaryColor = searchParams.get("secondaryColor")!;
        }
        if (searchParams.get("customLogo")) {
          urlOverrides.customLogo = searchParams.get("customLogo")!;
        }
        if (searchParams.get("borderRadius")) {
          urlOverrides.borderRadius = parseInt(
            searchParams.get("borderRadius")!
          );
        }
        if (searchParams.get("showLogo")) {
          urlOverrides.showLogo = searchParams.get("showLogo") !== "false";
        }
        if (searchParams.get("showBusinessInfo")) {
          urlOverrides.showBusinessInfo =
            searchParams.get("showBusinessInfo") !== "false";
        }
        if (searchParams.get("allowNotes")) {
          urlOverrides.allowNotes = searchParams.get("allowNotes") !== "false";
        }
        if (searchParams.get("requireEmail")) {
          urlOverrides.requireEmail =
            searchParams.get("requireEmail") === "true";
        }

        // Apply URL overrides if any (for preview/testing)
        if (Object.keys(urlOverrides).length > 0) {
          widgetConfig = { ...widgetConfig, ...urlOverrides };
        }

        setConfig(widgetConfig);

        // Apply theme and language
        setTheme(
          widgetConfig.theme === "auto"
            ? "light"
            : widgetConfig.theme || "light"
        );
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

        // Set page title and meta
        const businessName = businessData?.name || "کسب‌وکار";
        document.title = `${businessName} - رزرو آنلاین`;
        const metaDescription = document.querySelector(
          'meta[name="description"]'
        );
        if (metaDescription) {
          metaDescription.setAttribute(
            "content",
            `رزرو آنلاین خدمات ${businessName}. راحت و سریع وقت خود را رزرو کنید.`
          );
        }
      } catch (err) {
        console.error("Error fetching business data:", err);
        setError("کسب‌وکار یافت نشد یا خطا در بارگذاری اطلاعات");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [businessId, searchParams, setTheme, setLanguage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mb-6">
            <LoadingSpinner size="lg" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            در حال بارگذاری
          </h2>
          <p className="text-slate-600">
            اطلاعات کسب‌وکار در حال آماده‌سازی است...
          </p>
        </div>
      </div>
    );
  }

  if (error || !config || !business) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            خطا در بارگذاری
          </h2>
          <p className="text-slate-600 mb-8">
            {error || "متأسفانه کسب‌وکار مورد نظر یافت نشد"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Business Name */}
            <div className="flex items-center gap-3">
              {(config.customLogo || business.logo) && (
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  <img
                    src={config.customLogo || business.logo}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  {business.name}
                </h1>
                <p className="text-sm text-slate-500">رزرو آنلاین</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              فعال
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Info Sidebar */}
          {config.showBusinessInfo && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                {/* Business Header */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    {(config.customLogo || business.logo) && (
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={config.customLogo || business.logo}
                          alt={business.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-slate-900 mb-1">
                        {business.name}
                      </h2>
                      {business.description && (
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {business.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="p-6">
                  <h3 className="text-sm font-medium text-slate-900 mb-4">
                    اطلاعات تماس
                  </h3>
                  <div className="space-y-3">
                    {business.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Phone className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {business.phone}
                          </p>
                          <p className="text-xs text-slate-500">تلفن تماس</p>
                        </div>
                      </div>
                    )}
                    {business.address && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {business.address}
                          </p>
                          <p className="text-xs text-slate-500">آدرس</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                  <h3 className="text-sm font-medium text-slate-900 mb-4">
                    مزایای رزرو آنلاین
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-slate-700">
                        تأیید فوری رزرو
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-slate-700">
                        امنیت اطلاعات
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-slate-700">
                        دسترسی ۲۴ ساعته
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Booking Widget */}
          <div
            className={
              config.showBusinessInfo ? "lg:col-span-2" : "lg:col-span-3"
            }
          >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      رزرو نوبت
                    </h2>
                    <p className="text-sm text-slate-500">
                      زمان مناسب خود را انتخاب کنید
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <BookingWidget
                  businessId={config.businessId}
                  theme={config.theme || "light"}
                  showLogo={config.showLogo ?? true}
                  primaryColor={config.primaryColor || "#3b82f6"}
                  {...(config.secondaryColor && {
                    secondaryColor: config.secondaryColor,
                  })}
                  {...(config.customLogo && { customLogo: config.customLogo })}
                  allowNotes={config.allowNotes ?? true}
                  requireEmail={config.requireEmail ?? false}
                  maxAdvanceBooking={config.maxAdvanceBooking || 30}
                  minAdvanceBooking={config.minAdvanceBooking || 2}
                  borderRadius={config.borderRadius || 8}
                  embedMode={false}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                <Globe className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-900">X-SME</span>
              <span className="text-sm text-slate-500">سیستم رزرو آنلاین</span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>امن</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  <span>قابل اعتماد</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>۲۴/۷</span>
                </div>
              </div>

              <a
                href="https://x-sme.ir"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
              >
                <span>وب‌سایت</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HostedWidget;

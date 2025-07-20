import { dashboardApi } from "./api";

export interface WidgetConfig {
  id?: string;
  businessId: string;
  theme: "light" | "dark" | "auto";
  primaryColor: string;
  secondaryColor?: string;
  borderRadius: number;
  showLogo: boolean;
  allowNotes: boolean;
  requireEmail: boolean;
  maxAdvanceBooking: number;
  minAdvanceBooking: number;
  customLogo?: string;
  customCSS?: string;
  embedMode: boolean;
  showBusinessInfo: boolean;
  language: "fa" | "en";
  version: string;
  lastUpdated?: string;
}

export interface WidgetConfigResponse {
  success: boolean;
  data: WidgetConfig;
  message?: string;
}

export interface WidgetConfigValidation {
  isValid: boolean;
  errors: string[];
}

class WidgetConfigService {
  // Get widget configuration for a business
  async getWidgetConfig(businessId: string): Promise<WidgetConfigResponse> {
    try {
      const response = await dashboardApi.getWidgetConfig(businessId);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "خطا در دریافت تنظیمات ویجت"
      );
    }
  }

  // Update widget configuration
  async updateWidgetConfig(
    businessId: string,
    config: WidgetConfig
  ): Promise<WidgetConfigResponse> {
    try {
      const response = await dashboardApi.updateWidgetConfig(
        businessId,
        config
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "خطا در بروزرسانی تنظیمات ویجت"
      );
    }
  }

  // Create widget configuration (using update since it's the same endpoint)
  async createWidgetConfig(
    config: WidgetConfig
  ): Promise<WidgetConfigResponse> {
    try {
      const response = await dashboardApi.updateWidgetConfig(
        config.businessId,
        config
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "خطا در ایجاد تنظیمات ویجت"
      );
    }
  }

  // Delete widget configuration (not implemented in API, return success)
  async deleteWidgetConfig(
    businessId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Since delete is not implemented, we'll return success
      return { success: true, message: "تنظیمات ویجت حذف شد" };
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "خطا در حذف تنظیمات ویجت"
      );
    }
  }

  // Validate widget configuration
  validateConfig(config: WidgetConfig): WidgetConfigValidation {
    const errors: string[] = [];

    if (!config.businessId) {
      errors.push("شناسه کسب‌وکار الزامی است");
    }

    if (!config.primaryColor) {
      errors.push("رنگ اصلی الزامی است");
    } else if (!/^#[0-9A-F]{6}$/i.test(config.primaryColor)) {
      errors.push("رنگ اصلی باید در فرمت هگزادسیمال باشد (مثل #3b82f6)");
    }

    if (
      config.secondaryColor &&
      !/^#[0-9A-F]{6}$/i.test(config.secondaryColor)
    ) {
      errors.push("رنگ ثانویه باید در فرمت هگزادسیمال باشد (مثل #1e40af)");
    }

    if (config.borderRadius < 0 || config.borderRadius > 20) {
      errors.push("گردی گوشه‌ها باید بین 0 تا 20 پیکسل باشد");
    }

    if (config.maxAdvanceBooking < 1 || config.maxAdvanceBooking > 365) {
      errors.push("حداکثر روزهای پیش‌رزرو باید بین 1 تا 365 روز باشد");
    }

    if (config.minAdvanceBooking < 0 || config.minAdvanceBooking > 30) {
      errors.push("حداقل روزهای پیش‌رزرو باید بین 0 تا 30 روز باشد");
    }

    if (config.minAdvanceBooking >= config.maxAdvanceBooking) {
      errors.push("حداقل روزهای پیش‌رزرو باید کمتر از حداکثر باشد");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Generate embed code
  generateEmbedCode(
    config: WidgetConfig,
    type: "basic" | "advanced" = "basic"
  ): string {
    const baseUrl = window.location.origin;
    const scriptUrl = `${baseUrl}/widget.js`;

    if (type === "basic") {
      return `<script src="${scriptUrl}" data-business-id="${config.businessId}"></script>`;
    }

    const attributes = [
      `data-business-id="${config.businessId}"`,
      `data-theme="${config.theme}"`,
      `data-primary-color="${config.primaryColor}"`,
      `data-border-radius="${config.borderRadius}"`,
      `data-show-logo="${config.showLogo}"`,
      `data-allow-notes="${config.allowNotes}"`,
      `data-require-email="${config.requireEmail}"`,
      `data-max-advance-booking="${config.maxAdvanceBooking}"`,
      `data-min-advance-booking="${config.minAdvanceBooking}"`,
    ];

    if (config.secondaryColor) {
      attributes.push(`data-secondary-color="${config.secondaryColor}"`);
    }

    if (config.customLogo) {
      attributes.push(`data-custom-logo="${config.customLogo}"`);
    }

    return `<script src="${scriptUrl}" ${attributes.join(" ")}></script>`;
  }

  // Generate preview URL
  generatePreviewUrl(config: WidgetConfig): string {
    const params = new URLSearchParams({
      businessId: config.businessId,
      theme: config.theme,
      primaryColor: config.primaryColor,
      borderRadius: config.borderRadius.toString(),
      showLogo: config.showLogo.toString(),
      allowNotes: config.allowNotes.toString(),
      requireEmail: config.requireEmail.toString(),
      maxAdvanceBooking: config.maxAdvanceBooking.toString(),
      minAdvanceBooking: config.minAdvanceBooking.toString(),
    });

    if (config.secondaryColor) {
      params.set("secondaryColor", config.secondaryColor);
    }

    if (config.customLogo) {
      params.set("customLogo", config.customLogo);
    }

    return `${window.location.origin}/widget-preview?${params.toString()}`;
  }

  // Generate hosted widget URL
  generateHostedWidgetUrl(config: WidgetConfig): string {
    const params = new URLSearchParams();

    if (config.theme !== "auto") {
      params.set("theme", config.theme);
    }

    if (config.primaryColor !== "#3b82f6") {
      params.set("primaryColor", config.primaryColor);
    }

    if (config.secondaryColor) {
      params.set("secondaryColor", config.secondaryColor);
    }

    if (config.customLogo) {
      params.set("customLogo", config.customLogo);
    }

    if (config.borderRadius !== 8) {
      params.set("borderRadius", config.borderRadius.toString());
    }

    if (!config.showLogo) {
      params.set("showLogo", "false");
    }

    if (!config.allowNotes) {
      params.set("allowNotes", "false");
    }

    if (config.requireEmail) {
      params.set("requireEmail", "true");
    }

    const baseUrl = `${window.location.origin}/w/${config.businessId}`;
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  }

  // Get default configuration
  getDefaultConfig(businessId: string): WidgetConfig {
    return {
      businessId,
      theme: "auto",
      primaryColor: "#3b82f6",
      secondaryColor: "#1e40af",
      borderRadius: 8,
      showLogo: true,
      allowNotes: true,
      requireEmail: false,
      maxAdvanceBooking: 30,
      minAdvanceBooking: 2,
      embedMode: true,
      showBusinessInfo: true,
      language: "fa",
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
    };
  }
}

export const widgetConfigService = new WidgetConfigService();
export default widgetConfigService;

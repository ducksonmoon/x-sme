import { WidgetConfig } from "../types";

// Configuration schema with validation
export interface WidgetConfigSchema {
  // Core settings
  businessId: string;
  theme: "light" | "dark" | "auto";
  language: "fa";

  // Appearance
  primaryColor: string;
  secondaryColor?: string;
  borderRadius: number;
  showLogo: boolean;
  customLogo?: string;

  // Behavior
  allowNotes: boolean;
  requireEmail: boolean;
  maxAdvanceBooking: number;
  minAdvanceBooking: number;

  // Advanced
  embedMode: boolean;
  showBusinessInfo: boolean;

  // Metadata
  version: string;
  lastUpdated: string;
}

// Default configuration
export const DEFAULT_WIDGET_CONFIG: WidgetConfigSchema = {
  businessId: "",
  theme: "auto",
  language: "fa",
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
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
};

// Configuration validation
export class WidgetConfigValidator {
  static validate(config: Partial<WidgetConfigSchema>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Required fields
    if (!config.businessId) {
      errors.push("businessId is required");
    }

    // Color validation
    if (config.primaryColor && !this.isValidColor(config.primaryColor)) {
      errors.push("primaryColor must be a valid hex color");
    }

    if (config.secondaryColor && !this.isValidColor(config.secondaryColor)) {
      errors.push("secondaryColor must be a valid hex color");
    }

    // Range validation
    if (
      config.borderRadius !== undefined &&
      (config.borderRadius < 0 || config.borderRadius > 50)
    ) {
      errors.push("borderRadius must be between 0 and 50");
    }

    if (
      config.maxAdvanceBooking !== undefined &&
      (config.maxAdvanceBooking < 1 || config.maxAdvanceBooking > 365)
    ) {
      errors.push("maxAdvanceBooking must be between 1 and 365 days");
    }

    if (
      config.minAdvanceBooking !== undefined &&
      (config.minAdvanceBooking < 1 || config.minAdvanceBooking > 48)
    ) {
      errors.push("minAdvanceBooking must be between 1 and 48 hours");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static isValidColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }
}

// Configuration service
export class WidgetConfigService {
  private static instance: WidgetConfigService;
  private configCache: Map<string, WidgetConfigSchema> = new Map();

  static getInstance(): WidgetConfigService {
    if (!WidgetConfigService.instance) {
      WidgetConfigService.instance = new WidgetConfigService();
    }
    return WidgetConfigService.instance;
  }

  // Validate configuration
  validateConfig(config: WidgetConfigSchema): {
    isValid: boolean;
    errors: string[];
  } {
    // Skip validation if businessId is not set yet (during initial load)
    if (!config.businessId) {
      return { isValid: true, errors: [] };
    }
    return WidgetConfigValidator.validate(config);
  }

  // Parse configuration from URL parameters
  parseFromURL(searchParams: URLSearchParams): WidgetConfigSchema {
    const config = { ...DEFAULT_WIDGET_CONFIG };

    // Core settings
    config.businessId =
      searchParams.get("businessId") || searchParams.get("business") || "";
    config.theme =
      (searchParams.get("theme") as "light" | "dark" | "auto") || "auto";

    // Appearance
    config.primaryColor =
      searchParams.get("primaryColor") ||
      searchParams.get("accentColor") ||
      "#3b82f6";
    const secondaryColor = searchParams.get("secondaryColor");
    if (secondaryColor) {
      config.secondaryColor = secondaryColor;
    }
    config.borderRadius = parseInt(searchParams.get("borderRadius") || "8");
    config.showLogo = searchParams.get("showLogo") !== "false";
    const customLogo =
      searchParams.get("customLogo") || searchParams.get("logo");
    if (customLogo) {
      config.customLogo = customLogo;
    }

    // Behavior
    config.allowNotes = searchParams.get("allowNotes") !== "false";
    config.requireEmail = searchParams.get("requireEmail") === "true";
    config.maxAdvanceBooking = parseInt(
      searchParams.get("maxAdvanceBooking") || "30"
    );
    config.minAdvanceBooking = parseInt(
      searchParams.get("minAdvanceBooking") || "2"
    );

    // Advanced
    config.embedMode = searchParams.get("embedMode") !== "false";
    config.showBusinessInfo = searchParams.get("showBusinessInfo") !== "false";

    return this.validateAndMerge(config);
  }

  // Parse configuration from data attributes
  parseFromDataAttributes(element: HTMLElement): WidgetConfigSchema {
    const config = { ...DEFAULT_WIDGET_CONFIG };

    // Core settings
    config.businessId =
      element.getAttribute("data-business-id") ||
      element.getAttribute("data-business") ||
      element.getAttribute("data-businessid") ||
      "";

    // Appearance
    config.theme =
      (element.getAttribute("data-theme") as "light" | "dark" | "auto") ||
      "auto";
    config.primaryColor =
      element.getAttribute("data-primary-color") ||
      element.getAttribute("data-accent-color") ||
      "#3b82f6";
    const secondaryColor = element.getAttribute("data-secondary-color");
    if (secondaryColor) {
      config.secondaryColor = secondaryColor;
    }
    config.borderRadius = parseInt(
      element.getAttribute("data-border-radius") || "8"
    );
    config.showLogo = element.getAttribute("data-show-logo") !== "false";
    const customLogo =
      element.getAttribute("data-custom-logo") ||
      element.getAttribute("data-logo");
    if (customLogo) {
      config.customLogo = customLogo;
    }

    // Behavior
    config.allowNotes = element.getAttribute("data-allow-notes") !== "false";
    config.requireEmail = element.getAttribute("data-require-email") === "true";
    config.maxAdvanceBooking = parseInt(
      element.getAttribute("data-max-advance-booking") || "30"
    );
    config.minAdvanceBooking = parseInt(
      element.getAttribute("data-min-advance-booking") || "2"
    );

    // Advanced
    config.embedMode = element.getAttribute("data-embed-mode") !== "false";
    config.showBusinessInfo =
      element.getAttribute("data-show-business-info") !== "false";

    return this.validateAndMerge(config);
  }

  // Generate URL with configuration
  generateURL(baseUrl: string, config: WidgetConfigSchema): string {
    const params = new URLSearchParams();

    // Core settings
    params.set("businessId", config.businessId);
    params.set("theme", config.theme);

    // Appearance
    params.set("primaryColor", config.primaryColor);
    if (config.secondaryColor)
      params.set("secondaryColor", config.secondaryColor);
    params.set("borderRadius", config.borderRadius.toString());
    params.set("showLogo", config.showLogo.toString());
    if (config.customLogo) params.set("customLogo", config.customLogo);

    // Behavior
    params.set("allowNotes", config.allowNotes.toString());
    params.set("requireEmail", config.requireEmail.toString());
    params.set("maxAdvanceBooking", config.maxAdvanceBooking.toString());
    params.set("minAdvanceBooking", config.minAdvanceBooking.toString());

    // Advanced
    params.set("embedMode", config.embedMode.toString());
    params.set("showBusinessInfo", config.showBusinessInfo.toString());

    return `${baseUrl}?${params.toString()}`;
  }

  // Generate embed code
  generateEmbedCode(config: WidgetConfigSchema, domain: string): string {
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

    return `<script src="${domain}/widget.js" ${attributes.join(" ")}></script>`;
  }

  // Cache configuration for performance
  cacheConfig(businessId: string, config: WidgetConfigSchema): void {
    this.configCache.set(businessId, {
      ...config,
      lastUpdated: new Date().toISOString(),
    });
  }

  getCachedConfig(businessId: string): WidgetConfigSchema | null {
    const cached = this.configCache.get(businessId);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }
    return null;
  }

  private isCacheValid(config: WidgetConfigSchema): boolean {
    const cacheAge = Date.now() - new Date(config.lastUpdated).getTime();
    return cacheAge < 5 * 60 * 1000; // 5 minutes
  }

  private validateAndMerge(
    config: Partial<WidgetConfigSchema>
  ): WidgetConfigSchema {
    const validation = WidgetConfigValidator.validate(config);

    if (!validation.isValid) {
      console.warn(
        "Widget configuration validation errors:",
        validation.errors
      );
    }

    return {
      ...DEFAULT_WIDGET_CONFIG,
      ...config,
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
    };
  }

  // Convert to legacy WidgetConfig format for backward compatibility
  toLegacyFormat(config: WidgetConfigSchema): WidgetConfig {
    const legacyConfig: WidgetConfig = {
      businessId: config.businessId,
      theme: config.theme,
      language: config.language,
      primaryColor: config.primaryColor,
      borderRadius: config.borderRadius,
      showLogo: config.showLogo,
      showBusinessInfo: config.showBusinessInfo,
      allowNotes: config.allowNotes,
      requireEmail: config.requireEmail,
      maxAdvanceBooking: config.maxAdvanceBooking,
      minAdvanceBooking: config.minAdvanceBooking,
      embedMode: config.embedMode,
    };

    // Only add optional properties if they have values
    if (config.secondaryColor) {
      legacyConfig.secondaryColor = config.secondaryColor;
    }
    if (config.customLogo) {
      legacyConfig.customLogo = config.customLogo;
    }

    return legacyConfig;
  }
}

// Export singleton instance
export const widgetConfigService = WidgetConfigService.getInstance();

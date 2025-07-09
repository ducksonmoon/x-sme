import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  WidgetConfigSchema,
  widgetConfigService,
  DEFAULT_WIDGET_CONFIG,
} from "../services/widgetConfigService";
import { dashboardApi } from "../services/api";

interface WidgetConfigState {
  // Configuration
  config: WidgetConfigSchema;

  // UI State
  isEditing: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;

  // Actions
  updateConfig: (updates: Partial<WidgetConfigSchema>) => void;
  resetConfig: () => void;
  setEditing: (editing: boolean) => void;
  saveConfig: (businessId: string) => Promise<void>;
  loadConfig: (businessId: string) => Promise<void>;
  validateConfig: () => { isValid: boolean; errors: string[] };

  // Computed values
  getPreviewUrl: (businessId: string) => string;
  getEmbedCode: (businessId: string, domain: string) => string;
}

export const useWidgetConfigStore = create<WidgetConfigState>()(
  persist(
    (set, get) => ({
      // Initial state
      config: DEFAULT_WIDGET_CONFIG,
      isEditing: false,
      isSaving: false,
      hasUnsavedChanges: false,

      // Actions
      updateConfig: (updates: Partial<WidgetConfigSchema>) => {
        set((state) => ({
          config: { ...state.config, ...updates },
          hasUnsavedChanges: true,
        }));
      },

      resetConfig: () => {
        set({
          config: DEFAULT_WIDGET_CONFIG,
          hasUnsavedChanges: false,
        });
      },

      setEditing: (editing: boolean) => {
        set({ isEditing: editing });
      },

      saveConfig: async (businessId: string) => {
        const { config } = get();

        set({ isSaving: true });

        try {
          // Validate before saving
          const validation = get().validateConfig();
          if (!validation.isValid) {
            throw new Error(
              `Configuration validation failed: ${validation.errors.join(", ")}`
            );
          }

          // Update business ID if not set
          const configToSave = { ...config, businessId };

          // Save to API
          await dashboardApi.updateWidgetConfig(businessId, configToSave);

          // Cache the configuration
          widgetConfigService.cacheConfig(businessId, configToSave);

          set({
            config: configToSave,
            isSaving: false,
            hasUnsavedChanges: false,
          });

          return Promise.resolve();
        } catch (error) {
          set({ isSaving: false });
          return Promise.reject(error);
        }
      },

      loadConfig: async (businessId: string) => {
        try {
          // Try to get from cache first
          let config = widgetConfigService.getCachedConfig(businessId);

          if (!config) {
            // Load from API
            const response = await dashboardApi.getWidgetConfig(businessId);
            config = response.data || { ...DEFAULT_WIDGET_CONFIG, businessId };
          }

          // Ensure config is not null
          if (!config) {
            config = { ...DEFAULT_WIDGET_CONFIG, businessId };
          }

          set({
            config,
            hasUnsavedChanges: false,
          });

          return Promise.resolve();
        } catch (error) {
          // If API fails, use default config
          const defaultConfig = { ...DEFAULT_WIDGET_CONFIG, businessId };
          set({
            config: defaultConfig,
            hasUnsavedChanges: false,
          });
          return Promise.resolve();
        }
      },

      validateConfig: () => {
        const { config } = get();
        return widgetConfigService.validateConfig(config);
      },

      // Computed values
      getPreviewUrl: (businessId: string) => {
        const { config } = get();
        return widgetConfigService.generateURL(
          `${window.location.origin}/widget-preview`,
          { ...config, businessId }
        );
      },

      getEmbedCode: (businessId: string, domain: string) => {
        const { config } = get();
        return widgetConfigService.generateEmbedCode(
          { ...config, businessId },
          domain
        );
      },
    }),
    {
      name: "widget-config-storage",
      partialize: (state) => ({
        config: state.config,
      }),
    }
  )
);

// Selectors for better performance
export const useWidgetConfig = () =>
  useWidgetConfigStore((state) => state.config);
export const useWidgetConfigField = <K extends keyof WidgetConfigSchema>(
  field: K
) => useWidgetConfigStore((state) => state.config[field]);

// Memoized actions to prevent infinite loops
export const useWidgetConfigActions = () => {
  const store = useWidgetConfigStore();

  return {
    updateConfig: store.updateConfig,
    resetConfig: store.resetConfig,
    saveConfig: store.saveConfig,
    loadConfig: store.loadConfig,
    validateConfig: store.validateConfig,
  };
};

export const useWidgetConfigUI = () => {
  const store = useWidgetConfigStore();

  return {
    isEditing: store.isEditing,
    isSaving: store.isSaving,
    hasUnsavedChanges: store.hasUnsavedChanges,
    setEditing: store.setEditing,
  };
};

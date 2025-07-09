import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LanguageState {
  language: "fa";
  setLanguage: (language: "fa") => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "fa",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "language-storage",
    }
  )
);

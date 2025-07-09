import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "@/services/api";
import axios from "axios";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "BUSINESS_OWNER" | "STAFF";
  businessId?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      login: (user, token) => {
        localStorage.setItem("token", token);
        set({ user, token, isAuthenticated: true, isLoading: false });
      },
      logout: () => {
        localStorage.removeItem("token");
        // Clear axios headers
        delete axios.defaults.headers.common["Authorization"];
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (isLoading) => set({ isLoading }),
      reset: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
      initialize: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          // Set the token in axios headers
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Verify token by calling /auth/me endpoint
          const response = await authApi.getProfile();
          const user = response.data.user;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Token validation failed:", error);
          // Token is invalid, clear it
          localStorage.removeItem("token");
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

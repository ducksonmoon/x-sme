import React, { createContext, useContext, useState, useCallback } from "react";

interface ToastContextType {
  showToast: (type: "success" | "error", message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastCallback:
  | ((type: "success" | "error", message: string) => void)
  | null = null;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [visible, setVisible] = useState(false);

  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      setToast({ type, message });
      setVisible(true);
      setTimeout(() => setVisible(false), 3000);
    },
    []
  );

  toastCallback = showToast;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={`fixed top-6 left-1/2 z-50 transform -translate-x-1/2 transition-all duration-300 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {toast && (
          <div
            className={`px-6 py-3 rounded shadow-lg text-white text-center min-w-[220px] max-w-xs mx-auto font-medium
              ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}
            `}
          >
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

export function showToast(type: "success" | "error", message: string) {
  if (toastCallback) toastCallback(type, message);
}

export default ToastProvider;

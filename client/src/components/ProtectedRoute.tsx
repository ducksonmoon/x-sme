import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { usePermissions } from "@/hooks/usePermissions";
import LoadingSpinner from "./LoadingSpinner";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Shield, AlertTriangle, Home } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "BUSINESS_OWNER" | "STAFF";
  requiredPermission?: {
    page: string;
    action: string;
  };
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallbackPath = "/dashboard",
  showAccessDenied = true,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const location = useLocation();

  // Show loading while checking authentication and permissions
  if (!isAuthenticated || (user?.role === "STAFF" && permissionsLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    // Allow admins and business owners to access everything
    if (user?.role === "ADMIN" || user?.role === "BUSINESS_OWNER") {
      return <>{children}</>;
    }

    // For staff, check if they have the required role
    if (user?.role === "STAFF" && requiredRole !== "STAFF") {
      if (showAccessDenied) {
        return <AccessDeniedPage />;
      }
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // Check permission-based access (only for staff)
  if (requiredPermission && user?.role === "STAFF") {
    const hasRequiredPermission = hasPermission(
      requiredPermission.page,
      requiredPermission.action
    );

    if (!hasRequiredPermission) {
      if (showAccessDenied) {
        return <AccessDeniedPage />;
      }
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
};

// Access Denied Page Component
const AccessDeniedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full mx-4 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="h-8 w-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">دسترسی محدود</h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          شما مجوز دسترسی به این صفحه را ندارید. لطفاً با مدیر سیستم تماس
          بگیرید.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="flex-1"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            بازگشت
          </Button>

          <Button
            onClick={() => (window.location.href = "/dashboard")}
            className="flex-1"
          >
            <Home className="h-4 w-4 mr-2" />
            داشبورد
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProtectedRoute;

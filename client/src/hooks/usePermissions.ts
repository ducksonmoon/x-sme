import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { permissionsApi } from "@/services/api";

interface Permission {
  [page: string]: {
    [action: string]: boolean;
  };
}

interface UsePermissionsReturn {
  permissions: Permission | null;
  isLoading: boolean;
  error: any;
  hasPermission: (page: string, action: string) => boolean;
  canView: (page: string) => boolean;
  canCreate: (page: string) => boolean;
  canEdit: (page: string) => boolean;
  canDelete: (page: string) => boolean;
  canManage: (page: string) => boolean;
  hasAnyPermission: (page: string) => boolean;
  hasAllPermissions: (page: string, actions: string[]) => boolean;
  hasAnyOfPermissions: (page: string, actions: string[]) => boolean;
}

export const usePermissions = (): UsePermissionsReturn => {
  const { user } = useAuthStore();

  // Only fetch permissions for staff users
  const {
    data: permissionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-permissions"],
    queryFn: async () => {
      const response = await permissionsApi.getMyPermissions();
      return response.data.data.permissions;
    },
    enabled: user?.role === "STAFF",
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const permissions = permissionsData || null;

  // Helper function to check if user has a specific permission
  const hasPermission = (page: string, action: string): boolean => {
    // Admin and business owners have full access
    if (user?.role === "ADMIN" || user?.role === "BUSINESS_OWNER") {
      return true;
    }

    // Staff need specific permissions
    if (user?.role === "STAFF" && permissions) {
      return permissions[page]?.[action] || false;
    }

    return false;
  };

  // Convenience methods for common permission checks
  const canView = (page: string): boolean => hasPermission(page, "VIEW");
  const canCreate = (page: string): boolean => hasPermission(page, "CREATE");
  const canEdit = (page: string): boolean => hasPermission(page, "EDIT");
  const canDelete = (page: string): boolean => hasPermission(page, "DELETE");
  const canManage = (page: string): boolean => hasPermission(page, "MANAGE");

  // Check if user has any permission for a page
  const hasAnyPermission = (page: string): boolean => {
    if (user?.role === "ADMIN" || user?.role === "BUSINESS_OWNER") {
      return true;
    }

    if (user?.role === "STAFF" && permissions && permissions[page]) {
      return Object.values(permissions[page]).some(
        (hasPermission) => hasPermission
      );
    }

    return false;
  };

  // Check if user has all specified permissions for a page
  const hasAllPermissions = (page: string, actions: string[]): boolean => {
    return actions.every((action) => hasPermission(page, action));
  };

  // Check if user has any of the specified permissions for a page
  const hasAnyOfPermissions = (page: string, actions: string[]): boolean => {
    return actions.some((action) => hasPermission(page, action));
  };

  return {
    permissions,
    isLoading,
    error,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canManage,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyOfPermissions,
  };
};

// Hook for checking permissions without fetching (useful for components that don't need to fetch)
export const usePermissionCheck = () => {
  const { user } = useAuthStore();

  const hasPermission = (page: string, action: string): boolean => {
    // Admin and business owners have full access
    if (user?.role === "ADMIN" || user?.role === "BUSINESS_OWNER") {
      return true;
    }

    // For staff, we'll need to check against stored permissions
    // This is a simplified version - in a real app you might want to store permissions in context or state
    return false;
  };

  const canView = (page: string): boolean => hasPermission(page, "VIEW");
  const canCreate = (page: string): boolean => hasPermission(page, "CREATE");
  const canEdit = (page: string): boolean => hasPermission(page, "EDIT");
  const canDelete = (page: string): boolean => hasPermission(page, "DELETE");
  const canManage = (page: string): boolean => hasPermission(page, "MANAGE");

  return {
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canManage,
  };
};

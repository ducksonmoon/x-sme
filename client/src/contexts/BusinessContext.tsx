import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi, adminApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

interface BusinessContextType {
  businessId: string | null;
  setBusinessId: (id: string | null) => void;
  business: any;
  isLoading: boolean;
  error: any;
  isAdmin: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(
  undefined
);

interface BusinessProviderProps {
  children: ReactNode;
  initialBusinessId?: string | null;
}

export const BusinessProvider: React.FC<BusinessProviderProps> = ({
  children,
  initialBusinessId = null,
}) => {
  const { user } = useAuthStore();
  const [businessId, setBusinessId] = useState<string | null>(
    initialBusinessId
  );
  const isAdmin = user?.role === "ADMIN";

  // Fetch business data based on user role and business ID
  const {
    data: business,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["business-data", businessId, isAdmin],
    queryFn: () => {
      if (isAdmin) {
        // Admin can access any business, but needs businessId
        if (!businessId) return Promise.resolve(null);
        return adminApi.getBusinessDetails(businessId);
      } else {
        // Business owner can only access their own business
        return dashboardApi.getBusinesses();
      }
    },
    enabled: isAdmin ? !!businessId : true, // For business owners, always fetch
  });

  // Set businessId for business owners when business data is loaded
  useEffect(() => {
    if (!isAdmin && business?.data?.data?.id && !businessId) {
      setBusinessId(business.data.data.id);
    }
  }, [business, isAdmin, businessId]);

  const value: BusinessContextType = {
    businessId,
    setBusinessId,
    business: business?.data?.data, // Both admin and business owner responses have this structure
    isLoading,
    error,
    isAdmin,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
};

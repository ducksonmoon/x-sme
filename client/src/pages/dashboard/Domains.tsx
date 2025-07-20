import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { domainApi } from "@/services/api";
import { useBusiness } from "@/contexts/BusinessContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import toast from "react-hot-toast";
import { toPersianDigits } from "@/utils/persianCalendar";
import { Domain, DomainInstructions } from "@/types/domain";
import {
  DomainHeader,
  DomainStats,
  DomainList,
  AddDomainModal,
  InstructionsModal,
  EmptyState,
} from "./components";
import ComingSoon from "@/components/ComingSoon";

const Domains: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { business, businessId } = useBusiness();

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [instructions, setInstructions] = useState<DomainInstructions | null>(
    null
  );

  // Fetch domains
  const { data: domainsData, isLoading } = useQuery({
    queryKey: ["business-domains", businessId],
    queryFn: () => domainApi.getBusinessDomains(businessId!),
    enabled: !!businessId,
  });

  // Mutations
  const addDomainMutation = useMutation({
    mutationFn: (domainData: {
      domain: string;
      type: "CUSTOM" | "SUBDOMAIN";
    }) => domainApi.addDomain(domainData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-domains"] });
      setShowAddModal(false);
      toast.success("دامنه با موفقیت اضافه شد");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در اضافه کردن دامنه");
    },
  });

  const verifyDomainMutation = useMutation({
    mutationFn: (domainId: string) => domainApi.verifyDomain(domainId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-domains"] });
      toast.success("دامنه با موفقیت تایید شد");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در تایید دامنه");
    },
  });

  const activateDomainMutation = useMutation({
    mutationFn: (domainId: string) => domainApi.activateDomain(domainId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-domains"] });
      toast.success("دامنه با موفقیت فعال شد");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در فعال‌سازی دامنه");
    },
  });

  const deleteDomainMutation = useMutation({
    mutationFn: (domainId: string) => domainApi.deleteDomain(domainId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-domains"] });
      toast.success("دامنه با موفقیت حذف شد");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در حذف دامنه");
    },
  });

  const getInstructionsMutation = useMutation({
    mutationFn: (domainId: string) => domainApi.getDomainInstructions(domainId),
    onSuccess: (res) => {
      setInstructions(res.data.data);
      setShowInstructionsModal(true);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "خطا در دریافت راهنما");
    },
  });

  // Event handlers
  const handleAddDomain = (domainData: {
    domain: string;
    type: "CUSTOM" | "SUBDOMAIN";
  }) => {
    addDomainMutation.mutate(domainData);
  };

  const handleVerifyDomain = (domain: Domain) => {
    verifyDomainMutation.mutate(domain.id);
  };

  const handleActivateDomain = (domain: Domain) => {
    activateDomainMutation.mutate(domain.id);
  };

  const handleDeleteDomain = (domain: Domain) => {
    if (window.confirm(`آیا از حذف دامنه ${domain.domain} اطمینان دارید؟`)) {
      deleteDomainMutation.mutate(domain.id);
    }
  };

  const handleShowInstructions = (domain: Domain) => {
    setSelectedDomain(domain);
    getInstructionsMutation.mutate(domain.id);
  };

  const handleCloseInstructionsModal = () => {
    setShowInstructionsModal(false);
    setSelectedDomain(null);
    setInstructions(null);
  };

  const domains = Array.isArray(domainsData?.data?.data)
    ? domainsData.data.data
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ComingSoon
      title="مدیریت دامنه‌ها"
      description="بخش مدیریت دامنه‌ها به زودی در دسترس خواهد بود. این بخش شامل اضافه کردن دامنه‌های سفارشی، مدیریت زیردامنه‌ها و تنظیمات DNS خواهد بود."
      featureName="domains"
      onBack={() => navigate("/dashboard")}
      estimatedRelease="آبان ۱۴۰۴"
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DomainHeader
          business={business}
          onBack={() => navigate("/dashboard")}
          onAddDomain={() => setShowAddModal(true)}
        />

        <DomainStats domains={domains} />

        {domains.length > 0 ? (
          <DomainList
            domains={domains}
            onVerify={handleVerifyDomain}
            onActivate={handleActivateDomain}
            onDelete={handleDeleteDomain}
            onShowInstructions={handleShowInstructions}
            isLoadingVerify={verifyDomainMutation.isPending}
            isLoadingActivate={activateDomainMutation.isPending}
            isLoadingDelete={deleteDomainMutation.isPending}
            isLoadingInstructions={getInstructionsMutation.isPending}
          />
        ) : (
          <EmptyState onAddDomain={() => setShowAddModal(true)} />
        )}

        <AddDomainModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddDomain}
          isLoading={addDomainMutation.isPending}
        />

        <InstructionsModal
          isOpen={showInstructionsModal}
          onClose={handleCloseInstructionsModal}
          domain={selectedDomain}
          instructions={instructions}
        />
      </div>
    </div>
  );
};

export default Domains;

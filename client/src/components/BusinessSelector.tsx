import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/LoadingSpinner";

interface BusinessSelectorProps {
  selectedBusinessId: string | null;
  onBusinessSelect: (businessId: string) => void;
}

const BusinessSelector: React.FC<BusinessSelectorProps> = ({
  selectedBusinessId,
  onBusinessSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Fetch all businesses
  const {
    data: businesses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-businesses", searchTerm, selectedStatus],
    queryFn: () => {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedStatus) params.status = selectedStatus;
      return adminApi.getAllBusinesses(params);
    },
  });

  const businessesData = businesses?.data?.businesses || [];

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "فعال" : "غیرفعال"}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">
          خطا در بارگذاری لیست کسب‌وکارها
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>انتخاب کسب‌وکار</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">جستجو</label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو بر اساس نام کسب‌وکار..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">وضعیت</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("");
              }}
            >
              پاک کردن فیلترها
            </Button>
          </div>
        </div>

        {/* Business List */}
        <div className="space-y-4">
          {businessesData.length > 0 ? (
            businessesData.map((business: any) => (
              <div
                key={business.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedBusinessId === business.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                onClick={() => onBusinessSelect(business.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 space-x-reverse mb-2">
                      <h3 className="font-medium text-lg">{business.name}</h3>
                      {getStatusBadge(business.isActive)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {business.description || "توضیحی ثبت نشده"}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">صاحب:</span>{" "}
                        {business.owner?.firstName} {business.owner?.lastName}
                      </div>
                      <div>
                        <span className="font-medium">ایمیل:</span>{" "}
                        {business.email}
                      </div>
                      <div>
                        <span className="font-medium">تلفن:</span>{" "}
                        {business.phone || "ثبت نشده"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Button
                      variant={
                        selectedBusinessId === business.id
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                    >
                      {selectedBusinessId === business.id
                        ? "انتخاب شده"
                        : "انتخاب"}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">هیچ کسب‌وکاری یافت نشد</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessSelector;

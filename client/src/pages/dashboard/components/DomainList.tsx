import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Domain } from "@/types/domain";

interface DomainListProps {
  domains: Domain[];
  onVerify: (domain: Domain) => void;
  onActivate: (domain: Domain) => void;
  onDelete: (domain: Domain) => void;
  onShowInstructions: (domain: Domain) => void;
  isLoadingVerify: boolean;
  isLoadingActivate: boolean;
  isLoadingDelete: boolean;
  isLoadingInstructions: boolean;
}

export const DomainList: React.FC<DomainListProps> = ({
  domains,
  onVerify,
  onActivate,
  onDelete,
  onShowInstructions,
  isLoadingVerify,
  isLoadingActivate,
  isLoadingDelete,
  isLoadingInstructions,
}) => {
  const getStatusBadge = (status: string, sslStatus: string) => {
    const statusConfig = {
      PENDING: {
        label: "در انتظار",
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      },
      VERIFIED: {
        label: "تایید شده",
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      },
      ACTIVE: {
        label: "فعال",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      },
      FAILED: {
        label: "ناموفق",
        color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      },
      EXPIRED: {
        label: "منقضی شده",
        color:
          "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
      },
      SUSPENDED: {
        label: "معلق",
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <div className="flex items-center gap-2">
        <Badge className={config.color}>{config.label}</Badge>
        {sslStatus === "ACTIVE" && (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            SSL
          </Badge>
        )}
      </div>
    );
  };

  const renderDomainActions = (domain: Domain) => {
    switch (domain.status) {
      case "PENDING":
        return (
          <>
            <Button
              size="sm"
              onClick={() => onShowInstructions(domain)}
              disabled={isLoadingInstructions}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              راهنما
            </Button>
            <Button
              size="sm"
              onClick={() => onVerify(domain)}
              disabled={isLoadingVerify}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              تایید
            </Button>
          </>
        );
      case "VERIFIED":
        return (
          <Button
            size="sm"
            onClick={() => onActivate(domain)}
            disabled={isLoadingActivate}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            فعال‌سازی
          </Button>
        );
      case "ACTIVE":
        return (
          <div className="flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
            <span className="text-sm text-green-700 dark:text-green-300 font-medium">
              فعال و آماده استفاده
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-purple-600 dark:text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
            />
          </svg>
          دامنه‌های متصل
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {domains.map((domain) => (
            <Card
              key={domain.id}
              className="transition-all duration-200 hover:shadow-md border border-gray-200 dark:border-gray-700"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 dark:bg-purple-900/20 rounded-xl">
                        <svg
                          className="w-5 h-5 text-purple-600 dark:text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {domain.domain}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(domain.status, domain.sslStatus)}
                          <Badge variant="outline" className="text-xs">
                            {domain.type === "CUSTOM"
                              ? "دامنه سفارشی"
                              : "زیردامنه"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <svg
                          className="w-4 h-4 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            تاریخ اضافه
                          </p>
                          <p className="font-medium text-gray-700 dark:text-gray-300">
                            {new Date(domain.createdAt).toLocaleDateString(
                              "fa-IR"
                            )}
                          </p>
                        </div>
                      </div>

                      {domain.verifiedAt && (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <svg
                            className="w-4 h-4 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              تاریخ تایید
                            </p>
                            <p className="font-medium text-gray-700 dark:text-gray-300">
                              {new Date(domain.verifiedAt).toLocaleDateString(
                                "fa-IR"
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[200px]">
                    {renderDomainActions(domain)}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(domain)}
                      disabled={isLoadingDelete}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 hover:border-red-400 dark:hover:border-red-500 rounded-xl transition-all duration-200"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

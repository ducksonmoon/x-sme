import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Domain } from "@/types/domain";
import { toPersianDigits } from "@/utils/persianCalendar";

interface DomainStatsProps {
  domains: Domain[];
}

export const DomainStats: React.FC<DomainStatsProps> = ({ domains }) => {
  const stats = {
    total: domains.length,
    active: domains.filter((d) => d.status === "ACTIVE").length,
    pending: domains.filter((d) => d.status === "PENDING").length,
    failed: domains.filter(
      (d) => d.status === "FAILED" || d.status === "EXPIRED"
    ).length,
  };

  const statCards = [
    {
      title: "کل دامنه‌ها",
      value: stats.total,
      color: "blue",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
        />
      ),
    },
    {
      title: "فعال",
      value: stats.active,
      color: "green",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      ),
    },
    {
      title: "در انتظار تایید",
      value: stats.pending,
      color: "yellow",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
    {
      title: "مشکل دار",
      value: stats.failed,
      color: "red",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      ),
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        card: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800",
        text: "text-blue-600 dark:text-blue-400",
        value: "text-blue-900 dark:text-blue-100",
        iconBg: "bg-blue-200 dark:bg-blue-800",
        iconColor: "text-blue-700 dark:text-blue-300",
      },
      green: {
        card: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800",
        text: "text-green-600 dark:text-green-400",
        value: "text-green-900 dark:text-green-100",
        iconBg: "bg-green-200 dark:bg-green-800",
        iconColor: "text-green-700 dark:text-green-300",
      },
      yellow: {
        card: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800",
        text: "text-yellow-600 dark:text-yellow-400",
        value: "text-yellow-900 dark:text-yellow-100",
        iconBg: "bg-yellow-200 dark:bg-yellow-800",
        iconColor: "text-yellow-700 dark:text-yellow-300",
      },
      red: {
        card: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800",
        text: "text-red-600 dark:text-red-400",
        value: "text-red-900 dark:text-red-100",
        iconBg: "bg-red-200 dark:bg-red-800",
        iconColor: "text-red-700 dark:text-red-300",
      },
    };
    return colorMap[color as keyof typeof colorMap];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => {
        const colors = getColorClasses(stat.color);
        return (
          <Card key={stat.title} className={`${colors.card} shadow-md`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${colors.text}`}>
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${colors.value}`}>
                    {toPersianDigits(stat.value)}
                  </p>
                </div>
                <div className={`p-3 ${colors.iconBg} rounded-xl`}>
                  <svg
                    className={`w-6 h-6 ${colors.iconColor}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    {stat.icon}
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

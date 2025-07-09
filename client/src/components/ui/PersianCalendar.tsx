import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Star,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import {
  getCurrentPersianDate,
  getPersianMonthDays,
  PERSIAN_MONTHS,
  PERSIAN_DAYS_SHORT,
  toPersianDigits,
  getPersianDateString,
} from "../../utils/persianCalendar";

interface PersianCalendarProps {
  selectedDate?: Date | null;
  onDateSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  className?: string;
  showToday?: boolean;
  showHolidays?: boolean;
}

export const PersianCalendar: React.FC<PersianCalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  disabledDates = [],
  className,
  showToday = true,
  showHolidays = true,
}) => {
  const currentPersianDate = getCurrentPersianDate();
  const [currentMonth, setCurrentMonth] = useState({
    jYear: currentPersianDate.jYear,
    jMonth: currentPersianDate.jMonth,
  });

  const calendarDays = useMemo(() => {
    return getPersianMonthDays(currentMonth.jYear, currentMonth.jMonth);
  }, [currentMonth.jYear, currentMonth.jMonth]);

  const goToPreviousMonth = () => {
    if (currentMonth.jMonth === 1) {
      setCurrentMonth({
        jYear: currentMonth.jYear - 1,
        jMonth: 12,
      });
    } else {
      setCurrentMonth({
        jYear: currentMonth.jYear,
        jMonth: currentMonth.jMonth - 1,
      });
    }
  };

  const goToNextMonth = () => {
    if (currentMonth.jMonth === 12) {
      setCurrentMonth({
        jYear: currentMonth.jYear + 1,
        jMonth: 1,
      });
    } else {
      setCurrentMonth({
        jYear: currentMonth.jYear,
        jMonth: currentMonth.jMonth + 1,
      });
    }
  };

  const goToToday = () => {
    setCurrentMonth({
      jYear: currentPersianDate.jYear,
      jMonth: currentPersianDate.jMonth,
    });
  };

  const isDateDisabled = (date: Date): boolean => {
    try {
      const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      if (minDate) {
        const normalizedMinDate = new Date(
          minDate.getFullYear(),
          minDate.getMonth(),
          minDate.getDate()
        );
        if (normalizedDate < normalizedMinDate) {
          console.log(
            `Date ${normalizedDate.toDateString()} is before minDate ${normalizedMinDate.toDateString()}`
          );
          return true;
        }
      }

      if (maxDate) {
        const normalizedMaxDate = new Date(
          maxDate.getFullYear(),
          maxDate.getMonth(),
          maxDate.getDate()
        );
        if (normalizedDate > normalizedMaxDate) {
          console.log(
            `Date ${normalizedDate.toDateString()} is after maxDate ${normalizedMaxDate.toDateString()}`
          );
          return true;
        }
      }

      const isExplicitlyDisabled = disabledDates.some((disabledDate) => {
        const normalizedDisabledDate = new Date(
          disabledDate.getFullYear(),
          disabledDate.getMonth(),
          disabledDate.getDate()
        );
        return normalizedDate.getTime() === normalizedDisabledDate.getTime();
      });

      if (isExplicitlyDisabled) {
        console.log(
          `Date ${normalizedDate.toDateString()} is explicitly disabled`
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error in isDateDisabled:", error);
      return false;
    }
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false;

    try {
      const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const normalizedSelected = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );
      return normalizedDate.getTime() === normalizedSelected.getTime();
    } catch (error) {
      console.error("Error in isDateSelected:", error);
      return false;
    }
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) {
      console.log("Date is disabled, not selecting:", date);
      return;
    }
    console.log("Selecting date:", date);
    onDateSelect?.(date);
  };

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            className="h-9 w-9 p-0 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="flex flex-col items-center">
            <h2 className="text-base font-bold text-gray-900">
              {PERSIAN_MONTHS[currentMonth.jMonth - 1]}{" "}
              {toPersianDigits(currentMonth.jYear)}
            </h2>
            {showToday && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 mt-1 h-6 px-2 rounded-md font-medium"
              >
                <CalendarIcon className="h-3 w-3 mr-1" />
                برو به امروز
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            className="h-9 w-9 p-0 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {PERSIAN_DAYS_SHORT.map((day, index) => (
            <div
              key={day}
              className={cn(
                "text-center text-xs font-semibold py-2",
                index === 6 ? "text-red-500" : "text-gray-600" // Friday in red
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((day, index) => {
            const isDisabled = isDateDisabled(day.date);
            const isSelected = isDateSelected(day.date);
            const isFriday = day.date.getDay() === 5; // Friday

            return (
              <button
                key={index}
                onClick={() => handleDateSelect(day.date)}
                disabled={isDisabled}
                className={cn(
                  "relative h-9 w-9 text-sm rounded-lg transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                  // Base states first
                  !isDisabled && "cursor-pointer",
                  // Current month styles
                  day.isCurrentMonth
                    ? "text-foreground"
                    : "text-muted-foreground opacity-50",
                  // Disabled styles (highest priority for disabled dates)
                  isDisabled && [
                    "opacity-30 cursor-not-allowed text-gray-400",
                    "hover:bg-transparent hover:text-gray-400", // Prevent hover effects on disabled dates
                  ],
                  // Non-selected, non-disabled hover states
                  !isSelected &&
                    !isDisabled && [
                      "hover:bg-accent hover:text-accent-foreground",
                      "hover:scale-105 hover:shadow-sm",
                    ],
                  // Today styles (only for non-selected dates)
                  day.isToday &&
                    !isSelected && [
                      "bg-primary/10 border-2 border-primary/20 font-semibold",
                    ],
                  // Holiday styles (only for non-selected dates)
                  showHolidays &&
                    day.isHoliday &&
                    !isSelected &&
                    "text-red-500 font-medium",
                  // Friday styles (only for non-selected, non-holiday dates)
                  isFriday && !isSelected && !day.isHoliday && "text-red-400",
                  // Selected styles (highest priority for selected dates)
                  isSelected && [
                    "bg-gradient-to-r from-blue-500 to-indigo-500", // More prominent gradient
                    "text-white font-bold",
                    "border-2 border-blue-600",
                    "shadow-lg shadow-blue-500/30",
                    "scale-105",
                    "ring-2 ring-blue-300 ring-offset-1",
                    // Prevent hover effects on selected dates
                    "hover:from-blue-600 hover:to-indigo-600",
                    "hover:shadow-xl hover:shadow-blue-500/40",
                  ]
                )}
                title={
                  isDisabled
                    ? `غیرفعال - ${getPersianDateString(day.date)}`
                    : day.isHoliday && day.holidayName
                      ? day.holidayName
                      : getPersianDateString(day.date)
                }
              >
                {toPersianDigits(day.jDay)}

                {/* Holiday indicator */}
                {showHolidays && day.isHoliday && !isSelected && (
                  <Star className="absolute -top-1 -right-1 h-3 w-3 text-red-500 fill-current" />
                )}

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  </div>
                )}

                {/* Today indicator (only for non-selected dates) */}
                {day.isToday && !isSelected && (
                  <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                )}

                {/* Debug indicator for disabled dates */}
                {import.meta.env.DEV && isDisabled && (
                  <div className="absolute top-0 left-0 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        {showHolidays && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-center gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>امروز</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-red-500 fill-current" />
                <span>تعطیل</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-400 rounded-full" />
                <span>جمعه</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersianCalendar;

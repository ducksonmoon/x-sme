// Persian Calendar Utilities using date-fns-jalali with Tehran timezone

import { isFriday } from "date-fns";
import {
  addDays as addDaysJalali,
  startOfWeek as startOfWeekJalali,
  startOfMonth as startOfMonthJalali,
  eachDayOfInterval as eachDayOfIntervalJalali,
  isToday as isTodayJalali,
  getDay as getDayJalali,
  getDate as getDateJalali,
  getMonth as getMonthJalali,
  getYear as getYearJalali,
  parse as parseJalali,
  format as formatJalali,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
} from "date-fns-jalali";

// Tehran timezone identifier
const TEHRAN_TIMEZONE = "Asia/Tehran";

// Persian month names
export const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

// Persian day names
export const PERSIAN_DAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
];

// Short Persian day names
export const PERSIAN_DAYS_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

// Iranian holidays (some major ones)
export const IRANIAN_HOLIDAYS = [
  // Nowruz holidays
  { jMonth: 1, jDay: 1, name: "جشن نوروز" },
  { jMonth: 1, jDay: 2, name: "عید نوروز" },
  { jMonth: 1, jDay: 3, name: "عید نوروز" },
  { jMonth: 1, jDay: 4, name: "عید نوروز" },

  // Other holidays
  { jMonth: 1, jDay: 12, name: "روز جمهوری اسلامی" },
  { jMonth: 1, jDay: 13, name: "سیزده بدر" },
  { jMonth: 3, jDay: 14, name: "رحلت امام خمینی" },
  { jMonth: 3, jDay: 15, name: "قیام ۱۵ خرداد" },
  { jMonth: 6, jDay: 30, name: "شهادت امام علی" },
  { jMonth: 11, jDay: 22, name: "پیروزی انقلاب اسلامی" },
];

/**
 * Get current date in Tehran timezone
 */
export function getTehranDate(): Date {
  try {
    // Create a new date in Tehran timezone
    const now = new Date();

    // Format the date in Tehran timezone and parse it back
    const tehranTimeString = now.toLocaleString("en-CA", {
      timeZone: TEHRAN_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Parse the Tehran time string back to a Date object
    const parts = tehranTimeString.split(", ");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error("Invalid Tehran time string format");
    }

    const [datePart, timePart] = parts;
    const dateParts = datePart.split("-").map(Number);
    const timeParts = timePart.split(":").map(Number);

    if (dateParts.length !== 3 || timeParts.length !== 3) {
      throw new Error("Invalid date/time format");
    }

    const [year, month, day] = dateParts;
    const [hour, minute, second] = timeParts;

    if (
      year === undefined ||
      month === undefined ||
      day === undefined ||
      hour === undefined ||
      minute === undefined ||
      second === undefined
    ) {
      throw new Error("Invalid parsed date/time values");
    }

    return new Date(year, month - 1, day, hour, minute, second);
  } catch (error) {
    console.error("Error getting Tehran date:", error);
    return new Date(); // Fallback to system time
  }
}

/**
 * Create a normalized date (midnight Tehran time)
 */
export function normalizeDate(date: Date): Date {
  try {
    // Get the date components in Tehran timezone
    const tehranDateString = date.toLocaleDateString("en-CA", {
      timeZone: TEHRAN_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const dateParts = tehranDateString.split("-").map(Number);
    if (dateParts.length !== 3) {
      throw new Error("Invalid Tehran date string format");
    }

    const [year, month, day] = dateParts;

    if (year === undefined || month === undefined || day === undefined) {
      throw new Error("Invalid parsed date values");
    }

    // Create a new date at midnight in Tehran timezone
    // We'll create it as local time but with Tehran's date
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  } catch (error) {
    console.error("Error normalizing date:", error);
    return setMilliseconds(setSeconds(setMinutes(setHours(date, 0), 0), 0), 0);
  }
}

/**
 * Convert date to Tehran timezone and return as Date object
 */
export function toTehranDate(date: Date): Date {
  try {
    if (!date || isNaN(date.getTime())) {
      return getTehranDate();
    }

    // Get the date/time components in Tehran timezone
    const tehranString = date.toLocaleString("en-CA", {
      timeZone: TEHRAN_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = tehranString.split(", ");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error("Invalid Tehran string format");
    }

    const [datePart, timePart] = parts;
    const dateParts = datePart.split("-").map(Number);
    const timeParts = timePart.split(":").map(Number);

    if (dateParts.length !== 3 || timeParts.length !== 3) {
      throw new Error("Invalid date/time format");
    }

    const [year, month, day] = dateParts;
    const [hour, minute, second] = timeParts;

    if (
      year === undefined ||
      month === undefined ||
      day === undefined ||
      hour === undefined ||
      minute === undefined ||
      second === undefined
    ) {
      throw new Error("Invalid parsed date/time values");
    }

    return new Date(year, month - 1, day, hour, minute, second);
  } catch (error) {
    console.error("Error converting to Tehran date:", error);
    return date;
  }
}

/**
 * Convert Gregorian date to Jalali using Tehran timezone (IMPROVED)
 */
export function gregorianToJalali(
  gYear: number,
  gMonth: number,
  gDay: number
): [number, number, number] {
  try {
    // Create a properly normalized gregorian date in Tehran timezone
    const gregorianDate = new Date(gYear, gMonth - 1, gDay, 12, 0, 0, 0); // Use noon to avoid timezone issues
    const tehranDate = toTehranDate(gregorianDate);

    if (isNaN(tehranDate.getTime())) {
      throw new Error(`Invalid Gregorian date: ${gYear}-${gMonth}-${gDay}`);
    }

    const jYear = getYearJalali(tehranDate);
    const jMonth = getMonthJalali(tehranDate) + 1; // getMonth returns 0-based index
    const jDay = getDateJalali(tehranDate);

    // Validate the result
    if (jYear < 1 || jMonth < 1 || jMonth > 12 || jDay < 1 || jDay > 31) {
      throw new Error(`Invalid Jalali result: ${jYear}-${jMonth}-${jDay}`);
    }

    return [jYear, jMonth, jDay];
  } catch (error) {
    console.error("Error converting Gregorian to Jalali:", error);
    // Return current Jalali date as fallback
    const today = getTehranDate();
    return [
      getYearJalali(today),
      getMonthJalali(today) + 1,
      getDateJalali(today),
    ];
  }
}

/**
 * Convert Jalali date to Gregorian using Tehran timezone (IMPROVED)
 */
export function jalaliToGregorian(
  jYear: number,
  jMonth: number,
  jDay: number
): [number, number, number] {
  try {
    // Validate input
    if (jYear < 1 || jMonth < 1 || jMonth > 12 || jDay < 1 || jDay > 31) {
      throw new Error(`Invalid Jalali date: ${jYear}-${jMonth}-${jDay}`);
    }

    // Create a Jalali date string and parse it
    const jalaliDateString = `${jYear}/${jMonth.toString().padStart(2, "0")}/${jDay.toString().padStart(2, "0")}`;
    const gregorianDate = parseJalali(
      jalaliDateString,
      "yyyy/MM/dd",
      new Date()
    );

    if (isNaN(gregorianDate.getTime())) {
      throw new Error(`Failed to parse Jalali date: ${jalaliDateString}`);
    }

    const tehranDate = toTehranDate(gregorianDate);

    return [
      tehranDate.getFullYear(),
      tehranDate.getMonth() + 1,
      tehranDate.getDate(),
    ];
  } catch (error) {
    console.error("Error converting Jalali to Gregorian:", error);
    // Fallback to today's date in Tehran
    const today = getTehranDate();
    return [today.getFullYear(), today.getMonth() + 1, today.getDate()];
  }
}

/**
 * Get Persian date string using Tehran timezone (IMPROVED)
 */
export function getPersianDateString(date: Date): string {
  try {
    if (!date || isNaN(date.getTime())) {
      throw new Error("Invalid date provided");
    }

    const tehranDate = toTehranDate(date);
    const jDay = getDateJalali(tehranDate);
    const jMonth = getMonthJalali(tehranDate) + 1; // getMonth returns 0-based index
    const jYear = getYearJalali(tehranDate);

    const monthName = PERSIAN_MONTHS[jMonth - 1];
    if (!monthName) {
      throw new Error(`Invalid month index: ${jMonth}`);
    }

    return `${toPersianDigits(jDay)} ${monthName} ${toPersianDigits(jYear)}`;
  } catch (error) {
    console.error("Error getting Persian date string:", error);
    return "تاریخ نامشخص";
  }
}

/**
 * Get Persian day name using Tehran timezone (IMPROVED)
 */
export function getPersianDayName(date: Date): string {
  try {
    if (!date || isNaN(date.getTime())) {
      throw new Error("Invalid date provided");
    }

    const tehranDate = toTehranDate(date);
    const dayIndex = getDayJalali(tehranDate);

    // Validate day index
    if (dayIndex < 0 || dayIndex > 6) {
      throw new Error(`Invalid day index: ${dayIndex}`);
    }

    // In date-fns-jalali: Saturday = 0, Sunday = 1, ..., Friday = 6
    const dayName = PERSIAN_DAYS[dayIndex];
    if (!dayName) {
      throw new Error(`No day name for index: ${dayIndex}`);
    }

    return dayName;
  } catch (error) {
    console.error("Error getting Persian day name:", error);
    return "نامشخص";
  }
}

/**
 * Check if a date is a holiday using Tehran timezone (IMPROVED)
 */
export function isHoliday(date: Date): { isHoliday: boolean; name?: string } {
  try {
    if (!date || isNaN(date.getTime())) {
      return { isHoliday: false };
    }

    const tehranDate = toTehranDate(date);

    // Check if it's Friday (weekend in Iran)
    if (isFriday(tehranDate)) {
      return { isHoliday: true, name: "تعطیل هفتگی" };
    }

    const jMonth = getMonthJalali(tehranDate) + 1; // getMonth returns 0-based index
    const jDay = getDateJalali(tehranDate);

    // Check Iranian holidays
    const holiday = IRANIAN_HOLIDAYS.find(
      (h) => h.jMonth === jMonth && h.jDay === jDay
    );

    if (holiday) {
      return { isHoliday: true, name: holiday.name };
    }

    return { isHoliday: false };
  } catch (error) {
    console.error("Error checking holiday:", error);
    return { isHoliday: false };
  }
}

/**
 * Get calendar days for a Persian month using Tehran timezone (IMPROVED)
 */
export function getPersianMonthDays(
  jYear: number,
  jMonth: number
): Array<{
  date: Date;
  jDay: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isHoliday: boolean;
  holidayName?: string;
}> {
  const days: Array<{
    date: Date;
    jDay: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isHoliday: boolean;
    holidayName?: string;
  }> = [];

  try {
    // Validate input
    if (jYear < 1 || jMonth < 1 || jMonth > 12) {
      throw new Error(`Invalid Jalali date: ${jYear}-${jMonth}`);
    }

    // Create first day of the month
    const firstDayJalali = parseJalali(
      `${jYear}/${jMonth.toString().padStart(2, "0")}/01`,
      "yyyy/MM/dd",
      new Date()
    );

    if (isNaN(firstDayJalali.getTime())) {
      throw new Error(
        `Failed to create first day of month: ${jYear}-${jMonth}-01`
      );
    }

    // Get start and end of the month
    const monthStart = startOfMonthJalali(firstDayJalali);

    // Get the Saturday before the first day (start of Persian week)
    const startOfWeekDate = startOfWeekJalali(monthStart, { weekStartsOn: 6 }); // Saturday = 6

    // Generate 42 days (6 weeks)
    const endDate = addDaysJalali(startOfWeekDate, 41);
    const allDays = eachDayOfIntervalJalali({
      start: startOfWeekDate,
      end: endDate,
    });

    // Get today in Tehran timezone for comparison
    const todayTehran = normalizeDate(getTehranDate());

    allDays.forEach((currentDate) => {
      try {
        const tehranCurrentDate = toTehranDate(currentDate);
        const normalizedCurrentDate = normalizeDate(tehranCurrentDate);
        const currentJYear = getYearJalali(normalizedCurrentDate);
        const currentJMonth = getMonthJalali(normalizedCurrentDate) + 1; // getMonth returns 0-based index
        const currentJDay = getDateJalali(normalizedCurrentDate);

        const holiday = isHoliday(normalizedCurrentDate);

        // Check if this is today by comparing normalized dates
        const isToday =
          normalizedCurrentDate.getTime() === todayTehran.getTime();

        const dayInfo: {
          date: Date;
          jDay: number;
          isCurrentMonth: boolean;
          isToday: boolean;
          isHoliday: boolean;
          holidayName?: string;
        } = {
          date: normalizedCurrentDate,
          jDay: currentJDay,
          isCurrentMonth: currentJMonth === jMonth && currentJYear === jYear,
          isToday: isToday,
          isHoliday: holiday.isHoliday,
        };

        if (holiday.name) {
          dayInfo.holidayName = holiday.name;
        }

        days.push(dayInfo);
      } catch (dayError) {
        console.error("Error processing day:", currentDate, dayError);
        // Skip this day if there's an error
      }
    });

    return days;
  } catch (error) {
    console.error("Error getting Persian month days:", error);
    return [];
  }
}

/**
 * Get current Persian date using Tehran timezone (IMPROVED)
 */
export function getCurrentPersianDate(): {
  jYear: number;
  jMonth: number;
  jDay: number;
} {
  try {
    const today = getTehranDate();
    const jYear = getYearJalali(today);
    const jMonth = getMonthJalali(today) + 1; // getMonth returns 0-based index
    const jDay = getDateJalali(today);

    // Validate the result
    if (jYear < 1 || jMonth < 1 || jMonth > 12 || jDay < 1 || jDay > 31) {
      throw new Error(
        `Invalid current Persian date: ${jYear}-${jMonth}-${jDay}`
      );
    }

    return { jYear, jMonth, jDay };
  } catch (error) {
    console.error("Error getting current Persian date:", error);
    return { jYear: 1403, jMonth: 1, jDay: 1 }; // Fallback
  }
}

/**
 * Format Persian numbers (IMPROVED)
 */
export function toPersianDigits(num: string | number): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(
    /\d/g,
    (digit) => persianDigits[parseInt(digit)] || digit
  );
}

/**
 * Convert Persian digits to English digits
 */
export function toEnglishDigits(str: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  let result = str;

  persianDigits.forEach((persian, index) => {
    const regex = new RegExp(persian, "g");
    result = result.replace(regex, index.toString());
  });

  return result;
}

/**
 * Add days to a Persian date using Tehran timezone (IMPROVED)
 */
export function addDaysToPersianDate(
  jYear: number,
  jMonth: number,
  jDay: number,
  days: number
): {
  jYear: number;
  jMonth: number;
  jDay: number;
  gregorianDate: Date;
} {
  try {
    // Validate input
    if (jYear < 1 || jMonth < 1 || jMonth > 12 || jDay < 1 || jDay > 31) {
      throw new Error(`Invalid Jalali date: ${jYear}-${jMonth}-${jDay}`);
    }

    // Create Jalali date
    const jalaliDateString = `${jYear}/${jMonth.toString().padStart(2, "0")}/${jDay.toString().padStart(2, "0")}`;
    const jalaliDate = parseJalali(jalaliDateString, "yyyy/MM/dd", new Date());

    if (isNaN(jalaliDate.getTime())) {
      throw new Error(`Failed to parse Jalali date: ${jalaliDateString}`);
    }

    // Add days using Jalali calendar
    const newJalaliDate = addDaysJalali(jalaliDate, days);
    const tehranDate = toTehranDate(newJalaliDate);
    const normalizedDate = normalizeDate(tehranDate);

    const newJYear = getYearJalali(normalizedDate);
    const newJMonth = getMonthJalali(normalizedDate) + 1; // getMonth returns 0-based index
    const newJDay = getDateJalali(normalizedDate);

    return {
      jYear: newJYear,
      jMonth: newJMonth,
      jDay: newJDay,
      gregorianDate: normalizedDate,
    };
  } catch (error) {
    console.error("Error adding days to Persian date:", error);
    const fallbackDate = getTehranDate();
    return {
      jYear: getYearJalali(fallbackDate),
      jMonth: getMonthJalali(fallbackDate) + 1,
      jDay: getDateJalali(fallbackDate),
      gregorianDate: fallbackDate,
    };
  }
}

/**
 * Parse Persian date string to Date object using Tehran timezone (IMPROVED)
 */
export function parsePersianDate(dateString: string): Date | null {
  try {
    if (!dateString || typeof dateString !== "string") {
      return null;
    }

    // Convert Persian digits to English
    const normalizedString = toEnglishDigits(dateString.trim());

    // Try to parse common Persian date formats
    const formats = ["yyyy/MM/dd", "yyyy-MM-dd", "dd/MM/yyyy", "dd-MM-yyyy"];

    for (const format of formats) {
      try {
        const parsed = parseJalali(normalizedString, format, new Date());
        if (parsed && !isNaN(parsed.getTime())) {
          return toTehranDate(parsed);
        }
      } catch {
        // Continue to next format
      }
    }

    return null;
  } catch (error) {
    console.error("Error parsing Persian date:", error);
    return null;
  }
}

/**
 * Format a date using Persian calendar in Tehran timezone (IMPROVED)
 */
export function formatPersianDate(
  date: Date,
  pattern: string = "yyyy/MM/dd"
): string {
  try {
    if (!date || isNaN(date.getTime())) {
      throw new Error("Invalid date provided");
    }

    const tehranDate = toTehranDate(date);
    return formatJalali(tehranDate, pattern);
  } catch (error) {
    console.error("Error formatting Persian date:", error);
    return "";
  }
}

/**
 * Compare two dates safely using Tehran timezone (IMPROVED)
 */
export function compareDates(date1: Date, date2: Date): number {
  try {
    const tehranDate1 = normalizeDate(toTehranDate(date1));
    const tehranDate2 = normalizeDate(toTehranDate(date2));

    return tehranDate1.getTime() - tehranDate2.getTime();
  } catch (error) {
    console.error("Error comparing dates:", error);
    return 0;
  }
}

/**
 * Check if two dates are the same day using Tehran timezone (IMPROVED)
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  try {
    return compareDates(date1, date2) === 0;
  } catch (error) {
    console.error("Error checking if same day:", error);
    return false;
  }
}

/**
 * Format date as YYYY-MM-DD in Tehran timezone (IMPROVED)
 */
export function formatLocalDateString(date: Date): string {
  try {
    if (!date || isNaN(date.getTime())) {
      throw new Error("Invalid date provided");
    }

    const tehranDate = toTehranDate(date);
    const year = tehranDate.getFullYear();
    const month = (tehranDate.getMonth() + 1).toString().padStart(2, "0");
    const day = tehranDate.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting local date string:", error);
    return "";
  }
}

/**
 * Parse date string in YYYY-MM-DD format to Tehran Date (IMPROVED)
 */
export function parseLocalDateString(
  dateString: string | null | undefined
): Date | null {
  try {
    if (!dateString || typeof dateString !== "string") {
      return null;
    }

    const parts = dateString.split("-");
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
      return null;
    }

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-based in Date constructor
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return null;
    }

    // Create date at noon Tehran time to avoid timezone issues
    const date = new Date(year, month, day, 12, 0, 0, 0);

    if (isNaN(date.getTime())) {
      return null;
    }

    // Convert to Tehran timezone and normalize to midnight
    return normalizeDate(toTehranDate(date));
  } catch (error) {
    console.error("Error parsing local date string:", error);
    return null;
  }
}

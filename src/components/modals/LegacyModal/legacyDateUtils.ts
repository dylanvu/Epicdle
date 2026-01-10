// Utility functions for computing available legacy game dates

export interface DateEntry {
  date: string;    // Display format: "Jan. 9th"
  dateKey: string; // API format: "2026-1-9"
}

export interface MonthData {
  month: string;
  dates: DateEntry[];
}

export interface YearData {
  year: number;
  months: MonthData[];
}

export interface LegacyCalendarData {
  years: YearData[];
}

// Start dates for each game mode (represented as calendar dates at midnight UTC)
// These represent the calendar date of Day 1 for each mode
// (The actual game started at 11 PM PST the night before, but we track by calendar date)
const MODE_START_DATES = {
  classic: new Date("2025-11-05T00:00:00.000Z"), // Nov 5, 2025 (Day 1)
  legend: new Date("2026-01-09T00:00:00.000Z"),  // Jan 9, 2026 (Day 1)
};

const MONTH_ABBREVIATIONS = [
  "Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.",
  "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec.",
];

const MONTH_FULL_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Helper function to get ordinal suffix for a day number
function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return "th";
  }
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

/**
 * Get the current "game date" based on the 11 PM PST reset
 * If before 11 PM PST, returns yesterday's date
 * If at/after 11 PM PST, returns today's date
 */
function getCurrentGameDate(): Date {
  const now = new Date();
  
  // 11 PM PST = 7 AM UTC next day
  // So we check: if current UTC hour is < 7, the game date is "yesterday" in UTC
  // Actually, let's think about this differently:
  // 
  // Reset happens at 11 PM PST = 7 AM UTC
  // If it's before 7 AM UTC, we're still on the previous game day
  // If it's at/after 7 AM UTC, we're on the current game day
  
  const utcHour = now.getUTCHours();
  const utcDate = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));
  
  if (utcHour < 7) {
    // Before reset, game date is previous day
    utcDate.setUTCDate(utcDate.getUTCDate() - 1);
  }
  
  return utcDate;
}

/**
 * Format a date as "Mon. Nth" (e.g., "Jan. 9th") for display
 */
function formatDateString(date: Date): string {
  const month = MONTH_ABBREVIATIONS[date.getUTCMonth()];
  const day = date.getUTCDate();
  const suffix = getOrdinalSuffix(day);
  return `${month} ${day}${suffix}`;
}

/**
 * Format a date as "YYYY-M-D" (e.g., "2026-1-9") for API queries
 * Matches the format expected by getDailyKey() in time.ts
 */
function formatDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // months are 0-based
  const day = date.getUTCDate();
  return `${year}-${month}-${day}`;
}

/**
 * Generate all available legacy dates for a given mode
 * Returns dates grouped by year and month, in descending order
 * Excludes the current game date (playable via main menu)
 */
export function getAvailableLegacyDates(mode: "classic" | "legend"): LegacyCalendarData {
  const startDate = MODE_START_DATES[mode];
  const currentGameDate = getCurrentGameDate();
  
  // Calculate the last legacy date (one day before current game date)
  const lastLegacyDate = new Date(currentGameDate);
  lastLegacyDate.setUTCDate(lastLegacyDate.getUTCDate() - 1);
  
  // If start date is after or equal to current game date, no legacy dates available
  if (startDate >= currentGameDate) {
    return { years: [] };
  }
  
  // Generate all dates from start to lastLegacyDate
  const allDates: Date[] = [];
  const current = new Date(startDate);
  
  while (current <= lastLegacyDate) {
    allDates.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  
  // Group by year and month
  const yearMap = new Map<number, Map<number, Date[]>>();
  
  for (const date of allDates) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    
    if (!yearMap.has(year)) {
      yearMap.set(year, new Map());
    }
    const monthMap = yearMap.get(year)!;
    
    if (!monthMap.has(month)) {
      monthMap.set(month, []);
    }
    monthMap.get(month)!.push(date);
  }
  
  // Convert to output format, sorted descending
  const years: YearData[] = [];
  const sortedYears = Array.from(yearMap.keys()).sort((a, b) => b - a);
  
  for (const year of sortedYears) {
    const monthMap = yearMap.get(year)!;
    const months: MonthData[] = [];
    
    // Sort months descending (December first)
    const sortedMonths = Array.from(monthMap.keys()).sort((a, b) => b - a);
    
    for (const monthIndex of sortedMonths) {
      const dates = monthMap.get(monthIndex)!;
      
      // Sort dates descending and format
      const sortedDates = dates
        .sort((a, b) => b.getTime() - a.getTime())
        .map(d => ({ 
          date: formatDateString(d),
          dateKey: formatDateKey(d)
        }));
      
      months.push({
        month: MONTH_FULL_NAMES[monthIndex],
        dates: sortedDates,
      });
    }
    
    years.push({ year, months });
  }
  
  return { years };
}

/**
 * Check if there are any legacy dates available for a mode
 */
export function hasLegacyDates(mode: "classic" | "legend"): boolean {
  const data = getAvailableLegacyDates(mode);
  return data.years.length > 0 && data.years.some(y => y.months.length > 0);
}

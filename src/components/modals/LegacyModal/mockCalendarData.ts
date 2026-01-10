// TypeScript interfaces for calendar mock data
export interface DateEntry {
  date: string;
}

export interface MonthData {
  month: string;
  dates: DateEntry[];
}

export interface CalendarResponse {
  months: MonthData[];
}

// Helper function to get ordinal suffix for a day number
function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return "th";
  }
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

// Month abbreviations
const monthAbbreviations = [
  "Jan.",
  "Feb.",
  "Mar.",
  "Apr.",
  "May",
  "Jun.",
  "Jul.",
  "Aug.",
  "Sep.",
  "Oct.",
  "Nov.",
  "Dec.",
];

const monthFullNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Get the number of days in a specific month for a given year
function getDaysInMonth(year: number, month: number): number {
  // month is 0-indexed (0 = January, 11 = December)
  // Using day 0 of the next month gives us the last day of the current month
  return new Date(year, month + 1, 0).getDate();
}

// Generate mock calendar data for a given year with realistic month lengths
// Months are in reverse order (December → January)
function generateMockCalendarData(year: number): CalendarResponse {
  const months: MonthData[] = [];

  // Generate months in reverse order (December → January)
  for (let monthIndex = 11; monthIndex >= 0; monthIndex--) {
    const dates: DateEntry[] = [];
    const abbrev = monthAbbreviations[monthIndex];
    const daysInMonth = getDaysInMonth(year, monthIndex);

    // Generate days in descending order (31/30/28 → 1)
    for (let day = daysInMonth; day >= 1; day--) {
      const suffix = getOrdinalSuffix(day);
      dates.push({
        date: `${abbrev} ${day}${suffix}`,
      });
    }

    months.push({
      month: monthFullNames[monthIndex],
      dates,
    });
  }

  return { months };
}

// Mock data for 2025 - all 12 months with realistic day counts
export const mock2025Response: CalendarResponse = generateMockCalendarData(2025);

// Mock data for 2026 - January only (current partial year, 9 days so far)
export const mock2026Response: CalendarResponse = {
  months: [
    {
      month: "January",
      dates: [
        { date: "Jan. 9th" },
        { date: "Jan. 8th" },
        { date: "Jan. 7th" },
        { date: "Jan. 6th" },
        { date: "Jan. 5th" },
        { date: "Jan. 4th" },
        { date: "Jan. 3rd" },
        { date: "Jan. 2nd" },
        { date: "Jan. 1st" },
      ],
    },
  ],
};

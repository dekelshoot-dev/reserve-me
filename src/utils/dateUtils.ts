/**
 * Utility functions for date parsing, formatting, and accurate calendar matching.
 */

export function toLocalIsoString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const FRENCH_MONTH_MAP: Record<string, number> = {
  janvier: 0, janv: 0, jan: 0,
  février: 1, fevrier: 1, févr: 1, fevr: 1, fev: 1,
  mars: 2, mar: 2,
  avril: 3, avr: 3,
  mai: 4,
  juin: 5, jun: 5,
  juillet: 6, juil: 6, jul: 6,
  août: 7, aout: 7, aou: 7,
  septembre: 8, sept: 8, sep: 8,
  octobre: 9, oct: 9,
  novembre: 10, nov: 10,
  décembre: 11, decembre: 11, déc: 11, dec: 11
};

/**
 * Checks if an appointment matches a target calendar Date object with strict precision.
 * Prevents false substring matches (e.g., "16" matching day "6" or year "2026" matching day "26").
 */
export function isSameCalendarDay(
  apt: { dateStr?: string; dateIso?: string },
  targetDate: Date
): boolean {
  if (!apt) return false;

  const targetIso = toLocalIsoString(targetDate);

  // 1. Exact match by dateIso if available
  if (apt.dateIso && apt.dateIso.trim().length >= 10) {
    const cleanIso = apt.dateIso.trim().substring(0, 10);
    return cleanIso === targetIso;
  }

  if (!apt.dateStr) return false;
  const rawStr = apt.dateStr.trim().toLowerCase();

  // 2. Relative "Aujourd'hui" check
  if (rawStr.includes("aujourd'hui")) {
    return targetIso === toLocalIsoString(new Date());
  }

  // 3. ISO pattern inside dateStr (e.g. "2026-11-06")
  const isoMatch = rawStr.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${y}-${m}-${d}` === targetIso;
  }

  // 4. French written date parsing (e.g. "mardi 16 novembre 2026" or "16 oct.")
  let foundMonth: number | null = null;
  for (const [monthKey, monthIdx] of Object.entries(FRENCH_MONTH_MAP)) {
    const regex = new RegExp(`\\b${monthKey}\\.?\\b`, 'i');
    if (regex.test(rawStr)) {
      foundMonth = monthIdx;
      break;
    }
  }

  // Extract 4-digit year if present
  const yearMatch = rawStr.match(/\b(20\d{2})\b/);
  const parsedYear = yearMatch ? parseInt(yearMatch[1], 10) : targetDate.getFullYear();

  if (foundMonth !== null) {
    // Remove year digits so "2026" doesn't get parsed as day number 20!
    const textWithoutYear = rawStr.replace(/\b20\d{2}\b/g, '');
    const dayMatches = textWithoutYear.match(/\b(3[01]|[12][0-9]|[1-9])\b/g);

    if (dayMatches && dayMatches.length > 0) {
      const parsedDay = parseInt(dayMatches[0], 10);

      return (
        targetDate.getDate() === parsedDay &&
        targetDate.getMonth() === foundMonth &&
        targetDate.getFullYear() === parsedYear
      );
    }
  }

  // 5. Fallback for DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = rawStr.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    const padD = String(d).padStart(2, '0');
    const padM = String(m).padStart(2, '0');
    return `${y}-${padM}-${padD}` === targetIso;
  }

  return false;
}

export function isSameCalendarMonth(apt: { dateStr?: string; dateIso?: string }, targetDate: Date): boolean {
  if (apt.dateIso && apt.dateIso.trim().length >= 7) {
    const parts = apt.dateIso.trim().split('-');
    if (parts.length >= 2) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      return y === targetDate.getFullYear() && m === targetDate.getMonth();
    }
  }

  const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const checkDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), i);
    if (isSameCalendarDay(apt, checkDate)) return true;
  }
  return false;
}

export function isWithinMonths(apt: { dateStr?: string; dateIso?: string }, numMonths: number): boolean {
  const now = new Date();
  const pastLimit = new Date(now.getFullYear(), now.getMonth() - numMonths, 1);
  if (apt.dateIso) {
    const d = new Date(apt.dateIso);
    if (!isNaN(d.getTime())) {
      return d >= pastLimit;
    }
  }
  return true;
}

export function isSameCalendarYear(apt: { dateStr?: string; dateIso?: string }, year: number): boolean {
  if (apt.dateIso) {
    const parts = apt.dateIso.trim().split('-');
    if (parts.length >= 1) {
      return parseInt(parts[0], 10) === year;
    }
  }
  if (apt.dateStr && apt.dateStr.includes(String(year))) return true;
  return true;
}

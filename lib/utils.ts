import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { EventStatus } from "@/lib/types/managed-event"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parse a date value that could be an ISO string, Firestore Timestamp,
 * or serialised { _seconds } object into a JS Date.
 */
function parseAnyDate(value: unknown): Date | null {
  if (!value) return null;
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "object") {
    if ("toDate" in (value as any) && typeof (value as any).toDate === "function") {
      return (value as any).toDate();
    }
    const secs = (value as any)._seconds ?? (value as any).seconds;
    if (typeof secs === "number") return new Date(secs * 1000);
  }
  return null;
}

/**
 * Derives the correct EventStatus purely from the event's start/end dates
 * relative to now. Used for automatic status updates.
 *
 *  - No startDate yet              → UPCOMING
 *  - now < startDate               → UPCOMING
 *  - startDate ≤ now ≤ endDate     → ONGOING
 *  - now > endDate (or no endDate) → COMPLETED  (no endDate = indefinitely ongoing → ONGOING)
 */
export function computeEventStatus(
  startDate: unknown,
  endDate: unknown,
): EventStatus {
  const start = parseAnyDate(startDate);
  if (!start) return "UPCOMING";
  const now = new Date();
  if (now < start) return "UPCOMING";
  const end = parseAnyDate(endDate);
  if (end) {
    if (now <= end) return "ONGOING";
    return "COMPLETED";
  }
  // started but no end date set → treat as ongoing
  return "ONGOING";
}

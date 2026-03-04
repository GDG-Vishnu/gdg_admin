import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { EventStatus } from "@/lib/types/managed-event"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): EventStatus {
  if (!startDate) return "UPCOMING";
  const now = new Date();
  const start = new Date(startDate);
  if (now < start) return "UPCOMING";
  if (endDate) {
    const end = new Date(endDate);
    if (now <= end) return "ONGOING";
    return "COMPLETED";
  }
  // started but no end date set → treat as ongoing
  return "ONGOING";
}

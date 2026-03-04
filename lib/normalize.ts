/**
 * Ensures a value is an array. Handles cases where Firestore stores
 * array fields as a single string, a comma-separated string,
 * or already a proper array.
 */
function toArray(value: unknown): string[] {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value.length > 0) {
        if (value.startsWith("[")) {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) return parsed;
            } catch {
            }
        }
        return value.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
}

/**
 * Converts a Firestore Timestamp (or Timestamp-like object) to a
 * "YYYY-MM-DD HH:MM:SS" string. Returns the original value if it's
 * already a string, or "" if it can't be converted.
 */
function timestampToString(value: unknown): string {
    if (typeof value === "string") return value;
    if (!value || typeof value !== "object") return "";

    // Firestore Admin SDK Timestamp: has toDate()
    if ("toDate" in value && typeof (value as any).toDate === "function") {
        const d: Date = (value as any).toDate();
        return formatDate(d);
    }

    // Serialized Timestamp: { _seconds, _nanoseconds } or { seconds, nanoseconds }
    const secs = (value as any)._seconds ?? (value as any).seconds;
    if (typeof secs === "number") {
        return formatDate(new Date(secs * 1000));
    }

    return "";
}

function formatDate(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Normalizes event data from Firestore to ensure all array fields
 * are proper JavaScript arrays regardless of how they are stored,
 * and that Date/Time fields are always strings.
 */
export function normalizeEventData(
    data: Record<string, unknown>,
): Record<string, unknown> {
    return {
        ...data,
        Date: timestampToString(data.Date),
        Time: typeof data.Time === "string" ? data.Time : "",
        tags: toArray(data.tags),
        Theme: toArray(data.Theme),
        keyHighlights: toArray(data.keyHighlights),
        eventGallery: toArray(data.eventGallery),
    };
}

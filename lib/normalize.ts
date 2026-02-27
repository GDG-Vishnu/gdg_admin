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
 * Normalizes event data from Firestore to ensure all array fields
 * are proper JavaScript arrays regardless of how they are stored.
 */
export function normalizeEventData(
    data: Record<string, unknown>,
): Record<string, unknown> {
    return {
        ...data,
        tags: toArray(data.tags),
        Theme: toArray(data.Theme),
        keyHighlights: toArray(data.keyHighlights),
        eventGallery: toArray(data.eventGallery),
    };
}

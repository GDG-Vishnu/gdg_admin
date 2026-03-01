# Firestore Database Schema

This document outlines the NoSQL schema structure for the GDG Admin Portal in Firebase Firestore. Since Firestore is document-based and schemaless, this represents the expected shape of the documents in each collection.

> **Last verified:** February 27, 2026 — via `scripts/analyzeSchema.ts` against live Firestore data.

---

## Collections Overview

| Collection Name  | Purpose                                                      | Doc Count |
|------------------|--------------------------------------------------------------|-----------|
| `events`         | GDG events, their status, details, and media.                | 7         |
| `team_members`   | GDG chapter team members, their roles, and social links.     | 35        |
| `gallery`        | Uploaded images/media gallery.                               | 24        |
| `users`          | Admin users who can access the GDG Admin Portal.             | 1         |
| `client_users`   | Registered community users (public-facing).                  | 1+        |
| `forms`          | Custom dynamic forms created by admins. *(no docs yet)*      | 0         |
| `form_responses` | Submitted responses to the dynamic forms. *(no docs yet)*    | 0         |

---

## Document Structures

### 1. `events` Collection
Contains details for upcoming or past GDG events.

> **⚠ Storage Quirk:** Several fields (`Theme`, `tags`, `keyHighlights`, `eventGallery`, `isDone`)
> are stored as **JSON-stringified strings** in Firestore, not as native arrays/booleans.
> The app normalizes these at read time via `lib/normalize.ts`.

```typescript
interface Event {
  id: string;              // Stored as a field (NOT the Firestore doc ID)
  title: string;
  description: string;
  Date: string;            // Date string e.g. "2025-10-18 00:00:00"
  Time: string;            // Time string e.g. "09:00 - 16:00" (sometimes a date string)
  venue: string;
  organizer: string;
  coOrganizer: string;
  status: string;          // e.g., "Completed"
  isDone: string;          // ⚠ Stored as string "true"/"false", not boolean
  rank: number;
  MembersParticipated: number;
  keyHighlights: string;   // ⚠ JSON-stringified string[] — normalized by lib/normalize.ts
  tags: string;            // ⚠ JSON-stringified string[] — normalized by lib/normalize.ts
  Theme: string;           // ⚠ JSON-stringified string[] (5 hex colors) — normalized by lib/normalize.ts
  eventGallery: string;    // ⚠ JSON-stringified string[] (image URLs) — normalized by lib/normalize.ts
  imageUrl: string;        // Display image (Cloudinary URL)
  coverUrl: string;        // Cover banner image (Cloudinary URL)
}
```

### 2. `team_members` Collection
Represents a GDG organizer or team member (35 docs, sampled 10).
```typescript
interface TeamMember {
  id: string;              // UUID stored as a field (NOT the Firestore doc ID)
  name: string;
  designation: string;     // e.g. "Lead", "Co Lead"
  position: string;        // e.g. "Event Management", "Communication"
  imageUrl: string;        // Cloudinary URL
  logo: string;            // Pinterest pin URL (team logo/icon)
  dept_logo: string;       // Flaticon URL (department icon)
  bgColor: string;         // Hex color e.g. "#F8D8D8"
  linkedinUrl: string;     // Full LinkedIn profile URL
  mail: string;            // College email address
  rank: number;            // Individual rank within position
  dept_rank: number;       // Department/position group rank
}
```

### 3. `gallery` Collection
Used to maintain the GDG chapter's global image footprint (24 docs).
```typescript
interface Gallery {
  id: number;              // ⚠ Numeric ID (not the Firestore doc ID)
  imageUrl: string;        // Cloudinary URL
  uploadedAt: string;      // Date string e.g. "2025-12-31 00:00:00" (not a Timestamp)
}
```

### 4. `users` Collection
Internal user accounts managing the admin portal (1 doc).
```typescript
interface User {
  // Firestore doc ID is the primary identifier (no separate `id` field)
  name: string;
  email: string;           // Must be unique (enforced via application logic)
  password: string;        // SHA-256 hex hash
  isAdmin: boolean;
  createdAt: string;       // ISO string e.g. "2026-02-27T06:53:38.427Z"
  updatedAt: string;       // ISO string
}
```

### 5. `forms` Collection *(no documents yet)*
Dynamic forms builder configuration schemas. Structure defined by API routes:
```typescript
interface Form {
  // Firestore doc ID is the primary identifier
  title: string;
  description?: string;
  isActive: boolean;       // Default: true
  fields: FormField[];     // Array of input definitions
  steps?: FormStep[];      // Array of step definitions for multi-step forms
  createdAt: Timestamp;    // Firestore FieldValue.serverTimestamp()
  updatedAt: Timestamp;    // Firestore FieldValue.serverTimestamp()
}
```

### 6. `form_responses` Collection *(no documents yet)*
User submissions for the forms built above. Structure defined by API routes:
```typescript
interface FormResponse {
  // Firestore doc ID is the primary identifier
  formId: string;          // Soft reference to `forms` doc ID
  data: Record<string, any>; // Submission payload keyed by field ID
  submittedAt: Timestamp;  // Firestore FieldValue.serverTimestamp()
}
```

---

## Important Notes

### Data Quirks (from legacy migration)
The `events` collection was migrated from a SQL database and several array/boolean fields
were stored as JSON-stringified strings rather than native Firestore types. The application
handles this transparently via `lib/normalize.ts` which parses these strings into proper
arrays at read time.

Fields affected: `Theme`, `tags`, `keyHighlights`, `eventGallery`, `isDone`.

---

### 7. `client_users` Collection
Registered community users from the public-facing app.

| Field              | Type         | Example / Notes                          |
|--------------------|--------------|------------------------------------------|
| `name`             | `string`     | `"John Doe"`                             |
| `email`            | `string`     | `"john@example.com"`                     |
| `profileUrl`       | `string`     | Google profile photo URL                 |
| `resumeUrl`        | `string`     | Link to uploaded resume                  |
| `phoneNumber`      | `string`     | `"9876543210"`                           |
| `branch`           | `string`     | `"CSE"`, `"ECE"`, etc.                   |
| `graduationYear`   | `number`     | `2027`                                   |
| `role`             | `string`     | `"user"` (default)                       |
| `isBlocked`        | `boolean`    | `false`                                  |
| `profileCompleted` | `boolean`    | `true` / `false`                         |
| `participations`   | `array`      | Array of event/form IDs the user joined  |
| `socialMedia`      | `map`        | `{ linkedin, github, twitter }` — URLs   |
| `createdAt`        | `Timestamp`  | Firestore server timestamp               |
| `updatedAt`        | `Timestamp`  | Firestore server timestamp               |

---

## Notes

### Schema Enforcement
Firestore does not strictly enforce this schema at the database layer.

* **Validation:** Application-level checks and TypeScript logic ensure data matches these shapes.
* **Relations:** No hard foreign keys. `formId` in `form_responses` is a soft reference.
* **Cascading Deletes:** Deleting a form automatically deletes all matching `form_responses` via batch operations in `app/api/forms/[id]/route.ts`.

### Schema Analysis
Run `npx tsx scripts/analyzeSchema.ts` to re-analyze the live Firestore data and compare
against this document. The script samples up to 10 documents per collection and reports
field names, types, and sample values.

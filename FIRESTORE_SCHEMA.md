# Firestore Database Schema

This document outlines the NoSQL schema structure for the GDG Admin Portal in Firebase Firestore. Since Firestore is document-based and schemaless, this represents the expected shape of the documents in each collection.

---

## Collections Overview

| Collection Name | Purpose |
|-----------------|---------|
| `team_members`  | Stores GDG chapter team members, their roles, and social links. |
| `events`        | Stores GDG events, their status, details, and media. |
| `gallery`       | Stores uploaded images/media gallery. |
| `users`         | Admin users who can access the GDG Admin Portal. |
| `forms`         | Custom dynamic forms created by admins. |
| `form_responses`| Submitted responses to the dynamic forms. |

---

## Document Structures

### 1. `team_members` Collection
Represents a GDG organizer or team member.
```typescript
interface TeamMember {
  id: string;              // Auto-generated Firestore Document ID
  name: string;
  designation: string;
  position?: string;
  imageUrl: string; 
  logo?: string;
  dept_logo?: string;
  bgColor?: string;
  linkedinUrl?: string;
  mail?: string;
  rank: number;            // Default: 0
  dept_rank: number;       // Default: 0
}
```

### 2. `events` Collection
Contains details for upcoming or past GDG events.
```typescript
interface Event {
  id: string;              // Auto-generated Firestore Document ID
  title: string;
  description: string;
  Date: string | Date;     // Event Date (ISO format or Firestore Timestamp)
  Time: string;            // Time string (e.g. "10:00 AM")
  venue: string;
  organizer: string;
  coOrganizer?: string;
  status: string;          // e.g., "Upcoming", "Completed"
  isDone: boolean;         // Default: false
  rank: number;            // Default: 0
  MembersParticipated: number; // Default: 0
  keyHighlights: string[]; // Array of strings
  tags: string[];          // Array of strings
  Theme: string[];         // Array of strings
  eventGallery: string[];  // Array of image URLs
  imageUrl?: string;       // Display image
  coverUrl?: string;       // Cover banner image
}
```

### 3. `gallery` Collection
Used to maintain the GDG chapter's global image footprint.
```typescript
interface Gallery {
  id: string;              // Auto-generated Firestore Document ID
  imageUrl: string;
  uploadedAt: any;         // Firestore FieldValue.serverTimestamp() or ISO string
}
```

### 4. `users` Collection
Internal user accounts managing the admin portal.
```typescript
interface User {
  id: string;              // Auto-generated Firestore Document ID
  name: string;
  email: string;           // Must be unique (enforced via application logic)
  password: string;        // SHA-256 hashed password
  isAdmin: boolean;        // Default: false
  createdAt: any;          // ISO string or Timestamp
  updatedAt: any;          // ISO string or Timestamp
}
```

### 5. `forms` Collection
Dynamic forms builder configuration schemas.
```typescript
interface Form {
  id: string;              // Auto-generated Firestore Document ID
  title: string;
  description?: string;
  isActive: boolean;       // Default: true
  fields: any[];           // Array of FormField objects defining inputs
  steps?: any[];           // Array of FormStep objects for multi-step forms
  createdAt: any;          // Firestore FieldValue.serverTimestamp()
  updatedAt: any;          // Firestore FieldValue.serverTimestamp()
}
```

### 6. `form_responses` Collection
User submissions for the forms built above.
```typescript
interface FormResponse {
  id: string;              // Auto-generated Firestore Document ID
  formId: string;          // Reference ID points to `forms` Document ID
  data: Record<string, any>; // The complete submission payload (key-value mapped by field ID)
  submittedAt: any;        // Firestore FieldValue.serverTimestamp()
}
```

---

## Important Migration Note for Firebase
Unlike Prisma SQL, Firestore does not strictly enforce this schema at the database layer (unless Firebase Security Rules are heavily configured to do so). 

* **Validation:** We rely on application-level checks and TypeScript logic to ensure data matches these shapes.
* **Relations:** There are no hard foreign keys. The `formId` in `form_responses` is a soft relationship that points to a `forms` document ID.
* **Cascading Deletes:** Deleting a `Form` will automatically delete all matching `form_responses` via batch operations implemented in `app/api/forms/[id]/route.ts`.

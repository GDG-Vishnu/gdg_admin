/**
 * Types for the "managed_gdg_team" Firestore collection.
 * Represents GDG chapter team members with approval workflow.
 */

export type AccessLevel = "member" | "admin";

export type AuthorizationStatus = "pending" | "approved" | "rejected" | "revoked";

export interface GDGTeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  profilePicture: string;

  accessLevel: AccessLevel;
  authorizationStatus: AuthorizationStatus;

  position: string;
  designation: string;

  approvedAt: string | null;
  approvedBy: string | null;

  revokedAt: string | null;
  revokedBy: string | null;
  revokedReason: string | null;

  createdAt: string | null;
  updatedAt: string | null;
}

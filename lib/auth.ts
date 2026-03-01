/**
 * Firebase Auth session cookie utilities.
 * Uses Firebase Admin SDK to create and verify session cookies,
 * replacing the previous jose-based JWT approach.
 */
import { adminAuth } from "@/lib/firebase";

export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

const COOKIE_NAME = "gdg_session";
const SESSION_EXPIRY_MS = 60 * 60 * 24 * 7 * 1000; // 7 days

/**
 * Create a Firebase session cookie from a client-side ID token.
 */
export async function createSessionCookie(idToken: string): Promise<string> {
  return adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRY_MS,
  });
}

/**
 * Verify a session cookie and return decoded claims, or null if invalid.
 */
export async function verifySessionCookie(
  sessionCookie: string,
): Promise<AuthUser | null> {
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return {
      uid: decoded.uid,
      email: decoded.email || "",
      name: decoded.name || "",
      isAdmin: decoded.admin === true,
    };
  } catch {
    return null;
  }
}

export function getSessionCookieConfig(sessionCookie: string) {
  return {
    name: COOKIE_NAME,
    value: sessionCookie,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_EXPIRY_MS / 1000, // in seconds
  };
}

export function getLogoutCookieConfig() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export { COOKIE_NAME };

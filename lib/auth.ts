import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    isAdmin: boolean;
}

export interface TokenPayload extends JWTPayload {
    userId: string;
    email: string;
    name: string;
    isAdmin: boolean;
}

const COOKIE_NAME = "gdg_auth_token";
const TOKEN_EXPIRY = "7d";

function getJwtSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error(
            "JWT_SECRET environment variable must be set and at least 32 characters long",
        );
    }
    return new TextEncoder().encode(secret);
}

export async function signToken(user: AuthUser): Promise<string> {
    const secret = getJwtSecret();

    return new SignJWT({
        userId: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
    } satisfies TokenPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(TOKEN_EXPIRY)
        .setIssuer("gdg-admin")
        .setAudience("gdg-admin")
        .sign(secret);
}

export async function verifyToken(
    token: string,
): Promise<TokenPayload | null> {
    try {
        const secret = getJwtSecret();
        const { payload } = await jwtVerify(token, secret, {
            issuer: "gdg-admin",
            audience: "gdg-admin",
        });
        return payload as TokenPayload;
    } catch {
        return null;
    }
}

export function getAuthCookieConfig(token: string) {
    return {
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
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

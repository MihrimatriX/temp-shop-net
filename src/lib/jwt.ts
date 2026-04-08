import { jwtDecode, JwtPayload } from "jwt-decode";

const ROLE = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const NAME_ID =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier";
const EMAIL_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";

export type SessionUser = {
  userId: number;
  email: string;
  isAdmin: boolean;
};

export function parseSessionFromToken(token: string): SessionUser | null {
  try {
    const payload = jwtDecode<JwtPayload & Record<string, unknown>>(token);
    const sub = payload[NAME_ID] ?? payload.sub;
    const uid = typeof sub === "string" ? parseInt(sub, 10) : Number.NaN;
    if (!Number.isFinite(uid)) return null;
    const email =
      (payload[EMAIL_CLAIM] as string) || (payload.email as string) || "";
    const roleRaw = payload[ROLE] ?? payload.role;
    const roles = Array.isArray(roleRaw) ? roleRaw : roleRaw ? [roleRaw] : [];
    const isAdmin = roles.some((r) => String(r).toLowerCase() === "admin");
    return { userId: uid, email, isAdmin };
  } catch {
    return null;
  }
}

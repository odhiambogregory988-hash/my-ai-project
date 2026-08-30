import { SignJWT, jwtVerify } from "jose";

const cookieName = "orwas-admin-session";
const secret = new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET || "");

export async function createAdminToken() {
  if (!process.env.ADMIN_SESSION_SECRET) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function isAdminTokenValid(token: string | undefined) {
  if (!token || !process.env.ADMIN_SESSION_SECRET) return false;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export { cookieName };

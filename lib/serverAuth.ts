import jwt from "jsonwebtoken";
import { query } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey1234";

export interface TokenPayload {
  email: string;
  role: string;
}

export interface AuthenticatedUser {
  id: number;
  email: string;
  username: string;
  phone?: string | null;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getAuthUser(request: Request): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded || !decoded.email) {
    return null;
  }

  const users = await query<AuthenticatedUser>(
    "SELECT id, email, username, phone, role FROM User WHERE LOWER(email) = LOWER(?) LIMIT 1",
    [decoded.email]
  );

  return users[0] || null;
}

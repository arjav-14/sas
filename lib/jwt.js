import jwt from "jsonwebtoken";
import { COOKIE_NAME, MAX_AGE } from "./auth-constants";

const JWT_SECRET = process.env.JWT_SECRET;

export { COOKIE_NAME, MAX_AGE };

export function signToken(payload) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  if (!JWT_SECRET || !token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

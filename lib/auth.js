import { cookies } from "next/headers";
import { connectDB } from "./mongodb";
import User from "@/models/User";
import {
  COOKIE_NAME,
  MAX_AGE,
  signToken,
  verifyToken,
} from "./jwt";

export { COOKIE_NAME, MAX_AGE, signToken, verifyToken };

export function setAuthCookie(response, token) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export function clearAuthCookie(response) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

function toPlainUser(user) {
  if (!user) return null;
  const id = user._id.toString();
  return {
    id,
    _id: id,
    name: user.name,
    email: user.email,
    aiUsageCount: user.aiUsageCount ?? 0,
  };
}

/** MongoDB user id from getUserFromRequest / getSessionUser */
export function getAuthUserId(user) {
  if (!user) return null;
  return user.id || user._id?.toString?.() || user._id;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded?.userId) return null;
  if (!process.env.MONGODB_URI) return null;

  try {
    await connectDB();
    const user = await User.findById(decoded.userId).select("-password").lean();
    return toPlainUser(user);
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request) {
  return request.cookies.get(COOKIE_NAME)?.value;
}

export async function getUserFromRequest(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded?.userId) return null;
  if (!process.env.MONGODB_URI) return null;

  try {
    await connectDB();
    const user = await User.findById(decoded.userId).select("-password").lean();
    return toPlainUser(user);
  } catch {
    return null;
  }
}

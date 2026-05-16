import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";

const isDev = process.env.NODE_ENV === "development";

function debugPayload(extra) {
  if (!isDev) return {};
  return { debug: extra };
}

export async function POST(request) {
  const requestId = `login-${Date.now()}`;
  console.log(`[Login API ${requestId}] POST /api/auth/login`);

  try {
    const { email, password } = await request.json();
    console.log(`[Login API ${requestId}] body`, {
      email: email?.trim?.() || "(missing)",
      hasPassword: !!password,
      passwordLength: password?.length ?? 0,
    });

    if (!email?.trim() || !password) {
      console.warn(`[Login API ${requestId}] validation failed: missing fields`);
      return NextResponse.json(
        { error: "Email and password are required", ...debugPayload({ step: "validation" }) },
        { status: 400 }
      );
    }

    console.log(`[Login API ${requestId}] connecting to MongoDB...`);
    await connectDB();
    console.log(`[Login API ${requestId}] MongoDB connected`);

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.warn(`[Login API ${requestId}] no user for email`, normalizedEmail);
      return NextResponse.json(
        { error: "Invalid credentials", ...debugPayload({ step: "user-lookup", found: false }) },
        { status: 401 }
      );
    }

    console.log(`[Login API ${requestId}] user found`, { userId: user._id.toString() });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.warn(`[Login API ${requestId}] password mismatch`);
      return NextResponse.json(
        { error: "Invalid credentials", ...debugPayload({ step: "password-check", valid: false }) },
        { status: 401 }
      );
    }

    const token = signToken({ userId: user._id.toString() });
    console.log(`[Login API ${requestId}] JWT signed, setting cookie`);

    const response = NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email },
      ...debugPayload({ step: "success", userId: user._id.toString() }),
    });
    setAuthCookie(response, token);
    console.log(`[Login API ${requestId}] success`);
    return response;
  } catch (error) {
    console.error(`[Login API ${requestId}] error`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    if (error.name === "MongooseServerSelectionError") {
      return NextResponse.json(
        {
          error: "Cannot connect to MongoDB. Start MongoDB or check MONGODB_URI in .env.local",
          ...debugPayload({
            step: "mongodb-connect",
            name: error.name,
            message: error.message,
            uriSet: !!process.env.MONGODB_URI,
          }),
        },
        { status: 503 }
      );
    }

    if (error.message?.includes("JWT_SECRET")) {
      return NextResponse.json(
        {
          error: "JWT_SECRET is missing in .env.local",
          ...debugPayload({ step: "jwt-sign", message: error.message }),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to login",
        ...debugPayload({
          step: "unknown",
          name: error.name,
          message: error.message,
        }),
      },
      { status: 500 }
    );
  }
}

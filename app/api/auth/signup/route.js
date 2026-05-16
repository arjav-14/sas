import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
    });

    const token = signToken({ userId: user._id.toString() });
    const response = NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email },
    });
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("Signup error:", error);
    if (error.name === "MongooseServerSelectionError") {
      return NextResponse.json(
        { error: "Cannot connect to MongoDB. Start MongoDB or check MONGODB_URI in .env.local" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}

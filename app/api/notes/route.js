import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromRequest, getAuthUserId } from "@/lib/auth";
import mongoose from "mongoose";
import Note from "@/models/Note";

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const tag = searchParams.get("tag") || "";
  const archived = searchParams.get("archived") === "true";
  const sort = searchParams.get("sort") || "updated";

  await connectDB();

  const userId = new mongoose.Types.ObjectId(getAuthUserId(user));
  const filter = { userId, archived };

  if (tag) {
    filter.tags = tag;
  }

  if (search.trim()) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { title: regex },
      { content: regex },
      { tags: regex },
      { category: regex },
    ];
  }

  const notes = await Note.find(filter)
    .sort({ updatedAt: sort === "updated" ? -1 : -1 })
    .select("-content")
    .lean();

  return NextResponse.json({
    notes: notes.map((n) => ({ ...n, _id: n._id.toString() })),
  });
}

export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  await connectDB();

  const userId = new mongoose.Types.ObjectId(getAuthUserId(user));
  const note = await Note.create({
    userId,
    title: body.title || "Untitled Note",
    content: body.content || "",
    tags: body.tags || [],
    category: body.category || "General",
  });

  const plain = note.toObject();
  plain._id = plain._id.toString();
  plain.userId = plain.userId.toString();

  return NextResponse.json({ note: plain }, { status: 201 });
}

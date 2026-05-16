import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectDB } from "@/lib/mongodb";
import { getUserFromRequest, getAuthUserId } from "@/lib/auth";
import mongoose from "mongoose";
import Note from "@/models/Note";

export async function PATCH(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  await connectDB();

  const userId = new mongoose.Types.ObjectId(getAuthUserId(user));
  const note = await Note.findOne({ _id: id, userId });
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  if (typeof body.isPublic === "boolean") {
    note.isPublic = body.isPublic;
    if (body.isPublic && !note.shareId) {
      note.shareId = uuidv4();
    }
    if (!body.isPublic) {
      note.isPublic = false;
    }
  }

  if (body.regenerateShare && note.isPublic) {
    note.shareId = uuidv4();
  }

  await note.save();

  const origin = request.headers.get("origin") || request.headers.get("host");
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (origin ? (origin.startsWith("http") ? origin : `https://${origin}`) : "");
  const shareUrl = note.isPublic && note.shareId
    ? `${baseUrl}/shared/${note.shareId}`
    : null;

  return NextResponse.json({
    note: {
      isPublic: note.isPublic,
      shareId: note.shareId,
      shareUrl,
    },
  });
}

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromRequest, getAuthUserId } from "@/lib/auth";
import mongoose from "mongoose";
import Note from "@/models/Note";

async function getOwnedNote(id, user) {
  await connectDB();
  const userId = new mongoose.Types.ObjectId(getAuthUserId(user));
  return Note.findOne({ _id: id, userId });
}

export async function GET(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const note = await getOwnedNote(id, user);
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const plain = note.toObject();
  plain._id = plain._id.toString();
  plain.userId = plain.userId.toString();

  return NextResponse.json({ note: plain });
}

export async function PATCH(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const note = await getOwnedNote(id, user);
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const body = await request.json();
  const allowed = ["title", "content", "tags", "category", "archived", "isPublic"];

  for (const key of allowed) {
    if (body[key] !== undefined) {
      note[key] = body[key];
    }
  }

  await note.save();
  const plain = note.toObject();
  plain._id = plain._id.toString();
  plain.userId = plain.userId.toString();
  return NextResponse.json({ note: plain });
}

export async function DELETE(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const note = await getOwnedNote(id, user);
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  await note.deleteOne();
  return NextResponse.json({ success: true });
}

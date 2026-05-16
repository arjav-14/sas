import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Note from "@/models/Note";
import User from "@/models/User";

export async function GET(request, { params }) {
  const { shareId } = await params;

  await connectDB();

  const note = await Note.findOne({ shareId, isPublic: true }).lean();
  if (!note) {
    return NextResponse.json({ error: "Shared note not found" }, { status: 404 });
  }

  const author = await User.findById(note.userId).select("name").lean();

  return NextResponse.json({
    note: {
      title: note.title,
      content: note.content,
      tags: note.tags,
      category: note.category,
      updatedAt: note.updatedAt,
      aiSummary: note.aiSummary,
      aiActionItems: note.aiActionItems,
      authorName: author?.name || "Anonymous",
    },
  });
}

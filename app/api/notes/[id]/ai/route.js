import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromRequest, getAuthUserId } from "@/lib/auth";
import mongoose from "mongoose";
import Note from "@/models/Note";
import User from "@/models/User";
import { analyzeNoteContent } from "@/lib/gemini";

export async function POST(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const userId = new mongoose.Types.ObjectId(getAuthUserId(user));
  const note = await Note.findOne({ _id: id, userId });
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const content = body.content ?? note.content;

    const ai = await analyzeNoteContent(content);

    note.aiSummary = ai.summary;
    note.aiActionItems = ai.action_items;
    note.aiSuggestedTitle = ai.suggested_title;
    await note.save();

    await User.findByIdAndUpdate(userId, { $inc: { aiUsageCount: 1 } });

    return NextResponse.json({
      summary: ai.summary,
      action_items: ai.action_items,
      suggested_title: ai.suggested_title,
    });
  } catch (error) {
    console.error("AI error:", error);
    const message = error.message || "Failed to analyze note";
    const status = message.includes("quota") ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

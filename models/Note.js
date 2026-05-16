import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "Untitled Note", trim: true },
    content: { type: String, default: "" },
    tags: [{ type: String, trim: true }],
    category: { type: String, default: "General", trim: true },
    archived: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    shareId: { type: String, unique: true, sparse: true, index: true },
    aiSummary: { type: String, default: "" },
    aiActionItems: [{ type: String }],
    aiSuggestedTitle: { type: String, default: "" },
  },
  { timestamps: true }
);

NoteSchema.index({ userId: 1, updatedAt: -1 });
NoteSchema.index({ title: "text", content: "text", tags: "text" });

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromRequest, getAuthUserId } from "@/lib/auth";
import Note from "@/models/Note";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const userId = new mongoose.Types.ObjectId(getAuthUserId(user));

  const userDoc = await User.findById(userId).select("aiUsageCount");
  const totalNotes = await Note.countDocuments({ userId, archived: false });
  const archivedCount = await Note.countDocuments({ userId, archived: true });

  const recentNotes = await Note.find({ userId, archived: false })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select("title updatedAt tags category")
    .lean();

  const tagAgg = await Note.aggregate([
    { $match: { userId, archived: false } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  const activityAgg = await Note.aggregate([
    {
      $match: {
        userId,
        updatedAt: { $gte: startOfWeek },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = activityAgg.find((a) => a._id === key);
    days.push({
      date: key,
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      count: found?.count || 0,
    });
  }

  return NextResponse.json({
    totalNotes,
    archivedCount,
    aiUsageCount: userDoc?.aiUsageCount || 0,
    recentNotes: recentNotes.map((n) => ({
      ...n,
      _id: n._id.toString(),
    })),
    topTags: tagAgg.map((t) => ({ tag: t._id, count: t.count })),
    weeklyActivity: days,
  });
}

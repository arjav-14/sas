"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import NoteCard from "@/components/NoteCard";

function StatCard({ label, value, sub }) {
  return (
    <div className="glass-card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export default function DashboardStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total notes" value={stats.totalNotes} />
        <StatCard label="AI analyses" value={stats.aiUsageCount} sub="Gemini-powered" />
        <StatCard label="Archived" value={stats.archivedCount} />
        <StatCard
          label="Top tag"
          value={stats.topTags[0]?.tag || "—"}
          sub={stats.topTags[0] ? `${stats.topTags[0].count} notes` : "Add tags to notes"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="mb-4 font-medium">Weekly activity</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyActivity}>
                <XAxis dataKey="label" stroke="#8b9cb3" fontSize={12} />
                <YAxis allowDecimals={false} stroke="#8b9cb3" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#121826",
                    border: "1px solid #243044",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="mb-4 font-medium">Most used tags</h3>
          {stats.topTags.length === 0 ? (
            <p className="text-sm text-muted">No tags yet</p>
          ) : (
            <ul className="space-y-2">
              {stats.topTags.map((t) => (
                <li key={t.tag} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">#{t.tag}</span>
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-accent">{t.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {stats.recentNotes?.length > 0 && (
        <div>
          <h3 className="mb-3 font-medium">Recently edited</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.recentNotes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

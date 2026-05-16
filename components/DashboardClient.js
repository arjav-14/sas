"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import NoteCard from "@/components/NoteCard";
import SearchFilter from "@/components/SearchFilter";
import DashboardStats from "@/components/DashboardStats";

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const showArchived = searchParams.get("archived") === "true";

  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const allTags = [...new Set(notes.flatMap((n) => n.tags || []))].sort();

  const fetchNotes = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tag) params.set("tag", tag);
    if (showArchived) params.set("archived", "true");
    params.set("sort", "updated");

    const res = await fetch(`/api/notes?${params}`, { credentials: "include" });
    const data = await res.json();
    if (res.ok) setNotes(data.notes);
    setLoading(false);
  }, [search, tag, showArchived]);

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/dashboard/stats", { credentials: "include" });
    const data = await res.json();
    if (res.ok) setStats(data);
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(fetchNotes, 300);
    return () => clearTimeout(t);
  }, [fetchNotes]);

  useEffect(() => {
    if (!showArchived) fetchStats();
  }, [fetchStats, showArchived]);

  async function createNote() {
    setCreating(true);
    setCreateError("");

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to create note");
      }

      const noteId = data.note?._id || data.note?.id;
      if (!noteId) {
        throw new Error("Note created but no id returned");
      }

      window.location.href = `/dashboard/notes/${noteId}`;
    } catch (err) {
      setCreateError(err.message);
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {showArchived ? "Archived notes" : "Dashboard"}
          </h1>
          <p className="text-sm text-muted">
            {showArchived ? "Notes you have archived" : "Your productivity overview"}
          </p>
        </div>
        <Button onClick={createNote} disabled={creating}>
          {creating ? "Creating..." : "+ New note"}
        </Button>
      </div>

      {createError && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {createError}
        </p>
      )}

      {!showArchived && stats && <DashboardStats stats={stats} />}

      <section className="space-y-4">
        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          tag={tag}
          onTagChange={setTag}
          tags={allTags}
          showArchived={showArchived}
        />

        {loading ? (
          <p className="text-muted">Loading notes...</p>
        ) : notes.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted">
            No notes found. Create your first note to get started.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

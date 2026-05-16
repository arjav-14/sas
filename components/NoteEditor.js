"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const AUTOSAVE_MS = 1200;

export default function NoteEditor({ noteId }) {
  const router = useRouter();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState("");
  const timerRef = useRef(null);
  const noteRef = useRef(null);

  const loadNote = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/notes/${noteId}`, { credentials: "include" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load note");
      setLoading(false);
      return;
    }
    setNote(data.note);
    noteRef.current = data.note;
    if (data.note.isPublic && data.note.shareId) {
      setShareUrl(`${window.location.origin}/shared/${data.note.shareId}`);
    }
    setAiResult({
      summary: data.note.aiSummary,
      action_items: data.note.aiActionItems,
      suggested_title: data.note.aiSuggestedTitle,
    });
    setLoading(false);
  }, [noteId]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const saveNote = useCallback(
    async (payload) => {
      setSaving(true);
      setSaved(false);
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setSaving(false);
      if (res.ok) {
        setSaved(true);
        noteRef.current = data.note;
      }
    },
    [noteId]
  );

  function scheduleSave(updates) {
    setNote((prev) => {
      const next = { ...prev, ...updates };
      noteRef.current = next;
      return next;
    });
    setSaved(false);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const current = noteRef.current;
      if (!current) return;
      saveNote({
        title: current.title,
        content: current.content,
        tags: current.tags,
        category: current.category,
        archived: current.archived,
      });
    }, AUTOSAVE_MS);
  }

  function handleTagsChange(value) {
    const tags = value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    scheduleSave({ tags });
  }

  async function runAI() {
    setAiLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/notes/${noteId}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note?.content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI failed");
      setAiResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  function applySuggestedTitle() {
    if (aiResult?.suggested_title) {
      scheduleSave({ title: aiResult.suggested_title });
    }
  }

  async function toggleShare() {
    const res = await fetch(`/api/notes/${noteId}/share`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !note.isPublic }),
    });
    const data = await res.json();
    if (res.ok) {
      setNote((n) => ({ ...n, isPublic: data.note.isPublic, shareId: data.note.shareId }));
      setShareUrl(data.note.shareUrl || "");
    }
  }

  async function deleteNote() {
    if (!confirm("Delete this note permanently?")) return;
    await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    router.push("/dashboard");
    router.refresh();
  }

  if (loading) {
    return <p className="text-muted">Loading note...</p>;
  }

  if (error && !note) {
    return <p className="text-danger">{error}</p>;
  }

  if (!note) return null;

  const tagsString = (note.tags || []).join(", ");

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted">
            {saving ? "Saving..." : saved ? "Saved" : "Unsaved changes"}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => scheduleSave({ archived: !note.archived })}>
              {note.archived ? "Unarchive" : "Archive"}
            </Button>
            <Button variant="secondary" onClick={toggleShare}>
              {note.isPublic ? "Make private" : "Share publicly"}
            </Button>
            <Button variant="danger" onClick={deleteNote}>
              Delete
            </Button>
          </div>
        </div>

        <input
          value={note.title || ""}
          onChange={(e) => scheduleSave({ title: e.target.value })}
          className="w-full border-0 bg-transparent text-2xl font-semibold text-foreground outline-none placeholder:text-muted"
          placeholder="Note title"
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Category"
            id="category"
            value={note.category || ""}
            onChange={(e) => scheduleSave({ category: e.target.value })}
            placeholder="General"
          />
          <Input
            label="Tags (comma separated)"
            id="tags"
            value={tagsString}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="work, ideas"
          />
        </div>

        <textarea
          value={note.content || ""}
          onChange={(e) => scheduleSave({ content: e.target.value })}
          className="editor-textarea flex-1 w-full rounded-xl border border-border bg-card p-4 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="Start writing your note..."
        />

        {note.isPublic && shareUrl && (
          <div className="rounded-lg border border-border bg-card/80 p-3 text-sm">
            <p className="text-muted">Public link</p>
            <a href={shareUrl} target="_blank" rel="noreferrer" className="break-all text-accent hover:underline">
              {shareUrl}
            </a>
          </div>
        )}
      </div>

      <aside className="w-full shrink-0 space-y-4 lg:w-80">
        <div className="glass-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium">AI Assistant</h3>
            <Button onClick={runAI} disabled={aiLoading} className="text-xs">
              {aiLoading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
          {error && <p className="mb-2 text-xs text-danger">{error}</p>}
          {aiResult?.suggested_title && (
            <div className="mb-3">
              <p className="text-xs text-muted">Suggested title</p>
              <p className="text-sm">{aiResult.suggested_title}</p>
              <Button variant="ghost" className="mt-1 px-0 text-xs" onClick={applySuggestedTitle}>
                Apply title
              </Button>
            </div>
          )}
          {aiResult?.summary && (
            <div className="mb-3">
              <p className="text-xs text-muted">Summary</p>
              <p className="text-sm text-foreground/90">{aiResult.summary}</p>
            </div>
          )}
          {aiResult?.action_items?.length > 0 && (
            <div>
              <p className="mb-1 text-xs text-muted">Action items</p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {aiResult.action_items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {!aiResult?.summary && !aiLoading && (
            <p className="text-sm text-muted">Run AI to get summary, action items, and title suggestions.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

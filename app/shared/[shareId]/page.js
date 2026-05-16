"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function SharedNotePage() {
  const { shareId } = useParams();
  const [note, setNote] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/shared/${shareId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Note not found");
      } else {
        setNote(data.note);
      }
      setLoading(false);
    }
    if (shareId) load();
  }, [shareId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted">
        Loading shared note...
      </main>
    );
  }

  if (error || !note) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-danger">{error || "Note not found"}</p>
        <Link href="/" className="text-accent hover:underline">
          Go home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm text-muted hover:text-accent">
            NoteFlow
          </Link>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">Public note</span>
        </div>
        <article className="glass-card p-8">
          <p className="text-sm text-muted">Shared by {note.authorName}</p>
          <h1 className="mt-2 text-3xl font-bold">{note.title}</h1>
          {note.category && (
            <span className="mt-3 inline-block rounded-full bg-card px-2 py-0.5 text-xs text-muted">
              {note.category}
            </span>
          )}
          {note.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {note.tags.map((t) => (
                <span key={t} className="text-xs text-accent">
                  #{t}
                </span>
              ))}
            </div>
          )}
          <div className="prose prose-invert mt-8 whitespace-pre-wrap text-foreground/90">
            {note.content || "(empty)"}
          </div>
          {note.aiSummary && (
            <section className="mt-8 border-t border-border pt-6">
              <h2 className="text-sm font-medium text-muted">AI Summary</h2>
              <p className="mt-2 text-sm">{note.aiSummary}</p>
            </section>
          )}
          {note.aiActionItems?.length > 0 && (
            <section className="mt-4">
              <h2 className="text-sm font-medium text-muted">Action items</h2>
              <ul className="mt-2 list-inside list-disc text-sm">
                {note.aiActionItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}
          <p className="mt-8 text-xs text-muted">
            Last updated {new Date(note.updatedAt).toLocaleString()}
          </p>
        </article>
      </div>
    </main>
  );
}

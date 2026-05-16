import Link from "next/link";

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NoteCard({ note }) {
  return (
    <Link
      href={`/dashboard/notes/${note._id}`}
      className="glass-card block p-4 transition hover:border-accent/40 hover:bg-card-hover"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-foreground line-clamp-1">{note.title || "Untitled Note"}</h3>
        <span className="shrink-0 text-xs text-muted">{formatDate(note.updatedAt)}</span>
      </div>
      {note.category && (
        <span className="mt-2 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
          {note.category}
        </span>
      )}
      {note.tags?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {note.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-md bg-card px-2 py-0.5 text-xs text-muted">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

import Link from "next/link";
import NoteEditor from "@/components/NoteEditor";

export const metadata = { title: "Edit note — NoteFlow" };

export default async function NotePage({ params }) {
  const { id } = await params;

  return (
    <div className="mx-auto flex h-[calc(100vh-3rem)] max-w-7xl flex-col">
      <Link href="/dashboard" className="mb-4 text-sm text-muted hover:text-accent">
        ← Back to dashboard
      </Link>
      <NoteEditor noteId={id} />
    </div>
  );
}

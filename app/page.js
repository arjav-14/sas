import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import Button from "@/components/ui/Button";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.15),_transparent_50%)]" />
      <div className="relative z-10 max-w-2xl text-center">
        <span className="mb-4 inline-block rounded-full border border-border bg-card px-3 py-1 text-xs text-muted">
          Peblo-style take-home challenge
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Collaborative AI Notes Workspace
        </h1>
        <p className="mt-4 text-lg text-muted">
          Write, organize, and supercharge your notes with Gemini — summaries, action items, and
          smart titles in one place.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/signup">
            <Button>Get started free</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary">Sign in</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

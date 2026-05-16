import Link from "next/link";


export const metadata = { title: "Sign up — NoteFlow" };

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent font-bold text-white">
            N
          </span>
          <span className="text-xl font-semibold">NoteFlow</span>
        </Link>
        <div className="glass-card p-8">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-muted">Start your AI notes workspace</p>
          <div className="mt-6">
            
          </div>
        </div>
      </div>
    </main>
  );
}

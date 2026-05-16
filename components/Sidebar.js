"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/dashboard?archived=true", label: "Archive", icon: "▣" },
];

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card/50 p-4">
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-lg font-bold text-white">
            N
          </span>
          <div>
            <p className="font-semibold text-foreground">NoteFlow</p>
            <p className="text-xs text-muted">AI Notes Workspace</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1">
        {nav.map((item) => {
          const active = item.href === "/dashboard" && pathname === "/dashboard";
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-accent/15 text-accent"
                  : "text-muted hover:bg-card-hover hover:text-foreground"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border pt-4">
        <p className="truncate text-sm font-medium">{user?.name}</p>
        <p className="truncate text-xs text-muted">{user?.email}</p>
        <Button variant="ghost" className="mt-3 w-full justify-start" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </aside>
  );
}

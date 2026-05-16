"use client";

import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";

export default function SearchFilter({
  search,
  onSearchChange,
  tag,
  onTagChange,
  tags = [],
  showArchived,
}) {
  const router = useRouter();

  function handleArchivedToggle(checked) {
    router.push(checked ? "/dashboard?archived=true" : "/dashboard");
  }
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Input
          id="search"
          placeholder="Search notes by title, content, tags..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-48">
        <select
          value={tag}
          onChange={(e) => onTagChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
        >
          <option value="">All tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              #{t}
            </option>
          ))}
        </select>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(e) => handleArchivedToggle(e.target.checked)}
          className="rounded border-border accent-accent"
        />
        Archived
      </label>
    </div>
  );
}

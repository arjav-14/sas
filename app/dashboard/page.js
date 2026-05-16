import { Suspense } from "react";
import DashboardClient from "@/components/DashboardClient";

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading dashboard...</p>}>
      <DashboardClient />
    </Suspense>
  );
}

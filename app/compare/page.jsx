import { Suspense } from "react";
import CompareView from "@/components/compare/CompareView";

export const metadata = { title: "Compare Products" };

export default function ComparePage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Loading comparison...</p>}>
      <CompareView />
    </Suspense>
  );
}

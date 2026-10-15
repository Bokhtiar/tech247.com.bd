import { Suspense } from "react";
import TrackView from "@/components/track/TrackView";

export const metadata = { title: "Track Order" };

export default function TrackPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Loading tracking...</p>}>
      <TrackView />
    </Suspense>
  );
}

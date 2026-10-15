import { Suspense } from "react";
import DealsView from "@/components/deals/DealsView";
import { getDealList } from "@/service/deals";

export const metadata = { title: "Hot Deals" };

export default function DealsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Loading deals...</p>}>
      <DealsBody />
    </Suspense>
  );
}

async function DealsBody() {
  const result = await getDealList({ page: 1, per_page: 4 });

  return <DealsView initialProducts={result.data} initialMeta={result.meta} />;
}

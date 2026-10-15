import { Suspense } from "react";
import PcBuilder from "@/components/builder/PcBuilder";
import { getPcBuilderCategories } from "@/service/categories";

export const metadata = { title: "PC Builder" };

export default function PcBuilderPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Loading PC builder...</p>}>
      <BuilderBody />
    </Suspense>
  );
}

async function BuilderBody() {
  const categories = await getPcBuilderCategories();

  return <PcBuilder categories={categories} />;
}

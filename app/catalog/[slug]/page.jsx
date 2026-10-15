import { Suspense } from "react";
import CatalogView from "@/components/catalog/CatalogView";
import { getCategories } from "@/service/categories";

export const metadata = { title: "Catalog" };

export default function CatalogCategoryPage({ params }) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-center text-sm text-ink-muted">Loading catalog...</p>}>
      <CatalogCategory params={params} />
    </Suspense>
  );
}

async function CatalogCategory({ params }) {
  const { slug } = await params;
  const categories = await getCategories();

  return <CatalogView categorySlug={slug} categoryName={categoryName(categories, slug)} />;
}

function categoryName(nodes, slug) {
  for (const node of nodes) {
    if (node.slug === slug) return node.name_en;
    const child = node.children?.length ? categoryName(node.children, slug) : null;
    if (child) return child;
  }

  return null;
}

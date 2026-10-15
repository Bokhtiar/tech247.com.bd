import { Suspense } from "react";
import ProductDetail from "@/components/product/ProductDetail";
import { getProduct } from "@/service/products";

export const metadata = {
  title: "Product",
};

export default function ProductPage({ params }) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-center text-sm text-ink-muted">Loading product...</p>}>
      <ProductBody params={params} />
    </Suspense>
  );
}

async function ProductBody({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return <ProductDetail productSlug={slug} product={product} />;
}

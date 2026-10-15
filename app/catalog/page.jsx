import CatalogView from "@/components/catalog/CatalogView";

export const metadata = { title: "Catalog" };

export default function CatalogPage() {
  return <CatalogView categorySlug="All" />;
}

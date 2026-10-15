import { Suspense } from "react";
import HomeView from "@/components/home/HomeView";
import { getFeaturedCategories } from "@/service/categories";

export const metadata = {
  title: "TECH24 | Where Technology Meets Trust",
};

export default function HomePage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Loading home...</p>}>
      <HomeBody />
    </Suspense>
  );
}

async function HomeBody() {
  const featuredCategories = await getFeaturedCategories();

  return <HomeView featuredCategories={featuredCategories} />;
}

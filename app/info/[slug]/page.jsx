import InfoView from "@/components/info/InfoView";

export function generateStaticParams() {
  return [{ slug: "terms" }, { slug: "delivery" }];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: slug === "delivery" ? "Delivery Charges" : "Warranty & Returns" };
}

export default async function InfoPage({ params }) {
  const { slug } = await params;
  return <InfoView slug={slug} />;
}

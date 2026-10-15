import OrderDetailView from "@/components/account/OrderDetailView";

export const metadata = { title: "Order details" };

export default async function OrderDetailPage({ params }) {
  const { orderNumber } = await params;

  return <OrderDetailView orderNumber={orderNumber} />;
}

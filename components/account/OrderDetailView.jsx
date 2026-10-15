"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/components/store/StoreProvider";
import Price from "@/components/ui/Price";
import { myOrder } from "@/service/orders";

function label(value) {
  return String(value || "").replaceAll("_", " ");
}

export default function OrderDetailView({ orderNumber }) {
  const store = useStore();
  const [order, setOrder] = useState(null);
  const [missing, setMissing] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    myOrder(orderNumber)
      .then((row) => {
        if (cancelled) return;
        setOrder(row);
        setMissing(!row);
      })
      .catch((error) => {
        if (cancelled) return;
        setNeedsLogin(error.status === 401);
        setMissing(error.status !== 401);
      });

    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  if (needsLogin) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-12 text-center">
        <h1 className="text-2xl font-black">Sign in to view this order</h1>
        <button type="button" onClick={() => store.openUi("auth")} className="mt-4 rounded-xl bg-brand px-5 py-3 text-xs font-bold text-white">Sign in</button>
      </div>
    );
  }

  if (missing) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-12 text-center">
        <h1 className="text-2xl font-black">Order not found</h1>
        <Link href="/account" className="mt-4 inline-block text-sm font-bold text-brand">Back to orders</Link>
      </div>
    );
  }

  if (!order) {
    return <p className="text-sm text-ink-muted">Loading order...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/account" className="text-xs font-semibold text-ink-muted">Back to orders</Link>
          <h1 className="text-2xl font-black tracking-tight text-ink-strong">{order.order_number}</h1>
          <p className="text-xs text-ink-muted">{order.placed_at}</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 capitalize">{label(order.status)}</span>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="space-y-3 rounded-2xl border border-line bg-surface p-6 shadow-sm lg:col-span-8">
          <h2 className="text-sm font-bold">Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-[10px] font-semibold text-ink-muted uppercase">
                  <th className="pb-2">Product</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Line</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={`${item.sku}-${item.name}`} className="border-b border-line">
                    <td className="py-3">
                      {item.slug ? <Link href={`/product/${item.slug}`} className="font-bold text-brand">{item.name}</Link> : <span className="font-bold">{item.name}</span>}
                      <p className="text-ink-muted">{item.sku}{item.option ? ` · ${item.option}` : ""}{item.warranty_months ? ` · ${item.warranty_months} months warranty` : ""}</p>
                    </td>
                    <td className="py-3">{item.qty}</td>
                    <td className="py-3"><Price value={item.unit_price} /></td>
                    <td className="py-3 font-bold"><Price value={item.line_total} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="space-y-2 rounded-2xl border border-line bg-surface p-6 text-xs shadow-sm lg:col-span-4">
          <h2 className="text-sm font-bold">Delivery</h2>
          <p className="font-semibold">{order.shipping_name}</p>
          <p>{order.shipping_phone}</p>
          <p className="capitalize">{label(order.shipping_method)}</p>
          <p>{order.shipping_address_line}</p>
          <div className="space-y-1 border-t border-line pt-3">
            <div className="flex justify-between"><span>Subtotal</span> <Price value={order.subtotal} /></div>
            <div className="flex justify-between"><span>Shipping</span> <Price value={order.shipping_fee} /></div>
            <div className="flex justify-between font-bold"><span>Total</span> <Price value={order.grand_total} /></div>
          </div>
          <p className="capitalize">Payment: {order.payments.map((payment) => `${label(payment.method)} (${label(payment.status)})`).join(", ") || label(order.payment_status)}</p>
          {order.shipment ? <p className="capitalize">Shipment: {label(order.shipment.status)}{order.shipment.tracking_number ? ` · ${order.shipment.tracking_number}` : ""}</p> : null}
        </section>
      </div>
      <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-bold">Status history</h2>
        <ul className="space-y-2 text-xs">
          {order.history.map((entry) => (
            <li key={`${entry.status}-${entry.at}`} className="capitalize">{entry.at} — {label(entry.status)}{entry.note ? ` · ${entry.note}` : ""}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

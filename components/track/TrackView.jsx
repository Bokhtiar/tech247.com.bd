"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/components/store/StoreProvider";
import Price from "@/components/ui/Price";
import { trackOrder } from "@/service/orders";

function label(value) {
  return String(value || "").replaceAll("_", " ");
}

const methodLabels = {
  home_delivery: "Inside Dhaka",
  courier: "Outside Dhaka",
  store_pickup: "Store pickup",
  express: "Express",
};

export default function TrackView() {
  const params = useSearchParams();
  const store = useStore();
  const [orderNo, setOrderNo] = useState(params.get("order") || "");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (store.user.phone) setPhone(store.user.phone);
  }, [store.user.phone]);

  async function search(event, reference = orderNo, mobile = phone) {
    event?.preventDefault();
    const nextOrder = reference.trim();
    const nextPhone = mobile.trim();
    setSearched(true);
    setError("");
    setOrder(null);
    if (!nextOrder || !/^01\d{9}$/.test(nextPhone)) {
      setError("Enter the order number and the 11-digit phone used at checkout.");
      return;
    }
    setPending(true);
    try {
      setOrder(await trackOrder(nextOrder, nextPhone));
    } catch (requestError) {
      setError(requestError.status === 404 ? "No order matches that number and phone." : (requestError.message || "Could not load tracking."));
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    const preset = params.get("order");
    if (preset && store.user.phone) {
      setOrderNo(preset);
      search(null, preset, store.user.phone);
    }
    // Search once when the signed-in phone and a preset order are both available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, store.user.phone]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="overflow-hidden rounded-3xl bg-nav text-white shadow-sm">
        <div className="bg-brand px-6 py-3 text-[11px] font-bold tracking-[0.18em] uppercase">TECH24 shipment tracking</div>
        <form onSubmit={search} className="space-y-4 px-6 py-6">
          <div>
            <h1 className="font-brand text-3xl font-black tracking-tight">Where is your order?</h1>
            <p className="mt-1 text-sm text-white/70">Use the order number and the mobile number from checkout. A courier tracking number works in the same box.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <input value={orderNo} onChange={(event) => setOrderNo(event.target.value)} placeholder="Order or tracking number" className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-ink-strong outline-none" />
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="01XXXXXXXXX" inputMode="numeric" className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-ink-strong outline-none" />
            <button type="submit" disabled={pending} className="rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white disabled:opacity-60">{pending ? "Checking..." : "Track"}</button>
          </div>
          {error ? <p className="text-sm font-semibold text-amber-200">{error}</p> : null}
        </form>
      </section>

      {order ? <TrackingResult order={order} /> : searched ? null : (
        <p className="text-center text-sm text-ink-muted">Tracking uses the live order, delivery address, payment, and status history.</p>
      )}
    </div>
  );
}

function TrackingResult({ order }) {
  const stopped = order.stages.every((stage) => stage.state !== "current" && stage.state !== "done");

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-wide text-ink-muted uppercase">Order {order.order_number}</p>
            <h2 className="mt-1 text-2xl font-black capitalize text-ink-strong">{label(order.status)}</h2>
            <p className="text-xs text-ink-muted">Placed {order.placed_at} · Updated {order.updated_at}</p>
          </div>
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm">
            <p className="text-[11px] font-bold tracking-wide text-brand uppercase">Current location</p>
            <p className="font-black text-ink-strong">{order.location.title}</p>
            <p className="max-w-sm text-xs text-ink-muted">{order.location.detail}</p>
          </div>
        </div>
        {stopped ? (
          <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 capitalize">This order is {label(order.status)} and is not moving.</p>
        ) : (
          <ol className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {order.stages.map((stage) => (
              <li key={stage.key} className="text-center">
                <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full text-xs ${stage.state === "upcoming" ? "bg-chip text-ink-muted" : "bg-emerald-600 text-white"} ${stage.state === "current" ? "ring-4 ring-emerald-100" : ""}`}>
                  <i className={`fa-solid ${stage.state === "upcoming" ? "fa-circle" : "fa-check"}`} />
                </div>
                <p className={`text-[11px] font-bold ${stage.state === "upcoming" ? "text-ink-muted" : "text-ink-strong"}`}>{stage.label}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm lg:col-span-3">
          <h3 className="text-sm font-black">Movement</h3>
          <ol className="mt-4 space-y-0">
            {[...order.history].reverse().map((entry, index) => (
              <li key={`${entry.status}-${entry.at}`} className="relative border-l border-line pb-5 pl-5 last:pb-0">
                <span className={`absolute top-1 -left-[5px] h-2.5 w-2.5 rounded-full ${index === 0 ? "bg-brand" : "bg-emerald-600"}`} />
                <p className="text-xs font-bold capitalize text-ink-strong">{label(entry.status)} · {entry.place}</p>
                <p className="text-[11px] text-ink-muted">{entry.at}{entry.note ? ` · ${entry.note}` : ""}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-3 rounded-3xl border border-line bg-surface p-6 text-sm shadow-sm lg:col-span-2">
          <h3 className="font-black">Delivery</h3>
          <p className="font-semibold">{order.shipping_name}</p>
          <p>{order.shipping_phone}</p>
          <p>{methodLabels[order.shipping_method] || label(order.shipping_method)}</p>
          <p>{order.shipping_address_line || "No street address on this order."}</p>
          {order.store ? (
            <p className="rounded-xl bg-chip p-3 text-xs">
              <span className="font-bold">{order.store.name}</span><br />
              {order.store.address}{order.store.phone ? ` · ${order.store.phone}` : ""}
            </p>
          ) : null}
          {order.shipment ? (
            <div className="rounded-xl bg-chip p-3 text-xs">
              <p className="font-bold capitalize">Shipment {label(order.shipment.status)}</p>
              <p>{order.shipment.courier_name || "Courier not assigned yet"}</p>
              <p>{order.shipment.tracking_number || "No courier tracking number yet"}</p>
              {order.shipment.shipped_at ? <p>Shipped {order.shipment.shipped_at}</p> : null}
              {order.shipment.delivered_at ? <p>Delivered {order.shipment.delivered_at}</p> : null}
            </div>
          ) : <p className="text-xs text-ink-muted">No shipment has been created yet. The order is still with TECH24.</p>}
          <div className="space-y-1 border-t border-line pt-3 text-xs">
            <div className="flex justify-between"><span>Subtotal</span> <Price value={order.subtotal} /></div>
            <div className="flex justify-between"><span>Shipping</span> <Price value={order.shipping_fee} /></div>
            <div className="flex justify-between font-bold"><span>To collect</span> <Price value={order.grand_total} /></div>
            <p className="capitalize">Payment {label(order.payment_status)}{order.payments[0] ? ` · ${label(order.payments[0].method)} (${label(order.payments[0].status)})` : ""}</p>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
        <h3 className="text-sm font-black">Products</h3>
        <div className="mt-3 overflow-x-auto">
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
        {order.customer_note ? <p className="mt-3 text-xs text-ink-muted">Note: {order.customer_note}</p> : null}
      </section>
    </div>
  );
}

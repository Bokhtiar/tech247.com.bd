"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiSend } from "@/config/api";
import { useStore } from "@/components/store/StoreProvider";
import Price from "@/components/ui/Price";
import { placeOrder } from "@/service/orders";

const methods = [
  { method: "home_delivery", label: "Home Delivery" },
  { method: "store_pickup", label: "Store Pickup" },
];

function placeSelection(value) {
  const id = String(value || "");
  if (id.startsWith("t-")) {
    return { shipping_upazila_id: null, shipping_thana_id: Number(id.slice(2)) };
  }
  const numeric = id.startsWith("u-") ? id.slice(2) : id;
  return { shipping_upazila_id: numeric ? Number(numeric) : null, shipping_thana_id: null };
}

export default function CheckoutView() {
  const store = useStore();
  const [method, setMethod] = useState("home_delivery");
  const [districts, setDistricts] = useState([]);
  const [districtId, setDistrictId] = useState("");
  const [thanas, setThanas] = useState([]);
  const [thanaId, setThanaId] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const district = districts.find((entry) => String(entry.id) === districtId) || null;
  const fee = method === "store_pickup" ? 0 : Number(district?.fee) || 0;
  const total = store.cartSubtotal + fee;

  useEffect(() => {
    let cancelled = false;
    apiSend("locations/districts")
      .then((body) => {
        if (cancelled) return;
        const list = Array.isArray(body?.data) ? body.data : [];
        setDistricts(list);
        const dhaka = list.find((entry) => entry.name === "Dhaka") || list[0];
        if (dhaka) setDistrictId(String(dhaka.id));
      })
      .catch(() => {
        if (!cancelled) setError("Could not load districts.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!districtId) return undefined;
    let cancelled = false;
    setThanas([]);
    setThanaId("");
    apiSend(`locations/districts/${districtId}/thanas`)
      .then((body) => {
        if (cancelled) return;
        const list = Array.isArray(body?.data) ? body.data : [];
        setThanas(list);
        if (list[0]) setThanaId(String(list[0].id));
      })
      .catch(() => {
        if (!cancelled) setThanas([]);
      });
    return () => {
      cancelled = true;
    };
  }, [districtId]);
  const nameParts = String(store.user.name || "").trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ");

  if (order) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-line bg-surface p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
          <i className="fa-solid fa-check" />
        </div>
        <h1 className="text-2xl font-black tracking-tight">Order Placed Successfully!</h1>
        <p className="text-xs text-ink-muted">Thank you. We will confirm this order before delivery.</p>
        <div className="space-y-2 rounded-xl border border-line bg-chip p-5 text-left text-xs">
          <div className="flex justify-between border-b border-line pb-2"><span>Order number:</span> <strong className="text-brand">{order.order_number}</strong></div>
          <div className="flex justify-between border-b border-line pb-2"><span>Payment:</span> <strong>Cash on delivery</strong></div>
          <div className="flex justify-between pt-1 text-sm font-bold"><span>Total amount:</span> <Price value={order.grand_total} className="text-brand" /></div>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={`/track?order=${order.order_number}`} className="liquid-glass-red rounded-xl px-5 py-3 text-xs font-bold text-white">Track Shipment</Link>
          <Link href="/" className="rounded-xl border border-line px-5 py-3 text-xs font-bold">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (store.cartItems.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-12 text-center">
        <h1 className="text-2xl font-black">Your cart is empty</h1>
        <Link href="/catalog" className="mt-4 inline-block font-bold text-brand">Browse hardware</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-ink-muted">
        <Link href="/" className="hover:text-brand">Home</Link>
        <span className="px-1">/</span>
        <Link href="/cart" className="hover:text-brand">Shopping Cart</Link>
        <span className="px-1">/</span>
        <span>Checkout</span>
      </p>
      <h1 className="text-2xl font-semibold text-ink-strong">Checkout</h1>
      <p className="rounded-md border border-emerald-700/40 bg-emerald-950/40 px-4 py-3 text-xs leading-relaxed text-emerald-200">
        Please enter a working mobile number. We call to confirm the order before it is delivered. Cash is collected on delivery.
      </p>

      {!store.user.isLoggedIn ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-ink-muted">Sign in if you want this order saved to your account.</p>
          <button type="button" onClick={() => store.openUi("auth")} className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white">
            Login to Avail
          </button>
        </div>
      ) : null}

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (!agreed) {
            setError("Please agree to the terms before confirming the order.");
            return;
          }
          const data = new FormData(event.currentTarget);
          setError("");
          setPending(true);
          try {
            const body = await placeOrder({
              shipping_method: method,
              shipping_name: `${data.get("first_name") || ""} ${data.get("last_name") || ""}`.trim(),
              shipping_phone: data.get("phone"),
              email: data.get("email"),
              shipping_address_line: method === "store_pickup" ? null : data.get("address"),
              shipping_district_id: method === "store_pickup" ? null : Number(districtId),
              ...placeSelection(method === "store_pickup" ? "" : thanaId),
              customer_note: data.get("comment") || null,
              items: store.cartItems.map((item) => ({
                product_id: Number(item.product.id),
                qty: item.quantity,
                option_value_id: item.optionId || null,
              })),
            });
            store.forgetCart();
            setOrder(body.data);
          } catch (requestError) {
            const first = requestError.errors ? Object.values(requestError.errors).flat()[0] : "";
            setError(first || requestError.message || "Could not place the order.");
          } finally {
            setPending(false);
          }
        }}
        className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12"
      >
        <section className="space-y-4 lg:col-span-7">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-strong">
            <i className="fa-regular fa-address-card text-ink-muted" />
            Shipping & Billing
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First Name" name="first_name" placeholder="First Name*" defaultValue={firstName} />
            <Field label="Last Name" name="last_name" placeholder="Last Name*" defaultValue={lastName} required={false} />
            <div className="sm:col-span-2">
              <Field label="Address" name="address" placeholder="Address*" defaultValue={store.user.address} required={method !== "store_pickup"} />
            </div>
            <label className="block text-xs">
              <span className="mb-1 block text-ink-muted">District</span>
              <select value={districtId} onChange={(event) => setDistrictId(event.target.value)} required={method !== "store_pickup"} className="h-10 w-full rounded-md border border-line bg-surface px-3 text-sm outline-none">
                {districts.length === 0 ? <option value="">Loading districts...</option> : null}
                {districts.map((entry) => (
                  <option key={entry.id} value={entry.id}>{entry.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs">
              <span className="mb-1 block text-ink-muted">Thana</span>
              <select value={thanaId} onChange={(event) => setThanaId(event.target.value)} required={method !== "store_pickup"} className="h-10 w-full rounded-md border border-line bg-surface px-3 text-sm outline-none">
                {thanas.length === 0 ? <option value="">Select a district first</option> : null}
                {thanas.map((entry) => (
                  <option key={entry.id} value={entry.id}>{entry.name}</option>
                ))}
              </select>
            </label>
            <Field label="Mobile" name="phone" placeholder="Telephone*" defaultValue={store.user.phone} />
            <Field label="Email" name="email" type="email" placeholder="E-Mail*" defaultValue={store.user.email} />
            <label className="block text-xs sm:col-span-2">
              <span className="mb-1 block text-ink-muted">Delivery</span>
              <select value={method} onChange={(event) => setMethod(event.target.value)} className="h-10 w-full rounded-md border border-line bg-surface px-3 text-sm outline-none">
                {methods.map((entry) => (
                  <option key={entry.method} value={entry.method}>{entry.label}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs sm:col-span-2">
              <span className="mb-1 block text-ink-muted">Comment</span>
              <textarea name="comment" rows={3} placeholder="Any special requirement/instruction for us?" className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none" />
            </label>
          </div>
        </section>

        <aside className="lg:col-span-5">
          <div className="overflow-hidden rounded-t-xl border border-b-0 border-line bg-surface">
            <div className="space-y-4 p-5">
              <h2 className="text-sm font-semibold">Order Summary</h2>
              <div className="max-h-40 space-y-2 overflow-y-auto border-b border-line pb-3 text-xs">
                {store.cartItems.map((item) => (
                  <div key={`${item.product.id}-${item.optionId || 0}`} className="flex items-start justify-between gap-3">
                    <p className="min-w-0">
                      <span className="block truncate">{item.product.name} <span className="text-ink-muted">x {item.quantity}</span></span>
                      {item.optionLabel ? <span className="block truncate text-ink-muted">{item.optionLabel}</span> : null}
                    </p>
                    <Price value={item.unitPrice * item.quantity} />
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-ink-muted">Sub-Total:</span> <Price value={store.cartSubtotal} /></div>
                <div className="flex justify-between"><span className="text-ink-muted">{method === "store_pickup" ? "Store Pickup" : "Home Delivery"}:</span> <Price value={fee} /></div>
                <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
                  <span>Total:</span>
                  <Price value={total} className="text-brand" />
                </div>
              </div>
              <label className="flex items-start gap-2 text-xs text-ink-muted">
                <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-0.5 accent-blue-500" />
                <span>I have read and agree to the Terms and Conditions, Privacy Policy and Refund and Return Policy</span>
              </label>
              {error ? <p className="text-xs font-semibold text-rose-400">{error}</p> : null}
              <button type="submit" disabled={pending} className="w-full rounded-md bg-[#5b4b8a] py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                {pending ? "Placing order..." : "Confirm Order"}
              </button>
            </div>
          </div>
          <div aria-hidden className="h-4 bg-surface [mask-image:radial-gradient(circle_at_12px_0,transparent_11px,#000_12px)] [mask-size:24px_16px] [mask-repeat:repeat-x]" />
        </aside>
      </form>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, defaultValue, required = true }) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block text-ink-muted">{label}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue} className="h-10 w-full rounded-md border border-line bg-surface px-3 text-sm outline-none" />
    </label>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/components/store/StoreProvider";
import Price from "@/components/ui/Price";
import RemoteImage from "@/components/ui/RemoteImage";
import { QtyControl } from "@/components/layout/Overlays";

export default function CartView() {
  const store = useStore();
  const [code, setCode] = useState(store.activeCoupon?.code || "");
  const total = store.cartSubtotal - store.cartDiscount;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black tracking-tight text-ink-strong">Shopping Cart</h1>
      {store.cartItems.length === 0 ? (
        <div className="space-y-4 rounded-2xl border border-line bg-surface p-12 text-center shadow-sm">
          <i className="fa-solid fa-cart-shopping text-5xl text-ink-muted" />
          <h2 className="text-lg font-bold">Your cart is currently empty</h2>
          <Link href="/catalog" className="liquid-glass-red inline-block rounded-xl px-6 py-3 text-xs font-bold text-white">Start Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm lg:col-span-8">
            <div className="flex items-center justify-between border-b border-line p-4">
              <span className="text-xs font-bold uppercase">Cart Items ({store.cartItems.length})</span>
              <button type="button" onClick={store.clearCart} className="text-xs font-semibold text-rose-600">Clear Entire Cart</button>
            </div>
            <div className="space-y-4 p-4">
              {store.cartItems.map((item) => (
                <div key={`${item.product.id}-${item.optionId || 0}`} className="flex flex-col items-center justify-between gap-4 border-b border-line pb-4 sm:flex-row">
                  <div className="flex w-full items-center gap-3 sm:w-2/3">
                    <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line">
                      <RemoteImage src={item.product.image} alt="" sizes="64px" className="object-cover" />
                    </span>
                    <div>
                      <h2 className="line-clamp-2 text-xs font-bold">{item.product.name}</h2>
                      {item.optionLabel ? <p className="text-[11px] text-ink-muted">{item.optionLabel}</p> : null}
                      <span className="text-[11px] text-ink-muted">Unit: <Price value={item.unitPrice} /></span>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between gap-4 sm:w-1/3 sm:justify-end">
                    <QtyControl quantity={item.quantity} onChange={(delta) => store.updateCartQuantity(item.product.id, delta, item.optionId)} />
                    <Price value={item.unitPrice * item.quantity} className="text-sm font-bold text-brand" />
                    <button type="button" onClick={() => store.removeFromCart(item.product.id, item.optionId)} className="text-ink-muted hover:text-rose-600" aria-label="Remove">
                      <i className="fa-solid fa-trash-can" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <aside className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-sm lg:col-span-4">
            <h2 className="border-b border-line pb-3 text-sm font-bold">Order Summary</h2>
            <label className="block text-xs font-semibold">Promo / Gift Voucher</label>
            <div className="flex gap-2">
              <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Try TECH24" className="flex-1 rounded-xl border border-line px-3 py-2 text-xs uppercase outline-none" />
              <button type="button" onClick={() => store.applyCoupon(code.trim().toUpperCase())} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white">Apply</button>
            </div>
            <div className="space-y-2 border-t border-line pt-3 text-xs">
              <div className="flex justify-between"><span>Items Subtotal:</span> <Price value={store.cartSubtotal} className="font-semibold" /></div>
              {store.cartDiscount > 0 ? (
                <div className="flex justify-between text-emerald-600"><span>Promo Discount:</span> <span>- ৳ {store.cartDiscount.toLocaleString("en-IN")}</span></div>
              ) : null}
              <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
                <span>Total Payable:</span>
                <Price value={total} className="text-brand" />
              </div>
            </div>
            <Link href="/checkout" className="liquid-glass-red block rounded-xl py-3.5 text-center text-xs font-bold text-white">Proceed to Checkout →</Link>
          </aside>
        </div>
      )}
    </div>
  );
}

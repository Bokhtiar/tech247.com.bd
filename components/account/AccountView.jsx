"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/components/store/StoreProvider";
import Price from "@/components/ui/Price";
import { myOrders } from "@/service/orders";

export default function AccountView() {
  const store = useStore();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!store.user.isLoggedIn) {
      setOrders([]);
      return undefined;
    }

    let cancelled = false;
    myOrders()
      .then((rows) => {
        if (!cancelled) setOrders(rows);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      });

    return () => {
      cancelled = true;
    };
  }, [store.user.isLoggedIn]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black tracking-tight text-ink-strong">Customer Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-sm lg:col-span-4">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-lg font-black text-white">
              {(store.user.name || "G").slice(0, 1)}
            </div>
            <div>
              <h2 className="text-sm font-bold">{store.user.name}</h2>
              <p className="text-xs text-ink-muted">{store.user.email}</p>
            </div>
          </div>
          <p className="text-xs text-ink-muted">Contact Number</p>
          <p className="text-xs font-semibold">{store.user.phone}</p>
          <p className="pt-2 text-xs text-ink-muted">Primary Shipping Address</p>
          <p className="text-xs font-semibold">{store.user.address}</p>
          {store.user.isLoggedIn ? null : (
            <button type="button" onClick={() => store.openUi("auth")} className="liquid-glass-red rounded-xl px-4 py-2 text-xs font-bold text-white">
              Sign in to save this profile
            </button>
          )}
        </section>
        <section className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-sm lg:col-span-8">
          <h2 className="flex items-center gap-2 text-sm font-bold"><i className="fa-solid fa-clock-rotate-left text-brand" /> My Order History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-[10px] font-semibold text-ink-muted uppercase">
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Items</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">View</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={6} className="py-6 text-center text-ink-muted">{store.user.isLoggedIn ? "No orders yet." : "Sign in to see your orders."}</td></tr>
                ) : orders.map((order) => (
                  <tr key={order.order_number} className="border-b border-line">
                    <td className="py-3 font-bold text-brand">{order.order_number}</td>
                    <td className="py-3 text-ink-muted">{order.placed_at}</td>
                    <td className="py-3">{order.items_count} Product(s)</td>
                    <td className="py-3 font-bold"><Price value={order.grand_total} /></td>
                    <td className="py-3"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{order.status.replaceAll("_", " ")}</span></td>
                    <td className="py-3 text-right">
                      <Link href={`/account/orders/${order.order_number}`} aria-label={`View ${order.order_number}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand hover:bg-red-50">
                        <i className="fa-solid fa-eye" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

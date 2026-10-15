"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/components/store/StoreProvider";
import Price from "@/components/ui/Price";
import { adminSummary } from "@/service/orders";

const staffAdminUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/api\/?$/, "/admin");

export default function AdminView() {
  const store = useStore();
  const canvasRef = useRef(null);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    adminSummary()
      .then((data) => {
        if (cancelled) return;
        setSummary(data);
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus(error?.status === 401 ? "unauthorized" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!summary) return undefined;
    let chart;
    let cancelled = false;
    (async () => {
      const { default: Chart } = await import("chart.js/auto");
      if (cancelled || !canvasRef.current) return;
      chart = new Chart(canvasRef.current, {
        type: "line",
        data: {
          labels: summary.months.map((month) => month.label),
          datasets: [
            {
              label: `Revenue ${summary.year} (৳)`,
              data: summary.months.map((month) => month.total),
              borderColor: "#E02424",
              backgroundColor: "rgba(224, 36, 36, 0.08)",
              borderWidth: 2.5,
              tension: 0.35,
              fill: true,
              pointBackgroundColor: "#E02424",
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    })();
    return () => {
      cancelled = true;
      chart?.destroy();
    };
  }, [summary]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold tracking-widest text-brand uppercase">Admin Control Panel</span>
          <h1 className="font-brand text-2xl font-black tracking-tight">TECH24 Operations Management</h1>
        </div>
        <button type="button" onClick={() => store.showToast("Inventory export completed", "success")} className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold">
          <i className="fa-solid fa-file-csv mr-1 text-emerald-400" /> Export Inventory
        </button>
      </div>
      {status === "loading" ? (
        <p className="rounded-2xl border border-line bg-surface px-4 py-16 text-center text-sm text-ink-muted">Loading orders...</p>
      ) : status === "unauthorized" ? (
        <div className="rounded-2xl border border-line bg-surface px-4 py-12 text-center">
          <p className="text-sm font-bold text-ink-strong">Sign in to the staff admin to see live orders.</p>
          {staffAdminUrl ? (
            <a href={staffAdminUrl} className="mt-3 inline-block text-sm font-bold text-brand">Open staff admin</a>
          ) : null}
        </div>
      ) : status === "error" ? (
        <p className="rounded-2xl border border-line bg-surface px-4 py-16 text-center text-sm text-ink-muted">Could not load orders.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat label="Total Gross Revenue" value={<Price value={summary.revenue} />} />
            <Stat label="Total Orders" value={summary.orders} />
            <Stat label="Catalog Products" value={summary.products} />
          </div>
          <section className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-bold"><i className="fa-solid fa-chart-line text-brand" /> Sales Performance Trend ({summary.year})</h2>
            {summary.orders === 0 ? (
              <p className="py-12 text-center text-sm text-ink-muted">No orders yet.</p>
            ) : (
              <div className="h-64">
                <canvas ref={canvasRef} />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <span className="text-xs font-medium text-ink-muted">{label}</span>
      <h3 className="mt-1 text-xl font-black text-ink-strong">{value}</h3>
    </div>
  );
}

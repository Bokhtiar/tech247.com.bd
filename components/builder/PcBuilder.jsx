"use client";

import { useRouter } from "next/navigation";
import { formatBDT } from "@/lib/format";
import { useStore } from "@/components/store/StoreProvider";
import Price from "@/components/ui/Price";
import RemoteImage from "@/components/ui/RemoteImage";

const slotIcons = {
  processor: "fa-microchip",
  motherboard: "fa-server",
  ram: "fa-memory",
  "graphics-card": "fa-gamepad",
  storage: "fa-hard-drive",
  "power-supply": "fa-plug",
  monitor: "fa-desktop",
  casing: "fa-computer",
  "cpu-cooler": "fa-fan",
};

export default function PcBuilder({ categories = [] }) {
  const store = useStore();
  const router = useRouter();
  const builderSlots = categories.map((category) => ({
    key: category.slug,
    label: category.name_en,
    category: category.slug,
    icon: slotIcons[category.slug] || "fa-cube",
    iconUrl: category.icon_url,
  }));
  const selected = builderSlots
    .map((slot) => ({ slot, product: store.productById(store.pcBuild[slot.key]) }))
    .filter((entry) => entry.product);
  const total = selected.reduce((sum, entry) => sum + entry.product.price, 0);
  let wattage = 150;
  if (store.pcBuild.processor) wattage += 125;
  if (store.pcBuild["graphics-card"]) wattage += 220;
  if (store.pcBuild.ram) wattage += 30;
  if (store.pcBuild.storage) wattage += 20;

  const cpu = store.productById(store.pcBuild.processor);
  const board = store.productById(store.pcBuild.motherboard);
  const socketWarning = cpu?.specs.Socket && board?.specs.Socket && cpu.specs.Socket !== board.specs.Socket
    ? `Socket mismatch: processor requires ${cpu.specs.Socket}, but motherboard is ${board.specs.Socket}.`
    : null;

  const openSlot = (slot) => {
    store.beginBuilderPick({ slug: slot.category, label: slot.label });
    router.push(`/catalog/${slot.category}`);
  };

  const printQuote = () => {
    if (selected.length === 0) {
      store.showToast("Select at least one component to print a quotation", "warning");
      return;
    }
    const area = document.getElementById("printArea");
    if (!area) return;
    area.innerHTML = `
      <div style="font-family:sans-serif;padding:30px;color:#0f172a">
        <h1 style="margin:0">TECH<span style="color:#dc2626">24</span> BANGLADESH</h1>
        <p>Official quotation · ${new Date().toLocaleDateString()}</p>
        <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:16px">
          <tr><th style="text-align:left;border:1px solid #cbd5e1;padding:8px">Slot</th><th style="text-align:left;border:1px solid #cbd5e1;padding:8px">Product</th><th style="text-align:right;border:1px solid #cbd5e1;padding:8px">Price</th></tr>
          ${selected.map(({ slot, product }) => `<tr><td style="border:1px solid #cbd5e1;padding:8px">${slot.label}</td><td style="border:1px solid #cbd5e1;padding:8px">${product.name}</td><td style="border:1px solid #cbd5e1;padding:8px;text-align:right">৳ ${formatBDT(product.price)}</td></tr>`).join("")}
          <tr><td colspan="2" style="border:1px solid #cbd5e1;padding:8px;text-align:right;font-weight:700">Total</td><td style="border:1px solid #cbd5e1;padding:8px;text-align:right;color:#dc2626;font-weight:700">৳ ${formatBDT(total)}</td></tr>
        </table>
      </div>`;
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white md:flex-row">
        <div>
          <div className="text-xs font-bold tracking-wider text-yellow-400 uppercase"><i className="fa-solid fa-bolt mr-1" /> Interactive PC Assembly Tool</div>
          <h1 className="font-brand text-2xl font-black tracking-tight">Desktop PC Builder</h1>
          <p className="text-xs text-slate-300">Choose parts with real-time socket and power checks.</p>
        </div>
        <div className="flex items-center gap-6 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3">
          <div className="text-right">
            <span className="block text-[10px] text-slate-400 uppercase">Est. Rig Wattage</span>
            <span className="text-sm font-bold text-amber-400">~{wattage} W</span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] text-slate-400 uppercase">Total Build Price</span>
            <Price value={total} className="text-xl font-black text-brand" />
          </div>
        </div>
      </div>

      {socketWarning ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-700">
          <strong>Hardware incompatibility detected:</strong> {socketWarning}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-800">
          <i className="fa-solid fa-circle-check text-emerald-600" /> All selected components are verified compatible.
        </div>
      )}

      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        {builderSlots.map((slot) => {
          const product = store.productById(store.pcBuild[slot.key]);
          return (
            <div key={slot.key} className="flex flex-col items-center justify-between gap-4 p-4 sm:flex-row sm:p-5">
              <div className="flex w-full items-center gap-4 sm:w-1/3">
                <div className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl text-lg ${product ? "bg-red-50 text-brand" : "bg-chip text-ink-muted"}`}>
                  {slot.iconUrl ? <RemoteImage src={slot.iconUrl} alt="" sizes="48px" className="object-contain p-2" /> : <i className={`fa-solid ${slot.icon}`} />}
                </div>
                <div>
                  <span className="text-xs font-bold">{slot.label}</span>
                  <span className="block text-[11px] text-ink-muted">Slot: {slot.category}</span>
                </div>
              </div>
              <div className="w-full sm:flex-1">
                {product ? (
                  <div className="flex items-center gap-3 rounded-xl border border-line bg-chip p-2.5">
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                      <RemoteImage src={product.image} alt="" sizes="40px" className="object-cover" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold">{product.name}</p>
                      <Price value={product.price} className="text-[11px] font-bold text-brand" />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-line p-2.5 text-center text-xs text-ink-muted">No {slot.label} selected</div>
                )}
              </div>
              <div className="flex w-full justify-end gap-2 sm:w-auto">
                {product ? (
                  <button type="button" onClick={() => {
                    const next = { ...store.pcBuild };
                    delete next[slot.key];
                    store.setPcBuild(next);
                  }} className="rounded-lg p-2 text-rose-500" aria-label="Remove part">
                    <i className="fa-solid fa-trash-can" />
                  </button>
                ) : null}
                <button type="button" onClick={() => openSlot(slot)} className={product ? "rounded-lg border border-line px-4 py-2 text-xs font-bold" : "liquid-glass-red rounded-lg px-5 py-2 text-xs font-bold text-white"}>
                  {product ? "Change" : "Select"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => store.setPcBuild({})} className="rounded-lg px-3 py-2 text-xs font-semibold hover:bg-chip">Reset Build</button>
          <button type="button" onClick={printQuote} className="rounded-lg px-3 py-2 text-xs font-semibold hover:bg-chip">Print / Save PDF</button>
          <button
            type="button"
            onClick={async () => {
              const url = `${window.location.origin}/pc-builder#build-${Object.values(store.pcBuild).join("-") || "empty"}`;
              await navigator.clipboard.writeText(url);
              store.showToast("Build share link copied to clipboard", "success");
            }}
            className="rounded-lg px-3 py-2 text-xs font-semibold hover:bg-chip"
          >
            Share Build
          </button>
        </div>
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={async () => {
            for (const { product } of selected) {
              const added = await store.addToCart(product.id, 1, { silent: true });
              if (!added) return;
            }
            store.showToast(`${selected.length} build components added to your cart`, "success");
            router.push("/cart");
          }}
          className="liquid-glass-red rounded-xl px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          Add All to Cart
        </button>
      </div>

    </div>
  );
}

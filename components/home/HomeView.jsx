"use client";

import Link from "next/link";
import { useStore } from "@/components/store/StoreProvider";
import ProductCard from "@/components/product/ProductCard";
import EmptyProducts from "@/components/ui/EmptyProducts";

const categoryIcons = {
  processor: "fa-microchip",
  motherboard: "fa-server",
  "graphics-card": "fa-display",
  ram: "fa-memory",
  storage: "fa-hard-drive",
  "power-supply": "fa-plug",
  casing: "fa-box",
  "cpu-cooler": "fa-fan",
  monitor: "fa-tv",
  laptop: "fa-laptop",
  accessories: "fa-keyboard",
};

function categoryIcon(slug) {
  return categoryIcons[slug] ?? "fa-cubes";
}
import RemoteImage from "@/components/ui/RemoteImage";

export default function HomeView({ featuredCategories = [] }) {
  const store = useStore();
  const featured = store.products.filter((product) => product.featured);
  const deals = store.products.filter((product) => product.hotDeal);

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="relative flex min-h-[340px] items-center overflow-hidden rounded-2xl border border-slate-800 bg-hero p-6 text-white shadow-xl sm:min-h-[400px] sm:p-12 lg:col-span-3">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-black via-slate-950/85 to-transparent" />
          <RemoteImage src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1400&auto=format&fit=crop&q=80" alt="" className="scale-105 object-cover object-right opacity-30" sizes="100vw" priority />
          <div className="relative z-20 max-w-lg space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-bold tracking-wide uppercase">
              <i className="fa-solid fa-fire text-amber-300" /> Autumn Tech Mega Fest 2026
            </span>
            <h1 className="font-brand text-3xl leading-none font-black tracking-tight sm:text-5xl">
              NEXT-GEN HARDWARE <br />
              <span className="bg-gradient-to-r from-red-500 via-orange-400 to-amber-300 bg-clip-text text-transparent">UNLEASHED</span>
            </h1>
            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              Build your custom dream gaming workstation with 14th Gen Intel Core, AMD AM5 platforms, and NVIDIA RTX 40-Series cards. Verified manufacturer warranty and instant delivery.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/pc-builder" className="liquid-glass-red rounded-xl px-6 py-3 text-xs font-bold sm:text-sm">
                <i className="fa-solid fa-microchip mr-2" /> Assemble Your PC
              </Link>
              <Link href="/catalog" className="liquid-glass-btn rounded-xl px-5 py-3 text-xs font-bold text-white sm:text-sm">
                Browse Components
              </Link>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="flex flex-col justify-between rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">Fast Assistance</span>
              <h2 className="mt-1 text-base font-bold">Get an Official Quotation</h2>
              <p className="mt-1 text-xs text-slate-300">Submit a parts list for institutional or corporate procurement.</p>
            </div>
            <Link href="/pc-builder" className="mt-4 text-xs font-bold text-brand-light">Request Quotation →</Link>
          </div>
          <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-brand to-brand-deep p-5 text-white">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-red-200 uppercase">Zero Interest</span>
              <h2 className="mt-1 text-base font-bold">Up to 12 Months 0% EMI</h2>
              <p className="mt-1 text-xs text-red-100">Flexible installment plans with leading commercial banks in Bangladesh.</p>
            </div>
            <button type="button" onClick={() => store.openUi("emi")} className="liquid-glass-btn mt-4 rounded-lg px-3 py-2 text-xs font-bold text-white">
              Calculate Installment
            </button>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight text-ink-strong sm:text-xl">Featured Categories</h2>
            <p className="text-xs text-ink-muted">Explore authentic electronics by component category</p>
          </div>
          <Link href="/catalog" className="text-xs font-bold text-brand">View All →</Link>
        </div>
        {featuredCategories.length === 0 ? (
          <EmptyProducts title="No featured categories yet." />
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 md:grid-cols-6 lg:grid-cols-9">
            {featuredCategories.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => store.browseCategory(category.slug)}
                className="flex flex-col items-center gap-1 rounded-xl border border-line bg-surface p-2 text-center shadow-sm transition hover:border-brand sm:gap-1.5 sm:p-3.5"
              >
                <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-chip text-ink sm:h-10 sm:w-10">
                  {category.icon_url ? <RemoteImage src={category.icon_url} alt="" sizes="40px" className="object-contain p-1.5 sm:p-2" /> : <i className={`fa-solid ${categoryIcon(category.slug)} text-xs sm:text-sm`} />}
                </span>
                <span className="w-full truncate text-[10px] leading-tight font-semibold text-ink sm:text-xs">{category.name_en}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 via-white to-amber-50 p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-3 shrink-0 rounded-full bg-brand" />
            <div className="min-w-0">
              <h2 className="flex flex-wrap items-center gap-2 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                Special Deals & Offers
                <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-black text-white uppercase">Limited Stock</span>
              </h2>
              <p className="text-xs text-slate-500">Unbeatable retail prices with instant warranty support</p>
            </div>
          </div>
          <Link href="/deals" className="shrink-0 text-xs font-bold text-brand">View All Deals →</Link>
        </div>
        {deals.length === 0 ? (
          <EmptyProducts title="No deal products right now." />
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {deals.map((product) => <ProductCard key={product.id} product={product} phoneDense />)}
          </div>
        )}
      </section>

      <section className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white sm:p-8 md:flex-row">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-md border border-red-800 bg-red-950/60 px-3 py-1 text-xs font-bold text-brand-light">
            <i className="fa-solid fa-microchip" /> PC Configurator
          </div>
          <h2 className="font-brand text-2xl font-black tracking-tight sm:text-3xl">Need 100% Guaranteed Compatible Hardware?</h2>
          <p className="text-xs text-slate-300">Select processors, motherboards, RAM, and graphic cards with automated socket compatibility checks.</p>
        </div>
        <Link href="/pc-builder" className="liquid-glass-red shrink-0 rounded-xl px-8 py-3.5 text-sm font-bold">
          <i className="fa-solid fa-wrench mr-2" /> Open PC Builder
        </Link>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight text-ink-strong sm:text-xl">Latest & Trending Hardware</h2>
            <p className="text-xs text-ink-muted">In stock at IDB, Multiplan, and nationwide distribution centers</p>
          </div>
          <Link href="/catalog" className="text-xs font-bold text-brand">See All Hardware →</Link>
        </div>
        {featured.length === 0 ? (
          <EmptyProducts title="No products to show." />
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => <ProductCard key={product.id} product={product} phoneDense />)}
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { defaultFilters } from "@/lib/catalog";
import { formatBDT } from "@/lib/format";
import { useStore } from "@/components/store/StoreProvider";
import ProductCard from "@/components/product/ProductCard";

const PER_PAGE = 10;

export default function CatalogView({ categorySlug = "All", categoryName = null }) {
  const store = useStore();
  const router = useRouter();
  const { filters, setFilters } = store;
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: PER_PAGE, total: 0, price_max: 0 });
  const [loading, setLoading] = useState(true);
  const [priceCeiling, setPriceCeiling] = useState(0);
  const [debouncedPrice, setDebouncedPrice] = useState(filters.maxPrice);
  const activeSlug = ready ? filters.category : categorySlug;
  const activeName = activeSlug === "All" ? null : activeSlug === categorySlug ? categoryName : categoryNameFrom(store.categories, activeSlug);
  const categoryOptions = [{ value: "All", label: "All" }, ...categoryOptionsFrom(store.categories)];
  const brandOptions = [{ value: "All", label: "All" }, ...store.brands.map((brand) => ({ value: brand.slug, label: brand.name }))];
  const sliderMax = priceCeiling ? Math.max(1000, Math.ceil(priceCeiling / 1000) * 1000) : 300000;
  const sliderValue = Math.min(Number(filters.maxPrice) || sliderMax, sliderMax);
  const priceFilter = debouncedPrice < sliderMax ? debouncedPrice : null;
  const filterKey = [activeSlug, filters.brand, priceFilter, filters.inStockOnly, filters.sortBy, filters.searchQuery].join("|");
  const [seenFilter, setSeenFilter] = useState(filterKey);

  if (seenFilter !== filterKey) {
    setSeenFilter(filterKey);
    setPage(1);
  }

  useEffect(() => {
    setFilters((current) => (current.category === categorySlug ? current : { ...current, category: categorySlug }));
    setReady(true);
  }, [categorySlug, setFilters]);

  useEffect(() => {
    const onPop = () => {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const next = parts[0] === "catalog" && parts[1] ? decodeURIComponent(parts[1]) : "All";
      setFilters((current) => ({ ...current, category: next }));
      setReady(true);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [setFilters]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPrice(filters.maxPrice), 250);
    return () => clearTimeout(timer);
  }, [filters.maxPrice]);

  useEffect(() => {
    if (!ready) return undefined;

    const controller = new AbortController();
    const params = new URLSearchParams();
    const sort = { "price-asc": "price_asc", "price-desc": "price_desc", rating: "rating" }[filters.sortBy];

    params.set("per_page", String(PER_PAGE));
    params.set("page", String(page));
    if (activeSlug && activeSlug !== "All") params.set("category", activeSlug);
    if (filters.brand && filters.brand !== "All") params.set("brand", filters.brand);
    if (priceFilter) params.set("max_price", String(priceFilter));
    if (filters.inStockOnly) params.set("in_stock", "1");
    if (filters.searchQuery) params.set("q", filters.searchQuery);
    if (sort) params.set("sort", sort);

    setLoading(true);
    fetch(`/api/products?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Catalog request failed");
        return response.json();
      })
      .then((body) => {
        setProducts(Array.isArray(body?.data) ? body.data : []);
        setMeta({
          current_page: Number(body?.meta?.current_page) || 1,
          last_page: Number(body?.meta?.last_page) || 1,
          per_page: Number(body?.meta?.per_page) || PER_PAGE,
          total: Number(body?.meta?.total) || 0,
          price_max: Number(body?.meta?.price_max) || 0,
        });
        if (body?.meta?.price_max) setPriceCeiling(Number(body.meta.price_max));
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setProducts([]);
        setMeta({ current_page: 1, last_page: 1, per_page: PER_PAGE, total: 0, price_max: 0 });
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [ready, activeSlug, filters.brand, filters.inStockOnly, filters.sortBy, filters.searchQuery, page, priceFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-ink-muted">
        <Link href="/" className="hover:text-brand">Home</Link>
        <i className="fa-solid fa-chevron-right text-[10px]" />
        <span className="font-semibold text-ink">Product Catalog</span>
        {activeName ? (
          <>
            <i className="fa-solid fa-chevron-right text-[10px]" />
            <span className="font-bold text-brand">{activeName}</span>
          </>
        ) : null}
      </div>
      {store.builderPick ? (
        <div className="sticky top-3 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/30 bg-red-50 px-4 py-3 shadow-sm">
          <div>
            <p className="text-sm font-black text-ink-strong">Choosing {store.builderPick.label} for your PC</p>
            <p className="text-xs text-ink-muted">Select a product to place it in the build, or cancel to return without changing it.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeSlug !== store.builderPick.slug ? (
              <button type="button" onClick={() => store.browseCategory(store.builderPick.slug)} className="rounded-lg border border-brand px-3 py-2 text-xs font-bold text-brand">
                Show {store.builderPick.label}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                store.cancelBuilderPick();
                router.push("/pc-builder");
              }}
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 space-y-5 lg:w-64">
          <div className="space-y-5 rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink-strong">
                <i className="fa-solid fa-sliders text-brand" /> Refine Search
              </h2>
              <button type="button" onClick={() => { setFilters(defaultFilters); setReady(true); window.history.pushState(null, "", "/catalog"); }} className="text-xs font-semibold text-brand">
                Reset
              </button>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold">Max Price</label>
              <input
                type="range"
                min="1000"
                max={sliderMax}
                step="1000"
                value={sliderValue}
                onChange={(event) => setFilters((current) => ({ ...current, maxPrice: Number(event.target.value) }))}
                className="w-full accent-brand"
              />
              <div className="mt-1 flex justify-between text-xs text-ink-muted">
                <span>৳ 1,000</span>
                <span className="badge-bdt font-bold text-brand">{formatBDT(sliderValue)}</span>
              </div>
            </div>
            <FilterGroup label="Category" name="category" options={categoryOptions} value={activeSlug} onChange={(category) => store.browseCategory(category)} />
            <FilterGroup label="Brand" name="brand" options={brandOptions} value={filters.brand} onChange={(brand) => setFilters((current) => ({ ...current, brand }))} />
            <label className="flex items-center gap-2 border-t border-line pt-4 text-xs font-medium">
              <input type="checkbox" checked={filters.inStockOnly} onChange={(event) => setFilters((current) => ({ ...current, inStockOnly: event.target.checked }))} className="accent-brand" />
              In Stock Only
            </label>
          </div>
        </aside>
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3.5 text-xs shadow-sm">
            <div className="text-ink-muted">
              Showing <strong className="text-ink">{meta.total}</strong> matching products
              {filters.searchQuery ? <> for &quot;<span className="font-bold text-brand">{filters.searchQuery}</span>&quot;</> : null}
            </div>
            <label className="flex items-center gap-2">
              <span className="text-ink-muted">Sort by:</span>
              <select value={filters.sortBy} onChange={(event) => setFilters((current) => ({ ...current, sortBy: event.target.value }))} className="rounded-lg border border-line bg-chip px-3 py-1.5 text-xs font-medium text-ink outline-none">
                <option value="featured">Featured & Relevant</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </label>
          </div>
          {loading ? (
            <p className="rounded-2xl border border-line bg-surface px-4 py-16 text-center text-sm text-ink-muted">Loading products...</p>
          ) : products.length === 0 ? (
            <div className="space-y-3 rounded-2xl border border-line bg-surface p-12 text-center">
              <i className="fa-solid fa-box-open text-4xl text-ink-muted" />
              <h2 className="text-base font-bold">No Components Found</h2>
              <p className="mx-auto max-w-sm text-xs text-ink-muted">Try adjusting your filters or price slider.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
          <Pagination page={meta.current_page} lastPage={meta.last_page} total={meta.total} onPage={setPage} />
        </div>
      </div>
    </div>
  );
}

function categoryNameFrom(nodes, slug) {
  for (const node of nodes) {
    if (node.slug === slug) return node.name_en;
    const child = node.children?.length ? categoryNameFrom(node.children, slug) : null;
    if (child) return child;
  }

  return null;
}

function categoryOptionsFrom(nodes) {
  const options = [];

  nodes.forEach((node) => {
    options.push({ value: node.slug, label: node.name_en });
    if (node.children?.length) options.push(...categoryOptionsFrom(node.children));
  });

  return options;
}

function pageList(page, lastPage) {
  if (lastPage <= 7) return Array.from({ length: lastPage }, (_, index) => index + 1);

  const pages = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(lastPage - 1, page + 1);
  if (start > 2) pages.push(null);
  for (let number = start; number <= end; number += 1) pages.push(number);
  if (end < lastPage - 1) pages.push(null);
  pages.push(lastPage);
  return pages;
}

function Pagination({ page, lastPage, total, onPage }) {
  if (!total) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40">
        Previous
      </button>
      {pageList(page, lastPage).map((number, index) => number === null ? (
        <span key={`gap-${index}`} className="px-1 text-xs text-ink-muted">...</span>
      ) : (
        <button
          key={number}
          type="button"
          onClick={() => onPage(number)}
          className={`h-8 min-w-8 rounded-lg border px-2 text-xs font-bold ${number === page ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink"}`}
        >
          {number}
        </button>
      ))}
      <button type="button" disabled={page >= lastPage} onClick={() => onPage(page + 1)} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40">
        Next
      </button>
    </div>
  );
}

function FilterGroup({ label, name, options, value, onChange }) {
  return (
    <div className="border-t border-line pt-4">
      <p className="mb-2 text-xs font-bold">{label}</p>
      <div className="max-h-48 space-y-1 overflow-y-auto text-xs">
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;

          return (
            <label key={optionValue} className="flex cursor-pointer items-center gap-2 py-0.5 text-ink-muted">
              <input type="radio" name={name} checked={value === optionValue} onChange={() => onChange(optionValue)} className="accent-brand" />
              {optionLabel}
            </label>
          );
        })}
      </div>
    </div>
  );
}

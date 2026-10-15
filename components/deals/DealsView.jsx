"use client";

import { useEffect, useState } from "react";
import EmptyProducts from "@/components/ui/EmptyProducts";
import ProductCard from "@/components/product/ProductCard";

const PER_PAGE = 4;

export default function DealsView({ initialProducts = [], initialMeta = null }) {
  const [page, setPage] = useState(initialMeta?.current_page || 1);
  const [products, setProducts] = useState(initialProducts);
  const [meta, setMeta] = useState(initialMeta || { current_page: 1, last_page: 1, per_page: PER_PAGE, total: initialProducts.length });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/deals?page=${page}&per_page=${PER_PAGE}`, { signal: controller.signal, cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Deals request failed");
        return response.json();
      })
      .then((body) => {
        setProducts(Array.isArray(body?.data) ? body.data : []);
        setMeta({
          current_page: Number(body?.meta?.current_page) || page,
          last_page: Number(body?.meta?.last_page) || 1,
          per_page: Number(body?.meta?.per_page) || PER_PAGE,
          total: Number(body?.meta?.total) || 0,
        });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setProducts([]);
        setMeta({ current_page: 1, last_page: 1, per_page: PER_PAGE, total: 0 });
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page]);

  const from = products.length === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = products.length === 0 ? 0 : from + products.length - 1;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-brand to-amber-600 p-8 text-white shadow-xl">
        <span className="text-xs font-bold tracking-wider text-amber-200 uppercase">Official Tech Promotions</span>
        <h1 className="font-brand text-3xl font-black tracking-tight">Super Saver Flash Deals</h1>
        <p className="text-xs text-red-100">Genuine retail warranty bundled with cash discounts.</p>
      </div>
      {products.length === 0 && !loading ? (
        <EmptyProducts title="No deal products right now." />
      ) : (
        <div className={`grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 ${loading ? "opacity-60" : ""}`}>
          {products.map((product) => <ProductCard key={product.id} product={product} phoneDense />)}
        </div>
      )}
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs text-ink-muted">
          {loading ? "Loading deals..." : `Showing ${from}–${to} of ${meta.total}`}
        </p>
        <DealPagination page={meta.current_page} lastPage={meta.last_page} total={meta.total} onPage={setPage} />
      </div>
    </div>
  );
}

function pageList(page, lastPage) {
  if (lastPage <= 1) return [1];
  const pages = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(lastPage - 1, page + 1);
  if (start > 2) pages.push(null);
  for (let number = start; number <= end; number += 1) pages.push(number);
  if (end < lastPage - 1) pages.push(null);
  if (lastPage > 1) pages.push(lastPage);
  return pages;
}

function DealPagination({ page, lastPage, total, onPage }) {
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

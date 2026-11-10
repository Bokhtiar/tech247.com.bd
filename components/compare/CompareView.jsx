"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/components/store/StoreProvider";
import Price from "@/components/ui/Price";
import RemoteImage from "@/components/ui/RemoteImage";

export default function CompareView() {
  const store = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("group_id");
  const idsFromUrl = useMemo(
    () => String(searchParams.get("ids") || "")
      .split(",")
      .map((value) => Number(value.trim()))
      .filter(Boolean)
      .slice(0, 4),
    [searchParams],
  );

  const [products, setProducts] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [meta, setMeta] = useState({});
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (idsFromUrl.length) store.hydrateCompare(idsFromUrl);
    // Hydrate once from shareable URL ids.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsFromUrl.join(",")]);

  useEffect(() => {
    const ids = idsFromUrl.length ? idsFromUrl : store.compareList;
    if (!groupId && ids.length === 0) {
      setProducts([]);
      setAttributes([]);
      setStatus("empty");
      return undefined;
    }

    let cancelled = false;
    setStatus("loading");
    setError("");

    const params = new URLSearchParams();
    if (groupId) params.set("group_id", groupId);
    if (ids.length) params.set("ids", ids.join(","));

    fetch(`/api/compare?${params}`, { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.message || "Could not load comparison.");
        return body;
      })
      .then((body) => {
        if (cancelled) return;
        const list = Array.isArray(body.data) ? body.data : [];
        setProducts(list);
        setAttributes(Array.isArray(body.compareAttributes) ? body.compareAttributes : []);
        setMeta(body.meta || {});
        setStatus(list.length ? "ready" : "empty");
      })
      .catch((requestError) => {
        if (cancelled) return;
        setError(requestError.message || "Could not load comparison.");
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [groupId, idsFromUrl, store.compareList]);

  function removeProduct(productId) {
    store.removeFromCompare(productId);
    const nextIds = (idsFromUrl.length ? idsFromUrl : store.compareList).filter((id) => id !== productId);
    const nextGroup = groupId || meta.compare_group_id;
    const params = new URLSearchParams();
    if (nextGroup && nextIds.length) params.set("group_id", String(nextGroup));
    if (nextIds.length) params.set("ids", nextIds.join(","));
    router.replace(params.toString() ? `/compare?${params}` : "/compare");
  }

  function clearAll() {
    store.clearCompare();
    router.replace("/compare");
  }

  if (status === "loading") {
    return <p className="text-sm text-ink-muted">Loading comparison...</p>;
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <p className="text-sm font-semibold text-rose-500">{error}</p>
        <Link href="/catalog" className="mt-4 inline-block text-sm font-bold text-brand">Browse catalog</Link>
      </div>
    );
  }

  if (status === "empty" || products.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-12 text-center">
        <h1 className="text-2xl font-black tracking-tight">Compare products</h1>
        <p className="mt-2 text-sm text-ink-muted">Add up to 4 products from the same compare group.</p>
        <Link href="/catalog" className="mt-6 inline-block rounded-xl bg-brand px-5 py-3 text-xs font-bold text-white">Browse catalog</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-ink-strong">Compare products</h1>
          {meta.compare_group_name ? (
            <p className="mt-1 text-xs text-ink-muted">Group: {meta.compare_group_name}</p>
          ) : null}
        </div>
        <button type="button" onClick={clearAll} className="text-xs font-semibold text-ink-muted underline hover:text-brand">
          Clear all
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
        <table className="min-w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-line bg-chip">
              <th className="sticky left-0 z-10 min-w-[140px] bg-chip p-3 text-[10px] font-semibold tracking-wide text-ink-muted uppercase">Specifications</th>
              {products.map((product) => (
                <th key={product.id} className="min-w-[200px] p-3 align-top">
                  <div className="space-y-2">
                    <span className="relative mx-auto block h-28 w-full overflow-hidden rounded-xl border border-line bg-white">
                      <RemoteImage src={product.image} alt={product.name} className="object-contain p-2" sizes="200px" />
                    </span>
                    <Link href={`/product/${product.slug}`} className="line-clamp-2 block font-semibold text-ink-strong hover:text-brand">
                      {product.name}
                    </Link>
                    <Price value={product.price} className="block text-base font-black text-brand" />
                    {product.regularPrice > product.price ? (
                      <Price value={product.regularPrice} className="block text-ink-muted line-through" />
                    ) : null}
                    <p className="text-ink-muted">Brand: <span className="font-semibold text-ink">{product.brand || "N/A"}</span></p>
                    <p className="text-ink-muted">Availability: <span className="font-semibold text-ink">{product.availability || "N/A"}</span></p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => store.addToCart(product.id, 1, {
                          name: product.name,
                          slug: product.slug,
                          image: product.image,
                          unitPrice: product.price,
                        })}
                        className="liquid-glass-red rounded-lg px-3 py-2 text-[11px] font-bold text-white"
                      >
                        Add to Cart
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        className="rounded-lg border border-line px-3 py-2 text-[11px] font-bold text-ink-muted hover:text-brand"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-line">
              <td className="sticky left-0 z-10 bg-surface p-3 font-bold text-ink">Brand</td>
              {products.map((product) => (
                <td key={`brand-${product.id}`} className="p-3">{product.brand || "N/A"}</td>
              ))}
            </tr>
            <tr className="border-t border-line bg-chip/40">
              <td className="sticky left-0 z-10 bg-chip/40 p-3 font-bold text-ink">Availability</td>
              {products.map((product) => (
                <td key={`stock-${product.id}`} className="p-3">{product.availability || "N/A"}</td>
              ))}
            </tr>
            <tr className="border-t border-line">
              <td className="sticky left-0 z-10 bg-surface p-3 font-bold text-ink">Price</td>
              {products.map((product) => (
                <td key={`price-${product.id}`} className="p-3"><Price value={product.price} className="font-bold text-brand" /></td>
              ))}
            </tr>
            {attributes.map((attribute, index) => (
              <tr key={attribute.code} className={`border-t border-line ${index % 2 === 0 ? "bg-chip/40" : ""}`}>
                <td className={`sticky left-0 z-10 p-3 font-bold text-ink ${index % 2 === 0 ? "bg-chip/40" : "bg-surface"}`}>
                  {attribute.name}
                </td>
                {products.map((product) => {
                  const value = product.compare_specs?.[attribute.code];
                  return (
                    <td key={`${product.id}-${attribute.code}`} className="p-3">
                      {value == null || value === "" ? "N/A" : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

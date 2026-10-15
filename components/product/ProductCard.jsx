"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/components/store/StoreProvider";
import Price from "@/components/ui/Price";
import RemoteImage from "@/components/ui/RemoteImage";

export default function ProductCard({ product, phoneDense = false }) {
  const router = useRouter();
  const store = useStore();
  const saved = store.wishlist.includes(product.id);
  const compared = store.compareList.includes(product.id);
  const highlights = Object.entries(product.specs).slice(0, 2);
  const forBuild = store.builderPick && (product.category_slugs ?? [product.category_slug]).includes(store.builderPick.slug);

  return (
    <article className={`group flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface transition hover:border-brand hover:shadow-xl ${phoneDense ? "max-sm:rounded-xl" : ""}`}>
      <div className={`relative flex flex-col items-center p-4 ${phoneDense ? "max-sm:p-2.5" : ""}`}>
        <div className={`absolute top-3 left-3 z-10 flex flex-col gap-1 ${phoneDense ? "max-sm:top-2 max-sm:left-2" : ""}`}>
          {product.hotDeal ? <span className="rounded bg-brand px-2 py-0.5 text-[9px] font-black text-white">DEAL</span> : null}
          {product.stock <= 5 ? <span className="rounded bg-amber-500 px-2 py-0.5 text-[9px] font-black text-white">LOW STOCK</span> : null}
        </div>
        <div className={`absolute top-3 right-3 z-10 flex flex-col gap-1.5 ${phoneDense ? "max-sm:top-2 max-sm:right-2 max-sm:gap-1" : ""}`}>
          <button type="button" onClick={() => store.toggleWishlist(product.id)} className={`rounded-full border border-white/40 bg-white/70 p-2 text-slate-700 backdrop-blur hover:text-brand ${phoneDense ? "max-sm:p-1.5" : ""}`} aria-label="Save to wishlist">
            <i className={`${saved ? "fa-solid text-brand" : "fa-regular"} fa-heart text-xs`} />
          </button>
          <button type="button" onClick={() => store.toggleCompare(product.id)} className={`rounded-full border border-white/40 bg-white/70 p-2 text-slate-700 backdrop-blur hover:text-blue-600 ${phoneDense ? "max-sm:p-1.5" : ""}`} aria-label="Add to compare">
            <i className={`fa-solid fa-code-compare text-xs ${compared ? "font-bold text-blue-600" : ""}`} />
          </button>
        </div>
        <button type="button" onClick={() => router.push(`/product/${product.slug}`)} className={`relative -mx-4 -mt-4 mb-3 h-62 w-[calc(100%+2rem)] overflow-hidden rounded-none rounded-t-2xl bg-white ${phoneDense ? "max-sm:-mx-2.5 max-sm:-mt-2.5 max-sm:mb-2 max-sm:h-28 max-sm:w-[calc(100%+1.25rem)] max-sm:rounded-t-xl" : ""}`}>
          <RemoteImage src={product.image} alt={product.name} className="object-cover" sizes="(max-width: 768px) 50vw, 280px" />
        </button>
        <div className="mb-1 flex w-full items-center justify-between text-[11px] text-ink-muted">
          <span className={product.stock > 0 ? "font-medium text-emerald-600" : "font-medium text-rose-600"}>
            <i className="fa-solid fa-circle mr-1 text-[6px]" />
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </span>
          <span>{product.warranty}</span>
        </div>
        <h3 className="line-clamp-2 min-h-8 w-full text-xs leading-snug font-bold text-ink">
          <button type="button" onClick={() => router.push(`/product/${product.slug}`)} className="text-left hover:text-brand">
            {product.name}
          </button>
        </h3>
        <ul className={`mt-2 w-full space-y-0.5 border-t border-line pt-2 text-[10px] text-ink-muted ${phoneDense ? "max-sm:hidden" : ""}`}>
          {highlights.map(([key, value]) => (
            <li key={key} className="truncate">• <strong>{key}:</strong> {value}</li>
          ))}
        </ul>
      </div>
      <div className={`mt-2 border-t border-line p-4 pt-3 ${phoneDense ? "max-sm:p-2.5 max-sm:pt-2" : ""}`}>
        <div className={`mb-3 flex items-baseline gap-2 ${phoneDense ? "max-sm:mb-2 max-sm:flex-wrap max-sm:gap-1" : ""}`}>
          <Price value={product.price} className={`text-base font-extrabold text-brand ${phoneDense ? "max-sm:text-sm" : ""}`} />
          {product.regularPrice > product.price ? (
            <Price value={product.regularPrice} className="text-xs text-ink-muted line-through" />
          ) : null}
        </div>
        {forBuild ? (
          <button
            type="button"
            onClick={() => {
              if (store.assignBuilderPart(product)) router.push("/pc-builder");
            }}
            className="liquid-glass-red w-full rounded-xl py-2 text-xs font-bold text-white"
          >
            Select for build
          </button>
        ) : (
          <div className={`grid grid-cols-2 gap-2 ${phoneDense ? "max-sm:gap-1.5" : ""}`}>
            <button type="button" onClick={() => store.addToCart(product.id)} className={`rounded-xl border border-line bg-chip py-2 text-xs font-bold text-ink hover:text-brand ${phoneDense ? "max-sm:rounded-lg max-sm:px-1 max-sm:py-1.5 max-sm:text-[10px]" : ""}`}>
              <i className="fa-solid fa-cart-plus mr-1" /> Cart
            </button>
            <button
              type="button"
              onClick={async () => {
                const added = await store.addToCart(product.id);
                if (added) router.push("/checkout");
              }}
              className={`liquid-glass-red rounded-xl py-2 text-xs font-bold text-white ${phoneDense ? "max-sm:rounded-lg max-sm:px-1 max-sm:py-1.5 max-sm:text-[10px]" : ""}`}
            >
              Buy Now
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/components/store/StoreProvider";
import Price from "@/components/ui/Price";
import RemoteImage from "@/components/ui/RemoteImage";
import ProductCard from "@/components/product/ProductCard";

function chargedPrice(product, value) {
  const modifier = Number(value?.price) || 0;
  if (value?.priceKind === "emi") return Number(product.regularPrice) + modifier;
  return Number(product.price) + modifier;
}

function defaultOptionValue(options) {
  for (const option of options || []) {
    const chosen = option.values?.find((value) => value.isDefault) || (option.required ? option.values?.[0] : null);
    if (chosen) return chosen.id;
  }
  return null;
}

function plainText(value) {
  return String(value || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function descriptionHtml(value) {
  return plainText(value) ? value : "";
}

function DescriptionBody({ product }) {
  const html = descriptionHtml(product.descriptionHtml);
  const short = plainText(product.description);
  const showShort = short && short !== plainText(html);

  if (!showShort && !html) {
    return <p className="text-sm leading-relaxed text-ink">No description yet.</p>;
  }

  return (
    <div className="space-y-4">
      {showShort ? <p className="text-sm font-medium leading-relaxed text-ink-strong">{product.description}</p> : null}
      {html ? (
        <div
          className="text-sm leading-relaxed text-ink [&_a]:text-brand [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:font-bold [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_table]:w-full [&_td]:border [&_td]:border-line [&_td]:p-2 [&_th]:border [&_th]:border-line [&_th]:p-2 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : null}
    </div>
  );
}

function galleryOf(product) {
  const images = Array.isArray(product?.images) ? product.images.filter((item) => item?.url) : [];
  if (images.length) return images;
  return product?.image ? [{ url: product.image, alt: product.name, is_primary: true }] : [];
}

function ProductGallery({ product }) {
  const images = galleryOf(product);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const drag = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const active = images[Math.min(index, Math.max(images.length - 1, 0))] || null;

  useEffect(() => {
    setIndex(0);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [product?.id]);

  function focusImage(next) {
    setIndex(next);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  function changeZoom(next) {
    const value = Math.min(3, Math.max(1, next));
    setZoom(value);
    if (value === 1) setOffset({ x: 0, y: 0 });
  }

  return (
    <div>
      <div
        className={`relative h-80 overflow-hidden rounded-2xl border border-line bg-chip sm:h-96 ${zoom > 1 ? "cursor-grab" : ""}`}
        onWheel={(event) => {
          event.preventDefault();
          changeZoom(zoom + (event.deltaY < 0 ? 0.25 : -0.25));
        }}
        onPointerDown={(event) => {
          if (zoom <= 1) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { x: event.clientX, y: event.clientY, origin: offset };
        }}
        onPointerMove={(event) => {
          if (!drag.current) return;
          setOffset({
            x: drag.current.origin.x + (event.clientX - drag.current.x) / zoom,
            y: drag.current.origin.y + (event.clientY - drag.current.y) / zoom,
          });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
      >
        {active ? (
          <div className="absolute inset-0" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}>
            <RemoteImage src={active.url} alt={active.alt || product.name} className="object-contain" sizes="(max-width: 1024px) 100vw, 40vw" priority />
          </div>
        ) : null}
        <div className="absolute right-3 bottom-3 flex gap-1">
          <button type="button" onClick={() => changeZoom(zoom - 0.5)} aria-label="Zoom out" className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface/90 text-sm font-bold shadow">−</button>
          <button type="button" onClick={() => changeZoom(zoom + 0.5)} aria-label="Zoom in" className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface/90 text-sm font-bold shadow">+</button>
        </div>
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((image, imageIndex) => (
            <button
              key={`${image.url}-${imageIndex}`}
              type="button"
              onClick={() => focusImage(imageIndex)}
              aria-label={`Show image ${imageIndex + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-chip ${imageIndex === index ? "border-brand" : "border-line"}`}
            >
              <RemoteImage src={image.url} alt={image.alt || product.name} className="object-contain" sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ProductDetail({ productSlug, product: loadedProduct = null }) {
  const router = useRouter();
  const store = useStore();
  const product = loadedProduct ?? store.productBySlug(productSlug);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("specs");
  const [optionValueId, setOptionValueId] = useState(() => defaultOptionValue(loadedProduct?.options));

  if (!product) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-12 text-center">
        <h1 className="text-xl font-black">Product not found</h1>
        <Link href="/catalog" className="mt-4 inline-block text-sm font-bold text-brand">Back to catalog</Link>
      </div>
    );
  }

  const related = product.related?.length
    ? product.related
    : store.products.filter((item) => item.category_slug === product.category_slug && item.slug !== product.slug).slice(0, 4);
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const reviewCount = reviews.length || Number(product.reviewsCount) || 0;
  const saved = store.wishlist.includes(product.id);
  const compared = store.compareList.includes(product.id);
  const forBuild = store.builderPick && (product.category_slugs ?? [product.category_slug]).includes(store.builderPick.slug);
  const options = Array.isArray(product.options) ? product.options : [];
  const selectedOption = options.flatMap((option) => option.values).find((value) => value.id === optionValueId) || null;
  const displayPrice = chargedPrice(product, selectedOption);
  const optionGroup = options.find((option) => option.values.some((value) => value.id === selectedOption?.id));
  const cartLine = {
    optionValueId,
    optionLabel: selectedOption ? `${optionGroup?.name || "Option"}: ${selectedOption.label}` : "",
    unitPrice: displayPrice,
    name: product.name,
    slug: product.slug,
    image: product.image,
  };
  const hasEmiChoice = options.some((option) => option.values.some((value) => value.priceKind === "emi"));

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs text-ink-muted">
        <Link href="/" className="hover:text-brand">Home</Link>
        <i className="fa-solid fa-chevron-right text-[10px]" />
        <button type="button" onClick={() => store.browseCategory(product.category_slug)} className="hover:text-brand">{product.category}</button>
        <i className="fa-solid fa-chevron-right text-[10px]" />
        <span className="max-w-xs truncate font-semibold text-ink">{product.name}</span>
      </div>
      <div className="grid grid-cols-1 gap-8 rounded-2xl border border-line bg-surface p-6 shadow-sm md:p-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ProductGallery product={product} />
        </div>
        <div className="flex flex-col justify-between space-y-5 lg:col-span-7">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">{product.brand}</span>
              <span className="text-xs text-ink-muted">Warranty: <strong className="text-ink">{product.warranty}</strong></span>
            </div>
            <h1 className="text-lg leading-tight font-bold text-ink-strong sm:text-2xl">{product.name}</h1>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }, (_, index) => (
                  <i key={index} className={`fa-solid fa-star ${index < Math.floor(product.rating) ? "text-amber-400" : "text-slate-300"}`} />
                ))}
              </div>
              <span className="font-bold">{product.rating} / 5</span>
              <span className="text-ink-muted">({product.reviewsCount} customer reviews)</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-4 rounded-xl border border-line bg-chip p-4">
              <div>
                <span className="block text-[11px] font-semibold text-ink-muted uppercase">Special Cash Price</span>
                <Price value={product.price} className="text-2xl font-black text-brand sm:text-3xl" />
              </div>
              {product.regularPrice > product.price ? (
                <div className="border-l border-line pl-4">
                  <span className="block text-[11px] text-ink-muted uppercase">Regular Price</span>
                  <Price value={product.regularPrice} className="text-base text-ink-muted line-through" />
                </div>
              ) : null}
              <div className="ml-auto text-right">
                <span className="block text-[11px] text-ink-muted">Stock Status</span>
                <span className={`text-xs font-bold ${product.stock > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {product.stock > 0 ? `In Stock (${product.stock} units available)` : "Out of Stock"}
                </span>
              </div>
            </div>
            <ul className="list-disc space-y-1 pl-4 text-xs text-ink-muted">
              {Object.entries(product.specs).slice(0, 4).map(([key, value]) => (
                <li key={key}><strong className="text-ink">{key}:</strong> {value}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 border-t border-line pt-4">
            {forBuild ? (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand/30 bg-red-50 p-3">
                <p className="min-w-0 flex-1 text-xs font-semibold text-ink-strong">Add this {store.builderPick.label} to your PC build.</p>
                <button
                  type="button"
                  onClick={() => {
                    if (store.assignBuilderPart(product)) router.push("/pc-builder");
                  }}
                  className="liquid-glass-red rounded-xl px-4 py-2 text-xs font-bold text-white"
                >
                  Select for build
                </button>
                <button
                  type="button"
                  onClick={() => {
                    store.cancelBuilderPick();
                    router.push("/pc-builder");
                  }}
                  className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            ) : null}
            {options.length > 0 ? (
              <div className="space-y-3">
                {options.map((option) => (
                  <fieldset key={option.id} className="space-y-2">
                    <legend className="mb-2 text-sm font-semibold text-ink-strong">{option.name}</legend>
                    {option.type === "select" ? (
                      <select
                        value={option.values.some((value) => value.id === optionValueId) ? optionValueId : ""}
                        onChange={(event) => setOptionValueId(event.target.value ? Number(event.target.value) : null)}
                        className="h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink"
                      >
                        {option.required ? null : <option value="">No extra option</option>}
                        {option.values.map((value) => (
                          <option key={value.id} value={value.id}>
                            {value.label}{value.price ? ` (+৳${value.price})` : ""}
                          </option>
                        ))}
                      </select>
                    ) : option.values.some((value) => value.priceKind === "cash" || value.priceKind === "emi") ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {option.values.map((value) => {
                          const selected = optionValueId === value.id;
                          const amount = chargedPrice(product, value);
                          const months = Number(value.emiMonths) || 12;
                          return (
                            <label key={value.id} className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-3 ${selected ? "border-blue-500" : "border-line"}`}>
                              <input
                                type="radio"
                                name={`option-${option.id}`}
                                checked={selected}
                                onChange={() => setOptionValueId(value.id)}
                                className="mt-1 h-4 w-4 shrink-0 accent-blue-500"
                              />
                              <span className="min-w-0">
                                {value.priceKind === "emi" ? (
                                  <span className="flex items-baseline gap-0.5 text-base font-black text-ink-strong">
                                    <Price value={Math.round(amount / months)} />
                                    <span className="text-sm font-bold">/month</span>
                                  </span>
                                ) : (
                                  <span className="flex flex-wrap items-baseline gap-2">
                                    <Price value={amount} className="text-base font-black text-ink-strong" />
                                    {Number(product.regularPrice) > amount ? (
                                      <Price value={product.regularPrice} className="text-sm font-medium text-ink-muted line-through" />
                                    ) : null}
                                  </span>
                                )}
                                {value.priceKind === "emi" ? (
                                  <span className="mt-0.5 block text-xs text-ink-muted">Regular Price: <Price value={amount} className="font-semibold text-ink" /></span>
                                ) : (
                                  <span className="mt-0.5 block text-xs text-ink">{value.label}</span>
                                )}
                                {value.note ? <span className="block text-[11px] text-ink-muted">{value.note}</span> : null}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => (
                          <label key={value.id} className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${optionValueId === value.id ? "border-brand bg-red-50 text-brand" : "border-line text-ink"}`}>
                            <input
                              type={option.type === "checkbox" ? "checkbox" : "radio"}
                              name={`option-${option.id}`}
                              checked={optionValueId === value.id}
                              onChange={() => setOptionValueId(option.type === "checkbox" && optionValueId === value.id && !option.required ? null : value.id)}
                              className="accent-brand"
                            />
                            <span>{value.label}</span>
                            {value.price ? <Price value={value.price} className="font-bold" /> : null}
                          </label>
                        ))}
                      </div>
                    )}
                  </fieldset>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-10 items-center overflow-hidden rounded-lg border border-line">
                <button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))} className="px-2.5" aria-label="Decrease quantity"><i className="fa-solid fa-minus text-xs" /></button>
                <span className="w-8 text-center text-xs font-bold">{qty}</span>
                <button type="button" onClick={() => setQty((value) => value + 1)} className="px-2.5" aria-label="Increase quantity"><i className="fa-solid fa-plus text-xs" /></button>
              </div>
              <button type="button" onClick={() => store.addToCart(product.id, qty, cartLine)} className="liquid-glass-red inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white">
                <i className="fa-solid fa-cart-shopping text-xs" /> Add to Cart
              </button>
              <button type="button" onClick={async () => { const added = await store.addToCart(product.id, qty, cartLine); if (added) router.push("/checkout"); }} className="inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white">
                Buy Now
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button type="button" onClick={() => store.toggleWishlist(product.id)} className="font-medium text-ink-muted hover:text-brand">
                <i className={`${saved ? "fa-solid text-brand" : "fa-regular"} fa-heart mr-1`} />
                {saved ? "In Wishlist" : "Add to Wishlist"}
              </button>
              <button type="button" onClick={() => store.toggleCompare(product.id)} className="font-medium text-ink-muted hover:text-blue-600">
                <i className="fa-solid fa-code-compare mr-1" />
                {compared ? "Added to Compare" : "Add to Compare"}
              </button>
              {product.emiEligible && !hasEmiChoice ? (
                <button type="button" onClick={() => store.openUi("emi")} className="font-medium text-ink-muted">
                  <i className="fa-solid fa-calculator mr-1 text-blue-500" />
                  EMI from <Price value={Math.round(displayPrice / 12)} className="font-bold text-brand" />/mo
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <section className="rounded-2xl border border-line bg-surface shadow-sm">
        <div className="flex gap-6 overflow-x-auto border-b border-line px-6">
          {[
            { id: "specs", label: "Specification" },
            { id: "description", label: "Description" },
            { id: "reviews", label: `Reviews (${reviewCount})` },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`shrink-0 border-b-2 py-4 text-sm font-bold ${tab === item.id ? "border-brand text-brand" : "border-transparent text-ink-muted"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="p-6 md:p-8">
          {tab === "specs" ? (
            <table className="w-full text-left text-xs">
              <tbody>
                <tr className="bg-chip"><td className="w-1/3 p-3 font-bold">Brand</td><td className="p-3">{product.brand}</td></tr>
                <tr><td className="p-3 font-bold">Model</td><td className="p-3">{product.name}</td></tr>
                {Object.entries(product.specs || {}).map(([key, value], index) => (
                  <tr key={key} className={index % 2 === 0 ? "bg-chip" : ""}>
                    <td className="p-3 font-bold">{key}</td>
                    <td className="p-3 font-medium">{value}</td>
                  </tr>
                ))}
                <tr><td className="p-3 font-bold">Warranty</td><td className="p-3">{product.warranty}</td></tr>
              </tbody>
            </table>
          ) : null}
          {tab === "description" ? (
            <DescriptionBody product={product} />
          ) : null}
          {tab === "reviews" ? (
            reviews.length === 0 ? (
              <p className="text-xs text-ink-muted">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <article key={review.id} className="rounded-xl border border-line p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-ink-strong">{review.name}</p>
                        <p className="text-[11px] text-ink-muted">{review.date}{review.verified ? " · Verified purchase" : ""}</p>
                      </div>
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }, (_, index) => (
                          <i key={index} className={`fa-solid fa-star text-xs ${index < review.rating ? "text-amber-400" : "text-slate-300"}`} />
                        ))}
                      </div>
                    </div>
                    {review.title ? <h3 className="mt-3 text-xs font-bold">{review.title}</h3> : null}
                    <p className="mt-1 text-xs leading-relaxed text-ink-muted">{review.body}</p>
                  </article>
                ))}
              </div>
            )
          ) : null}
        </div>
      </section>
      {related.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-ink-strong">Similar & Related Hardware</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      ) : null}
    </div>
  );
}

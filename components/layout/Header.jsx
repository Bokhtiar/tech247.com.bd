"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatBDT } from "@/lib/format";
import { useStore } from "@/components/store/StoreProvider";
import Logo from "@/components/layout/Logo";
import RemoteImage from "@/components/ui/RemoteImage";

export default function Header() {
  const router = useRouter();
  const store = useStore();
  const [query, setQuery] = useState(store.filters.searchQuery);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const searchRef = useRef(null);
  const accountRef = useRef(null);

  useEffect(() => {
    store.hydrateTheme();
    // Theme is read once from localStorage after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onClick = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestionsOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const { matches, pending } = useProductSuggestions(query, suggestionsOpen);

  const submitSearch = (value = query) => {
    const next = typeof value === "string" ? value : query;
    setSuggestionsOpen(false);
    setQuery(next);
    store.search(next);
  };

  return (
    <>
      <div className="hidden border-b border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-slate-300 lg:block lg:px-4">
        <div className="mx-auto flex w-full max-w-[1720px] items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <span className="flex items-center gap-1.5 whitespace-nowrap font-semibold text-white">
              <i className="fa-solid fa-phone text-brand" /> Hotline:{" "}
              <span className="font-extrabold tracking-wide">16724</span>
            </span>
            <span className="hidden items-center gap-1.5 font-medium md:flex">
              <i className="fa-solid fa-clock text-amber-400" /> 10:00 AM - 8:00 PM (Everyday)
            </span>
            <span className="hidden items-center gap-1 rounded border border-emerald-500/20 bg-black/40 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 lg:inline-flex">
              <i className="fa-solid fa-shield-check text-emerald-400" /> Official Distributor Warranty
            </span>
          </div>
          <div className="hidden items-center space-x-2 sm:flex sm:space-x-3">
            <button
              type="button"
              onClick={() => store.openUi("warranty")}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-950/40 px-2.5 py-0.5 font-bold text-white transition hover:bg-red-900/60 hover:text-brand-light"
            >
              <i className="fa-solid fa-shield-halved animate-pulse text-brand" /> Warranty Check
            </button>
            <span className="text-slate-700">|</span>
            <button
              type="button"
              onClick={() => store.openUi("stores")}
              className="hidden items-center gap-1.5 font-semibold transition hover:text-brand-light sm:flex"
            >
              <i className="fa-solid fa-location-dot text-brand" /> Store Locator
            </button>
            <span className="hidden text-slate-700 sm:inline">|</span>
            <button
              type="button"
              onClick={() => store.openUi("emi")}
              className="hidden items-center gap-1.5 font-semibold transition hover:text-amber-300 sm:flex"
            >
              <i className="fa-solid fa-calculator text-cyan-400" /> 0% EMI Plans
            </button>
            <span className="text-slate-700">|</span>
            <button
              type="button"
              onClick={() => {
                store.toggleTheme();
                store.showToast(store.dark ? "Light mode activated" : "Dark mode activated", "info");
              }}
              className="flex items-center gap-1.5 rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs font-semibold text-amber-300 transition hover:bg-slate-700"
            >
              <i className={`fa-solid ${store.dark ? "fa-sun" : "fa-moon"}`} />
              <span className="hidden sm:inline">{store.dark ? "Light" : "Dark"}</span>
            </button>
            <span className="text-slate-700">|</span>
            <a
              href="http://admin.tech247.com.bd/admin/login"
              className="flex items-center gap-1 rounded bg-brand px-2.5 py-0.5 font-bold text-white shadow-sm transition hover:bg-brand-hover"
            >
              <i className="fa-solid fa-user-shield" /> <span>Staff Portal</span>
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-surface shadow-sm">
        <div className="mx-auto w-full max-w-[1720px] px-2 py-2.5 sm:px-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => store.toggleUi("mobile")}
              className="rounded-lg p-2 text-ink hover:bg-chip hover:text-brand lg:hidden"
              aria-label="Toggle navigation"
            >
              <i className="fa-solid fa-bars text-xl" />
            </button>
            <Logo />
            <div ref={searchRef} className="relative mx-1 min-w-16 max-w-2xl flex-1 sm:mx-2">
              <div className="relative flex items-center">
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSuggestionsOpen(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") submitSearch();
                  }}
                  placeholder="Search components, laptops, desktops, cameras, security, networking..."
                  className="w-full min-w-0 rounded-full border border-line bg-chip py-2 pr-10 pl-3 text-xs text-ink shadow-inner outline-none transition focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/20 sm:pr-12 sm:pl-4 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={submitSearch}
                  className="absolute right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-hover"
                  aria-label="Search"
                >
                  <i className="fa-solid fa-magnifying-glass text-xs" />
                </button>
              </div>
              {suggestionsOpen && query.trim() ? (
                <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-96 divide-y divide-line overflow-y-auto rounded-2xl border border-line bg-surface shadow-2xl">
                  {pending ? (
                    <div className="p-4 text-center text-xs text-ink-muted">Searching products...</div>
                  ) : matches.length === 0 ? (
                    <div className="p-4 text-center text-xs text-ink-muted">No components found for &quot;{query}&quot;</div>
                  ) : (
                    matches.map((product) => (
                      <button
                        type="button"
                        key={product.id}
                        onClick={() => {
                          setSuggestionsOpen(false);
                          router.push(`/product/${product.slug}`);
                        }}
                        className="flex w-full items-center gap-3 p-3 text-left hover:bg-chip"
                      >
                        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-line">
                          <RemoteImage src={product.image} alt="" sizes="40px" className="object-cover" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold text-ink">{product.name}</span>
                          <span className="mt-0.5 flex items-center gap-2 text-[10px] text-ink-muted">
                            <PriceInline value={product.price} /> • {product.category}
                          </span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-0.5 sm:gap-3">
              <Link href="/pc-builder" className="liquid-glass-red flex items-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold text-white shadow-md sm:px-4">
                <i className="fa-solid fa-microchip animate-pulse text-yellow-300" />
                <span className="hidden sm:inline">PC BUILDER</span>
              </Link>
              <IconButton label="Compare products" onClick={() => store.openUi("compare")} icon="fa-solid fa-code-compare" count={store.compareList.length} />
              <IconButton label="Wishlist" onClick={() => store.openUi("wishlist")} icon="fa-regular fa-heart" count={store.wishlist.length} hot />
              <button
                type="button"
                onClick={() => store.toggleUi("cart")}
                className="relative flex items-center gap-2 rounded-xl border border-line bg-chip px-2 py-1.5 text-ink transition hover:bg-red-50 hover:text-brand sm:px-2.5"
              >
                <span className="relative">
                  <i className="fa-solid fa-cart-shopping text-sm sm:text-base" />
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-black text-white">
                    {store.cartCount}
                  </span>
                </span>
                <span className="hidden flex-col text-left leading-tight xl:flex">
                  <span className="text-[9px] font-semibold uppercase text-ink-muted">Total</span>
                  <span className="badge-bdt text-xs font-bold text-ink">{formatBDT(store.cartSubtotal)}</span>
                </span>
              </button>
              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  className="flex items-center gap-1.5 rounded-xl p-1 text-ink transition hover:bg-chip sm:px-2 sm:py-1"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-chip text-xs font-bold sm:h-8 sm:w-8">
                    <i className="fa-regular fa-user" />
                  </span>
                  <span className="hidden text-xs font-semibold md:block">
                    {store.user.isLoggedIn ? store.user.name.split(" ")[0] : "Account"}
                  </span>
                  <span className="hidden sm:inline">
                    <i className="fa-solid fa-chevron-down text-[9px] text-ink-muted" />
                  </span>
                </button>
                {accountOpen ? (
                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-line bg-surface py-2 text-sm shadow-xl">
                    <div className="border-b border-line px-4 py-2">
                      <p className="text-xs text-ink-muted">Welcome to TECH24</p>
                      <p className="truncate font-medium text-ink">
                        {store.user.isLoggedIn ? store.user.name : "Guest Visitor"}
                      </p>
                    </div>
                    {store.user.isLoggedIn ? (
                      <>
                        <Link href="/account" onClick={() => setAccountOpen(false)} className="flex w-full items-center gap-2 px-4 py-2 text-left text-ink hover:bg-chip">
                          <i className="fa-regular fa-user text-xs" /> My Profile & Orders
                        </Link>
                        <button type="button" onClick={() => { store.logout(); setAccountOpen(false); }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-rose-600 hover:bg-chip">
                          <i className="fa-solid fa-arrow-right-from-bracket text-xs" /> Sign Out
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={() => { setAccountOpen(false); store.openUi("auth"); }} className="flex w-full items-center gap-2 px-4 py-2 text-left font-bold text-brand hover:bg-chip">
                        <i className="fa-solid fa-lock text-xs" /> Sign In / Register
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <nav className="hidden bg-nav shadow-md lg:block">
          <div className="mx-auto flex w-full max-w-[1720px] items-center justify-between px-2 text-[11px] font-bold tracking-tight">
            <div className="flex flex-wrap items-center">
              {store.categories.map((category) => (
                <DesktopCategory key={category.id} category={category} onPick={store.browseCategory} />
              ))}
            </div>
            <Link href="/deals" className="my-1 flex shrink-0 items-center gap-1 rounded border border-red-500/30 bg-red-950/60 px-2.5 py-2 text-[11px] font-extrabold text-amber-300 hover:text-red-300">
              <i className="fa-solid fa-fire text-amber-400" /> Hot Deals
            </Link>
          </div>
        </nav>
      </header>

      {store.ui.mobile ? (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line bg-slate-800 p-4 text-white">
              <span className="font-brand text-2xl font-black">
                T<span className="italic text-brand">ECH24</span>
              </span>
              <button type="button" onClick={() => store.closeUi("mobile")} aria-label="Close navigation" className="text-slate-300">
                <i className="fa-solid fa-xmark text-xl" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4 text-sm font-medium">
              <NavbarSearch
                onSearch={(value) => {
                  store.closeUi("mobile");
                  store.search(value);
                }}
                tone="light"
              />
              <Link href="/pc-builder" onClick={() => store.closeUi("mobile")} className="flex items-center justify-between rounded-xl bg-brand px-3 py-2.5 font-bold text-white">
                <span><i className="fa-solid fa-microchip mr-2 text-yellow-300" /> PC Builder Tool</span>
                <i className="fa-solid fa-chevron-right text-xs" />
              </Link>
              <button type="button" onClick={() => { store.closeUi("mobile"); store.openUi("warranty"); }} className="w-full rounded-lg px-3 py-2 text-left font-bold text-brand hover:bg-chip">
                <i className="fa-solid fa-shield-halved mr-2" /> Warranty Check
              </button>
              <Link href="/catalog" onClick={() => store.closeUi("mobile")} className="block rounded-lg px-3 py-2 text-ink hover:bg-chip">
                <i className="fa-solid fa-cubes mr-2 text-ink-muted" /> Browse All Hardware
              </Link>
              <Link href="/deals" onClick={() => store.closeUi("mobile")} className="block rounded-lg px-3 py-2 font-bold text-amber-600 hover:bg-amber-50">
                <i className="fa-solid fa-fire mr-2" /> Hot Flash Deals
              </Link>
              <div className="border-t border-line pt-3">
                <p className="mb-2 px-3 text-xs font-bold uppercase text-ink-muted">Categories</p>
                <div className="space-y-1 text-xs">
                  <CategoryTree nodes={store.categories} depth={0} onPick={store.browseCategory} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function useProductSuggestions(query, enabled) {
  const [matches, setMatches] = useState([]);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (!enabled || term.length < 1) {
      setMatches([]);
      setPending(false);
      return undefined;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setPending(true);
      const params = new URLSearchParams({ q: term, per_page: "6" });
      fetch(`/api/products?${params}`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("Search failed");
          return response.json();
        })
        .then((body) => setMatches(Array.isArray(body?.data) ? body.data : []))
        .catch((error) => {
          if (error.name !== "AbortError") setMatches([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setPending(false);
        });
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, enabled]);

  return { matches, pending };
}

function NavbarSearch({ onSearch, tone = "dark" }) {
  const router = useRouter();
  const boxRef = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { matches, pending } = useProductSuggestions(query, open);
  const light = tone === "light";

  useEffect(() => {
    const onClick = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div ref={boxRef} className="relative w-full lg:w-56">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setOpen(false);
          onSearch(query);
        }}
        className="relative"
      >
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search products"
          aria-label="Search products"
          className={light
            ? "w-full rounded-xl border border-line bg-chip py-2 pr-9 pl-3 text-sm font-medium text-ink outline-none focus:border-brand"
            : "w-full rounded-full border border-white/15 bg-white/10 py-1.5 pr-8 pl-3 text-[11px] font-semibold text-white outline-none placeholder:text-white/60 focus:border-white/40 focus:bg-white/15"}
        />
        <button type="submit" aria-label="Search products" className={light ? "absolute top-1/2 right-2 -translate-y-1/2 text-ink-muted" : "absolute top-1/2 right-2 -translate-y-1/2 text-white/80"}>
          <i className="fa-solid fa-magnifying-glass text-xs" />
        </button>
      </form>
      {open && query.trim() ? (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-line bg-surface text-ink shadow-2xl">
          {pending ? (
            <p className="p-3 text-center text-xs font-medium text-ink-muted">Searching products...</p>
          ) : matches.length === 0 ? (
            <p className="p-3 text-center text-xs font-medium text-ink-muted">No products found</p>
          ) : (
            matches.map((product) => (
              <button
                type="button"
                key={product.id}
                onClick={() => {
                  setOpen(false);
                  router.push(`/product/${product.slug}`);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-chip"
              >
                <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border border-line">
                  <RemoteImage src={product.image} alt="" sizes="32px" className="object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold">{product.name}</span>
                  <span className="text-[10px] text-ink-muted">{product.category}</span>
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

function DesktopCategory({ category, onPick }) {
  const children = category.children ?? [];

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onPick(category.slug)}
        className="px-2 py-2.5 whitespace-nowrap text-white transition hover:bg-white/10 hover:text-brand-light"
      >
        {category.name_en}
        {children.length ? <i className="fa-solid fa-chevron-down ml-1 text-[8px] opacity-70" /> : null}
      </button>
      {children.length ? (
        <div className="invisible absolute top-full left-0 z-40 min-w-48 rounded-lg border border-line bg-surface py-1 text-ink opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
          {children.map((child) => (
            <NestedPick key={child.id} category={child} onPick={onPick} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NestedPick({ category, onPick }) {
  const children = category.children ?? [];

  return (
    <div className="group/child relative">
      <button
        type="button"
        onClick={() => onPick(category.slug)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-[11px] font-semibold hover:bg-chip"
      >
        {category.name_en}
        {children.length ? <i className="fa-solid fa-chevron-right text-[8px] text-ink-muted" /> : null}
      </button>
      {children.length ? (
        <div className="invisible absolute top-0 left-full z-40 min-w-44 rounded-lg border border-line bg-surface py-1 opacity-0 shadow-lg group-hover/child:visible group-hover/child:opacity-100">
          {children.map((child) => (
            <NestedPick key={child.id} category={child} onPick={onPick} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CategoryTree({ nodes, depth, onPick }) {
  return nodes.map((category) => (
    <div key={category.id}>
      <button
        type="button"
        onClick={() => onPick(category.slug)}
        className="w-full rounded-lg py-1.5 text-left text-ink-muted hover:bg-chip"
        style={{ paddingLeft: `${12 + depth * 12}px` }}
      >
        {category.name_en}
      </button>
      {category.children?.length ? <CategoryTree nodes={category.children} depth={depth + 1} onPick={onPick} /> : null}
    </div>
  ));
}

function IconButton({ label, onClick, icon, count, hot = false }) {
  return (
    <button type="button" onClick={onClick} title={label} className="relative rounded-full p-1 text-ink transition hover:bg-chip hover:text-brand sm:p-2">
      <i className={`${icon} text-sm sm:text-lg`} />
      {count > 0 ? (
        <span className={`absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white ${hot ? "bg-brand" : "bg-slate-800"}`}>
          {count}
        </span>
      ) : null}
    </button>
  );
}

function PriceInline({ value }) {
  return <span className="badge-bdt font-bold text-brand">{formatBDT(value)}</span>;
}

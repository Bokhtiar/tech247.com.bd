"use client";

import Link from "next/link";
import { useState } from "react";
import { stores } from "@/lib/catalog";
import { loginCustomer, registerCustomer } from "@/service/auth";
import { useStore } from "@/components/store/StoreProvider";
import Price from "@/components/ui/Price";
import RemoteImage from "@/components/ui/RemoteImage";

export default function Overlays() {
  return (
    <>
      <WarrantyModal />
      <CartDrawer />
      <CompareModal />
      <WishlistModal />
      <EmiModal />
      <StoreModal />
      <AuthModal />
      <Toasts />
      <div id="printArea" className="hidden" />
    </>
  );
}

function Modal({ open, onClose, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
      <div className={`max-h-[90vh] w-full overflow-hidden rounded-2xl bg-surface shadow-2xl ${wide ? "max-w-5xl" : "max-w-xl"}`}>
        {children}
      </div>
      <button type="button" className="sr-only" onClick={onClose}>
        Close
      </button>
    </div>
  );
}

function WarrantyModal() {
  const store = useStore();
  const [serial, setSerial] = useState("T24-SN-99824");
  const [result, setResult] = useState(null);

  return (
    <Modal open={store.ui.warranty} onClose={() => store.closeUi("warranty")}>
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between border-b border-line pb-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink-strong">
              <i className="fa-solid fa-shield-halved text-brand" /> TECH24 Official Warranty Check
            </h2>
            <p className="mt-1 text-xs text-ink-muted">Check genuine distributor warranty by serial or invoice number.</p>
          </div>
          <button type="button" onClick={() => store.closeUi("warranty")} aria-label="Close" className="text-ink-muted">
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>
        <label className="block text-xs font-semibold text-ink">Serial Number / Invoice ID / Barcode</label>
        <div className="flex gap-2">
          <input
            value={serial}
            onChange={(event) => setSerial(event.target.value)}
            className="flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-bold text-ink uppercase outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="button"
            onClick={() => {
              if (!serial.trim()) {
                store.showToast("Please enter a Serial Number or Invoice ID", "warning");
                return;
              }
              setResult(serial.trim().toUpperCase());
              store.showToast("Warranty record verified successfully!", "success");
            }}
            className="liquid-glass-red rounded-xl px-4 py-2 text-xs font-bold text-white"
          >
            Verify
          </button>
        </div>
        <div className="space-y-2 rounded-xl border border-line bg-chip p-4 text-xs">
          {result ? (
            <>
              <div className="flex justify-between border-b border-line pb-2">
                <span className="text-ink-muted">Query Tag:</span>
                <span className="font-mono font-bold text-ink">{result}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Coverage:</span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700">100% Genuine Distributor Warranty</span>
              </div>
              <div className="flex justify-between"><span className="text-ink-muted">Remaining Period:</span> <strong className="text-brand">2 Years, 4 Months Active</strong></div>
              <div className="flex justify-between"><span className="text-ink-muted">Service Center:</span> <span>TECH24 Support Lab, Agargaon / Multiplan</span></div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="text-ink-muted">Warranty Status:</span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700">Active Genuine Warranty</span>
              </div>
              <div className="flex justify-between"><span className="text-ink-muted">Product:</span> <strong>Intel 14th Gen Core i5-14400 Processor</strong></div>
              <div className="flex justify-between"><span className="text-ink-muted">Warranty Validity:</span> <strong className="text-brand">Valid until 11 Jan 2029 (3 Years)</strong></div>
            </>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-line pt-2 text-[11px] text-ink-muted">
          <span>Need repair support? Call warranty desk: 16724 (Ext 3)</span>
          <button type="button" onClick={() => store.closeUi("warranty")} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white">Close</button>
        </div>
      </div>
    </Modal>
  );
}

function CartDrawer() {
  const store = useStore();
  if (!store.ui.cart) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <button type="button" className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => store.closeUi("cart")} aria-label="Close cart" />
      <div className="fixed inset-y-0 right-0 flex w-screen max-w-md flex-col bg-surface shadow-2xl">
        <div className="flex items-center justify-between bg-slate-800 p-4 text-white">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-bag-shopping text-lg text-brand" />
            <h2 className="text-base font-bold">Your Cart</h2>
            <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-bold">{store.cartCount}</span>
          </div>
          <button type="button" onClick={() => store.closeUi("cart")} aria-label="Close cart"><i className="fa-solid fa-xmark text-lg" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {store.cartItems.length === 0 ? (
            <div className="space-y-3 py-16 text-center text-ink-muted">
              <i className="fa-solid fa-cart-shopping text-4xl" />
              <p className="text-sm font-semibold text-ink">Your shopping cart is empty</p>
              <Link href="/catalog" onClick={() => store.closeUi("cart")} className="liquid-glass-red inline-block rounded-xl px-4 py-2 text-xs font-bold text-white">Browse Shop</Link>
            </div>
          ) : (
            store.cartItems.map((item) => (
              <div key={`${item.product.id}-${item.optionId || 0}`} className="flex items-center gap-3 border-b border-line pb-4">
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line">
                  <RemoteImage src={item.product.image} alt="" sizes="56px" className="object-cover" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-xs font-bold text-ink">{item.product.name}</h3>
                  {item.optionLabel ? <p className="truncate text-[11px] text-ink-muted">{item.optionLabel}</p> : null}
                  <Price value={item.unitPrice} className="text-xs font-semibold text-brand" />
                  <div className="mt-2 flex items-center gap-2">
                    <QtyControl quantity={item.quantity} onChange={(delta) => store.updateCartQuantity(item.product.id, delta, item.optionId)} />
                    <button type="button" onClick={() => store.removeFromCart(item.product.id, item.optionId)} className="ml-auto text-rose-500" aria-label="Remove">
                      <i className="fa-solid fa-trash-can" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="space-y-3 border-t border-line bg-chip p-4">
          <div className="flex justify-between text-sm text-ink-muted">
            <span>Subtotal:</span>
            <Price value={store.cartSubtotal} className="font-semibold text-ink" />
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-ink">
            <span>Total Amount:</span>
            <Price value={store.cartSubtotal} className="text-brand" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/cart" onClick={() => store.closeUi("cart")} className="rounded-xl border border-line bg-surface py-3 text-center text-xs font-bold text-ink">View Cart</Link>
            <Link href="/checkout" onClick={() => store.closeUi("cart")} className="liquid-glass-red rounded-xl py-3 text-center text-xs font-bold text-white">Proceed Checkout →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareModal() {
  const store = useStore();
  const items = store.products.filter((product) => store.compareList.includes(product.id));
  if (!store.ui.compare) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl">
        <div className="flex items-center justify-between bg-slate-800 p-4 text-white">
          <h2 className="flex items-center gap-2 font-bold"><i className="fa-solid fa-code-compare text-brand" /> Compare Technical Specifications</h2>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => store.setCompareList([])} className="text-xs text-slate-300 underline">Clear All</button>
            <button type="button" onClick={() => store.closeUi("compare")} aria-label="Close"><i className="fa-solid fa-xmark text-lg" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-x-auto p-4 sm:p-6">
          {items.length === 0 ? (
            <p className="py-16 text-center text-xs text-ink-muted">No hardware selected for comparison.</p>
          ) : (
            <table className="w-full border border-line text-left text-xs">
              <thead>
                <tr className="bg-chip">
                  <th className="w-40 p-3 text-[10px] font-semibold text-ink-muted uppercase">Specifications</th>
                  {items.map((product) => (
                    <th key={product.id} className="min-w-[200px] p-3 text-ink">
                      <Price value={product.price} className="mb-1 block font-extrabold text-brand" />
                      <span className="relative mx-auto mb-2 block h-16 w-16 overflow-hidden rounded-lg border border-line">
                        <RemoteImage src={product.image} alt="" sizes="64px" className="object-contain" />
                      </span>
                      <p className="line-clamp-2 text-xs font-semibold">{product.name}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["Brand", "Category", "Warranty"].map((label) => (
                  <tr key={label} className="border-t border-line">
                    <td className="p-3 font-bold text-ink">{label}</td>
                    {items.map((product) => (
                      <td key={product.id} className="p-3">{label === "Brand" ? product.brand : label === "Category" ? product.category : product.warranty}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function WishlistModal() {
  const store = useStore();
  const items = store.products.filter((product) => store.wishlist.includes(product.id));
  if (!store.ui.wishlist) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl">
        <div className="flex items-center justify-between bg-slate-800 p-4 text-white">
          <h2 className="flex items-center gap-2 font-bold"><i className="fa-solid fa-heart text-brand" /> My Saved Wishlist</h2>
          <button type="button" onClick={() => store.closeUi("wishlist")} aria-label="Close"><i className="fa-solid fa-xmark text-lg" /></button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="py-12 text-center text-xs text-ink-muted">Your wishlist is empty.</p>
          ) : (
            items.map((product) => (
              <div key={product.id} className="flex items-center gap-3 rounded-xl border border-line bg-chip p-3">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <RemoteImage src={product.image} alt="" sizes="48px" className="object-cover" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-xs font-bold">{product.name}</h3>
                  <Price value={product.price} className="text-xs font-bold text-brand" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    store.addToCart(product.id);
                    store.toggleWishlist(product.id);
                  }}
                  className="liquid-glass-red rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                >
                  Move to Cart
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function EmiModal() {
  const store = useStore();
  const [price, setPrice] = useState(75000);
  const [months, setMonths] = useState(6);
  if (!store.ui.emi) return null;
  const monthly = Math.round(Number(price || 0) / months);

  return (
    <Modal open onClose={() => store.closeUi("emi")}>
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between border-b border-line pb-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink-strong">
              <i className="fa-solid fa-calculator text-brand" /> 0% EMI Calculator
            </h2>
            <p className="mt-1 text-xs text-ink-muted">Available for major Bangladesh credit cards.</p>
          </div>
          <button type="button" onClick={() => store.closeUi("emi")} aria-label="Close"><i className="fa-solid fa-xmark text-lg" /></button>
        </div>
        <label className="block text-xs font-semibold">Product Price (BDT)</label>
        <input type="number" value={price} onChange={(event) => setPrice(event.target.value)} className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm font-bold text-ink outline-none focus:ring-2 focus:ring-brand" />
        <div className="grid grid-cols-4 gap-2 text-center">
          {[3, 6, 9, 12].map((option) => (
            <button key={option} type="button" onClick={() => setMonths(option)} className={`rounded-xl border p-2.5 text-xs ${months === option ? "border-brand bg-red-50 font-bold text-brand" : "border-line text-ink"}`}>
              {option} Months
            </button>
          ))}
        </div>
        <div className="space-y-1.5 rounded-xl border border-line bg-chip p-4 text-xs">
          <p className="flex justify-between"><span>Selected Tenure:</span> <strong>{months} Months</strong></p>
          <p className="flex justify-between"><span>Monthly Installment:</span> <Price value={monthly} className="font-bold text-brand" /></p>
          <p className="flex justify-between text-emerald-600"><span>Bank Interest Fee:</span> <span className="font-bold">0% (Merchant Absorbed)</span></p>
        </div>
        <div className="flex justify-end">
          <button type="button" onClick={() => store.closeUi("emi")} className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white">Got it</button>
        </div>
      </div>
    </Modal>
  );
}

function StoreModal() {
  const store = useStore();
  if (!store.ui.stores) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl">
        <div className="flex items-center justify-between bg-slate-800 p-4 text-white">
          <h2 className="flex items-center gap-2 font-bold"><i className="fa-solid fa-location-dot text-brand" /> TECH24 Nationwide Branches</h2>
          <button type="button" onClick={() => store.closeUi("stores")} aria-label="Close"><i className="fa-solid fa-xmark text-lg" /></button>
        </div>
        <div className="grid gap-4 overflow-y-auto p-6 text-xs sm:grid-cols-2">
          {stores.map((branch) => (
            <article key={branch.name} className="rounded-xl border border-line bg-chip p-4">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="text-sm font-bold text-ink">{branch.name}</h3>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Open Today</span>
              </div>
              <p className="text-ink-muted">{branch.address}</p>
              <p className="mt-2 text-ink-muted"><i className="fa-solid fa-phone mr-1" /> {branch.phone}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuthModal() {
  const store = useStore();
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (!store.ui.auth) return null;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      if (mode === "register") {
        await registerCustomer({
          full_name: fullName,
          phone,
          email,
          password,
        });
        setLogin(phone);
        setPassword("");
        setMode("login");
        store.showToast("Account created. Sign in to continue.", "success");
        return;
      }

      const body = await loginCustomer({ login, password });
      store.login(body.data);
    } catch (requestError) {
      const first = requestError.errors ? Object.values(requestError.errors).flat()[0] : "";
      setError(first || requestError.message || "Could not continue.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal open onClose={() => store.closeUi("auth")}>
      <form onSubmit={submit} className="space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h2 className="text-lg font-bold text-ink-strong">{mode === "register" ? "Create your TECH24 account" : "Sign in to TECH24"}</h2>
          <button type="button" onClick={() => store.closeUi("auth")} aria-label="Close"><i className="fa-solid fa-xmark text-lg" /></button>
        </div>
        <div className="grid grid-cols-2 rounded-xl bg-chip p-1 text-xs font-bold">
          <button type="button" onClick={() => { setMode("login"); setError(""); }} className={`rounded-lg py-2 ${mode === "login" ? "bg-surface text-brand" : "text-ink-muted"}`}>Sign in</button>
          <button type="button" onClick={() => { setMode("register"); setError(""); }} className={`rounded-lg py-2 ${mode === "register" ? "bg-surface text-brand" : "text-ink-muted"}`}>Create account</button>
        </div>
        {mode === "register" ? (
          <>
            <label className="block text-xs font-semibold">Full name</label>
            <input required value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs outline-none" />
            <label className="block text-xs font-semibold">Mobile number</label>
            <input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="01XXXXXXXXX" className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs outline-none" />
            <label className="block text-xs font-semibold">Email (optional)</label>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs outline-none" />
          </>
        ) : (
          <>
            <label className="block text-xs font-semibold">Email or phone number</label>
            <input required value={login} onChange={(event) => setLogin(event.target.value)} className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs outline-none" />
          </>
        )}
        <label className="block text-xs font-semibold">Password</label>
        <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs outline-none" />
        {error ? <p className="text-xs font-semibold text-rose-600">{error}</p> : null}
        <button type="submit" disabled={pending} className="liquid-glass-red w-full rounded-xl py-2.5 text-xs font-bold text-white disabled:opacity-60">
          {pending ? "Please wait..." : mode === "register" ? "Create account" : "Sign in"}
        </button>
      </form>
    </Modal>
  );
}

function Toasts() {
  const store = useStore();
  return (
    <div className="pointer-events-none fixed right-5 bottom-5 z-50 w-full max-w-sm space-y-2">
      {store.toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-2 rounded-xl p-3.5 text-xs font-semibold text-white shadow-xl ${
            toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-rose-600" : toast.type === "warning" ? "bg-amber-600" : "bg-slate-900"
          }`}
        >
          <i className={`fa-solid ${toast.type === "success" ? "fa-circle-check" : toast.type === "error" ? "fa-circle-exclamation" : toast.type === "warning" ? "fa-triangle-exclamation" : "fa-circle-info"}`} />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

function QtyControl({ quantity, onChange }) {
  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-line bg-chip">
      <button type="button" onClick={() => onChange(-1)} className="px-2 py-0.5 text-xs">-</button>
      <span className="px-2 text-xs font-bold">{quantity}</span>
      <button type="button" onClick={() => onChange(1)} className="px-2 py-0.5 text-xs">+</button>
    </div>
  );
}

export { QtyControl };

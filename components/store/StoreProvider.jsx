"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  coupons,
  defaultFilters,
} from "@/lib/catalog";
import { discountFor, formatBDT } from "@/lib/format";
import { currentCustomer, logoutCustomer } from "@/service/auth";

const CART_KEY = "tech24-cart";
const serverCart = [];
let cartSnapshot = serverCart;
let cartRaw = "[]";

function readServerCart() {
  return serverCart;
}

function readStoredCart() {
  if (typeof window === "undefined") return serverCart;
  const raw = localStorage.getItem(CART_KEY) || "[]";
  if (raw === cartRaw && cartSnapshot !== serverCart) return cartSnapshot;
  if (raw === "[]") {
    cartRaw = raw;
    cartSnapshot = serverCart;
    return serverCart;
  }
  cartRaw = raw;
  try {
    const parsed = JSON.parse(raw);
    cartSnapshot = Array.isArray(parsed) ? parsed : serverCart;
  } catch {
    cartSnapshot = serverCart;
  }
  return cartSnapshot;
}

function writeStoredCart(lines) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event("tech24-cart"));
}

function subscribeStoredCart(callback) {
  window.addEventListener("tech24-cart", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("tech24-cart", callback);
    window.removeEventListener("storage", callback);
  };
}

const guestUser = {
  isLoggedIn: false,
  name: "",
  email: "",
  phone: "",
  address: "",
};

const StoreContext = createContext(null);

const closedUi = {
  cart: false,
  warranty: false,
  compare: false,
  wishlist: false,
  emi: false,
  stores: false,
  auth: false,
  mobile: false,
};

export function StoreProvider({ categories: initialCategories = [], products: initialProducts = [], brands: initialBrands = [], children }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [brands, setBrands] = useState(initialBrands);
  const cart = useSyncExternalStore(subscribeStoredCart, readStoredCart, readServerCart);
  const [wishlist, setWishlist] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const wishlistRef = useRef([]);
  const compareRef = useRef([]);
  const [pcBuild, setPcBuild] = useState({});
  const [builderPick, setBuilderPick] = useState(null);
  const builderPickRef = useRef(null);
  const [user, setUser] = useState(guestUser);
  const [filters, setFilters] = useState(defaultFilters);
  const [categories, setCategories] = useState(initialCategories);
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [dark, setDark] = useState(false);
  const [ui, setUi] = useState(closedUi);
  const [toasts, setToasts] = useState([]);
  const pendingCart = useRef([]);

  useEffect(() => {
    wishlistRef.current = wishlist;
  }, [wishlist]);

  useEffect(() => {
    compareRef.current = compareList;
  }, [compareList]);

  const showToast = useCallback((message, type = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const openUi = useCallback((key) => {
    setUi((current) => ({ ...current, [key]: true }));
  }, []);

  const closeUi = useCallback((key) => {
    setUi((current) => ({ ...current, [key]: false }));
  }, []);

  const toggleUi = useCallback((key) => {
    setUi((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const productById = useCallback(
    (id) => products.find((product) => String(product.id) === String(id)),
    [products],
  );

  const productBySlug = useCallback(
    (slug) => products.find((product) => product.slug === slug),
    [products],
  );

  const cartItems = useMemo(
    () =>
      cart.map((item) => {
        const product = products.find((entry) => String(entry.id) === String(item.id)) || {
          id: item.id,
          name: item.name || "Product",
          slug: item.slug || "",
          image: item.image || "",
          price: item.unitPrice || 0,
        };
        return {
          product,
          quantity: item.quantity,
          optionId: item.optionId || null,
          optionLabel: item.optionLabel || "",
          unitPrice: Number(item.unitPrice ?? product.price) || 0,
        };
      }),
    [cart, products],
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const cartDiscount = discountFor(activeCoupon, cartSubtotal);

  const toggleTheme = useCallback(() => {
    setDark((current) => {
      const next = !current;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("tech24-theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  const hydrateTheme = useCallback(() => {
    const saved = localStorage.getItem("tech24-theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  const replaceCategories = useCallback((next) => {
    setCategories(Array.isArray(next) ? next : []);
  }, []);

  const browseCategory = useCallback(
    (slug) => {
      const category = !slug || slug === "All" ? "All" : slug;
      setFilters((current) => ({ ...current, category }));
      setUi((current) => ({ ...current, mobile: false }));
      const path = category === "All" ? "/catalog" : `/catalog/${category}`;
      if (window.location.pathname.startsWith("/catalog")) {
        window.history.pushState(null, "", path);
        return;
      }
      router.push(path);
    },
    [router],
  );

  const search = useCallback(
    (query) => {
      setFilters((current) => ({ ...current, searchQuery: query.trim() }));
      router.push("/catalog");
    },
    [router],
  );

  const addToCart = useCallback(
    async (productId, quantity = 1, options = {}) => {
      const product = products.find((entry) => String(entry.id) === String(productId));
      const optionId = options.optionValueId || null;
      const current = readStoredCart();
      const index = current.findIndex((item) => String(item.id) === String(productId) && String(item.optionId || "") === String(optionId || ""));
      const next = [...current];
      if (index >= 0) {
        next[index] = { ...next[index], quantity: next[index].quantity + quantity };
      } else {
        next.push({
          id: productId,
          name: options.name || product?.name || "Product",
          slug: options.slug || product?.slug || "",
          image: options.image || product?.image || "",
          optionId,
          optionLabel: options.optionLabel || "",
          unitPrice: Number(options.unitPrice ?? product?.price) || 0,
          quantity,
        });
      }
      writeStoredCart(next);
      if (!options.silent) {
        const label = (options.name || product?.name || "Item").slice(0, 28);
        showToast(`Added "${label}..." to cart`, "success");
      }
      return true;
    },
    [products, showToast],
  );

  const queueCart = useCallback(async (lines) => {
    let next = readStoredCart();
    lines.forEach((line) => {
      const product = products.find((entry) => String(entry.id) === String(line.productId));
      const optionId = line.optionValueId || null;
      const index = next.findIndex((item) => String(item.id) === String(line.productId) && String(item.optionId || "") === String(optionId || ""));
      if (index >= 0) {
        next[index] = { ...next[index], quantity: next[index].quantity + (line.quantity || 1) };
        return;
      }
      next = [...next, {
        id: line.productId,
        name: product?.name || "Product",
        slug: product?.slug || "",
        image: product?.image || "",
        optionId,
        optionLabel: "",
        unitPrice: Number(product?.price) || 0,
        quantity: line.quantity || 1,
      }];
    });
    writeStoredCart(next);
    showToast("Added to cart", "success");
  }, [products, showToast]);

  const updateCartQuantity = useCallback((productId, delta, optionId = null) => {
    const current = readStoredCart();
    const next = current.flatMap((item) => {
      if (String(item.id) !== String(productId) || String(item.optionId || "") !== String(optionId || "")) return [item];
      const quantity = item.quantity + delta;
      return quantity < 1 ? [] : [{ ...item, quantity }];
    });
    writeStoredCart(next);
  }, []);

  const removeFromCart = useCallback((productId, optionId = null) => {
    writeStoredCart(readStoredCart().filter((item) => !(String(item.id) === String(productId) && String(item.optionId || "") === String(optionId || ""))));
    showToast("Item removed from cart", "info");
  }, [showToast]);

  const forgetCart = useCallback(() => {
    writeStoredCart([]);
  }, []);

  const clearCart = useCallback(() => {
    writeStoredCart([]);
    showToast("Cart cleared", "info");
  }, [showToast]);

  const toggleWishlist = useCallback(
    (productId) => {
      const current = wishlistRef.current;
      const removing = current.includes(productId);
      const next = removing ? current.filter((id) => id !== productId) : [...current, productId];
      wishlistRef.current = next;
      setWishlist(next);
      showToast(removing ? "Removed from wishlist" : "Added to wishlist", removing ? "info" : "success");
    },
    [showToast],
  );

  const toggleCompare = useCallback(
    (productId) => {
      const current = compareRef.current;
      if (current.includes(productId)) {
        const next = current.filter((id) => id !== productId);
        compareRef.current = next;
        setCompareList(next);
        showToast("Removed from compare table", "info");
        return;
      }
      if (current.length >= 4) {
        showToast("You can compare a maximum of 4 products", "warning");
        return;
      }
      const next = [...current, productId];
      compareRef.current = next;
      setCompareList(next);
      showToast("Added to technical comparison", "success");
    },
    [showToast],
  );

  const applyCoupon = useCallback(
    (code) => {
      const coupon = coupons[code];
      if (!coupon) {
        showToast("Invalid coupon code. Try TECH24", "error");
        return false;
      }
      if (cartSubtotal < coupon.minTotal) {
        showToast(`Minimum order of ৳ ${formatBDT(coupon.minTotal)} not met`, "warning");
        return false;
      }
      setActiveCoupon({ ...coupon, code });
      showToast(`Coupon ${code} applied`, "success");
      return true;
    },
    [cartSubtotal, showToast],
  );

  const login = useCallback((customer) => {
    pendingCart.current = [];
    setUser({
      isLoggedIn: true,
      name: customer?.name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      address: "",
    });
    closeUi("auth");
    showToast("Logged in successfully", "success");
  }, [closeUi, showToast]);

  const logout = useCallback(() => {
    pendingCart.current = [];
    logoutCustomer()
      .catch(() => {})
      .finally(() => {
        setUser(guestUser);
        showToast("Logged out", "info");
      });
  }, [showToast]);

  useEffect(() => {
    builderPickRef.current = builderPick;
  }, [builderPick]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("tech24-builder-pick");
      if (saved) setBuilderPick(JSON.parse(saved));
    } catch {
      sessionStorage.removeItem("tech24-builder-pick");
    }
  }, []);

  const beginBuilderPick = useCallback((slot) => {
    const next = { slug: slot.slug, label: slot.label };
    sessionStorage.setItem("tech24-builder-pick", JSON.stringify(next));
    setBuilderPick(next);
  }, []);

  const cancelBuilderPick = useCallback(() => {
    sessionStorage.removeItem("tech24-builder-pick");
    setBuilderPick(null);
  }, []);

  const assignBuilderPart = useCallback((product) => {
    const pick = builderPickRef.current;
    if (!pick || !product) return false;
    setProducts((current) => (current.some((item) => String(item.id) === String(product.id)) ? current : [...current, product]));
    setPcBuild((current) => ({ ...current, [pick.slug]: product.id }));
    sessionStorage.removeItem("tech24-builder-pick");
    setBuilderPick(null);
    showToast(`${product.name} added to your PC build`, "success");
    return true;
  }, [showToast]);

  useEffect(() => {
    let cancelled = false;

    currentCustomer()
      .then(async (customer) => {
        if (cancelled) return;
        if (customer) {
          setUser({
            isLoggedIn: true,
            name: customer.name || "",
            email: customer.email || "",
            phone: customer.phone || "",
            address: "",
          });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      products,
      productById,
      productBySlug,
      cartItems,
      cartCount,
      cartSubtotal,
      cartDiscount,
      activeCoupon,
      wishlist,
      compareList,
      pcBuild,
      setPcBuild,
      builderPick,
      beginBuilderPick,
      cancelBuilderPick,
      assignBuilderPart,
      user,
      filters,
      setFilters,
      categories,
      setCategories: replaceCategories,
      brands,
      dark,
      ui,
      toasts,
      showToast,
      openUi,
      closeUi,
      toggleUi,
      toggleTheme,
      hydrateTheme,
      browseCategory,
      search,
      addToCart,
      queueCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      forgetCart,
      toggleWishlist,
      toggleCompare,
      setCompareList,
      applyCoupon,
      login,
      logout,
    }),
    [
      products,
      productById,
      productBySlug,
      cartItems,
      cartCount,
      cartSubtotal,
      cartDiscount,
      activeCoupon,
      wishlist,
      compareList,
      pcBuild,
      builderPick,
      beginBuilderPick,
      cancelBuilderPick,
      assignBuilderPart,
      user,
      filters,
      categories,
      brands,
      replaceCategories,
      dark,
      ui,
      toasts,
      showToast,
      openUi,
      closeUi,
      toggleUi,
      toggleTheme,
      hydrateTheme,
      browseCategory,
      search,
      addToCart,
      queueCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      forgetCart,
      toggleWishlist,
      toggleCompare,
      applyCoupon,
      login,
      logout,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}

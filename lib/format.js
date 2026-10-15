export function formatBDT(amount) {
  return Number(amount || 0).toLocaleString("en-IN");
}

export function discountFor(coupon, subtotal) {
  if (!coupon || subtotal < coupon.minTotal) return 0;
  if (coupon.type === "fixed") return coupon.value;
  if (coupon.type === "percent") return Math.round((subtotal * coupon.value) / 100);
  return 0;
}

import { apiSend } from "@/config/api";
import { prepareAuth } from "@/service/auth";

export function cartLines(body) {
  const items = Array.isArray(body?.data?.items) ? body.data.items : [];

  return items.map((item) => ({
    id: item.product_id,
    optionId: item.option_value_id || null,
    optionLabel: item.option_label || "",
    unitPrice: Number(item.unit_price) || 0,
    quantity: Number(item.quantity) || 0,
  }));
}

export async function fetchCart() {
  const body = await apiSend("cart");
  return cartLines(body);
}

async function changeCart(path, options) {
  await prepareAuth();
  const body = await apiSend(path, options);
  return cartLines(body);
}

export function addCartItem(productId, qty, optionValueId = null) {
  return changeCart("cart/items", {
    method: "POST",
    body: { product_id: productId, qty, option_value_id: optionValueId || null },
  });
}

export function updateCartItem(productId, qty, optionValueId = null) {
  return changeCart(`cart/items/${productId}`, {
    method: "PATCH",
    body: { qty, option_value_id: optionValueId || null },
  });
}

export function removeCartItem(productId, optionValueId = null) {
  const query = optionValueId ? `?option_value_id=${optionValueId}` : "";
  return changeCart(`cart/items/${productId}${query}`, { method: "DELETE" });
}

export function clearCartItems() {
  return changeCart("cart", { method: "DELETE" });
}

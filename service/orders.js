import { apiSend } from "@/config/api";
import { prepareAuth } from "@/service/auth";

export async function placeOrder(input) {
  await prepareAuth();
  return apiSend("orders", { method: "POST", body: input });
}

export async function myOrders() {
  const body = await apiSend("orders");
  return Array.isArray(body?.data) ? body.data : [];
}

export async function trackOrder(order, phone) {
  const params = new URLSearchParams({ order, phone });
  const body = await apiSend(`track?${params.toString()}`);
  return body?.data || null;
}

export async function adminSummary() {
  const body = await apiSend("admin/summary");
  return body?.data || null;
}

export async function myOrder(orderNumber) {
  const body = await apiSend(`orders/${encodeURIComponent(orderNumber)}`);
  return body?.data || null;
}

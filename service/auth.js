import { apiSend } from "@/config/api";

export async function prepareAuth() {
  await apiSend("csrf");
}

export async function registerCustomer(input) {
  await prepareAuth();
  return apiSend("register", { method: "POST", body: input });
}

export async function loginCustomer(input) {
  await prepareAuth();
  return apiSend("login", { method: "POST", body: input });
}

export async function logoutCustomer() {
  await prepareAuth();
  return apiSend("logout", { method: "POST", body: {} });
}

export async function currentCustomer() {
  try {
    const body = await apiSend("me");
    return body?.data ?? null;
  } catch (error) {
    if (error.status === 401) return null;
    throw error;
  }
}

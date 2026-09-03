// Customer accounts + orders.
// Primary: Supabase (auth + profiles + orders tables). See supabase/schema.sql.
// Fallback: a browser-only demo layer so the store still works before the
// Supabase tables exist or when the project is opened without keys.

import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

export interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  createdAt: string;
  /** "google" | "email" — how the customer signed in (Supabase mode only). */
  provider?: string;
  /** Profile photo URL (Supabase Storage or Google avatar). */
  avatarUrl?: string;
}

export type OrderStatus = "Processing" | "Shipped" | "Delivered" | "Cancelled";

export const ORDER_STATUSES: OrderStatus[] = ["Processing", "Shipped", "Delivered", "Cancelled"];

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

const FREE_SHIPPING_THRESHOLD = 10000;
const DELIVERY_FEE = 500;

/* ============================================================
   Mapping helpers (Supabase rows → app types)
   ============================================================ */

interface OrderRow {
  order_no: string;
  customer_email: string;
  customer_name: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  created_at: string;
}

function mapOrderRow(row: OrderRow): Order {
  return {
    id: row.order_no,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapCustomer(
  id: string,
  email: string,
  name: string,
  address: string,
  createdAt: string,
  avatarUrl = "",
): Customer {
  return { id, email, name, address, createdAt, avatarUrl };
}

/* ============================================================
   Demo (localStorage) implementation — used as a fallback
   ============================================================ */

const CUSTOMERS_KEY = "orwas-customers";
const SESSION_KEY = "orwas-session";
const ORDERS_KEY = "orwas-orders";

function hashPassword(password: string) {
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) + hash + password.charCodeAt(i)) >>> 0;
  }
  return `demo$${hash.toString(16)}`;
}

function demoLoadCustomers(): Customer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOMERS_KEY);
    return raw ? (JSON.parse(raw) as Customer[]) : [];
  } catch {
    return [];
  }
}

function demoSaveCustomers(customers: Customer[]) {
  window.localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

function demoLoadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function demoSaveOrders(orders: Order[]) {
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function demoRegister(name: string, email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!name.trim() || !cleanEmail || !password) return { ok: false, message: "Please fill in all fields." };
  if (password.length < 6) return { ok: false, message: "Password must be at least 6 characters." };
  if (demoLoadCustomers().some((c) => c.email.toLowerCase() === cleanEmail)) {
    return { ok: false, message: "An account with this email already exists. Try signing in." };
  }
  const customer: Customer = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: cleanEmail,
    address: "",
    createdAt: new Date().toISOString(),
  };
  demoSaveCustomers([...demoLoadCustomers(), { ...customer, passwordHash: hashPassword(password) } as never]);
  return { ok: true, customer };
}

function demoLogin(email: string, password: string) {
  const customer = demoLoadCustomers().find((c) => c.email.toLowerCase() === email.trim().toLowerCase());
  if (!customer) return null;
  const stored = customer as Customer & { passwordHash?: string };
  if (!stored.passwordHash || stored.passwordHash !== hashPassword(password)) return null;
  return customer;
}

function demoGetSession(): Customer | null {
  if (typeof window === "undefined") return null;
  const email = window.localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  return demoLoadCustomers().find((c) => c.email.toLowerCase() === email.toLowerCase()) ?? null;
}

function demoUpdateCustomer(id: string, patch: Partial<Customer>) {
  demoSaveCustomers(demoLoadCustomers().map((c) => (c.id === id ? { ...c, ...patch } : c)));
}

function demoChangePassword(id: string, current: string, nextPassword: string) {
  const customer = demoLoadCustomers().find((c) => c.id === id);
  if (!customer) return { ok: false, message: "Account not found." };
  const stored = customer as Customer & { passwordHash?: string };
  if (!stored.passwordHash || stored.passwordHash !== hashPassword(current)) {
    return { ok: false, message: "Current password is incorrect." };
  }
  if (nextPassword.length < 6) return { ok: false, message: "New password must be at least 6 characters." };
  demoUpdateCustomer(id, { passwordHash: hashPassword(nextPassword) } as never);
  return { ok: true };
}

function demoCreateOrder(customerEmail: string, customerName: string, items: OrderItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_FEE;
  const order: Order = {
    id: `ORW-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`,
    customerEmail,
    customerName,
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    status: "Processing",
    createdAt: new Date().toISOString(),
  };
  demoSaveOrders([order, ...demoLoadOrders()]);
  return order;
}

function demoOrdersFor(customerEmail: string) {
  return demoLoadOrders().filter((o) => o.customerEmail.toLowerCase() === customerEmail.toLowerCase());
}

function demoFindOrder(id: string) {
  const normalized = id.trim().toUpperCase();
  return demoLoadOrders().find((o) => o.id.toUpperCase() === normalized) ?? null;
}

/** Runs the Supabase path when configured; otherwise falls back to the demo. */
async function withFallback<T>(supabaseFn: () => Promise<T>, demoFn: () => T): Promise<T> {
  if (!isSupabaseConfigured()) return demoFn();
  try {
    return await supabaseFn();
  } catch (error) {
    console.warn("[orwas] Supabase call failed — using browser demo instead:", error);
    return demoFn();
  }
}

/* ============================================================
   Public API (used by pages)
   ============================================================ */

export async function registerCustomer(name: string, email: string, password: string) {
  if (!isSupabaseConfigured()) return demoRegister(name, email, password);

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: name.trim() },
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  });

  if (error) return { ok: false, message: error.message };
  if (!data.user) return { ok: false, message: "Could not create your account. Please try again." };

  // No session means email confirmation is enabled — tell the user.
  if (!data.session) {
    return {
      ok: true,
      customer: null,
      message: "Account created! Check your email to confirm, then sign in.",
    };
  }

  return {
    ok: true,
    customer: mapCustomer(data.user.id, data.user.email ?? email, name.trim(), "", data.user.created_at),
  };
}

export async function resendConfirmationEmail(email: string) {
  if (!isSupabaseConfigured()) return { ok: true, message: "Nothing to resend in demo mode — just sign in." };
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Confirmation email sent — check your inbox (and spam)." };
}

export async function loginCustomer(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    const customer = demoLogin(email, password);
    return customer ? { ok: true, customer } : { ok: false, message: "Invalid email or password." };
  }

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message = error.message.toLowerCase().includes("not confirmed")
      ? "Please confirm your email first — check your inbox for the confirmation link."
      : "Invalid email or password.";
    return { ok: false, message };
  }

  const user = data.user;
  const { data: profile } = await supabase
    .from("profiles")
    .select("name,address,avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return {
    ok: true,
    customer: mapCustomer(
      user.id,
      user.email ?? email,
      profile?.name ?? "",
      profile?.address ?? "",
      user.created_at,
      profile?.avatar_url ?? "",
    ),
  };
}

/** Supabase manages its own session; this only matters for the demo fallback. */
export async function setSession(email: string) {
  if (!isSupabaseConfigured()) {
    window.localStorage.setItem(SESSION_KEY, email.toLowerCase());
  }
}

export async function clearSession() {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

export async function getSession(): Promise<Customer | null> {
  if (!isSupabaseConfigured()) return demoGetSession();

  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let { data: profile } = await supabase
    .from("profiles")
    .select("name,address,avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  // Safety net: if the profile row is missing (e.g. trigger not run yet,
  // or an OAuth signup that predates it), create one from the auth metadata.
  if (!profile) {
    const fallbackName =
      user.user_metadata?.full_name ?? user.user_metadata?.name ?? "";
    const { data: inserted } = await supabase
      .from("profiles")
      .upsert({ id: user.id, name: fallbackName })
      .select("name,address,avatar_url")
      .maybeSingle();
    profile = inserted ?? null;
  }

  const customer = mapCustomer(
    user.id,
    user.email ?? "",
    profile?.name ?? "",
    profile?.address ?? "",
    user.created_at,
    profile?.avatar_url ?? "",
  );

  // Google users: fall back to Google's own avatar until they upload one.
  if (!customer.avatarUrl && typeof user.user_metadata?.avatar_url === "string") {
    customer.avatarUrl = user.user_metadata.avatar_url;
  }

  return customer;
}

export async function updateCustomer(id: string, patch: Partial<Customer>) {
  await withFallback(
    async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("profiles")
        .update({ name: patch.name, address: patch.address })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    () => demoUpdateCustomer(id, patch),
  );
}

export async function updateCustomerAvatar(id: string, avatarUrl: string) {
  if (!isSupabaseConfigured()) return { ok: true }; // demo has no avatar storage
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function changePassword(id: string, current: string, nextPassword: string) {
  if (!isSupabaseConfigured()) return demoChangePassword(id, current, nextPassword);

  const session = await getSession();
  if (!session) return { ok: false, message: "Not signed in." };
  if (nextPassword.length < 6) return { ok: false, message: "New password must be at least 6 characters." };

  const supabase = createSupabaseBrowserClient();
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: session.email,
    password: current,
  });
  if (verifyError) return { ok: false, message: "Current password is incorrect." };

  const { error } = await supabase.auth.updateUser({ password: nextPassword });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function createOrder(customer: Customer, items: OrderItem[]): Promise<Order> {
  return withFallback(
    async () => {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const deliveryFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_FEE;
      const orderNo = `ORW-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`;

      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("orders")
        .insert({
          order_no: orderNo,
          user_id: customer.id,
          customer_email: customer.email,
          customer_name: customer.name,
          items,
          subtotal,
          delivery_fee: deliveryFee,
          total: subtotal + deliveryFee,
          status: "Processing",
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return mapOrderRow(data as unknown as OrderRow);
    },
    () => demoCreateOrder(customer.email, customer.name, items),
  );
}

export async function ordersFor(customerEmail: string): Promise<Order[]> {
  return withFallback(
    async () => {
      const session = await getSession();
      if (!session) return [];
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []).map((row) => mapOrderRow(row as unknown as OrderRow));
    },
    () => demoOrdersFor(customerEmail),
  );
}

export async function findOrder(orderNo: string): Promise<Order | null> {
  return withFallback(
    async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("track_order", {
        p_order_no: orderNo.trim().toUpperCase(),
      });
      if (error) throw new Error(error.message);
      const row = (data ?? [])[0];
      if (!row) return null;
      const mapped = mapOrderRow(row as unknown as OrderRow);
      return { ...mapped, customerEmail: "" };
    },
    () => demoFindOrder(orderNo),
  );
}

/* ---------- Admin helpers (used only as demo fallback — admin pages
   primarily talk to /api/admin/data which uses the service role key) ---------- */

export async function loadOrders(): Promise<Order[]> {
  return demoLoadOrders();
}

export async function saveOrders(orders: Order[]) {
  demoSaveOrders(orders);
}

export async function loadCustomers(): Promise<Customer[]> {
  return demoLoadCustomers();
}

export async function saveCustomers(customers: Customer[]) {
  demoSaveCustomers(customers);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  demoSaveOrders(demoLoadOrders().map((o) => (o.id === id ? { ...o, status } : o)));
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
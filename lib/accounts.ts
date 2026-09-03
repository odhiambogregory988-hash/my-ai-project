// Customer accounts + orders (front-end demo layer)
// NOTE: This is a client-side prototype store so you can try the full flow
// (register → login → checkout → track order → admin management).
// Your partner's real authentication & payment APIs will replace this.

export interface Customer {
  id: string;
  name: string;
  email: string;
  /** Obfuscated demo credential only — real auth will be server-side */
  passwordHash: string;
  address: string;
  createdAt: string;
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

const CUSTOMERS_KEY = "orwas-customers";
const SESSION_KEY = "orwas-session";
const ORDERS_KEY = "orwas-orders";
const FREE_SHIPPING_THRESHOLD = 10000;
const DELIVERY_FEE = 500;

/* ---------- tiny demo hash (not secure — replaced by real auth later) ---------- */

export function hashPassword(password: string) {
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) + hash + password.charCodeAt(i)) >>> 0;
  }
  return `demo$${hash.toString(16)}`;
}

/* ---------- customers ---------- */

export function loadCustomers(): Customer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOMERS_KEY);
    return raw ? (JSON.parse(raw) as Customer[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomers(customers: Customer[]) {
  window.localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

export function findCustomer(email: string) {
  return loadCustomers().find((c) => c.email.toLowerCase() === email.toLowerCase());
}

export function registerCustomer(name: string, email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!name.trim() || !cleanEmail || !password) {
    return { ok: false, message: "Please fill in all fields." };
  }
  if (password.length < 6) {
    return { ok: false, message: "Password must be at least 6 characters." };
  }
  if (findCustomer(cleanEmail)) {
    return { ok: false, message: "An account with this email already exists. Try signing in." };
  }

  const customer: Customer = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: cleanEmail,
    passwordHash: hashPassword(password),
    address: "",
    createdAt: new Date().toISOString(),
  };

  saveCustomers([...loadCustomers(), customer]);
  return { ok: true, customer };
}

export function loginCustomer(email: string, password: string) {
  const customer = findCustomer(email.trim());
  if (!customer || customer.passwordHash !== hashPassword(password)) return null;
  return customer;
}

/* ---------- session ---------- */

export function setSession(email: string) {
  window.localStorage.setItem(SESSION_KEY, email.toLowerCase());
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function getSession(): Customer | null {
  if (typeof window === "undefined") return null;
  const email = window.localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  return findCustomer(email) ?? null;
}

export function updateCustomer(id: string, patch: Partial<Customer>) {
  const customers = loadCustomers();
  const next = customers.map((c) => (c.id === id ? { ...c, ...patch } : c));
  saveCustomers(next);
}

export function changePassword(id: string, current: string, nextPassword: string) {
  const customer = loadCustomers().find((c) => c.id === id);
  if (!customer) return { ok: false, message: "Account not found." };
  if (customer.passwordHash !== hashPassword(current)) {
    return { ok: false, message: "Current password is incorrect." };
  }
  if (nextPassword.length < 6) {
    return { ok: false, message: "New password must be at least 6 characters." };
  }
  updateCustomer(id, { passwordHash: hashPassword(nextPassword) });
  return { ok: true };
}

/* ---------- orders ---------- */

export function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]) {
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function createOrder(
  customerEmail: string,
  customerName: string,
  items: OrderItem[],
): Order {
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

  saveOrders([order, ...loadOrders()]);
  return order;
}

export function ordersFor(customerEmail: string) {
  return loadOrders().filter((o) => o.customerEmail.toLowerCase() === customerEmail.toLowerCase());
}

export function findOrder(id: string) {
  const normalized = id.trim().toUpperCase();
  return loadOrders().find((o) => o.id.toUpperCase() === normalized) ?? null;
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  saveOrders(loadOrders().map((o) => (o.id === id ? { ...o, status } : o)));
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
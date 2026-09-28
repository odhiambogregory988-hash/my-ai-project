import { bench, describe } from "vitest";

import { installBrowserStorage, makeOrders } from "./fixtures";

// The order helpers fall back to the browser-only demo layer when Supabase is
// not configured. Benchmarks always exercise that deterministic local path.
delete process.env.NEXT_PUBLIC_SUPABASE_URL;
delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const { findOrder, formatDate, loadOrders, ordersFor, updateOrderStatus } = await import(
  "@/lib/accounts"
);

const ORDERS_STORAGE_KEY = "orwas-orders";

const orders = makeOrders(500);
const serializedOrders = JSON.stringify(orders);

function seedOrders() {
  installBrowserStorage({ [ORDERS_STORAGE_KEY]: serializedOrders });
}

seedOrders();

const lastOrderId = orders[orders.length - 1].id;
const isoDates = orders.slice(0, 100).map((order) => order.createdAt);

describe("order history", () => {
  bench("loadOrders - parse 500 stored orders", async () => {
    await loadOrders();
  });

  bench("ordersFor - filter 500 orders by customer", async () => {
    await ordersFor("customer42@example.com");
  });

  bench("findOrder - lookup last order of 500", async () => {
    await findOrder(lastOrderId);
  });

  bench("findOrder - unknown order number", async () => {
    await findOrder("ORW-DOES-NOT-EXIST");
  });

  bench("updateOrderStatus - rewrite 500 orders", async () => {
    await updateOrderStatus(lastOrderId, "Shipped");
  });
});

describe("order rendering helpers", () => {
  bench("formatDate - 100 order dates", () => {
    for (const iso of isoDates) {
      formatDate(iso);
    }
  });
});

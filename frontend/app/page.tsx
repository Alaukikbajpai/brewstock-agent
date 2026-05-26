"use client";

import { useEffect, useState } from "react";

type InventoryItem = {
  item_id: string;
  name: string;
  current_stock: number;
  unit: string;
  reorder_level: number;
  recommended_order_quantity: number;
  supplier_id: string;
};

type RecommendedOrder = {
  item_id: string;
  item_name: string;
  current_stock: number;
  reorder_level: number;
  recommended_order_quantity: number;
  unit: string;
  supplier_id: string;
  supplier_name: string;
  supplier_email: string;
  lead_time_days: number;
};

type PurchaseOrder = {
  po_id: string;
  supplier_id: string;
  supplier_name: string;
  items: {
    item_id: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
  status: string;
  created_by: string;
  created_at: string;
};

const API_BASE_URL = "http://localhost:5001";

export default function Home() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [recommendedOrders, setRecommendedOrders] = useState<RecommendedOrder[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [agentMessage, setAgentMessage] = useState(
    "Ask BrewStock Agent to check low-stock items and prepare demo purchase orders."
  );
  const [loading, setLoading] = useState(false);

  const fetchInventory = async () => {
    const response = await fetch(`${API_BASE_URL}/inventory`);
    const data = await response.json();
    setInventory(data);
  };

  const fetchPurchaseOrders = async () => {
    const response = await fetch(`${API_BASE_URL}/purchase-orders`);
    const data = await response.json();
    setPurchaseOrders(data);
  };

  const checkLowStock = async () => {
    setLoading(true);

    const response = await fetch(`${API_BASE_URL}/agent/check-low-stock`, {
      method: "POST",
    });

    const data = await response.json();

    setAgentMessage(data.message);
    setRecommendedOrders(data.recommended_orders);
    setLoading(false);
  };

  const createPurchaseOrder = async (order: RecommendedOrder) => {
    const response = await fetch(`${API_BASE_URL}/purchase-orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        supplier_id: order.supplier_id,
        supplier_name: order.supplier_name,
        items: [
          {
            item_id: order.item_id,
            name: order.item_name,
            quantity: order.recommended_order_quantity,
            unit: order.unit,
          },
        ],
      }),
    });

    const newOrder = await response.json();

    setAgentMessage(
      `Purchase order ${newOrder.po_id} created for ${newOrder.supplier_name}. Status: Pending Approval.`
    );

    await fetchPurchaseOrders();
  };

  const confirmOrder = async (poId: string) => {
    const response = await fetch(`${API_BASE_URL}/purchase-orders/${poId}/confirm`, {
      method: "PATCH",
    });

    const updatedOrder = await response.json();

    setAgentMessage(
      `Order ${updatedOrder.po_id} has been confirmed. This is a demo order, not a real paid supplier order.`
    );

    await fetchPurchaseOrders();
  };

  useEffect(() => {
    fetchInventory();
    fetchPurchaseOrders();
  }, []);

  const lowStockCount = inventory.filter(
    (item) => item.current_stock < item.reorder_level
  ).length;

  const pendingOrdersCount = purchaseOrders.filter(
    (order) => order.status === "Pending Approval"
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <section className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
            Google Cloud Rapid Agent Hackathon
          </p>
          <h1 className="mt-3 text-4xl font-bold">BrewStock Agent</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            An AI inventory and demo-order assistant for coffee shops. It checks
            stock, finds low inventory, matches suppliers, creates purchase
            order drafts, and confirms orders only after manager approval.
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Inventory Items</p>
            <p className="mt-2 text-3xl font-bold">{inventory.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Low Stock Alerts</p>
            <p className="mt-2 text-3xl font-bold text-amber-400">
              {lowStockCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Pending Orders</p>
            <p className="mt-2 text-3xl font-bold text-sky-400">
              {pendingOrdersCount}
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-emerald-900 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Agent Action Panel</h2>
              <p className="mt-2 text-slate-300">{agentMessage}</p>
            </div>

            <button
              onClick={checkLowStock}
              disabled={loading}
              className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Checking..." : "Check Low Stock"}
            </button>
          </div>
        </section>

        {recommendedOrders.length > 0 && (
          <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-2xl font-semibold">
              Recommended Demo Orders
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {recommendedOrders.map((order) => (
                <div
                  key={order.item_id}
                  className="rounded-xl border border-slate-700 bg-slate-950 p-5"
                >
                  <h3 className="text-xl font-semibold">{order.item_name}</h3>
                  <p className="mt-2 text-slate-300">
                    Current stock: {order.current_stock} {order.unit}
                  </p>
                  <p className="text-slate-300">
                    Reorder level: {order.reorder_level} {order.unit}
                  </p>
                  <p className="text-slate-300">
                    Recommended order: {order.recommended_order_quantity}{" "}
                    {order.unit}
                  </p>
                  <p className="mt-2 text-slate-400">
                    Supplier: {order.supplier_name}
                  </p>
                  <p className="text-slate-400">
                    Lead time: {order.lead_time_days} days
                  </p>

                  <button
                    onClick={() => createPurchaseOrder(order)}
                    className="mt-4 rounded-xl bg-sky-500 px-4 py-2 font-semibold text-slate-950 hover:bg-sky-400"
                  >
                    Create Demo Order
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-2xl font-semibold">Inventory</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="py-3">Item</th>
                  <th className="py-3">Current Stock</th>
                  <th className="py-3">Reorder Level</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const isLow = item.current_stock < item.reorder_level;

                  return (
                    <tr key={item.item_id} className="border-b border-slate-800">
                      <td className="py-3">{item.name}</td>
                      <td className="py-3">
                        {item.current_stock} {item.unit}
                      </td>
                      <td className="py-3">
                        {item.reorder_level} {item.unit}
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-sm ${
                            isLow
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          {isLow ? "Low Stock" : "Healthy"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-2xl font-semibold">Purchase Orders</h2>

          {purchaseOrders.length === 0 ? (
            <p className="text-slate-400">No purchase orders created yet.</p>
          ) : (
            <div className="grid gap-4">
              {purchaseOrders.map((order) => (
                <div
                  key={order.po_id}
                  className="rounded-xl border border-slate-700 bg-slate-950 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{order.po_id}</h3>
                      <p className="text-slate-300">
                        Supplier: {order.supplier_name}
                      </p>
                      <p className="text-slate-400">
                        Items:{" "}
                        {order.items
                          .map(
                            (item) =>
                              `${item.name} - ${item.quantity} ${item.unit}`
                          )
                          .join(", ")}
                      </p>
                      <p className="mt-2">
                        Status:{" "}
                        <span
                          className={`rounded-full px-3 py-1 text-sm ${
                            order.status === "Confirmed"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-sky-500/20 text-sky-300"
                          }`}
                        >
                          {order.status}
                        </span>
                      </p>
                    </div>

                    {order.status === "Pending Approval" && (
                      <button
                        onClick={() => confirmOrder(order.po_id)}
                        className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
                      >
                        Confirm Demo Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
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

const API_BASE_URL =
  "https://brewstock-backend-611787017892.asia-south1.run.app";

export default function Home() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [recommendedOrders, setRecommendedOrders] = useState<RecommendedOrder[]>(
    []
  );
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [agentMessage, setAgentMessage] = useState(
    "This dashboard visualizes the same MongoDB-backed inventory and order workflow used by the Gemini agent in Google Cloud Agent Studio."
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
      `Demo purchase order ${newOrder.po_id} created for ${newOrder.supplier_name}. Status: Pending Approval.`
    );

    await fetchPurchaseOrders();
  };

  const confirmOrder = async (poId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/purchase-orders/${poId}/confirm`,
      {
        method: "PATCH",
      }
    );

    const updatedOrder = await response.json();

    setAgentMessage(
      `Order ${updatedOrder.po_id} has been confirmed. This is still a demo order, not a real paid supplier order.`
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

  const confirmedOrdersCount = purchaseOrders.filter(
    (order) => order.status === "Confirmed"
  ).length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#064e3b_0,#020617_36%,#020617_100%)] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-10 overflow-hidden rounded-3xl border border-emerald-900/60 bg-slate-950/70 p-8 shadow-2xl shadow-emerald-950/40">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
                Google Cloud Rapid Agent Hackathon
              </p>

              <h1 className="mt-4 text-5xl font-bold tracking-tight md:text-6xl">
                BrewStock Agent
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                A Gemini-powered inventory and demo-order agent for coffee
                shops. Built with Google Cloud Agent Studio, a custom MCP
                server, MongoDB Atlas, and Cloud Run, it checks real inventory,
                detects low stock, creates pending demo purchase orders, and
                confirms them only after manager approval.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {[
                  "Gemini 3.5 Flash",
                  "Google Cloud Agent Studio",
                  "MongoDB MCP Server",
                  "MongoDB Atlas",
                  "Cloud Run",
                ].map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-emerald-800 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={checkLowStock}
                  disabled={loading}
                  className="rounded-2xl bg-emerald-400 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Checking MongoDB..." : "Run Low-Stock Check"}
                </button>

                <a
                  href="https://brewstock-mcp-server-611787017892.asia-south1.run.app"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-slate-700 px-6 py-3 text-center font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300"
                >
                  View MCP Server
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Agent workflow
              </p>

              <div className="mt-5 space-y-4">
                {[
                  "Manager asks in Agent Studio",
                  "Gemini calls BrewStock MCP tools",
                  "MCP reads MongoDB-backed inventory",
                  "Agent drafts safe demo purchase orders",
                  "Manager confirms before status changes",
                ].map((step, index) => (
                  <div
                    key={step}
                    className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-sm font-bold text-slate-950">
                      {index + 1}
                    </div>
                    <p className="text-sm text-slate-300">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">Inventory Items</p>
            <p className="mt-2 text-4xl font-bold">{inventory.length}</p>
            <p className="mt-2 text-xs text-slate-500">Loaded from MongoDB</p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">Low Stock Alerts</p>
            <p className="mt-2 text-4xl font-bold text-amber-400">
              {lowStockCount}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Based on reorder levels
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">Pending Orders</p>
            <p className="mt-2 text-4xl font-bold text-sky-400">
              {pendingOrdersCount}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Waiting for approval
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">Confirmed Orders</p>
            <p className="mt-2 text-4xl font-bold text-emerald-400">
              {confirmedOrdersCount}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Demo orders only
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-emerald-900/70 bg-slate-900/90 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
                Live Dashboard
              </p>

              <h2 className="mt-2 text-3xl font-semibold">
                Agentic Inventory Control
              </h2>

              <p className="mt-3 max-w-4xl text-slate-300">
                {agentMessage}
              </p>

              <p className="mt-2 max-w-4xl text-sm text-slate-500">
                Natural-language chat runs inside Google Cloud Agent Studio.
                This dashboard shows the same inventory and purchase-order
                actions through a visual manager approval interface.
              </p>
            </div>

            <button
              onClick={checkLowStock}
              disabled={loading}
              className="rounded-2xl bg-emerald-400 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Checking MongoDB..." : "Check Stock Risk"}
            </button>
          </div>
        </section>

        {recommendedOrders.length > 0 && (
          <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-sky-400">
                  MCP Tool Output
                </p>
                <h2 className="mt-2 text-3xl font-semibold">
                  Recommended Demo Orders
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                These recommendations come from MongoDB-backed inventory data.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {recommendedOrders.map((order) => (
                <div
                  key={order.item_id}
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-5 transition hover:border-emerald-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {order.item_name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Supplier: {order.supplier_name}
                      </p>
                    </div>

                    <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300">
                      Low Stock
                    </span>
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-slate-300">
                    <p>
                      Current stock:{" "}
                      <span className="font-semibold text-white">
                        {order.current_stock} {order.unit}
                      </span>
                    </p>
                    <p>
                      Reorder level:{" "}
                      <span className="font-semibold text-white">
                        {order.reorder_level} {order.unit}
                      </span>
                    </p>
                    <p>
                      Recommended order:{" "}
                      <span className="font-semibold text-emerald-300">
                        {order.recommended_order_quantity} {order.unit}
                      </span>
                    </p>
                    <p>Lead time: {order.lead_time_days} days</p>
                  </div>

                  <button
                    onClick={() => createPurchaseOrder(order)}
                    className="mt-5 w-full rounded-xl bg-sky-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-sky-400"
                  >
                    Create Pending Demo Order
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
            Architecture
          </p>

          <h2 className="mt-2 text-3xl font-semibold">How the Agent Works</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-5">
            {[
              {
                title: "Ask Agent",
                text: "Manager asks a natural-language inventory question in Agent Studio.",
              },
              {
                title: "MCP Tool Call",
                text: "Gemini calls BrewStock MCP tools to retrieve or update data.",
              },
              {
                title: "MongoDB Data",
                text: "Inventory, suppliers, and purchase orders are stored in MongoDB Atlas.",
              },
              {
                title: "Draft Order",
                text: "The agent creates pending demo purchase orders for low-stock items.",
              },
              {
                title: "Approve",
                text: "Manager confirmation is required before an order becomes confirmed.",
              },
            ].map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-700 bg-slate-950 p-4"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-sm font-bold text-slate-950">
                  {index + 1}
                </div>

                <h3 className="font-semibold text-emerald-300">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                MongoDB Atlas
              </p>
              <h2 className="mt-2 text-3xl font-semibold">Inventory</h2>
            </div>

            <p className="text-sm text-slate-500">
              Current stock compared against reorder thresholds.
            </p>
          </div>

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
                    <tr
                      key={item.item_id}
                      className="border-b border-slate-800"
                    >
                      <td className="py-4 font-medium">{item.name}</td>

                      <td className="py-4">
                        {item.current_stock} {item.unit}
                      </td>

                      <td className="py-4">
                        {item.reorder_level} {item.unit}
                      </td>

                      <td className="py-4">
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

        <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                Human Approval Layer
              </p>
              <h2 className="mt-2 text-3xl font-semibold">Purchase Orders</h2>
            </div>

            <p className="text-sm text-slate-500">
              All orders are demo drafts and require manager approval.
            </p>
          </div>

          {purchaseOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center">
              <p className="text-slate-400">No purchase orders created yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {purchaseOrders.map((order) => (
                <div
                  key={order.po_id}
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-5"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold">
                          {order.po_id}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-sm ${
                            order.status === "Confirmed"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-sky-500/20 text-sky-300"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <p className="mt-3 text-slate-300">
                        Supplier: {order.supplier_name}
                      </p>

                      <p className="mt-1 text-slate-400">
                        Items:{" "}
                        {order.items
                          .map(
                            (item) =>
                              `${item.name} - ${item.quantity} ${item.unit}`
                          )
                          .join(", ")}
                      </p>
                    </div>

                    {order.status === "Pending Approval" && (
                      <button
                        onClick={() => confirmOrder(order.po_id)}
                        className="rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
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
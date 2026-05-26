const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

let inventory = [
  {
    item_id: "oat_milk",
    name: "Oat Milk",
    current_stock: 2,
    unit: "litres",
    reorder_level: 5,
    recommended_order_quantity: 20,
    supplier_id: "fresh_dairy",
  },
  {
    item_id: "coffee_beans",
    name: "Arabica Coffee Beans",
    current_stock: 4,
    unit: "kg",
    reorder_level: 3,
    recommended_order_quantity: 10,
    supplier_id: "bean_co",
  },
  {
    item_id: "medium_cups",
    name: "Medium Cups",
    current_stock: 100,
    unit: "pieces",
    reorder_level: 250,
    recommended_order_quantity: 1000,
    supplier_id: "pack_pro",
  },
];

let suppliers = [
  {
    supplier_id: "fresh_dairy",
    name: "FreshDairy Supplies",
    email: "orders@freshdairy.example",
    lead_time_days: 2,
  },
  {
    supplier_id: "bean_co",
    name: "BeanCo Roasters",
    email: "orders@beanco.example",
    lead_time_days: 3,
  },
  {
    supplier_id: "pack_pro",
    name: "PackPro Vendors",
    email: "orders@packpro.example",
    lead_time_days: 4,
  },
];

let purchaseOrders = [];

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "BrewStock backend is running",
  });
});

app.get("/inventory", (req, res) => {
  res.json(inventory);
});

app.get("/suppliers", (req, res) => {
  res.json(suppliers);
});

app.get("/purchase-orders", (req, res) => {
  res.json(purchaseOrders);
});

app.post("/agent/check-low-stock", (req, res) => {
  const lowStockItems = inventory.filter(
    (item) => item.current_stock < item.reorder_level
  );

  const recommendedOrders = lowStockItems.map((item) => {
    const supplier = suppliers.find(
      (supplier) => supplier.supplier_id === item.supplier_id
    );

    return {
      item_id: item.item_id,
      item_name: item.name,
      current_stock: item.current_stock,
      reorder_level: item.reorder_level,
      recommended_order_quantity: item.recommended_order_quantity,
      unit: item.unit,
      supplier_id: supplier?.supplier_id,
      supplier_name: supplier?.name,
      supplier_email: supplier?.email,
      lead_time_days: supplier?.lead_time_days,
    };
  });

  res.json({
    message: `I found ${lowStockItems.length} low-stock item(s).`,
    recommended_orders: recommendedOrders,
  });
});

app.post("/purchase-orders", (req, res) => {
  const { supplier_id, supplier_name, items } = req.body;

  const newOrder = {
    po_id: `PO-${1001 + purchaseOrders.length}`,
    supplier_id,
    supplier_name,
    items,
    status: "Pending Approval",
    created_by: "BrewStock Agent",
    created_at: new Date().toISOString(),
  };

  purchaseOrders.push(newOrder);

  res.status(201).json(newOrder);
});

app.patch("/purchase-orders/:po_id/confirm", (req, res) => {
  const { po_id } = req.params;

  const order = purchaseOrders.find((order) => order.po_id === po_id);

  if (!order) {
    return res.status(404).json({
      message: "Purchase order not found",
    });
  }

  order.status = "Confirmed";
  order.confirmed_at = new Date().toISOString();

  res.json(order);
});

app.listen(PORT, () => {
  console.log(`BrewStock backend running on port ${PORT}`);
});
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || "brewstock";

let db;

async function connectToMongoDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    db = client.db(DATABASE_NAME);

    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "BrewStock backend is running",
    database: db ? "connected" : "not connected",
  });
});

app.get("/inventory", async (req, res) => {
  try {
    const inventory = await db.collection("inventory").find({}).toArray();
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
});

app.get("/suppliers", async (req, res) => {
  try {
    const suppliers = await db.collection("suppliers").find({}).toArray();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch suppliers" });
  }
});

app.get("/purchase-orders", async (req, res) => {
  try {
    const purchaseOrders = await db
      .collection("purchase_orders")
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    res.json(purchaseOrders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch purchase orders" });
  }
});

app.post("/agent/check-low-stock", async (req, res) => {
  try {
    const inventory = await db.collection("inventory").find({}).toArray();
    const suppliers = await db.collection("suppliers").find({}).toArray();

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
      message: `I found ${lowStockItems.length} low-stock item(s) using MongoDB inventory data.`,
      recommended_orders: recommendedOrders,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to check low stock" });
  }
});

app.post("/purchase-orders", async (req, res) => {
  try {
    const { supplier_id, supplier_name, items } = req.body;

    const orderCount = await db.collection("purchase_orders").countDocuments();

    const newOrder = {
      po_id: `PO-${1001 + orderCount}`,
      supplier_id,
      supplier_name,
      items,
      status: "Pending Approval",
      created_by: "BrewStock Agent",
      created_at: new Date().toISOString(),
    };

    await db.collection("purchase_orders").insertOne(newOrder);

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Failed to create purchase order" });
  }
});

app.patch("/purchase-orders/:po_id/confirm", async (req, res) => {
  try {
    const { po_id } = req.params;

    const result = await db.collection("purchase_orders").findOneAndUpdate(
      { po_id },
      {
        $set: {
          status: "Confirmed",
          confirmed_at: new Date().toISOString(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({
        message: "Purchase order not found",
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to confirm purchase order" });
  }
});

connectToMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`BrewStock backend running on port ${PORT}`);
  });
});
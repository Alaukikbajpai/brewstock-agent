import express from "express";
import cors from "cors";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

const BREWSTOCK_API_BASE_URL =
  process.env.BREWSTOCK_API_BASE_URL ||
  "https://brewstock-backend-611787017892.asia-south1.run.app";

function createMcpServer() {
  const server = new McpServer({
    name: "brewstock-mcp-server",
    version: "1.0.0",
  });

  server.tool(
    "check_low_stock",
    "Checks real BrewStock inventory from MongoDB and returns low-stock items, supplier details, and recommended order quantities.",
    {},
    async () => {
      const response = await fetch(
        `${BREWSTOCK_API_BASE_URL}/agent/check-low-stock`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`BrewStock API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "get_inventory",
    "Gets the full BrewStock inventory list from MongoDB.",
    {},
    async () => {
      const response = await fetch(`${BREWSTOCK_API_BASE_URL}/inventory`);

      if (!response.ok) {
        throw new Error(`BrewStock API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "get_purchase_orders",
    "Gets all BrewStock demo purchase orders from MongoDB.",
    {},
    async () => {
      const response = await fetch(`${BREWSTOCK_API_BASE_URL}/purchase-orders`);

      if (!response.ok) {
        throw new Error(`BrewStock API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "create_purchase_order",
    "Creates a pending demo purchase order for a supplier. This does not place a real paid order.",
    {
      supplier_id: z.string(),
      supplier_name: z.string(),
      item_id: z.string(),
      item_name: z.string(),
      quantity: z.number(),
      unit: z.string(),
    },
    async ({
      supplier_id,
      supplier_name,
      item_id,
      item_name,
      quantity,
      unit,
    }) => {
      const response = await fetch(`${BREWSTOCK_API_BASE_URL}/purchase-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplier_id,
          supplier_name,
          items: [
            {
              item_id,
              name: item_name,
              quantity,
              unit,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`BrewStock API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "confirm_purchase_order",
    "Confirms a pending demo purchase order by purchase order ID. This is still a demo order and does not place a real paid supplier order.",
    {
      po_id: z.string(),
    },
    async ({ po_id }) => {
      const response = await fetch(
        `${BREWSTOCK_API_BASE_URL}/purchase-orders/${po_id}/confirm`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error(`BrewStock API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }
  );

  return server;
}

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "BrewStock MCP server is running",
    mcp_endpoint: "/mcp",
  });
});

app.post("/mcp", async (req, res) => {
  const server = createMcpServer();

  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close();
      server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP request failed:", error);

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

app.get("/mcp", async (req, res) => {
  res.status(405).json({
    message: "BrewStock MCP server is available at POST /mcp",
  });
});

app.listen(PORT, () => {
  console.log(`BrewStock MCP server running on port ${PORT}`);
});
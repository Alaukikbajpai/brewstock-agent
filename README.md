# BrewStock Agent
BrewStock Agent is a Gemini-powered inventory and demo-order agent for coffee shops.
It helps coffee shop managers check stock, detect low inventory, match items with suppliers, create demo purchase order drafts, and confirm orders only after manager approval.
---
## Problem
Coffee shops often manage ingredients like milk, coffee beans, cups, syrups, and packaging manually. This can lead to:
- Stockouts during peak hours
- Delayed ordering
- Over-ordering
- Inventory waste
- Manual tracking effort
- Missed supplier reorder points
A small coffee shop may not have a dedicated operations team, but it still needs fast and reliable inventory decisions.
---
## Solution
BrewStock Agent provides an agentic inventory workflow for coffee shops.
The agent can:
1. Check real inventory data.
2. Detect low-stock items.
3. Match each item with the correct supplier.
4. Recommend order quantities.
5. Create pending demo purchase orders.
6. Confirm demo orders only after manager approval.
The system does not place real paid supplier orders. It creates safe demo purchase order drafts that remain pending until the manager confirms them.
---
## Agentic Workflow
BrewStock Agent is not just a chatbot.

It uses **Gemini 3.5 Flash** inside **Google Cloud Agent Studio** and connects to a custom **BrewStock MCP Server**.

The agent uses MCP tools to interact with the BrewStock backend and MongoDB Atlas database.

### Example Flow

User asks:

```text
What items do I need to order today?
```

The agent then:

1. Calls the `check_low_stock` MCP tool.
2. Reads real inventory data from MongoDB.
3. Identifies low-stock items.
4. Matches each item with its supplier.
5. Shows current stock, reorder level, supplier, and recommended quantity.
6. Asks whether the manager wants to create pending demo purchase orders.
7. Creates purchase order drafts using the MCP tool.
8. Confirms orders only after manager approval.

---

## Current MVP Features

- Inventory dashboard
- Low-stock detection
- Supplier matching
- Demo purchase order creation
- Manager confirmation flow
- MongoDB Atlas database integration
- Google Cloud Run backend deployment
- Custom MCP server deployed on Google Cloud Run
- Google Cloud Agent Studio agent
- Gemini 3.5 Flash model integration
- MCP tools for inventory and purchase order actions

---

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- Agent Platform: Google Cloud Agent Studio
- AI Model: Gemini 3.5 Flash
- Partner Track: MongoDB
- Partner Integration: BrewStock MCP Server connected to MongoDB-backed tools
- Backend Hosting: Google Cloud Run
- MCP Server Hosting: Google Cloud Run
- Version Control: GitHub
- License: MIT

---

## Architecture

```text
User
  ↓
Google Cloud Agent Studio
  ↓
Gemini 3.5 Flash Agent
  ↓
BrewStock MCP Server
  ↓
Cloud Run Backend API
  ↓
MongoDB Atlas
  ↓
Inventory / Suppliers / Purchase Orders
```

The frontend app provides a dashboard for visualizing inventory and purchase orders, while the agent handles natural-language inventory decisions and tool-based actions.

---

## Hosted Services

### Backend API

```text
https://brewstock-backend-611787017892.asia-south1.run.app
```

### MCP Server

```text
https://brewstock-mcp-server-611787017892.asia-south1.run.app
```

### MCP Endpoint

```text
https://brewstock-mcp-server-611787017892.asia-south1.run.app/mcp
```

---

## MCP Tools

The BrewStock MCP Server exposes the following tools to the Google Cloud Agent Studio agent:

```text
check_low_stock
get_inventory
get_purchase_orders
create_purchase_order
confirm_purchase_order
```

### Tool Descriptions

#### `check_low_stock`

Checks real BrewStock inventory from MongoDB and returns low-stock items, supplier details, current stock, reorder levels, and recommended order quantities.

#### `get_inventory`

Gets the full BrewStock inventory list from MongoDB.

#### `get_purchase_orders`

Gets all demo purchase orders from MongoDB.

#### `create_purchase_order`

Creates a pending demo purchase order for a supplier. This does not place a real paid order.

#### `confirm_purchase_order`

Confirms a pending demo purchase order by purchase order ID. This is still a demo order and does not place a real paid supplier order.

---

## API Endpoints

The backend exposes the following API endpoints:

```text
GET /health
GET /inventory
GET /suppliers
GET /purchase-orders
POST /agent/check-low-stock
POST /purchase-orders
PATCH /purchase-orders/:po_id/confirm
```

---

## Project Structure

```text
brewstock-agent/
  backend/
    server.js
    package.json
    .dockerignore

  frontend/
    app/
    package.json

  mcp-server/
    server.js
    package.json
    .dockerignore

  .gitignore
  LICENSE
  README.md
```

---

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Alaukikbajpai/brewstock-agent.git
cd brewstock-agent
```

---

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs locally on:

```text
http://localhost:5001
```

Backend health check:

```text
http://localhost:5001/health
```

---

### 3. Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs locally on:

```text
http://localhost:3000
```

---

### 4. MCP Server Setup

Open a third terminal:

```bash
cd mcp-server
npm install
npm run dev
```

MCP server runs locally on:

```text
http://localhost:8080
```

Local MCP endpoint:

```text
http://localhost:8080/mcp
```
---
## Environment Variables
### Backend `.env`

Create a `.env` file inside the `backend` folder:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
DATABASE_NAME=brewstock
```
### MCP Server Environment Variable

The MCP server uses this backend API URL:

```env
BREWSTOCK_API_BASE_URL=https://brewstock-backend-611787017892.asia-south1.run.app
```
---
## MongoDB Collections

The project uses the following MongoDB collections:

```text
brewstock
  inventory
  suppliers
  purchase_orders
```
### Inventory
Stores coffee shop stock items such as oat milk, coffee beans, cups, and syrups.
### Suppliers
Stores supplier information such as supplier name, email, lead time, and items supplied.
### Purchase Orders
Stores demo purchase orders created by the agent or app.
---
## Demo Flow
### App Flow
1. Open the frontend.
2. View current inventory.
3. Click **Check Low Stock**.
4. View recommended order items.
5. Click **Create Demo Order**.
6. Confirm the order as manager.
7. View updated order status.

### Agent Flow

1. Open Google Cloud Agent Studio preview.
2. Ask:

```text
What items do I need to order today?
```

3. Agent calls the `check_low_stock` MCP tool.
4. Agent shows real low-stock items from MongoDB.
5. Ask:

```text
Create pending demo purchase orders for all low-stock items.
```
6. Agent calls the `create_purchase_order` MCP tool.
7. Purchase orders are saved in MongoDB with `Pending Approval` status.
8. Ask:
```text
Confirm PO-1003
```
9. Agent calls the `confirm_purchase_order` MCP tool.
10. Order status changes to `Confirmed`.
---
## Safety Note

BrewStock Agent does not place real paid supplier orders.
All purchase orders are demo purchase order drafts. They remain pending until manager approval and are used only to demonstrate the workflow.
## Hackathon Alignment
This project is aligned with the Google Cloud Rapid Agent Hackathon requirements:

- Built as an agentic workflow, not just a chatbot
- Uses Gemini 3.5 Flash
- Uses Google Cloud Agent Studio
- Integrates a partner technology: MongoDB
- Uses a custom MCP server
- Uses MongoDB-backed data and actions
- Uses Google Cloud Run for backend and MCP deployment
- Solves a real-world inventory management problem for coffee shops
---
## Future Scope
- Expiry and waste alerts
- Sales-based stock deduction
- Supplier email generation
- Multi-store inventory support
- Demand forecasting based on sales history
- Role-based manager approval
- Real supplier API integration
- POS integration
- Analytics dashboard for consumption trends
- Low-stock notifications
---
## License

This project is licensed under the MIT License.
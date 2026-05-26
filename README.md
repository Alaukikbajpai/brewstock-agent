# BrewStock Agent

BrewStock Agent is an AI inventory and demo-order assistant for coffee shops.

It helps coffee shop managers check stock, detect low inventory, match items with suppliers, create demo purchase order drafts, and confirm orders only after manager approval.

## Problem

Coffee shops often manage ingredients like milk, coffee beans, cups, syrups, and packaging manually. This can lead to stockouts, delayed ordering, over-ordering, and wasted time.

## Solution

BrewStock Agent provides a simple agentic workflow:

1. Check inventory.
2. Detect low-stock items.
3. Match each item with the correct supplier.
4. Recommend order quantities.
5. Create demo purchase orders.
6. Keep orders pending until manager confirmation.

## Current MVP Features

- Inventory dashboard
- Low-stock detection
- Supplier matching
- Demo purchase order creation
- Manager confirmation flow
- Simple frontend and backend integration

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: Node.js, Express.js
- Database: Currently in-memory MVP data
- Planned Partner Integration: MongoDB Atlas + MongoDB MCP Server
- Planned Agent Layer: Gemini + Google Cloud Agent Builder

## Project Structure

```text
brewstock-agent/
  backend/
    server.js
    package.json
  frontend/
    app/
    package.json
  .gitignore
  LICENSE
  README.md
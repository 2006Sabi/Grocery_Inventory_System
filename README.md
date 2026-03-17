# Smart Grocery Inventory System Backend

Production-ready backend for local retailers to manage inventory, billing, and supply chain.

## Features
- **Product Management**: CRUD, filters, search, low-stock alerts, barcode lookup.
- **Category & Supplier**: Full management for organization and vendors.
- **Billing System**: GST-enabled invoices (5%, 12%, 18%) with automated stock deduction.
- **Auto Reorder**: Predictive restocking based on last 30 days of sales.
- **Expiry Tracking**: Dynamic priority system (EXPIRED, HIGH, MEDIUM, LOW).
- **Audit Logs**: Track every stock change with Inventory Logs.
- **Security**: JWT & Role-Based Access Control (RBAC).

## Tech Stack
- Node.js & Express.js
- MongoDB & Mongoose
- Joi (Validation)
- JWT & Bcrypt (Authentication)

## Setup
1. Install dependencies: `npm install`
2. Configure `.env` with your `MONGODB_URI` and `JWT_SECRET`.
3. Start the server: `npm start` or `npm run dev`

## API Endpoints Summary

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Products
- `GET /api/products` (with filters & pagination)
- `GET /api/products/low-stock`
- `GET /api/products/barcode/:barcode`
- `GET /api/products/expiry-priority`

### Billing
- `POST /api/billing` (Reduce stock + Create Invoice)
- `GET /api/billing/:id`

### Analytics
- `GET /api/dashboard` (Admin summary)

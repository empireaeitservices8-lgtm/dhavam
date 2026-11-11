# dhavam

Dhavam Spices - E-Commerce Platform with Admin Panel

## Project Structure
- `dhavam/dhavam-backend`: Express.js backend API with MySQL/TiDB Cloud integration.
- `dhavam/dhavam-spices`: Next.js 15 frontend application with Tailwind CSS and responsive design.

## Features
- **Customer Storefront:**
  - Product browsing by category (Whole Spices, Ground Spices, Combo Packs).
  - Multiple size variants and pricing per product.
  - Cart, Checkout, Order tracking, and Profile management.
- **Admin Panel:**
  - Secure Admin authentication (Username or Email + Strong password).
  - Add new products with image upload, categories, and size/price variants.
  - Edit existing products and images.
  - Delete products with live database sync.
  - Manage customer orders and update delivery status.

## Getting Started

### 1. Backend Setup
```bash
cd dhavam/dhavam-backend
npm install
# configure .env with DATABASE_URL, PORT=5000, JWT_SECRET
node index.js
```

### 2. Frontend Setup
```bash
cd dhavam/dhavam-spices
npm install
# configure .env.local with NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev
```

Frontend runs on `http://localhost:3000` and Backend runs on `http://localhost:5000`.

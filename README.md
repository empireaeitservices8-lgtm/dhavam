# Dhavam Spices

An all-in-one full-stack e-commerce web platform for Dhavam Spices, built with **Next.js 15 (App Router)**, **Tailwind CSS**, and **AWS TiDB Cloud** (MySQL-compatible serverless database).

---

## Architecture: Unified Single-Project

Both the frontend storefront, admin portal, and backend API routes are unified into a single project.
- **Frontend & Admin Portal:** Next.js pages with SSR/SSG and Partial Prerendering.
- **Backend APIs:** Next.js App Router API Handlers (`app/api/...`) connecting securely via SSL to AWS TiDB Cloud.
- **No separate Express backend server is required.**

---

## Features

### Customer Storefront
- Browse spices by category (Whole Spices, Spice Powders, Combo Packs).
- Dynamic pack sizes and live pricing calculations.
- Shopping cart, checkout (COD & Online options), and order tracking.
- User registration and login with JWT authentication.
- User profile management.

### Admin Portal (`/admin`)
- Secure admin login with strong password enforcement.
- Manage products:
  - Add new spices with image upload, pack sizes, and pricing.
  - Edit existing spices and update images.
  - Delete spices with instant database synchronization.
- Manage customer orders and update shipping/delivery statuses.
- View customer list and registered accounts.

---

## Admin Credentials

- **URL:** `/login` (redirects directly to `/admin`)
- **Username:** `admin` *(or Email: `dhavamspices@gmail.com`)*
- **Password:** `Admin@Dhavam2026`

---

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env.local`:
   ```env
   DATABASE_URL="mysql://3jWo1Qc52mbYVmw.root:jhI9Rm1CzmmplOdW@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/dhavam_spices?sslaccept=strict"
   JWT_SECRET="supersecretkey1234"
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploy to Vercel (1-Click)

Because this repository is a unified single project:
1. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Select this GitHub repository (`dhavam`).
3. Vercel will automatically detect **Next.js** at the root.
4. Add the following **Environment Variables**:
   - `DATABASE_URL` = `mysql://3jWo1Qc52mbYVmw.root:jhI9Rm1CzmmplOdW@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/dhavam_spices?sslaccept=strict`
   - `JWT_SECRET` = `supersecretkey1234`
5. Click **Deploy**!
   Your site (Frontend + Backend APIs + Admin Panel) will be live in ~1 minute.

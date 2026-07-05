# E-Commerce Project Tracker

This file serves as a central hub to track the progress of the E-commerce project. **Any AI assistant working on this project should read this file first** to understand what has already been accomplished and what needs to be done next.

## 🛠️ Tech Stack
* **Frontend:** Next.js (App Router), Tailwind CSS, TypeScript, Zustand (State Management), React Hook Form
* **Backend:** Laravel (API), MySQL
* **Authentication:** Token-based (handled via Zustand `authStore` on frontend)

---

## ✅ Completed Tasks

### 1. Authentication & Users
- [x] Login & Registration flow (Frontend & Backend)
- [x] Role-based access control (Admin, Staff, Customer)
- [x] Admin Profile & settings dropdown

### 2. Admin Panel Layout & UI
- [x] Responsive layout with Top Header Bar (Sticky)
- [x] Dynamic Collapsible Sidebar (LeftRail for collapsed icons, RightPanel for expanded accordion menu)
- [x] Notifications bell in Top Bar with DropdownMenu (shows 5 recent orders)
- [x] Grouped Navigation (Dashboard, Catalog, Sales, Users, Marketing, Delivery)

### 3. Product & Catalog Management
- [x] Product Detail Page with Dynamic SEO Meta Tags (OpenGraph, Title, Description)
- [x] Categories and Brands management
- [x] Shopping Cart Drawer (UI & State)
- [x] Wishlist page and dashboard

### 4. Review & Q&A System
- [x] **Backend:** Created `Review` and `QA` models, migrations, and controllers. Exposes API routes for creating and fetching reviews/QA.
- [x] **Frontend:** Integrated Review and Q&A tabs in the Product Details page.

### 5. Homepage Redesign (Amazon Style)
- [x] Implemented overlapping hero banner layout with brand color gradients (`AmazonHeroSlider`).
- [x] Created `CategoryQuadCard` to display 4 products per category in a dense grid.
- [x] Created `HorizontalProductScroll` for tightly packed product carousels (e.g., Best Sellers).
- [x] Added dynamic logic to filter out empty categories from the homepage.

### 6. SQA Bug Audit & Fixes
- [x] **Backend Security:** Fixed Fake Review Vulnerability by requiring a completed order before a user can submit a review. Reviews now default to `is_published = false`.
- [x] **Payment Security Audit:** Verified that `PaymentController::webhookSuccess` robustly checks HMAC signatures and payment state to prevent fraud.
- [x] **Module 1: Authentication & User Management Security:** 
  - Verified brute-force protection (Rate limiting) on Login/Register routes.
  - Verified strict IDOR checks on `AddressController`.
  - Patched **Session Hijacking Vulnerability** (Now revokes all other tokens when password is changed).
  - Patched **Deactivated User Bypass Vulnerability** (Now immediately revokes all tokens when an admin deactivates an account).
  - Patched **OAuth Pre-Account Takeover Vulnerability** (Unverified accounts can no longer be linked to Google logins, preventing attackers from hijacking user accounts).
  - Patched **Phone Pre-Account Takeover Vulnerability** (OTP logins now wipe passwords and revoke all existing sessions to kick out attackers who registered unverified phone numbers).
  - Fixed **Frontend Authorization Bug** (Staff accounts were incorrectly blocked from the Admin dashboard by `proxy.ts` despite having backend permissions).
  - Patched **Admin Password Reset Session Hijacking** (When an admin forcefully resets a hacked user's password, all active sessions of that user are now immediately revoked).

---

## 🚧 Current / In-Progress Tasks
- [ ] **Module 2: Product Catalog & Inventory**
  - [ ] Audit Product creation/update for Mass Assignment & XSS.
  - [ ] Audit Category & Brand management.
  - [ ] Verify Vendor scoping (Vendors should only see/edit their own products).

## Reviews & QA (in progress)
- [x] Admin Reviews page (backend adminIndex/approve/reject + frontend page) — admin-only
- [x] Nav move: Reviews+QA Catalog→Marketing (already coded, needs commit)
- [ ] Q&A admin page — POST-LAUNCH (nav hidden for now)
- [ ] Commit: reviews backend+frontend + nav move together
- [ ] Push + live smoke test

## Launch-blocking (non-code)
- [ ] Real delivery-man accounts create (admin → Users, role=delivery) — currently only 1 test user (karim)

## Post-launch backlog
- [ ] Q&A admin page
- [ ] Reviews: soft-reject (rejected_at column) instead of hard delete
- [ ] Traffic Source real analytics; Customer Growth month-selector; Export button
- [ ] 403 role-mismatch auto token-clear (frontend)
- [ ] DB password rotate

---

## 📋 Upcoming Tasks (To-Do)
*Note: These are standard e-commerce features that may need attention. The user will specify which to prioritize.*
- [ ] Order Management (Processing, Shipping, Delivered statuses)
- [ ] Delivery Zones setup & Shipping cost calculation
- [ ] Payment Gateway Integration (bKash, SSLCommerz, Stripe, etc.)
- [ ] Promotional Coupons and Discounts logic
- [ ] User/Customer management table in Admin
- [ ] Advanced Analytics & Dashboard charts

---

**AI Instruction:** Whenever you complete a new significant feature or fix a major bug, please update this `TODO.md` file accordingly so the context is never lost.

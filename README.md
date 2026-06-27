# CoreShop Dashboard

React admin dashboard for the CoreShop marketplace. Used exclusively by the admin role to manage the entire platform — stores, products, orders, users, coupons, banners, categories, and analytics.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 + TypeScript 6 |
| Routing | TanStack Router (file-based) |
| Data Fetching | TanStack Query v5 |
| Data Tables | TanStack Table v8 |
| UI Components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS v4 |
| Charts | Recharts v3 |
| Forms | react-hook-form + zod |
| State | Zustand v5 (auth only) |
| HTTP | Axios |
| Toasts | Sonner |
| Testing | Vitest + Playwright (browser tests) |

---

## Local Setup

```bash
cd shadcn-admin
pnpm install
pnpm dev
# http://localhost:5173
```

Login with: `admin@coreshop.com` / `password123`

API must be running at `http://localhost:8000` (see `coreshop-api`).

---

## Project Structure

```
src/
├── routes/                    # File-based routes (TanStack Router)
│   ├── (auth)/                # Public auth pages
│   ├── (errors)/              # Error pages (401, 403, 404, 500, 503)
│   └── _authenticated/        # All protected pages
│       ├── index.tsx          # Dashboard overview
│       ├── analytics/
│       ├── banners/
│       ├── categories/
│       ├── coupons/
│       ├── orders/
│       ├── payment/
│       ├── products/
│       ├── stores/
│       ├── users/
│       └── settings/
├── features/                  # Feature modules (UI logic per section)
│   ├── analytics/
│   ├── auth/
│   ├── banners/
│   ├── categories/
│   ├── coupons/
│   ├── dashboard/
│   ├── orders/
│   ├── payment/
│   ├── products/
│   ├── stores/
│   └── users/
├── hooks/api/                 # TanStack Query hooks (one file per domain)
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── data-table/            # Reusable table primitives
│   └── layout/                # Sidebar, header, nav
├── stores/
│   └── auth-store.ts          # Zustand — token + user
└── lib/
    ├── axios.ts               # Axios instance with auth interceptor
    └── handle-server-error.ts # Centralised API error handling
```

---

## Pages

### Dashboard Overview (`/`)
- KPI cards: total revenue, total orders, active users, active stores
- Revenue bar chart (last 6 months)
- Recent orders table (last 5)
- Analytics tabs with quick stats

### Analytics (`/analytics`)
Six live charts powered by the `/api/v1/analytics/*` endpoints:

| Chart | Data |
|---|---|
| Revenue | Revenue over time (line chart) |
| Orders | Orders over time (bar chart) |
| Orders by Status | Distribution of order statuses (pie chart) |
| Users Growth | New users over time (area chart) |
| Top Products | Best selling products by revenue (bar chart) |
| Top Sellers | Top stores ranked by sales (table) |

### Orders (`/orders`)
- Full data table with column sorting, search, status filter
- Order detail side sheet — shows client, store, items, address, timeline
- Status update dropdown — admin can move any order through all 10 statuses
- Pagination synced to URL params

### Products (`/products`)
- Data table with search, status filter (pending / approved / flagged / removed)
- Product detail side sheet — shows images, variants, store info
- Status update: approve, flag, or remove a product
- Pagination synced to URL params

### Users (`/users`)
- Data table with search, role filter, bulk selection
- Per-row actions: edit, ban/unban, delete
- Bulk delete selected users
- Ban dialog with confirmation

### Coupons (`/coupons`)
- Data table listing all coupons with usage stats
- Create / edit dialog — type (percentage or fixed), value, min order, expiry, max uses
- Delete with confirmation

### Banners (`/banners`)
- List of home screen carousel banners
- Create / edit dialog with image upload
- Toggle active/inactive per banner
- Reorder via drag (sort_order)
- Delete with confirmation

### Categories (`/categories`)
- Tree view of categories with parent/child structure
- Create / edit — bilingual name (English + Arabic), image upload, sort order, active toggle
- Delete category

### Stores (`/stores`)
- List of all stores with status badges (pending / active / suspended / closed)
- Store detail page (`/stores/:storeId`) — banner, logo, info, stats
- Store's orders list
- Store's products list
- Status update: approve or suspend a store

### Payment Settings (`/payment`)
- View and update the platform fee percentage applied to every order

### Settings (`/settings`)
Admin account settings split into sub-sections:
- **Profile** — name, bio, URLs
- **Account** — email, username, language preference
- **Appearance** — theme (light / dark / system), font
- **Notifications** — notification preferences
- **Display** — sidebar items visibility

---

## API Hooks (`src/hooks/api/`)

Each file wraps TanStack Query mutations and queries for one domain:

| Hook file | Covers |
|---|---|
| `use-auth.ts` | Login, logout, current user |
| `use-analytics.ts` | All 6 analytics endpoints |
| `use-orders.ts` | List, detail, status update |
| `use-products.ts` | List, detail, status update |
| `use-users.ts` | List, update, ban, delete |
| `use-coupons.ts` | List, create, update, delete |
| `use-banners.ts` | List, create, update, delete, toggle, reorder |
| `use-categories-admin.ts` | List, create, update, delete |
| `use-stores.ts` | List, detail, orders, products, status update |
| `use-settings.ts` | Get and update payment settings |
| `use-admin-upload.ts` | Image upload for banners and categories |

---

## Data Tables

Built on TanStack Table with a shared set of primitives in `src/components/data-table/`:

| Component | Purpose |
|---|---|
| `toolbar.tsx` | Search input + faceted filters + view options |
| `column-header.tsx` | Sortable column headers |
| `faceted-filter.tsx` | Multi-select filter dropdown |
| `pagination.tsx` | Page size selector + prev/next |
| `view-options.tsx` | Show/hide columns dropdown |
| `bulk-actions.tsx` | Actions bar that appears on row selection |

All table state (page, pageSize, sort, filters) is synced to URL search params via `use-table-url-state.ts` — shareable and browser-back-button safe.

---

## Auth

- Token stored in a cookie via `src/lib/cookies.ts`
- Zustand `auth-store.ts` holds the current user and token in memory
- Axios interceptor in `src/lib/axios.ts` attaches `Authorization: Bearer <token>` to every request and redirects to `/sign-in` on 401
- TanStack Router `_authenticated` route layout guards all protected pages — redirects to sign-in if no token

---

## Reusable Components

| Component | Purpose |
|---|---|
| `confirm-dialog.tsx` | Generic "Are you sure?" modal used across all delete actions |
| `command-menu.tsx` | `⌘K` global search/command palette |
| `password-input.tsx` | Input with show/hide toggle |
| `long-text.tsx` | Truncated text with expand/collapse |
| `theme-switch.tsx` | Light / dark / system toggle |
| `profile-dropdown.tsx` | Top-right user menu |
| `navigation-progress.tsx` | Top loading bar on route transitions |
| `date-picker.tsx` | Calendar date picker (react-day-picker) |
| `select-dropdown.tsx` | Reusable controlled select |

---

## Running Tests

```bash
# Install Playwright browsers (first time only)
pnpm test:browser:install

# Run all tests headlessly
pnpm test

# Run with UI
pnpm test:ui

# Watch mode
pnpm test:watch
```

Tests use Vitest + Playwright browser environment. Test files live alongside the components they test (`*.test.tsx`).

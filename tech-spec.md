# WhiteMeatShop - Technical Specification

## Dependencies

### Production
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.0.0 | UI framework |
| react-dom | ^19.0.0 | React DOM renderer |
| react-router-dom | ^7.0.0 | SPA client-side routing (6 pages) |
| dexie | ^4.0.0 | IndexedDB wrapper for local data persistence |
| dexie-react-hooks | ^4.0.0 | React hooks for Dexie (live queries) |
| framer-motion | ^12.0.0 | Page transitions, entrance animations, expand/collapse |
| @fontsource/inter | ^5.0.0 | Inter font (headings + body) |
| @fontsource/roboto-mono | ^5.0.0 | Monospace font for receipts/invoice numbers |
| @fontsource/material-icons | ^5.0.0 | Material Icons (nav + action icons) |

### Development
| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^6.0.0 | Build tool / dev server |
| @vitejs/plugin-react | ^4.0.0 | React support for Vite |
| typescript | ^5.6.0 | Type safety |
| @types/react | ^19.0.0 | React type definitions |
| @types/react-dom | ^19.0.0 | React DOM type definitions |
| tailwindcss | ^4.0.0 | Utility-first CSS |
| @tailwindcss/vite | ^4.0.0 | Tailwind Vite plugin |
| vite-plugin-pwa | ^0.21.0 | PWA manifest + service worker generation |

---

## Component Inventory

### Layout
| Component | Source | Notes |
|-----------|--------|-------|
| GlassmorphismNav | Custom | Fixed bottom nav bar, 6 icon buttons with labels, active state with sliding underline. Pill shape desktop, full-width mobile. |
| PageLayout | Custom | Wrapper for all content pages: applies fade-in entrance animation, scroll-to-top on mount, consistent padding. |

### Sections (page-specific)
| Component | Page | Notes |
|-----------|------|-------|
| Chicken3DScene | Dashboard | The hero 3D CSS scene. Contains ChickenBody, StarburstRing, and mouse-tracking logic. |
| StatsBar | Dashboard | 4 summary stat cards row. |
| QuickActions | Dashboard | 3 action buttons row. |
| InventoryHeader | Inventory | Page header with "Add Product" button. |
| ProductGrid | Inventory | Search bar + responsive grid of ProductCard. |
| ProductModal | Inventory | Add/Edit product form modal. |
| SalesHeader | Sales | Page header with "New Sale" button. |
| NewSaleForm | Sales | Expandable sale form with product selection table, payment toggle, totals. |
| SalesList | Sales | Search bar + list of SaleRecordCard. |
| ReceiptPreview | Sales | Print-optimized receipt view triggered by modal or print dialog. |
| CreditHeader | Credit | Page header with "Add Customer" button. |
| CreditCustomerList | Credit | Search bar + accordion list of CreditCustomerCard. |
| CustomerModal | Credit | Add/Edit customer form modal. |
| PaymentModal | Credit | Record payment form against a customer. |
| LedgerHeader | Ledger | Page header with "Add Entry" button. |
| LedgerFilters | Ledger | Date range, type filter, search controls. |
| LedgerTable | Ledger | Desktop table + mobile card view of entries. |
| LedgerEntryModal | Ledger | Add manual ledger entry form. |
| SettingsCategories | Settings | Accordion list of settings cards. |
| AppInfoFooter | Settings | Version info + PWA install prompt. |

### Reusable Components
| Component | Source | Used By | Notes |
|-----------|--------|---------|-------|
| DataCard | Custom | All pages (stats, lists) | White card with border, shadow, hover lift. Configurable accent border color. |
| MiniStatCard | Custom | Dashboard, Inventory, Sales, Credit, Ledger | Compact icon + value + label card. Colored icon circle. |
| ProductCard | Custom | Inventory | Product info card with image placeholder, stock indicator, margin display, edit/delete actions. |
| SaleRecordCard | Custom | Sales | Sale summary with invoice #, date, payment badge, amount, action buttons. |
| CreditCustomerCard | Custom | Credit | Accordion card: collapsed shows customer + balance, expanded shows payment history table. |
| LedgerEntryRow | Custom | Ledger | Table row with date, ref, description, type badge, amounts, running balance. |
| Modal | Custom | All pages | Overlay with backdrop blur, centered dialog, fade+scale entrance, close button. |
| FormInput | Custom | All modals/forms | Styled input with focus ring, optional icon prefix, label. |
| FormSelect | Custom | All modals/forms | Styled select dropdown with options. |
| FormTextarea | Custom | All modals/forms | Styled textarea with auto-resize. |
| ToggleButton | Custom | Sales, Settings | Two-option toggle (Cash/Credit, On/Off). Pill shape, active color. |
| IconButton | Custom | All pages | Small circular button with Material Icon. Hover color change. |
| EmptyState | Custom | All list pages | Message + icon when no data exists. |
| Toast | Custom | All pages | Brief success/error notification, auto-dismiss 3s. |

### 3D Components (Dashboard-specific)
| Component | Source | Notes |
|-----------|--------|-------|
| Chicken3DScene | Custom | Main container: 800px centered, perspective 1000px, parallax tilt on hover. |
| ChickenBody | Custom | All CSS-constructed parts: Body, Head, Wings, Legs, Eye, Beak, Comb, Tail. Uses CSS border-radius for shapes. |
| StarburstRing | Custom | 640px container, preserve-3d, 30s rotation animation. Holds 8 ProductStarCard children. |
| ProductStarCard | Custom | 150x180px orange card, positioned radially with rotateY+translateZ, counter-rotated to face outward. |
| HotAirWisp | Custom | SVG animated path with stroke-dasharray/dashoffset for rising steam effect. |

---

## Animation Implementation

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| Chicken idle bounce | CSS @keyframes | translateY oscillation, 2s infinite alternate, cubic-bezier overshoot | Low |
| Chicken wink on click | Framer Motion | animate scaleY [1, 0.1, 1] over 200ms, triggered by onClick | Low |
| Eye mouse tracking | Custom (rAF) | mousemove listener → atan2 angle + hypot distance → lerp at 0.15 factor per frame for pupil translateX/Y. Clamp to max radius. | Medium |
| Parallax tilt | CSS :hover + JS | mousemove calculates tiltX/tiltY (±5deg max), applied as rotateX/rotateY on container. CSS transition 0.1s ease-out for smooth return. | Low |
| Starburst rotation | CSS @keyframes | 360deg rotateY over 30s linear infinite on ring container. Cards counter-rotate. | Low |
| Card float | CSS @keyframes | Subtle translateZ oscillation per card, 3s ease-in-out infinite alternate, staggered delays. | Low |
| 3D scene entrance | Framer Motion | Chicken: scale 0→1 with spring bounce. Ring: opacity 0→1. Cards: staggered scale 0.5→1. Orchestrated with delays. | Medium |
| Page transitions | Framer Motion | AnimatePresence wrapper on route outlet. Exit: opacity 0 (0.2s). Enter: opacity 0→1 (0.3s). | Low |
| Nav active underline | Framer Motion | layoutId shared across nav items, Framer Motion automatically interpolates position. | Low |
| Stat card entrance | Framer Motion | staggerChildren 0.1s, each child: y 20→0 + opacity 0→1, duration 0.4s. Triggered by viewport or mount. | Low |
| Product card stagger | Framer Motion | staggerChildren 0.08s, scale 0.5→1 + opacity. | Low |
| Form expand/collapse | Framer Motion | AnimatePresence + animate height "auto" (0.3s ease). Chevvron rotate 0→180deg. | Low |
| Modal entrance | Framer Motion | Backdrop: opacity 0→0.5. Dialog: scale 0.95→1 + opacity 0→1, 0.2s. | Low |
| Overdue badge pulse | CSS @keyframes | opacity 0.7↔1.0, 1.5s infinite. | Low |
| Toast notification | Framer Motion | Slide in from top-right, auto-dismiss after 3s. | Low |
| Card hover effects | CSS transitions | transform scale(1.02), box-shadow increase, 0.2s ease. Pure CSS. | Low |

---

## State & Logic Plan

### Data Layer (Dexie.js)

Single Dexie database `whiteMeatShopDB` with 5 stores:

| Store | Primary Key | Indexes | Data |
|-------|-------------|---------|------|
| products | `id` (auto-UUID) | name, category, stockQuantity | Product catalog |
| sales | `id` (auto-increment) | customerName, paymentType, createdAt | Sale transactions |
| creditCustomers | `id` (auto-UUID) | name, currentBalance, lastPaymentDate | Credit customer accounts |
| payments | `id` (auto-UUID) | customerId, date | Payment records against credit |
| ledger | `id` (auto-UUID) | date, type, isIncome | Financial ledger entries |
| settings | `id` (fixed: "app") | — | Singleton settings record |

### Data Flow Architecture

**Custom Hooks (data access layer):**
- `useProducts()` — CRUD operations for products. Returns live query array + add/update/delete functions.
- `useSales()` — CRUD + search/filter for sales. Returns sales list + createSale function.
- `useCreditCustomers()` — CRUD + payment recording. Returns customers + addPayment function.
- `useLedger()` — CRUD + date range filter + running balance calculation. Returns entries + balance stats.
- `useSettings()` — Singleton settings read/write. Returns settings + update function.
- `useStats()` — Aggregated dashboard stats: daily sales, outstanding credit, low stock count, total products. Computed from other stores.

**Auto-calculation logic:**
- Product margin: computed inline from buyingPrice/sellingPrice.
- Sale totals: computed from line items (qty × price).
- Credit balance: `totalPurchases - totalPayments`, updated reactively when payments are recorded.
- Ledger running balance: calculated in hook by iterating entries in date order.
- Dashboard stats: derived from store aggregations in useStats hook.

**Auto-generated entries:**
- On sale creation: auto-insert income ledger entry.
- On credit payment: auto-insert income ledger entry + update customer balance.
- On product purchase (restocking): auto-insert expense ledger entry.

### State Management Approach

No global state library needed. Pattern:
- **Dexie as source of truth**: All persistent data lives in IndexedDB.
- **Dexie React Hooks**: `useLiveQuery()` provides reactive updates — components re-render when DB changes.
- **Local component state**: Form inputs, modal open/close, expand/collapse, search text — use useState.
- **URL state**: Current page via React Router. No query params needed.
- **Cross-page data**: Handled by Dexie reactivity. e.g., recording a sale on Sales page automatically updates Dashboard stats because both use live queries on the same store.

### PWA / Service Worker

- `vite-plugin-pwa` handles manifest.json generation and service worker (Workbox).
- Manifest: name "WhiteMeatShop", display "standalone", theme_color "#FF5A00", background_color "#001233".
- Icons: generated from logo asset at 192x192 and 512x512.
- Caching strategy: App shell cached for offline use. Data is already local (IndexedDB) so no network caching needed for data.

### Print System

- Receipt component uses `@media print` CSS: hides all app chrome (nav, headers, buttons), shows only receipt.
- Receipt width: 80mm (thermal) via CSS max-width and page size hints.
- Trigger: `window.print()` opens browser print dialog.
- Format: Monospace font (Roboto Mono), ASCII-art style borders, thermal printer optimized.

---

## Other Key Decisions

### Routing
- 6 routes: `/` (Dashboard), `/inventory`, `/sales`, `/ledger`, `/credit`, `/settings`.
- React Router v7 with BrowserRouter.
- Dashboard (3D scene) is the only page with dark background; all others use white.

### No shadcn/ui
- The app has a highly custom glassmorphism/3D aesthetic. Standard UI primitives don't match the design language.
- All form components (inputs, selects, toggles) are custom-styled with Tailwind to match the orange/white/glass theme.

### Chicken Rendering: Pure CSS (not Three.js)
- The chicken is built from HTML divs with CSS border-radius and 3D transforms. No WebGL/Three.js needed.
- Rationale: The chicken is constructed from simple geometric shapes (ovals, triangles, circles) that CSS handles perfectly. Three.js would be overkill and adds significant bundle size.
- The 3D effect comes from `transform-style: preserve-3d`, `perspective`, and `rotateY/rotateX/translateZ` — all CSS.

### Responsive Breakpoints
- Desktop: ≥1024px (full 3D scene, 3-col grids, horizontal layouts)
- Tablet: 768–1023px (scaled 3D scene, 2-col grids)
- Mobile: <768px (mini 3D scene, 1-col, stacked layouts, bottom nav)

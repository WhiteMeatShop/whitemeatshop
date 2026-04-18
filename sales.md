# Page: Sales

The Sales page is where all sales transactions are recorded. Users can create new sales by selecting products, specifying quantities, choosing payment type (Cash or Credit), and printing receipts. The page shows a list of recent sales transactions and provides a quick-sale form optimized for fast checkout.

## Page Layout

```
- Section: Page Header
  - Title: "Sales"
  - Subtitle: "Record sales and print receipts"
  - Action Button: "New Sale" (top-right)
- Section: Sales Stats Row
  - 3 mini stat cards (Today's Sales, Transactions, Avg. Sale)
- Section: New Sale Form (expanded when active)
  - Customer info, Product selection, Payment type, Totals
- Section: Recent Sales List
  - Search/filter bar
  - Sale record cards (reverse chronological)
- Section: Receipt Preview Modal (print overlay)
  - Thermal receipt formatted view
- Navigation: Glassmorphism Nav Bar (fixed bottom)
```

## Background
- #FFFFFF (white)

## Section: Page Header

### Layout
- Padding: 40px horizontal, 32px top
- Flex row: Title group left, action button right

### Elements

#### Title
- Text: "Sales"
- Font: H1 (48px desktop / 32px mobile), weight 400, color #000000

#### Subtitle
- Text: "Record sales and print receipts"
- Font: 16px, weight 400, color #858585

#### New Sale Button
- Style: Action Button (Orange) with "add_circle" icon
- Label: "New Sale"
- Action: Expands/collapses the New Sale form section
- Active state: Button background changes to #E65000 when form is open

## Section: Sales Stats Row

### Layout
- Padding: 0 40px
- 3 mini cards in a row (stacked on mobile)
- Gap: 16px

### Mini Stat Cards

#### Today's Sales
- Icon: "point_of_sale", background #FF5A00, white icon
- Value: Dynamic (e.g., "$1,250.00")
- Label: "Today's Sales"

#### Transactions
- Icon: "receipt", background #FF9E00, white icon
- Value: Dynamic count (e.g., "15")
- Label: "Transactions"

#### Average Sale
- Icon: "trending_up", background #34C759, white icon
- Value: Dynamic (e.g., "$83.33")
- Label: "Average Sale"

## Section: New Sale Form

### Overview
An expandable form section that appears below the stats when "New Sale" is clicked. Designed for fast data entry with keyboard-friendly navigation.

### Layout
- Background: #F8F8F8 (subtle gray to distinguish from page)
- Border-radius: 16px
- Margin: 24px 40px
- Padding: 32px
- Collapsed height: 0 (hidden)
- Expanded: Auto height with slide-down animation (0.3s ease)

### Form Structure

#### Customer Name Input
- Form Input component
- Label: "Customer Name"
- Placeholder: "Enter customer name or 'Walk-in'"
- Default value: "Walk-in Customer"
- Autocomplete: Shows previous customer names from dropdown

#### Customer Type Toggle
- Two-option toggle: "Standard" | "Hotel/Restaurant"
- Default: "Standard"
- Style: Pill toggle with orange active state
- Hotel/Restaurant customers get credit option enabled

#### Product Selection Area
- **Search/Add Product Row**:
  - Search input with "search" icon
  - Placeholder: "Search products..."
  - Dropdown shows matching products with price and stock
  - Clicking a product adds it to the sale items list

- **Sale Items Table**:
  - Header row: Product | Qty | Unit Price | Total | Action
  - Each added product becomes a row:
    - Product name (read-only)
    - Qty input (number, step 0.5 for KG, 1 for pieces)
    - Unit price (editable, defaults to selling price)
    - Total (auto-calculated: qty × unit price)
    - Delete button ("delete" icon)
  - Empty state: "Add products to the sale using the search above"

#### Payment Type
- Two large toggle buttons:
  - **Cash/Pay Now**: Green (#34C759) when selected
  - **Credit**: Orange (#FF5A00) when selected
- Default: Cash
- Credit option only available when Customer Type is "Hotel/Restaurant"
- When Credit is selected, show "Credit Period" input (days, default 30)

#### Totals Section
- Position: Right-aligned, sticky at bottom of form
- Subtotal: Sum of all line totals
- Displayed prominently in H2 size (28px)
- Format: "$XXX.XX"

#### Form Actions
- **Cancel**: Glassmorphism Button, clears form and collapses
- **Record Sale**: Action Button (Orange), validates and saves
- **Record & Print**: Action Button (Orange) with "print" icon, saves then opens print dialog

### Validation
- At least one product must be added
- All quantities must be > 0
- Unit price must be > 0
- For credit sales: Customer name must not be "Walk-in Customer"

## Section: Recent Sales List

### Layout
- Padding: 24px 40px 120px
- Search bar at top
- List of sale record cards, newest first

### Search Bar
- Form Input with "search" icon
- Placeholder: "Search by customer name or date..."
- Filters sales in real-time

### Sale Record Card

Each sale is shown as a Data Card with summary info.

#### Card Structure
```
- Card Container
  - Top Row:
    - Left: 
      - Invoice #: "#INV-00123" (monospace font, #FF5A00)
      - Date: "Apr 17, 2026, 2:30 PM"
    - Right:
      - Payment badge: "CASH" (green pill) or "CREDIT" (orange pill)
      - Amount: "$125.00" (18px, bold)
  - Middle Row:
    - Customer: "Ahmed Restaurant"
    - Items summary: "3 items - Whole Chicken x2KG, Boneless x1KG, Wings x5pcs"
  - Bottom Row:
    - Action buttons:
      - "View" (visibility icon)
      - "Print" (print icon) 
      - "Delete" (delete icon, only for today's sales)
```

#### Payment Badge
- Cash: Background #34C759, white text, pill shape
- Credit: Background #FF5A00, white text, pill shape

### Sale Detail Modal
- Trigger: Click "View" on any sale card
- Shows full sale details:
  - Invoice header with shop name and details
  - Customer information
  - Itemized list with quantities and prices
  - Totals
  - Payment information
  - Close button

## Receipt Preview / Print

### Trigger
- Click "Print" on a sale card
- Or click "Record & Print" when creating a sale

### Receipt Format
Uses the Receipt / Invoice Print View component.

#### Thermal Receipt (80mm)
```
╔══════════════════╗
║   WhiteMeatShop  ║
║  Fresh Chicken   ║
╠══════════════════╣
Date: 17/04/2026
Time: 14:30
Invoice: #INV-00123
Customer: Ahmed
Type: Hotel
──────────────────
ITEM          QTY  PRICE  TOTAL
Whole Chicken 2.0  $7.50  $15.00
Boneless      1.0  $8.00  $8.00
Wings         5.0  $2.00  $10.00
──────────────────
SUBTOTAL           $33.00
──────────────────
TOTAL              $33.00
Paid By: CASH
──────────────────
  Thank You!
  Visit Again
╚══════════════════╝
```

#### Print Behavior
- Opens browser print dialog
- `@media print` CSS hides all app chrome
- Receipt is formatted for 80mm thermal paper
- Print completes, dialog returns to app

## Entrance Animations
- Header fades in + slides down (0.3s)
- Stats cards stagger in (0.1s each)
- Sale cards stagger in from bottom (0.08s stagger)

## Data Model

### Sale Object
```typescript
interface Sale {
  id: string;              // Invoice number (e.g., "INV-00123")
  customerName: string;
  customerType: 'standard' | 'hotel';
  items: SaleItem[];
  subtotal: number;
  paymentType: 'cash' | 'credit';
  creditDays?: number;      // Only for credit sales
  isPaid: boolean;          // False for credit until paid
  createdAt: Date;
}

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitType: 'kg' | 'pieces';
  unitPrice: number;
  total: number;
}
```

## Assets
- No new image assets needed
- Receipt template uses Roboto Mono font

## Transitions

**→ Inventory**
- Trigger: Click "Inventory" nav item
- Current page fades out, Inventory page fades in

**→ Credit**
- Trigger: Click "Credit" nav item
- When a credit sale is recorded, the customer's outstanding balance updates automatically

**→ Dashboard**
- Trigger: Click "Home" nav item
- Current page fades out, Dashboard with 3D scene fades in

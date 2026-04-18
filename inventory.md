# Page: Inventory

The Inventory page provides full CRUD (Create, Read, Update, Delete) management for all meat products. Users can add new products, edit existing ones, view stock levels, and see profit margins at a glance. The page has a clean white background with data cards and a prominent "Add Product" action.

## Page Layout

```
- Section: Page Header
  - Title: "Inventory"
  - Subtitle: "Manage your products, stock, and pricing"
  - Action Button: "Add Product" (top-right)
- Section: Product Stats Row
  - 3 mini stat cards (Total Products, Low Stock, Total Value)
- Section: Product Grid
  - Search/Filter bar
  - Product cards grid (responsive: 3 cols desktop, 2 tablet, 1 mobile)
- Section: Add/Edit Product Modal (overlay)
  - Form with all product fields
- Navigation: Glassmorphism Nav Bar (fixed bottom)
```

## Background
- #FFFFFF (white), consistent with all content pages

## Section: Page Header

### Layout
- Padding: 40px horizontal, 32px top
- Flex row: Title group left, action button right

### Elements

#### Title
- Text: "Inventory"
- Font: H1 (48px desktop / 32px mobile), weight 400, color #000000

#### Subtitle
- Text: "Manage your products, stock, and pricing"
- Font: 16px, weight 400, color #858585
- Margin-top: 8px

#### Add Product Button
- Position: Top-right of header
- Style: Action Button (Orange) with "add_circle" icon
- Label: "Add Product"
- Action: Opens Add Product modal

## Section: Product Stats Row

### Layout
- Padding: 0 40px
- 3 mini cards in a row on desktop (stacked on mobile)
- Gap: 16px

### Mini Stat Cards
Each card is a compact Data Card with icon + number + label.

#### Total Products
- Icon: "inventory_2", background #FF5A10, color white
- Value: Dynamic count (e.g., "12")
- Label: "Products"

#### Low Stock
- Icon: "warning", background #FF3B30, color white
- Value: Dynamic count (e.g., "3")
- Label: "Low Stock"

#### Inventory Value
- Icon: "trending_up", background #34C759, color white
- Value: Dynamic calculation (e.g., "$5,200")
- Label: "Total Value"

## Section: Product Grid

### Layout
- Padding: 24px 40px 120px
- Search bar at top
- Grid: 3 columns desktop, 2 tablet, 1 mobile
- Gap: 24px

### Search/Filter Bar
- Full-width Form Input with "search" icon prefix
- Placeholder: "Search products..."
- Filters in real-time as user types
- Height: 48px

### Product Card

Each product is displayed as a Product / Ledger Entry Card component.

#### Card Structure
```
- Card Container (Data Card style)
  - Top Row:
    - Left: Product image placeholder (80x80px, rounded 12px, orange bg with chicken icon)
    - Center: Product info
      - Name: "Whole Chicken" (18px, bold)
      - Unit: "per KG" (14px, gray)
      - Stock indicator: Green/Red dot + "In Stock: 25 KG"
    - Right: Action buttons (edit + delete icons)
  - Divider: 1px solid #CECECE
  - Bottom Row:
    - Left column: "Buying: $5.00" (14px)
    - Center column: "Selling: $7.50" (14px)
    - Right column: "Margin: 50%" (14px, green if positive)
```

#### Stock Indicator
- Green dot (#34C759): Stock > 5 units
- Red dot (#FF3B30): Stock ≤ 5 units (low stock alert)
- Text: "In Stock: X KG" or "In Stock: X Pieces"

#### Action Buttons
- **Edit**: "edit" icon button, gray, hover orange
- **Delete**: "delete" icon button, gray, hover red
- Position: Top-right of card

## Add/Edit Product Modal

### Modal Trigger
- Click "Add Product" button (new product)
- Click "Edit" icon on any product card (edit existing)

### Modal Content

#### Header
- Title: "Add Product" or "Edit Product"
- Close button: "close" icon, top-right

#### Form Fields
All fields use the Form Input component.

| Field | Type | Placeholder | Required |
|-------|------|-------------|----------|
| Product Name | Text | "e.g., Whole Chicken" | Yes |
| Category | Select | "Select category" | Yes |
| Unit Type | Select | "KG or Pieces" | Yes |
| Buying Price | Number | "0.00" | Yes |
| Selling Price | Number | "0.00" | Yes |
| Stock Quantity | Number | "0" | Yes |
| Description | Textarea | "Optional description" | No |

#### Category Options
- Whole Chicken
- Boneless
- Kaleji / Pota
- Karahi Cut
- Wings
- Legs
- Breast
- Mince
- Other

#### Form Actions
- **Cancel**: Glassmorphism Button, closes modal
- **Save**: Action Button (Orange), validates and saves to IndexedDB
- **Delete** (edit mode only): Text button in red, shows confirmation dialog

### Validation
- All required fields must be filled
- Buying Price must be ≤ Selling Price (warning if not)
- Stock Quantity must be ≥ 0
- Error messages shown below each invalid field in red (#FF3B30)

## Entrance Animations
- Header fades in + slides down (0.3s)
- Stat cards stagger in (0.1s each, 0.2s delay)
- Product cards stagger in with scale (0.5 to 1.0, 0.08s stagger)

## Interactions

### Search Filtering
- Trigger: Typing in search bar
- Effect: Products filter in real-time by name match
- No results: Show empty state message "No products found"

### Product Card Hover
- Scale: 1.02
- Box-shadow increases
- Transition: 0.2s ease

### Edit Product
- Trigger: Click "edit" icon
- Modal opens with pre-filled form data
- Save updates product in IndexedDB

### Delete Product
- Trigger: Click "delete" icon
- Confirmation dialog: "Are you sure? This cannot be undone."
- Options: "Cancel" (close dialog) or "Delete" (remove from IndexedDB)

## Data Model

### Product Object
```typescript
interface Product {
  id: string;           // Auto-generated UUID
  name: string;         // Product name
  category: string;     // Category from dropdown
  unitType: 'kg' | 'pieces';
  buyingPrice: number;  // Cost price
  sellingPrice: number; // Sale price
  stockQuantity: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Auto-Calculated Fields
- **Margin %**: `((sellingPrice - buyingPrice) / buyingPrice * 100).toFixed(1)`
- **Stock Value**: `buyingPrice * stockQuantity`
- **Low Stock Alert**: `stockQuantity <= 5`

## Assets
- No new assets needed. Uses shared product images from Dashboard starburst cards.

## Transitions

**→ Sales**
- Trigger: Click "Sales" nav item
- Current page fades out, Sales page fades in

**→ Credit**
- Trigger: Click "Credit" nav item
- Current page fades out, Credit page fades in

**→ Dashboard**
- Trigger: Click "Home" nav item
- Current page fades out, Dashboard with 3D scene fades in

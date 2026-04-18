# Page: Settings

The Settings page allows users to configure the app, manage data, and customize preferences. It includes shop information, receipt customization, data backup/restore, and app preferences. All settings are stored in IndexedDB and persist across sessions.

## Page Layout

```
- Section: Page Header
  - Title: "Settings"
  - Subtitle: "Configure your app preferences"
- Section: Settings Categories (accordion-style cards)
  - Shop Information
  - Receipt Settings
  - Data Management
  - App Preferences
- Section: App Info Footer
  - Version number, PWA install prompt
- Navigation: Glassmorphism Nav Bar (fixed bottom)
```

## Background
- #FFFFFF (white)

## Section: Page Header

### Layout
- Padding: 40px horizontal, 32px top

### Elements

#### Title
- Text: "Settings"
- Font: H1 (48px desktop / 32px mobile), weight 400, color #000000

#### Subtitle
- Text: "Configure your app preferences"
- Font: 16px, weight 400, color #858585

## Section: Settings Categories

### Layout
- Padding: 24px 40px 120px
- Stacked accordion cards
- Gap: 16px between cards

### Settings Card (Accordion)

Each category is an expandable card using the Data Card component.

```
- Card Container (Data Card)
  - Header Row (click to expand/collapse):
    - Left: Icon (24px, orange) + Category Name (18px, bold)
    - Right: Expand/collapse chevron icon
  - Content (expandable):
    - Form fields for that category
    - Save button at bottom
```

#### Animation
- Expand: Height auto (0.3s ease), chevron rotates 180deg
- Collapse: Height 0 (0.3s ease), chevron returns

---

### Category 1: Shop Information

**Icon**: "store"
**Fields**:

| Field | Type | Placeholder | Description |
|-------|------|-------------|-------------|
| Shop Name | Text | "WhiteMeatShop" | Displayed on receipts |
| Shop Slogan | Text | "Fresh Chicken Daily" | Optional tagline |
| Address | Textarea | "Shop address" | Printed on receipts |
| Phone | Tel | "Contact number" | Printed on receipts |
| Email | Email | "email@example.com" | Optional |
| Tax Number | Text | "GST/Tax ID" | If applicable |

**Actions**:
- Save: Action Button (Orange)

---

### Category 2: Receipt Settings

**Icon**: "receipt"
**Fields**:

| Field | Type | Options | Description |
|-------|------|---------|-------------|
| Receipt Width | Select | 58mm, 80mm, A4 | Paper size for printing |
| Show Logo | Toggle | On/Off | Display logo on receipt |
| Show Tax | Toggle | On/Off | Show tax breakdown |
| Tax Rate | Number | "0%" | Default tax percentage |
| Receipt Footer | Textarea | "Thank you! Visit Again." | Custom footer message |
| Invoice Prefix | Text | "INV-" | Prefix for invoice numbers |
| Next Invoice # | Number | "1" | Auto-incrementing counter |

**Actions**:
- Save: Action Button (Orange)
- Preview Receipt: Glassmorphism Button (shows sample receipt)

---

### Category 3: Data Management

**Icon**: "storage"
**Content**:

#### Data Stats
- Total Products: X
- Total Sales: X
- Total Ledger Entries: X
- Total Credit Customers: X
- Database Size: X MB

#### Actions (as buttons in a list)

| Button | Icon | Description | Confirmation |
|--------|------|-------------|--------------|
| Export All Data | "download" | Download JSON backup of all data | Yes - "This will download a backup file" |
| Import Data | "upload" | Restore from JSON backup file | Yes - "This will overwrite existing data" |
| Clear All Sales | "delete" | Delete all sales history | Yes - "This cannot be undone!" |
| Clear All Data | "delete_forever" | Reset entire database | Yes - "This will delete EVERYTHING!" |

**Button Styles**:
- Export/Import: Glassmorphism Button
- Clear actions: Red text button (#FF3B30) with extra confirmation

---

### Category 4: App Preferences

**Icon**: "tune"
**Fields**:

| Field | Type | Options | Description |
|-------|------|---------|-------------|
| Currency Symbol | Select | $, €, £, ₨, etc. | Default: $ |
| Date Format | Select | DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD | Default: DD/MM/YYYY |
| Low Stock Threshold | Number | "5" | Alert when stock below this |
| Theme | Select | Light, Dark, Auto | Default: Light |
| Sound Effects | Toggle | On/Off | UI sounds (chicken cluck on wink) |
| Animations | Toggle | On/Off | Enable/disable animations |

**Actions**:
- Save: Action Button (Orange)
- Reset to Defaults: Text button in gray

---

## Section: App Info Footer

### Layout
- Padding: 40px
- Centered text
- Border-top: 1px solid #CECECE

### Content
- App Name: "WhiteMeatShop"
- Version: "v1.0.0"
- Built with: "React + IndexedDB + PWA"
- PWA Install Status:
  - If installed: "App is installed" with check icon
  - If not installed: "Install App" button (Glassmorphism Button)
- Copyright: "© 2026 WhiteMeatShop"

### PWA Install Button
- Only shown if app is not yet installed
- Clicking triggers browser's install prompt
- After install, button changes to "Installed" with check icon

## Entrance Animations
- Header fades in + slides down (0.3s)
- Settings cards stagger in from bottom (0.1s stagger)

## Data Model

### Settings Object
```typescript
interface AppSettings {
  // Shop Info
  shopName: string;
  shopSlogan?: string;
  shopAddress?: string;
  shopPhone?: string;
  shopEmail?: string;
  taxNumber?: string;

  // Receipt Settings
  receiptWidth: '58mm' | '80mm' | 'A4';
  showLogo: boolean;
  showTax: boolean;
  taxRate: number;
  receiptFooter: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;

  // App Preferences
  currencySymbol: string;
  dateFormat: string;
  lowStockThreshold: number;
  theme: 'light' | 'dark' | 'auto';
  soundEffects: boolean;
  animations: boolean;
}
```

## Assets
- No new image assets needed

## Transitions

**→ Dashboard**
- Trigger: Click "Home" nav item
- Current page fades out, Dashboard with 3D scene fades in

**→ Inventory**
- Trigger: Click "Inventory" nav item
- Current page fades out, Inventory page fades in

**→ Any Page**
- All other nav items trigger standard page fade transitions

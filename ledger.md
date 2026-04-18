# Page: Ledger

The Ledger page provides a chronological record of all financial transactions in the business. It serves as the "books" of the shop, recording every sale, purchase, payment, and expense. Users can add manual ledger entries, view running balances, and filter by date range or transaction type.

## Page Layout

```
- Section: Page Header
  - Title: "Ledger"
  - Subtitle: "Financial records and transaction history"
  - Action Button: "Add Entry" (top-right)
- Section: Ledger Stats Row
  - 4 mini stat cards (Opening Balance, Total Income, Total Expenses, Closing Balance)
- Section: Ledger Filters
  - Date range picker, Transaction type filter
- Section: Ledger Entries Table
  - Columnar table with all transactions
- Section: Add Entry Modal
  - Form for manual ledger entries
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
- Text: "Ledger"
- Font: H1 (48px desktop / 32px mobile), weight 400, color #000000

#### Subtitle
- Text: "Financial records and transaction history"
- Font: 16px, weight 400, color #858585

#### Add Entry Button
- Style: Action Button (Orange) with "add_circle" icon
- Label: "Add Entry"
- Action: Opens Add Ledger Entry modal

## Section: Ledger Stats Row

### Layout
- Padding: 0 40px
- 4 mini cards in a row (2x2 on mobile)
- Gap: 16px

### Mini Stat Cards

#### Opening Balance
- Icon: "account_balance", background #FF9E00, white icon
- Value: Dynamic (e.g., "$2,000.00")
- Label: "Opening Balance"

#### Total Income
- Icon: "trending_up", background #34C759, white icon
- Value: Dynamic (e.g., "$15,250.00")
- Label: "Total Income"

#### Total Expenses
- Icon: "trending_down", background #FF3B30, white icon
- Value: Dynamic (e.g., "$8,500.00")
- Label: "Total Expenses"

#### Closing Balance
- Icon: "calculate", background #FF5A00, white icon
- Value: Dynamic (e.g., "$8,750.00")
- Label: "Closing Balance"
- Highlighted with subtle orange border

## Section: Ledger Filters

### Layout
- Padding: 24px 40px 0
- Flex row on desktop, stacked on mobile
- Gap: 16px

### Filter Controls

#### Date Range
- **From**: Date input, default start of current month
- **To**: Date input, default today
- Label: "From" / "To" in small gray text above each

#### Transaction Type Filter
- Multi-select dropdown:
  - All (default)
  - Sale (Income)
  - Purchase (Expense)
  - Payment Received
  - Payment Made
  - Expense
  - Adjustment

#### Search
- Form Input with "search" icon
- Placeholder: "Search entries..."
- Filters by description or reference number

#### Reset Filters
- Text button: "Reset"
- Clears all filters to defaults

## Section: Ledger Entries Table

### Layout
- Padding: 24px 40px 120px
- Full-width table on desktop, card-based list on mobile

### Desktop Table

#### Table Header
- Background: #F8F8F8
- Border-bottom: 2px solid #CECECE
- Font: 14px, weight 600, color #858585, uppercase
- Columns:

| Column | Width | Align |
|--------|-------|-------|
| Date | 120px | Left |
| Reference # | 120px | Left |
| Description | Flexible | Left |
| Type | 100px | Center |
| Income (Dr) | 120px | Right |
| Expense (Cr) | 120px | Right |
| Balance | 120px | Right |

#### Table Rows
- Alternating background: White / #FAFAFA
- Border-bottom: 1px solid #E5E5E5
- Font: 14px, color #000000

#### Row Content
- **Date**: Format "DD MMM YYYY" (e.g., "17 Apr 2026")
- **Reference #**: Monospace font, clickable link color (#FF5A00)
- **Description**: Full transaction description
- **Type**: Badge with color:
  - Sale: Green pill (#34C759)
  - Purchase: Orange pill (#FF5A00)
  - Payment Received: Blue pill (#007AFF)
  - Payment Made: Red pill (#FF3B30)
  - Expense: Gray pill (#858585)
  - Adjustment: Purple pill (#AF52DE)
- **Income**: Green text (#34C759), prefixed with "+"
- **Expense**: Red text (#FF3B30), prefixed with "-"
- **Balance**: Running balance, black bold

#### Running Balance Calculation
```
Balance = Previous Balance + Income - Expense
```
Displayed after each row, recalculated for the visible filtered range.

### Mobile View
On mobile, the table converts to card-based entries:

```
- Card (Data Card style)
  - Top Row: Date (left), Type badge (right)
  - Description: Full text
  - Reference #: Link style
  - Bottom Row: 
    - Income/Expense amount (large, colored)
    - Running balance (smaller, gray)
```

### Pagination
- 25 entries per page by default
- Pagination controls at bottom: Previous | Page numbers | Next
- Also shows: "Showing X-Y of Z entries"

## Add Ledger Entry Modal

### Modal Content

#### Header
- Title: "Add Ledger Entry"
- Close button: "close" icon

#### Form Fields

| Field | Type | Placeholder | Required |
|-------|------|-------------|----------|
| Date | Date | Today | Yes |
| Entry Type | Select | Select type | Yes |
| Description | Text | "e.g., Shop rent payment" | Yes |
| Reference # | Text | "e.g., REF-001" | No |
| Amount | Number | "0.00" | Yes |
| Notes | Textarea | "Additional details" | No |

#### Entry Type Options
- Sale (Income) - usually auto-created from Sales page
- Purchase (Expense) - usually auto-created from Inventory
- Payment Received
- Payment Made
- Expense (Rent, Utilities, Salaries, etc.)
- Adjustment

#### Debit/Credit Toggle
- When type is selected, show whether this is Income (adds to balance) or Expense (subtracts)
- Visual indicator: Green "+ Income" or Red "- Expense"

#### Form Actions
- **Cancel**: Glassmorphism Button
- **Save Entry**: Action Button (Orange)

### Auto-Generated Entries
The following entries are automatically created by other parts of the app:
- **Sale recorded** → Income entry (from Sales page)
- **Product purchased/restocked** → Expense entry (from Inventory)
- **Credit payment received** → Income entry (from Credit page)

These auto-entries cannot be edited from the Ledger (must be edited from their source page).

## Entrance Animations
- Header fades in + slides down (0.3s)
- Stats cards stagger in (0.1s each)
- Table rows stagger in (0.05s each, first 10 visible)

## Data Model

### LedgerEntry Object
```typescript
interface LedgerEntry {
  id: string;
  date: Date;
  type: 'sale' | 'purchase' | 'payment_received' | 'payment_made' | 'expense' | 'adjustment';
  description: string;
  reference?: string;
  amount: number;
  isIncome: boolean;       // true = debit/income, false = credit/expense
  source?: string;         // 'manual', 'sales', 'inventory', 'credit'
  sourceId?: string;       // Reference to source record
  notes?: string;
  createdAt: Date;
}
```

### Balance Calculation
```typescript
// For a given date range:
openingBalance = balance before startDate
totalIncome = sum of all income entries in range
totalExpenses = sum of all expense entries in range
closingBalance = openingBalance + totalIncome - totalExpenses
```

## Assets
- No new image assets needed

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

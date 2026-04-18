# Page: Credit

The Credit page manages all credit customers (primarily hotels and restaurants). Users can view outstanding balances, record payments, see payment history, and get alerts for overdue accounts. This is a critical financial management page for a B2B meat shop.

## Page Layout

```
- Section: Page Header
  - Title: "Credit"
  - Subtitle: "Manage customer credit and payments"
  - Action Button: "Add Customer" (top-right)
- Section: Credit Stats Row
  - 3 mini stat cards (Total Outstanding, Credit Customers, Overdue Amount)
- Section: Credit Customer List
  - Search bar
  - Customer cards (expandable)
- Section: Payment Modal
  - Form to record a payment against a customer's balance
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
- Text: "Credit"
- Font: H1 (48px desktop / 32px mobile), weight 400, color #000000

#### Subtitle
- Text: "Manage customer credit and payments"
- Font: 16px, weight 400, color #858585

#### Add Customer Button
- Style: Action Button (Orange) with "add_circle" icon
- Label: "Add Customer"
- Action: Opens Add Customer modal

## Section: Credit Stats Row

### Layout
- Padding: 0 40px
- 3 mini cards in a row (stacked on mobile)
- Gap: 16px

### Mini Stat Cards

#### Total Outstanding
- Icon: "credit_card", background #FF5A00, white icon
- Value: Dynamic (e.g., "$3,450.00")
- Label: "Total Outstanding"
- Color: Red (#FF3B30) if increasing

#### Credit Customers
- Icon: "people", background #FF9E00, white icon
- Value: Dynamic count (e.g., "8")
- Label: "Customers"

#### Overdue Amount
- Icon: "warning", background #FF3B30, white icon
- Value: Dynamic (e.g., "$850.00")
- Label: "Overdue (>30 days)"

## Section: Credit Customer List

### Layout
- Padding: 24px 40px 120px
- Search bar at top
- Customer cards stacked vertically
- Gap: 16px between cards

### Search Bar
- Form Input with "search" icon
- Placeholder: "Search customers..."
- Filters by customer name

### Credit Customer Card

An expanded version of the Product / Ledger Entry Card with more detail.

#### Card Structure (Collapsed)
```
- Card Container (Data Card style)
  - Left:
    - Customer avatar: 48px circle, orange bg, white first-letter initial
    - Customer info:
      - Name: "Ahmed Restaurant" (18px, bold)
      - Type: "Hotel/Restaurant" (14px, gray)
  - Center:
    - Outstanding: "$1,200.00" (24px, bold, red if overdue)
    - Credit limit: "Limit: $2,000" (14px, gray)
  - Right:
    - Days since last payment: "Last paid: 15 days ago"
    - Expand arrow: "chevron_right" icon (rotates when expanded)
    - "Record Payment" button (small, orange)
```

#### Card Structure (Expanded)
When expanded, the card reveals:

```
- Payment History Table:
  - Header: Date | Description | Amount | Type
  - Rows: Each transaction (sale or payment)
  - Sale rows: Show invoice #, amount in red (negative)
  - Payment rows: Show "Payment received", amount in green (positive)
  - Running balance column

- Summary Footer:
  - Total Purchases: $X,XXX
  - Total Payments: $X,XXX
  - Current Balance: $X,XXX (outstanding)
  - Credit Limit Remaining: $X,XXX

- Actions:
  - "Record Payment" button
  - "View All Invoices" link
  - "Edit Customer" / "Delete Customer" links
```

#### Overdue Indicator
- If last payment > 30 days ago: Show red warning badge "OVERDUE"
- If last payment 15-30 days ago: Show orange badge "DUE SOON"
- If last payment < 15 days ago: Show green badge "CURRENT"

### Add/Edit Customer Modal

#### Form Fields

| Field | Type | Placeholder | Required |
|-------|------|-------------|----------|
| Customer Name | Text | "e.g., Ahmed Restaurant" | Yes |
| Contact Person | Text | "e.g., Mr. Ahmed" | No |
| Phone | Tel | "+92 XXX XXXXXXX" | No |
| Address | Textarea | "Business address" | No |
| Customer Type | Select | "Hotel / Restaurant" | Yes |
| Credit Limit | Number | "5000" | Yes |
| Payment Terms | Number | "30" (days) | Yes |

#### Form Actions
- **Cancel**: Glassmorphism Button
- **Save**: Action Button (Orange)
- **Delete** (edit mode): Red text button with confirmation

## Payment Modal

### Trigger
- Click "Record Payment" on any customer card

### Modal Content

#### Header
- Title: "Record Payment - [Customer Name]"
- Current balance shown prominently in red

#### Form Fields

| Field | Type | Details |
|-------|------|---------|
| Payment Amount | Number | Cannot exceed current balance |
| Payment Date | Date | Defaults to today |
| Payment Method | Select | Cash, Bank Transfer, Check |
| Reference # | Text | Optional transaction reference |
| Notes | Textarea | Optional notes |

#### Quick Amount Buttons
- Row of preset buttons: "Full Amount", "Half", "Custom"
- Clicking fills the amount field

#### Form Actions
- **Cancel**: Glassmorphism Button
- **Record Payment**: Action Button (Orange)
- After recording: Balance updates immediately, payment appears in history

## Entrance Animations
- Header fades in + slides down (0.3s)
- Stats cards stagger in (0.1s each)
- Customer cards stagger in from bottom (0.08s stagger)

## Interactions

### Customer Card Expand/Collapse
- Trigger: Click anywhere on collapsed card
- Animation: Height auto-expands (0.3s ease), chevron rotates 90deg
- Only one card expanded at a time (accordion behavior)

### Record Payment Flow
1. Click "Record Payment" on customer card
2. Payment modal opens with current balance
3. User enters amount and details
4. Click "Record Payment"
5. Modal closes, card updates with new balance
6. Success toast notification appears

### Overdue Alerts
- Customers with overdue balances (>30 days) sorted to top
- Overdue badge pulses subtly (opacity 0.7 to 1.0, 1.5s infinite)

## Data Model

### CreditCustomer Object
```typescript
interface CreditCustomer {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  customerType: 'hotel' | 'restaurant';
  creditLimit: number;
  paymentTerms: number;  // Days
  currentBalance: number;
  totalPurchases: number;
  totalPayments: number;
  lastPaymentDate?: Date;
  createdAt: Date;
}
```

### Payment Object
```typescript
interface Payment {
  id: string;
  customerId: string;
  amount: number;
  date: Date;
  method: 'cash' | 'bank_transfer' | 'check';
  reference?: string;
  notes?: string;
  createdAt: Date;
}
```

### Auto-Calculated Fields
- **Current Balance**: `totalPurchases - totalPayments`
- **Credit Limit Remaining**: `creditLimit - currentBalance`
- **Days Since Last Payment**: `Math.floor((today - lastPaymentDate) / (1000 * 60 * 60 * 24))`
- **Overdue Status**: `daysSinceLastPayment > paymentTerms`

## Assets
- No new image assets needed

## Transitions

**→ Sales**
- Trigger: Click "Sales" nav item
- Current page fades out, Sales page fades in

**→ Ledger**
- Trigger: Click "Ledger" nav item
- Credit payments are reflected in the ledger

**→ Dashboard**
- Trigger: Click "Home" nav item
- Current page fades out, Dashboard with 3D scene fades in

export interface Product {
  id: string;
  name: string;
  category: string;
  unitType: 'kg' | 'pieces';
  buyingPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitType: 'kg' | 'pieces';
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  customerName: string;
  customerType: 'standard' | 'hotel';
  items: SaleItem[];
  subtotal: number;
  paymentType: 'cash' | 'credit';
  creditDays?: number;
  isPaid: boolean;
  createdAt: Date;
}

export interface CreditCustomer {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  customerType: 'hotel' | 'restaurant';
  creditLimit: number;
  paymentTerms: number;
  currentBalance: number;
  totalPurchases: number;
  totalPayments: number;
  lastPaymentDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  date: Date;
  method: 'cash' | 'bank_transfer' | 'check';
  reference?: string;
  notes?: string;
  createdAt: Date;
}

export interface LedgerEntry {
  id: string;
  date: Date;
  type: 'sale' | 'purchase' | 'payment_received' | 'payment_made' | 'expense' | 'adjustment';
  description: string;
  reference?: string;
  amount: number;
  isIncome: boolean;
  source?: 'manual' | 'sales' | 'inventory' | 'credit';
  sourceId?: string;
  notes?: string;
  createdAt: Date;
}

export interface AppSettings {
  id: string;
  shopName: string;
  shopSlogan?: string;
  shopAddress?: string;
  shopPhone?: string;
  shopEmail?: string;
  taxNumber?: string;
  receiptWidth: '58mm' | '80mm' | 'A4';
  showLogo: boolean;
  showTax: boolean;
  taxRate: number;
  receiptFooter: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  currencySymbol: string;
  dateFormat: string;
  lowStockThreshold: number;
  theme: 'light' | 'dark' | 'auto';
  soundEffects: boolean;
  animations: boolean;
}

export type PageName = 'home' | 'inventory' | 'sales' | 'ledger' | 'credit' | 'settings';

export const PRODUCT_CATEGORIES = [
  'Whole Chicken',
  'Boneless',
  'Kaleji / Pota',
  'Karahi Cut',
  'Wings',
  'Legs',
  'Breast',
  'Mince',
  'Other',
] as const;

export const LEDGER_TYPES = [
  { value: 'sale', label: 'Sale', color: '#34C759' },
  { value: 'purchase', label: 'Purchase', color: '#FF5A00' },
  { value: 'payment_received', label: 'Payment Received', color: '#007AFF' },
  { value: 'payment_made', label: 'Payment Made', color: '#FF3B30' },
  { value: 'expense', label: 'Expense', color: '#858585' },
  { value: 'adjustment', label: 'Adjustment', color: '#AF52DE' },
] as const;

// Customer Types
export interface Customer {
  id: string;
  name: string;
  phone: string;
  businessName: string;
  address: string;
  category: 'Hotel' | 'Restaurant' | 'Retail' | 'Wholesale';
  outstandingBalance: number;
  createdAt: string;
}

// Product Types
export type ProductType = 'Boneless' | 'Kaleji/Pota' | 'Whole Chicken' | 'Chicken Waste';

export interface Product {
  id: string;
  name: ProductType;
  buyingPrice: number;
  sellingPrice: number;
  currentStock: number;
  lowStockThreshold: number;
  unit: 'kg' | 'pieces';
}

// Sale Types
export interface SaleItem {
  productType: ProductType;
  quantity: number;
  unit: 'kg' | 'pieces';
  pricePerUnit: number;
  total: number;
}

export interface Sale {
  id: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  amountPaid: number;
  notes: string;
  date: string;
  createdAt: string;
}

// Inventory/Stock Types
export interface StockEntry {
  id: string;
  date: string;
  supplierName: string;
  productType: ProductType;
  quantity: number;
  buyingCostPerUnit: number;
  sellingPricePerUnit: number;
  totalInvestment: number;
  createdAt: string;
}

// Expense Types
export interface Expense {
  id: string;
  date: string;
  category: 'Rent' | 'Electricity' | 'Transport' | 'Salaries' | 'Other';
  description: string;
  amount: number;
  createdAt: string;
}

// Settings Types
export interface Settings {
  lowStockThreshold: number;
  defaultPrices: Record<ProductType, { buying: number; selling: number }>;
  businessName: string;
  businessPhone: string;
  businessAddress: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalSales: number;
  totalProfit: number;
  totalCustomers: number;
  lowStockProducts: number;
  outstandingPayments: number;
  todaySales: number;
  todayProfit: number;
}

// Report Types
export interface SalesReport {
  startDate: string;
  endDate: string;
  totalSales: number;
  totalProfit: number;
  itemsSold: number;
  productBreakdown: Record<ProductType, { quantity: number; revenue: number }>;
  customerBreakdown: Record<string, { name: string; revenue: number }>;
}

export interface InventoryReport {
  currentStock: Product[];
  stockValue: number;
  potentialProfit: number;
  stockMovement: StockEntry[];
}

// Filter Types
export interface SaleFilters {
  dateRange?: { from: Date; to: Date };
  customerId?: string;
  productType?: ProductType;
  paymentStatus?: 'Paid' | 'Pending' | 'Partial';
}

export interface CustomerFilters {
  category?: 'Hotel' | 'Restaurant' | 'Retail' | 'Wholesale';
  hasOutstanding?: boolean;
}

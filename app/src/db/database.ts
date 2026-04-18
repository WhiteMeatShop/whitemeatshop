import Dexie, { type EntityTable } from 'dexie';
import type { Product, Sale, CreditCustomer, Payment, LedgerEntry, AppSettings } from '@/types';

const db = new Dexie('WhiteMeatShopDB') as Dexie & {
  products: EntityTable<Product, 'id'>;
  sales: EntityTable<Sale, 'id'>;
  creditCustomers: EntityTable<CreditCustomer, 'id'>;
  payments: EntityTable<Payment, 'id'>;
  ledger: EntityTable<LedgerEntry, 'id'>;
  settings: EntityTable<AppSettings, 'id'>;
};

db.version(1).stores({
  products: 'id, name, category, stockQuantity',
  sales: 'id, customerName, paymentType, createdAt',
  creditCustomers: 'id, name, currentBalance, lastPaymentDate',
  payments: 'id, customerId, date',
  ledger: 'id, date, type, isIncome',
  settings: 'id',
});

export { db };

// Default settings
export const defaultSettings: AppSettings = {
  id: 'app',
  shopName: 'WhiteMeatShop',
  shopSlogan: 'Fresh Chicken Daily',
  shopAddress: '',
  shopPhone: '',
  shopEmail: '',
  taxNumber: '',
  receiptWidth: '80mm',
  showLogo: true,
  showTax: false,
  taxRate: 0,
  receiptFooter: 'Thank You! Visit Again.',
  invoicePrefix: 'INV-',
  nextInvoiceNumber: 1,
  currencySymbol: '$',
  dateFormat: 'DD/MM/YYYY',
  lowStockThreshold: 5,
  theme: 'light',
  soundEffects: true,
  animations: true,
};

// Seed demo data
export async function seedDatabase() {
  const existingProducts = await db.products.count();
  if (existingProducts > 0) return;

  const now = new Date();
  const yesterday = new Date(now.getTime() - 86400000);

  // Seed products
  const products: Product[] = [
    {
      id: crypto.randomUUID(),
      name: 'Whole Chicken',
      category: 'Whole Chicken',
      unitType: 'kg',
      buyingPrice: 4.50,
      sellingPrice: 6.50,
      stockQuantity: 25,
      description: 'Fresh whole chicken',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: 'Boneless Breast',
      category: 'Boneless',
      unitType: 'kg',
      buyingPrice: 5.00,
      sellingPrice: 8.00,
      stockQuantity: 15,
      description: 'Boneless chicken breast fillets',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: 'Chicken Kaleji',
      category: 'Kaleji / Pota',
      unitType: 'kg',
      buyingPrice: 2.00,
      sellingPrice: 3.50,
      stockQuantity: 8,
      description: 'Fresh chicken liver',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: 'Karahi Cut',
      category: 'Karahi Cut',
      unitType: 'kg',
      buyingPrice: 4.00,
      sellingPrice: 6.00,
      stockQuantity: 20,
      description: 'Curry cut pieces',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: 'Chicken Wings',
      category: 'Wings',
      unitType: 'kg',
      buyingPrice: 3.00,
      sellingPrice: 5.00,
      stockQuantity: 12,
      description: 'Whole chicken wings',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: 'Drumsticks',
      category: 'Legs',
      unitType: 'kg',
      buyingPrice: 3.50,
      sellingPrice: 5.50,
      stockQuantity: 18,
      description: 'Chicken drumsticks',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: 'Chicken Breast',
      category: 'Breast',
      unitType: 'kg',
      buyingPrice: 4.50,
      sellingPrice: 7.00,
      stockQuantity: 10,
      description: 'Chicken breast pieces',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: 'Chicken Mince',
      category: 'Mince',
      unitType: 'kg',
      buyingPrice: 4.00,
      sellingPrice: 6.00,
      stockQuantity: 6,
      description: 'Ground chicken mince',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: 'Chicken Breast',
      category: 'Boneless',
      unitType: 'pieces',
      buyingPrice: 1.50,
      sellingPrice: 2.50,
      stockQuantity: 30,
      description: 'Boneless breast per piece',
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.products.bulkAdd(products);

  // Seed sales
  const sales: Sale[] = [
    {
      id: 'INV-1001',
      customerName: 'Walk-in Customer',
      customerType: 'standard',
      items: [
        { productId: products[0].id, productName: 'Whole Chicken', quantity: 2, unitType: 'kg', unitPrice: 6.50, total: 13.00 },
        { productId: products[1].id, productName: 'Boneless Breast', quantity: 1, unitType: 'kg', unitPrice: 8.00, total: 8.00 },
      ],
      subtotal: 21.00,
      paymentType: 'cash',
      isPaid: true,
      createdAt: yesterday,
    },
    {
      id: 'INV-1002',
      customerName: 'Ahmed Restaurant',
      customerType: 'hotel',
      items: [
        { productId: products[0].id, productName: 'Whole Chicken', quantity: 5, unitType: 'kg', unitPrice: 6.00, total: 30.00 },
        { productId: products[4].id, productName: 'Chicken Wings', quantity: 3, unitType: 'kg', unitPrice: 4.50, total: 13.50 },
      ],
      subtotal: 43.50,
      paymentType: 'credit',
      creditDays: 30,
      isPaid: false,
      createdAt: now,
    },
    {
      id: 'INV-1003',
      customerName: 'Walk-in Customer',
      customerType: 'standard',
      items: [
        { productId: products[3].id, productName: 'Karahi Cut', quantity: 1.5, unitType: 'kg', unitPrice: 6.00, total: 9.00 },
        { productId: products[2].id, productName: 'Chicken Kaleji', quantity: 0.5, unitType: 'kg', unitPrice: 3.50, total: 1.75 },
      ],
      subtotal: 10.75,
      paymentType: 'cash',
      isPaid: true,
      createdAt: now,
    },
  ];

  await db.sales.bulkAdd(sales);

  // Seed credit customers
  const customers: CreditCustomer[] = [
    {
      id: crypto.randomUUID(),
      name: 'Ahmed Restaurant',
      contactPerson: 'Mr. Ahmed',
      phone: '+92 300 1234567',
      address: 'Main Bazaar, Lahore',
      customerType: 'restaurant',
      creditLimit: 5000,
      paymentTerms: 30,
      currentBalance: 43.50,
      totalPurchases: 43.50,
      totalPayments: 0,
      lastPaymentDate: undefined,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: 'Royal Hotel',
      contactPerson: 'Manager Khan',
      phone: '+92 301 7654321',
      address: 'Gulberg, Lahore',
      customerType: 'hotel',
      creditLimit: 10000,
      paymentTerms: 30,
      currentBalance: 125.00,
      totalPurchases: 250.00,
      totalPayments: 125.00,
      lastPaymentDate: yesterday,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: 'Spice Corner',
      contactPerson: 'Chef Ali',
      phone: '+92 302 9876543',
      address: 'Model Town, Lahore',
      customerType: 'restaurant',
      creditLimit: 3000,
      paymentTerms: 15,
      currentBalance: 78.00,
      totalPurchases: 150.00,
      totalPayments: 72.00,
      lastPaymentDate: new Date(now.getTime() - 20 * 86400000),
      createdAt: now,
    },
  ];

  await db.creditCustomers.bulkAdd(customers);

  // Seed ledger entries
  const ledgerEntries: LedgerEntry[] = [
    {
      id: crypto.randomUUID(),
      date: yesterday,
      type: 'sale',
      description: 'Sale - Walk-in Customer (INV-1001)',
      reference: 'INV-1001',
      amount: 21.00,
      isIncome: true,
      source: 'sales',
      sourceId: 'INV-1001',
      createdAt: yesterday,
    },
    {
      id: crypto.randomUUID(),
      date: now,
      type: 'sale',
      description: 'Sale - Ahmed Restaurant (INV-1002)',
      reference: 'INV-1002',
      amount: 43.50,
      isIncome: true,
      source: 'sales',
      sourceId: 'INV-1002',
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      date: now,
      type: 'sale',
      description: 'Sale - Walk-in Customer (INV-1003)',
      reference: 'INV-1003',
      amount: 10.75,
      isIncome: true,
      source: 'sales',
      sourceId: 'INV-1003',
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      date: now,
      type: 'expense',
      description: 'Shop rent - April 2026',
      amount: 500.00,
      isIncome: false,
      source: 'manual',
      createdAt: now,
    },
  ];

  await db.ledger.bulkAdd(ledgerEntries);

  // Seed settings
  await db.settings.put(defaultSettings);
}

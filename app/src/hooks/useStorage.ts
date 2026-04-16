import { useState, useCallback } from 'react';
import type { 
  Customer, 
  Sale, 
  StockEntry, 
  Expense, 
  Product, 
  Settings,
  ProductType 
} from '@/types';

// Storage Keys
const STORAGE_KEYS = {
  CUSTOMERS: 'whitemeatshop_customers',
  SALES: 'whitemeatshop_sales',
  INVENTORY: 'whitemeatshop_inventory',
  EXPENSES: 'whitemeatshop_expenses',
  SETTINGS: 'whitemeatshop_settings',
  STOCK_ENTRIES: 'whitemeatshop_stock_entries',
} as const;

// Default Products
const defaultProducts: Product[] = [
  { id: '1', name: 'Boneless', buyingPrice: 450, sellingPrice: 550, currentStock: 0, lowStockThreshold: 10, unit: 'kg' },
  { id: '2', name: 'Kaleji/Pota', buyingPrice: 200, sellingPrice: 280, currentStock: 0, lowStockThreshold: 15, unit: 'kg' },
  { id: '3', name: 'Whole Chicken', buyingPrice: 350, sellingPrice: 450, currentStock: 0, lowStockThreshold: 20, unit: 'pieces' },
  { id: '4', name: 'Chicken Waste', buyingPrice: 80, sellingPrice: 120, currentStock: 0, lowStockThreshold: 25, unit: 'kg' },
];

const defaultSettings: Settings = {
  lowStockThreshold: 10,
  defaultPrices: {
    'Boneless': { buying: 450, selling: 550 },
    'Kaleji/Pota': { buying: 200, selling: 280 },
    'Whole Chicken': { buying: 350, selling: 450 },
    'Chicken Waste': { buying: 80, selling: 120 },
  },
  businessName: 'White Meat Shop',
  businessPhone: '',
  businessAddress: '',
};

// Generic hook for localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}

// Customers Hook
export function useCustomers() {
  const [customers, setCustomers] = useLocalStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);

  const addCustomer = useCallback((customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  }, [setCustomers]);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [setCustomers]);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  }, [setCustomers]);

  const getCustomerById = useCallback((id: string) => {
    return customers.find(c => c.id === id);
  }, [customers]);

  const updateOutstandingBalance = useCallback((customerId: string, amount: number) => {
    setCustomers(prev => prev.map(c => 
      c.id === customerId 
        ? { ...c, outstandingBalance: c.outstandingBalance + amount }
        : c
    ));
  }, [setCustomers]);

  return {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    updateOutstandingBalance,
  };
}

// Sales Hook
export function useSales() {
  const [sales, setSales] = useLocalStorage<Sale[]>(STORAGE_KEYS.SALES, []);

  const addSale = useCallback((sale: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setSales(prev => [newSale, ...prev]);
    return newSale;
  }, [setSales]);

  const updateSale = useCallback((id: string, updates: Partial<Sale>) => {
    setSales(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, [setSales]);

  const deleteSale = useCallback((id: string) => {
    setSales(prev => prev.filter(s => s.id !== id));
  }, [setSales]);

  const getSalesByCustomer = useCallback((customerId: string) => {
    return sales.filter(s => s.customerId === customerId);
  }, [sales]);

  const getTodaySales = useCallback(() => {
    const today = new Date().toDateString();
    return sales.filter(s => new Date(s.date).toDateString() === today);
  }, [sales]);

  const getSalesByDateRange = useCallback((from: Date, to: Date) => {
    return sales.filter(s => {
      const saleDate = new Date(s.date);
      return saleDate >= from && saleDate <= to;
    });
  }, [sales]);

  return {
    sales,
    addSale,
    updateSale,
    deleteSale,
    getSalesByCustomer,
    getTodaySales,
    getSalesByDateRange,
  };
}

// Products/Inventory Hook
export function useProducts() {
  const [products, setProducts] = useLocalStorage<Product[]>(STORAGE_KEYS.INVENTORY, defaultProducts);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [setProducts]);

  const updateStock = useCallback((productType: ProductType, quantity: number, isAddition: boolean = true) => {
    setProducts(prev => prev.map(p => {
      if (p.name === productType) {
        return {
          ...p,
          currentStock: isAddition 
            ? p.currentStock + quantity 
            : Math.max(0, p.currentStock - quantity)
        };
      }
      return p;
    }));
  }, [setProducts]);

  const updatePrices = useCallback((productType: ProductType, buyingPrice: number, sellingPrice: number) => {
    setProducts(prev => prev.map(p => 
      p.name === productType 
        ? { ...p, buyingPrice, sellingPrice }
        : p
    ));
  }, [setProducts]);

  const getLowStockProducts = useCallback(() => {
    return products.filter(p => p.currentStock <= p.lowStockThreshold);
  }, [products]);

  const getProductByType = useCallback((type: ProductType) => {
    return products.find(p => p.name === type);
  }, [products]);

  return {
    products,
    updateProduct,
    updateStock,
    updatePrices,
    getLowStockProducts,
    getProductByType,
  };
}

// Stock Entries Hook
export function useStockEntries() {
  const [stockEntries, setStockEntries] = useLocalStorage<StockEntry[]>(STORAGE_KEYS.STOCK_ENTRIES, []);

  const addStockEntry = useCallback((entry: Omit<StockEntry, 'id' | 'createdAt'>) => {
    const newEntry: StockEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setStockEntries(prev => [newEntry, ...prev]);
    return newEntry;
  }, [setStockEntries]);

  const deleteStockEntry = useCallback((id: string) => {
    setStockEntries(prev => prev.filter(e => e.id !== id));
  }, [setStockEntries]);

  const getEntriesByProduct = useCallback((productType: ProductType) => {
    return stockEntries.filter(e => e.productType === productType);
  }, [stockEntries]);

  const getEntriesByDateRange = useCallback((from: Date, to: Date) => {
    return stockEntries.filter(e => {
      const entryDate = new Date(e.date);
      return entryDate >= from && entryDate <= to;
    });
  }, [stockEntries]);

  return {
    stockEntries,
    addStockEntry,
    deleteStockEntry,
    getEntriesByProduct,
    getEntriesByDateRange,
  };
}

// Expenses Hook
export function useExpenses() {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []);

  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  }, [setExpenses]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, [setExpenses]);

  const getExpensesByDateRange = useCallback((from: Date, to: Date) => {
    return expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate >= from && expenseDate <= to;
    });
  }, [expenses]);

  const getTotalExpenses = useCallback((from?: Date, to?: Date) => {
    const filtered = from && to ? expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate >= from && expenseDate <= to;
    }) : expenses;
    return filtered.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  return {
    expenses,
    addExpense,
    deleteExpense,
    getExpensesByDateRange,
    getTotalExpenses,
  };
}

// Settings Hook
export function useSettings() {
  const [settings, setSettings] = useLocalStorage<Settings>(STORAGE_KEYS.SETTINGS, defaultSettings);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, [setSettings]);

  const updateDefaultPrice = useCallback((productType: ProductType, buying: number, selling: number) => {
    setSettings(prev => ({
      ...prev,
      defaultPrices: {
        ...prev.defaultPrices,
        [productType]: { buying, selling }
      }
    }));
  }, [setSettings]);

  return {
    settings,
    updateSettings,
    updateDefaultPrice,
  };
}

// Export/Import Data
export function exportAllData(): string {
  const data = {
    customers: localStorage.getItem(STORAGE_KEYS.CUSTOMERS),
    sales: localStorage.getItem(STORAGE_KEYS.SALES),
    inventory: localStorage.getItem(STORAGE_KEYS.INVENTORY),
    expenses: localStorage.getItem(STORAGE_KEYS.EXPENSES),
    settings: localStorage.getItem(STORAGE_KEYS.SETTINGS),
    stockEntries: localStorage.getItem(STORAGE_KEYS.STOCK_ENTRIES),
    exportDate: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.customers) localStorage.setItem(STORAGE_KEYS.CUSTOMERS, data.customers);
    if (data.sales) localStorage.setItem(STORAGE_KEYS.SALES, data.sales);
    if (data.inventory) localStorage.setItem(STORAGE_KEYS.INVENTORY, data.inventory);
    if (data.expenses) localStorage.setItem(STORAGE_KEYS.EXPENSES, data.expenses);
    if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, data.settings);
    if (data.stockEntries) localStorage.setItem(STORAGE_KEYS.STOCK_ENTRIES, data.stockEntries);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}

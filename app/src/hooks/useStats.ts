import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';

export function useStats() {
  const products = useLiveQuery(() => db.products.toArray(), []) ?? [];
  const sales = useLiveQuery(() => db.sales.toArray(), []) ?? [];
  const customers = useLiveQuery(() => db.creditCustomers.toArray(), []) ?? [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);

  // Daily sales
  const todaySales = sales.filter(s => s.createdAt >= todayStart);
  const yesterdaySales = sales.filter(s => s.createdAt >= yesterdayStart && s.createdAt < todayStart);
  const dailySalesTotal = todaySales.reduce((sum, s) => sum + s.subtotal, 0);
  const yesterdayTotal = yesterdaySales.reduce((sum, s) => sum + s.subtotal, 0);
  const dailySalesChange = yesterdayTotal > 0 ? ((dailySalesTotal - yesterdayTotal) / yesterdayTotal * 100) : 0;

  // Credit outstanding
  const totalCreditOutstanding = customers.reduce((sum, c) => sum + c.currentBalance, 0);

  // Low stock
  const settings = useLiveQuery(() => db.settings.get('app'), []);
  const threshold = settings?.lowStockThreshold ?? 5;
  const lowStockItems = products.filter(p => p.stockQuantity <= threshold);

  // Transactions today
  const transactionCount = todaySales.length;
  const avgSale = transactionCount > 0 ? dailySalesTotal / transactionCount : 0;

  // Inventory value
  const inventoryValue = products.reduce((sum, p) => sum + (p.buyingPrice * p.stockQuantity), 0);

  return {
    dailySales: {
      total: dailySalesTotal,
      change: dailySalesChange,
      count: transactionCount,
    },
    creditOutstanding: totalCreditOutstanding,
    lowStockCount: lowStockItems.length,
    totalProducts: products.length,
    inventoryValue,
    avgSale,
    overdueAmount: customers
      .filter(c => {
        if (!c.lastPaymentDate) return true;
        const daysSince = Math.floor((now.getTime() - c.lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysSince > c.paymentTerms;
      })
      .reduce((sum, c) => sum + c.currentBalance, 0),
    creditCustomerCount: customers.length,
  };
}

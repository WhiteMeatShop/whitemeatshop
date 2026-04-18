import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import type { Sale, SaleItem } from '@/types';

export function useSales(searchQuery?: string) {
  const sales = useLiveQuery(
    () => {
      let query = db.sales.orderBy('createdAt').reverse();
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return db.sales.filter(s => 
          s.customerName.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)
        ).toArray();
      }
      return query.toArray();
    },
    [searchQuery]
  ) ?? [];

  const createSale = async (saleData: {
    customerName: string;
    customerType: 'standard' | 'hotel';
    items: SaleItem[];
    subtotal: number;
    paymentType: 'cash' | 'credit';
    creditDays?: number;
  }) => {
    const now = new Date();
    const settings = await db.settings.get('app');
    const prefix = settings?.invoicePrefix ?? 'INV-';
    const nextNum = settings?.nextInvoiceNumber ?? 1;
    const id = `${prefix}${String(nextNum).padStart(4, '0')}`;

    const sale: Sale = {
      ...saleData,
      id,
      isPaid: saleData.paymentType === 'cash',
      createdAt: now,
    };

    await db.sales.add(sale);

    // Update invoice number
    if (settings) {
      await db.settings.update('app', { nextInvoiceNumber: nextNum + 1 });
    }

    // Update product stock
    for (const item of saleData.items) {
      const product = await db.products.get(item.productId);
      if (product) {
        await db.products.update(item.productId, {
          stockQuantity: Math.max(0, product.stockQuantity - item.quantity),
          updatedAt: now,
        });
      }
    }

    // Auto-create ledger entry
    await db.ledger.add({
      id: crypto.randomUUID(),
      date: now,
      type: 'sale',
      description: `Sale - ${saleData.customerName} (${id})`,
      reference: id,
      amount: saleData.subtotal,
      isIncome: true,
      source: 'sales',
      sourceId: id,
      createdAt: now,
    });

    // Update credit customer balance if credit sale
    if (saleData.paymentType === 'credit' && saleData.customerType === 'hotel') {
      const customers = await db.creditCustomers.toArray();
      const customer = customers.find(c => c.name.toLowerCase() === saleData.customerName.toLowerCase());
      if (customer) {
        await db.creditCustomers.update(customer.id, {
          currentBalance: customer.currentBalance + saleData.subtotal,
          totalPurchases: customer.totalPurchases + saleData.subtotal,
        });
      }
    }

    return sale;
  };

  const deleteSale = async (id: string) => {
    await db.sales.delete(id);
  };

  return { sales, createSale, deleteSale };
}

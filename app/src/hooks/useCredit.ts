import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import type { CreditCustomer, Payment } from '@/types';

export function useCredit(searchQuery?: string) {
  const customers = useLiveQuery(
    () => {
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return db.creditCustomers.filter(c => c.name.toLowerCase().includes(q)).toArray();
      }
      return db.creditCustomers.toArray();
    },
    [searchQuery]
  ) ?? [];

  const addCustomer = async (customer: Omit<CreditCustomer, 'id' | 'createdAt' | 'currentBalance' | 'totalPurchases' | 'totalPayments' | 'lastPaymentDate'>) => {
    const now = new Date();
    const id = crypto.randomUUID();
    await db.creditCustomers.add({
      ...customer,
      id,
      currentBalance: 0,
      totalPurchases: 0,
      totalPayments: 0,
      createdAt: now,
    });
    return id;
  };

  const updateCustomer = async (id: string, updates: Partial<CreditCustomer>) => {
    await db.creditCustomers.update(id, updates);
  };

  const deleteCustomer = async (id: string) => {
    await db.creditCustomers.delete(id);
    await db.payments.where('customerId').equals(id).delete();
  };

  const addPayment = async (payment: Omit<Payment, 'id' | 'createdAt'>) => {
    const now = new Date();
    const id = crypto.randomUUID();
    await db.payments.add({
      ...payment,
      id,
      createdAt: now,
    });

    // Update customer balance
    const customer = await db.creditCustomers.get(payment.customerId);
    if (customer) {
      await db.creditCustomers.update(payment.customerId, {
        currentBalance: Math.max(0, customer.currentBalance - payment.amount),
        totalPayments: customer.totalPayments + payment.amount,
        lastPaymentDate: payment.date,
      });
    }

    // Auto-create ledger entry
    const customerData = await db.creditCustomers.get(payment.customerId);
    await db.ledger.add({
      id: crypto.randomUUID(),
      date: payment.date,
      type: 'payment_received',
      description: `Payment received - ${customerData?.name ?? 'Customer'}`,
      amount: payment.amount,
      isIncome: true,
      source: 'credit',
      sourceId: id,
      createdAt: now,
    });

    return id;
  };

  const getPayments = (customerId: string) => {
    return useLiveQuery(
      () => db.payments.where('customerId').equals(customerId).reverse().toArray(),
      [customerId]
    ) ?? [];
  };

  return { customers, addCustomer, updateCustomer, deleteCustomer, addPayment, getPayments };
}

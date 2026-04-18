import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import type { LedgerEntry } from '@/types';

export interface LedgerFilters {
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  search?: string;
}

export function useLedger(filters?: LedgerFilters) {
  const entries = useLiveQuery(
    async () => {
      let query = db.ledger.orderBy('date');
      let results = await query.toArray();

      if (filters?.dateFrom) {
        const from = new Date(filters.dateFrom);
        results = results.filter(e => e.date >= from);
      }
      if (filters?.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        results = results.filter(e => e.date <= to);
      }
      if (filters?.type && filters.type !== 'all') {
        results = results.filter(e => e.type === filters.type);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        results = results.filter(e =>
          e.description.toLowerCase().includes(q) ||
          (e.reference?.toLowerCase().includes(q) ?? false)
        );
      }

      return results.reverse();
    },
    [filters?.dateFrom, filters?.dateTo, filters?.type, filters?.search]
  ) ?? [];

  const addEntry = async (entry: Omit<LedgerEntry, 'id' | 'createdAt'>) => {
    const now = new Date();
    const id = crypto.randomUUID();
    await db.ledger.add({
      ...entry,
      id,
      createdAt: now,
    });
    return id;
  };

  const deleteEntry = async (id: string) => {
    await db.ledger.delete(id);
  };

  // Calculate running balance
  const calculateBalance = () => {
    let balance = 0;
    const totalIncome = entries.filter(e => e.isIncome).reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = entries.filter(e => !e.isIncome).reduce((sum, e) => sum + e.amount, 0);
    balance = totalIncome - totalExpense;
    return { totalIncome, totalExpense, balance };
  };

  return { entries, addEntry, deleteEntry, calculateBalance };
}

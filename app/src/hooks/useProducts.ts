import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import type { Product } from '@/types';

export function useProducts(searchQuery?: string) {
  const products = useLiveQuery(
    () => {
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return db.products.filter(p => p.name.toLowerCase().includes(q)).toArray();
      }
      return db.products.toArray();
    },
    [searchQuery]
  ) ?? [];

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const id = crypto.randomUUID();
    await db.products.add({
      ...product,
      id,
      createdAt: now,
      updatedAt: now,
    });
    // Auto-create ledger entry for purchase
    await db.ledger.add({
      id: crypto.randomUUID(),
      date: now,
      type: 'purchase',
      description: `Stock purchase - ${product.name} (${product.stockQuantity} ${product.unitType})`,
      amount: product.buyingPrice * product.stockQuantity,
      isIncome: false,
      source: 'inventory',
      sourceId: id,
      createdAt: now,
    });
    return id;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await db.products.update(id, { ...updates, updatedAt: new Date() });
  };

  const deleteProduct = async (id: string) => {
    await db.products.delete(id);
  };

  const getLowStock = (threshold: number = 5) => {
    return products.filter(p => p.stockQuantity <= threshold);
  };

  return { products, addProduct, updateProduct, deleteProduct, getLowStock };
}

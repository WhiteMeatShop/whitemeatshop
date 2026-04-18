import { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from '@/components/Modal';
import DataCard, { MiniStatCard } from '@/components/DataCard';
import { FormInput, FormSelect } from '@/components/FormComponents';
import { useProducts } from '@/hooks/useProducts';
import { useSettings } from '@/hooks/useSettings';
import { PRODUCT_CATEGORIES } from '@/types';
import type { Product } from '@/types';
import { showToast } from '@/components/Toast';

export default function Inventory() {
  const { settings } = useSettings();
  const currency = settings.currencySymbol;
  const [searchQuery, setSearchQuery] = useState('');
  const { products, addProduct, updateProduct, deleteProduct, getLowStock } = useProducts(searchQuery);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const lowStock = getLowStock(settings.lowStockThreshold);
  const inventoryValue = products.reduce((sum, p) => sum + p.buyingPrice * p.stockQuantity, 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      unitType: formData.get('unitType') as 'kg' | 'pieces',
      buyingPrice: parseFloat(formData.get('buyingPrice') as string) || 0,
      sellingPrice: parseFloat(formData.get('sellingPrice') as string) || 0,
      stockQuantity: parseFloat(formData.get('stockQuantity') as string) || 0,
      description: formData.get('description') as string,
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        showToast('Product updated successfully');
      } else {
        await addProduct(data);
        showToast('Product added successfully');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      form.reset();
    } catch {
      showToast('Error saving product', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      showToast('Product deleted');
      setDeleteConfirm(null);
    } catch {
      showToast('Error deleting product', 'error');
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="px-6 md:px-10 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1
            className="text-3xl md:text-5xl font-normal text-black"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Inventory
          </motion.h1>
          <motion.p
            className="text-wm-gray mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Manage your products, stock, and pricing
          </motion.p>
        </div>
        <motion.button
          onClick={openAdd}
          className="flex items-center gap-2 bg-wm-orange text-white px-5 py-3 rounded-2xl font-medium hover:bg-[#E65000] transition-colors self-start cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="material-icons">add_circle</span>
          Add Product
        </motion.button>
      </div>

      {/* Stats */}
      <div className="px-6 md:px-10 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MiniStatCard icon="inventory_2" value={products.length} label="Products" bgColor="#FF5A00" index={0} />
        <MiniStatCard icon="warning" value={lowStock.length} label="Low Stock" bgColor="#FF3B30" index={1} />
        <MiniStatCard icon="trending_up" value={`${currency}${inventoryValue.toFixed(0)}`} label="Total Value" bgColor="#34C759" index={2} />
      </div>

      {/* Search */}
      <div className="px-6 md:px-10 py-4">
        <div className="relative max-w-md">
          <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-wm-gray">search</span>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-wm-border rounded-xl pl-10 pr-4 py-3 text-base focus:outline-none focus:border-wm-orange focus:ring-[3px] focus:ring-wm-orange/15 transition-all"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-6 md:px-10 py-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((product, i) => {
          const margin = ((product.sellingPrice - product.buyingPrice) / product.buyingPrice * 100);
          const isLowStock = product.stockQuantity <= settings.lowStockThreshold;
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
            >
              <DataCard>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-wm-orange to-wm-gold flex items-center justify-center flex-shrink-0">
                      <span className="material-icons text-white text-2xl">takeout_dining</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">{product.name}</h3>
                      <p className="text-sm text-wm-gray">per {product.unitType}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-2 h-2 rounded-full ${isLowStock ? 'bg-wm-error' : 'bg-wm-success'}`} />
                        <span className={`text-xs ${isLowStock ? 'text-wm-error' : 'text-wm-success'}`}>
                          {isLowStock ? 'Low: ' : 'In Stock: '}{product.stockQuantity} {product.unitType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg hover:bg-gray-100 text-wm-gray hover:text-wm-orange transition-colors cursor-pointer">
                      <span className="material-icons text-lg">edit</span>
                    </button>
                    <button onClick={() => setDeleteConfirm(product.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-wm-gray hover:text-wm-error transition-colors cursor-pointer">
                      <span className="material-icons text-lg">delete</span>
                    </button>
                  </div>
                </div>
                <div className="border-t border-wm-border pt-3 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-wm-gray text-xs">Buying</p>
                    <p className="font-medium text-black">{currency}{product.buyingPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-wm-gray text-xs">Selling</p>
                    <p className="font-medium text-black">{currency}{product.sellingPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-wm-gray text-xs">Margin</p>
                    <p className={`font-medium ${margin >= 0 ? 'text-wm-success' : 'text-wm-error'}`}>
                      {margin.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </DataCard>
            </motion.div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="px-6 md:px-10 py-12 text-center">
          <span className="material-icons text-6xl text-wm-border">inventory_2</span>
          <p className="text-wm-gray mt-4">No products found. Add your first product!</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput name="name" label="Product Name" placeholder="e.g., Whole Chicken" defaultValue={editingProduct?.name} required />
          <FormSelect name="category" label="Category" options={PRODUCT_CATEGORIES.map(c => ({ value: c, label: c }))} defaultValue={editingProduct?.category || PRODUCT_CATEGORIES[0]} required />
          <FormSelect name="unitType" label="Unit Type" options={[{ value: 'kg', label: 'KG (Kilogram)' }, { value: 'pieces', label: 'Pieces' }]} defaultValue={editingProduct?.unitType || 'kg'} required />
          <div className="grid grid-cols-2 gap-4">
            <FormInput name="buyingPrice" label="Buying Price" type="number" step="0.01" placeholder="0.00" defaultValue={editingProduct?.buyingPrice} required />
            <FormInput name="sellingPrice" label="Selling Price" type="number" step="0.01" placeholder="0.00" defaultValue={editingProduct?.sellingPrice} required />
          </div>
          <FormInput name="stockQuantity" label="Stock Quantity" type="number" step="0.5" placeholder="0" defaultValue={editingProduct?.stockQuantity} required />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); setEditingProduct(null); }}
              className="flex-1 py-3 rounded-2xl bg-black/10 backdrop-blur-sm text-black font-medium hover:bg-black/25 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-wm-orange text-white font-medium hover:bg-[#E65000] transition-colors cursor-pointer"
            >
              {editingProduct ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <p className="text-wm-gray mb-6">Are you sure you want to delete this product? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-2xl bg-black/10 text-black font-medium hover:bg-black/25 transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-2xl bg-wm-error text-white font-medium hover:bg-red-600 transition-colors cursor-pointer">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

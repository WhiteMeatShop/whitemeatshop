import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import DataCard, { MiniStatCard } from '@/components/DataCard';
import { FormInput, ToggleButton } from '@/components/FormComponents';
import { useSales } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useProducts';
import { useSettings } from '@/hooks/useSettings';
import { useStats } from '@/hooks/useStats';
import type { SaleItem } from '@/types';
import { showToast } from '@/components/Toast';

export default function Sales() {
  const { settings } = useSettings();
  const currency = settings.currencySymbol;
  const stats = useStats();
  const { products } = useProducts();
  const { sales, createSale, deleteSale } = useSales();
  const [searchQuery, setSearchQuery] = useState('');
  const { sales: filteredSales } = useSales(searchQuery);

  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerType, setCustomerType] = useState<'standard' | 'hotel'>('standard');
  const [paymentType, setPaymentType] = useState<'cash' | 'credit'>('cash');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [receiptSale, setReceiptSale] = useState<typeof sales[0] | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const filteredProducts = productSearch
    ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) && p.stockQuantity > 0)
    : products.filter(p => p.stockQuantity > 0);

  const addItem = (product: typeof products[0]) => {
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      setItems(items.map(i =>
        i.productId === product.id
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
          : i
      ));
    } else {
      setItems([...items, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitType: product.unitType,
        unitPrice: product.sellingPrice,
        total: product.sellingPrice,
      }]);
    }
    setProductSearch('');
  };

  const updateQty = (index: number, qty: number) => {
    if (qty <= 0) {
      setItems(items.filter((_, i) => i !== index));
      return;
    }
    setItems(items.map((item, i) =>
      i === index ? { ...item, quantity: qty, total: qty * item.unitPrice } : item
    ));
  };

  const updatePrice = (index: number, price: number) => {
    if (price < 0) return;
    setItems(items.map((item, i) =>
      i === index ? { ...item, unitPrice: price, total: item.quantity * price } : item
    ));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  const handleRecordSale = async (shouldPrint = false) => {
    if (items.length === 0) {
      showToast('Add at least one product', 'error');
      return;
    }
    if (paymentType === 'credit' && customerType !== 'hotel') {
      showToast('Credit only available for Hotel/Restaurant customers', 'error');
      return;
    }

    try {
      const sale = await createSale({
        customerName,
        customerType,
        items: [...items],
        subtotal,
        paymentType,
        creditDays: paymentType === 'credit' ? 30 : undefined,
      });

      showToast('Sale recorded successfully');
      setItems([]);
      setCustomerName('Walk-in Customer');
      setCustomerType('standard');
      setPaymentType('cash');
      setShowForm(false);

      if (shouldPrint) {
        setReceiptSale(sale);
        setTimeout(() => {
          window.print();
          setReceiptSale(null);
        }, 300);
      }
    } catch {
      showToast('Error recording sale', 'error');
    }
  };

  const handlePrint = (sale: typeof sales[0]) => {
    setReceiptSale(sale);
    setTimeout(() => {
      window.print();
      setReceiptSale(null);
    }, 300);
  };

  const displaySales = searchQuery ? filteredSales : sales;

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="px-6 md:px-10 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1 className="text-3xl md:text-5xl font-normal text-black" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            Sales
          </motion.h1>
          <motion.p className="text-wm-gray mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            Record sales and print receipts
          </motion.p>
        </div>
        <motion.button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium self-start cursor-pointer transition-colors ${
            showForm ? 'bg-[#E65000] text-white' : 'bg-wm-orange text-white hover:bg-[#E65000]'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="material-icons">add_circle</span>
          New Sale
        </motion.button>
      </div>

      {/* Stats */}
      <div className="px-6 md:px-10 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MiniStatCard icon="point_of_sale" value={`${currency}${stats.dailySales.total.toFixed(2)}`} label="Today's Sales" bgColor="#FF5A00" index={0} />
        <MiniStatCard icon="receipt" value={stats.dailySales.count} label="Transactions" bgColor="#FF9E00" index={1} />
        <MiniStatCard icon="trending_up" value={`${currency}${stats.avgSale.toFixed(2)}`} label="Average Sale" bgColor="#34C759" index={2} />
      </div>

      {/* New Sale Form */}
      {showForm && (
        <motion.div
          className="mx-6 md:mx-10 my-4 bg-[#F8F8F8] rounded-2xl p-5 md:p-8"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormInput label="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter customer name" />
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Customer Type</label>
              <ToggleButton
                options={[{ value: 'standard', label: 'Standard', color: '#34C759' }, { value: 'hotel', label: 'Hotel/Restaurant', color: '#FF5A00' }]}
                value={customerType}
                onChange={(v) => setCustomerType(v as 'standard' | 'hotel')}
              />
            </div>
          </div>

          {/* Product Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-1.5">Add Products</label>
            <div className="relative">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-wm-gray">search</span>
              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-white border border-wm-border rounded-xl pl-10 pr-4 py-3 text-base focus:outline-none focus:border-wm-orange focus:ring-[3px] focus:ring-wm-orange/15"
              />
            </div>
            {productSearch && filteredProducts.length > 0 && (
              <div className="mt-2 bg-white border border-wm-border rounded-xl shadow-lg max-h-48 overflow-y-auto z-10 relative">
                {filteredProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addItem(p)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex justify-between items-center cursor-pointer border-b border-gray-100 last:border-0"
                  >
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="text-sm text-wm-gray">{currency}{p.sellingPrice.toFixed(2)} / {p.unitType} (Stock: {p.stockQuantity})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div className="bg-white rounded-xl border border-wm-border overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-wm-gray font-medium">Product</th>
                    <th className="text-left px-4 py-2 text-wm-gray font-medium">Qty</th>
                    <th className="text-left px-4 py-2 text-wm-gray font-medium">Unit Price</th>
                    <th className="text-right px-4 py-2 text-wm-gray font-medium">Total</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-t border-gray-100">
                      <td className="px-4 py-2 font-medium">{item.productName}</td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQty(idx, parseFloat(e.target.value) || 0)}
                          step={item.unitType === 'kg' ? 0.5 : 1}
                          min="0"
                          className="w-20 border border-wm-border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-wm-orange"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updatePrice(idx, parseFloat(e.target.value) || 0)}
                          step="0.01"
                          min="0"
                          className="w-24 border border-wm-border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-wm-orange"
                        />
                      </td>
                      <td className="px-4 py-2 text-right font-medium">{currency}{item.total.toFixed(2)}</td>
                      <td className="px-4 py-2">
                        <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-wm-gray hover:text-wm-error cursor-pointer">
                          <span className="material-icons text-lg">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Payment Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-1.5">Payment Type</label>
            <ToggleButton
              options={[
                { value: 'cash', label: 'Cash / Pay Now', color: '#34C759' },
                ...(customerType === 'hotel' ? [{ value: 'credit', label: 'Credit', color: '#FF5A00' }] : []),
              ]}
              value={paymentType}
              onChange={(v) => setPaymentType(v as 'cash' | 'credit')}
            />
            {customerType !== 'hotel' && (
              <p className="text-xs text-wm-gray mt-1">Credit option available for Hotel/Restaurant customers only</p>
            )}
          </div>

          {/* Total + Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-wm-border pt-4">
            <div>
              <p className="text-sm text-wm-gray">Subtotal</p>
              <p className="text-3xl font-semibold text-black">{currency}{subtotal.toFixed(2)}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowForm(false); setItems([]); }} className="px-5 py-3 rounded-2xl bg-black/10 text-black font-medium hover:bg-black/25 transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={() => handleRecordSale(false)} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-wm-orange text-white font-medium hover:bg-[#E65000] transition-colors cursor-pointer">
                Record Sale
              </button>
              <button onClick={() => handleRecordSale(true)} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-wm-orange text-white font-medium hover:bg-[#E65000] transition-colors cursor-pointer">
                <span className="material-icons text-sm">print</span>
                Record & Print
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="px-6 md:px-10 py-4">
        <div className="relative max-w-md">
          <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-wm-gray">search</span>
          <input
            type="text"
            placeholder="Search by customer name or invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-wm-border rounded-xl pl-10 pr-4 py-3 text-base focus:outline-none focus:border-wm-orange focus:ring-[3px] focus:ring-wm-orange/15"
          />
        </div>
      </div>

      {/* Sales List */}
      <div className="px-6 md:px-10 py-4 space-y-3">
        {displaySales.map((sale, i) => (
          <motion.div
            key={sale.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <DataCard>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-wm-orange font-medium">#{sale.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${sale.paymentType === 'cash' ? 'bg-wm-success' : 'bg-wm-orange'}`}>
                      {sale.paymentType === 'cash' ? 'CASH' : 'CREDIT'}
                    </span>
                  </div>
                  <p className="text-xs text-wm-gray mt-0.5">
                    {sale.createdAt.toLocaleDateString()} {sale.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <p className="text-xl font-bold text-black">{currency}{sale.subtotal.toFixed(2)}</p>
              </div>
              <p className="text-sm text-black font-medium mb-1">{sale.customerName}</p>
              <p className="text-xs text-wm-gray mb-3">
                {sale.items.length} items - {sale.items.map(i => `${i.productName} x${i.quantity}${i.unitType === 'kg' ? 'KG' : 'pcs'}`).join(', ')}
              </p>
              <div className="flex gap-2">
                <button onClick={() => handlePrint(sale)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-wm-gray hover:text-wm-orange hover:bg-gray-200 transition-colors text-sm cursor-pointer">
                  <span className="material-icons text-sm">print</span> Print
                </button>
                <button onClick={() => { if (confirm('Delete this sale?')) deleteSale(sale.id); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-wm-gray hover:text-wm-error hover:bg-gray-200 transition-colors text-sm cursor-pointer">
                  <span className="material-icons text-sm">delete</span> Delete
                </button>
              </div>
            </DataCard>
          </motion.div>
        ))}
      </div>

      {displaySales.length === 0 && (
        <div className="px-6 md:px-10 py-12 text-center">
          <span className="material-icons text-6xl text-wm-border">receipt_long</span>
          <p className="text-wm-gray mt-4">No sales recorded yet.</p>
        </div>
      )}

      {/* Print Receipt (hidden) */}
      {receiptSale && (
        <div className="print-only">
          <div ref={receiptRef} className="receipt-print">
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0' }}>{settings.shopName}</h2>
              <p style={{ fontSize: '10px', margin: '2px 0' }}>{settings.shopSlogan}</p>
              {settings.shopPhone && <p style={{ fontSize: '9px', margin: '1px 0' }}>Tel: {settings.shopPhone}</p>}
            </div>
            <div style={{ fontSize: '10px', marginBottom: '8px' }}>
              <p>Date: {receiptSale.createdAt.toLocaleDateString()}</p>
              <p>Time: {receiptSale.createdAt.toLocaleTimeString()}</p>
              <p>Invoice: #{receiptSale.id}</p>
              <p>Customer: {receiptSale.customerName}</p>
            </div>
            <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '4px 0', marginBottom: '8px' }}>
              <table style={{ width: '100%', fontSize: '10px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #000' }}>
                    <th style={{ textAlign: 'left' }}>Item</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptSale.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: 'left' }}>{item.productName}</td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}{item.unitType === 'kg' ? 'KG' : 'pcs'}</td>
                      <td style={{ textAlign: 'right' }}>{currency}{item.unitPrice.toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>{currency}{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', marginBottom: '8px' }}>
              <p style={{ fontWeight: 'bold' }}>TOTAL: {currency}{receiptSale.subtotal.toFixed(2)}</p>
              <p>Paid By: {receiptSale.paymentType === 'cash' ? 'CASH' : 'CREDIT'}</p>
            </div>
            <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '8px', fontSize: '9px' }}>
              <p>{settings.receiptFooter}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

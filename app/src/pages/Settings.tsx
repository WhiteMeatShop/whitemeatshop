import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DataCard from '@/components/DataCard';
import { FormInput, FormSelect, FormTextarea } from '@/components/FormComponents';
import { useSettings } from '@/hooks/useSettings';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { useCredit } from '@/hooks/useCredit';
import { useLedger } from '@/hooks/useLedger';
import { db } from '@/db/database';
import { showToast } from '@/components/Toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Settings() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { products } = useProducts();
  const { sales } = useSales();
  const { customers } = useCredit();
  const { entries } = useLedger({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>('shop');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const handleExport = async () => {
    const data = {
      products,
      sales,
      creditCustomers: customers,
      ledger: entries,
      settings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whitemeatshop-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.products) await db.products.bulkPut(data.products);
      if (data.sales) await db.sales.bulkPut(data.sales);
      if (data.creditCustomers) await db.creditCustomers.bulkPut(data.creditCustomers);
      if (data.ledger) await db.ledger.bulkPut(data.ledger);
      if (data.settings) await db.settings.put(data.settings);
      showToast('Data imported successfully');
    } catch {
      showToast('Error importing data', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('WARNING: This will delete ALL data! This cannot be undone. Are you sure?')) return;
    if (!confirm('Really? ALL data will be permanently deleted.')) return;
    await db.products.clear();
    await db.sales.clear();
    await db.creditCustomers.clear();
    await db.payments.clear();
    await db.ledger.clear();
    showToast('All data cleared');
  };

  const saveCategory = async (updates: Record<string, unknown>) => {
    await updateSettings(updates);
    showToast('Settings saved');
  };

  const categories = [
    {
      id: 'shop',
      icon: 'store',
      title: 'Shop Information',
      content: (
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); saveCategory({ shopName: fd.get('shopName'), shopSlogan: fd.get('shopSlogan'), shopAddress: fd.get('shopAddress'), shopPhone: fd.get('shopPhone'), shopEmail: fd.get('shopEmail'), taxNumber: fd.get('taxNumber') }); }} className="space-y-3">
          <FormInput name="shopName" label="Shop Name" defaultValue={settings.shopName} required />
          <FormInput name="shopSlogan" label="Shop Slogan" defaultValue={settings.shopSlogan} />
          <FormTextarea name="shopAddress" label="Address" defaultValue={settings.shopAddress} />
          <FormInput name="shopPhone" label="Phone" defaultValue={settings.shopPhone} />
          <FormInput name="shopEmail" label="Email" type="email" defaultValue={settings.shopEmail} />
          <FormInput name="taxNumber" label="Tax Number" defaultValue={settings.taxNumber} />
          <button type="submit" className="w-full py-3 rounded-2xl bg-wm-orange text-white font-medium hover:bg-[#E65000] transition-colors cursor-pointer">Save</button>
        </form>
      ),
    },
    {
      id: 'receipt',
      icon: 'receipt',
      title: 'Receipt Settings',
      content: (
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); saveCategory({ receiptWidth: fd.get('receiptWidth'), receiptFooter: fd.get('receiptFooter'), invoicePrefix: fd.get('invoicePrefix'), taxRate: parseFloat(fd.get('taxRate') as string) || 0 }); }} className="space-y-3">
          <FormSelect name="receiptWidth" label="Receipt Width" options={[{ value: '58mm', label: '58mm (Small)' }, { value: '80mm', label: '80mm (Standard)' }, { value: 'A4', label: 'A4' }]} defaultValue={settings.receiptWidth} />
          <FormInput name="invoicePrefix" label="Invoice Prefix" defaultValue={settings.invoicePrefix} />
          <FormInput name="taxRate" label="Tax Rate (%)" type="number" step="0.01" defaultValue={settings.taxRate} />
          <FormTextarea name="receiptFooter" label="Receipt Footer" defaultValue={settings.receiptFooter} />
          <button type="submit" className="w-full py-3 rounded-2xl bg-wm-orange text-white font-medium hover:bg-[#E65000] transition-colors cursor-pointer">Save</button>
        </form>
      ),
    },
    {
      id: 'data',
      icon: 'storage',
      title: 'Data Management',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-wm-gray text-xs">Products</p><p className="font-semibold text-lg">{products.length}</p></div>
            <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-wm-gray text-xs">Sales</p><p className="font-semibold text-lg">{sales.length}</p></div>
            <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-wm-gray text-xs">Ledger</p><p className="font-semibold text-lg">{entries.length}</p></div>
            <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-wm-gray text-xs">Customers</p><p className="font-semibold text-lg">{customers.length}</p></div>
          </div>
          <div className="space-y-2">
            <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-black/10 text-black font-medium hover:bg-black/25 transition-colors cursor-pointer">
              <span className="material-icons text-sm">download</span> Export All Data
            </button>
            <label className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-black/10 text-black font-medium hover:bg-black/25 transition-colors cursor-pointer">
              <span className="material-icons text-sm">upload</span> Import Data
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button onClick={handleClearAll} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-wm-error/10 text-wm-error font-medium hover:bg-wm-error/20 transition-colors cursor-pointer">
              <span className="material-icons text-sm">delete_forever</span> Clear All Data
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'prefs',
      icon: 'tune',
      title: 'App Preferences',
      content: (
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); saveCategory({ currencySymbol: fd.get('currencySymbol'), lowStockThreshold: parseInt(fd.get('lowStockThreshold') as string) || 5 }); }} className="space-y-3">
          <FormSelect name="currencySymbol" label="Currency Symbol" options={[{ value: '$', label: '$ USD' }, { value: '€', label: '€ EUR' }, { value: '£', label: '£ GBP' }, { value: '₨', label: '₨ PKR' }, { value: '₹', label: '₹ INR' }]} defaultValue={settings.currencySymbol} />
          <FormInput name="lowStockThreshold" label="Low Stock Threshold" type="number" defaultValue={settings.lowStockThreshold} />
          <button type="submit" className="w-full py-3 rounded-2xl bg-wm-orange text-white font-medium hover:bg-[#E65000] transition-colors cursor-pointer">Save</button>
          <button type="button" onClick={() => { if (confirm('Reset all settings to defaults?')) { resetSettings(); showToast('Settings reset'); } }} className="w-full py-2 text-sm text-wm-gray hover:text-wm-error transition-colors cursor-pointer">
            Reset to Defaults
          </button>
        </form>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="px-6 md:px-10 pt-8 pb-4">
        <motion.h1 className="text-3xl md:text-5xl font-normal text-black" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          Settings
        </motion.h1>
        <motion.p className="text-wm-gray mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          Configure your app preferences
        </motion.p>
      </div>

      {/* Categories */}
      <div className="px-6 md:px-10 py-4 space-y-3">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <DataCard>
              <button
                onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                className="w-full flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-icons text-wm-orange">{cat.icon}</span>
                  <span className="font-semibold text-black">{cat.title}</span>
                </div>
                <motion.span
                  className="material-icons text-wm-gray"
                  animate={{ rotate: expandedCategory === cat.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  expand_more
                </motion.span>
              </button>
              <AnimatePresence>
                {expandedCategory === cat.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-wm-border mt-3 pt-4">
                      {cat.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </DataCard>
          </motion.div>
        ))}
      </div>

      {/* App Info Footer */}
      <div className="px-6 md:px-10 py-8 border-t border-wm-border mt-8 text-center">
        <h3 className="text-lg font-semibold text-black">WhiteMeatShop</h3>
        <p className="text-sm text-wm-gray mt-1">v1.0.0</p>
        <p className="text-xs text-wm-gray mt-1">React + IndexedDB + PWA</p>

        {isInstalled ? (
          <div className="flex items-center justify-center gap-1 mt-3 text-wm-success text-sm">
            <span className="material-icons text-sm">check_circle</span>
            App is installed
          </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="mt-3 flex items-center gap-2 mx-auto px-5 py-2.5 rounded-2xl bg-black/10 text-black font-medium hover:bg-black/25 transition-colors cursor-pointer"
          >
            <span className="material-icons text-sm">download</span>
            Install App
          </button>
        ) : (
          <p className="text-xs text-wm-gray mt-3">Install this app from your browser menu</p>
        )}

        <p className="text-xs text-wm-gray mt-4">© 2026 WhiteMeatShop</p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Save,
  AlertTriangle,
  Check,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import type { 
  Customer, 
  Sale, 
  Product, 
  StockEntry, 
  Expense,
  Settings as SettingsType,
  ProductType 
} from '@/types';

interface SettingsPanelProps {
  customers: {
    customers: Customer[];
  };
  sales: {
    sales: Sale[];
  };
  products: {
    products: Product[];
    updatePrices: (productType: ProductType, buyingPrice: number, sellingPrice: number) => void;
  };
  stockEntries: {
    stockEntries: StockEntry[];
  };
  expenses: {
    expenses: Expense[];
  };
  settings: {
    settings: SettingsType;
    updateSettings: (updates: Partial<SettingsType>) => void;
    updateDefaultPrice: (productType: ProductType, buying: number, selling: number) => void;
  };
}

export default function SettingsPanel({ 
  customers,
  sales,
  products, 
  settings 
}: SettingsPanelProps) {
  const [businessForm, setBusinessForm] = useState({
    businessName: settings.settings.businessName,
    businessPhone: settings.settings.businessPhone,
    businessAddress: settings.settings.businessAddress,
  });

  const [priceForm, setPriceForm] = useState(settings.settings.defaultPrices);
  const [lowStockThreshold, setLowStockThreshold] = useState(settings.settings.lowStockThreshold);

  const handleSaveBusiness = () => {
    settings.updateSettings({
      businessName: businessForm.businessName,
      businessPhone: businessForm.businessPhone,
      businessAddress: businessForm.businessAddress,
    });
    toast.success('Business settings saved!');
  };

  const handleSavePrices = () => {
    (Object.keys(priceForm) as ProductType[]).forEach((productType) => {
      const prices = priceForm[productType];
      settings.updateDefaultPrice(productType, prices.buying, prices.selling);
      products.updatePrices(productType, prices.buying, prices.selling);
    });
    toast.success('Default prices updated!');
  };

  const handleSaveThreshold = () => {
    settings.updateSettings({ lowStockThreshold });
    toast.success('Low stock threshold updated!');
  };

  const handleClearAllData = () => {
    if (confirm('WARNING: This will delete ALL data permanently. Are you sure?')) {
      localStorage.clear();
      toast.success('All data cleared. Refreshing...');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const productTypes: ProductType[] = ['Boneless', 'Kaleji/Pota', 'Whole Chicken', 'Chicken Waste'];

  return (
    <div className="space-y-6">
      {/* Business Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 size={20} className="text-blue-400" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input
                value={businessForm.businessName}
                onChange={(e) => setBusinessForm({...businessForm, businessName: e.target.value})}
                className="glass border-white/10"
                placeholder="Enter business name"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={businessForm.businessPhone}
                onChange={(e) => setBusinessForm({...businessForm, businessPhone: e.target.value})}
                className="glass border-white/10"
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <textarea
                value={businessForm.businessAddress}
                onChange={(e) => setBusinessForm({...businessForm, businessAddress: e.target.value})}
                className="w-full p-3 rounded-lg glass border-white/10 bg-transparent text-white resize-none"
                rows={3}
                placeholder="Enter business address"
              />
            </div>
            <Button
              onClick={handleSaveBusiness}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              <Save size={18} className="mr-2" />
              Save Business Info
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Default Prices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-emerald-400">Rs.</span>
              Default Prices (per kg/piece)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {productTypes.map((type) => (
                <div key={type} className="space-y-3 p-4 rounded-xl bg-white/5">
                  <h4 className="font-medium text-white">{type}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-400">Buying (Rs.)</Label>
                      <Input
                        type="number"
                        value={priceForm[type].buying}
                        onChange={(e) => setPriceForm({
                          ...priceForm,
                          [type]: { ...priceForm[type], buying: parseFloat(e.target.value) || 0 }
                        })}
                        className="glass border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-400">Selling (Rs.)</Label>
                      <Input
                        type="number"
                        value={priceForm[type].selling}
                        onChange={(e) => setPriceForm({
                          ...priceForm,
                          [type]: { ...priceForm[type], selling: parseFloat(e.target.value) || 0 }
                        })}
                        className="glass border-white/10"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Profit Margin:</span>
                    <span className="text-emerald-400">
                      +{((priceForm[type].selling - priceForm[type].buying) / priceForm[type].buying * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={handleSavePrices}
              className="mt-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
            >
              <Save size={18} className="mr-2" />
              Update Default Prices
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Inventory Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-amber-400">📦</span>
              Inventory Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Low Stock Threshold</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 10)}
                  className="glass border-white/10 w-32"
                />
                <span className="text-slate-400">units/kg</span>
              </div>
              <p className="text-sm text-slate-500">
                Products with stock below this threshold will trigger low stock alerts.
              </p>
            </div>
            <Button
              onClick={handleSaveThreshold}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Save size={18} className="mr-2" />
              Save Threshold
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-red-400">
              <AlertTriangle size={20} />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">
              These actions are irreversible. Please be careful.
            </p>
            <Button
              variant="destructive"
              onClick={handleClearAllData}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
            >
              <Trash2 size={18} className="mr-2" />
              Clear All Data
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* App Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">WhiteMeatShop ERP</h4>
                <p className="text-sm text-slate-400">Version 1.0.0</p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <Check size={14} className="mr-1" />
                Active
              </Badge>
            </div>
            <Separator className="my-4 bg-white/10" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Customers</p>
                <p className="font-medium">{customers.customers.length}</p>
              </div>
              <div>
                <p className="text-slate-400">Total Sales</p>
                <p className="font-medium">{sales.sales.length}</p>
              </div>
              <div>
                <p className="text-slate-400">Products</p>
                <p className="font-medium">{products.products.length}</p>
              </div>
              <div>
                <p className="text-slate-400">Storage</p>
                <p className="font-medium">Local</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

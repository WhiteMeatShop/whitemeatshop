import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  History,
  Check,
  Search,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { 
  Customer, 
  Sale, 
  Product, 
  StockEntry, 
  Expense,
  Settings,
  ProductType 
} from '@/types';

interface InventoryManagementProps {
  customers: {
    customers: Customer[];
  };
  sales: {
    sales: Sale[];
  };
  products: {
    products: Product[];
    updateProduct: (id: string, updates: Partial<Product>) => void;
    updateStock: (productType: ProductType, quantity: number, isAddition: boolean) => void;
    updatePrices: (productType: ProductType, buyingPrice: number, sellingPrice: number) => void;
    getLowStockProducts: () => Product[];
    getProductByType: (type: ProductType) => Product | undefined;
  };
  stockEntries: {
    stockEntries: StockEntry[];
    addStockEntry: (entry: Omit<StockEntry, 'id' | 'createdAt'>) => StockEntry;
    deleteStockEntry: (id: string) => void;
    getEntriesByProduct: (productType: ProductType) => StockEntry[];
    getEntriesByDateRange: (from: Date, to: Date) => StockEntry[];
  };
  expenses: {
    expenses: Expense[];
  };
  settings: {
    settings: Settings;
  };
}

const productTypes: ProductType[] = ['Boneless', 'Kaleji/Pota', 'Whole Chicken', 'Chicken Waste'];

export default function InventoryManagement({ 
  products, 
  stockEntries 
}: InventoryManagementProps) {
  const [showStockModal, setShowStockModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Stock entry form
  const [stockForm, setStockForm] = useState({
    supplierName: '',
    productType: 'Boneless' as ProductType,
    quantity: '',
    buyingCostPerUnit: '',
    sellingPricePerUnit: '',
  });

  const lowStockProducts = products.getLowStockProducts();

  const filteredProducts = useMemo(() => {
    return products.products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products.products, searchQuery]);

  const handleStockEntry = () => {
    if (!stockForm.supplierName || !stockForm.quantity || !stockForm.buyingCostPerUnit) {
      toast.error('Please fill all required fields');
      return;
    }

    const quantity = parseFloat(stockForm.quantity);
    const buyingCost = parseFloat(stockForm.buyingCostPerUnit);
    const sellingPrice = stockForm.sellingPricePerUnit 
      ? parseFloat(stockForm.sellingPricePerUnit)
      : (products.getProductByType(stockForm.productType)?.sellingPrice || 0);

    const totalInvestment = quantity * buyingCost;

    // Add stock entry
    stockEntries.addStockEntry({
      date: new Date().toISOString(),
      supplierName: stockForm.supplierName,
      productType: stockForm.productType,
      quantity,
      buyingCostPerUnit: buyingCost,
      sellingPricePerUnit: sellingPrice,
      totalInvestment,
    });

    // Update product stock
    products.updateStock(stockForm.productType, quantity, true);

    // Update prices if changed
    if (stockForm.sellingPricePerUnit) {
      products.updatePrices(stockForm.productType, buyingCost, sellingPrice);
    }

    toast.success('Stock entry added successfully!');
    resetStockForm();
    setShowStockModal(false);
  };

  const resetStockForm = () => {
    setStockForm({
      supplierName: '',
      productType: 'Boneless',
      quantity: '',
      buyingCostPerUnit: '',
      sellingPricePerUnit: '',
    });
  };

  const openHistory = (product: Product) => {
    setSelectedProduct(product);
    setShowHistoryModal(true);
  };

  const getStockLevelPercentage = (product: Product) => {
    const maxStock = Math.max(product.currentStock, product.lowStockThreshold * 2);
    return Math.min((product.currentStock / maxStock) * 100, 100);
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock <= product.lowStockThreshold) {
      return { label: 'Low Stock', color: 'text-red-400', bgColor: 'bg-red-500/20' };
    }
    if (product.currentStock <= product.lowStockThreshold * 1.5) {
      return { label: 'Medium', color: 'text-amber-400', bgColor: 'bg-amber-500/20' };
    }
    return { label: 'Good', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' };
  };

  const totalStockValue = products.products.reduce((sum, p) => 
    sum + (p.currentStock * p.buyingPrice), 0
  );

  const totalPotentialProfit = products.products.reduce((sum, p) => 
    sum + (p.currentStock * (p.sellingPrice - p.buyingPrice)), 0
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Total Stock Value</p>
                  <h3 className="text-2xl font-bold text-white">
                    Rs. {totalStockValue.toLocaleString()}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Package size={24} className="text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Potential Profit</p>
                  <h3 className="text-2xl font-bold text-emerald-400">
                    Rs. {totalPotentialProfit.toLocaleString()}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp size={24} className="text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Low Stock Alerts</p>
                  <h3 className={`text-2xl font-bold ${lowStockProducts.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {lowStockProducts.length} Products
                  </h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  lowStockProducts.length > 0 ? 'bg-red-500/20' : 'bg-emerald-500/20'
                }`}>
                  <AlertTriangle size={24} className={lowStockProducts.length > 0 ? 'text-red-400' : 'text-emerald-400'} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2 text-red-400">
            <AlertTriangle size={20} />
            Low Stock Alerts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {lowStockProducts.map((product) => (
              <Card key={product.id} className="glass border-red-500/30 bg-red-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{product.name}</p>
                      <p className="text-sm text-slate-400">
                        {product.currentStock} {product.unit} remaining
                      </p>
                    </div>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      Restock
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button 
          onClick={() => setShowStockModal(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        >
          <Plus size={18} className="mr-2" />
          Stock Entry
        </Button>

        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass border-white/10 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredProducts.map((product) => {
            const status = getStockStatus(product);
            const stockPercentage = getStockLevelPercentage(product);
            const profitMargin = ((product.sellingPrice - product.buyingPrice) / product.buyingPrice * 100).toFixed(1);
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="glass border-white/10 hover:border-amber-500/30 transition-all overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Package size={24} className="text-white" />
                      </div>
                      <Badge className={`${status.bgColor} ${status.color} border`}>
                        {status.label}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-1">{product.name}</h3>
                    <p className="text-sm text-slate-400 mb-4">
                      Current Stock: {product.currentStock} {product.unit}
                    </p>

                    {/* Stock Level Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Stock Level</span>
                        <span>{stockPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stockPercentage}%` }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                          className={`h-full rounded-full ${
                            status.label === 'Low Stock' ? 'bg-red-500' :
                            status.label === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Prices */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Buying:</span>
                        <span className="text-white">Rs. {product.buyingPrice}/{product.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Selling:</span>
                        <span className="text-white">Rs. {product.sellingPrice}/{product.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Profit:</span>
                        <span className="text-emerald-400">+{profitMargin}%</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openHistory(product)}
                        className="flex-1 glass border-white/10 hover:bg-white/10"
                      >
                        <History size={14} className="mr-1" />
                        History
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Stock Entry Modal */}
      <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
        <DialogContent className="glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Package className="text-amber-400" />
              Add Stock Entry
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Supplier Name *</Label>
              <Input
                value={stockForm.supplierName}
                onChange={(e) => setStockForm({...stockForm, supplierName: e.target.value})}
                className="glass border-white/10"
                placeholder="Enter supplier name"
              />
            </div>

            <div className="space-y-2">
              <Label>Product Type</Label>
              <Select 
                value={stockForm.productType} 
                onValueChange={(v) => setStockForm({...stockForm, productType: v as ProductType})}
              >
                <SelectTrigger className="glass border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border-white/10">
                  {productTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input
                type="number"
                value={stockForm.quantity}
                onChange={(e) => setStockForm({...stockForm, quantity: e.target.value})}
                className="glass border-white/10"
                placeholder="Enter quantity"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Buying Cost/Unit (Rs.) *</Label>
                <Input
                  type="number"
                  value={stockForm.buyingCostPerUnit}
                  onChange={(e) => setStockForm({...stockForm, buyingCostPerUnit: e.target.value})}
                  className="glass border-white/10"
                  placeholder="Cost price"
                />
              </div>
              <div className="space-y-2">
                <Label>Selling Price/Unit (Rs.)</Label>
                <Input
                  type="number"
                  value={stockForm.sellingPricePerUnit}
                  onChange={(e) => setStockForm({...stockForm, sellingPricePerUnit: e.target.value})}
                  className="glass border-white/10"
                  placeholder="Optional - updates price"
                />
              </div>
            </div>

            {/* Preview */}
            {stockForm.quantity && stockForm.buyingCostPerUnit && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-amber-400 font-medium">Total Investment</span>
                  <span className="text-xl font-bold text-amber-400">
                    Rs. {(parseFloat(stockForm.quantity) * parseFloat(stockForm.buyingCostPerUnit)).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowStockModal(false)}
                className="flex-1 glass border-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStockEntry}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Check size={18} className="mr-2" />
                Add Stock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <History className="text-amber-400" />
              {selectedProduct?.name} - Stock History
            </DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Cost/Unit</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockEntries.getEntriesByProduct(selectedProduct.name).map((entry) => (
                    <TableRow key={entry.id} className="border-white/5">
                      <TableCell>{format(new Date(entry.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{entry.supplierName}</TableCell>
                      <TableCell>{entry.quantity} {selectedProduct.unit}</TableCell>
                      <TableCell>Rs. {entry.buyingCostPerUnit}</TableCell>
                      <TableCell className="text-emerald-400">
                        Rs. {entry.totalInvestment.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {stockEntries.getEntriesByProduct(selectedProduct.name).length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  No stock history found
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

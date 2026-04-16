import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  X,
  ShoppingCart,
  Calendar,
  User,
  Package,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  ProductType,
  SaleItem 
} from '@/types';

interface SalesManagementProps {
  customers: {
    customers: Customer[];
    getCustomerById: (id: string) => Customer | undefined;
    updateOutstandingBalance: (customerId: string, amount: number) => void;
  };
  sales: {
    sales: Sale[];
    addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => Sale;
    updateSale: (id: string, updates: Partial<Sale>) => void;
    deleteSale: (id: string) => void;
    getSalesByCustomer: (customerId: string) => Sale[];
  };
  products: {
    products: Product[];
    getProductByType: (type: ProductType) => Product | undefined;
    updateStock: (productType: ProductType, quantity: number, isAddition: boolean) => void;
  };
  stockEntries: {
    stockEntries: StockEntry[];
  };
  expenses: {
    expenses: Expense[];
  };
  settings: {
    settings: Settings;
  };
}

const productTypes: ProductType[] = ['Boneless', 'Kaleji/Pota', 'Whole Chicken', 'Chicken Waste'];

export default function SalesManagement({ 
  customers, 
  sales, 
  products 
}: SalesManagementProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending' | 'Partial'>('Paid');
  const [amountPaid, setAmountPaid] = useState(0);
  const [notes, setNotes] = useState('');
  const [currentItem, setCurrentItem] = useState<{
    productType: ProductType;
    quantity: string;
    pricePerUnit: string;
  }>({
    productType: 'Boneless',
    quantity: '',
    pricePerUnit: ''
  });
  const [manualPrice, setManualPrice] = useState(false);

  const filteredSales = useMemo(() => {
    return sales.sales.filter(sale => {
      const matchesSearch = 
        sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.items.some(i => i.productType.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || sale.paymentStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [sales.sales, searchQuery, filterStatus]);

  const addItemToSale = () => {
    if (!currentItem.quantity || parseFloat(currentItem.quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const product = products.getProductByType(currentItem.productType);
    const price = manualPrice && currentItem.pricePerUnit 
      ? parseFloat(currentItem.pricePerUnit)
      : (product?.sellingPrice || 0);

    const quantity = parseFloat(currentItem.quantity);
    
    if (product && product.currentStock < quantity) {
      toast.error(`Insufficient stock for ${currentItem.productType}. Available: ${product.currentStock}`);
      return;
    }

    const newItem: SaleItem = {
      productType: currentItem.productType,
      quantity,
      unit: product?.unit || 'kg',
      pricePerUnit: price,
      total: price * quantity
    };

    setSaleItems([...saleItems, newItem]);
    setCurrentItem({
      productType: 'Boneless',
      quantity: '',
      pricePerUnit: ''
    });
    setManualPrice(false);
  };

  const removeItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return saleItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }
    if (saleItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const customer = customers.getCustomerById(selectedCustomer);
    if (!customer) return;

    const totalAmount = calculateTotal();
    const finalAmountPaid = paymentStatus === 'Paid' ? totalAmount : 
                           paymentStatus === 'Pending' ? 0 : amountPaid;

    sales.addSale({
      customerId: selectedCustomer,
      customerName: customer.name,
      items: saleItems,
      totalAmount,
      paymentStatus,
      amountPaid: finalAmountPaid,
      notes,
      date: new Date().toISOString()
    });

    // Update stock
    saleItems.forEach(item => {
      products.updateStock(item.productType, item.quantity, false);
    });

    // Update customer outstanding balance
    if (paymentStatus !== 'Paid') {
      customers.updateOutstandingBalance(selectedCustomer, totalAmount - finalAmountPaid);
    }

    toast.success('Sale added successfully!');
    resetForm();
    setShowAddModal(false);
  };

  const resetForm = () => {
    setSelectedCustomer('');
    setSaleItems([]);
    setPaymentStatus('Paid');
    setAmountPaid(0);
    setNotes('');
    setCurrentItem({
      productType: 'Boneless',
      quantity: '',
      pricePerUnit: ''
    });
  };

  const handleDelete = (sale: Sale) => {
    if (confirm('Are you sure you want to delete this sale?')) {
      // Restore stock
      sale.items.forEach(item => {
        products.updateStock(item.productType, item.quantity, true);
      });
      
      // Restore customer balance if pending
      if (sale.paymentStatus !== 'Paid') {
        customers.updateOutstandingBalance(sale.customerId, -(sale.totalAmount - sale.amountPaid));
      }
      
      sales.deleteSale(sale.id);
      toast.success('Sale deleted successfully!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Partial': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white">
                <Plus size={18} className="mr-2" />
                Add New Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-strong border-white/10">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart className="text-emerald-400" />
                  Add New Sale
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Customer Selection */}
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger className="glass border-white/10">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-white/10">
                      {customers.customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.businessName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Add Items */}
                <Card className="glass border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Add Items</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs">Product</Label>
                        <Select 
                          value={currentItem.productType} 
                          onValueChange={(v) => setCurrentItem({...currentItem, productType: v as ProductType})}
                        >
                          <SelectTrigger className="glass border-white/10 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-strong border-white/10">
                            {productTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          value={currentItem.quantity}
                          onChange={(e) => setCurrentItem({...currentItem, quantity: e.target.value})}
                          className="glass border-white/10 mt-1"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label className="text-xs flex items-center gap-2">
                          Price (Rs.)
                          <input
                            type="checkbox"
                            checked={manualPrice}
                            onChange={(e) => setManualPrice(e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-[10px] text-slate-400">Manual</span>
                        </Label>
                        <Input
                          type="number"
                          value={currentItem.pricePerUnit}
                          onChange={(e) => setCurrentItem({...currentItem, pricePerUnit: e.target.value})}
                          className="glass border-white/10 mt-1"
                          placeholder={manualPrice ? 'Enter price' : 'Auto'}
                          disabled={!manualPrice}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button 
                          onClick={addItemToSale}
                          variant="outline"
                          className="w-full glass border-white/10 hover:bg-white/10"
                        >
                          <Plus size={16} className="mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Items List */}
                    {saleItems.length > 0 && (
                      <div className="space-y-2">
                        {saleItems.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                          >
                            <div className="flex items-center gap-3">
                              <Package size={16} className="text-cyan-400" />
                              <span>{item.productType}</span>
                              <span className="text-slate-400">×</span>
                              <span>{item.quantity} {item.unit}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-emerald-400">Rs. {item.total.toLocaleString()}</span>
                              <button 
                                onClick={() => removeItem(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Status */}
                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <div className="flex gap-2">
                    {(['Paid', 'Pending', 'Partial'] as const).map((status) => (
                      <Button
                        key={status}
                        type="button"
                        variant={paymentStatus === status ? 'default' : 'outline'}
                        onClick={() => setPaymentStatus(status)}
                        className={`flex-1 ${
                          paymentStatus === status 
                            ? status === 'Paid' ? 'bg-emerald-500' : 
                              status === 'Pending' ? 'bg-amber-500' : 'bg-blue-500'
                            : 'glass border-white/10'
                        }`}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>

                {paymentStatus === 'Partial' && (
                  <div className="space-y-2">
                    <Label>Amount Paid (Rs.)</Label>
                    <Input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                      className="glass border-white/10"
                    />
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 rounded-lg glass border-white/10 bg-transparent text-white resize-none"
                    rows={3}
                    placeholder="Add any notes..."
                  />
                </div>

                {/* Total */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30">
                  <span className="text-lg font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    Rs. {calculateTotal().toLocaleString()}
                  </span>
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 glass border-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                  >
                    <Check size={18} className="mr-2" />
                    Complete Sale
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search sales..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass border-white/10 w-full sm:w-64"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] glass border-white/10">
              <Filter size={16} className="mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="glass-strong border-white/10">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Partial">Partial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sales Table */}
      <Card className="glass border-white/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-slate-400">Date</TableHead>
                  <TableHead className="text-slate-400">Customer</TableHead>
                  <TableHead className="text-slate-400">Items</TableHead>
                  <TableHead className="text-slate-400">Amount</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredSales.map((sale) => (
                    <motion.tr
                      key={sale.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          {format(new Date(sale.date), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400" />
                          {sale.customerName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {sale.items.map((item, i) => (
                            <Badge 
                              key={i} 
                              variant="outline" 
                              className="text-xs glass border-white/10"
                            >
                              {item.productType} × {item.quantity}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-emerald-400">
                        Rs. {sale.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(sale.paymentStatus)} border`}>
                          {sale.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(sale)}
                            className="hover:bg-red-500/20 hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
          
          {filteredSales.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400">No sales found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

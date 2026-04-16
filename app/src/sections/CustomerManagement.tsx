import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  User,
  Wallet,
  History,
  FileText,
  Download
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { 
  Customer, 
  Sale, 
  Product, 
  StockEntry, 
  Expense,
  Settings 
} from '@/types';

interface CustomerManagementProps {
  customers: {
    customers: Customer[];
    addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
    updateCustomer: (id: string, updates: Partial<Customer>) => void;
    deleteCustomer: (id: string) => void;
    getCustomerById: (id: string) => Customer | undefined;
  };
  sales: {
    sales: Sale[];
    getSalesByCustomer: (customerId: string) => Sale[];
  };
  products: {
    products: Product[];
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

const categories = ['Hotel', 'Restaurant', 'Retail', 'Wholesale'] as const;
type Category = typeof categories[number];

export default function CustomerManagement({ 
  customers, 
  sales 
}: CustomerManagementProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    businessName: '',
    address: '',
    category: 'Retail' as Category,
  });

  const filteredCustomers = useMemo(() => {
    return customers.customers.filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.businessName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || customer.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [customers.customers, searchQuery, filterCategory]);

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      toast.error('Name and phone are required');
      return;
    }

    if (editingCustomer) {
      customers.updateCustomer(editingCustomer.id, formData);
      toast.success('Customer updated successfully!');
    } else {
      customers.addCustomer({
        ...formData,
        outstandingBalance: 0,
      });
      toast.success('Customer added successfully!');
    }
    
    resetForm();
    setShowAddModal(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      businessName: '',
      address: '',
      category: 'Retail',
    });
    setEditingCustomer(null);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      businessName: customer.businessName,
      address: customer.address,
      category: customer.category,
    });
    setShowAddModal(true);
  };

  const handleDelete = (customer: Customer) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      customers.deleteCustomer(customer.id);
      toast.success('Customer deleted successfully!');
    }
  };

  const openCustomerDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const getCustomerSales = (customerId: string) => {
    return sales.getSalesByCustomer(customerId).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Hotel': return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
      case 'Restaurant': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Retail': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Wholesale': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button 
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
        >
          <Plus size={18} className="mr-2" />
          Add Customer
        </Button>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass border-white/10 w-full sm:w-64"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px] glass border-white/10">
              <Filter size={16} className="mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="glass-strong border-white/10">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => openCustomerDetail(customer)}
              className="cursor-pointer"
            >
              <Card className="glass border-white/10 hover:border-violet-500/30 transition-all overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {customer.name.charAt(0)}
                    </div>
                    <Badge className={`${getCategoryColor(customer.category)} border`}>
                      {customer.category}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-1">{customer.name}</h3>
                  <p className="text-sm text-slate-400 mb-4">{customer.businessName}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone size={14} className="text-slate-500" />
                      {customer.phone}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin size={14} className="text-slate-500" />
                      <span className="truncate">{customer.address || 'No address'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet size={16} className="text-slate-400" />
                      <span className="text-sm text-slate-400">Balance:</span>
                    </div>
                    <span className={`font-semibold ${
                      customer.outstandingBalance > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      Rs. {customer.outstandingBalance.toLocaleString()}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(customer);
                      }}
                      className="w-8 h-8 bg-white/10 hover:bg-violet-500/20"
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(customer);
                      }}
                      className="w-8 h-8 bg-white/10 hover:bg-red-500/20"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <User size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No customers found</p>
        </div>
      )}

      {/* Add/Edit Customer Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="glass border-white/10"
                placeholder="Enter customer name"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="glass border-white/10"
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Business/Hotel Name</Label>
              <Input
                value={formData.businessName}
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                className="glass border-white/10"
                placeholder="Enter business name"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData({...formData, category: v as Category})}
              >
                <SelectTrigger className="glass border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border-white/10">
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Address</Label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full p-3 rounded-lg glass border-white/10 bg-transparent text-white resize-none"
                rows={3}
                placeholder="Enter address"
              />
            </div>

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
                className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
              >
                {editingCustomer ? 'Update' : 'Add'} Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-strong border-white/10">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold">{selectedCustomer.name}</DialogTitle>
                    <p className="text-slate-400">{selectedCustomer.businessName}</p>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="history" className="mt-6">
                <TabsList className="glass border-white/10">
                  <TabsTrigger value="history" className="data-[state=active]:bg-violet-500/20">
                    <History size={16} className="mr-2" />
                    Purchase History
                  </TabsTrigger>
                  <TabsTrigger value="ledger" className="data-[state=active]:bg-violet-500/20">
                    <FileText size={16} className="mr-2" />
                    Ledger
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="history" className="mt-4">
                  <Card className="glass border-white/10">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/10">
                            <TableHead>Date</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getCustomerSales(selectedCustomer.id).map((sale) => (
                            <TableRow key={sale.id} className="border-white/5">
                              <TableCell>{format(new Date(sale.date), 'MMM dd, yyyy')}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {sale.items.map((item, i) => (
                                    <Badge key={i} variant="outline" className="text-xs glass">
                                      {item.productType} × {item.quantity}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-emerald-400">
                                Rs. {sale.totalAmount.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Badge className={`${
                                  sale.paymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' :
                                  sale.paymentStatus === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {sale.paymentStatus}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      {getCustomerSales(selectedCustomer.id).length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                          No purchase history found
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ledger" className="mt-4">
                  <Card className="glass border-white/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Running Balance Statement</CardTitle>
                        <Button variant="outline" size="sm" className="glass border-white/10">
                          <Download size={16} className="mr-2" />
                          Print Statement
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 rounded-lg bg-white/5">
                          <span className="text-slate-400">Total Purchases</span>
                          <span className="text-xl font-semibold">
                            Rs. {getCustomerSales(selectedCustomer.id)
                              .reduce((sum, s) => sum + s.totalAmount, 0)
                              .toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-lg bg-white/5">
                          <span className="text-slate-400">Total Paid</span>
                          <span className="text-xl font-semibold text-emerald-400">
                            Rs. {getCustomerSales(selectedCustomer.id)
                              .reduce((sum, s) => sum + s.amountPaid, 0)
                              .toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                          <span className="text-amber-400 font-medium">Outstanding Balance</span>
                          <span className="text-2xl font-bold text-amber-400">
                            Rs. {selectedCustomer.outstandingBalance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Plus,
  Check,
  Wallet,
  Receipt,
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
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { toast } from 'sonner';
import { format, subDays, subMonths } from 'date-fns';
import type { 
  Customer, 
  Sale, 
  Product, 
  StockEntry, 
  Expense,
  Settings 
} from '@/types';

interface FinancialsProps {
  customers: {
    customers: Customer[];
  };
  sales: {
    sales: Sale[];
    getTodaySales: () => Sale[];
    getSalesByDateRange: (from: Date, to: Date) => Sale[];
  };
  products: {
    products: Product[];
  };
  stockEntries: {
    stockEntries: StockEntry[];
  };
  expenses: {
    expenses: Expense[];
    addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Expense;
    deleteExpense: (id: string) => void;
    getTotalExpenses: (from?: Date, to?: Date) => number;
  };
  settings: {
    settings: Settings;
  };
}

const expenseCategories = ['Rent', 'Electricity', 'Transport', 'Salaries', 'Other'] as const;
const COLORS = ['#4ade80', '#22d3ee', '#a78bfa', '#fbbf24', '#f472b6'];

export default function Financials({ 
  sales, 
  products, 
  expenses 
}: FinancialsProps) {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // Expense form
  const [expenseForm, setExpenseForm] = useState({
    category: 'Other' as typeof expenseCategories[number],
    description: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const dateRangeConfig = {
    today: { from: new Date(), to: new Date() },
    week: { from: subDays(new Date(), 7), to: new Date() },
    month: { from: subDays(new Date(), 30), to: new Date() },
    year: { from: subMonths(new Date(), 12), to: new Date() },
  };

  const financials = useMemo(() => {
    const { from, to } = dateRangeConfig[dateRange];
    const rangeSales = sales.getSalesByDateRange(from, to);
    
    // Calculate revenue and profit
    const totalRevenue = rangeSales.reduce((sum, s) => sum + s.totalAmount, 0);
    
    const totalProfit = rangeSales.reduce((sum, s) => {
      return sum + s.items.reduce((itemSum, item) => {
        const product = products.products.find(p => p.name === item.productType);
        if (product) {
          const profitPerUnit = item.pricePerUnit - product.buyingPrice;
          return itemSum + (profitPerUnit * item.quantity);
        }
        return itemSum;
      }, 0);
    }, 0);

    const totalExpenses = expenses.getTotalExpenses(from, to);
    const netProfit = totalProfit - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100).toFixed(1) : '0';

    // Expense breakdown
    const expenseBreakdown = expenseCategories.map((category, index) => {
      const categoryExpenses = expenses.expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return e.category === category && expenseDate >= from && expenseDate <= to;
      });
      const amount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
      return { name: category, value: amount, color: COLORS[index] };
    }).filter(e => e.value > 0);

    // Daily profit chart data
    const dailyData = Array.from({ length: dateRange === 'today' ? 1 : dateRange === 'week' ? 7 : dateRange === 'month' ? 15 : 12 }, (_, i) => {
      let date: Date;
      let label: string;
      
      if (dateRange === 'today') {
        date = new Date();
        label = 'Today';
      } else if (dateRange === 'year') {
        date = subMonths(new Date(), 11 - i);
        label = format(date, 'MMM');
      } else {
        const days = dateRange === 'week' ? 7 : 15;
        const step = dateRange === 'month' ? 2 : 1;
        date = subDays(new Date(), (days - 1 - i) * step);
        label = format(date, 'MMM dd');
      }

      const daySales = sales.sales.filter(s => {
        const saleDate = new Date(s.date);
        if (dateRange === 'year') {
          return saleDate.getMonth() === date.getMonth() && saleDate.getFullYear() === date.getFullYear();
        }
        return saleDate.toDateString() === date.toDateString();
      });

      const revenue = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
      const profit = daySales.reduce((sum, s) => {
        return sum + s.items.reduce((itemSum, item) => {
          const product = products.products.find(p => p.name === item.productType);
          if (product) {
            const profitPerUnit = item.pricePerUnit - product.buyingPrice;
            return itemSum + (profitPerUnit * item.quantity);
          }
          return itemSum;
        }, 0);
      }, 0);

      return { label, revenue, profit };
    });

    return {
      totalRevenue,
      totalProfit,
      totalExpenses,
      netProfit,
      profitMargin,
      expenseBreakdown,
      dailyData,
      outstandingPayments: sales.sales
        .filter(s => s.paymentStatus !== 'Paid')
        .reduce((sum, s) => sum + (s.totalAmount - s.amountPaid), 0),
    };
  }, [sales, products, expenses, dateRange]);

  const handleAddExpense = () => {
    if (!expenseForm.description || !expenseForm.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    expenses.addExpense({
      category: expenseForm.category,
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      date: new Date(expenseForm.date).toISOString(),
    });

    toast.success('Expense added successfully!');
    resetExpenseForm();
    setShowExpenseModal(false);
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      category: 'Other',
      description: '',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `Rs. ${financials.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: '#4ade80',
      trend: `+${financials.profitMargin}% margin`,
    },
    {
      title: 'Gross Profit',
      value: `Rs. ${financials.totalProfit.toLocaleString()}`,
      icon: TrendingUp,
      color: '#22d3ee',
      trend: 'Before expenses',
    },
    {
      title: 'Total Expenses',
      value: `Rs. ${financials.totalExpenses.toLocaleString()}`,
      icon: Receipt,
      color: '#f472b6',
      trend: 'Operational costs',
    },
    {
      title: 'Net Profit',
      value: `Rs. ${financials.netProfit.toLocaleString()}`,
      icon: Wallet,
      color: financials.netProfit >= 0 ? '#a78bfa' : '#ef4444',
      trend: financials.netProfit >= 0 ? 'Profit' : 'Loss',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          {(['today', 'week', 'month', 'year'] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? 'default' : 'outline'}
              onClick={() => setDateRange(range)}
              className={`capitalize ${
                dateRange === range 
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' 
                  : 'glass border-white/10'
              }`}
            >
              {range}
            </Button>
          ))}
        </div>

        <Button 
          onClick={() => setShowExpenseModal(true)}
          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
        >
          <Plus size={18} className="mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="glass border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">{stat.title}</p>
                      <h3 className="text-2xl font-bold" style={{ color: stat.color }}>
                        {stat.value}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">{stat.trend}</p>
                    </div>
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}20` }}
                    >
                      <Icon size={24} style={{ color: stat.color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-400" />
                Revenue vs Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financials.dailyData}>
                    <defs>
                      <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => `Rs.${v/1000}k`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`Rs. ${value.toLocaleString()}`]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#4ade80" strokeWidth={2} fill="url(#colorRevenue2)" name="Revenue" />
                    <Area type="monotone" dataKey="profit" stroke="#22d3ee" strokeWidth={2} fill="url(#colorProfit)" name="Profit" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expense Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Receipt size={18} className="text-pink-400" />
                Expense Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={financials.expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {financials.expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`Rs. ${value.toLocaleString()}`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {financials.expenseBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-slate-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Outstanding Payments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Wallet size={18} className="text-amber-400" />
                Outstanding Payments
              </CardTitle>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                Rs. {financials.outstandingPayments.toLocaleString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-sm text-slate-400 mb-1">Pending Invoices</p>
                <p className="text-2xl font-semibold text-white">
                  {sales.sales.filter(s => s.paymentStatus === 'Pending').length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-sm text-slate-400 mb-1">Partial Payments</p>
                <p className="text-2xl font-semibold text-white">
                  {sales.sales.filter(s => s.paymentStatus === 'Partial').length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                <p className="text-sm text-amber-400 mb-1">Total Outstanding</p>
                <p className="text-2xl font-semibold text-amber-400">
                  Rs. {financials.outstandingPayments.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Expense Modal */}
      <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
        <DialogContent className="glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Receipt className="text-pink-400" />
              Add Expense
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={expenseForm.category} 
                onValueChange={(v) => setExpenseForm({...expenseForm, category: v as typeof expenseCategories[number]})}
              >
                <SelectTrigger className="glass border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border-white/10">
                  {expenseCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Input
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                className="glass border-white/10"
                placeholder="Enter expense description"
              />
            </div>

            <div className="space-y-2">
              <Label>Amount (Rs.) *</Label>
              <Input
                type="number"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                className="glass border-white/10"
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                className="glass border-white/10"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowExpenseModal(false)}
                className="flex-1 glass border-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddExpense}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                <Check size={18} className="mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

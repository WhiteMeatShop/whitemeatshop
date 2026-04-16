import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { format, subDays } from 'date-fns';
import type { 
  Customer, 
  Sale, 
  Product, 
  StockEntry, 
  Expense,
  Settings 
} from '@/types';

interface DashboardProps {
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
    getLowStockProducts: () => Product[];
  };
  stockEntries: {
    stockEntries: StockEntry[];
  };
  expenses: {
    expenses: Expense[];
    getTotalExpenses: (from?: Date, to?: Date) => number;
  };
  settings: {
    settings: Settings;
  };
}

const COLORS = ['#4ade80', '#22d3ee', '#a78bfa', '#fbbf24'];

export default function Dashboard({ 
  customers, 
  sales, 
  products 
}: DashboardProps) {
  
  // Calculate stats
  const stats = useMemo(() => {
    const todaySales = sales.getTodaySales();
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const todayProfit = todaySales.reduce((sum, s) => {
      return sum + s.items.reduce((itemSum, item) => {
        const product = products.products.find(p => p.name === item.productType);
        if (product) {
          const profitPerUnit = item.pricePerUnit - product.buyingPrice;
          return itemSum + (profitPerUnit * item.quantity);
        }
        return itemSum;
      }, 0);
    }, 0);

    const totalOutstanding = customers.customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
    const lowStockCount = products.getLowStockProducts().length;
    
    // Last 7 days sales
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const daySales = sales.sales.filter(s => 
        new Date(s.date).toDateString() === date.toDateString()
      );
      const revenue = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
      return {
        date: format(date, 'EEE'),
        revenue,
        sales: daySales.length
      };
    });

    // Product sales distribution
    const productSales = products.products.map(product => {
      const productRevenue = sales.sales.reduce((sum, s) => {
        const items = s.items.filter(i => i.productType === product.name);
        return sum + items.reduce((itemSum, i) => itemSum + i.total, 0);
      }, 0);
      return {
        name: product.name,
        value: productRevenue
      };
    });

    // Top customers
    const topCustomers = customers.customers
      .map(customer => {
        const customerSales = sales.sales.filter(s => s.customerId === customer.id);
        const revenue = customerSales.reduce((sum, s) => sum + s.totalAmount, 0);
        return {
          name: customer.name,
          revenue,
          category: customer.category
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      todayRevenue,
      todayProfit,
      totalOutstanding,
      lowStockCount,
      totalCustomers: customers.customers.length,
      totalSales: sales.sales.length,
      last7Days,
      productSales,
      topCustomers
    };
  }, [customers, sales, products]);

  const statCards = [
    {
      title: "Today's Revenue",
      value: `Rs. ${stats.todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: '#4ade80',
      trend: '+12.5%',
      trendUp: true
    },
    {
      title: "Today's Profit",
      value: `Rs. ${stats.todayProfit.toLocaleString()}`,
      icon: TrendingUp,
      color: '#22d3ee',
      trend: '+8.3%',
      trendUp: true
    },
    {
      title: 'Outstanding',
      value: `Rs. ${stats.totalOutstanding.toLocaleString()}`,
      icon: ShoppingCart,
      color: '#fbbf24',
      trend: 'Pending',
      trendUp: null
    },
    {
      title: 'Low Stock Alert',
      value: `${stats.lowStockCount} Products`,
      icon: Package,
      color: stats.lowStockCount > 0 ? '#ef4444' : '#a78bfa',
      trend: stats.lowStockCount > 0 ? 'Action Needed' : 'All Good',
      trendUp: stats.lowStockCount === 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ 
                y: -8, 
                rotateX: 5,
                transition: { type: 'spring', stiffness: 300 }
              }}
              className="card-3d"
            >
              <Card className="stats-card overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">{stat.title}</p>
                      <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                      {stat.trend && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${
                          stat.trendUp === true ? 'text-emerald-400' : 
                          stat.trendUp === false ? 'text-red-400' : 'text-amber-400'
                        }`}>
                          <span>{stat.trend}</span>
                        </div>
                      )}
                    </div>
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: `${stat.color}20`,
                        boxShadow: `0 0 20px ${stat.color}30`
                      }}
                    >
                      <Icon size={24} style={{ color: stat.color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-400" />
                Last 7 Days Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.last7Days}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(value) => `Rs.${value/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#4ade80" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Product Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Package size={18} className="text-cyan-400" />
                Sales by Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.productSales}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.productSales.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                {stats.productSales.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-slate-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Customers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="glass border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users size={18} className="text-violet-400" />
                Top Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topCustomers.map((customer, index) => (
                  <motion.div
                    key={customer.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{customer.name}</p>
                        <p className="text-sm text-slate-400">{customer.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-400">
                        Rs. {customer.revenue.toLocaleString()}
                      </p>
                      <div className="w-32 h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(customer.revenue / stats.topCustomers[0].revenue) * 100}%` }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass border-white/10 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar size={18} className="text-amber-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Add New Sale', icon: ShoppingCart, color: '#4ade80' },
                  { label: 'Add Customer', icon: Users, color: '#22d3ee' },
                  { label: 'Stock Entry', icon: Package, color: '#fbbf24' },
                  { label: 'Add Expense', icon: DollarSign, color: '#f472b6' },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.label}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left"
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${action.color}20` }}
                      >
                        <Icon size={18} style={{ color: action.color }} />
                      </div>
                      <span className="font-medium text-slate-200">{action.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

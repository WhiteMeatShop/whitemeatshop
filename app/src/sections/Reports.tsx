import { useState, useMemo } from 'react';
import {
  Download,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Printer,
  BarChart3,
  Table2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface ReportsProps {
  customers: {
    customers: Customer[];
  };
  sales: {
    sales: Sale[];
    getSalesByDateRange: (from: Date, to: Date) => Sale[];
  };
  products: {
    products: Product[];
  };
  stockEntries: {
    stockEntries: StockEntry[];
    getEntriesByDateRange: (from: Date, to: Date) => StockEntry[];
  };
  expenses: {
    expenses: Expense[];
    getTotalExpenses: (from?: Date, to?: Date) => number;
  };
  settings: {
    settings: Settings;
  };
}

export default function Reports({ 
  customers, 
  sales, 
  products, 
  stockEntries, 
  expenses 
}: ReportsProps) {
  const [dateFrom, setDateFrom] = useState(format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fromDate = useMemo(() => new Date(dateFrom), [dateFrom]);
  const toDate = useMemo(() => new Date(dateTo), [dateTo]);

  const reportData = useMemo(() => {
    const rangeSales = sales.getSalesByDateRange(fromDate, toDate);
    const rangeStockEntries = stockEntries.getEntriesByDateRange(fromDate, toDate);
    const rangeExpenses = expenses.getTotalExpenses(fromDate, toDate);

    // Sales Report
    const totalSales = rangeSales.reduce((sum, s) => sum + s.totalAmount, 0);
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
    const itemsSold = rangeSales.reduce((sum, s) => sum + s.items.reduce((i, item) => i + item.quantity, 0), 0);

    // Product breakdown
    const productBreakdown: Record<ProductType, { quantity: number; revenue: number }> = {
      'Boneless': { quantity: 0, revenue: 0 },
      'Kaleji/Pota': { quantity: 0, revenue: 0 },
      'Whole Chicken': { quantity: 0, revenue: 0 },
      'Chicken Waste': { quantity: 0, revenue: 0 },
    };

    rangeSales.forEach(sale => {
      sale.items.forEach(item => {
        productBreakdown[item.productType].quantity += item.quantity;
        productBreakdown[item.productType].revenue += item.total;
      });
    });

    // Customer breakdown
    const customerRevenue: Record<string, { name: string; revenue: number; category: string }> = {};
    rangeSales.forEach(sale => {
      if (!customerRevenue[sale.customerId]) {
        const customer = customers.customers.find(c => c.id === sale.customerId);
        customerRevenue[sale.customerId] = {
          name: sale.customerName,
          revenue: 0,
          category: customer?.category || 'Unknown'
        };
      }
      customerRevenue[sale.customerId].revenue += sale.totalAmount;
    });

    const topCustomers = Object.values(customerRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Inventory Report
    const totalStockValue = products.products.reduce((sum, p) => sum + (p.currentStock * p.buyingPrice), 0);
    const totalStockPotential = products.products.reduce((sum, p) => 
      sum + (p.currentStock * (p.sellingPrice - p.buyingPrice)), 0
    );

    // Outstanding payments
    const outstandingCustomers = customers.customers
      .filter(c => c.outstandingBalance > 0)
      .sort((a, b) => b.outstandingBalance - a.outstandingBalance);

    return {
      sales: { totalSales, totalProfit, itemsSold, productBreakdown },
      topCustomers,
      inventory: { totalStockValue, totalStockPotential, stockEntries: rangeStockEntries },
      expenses: rangeExpenses,
      outstandingCustomers,
    };
  }, [sales, products, customers, stockEntries, expenses, fromDate, toDate]);

  const handleExportPDF = () => {
    toast.success('Report exported as PDF!');
    window.print();
  };

  const handleExportExcel = () => {
    const data = {
      salesReport: reportData.sales,
      topCustomers: reportData.topCustomers,
      inventory: reportData.inventory,
      outstanding: reportData.outstandingCustomers,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${dateFrom}_to_${dateTo}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report data exported!');
  };

  return (
    <div className="space-y-6">
      {/* Date Range & Actions */}
      <Card className="glass border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-slate-400">From Date</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="glass border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-slate-400">To Date</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="glass border-white/10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExportPDF}
                className="glass border-white/10 hover:bg-white/10"
              >
                <Printer size={18} className="mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                onClick={handleExportExcel}
                className="glass border-white/10 hover:bg-white/10"
              >
                <Download size={18} className="mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="glass border-white/10">
          <TabsTrigger value="sales" className="data-[state=active]:bg-emerald-500/20">
            <TrendingUp size={16} className="mr-2" />
            Sales Report
          </TabsTrigger>
          <TabsTrigger value="customers" className="data-[state=active]:bg-violet-500/20">
            <Users size={16} className="mr-2" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="inventory" className="data-[state=active]:bg-amber-500/20">
            <Package size={16} className="mr-2" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="outstanding" className="data-[state=active]:bg-red-500/20">
            <DollarSign size={16} className="mr-2" />
            Outstanding
          </TabsTrigger>
        </TabsList>

        {/* Sales Report */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <DollarSign size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Total Sales</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      Rs. {reportData.sales.totalSales.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <TrendingUp size={24} className="text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Total Profit</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      Rs. {reportData.sales.totalProfit.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Package size={24} className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Items Sold</p>
                    <p className="text-2xl font-bold text-violet-400">
                      {reportData.sales.itemsSold.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 size={18} className="text-emerald-400" />
                Sales by Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(reportData.sales.productBreakdown).map(([product, data]) => (
                    <TableRow key={product} className="border-white/5">
                      <TableCell className="font-medium">{product}</TableCell>
                      <TableCell className="text-right">{data.quantity}</TableCell>
                      <TableCell className="text-right text-emerald-400">
                        Rs. {data.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {reportData.sales.totalSales > 0 
                          ? ((data.revenue / reportData.sales.totalSales) * 100).toFixed(1) 
                          : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Report */}
        <TabsContent value="customers" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users size={18} className="text-violet-400" />
                Top 10 Customers by Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead>Rank</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.topCustomers.map((customer, index) => (
                    <TableRow key={customer.name} className="border-white/5">
                      <TableCell>
                        <Badge className="bg-violet-500/20 text-violet-400">#{index + 1}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="glass border-white/10">
                          {customer.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-emerald-400">
                        Rs. {customer.revenue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {reportData.topCustomers.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  No customer data available for this period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Report */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Package size={24} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Current Stock Value</p>
                    <p className="text-2xl font-bold text-amber-400">
                      Rs. {reportData.inventory.totalStockValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Potential Profit</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      Rs. {reportData.inventory.totalStockPotential.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Table2 size={18} className="text-amber-400" />
                Current Stock Levels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Buying Price</TableHead>
                    <TableHead className="text-right">Selling Price</TableHead>
                    <TableHead className="text-right">Profit Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.products.map((product) => (
                    <TableRow key={product.id} className="border-white/5">
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className={`text-right ${
                        product.currentStock <= product.lowStockThreshold ? 'text-red-400' : ''
                      }`}>
                        {product.currentStock} {product.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        Rs. {product.buyingPrice}
                      </TableCell>
                      <TableCell className="text-right">
                        Rs. {product.sellingPrice}
                      </TableCell>
                      <TableCell className="text-right text-emerald-400">
                        +{((product.sellingPrice - product.buyingPrice) / product.buyingPrice * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outstanding Report */}
        <TabsContent value="outstanding" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign size={18} className="text-red-400" />
                  Outstanding Payments
                </CardTitle>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  Total: Rs. {reportData.outstandingCustomers.reduce((sum, c) => sum + c.outstandingBalance, 0).toLocaleString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead>Customer</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.outstandingCustomers.map((customer) => (
                    <TableRow key={customer.id} className="border-white/5">
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.businessName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="glass border-white/10">
                          {customer.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-red-400 font-semibold">
                        Rs. {customer.outstandingBalance.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {reportData.outstandingCustomers.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  No outstanding payments
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

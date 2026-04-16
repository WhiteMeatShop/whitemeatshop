import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  FileText,
  Settings,
  Menu,
  X,
  TrendingUp,
  AlertCircle,
  Download,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Import sections
import Dashboard from '@/sections/Dashboard';
import SalesManagement from '@/sections/SalesManagement';
import CustomerManagement from '@/sections/CustomerManagement';
import InventoryManagement from '@/sections/InventoryManagement';
import Financials from '@/sections/Financials';
import Reports from '@/sections/Reports';
import SettingsPanel from '@/sections/SettingsPanel';

// Import hooks
import { 
  useCustomers, 
  useSales, 
  useProducts, 
  useStockEntries, 
  useExpenses,
  useSettings,
  exportAllData,
  importAllData 
} from '@/hooks/useStorage';

type Section = 'dashboard' | 'sales' | 'customers' | 'inventory' | 'financials' | 'reports' | 'settings';

interface NavItem {
  id: Section;
  label: string;
  icon: React.ElementType;
  color: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#4ade80' },
  { id: 'sales', label: 'Sales', icon: ShoppingCart, color: '#22d3ee' },
  { id: 'customers', label: 'Customers', icon: Users, color: '#a78bfa' },
  { id: 'inventory', label: 'Inventory', icon: Package, color: '#fbbf24' },
  { id: 'financials', label: 'Financials', icon: DollarSign, color: '#f472b6' },
  { id: 'reports', label: 'Reports', icon: FileText, color: '#60a5fa' },
  { id: 'settings', label: 'Settings', icon: Settings, color: '#94a3b8' },
];

function App() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data hooks
  const customersData = useCustomers();
  const salesData = useSales();
  const productsData = useProducts();
  const stockEntriesData = useStockEntries();
  const expensesData = useExpenses();
  const settingsData = useSettings();

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whitemeatshop_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (importAllData(content)) {
          toast.success('Data imported successfully! Please refresh the page.');
          window.location.reload();
        } else {
          toast.error('Failed to import data. Invalid file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const renderSection = () => {
    const props = {
      customers: customersData,
      sales: salesData,
      products: productsData,
      stockEntries: stockEntriesData,
      expenses: expensesData,
      settings: settingsData,
    };

    switch (activeSection) {
      case 'dashboard':
        return <Dashboard {...props} />;
      case 'sales':
        return <SalesManagement {...props} />;
      case 'customers':
        return <CustomerManagement {...props} />;
      case 'inventory':
        return <InventoryManagement {...props} />;
      case 'financials':
        return <Financials {...props} />;
      case 'reports':
        return <Reports {...props} />;
      case 'settings':
        return <SettingsPanel {...props} />;
      default:
        return <Dashboard {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-[280px] z-50"
      >
        <div className="h-full glass-strong border-r border-white/10">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-xl font-bold text-slate-900">W</span>
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">WhiteMeat</h1>
                <p className="text-xs text-slate-400">ERP System</p>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 sidebar-item ${
                    isActive 
                      ? 'nav-active bg-emerald-500/10' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <Icon 
                    size={20} 
                    style={{ color: isActive ? item.color : '#94a3b8' }}
                    className="transition-colors"
                  />
                  <span className={`font-medium ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-3 w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Backup/Restore */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="w-full glass border-white/10 hover:bg-white/10 text-slate-300"
              >
                <Download size={14} className="mr-2" />
                Export Data
              </Button>
              <label className="w-full">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full glass border-white/10 hover:bg-white/10 text-slate-300"
                  asChild
                >
                  <span>
                    <Upload size={14} className="mr-2" />
                    Import Data
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main 
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-[280px]' : 'ml-0'
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 glass-strong border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-white/10"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
              <div>
                <h2 className="text-xl font-semibold capitalize">
                  {activeSection.replace('-', ' ')}
                </h2>
                <p className="text-sm text-slate-400">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Today&apos;s Sales</p>
                    <p className="text-sm font-semibold text-emerald-400">
                      Rs. {salesData.getTodaySales().reduce((sum, s) => sum + s.totalAmount, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <AlertCircle size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Low Stock</p>
                    <p className="text-sm font-semibold text-amber-400">
                      {productsData.getLowStockProducts().length} items
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;

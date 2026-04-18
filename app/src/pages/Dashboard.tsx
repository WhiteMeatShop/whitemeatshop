import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Chicken3DScene from '@/components/Chicken3DScene';
import DataCard from '@/components/DataCard';
import { useStats } from '@/hooks/useStats';
import { useSettings } from '@/hooks/useSettings';

export default function Dashboard() {
  const navigate = useNavigate();
  const stats = useStats();
  const { settings } = useSettings();
  const currency = settings.currencySymbol;

  return (
    <div>
      {/* 3D Hero Scene */}
      <Chicken3DScene />

      {/* Stats Bar */}
      <div className="bg-white px-6 md:px-10 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <DataCard accentColor="#FF5A00" index={0}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-wm-orange flex items-center justify-center flex-shrink-0">
                <span className="material-icons text-white">point_of_sale</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-wm-gray uppercase tracking-wide mb-1">Daily Sales</p>
                <p className="text-2xl font-semibold text-black">
                  {currency}{stats.dailySales.total.toFixed(2)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`material-icons text-sm ${stats.dailySales.change >= 0 ? 'text-wm-success' : 'text-wm-error'}`}>
                    {stats.dailySales.change >= 0 ? 'trending_up' : 'trending_down'}
                  </span>
                  <span className={`text-xs font-medium ${stats.dailySales.change >= 0 ? 'text-wm-success' : 'text-wm-error'}`}>
                    {Math.abs(stats.dailySales.change).toFixed(1)}% vs yesterday
                  </span>
                </div>
              </div>
            </div>
          </DataCard>

          <DataCard accentColor="#FF9E00" index={1}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-wm-gold flex items-center justify-center flex-shrink-0">
                <span className="material-icons text-white">credit_card</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-wm-gray uppercase tracking-wide mb-1">Credit Outstanding</p>
                <p className="text-2xl font-semibold text-black">
                  {currency}{stats.creditOutstanding.toFixed(2)}
                </p>
                <p className="text-xs text-wm-gray mt-1">{stats.creditCustomerCount} customers</p>
              </div>
            </div>
          </DataCard>

          <DataCard accentColor="#FF3B30" index={2}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-wm-error flex items-center justify-center flex-shrink-0">
                <span className="material-icons text-white">warning</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-wm-gray uppercase tracking-wide mb-1">Low Stock Alert</p>
                <p className="text-2xl font-semibold text-black">{stats.lowStockCount} items</p>
                <p className="text-xs text-wm-error mt-1">Needs restocking</p>
              </div>
            </div>
          </DataCard>

          <DataCard accentColor="#34C759" index={3}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-wm-success flex items-center justify-center flex-shrink-0">
                <span className="material-icons text-white">inventory_2</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-wm-gray uppercase tracking-wide mb-1">Total Products</p>
                <p className="text-2xl font-semibold text-black">{stats.totalProducts} items</p>
                <p className="text-xs text-wm-gray mt-1">In inventory</p>
              </div>
            </div>
          </DataCard>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white px-6 md:px-10 pb-28">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg font-medium text-black mb-4">Quick Actions</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              onClick={() => navigate('/sales')}
              className="flex items-center justify-center gap-2 bg-wm-orange text-white px-6 py-3.5 rounded-2xl font-medium text-base hover:bg-[#E65000] transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="material-icons">point_of_sale</span>
              Record Sale
            </motion.button>
            <motion.button
              onClick={() => navigate('/inventory')}
              className="flex items-center justify-center gap-2 bg-wm-orange text-white px-6 py-3.5 rounded-2xl font-medium text-base hover:bg-[#E65000] transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="material-icons">add_circle</span>
              Add Product
            </motion.button>
            <motion.button
              onClick={() => navigate('/credit')}
              className="flex items-center justify-center gap-2 bg-black/10 backdrop-blur-sm text-black px-6 py-3.5 rounded-2xl font-medium text-base hover:bg-black/25 transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="material-icons">credit_card</span>
              View Credit
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

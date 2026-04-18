import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { PageName } from '@/types';

const navItems: { name: string; path: string; page: PageName; icon: string }[] = [
  { name: 'Home', path: '/', page: 'home', icon: 'home' },
  { name: 'Inventory', path: '/inventory', page: 'inventory', icon: 'inventory_2' },
  { name: 'Sales', path: '/sales', page: 'sales', icon: 'point_of_sale' },
  { name: 'Ledger', path: '/ledger', page: 'ledger', icon: 'menu_book' },
  { name: 'Credit', path: '/credit', page: 'credit', icon: 'credit_card' },
  { name: 'Settings', path: '/settings', page: 'settings', icon: 'settings' },
];

export default function GlassmorphismNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="no-print fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-4 py-3 rounded-full
      bg-white/15 backdrop-blur-xl border border-white/20 shadow-glass
      md:h-[90px] md:gap-2 md:px-6
      h-[70px] w-[calc(100%-2rem)] md:w-auto">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.page}
            onClick={() => navigate(item.path)}
            className={`relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 cursor-pointer
              md:px-5 md:py-3
              min-w-[56px] md:min-w-[80px]
              ${isActive ? 'text-wm-orange' : 'text-white hover:text-wm-gold'}`}
          >
            <motion.span
              className="material-icons text-xl md:text-2xl"
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.2 }}
            >
              {item.icon}
            </motion.span>
            <span className="text-[9px] md:text-[10px] font-medium uppercase tracking-wider">
              {item.name}
            </span>
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-wm-orange rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

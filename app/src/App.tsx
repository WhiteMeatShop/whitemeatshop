import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GlassmorphismNav from '@/components/GlassmorphismNav';
import ToastContainer from '@/components/Toast';
import { seedDatabase } from '@/db/database';
import Dashboard from '@/pages/Dashboard';
import Inventory from '@/pages/Inventory';
import Sales from '@/pages/Sales';
import Ledger from '@/pages/Ledger';
import Credit from '@/pages/Credit';
import Settings from '@/pages/Settings';

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    seedDatabase();
  }, []);

  const isDashboard = location.pathname === '/';

  return (
    <div className={`min-h-screen ${isDashboard ? 'bg-wm-dark' : 'bg-white'}`}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
          <Route path="/inventory" element={<AnimatedPage><Inventory /></AnimatedPage>} />
          <Route path="/sales" element={<AnimatedPage><Sales /></AnimatedPage>} />
          <Route path="/ledger" element={<AnimatedPage><Ledger /></AnimatedPage>} />
          <Route path="/credit" element={<AnimatedPage><Credit /></AnimatedPage>} />
          <Route path="/settings" element={<AnimatedPage><Settings /></AnimatedPage>} />
        </Routes>
      </AnimatePresence>
      <GlassmorphismNav />
      <ToastContainer />
    </div>
  );
}

import { motion } from 'framer-motion';

interface DataCardProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  onClick?: () => void;
  index?: number;
}

export default function DataCard({ children, className = '', accentColor, onClick, index = 0 }: DataCardProps) {
  return (
    <motion.div
      className={`bg-white border border-wm-border rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow duration-200 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={accentColor ? { borderLeft: `4px solid ${accentColor}` } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.01 } : undefined}
    >
      {children}
    </motion.div>
  );
}

export function MiniStatCard({
  icon,
  value,
  label,
  bgColor = '#FF5A00',
  index = 0,
}: {
  icon: string;
  value: string | number;
  label: string;
  bgColor?: string;
  index?: number;
}) {
  return (
    <motion.div
      className="bg-white border border-wm-border rounded-2xl p-4 shadow-card flex items-center gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bgColor }}
      >
        <span className="material-icons text-white text-lg">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xl font-semibold text-black truncate">{value}</p>
        <p className="text-xs text-wm-gray uppercase tracking-wide">{label}</p>
      </div>
    </motion.div>
  );
}

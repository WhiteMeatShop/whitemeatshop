import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function notify(listeners: typeof toastListeners, newToasts: Toast[]) {
  toasts = newToasts;
  listeners.forEach((l) => l(newToasts));
}

export function showToast(message: string, type: Toast['type'] = 'success') {
  const id = crypto.randomUUID();
  const newToasts = [...toasts, { id, message, type }];
  notify(toastListeners, newToasts);
  setTimeout(() => {
    notify(toastListeners, toasts.filter((t) => t.id !== id));
  }, 3000);
}

export default function ToastContainer() {
  const [localToasts, setLocalToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setLocalToasts([...newToasts]);
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2">
      <AnimatePresence>
        {localToasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2
              ${toast.type === 'success' ? 'bg-wm-success' : ''}
              ${toast.type === 'error' ? 'bg-wm-error' : ''}
              ${toast.type === 'info' ? 'bg-wm-orange' : ''}`}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <span className="material-icons text-base">
              {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
            </span>
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

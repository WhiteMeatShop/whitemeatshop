import { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from '@/components/Modal';
import DataCard, { MiniStatCard } from '@/components/DataCard';
import { FormInput, FormSelect, FormTextarea } from '@/components/FormComponents';
import { useLedger } from '@/hooks/useLedger';
import { useSettings } from '@/hooks/useSettings';
import { LEDGER_TYPES } from '@/types';
import type { LedgerEntry } from '@/types';
import { showToast } from '@/components/Toast';

export default function Ledger() {
  const { settings } = useSettings();
  const currency = settings.currencySymbol;
  const today = new Date().toISOString().split('T')[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [filters, setFilters] = useState({
    dateFrom: monthStart,
    dateTo: today,
    type: 'all',
    search: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { entries, addEntry, calculateBalance } = useLedger(filters);
  const { totalIncome, totalExpense, balance } = calculateBalance();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const type = formData.get('type') as LedgerEntry['type'];
    const amount = parseFloat(formData.get('amount') as string) || 0;

    try {
      await addEntry({
        date: new Date(formData.get('date') as string),
        type,
        description: formData.get('description') as string,
        reference: formData.get('reference') as string,
        amount,
        isIncome: type === 'sale' || type === 'payment_received',
        source: 'manual',
        notes: formData.get('notes') as string,
      });
      showToast('Entry added successfully');
      setIsModalOpen(false);
      form.reset();
    } catch {
      showToast('Error adding entry', 'error');
    }
  };

  // Running balance
  let runningBalance = 0;
  const entriesWithBalance = [...entries].reverse().map(entry => {
    if (entry.isIncome) runningBalance += entry.amount;
    else runningBalance -= entry.amount;
    return { ...entry, runningBalance };
  }).reverse();

  const typeColors: Record<string, string> = {};
  LEDGER_TYPES.forEach(t => { typeColors[t.value] = t.color; });

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="px-6 md:px-10 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1 className="text-3xl md:text-5xl font-normal text-black" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            Ledger
          </motion.h1>
          <motion.p className="text-wm-gray mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            Financial records and transaction history
          </motion.p>
        </div>
        <motion.button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-wm-orange text-white px-5 py-3 rounded-2xl font-medium hover:bg-[#E65000] transition-colors self-start cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="material-icons">add_circle</span>
          Add Entry
        </motion.button>
      </div>

      {/* Stats */}
      <div className="px-6 md:px-10 py-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStatCard icon="account_balance" value={`${currency}${(totalIncome - totalExpense + totalExpense).toFixed(2)}`} label="Opening Balance" bgColor="#FF9E00" index={0} />
        <MiniStatCard icon="trending_up" value={`${currency}${totalIncome.toFixed(2)}`} label="Total Income" bgColor="#34C759" index={1} />
        <MiniStatCard icon="trending_down" value={`${currency}${totalExpense.toFixed(2)}`} label="Total Expenses" bgColor="#FF3B30" index={2} />
        <MiniStatCard icon="calculate" value={`${currency}${balance.toFixed(2)}`} label="Closing Balance" bgColor="#FF5A00" index={3} />
      </div>

      {/* Filters */}
      <div className="px-6 md:px-10 py-4 flex flex-wrap gap-3">
        <div className="flex gap-2 items-center">
          <label className="text-sm text-wm-gray">From</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="border border-wm-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-wm-orange"
          />
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-sm text-wm-gray">To</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="border border-wm-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-wm-orange"
          />
        </div>
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="border border-wm-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-wm-orange"
        >
          <option value="all">All Types</option>
          {LEDGER_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <div className="relative">
          <span className="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-wm-gray text-sm">search</span>
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="border border-wm-border rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-wm-orange"
          />
        </div>
        <button
          onClick={() => setFilters({ dateFrom: monthStart, dateTo: today, type: 'all', search: '' })}
          className="text-sm text-wm-orange hover:underline cursor-pointer"
        >
          Reset
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block px-6 md:px-10 py-4">
        <div className="bg-white border border-wm-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-wm-border">
                <th className="text-left px-4 py-3 text-wm-gray font-semibold text-xs uppercase">Date</th>
                <th className="text-left px-4 py-3 text-wm-gray font-semibold text-xs uppercase">Reference</th>
                <th className="text-left px-4 py-3 text-wm-gray font-semibold text-xs uppercase">Description</th>
                <th className="text-center px-4 py-3 text-wm-gray font-semibold text-xs uppercase">Type</th>
                <th className="text-right px-4 py-3 text-wm-gray font-semibold text-xs uppercase">Income</th>
                <th className="text-right px-4 py-3 text-wm-gray font-semibold text-xs uppercase">Expense</th>
                <th className="text-right px-4 py-3 text-wm-gray font-semibold text-xs uppercase">Balance</th>
              </tr>
            </thead>
            <tbody>
              {entriesWithBalance.map((entry, i) => (
                <motion.tr
                  key={entry.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                >
                  <td className="px-4 py-3 whitespace-nowrap">{entry.date.toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-mono text-wm-orange">{entry.reference || '-'}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{entry.description}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                      style={{ backgroundColor: typeColors[entry.type] || '#858585' }}
                    >
                      {LEDGER_TYPES.find(t => t.value === entry.type)?.label || entry.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-wm-success">
                    {entry.isIncome ? `+${currency}${entry.amount.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-wm-error">
                    {!entry.isIncome ? `-${currency}${entry.amount.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{currency}{entry.runningBalance.toFixed(2)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden px-6 py-4 space-y-3">
        {entriesWithBalance.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.3) }}
          >
            <DataCard>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-wm-gray">{entry.date.toLocaleDateString()}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white" style={{ backgroundColor: typeColors[entry.type] || '#858585' }}>
                  {LEDGER_TYPES.find(t => t.value === entry.type)?.label || entry.type}
                </span>
              </div>
              <p className="text-sm font-medium text-black">{entry.description}</p>
              {entry.reference && <p className="text-xs font-mono text-wm-orange">{entry.reference}</p>}
              <div className="flex justify-between items-center mt-2">
                <span className={`text-lg font-semibold ${entry.isIncome ? 'text-wm-success' : 'text-wm-error'}`}>
                  {entry.isIncome ? '+' : '-'}{currency}{entry.amount.toFixed(2)}
                </span>
                <span className="text-xs text-wm-gray">Bal: {currency}{entry.runningBalance.toFixed(2)}</span>
              </div>
            </DataCard>
          </motion.div>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="px-6 md:px-10 py-12 text-center">
          <span className="material-icons text-6xl text-wm-border">menu_book</span>
          <p className="text-wm-gray mt-4">No ledger entries found.</p>
        </div>
      )}

      {/* Add Entry Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Ledger Entry">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput name="date" label="Date" type="date" defaultValue={today} required />
          <FormSelect
            name="type"
            label="Entry Type"
            options={[
              { value: 'sale', label: 'Sale (Income)' },
              { value: 'purchase', label: 'Purchase (Expense)' },
              { value: 'payment_received', label: 'Payment Received (Income)' },
              { value: 'payment_made', label: 'Payment Made (Expense)' },
              { value: 'expense', label: 'Expense' },
              { value: 'adjustment', label: 'Adjustment' },
            ]}
            required
          />
          <FormInput name="description" label="Description" placeholder="e.g., Shop rent payment" required />
          <FormInput name="reference" label="Reference #" placeholder="e.g., REF-001" />
          <FormInput name="amount" label="Amount" type="number" step="0.01" placeholder="0.00" required />
          <FormTextarea name="notes" label="Notes" placeholder="Additional details" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-2xl bg-black/10 text-black font-medium hover:bg-black/25 transition-colors cursor-pointer">Cancel</button>
            <button type="submit" className="flex-1 py-3 rounded-2xl bg-wm-orange text-white font-medium hover:bg-[#E65000] transition-colors cursor-pointer">Save Entry</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

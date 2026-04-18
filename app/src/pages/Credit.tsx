import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/Modal';
import DataCard, { MiniStatCard } from '@/components/DataCard';
import { FormInput, FormSelect, FormTextarea } from '@/components/FormComponents';
import { useCredit } from '@/hooks/useCredit';
import { useSettings } from '@/hooks/useSettings';
import { useStats } from '@/hooks/useStats';
import type { CreditCustomer } from '@/types';
import { showToast } from '@/components/Toast';

export default function Credit() {
  const { settings } = useSettings();
  const currency = settings.currencySymbol;
  const stats = useStats();
  const [searchQuery, setSearchQuery] = useState('');
  const { customers, addCustomer, updateCustomer, deleteCustomer, addPayment } = useCredit(searchQuery);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CreditCustomer | null>(null);
  const [paymentCustomer, setPaymentCustomer] = useState<CreditCustomer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCustomerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get('name') as string,
      contactPerson: formData.get('contactPerson') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      customerType: formData.get('customerType') as 'hotel' | 'restaurant',
      creditLimit: parseFloat(formData.get('creditLimit') as string) || 0,
      paymentTerms: parseInt(formData.get('paymentTerms') as string) || 30,
    };

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, data);
        showToast('Customer updated');
      } else {
        await addCustomer(data);
        showToast('Customer added');
      }
      setIsCustomerModalOpen(false);
      setEditingCustomer(null);
      form.reset();
    } catch {
      showToast('Error saving customer', 'error');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!paymentCustomer) return;
    const form = e.currentTarget;
    const formData = new FormData(form);

    const amount = parseFloat(formData.get('amount') as string) || 0;
    if (amount <= 0 || amount > paymentCustomer.currentBalance) {
      showToast('Invalid payment amount', 'error');
      return;
    }

    try {
      await addPayment({
        customerId: paymentCustomer.id,
        amount,
        date: new Date(formData.get('date') as string || new Date()),
        method: formData.get('method') as 'cash' | 'bank_transfer' | 'check',
        reference: formData.get('reference') as string,
        notes: formData.get('notes') as string,
      });
      showToast('Payment recorded successfully');
      setPaymentCustomer(null);
      form.reset();
    } catch {
      showToast('Error recording payment', 'error');
    }
  };

  const getOverdueStatus = (customer: CreditCustomer) => {
    if (!customer.lastPaymentDate) return { label: 'OVERDUE', color: 'bg-wm-error', pulse: true };
    const daysSince = Math.floor((new Date().getTime() - customer.lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > customer.paymentTerms) return { label: 'OVERDUE', color: 'bg-wm-error', pulse: true };
    if (daysSince > customer.paymentTerms * 0.5) return { label: 'DUE SOON', color: 'bg-wm-gold', pulse: false };
    return { label: 'CURRENT', color: 'bg-wm-success', pulse: false };
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    const aStatus = getOverdueStatus(a);
    const bStatus = getOverdueStatus(b);
    if (aStatus.label === 'OVERDUE' && bStatus.label !== 'OVERDUE') return -1;
    if (bStatus.label === 'OVERDUE' && aStatus.label !== 'OVERDUE') return 1;
    return b.currentBalance - a.currentBalance;
  });

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="px-6 md:px-10 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1 className="text-3xl md:text-5xl font-normal text-black" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            Credit
          </motion.h1>
          <motion.p className="text-wm-gray mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            Manage customer credit and payments
          </motion.p>
        </div>
        <motion.button
          onClick={() => { setEditingCustomer(null); setIsCustomerModalOpen(true); }}
          className="flex items-center gap-2 bg-wm-orange text-white px-5 py-3 rounded-2xl font-medium hover:bg-[#E65000] transition-colors self-start cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="material-icons">add_circle</span>
          Add Customer
        </motion.button>
      </div>

      {/* Stats */}
      <div className="px-6 md:px-10 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MiniStatCard icon="credit_card" value={`${currency}${stats.creditOutstanding.toFixed(2)}`} label="Total Outstanding" bgColor="#FF5A00" index={0} />
        <MiniStatCard icon="people" value={stats.creditCustomerCount} label="Customers" bgColor="#FF9E00" index={1} />
        <MiniStatCard icon="warning" value={`${currency}${stats.overdueAmount.toFixed(2)}`} label="Overdue (>30 days)" bgColor="#FF3B30" index={2} />
      </div>

      {/* Search */}
      <div className="px-6 md:px-10 py-4">
        <div className="relative max-w-md">
          <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-wm-gray">search</span>
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-wm-border rounded-xl pl-10 pr-4 py-3 text-base focus:outline-none focus:border-wm-orange focus:ring-[3px] focus:ring-wm-orange/15"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="px-6 md:px-10 py-4 space-y-3">
        {sortedCustomers.map((customer, i) => {
          const status = getOverdueStatus(customer);
          const isExpanded = expandedCustomer === customer.id;
          return (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <DataCard>
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedCustomer(isExpanded ? null : customer.id)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-full bg-wm-orange flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-lg">{customer.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-black truncate">{customer.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium text-white ${status.color} ${status.pulse ? 'animate-overdue-pulse' : ''}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-wm-gray capitalize">{customer.customerType}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-xl font-bold text-black">{currency}{customer.currentBalance.toFixed(2)}</p>
                    <p className="text-xs text-wm-gray">Limit: {currency}{customer.creditLimit}</p>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-wm-border mt-3 pt-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-[10px] text-wm-gray uppercase">Total Purchases</p>
                            <p className="text-sm font-semibold text-black">{currency}{customer.totalPurchases.toFixed(2)}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-[10px] text-wm-gray uppercase">Total Payments</p>
                            <p className="text-sm font-semibold text-wm-success">{currency}{customer.totalPayments.toFixed(2)}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-[10px] text-wm-gray uppercase">Balance</p>
                            <p className="text-sm font-semibold text-wm-error">{currency}{customer.currentBalance.toFixed(2)}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-[10px] text-wm-gray uppercase">Limit Remaining</p>
                            <p className="text-sm font-semibold text-black">{currency}{(customer.creditLimit - customer.currentBalance).toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setPaymentCustomer(customer); }}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-wm-orange text-white text-sm font-medium hover:bg-[#E65000] transition-colors cursor-pointer"
                          >
                            <span className="material-icons text-sm">payments</span>
                            Record Payment
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingCustomer(customer); setIsCustomerModalOpen(true); }}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-100 text-wm-gray text-sm hover:text-wm-orange hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            <span className="material-icons text-sm">edit</span>
                            Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(customer.id); }}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-100 text-wm-gray text-sm hover:text-wm-error hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            <span className="material-icons text-sm">delete</span>
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </DataCard>
            </motion.div>
          );
        })}
      </div>

      {sortedCustomers.length === 0 && (
        <div className="px-6 md:px-10 py-12 text-center">
          <span className="material-icons text-6xl text-wm-border">credit_card</span>
          <p className="text-wm-gray mt-4">No credit customers found.</p>
        </div>
      )}

      {/* Customer Modal */}
      <Modal isOpen={isCustomerModalOpen} onClose={() => { setIsCustomerModalOpen(false); setEditingCustomer(null); }} title={editingCustomer ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={handleCustomerSubmit} className="space-y-4">
          <FormInput name="name" label="Customer Name" placeholder="e.g., Ahmed Restaurant" defaultValue={editingCustomer?.name} required />
          <FormInput name="contactPerson" label="Contact Person" placeholder="e.g., Mr. Ahmed" defaultValue={editingCustomer?.contactPerson} />
          <FormInput name="phone" label="Phone" placeholder="+92 XXX XXXXXXX" defaultValue={editingCustomer?.phone} />
          <FormTextarea name="address" label="Address" placeholder="Business address" defaultValue={editingCustomer?.address} />
          <FormSelect name="customerType" label="Customer Type" options={[{ value: 'hotel', label: 'Hotel' }, { value: 'restaurant', label: 'Restaurant' }]} defaultValue={editingCustomer?.customerType || 'restaurant'} />
          <div className="grid grid-cols-2 gap-4">
            <FormInput name="creditLimit" label="Credit Limit" type="number" placeholder="5000" defaultValue={editingCustomer?.creditLimit} required />
            <FormInput name="paymentTerms" label="Payment Terms (days)" type="number" placeholder="30" defaultValue={editingCustomer?.paymentTerms} required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setIsCustomerModalOpen(false); setEditingCustomer(null); }} className="flex-1 py-3 rounded-2xl bg-black/10 text-black font-medium hover:bg-black/25 transition-colors cursor-pointer">Cancel</button>
            <button type="submit" className="flex-1 py-3 rounded-2xl bg-wm-orange text-white font-medium hover:bg-[#E65000] transition-colors cursor-pointer">{editingCustomer ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={!!paymentCustomer} onClose={() => setPaymentCustomer(null)} title={paymentCustomer ? `Record Payment - ${paymentCustomer.name}` : 'Record Payment'}>
        {paymentCustomer && (
          <>
            <div className="bg-wm-error/10 rounded-xl p-4 mb-4">
              <p className="text-sm text-wm-gray">Current Balance</p>
              <p className="text-2xl font-bold text-wm-error">{currency}{paymentCustomer.currentBalance.toFixed(2)}</p>
            </div>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <FormInput name="amount" label="Payment Amount" type="number" step="0.01" max={paymentCustomer.currentBalance} placeholder="0.00" required />
              <FormInput name="date" label="Payment Date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
              <FormSelect name="method" label="Payment Method" options={[{ value: 'cash', label: 'Cash' }, { value: 'bank_transfer', label: 'Bank Transfer' }, { value: 'check', label: 'Check' }]} defaultValue="cash" />
              <FormInput name="reference" label="Reference #" placeholder="Optional" />
              <FormTextarea name="notes" label="Notes" placeholder="Optional notes" />
              <div className="flex gap-2">
                <button type="button" onClick={() => { const input = document.querySelector('input[name="amount"]') as HTMLInputElement; if (input) input.value = paymentCustomer.currentBalance.toFixed(2); }} className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs text-wm-gray hover:bg-gray-200 cursor-pointer">Full Amount</button>
                <button type="button" onClick={() => { const input = document.querySelector('input[name="amount"]') as HTMLInputElement; if (input) input.value = (paymentCustomer.currentBalance / 2).toFixed(2); }} className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs text-wm-gray hover:bg-gray-200 cursor-pointer">Half</button>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setPaymentCustomer(null)} className="flex-1 py-3 rounded-2xl bg-black/10 text-black font-medium hover:bg-black/25 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-2xl bg-wm-orange text-white font-medium hover:bg-[#E65000] transition-colors cursor-pointer">Record Payment</button>
              </div>
            </form>
          </>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <p className="text-wm-gray mb-6">Are you sure you want to delete this customer? All payment history will also be deleted.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-2xl bg-black/10 text-black font-medium hover:bg-black/25 transition-colors cursor-pointer">Cancel</button>
          <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-2xl bg-wm-error text-white font-medium hover:bg-red-600 transition-colors cursor-pointer">Delete</button>
        </div>
      </Modal>
    </div>
  );

  async function handleDelete(id: string) {
    try {
      await deleteCustomer(id);
      showToast('Customer deleted');
      setDeleteConfirm(null);
    } catch {
      showToast('Error deleting customer', 'error');
    }
  }
}

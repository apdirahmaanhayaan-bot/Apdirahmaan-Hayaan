import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit3,
  Search,
  Check,
  X,
  AlertTriangle,
  Calendar,
  Building2,
  DollarSign,
  ArrowDownLeft,
  FileText
} from 'lucide-react';
import { LiabilityItem, Supplier } from '../../types';

interface LiabilitiesViewProps {
  liabilities: LiabilityItem[];
  suppliers?: Supplier[];
  onAddLiability: (item: LiabilityItem) => void;
  onUpdateLiability: (item: LiabilityItem) => void;
  onDeleteLiability: (id: string) => void;
  onMakePayment?: (liabilityId: string, amount: number, note: string) => void;
}

export default function LiabilitiesView({
  liabilities = [],
  suppliers = [],
  onAddLiability,
  onUpdateLiability,
  onDeleteLiability,
  onMakePayment
}: LiabilitiesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingLiability, setEditingLiability] = useState<LiabilityItem | null>(null);

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payingLiability, setPayingLiability] = useState<LiabilityItem | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<LiabilityItem>>({
    name: '',
    type: 'bank_loan',
    lenderOrCreditor: '',
    totalAmount: 0,
    paidAmount: 0,
    dueDate: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'active',
    notes: ''
  });

  // Calculate Supplier Payables
  const supplierDebtTotal = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + (Number(s.balanceOwed) || 0), 0);
  }, [suppliers]);

  // Calculate Liabilities from the liability registry
  const totalLiabilitiesRegistered = useMemo(() => {
    return liabilities.reduce((sum, l) => sum + (Number(l.totalAmount) || 0), 0);
  }, [liabilities]);

  const totalPaid = useMemo(() => {
    return liabilities.reduce((sum, l) => sum + (Number(l.paidAmount) || 0), 0);
  }, [liabilities]);

  const totalRemainingLiabilities = useMemo(() => {
    return liabilities.reduce((sum, l) => {
      const rem = Math.max(0, (Number(l.totalAmount) || 0) - (Number(l.paidAmount) || 0));
      return sum + rem;
    }, 0);
  }, [liabilities]);

  // Overall Total Liability (Registered + Suppliers Payable)
  const grandTotalLiability = totalRemainingLiabilities + supplierDebtTotal;

  // Filtered
  const filteredLiabilities = useMemo(() => {
    return liabilities.filter(item => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchLender = item.lenderOrCreditor.toLowerCase().includes(q);
        const matchNotes = (item.notes || '').toLowerCase().includes(q);
        if (!matchName && !matchLender && !matchNotes) return false;
      }
      return true;
    });
  }, [liabilities, typeFilter, statusFilter, searchQuery]);

  const openAddModal = () => {
    setEditingLiability(null);
    setFormData({
      name: '',
      type: 'bank_loan',
      lenderOrCreditor: '',
      totalAmount: 0,
      paidAmount: 0,
      dueDate: '',
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (item: LiabilityItem) => {
    setEditingLiability(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.lenderOrCreditor?.trim()) {
      alert("Fadlan buuxi magaca deynta iyo qofka/bangiga kugu leh!");
      return;
    }

    const total = Number(formData.totalAmount) || 0;
    const paid = Number(formData.paidAmount) || 0;
    const rem = Math.max(0, total - paid);
    const status = rem <= 0 ? 'paid' : formData.status || 'active';

    if (editingLiability) {
      const updated: LiabilityItem = {
        ...editingLiability,
        name: formData.name.trim(),
        type: formData.type || 'bank_loan',
        lenderOrCreditor: formData.lenderOrCreditor.trim(),
        totalAmount: total,
        paidAmount: paid,
        remainingAmount: rem,
        dueDate: formData.dueDate || undefined,
        startDate: formData.startDate || editingLiability.startDate,
        status: status as any,
        notes: formData.notes?.trim()
      };
      onUpdateLiability(updated);
    } else {
      const newItem: LiabilityItem = {
        id: `liab_${Date.now()}`,
        name: formData.name.trim(),
        type: formData.type || 'bank_loan',
        lenderOrCreditor: formData.lenderOrCreditor.trim(),
        totalAmount: total,
        paidAmount: paid,
        remainingAmount: rem,
        dueDate: formData.dueDate || undefined,
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        status: status as any,
        notes: formData.notes?.trim()
      };
      onAddLiability(newItem);
    }

    setShowModal(false);
  };

  const handleOpenPayment = (item: LiabilityItem) => {
    setPayingLiability(item);
    setPayAmount('');
    setPayNote('');
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingLiability) return;
    const payment = Number(payAmount) || 0;
    if (payment <= 0) {
      alert("Fadlan geli lacag sax ah!");
      return;
    }

    const newPaid = payingLiability.paidAmount + payment;
    const newRem = Math.max(0, payingLiability.totalAmount - newPaid);
    const updated: LiabilityItem = {
      ...payingLiability,
      paidAmount: newPaid,
      remainingAmount: newRem,
      status: newRem <= 0 ? 'paid' : payingLiability.status
    };

    onUpdateLiability(updated);
    if (onMakePayment) {
      onMakePayment(payingLiability.id, payment, payNote);
    }
    setShowPaymentModal(false);
    alert(`Waxaad bixisay $${payment.toFixed(2)}. Xisaabta deynta waa la cusboonaysiiyey!`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Ma hubtaa inaad tirtirto deyntan: "${name}"?`)) {
      onDeleteLiability(id);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'bank_loan':
        return { label: 'Amaah Bangi (Bank Loan)', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'accounts_payable':
        return { label: 'Daynta Ganacsatada (Payable)', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'short_term_debt':
        return { label: 'Deyn Dhow (Short-Term)', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'long_term_loan':
        return { label: 'Amaah Fog (Long-Term)', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'accrued_expense':
        return { label: 'Biil/Kiro La Sugayo (Accrued)', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      default:
        return { label: 'Deyn Kale', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Action */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-100 text-rose-800 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Deymaha Ganacsiga & Qaanaha (Total Liabilities & Loans)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Diiwaanka deymaha lagu leeyahay supermarket-ka, amaahda bangiga, kirada, iyo qaanaha alaab-qeybiyeyaasha.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#ffae01]" />
          <span>Ku dar Deyn/Amaah Cusub</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Wadarta Guud ee Deymaha (Total Liabilities)
          </span>
          <div className="text-2xl font-black text-rose-600 mt-1 font-mono">
            ${grandTotalLiability.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Deymaha tooska ah + Daynta Alaab-qeybiyeyaasha
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Daynta Alaab-Qeybiyeyaasha (Suppliers)
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1 font-mono">
            ${supplierDebtTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Lagu leeyahay {suppliers.filter(s => s.balanceOwed > 0).length} ganacsade
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Amaahda Diiwaangashan ee Dhiman
          </span>
          <div className="text-2xl font-black text-[#042954] mt-1 font-mono">
            ${totalRemainingLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Lagu leeyahay bangiyo & cid kale
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Lacagaha Ilaa Hadda La Bixiyay
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
            ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-600 mt-0.5 block font-bold">
            Gusoo noqotay / La bixiyay
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Raadi deyn, cidda leh, nooc..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#042954]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Dhammaan Noocyada Deymaha</option>
            <option value="bank_loan">Amaah Bangi (Bank Loan)</option>
            <option value="accounts_payable">Daynta Ganacsatada (Accounts Payable)</option>
            <option value="short_term_debt">Deyn Dhow (Short-Term)</option>
            <option value="long_term_loan">Amaah Fog (Long-Term)</option>
            <option value="accrued_expense">Biilal/Kiro (Accrued)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Dhammaan Xaaladaha</option>
            <option value="active">Active (Weli Taagan)</option>
            <option value="paid">Paid (Waa La Wada Bixiyey)</option>
            <option value="overdue">Overdue (Waqtigu Dhaafay)</option>
          </select>

          {(typeFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setTypeFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <span>Nadiifi</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Liabilities Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Deynta / Amaahda</th>
                <th className="py-3 px-4">Cidda Lagu Leeyahay</th>
                <th className="py-3 px-4">Nooca</th>
                <th className="py-3 px-4 text-right">Wadarta Deynta</th>
                <th className="py-3 px-4 text-right">La Bixiyay</th>
                <th className="py-3 px-4 text-right">Dhiman (Balance)</th>
                <th className="py-3 px-4">Waqtiga Bixinta</th>
                <th className="py-3 px-4 text-center">Xaaladda</th>
                <th className="py-3 px-4 text-right">Ficil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLiabilities.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Wax deymo ah kuma jiraan diiwaankan.
                  </td>
                </tr>
              ) : (
                filteredLiabilities.map(item => {
                  const badge = getTypeBadge(item.type);
                  const rem = Math.max(0, (Number(item.totalAmount) || 0) - (Number(item.paidAmount) || 0));

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 leading-tight">
                          {item.name}
                        </div>
                        {item.notes && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">
                            {item.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-800">
                        {item.lenderOrCreditor}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-medium text-slate-800 font-mono">
                        ${(Number(item.totalAmount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4 text-right font-medium text-emerald-700 font-mono">
                        ${(Number(item.paidAmount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4 text-right font-black text-rose-600 font-mono">
                        ${rem.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {item.dueDate || 'Waqti La\'aan'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {rem <= 0 ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-lg border border-emerald-200">
                            Waa Bixiyeen
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-black rounded-lg border border-amber-200">
                            Weli Taagan
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {rem > 0 && (
                            <button
                              onClick={() => handleOpenPayment(item)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                              title="Bixi Qeyb Deyn ah"
                            >
                              <DollarSign className="w-3 h-3" />
                              <span>Bixi</span>
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-slate-500 hover:text-[#042954] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Wax ka beddel"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Tirtir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Accounts Payable Reference Box */}
      {suppliers.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Daymaha Alaab-qeybiyeyaasha (Accounts Payable - Suppliers)</span>
            </h4>
            <span className="text-xs font-bold text-amber-700 font-mono">
              Wadarta: ${supplierDebtTotal.toFixed(2)}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {suppliers.map(s => (
              <div key={s.id} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">{s.name}</div>
                  <div className="text-[10px] text-slate-400">{s.company}</div>
                </div>
                <div className="font-bold font-mono text-rose-600">
                  ${s.balanceOwed.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Liability Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-100 overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#042954] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#ffae01]" />
                <h3 className="font-bold text-sm">
                  {editingLiability ? 'Wax ka beddel Deynta / Amaahda' : 'Ku dar Deyn / Amaah Cusub'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Magaca Deynta / Heshiiska*
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="tusaale: Amaahda Qalabka Salaam Bank, Kirada Dhismaha..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Cidda Lagu Leeyahay (Lender / Creditor)*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lenderOrCreditor || ''}
                    onChange={(e) => setFormData({ ...formData, lenderOrCreditor: e.target.value })}
                    placeholder="tusaale: Salaam African Bank, Sheekh Axmed..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Nooca Deynta (Liability Type)*
                  </label>
                  <select
                    value={formData.type || 'bank_loan'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#042954] cursor-pointer"
                  >
                    <option value="bank_loan">Amaah Bangi (Bank Loan / Facility)</option>
                    <option value="accounts_payable">Daynta Ganacsiga (Accounts Payable)</option>
                    <option value="short_term_debt">Deyn Dhow (Short-Term Debt &lt; 1 yr)</option>
                    <option value="long_term_loan">Amaah Fog (Long-Term Loan &gt; 1 yr)</option>
                    <option value="accrued_expense">Biilal / Kiro La Sugayo (Accrued Expense)</option>
                    <option value="other">Deyn Kale (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Wadarta Lacagta Deynta ($)*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.totalAmount ?? ''}
                    onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#042954]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Lacagta Horey Loo Bixiyay ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.paidAmount ?? ''}
                    onChange={(e) => setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#042954]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Taariikhda Bixinta (Due Date)
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Taariikhda La Galay (Start Date)
                  </label>
                  <input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
                  />
                </div>
              </div>

              {/* Calculated Remaining Preview */}
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-rose-800 font-bold block">Lacagta Dhiman ee Lagu Leeyahay (Remaining):</span>
                  <span className="text-[10px] text-rose-600">Wadarta - La Bixiyay</span>
                </div>
                <div className="text-base font-black text-rose-700 font-mono">
                  ${Math.max(0, (Number(formData.totalAmount) || 0) - (Number(formData.paidAmount) || 0)).toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Xusuusin & Faahfaahin (Notes)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Heshiiska, lambarka koontada, shuruudaha bixinta..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#ffae01]" />
                  <span>{editingLiability ? 'Keydi Waxka-beddelka' : 'Keydi Deynta'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Make Payment Modal */}
      {showPaymentModal && payingLiability && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-sm">
                  Bixi Qeyb Deyn ah (Debt Repayment)
                </h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500 font-bold">Deynta la bixinayo:</div>
                <div className="font-bold text-slate-900 text-sm">{payingLiability.name}</div>
                <div className="text-slate-500">Lagu leeyahay: {payingLiability.lenderOrCreditor}</div>
                <div className="text-rose-600 font-bold pt-1 border-t border-slate-200">
                  Lacagta Dhiman: ${(payingLiability.totalAmount - payingLiability.paidAmount).toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Qadarka La Bixinayo Hadda ($)*
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={payingLiability.totalAmount - payingLiability.paidAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-sm outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Faahfaahin / Xusuusin (Receipt / Note)
                </label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="tusaale: Bixinta bisha March, EVC ref..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Xaqiiji Bixinta Lacagta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

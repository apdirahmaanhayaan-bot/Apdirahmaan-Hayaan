import React, { useState } from 'react';
import { Expense, SchoolAccount, FinancialTransaction } from '../types';
import { Wallet, Plus, Trash2, Edit3, X, Save, Building2, ArrowUpRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DEFAULT_ACCOUNTS } from '../accountsData';

interface ExpensesPageProps {
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  saveData: (updatedExpenses: Expense[]) => void;
  accounts?: SchoolAccount[];
  transactions?: FinancialTransaction[];
  setTransactions?: (txs: FinancialTransaction[]) => void;
  saveTransactions?: (txs: FinancialTransaction[]) => void;
  currentUser?: any;
}

export default function ExpensesPage({ 
  expenses, 
  setExpenses, 
  saveData,
  accounts = DEFAULT_ACCOUNTS,
  transactions = [],
  setTransactions,
  saveTransactions,
  currentUser
}: ExpensesPageProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [date, setDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [note, setNote] = useState('');

  // Edit State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Expense | null>(null);

  // Safety Confirmation Modal ("Ma hubtaa in aad bixisay lacagtan?")
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleInitiateRecord = () => {
    if (!name.trim() || !amount.trim() || !date.trim()) {
      alert("Fadlan buuxi dhammaan macluumaadka kharashka!");
      return;
    }
    const numAmt = Number(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      alert("Fadlan geli qaddar sax ah oo lacag ah!");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmExpense = () => {
    setShowConfirmModal(false);

    const chosenAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];
    const accountName = chosenAccount ? chosenAccount.name : 'Cash Box';

    const newExpense: Expense = {
      name: name.trim(),
      amt: Number(amount) || 0,
      date,
      note: note.trim(),
      account: accountName,
      accountId: chosenAccount?.id
    };

    const updated = [...expenses, newExpense];
    setExpenses(updated);
    saveData(updated);

    // Also register in transactions so account balance is deducted
    const newTx: FinancialTransaction = {
      id: `TX-${Date.now()}`,
      date,
      type: 'expense',
      account: accountName,
      accountId: chosenAccount?.id,
      category: 'Other Expense',
      amount: Number(amount) || 0,
      reference: `EXP-${Date.now().toString().slice(-4)}`,
      payerPayee: name.trim(),
      note: `Kharash: ${name.trim()} | Laga saaray: ${accountName} ${note.trim() ? `(${note.trim()})` : ''}`,
      status: 'completed',
      createdBy: currentUser?.fullName || 'Maamulka'
    };

    const updatedTxs = [newTx, ...transactions];
    if (setTransactions) setTransactions(updatedTxs);
    if (saveTransactions) saveTransactions(updatedTxs);

    // Reset fields
    setName('');
    setAmount('');
    setNote('');
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setEditFormData({ ...expenses[index] });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex === null || !editFormData) return;

    const updated = expenses.map((exp, idx) => idx === editingIndex ? editFormData : exp);
    setExpenses(updated);
    saveData(updated);

    setEditingIndex(null);
    setEditFormData(null);
  };

  const handleDelete = (index: number) => {
    if (confirm("Ma hubtaa inaad tirtirto kharashkan?")) {
      const updated = expenses.filter((_, idx) => idx !== index);
      setExpenses(updated);
      saveData(updated);
    }
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amt || 0), 0);

  return (
    <div className="space-y-6">
      {/* Expenses Input Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs no-print">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display text-slate-900">Xereynta Kharashaadka (Expenses)</h2>
            <p className="text-xs text-slate-500 font-medium">Kharashka marka aad xereyso dooro account-ka lacagta laga saaray</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nooca Kharashka *</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tusaale: Bill-ka Korontada" 
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-rose-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Qadarka Lacagta ($) *</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00" 
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-700 outline-none focus:bg-white focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Accounts-kee lacagta laga saaray */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Accounts-kee lacagta laga saaray? *</span>
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-rose-500 transition-colors"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (Acc: {acc.accountNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Taariikhda *</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-rose-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2 lg:col-span-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Faahfaahin / Xusuusin</label>
            <input 
              type="text" 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Qor sharaxaad kooban oo ku saabsan kharashka..." 
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-rose-500 transition-colors"
            />
          </div>

          <div className="flex items-end">
            <button 
              onClick={handleInitiateRecord}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer min-h-[42px]"
            >
              <Plus className="w-4 h-4" />
              <span>Xeree Kharashka</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expenses List Board */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold font-display text-slate-900">
              Diiwaanka Kharashaadka Supermarket-ka
            </h3>
            <p className="text-xs text-slate-500">Dhammaan kharashaadka baxay iyo account-yada laga saaray</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
              <span className="text-xs font-bold text-rose-800">Wadarta Kharashka:</span>
              <span className="text-base font-black text-rose-700 font-display">${totalExpenses.toLocaleString()}</span>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 font-bold">
              {expenses.length} Kharash
            </span>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Wallet className="w-12 h-12 mx-auto stroke-1 mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Wax kharash ah weli lama xereyn.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Kharashka</th>
                  <th className="py-3.5 px-4">Account-ka Laga Saaray</th>
                  <th className="py-3.5 px-4">Taariikhda</th>
                  <th className="py-3.5 px-4">Qadarka</th>
                  <th className="py-3.5 px-4">Faahfaahin</th>
                  <th className="py-3.5 px-4 text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp, index) => (
                  <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-medium">{index + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{exp.name}</td>
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        <Building2 className="w-3 h-3 text-amber-700" />
                        <span>{exp.account || 'Qasnadda Guud'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{exp.date}</td>
                    <td className="py-3 px-4 font-black text-rose-600 font-display text-sm">
                      -${exp.amt}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{exp.note || '-'}</td>
                    <td className="py-3 px-4 text-right no-print">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(index)}
                          className="p-1.5 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 rounded-md transition-colors cursor-pointer"
                          title="Edit Kharash"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                          title="Delete Kharash"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Expense Modal */}
      {editingIndex !== null && editFormData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 font-display">Wax ka bedel Kharashka</h3>
              <button
                onClick={() => { setEditingIndex(null); setEditFormData(null); }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700">Nooca Kharashka</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Qadarka Lacagta ($)</label>
                <input
                  type="number"
                  value={editFormData.amt}
                  onChange={(e) => setEditFormData({ ...editFormData, amt: Number(e.target.value) })}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-rose-700 outline-none focus:bg-white focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Accounts-kee lacagta laga saaray?</label>
                <select
                  value={editFormData.accountId || editFormData.account}
                  onChange={(e) => {
                    const acc = accounts.find(a => a.id === e.target.value || a.name === e.target.value);
                    setEditFormData({
                      ...editFormData,
                      account: acc?.name || e.target.value,
                      accountId: acc?.id
                    });
                  }}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white focus:border-rose-500"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.accountNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Taariikhda</label>
                <input
                  type="date"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Faahfaahin</label>
                <input
                  type="text"
                  value={editFormData.note}
                  onChange={(e) => setEditFormData({ ...editFormData, note: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setEditingIndex(null); setEditFormData(null); }}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Ka Noqo
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Kaydi Isbedelka
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safety Confirmation Modal: Ma hubtaa in aad bixisay lacagtan? */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-rose-600 text-white flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-2xl">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black font-display">
                  Xaqiijinta Bixinta Kharashka
                </h3>
                <p className="text-xs text-rose-100 mt-0.5">
                  Fadlan xaqiiji in lacagtan dhab ahaan loo bixiyay.
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center py-2">
                <p className="text-sm font-bold text-slate-700">
                  Ma hubtaa in aad bixisay lacagtan kharashka ah?
                </p>
                <div className="text-3xl font-black text-rose-600 my-2">
                  ${Number(amount).toFixed(2)}
                </div>
                <p className="text-xs font-bold text-slate-700">
                  Nooca Kharashka: <span className="text-[#042954]">{name}</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Account-ka laga bixinayo:{' '}
                  <span className="font-semibold text-slate-700">
                    {accounts.find(a => a.id === selectedAccountId)?.name || accounts[0]?.name || 'Cash Box'}
                  </span>
                </p>
                {note.trim() && (
                  <p className="text-[11px] text-slate-400 mt-1 italic">
                    "{note.trim()}"
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  MAYA (Ka laabo)
                </button>

                <button
                  type="button"
                  onClick={handleConfirmExpense}
                  className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>HAA, WAA LA BIXIYAY</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { Customer, DebtPayment, FinancialAccount, SaleTransaction, AppUser } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  MapPin, 
  FileText, 
  X, 
  Check, 
  CreditCard,
  History,
  Receipt
} from 'lucide-react';

interface CustomersDebtPageProps {
  customers: Customer[];
  debtPayments: DebtPayment[];
  accounts: any[];
  sales?: SaleTransaction[];
  currentUser?: AppUser | null;
  onAddCustomer: (customer: Customer) => void;
  onRecordPayment?: (payment: DebtPayment) => void;
  onRecordDebtPayment?: (payment: DebtPayment) => void;
}

export default function CustomersDebtPage({
  customers,
  debtPayments,
  accounts,
  sales = [],
  currentUser,
  onAddCustomer,
  onRecordPayment,
  onRecordDebtPayment
}: CustomersDebtPageProps) {
  const recordPaymentHandler = onRecordPayment || onRecordDebtPayment || (() => {});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Add Customer Modal
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    creditLimit: 200,
    initialDebt: 0
  });

  // Debt Payment Modal
  const [paymentTargetCustomer, setPaymentTargetCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentAccount, setPaymentAccount] = useState<string>(accounts[0]?.name || 'Cash Box');
  const [paymentNote, setPaymentNote] = useState<string>('');

  // Confirmation Modal ("Ma hubtaa inuu bixiyay lacagta?")
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.address && c.address.toLowerCase().includes(q));
    });
  }, [customers, searchQuery]);

  // Statistics
  const totalReceivables = customers.reduce((sum, c) => sum + c.totalDebt, 0);
  const customersWithDebtCount = customers.filter(c => c.totalDebt > 0).length;

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerData.name || !newCustomerData.phone) {
      alert('Fadlan geli magaca iyo taleefanka macmiilka!');
      return;
    }

    const newCust: Customer = {
      id: `cust_${Date.now()}`,
      name: newCustomerData.name,
      phone: newCustomerData.phone,
      address: newCustomerData.address,
      totalDebt: Number(newCustomerData.initialDebt) || 0,
      creditLimit: Number(newCustomerData.creditLimit) || 200,
      points: 10,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddCustomer(newCust);
    setShowAddCustomerModal(false);
    setNewCustomerData({ name: '', phone: '', address: '', creditLimit: 200, initialDebt: 0 });
  };

  const handleOpenPaymentModal = (customer: Customer) => {
    setPaymentTargetCustomer(customer);
    setPaymentAmount(customer.totalDebt > 0 ? customer.totalDebt : 10);
    setPaymentAccount(accounts[0]?.name || 'Cash Box');
    setPaymentNote(`Bixinta deynta macmiilka: ${customer.name}`);
  };

  // Click submit payment -> Opens required Safety Confirmation prompt
  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTargetCustomer || paymentAmount <= 0) {
      alert('Fadlan geli qaddarka saxda ah ee lacagta!');
      return;
    }
    // Trigger explicit confirmation prompt
    setShowConfirmModal(true);
  };

  // Confirming "HAA, WUU BIXIYAY"
  const handleFinalConfirmPayment = () => {
    setShowConfirmModal(false);

    if (!paymentTargetCustomer) return;

    const payment: DebtPayment = {
      id: `debt_pay_${Date.now()}`,
      customerId: paymentTargetCustomer.id,
      customerName: paymentTargetCustomer.name,
      amount: paymentAmount,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: paymentAccount.includes('EVC') ? 'EVC Plus' : paymentAccount.includes('Zaad') ? 'Zaad' : 'Cash',
      account: paymentAccount,
      receivedBy: currentUser?.fullName || currentUser?.username || 'Maamulka / Qasnajiga',
      note: paymentNote
    };

    recordPaymentHandler(payment);
    setPaymentTargetCustomer(null);
  };

  // Selected customer history
  const activeCustomer = customers.find(c => c.id === selectedCustomerId);
  const activeCustomerSales = sales.filter(s => s.customerId === selectedCustomerId);
  const activeCustomerPayments = debtPayments.filter(p => p.customerId === selectedCustomerId);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#042954] text-[#ffae01] rounded-xl shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Macaamiisha & Maamulka Daymaha (Customer Debts & Accounts)
            </h1>
            <p className="text-xs text-slate-500">
              Diiwaanka macaamiisha, xisaabaadka daymaha, iyo rasiidhada lacag-bixinta.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddCustomerModal(true)}
          className="px-4 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#ffae01]" />
          <span>Ku dar Macmiil Cusub</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Wadarta Daymaha Macaamiisha
          </span>
          <div className="text-2xl font-black text-red-600 mt-1">
            ${totalReceivables.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Lacagta banaanka ku maqan ee la sugayo
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Macaamiisha Daynta Lagu Leeyahay
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {customersWithDebtCount} <span className="text-xs font-medium text-slate-400">qof</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Macaamiisha diiwaangashan guud ahaan: {customers.length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Daym-bixintii Ugu Dambeysay
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {debtPayments.length} <span className="text-xs font-medium text-slate-400">mar</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
            Wadarta la qabtay: ${debtPayments.reduce((s, p) => s + p.amount, 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Raadi magaca macmiilka ama taleefanka..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#042954]"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Macmiilka (Name)</th>
                <th className="py-3 px-4">Taleefanka</th>
                <th className="py-3 px-4">Goobta / Cinwaanka</th>
                <th className="py-3 px-4 text-right">Xadka Daynta (Limit)</th>
                <th className="py-3 px-4 text-right">Daynta Lagu Leeyahay</th>
                <th className="py-3 px-4 text-center">Xaaladda</th>
                <th className="py-3 px-4 text-right">Ficil (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Macmiil laguma helin raadinta.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => {
                  const hasDebt = c.totalDebt > 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {c.id}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.phone}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{c.address || 'Muqdisho'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-medium text-slate-600">
                        ${c.creditLimit.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {hasDebt ? (
                          <span className="text-sm font-black text-red-600">
                            ${c.totalDebt.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold">
                            $0.00 (Nadiif)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {hasDebt ? (
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded-lg inline-block">
                            Deyn Leh
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-lg inline-block">
                            Nadiif ah
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {hasDebt && (
                            <button
                              onClick={() => handleOpenPaymentModal(c)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                            >
                              <DollarSign className="w-3 h-3" />
                              <span>Qabo Lacag</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedCustomerId(selectedCustomerId === c.id ? null : c.id)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <History className="w-3 h-3 text-slate-500" />
                            <span>Taariikh</span>
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

      {/* Customer Statement Details Drawer/Card */}
      {activeCustomer && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Warbixinta Xisaabta: {activeCustomer.name}
              </h3>
              <p className="text-xs text-slate-500">
                Taleefan: {activeCustomer.phone} • Daynta Guud: <span className="font-bold text-red-600">${activeCustomer.totalDebt.toFixed(2)}</span>
              </p>
            </div>
            <button
              onClick={() => setSelectedCustomerId(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sales on Credit */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-[#042954]" />
                <span>Iibka Deynta ah (Credit Purchases)</span>
              </h4>
              <div className="bg-slate-50 rounded-xl p-2.5 max-h-48 overflow-y-auto divide-y divide-slate-200/60 text-xs">
                {activeCustomerSales.length === 0 ? (
                  <p className="text-slate-400 text-center py-3">Iib hore looma helin.</p>
                ) : (
                  activeCustomerSales.map(s => (
                    <div key={s.id} className="py-2 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-800">{s.receiptNo}</span>
                        <span className="text-[10px] text-slate-400 block">{s.date} • {s.items.length} alaab</span>
                      </div>
                      <span className="font-black text-slate-900">${s.total.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payments received */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Deym-bixinta La Helay (Payments History)</span>
              </h4>
              <div className="bg-slate-50 rounded-xl p-2.5 max-h-48 overflow-y-auto divide-y divide-slate-200/60 text-xs">
                {activeCustomerPayments.length === 0 ? (
                  <p className="text-slate-400 text-center py-3">Weli lacag lama qaban.</p>
                ) : (
                  activeCustomerPayments.map(p => (
                    <div key={p.id} className="py-2 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-emerald-800">Bixin: ${p.amount.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 block">{p.date} • Koonto: {p.account}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md">
                        La Xaqiijiyay
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Debt Payment Modal */}
      {paymentTargetCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-200" />
                <h3 className="text-sm font-bold font-display">
                  Qabashada Lacagta Deynta (Debt Repayment)
                </h3>
              </div>
              <button
                onClick={() => setPaymentTargetCustomer(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInitiatePayment} className="p-5 space-y-3.5 text-xs">
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-emerald-950">
                <span className="block text-[11px] text-emerald-800">Macmiilka Lacagta Bixinaya:</span>
                <h4 className="text-sm font-black mt-0.5">{paymentTargetCustomer.name}</h4>
                <div className="flex justify-between items-center mt-1 text-xs">
                  <span>Daynta Lagu Leeyahay:</span>
                  <span className="font-black text-red-600">${paymentTargetCustomer.totalDebt.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Qaddarka Lacagta La Qabanayo ($)*
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={paymentTargetCustomer.totalDebt}
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-sm text-slate-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Koontada Lacagta Lagu Qabtay (Account)*
                </label>
                <select
                  value={paymentAccount}
                  onChange={(e) => setPaymentAccount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-emerald-600 cursor-pointer"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.name}>
                      {acc.name} ({acc.bankName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Faahfaahin / Xusuusin (Notes)
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Faahfaahin ama reference..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentTargetCustomer(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Qabo Lacagta (${paymentAmount.toFixed(2)})</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXPLICIT CONFIRMATION PROMPT: "MA HUBTAA INUU BIXIYAY LACAGTA?"            */}
      {/* ========================================================================= */}
      {showConfirmModal && paymentTargetCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-amber-500 text-white flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-2xl">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black font-display">
                  Xaqiijinta Deym-Bixinta
                </h3>
                <p className="text-xs text-amber-100 mt-0.5">
                  Fadlan xaqiiji qabashada lacagta.
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center py-2">
                <p className="text-sm font-bold text-slate-700">
                  Ma hubtaa inuu macmiilku bixiyay lacagta?
                </p>
                <div className="text-3xl font-black text-emerald-700 my-2">
                  ${paymentAmount.toFixed(2)}
                </div>
                <p className="text-xs font-bold text-slate-600">
                  Macmiilka: <span className="text-[#042954]">{paymentTargetCustomer.name}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Koontada: {paymentAccount}
                </p>
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
                  onClick={handleFinalConfirmPayment}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>HAA, WUU BIXIYAY</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 bg-[#042954] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#ffae01]" />
                <h3 className="text-sm font-bold font-display">Diiwaangeli Macmiil Cusub</h3>
              </div>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Magaca Macmiilka (Full Name)*
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerData.name}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                  placeholder="tusaale: Jaamac Axmed Nuur"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Taleefanka (Phone)*
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerData.phone}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                  placeholder="+25290..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none focus:border-[#042954]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Cinwaanka / Goobta (Address)
                </label>
                <input
                  type="text"
                  value={newCustomerData.address}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, address: e.target.value })}
                  placeholder="Xaafadda, Magaalada"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Xadka Daynta (Credit Limit $)
                  </label>
                  <input
                    type="number"
                    value={newCustomerData.creditLimit}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, creditLimit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#042954]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Deyn Hore Lagu Leeyahay ($)
                  </label>
                  <input
                    type="number"
                    value={newCustomerData.initialDebt}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, initialDebt: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#042954]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#042954] hover:bg-[#031d3d] text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#ffae01]" />
                  <span>Diiwaangeli</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

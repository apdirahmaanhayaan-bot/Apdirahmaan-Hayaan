import React, { useState } from 'react';
import { Customer, SaleTransaction, DebtPayment, AppUser } from '../types';
import { 
  User, 
  Receipt, 
  CreditCard, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Eye, 
  Printer, 
  X, 
  Gift 
} from 'lucide-react';

interface CustomerPortalProps {
  currentUser: AppUser | null;
  customers: Customer[];
  sales: SaleTransaction[];
  debtPayments: DebtPayment[];
  onOpenChat: () => void;
}

export default function CustomerPortal({
  currentUser,
  customers,
  sales,
  debtPayments,
  onOpenChat
}: CustomerPortalProps) {
  // Find customer based on assigned customer id or match by username/phone
  const myCustomer = customers.find(c => c.id === currentUser?.assignedCustomerId) || customers[0];
  const [selectedReceipt, setSelectedReceipt] = useState<SaleTransaction | null>(null);

  // Filter sales for this customer
  const mySales = sales.filter(s => s.customerId === myCustomer?.id || s.customerName.includes(myCustomer?.name || ''));
  const myPayments = debtPayments.filter(p => p.customerId === myCustomer?.id);

  if (!myCustomer) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <p className="text-sm font-bold text-slate-500">Xogta macmiilka lama helin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#042954] text-[#ffae01] flex items-center justify-center font-bold text-lg shadow-xs">
            {myCustomer.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Kusoo Dhawoow, {myCustomer.name}
            </h1>
            <p className="text-xs text-slate-500">
              Portal-ka Macmiilka Supermarket-ka • Tel: {myCustomer.phone}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenChat}
          className="px-4 py-2 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <span>La Hadal Maamulaha (Live Chat)</span>
        </button>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Debt Balance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Daynta Hadda Kugu Taalla
          </span>
          <div className="text-2xl font-black mt-1">
            {myCustomer.totalDebt > 0 ? (
              <span className="text-red-600">${myCustomer.totalDebt.toFixed(2)}</span>
            ) : (
              <span className="text-emerald-600">$0.00 (Nadiif)</span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Xadka deyntaada: ${myCustomer.creditLimit.toFixed(2)}
          </span>
        </div>

        {/* Total Purchases */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Wadarta Iibsigaaga
          </span>
          <div className="text-2xl font-black text-[#042954] mt-1">
            {mySales.length} <span className="text-xs font-medium text-slate-400">mar</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Lacagta guud: ${mySales.reduce((s, i) => s + i.total, 0).toFixed(2)}
          </span>
        </div>

        {/* Loyalty Points */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Dhibcaha Abaalmarinta (Points)
          </span>
          <div className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-1.5">
            <Gift className="w-5 h-5" />
            <span>{myCustomer.points || 120}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Qiimo dhimis iyo hadyado gaar ah
          </span>
        </div>
      </div>

      {/* Receipts History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#042954]" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Taariikhda Rasiidhadaada (My Receipts)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {mySales.length} rasiidh
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Rasiidhka #</th>
                <th className="py-3 px-4">Taariikhda</th>
                <th className="py-3 px-4">Alaabta</th>
                <th className="py-3 px-4 text-center">Habka</th>
                <th className="py-3 px-4 text-right">Wadarta ($)</th>
                <th className="py-3 px-4 text-right">Ficil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mySales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Weli rasiidh ma haysatid.
                  </td>
                </tr>
              ) : (
                mySales.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-[#042954]">
                      {s.receiptNo}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {s.date} {s.time}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {s.items.length} nooc ({s.items.map(i => i.name).join(', ').substring(0, 30)}...)
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-bold rounded uppercase">
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      ${s.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(s)}
                        className="px-2 py-1 bg-slate-100 hover:bg-[#042954] hover:text-white rounded-lg font-bold text-[11px] cursor-pointer"
                      >
                        Arag Rasiidhka
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Debt Payments History */}
      {myPayments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Lacagihii Aad Bixisay (Payment Receipts)
          </h3>
          <div className="space-y-2">
            {myPayments.map(p => (
              <div key={p.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">Bixinta Daynta: ${p.amount.toFixed(2)}</span>
                  <p className="text-[11px] text-slate-400">{p.date} • Habka: {p.paymentMethod} • {p.account}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-lg">
                  La Xaqiijiyay
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 bg-[#042954] text-white flex items-center justify-between">
              <span className="text-xs font-bold">Rasiidh: {selectedReceipt.receiptNo}</span>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 font-mono text-xs text-slate-800 space-y-2 bg-[#fffef9]">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <h3 className="font-bold uppercase">XAAJI SALAAD SUPERMARKET</h3>
                <p className="text-[10px] text-slate-400">{selectedReceipt.date} {selectedReceipt.time}</p>
              </div>
              <div className="py-2 border-b border-dashed border-slate-300 space-y-1">
                {selectedReceipt.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.qty}x {it.name}</span>
                    <span className="font-bold">${it.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-1 flex justify-between font-black text-sm">
                <span>Wadarta:</span>
                <span>${selectedReceipt.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border-t flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Daabac
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                Xir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

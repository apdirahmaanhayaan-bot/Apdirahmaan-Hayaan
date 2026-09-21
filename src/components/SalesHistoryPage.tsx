import React, { useState, useMemo } from 'react';
import { SaleTransaction } from '../types';
import { 
  Receipt, 
  Search, 
  Calendar, 
  Printer, 
  DollarSign, 
  CreditCard, 
  CheckCircle2, 
  X, 
  Eye, 
  Filter 
} from 'lucide-react';

interface SalesHistoryPageProps {
  sales: SaleTransaction[];
}

export default function SalesHistoryPage({ sales }: SalesHistoryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [viewingReceipt, setViewingReceipt] = useState<SaleTransaction | null>(null);

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        s.receiptNo.toLowerCase().includes(q) || 
        s.customerName.toLowerCase().includes(q) || 
        s.cashierName.toLowerCase().includes(q) ||
        s.items.some(i => i.name.toLowerCase().includes(q));

      const matchesMethod = methodFilter === 'all' || s.paymentMethod === methodFilter;
      const matchesDate = !dateFilter || s.date === dateFilter;

      return matchesSearch && matchesMethod && matchesDate;
    });
  }, [sales, searchQuery, methodFilter, dateFilter]);

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalItemsSold = filteredSales.reduce((sum, s) => sum + s.items.reduce((is, i) => is + i.qty, 0), 0);
  const avgBasket = filteredSales.length > 0 ? (totalRevenue / filteredSales.length).toFixed(2) : '0.00';

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#042954] text-[#ffae01] rounded-xl shadow-xs">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Diiwaanka Iibka & Rasiidhada (Sales & Invoices)
            </h1>
            <p className="text-xs text-slate-500">
              Dhammaan iibyadii ka dhacay POS-ka, faahfaahinta rasiidhada iyo daabacada.
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Daabac Liiska</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Wadarta Iibka (Filtered Sales)
          </span>
          <div className="text-2xl font-black text-[#042954] mt-1">
            ${totalRevenue.toFixed(2)}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
            Dakhliga iibka la xisaabiyay
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Tirada Rasiidhada (Transactions)
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {filteredSales.length} <span className="text-xs font-medium text-slate-400">iib</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Alaab la iibiyay: {totalItemsSold} xabbo
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Celceliska Iibka (Avg Basket)
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            ${avgBasket}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Halkii macmiil celcelis ahaan
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Raadi Rasiidh, Macmiil, Alaab..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#042954]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Payment Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Dhammaan Hababka Bixinta</option>
            <option value="cash">Kaash (Cash)</option>
            <option value="evc">EVC Plus</option>
            <option value="zaad">Zaad</option>
            <option value="sahal">Sahal</option>
            <option value="edahab">eDahab</option>
            <option value="credit">Deymo (Credit)</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          />

          {(methodFilter !== 'all' || dateFilter) && (
            <button
              onClick={() => { setMethodFilter('all'); setDateFilter(''); }}
              className="px-2 py-2 text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              Nadiifi
            </button>
          )}
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Rasiidhka (Receipt #)</th>
                <th className="py-3 px-4">Taariikhda & Waqtiga</th>
                <th className="py-3 px-4">Macmiilka</th>
                <th className="py-3 px-4">Qasnajiga</th>
                <th className="py-3 px-4">Alaabta & Tirada</th>
                <th className="py-3 px-4 text-center">Habka Bixinta</th>
                <th className="py-3 px-4 text-right">Wadarta ($)</th>
                <th className="py-3 px-4 text-right">Rasiidh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Iib laguma helin xogta la raadiyay.
                  </td>
                </tr>
              ) : (
                filteredSales.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#042954]">
                      {s.receiptNo}
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {s.date} <span className="text-slate-400">{s.time}</span>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-800">
                      {s.customerName}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {s.cashierName}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      <span className="font-bold text-slate-700">
                        {s.items.length} nooc
                      </span> ({s.items.reduce((sum, i) => sum + i.qty, 0)} xabbo)
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase inline-block ${
                        s.paymentMethod === 'cash' ? 'bg-slate-100 text-slate-800' :
                        s.paymentMethod === 'evc' ? 'bg-emerald-100 text-emerald-800' :
                        s.paymentMethod === 'zaad' ? 'bg-amber-100 text-amber-800' :
                        s.paymentMethod === 'credit' ? 'bg-rose-100 text-rose-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {s.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                      ${s.total.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setViewingReceipt(s)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-[#042954] hover:text-white text-slate-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Arag</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View & Print Receipt Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 bg-[#042954] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#ffae01]" />
                <span className="text-xs font-bold font-display">Rasiidka Iibka: {viewingReceipt.receiptNo}</span>
              </div>
              <button
                onClick={() => setViewingReceipt(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 font-mono text-xs text-slate-800 space-y-3 bg-[#fffef9]">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <h2 className="text-sm font-black text-slate-900 uppercase">
                  XAAJI SALAAD SUPERMARKET
                </h2>
                <p className="text-[10px] text-slate-500">POS Sales System</p>
                <p className="text-[10px] text-slate-500">Rasiidh: {viewingReceipt.receiptNo}</p>
                <p className="text-[10px] text-slate-500">{viewingReceipt.date} {viewingReceipt.time}</p>
              </div>

              <div className="space-y-1.5 py-1 border-b border-dashed border-slate-300">
                {viewingReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="truncate font-bold">{item.name}</div>
                      <div className="text-[9px] text-slate-500">
                        {item.qty} x ${item.unitPrice.toFixed(2)}
                      </div>
                    </div>
                    <span className="font-black">${item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Wadarta:</span>
                  <span>${viewingReceipt.subtotal.toFixed(2)}</span>
                </div>
                {viewingReceipt.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Dhimis:</span>
                    <span>-${viewingReceipt.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-300">
                  <span>GUUD (TOTAL):</span>
                  <span>${viewingReceipt.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                  <span>Habka Bixinta:</span>
                  <span className="font-bold uppercase">{viewingReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500">
                <p>Mahadsanid! Soo noqo mar kale.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Daabac</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
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

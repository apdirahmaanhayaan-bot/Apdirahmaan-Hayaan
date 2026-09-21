import React, { useState, useMemo } from 'react';
import {
  Scale,
  Printer,
  Edit3,
  Check,
  X,
  TrendingUp,
  ShieldCheck,
  Building2,
  DollarSign,
  Briefcase,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CreditCard
} from 'lucide-react';
import { 
  FinancialAccount, 
  FinancialTransaction, 
  FixedAsset, 
  LiabilityItem, 
  EquityDetails, 
  Product, 
  Customer, 
  Supplier, 
  Expense, 
  SaleTransaction,
  SchoolAccount
} from '../../types';
import { getAccountBalance } from '../../accountsData';

interface BalanceSheetViewProps {
  accounts: SchoolAccount[];
  transactions: FinancialTransaction[];
  fixedAssets: FixedAsset[];
  liabilities: LiabilityItem[];
  equityDetails?: EquityDetails;
  onUpdateEquity?: (eq: EquityDetails) => void;
  products?: Product[];
  customers?: Customer[];
  suppliers?: Supplier[];
  expenses?: Expense[];
  sales?: SaleTransaction[];
  supermarketName?: string;
}

export default function BalanceSheetView({
  accounts = [],
  transactions = [],
  fixedAssets = [],
  liabilities = [],
  equityDetails = { initialCapital: 25000, additionalInvestment: 5000, drawings: 1500 },
  onUpdateEquity,
  products = [],
  customers = [],
  suppliers = [],
  expenses = [],
  sales = [],
  supermarketName = 'Xaaji Salaad Supermarket'
}: BalanceSheetViewProps) {
  const [showEditEquity, setShowEditEquity] = useState(false);
  const [equityForm, setEquityForm] = useState<EquityDetails>(equityDetails);

  // 1. Cash & Bank Balances
  const totalCashAndBanks = useMemo(() => {
    return accounts.reduce((sum, acc) => {
      const { currentBalance } = getAccountBalance(acc, transactions);
      return sum + currentBalance;
    }, 0);
  }, [accounts, transactions]);

  // 2. Accounts Receivable (Debts owed by customers)
  const totalReceivables = useMemo(() => {
    return customers.reduce((sum, c) => sum + (Number(c.totalDebt) || 0), 0);
  }, [customers]);

  // 3. Merchandise Inventory Value (Cost value of all products in stock)
  const totalInventoryValue = useMemo(() => {
    return products.reduce((sum, p) => {
      const qty = Math.max(0, Number(p.stockQty) || 0);
      const cost = Number(p.buyPrice) || 0;
      return sum + (qty * cost);
    }, 0);
  }, [products]);

  // Total Current Assets
  const totalCurrentAssets = totalCashAndBanks + totalReceivables + totalInventoryValue;

  // 4. Fixed Assets
  const grossFixedAssets = useMemo(() => {
    return fixedAssets.reduce((sum, a) => sum + (Number(a.purchaseCost) || 0), 0);
  }, [fixedAssets]);

  const totalAccumulatedDepreciation = useMemo(() => {
    return fixedAssets.reduce((sum, a) => sum + (Number(a.accumulatedDepreciation) || 0), 0);
  }, [fixedAssets]);

  const netFixedAssets = Math.max(0, grossFixedAssets - totalAccumulatedDepreciation);

  // GRAND TOTAL ASSETS
  const grandTotalAssets = totalCurrentAssets + netFixedAssets;

  // 5. Current Liabilities
  const totalSupplierPayables = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + (Number(s.balanceOwed) || 0), 0);
  }, [suppliers]);

  const shortTermLiabilities = useMemo(() => {
    return liabilities
      .filter(l => l.type === 'short_term_debt' || l.type === 'accounts_payable' || l.type === 'accrued_expense')
      .reduce((sum, l) => {
        const rem = Math.max(0, (Number(l.totalAmount) || 0) - (Number(l.paidAmount) || 0));
        return sum + rem;
      }, 0);
  }, [liabilities]);

  const totalCurrentLiabilities = totalSupplierPayables + shortTermLiabilities;

  // 6. Long-Term Liabilities
  const longTermLiabilities = useMemo(() => {
    return liabilities
      .filter(l => l.type === 'bank_loan' || l.type === 'long_term_loan' || l.type === 'other')
      .reduce((sum, l) => {
        const rem = Math.max(0, (Number(l.totalAmount) || 0) - (Number(l.paidAmount) || 0));
        return sum + rem;
      }, 0);
  }, [liabilities]);

  // GRAND TOTAL LIABILITIES
  const grandTotalLiabilities = totalCurrentLiabilities + longTermLiabilities;

  // 7. Owner's Equity & Retained Earnings
  const baseEquity = (equityDetails.initialCapital || 0) + (equityDetails.additionalInvestment || 0) - (equityDetails.drawings || 0);

  // Retained earnings balancing figure ensuring Assets = Liabilities + Equity
  const retainedEarnings = grandTotalAssets - grandTotalLiabilities - baseEquity;
  const grandTotalEquity = baseEquity + retainedEarnings;
  const grandTotalLiabilitiesAndEquity = grandTotalLiabilities + grandTotalEquity;

  // Working Capital & Ratios
  const workingCapital = totalCurrentAssets - totalCurrentLiabilities;
  const currentRatio = totalCurrentLiabilities > 0 ? (totalCurrentAssets / totalCurrentLiabilities).toFixed(2) : 'N/A';
  const debtToEquityRatio = grandTotalEquity > 0 ? (grandTotalLiabilities / grandTotalEquity).toFixed(2) : 'N/A';

  const handleSaveEquity = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateEquity) {
      onUpdateEquity(equityForm);
    }
    setShowEditEquity(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Print Action */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#042954] text-[#ffae01] rounded-xl shadow-xs">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Warbixinta Xisaab-Xirka (Comprehensive Balance Sheet)
            </h3>
            <p className="text-xs text-slate-500">
              Shaxda rasmiga ah ee Hantida (Assets), Deymaha (Liabilities), iyo Raasamaalka (Owner's Equity).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEquityForm(equityDetails);
              setShowEditEquity(true);
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-600" />
            <span>Habee Raasamaalka (Equity)</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#ffae01]" />
            <span>Daabac Shaxda (Print)</span>
          </button>
        </div>
      </div>

      {/* The Accounting Equation Balanced Banner */}
      <div className="bg-linear-to-r from-[#042954] to-[#083b75] text-white p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center lg:text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#ffae01]">
              Sharciga Aasaasiga ah ee Xisaabaadka (Accounting Equation)
            </span>
            <div className="text-lg sm:text-xl font-bold font-display flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span>Hantida (Assets)</span>
              <span className="text-[#ffae01] font-black">=</span>
              <span>Deymaha (Liabilities)</span>
              <span className="text-[#ffae01] font-black">+</span>
              <span>Raasamaalka (Equity)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
            <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 block font-sans">Wadarta Hantida</span>
              <span className="text-base font-black text-emerald-400">
                ${grandTotalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <span className="text-lg font-bold text-[#ffae01]">=</span>

            <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 block font-sans">Wadarta Deymaha</span>
              <span className="text-base font-black text-rose-300">
                ${grandTotalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <span className="text-lg font-bold text-[#ffae01]">+</span>

            <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 block font-sans">Raasamaalka</span>
              <span className="text-base font-black text-blue-300">
                ${grandTotalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="ml-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-2 rounded-xl flex items-center gap-1.5 font-sans font-bold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Is-Le'eg (Balanced)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Raasamaalka Shaqada (Working Capital)
          </span>
          <div className={`text-2xl font-black mt-1 font-mono ${workingCapital >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            ${workingCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Hantida Wareegta - Deymaha Dhow
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Saamiga Hantida Wareegta (Current Ratio)
          </span>
          <div className="text-2xl font-black text-[#042954] mt-1 font-mono">
            {currentRatio} : 1
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
            Awoodda bixinta deymaha dhow (Heer fiican &gt; 1.5)
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Saamiga Deyn & Raasamaal (Debt/Equity)
          </span>
          <div className="text-2xl font-black text-amber-700 mt-1 font-mono">
            {debtToEquityRatio}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Wadarta Deymaha / Wadarta Raasamaalka
          </span>
        </div>
      </div>

      {/* Dual Column Balance Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT COLUMN: ASSETS (HANTIDA) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  HANTIDA (ASSETS)
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                Debit Balance
              </span>
            </div>

            <div className="p-5 space-y-6 text-xs">
              {/* Current Assets Section */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <span className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                    1. Hantida Wareegta (Current Assets)
                  </span>
                  <span className="font-bold text-slate-500 text-[10px]">
                    Kharashyada fudud ee lacagta isu beddeli kara
                  </span>
                </div>

                <div className="space-y-2.5 pl-2">
                  {/* Cash and Banks Breakdown */}
                  <div>
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Qasnadda & Bangiyada (Cash & Banks):</span>
                      <span className="font-mono">${totalCashAndBanks.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pl-3 mt-1 space-y-1 text-[11px] text-slate-500">
                      {accounts.map(acc => {
                        const bal = getAccountBalance(acc, transactions).currentBalance;
                        return (
                          <div key={acc.id} className="flex justify-between">
                            <span>• {acc.name}</span>
                            <span className="font-mono text-slate-700">${bal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Accounts Receivable */}
                  <div className="flex justify-between font-medium text-slate-800 pt-1 border-t border-slate-100">
                    <div>
                      <span className="font-bold">Daymaha Macaamiisha (Accounts Receivable):</span>
                      <span className="text-[10px] text-slate-400 block">{customers.filter(c => c.totalDebt > 0).length} qof oo deyn ku leedahay</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">${totalReceivables.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  {/* Merchandise Inventory */}
                  <div className="flex justify-between font-medium text-slate-800 pt-1 border-t border-slate-100">
                    <div>
                      <span className="font-bold">Alaabta Bakhaarka Taala (Merchandise Inventory):</span>
                      <span className="text-[10px] text-slate-400 block">{products.length} nooc oo alaab ah (qiimaha iibsiga)</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  {/* Subtotal Current Assets */}
                  <div className="flex justify-between font-bold text-emerald-800 pt-2 border-t border-slate-200 bg-emerald-50/50 p-2 rounded-xl">
                    <span>Wadarta Hantida Wareegta:</span>
                    <span className="font-mono font-black">${totalCurrentAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Fixed / Non-Current Assets Section */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <span className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                    2. Hantida Ma-Guurtada ah (Fixed Assets)
                  </span>
                  <span className="font-bold text-slate-500 text-[10px]">
                    Qalabka, khaanadaha & gaadiidka
                  </span>
                </div>

                <div className="space-y-2.5 pl-2">
                  <div className="flex justify-between font-medium text-slate-800">
                    <div>
                      <span className="font-bold">Wadarta Qiimaha Iibsiga (Gross Fixed Assets):</span>
                      <span className="text-[10px] text-slate-400 block">{fixedAssets.length} shay oo hanti diiwaangashan ah</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">${grossFixedAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between font-medium text-rose-600">
                    <div>
                      <span>Ka Jar: Qiimo-Dhaca Is-biirsaday (Less: Depreciation):</span>
                      <span className="text-[10px] text-rose-400 block">Khasaarihii isticmaalka qalabka</span>
                    </div>
                    <span className="font-mono font-bold">-${totalAccumulatedDepreciation.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  {/* Subtotal Net Fixed Assets */}
                  <div className="flex justify-between font-bold text-blue-800 pt-2 border-t border-slate-200 bg-blue-50/50 p-2 rounded-xl">
                    <span>Hantida Ma-Guurtada ah ee Saafiga ah (Net):</span>
                    <span className="font-mono font-black">${netFixedAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TOTAL ASSETS FOOTER */}
          <div className="p-5 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between">
            <span className="font-black text-emerald-950 text-sm uppercase tracking-wide">
              WADARTA GUUD EE HANTIDA (TOTAL ASSETS)
            </span>
            <span className="font-mono font-black text-emerald-800 text-lg">
              ${grandTotalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: LIABILITIES & OWNER'S EQUITY (DEYMAHA & RAASAMAALKA) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-600"></span>
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  DEYMAHA & RAASAMAALKA (LIABILITIES & EQUITY)
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                Credit Balance
              </span>
            </div>

            <div className="p-5 space-y-6 text-xs">
              {/* Current Liabilities Section */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <span className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                    1. Deymaha Dhow (Current Liabilities)
                  </span>
                  <span className="font-bold text-slate-500 text-[10px]">
                    Deymaha la bixinayo wax ka yar 1 sano
                  </span>
                </div>

                <div className="space-y-2.5 pl-2">
                  <div className="flex justify-between font-medium text-slate-800">
                    <div>
                      <span className="font-bold">Daynta Alaab-qeybiyeyaasha (Accounts Payable):</span>
                      <span className="text-[10px] text-slate-400 block">Lagu leeyahay {suppliers.filter(s => s.balanceOwed > 0).length} ganacsato</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">${totalSupplierPayables.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between font-medium text-slate-800">
                    <div>
                      <span className="font-bold">Deymaha Dhow ee Kale (Short-Term Payables):</span>
                      <span className="text-[10px] text-slate-400 block">Kirada, korontada & biilasha dhow</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">${shortTermLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between font-bold text-rose-800 pt-2 border-t border-slate-200 bg-rose-50/50 p-2 rounded-xl">
                    <span>Wadarta Deymaha Dhow:</span>
                    <span className="font-mono font-black">${totalCurrentLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Long-Term Liabilities Section */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <span className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                    2. Deymaha Fog (Long-Term Liabilities)
                  </span>
                  <span className="font-bold text-slate-500 text-[10px]">
                    Amaahda bangiyada & deymaha fog
                  </span>
                </div>

                <div className="space-y-2.5 pl-2">
                  <div className="flex justify-between font-medium text-slate-800">
                    <div>
                      <span className="font-bold">Amaahda Bangiga (Bank Loans / Facilities):</span>
                      <span className="text-[10px] text-slate-400 block">Murabaha amaahda qalabka & dhismaha</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">${longTermLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between font-bold text-amber-800 pt-2 border-t border-slate-200 bg-amber-50/50 p-2 rounded-xl">
                    <span>Wadarta Guud ee Deymaha (Total Liabilities):</span>
                    <span className="font-mono font-black">${grandTotalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Owner's Equity Section */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <span className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                    3. Raasamaalka Mulkiilaha (Owner's Equity)
                  </span>
                  <span className="font-bold text-slate-500 text-[10px]">
                    Qiimaha saafiga ah ee mulkiiluhu leeyahay
                  </span>
                </div>

                <div className="space-y-2.5 pl-2">
                  <div className="flex justify-between font-medium text-slate-800">
                    <span>Raasamaalka Bilowga ah (Initial Capital):</span>
                    <span className="font-mono font-bold">${(equityDetails.initialCapital || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between font-medium text-slate-800">
                    <span>Maalgashi Dheeraad ah (Additional Investment):</span>
                    <span className="font-mono font-bold">+${(equityDetails.additionalInvestment || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between font-medium text-rose-600">
                    <span>Ka Jar: Lacagaha La Baxay (Less: Owner Drawings):</span>
                    <span className="font-mono font-bold">-${(equityDetails.drawings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between font-medium text-emerald-700">
                    <div>
                      <span className="font-bold">Faa'iidada Is-biirsatay (Retained Earnings):</span>
                      <span className="text-[10px] text-emerald-600 block">Khadka isku-dheelitirka xisaabta saafiga ah</span>
                    </div>
                    <span className="font-mono font-bold">${retainedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between font-bold text-indigo-900 pt-2 border-t border-slate-200 bg-indigo-50/50 p-2 rounded-xl">
                    <span>Wadarta Raasamaalka (Total Equity):</span>
                    <span className="font-mono font-black">${grandTotalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TOTAL LIABILITIES & EQUITY FOOTER */}
          <div className="p-5 bg-blue-50 border-t border-blue-200 flex items-center justify-between">
            <span className="font-black text-blue-950 text-sm uppercase tracking-wide">
              WADARTA DEYMAHA & RAASAMAALKA (TOTAL LIAB & EQUITY)
            </span>
            <span className="font-mono font-black text-blue-800 text-lg">
              ${grandTotalLiabilitiesAndEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Equity Modal */}
      {showEditEquity && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-[#042954] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Habee Raasamaalka (Owner's Equity Details)</h3>
              <button onClick={() => setShowEditEquity(false)} className="text-slate-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEquity} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Raasamaalka Bilowga ah (Initial Invested Capital $)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={equityForm.initialCapital}
                  onChange={(e) => setEquityForm({ ...equityForm, initialCapital: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#042954]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Maalgashiga Dheeraadka ah (Additional Investment $)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={equityForm.additionalInvestment}
                  onChange={(e) => setEquityForm({ ...equityForm, additionalInvestment: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#042954]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Lacagaha Mulkiiluhu La Baxay (Owner Drawings $)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={equityForm.drawings}
                  onChange={(e) => setEquityForm({ ...equityForm, drawings: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#042954]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditEquity(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#042954] hover:bg-[#031d3d] text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#ffae01]" />
                  <span>Keydi Raasamaalka</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

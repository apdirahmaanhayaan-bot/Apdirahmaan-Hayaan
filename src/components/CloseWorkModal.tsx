import React, { useState, useMemo } from 'react';
import { SaleTransaction, AppUser, ShiftClosure, CurrencySettings } from '../types';
import { 
  LogOut, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Receipt, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Printer, 
  X, 
  Clock, 
  UserCheck, 
  CreditCard, 
  Wallet 
} from 'lucide-react';
import { formatCurrencyDisplay } from '../utils/currency';

interface CloseWorkModalProps {
  isOpen: boolean;
  currentUser: AppUser | null;
  sales: SaleTransaction[];
  currencySettings?: CurrencySettings;
  onClose: () => void;
  onSaveClosure: (closure: ShiftClosure) => void;
}

export default function CloseWorkModal({
  isOpen,
  currentUser,
  sales = [],
  currencySettings,
  onClose,
  onSaveClosure
}: CloseWorkModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter sales for today (and optionally by this cashier if not admin)
  const todaysSales = useMemo(() => {
    return sales.filter((s) => {
      const isToday = s.date === todayStr;
      if (!isToday) return false;
      if (currentUser?.role === 'cashier') {
        return s.cashierId === currentUser.id || s.cashierName === currentUser.fullName || s.cashierName === currentUser.username;
      }
      return true;
    });
  }, [sales, todayStr, currentUser]);

  // Calculations
  const totalSalesExpected = useMemo(() => {
    return todaysSales.reduce((sum, s) => sum + s.total, 0);
  }, [todaysSales]);

  const totalCashExpected = useMemo(() => {
    return todaysSales
      .filter((s) => s.paymentMethod === 'cash')
      .reduce((sum, s) => sum + s.total, 0);
  }, [todaysSales]);

  const totalElectronicExpected = useMemo(() => {
    return todaysSales
      .filter((s) => ['evc', 'zaad', 'sahal', 'edahab'].includes(s.paymentMethod))
      .reduce((sum, s) => sum + s.total, 0);
  }, [todaysSales]);

  const totalCreditExpected = useMemo(() => {
    return todaysSales
      .filter((s) => s.paymentMethod === 'credit')
      .reduce((sum, s) => sum + s.total, 0);
  }, [todaysSales]);

  // Form State
  const [hasActualCash, setHasActualCash] = useState<boolean | null>(null);
  const [actualCashHanded, setActualCashHanded] = useState<number>(totalCashExpected);
  const [managerRecipient, setManagerRecipient] = useState<string>('Maamulaha Sare (General Manager)');
  const [receiptReference, setReceiptReference] = useState<string>(`SHF-${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);

  // Sync actual cash when total is known and user has not chosen Maya
  React.useEffect(() => {
    if (hasActualCash === true || hasActualCash === null) {
      setActualCashHanded(totalCashExpected);
    }
  }, [totalCashExpected, hasActualCash]);

  const difference = actualCashHanded - totalCashExpected;

  const totalSalesCurrency = formatCurrencyDisplay(totalSalesExpected, currencySettings);
  const totalCashCurrency = formatCurrencyDisplay(totalCashExpected, currencySettings);

  const handleSave = () => {
    const closure: ShiftClosure = {
      id: `CLOSURE_${Date.now()}`,
      cashierId: currentUser?.id || 'cashier_1',
      cashierName: currentUser?.fullName || currentUser?.username || 'Qasnaji',
      closingDate: todayStr,
      closingTime: new Date().toLocaleTimeString(),
      totalSalesExpected,
      totalCashExpected,
      totalElectronicExpected,
      totalCreditExpected,
      actualCashHanded,
      difference,
      hasFullCash: hasActualCash === true,
      managerRecipient,
      receiptReference,
      notes,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    onSaveClosure(closure);
    setIsCompleted(true);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#042954] text-[#ffae01] rounded-2xl shadow-xs">
              <LogOut className="w-5 h-5 text-[#ffae01]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Xiritaanka Shaqada & Xisaab-xirka (Close Work / Shift)
              </h3>
              <p className="text-xs text-slate-500">
                Qasnaji: <strong className="text-slate-800">{currentUser?.fullName || currentUser?.username}</strong> &bull; Taariikhda: {todayStr}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Indicator */}
        {!isCompleted && (
          <div className="flex items-center justify-between mb-6 px-2">
            {[
              { num: 1, label: 'Xisaabta' },
              { num: 2, label: 'U dir Manager' },
              { num: 3, label: 'Rasiidh' },
              { num: 4, label: 'Xaqiiji' }
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s.num
                      ? 'bg-[#042954] text-[#ffae01] ring-2 ring-blue-500/20'
                      : step > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className="text-xs font-bold text-slate-600 hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: Today's Sales & Cash Verification */}
        {step === 1 && !isCompleted && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Iibka Maanta (Today's Total Sales)
              </span>

              {/* Big High-Contrast Currency Display */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div className="text-3xl font-black text-slate-900 font-display">
                  {totalSalesCurrency.usd}
                </div>
                {/* Prominent Ethiopian Birr Display */}
                <div className="text-sm font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-lg">
                  Wadarta Birr: {totalSalesCurrency.etb}
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Caddaan (Cash)</span>
                  <span className="font-bold text-slate-900">${totalCashExpected.toFixed(2)}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">E-Money (Zaad/Sahal)</span>
                  <span className="font-bold text-blue-700">${totalElectronicExpected.toFixed(2)}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Dayn (Credit)</span>
                  <span className="font-bold text-rose-600">${totalCreditExpected.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Prompt Question: Ma haysaa lacagtaas? */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                    Maanta waxaad iibisay caddaan gaaraya: ${totalCashExpected.toFixed(2)} ({totalCashCurrency.etb}). Ma haysaa lacagtaas oo dhan?
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Dooro "Haa" haddii aad gacanta ku hayso, ama "Maya" haddii farqi ama yaraan jirto.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setHasActualCash(true);
                    setActualCashHanded(totalCashExpected);
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    hasActualCash === true
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Haa, Waan Hayaa (${totalCashExpected.toFixed(2)})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHasActualCash(false)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    hasActualCash === false
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-500/20'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Maya, Farqi Baa Jira</span>
                </button>
              </div>

              {/* If "Maya" is chosen, let cashier input counted cash */}
              {hasActualCash === false && (
                <div className="mt-3 p-3 bg-white rounded-xl border border-amber-300 space-y-2 animate-in fade-in">
                  <label className="block text-xs font-bold text-slate-800">
                    Geli Lacagta Dhabta ah ee aad gacanta ku hayso ($):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={actualCashHanded}
                    onChange={(e) => setActualCashHanded(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                    placeholder="Tusaale: 145.00"
                  />
                  <div className="flex items-center justify-between text-xs font-bold pt-1">
                    <span className="text-slate-500">Farqiga (Difference):</span>
                    <span
                      className={
                        difference === 0
                          ? 'text-emerald-600'
                          : difference < 0
                          ? 'text-rose-600'
                          : 'text-blue-600'
                      }
                    >
                      {difference < 0
                        ? `-$${Math.abs(difference).toFixed(2)} (Yaraan/Shortage)`
                        : `+$${difference.toFixed(2)} (Dheeraad)`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Ka noqo
              </button>
              <button
                type="button"
                disabled={hasActualCash === null}
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-[#042954] hover:bg-[#031d3d] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>U Gudub: Dir Lacagta</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Send Money to Manager */}
        {step === 2 && !isCompleted && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase">
                <Send className="w-4 h-4 text-blue-700" />
                <span>Dir Lacagta oo u wareeji Manager-ka</span>
              </div>
              <p className="text-xs text-blue-800">
                Fadlan lacagta caddaanka ah ku wareeji maamulaha supermarket-ka ama ku shub qasnadda dhexe.
              </p>

              <div className="p-3 bg-white rounded-xl border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block">Lacagta La Wareejinayo:</span>
                  <span className="text-xl font-black text-slate-900 font-display">
                    ${actualCashHanded.toFixed(2)} USD
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-amber-700 font-bold block">Qiimaha Birr-ka:</span>
                  <span className="text-xs font-bold text-amber-800">
                    {(actualCashHanded * (currencySettings?.etbRate || 130)).toLocaleString()} ETB
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Qofka ama Koontada Loo Wareejiyay (Recipient Manager) *
              </label>
              <select
                value={managerRecipient}
                onChange={(e) => setManagerRecipient(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#042954]"
              >
                <option value="Maamulaha Sare (General Manager)">Maamulaha Sare (General Manager)</option>
                <option value="Qasnadda Dhexe (Main Safe Box)">Qasnadda Dhexe (Main Safe Box)</option>
                <option value="Xisaabiyaha (Head Accountant)">Xisaabiyaha (Head Accountant)</option>
                <option value="Bank Deposit (Dahabshiil / Salaam)">Bank Deposit (Dahabshiil / Salaam)</option>
              </select>
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dib u noqo</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>U Gudub: Rasiidha Caddeynta</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Receipt & Reference Number */}
        {step === 3 && !isCompleted && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Receipt className="w-4 h-4 text-[#042954]" />
                <span>Gali Rasiidha ama Tixraaca Wareejinta</span>
              </div>
              <p className="text-xs text-slate-500">
                Geli lambarka rasiidhka ama tixraaca wareejinta lacagta ee aad siisay maamulaha.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lambarka Rasiidhka / Caddeynta (Receipt Reference) *
              </label>
              <input
                type="text"
                value={receiptReference}
                onChange={(e) => setReceiptReference(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-[#042954]"
                placeholder="RSD-109282"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Qoraal Dheeraad ah (Notes)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tusaale: Shaqadu si fiican bay ku dhammaatay, wax cabasho ah ma jirin..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#042954]"
              />
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dib u noqo</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>U Gudub: Xaqiijinta Guud</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Final Overview & Save */}
        {step === 4 && !isCompleted && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Faahfaahinta Xiritaanka Shaqada ee Hadda Keydsamaysa</span>
              </div>

              <div className="space-y-2 text-xs divide-y divide-emerald-200/60 pt-1">
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Qasnajiga:</span>
                  <span className="font-bold text-slate-900">{currentUser?.fullName || currentUser?.username}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Iibka Guud ee Maanta:</span>
                  <span className="font-bold text-slate-900">{totalSalesCurrency.usd} ({totalSalesCurrency.etb})</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Lacagta La Wareejinayo (Caddaan):</span>
                  <span className="font-black text-emerald-700">${actualCashHanded.toFixed(2)} USD</span>
                </div>
                {difference !== 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Farqiga (Difference):</span>
                    <span className="font-bold text-rose-600">
                      {difference < 0 ? `-$${Math.abs(difference).toFixed(2)}` : `+$${difference.toFixed(2)}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Loo Diray:</span>
                  <span className="font-bold text-slate-900">{managerRecipient}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Lambarka Rasiidhka:</span>
                  <span className="font-mono font-bold text-slate-900">{receiptReference}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dib u noqo</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Xaqiiji & Keydi Shaqada</span>
              </button>
            </div>
          </div>
        )}

        {/* COMPLETED VIEW: Printable Confirmation Receipt */}
        {isCompleted && (
          <div className="space-y-4 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-slate-900 font-display">
              Shaqadii Si Guul Leh Ayaa Loo Xiray!
            </h3>
            <p className="text-xs text-slate-500">
              Xisaab-xirka waxaa loo diray maamulaha waxaana lagu keydiyay Firebase Cloud.
            </p>

            {/* Printable summary box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2 font-mono">
              <div className="text-center font-bold pb-2 border-b border-dashed border-slate-300">
                RASIIDHKA XIRITAANKA SHIFT-KA
              </div>
              <div className="flex justify-between">
                <span>Rasiidh:</span> <strong>{receiptReference}</strong>
              </div>
              <div className="flex justify-between">
                <span>Qasnaji:</span> <span>{currentUser?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span>Taariikh:</span> <span>{todayStr} {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Iibka Guud:</span> <span>{totalSalesCurrency.usd}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900">
                <span>Caddaan La Dhiibay:</span> <span>${actualCashHanded.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-800 font-bold">
                <span>Birr Equivalent:</span> <span>{(actualCashHanded * (currencySettings?.etbRate || 130)).toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between">
                <span>U Wareejiyay:</span> <span>{managerRecipient}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Daabac Rasiidhka</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Dhameeyay (Close)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { SupermarketData, CurrencySettings } from '../types';
import { 
  Settings, 
  Store, 
  Phone, 
  Printer, 
  Database, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  DollarSign,
  TrendingUp,
  RefreshCw,
  Coins,
  ArrowRightLeft,
  AlertTriangle,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { DEFAULT_CURRENCY_SETTINGS } from '../supermarketData';

interface SupermarketSettingsPageProps {
  supermarketData: SupermarketData;
  currencySettings?: CurrencySettings;
  onUpdateCurrencySettings?: (settings: CurrencySettings) => void;
  onUpdateData: (data: Partial<SupermarketData>) => void;
  onResetData: () => void;
  onResetAllToZero?: () => void;
  onFactoryResetAll?: () => void;
}

export default function SupermarketSettingsPage({
  supermarketData,
  currencySettings = DEFAULT_CURRENCY_SETTINGS,
  onUpdateCurrencySettings,
  onUpdateData,
  onResetData,
  onResetAllToZero,
  onFactoryResetAll
}: SupermarketSettingsPageProps) {
  const [name, setName] = useState(supermarketData.supermarketName);
  const [receiptFooter, setReceiptFooter] = useState(supermarketData.receiptFooter || 'Mahadsanid! Fadlan dib u soo noqo mar kale.');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Currency & Exchange Rate State
  const [etbRate, setEtbRate] = useState<number>(currencySettings.etbRate || 130);
  const [primaryCurrency, setPrimaryCurrency] = useState<'USD' | 'ETB'>(currencySettings.primaryCurrency || 'USD');
  const [showDualCurrency, setShowDualCurrency] = useState<boolean>(currencySettings.showDualCurrency ?? true);
  const [currencySaved, setCurrencySaved] = useState(false);

  // Live Converter Mini Tool
  const [calcUsd, setCalcUsd] = useState<string>('10');
  const [calcEtb, setCalcEtb] = useState<string>('1300');

  // Confirmation modal for resetting all balances to $0
  const [showZeroConfirmModal, setShowZeroConfirmModal] = useState(false);
  const [zeroConfirmedSuccess, setZeroConfirmedSuccess] = useState(false);

  // Factory Reset All State
  const [showFactoryResetModal, setShowFactoryResetModal] = useState(false);
  const [factoryResetSuccess, setFactoryResetSuccess] = useState(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateData({ 
      supermarketName: name,
      receiptFooter 
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveCurrencySettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CurrencySettings = {
      primaryCurrency,
      etbRate: Number(etbRate) || 130,
      showDualCurrency,
      symbolUSD: '$',
      symbolETB: 'ETB'
    };
    if (onUpdateCurrencySettings) {
      onUpdateCurrencySettings(updated);
    }
    onUpdateData({ currencySettings: updated });
    setCurrencySaved(true);
    setTimeout(() => setCurrencySaved(false), 3000);
  };

  const handleUsdChange = (val: string) => {
    setCalcUsd(val);
    const num = parseFloat(val) || 0;
    setCalcEtb((num * etbRate).toFixed(2));
  };

  const handleEtbChange = (val: string) => {
    setCalcEtb(val);
    const num = parseFloat(val) || 0;
    setCalcUsd(etbRate > 0 ? (num / etbRate).toFixed(2) : '0.00');
  };

  const handleConfirmZeroReset = () => {
    setShowZeroConfirmModal(false);
    if (onResetAllToZero) {
      onResetAllToZero();
    }
    setZeroConfirmedSuccess(true);
    setTimeout(() => setZeroConfirmedSuccess(false), 4000);
  };

  const handleExportBackup = () => {
    const jsonStr = JSON.stringify(supermarketData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supermarket_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed && parsed.products && parsed.customers) {
          onUpdateData(parsed);
          alert('Xogtii gurmadka ahayd (Backup) si guul leh ayaa loo soo celiyay!');
        } else {
          alert('Faylkan uma eka qaabka saxda ah ee xogta Supermarket-ka.');
        }
      } catch (err) {
        alert('Khalad ayaa ku yimid aqrinta faylka.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#042954] text-[#ffae01] rounded-xl shadow-xs shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Habaynta Guud ee Supermarket-ka (System Settings)
            </h1>
            <p className="text-xs text-slate-500">
              Sarifka Birr-ta Itoobiya (ETB ⇄ USD), xogta xarunta, rasiidhada, iyo xisaabaadka.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>Waa la keydiyay!</span>
          </div>
        )}
      </div>

      {/* SECTION 1: ETHIOPIAN BIRR (ETB) TO USD EXCHANGE RATE SETTING */}
      <div className="bg-white p-5 rounded-2xl border-2 border-[#042954]/20 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 text-amber-900 rounded-lg">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>Sarifka Lacagta: Birr-ta Itoobiya & Dollar (ETB ⇄ USD Exchange Rate)</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold uppercase">
                  Active
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Dooro qiimaha 1 Dollar uu ka joogo Birr-ta Itoobiya iyo qaabka ay ugu soo muuqanayso shaashadda POS.
              </p>
            </div>
          </div>

          {currencySaved && (
            <div className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Waa la cusboonaysiiyay!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveCurrencySettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exchange Rate Input */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Qiimaha Sarifka (1 USD = X Ethiopian Birr / ETB)
              </label>

              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-700">
                  $ 1.00 USD =
                </span>
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={etbRate}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setEtbRate(val);
                      const num = parseFloat(calcUsd) || 0;
                      setCalcEtb((num * val).toFixed(2));
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-black text-sm text-slate-900 outline-none focus:border-[#042954] focus:ring-1 focus:ring-[#042954]"
                    placeholder="130"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                    ETB (Birr)
                  </span>
                </div>
              </div>

              {/* Preset Rate Pills */}
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block mb-1.5">
                  Qiimayaal Degdeg ah oo La Doorto (Quick Rates):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[115, 120, 125, 130, 135, 140, 150].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => {
                        setEtbRate(rate);
                        const num = parseFloat(calcUsd) || 0;
                        setCalcEtb((num * rate).toFixed(2));
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        etbRate === rate
                          ? 'bg-[#042954] text-[#ffae01] shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {rate} ETB
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Currency Preference & Dual Mode */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Lacagta Koowaad ee Shaashadda (Primary Currency)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPrimaryCurrency('USD')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      primaryCurrency === 'USD'
                        ? 'bg-[#042954] text-white border-[#042954] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Doolar ($ USD)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrimaryCurrency('ETB')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      primaryCurrency === 'ETB'
                        ? 'bg-[#042954] text-white border-[#042954] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Coins className="w-4 h-4 text-[#ffae01]" />
                    <span>Birr (ETB 🇪🇹)</span>
                  </button>
                </div>
              </div>

              {/* Dual Currency Display Toggle */}
              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none bg-white p-2.5 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={showDualCurrency}
                    onChange={(e) => setShowDualCurrency(e.target.checked)}
                    className="w-4 h-4 text-[#042954] rounded focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Muuji Labada Lacagood (Show Dual Currency)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Waxay shaashadda POS iyo rasiidhada ku wada muujinaysaa USD iyo ETB is barbar yaal.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Interactive Quick Converter */}
          <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-700" />
                Xisaabiyaha Tooska ah ee Sarifka (Live Quick Converter)
              </span>
              <span className="text-[10px] text-amber-800 font-mono">
                1 USD = {etbRate} ETB
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-amber-200">
                <span className="font-bold text-slate-500">$ USD:</span>
                <input
                  type="number"
                  step="any"
                  value={calcUsd}
                  onChange={(e) => handleUsdChange(e.target.value)}
                  className="w-full font-bold text-slate-900 outline-none"
                  placeholder="10"
                />
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-amber-200">
                <span className="font-bold text-slate-500">ETB (Birr):</span>
                <input
                  type="number"
                  step="any"
                  value={calcEtb}
                  onChange={(e) => handleEtbChange(e.target.value)}
                  className="w-full font-bold text-slate-900 outline-none"
                  placeholder="1300"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4 text-[#ffae01]" />
              <span>Keydi Qiimaha Sarifka (Save Exchange Rate)</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: RESET ALL FINANCES & BALANCES TO 0$ */}
      <div className="bg-rose-50/70 p-5 rounded-2xl border-2 border-rose-200 shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl mt-0.5 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-rose-950 uppercase tracking-wider">
                Dhammaan Xisaabaadka & Daymaha Ka Dhig $0.00 (Reset All to $0)
              </h2>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                Tani waxay dhammaan koontooyinka bangiyada, qasnadda caddaanka, daymaha macaamiisha, daymaha shirkadaha, iyo iibka ka dhigaysaa <strong>$0.00</strong> nadiif ah si aad nidaamka uga bilowdo xisaab cusub oo dhab ah.
              </p>
            </div>
          </div>
        </div>

        {zeroConfirmedSuccess && (
          <div className="p-3 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Dhammaan xisaabaadka, daymaha, iyo lacagaha waxaa si guul leh looga dhigay $0.00!</span>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => setShowZeroConfirmModal(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ka Dhig Dhammaan $0.00 (Nadiifi Xisaabaadka)</span>
          </button>
        </div>
      </div>

      {/* SECTION 3: General Store Details */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Store className="w-4 h-4 text-[#042954]" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Macluumaadka Xarunta & Rasiidhka POS
          </h2>
        </div>

        <form onSubmit={handleSaveGeneral} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Magaca Supermarket-ka (Supermarket Name)*
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Taleefanka Xarunta
              </label>
              <input
                type="text"
                defaultValue="+252 61 5000000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Cinwaanka / Magaalada
              </label>
              <input
                type="text"
                defaultValue="Wadada Makka Al-Mukarama, Muqdisho"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Qoraalka Hoose ee Rasiidhka (Receipt Footer Note)
            </label>
            <input
              type="text"
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4 text-[#ffae01]" />
            <span>Keydi Macluumaadka Xarunta</span>
          </button>
        </form>
      </div>

      {/* SECTION 4: Backup & Data Management */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Database className="w-4 h-4 text-[#042954]" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Gurmadka & Soo Celinta Xogta (Backup & Restore)
          </h2>
        </div>

        <p className="text-xs text-slate-500">
          Waxaad soo dejisan kartaa dhammaan xogta supermarket-ka (Badeecadaha, Iibka, Daymaha, iyo Shaqaalaha) si aad u haysato kayd nabadgaleyo ah.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={handleExportBackup}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-[#042954]" />
            <span>Soo Degso Gurmadka (Export JSON)</span>
          </button>

          <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-emerald-700" />
            <span>Soo Geli Fayl Gurmad ah (Import Backup)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (window.confirm('Ma hubtaa inaad dib u bilaabayso xogta tusaalaha ah ee Supermarket-ka?')) {
                onResetData();
              }
            }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Dib u bilaaw Xogta Tusaalaha ah</span>
          </button>
        </div>
      </div>

      {/* FACTORY RESET ALL (Nadiifi Dhammaan Xogta oo Ka Dhig Faaruq) */}
      <div className="bg-rose-50/70 p-5 rounded-2xl border-2 border-rose-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-600 text-white rounded-xl shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-rose-950 uppercase tracking-wider">
                Clear All / Factory Reset (Nadiifi Dhammaan Xogta oo Ka Dhig Faaruq)
              </h2>
              <p className="text-xs text-rose-800">
                Ficilkani wuxuu meel walba ka dhigayaa faaruq (0 items, 0 sales, 0 debts, 0 cash).
              </p>
            </div>
          </div>

          {factoryResetSuccess && (
            <div className="px-3 py-1.5 bg-rose-600 text-white text-xs font-black rounded-xl animate-bounce">
              Dhammaan Xogtii waa la nadiifiyay (Waa Faaruq)!
            </div>
          )}
        </div>

        <p className="text-xs text-rose-900/90 leading-relaxed bg-white/70 p-3 rounded-xl border border-rose-200">
          ⚠️ <strong>Digniin Adag:</strong> Hadii aad taabato badhankan, dhammaan alaabta bakhaarka, iibkii hore, xisaabaadka, macaamiisha, keenayaasha, kharashaadka, iyo fariimaha waxaa laga tirtirayaa Cloud-ka iyo aaladdaada labadaba si toos ah.
        </p>

        <div>
          <button
            type="button"
            onClick={() => setShowFactoryResetModal(true)}
            className="px-5 py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear All / Factory Reset (Ka Dhig Faaruq Dhammaan)</span>
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL FOR FACTORY RESET */}
      {showFactoryResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-300 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-md">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-black text-rose-950 font-display">
                  Ma Hubtaa Inaad Nadiifiso Dhammaan Xogta (Factory Reset)?
                </h3>
                <p className="text-xs text-rose-700 font-bold">
                  Haa ama Maya? Ficilkan lagama noqon karo!
                </p>
              </div>
            </div>

            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-950 space-y-2">
              <p className="font-black text-rose-900">Waxyaabaha si buuxda u faaruqi doona:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-800 font-medium">
                <li>Dhammaan alaabta taala bakhaarka (0 items)</li>
                <li>Dhammaan iibkii hore iyo rasiidhada (0 sales)</li>
                <li>Dhammaan daymaha macaamiisha iyo shirkadaha</li>
                <li>Dhammaan accounts-ka bangiyada & kharashaadka</li>
                <li>Dhammaan adjustments iyo shift-yada</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFactoryResetModal(false)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Maya, Ka Laabo
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFactoryResetModal(false);
                  if (onFactoryResetAll) {
                    onFactoryResetAll();
                  }
                  setFactoryResetSuccess(true);
                  setTimeout(() => setFactoryResetSuccess(false), 5000);
                }}
                className="px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Haa, Clear All (Faaruqi)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR RESET TO $0 */}
      {showZeroConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-display">
                  Ma Hubtaa inaad Dhammaan ka dhigto $0?
                </h3>
                <p className="text-xs text-slate-500">
                  Ficilkan lagama noqon karo marka la xaqiijiyo.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <p className="font-bold text-slate-900">Waxyaabaha $0 laga dhigi doono:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                <li>Dhammaan koontada qasnadda iyo bangiyada: <strong>$0.00</strong></li>
                <li>Dhammaan daymaha macaamiisha lagu leeyahay: <strong>$0.00</strong></li>
                <li>Dhammaan daymaha shirkadaha wax keena: <strong>$0.00</strong></li>
                <li>Diiwaanka iibkii hore & kharashaadka: <strong>Waa la nadiifin doonaa</strong></li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowZeroConfirmModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Maya, Jooji
              </button>
              <button
                type="button"
                onClick={handleConfirmZeroReset}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Haa, Ka Dhig $0
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

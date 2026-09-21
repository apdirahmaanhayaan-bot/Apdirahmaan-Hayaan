import React, { useState, useMemo } from 'react';
import { Product, StockAdjustment, AdjustmentType, CurrencySettings, AppUser } from '../types';
import { 
  AlertOctagon, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  PackageMinus, 
  Calendar, 
  ShieldAlert, 
  Flame, 
  FileSpreadsheet, 
  X, 
  Check, 
  Clock 
} from 'lucide-react';
import { formatCurrencyDisplay } from '../utils/currency';
import { exportToCSV, handleFileImport } from '../utils/exportImport';
import ConfirmModal from './ConfirmModal';

interface StockAdjustmentsPageProps {
  adjustments: StockAdjustment[];
  products: Product[];
  currentUser: AppUser | null;
  currencySettings?: CurrencySettings;
  onAddAdjustment: (adj: StockAdjustment) => void;
  onUpdateAdjustment: (adj: StockAdjustment) => void;
  onDeleteAdjustment: (id: string) => void;
}

export default function StockAdjustmentsPage({
  adjustments = [],
  products = [],
  currentUser,
  currencySettings,
  onAddAdjustment,
  onUpdateAdjustment,
  onDeleteAdjustment
}: StockAdjustmentsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StockAdjustment | null>(null);

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<StockAdjustment | null>(null);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('expired');
  const [qty, setQty] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');

  // When product changes, populate default unitCost
  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setUnitCost(prod.buyPrice || 0);
    }
  };

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId);
  }, [products, selectedProductId]);

  const openAddModal = () => {
    setEditingItem(null);
    const firstProd = products[0];
    setSelectedProductId(firstProd?.id || '');
    setAdjustmentType('expired');
    setQty(1);
    setUnitCost(firstProd?.buyPrice || 0);
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
    setShowAddModal(true);
  };

  const openEditModal = (adj: StockAdjustment) => {
    setEditingItem(adj);
    setSelectedProductId(adj.productId);
    setAdjustmentType(adj.type);
    setQty(adj.qty);
    setUnitCost(adj.unitPrice);
    setDate(adj.date);
    setNote(adj.note || '');
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert('Fadlan dooro alaabta aad rabto inaad xereyso!');
      return;
    }

    const prod = products.find((p) => p.id === selectedProductId);
    const prodName = prod?.name || 'Alaab aan la aqoon';
    const barcode = prod?.barcode || '';
    const numericQty = Number(qty) || 1;
    const numericCost = Number(unitCost) || 0;
    const total = numericQty * numericCost;

    if (editingItem) {
      onUpdateAdjustment({
        ...editingItem,
        productId: selectedProductId,
        productName: prodName,
        barcode,
        type: adjustmentType,
        qty: numericQty,
        unitPrice: numericCost,
        totalLoss: total,
        date,
        note
      });
    } else {
      const newAdj: StockAdjustment = {
        id: `ADJ_${Date.now()}`,
        productId: selectedProductId,
        productName: prodName,
        barcode,
        type: adjustmentType,
        qty: numericQty,
        unitPrice: numericCost,
        totalLoss: total,
        date,
        time: new Date().toLocaleTimeString(),
        recordedBy: currentUser?.fullName || currentUser?.username || 'Qasnaji',
        note
      };
      onAddAdjustment(newAdj);
    }

    setShowAddModal(false);
  };

  // Filtered List
  const filteredAdjustments = useMemo(() => {
    return adjustments.filter((a) => {
      const matchesType = typeFilter === 'all' || a.type === typeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.productName.toLowerCase().includes(q) ||
        a.barcode.includes(q) ||
        (a.note && a.note.toLowerCase().includes(q)) ||
        a.recordedBy.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [adjustments, typeFilter, searchQuery]);

  // Totals
  const totalFinancialLossUSD = useMemo(() => {
    return adjustments.reduce((sum, a) => sum + (a.totalLoss || 0), 0);
  }, [adjustments]);

  const lossCount = adjustments.filter((a) => a.type === 'loss').length;
  const brokenCount = adjustments.filter((a) => a.type === 'broken').length;
  const expiredCount = adjustments.filter((a) => a.type === 'expired').length;
  const damagedCount = adjustments.filter((a) => a.type === 'damaged').length;

  const totalCurrency = formatCurrencyDisplay(totalFinancialLossUSD, currencySettings);

  const getTypeBadge = (type: AdjustmentType) => {
    switch (type) {
      case 'expired':
        return {
          label: 'Alaab Dhacday (Expired)',
          className: 'bg-amber-100 text-amber-800 border-amber-300'
        };
      case 'broken':
        return {
          label: 'Alaab Jabtay (Broken)',
          className: 'bg-rose-100 text-rose-800 border-rose-300'
        };
      case 'loss':
        return {
          label: 'Alaab Luntay (Lost/Missing)',
          className: 'bg-purple-100 text-purple-800 border-purple-300'
        };
      case 'damaged':
        return {
          label: 'Alaab Dhaawacan (Damaged)',
          className: 'bg-orange-100 text-orange-800 border-orange-300'
        };
      case 'correction':
        return {
          label: 'Saxid Tirakoob (Correction)',
          className: 'bg-blue-100 text-blue-800 border-blue-300'
        };
      default:
        return {
          label: type,
          className: 'bg-slate-100 text-slate-800 border-slate-300'
        };
    }
  };

  // Export to Excel / CSV
  const handleExportExcel = () => {
    const headers = [
      'ID',
      'Taariikhda',
      'Alaabta',
      'Barcode',
      'Nooca Khasaaraha',
      'Tirada (Qty)',
      'Qiimaha Iibsiga ($)',
      'Wadarta Khasaaraha ($)',
      'Wadarta Khasaaraha (ETB)',
      'Qofka Diiwaangeliyay',
      'Faahfaahin'
    ];

    const rows = filteredAdjustments.map((a) => {
      const etbVal = (a.totalLoss || 0) * (currencySettings?.etbRate || 130);
      return [
        a.id,
        a.date,
        a.productName,
        a.barcode,
        a.type,
        a.qty,
        a.unitPrice,
        a.totalLoss,
        etbVal.toFixed(2),
        a.recordedBy,
        a.note || ''
      ];
    });

    exportToCSV(`Stock_Adjustments_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  // Import from Excel / CSV
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleFileImport(
      file,
      (importedData: any[]) => {
        if (!Array.isArray(importedData)) return;
        let count = 0;
        importedData.forEach((row) => {
          if (row.productName || row['Alaabta']) {
            const newAdj: StockAdjustment = {
              id: row.id || row['ID'] || `ADJ_${Date.now()}_${count}`,
              productId: row.productId || '',
              productName: row.productName || row['Alaabta'] || 'Alaab',
              barcode: row.barcode || row['Barcode'] || '',
              type: (row.type || row['Nooca Khasaaraha'] || 'expired') as AdjustmentType,
              qty: Number(row.qty || row['Tirada (Qty)']) || 1,
              unitPrice: Number(row.unitPrice || row['Qiimaha Iibsiga ($)']) || 0,
              totalLoss: Number(row.totalLoss || row['Wadarta Khasaaraha ($)']) || 0,
              date: row.date || row['Taariikhda'] || new Date().toISOString().split('T')[0],
              recordedBy: row.recordedBy || row['Qofka Diiwaangeliyay'] || 'Import',
              note: row.note || row['Faahfaahin'] || ''
            };
            onAddAdjustment(newAdj);
            count++;
          }
        });
        alert(`Si guul leh ayaa loo soo galiyay ${count} diiwaan oo khasaare/dhaawac ah!`);
        e.target.value = '';
      },
      (err) => alert(err)
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-xs">
            <AlertOctagon className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 font-display">
              Xereynta Alaabta Dhacday & Khasaaraha (Stock Adjustments)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Diiwaangeli alaabta jabtay (broken), dhacday (expired), luntay (loss), ama xumaatay (damaged) si toos ah uga go'da bakhaarka.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Excel Export */}
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Kala soo bax Excel"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Excel Export</span>
          </button>

          {/* Excel Import */}
          <label className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Excel Import</span>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Add New Adjustment */}
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#ffae01]" />
            <span>Diiwaangeli Khasaare / Alaab Dhacday</span>
          </button>
        </div>
      </div>

      {/* KPI Cards with Prominent Ethiopian Birr (ETB) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Financial Loss */}
        <div className="col-span-2 sm:col-span-1 lg:col-span-1 bg-white p-4 rounded-2xl border border-rose-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase">Wadarta Khasaaraha</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-rose-600 font-display">
              {totalCurrency.usd}
            </div>
            {/* Prominent ETB Display */}
            <div className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1">
              ~ {totalCurrency.etb}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2">Dhaawac, khasaare & dhacday</div>
        </div>

        {/* Expired Items */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase">Alaab Dhacday</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900 font-display">{expiredCount}</div>
            <div className="text-[11px] text-amber-600 font-medium">Expired Items</div>
          </div>
        </div>

        {/* Broken Items */}
        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase">Alaab Jabtay</span>
            <PackageMinus className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900 font-display">{brokenCount}</div>
            <div className="text-[11px] text-rose-600 font-medium">Broken / Shattered</div>
          </div>
        </div>

        {/* Lost / Missing */}
        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-700 uppercase">Alaab Luntay</span>
            <ShieldAlert className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900 font-display">{lossCount}</div>
            <div className="text-[11px] text-purple-600 font-medium">Missing / Baadi</div>
          </div>
        </div>

        {/* Damaged Items */}
        <div className="bg-white p-4 rounded-2xl border border-orange-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-orange-700 uppercase">Dhaawacan</span>
            <AlertOctagon className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900 font-display">{damagedCount}</div>
            <div className="text-[11px] text-orange-600 font-medium">Damaged / Leaking</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Raadi alaabta, barcode, ama qofka..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#042954]"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'Dhammaan' },
            { id: 'expired', label: 'Dhacday (Expired)' },
            { id: 'broken', label: 'Jabtay (Broken)' },
            { id: 'loss', label: 'Luntay (Loss)' },
            { id: 'damaged', label: 'Dhaawacan' },
            { id: 'correction', label: 'Saxid Tirakoob' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                typeFilter === tab.id
                  ? 'bg-[#042954] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Adjustments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#042954] text-white">
                <th className="py-3 px-4 font-bold">Taariikhda</th>
                <th className="py-3 px-4 font-bold">Alaabta & Barcode</th>
                <th className="py-3 px-4 font-bold">Nooca Khasaaraha</th>
                <th className="py-3 px-4 font-bold text-center">Tirada (Qty)</th>
                <th className="py-3 px-4 font-bold">Qiimaha Iibsiga</th>
                <th className="py-3 px-4 font-bold">Wadarta Khasaaraha</th>
                <th className="py-3 px-4 font-bold">Qofka Xereeyay</th>
                <th className="py-3 px-4 font-bold">Faahfaahin</th>
                <th className="py-3 px-4 font-bold text-right">Ficil (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertOctagon className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold">Wax diiwaan khasaare ama alaab dhacday ah lama helin.</p>
                      <button
                        onClick={openAddModal}
                        className="mt-2 px-3.5 py-1.5 bg-[#ffae01] text-slate-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                      >
                        Hadda Xeree Khasaare Cusub
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map((a) => {
                  const badge = getTypeBadge(a.type);
                  const money = formatCurrencyDisplay(a.totalLoss, currencySettings);
                  return (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{a.date}</span>
                        </div>
                        {a.time && <div className="text-[10px] text-slate-400">{a.time}</div>}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{a.productName}</div>
                        {a.barcode && (
                          <div className="text-[10px] font-mono text-slate-500">{a.barcode}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-black text-rose-600 text-sm">
                        -{a.qty}
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-700">
                        ${a.unitPrice.toFixed(2)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-black text-rose-600">{money.usd}</div>
                        <div className="text-[10px] font-bold text-amber-700">{money.etb}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {a.recordedBy}
                      </td>

                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {a.note || '-'}
                      </td>

                      {/* Action buttons with Edit and Delete */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(a)}
                            className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg cursor-pointer transition-colors"
                            title="Wax ka bedel (Edit)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setItemToDelete(a)}
                            className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-lg cursor-pointer transition-colors"
                            title="Tirtir (Delete)"
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

      {/* Add / Edit Adjustment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {editingItem ? 'Wax ka bedel Khasaaraha' : 'Xeree Alaab Dhacday ama Jabtay'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Waxaa toos looga goyn doonaa bakhaarka supermarket-ka.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dooro Alaabta (Product) *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#042954]"
                >
                  <option value="">-- Dooro Alaab --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.unit}) - Bakhaarka: {p.stockQty} - Qiimaha Iibsiga: ${p.buyPrice}
                    </option>
                  ))}
                </select>
                {selectedProduct && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Hadda bakhaarka waxay kaga jirtaa:{' '}
                    <strong className="text-slate-800">{selectedProduct.stockQty} {selectedProduct.unit}</strong>
                  </p>
                )}
              </div>

              {/* Adjustment Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nooca Khasaaraha (Type of Adjustment) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'expired', label: 'Alaab Dhacday (Expired)' },
                    { id: 'broken', label: 'Alaab Jabtay (Broken)' },
                    { id: 'loss', label: 'Alaab Luntay (Loss)' },
                    { id: 'damaged', label: 'Dhaawacan (Damaged)' },
                    { id: 'correction', label: 'Saxid Tirakoob' }
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setAdjustmentType(t.id as AdjustmentType)}
                      className={`p-2 rounded-xl text-xs font-bold border text-center transition-colors cursor-pointer ${
                        adjustmentType === t.id
                          ? 'bg-[#042954] text-white border-[#042954]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity and Unit Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tirada Khasaarowday (Qty) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-hidden focus:border-[#042954]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Qiimaha Iibsiga Halkii Xabo ($) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-hidden focus:border-[#042954]"
                  />
                </div>
              </div>

              {/* Total Loss Display in USD and ETB */}
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-rose-800">Wadarta Khasaaraha:</span>
                  <div className="text-base font-black text-rose-600">
                    ${(qty * unitCost).toFixed(2)} USD
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-amber-700">Qiimaha Birr-ka:</span>
                  <div className="text-sm font-black text-amber-800">
                    {((qty * unitCost) * (currencySettings?.etbRate || 130)).toLocaleString()} ETB
                  </div>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Taariikhda *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#042954]"
                />
              </div>

              {/* Note / Sababta */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sababta & Faahfaahinta (Notes)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tusaale: Daasadii ayaa daloosantay, taariikhdu waa ay dhaaftay, iwm..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#042954]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#ffae01]" />
                  <span>{editingItem ? 'Cusboonaysii' : 'Keydi & Ka Jar Bakhaarka'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Ma hubtaa inaad tirtirto khasaarahan?"
        message="Diiwaankan khasaaraha ah waxaa laga tirtirayaa nidaamka."
        itemName={itemToDelete ? `${itemToDelete.productName} (${itemToDelete.qty} xabo - ${itemToDelete.type})` : undefined}
        confirmText="Haa, Tirtir"
        cancelText="Maya, Ka noqo"
        onConfirm={() => {
          if (itemToDelete) {
            onDeleteAdjustment(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}

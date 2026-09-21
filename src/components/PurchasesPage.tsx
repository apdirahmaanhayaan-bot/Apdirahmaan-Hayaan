import React, { useState, useMemo } from 'react';
import { PurchaseOrder, Supplier, Product, CurrencySettings, AppUser, SchoolAccount } from '../types';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  Truck, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  X, 
  Check, 
  FileText 
} from 'lucide-react';
import { formatCurrencyDisplay } from '../utils/currency';
import { exportToCSV, handleFileImport } from '../utils/exportImport';
import ConfirmModal from './ConfirmModal';

interface PurchasesPageProps {
  purchases: PurchaseOrder[];
  suppliers: Supplier[];
  products: Product[];
  accounts?: SchoolAccount[];
  currentUser: AppUser | null;
  currencySettings?: CurrencySettings;
  onAddPurchase: (po: PurchaseOrder, items?: { productId: string; qty: number; buyPrice: number }[]) => void;
  onUpdatePurchase: (po: PurchaseOrder) => void;
  onDeletePurchase: (id: string) => void;
}

export default function PurchasesPage({
  purchases = [],
  suppliers = [],
  products = [],
  accounts = [],
  currentUser,
  currencySettings,
  onAddPurchase,
  onUpdatePurchase,
  onDeletePurchase
}: PurchasesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'received' | 'pending'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);

  // Delete modal state
  const [poToDelete, setPOToDelete] = useState<PurchaseOrder | null>(null);

  // Form State
  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'received' | 'pending'>('received');

  // Multi-item purchase lines
  const [purchaseItems, setPurchaseItems] = useState<
    { productId: string; qty: number; buyPrice: number; total: number }[]
  >([{ productId: products[0]?.id || '', qty: 10, buyPrice: products[0]?.buyPrice || 0, total: 10 * (products[0]?.buyPrice || 0) }]);

  const [paidAmount, setPaidAmount] = useState<number>(0);

  const calculateTotalAmount = () => {
    return purchaseItems.reduce((sum, item) => sum + item.total, 0);
  };

  const openAddModal = () => {
    setEditingPO(null);
    const firstSup = suppliers[0];
    setSupplierId(firstSup?.id || 'sup_general');
    setSupplierName(firstSup?.name || 'Suuqa Guud');
    setDate(new Date().toISOString().split('T')[0]);
    setReference(`INV-${Date.now().toString().slice(-6)}`);
    setNote('');
    setStatus('received');

    const firstProd = products[0];
    const initialItems = [
      {
        productId: firstProd?.id || '',
        qty: 10,
        buyPrice: firstProd?.buyPrice || 0,
        total: 10 * (firstProd?.buyPrice || 0)
      }
    ];
    setPurchaseItems(initialItems);
    setPaidAmount(10 * (firstProd?.buyPrice || 0));
    setShowAddModal(true);
  };

  const openEditModal = (po: PurchaseOrder) => {
    setEditingPO(po);
    setSupplierId(po.supplierId);
    setSupplierName(po.supplierName);
    setDate(po.date);
    setReference(po.reference || '');
    setNote(po.note || '');
    setStatus(po.status);
    setPaidAmount(po.paidAmount);
    setPurchaseItems([
      {
        productId: products[0]?.id || '',
        qty: po.itemsCount || 1,
        buyPrice: po.totalAmount / (po.itemsCount || 1),
        total: po.totalAmount
      }
    ]);
    setShowAddModal(true);
  };

  const handleAddItemLine = () => {
    const firstProd = products[0];
    setPurchaseItems((prev) => [
      ...prev,
      {
        productId: firstProd?.id || '',
        qty: 1,
        buyPrice: firstProd?.buyPrice || 0,
        total: firstProd?.buyPrice || 0
      }
    ]);
  };

  const handleRemoveItemLine = (index: number) => {
    if (purchaseItems.length === 1) return;
    setPurchaseItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    setPurchaseItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: val };
      if (field === 'productId') {
        const prod = products.find((p) => p.id === val);
        if (prod) {
          item.buyPrice = prod.buyPrice;
        }
      }
      item.total = (Number(item.qty) || 0) * (Number(item.buyPrice) || 0);
      updated[index] = item;
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = calculateTotalAmount();
    const balance = Math.max(0, total - paidAmount);

    const sup = suppliers.find((s) => s.id === supplierId);
    const finalSupName = sup?.name || supplierName || 'Iibiye Guud';

    if (editingPO) {
      onUpdatePurchase({
        ...editingPO,
        supplierId,
        supplierName: finalSupName,
        date,
        itemsCount: purchaseItems.reduce((sum, i) => sum + i.qty, 0),
        totalAmount: total,
        paidAmount,
        balance,
        status,
        reference,
        note
      });
    } else {
      const newPO: PurchaseOrder = {
        id: `PO_${Date.now()}`,
        supplierId,
        supplierName: finalSupName,
        date,
        itemsCount: purchaseItems.reduce((sum, i) => sum + i.qty, 0),
        totalAmount: total,
        paidAmount,
        balance,
        status,
        reference,
        note
      };
      onAddPurchase(newPO, purchaseItems);
    }

    setShowAddModal(false);
  };

  // Filtered List
  const filteredPurchases = useMemo(() => {
    return purchases.filter((po) => {
      const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        po.supplierName.toLowerCase().includes(q) ||
        (po.reference && po.reference.toLowerCase().includes(q)) ||
        (po.note && po.note.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [purchases, statusFilter, searchQuery]);

  // Stats
  const totalPurchasesUSD = purchases.reduce((sum, po) => sum + po.totalAmount, 0);
  const totalPaidUSD = purchases.reduce((sum, po) => sum + po.paidAmount, 0);
  const totalBalanceOwedUSD = purchases.reduce((sum, po) => sum + po.balance, 0);

  const totalPurchasesCurrency = formatCurrencyDisplay(totalPurchasesUSD, currencySettings);
  const totalBalanceCurrency = formatCurrencyDisplay(totalBalanceOwedUSD, currencySettings);

  // Export to Excel / CSV
  const handleExportExcel = () => {
    const headers = [
      'ID',
      'Taariikhda',
      'Iibiyaha (Supplier)',
      'Reference / Invoice',
      'Tirada Alaabta',
      'Wadarta Qiimaha ($)',
      'Lacagta La Bixiyay ($)',
      'Haraaga Lagu Leeyahay ($)',
      'Wadarta (ETB)',
      'Xaaladda (Status)',
      'Qoraal'
    ];

    const rows = filteredPurchases.map((po) => {
      const etbVal = po.totalAmount * (currencySettings?.etbRate || 130);
      return [
        po.id,
        po.date,
        po.supplierName,
        po.reference || '',
        po.itemsCount,
        po.totalAmount,
        po.paidAmount,
        po.balance,
        etbVal.toFixed(2),
        po.status,
        po.note || ''
      ];
    });

    exportToCSV(`Purchases_List_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  // Import from Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleFileImport(
      file,
      (importedData: any[]) => {
        if (!Array.isArray(importedData)) return;
        let count = 0;
        importedData.forEach((row) => {
          if (row.supplierName || row['Iibiyaha (Supplier)']) {
            const newPO: PurchaseOrder = {
              id: row.id || row['ID'] || `PO_${Date.now()}_${count}`,
              supplierId: row.supplierId || 'sup_general',
              supplierName: row.supplierName || row['Iibiyaha (Supplier)'] || 'Iibiye Guud',
              date: row.date || row['Taariikhda'] || new Date().toISOString().split('T')[0],
              reference: row.reference || row['Reference / Invoice'] || '',
              itemsCount: Number(row.itemsCount || row['Tirada Alaabta']) || 1,
              totalAmount: Number(row.totalAmount || row['Wadarta Qiimaha ($)']) || 0,
              paidAmount: Number(row.paidAmount || row['Lacagta La Bixiyay ($)']) || 0,
              balance: Number(row.balance || row['Haraaga Lagu Leeyahay ($)']) || 0,
              status: (row.status || row['Xaaladda (Status)'] || 'received') as 'received' | 'pending',
              note: row.note || row['Qoraal'] || ''
            };
            onAddPurchase(newPO);
            count++;
          }
        });
        alert(`Si guul leh ayaa loo soo galiyay ${count} diiwaan oo alaab soo iibsi ah!`);
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
          <div className="p-3 bg-[#042954] text-[#ffae01] rounded-2xl shadow-xs">
            <ShoppingBag className="w-6 h-6 text-[#ffae01]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 font-display">
              Diiwaanka Alaab Soo Iibsiga (Purchases & Stock In)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Diiwaangeli alaabta aad soo iibsatay, lacagta la bixiyay, xisaabta iibiyeyaasha, iyo kordhinta bakhaarka.
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
              onChange={handleImportExcel}
              className="hidden"
            />
          </label>

          {/* Add Purchase Button */}
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#ffae01]" />
            <span>Diiwaangeli Alaab Cusub oo La Gatay</span>
          </button>
        </div>
      </div>

      {/* KPI Cards with Prominent Ethiopian Birr (ETB) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Purchases */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Wadarta Alaabta La Soo Gatay
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-display">
              {totalPurchasesCurrency.usd}
            </div>
            {/* Prominent ETB Display */}
            <div className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md inline-block mt-1.5">
              ~ {totalPurchasesCurrency.etb}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">{purchases.length} Diiwaan Iibsi</div>
        </div>

        {/* Total Paid */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Lacagta La Bixiyay (Paid)
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 font-display">
              ${totalPaidUSD.toLocaleString()} USD
            </div>
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-block mt-1.5">
              ~ {(totalPaidUSD * (currencySettings?.etbRate || 130)).toLocaleString()} ETB
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Toos looga bixiyay qasnadda</div>
        </div>

        {/* Balance Owed to Suppliers */}
        <div className="bg-white p-5 rounded-3xl border border-rose-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Daynta Lagu Leeyahay (Balance Owed)
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 font-display">
              {totalBalanceCurrency.usd}
            </div>
            <div className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md inline-block mt-1.5">
              ~ {totalBalanceCurrency.etb}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Daymaha iibiyeyaasha suuqa</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Raadi iibiye, invoice, ama qoraal..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#042954]"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'received', 'pending'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === s
                  ? 'bg-[#042954] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'all' ? 'Dhammaan' : s === 'received' ? 'La Helay (Received)' : 'Sugaya (Pending)'}
            </button>
          ))}
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#042954] text-white">
                <th className="py-3 px-4 font-bold">Taariikhda</th>
                <th className="py-3 px-4 font-bold">Iibiyaha (Supplier)</th>
                <th className="py-3 px-4 font-bold">Invoice / Rasiidh</th>
                <th className="py-3 px-4 font-bold text-center">Tirada Xabbo</th>
                <th className="py-3 px-4 font-bold">Wadarta Qiimaha</th>
                <th className="py-3 px-4 font-bold">La Bixiyay</th>
                <th className="py-3 px-4 font-bold">Haraaga (Dayn)</th>
                <th className="py-3 px-4 font-bold">Xaaladda</th>
                <th className="py-3 px-4 font-bold text-right">Ficil (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingBag className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold">Wax diiwaan alaab soo iibsi ah lama helin.</p>
                      <button
                        onClick={openAddModal}
                        className="mt-2 px-4 py-2 bg-[#ffae01] text-slate-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                      >
                        Diiwaangeli Iibsi Hadda
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((po) => {
                  const moneyTotal = formatCurrencyDisplay(po.totalAmount, currencySettings);
                  const isFullyPaid = po.balance <= 0;
                  return (
                    <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{po.date}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-[#042954]" />
                          <span>{po.supplierName}</span>
                        </div>
                        {po.note && <div className="text-[10px] text-slate-400 truncate max-w-xs">{po.note}</div>}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {po.reference || '-'}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {po.itemsCount}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-black text-slate-900">{moneyTotal.usd}</div>
                        <div className="text-[10px] font-bold text-amber-700">{moneyTotal.etb}</div>
                      </td>

                      <td className="py-3 px-4 font-bold text-emerald-600">
                        ${po.paidAmount.toFixed(2)}
                      </td>

                      <td className="py-3 px-4">
                        {po.balance > 0 ? (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold rounded-md text-[11px]">
                            ${po.balance.toFixed(2)} Dayn
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">$0.00</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isFullyPaid
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isFullyPaid ? 'Dhamaystiran' : 'Qabyo / Dayn'}
                        </span>
                      </td>

                      {/* Action buttons: Edit and Delete */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(po)}
                            className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg cursor-pointer transition-colors"
                            title="Wax ka bedel (Edit)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPOToDelete(po)}
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

      {/* Add / Edit Purchase Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#042954]/10 text-[#042954] rounded-xl">
                  <ShoppingBag className="w-5 h-5 text-[#042954]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {editingPO ? 'Wax ka bedel Iibsiga' : 'Diiwaangeli Alaab Cusub oo La Soo Gatay'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Waxaa toos loogu dari doonaa tirada bakhaarka supermarket-ka.
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
              {/* Supplier and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Iibiyaha (Supplier / Shirkadda) *
                  </label>
                  <select
                    value={supplierId}
                    onChange={(e) => {
                      setSupplierId(e.target.value);
                      const s = suppliers.find((x) => x.id === e.target.value);
                      if (s) setSupplierName(s.name);
                    }}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#042954]"
                  >
                    <option value="">-- Dooro Iibiye --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.company}) - Balance Owed: ${s.balanceOwed}
                      </option>
                    ))}
                    <option value="sup_other">+ Iibiye Kale / Suuqa Guud</option>
                  </select>
                </div>

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
              </div>

              {/* Reference / Invoice number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Invoice / Receipt No (Rasiidh)
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="INV-9901"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-hidden focus:border-[#042954]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Xaaladda Keenista (Status)
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#042954]"
                  >
                    <option value="received">Alaabtu Way Timid (Received in Stock)</option>
                    <option value="pending">Waa Soo Socotaa (Pending Delivery)</option>
                  </select>
                </div>
              </div>

              {/* Items Line Items */}
              <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Alaabta La Soo Gatay</span>
                  <button
                    type="button"
                    onClick={handleAddItemLine}
                    className="px-2.5 py-1 bg-[#042954] text-white text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-[#ffae01]" />
                    <span>Ku dar Alaab Kale</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {purchaseItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200"
                    >
                      <div className="col-span-5">
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.qty}
                          onChange={(e) => handleItemChange(idx, 'qty', Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center font-bold text-slate-900"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          value={item.buyPrice}
                          onChange={(e) => handleItemChange(idx, 'buyPrice', Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center font-bold text-slate-900"
                        />
                      </div>

                      <div className="col-span-2 text-right font-black text-slate-900 text-xs">
                        ${item.total.toFixed(2)}
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemLine(idx)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded-md cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total and Payment Calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-50 border border-blue-200 rounded-2xl">
                <div>
                  <div className="text-xs font-bold text-slate-700">Wadarta Iibsiga (Total):</div>
                  <div className="text-xl font-black text-slate-900">
                    ${calculateTotalAmount().toFixed(2)} USD
                  </div>
                  <div className="text-xs font-bold text-amber-700">
                    ~ {(calculateTotalAmount() * (currencySettings?.etbRate || 130)).toLocaleString()} ETB
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lacagta Hadda La Bixiyay ($):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={calculateTotalAmount()}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-emerald-700"
                  />
                  <div className="text-[11px] font-bold text-rose-700 mt-1">
                    Haraaga (Dayn ahaan u haray): ${Math.max(0, calculateTotalAmount() - paidAmount).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Qoraal / Faahfaahin
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Xog dheeraad ah oo ku saabsan iibsigan..."
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
                  <span>{editingPO ? 'Cusboonaysii Iibsiga' : 'Keydi & Kordhi Bakhaarka'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!poToDelete}
        title="Ma hubtaa inaad tirtirto iibsigan?"
        message="Diiwaankan alaab soo iibsiga ah waxaa laga saari doonaa nidaamka."
        itemName={poToDelete ? `${poToDelete.supplierName} (${poToDelete.reference || 'PO'} - $${poToDelete.totalAmount})` : undefined}
        confirmText="Haa, Tirtir"
        cancelText="Maya, Ka noqo"
        onConfirm={() => {
          if (poToDelete) {
            onDeletePurchase(poToDelete.id);
            setPOToDelete(null);
          }
        }}
        onCancel={() => setPOToDelete(null)}
      />
    </div>
  );
}

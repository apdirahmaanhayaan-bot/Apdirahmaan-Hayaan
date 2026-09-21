import React, { useState } from 'react';
import { Supplier, PurchaseOrder, Product } from '../types';
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Package, 
  CheckCircle2, 
  X, 
  Check 
} from 'lucide-react';

interface SuppliersPageProps {
  suppliers: Supplier[];
  purchases: PurchaseOrder[];
  products: Product[];
  onAddSupplier: (supplier: Supplier) => void;
  onRecordPurchase: (purchase: PurchaseOrder) => void;
}

export default function SuppliersPage({
  suppliers,
  purchases,
  products,
  onAddSupplier,
  onRecordPurchase
}: SuppliersPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // New Supplier Form
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    balanceOwed: 0,
    contactPerson: ''
  });

  // Purchase Order Form
  const [purchaseForm, setPurchaseForm] = useState({
    supplierId: suppliers[0]?.id || '',
    totalAmount: 100,
    paidAmount: 100,
    itemsCount: 5,
    note: 'Alaab cusub oo bakhaarka soo gashay'
  });

  const filteredSuppliers = suppliers.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    return !q || s.name.toLowerCase().includes(q) || s.company.toLowerCase().includes(q) || s.phone.includes(q);
  });

  const totalOwedToSuppliers = suppliers.reduce((sum, s) => sum + s.balanceOwed, 0);

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name || !supplierForm.phone) {
      alert('Fadlan geli magaca iyo taleefanka shirkadda!');
      return;
    }

    const newSup: Supplier = {
      id: `sup_${Date.now()}`,
      name: supplierForm.name,
      company: supplierForm.company || supplierForm.name,
      phone: supplierForm.phone,
      email: supplierForm.email,
      address: supplierForm.address,
      balanceOwed: Number(supplierForm.balanceOwed) || 0,
      contactPerson: supplierForm.contactPerson
    };

    onAddSupplier(newSup);
    setShowAddSupplierModal(false);
    setSupplierForm({ name: '', company: '', phone: '', email: '', address: '', balanceOwed: 0, contactPerson: '' });
  };

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === purchaseForm.supplierId);
    if (!sup) return;

    const total = Number(purchaseForm.totalAmount) || 0;
    const paid = Number(purchaseForm.paidAmount) || 0;
    const balance = Math.max(0, total - paid);

    const po: PurchaseOrder = {
      id: `po_${Date.now()}`,
      supplierId: sup.id,
      supplierName: sup.name,
      date: new Date().toISOString().split('T')[0],
      itemsCount: Number(purchaseForm.itemsCount) || 1,
      totalAmount: total,
      paidAmount: paid,
      balance,
      status: 'received',
      note: purchaseForm.note
    };

    onRecordPurchase(po);
    setShowPurchaseModal(false);
    setPurchaseForm({
      supplierId: suppliers[0]?.id || '',
      totalAmount: 100,
      paidAmount: 100,
      itemsCount: 5,
      note: 'Alaab cusub oo bakhaarka soo gashay'
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#042954] text-[#ffae01] rounded-xl shadow-xs">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Iibiyeyaasha & Keenista Alaabta (Suppliers & Purchases)
            </h1>
            <p className="text-xs text-slate-500">
              Shirkadaha alaabta keena, dalabyada bakhaarka, iyo xisaabaadka alaab-qeybiyeyaasha.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>Qor Alaab Cusub oo Soo Gashay</span>
          </button>

          <button
            onClick={() => setShowAddSupplierModal(true)}
            className="px-3.5 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 text-[#ffae01]" />
            <span>Ku dar Iibiye</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Shirkadaha Diiwaangashan
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {suppliers.length} <span className="text-xs font-medium text-slate-400">shirkadood</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Daymaha Lagu Leeyahay Supermarket-ka
          </span>
          <div className="text-2xl font-black text-red-600 mt-1">
            ${totalOwedToSuppliers.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Lacagta shirkadaha alaabta u dhiman
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Dalabyada Alaabta (Purchases)
          </span>
          <div className="text-2xl font-black text-[#042954] mt-1">
            {purchases.length} <span className="text-xs font-medium text-slate-400">mar</span>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Raadi shirkad, taleefan..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#042954]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Shirkadda & Magaca</th>
                <th className="py-3 px-4">Qofka Xiriirka</th>
                <th className="py-3 px-4">Taleefanka</th>
                <th className="py-3 px-4">Goobta</th>
                <th className="py-3 px-4 text-right">Haraaga Daynta (Owed)</th>
                <th className="py-3 px-4 text-center">Xaaladda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{s.name}</div>
                    <div className="text-[10px] text-slate-400">{s.company}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {s.contactPerson || 'Maamulka Sales-ka'}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{s.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {s.address || 'Muqdisho'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {s.balanceOwed > 0 ? (
                      <span className="text-sm font-black text-red-600">
                        ${s.balanceOwed.toFixed(2)}
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-700">$0.00 (Dhameystiran)</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {s.balanceOwed > 0 ? (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                        Lacag ku dhiman
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md">
                        Xisaab Nadiif ah
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Supplier Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 bg-[#042954] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#ffae01]" />
                <h3 className="text-sm font-bold font-display">Ku Dar Shirkad / Iibiye Cusub</h3>
              </div>
              <button
                onClick={() => setShowAddSupplierModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Magaca Shirkadda (Company Name)*
                </label>
                <input
                  type="text"
                  required
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="tusaale: Al-Baraka Wholesale"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Qofka Masuulka ah (Contact Person)
                </label>
                <input
                  type="text"
                  value={supplierForm.contactPerson}
                  onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                  placeholder="Magaca wakiilka"
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
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  placeholder="+25290..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none focus:border-[#042954]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Goobta / Cinwaanka (Address)
                </label>
                <input
                  type="text"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  placeholder="Dekadda, Muqdisho"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Lacag Hore Loogu Lahaa Supermarket-ka ($)
                </label>
                <input
                  type="number"
                  value={supplierForm.balanceOwed}
                  onChange={(e) => setSupplierForm({ ...supplierForm, balanceOwed: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#042954]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#042954] hover:bg-[#031d3d] text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#ffae01]" />
                  <span>Keydi Iibiyaha</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-200" />
                <h3 className="text-sm font-bold font-display">Diiwaangeli Keenis Alaab (Purchase)</h3>
              </div>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePurchase} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Shirkadda Alaabta Keentay*
                </label>
                <select
                  value={purchaseForm.supplierId}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-emerald-700 cursor-pointer"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.company})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Qiimaha Guud ee Alaabta ($)*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={purchaseForm.totalAmount}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, totalAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black outline-none focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Lacagta Hadda La Bixiyay ($)*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={purchaseForm.paidAmount}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, paidAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Tirada Guud ee Noocyada/Kartoonada
                </label>
                <input
                  type="number"
                  value={purchaseForm.itemsCount}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, itemsCount: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Faahfaahin / Xusuusin
                </label>
                <input
                  type="text"
                  value={purchaseForm.note}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, note: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-emerald-700"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Diiwaangeli Soo-galitaanka</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

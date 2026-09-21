import React, { useState, useMemo } from 'react';
import {
  Building,
  Plus,
  Trash2,
  Edit3,
  Search,
  Check,
  X,
  TrendingDown,
  Calculator,
  ShieldCheck,
  Wrench,
  Truck,
  Monitor,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { FixedAsset } from '../../types';

interface FixedAssetsViewProps {
  fixedAssets: FixedAsset[];
  onAddAsset: (asset: FixedAsset) => void;
  onUpdateAsset: (asset: FixedAsset) => void;
  onDeleteAsset: (id: string) => void;
}

export default function FixedAssetsView({
  fixedAssets = [],
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset
}: FixedAssetsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<FixedAsset | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<FixedAsset>>({
    name: '',
    category: 'equipment',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseCost: 0,
    depreciationRate: 10,
    accumulatedDepreciation: 0,
    serialOrTag: '',
    location: '',
    status: 'active',
    notes: ''
  });

  // Calculate Metrics
  const grossValue = useMemo(() => {
    return fixedAssets.reduce((sum, a) => sum + (Number(a.purchaseCost) || 0), 0);
  }, [fixedAssets]);

  const totalDepreciation = useMemo(() => {
    return fixedAssets.reduce((sum, a) => sum + (Number(a.accumulatedDepreciation) || 0), 0);
  }, [fixedAssets]);

  const netBookValue = useMemo(() => {
    return Math.max(0, grossValue - totalDepreciation);
  }, [grossValue, totalDepreciation]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return fixedAssets.filter(asset => {
      if (categoryFilter !== 'all' && asset.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && asset.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = asset.name.toLowerCase().includes(q);
        const matchTag = (asset.serialOrTag || '').toLowerCase().includes(q);
        const matchLoc = (asset.location || '').toLowerCase().includes(q);
        if (!matchName && !matchTag && !matchLoc) return false;
      }
      return true;
    });
  }, [fixedAssets, categoryFilter, statusFilter, searchQuery]);

  const openAddModal = () => {
    setEditingAsset(null);
    setFormData({
      name: '',
      category: 'equipment',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseCost: 0,
      depreciationRate: 10,
      accumulatedDepreciation: 0,
      serialOrTag: '',
      location: '',
      status: 'active',
      notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (asset: FixedAsset) => {
    setEditingAsset(asset);
    setFormData({ ...asset });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert("Fadlan geli magaca hantida!");
      return;
    }

    const cost = Number(formData.purchaseCost) || 0;
    const depr = Number(formData.accumulatedDepreciation) || 0;
    const rate = Number(formData.depreciationRate) || 0;
    const currentVal = Math.max(0, cost - depr);

    if (editingAsset) {
      const updated: FixedAsset = {
        ...editingAsset,
        name: formData.name.trim(),
        category: formData.category || 'equipment',
        purchaseDate: formData.purchaseDate || editingAsset.purchaseDate,
        purchaseCost: cost,
        depreciationRate: rate,
        accumulatedDepreciation: depr,
        currentValue: currentVal,
        serialOrTag: formData.serialOrTag?.trim(),
        location: formData.location?.trim(),
        status: formData.status || 'active',
        notes: formData.notes?.trim()
      };
      onUpdateAsset(updated);
    } else {
      const newAsset: FixedAsset = {
        id: `asset_${Date.now()}`,
        name: formData.name.trim(),
        category: formData.category || 'equipment',
        purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
        purchaseCost: cost,
        depreciationRate: rate,
        accumulatedDepreciation: depr,
        currentValue: currentVal,
        serialOrTag: formData.serialOrTag?.trim(),
        location: formData.location?.trim(),
        status: formData.status || 'active',
        notes: formData.notes?.trim()
      };
      onAddAsset(newAsset);
    }

    setShowModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Ma hubtaa inaad tirtirto hantidan: "${name}"?`)) {
      onDeleteAsset(id);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'equipment':
        return { label: 'Qalab & Mashiinno', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'furniture':
        return { label: 'Khaanado & Qalabyo', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'vehicle':
        return { label: 'Gaadiid & Mootooyin', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'electronics':
        return { label: 'POS & Kumbuyuutarro', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'building':
        return { label: 'Dhismaha & Xarunta', color: 'bg-slate-100 text-slate-800 border-slate-300' };
      default:
        return { label: 'Hanti Kale', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Action */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-800 rounded-lg">
              <Building className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Diiwaanka Hantida Ma-Guurtada ah (Fixed Assets Register)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Qalabka waawayn, qaboojiyeyaasha, khaanadaha, mootooyinka, iyo qalabka kombuyuutarka ee ganacsigu leeyahay.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#ffae01]" />
          <span>Ku dar Hanti Ma-Guurto ah</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Wadarta Qiimaha Iibsiga (Gross Cost)
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            ${grossValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Isku-gaynta kharashka iibsiga asalka ah
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Qiimo-Dhaca Is-biirsaday (Depreciation)
          </span>
          <div className="text-2xl font-black text-rose-600 mt-1 font-mono">
            -${totalDepreciation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-rose-500 mt-0.5 block font-medium">
            Wadarta lumista qiimaha ee waqtiga la isticmaalay
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Qiimaha Buugga ee Hadda (Net Book Value)
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
            ${netBookValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-600 mt-0.5 block font-bold">
            Qiimaha rasmiga ah ee Balance Sheet-ka gala
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Tirada Qalabka Hantida ah
          </span>
          <div className="text-2xl font-black text-[#042954] mt-1 font-mono">
            {fixedAssets.length} <span className="text-xs font-normal text-slate-500">qalab</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Dhammaan qaybaha kala duwan
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Raadi hanti, tag serial, meel..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#042954]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Dhammaan Qaybaha Hantida</option>
            <option value="equipment">Qalab & Mashiinno</option>
            <option value="furniture">Khaanado & Qalabyo</option>
            <option value="vehicle">Gaadiid & Mootooyin</option>
            <option value="electronics">POS & Kumbuyuutarro</option>
            <option value="building">Dhismaha & Xarunta</option>
            <option value="other">Hanti Kale</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Dhammaan Xaaladaha</option>
            <option value="active">Active (Waa Shaqaynaysaa)</option>
            <option value="in_repair">In Repair (Cilad-bixin)</option>
            <option value="retired">Retired / Sold (La joojiyey/Iibiyey)</option>
          </select>

          {(categoryFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <span>Nadiifi</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Fixed Assets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Hantida & Nooca</th>
                <th className="py-3 px-4">Qaybta</th>
                <th className="py-3 px-4">Taariikhda Iibsiga</th>
                <th className="py-3 px-4 text-right">Qiimaha Iibsiga</th>
                <th className="py-3 px-4 text-center">Qiimo-dhaca %</th>
                <th className="py-3 px-4 text-right">Qiimo-dhaca Guud</th>
                <th className="py-3 px-4 text-right">Qiimaha Buugga Hadda</th>
                <th className="py-3 px-4 text-center">Xaaladda</th>
                <th className="py-3 px-4 text-right">Ficil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Wax hanti ma-guurto ah kuma jiraan diiwaanka.
                  </td>
                </tr>
              ) : (
                filteredAssets.map(asset => {
                  const badge = getCategoryBadge(asset.category);
                  const currentVal = Math.max(0, (Number(asset.purchaseCost) || 0) - (Number(asset.accumulatedDepreciation) || 0));

                  return (
                    <tr key={asset.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 leading-tight">
                          {asset.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                          {asset.serialOrTag && <span>Tag: {asset.serialOrTag}</span>}
                          {asset.serialOrTag && asset.location && <span>•</span>}
                          {asset.location && <span>Goobta: {asset.location}</span>}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {asset.purchaseDate || 'N/A'}
                      </td>

                      <td className="py-3 px-4 text-right font-medium text-slate-800 font-mono">
                        ${(Number(asset.purchaseCost) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-slate-600">
                        {asset.depreciationRate || 0}%
                      </td>

                      <td className="py-3 px-4 text-right font-medium text-rose-600 font-mono">
                        -${(Number(asset.accumulatedDepreciation) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4 text-right font-black text-emerald-700 font-mono">
                        ${currentVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {asset.status === 'active' ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-lg border border-emerald-200">
                            Active
                          </span>
                        ) : asset.status === 'in_repair' ? (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-black rounded-lg border border-amber-200">
                            Cilad-bixin
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg border border-slate-200">
                            Retired
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(asset)}
                            className="p-1.5 text-slate-500 hover:text-[#042954] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Wax ka beddel"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(asset.id, asset.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Tirtir"
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

      {/* Add / Edit Fixed Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-100 overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#042954] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#ffae01]" />
                <h3 className="font-bold text-sm">
                  {editingAsset ? 'Wax ka beddel Hantida Ma-Guurtada ah' : 'Ku dar Hanti Cusub oo Ma-Guurto ah'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Magaca Hantida / Qalabka*
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="tusaale: Qaboojiye Wayn oo Talyaani ah, POS Set..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Qaybta (Category)*
                  </label>
                  <select
                    value={formData.category || 'equipment'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#042954] cursor-pointer"
                  >
                    <option value="equipment">Qalab & Mashiinno (Equipment)</option>
                    <option value="furniture">Khaanado & Biraha (Shelving & Furniture)</option>
                    <option value="vehicle">Gaadiid & Mooto (Vehicles)</option>
                    <option value="electronics">POS & Kumbuyuutarro (Electronics)</option>
                    <option value="building">Dhismaha & Hoolalka (Building)</option>
                    <option value="other">Hanti Kale (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Taariikhda La Iibsaday
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate || ''}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Qiimaha Iibsiga ($ Cost)*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.purchaseCost ?? ''}
                    onChange={(e) => setFormData({ ...formData, purchaseCost: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#042954]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Boqolleyda Qiimo-Dhaca Sannadlaha (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.depreciationRate ?? 10}
                    onChange={(e) => setFormData({ ...formData, depreciationRate: parseFloat(e.target.value) || 0 })}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#042954]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Qiimo-Dhaca Is-biirsaday ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.accumulatedDepreciation ?? ''}
                    onChange={(e) => setFormData({ ...formData, accumulatedDepreciation: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#042954]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Xaaladda Hantida (Status)
                  </label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#042954] cursor-pointer"
                  >
                    <option value="active">Active (Waa Shaqaynaysaa)</option>
                    <option value="in_repair">In Repair (Dayactir)</option>
                    <option value="retired">Retired / Sold (Joogsatay)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Serial No. / Tag Code
                  </label>
                  <input
                    type="text"
                    value={formData.serialOrTag || ''}
                    onChange={(e) => setFormData({ ...formData, serialOrTag: e.target.value })}
                    placeholder="tusaale: FRZ-001, POS-2025"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Goobta / Qaybta (Location)
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="tusaale: Hoolka 1-aad, Qasnadda..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
                  />
                </div>
              </div>

              {/* Calculated Live Book Value Preview */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block">Qiimaha Saafiga ah ee Buugga (Net Book Value):</span>
                  <span className="text-[10px] text-slate-400">Qiimaha Iibsiga - Qiimo-Dhaca</span>
                </div>
                <div className="text-base font-black text-emerald-700 font-mono">
                  ${Math.max(0, (Number(formData.purchaseCost) || 0) - (Number(formData.accumulatedDepreciation) || 0)).toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Faahfaahin Dheeraad ah (Notes)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Xog ku saabsan qalabka, dammaanadda (warranty), iwm..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#ffae01]" />
                  <span>{editingAsset ? 'Keydi Waxka-beddelka' : 'Keydi Hantida'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

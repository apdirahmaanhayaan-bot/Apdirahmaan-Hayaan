import React, { useState, useMemo } from 'react';
import { Product, Category, Supplier, CurrencySettings } from '../types';
import { 
  Package, 
  Search, 
  Plus, 
  Barcode, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Filter, 
  ArrowUpDown, 
  Calendar, 
  TrendingUp, 
  X, 
  Check, 
  RefreshCw,
  Image as ImageIcon,
  Upload,
  Download
} from 'lucide-react';
import { formatCurrencyDisplay } from '../utils/currency';
import { exportToCSV, handleFileImport } from '../utils/exportImport';
import ConfirmModal from './ConfirmModal';

interface ProductsPageProps {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  currencySettings?: CurrencySettings;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onDeleteAllProducts?: () => void;
  onDeleteMultipleProducts?: (ids: string[]) => void;
}

export default function ProductsPage({
  products,
  categories,
  suppliers,
  currencySettings,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onDeleteAllProducts,
  onDeleteMultipleProducts
}: ProductsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'out'>('all');

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    barcode: '',
    name: '',
    category: categories[0]?.name || 'Raashin & Cunto',
    buyPrice: 0,
    sellPrice: 0,
    stockQty: 0,
    minStockLevel: 5,
    unit: 'Xabo',
    expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
    supplier: suppliers[0]?.name || '',
    description: '',
    img: ''
  });

  // Handle local image file upload (converts to base64 data URI)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Fadlan sawir ka yar 2MB soo dooro!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData((prev) => ({ ...prev, img: result }));
    };
    reader.readAsDataURL(file);
  };

  // Filtered List
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        p.name.toLowerCase().includes(q) || 
        p.barcode.includes(q) || 
        p.category.toLowerCase().includes(q);

      let matchesStatus = true;
      if (statusFilter === 'low') {
        matchesStatus = p.stockQty > 0 && p.stockQty <= (p.minStockLevel || 5);
      } else if (statusFilter === 'out') {
        matchesStatus = p.stockQty <= 0;
      }

      return matchesCat && matchesSearch && matchesStatus;
    });
  }, [products, categoryFilter, searchQuery, statusFilter]);

  // Inventory stats
  const totalStockCount = products.reduce((sum, p) => sum + p.stockQty, 0);
  const totalAssetValue = products.reduce((sum, p) => sum + (p.buyPrice * p.stockQty), 0);
  const totalAssetCurrency = formatCurrencyDisplay(totalAssetValue, currencySettings);
  const lowStockCount = products.filter(p => p.stockQty > 0 && p.stockQty <= (p.minStockLevel || 5)).length;
  const outOfStockCount = products.filter(p => p.stockQty <= 0).length;

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      barcode: `${Math.floor(1000000 + Math.random() * 9000000)}`,
      name: '',
      category: categories[0]?.name || 'Raashin & Cunto',
      buyPrice: 0,
      sellPrice: 0,
      stockQty: 10,
      minStockLevel: 5,
      unit: 'Xabo',
      expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      supplier: suppliers[0]?.name || 'Suuqa Guud',
      description: '',
      img: ''
    });
    setShowAddModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.barcode) {
      alert('Fadlan geli magaca alaabta iyo barcode-ka!');
      return;
    }

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...formData
      } as Product);
    } else {
      const newProd: Product = {
        id: `prod_${Date.now()}`,
        barcode: formData.barcode || `${Date.now()}`,
        name: formData.name || '',
        category: formData.category || 'Raashin & Cunto',
        buyPrice: Number(formData.buyPrice) || 0,
        sellPrice: Number(formData.sellPrice) || 0,
        stockQty: Number(formData.stockQty) || 0,
        minStockLevel: Number(formData.minStockLevel) || 5,
        unit: formData.unit || 'Xabo',
        expiryDate: formData.expiryDate || new Date().toISOString().split('T')[0],
        supplier: formData.supplier || 'Suuqa Guud',
        description: formData.description || '',
        img: formData.img || ''
      };
      onAddProduct(newProd);
    }

    setShowAddModal(false);
  };

  // Export to Excel / CSV
  const handleExportExcel = () => {
    const headers = [
      'ID',
      'Barcode',
      'Magaca Alaabta',
      'Qaybta (Category)',
      'Qiimaha Iibsiga ($)',
      'Qiimaha Iibka ($)',
      'Qiimaha Iibka (ETB)',
      'Tirada Bakhaarka (Stock)',
      'Cutubka (Unit)',
      'Dhicitaanka (Expiry)',
      'Iibiyaha (Supplier)'
    ];

    const rows = filteredProducts.map((p) => {
      const etbVal = p.sellPrice * (currencySettings?.etbRate || 130);
      return [
        p.id,
        p.barcode,
        p.name,
        p.category,
        p.buyPrice,
        p.sellPrice,
        etbVal.toFixed(2),
        p.stockQty,
        p.unit,
        p.expiryDate,
        p.supplier || ''
      ];
    });

    exportToCSV(`Products_Inventory_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  // Import from Excel / CSV
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleFileImport(
      file,
      (importedData: any[]) => {
        if (!Array.isArray(importedData)) return;
        let count = 0;
        importedData.forEach((row) => {
          if (row.name || row['Magaca Alaabta']) {
            const newProd: Product = {
              id: row.id || `prod_${Date.now()}_${count}`,
              barcode: row.barcode || row['Barcode'] || `${Date.now()}_${count}`,
              name: row.name || row['Magaca Alaabta'] || 'Alaab',
              category: row.category || row['Qaybta (Category)'] || 'Raashin & Cunto',
              buyPrice: Number(row.buyPrice || row['Qiimaha Iibsiga ($)']) || 0,
              sellPrice: Number(row.sellPrice || row['Qiimaha Iibka ($)']) || 0,
              stockQty: Number(row.stockQty || row['Tirada Bakhaarka (Stock)']) || 10,
              minStockLevel: Number(row.minStockLevel) || 5,
              unit: row.unit || row['Cutubka (Unit)'] || 'Xabo',
              expiryDate: row.expiryDate || row['Dhicitaanka (Expiry)'] || new Date().toISOString().split('T')[0],
              supplier: row.supplier || row['Iibiyaha (Supplier)'] || 'Suuqa Guud',
              description: row.description || '',
              img: row.img || ''
            };
            onAddProduct(newProd);
            count++;
          }
        });
        alert(`Si guul leh ayaa loo soo galiyay ${count} nooc oo alaab ah!`);
        e.target.value = '';
      },
      (err) => alert(err)
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const confirmDeleteAll = () => {
    if (onDeleteAllProducts) {
      onDeleteAllProducts();
    } else {
      products.forEach(p => onDeleteProduct(p.id));
    }
    setSelectedIds([]);
    setShowDeleteAllModal(false);
  };

  const confirmDeleteSelected = () => {
    if (onDeleteMultipleProducts) {
      onDeleteMultipleProducts(selectedIds);
    } else {
      selectedIds.forEach(id => onDeleteProduct(id));
    }
    setSelectedIds([]);
    setShowDeleteSelectedModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#042954] text-[#ffae01] rounded-xl shadow-xs">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Bakhaarka & Maamulka Alaabta (Inventory & Products)
            </h1>
            <p className="text-xs text-slate-500">
              Diiwaanka alaabta, qiimaha iibka & iibsiga, sawirada, tirada bakhaarka, iyo digniinaha.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Excel Export */}
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Kala soo bax Excel"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Excel Export</span>
          </button>

          {/* Excel Import */}
          <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Excel Import</span>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleImportExcel}
              className="hidden"
            />
          </label>

          {products.length > 0 && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Tirtir dhammaan alaabta bakhaarka taala"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Tirtir Dhammaan ({products.length})</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-[#ffae01]" />
            <span>Ku dar Alaab Cusub</span>
          </button>
        </div>
      </div>

      {/* Selected Items Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs font-bold text-amber-900">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-black">
              {selectedIds.length}
            </span>
            <span>Alaab ayaa la doortay (Selected Products)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 cursor-pointer"
            >
              Ka noqo
            </button>
            <button
              onClick={() => setShowDeleteSelectedModal(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Tirtir Alaabta La Doortay ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Wadarta Noocyada Alaabta
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {products.length} <span className="text-xs font-medium text-slate-400">nooc</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Isku-gaynta xabbadaha: {totalStockCount.toLocaleString()}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Qiimaha Hantida Bakhaarka
          </span>
          <div className="text-2xl font-black text-[#042954] mt-1">
            ${totalAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
            Qiimaha iibsiga (Cost Value)
          </span>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}
          className={`p-4 rounded-2xl border shadow-xs cursor-pointer transition-all ${
            statusFilter === 'low' ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-slate-900 border-slate-200 hover:border-amber-400'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase tracking-wider block ${statusFilter === 'low' ? 'text-amber-100' : 'text-slate-400'}`}>
            Alaabta sii dhamaanaysa
          </span>
          <div className="text-2xl font-black mt-1 flex items-center gap-2">
            <span>{lowStockCount}</span>
            {lowStockCount > 0 && <AlertTriangle className="w-5 h-5 text-amber-500" />}
          </div>
          <span className={`text-[10px] mt-0.5 block ${statusFilter === 'low' ? 'text-amber-100' : 'text-amber-600 font-bold'}`}>
            Taabo si aad u aragto
          </span>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'out' ? 'all' : 'out')}
          className={`p-4 rounded-2xl border shadow-xs cursor-pointer transition-all ${
            statusFilter === 'out' ? 'bg-red-600 text-white border-red-700' : 'bg-white text-slate-900 border-slate-200 hover:border-red-400'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase tracking-wider block ${statusFilter === 'out' ? 'text-red-100' : 'text-slate-400'}`}>
            Alaabta ka go'day bakhaarka
          </span>
          <div className="text-2xl font-black mt-1">
            {outOfStockCount} <span className="text-xs font-medium opacity-80">alaab</span>
          </div>
          <span className={`text-[10px] mt-0.5 block ${statusFilter === 'out' ? 'text-red-100' : 'text-red-600 font-bold'}`}>
            Stock Out Alert
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
            placeholder="Raadi magaca alaabta, barcode..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#042954]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Dhammaan Qaybaha</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Status Reset Filter */}
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <span>Nadiifi Shaandhada</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-[#042954] focus:ring-0 cursor-pointer"
                    title="Dooro Dhammaan"
                  />
                </th>
                <th className="py-3 px-4">Barcode & Alaabta</th>
                <th className="py-3 px-4">Qaybta (Category)</th>
                <th className="py-3 px-4 text-right">Qiimaha Iibsiga</th>
                <th className="py-3 px-4 text-right">Qiimaha Iibka</th>
                <th className="py-3 px-4 text-right">Faa'iido</th>
                <th className="py-3 px-4 text-center">Tirada Bakhaarka</th>
                <th className="py-3 px-4">Dhicitaanka (Expiry)</th>
                <th className="py-3 px-4 text-right">Ficil (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Alaab laguma helin xogta hadda la raadiyay.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const profit = p.sellPrice - p.buyPrice;
                  const profitMargin = p.buyPrice > 0 ? ((profit / p.buyPrice) * 100).toFixed(0) : 0;
                  const isLow = p.stockQty > 0 && p.stockQty <= p.minStockLevel;
                  const isOut = p.stockQty <= 0;
                  const isSelected = selectedIds.includes(p.id);

                  return (
                    <tr key={p.id} className={`transition-colors ${isSelected ? 'bg-amber-50/60' : 'hover:bg-slate-50/70'}`}>
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectProduct(p.id)}
                          className="w-4 h-4 rounded border-slate-300 text-[#042954] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {p.img ? (
                            <img
                              src={p.img}
                              alt={p.name}
                              className="w-9 h-9 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">
                              {p.name}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                              <Barcode className="w-3.5 h-3.5 text-slate-400" />
                              <span>{p.barcode}</span>
                              <span className="text-slate-300">•</span>
                              <span>{p.supplier}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg whitespace-nowrap">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-medium text-slate-600">
                        <div>${p.buyPrice.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {(p.buyPrice * (currencySettings?.etbRate || 130)).toFixed(0)} ETB
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        <div>${p.sellPrice.toFixed(2)}</div>
                        <div className="text-[11px] font-black text-amber-700">
                          {(p.sellPrice * (currencySettings?.etbRate || 130)).toLocaleString()} ETB
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="text-emerald-700 font-bold block">
                          +${profit.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          ({profitMargin}%)
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isOut ? (
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded-lg inline-block">
                            Waa Dhamaatay
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-lg inline-block animate-pulse">
                            {p.stockQty} {p.unit} (Digniin)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-lg inline-block">
                            {p.stockQty} {p.unit}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {p.expiryDate || 'N/A'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-slate-500 hover:text-[#042954] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Wax ka beddel"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Tirtir"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#042954] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#ffae01]" />
                <h3 className="text-sm font-bold font-display">
                  {editingProduct ? 'Wax Ka Beddel Alaabta' : 'Ku Dar Alaab Cusub Bakhaarka'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">
                    Magaca Alaabta (Product Name)*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="tusaale: Bariis Basmati 25kg"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Barcode / SKU*
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      required
                      value={formData.barcode || ''}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      placeholder="6001001"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none focus:border-[#042954]"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, barcode: `${Math.floor(1000000 + Math.random() * 9000000)}` })}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 cursor-pointer"
                      title="Samee Barcode Cusub"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Qaybta (Category)*
                  </label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954] cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Qiimaha Iibsiga / Buy Price ($)*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.buyPrice ?? ''}
                    onChange={(e) => setFormData({ ...formData, buyPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#042954]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Qiimaha Iibka / Sell Price ($)*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellPrice ?? ''}
                    onChange={(e) => setFormData({ ...formData, sellPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#042954]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tirada Hadda Yaalla (Stock Qty)*
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stockQty ?? ''}
                    onChange={(e) => setFormData({ ...formData, stockQty: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#042954]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Cutubka (Unit)*
                  </label>
                  <select
                    value={formData.unit || 'Xabo'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954] cursor-pointer"
                  >
                    <option value="Xabo">Xabo (Piece)</option>
                    <option value="Kartoon">Kartoon (Carton)</option>
                    <option value="Kg">Kg (Kilogram)</option>
                    <option value="Litir">Litir (Litre)</option>
                    <option value="Baakidh">Baakidh (Packet)</option>
                    <option value="Dhalo">Dhalo (Bottle)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Digniinta Yaraaniska (Min Alert)
                  </label>
                  <input
                    type="number"
                    value={formData.minStockLevel ?? 5}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#042954]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Taariikhda Dhicitaanka (Expiry)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate || ''}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">
                    Iibiyaha Keenay (Supplier)
                  </label>
                  <select
                    value={formData.supplier || ''}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954] cursor-pointer"
                  >
                    <option value="Suuqa Guud">Suuqa Guud (Local Wholesale)</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.company})</option>
                    ))}
                  </select>
                </div>

                {/* Product Image Upload & URL */}
                <div className="sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <label className="block text-slate-700 font-bold">
                    Sawirka Alaabta (Product Image)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* Preview */}
                    <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                      {formData.img ? (
                        <img
                          src={formData.img}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                      )}
                    </div>

                    {/* Inputs */}
                    <div className="flex-1 w-full space-y-1.5">
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-[11px] text-slate-700 cursor-pointer flex items-center gap-1.5 shadow-2xs">
                          <Upload className="w-3.5 h-3.5 text-[#042954]" />
                          <span>Dooro Sawir (File)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>

                        {formData.img && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, img: '' })}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-[11px] font-bold cursor-pointer"
                          >
                            Tirtir Sawirka
                          </button>
                        )}
                      </div>

                      <input
                        type="url"
                        value={formData.img || ''}
                        onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                        placeholder="Ama geli sawirka link-giisa (Image URL)..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] font-medium outline-none focus:border-[#042954]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#ffae01]" />
                  <span>{editingProduct ? 'Keydi Waxka-beddelka' : 'Keydi Alaabta'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete All Products Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-rose-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-rose-50">
                <Trash2 className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-2 font-display">
                Tirtiridda Dhammaan Alaabta Bakhaarka?
              </h3>

              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Ma hubtaa in aad tirtirto dhammaan <strong className="text-rose-600 font-black">{products.length}</strong> nooc ee alaabta taala bakhaarka?
              </p>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-left mb-5 space-y-1.5 text-xs">
                <div className="flex justify-between font-medium text-slate-700">
                  <span>Wadarta Noocyada:</span>
                  <span className="font-bold text-slate-900">{products.length} nooc</span>
                </div>
                <div className="flex justify-between font-medium text-slate-700">
                  <span>Wadarta Xabbadaha:</span>
                  <span className="font-bold text-slate-900">{totalStockCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-700">
                  <span>Wadarta Qiimaha Bakhaarka:</span>
                  <span className="font-black text-rose-700">${totalAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="text-[11px] text-rose-600 font-bold pt-1 border-t border-rose-200/60">
                  ⚠️ Tallaabadan dib looma noqon karo marka la tirtiro!
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteAllModal(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Maya, Ka Laabo
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteAll}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Haa, Tirtir Dhammaan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Selected Products Confirmation Modal */}
      {showDeleteSelectedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-rose-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-rose-50">
                <Trash2 className="w-7 h-7" />
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-2 font-display">
                Tirtir Alaabta La Doortay?
              </h3>

              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Ma hubtaa in aad tirtirto <strong className="text-rose-600 font-black">{selectedIds.length}</strong> nooc ee alaabta aad calaamadsatay?
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteSelectedModal(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Maya, Ka Laabo
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteSelected}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Haa, Tirtir ({selectedIds.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Product Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!productToDelete}
        title="Ma hubtaa inaad tirtirto alaabtan?"
        message={`Alaabta "${productToDelete?.name}" (Barcode: ${productToDelete?.barcode}) waxaa si rasmi ah looga saarayaa bakhaarka.`}
        confirmText="Haa, Tirtir Alaabta"
        cancelText="Maya, Ka noqo"
        onConfirm={() => {
          if (productToDelete) {
            onDeleteProduct(productToDelete.id);
            setSelectedIds(prev => prev.filter(id => id !== productToDelete.id));
            setProductToDelete(null);
          }
        }}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { Category, Product } from '../types';
import { Layers, Plus, Search, Tag, Check, X, Package } from 'lucide-react';

interface CategoriesPageProps {
  categories: Category[];
  products: Product[];
  onAddCategory: (category: Category) => void;
}

export default function CategoriesPage({
  categories,
  products,
  onAddCategory
}: CategoriesPageProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name: newCatName,
      description: newCatDesc,
      color: 'bg-[#042954]'
    };

    onAddCategory(newCat);
    setShowAddModal(false);
    setNewCatName('');
    setNewCatDesc('');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#042954] text-[#ffae01] rounded-xl shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Qaybaha Alaabta Supermarket-ka (Categories & Aisles)
            </h1>
            <p className="text-xs text-slate-500">
              Kala saarista badeecadaha bakhaarka iyo shaashadda POS.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#ffae01]" />
          <span>Ku dar Qayb Cusub</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map(cat => {
          const productCount = products.filter(p => p.category === cat.name).length;
          const totalStock = products
            .filter(p => p.category === cat.name)
            .reduce((sum, p) => sum + p.stockQty, 0);

          return (
            <div
              key={cat.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-[#042954] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="p-2 bg-[#042954]/5 text-[#042954] rounded-xl">
                    <Tag className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md">
                    {productCount} nooc
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {cat.description || 'Alaabta qaybtan ka tirsan'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Tirada xabbadaha:</span>
                <span className="font-bold text-[#042954]">{totalStock.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 bg-[#042954] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#ffae01]" />
                <h3 className="text-sm font-bold font-display">Ku Dar Qayb Cusub</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Magaca Qaybta (Category Name)*
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="tusaale: Hilibka & Kaluunka"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Faahfaahin Kooban (Description)
                </label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Noocyada alaabta ku jirta..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#042954] hover:bg-[#031d3d] text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#ffae01]" />
                  <span>Keydi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

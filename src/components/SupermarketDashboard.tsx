import React from 'react';
import { 
  Product, 
  SaleTransaction, 
  Customer, 
  Supplier, 
  Expense, 
  Employee,
  CurrencySettings
} from '../types';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CreditCard, 
  DollarSign, 
  ArrowRight, 
  Receipt, 
  Truck, 
  Layers, 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Store,
  Coins,
  ArrowRightLeft
} from 'lucide-react';

interface SupermarketDashboardProps {
  products: Product[];
  sales: SaleTransaction[];
  customers: Customer[];
  suppliers: Supplier[];
  expenses: Expense[];
  employees: Employee[];
  supermarketName?: string;
  currencySettings?: CurrencySettings;
  onNavigate: (tab: string) => void;
}

export default function SupermarketDashboard({
  products,
  sales,
  customers,
  suppliers,
  expenses,
  employees,
  supermarketName = 'Xaaji Salaad Supermarket',
  currencySettings,
  onNavigate
}: SupermarketDashboardProps) {
  // Today's Date
  const todayStr = new Date().toISOString().split('T')[0];

  const etbRate = currencySettings?.etbRate || 130;
  const showDualCurrency = currencySettings?.showDualCurrency ?? true;

  // Computations
  const todaySales = sales.filter(s => s.date === todayStr);
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalCustomerDebt = customers.reduce((sum, c) => sum + c.totalDebt, 0);
  const totalSupplierDebt = suppliers.reduce((sum, s) => sum + s.balanceOwed, 0);
  const lowStockProducts = products.filter(p => p.stockQty <= p.minAlertQty);
  const totalStockItems = products.reduce((sum, p) => sum + p.stockQty, 0);

  return (
    <div className="space-y-5">
      {/* Welcome Banner with Quick POS Action */}
      <div className="bg-linear-to-r from-[#042954] via-[#063973] to-[#042954] p-5 sm:p-6 rounded-3xl text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 bg-[#ffae01]/20 text-[#ffae01] text-[10px] font-bold rounded-full uppercase tracking-wider border border-[#ffae01]/30">
              Nidaamka Maamulka & POS
            </span>
            <span className="text-xs text-slate-300 font-mono">{todayStr}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-display text-white">
            Kusoo Dhawoow {supermarketName}
          </h1>
          <p className="text-xs text-slate-200 mt-1 max-w-xl leading-relaxed">
            Halkan waxaad si toos ah uga maamuli kartaa iibka POS, badeecadaha bakhaarka, daymaha macaamiisha, keenista shirkadaha, iyo xisaabaadka lacagta.
          </p>
        </div>

        {/* Primary Action Button: Open POS */}
        <div className="relative z-10 shrink-0">
          <button
            onClick={() => onNavigate('pos')}
            className="w-full sm:w-auto px-5 py-3.5 bg-[#ffae01] hover:bg-[#e09900] text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5 text-slate-950" />
            <span>Fur Shaashadda POS (Bilow Iib)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Today's Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Iibka Maanta
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ${todayRevenue.toFixed(2)}
          </div>
          {showDualCurrency && (
            <div className="text-[11px] font-bold text-amber-700">
              ≈ {(todayRevenue * etbRate).toLocaleString()} ETB
            </div>
          )}
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
            <Receipt className="w-3 h-3 text-slate-400" />
            <span>{todaySales.length} iib maanta</span>
          </div>
        </div>

        {/* Customer Receivables (Daymaha Macaamiisha) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Daymaha Macaamiisha
            </span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            ${totalCustomerDebt.toFixed(2)}
          </div>
          {showDualCurrency && (
            <div className="text-[11px] font-bold text-amber-700">
              ≈ {(totalCustomerDebt * etbRate).toLocaleString()} ETB
            </div>
          )}
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
            <Users className="w-3 h-3 text-slate-400" />
            <span>{customers.filter(c => c.totalDebt > 0).length} macmiil deyn leh</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Alaab Gabaabsi ah
            </span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600 mt-2">
            {lowStockProducts.length} <span className="text-xs font-normal text-slate-400">nooc</span>
          </div>
          <div className="mt-1 text-[11px] text-red-600 font-bold">
            {lowStockProducts.length > 0 ? 'Fadlan dalbo alaab' : 'Bakhaarku waa buuxaa'}
          </div>
        </div>

        {/* Total Inventory SKUs */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Hantida Bakhaarka
            </span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#042954] mt-2">
            {products.length} <span className="text-xs font-normal text-slate-400">nooc</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {totalStockItems.toLocaleString()} xabbo oo diiwaangashan
          </div>
        </div>
      </div>

      {/* Quick Access Modules Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <button
          onClick={() => onNavigate('pos')}
          className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left transition-all cursor-pointer shadow-2xs group"
        >
          <div className="p-2 bg-[#042954]/5 text-[#042954] group-hover:bg-[#042954] group-hover:text-white rounded-xl w-fit transition-colors mb-2">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div className="font-bold text-xs text-slate-900">POS Iibka</div>
          <div className="text-[10px] text-slate-400">Qasnadda & Barcode</div>
        </button>

        <button
          onClick={() => onNavigate('products')}
          className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left transition-all cursor-pointer shadow-2xs group"
        >
          <div className="p-2 bg-[#042954]/5 text-[#042954] group-hover:bg-[#042954] group-hover:text-white rounded-xl w-fit transition-colors mb-2">
            <Package className="w-4 h-4" />
          </div>
          <div className="font-bold text-xs text-slate-900">Alaabta</div>
          <div className="text-[10px] text-slate-400">Bakhaarka & Qiimaha</div>
        </button>

        <button
          onClick={() => onNavigate('customers')}
          className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left transition-all cursor-pointer shadow-2xs group"
        >
          <div className="p-2 bg-[#042954]/5 text-[#042954] group-hover:bg-[#042954] group-hover:text-white rounded-xl w-fit transition-colors mb-2">
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="font-bold text-xs text-slate-900">Macaamiisha</div>
          <div className="text-[10px] text-slate-400">Deymaha & Bixinta</div>
        </button>

        <button
          onClick={() => onNavigate('suppliers')}
          className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left transition-all cursor-pointer shadow-2xs group"
        >
          <div className="p-2 bg-[#042954]/5 text-[#042954] group-hover:bg-[#042954] group-hover:text-white rounded-xl w-fit transition-colors mb-2">
            <Truck className="w-4 h-4" />
          </div>
          <div className="font-bold text-xs text-slate-900">Iibiyeyaasha</div>
          <div className="text-[10px] text-slate-400">Keenista Alaabta</div>
        </button>

        <button
          onClick={() => onNavigate('employees')}
          className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left transition-all cursor-pointer shadow-2xs group"
        >
          <div className="p-2 bg-[#042954]/5 text-[#042954] group-hover:bg-[#042954] group-hover:text-white rounded-xl w-fit transition-colors mb-2">
            <Users className="w-4 h-4" />
          </div>
          <div className="font-bold text-xs text-slate-900">Shaqaalaha</div>
          <div className="text-[10px] text-slate-400">Qasnajiyada & Shifts</div>
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left transition-all cursor-pointer shadow-2xs group"
        >
          <div className="p-2 bg-[#042954]/5 text-[#042954] group-hover:bg-[#042954] group-hover:text-white rounded-xl w-fit transition-colors mb-2">
            <FileText className="w-4 h-4" />
          </div>
          <div className="font-bold text-xs text-slate-900">Warbixinta</div>
          <div className="text-[10px] text-slate-400">Faa'iidada & Iibka</div>
        </button>
      </div>

      {/* Two Column Layout: Recent Sales & Low Stock Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Recent Sales Receipts */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#042954]" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Iibyadii Ugu Dambeeyay ee POS-ka (Recent Sales)
              </h3>
            </div>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs font-bold text-[#042954] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Eeg dhammaan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {sales.slice(0, 5).map(sale => (
              <div key={sale.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#042954]">{sale.receiptNo}</span>
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded uppercase">
                      {sale.paymentMethod}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {sale.customerName} • {sale.items.length} nooc ({sale.items.reduce((s, i) => s + i.qty, 0)} xabbo)
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-black text-sm text-slate-900">${sale.total.toFixed(2)}</div>
                  <span className="text-[10px] text-slate-400">{sale.time || sale.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Low Stock Alert Box */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Digniinta Bakhaarka (Low Stock)
              </h3>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-bold text-[#042954] hover:underline cursor-pointer"
            >
              Kala saar
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="p-6 text-center text-slate-400 space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Alaabtu waa buuxdaa!</p>
              <p className="text-[10px]">Ma jirto wax gabaabsi ah hadda.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.slice(0, 5).map(prod => (
                <div key={prod.id} className="p-2.5 bg-red-50/70 border border-red-100 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{prod.name}</h4>
                    <p className="text-[10px] text-slate-500">{prod.category} • {prod.supplierName}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[10px] rounded-md">
                      {prod.stockQty} {prod.unit}
                    </span>
                    <p className="text-[9px] text-red-600 mt-0.5">Xadka: {prod.minAlertQty}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigate('suppliers')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>La Xiriir Shirkadaha Keenista</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

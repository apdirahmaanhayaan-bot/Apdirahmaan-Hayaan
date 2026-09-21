import React, { useState, useMemo } from 'react';
import { SaleTransaction, Product, Expense, Customer } from '../types';
import { 
  FileSpreadsheet, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Calendar, 
  ShoppingBag, 
  Award, 
  Download, 
  CheckCircle2 
} from 'lucide-react';

interface ReportsPageProps {
  sales: SaleTransaction[];
  products: Product[];
  expenses: Expense[];
  customers: Customer[];
  supermarketName?: string;
}

export default function ReportsPage({
  sales,
  products,
  expenses,
  customers,
  supermarketName = 'Xaaji Salaad Supermarket'
}: ReportsPageProps) {
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Filter sales based on dateRange
  const filteredSales = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    if (dateRange === 'today') {
      return sales.filter(s => s.date === today);
    }
    if (dateRange === 'week') {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().split('T')[0];
      return sales.filter(s => s.date >= oneWeekAgo);
    }
    if (dateRange === 'month') {
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0];
      return sales.filter(s => s.date >= oneMonthAgo);
    }
    return sales;
  }, [sales, dateRange]);

  // Financial Metrics
  const grossSalesRevenue = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.total, 0);
  }, [filteredSales]);

  // Cost of Goods Sold (COGS)
  const costOfGoodsSold = useMemo(() => {
    return filteredSales.reduce((sum, s) => {
      return sum + s.items.reduce((itemSum, item) => itemSum + (item.buyPrice * item.qty), 0);
    }, 0);
  }, [filteredSales]);

  const grossProfit = grossSalesRevenue - costOfGoodsSold;
  const totalOperatingExpenses = expenses.reduce((sum, e) => sum + e.amt, 0);
  const netProfit = grossProfit - totalOperatingExpenses;

  // Inventory value
  const totalStockValue = products.reduce((sum, p) => sum + (p.buyPrice * p.stockQty), 0);
  const totalRetailValue = products.reduce((sum, p) => sum + (p.sellPrice * p.stockQty), 0);
  const totalCustomerReceivables = customers.reduce((sum, c) => sum + c.totalDebt, 0);

  // Top Selling Products
  const topProducts = useMemo(() => {
    const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};

    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = { name: item.name, qty: 0, revenue: 0 };
        }
        productSalesMap[item.productId].qty += item.qty;
        productSalesMap[item.productId].revenue += item.totalPrice;
      });
    });

    return Object.values(productSalesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [sales]);

  // Payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSales.forEach(s => {
      map[s.paymentMethod] = (map[s.paymentMethod] || 0) + s.total;
    });
    return map;
  }, [filteredSales]);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#042954] text-[#ffae01] rounded-xl shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Warbixinnada Maaliyadda & Iibka (Financial & Sales Reports)
            </h1>
            <p className="text-xs text-slate-500">
              Faallada dakhliga, kharashaadka, faa'iidada saafiga ah, iyo alaabta ugu iibka badan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setDateRange('all')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                dateRange === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Dhammaan
            </button>
            <button
              onClick={() => setDateRange('today')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                dateRange === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Maanta
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                dateRange === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Toddobaadkan
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                dateRange === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Bishan
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4 text-[#ffae01]" />
            <span>Daabac Warbixinta</span>
          </button>
        </div>
      </div>

      {/* Printable Header (Only visible on print) */}
      <div className="hidden print:block text-center border-b pb-4 mb-4 font-mono">
        <h2 className="text-xl font-black uppercase">{supermarketName}</h2>
        <p className="text-xs text-slate-500">Warbixinta Maaliyadda & Iibka Guud</p>
        <p className="text-[10px] text-slate-400">Taariikhda: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Profit & Loss Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Gross Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Iibka Guud (Gross Sales)
            </span>
            <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ${grossSalesRevenue.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {filteredSales.length} iib oo rasiidh leh
          </span>
        </div>

        {/* Cost of Goods Sold */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Qiimaha Iibsiga (COGS)
            </span>
            <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">
            ${costOfGoodsSold.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Kharashka alaabta la iibiyay
          </span>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Kharashaadka Kale (Expenses)
            </span>
            <div className="p-1.5 bg-red-50 text-red-700 rounded-lg">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600 mt-2">
            ${totalOperatingExpenses.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Kiro, Koronto, Mushahar, Gaadiid
          </span>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs bg-linear-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Faa'iidada Saafiga ah (Net Profit)
            </span>
            <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black mt-2 ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            ${netProfit.toFixed(2)}
          </div>
          <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
            {netProfit >= 0 ? 'Faa\'iido nadiif ah' : 'Khasaaro jira'}
          </span>
        </div>
      </div>

      {/* Two Column Grid: Top Selling Products & Payment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Top 5 Products */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#ffae01]" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Alaabta Ugu Iibka Badan (Top Selling Products)
              </h3>
            </div>
          </div>

          <div className="space-y-2.5">
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Weli iib ma dhicin.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div key={idx} className="p-3 bg-slate-50/80 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#042954] text-white flex items-center justify-center font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                      <p className="text-[10px] text-slate-400">Tirada la iibiyay: {p.qty} xabbo</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#042954]">
                    ${p.revenue.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Hababka Lacag-Bixinta (Payment Distribution)
            </h3>
          </div>

          <div className="space-y-2">
            {Object.entries(paymentBreakdown).map(([method, amtVal]) => {
              const amt = Number(amtVal) || 0;
              const pct = grossSalesRevenue > 0 ? ((amt / grossSalesRevenue) * 100).toFixed(1) : '0';
              return (
                <div key={method} className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-800 uppercase">{method}</span>
                    <span className="font-black text-slate-900">${amt.toFixed(2)} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#042954] h-1.5 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Hantida Alaabta Bakhaarka:</span>
              <span className="font-bold text-slate-800">${totalStockValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Daymaha Macaamiisha Lagu Leeyahay:</span>
              <span className="font-bold text-red-600">${totalCustomerReceivables.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  Layers,
  Search,
  CheckCircle2,
  FolderTree,
  Building2,
  CreditCard,
  PieChart,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface AccountCode {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  subCategory: string;
  description: string;
}

const DEFAULT_CHART_OF_ACCOUNTS: AccountCode[] = [
  // 1000 - ASSETS
  { code: '1010', name: 'Qasnadda Kaashka ah (Cash on Hand)', type: 'Asset', subCategory: 'Current Asset', description: 'Lacagta caddaanka ah ee khaanadda iyo qasnadda taala' },
  { code: '1020', name: 'Hormuud EVC Plus Account', type: 'Asset', subCategory: 'Current Asset', description: 'Lacagta mobile money ee EVC Plus' },
  { code: '1030', name: 'Telesom Zaad Service', type: 'Asset', subCategory: 'Current Asset', description: 'Xisaabta Zaad Service' },
  { code: '1040', name: 'Salaam African Bank Account', type: 'Asset', subCategory: 'Current Asset', description: 'Koontada ganacsiga ee Salaam Bank' },
  { code: '1050', name: 'Dahabshiil / e-Dahab Account', type: 'Asset', subCategory: 'Current Asset', description: 'Koontada bangiga Dahabshiil' },
  { code: '1100', name: 'Daymaha Macaamiisha (Accounts Receivable)', type: 'Asset', subCategory: 'Current Asset', description: 'Lacagaha deynta ah ee macaamiisha lagu leeyahay' },
  { code: '1200', name: 'Alaabta Bakhaarka (Merchandise Inventory)', type: 'Asset', subCategory: 'Current Asset', description: 'Qiimaha iibsiga ee dhammaan alaabta taala supermarket-ka' },
  { code: '1510', name: 'Qalabka & Mashiinnada (Equipment)', type: 'Asset', subCategory: 'Fixed Asset', description: 'Qaboojiyeyaasha, matoorrada, mashiinnada' },
  { code: '1520', name: 'Khaanadaha & Biraha (Shelving & Fixtures)', type: 'Asset', subCategory: 'Fixed Asset', description: 'Khaanadaha alaabtu saaran tahay' },
  { code: '1530', name: 'Gaadiidka & Mootooyinka (Vehicles)', type: 'Asset', subCategory: 'Fixed Asset', description: 'Mootooyinka dhoofinta iyo baabuurta' },
  { code: '1540', name: 'POS & Kumbuyuutarrada (Electronics)', type: 'Asset', subCategory: 'Fixed Asset', description: 'Kumbuyuutarrada, barcode scanners, printers' },
  { code: '1590', name: 'Qiimo-Dhaca Is-biirsaday (Accumulated Depreciation)', type: 'Asset', subCategory: 'Contra Asset', description: 'Khasaarihii ka dhashay duugowga qalabka' },

  // 2000 - LIABILITIES
  { code: '2010', name: 'Daynta Alaab-qeybiyeyaasha (Accounts Payable)', type: 'Liability', subCategory: 'Current Liability', description: 'Lacagaha lagu leeyahay shirkadaha alaabta keena' },
  { code: '2020', name: 'Mushaharka Shaqaalaha ee La Sugayo (Salaries Payable)', type: 'Liability', subCategory: 'Current Liability', description: 'Mushaaraadka shaqaalaha aan weli la bixin' },
  { code: '2030', name: 'Kirada Dhismaha ee La Sugayo (Rent Payable)', type: 'Liability', subCategory: 'Current Liability', description: 'Kirada supermarket-ka ee bisha dhiman' },
  { code: '2100', name: 'Amaahda Dhow (Short-Term Loan)', type: 'Liability', subCategory: 'Current Liability', description: 'Amaahda la bixinayo wax ka yar 1 sano' },
  { code: '2500', name: 'Amaahda Fog ee Bangiga (Long-Term Bank Loan)', type: 'Liability', subCategory: 'Long-Term Liability', description: 'Amaahda ganacsiga ee Salaam Bank / bangiyo kale' },

  // 3000 - EQUITY
  { code: '3010', name: 'Raasamaalka Bilowga ah (Owner Capital)', type: 'Equity', subCategory: 'Equity', description: 'Lacagtii asalka ahayd ee supermarket-ka lagu furay' },
  { code: '3020', name: 'Maalgashi Dheeraad ah (Additional Investment)', type: 'Equity', subCategory: 'Equity', description: 'Raasamaalka dambe ee ganacsiga lagu daray' },
  { code: '3030', name: 'Lacagaha Mulkiiluhu La Baxay (Owner Drawings)', type: 'Equity', subCategory: 'Contra Equity', description: 'Lacagta gaarka ah ee mulkiiluhu kala baxay ganacsiga' },
  { code: '3100', name: 'Faa\'iidada Is-biirsatay (Retained Earnings)', type: 'Equity', subCategory: 'Equity', description: 'Wadarta faa\'iidada ganacsiga ee dib loogu celiyey' },

  // 4000 - REVENUE
  { code: '4010', name: 'Dakhliga Iibka POS (Retail Sales Revenue)', type: 'Revenue', subCategory: 'Operating Revenue', description: 'Iibka maalinlaha ah ee xisaabiyeyaasha' },
  { code: '4020', name: 'Iibka Jumlad ah (Wholesale Sales)', type: 'Revenue', subCategory: 'Operating Revenue', description: 'Iibka kartoomada iyo jumladaha' },
  { code: '4030', name: 'Dakhliga Delivery-ga (Delivery Fee Income)', type: 'Revenue', subCategory: 'Other Revenue', description: 'Kharashka adeegga geynta alaabta' },

  // 5000 - EXPENSES
  { code: '5010', name: 'Qiimaha Alaabta La Iibiyay (Cost of Goods Sold - COGS)', type: 'Expense', subCategory: 'Direct Cost', description: 'Qiimihii lagu soo iibiyay alaabtii la iibiyay' },
  { code: '5020', name: 'Mushaaraadka Shaqaalaha (Salaries Expense)', type: 'Expense', subCategory: 'Operating Expense', description: 'Mushaarka shaqaalaha, maamulka & xisaabiyeyaasha' },
  { code: '5030', name: 'Kirada Dhismaha Supermarket-ka (Rent Expense)', type: 'Expense', subCategory: 'Operating Expense', description: 'Kirada dhismaha xarunta' },
  { code: '5040', name: 'Korontada & Shidaalka Generator-ka (Utilities Expense)', type: 'Expense', subCategory: 'Operating Expense', description: 'Biilasha korontada, biyaha iyo shidaalka' },
  { code: '5050', name: 'Dayactirka Qalabka (Maintenance Expense)', type: 'Expense', subCategory: 'Operating Expense', description: 'Hagaajinta qaboojiyeyaasha, gawaarida, khaanadaha' },
  { code: '5060', name: 'Kharashka Bacaha & Baakaynta (Packaging Expense)', type: 'Expense', subCategory: 'Operating Expense', description: 'Bacaha, cajaladaha, waraaqaha biilasha' }
];

export default function ChartOfAccountsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = DEFAULT_CHART_OF_ACCOUNTS.filter(acc => {
    if (typeFilter !== 'all' && acc.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        acc.code.includes(q) ||
        acc.name.toLowerCase().includes(q) ||
        acc.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'Asset':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Liability':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Equity':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Revenue':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Expense':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-100 text-indigo-800 rounded-lg">
              <FolderTree className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Shaxda Xisaabaadka ee Rasmiga ah (Chart of Accounts - COA)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Nidaamka code-yada xisaabaadka ee heerka caalamiga ah (1000 Hanti, 2000 Deyn, 3000 Raasamaal, 4000 Dakhli, 5000 Kharash).
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Raadi code ama magaca xisaabta..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#042954]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['all', 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                typeFilter === type
                  ? 'bg-[#042954] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'all' ? 'Dhammaan' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 w-20">Code</th>
                <th className="py-3 px-4">Magaca Xisaabta (Account Name)</th>
                <th className="py-3 px-4">Nooca (Class)</th>
                <th className="py-3 px-4">Qaybta (Sub-Category)</th>
                <th className="py-3 px-4">Faahfaahin & Ujeeddo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(acc => (
                <tr key={acc.code} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-black text-slate-900">
                    {acc.code}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {acc.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${getTypeStyle(acc.type)}`}>
                      {acc.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {acc.subCategory}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {acc.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

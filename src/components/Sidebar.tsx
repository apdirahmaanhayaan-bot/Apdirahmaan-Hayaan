import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Layers, 
  CreditCard, 
  Receipt, 
  Truck, 
  Users, 
  DollarSign, 
  TrendingDown, 
  MessageCircle, 
  FileSpreadsheet, 
  Settings, 
  Store, 
  Cloud, 
  CloudCheck, 
  RefreshCw, 
  LogOut, 
  UserCheck, 
  ShieldCheck, 
  Headphones, 
  X,
  ShoppingBag,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { AppUser } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  supermarketName: string;
  isOnline?: boolean;
  isSyncing?: boolean;
  currentUser: AppUser | null;
  onLogout: () => void;
  onSwitchUser: () => void;
  onOpenCloseWork?: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  lowStockCount?: number;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  supermarketName = 'Xaaji Salaad Supermarket', 
  isOnline = true, 
  isSyncing = false,
  currentUser,
  onLogout,
  onSwitchUser,
  onOpenCloseWork,
  isMobileOpen = false,
  setIsMobileOpen,
  lowStockCount = 0
}: SidebarProps) {
  
  // Menu items with role-based visibility
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard-ka', icon: LayoutDashboard, roles: ['admin'] },
    { id: 'pos', label: 'POS Iibka (Cashier)', icon: ShoppingCart, roles: ['admin', 'cashier'] },
    { id: 'products', label: 'Alaabta & Bakhaarka', icon: Package, roles: ['admin', 'cashier'] },
    { id: 'purchases', label: 'Soo Gadashada (Purchases)', icon: ShoppingBag, roles: ['admin'] },
    { id: 'adjustments', label: 'Hagaajinta (Adjustments)', icon: AlertTriangle, roles: ['admin', 'cashier'] },
    { id: 'categories', label: 'Qaybaha (Categories)', icon: Layers, roles: ['admin'] },
    { id: 'customers', label: 'Macaamiisha & Daymaha', icon: CreditCard, roles: ['admin', 'cashier'] },
    { id: 'sales', label: 'Iibka & Rasiidhada', icon: Receipt, roles: ['admin', 'cashier'] },
    { id: 'suppliers', label: 'Iibiyeyaasha & Keenista', icon: Truck, roles: ['admin'] },
    { id: 'employees', label: 'Shaqaalaha & Shifts', icon: Users, roles: ['admin'] },
    { id: 'accounting', label: 'Bangiyada & Qasnadda', icon: DollarSign, roles: ['admin'] },
    { id: 'expenses', label: 'Kharashaadka', icon: TrendingDown, roles: ['admin'] },
    { id: 'chat', label: 'Wada-hadalka (Live Chat)', icon: MessageCircle, roles: ['admin', 'cashier', 'customer', 'supplier'] },
    { id: 'customer-portal', label: 'Portal-ka Macmiilka', icon: Store, roles: ['admin', 'customer'] },
    { id: 'reports', label: 'Warbixinta & Faa\'iidada', icon: FileSpreadsheet, roles: ['admin'] },
    { id: 'settings', label: 'Habaynta Supermarket', icon: Settings, roles: ['admin'] },
  ];

  const userRole = currentUser?.role || 'admin';
  const visibleMenuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  const getRoleLabel = () => {
    switch (userRole) {
      case 'admin':
        return 'Maamule (Manager)';
      case 'cashier':
        return 'Qasnaji (Cashier)';
      case 'customer':
        return 'Macmiil (Customer)';
      default:
        return 'Shaqaale';
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Sidebar Drawer */}
      <aside 
        className={`w-64 bg-[#042954] text-white flex flex-col h-screen fixed left-0 top-0 overflow-y-auto border-r border-[#031a36] shadow-xl no-print z-50 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="bg-[#ffae01] text-slate-900 py-3.5 px-4 font-black text-sm text-center font-display tracking-wide shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <Store className="w-5 h-5 text-slate-900 shrink-0" />
            <span className="truncate">{supermarketName}</span>
          </div>
          {setIsMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1 text-slate-900 hover:bg-black/10 rounded-lg cursor-pointer"
              title="Xir Menu-ga"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Current Logged-in User Profile Card */}
        {currentUser && (
          <div className="mx-3 mt-3 p-3 rounded-2xl bg-[#031d3d] border border-[#063870] flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-[#ffae01] text-slate-950 flex items-center justify-center font-black text-xs shrink-0">
                  {currentUser.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">
                    {currentUser.fullName || currentUser.username}
                  </div>
                  <div className="text-[10px] text-slate-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#ffae01]" />
                    <span className="truncate">{getRoleLabel()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 pt-2 border-t border-[#063870]/80">
              <button
                onClick={() => {
                  onSwitchUser();
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className="flex-1 py-1.5 px-2 bg-[#063870] hover:bg-[#084b96] text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Bedel User-ka"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#ffae01]" />
                <span>Bedel User</span>
              </button>
              <button
                onClick={() => {
                  onLogout();
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className="py-1.5 px-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Ka bax (Log Out)"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Bax</span>
              </button>
            </div>
          </div>
        )}

        {/* Cloud Sync Status Badge */}
        <div className="mx-3 mt-2 px-3 py-1.5 rounded-xl bg-[#031e3f] border border-[#063870] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              {isOnline && (
                <span className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
              )}
            </div>
            <span className="text-slate-300 font-medium text-[10px]">
              {isSyncing ? 'Syncing...' : isOnline ? 'Firebase Cloud Sync' : 'Offline'}
            </span>
          </div>
          {isSyncing ? (
            <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
          ) : (
            <CloudCheck className="w-3 h-3 text-emerald-400" />
          )}
        </div>

        {/* Menu items navigation */}
        <nav className="flex-1 py-3 px-3 space-y-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive 
                    ? 'bg-[#031a36] text-[#ffae01] border-l-4 border-[#ffae01] pl-3 shadow-inner font-bold' 
                    : 'text-slate-300 hover:bg-[#032044] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#ffae01]' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.id === 'products' && lowStockCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-600 text-white animate-pulse">
                    {lowStockCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Close Work (Shift Closure) Action Button for Cashier & Admin */}
        {onOpenCloseWork && (userRole === 'cashier' || userRole === 'admin') && (
          <div className="mx-3 my-1">
            <button
              onClick={() => {
                onOpenCloseWork();
                if (setIsMobileOpen) setIsMobileOpen(false);
              }}
              className="w-full py-2.5 px-3 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all border border-emerald-400/30"
            >
              <Clock className="w-4 h-4 text-[#ffae01]" />
              <span>Xir Shaqada (Close Work)</span>
            </button>
          </div>
        )}

        {/* Live Chat Help Card in Sidebar */}
        <div className="mx-3 my-2 p-2.5 bg-linear-to-br from-[#063870] to-[#042954] rounded-2xl border border-blue-400/20 shadow-md flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Headphones className="w-3.5 h-3.5 text-[#ffae01]" />
              <span>Live Chat</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-[10px] text-slate-300 leading-tight">
            {userRole === 'admin' ? 'Xarunta Wada-hadalka Tooska ah' : 'La hadal Maamulaha Supermarket-ka'}
          </p>
          <button
            onClick={() => {
              handleTabClick('chat');
              if (setIsMobileOpen) setIsMobileOpen(false);
            }}
            className="w-full py-1.5 px-2 bg-[#ffae01] hover:bg-[#e09b00] text-slate-950 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Fur Live Chat</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#031a36] text-[10px] text-slate-400 text-center flex flex-col gap-0.5">
          <div className="text-emerald-400 font-semibold flex items-center justify-center gap-1">
            <Cloud className="w-3 h-3" /> Real-Time Supermarket Cloud
          </div>
          <div>&copy; {new Date().getFullYear()} {supermarketName}</div>
        </div>
      </aside>
    </>
  );
}

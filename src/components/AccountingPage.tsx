import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Building2,
  Smartphone,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Search,
  Filter,
  Printer,
  FileText,
  CheckCircle2,
  Clock,
  Trash2,
  Calendar,
  User,
  ShieldCheck,
  Briefcase,
  ChevronRight,
  Download,
  Receipt,
  Wallet,
  ArrowRightLeft,
  Edit3,
  X,
  Save,
  Copy,
  Check,
  Scale,
  Building,
  FolderTree,
  Landmark
} from 'lucide-react';
import {
  FinancialTransaction,
  PaymentAccount,
  TransactionCategory,
  Student,
  Teacher,
  Expense,
  SchoolAccount,
  FixedAsset,
  LiabilityItem,
  EquityDetails,
  Product,
  Customer,
  Supplier,
  SaleTransaction
} from '../types';
import { DEFAULT_ACCOUNTS, getAccountBalance } from '../accountsData';
import { DEFAULT_FIXED_ASSETS, DEFAULT_LIABILITIES, DEFAULT_EQUITY } from '../supermarketData';
import FixedAssetsView from './accounting/FixedAssetsView';
import LiabilitiesView from './accounting/LiabilitiesView';
import BalanceSheetView from './accounting/BalanceSheetView';
import ChartOfAccountsView from './accounting/ChartOfAccountsView';

interface AccountingPageProps {
  transactions: FinancialTransaction[];
  setTransactions: (txs: FinancialTransaction[]) => void;
  saveData?: (updatedTxs: FinancialTransaction[]) => void;
  saveTransactions?: (updatedTxs: FinancialTransaction[]) => void;
  students?: Student[];
  teachers?: Teacher[];
  expenses?: Expense[];
  currentUser?: any;
  schoolName: string;
  accounts?: SchoolAccount[];
  setAccounts?: (accs: SchoolAccount[]) => void;
  saveAccounts?: (accs: SchoolAccount[]) => void;
  // Full Accounting & Balance Sheet Props
  fixedAssets?: FixedAsset[];
  setFixedAssets?: (assets: FixedAsset[]) => void;
  saveFixedAssets?: (assets: FixedAsset[]) => void;
  liabilities?: LiabilityItem[];
  setLiabilities?: (liabs: LiabilityItem[]) => void;
  saveLiabilities?: (liabs: LiabilityItem[]) => void;
  equityDetails?: EquityDetails;
  setEquityDetails?: (eq: EquityDetails) => void;
  saveEquityDetails?: (eq: EquityDetails) => void;
  products?: Product[];
  customers?: Customer[];
  suppliers?: Supplier[];
  sales?: SaleTransaction[];
}

const INCOME_CATEGORIES: string[] = [
  'POS Daily Sales',
  'Customer Debt Repayments',
  'Wholesale Orders',
  'Delivery Services',
  'Other Income'
];

const EXPENSE_CATEGORIES: string[] = [
  'Supplier Purchases',
  'Staff & Cashier Salaries',
  'Supermarket Rent',
  'Electricity & Generator',
  'Transportation & Logistics',
  'Maintenance & Repairs',
  'Packaging & Bags',
  'Other Expense'
];

export default function AccountingPage({
  transactions = [],
  setTransactions,
  saveData,
  saveTransactions,
  students = [],
  teachers = [],
  expenses = [],
  schoolName,
  accounts = DEFAULT_ACCOUNTS,
  setAccounts,
  saveAccounts,
  currentUser,
  fixedAssets = DEFAULT_FIXED_ASSETS,
  setFixedAssets,
  saveFixedAssets,
  liabilities = DEFAULT_LIABILITIES,
  setLiabilities,
  saveLiabilities,
  equityDetails = DEFAULT_EQUITY,
  setEquityDetails,
  saveEquityDetails,
  products = [],
  customers = [],
  suppliers = [],
  sales = []
}: AccountingPageProps) {
  const triggerSaveTransactions = (updated: FinancialTransaction[]) => {
    if (saveTransactions) {
      saveTransactions(updated);
    } else if (saveData) {
      saveData(updated);
    }
  };

  const triggerSaveAccounts = (updated: SchoolAccount[]) => {
    if (saveAccounts) {
      saveAccounts(updated);
    } else if (setAccounts) {
      setAccounts(updated);
    }
  };

  // Fixed Assets Handlers
  const handleAddAsset = (newAsset: FixedAsset) => {
    const updated = [newAsset, ...fixedAssets];
    if (setFixedAssets) setFixedAssets(updated);
    if (saveFixedAssets) saveFixedAssets(updated);
  };

  const handleUpdateAsset = (asset: FixedAsset) => {
    const updated = fixedAssets.map(a => a.id === asset.id ? asset : a);
    if (setFixedAssets) setFixedAssets(updated);
    if (saveFixedAssets) saveFixedAssets(updated);
  };

  const handleDeleteAsset = (id: string) => {
    const updated = fixedAssets.filter(a => a.id !== id);
    if (setFixedAssets) setFixedAssets(updated);
    if (saveFixedAssets) saveFixedAssets(updated);
  };

  // Liabilities Handlers
  const handleAddLiability = (newItem: LiabilityItem) => {
    const updated = [newItem, ...liabilities];
    if (setLiabilities) setLiabilities(updated);
    if (saveLiabilities) saveLiabilities(updated);
  };

  const handleUpdateLiability = (item: LiabilityItem) => {
    const updated = liabilities.map(l => l.id === item.id ? item : l);
    if (setLiabilities) setLiabilities(updated);
    if (saveLiabilities) saveLiabilities(updated);
  };

  const handleDeleteLiability = (id: string) => {
    const updated = liabilities.filter(l => l.id !== id);
    if (setLiabilities) setLiabilities(updated);
    if (saveLiabilities) saveLiabilities(updated);
  };

  const handleMakeLiabilityPayment = (liabilityId: string, amount: number, note: string) => {
    const defaultAcc = accounts[0];
    const newTx: FinancialTransaction = {
      id: `TX-LIAB-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      account: defaultAcc ? defaultAcc.name : 'Cash Box',
      accountId: defaultAcc?.id || '',
      category: 'Supplier Purchases' as any,
      amount: amount,
      reference: `DEBT-PAY-${Date.now().toString().slice(-4)}`,
      payerPayee: 'Bixinta Deynta',
      note: note || `Bixinta qayb deyn ah`,
      status: 'completed',
      createdBy: currentUser?.fullName || 'Maamulka'
    };
    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    triggerSaveTransactions(updatedTxs);
  };

  const handleUpdateEquity = (eq: EquityDetails) => {
    if (setEquityDetails) setEquityDetails(eq);
    if (saveEquityDetails) saveEquityDetails(eq);
  };

  // Main Page Tabs: 'balance_sheet' | 'fixed_assets' | 'liabilities' | 'accounts' | 'ledger' | 'chart_of_accounts'
  const [activeMainView, setActiveMainView] = useState<'balance_sheet' | 'fixed_assets' | 'liabilities' | 'accounts' | 'ledger' | 'chart_of_accounts'>('balance_sheet');

  // Filters & State
  const [activeTxTab, setActiveTxTab] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Modals
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SchoolAccount | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [selectedAccountDetail, setSelectedAccountDetail] = useState<SchoolAccount | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Form State for New Transaction
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense' | 'transfer',
    account: accounts[0]?.name || 'Salaam Bank / Hormuud EVC',
    accountId: accounts[0]?.id || '',
    toAccount: accounts[1]?.name || 'Zaad Service (Telesom)',
    toAccountId: accounts[1]?.id || '',
    category: 'Student Fees' as TransactionCategory,
    amount: '',
    reference: '',
    payerPayee: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Form State for Account (Add/Edit)
  const [accountFormData, setAccountFormData] = useState({
    name: '',
    bankName: '',
    accountNumber: '411840',
    phoneNumber: '+252906305090',
    initialBalance: 0,
    description: ''
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Compute Balances for all accounts dynamically
  const accountMetrics = useMemo(() => {
    return accounts.map(acc => {
      const { currentBalance, totalIncome, totalExpense, movements } = getAccountBalance(acc, transactions);
      return {
        account: acc,
        currentBalance,
        totalIncome,
        totalExpense,
        movements
      };
    });
  }, [accounts, transactions]);

  // Overall Global Totals
  const totalCombinedBalance = useMemo(() => {
    return accountMetrics.reduce((sum, item) => sum + item.currentBalance, 0);
  }, [accountMetrics]);

  const totalGlobalIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalGlobalExpense = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Filtered transactions for the ledger
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (activeTxTab !== 'all' && tx.type !== activeTxTab) return false;
      if (selectedAccountFilter !== 'all') {
        const matchesMain = tx.accountId === selectedAccountFilter || tx.account === selectedAccountFilter;
        const matchesTo = tx.toAccountId === selectedAccountFilter || tx.toAccount === selectedAccountFilter;
        if (!matchesMain && !matchesTo) return false;
      }
      if (selectedCategoryFilter !== 'all' && tx.category !== selectedCategoryFilter) return false;
      if (dateFilter && tx.date !== dateFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesPayer = tx.payerPayee.toLowerCase().includes(q);
        const matchesRef = tx.reference.toLowerCase().includes(q);
        const matchesNote = tx.note.toLowerCase().includes(q);
        if (!matchesPayer && !matchesRef && !matchesNote) return false;
      }
      return true;
    });
  }, [transactions, activeTxTab, selectedAccountFilter, selectedCategoryFilter, dateFilter, searchQuery]);

  // --- ACCOUNT CRUD ---
  const handleOpenAddAccount = () => {
    setEditingAccount(null);
    setAccountFormData({
      name: '',
      bankName: '',
      accountNumber: '411840',
      phoneNumber: '+252906305090',
      initialBalance: 0,
      description: ''
    });
    setShowAccountModal(true);
  };

  const handleOpenEditAccount = (acc: SchoolAccount) => {
    setEditingAccount(acc);
    setAccountFormData({
      name: acc.name,
      bankName: acc.bankName,
      accountNumber: acc.accountNumber,
      phoneNumber: acc.phoneNumber,
      initialBalance: acc.initialBalance || 0,
      description: acc.description || ''
    });
    setShowAccountModal(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountFormData.name.trim() || !accountFormData.accountNumber.trim()) {
      alert("Fadlan geli Magaca iyo Lambarka Account-ka!");
      return;
    }

    if (editingAccount) {
      // Edit
      const updated = accounts.map(a => {
        if (a.id === editingAccount.id) {
          return {
            ...a,
            name: accountFormData.name.trim(),
            bankName: accountFormData.bankName.trim() || accountFormData.name.trim(),
            accountNumber: accountFormData.accountNumber.trim(),
            phoneNumber: accountFormData.phoneNumber.trim(),
            initialBalance: Number(accountFormData.initialBalance) || 0,
            description: accountFormData.description.trim()
          };
        }
        return a;
      });
      if (setAccounts) setAccounts(updated);
      triggerSaveAccounts(updated);
      alert("Account-ka waa la cusboonaysiiyey!");
    } else {
      // Add new
      const newAcc: SchoolAccount = {
        id: `acc_${Date.now()}`,
        name: accountFormData.name.trim(),
        bankName: accountFormData.bankName.trim() || accountFormData.name.trim(),
        accountNumber: accountFormData.accountNumber.trim(),
        phoneNumber: accountFormData.phoneNumber.trim(),
        initialBalance: Number(accountFormData.initialBalance) || 0,
        description: accountFormData.description.trim(),
        createdAt: new Date().toISOString()
      };
      const updated = [...accounts, newAcc];
      if (setAccounts) setAccounts(updated);
      triggerSaveAccounts(updated);
      alert("Account cusub waa lagu daray!");
    }

    setShowAccountModal(false);
  };

  const handleDeleteAccount = (accId: string) => {
    if (accounts.length <= 1) {
      alert("Ugu yaraan hal account waa inuu nidaamka ku jiraa!");
      return;
    }
    if (confirm("Ma hubtaa inaad tirtirto account-kan?")) {
      const updated = accounts.filter(a => a.id !== accId);
      if (setAccounts) setAccounts(updated);
      triggerSaveAccounts(updated);
    }
  };

  // --- TRANSACTION CRUD ---
  const handleOpenAddTx = (type: 'income' | 'expense' | 'transfer' = 'income') => {
    const defaultAcc = accounts[0];
    setFormData({
      type,
      account: defaultAcc ? defaultAcc.name : 'Cash Box',
      accountId: defaultAcc ? defaultAcc.id : '',
      toAccount: accounts[1]?.name || 'Zaad Service (Telesom)',
      toAccountId: accounts[1]?.id || '',
      category: type === 'income' ? 'Student Fees' : 'Other Expense',
      amount: '',
      reference: `REC-${Date.now().toString().slice(-4)}`,
      payerPayee: '',
      note: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingTransaction(null);
    setShowAddTxModal(true);
  };

  const handleOpenEditTx = (tx: FinancialTransaction) => {
    setEditingTransaction(tx);
    setFormData({
      type: tx.type,
      account: String(tx.account),
      accountId: tx.accountId || '',
      toAccount: tx.toAccount ? String(tx.toAccount) : accounts[1]?.name || '',
      toAccountId: tx.toAccountId || '',
      category: tx.category,
      amount: String(tx.amount),
      reference: tx.reference,
      payerPayee: tx.payerPayee,
      note: tx.note,
      date: tx.date
    });
    setShowAddTxModal(true);
  };

  const handleSaveTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert("Fadlan geli qadar lacag oo sax ah!");
      return;
    }
    if (!formData.payerPayee.trim()) {
      alert("Fadlan geli qofka bixiyey ama loo bixiyey lacagta!");
      return;
    }

    const selectedAcc = accounts.find(a => a.id === formData.accountId || a.name === formData.account);
    const selectedToAcc = accounts.find(a => a.id === formData.toAccountId || a.name === formData.toAccount);

    if (editingTransaction) {
      // Edit
      const updated = transactions.map(t => {
        if (t.id === editingTransaction.id) {
          return {
            ...t,
            type: formData.type,
            account: selectedAcc ? selectedAcc.name : formData.account,
            accountId: selectedAcc?.id || formData.accountId,
            toAccount: formData.type === 'transfer' ? (selectedToAcc ? selectedToAcc.name : formData.toAccount) : undefined,
            toAccountId: formData.type === 'transfer' ? selectedToAcc?.id : undefined,
            category: formData.category,
            amount: Number(formData.amount),
            reference: formData.reference.trim() || `TX-${Date.now().toString().slice(-4)}`,
            payerPayee: formData.payerPayee.trim(),
            note: formData.note.trim(),
            date: formData.date
          };
        }
        return t;
      });
      setTransactions(updated);
      triggerSaveTransactions(updated);
      alert("Dhaqdhaqaaqa xisaabta waa la cusboonaysiiyey!");
    } else {
      // Add new
      const newTx: FinancialTransaction = {
        id: `TX-${Date.now()}`,
        date: formData.date,
        type: formData.type,
        account: selectedAcc ? selectedAcc.name : formData.account,
        accountId: selectedAcc?.id || formData.accountId,
        toAccount: formData.type === 'transfer' ? (selectedToAcc ? selectedToAcc.name : formData.toAccount) : undefined,
        toAccountId: formData.type === 'transfer' ? selectedToAcc?.id : undefined,
        category: formData.category,
        amount: Number(formData.amount),
        reference: formData.reference.trim() || `TX-${Date.now().toString().slice(-4)}`,
        payerPayee: formData.payerPayee.trim(),
        note: formData.note.trim(),
        status: 'completed',
        createdBy: currentUser?.fullName || 'Maamulka'
      };
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      triggerSaveTransactions(updated);
      alert("Dhaqdhaqaaqa lacagta si guul leh ayaa loo diiwaangeliyey!");
    }

    setShowAddTxModal(false);
  };

  const handleDeleteTx = (id: string) => {
    if (confirm("Ma hubtaa inaad tirtirto dhaqdhaqaaqan xisaabeed?")) {
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      triggerSaveTransactions(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-linear-to-br from-[#042954] to-[#0a4185] rounded-xl flex items-center justify-center text-[#ffae01] shadow-xs">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black font-display text-slate-900">
                Xisaabaadka & Warbixinnada Dhaqaalaha (Accounting)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Balance Sheet, Hantida Ma-Guurtada ah (Fixed Assets), Deymaha (Total Liabilities), Bangiyada & Diiwaanka
              </p>
            </div>
          </div>
        </div>

        {/* 6 Core Accounting Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
          <button
            onClick={() => setActiveMainView('balance_sheet')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeMainView === 'balance_sheet'
                ? 'bg-[#042954] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Scale className="w-4 h-4 text-[#ffae01]" />
            <span>Balance Sheet (Xisaab-Xirka)</span>
          </button>

          <button
            onClick={() => setActiveMainView('fixed_assets')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeMainView === 'fixed_assets'
                ? 'bg-[#042954] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building className="w-4 h-4 text-blue-500" />
            <span>Fixed Assets (Hantida Ma-Guurtada ah) ({fixedAssets.length})</span>
          </button>

          <button
            onClick={() => setActiveMainView('liabilities')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeMainView === 'liabilities'
                ? 'bg-[#042954] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4 text-rose-500" />
            <span>Total Liabilities (Deymaha Ganacsiga) ({liabilities.length})</span>
          </button>

          <button
            onClick={() => setActiveMainView('accounts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeMainView === 'accounts'
                ? 'bg-[#042954] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-500" />
            <span>Bangiyada & Qasnadda ({accounts.length})</span>
          </button>

          <button
            onClick={() => setActiveMainView('ledger')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeMainView === 'ledger'
                ? 'bg-[#042954] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-500" />
            <span>Diiwaanka Dhaqdhaqaaqa ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveMainView('chart_of_accounts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeMainView === 'chart_of_accounts'
                ? 'bg-[#042954] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FolderTree className="w-4 h-4 text-indigo-500" />
            <span>Chart of Accounts (COA)</span>
          </button>
        </div>
      </div>

      {/* VIEW: BALANCE SHEET (XISAAB-XIRKA) */}
      {activeMainView === 'balance_sheet' && (
        <BalanceSheetView
          accounts={accounts}
          transactions={transactions}
          fixedAssets={fixedAssets}
          liabilities={liabilities}
          equityDetails={equityDetails}
          onUpdateEquity={handleUpdateEquity}
          products={products}
          customers={customers}
          suppliers={suppliers}
          expenses={expenses}
          sales={sales}
          supermarketName={schoolName}
        />
      )}

      {/* VIEW: FIXED ASSETS (HANTIDA MA-GUURTADA AH) */}
      {activeMainView === 'fixed_assets' && (
        <FixedAssetsView
          fixedAssets={fixedAssets}
          onAddAsset={handleAddAsset}
          onUpdateAsset={handleUpdateAsset}
          onDeleteAsset={handleDeleteAsset}
        />
      )}

      {/* VIEW: LIABILITIES (DEYMAHA GANACSIGA) */}
      {activeMainView === 'liabilities' && (
        <LiabilitiesView
          liabilities={liabilities}
          suppliers={suppliers}
          onAddLiability={handleAddLiability}
          onUpdateLiability={handleUpdateLiability}
          onDeleteLiability={handleDeleteLiability}
          onMakePayment={handleMakeLiabilityPayment}
        />
      )}

      {/* VIEW 1: ACCOUNTS & BANKS OVERVIEW */}
      {activeMainView === 'accounts' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Xisaabaadka Qasnadda & Bangiyada (Accounts)</h3>
              <p className="text-xs text-slate-500">Qofku marka uu bixiyo ama laga qaado lacag wuxuu dooranayaa account-ka ay gasho ama ka baxdo</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddAccount}
                className="px-4 py-2 bg-[#042954] hover:bg-[#031d3d] text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ku Dar Account Cusub</span>
              </button>
            </div>
          </div>

          {/* Account Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {accountMetrics.map(({ account, currentBalance, totalIncome, totalExpense, movements }) => (
              <div
                key={account.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                        {account.bankName.toLowerCase().includes('cash') ? (
                          <Wallet className="w-5 h-5" />
                        ) : (
                          <Building2 className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{account.name}</h4>
                        <span className="text-[11px] font-medium text-slate-500">{account.bankName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditAccount(account)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        title="Edit Account Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Delete Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Account Numbers & Details */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Account Number:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-bold text-slate-800">{account.accountNumber}</span>
                        <button
                          onClick={() => handleCopy(account.accountNumber)}
                          className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                          title="Koobiyeyso"
                        >
                          {copiedText === account.accountNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Taleefanka (Phone):</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-bold text-slate-800">{account.phoneNumber}</span>
                        <button
                          onClick={() => handleCopy(account.phoneNumber)}
                          className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                          title="Koobiyeyso"
                        >
                          {copiedText === account.phoneNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Balance Box */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Haraaga Account-ka (Balance):</div>
                    <div className="text-2xl font-black text-slate-900 font-display mt-0.5">
                      ${currentBalance.toLocaleString()}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                      <div className="p-2 bg-emerald-50/70 rounded-lg border border-emerald-100">
                        <span className="text-[10px] text-emerald-700 font-bold block uppercase">Dakhli (IN)</span>
                        <span className="font-bold text-emerald-800">+${totalIncome.toLocaleString()}</span>
                      </div>
                      <div className="p-2 bg-rose-50/70 rounded-lg border border-rose-100">
                        <span className="text-[10px] text-rose-700 font-bold block uppercase">Kharash (OUT)</span>
                        <span className="font-bold text-rose-800">-${totalExpense.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">{movements.length} Dhaqdhaqaaq</span>
                  <button
                    onClick={() => {
                      setSelectedAccountDetail(account);
                      setSelectedAccountFilter(account.name);
                      setActiveMainView('ledger');
                    }}
                    className="text-xs font-bold text-[#042954] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Eeg Dhaqdhaqaaqa</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: FULL TRANSACTIONS LEDGER (DHAQDHAQAAQA) */}
      {activeMainView === 'ledger' && (
        <div className="space-y-6">
          {/* Action Bar & Quick Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleOpenAddTx('income')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Geli Dakhli (IN)</span>
              </button>
              <button
                onClick={() => handleOpenAddTx('expense')}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Bixi Kharash (OUT)</span>
              </button>
              <button
                onClick={() => handleOpenAddTx('transfer')}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Wareeji (Transfer)</span>
              </button>
            </div>

            {/* Account Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-bold text-slate-500">Account-ka:</label>
              <select
                value={selectedAccountFilter}
                onChange={(e) => setSelectedAccountFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white focus:border-[#042954]"
              >
                <option value="all">Dhammaan Accounts-ka</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.name}>{acc.name} ({acc.accountNumber})</option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Raadi dhaqdhaqaaq..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white focus:border-[#042954]"
                />
              </div>
            </div>
          </div>

          {/* Filter Subtabs: All, Income, Expense, Transfer */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTxTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTxTab === 'all' ? 'bg-[#042954] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Dhammaan ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTxTab('income')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                activeTxTab === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Dakhli (Income)</span>
            </button>
            <button
              onClick={() => setActiveTxTab('expense')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                activeTxTab === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Kharash (Expense)</span>
            </button>
            <button
              onClick={() => setActiveTxTab('transfer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                activeTxTab === 'transfer' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Wareejin (Transfer)</span>
            </button>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <FileText className="w-12 h-12 mx-auto stroke-1 mb-2 text-slate-300" />
                <p className="text-sm font-medium">Wax dhaqdhaqaaq ah lagama helin xisaabtan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Taariikh</th>
                      <th className="py-3.5 px-4">Nooca</th>
                      <th className="py-3.5 px-4">Accounts-ka</th>
                      <th className="py-3.5 px-4">Qaybta (Category)</th>
                      <th className="py-3.5 px-4">Qofka / Xiriirka</th>
                      <th className="py-3.5 px-4">Ref ID</th>
                      <th className="py-3.5 px-4 text-right">Qadarka ($)</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          {tx.date}
                        </td>
                        <td className="py-3.5 px-4">
                          {tx.type === 'income' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                              <span>IN (Dakhli)</span>
                            </span>
                          )}
                          {tx.type === 'expense' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <ArrowUpRight className="w-3 h-3 text-rose-600" />
                              <span>OUT (Kharash)</span>
                            </span>
                          )}
                          {tx.type === 'transfer' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                              <ArrowRightLeft className="w-3 h-3 text-indigo-600" />
                              <span>TRANSFER</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{tx.account}</div>
                          {tx.toAccount && (
                            <div className="text-[10px] text-indigo-600 font-medium">➔ Ku shubay: {tx.toAccount}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {tx.category}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{tx.payerPayee}</div>
                          {tx.note && <div className="text-[10px] text-slate-500 truncate max-w-xs">{tx.note}</div>}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                          {tx.reference}
                        </td>
                        <td className={`py-3.5 px-4 text-right font-black font-display text-sm ${
                          tx.type === 'income' ? 'text-emerald-700' : tx.type === 'expense' ? 'text-rose-700' : 'text-indigo-700'
                        }`}>
                          {tx.type === 'income' ? `+$${tx.amount}` : tx.type === 'expense' ? `-$${tx.amount}` : `$${tx.amount}`}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditTx(tx)}
                              className="p-1.5 hover:bg-slate-200/70 text-slate-600 rounded-md transition-colors cursor-pointer"
                              title="Edit Transaction"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTx(tx.id)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                              title="Delete Transaction"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: CHART OF ACCOUNTS (SHAXDA XISAABAADKA) */}
      {activeMainView === 'chart_of_accounts' && (
        <ChartOfAccountsView />
      )}

      {/* MODAL: ADD / EDIT ACCOUNT */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 font-display">
                {editingAccount ? 'Wax ka bedel Account-ka' : 'Ku Dar Account Cusub'}
              </h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Magaca Account-ka (Account Name) *</label>
                <input
                  type="text"
                  placeholder="Tusaale: Salaam Bank / Hormuud EVC"
                  value={accountFormData.name}
                  onChange={(e) => setAccountFormData({ ...accountFormData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white focus:border-[#042954]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Bangiga ama Shirkadda (Provider / Bank)</label>
                <input
                  type="text"
                  placeholder="Tusaale: Salaam Bank, Zaad, Sahal, Cash"
                  value={accountFormData.bankName}
                  onChange={(e) => setAccountFormData({ ...accountFormData, bankName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white focus:border-[#042954]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Account Number *</label>
                  <input
                    type="text"
                    value={accountFormData.accountNumber}
                    onChange={(e) => setAccountFormData({ ...accountFormData, accountNumber: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono outline-none focus:bg-white focus:border-[#042954]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Taleefanka (Phone) *</label>
                  <input
                    type="text"
                    value={accountFormData.phoneNumber}
                    onChange={(e) => setAccountFormData({ ...accountFormData, phoneNumber: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono outline-none focus:bg-white focus:border-[#042954]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Haraaga Hore (Starting Balance - Default: 0$)</label>
                <input
                  type="number"
                  value={accountFormData.initialBalance}
                  onChange={(e) => setAccountFormData({ ...accountFormData, initialBalance: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:bg-white focus:border-[#042954]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Faahfaahin (Description)</label>
                <input
                  type="text"
                  placeholder="Xisaabta guud ee fiiga..."
                  value={accountFormData.description}
                  onChange={(e) => setAccountFormData({ ...accountFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white focus:border-[#042954]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Ka Noqo
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#042954] hover:bg-[#031d3d] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingAccount ? 'Kaydi Isbedelka' : 'Abuur Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT TRANSACTION */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-base font-bold text-slate-900 font-display">
                {editingTransaction ? 'Wax ka bedel Dhaqdhaqaaqa' : 'Diiwaangeli Dhaqdhaqaaq Cusub'}
              </h3>
              <button
                onClick={() => setShowAddTxModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTx} className="space-y-4">
              {/* Type selection */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income', category: 'Student Fees' })}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    formData.type === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Dakhli (IN)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense', category: 'Other Expense' })}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    formData.type === 'expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Kharash (OUT)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'transfer' })}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    formData.type === 'transfer' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Wareeji</span>
                </button>
              </div>

              {/* Account Selector based on Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>
                    {formData.type === 'income' && 'Accounts-kee lacagta lagu shubay? *'}
                    {formData.type === 'expense' && 'Accounts-kee lacagta laga saaray? *'}
                    {formData.type === 'transfer' && 'Laga saaray Account-kee? (From Account) *'}
                  </span>
                </label>
                <select
                  value={formData.accountId || formData.account}
                  onChange={(e) => {
                    const chosen = accounts.find(a => a.id === e.target.value || a.name === e.target.value);
                    setFormData({
                      ...formData,
                      accountId: chosen?.id || '',
                      account: chosen?.name || e.target.value
                    });
                  }}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#042954]"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} — Acc: {acc.accountNumber} ({acc.phoneNumber})
                    </option>
                  ))}
                </select>
              </div>

              {formData.type === 'transfer' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                    <span>Lagu shubay Account-kee? (To Account) *</span>
                  </label>
                  <select
                    value={formData.toAccountId || formData.toAccount}
                    onChange={(e) => {
                      const chosen = accounts.find(a => a.id === e.target.value || a.name === e.target.value);
                      setFormData({
                        ...formData,
                        toAccountId: chosen?.id || '',
                        toAccount: chosen?.name || e.target.value
                      });
                    }}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-600"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} — Acc: {acc.accountNumber} ({acc.phoneNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Qadarka Lacagta ($) *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-emerald-700 outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Taariikhda *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#042954]"
                  />
                </div>
              </div>

              {formData.type !== 'transfer' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Qaybta (Category) *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TransactionCategory })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#042954]"
                  >
                    {formData.type === 'income' ? (
                      INCOME_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)
                    ) : (
                      EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)
                    )}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {formData.type === 'income' ? 'Qofka Bixiyey (Payer)' : 'Loo Bixiyey (Payee)'} *
                  </label>
                  <input
                    type="text"
                    placeholder="Magaca qofka ama shirkadda..."
                    value={formData.payerPayee}
                    onChange={(e) => setFormData({ ...formData, payerPayee: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-[#042954]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Ref ID / Lambarka Rasiidka</label>
                  <input
                    type="text"
                    placeholder="REC-1001"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-[#042954]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Xusuusin / Faahfaahin</label>
                <input
                  type="text"
                  placeholder="Xog dheeraad ah..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-[#042954]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Ka Noqo
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingTransaction ? 'Kaydi Isbedelka' : 'Xeree Dhaqdhaqaaqa'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

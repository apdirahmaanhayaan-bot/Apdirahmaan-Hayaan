import React, { useState, useEffect, useMemo } from 'react';
import { 
  Product, 
  Category, 
  Customer, 
  DebtPayment, 
  Supplier, 
  PurchaseOrder, 
  Employee, 
  StaffAttendance, 
  SaleTransaction, 
  Expense, 
  FinancialTransaction, 
  SchoolAccount, 
  AppUser, 
  SupermarketData,
  CurrencySettings,
  FixedAsset,
  LiabilityItem,
  EquityDetails,
  StockAdjustment,
  ShiftClosure
} from './types';
import { 
  INITIAL_SUPERMARKET_DATA, 
  DEFAULT_PRODUCTS, 
  DEFAULT_CATEGORIES, 
  DEFAULT_CUSTOMERS, 
  DEFAULT_SUPPLIERS, 
  DEFAULT_EMPLOYEES, 
  DEFAULT_SALES, 
  DEFAULT_EXPENSES, 
  DEFAULT_PURCHASE_ORDERS, 
  DEFAULT_USERS, 
  DEFAULT_CURRENCY_SETTINGS,
  DEFAULT_FIXED_ASSETS,
  DEFAULT_LIABILITIES,
  DEFAULT_EQUITY
} from './supermarketData';
import { DEFAULT_ACCOUNTS } from './accountsData';
import { 
  subscribeToSupermarketData, 
  saveSupermarketDataToCloud, 
  fetchSupermarketDataFromCloud,
  clearAllSupermarketDataFromCloud
} from './firebase';

// Components
import Sidebar from './components/Sidebar';
import SupermarketDashboard from './components/SupermarketDashboard';
import POSPage from './components/POSPage';
import ProductsPage from './components/ProductsPage';
import PurchasesPage from './components/PurchasesPage';
import StockAdjustmentsPage from './components/StockAdjustmentsPage';
import CloseWorkModal from './components/CloseWorkModal';
import CategoriesPage from './components/CategoriesPage';
import CustomersDebtPage from './components/CustomersDebtPage';
import SalesHistoryPage from './components/SalesHistoryPage';
import SuppliersPage from './components/SuppliersPage';
import EmployeesPage from './components/EmployeesPage';
import AccountingPage from './components/AccountingPage';
import ExpensesPage from './components/ExpensesPage';
import SupermarketLiveChat from './components/SupermarketLiveChat';
import CustomerPortal from './components/CustomerPortal';
import ReportsPage from './components/ReportsPage';
import SupermarketSettingsPage from './components/SupermarketSettingsPage';
import LoginPage from './components/LoginPage';

// Icons
import { 
  Menu, 
  MessageCircle, 
  UserCheck, 
  LogOut, 
  Store, 
  ShieldCheck, 
  CreditCard, 
  ShoppingCart, 
  Users, 
  Eye, 
  EyeOff, 
  X, 
  CheckCircle2,
  Clock,
  ShoppingBag,
  AlertTriangle
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'XaajiSalaad_SupermarketData';
const AUTH_STORAGE_KEY = 'XaajiSalaad_CurrentUser';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default logged-in user: Admin
    return {
      id: 'user_admin_1',
      username: 'admin1',
      password: '123',
      role: 'admin',
      fullName: 'Maamulaha Sare (Manager)',
      createdAt: new Date().toISOString()
    };
  });

  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<{ [id: string]: boolean }>({});

  // Supermarket State
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [customers, setCustomers] = useState<Customer[]>(DEFAULT_CUSTOMERS);
  const [debtPayments, setDebtPayments] = useState<DebtPayment[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(DEFAULT_SUPPLIERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(DEFAULT_PURCHASE_ORDERS);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [shiftClosures, setShiftClosures] = useState<ShiftClosure[]>([]);
  const [showCloseWorkModal, setShowCloseWorkModal] = useState<boolean>(false);
  const [employees, setEmployees] = useState<Employee[]>(DEFAULT_EMPLOYEES);
  const [attendance, setAttendance] = useState<StaffAttendance[]>([]);
  const [sales, setSales] = useState<SaleTransaction[]>(DEFAULT_SALES);
  const [expenses, setExpenses] = useState<Expense[]>(DEFAULT_EXPENSES);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [accounts, setAccounts] = useState<SchoolAccount[]>(DEFAULT_ACCOUNTS);
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>(DEFAULT_FIXED_ASSETS);
  const [liabilities, setLiabilities] = useState<LiabilityItem[]>(DEFAULT_LIABILITIES);
  const [equityDetails, setEquityDetails] = useState<EquityDetails>(DEFAULT_EQUITY);
  const [users, setUsers] = useState<AppUser[]>(DEFAULT_USERS);
  const [supermarketName, setSupermarketName] = useState('Xaaji Salaad Supermarket');
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(DEFAULT_CURRENCY_SETTINGS);

  // Network & Cloud Sync
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const data: SupermarketData = JSON.parse(stored);
        if (data.products?.length) setProducts(data.products);
        if (data.categories?.length) setCategories(data.categories);
        if (data.customers?.length) setCustomers(data.customers);
        if (data.debtPayments?.length) setDebtPayments(data.debtPayments);
        if (data.suppliers?.length) setSuppliers(data.suppliers);
        if (data.purchaseOrders?.length) setPurchaseOrders(data.purchaseOrders);
        if (data.purchases?.length && !data.purchaseOrders?.length) setPurchaseOrders(data.purchases);
        if (data.stockAdjustments?.length) setAdjustments(data.stockAdjustments);
        if (data.shiftClosures?.length) setShiftClosures(data.shiftClosures);
        if (data.employees?.length) setEmployees(data.employees);
        if (data.attendance?.length) setAttendance(data.attendance);
        if (data.sales?.length) setSales(data.sales);
        if (data.expenses?.length) setExpenses(data.expenses);
        if (data.transactions?.length) setTransactions(data.transactions);
        if (data.accounts?.length) setAccounts(data.accounts);
        if (data.fixedAssets?.length) setFixedAssets(data.fixedAssets);
        if (data.liabilities?.length) setLiabilities(data.liabilities);
        if (data.equityDetails) setEquityDetails(data.equityDetails);
        if (data.users?.length) setUsers(data.users);
        if (data.supermarketName) setSupermarketName(data.supermarketName);
        if (data.currencySettings) setCurrencySettings(data.currencySettings);
      } catch (e) {
        console.error('Error loading local data:', e);
      }
    }
  }, []);

  // 2. Real-time Firebase Firestore Sync
  useEffect(() => {
    setIsSyncing(true);
    const unsubscribe = subscribeToSupermarketData((cloudData) => {
      setIsSyncing(false);
      if (cloudData) {
        if (cloudData.products?.length) setProducts(cloudData.products);
        if (cloudData.categories?.length) setCategories(cloudData.categories);
        if (cloudData.customers?.length) setCustomers(cloudData.customers);
        if (cloudData.debtPayments?.length) setDebtPayments(cloudData.debtPayments);
        if (cloudData.suppliers?.length) setSuppliers(cloudData.suppliers);
        if (cloudData.purchaseOrders?.length) setPurchaseOrders(cloudData.purchaseOrders);
        if (cloudData.purchases?.length && !cloudData.purchaseOrders?.length) setPurchaseOrders(cloudData.purchases);
        if (cloudData.stockAdjustments?.length) setAdjustments(cloudData.stockAdjustments);
        if (cloudData.shiftClosures?.length) setShiftClosures(cloudData.shiftClosures);
        if (cloudData.employees?.length) setEmployees(cloudData.employees);
        if (cloudData.attendance?.length) setAttendance(cloudData.attendance);
        if (cloudData.sales?.length) setSales(cloudData.sales);
        if (cloudData.expenses?.length) setExpenses(cloudData.expenses);
        if (cloudData.transactions?.length) setTransactions(cloudData.transactions);
        if (cloudData.accounts?.length) setAccounts(cloudData.accounts);
        if (cloudData.fixedAssets?.length) setFixedAssets(cloudData.fixedAssets);
        if (cloudData.liabilities?.length) setLiabilities(cloudData.liabilities);
        if (cloudData.equityDetails) setEquityDetails(cloudData.equityDetails);
        if (cloudData.users?.length) setUsers(cloudData.users);
        if (cloudData.supermarketName) setSupermarketName(cloudData.supermarketName);
        if (cloudData.currencySettings) setCurrencySettings(cloudData.currencySettings);
      }
    });

    return () => unsubscribe();
  }, []);

  // Combined data structure
  const currentSupermarketData = useMemo<SupermarketData>(() => ({
    supermarketName,
    products,
    categories,
    customers,
    debtPayments,
    suppliers,
    purchaseOrders,
    purchases: purchaseOrders,
    stockAdjustments: adjustments,
    shiftClosures,
    employees,
    attendance,
    sales,
    expenses,
    transactions,
    accounts,
    fixedAssets,
    liabilities,
    equityDetails,
    users,
    currencySettings,
    messages: []
  }), [
    supermarketName,
    products,
    categories,
    customers,
    debtPayments,
    suppliers,
    purchaseOrders,
    adjustments,
    shiftClosures,
    employees,
    attendance,
    sales,
    expenses,
    transactions,
    accounts,
    fixedAssets,
    liabilities,
    equityDetails,
    users,
    currencySettings
  ]);

  // Persist helper
  const persistData = (updatedData: Partial<SupermarketData>) => {
    const fullData: SupermarketData = {
      ...currentSupermarketData,
      ...updatedData
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fullData));
    saveSupermarketDataToCloud(fullData);
  };

  // Login / Logout
  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    // Role redirection
    if (user.role === 'customer') {
      setActiveTab('customer-portal');
    } else if (user.role === 'cashier') {
      setActiveTab('pos');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setShowSwitchModal(false);
  };

  const handleQuickSwitch = (u: AppUser) => {
    handleLogin(u);
    setShowSwitchModal(false);
  };

  // ----------------------------------------------------
  // BUSINESS LOGIC ACTIONS
  // ----------------------------------------------------

  // POS Sale Complete
  const handleCompleteSale = (sale: SaleTransaction) => {
    // 1. Update product stock quantities
    const updatedProducts = products.map(p => {
      const soldItem = sale.items.find(i => i.productId === p.id);
      if (soldItem) {
        return {
          ...p,
          stockQty: Math.max(0, p.stockQty - soldItem.qty)
        };
      }
      return p;
    });

    // 2. If credit sale, increment customer debt
    let updatedCustomers = customers;
    if (sale.paymentMethod === 'credit' && sale.customerId) {
      updatedCustomers = customers.map(c => {
        if (c.id === sale.customerId) {
          return {
            ...c,
            totalDebt: c.totalDebt + sale.total,
            points: (c.points || 0) + Math.floor(sale.total)
          };
        }
        return c;
      });
    }

    // 3. Record transaction in accounting if not credit
    const newSales = [sale, ...sales];
    let newTransactions = transactions;

    if (sale.paymentMethod !== 'credit') {
      const newTx: FinancialTransaction = {
        id: `TX_${Date.now()}`,
        date: sale.date,
        type: 'income',
        account: sale.accountName || 'Cash Box',
        category: 'POS Daily Sales',
        amount: sale.total,
        reference: sale.receiptNo,
        payerPayee: `${sale.customerName} (POS Iib)`,
        note: `Iibka Rasiidhka #${sale.receiptNo}`,
        status: 'completed',
        createdBy: sale.cashierName
      };
      newTransactions = [newTx, ...transactions];
    }

    setProducts(updatedProducts);
    setCustomers(updatedCustomers);
    setSales(newSales);
    setTransactions(newTransactions);

    persistData({
      products: updatedProducts,
      customers: updatedCustomers,
      sales: newSales,
      transactions: newTransactions
    });
  };

  // Customer Debt Repayment
  const handleRecordDebtPayment = (payment: DebtPayment) => {
    const updatedCustomers = customers.map(c => {
      if (c.id === payment.customerId) {
        return {
          ...c,
          totalDebt: Math.max(0, c.totalDebt - payment.amount)
        };
      }
      return c;
    });

    const newPayments = [payment, ...debtPayments];

    // Record Treasury Transaction
    const newTx: FinancialTransaction = {
      id: `TX_DEBT_${Date.now()}`,
      date: payment.date,
      type: 'income',
      account: payment.account,
      category: 'Customer Debt Repayments',
      amount: payment.amount,
      reference: payment.reference || `DEBT-PAY-${Date.now()}`,
      payerPayee: `${payment.customerName} (Bixinta Daynta)`,
      note: payment.note || 'Bixinta daynta macmiilka',
      status: 'completed',
      createdBy: payment.receivedBy
    };
    const newTransactions = [newTx, ...transactions];

    setCustomers(updatedCustomers);
    setDebtPayments(newPayments);
    setTransactions(newTransactions);

    persistData({
      customers: updatedCustomers,
      debtPayments: newPayments,
      transactions: newTransactions
    });
  };

  // Add Product
  const handleAddProduct = (newProd: Product) => {
    const updated = [newProd, ...products];
    setProducts(updated);
    persistData({ products: updated });
  };

  // Update Product
  const handleUpdateProduct = (updatedProd: Product) => {
    const updated = products.map(p => p.id === updatedProd.id ? updatedProd : p);
    setProducts(updated);
    persistData({ products: updated });
  };

  // Delete Product
  const handleDeleteProduct = (prodId: string) => {
    const updated = products.filter(p => p.id !== prodId);
    setProducts(updated);
    persistData({ products: updated });
  };

  // Add Customer
  const handleAddCustomer = (newCust: Customer) => {
    const updated = [newCust, ...customers];
    setCustomers(updated);
    persistData({ customers: updated });
  };

  // Add Category
  const handleAddCategory = (newCat: Category) => {
    const updated = [...categories, newCat];
    setCategories(updated);
    persistData({ categories: updated });
  };

  // Add Supplier
  const handleAddSupplier = (newSup: Supplier) => {
    const updated = [...suppliers, newSup];
    setSuppliers(updated);
    persistData({ suppliers: updated });
  };

  // Record Purchase Order Delivery
  const handleRecordPurchase = (po: PurchaseOrder) => {
    const updatedPurchases = [po, ...purchaseOrders];

    // If there is balance owed, add to supplier debt
    let updatedSuppliers = suppliers;
    if (po.balance > 0) {
      updatedSuppliers = suppliers.map(s => {
        if (s.id === po.supplierId) {
          return {
            ...s,
            balanceOwed: s.balanceOwed + po.balance
          };
        }
        return s;
      });
    }

    setPurchaseOrders(updatedPurchases);
    setSuppliers(updatedSuppliers);
    persistData({
      purchaseOrders: updatedPurchases,
      suppliers: updatedSuppliers
    });
  };

  // Add Employee
  const handleAddEmployee = (newEmp: Employee) => {
    const updated = [...employees, newEmp];
    setEmployees(updated);
    persistData({ employees: updated });
  };

  // Record Attendance
  const handleRecordAttendance = (att: StaffAttendance) => {
    const existingIndex = attendance.findIndex(a => a.employeeId === att.employeeId && a.date === att.date);
    let updated: StaffAttendance[];
    if (existingIndex >= 0) {
      updated = [...attendance];
      updated[existingIndex] = att;
    } else {
      updated = [att, ...attendance];
    }
    setAttendance(updated);
    persistData({ attendance: updated });
  };

  // Reset sample data
  const handleResetData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setProducts(DEFAULT_PRODUCTS);
    setCategories(DEFAULT_CATEGORIES);
    setCustomers(DEFAULT_CUSTOMERS);
    setSuppliers(DEFAULT_SUPPLIERS);
    setEmployees(DEFAULT_EMPLOYEES);
    setSales(DEFAULT_SALES);
    setExpenses(DEFAULT_EXPENSES);
    setAccounts(DEFAULT_ACCOUNTS);
    setSupermarketName('Xaaji Salaad Supermarket');
    setCurrencySettings(DEFAULT_CURRENCY_SETTINGS);
    persistData(INITIAL_SUPERMARKET_DATA);
  };

  // Reset all financial balances and transactions to $0 ("dhamaan ka dhig 0$")
  const handleResetAllToZero = () => {
    const resetAccounts = accounts.map(acc => ({ ...acc, balance: 0 }));
    const resetCustomers = customers.map(c => ({ ...c, totalDebt: 0 }));
    const resetSuppliers = suppliers.map(s => ({ ...s, balanceOwed: 0 }));

    setAccounts(resetAccounts);
    setCustomers(resetCustomers);
    setSuppliers(resetSuppliers);
    setSales([]);
    setExpenses([]);
    setTransactions([]);
    setDebtPayments([]);
    setPurchaseOrders([]);

    persistData({
      accounts: resetAccounts,
      customers: resetCustomers,
      suppliers: resetSuppliers,
      sales: [],
      expenses: [],
      transactions: [],
      debtPayments: [],
      purchaseOrders: []
    });
  };

  // ----------------------------------------------------
  // ADJUSTMENTS HANDLERS (Loss, Broken, Expired, Damaged)
  // ----------------------------------------------------
  const handleAddAdjustment = (adj: StockAdjustment) => {
    const updatedAdj = [adj, ...adjustments];
    setAdjustments(updatedAdj);

    // Deduct quantity from product stock in warehouse
    const updatedProducts = products.map(p => {
      if (p.id === adj.productId) {
        return {
          ...p,
          stockQty: Math.max(0, p.stockQty - adj.qty)
        };
      }
      return p;
    });
    setProducts(updatedProducts);

    persistData({
      stockAdjustments: updatedAdj,
      products: updatedProducts
    });
  };

  const handleUpdateAdjustment = (adj: StockAdjustment) => {
    const updated = adjustments.map(a => a.id === adj.id ? adj : a);
    setAdjustments(updated);
    persistData({ stockAdjustments: updated });
  };

  const handleDeleteAdjustment = (id: string) => {
    const updated = adjustments.filter(a => a.id !== id);
    setAdjustments(updated);
    persistData({ stockAdjustments: updated });
  };

  // ----------------------------------------------------
  // PURCHASES (SOO GADASHADA) HANDLERS
  // ----------------------------------------------------
  const handleAddPurchaseOrder = (
    po: PurchaseOrder, 
    items?: { productId: string; qty: number; buyPrice: number }[]
  ) => {
    const updatedPO = [po, ...purchaseOrders];
    setPurchaseOrders(updatedPO);

    // Automatically increase product stock qty and update buyPrice
    let updatedProducts = [...products];
    if (items && items.length > 0) {
      updatedProducts = updatedProducts.map(p => {
        const matchingItem = items.find(i => i.productId === p.id);
        if (matchingItem) {
          return {
            ...p,
            stockQty: p.stockQty + matchingItem.qty,
            buyPrice: matchingItem.buyPrice > 0 ? matchingItem.buyPrice : p.buyPrice
          };
        }
        return p;
      });
      setProducts(updatedProducts);
    }

    // If unpaid, record in supplier's balanceOwed
    let updatedSuppliers = [...suppliers];
    if (po.paymentStatus !== 'paid' && po.totalAmount > 0) {
      updatedSuppliers = updatedSuppliers.map(s => {
        if (s.id === po.supplierId || s.name === po.supplierName) {
          return {
            ...s,
            balanceOwed: (s.balanceOwed || 0) + po.totalAmount
          };
        }
        return s;
      });
      setSuppliers(updatedSuppliers);
    }

    persistData({
      purchaseOrders: updatedPO,
      purchases: updatedPO,
      products: updatedProducts,
      suppliers: updatedSuppliers
    });
  };

  const handleUpdatePurchaseOrder = (po: PurchaseOrder) => {
    const updated = purchaseOrders.map(p => p.id === po.id ? po : p);
    setPurchaseOrders(updated);
    persistData({ purchaseOrders: updated, purchases: updated });
  };

  const handleDeletePurchaseOrder = (id: string) => {
    const updated = purchaseOrders.filter(p => p.id !== id);
    setPurchaseOrders(updated);
    persistData({ purchaseOrders: updated, purchases: updated });
  };

  // ----------------------------------------------------
  // SHIFT CLOSURE (CLOSE WORK) HANDLER
  // ----------------------------------------------------
  const handleSaveShiftClosure = (closure: ShiftClosure) => {
    const updated = [closure, ...shiftClosures];
    setShiftClosures(updated);
    persistData({ shiftClosures: updated });
    setShowCloseWorkModal(false);
  };

  // ----------------------------------------------------
  // FACTORY RESET (CLEAR ALL - FAARUQI DHAMMAAN XOGTA)
  // ----------------------------------------------------
  const handleFactoryResetAll = async () => {
    await clearAllSupermarketDataFromCloud();
    setProducts([]);
    setCategories([]);
    setCustomers([]);
    setDebtPayments([]);
    setSuppliers([]);
    setPurchaseOrders([]);
    setEmployees([]);
    setAttendance([]);
    setSales([]);
    setExpenses([]);
    setTransactions([]);
    setAccounts([]);
    setFixedAssets([]);
    setLiabilities([]);
    setAdjustments([]);
    setShiftClosures([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  // If not logged in, show LoginPage
  if (!currentUser) {
    return (
      <LoginPage 
        users={users} 
        onLogin={handleLogin} 
        supermarketName={supermarketName}
        isOnline={isOnline}
      />
    );
  }

  // Render active page
  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <SupermarketDashboard
            products={products}
            sales={sales}
            customers={customers}
            suppliers={suppliers}
            expenses={expenses}
            employees={employees}
            supermarketName={supermarketName}
            currencySettings={currencySettings}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );

      case 'pos':
        return (
          <POSPage
            products={products}
            categories={categories}
            customers={customers}
            accounts={accounts}
            currentUser={currentUser}
            currencySettings={currencySettings}
            onCompleteSale={handleCompleteSale}
            onAddCustomer={handleAddCustomer}
          />
        );

      case 'products':
        return (
          <ProductsPage
            products={products}
            categories={categories}
            suppliers={suppliers}
            currencySettings={currencySettings}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        );

      case 'purchases':
        return (
          <PurchasesPage
            purchases={purchaseOrders}
            suppliers={suppliers}
            products={products}
            accounts={accounts}
            currentUser={currentUser}
            currencySettings={currencySettings}
            onAddPurchase={handleAddPurchaseOrder}
            onUpdatePurchase={handleUpdatePurchaseOrder}
            onDeletePurchase={handleDeletePurchaseOrder}
          />
        );

      case 'adjustments':
        return (
          <StockAdjustmentsPage
            adjustments={adjustments}
            products={products}
            currentUser={currentUser}
            currencySettings={currencySettings}
            onAddAdjustment={handleAddAdjustment}
            onUpdateAdjustment={handleUpdateAdjustment}
            onDeleteAdjustment={handleDeleteAdjustment}
          />
        );

      case 'categories':
        return (
          <CategoriesPage
            categories={categories}
            products={products}
            onAddCategory={handleAddCategory}
          />
        );

      case 'customers':
        return (
          <CustomersDebtPage
            customers={customers}
            debtPayments={debtPayments}
            accounts={accounts}
            currentUser={currentUser}
            onAddCustomer={handleAddCustomer}
            onRecordPayment={handleRecordDebtPayment}
          />
        );

      case 'sales':
        return (
          <SalesHistoryPage
            sales={sales}
          />
        );

      case 'suppliers':
        return (
          <SuppliersPage
            suppliers={suppliers}
            purchases={purchaseOrders}
            products={products}
            onAddSupplier={handleAddSupplier}
            onRecordPurchase={handleRecordPurchase}
          />
        );

      case 'employees':
        return (
          <EmployeesPage
            employees={employees}
            attendance={attendance}
            onAddEmployee={handleAddEmployee}
            onRecordAttendance={handleRecordAttendance}
          />
        );

      case 'accounting':
        return (
          <AccountingPage
            transactions={transactions}
            setTransactions={setTransactions}
            saveTransactions={(txs) => {
              setTransactions(txs);
              persistData({ transactions: txs });
            }}
            accounts={accounts}
            setAccounts={setAccounts}
            saveAccounts={(accs) => {
              setAccounts(accs);
              persistData({ accounts: accs });
            }}
            schoolName={supermarketName}
            currentUser={currentUser}
            fixedAssets={fixedAssets}
            setFixedAssets={setFixedAssets}
            saveFixedAssets={(assets) => {
              setFixedAssets(assets);
              persistData({ fixedAssets: assets });
            }}
            liabilities={liabilities}
            setLiabilities={setLiabilities}
            saveLiabilities={(liabs) => {
              setLiabilities(liabs);
              persistData({ liabilities: liabs });
            }}
            equityDetails={equityDetails}
            setEquityDetails={setEquityDetails}
            saveEquityDetails={(eq) => {
              setEquityDetails(eq);
              persistData({ equityDetails: eq });
            }}
            products={products}
            customers={customers}
            suppliers={suppliers}
            expenses={expenses}
            sales={sales}
          />
        );

      case 'expenses':
        return (
          <ExpensesPage
            expenses={expenses}
            setExpenses={setExpenses}
            saveData={(exps) => {
              setExpenses(exps);
              persistData({ expenses: exps });
            }}
            accounts={accounts}
            transactions={transactions}
            setTransactions={setTransactions}
            saveTransactions={(txs) => {
              setTransactions(txs);
              persistData({ transactions: txs });
            }}
            currentUser={currentUser}
          />
        );

      case 'chat':
        return (
          <SupermarketLiveChat
            currentUser={currentUser}
            customers={customers}
            employees={employees}
            suppliers={suppliers}
            supermarketName={supermarketName}
          />
        );

      case 'customer-portal':
        return (
          <CustomerPortal
            currentUser={currentUser}
            customers={customers}
            sales={sales}
            debtPayments={debtPayments}
            onOpenChat={() => setActiveTab('chat')}
          />
        );

      case 'reports':
        return (
          <ReportsPage
            sales={sales}
            products={products}
            expenses={expenses}
            customers={customers}
            supermarketName={supermarketName}
          />
        );

      case 'settings':
        return (
          <SupermarketSettingsPage
            supermarketData={currentSupermarketData}
            currencySettings={currencySettings}
            onUpdateCurrencySettings={(curr) => {
              setCurrencySettings(curr);
              persistData({ currencySettings: curr });
            }}
            onUpdateData={(partial) => {
              if (partial.supermarketName) setSupermarketName(partial.supermarketName);
              if (partial.currencySettings) setCurrencySettings(partial.currencySettings);
              persistData(partial);
            }}
            onResetData={handleResetData}
            onResetAllToZero={handleResetAllToZero}
            onFactoryResetAll={handleFactoryResetAll}
          />
        );

      default:
        return (
          <SupermarketDashboard
            products={products}
            sales={sales}
            customers={customers}
            suppliers={suppliers}
            expenses={expenses}
            employees={employees}
            supermarketName={supermarketName}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
    }
  };

  const lowStockCount = products.filter(p => p.stockQty <= (p.minAlertQty || p.minStockLevel || 10)).length;

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        supermarketName={supermarketName}
        isOnline={isOnline}
        isSyncing={isSyncing}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchUser={() => setShowSwitchModal(true)}
        onOpenCloseWork={() => setShowCloseWorkModal(true)}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        lowStockCount={lowStockCount}
      />

      {/* Main content wrapper */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs no-print">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              aria-label="Fur Menu-ga"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#042954] hidden sm:inline" />
              <span className="text-xs sm:text-sm font-bold text-slate-900 font-display">
                {supermarketName}
              </span>
              <span className="text-slate-300 hidden sm:inline">&bull;</span>
              <span className="text-xs font-bold text-[#042954] uppercase bg-slate-100 px-2.5 py-0.5 rounded-md hidden sm:inline">
                {activeTab}
              </span>
            </div>
          </div>

          {/* User Controls and Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Close Work / Xir Shaqada Action for Cashier and Admin */}
            {(currentUser.role === 'cashier' || currentUser.role === 'admin') && (
              <button
                onClick={() => setShowCloseWorkModal(true)}
                className="px-3 py-1.5 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-transform active:scale-95"
                title="Xir Shaqada / Close Shift"
              >
                <Clock className="w-4 h-4 text-[#ffae01]" />
                <span className="hidden sm:inline">Xir Shaqada</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('pos')}
              className="px-3 py-1.5 bg-[#ffae01] hover:bg-[#e09900] text-slate-950 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
            >
              <ShoppingCart className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Fur POS</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Live Chat</span>
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => setShowSwitchModal(true)}
                className="px-3 py-1.5 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#ffae01]" />
                <span className="hidden sm:inline">Bedel User</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer"
              title="Ka bax"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-3 sm:p-5 lg:p-6 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Close Work Modal */}
      <CloseWorkModal
        isOpen={showCloseWorkModal}
        currentUser={currentUser}
        sales={sales}
        currencySettings={currencySettings}
        onClose={() => setShowCloseWorkModal(false)}
        onSaveClosure={handleSaveShiftClosure}
      />

      {/* Switch User Modal (Admin only) */}
      {showSwitchModal && currentUser.role === 'admin' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#042954]/5 text-[#042954] rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Bedel User-ka (Switch User)
                  </h3>
                  <p className="text-[11px] text-slate-500">Dooro akoonka aad rabto inaad tijaabiso</p>
                </div>
              </div>
              <button
                onClick={() => setShowSwitchModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {users.map((u) => {
                const isSelected = currentUser?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => handleQuickSwitch(u)}
                    className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#042954] text-[#ffae01] flex items-center justify-center font-bold text-xs shrink-0">
                        {u.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span>{u.fullName || u.username}</span>
                          {isSelected && (
                            <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          User: <strong className="text-slate-700">{u.username}</strong> ({u.role})
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setShowSwitchModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Xir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Live Chat Bubble */}
      {activeTab !== 'chat' && (
        <div className="fixed bottom-5 right-5 z-40 no-print">
          <button
            onClick={() => setActiveTab('chat')}
            className="group flex items-center gap-2.5 bg-[#042954] hover:bg-[#031d3d] text-white px-4 py-3 rounded-full shadow-2xl border-2 border-[#ffae01] transition-all hover:scale-105 cursor-pointer"
            title="Live Chat Help"
          >
            <div className="relative">
              <MessageCircle className="w-5 h-5 text-[#ffae01]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#042954] animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#042954]" />
            </div>
            <span className="text-xs font-bold font-display text-white hidden sm:inline">
              Live Chat
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

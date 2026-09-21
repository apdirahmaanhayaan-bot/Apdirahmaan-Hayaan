import { 
  Product, 
  Category, 
  Customer, 
  Supplier, 
  Employee, 
  FinancialAccount, 
  Expense, 
  SaleTransaction, 
  AppUser, 
  SupermarketMessage,
  FinancialTransaction,
  PurchaseOrder,
  SupermarketData,
  CurrencySettings,
  FixedAsset,
  LiabilityItem,
  EquityDetails
} from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_food', name: 'Raashin & Cunto', description: 'Bariis, Sonkor, Daqiiq, Baasto, Saliid', icon: 'ShoppingBag', color: 'bg-amber-500' },
  { id: 'cat_drinks', name: 'Cabitaanno & Biyo', description: 'Biyo xirxiran, Soodhayaal, Juice-yo', icon: 'Coffee', color: 'bg-blue-500' },
  { id: 'cat_dairy', name: 'Caano & Quraac', description: 'Caano boore, Shaah, Subag, Boorash', icon: 'Milk', color: 'bg-emerald-500' },
  { id: 'cat_cleaning', name: 'Nadiifiyayaal & Dhaqid', description: 'Omo, Sabuun, Dettol, Clorox', icon: 'Sparkles', color: 'bg-purple-500' },
  { id: 'cat_produce', name: 'Qudaar & Khudaar', description: 'Basal, Baradho, Yaanyo, Moos, Tufaax', icon: 'Apple', color: 'bg-green-600' },
  { id: 'cat_snacks', name: 'Macmacaan & Buskud', description: 'Buskud, Shukulaato, Nacnac', icon: 'Cookie', color: 'bg-pink-500' },
  { id: 'cat_household', name: 'Qalabka Guriga', description: 'Qalabka jikada, bacaha, masaxaadda', icon: 'Home', color: 'bg-indigo-500' }
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod_1001',
    barcode: '6001001',
    name: 'Bariis Basmati Qayb Sare (25kg)',
    category: 'Raashin & Cunto',
    buyPrice: 24.00,
    sellPrice: 28.50,
    stockQty: 45,
    minStockLevel: 10,
    unit: 'Kartoon',
    expiryDate: '2027-12-31',
    supplier: 'Shirkadda Al-Najax Foods',
    description: 'Bariis basmati tayo sare leh oo Hindi ah'
  },
  {
    id: 'prod_1002',
    barcode: '6001002',
    name: 'Sonkor Cad Al-Khaleej (50kg)',
    category: 'Raashin & Cunto',
    buyPrice: 38.00,
    sellPrice: 42.00,
    stockQty: 30,
    minStockLevel: 8,
    unit: 'Kartoon',
    expiryDate: '2028-06-30',
    supplier: 'Barwaaqo Wholesale Trading',
    description: 'Sonkor saafi ah oo caddaan ah'
  },
  {
    id: 'prod_1003',
    barcode: '6001003',
    name: 'Saliid Macsar/Cooking Oil (3 Litir)',
    category: 'Raashin & Cunto',
    buyPrice: 5.50,
    sellPrice: 7.00,
    stockQty: 85,
    minStockLevel: 15,
    unit: 'Dhalo',
    expiryDate: '2026-11-15',
    supplier: 'Barwaaqo Wholesale Trading'
  },
  {
    id: 'prod_1004',
    barcode: '6001004',
    name: 'Baasto Salva Italia (500g)',
    category: 'Raashin & Cunto',
    buyPrice: 0.70,
    sellPrice: 1.00,
    stockQty: 140,
    minStockLevel: 25,
    unit: 'Baakidh',
    expiryDate: '2027-08-20',
    supplier: 'Shirkadda Al-Najax Foods'
  },
  {
    id: 'prod_1005',
    barcode: '6001005',
    name: 'Biyo Saafi Mineral Water (0.5L x 12)',
    category: 'Cabitaanno & Biyo',
    buyPrice: 2.20,
    sellPrice: 3.50,
    stockQty: 110,
    minStockLevel: 20,
    unit: 'Kartoon',
    expiryDate: '2027-05-10',
    supplier: 'Biyo Saafi Industries'
  },
  {
    id: 'prod_1006',
    barcode: '6001006',
    name: 'Coca Cola Qabow (330ml Can)',
    category: 'Cabitaanno & Biyo',
    buyPrice: 0.40,
    sellPrice: 0.65,
    stockQty: 95,
    minStockLevel: 24,
    unit: 'Xabo',
    expiryDate: '2026-12-01',
    supplier: 'Coca-Cola Som Bottlers'
  },
  {
    id: 'prod_1007',
    barcode: '6001007',
    name: 'Caano Boore Nido (2.5kg)',
    category: 'Caano & Quraac',
    buyPrice: 19.50,
    sellPrice: 23.00,
    stockQty: 22,
    minStockLevel: 6,
    unit: 'Xabo',
    expiryDate: '2027-04-18',
    supplier: 'Shirkadda Al-Najax Foods'
  },
  {
    id: 'prod_1008',
    barcode: '6001008',
    name: 'Shaah Ceyr Fine Tea (450g)',
    category: 'Caano & Quraac',
    buyPrice: 2.80,
    sellPrice: 3.80,
    stockQty: 60,
    minStockLevel: 12,
    unit: 'Baakidh',
    expiryDate: '2027-09-30',
    supplier: 'Barwaaqo Wholesale Trading'
  },
  {
    id: 'prod_1009',
    barcode: '6001009',
    name: 'Omo Sabuun Dhaqid (3kg)',
    category: 'Nadiifiyayaal & Dhaqid',
    buyPrice: 4.20,
    sellPrice: 5.50,
    stockQty: 48,
    minStockLevel: 10,
    unit: 'Baakidh',
    expiryDate: '2028-01-01',
    supplier: 'Somali Cleaning Supplies'
  },
  {
    id: 'prod_1010',
    barcode: '6001010',
    name: 'Dettol Jeermis Dile Antiseptic (500ml)',
    category: 'Nadiifiyayaal & Dhaqid',
    buyPrice: 3.00,
    sellPrice: 4.20,
    stockQty: 18,
    minStockLevel: 8,
    unit: 'Dhalo',
    expiryDate: '2027-10-15',
    supplier: 'Somali Cleaning Supplies'
  },
  {
    id: 'prod_1011',
    barcode: '6001011',
    name: 'Basal Cas oo Nadiif ah (Kiilo)',
    category: 'Qudaar & Khudaar',
    buyPrice: 0.60,
    sellPrice: 1.00,
    stockQty: 75,
    minStockLevel: 15,
    unit: 'Kg',
    expiryDate: '2026-10-05',
    supplier: 'Suuqa Beeraha Shabelle'
  },
  {
    id: 'prod_1012',
    barcode: '6001012',
    name: 'Baradho Macaan (Kiilo)',
    category: 'Qudaar & Khudaar',
    buyPrice: 0.80,
    sellPrice: 1.20,
    stockQty: 80,
    minStockLevel: 15,
    unit: 'Kg',
    expiryDate: '2026-10-10',
    supplier: 'Suuqa Beeraha Shabelle'
  },
  {
    id: 'prod_1013',
    barcode: '6001013',
    name: 'Buskud Oreo Original (12x)',
    category: 'Macmacaan & Buskud',
    buyPrice: 3.50,
    sellPrice: 4.80,
    stockQty: 40,
    minStockLevel: 10,
    unit: 'Baakidh',
    expiryDate: '2027-02-15',
    supplier: 'Barwaaqo Wholesale Trading'
  },
  {
    id: 'prod_1014',
    barcode: '6001014',
    name: 'Dhalo Caag Biyo Qabaw ah (BPA Free)',
    category: 'Qalabka Guriga',
    buyPrice: 1.80,
    sellPrice: 3.00,
    stockQty: 35,
    minStockLevel: 5,
    unit: 'Xabo',
    expiryDate: '2030-01-01',
    supplier: 'Barwaaqo Wholesale Trading'
  },
  {
    id: 'prod_1015',
    barcode: '6001015',
    name: 'Galeey Shiidan (5kg Baakidh)',
    category: 'Raashin & Cunto',
    buyPrice: 3.20,
    sellPrice: 4.50,
    stockQty: 7, // Low stock alert!
    minStockLevel: 10,
    unit: 'Baakidh',
    expiryDate: '2026-11-20',
    supplier: 'Suuqa Beeraha Shabelle'
  }
];

export const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'cust_01',
    name: 'Xasan Cali Maxamed',
    phone: '+252907112233',
    address: 'Xaafadda Hodan, Muqdisho',
    totalDebt: 0.00,
    creditLimit: 150.00,
    points: 0,
    createdAt: '2026-01-10'
  },
  {
    id: 'cust_02',
    name: 'Faadumo Axmed Jaamac',
    phone: '+252906554433',
    address: 'Wadada Garoonka, Hargeysa',
    totalDebt: 0.00,
    creditLimit: 200.00,
    points: 0,
    createdAt: '2026-02-01'
  },
  {
    id: 'cust_03',
    name: 'Cabdiweli Cumar Xuseen',
    phone: '+252907889900',
    address: 'Xaafadda Bulo Hubey',
    totalDebt: 0.00,
    creditLimit: 250.00,
    points: 0,
    createdAt: '2026-03-12'
  },
  {
    id: 'cust_04',
    name: 'Maryan Yuusuf Nuur',
    phone: '+252906332211',
    address: 'Suuqa Bakaaraha',
    totalDebt: 0.00,
    creditLimit: 100.00,
    points: 0,
    createdAt: '2026-04-05'
  }
];

export const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 'sup_01',
    name: 'Shirkadda Al-Najax Foods',
    company: 'Al-Najax Wholesale Group',
    phone: '+252906112233',
    email: 'sales@alnajax.so',
    address: 'Degaanka Dekadda, Muqdisho',
    balanceOwed: 0.00,
    contactPerson: 'Cali Xaaji Nuur'
  },
  {
    id: 'sup_02',
    name: 'Barwaaqo Wholesale Trading',
    company: 'Barwaaqo Ltd',
    phone: '+252907445566',
    email: 'info@barwaaqo.com',
    address: 'Suuqa Weyn, Boosaaso',
    balanceOwed: 0.00,
    contactPerson: 'Sharmaarke Warsame'
  },
  {
    id: 'sup_03',
    name: 'Biyo Saafi Industries',
    company: 'Saafi Water Bottling Co',
    phone: '+252906778899',
    address: 'Warshadda Biyaha, Hargeysa',
    balanceOwed: 0.00,
    contactPerson: 'Mustafe Cabdillaahi'
  },
  {
    id: 'sup_04',
    name: 'Suuqa Beeraha Shabelle',
    company: 'Shabelle Farm Producers',
    phone: '+252906990011',
    address: 'Afgooye, Shabeellaha Hoose',
    balanceOwed: 0.00,
    contactPerson: 'Cismaan Guuleed'
  }
];

export const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp_01',
    name: 'Maxamed Axmed Cali',
    role: 'cashier',
    roleTitle: 'Qasnajiga Sare (Head Cashier)',
    phone: '+252907123456',
    salary: 280,
    shift: 'Subax (Morning)',
    hireDate: '2025-06-15',
    status: 'active'
  },
  {
    id: 'emp_02',
    name: 'Deeqa Xuseen Shire',
    role: 'cashier',
    roleTitle: 'Qasnaji (Cashier - Shift 2)',
    phone: '+252907654321',
    salary: 260,
    shift: 'Galab (Afternoon)',
    hireDate: '2025-08-01',
    status: 'active'
  },
  {
    id: 'emp_03',
    name: 'Jaamac Cabdi Warsame',
    role: 'inventory_mgr',
    roleTitle: 'Maamulaha Bakhaarka (Stock Controller)',
    phone: '+252906112244',
    salary: 350,
    shift: 'Full Time',
    hireDate: '2025-04-10',
    status: 'active'
  },
  {
    id: 'emp_04',
    name: 'Safiyo Maxamuud Geedi',
    role: 'supervisor',
    roleTitle: 'Kormeere Guud (Floor Supervisor)',
    phone: '+252906998877',
    salary: 320,
    shift: 'Subax (Morning)',
    hireDate: '2025-05-20',
    status: 'active'
  }
];

export const DEFAULT_ACCOUNTS: FinancialAccount[] = [
  {
    id: 'acc_cashbox',
    name: 'Qasnadda Dhexe (Cash Register)',
    bankName: 'Cash Box',
    accountNumber: 'CASH-MAIN-01',
    phoneNumber: '+252906305090',
    initialBalance: 0.00,
    isDefault: true,
    description: 'Lacagta caddaanka ah ee shaashadda POS ka soo xaroota',
    createdAt: '2026-01-01'
  },
  {
    id: 'acc_evc',
    name: 'EVC Plus (Hormuud)',
    bankName: 'EVC Plus',
    accountNumber: '711840',
    phoneNumber: '+252615901122',
    initialBalance: 0.00,
    description: 'Koontada ganacsiga EVC Plus ee macaamiishu ku bixiyaan',
    createdAt: '2026-01-01'
  },
  {
    id: 'acc_zaad',
    name: 'Zaad Service (Telesom)',
    bankName: 'Zaad',
    accountNumber: '411840',
    phoneNumber: '+252634901122',
    initialBalance: 0.00,
    description: 'Koontada ganacsiga Zaad Service',
    createdAt: '2026-01-01'
  },
  {
    id: 'acc_sahal',
    name: 'Sahal (Golis Telecom)',
    bankName: 'Sahal',
    accountNumber: '511840',
    phoneNumber: '+252907901122',
    initialBalance: 0.00,
    description: 'Koontada Sahal ee Puntland',
    createdAt: '2026-01-01'
  },
  {
    id: 'acc_dahabshiil',
    name: 'Dahabshiil Bank',
    bankName: 'Dahabshiil Bank',
    accountNumber: 'DHK-0091244',
    phoneNumber: '+252906305090',
    initialBalance: 0.00,
    description: 'Koontada rasmiga ah ee bangiga shirkadda',
    createdAt: '2026-01-01'
  },
  {
    id: 'acc_salaam',
    name: 'Salaam Somali Bank',
    bankName: 'Salaam Bank',
    accountNumber: 'SSB-552100',
    phoneNumber: '+252615002233',
    initialBalance: 0.00,
    description: 'Koontada keydka iyo heshiisyada shirkadaha',
    createdAt: '2026-01-01'
  }
];

export const DEFAULT_SALES: SaleTransaction[] = [];

export const DEFAULT_EXPENSES: Expense[] = [];

export const DEFAULT_USERS: AppUser[] = [
  {
    id: 'user_manager',
    username: 'admin',
    password: '123',
    role: 'admin',
    fullName: 'Maamulaha Guud (Supermarket Manager)',
    phone: '+252906305090',
    createdAt: '2026-01-01'
  },
  {
    id: 'user_cashier',
    username: 'cashier',
    password: '123',
    role: 'cashier',
    fullName: 'Maxamed Axmed Cali (Qasnaji)',
    phone: '+252907123456',
    createdAt: '2026-01-01'
  },
  {
    id: 'user_inventory',
    username: 'stock',
    password: '123',
    role: 'inventory_mgr',
    fullName: 'Jaamac Cabdi (Maamulaha Bakhaarka)',
    phone: '+252906112244',
    createdAt: '2026-01-01'
  },
  {
    id: 'user_customer',
    username: 'customer',
    password: '123',
    role: 'customer',
    fullName: 'Xasan Cali Maxamed (Macmiil)',
    assignedCustomerId: 'cust_01',
    phone: '+252907112233',
    createdAt: '2026-01-01'
  }
];

export const DEFAULT_MESSAGES: SupermarketMessage[] = [
  {
    id: 'msg_01',
    senderId: 'user_cashier',
    senderName: 'Maxamed Axmed Cali (Qasnaji)',
    senderRole: 'cashier',
    recipientId: 'admin',
    recipientName: 'Maamulaha Guud',
    recipientRole: 'admin',
    message: 'Asc Maamule, rasiidhada POS 2 waraaqihii waa ka dhamaanayaan, fadlan rolls cusub ma heli karnaa?',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    status: 'read'
  },
  {
    id: 'msg_02',
    senderId: 'admin',
    senderName: 'Maamulaha Guud',
    senderRole: 'admin',
    recipientId: 'user_cashier',
    recipientName: 'Maxamed Axmed Cali (Qasnaji)',
    recipientRole: 'cashier',
    message: 'Wcs Maxamed, haa bakhaarka qasnadda hoose waxaa yaalla 5 xabbo oo cusub, hadda ayaan kuu soo dirayaa.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'read'
  },
  {
    id: 'msg_03',
    senderId: 'user_customer',
    senderName: 'Xasan Cali Maxamed (Macmiil)',
    senderRole: 'customer',
    recipientId: 'admin',
    recipientName: 'Maamulaha Guud',
    recipientRole: 'admin',
    message: 'Asc, sonkorta 50kg qiimo dhimis ma leedahay haddii aan 3 kiish iibsado?',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    status: 'read'
  },
  {
    id: 'msg_04',
    senderId: 'admin',
    senderName: 'Maamulaha Guud',
    senderRole: 'admin',
    recipientId: 'user_customer',
    recipientName: 'Xasan Cali Maxamed (Macmiil)',
    recipientRole: 'customer',
    message: 'Wcs mudane Xasan, haa 3 kiish waxaan kuugu xisaabinaynaa $40 halkii kiish! Kusoo dhawoow supermarket-ka.',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    status: 'read'
  }
];

export const DEFAULT_PURCHASE_ORDERS: PurchaseOrder[] = [];

export const DEFAULT_FIXED_ASSETS: FixedAsset[] = [
  {
    id: 'asset_01',
    name: 'Qaboojiyeyaasha Waaweyn ee Hilibka & Caanaha (Commercial Double Chillers)',
    category: 'equipment',
    purchaseDate: '2025-01-15',
    purchaseCost: 3200,
    depreciationRate: 10,
    accumulatedDepreciation: 320,
    currentValue: 2880,
    serialOrTag: 'FRZ-COMM-091',
    location: 'Qaybta Qaboojiyeyaasha (Chilled Dairy)',
    status: 'active',
    notes: 'Qaboojiye laba albaab ah oo nooca Talyaaniga ah'
  },
  {
    id: 'asset_02',
    name: 'Khaanadaha Birta ah ee Alaab-Dhigashada (Supermarket Heavy Duty Shelving)',
    category: 'furniture',
    purchaseDate: '2025-02-01',
    purchaseCost: 2400,
    depreciationRate: 8,
    accumulatedDepreciation: 192,
    currentValue: 2208,
    serialOrTag: 'SHLF-HD-40',
    location: 'Hoolka Dhexe ee Supermarket-ka',
    status: 'active',
    notes: 'Khaanado bir adag ah oo 40 mitir ah'
  },
  {
    id: 'asset_03',
    name: 'Nidaamka POS, Barcode Scanners & Shaashadaha Taabashada',
    category: 'electronics',
    purchaseDate: '2025-03-10',
    purchaseCost: 1800,
    depreciationRate: 15,
    accumulatedDepreciation: 270,
    currentValue: 1530,
    serialOrTag: 'POS-TERM-2025',
    location: 'Qasnadda & Meesha Iibka (Checkout Counter)',
    status: 'active',
    notes: '3 Computer, 3 Thermal Receipt Printers, 3 Barcode Scanners'
  },
  {
    id: 'asset_04',
    name: 'Mootada Gaadiidka / Delivery Bajaj (TVS King)',
    category: 'vehicle',
    purchaseDate: '2025-04-05',
    purchaseCost: 2900,
    depreciationRate: 12,
    accumulatedDepreciation: 348,
    currentValue: 2552,
    serialOrTag: 'DEL-BJ-02',
    location: 'Garaashka Supermarket-ka',
    status: 'active',
    notes: 'Mooto gaar u ah adeegga gaynta guriga (Home Delivery)'
  },
  {
    id: 'asset_05',
    name: 'Matoorka Korontada ee Gurmadka (Perkins 20kVA Silent Generator)',
    category: 'equipment',
    purchaseDate: '2025-01-20',
    purchaseCost: 4500,
    depreciationRate: 10,
    accumulatedDepreciation: 450,
    currentValue: 4050,
    serialOrTag: 'GEN-SLNT-20K',
    location: 'Qolka Korontada Dibadda',
    status: 'active',
    notes: 'Matoor si toos ah u shidma marka korontadu go\'do'
  }
];

export const DEFAULT_LIABILITIES: LiabilityItem[] = [
  {
    id: 'liab_01',
    name: 'Amaahda Qalabka Supermarket (Salaam Bank Murabaha Facility)',
    type: 'bank_loan',
    lenderOrCreditor: 'Salaam African Bank',
    totalAmount: 5000,
    paidAmount: 2000,
    remainingAmount: 3000,
    dueDate: '2026-12-31',
    startDate: '2025-01-01',
    status: 'active',
    notes: 'Bixin bille ah $250 bil kasta'
  },
  {
    id: 'liab_02',
    name: 'Kirada Hore ee Dhismaha (Lease Payable)',
    type: 'short_term_debt',
    lenderOrCreditor: 'Mulkiilaha Dhismaha (Sheikh Axmed)',
    totalAmount: 1200,
    paidAmount: 600,
    remainingAmount: 600,
    dueDate: '2026-06-30',
    startDate: '2026-01-01',
    status: 'active',
    notes: 'Qeybta 2-aad ee kirada sannadlaha'
  }
];

export const DEFAULT_EQUITY: EquityDetails = {
  initialCapital: 25000,
  additionalInvestment: 5000,
  drawings: 1500
};

export const DEFAULT_CURRENCY_SETTINGS: CurrencySettings = {
  primaryCurrency: 'USD',
  etbRate: 130, // 1 USD = 130 ETB
  showDualCurrency: true,
  symbolUSD: '$',
  symbolETB: 'ETB'
};

export const INITIAL_SUPERMARKET_DATA: SupermarketData = {
  supermarketName: 'Xaaji Salaad Supermarket',
  currencySettings: DEFAULT_CURRENCY_SETTINGS,
  products: DEFAULT_PRODUCTS,
  categories: DEFAULT_CATEGORIES,
  customers: DEFAULT_CUSTOMERS,
  debtPayments: [],
  suppliers: DEFAULT_SUPPLIERS,
  purchaseOrders: DEFAULT_PURCHASE_ORDERS,
  employees: DEFAULT_EMPLOYEES,
  attendance: [],
  sales: DEFAULT_SALES,
  expenses: DEFAULT_EXPENSES,
  transactions: [],
  accounts: DEFAULT_ACCOUNTS as any,
  fixedAssets: DEFAULT_FIXED_ASSETS,
  liabilities: DEFAULT_LIABILITIES,
  equityDetails: DEFAULT_EQUITY,
  users: DEFAULT_USERS,
  messages: DEFAULT_MESSAGES
};

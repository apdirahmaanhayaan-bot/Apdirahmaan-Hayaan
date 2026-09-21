export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  stockQty: number;
  minStockLevel?: number;
  minAlertQty?: number;
  unit: string; // 'Xabo', 'Kartoon', 'Kg', 'Litir', 'Baakidh', 'Dhalo'
  expiryDate: string; // YYYY-MM-DD
  supplier?: string;
  supplierId?: string;
  supplierName?: string;
  img?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface SaleCartItem {
  productId: string;
  barcode: string;
  name: string;
  unitPrice: number;
  buyPrice: number;
  qty: number;
  unit: string;
  totalPrice: number;
}

export interface SaleTransaction {
  id: string;
  receiptNo: string;
  date: string;
  time: string;
  cashierId: string;
  cashierName: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: SaleCartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'evc' | 'zaad' | 'sahal' | 'edahab' | 'credit';
  accountName: string;
  paidAmount: number;
  changeAmount: number;
  status: 'completed' | 'credit' | 'refunded';
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  totalDebt: number; // Daynta lagu leeyahay
  creditLimit: number;
  points: number;
  createdAt: string;
}

export interface DebtPayment {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  date: string;
  paymentMethod: string;
  account: string;
  reference?: string;
  receivedBy: string;
  note?: string;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  email?: string;
  address?: string;
  balanceOwed: number; // Lacagta lagu leeyahay supermarket-ka
  contactPerson?: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  itemsCount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'received' | 'pending';
  paymentStatus?: 'paid' | 'partial' | 'unpaid';
  reference?: string;
  note?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'cashier' | 'inventory_mgr' | 'supervisor' | 'cleaner' | 'accountant';
  roleTitle: string;
  phone: string;
  salary: number;
  shift: 'Subax (Morning)' | 'Galab (Afternoon)' | 'Habeen (Night)' | 'Full Time';
  hireDate: string;
  img?: string;
  status: 'active' | 'inactive';
}

export interface StaffAttendance {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave';
}

export interface Expense {
  id?: string;
  name: string;
  amt: number;
  date: string;
  note?: string;
  account?: string;
  accountId?: string;
  category?: string;
}

export type PaymentAccount = 'Zaad' | 'Sahal' | 'EVC Plus' | 'Dahabshiil Bank' | 'Salaam Bank' | 'Cash Box' | string;

export interface FinancialAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  phoneNumber: string;
  initialBalance: number;
  description?: string;
  isDefault?: boolean;
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  account: PaymentAccount | string;
  accountId?: string;
  toAccount?: PaymentAccount | string;
  toAccountId?: string;
  category: string;
  amount: number;
  reference: string;
  payerPayee: string;
  note: string;
  createdBy?: string;
  status: 'completed' | 'pending';
}

export type UserRole = 
  | 'admin' 
  | 'cashier' 
  | 'inventory_mgr' 
  | 'customer' 
  | 'supplier'
  | 'vice_principal_1' 
  | 'vice_principal_2' 
  | 'teacher' 
  | 'parent' 
  | 'student';

export interface AppUser {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  fullName: string;
  name?: string;
  phone?: string;
  assignedCustomerId?: string;
  assignedSubject?: string;
  assignedStudentId?: string;
  createdAt: string;
}

export interface SupermarketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  recipientId: string; // 'admin', user ID, or 'channel_general'
  recipientName: string;
  recipientRole?: UserRole | 'channel';
  channelId?: string;
  subject?: string;
  message: string;
  createdAt: string;
  status?: 'sent' | 'read';
  autoReply?: boolean;
  reactions?: Record<string, string[]>;
}

export interface FixedAsset {
  id: string;
  name: string;
  category: 'equipment' | 'furniture' | 'vehicle' | 'building' | 'electronics' | 'other';
  purchaseDate: string;
  purchaseCost: number;
  depreciationRate: number; // e.g. 10 (%)
  accumulatedDepreciation: number;
  currentValue: number; // purchaseCost - accumulatedDepreciation
  serialOrTag?: string;
  location?: string;
  status: 'active' | 'in_repair' | 'retired' | 'sold';
  notes?: string;
}

export interface LiabilityItem {
  id: string;
  name: string;
  type: 'accounts_payable' | 'bank_loan' | 'short_term_debt' | 'long_term_loan' | 'accrued_expense' | 'other';
  lenderOrCreditor: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate?: string;
  startDate: string;
  status: 'active' | 'paid' | 'overdue';
  notes?: string;
}

export interface EquityDetails {
  initialCapital: number;
  additionalInvestment: number;
  drawings: number;
  retainedEarningsOverride?: number;
}

export interface CurrencySettings {
  primaryCurrency: 'USD' | 'ETB';
  etbRate: number; // 1 USD = X ETB (e.g. 130)
  showDualCurrency: boolean;
  symbolUSD: string;
  symbolETB: string;
}

export type AdjustmentType = 'loss' | 'broken' | 'expired' | 'damaged' | 'correction';

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  type: AdjustmentType;
  qty: number;
  unitPrice: number; // Cost price per unit
  totalLoss: number; // qty * unitPrice
  date: string;
  time?: string;
  recordedBy: string;
  note?: string;
  batchOrLot?: string;
}

export interface ShiftClosure {
  id: string;
  cashierId: string;
  cashierName: string;
  closingDate: string;
  closingTime: string;
  totalSalesExpected: number;
  totalCashExpected: number;
  totalElectronicExpected: number;
  totalCreditExpected: number;
  actualCashHanded: number;
  difference: number; // actualCashHanded - totalCashExpected
  hasFullCash: boolean; // haa / maya
  managerRecipient: string; // recipient manager or treasury
  receiptReference?: string;
  receiptImage?: string; // photo or attachment data
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
}

export interface SupermarketData {
  supermarketName: string;
  tagline?: string;
  phone?: string;
  address?: string;
  currency?: string;
  currencySettings?: CurrencySettings;
  taxRate?: number;
  receiptFooter?: string;
  products: Product[];
  categories: Category[];
  sales: SaleTransaction[];
  customers: Customer[];
  debtPayments: DebtPayment[];
  suppliers: Supplier[];
  purchases?: PurchaseOrder[];
  purchaseOrders?: PurchaseOrder[];
  employees: Employee[];
  attendance: StaffAttendance[];
  expenses: Expense[];
  accounts: any[];
  transactions: FinancialTransaction[];
  fixedAssets?: FixedAsset[];
  liabilities?: LiabilityItem[];
  equityDetails?: EquityDetails;
  users: AppUser[];
  messages: SupermarketMessage[];
  stockAdjustments?: StockAdjustment[];
  shiftClosures?: ShiftClosure[];
  updatedAt?: string;
}

// Backward-compatibility aliases so any temporary imports work
export type TransactionCategory = string;
export type Student = any;
export type Teacher = any;
export type AttendanceRecord = any;
export type ExamResult = any;
export type Schedule = any;
export type SchoolAccount = FinancialAccount;
export type PaymentSubmission = any;
export type ParentMessage = any;
export type SchoolData = SupermarketData;

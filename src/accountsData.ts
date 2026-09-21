import { SchoolAccount, FinancialTransaction } from './types';

export const DEFAULT_ACCOUNTS: SchoolAccount[] = [
  {
    id: 'acc_salaam_evc',
    name: 'Salaam Bank / Hormuud EVC',
    bankName: 'Salaam Bank',
    accountNumber: '411840',
    phoneNumber: '+252906305090',
    initialBalance: 0,
    description: 'Xisaabta Guud ee Supermarket-ka (EVC & Salaam Bank)',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'acc_zaad',
    name: 'Zaad Service (Telesom)',
    bankName: 'Zaad',
    accountNumber: '411840',
    phoneNumber: '+252906305090',
    initialBalance: 0,
    description: 'Lacag-bixinta Zaad Telesom',
    isDefault: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'acc_sahal',
    name: 'Sahal (Golis Telecom)',
    bankName: 'Sahal',
    accountNumber: '411840',
    phoneNumber: '+252906305090',
    initialBalance: 0,
    description: 'Lacag-bixinta Sahal Golis',
    isDefault: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'acc_dahabshiil',
    name: 'Dahabshiil Bank / e-Dahab',
    bankName: 'Dahabshiil Bank',
    accountNumber: '411840',
    phoneNumber: '+252906305090',
    initialBalance: 0,
    description: 'Xisaabta Bangiga Dahabshiil',
    isDefault: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'acc_cashbox',
    name: 'Qasnadda Supermarket-ka (Cash Drawer)',
    bankName: 'Cash Drawer',
    accountNumber: 'CASH-01',
    phoneNumber: '+252906305090',
    initialBalance: 0,
    description: 'Lacagta caddaanka ah ee xafiiska lagu qabto',
    isDefault: false,
    createdAt: new Date().toISOString()
  }
];

export function getAccountBalance(
  account: SchoolAccount,
  transactions: FinancialTransaction[] = []
): {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  movements: FinancialTransaction[];
} {
  let totalIncome = 0;
  let totalExpense = 0;
  const movements: FinancialTransaction[] = [];

  transactions.forEach(tx => {
    const isMainMatch = 
      tx.accountId === account.id || 
      tx.account === account.name || 
      tx.account === account.bankName ||
      (account.id === 'acc_salaam_evc' && (tx.account === 'EVC Plus' || tx.account === 'Salaam Bank'));
      
    const isToMatch = 
      tx.toAccountId === account.id || 
      tx.toAccount === account.name || 
      tx.toAccount === account.bankName;

    if (tx.type === 'income' && isMainMatch) {
      totalIncome += tx.amount;
      movements.push(tx);
    } else if (tx.type === 'expense' && isMainMatch) {
      totalExpense += tx.amount;
      movements.push(tx);
    } else if (tx.type === 'transfer') {
      if (isToMatch) {
        totalIncome += tx.amount;
        movements.push(tx);
      }
      if (isMainMatch) {
        totalExpense += tx.amount;
        movements.push(tx);
      }
    }
  });

  const currentBalance = (account.initialBalance || 0) + totalIncome - totalExpense;
  return {
    currentBalance,
    totalIncome,
    totalExpense,
    movements: movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  };
}

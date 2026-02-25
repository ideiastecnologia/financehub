export interface User {
  id: string;
  email: string;
  fullName: string;
  currency: string;
  dateFormat: string;
  theme: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiration: string;
  user: User;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  currency: string;
  balance: number;
  color: string;
  icon: string;
  isActive: boolean;
}

export interface AccountSummary {
  totalBalance: number;
  totalAccounts: number;
  accounts: Account[];
}

export interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: string;
  budget: number | null;
  parentCategoryId: string | null;
  subCategories: Category[] | null;
}

export interface Transaction {
  id: string;
  accountId: string;
  accountName: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  isRecurring: boolean;
  recurrenceRule: string | null;
  tags: string | null;
  notes: string | null;
  attachmentUrl: string | null;
}

export interface TransactionFilter {
  dateFrom?: string;
  dateTo?: string;
  categoryId?: string;
  accountId?: string;
  type?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page: number;
  pageSize: number;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalTransactions: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
  icon: string;
  status: string;
  progressPercentage: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  month: number;
  year: number;
  plannedAmount: number;
  spentAmount: number;
  progressPercentage: number;
}

export interface BudgetOverview {
  month: number;
  year: number;
  totalPlanned: number;
  totalSpent: number;
  budgets: Budget[];
}

export interface Dashboard {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  previousMonthIncome: number;
  previousMonthExpense: number;
  topCategories: CategoryBreakdown[];
  cashFlow: CashFlow[];
  goals: Goal[];
  budgetProgress: Budget[];
  recentTransactions: Transaction[];
}

export interface CategoryBreakdown {
  categoryName: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
}

export interface CashFlow {
  month: number;
  year: number;
  income: number;
  expense: number;
}

export interface MonthlyReport {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeByCategory: CategoryBreakdown[];
  expenseByCategory: CategoryBreakdown[];
}

export interface YearlyReport {
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyBreakdown: CashFlow[];
}

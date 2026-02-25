import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Account, AccountSummary, Budget, BudgetOverview, Category,
  CategoryBreakdown, Dashboard, Goal, MonthlyReport,
  PagedResult, Transaction, TransactionFilter, TransactionSummary, YearlyReport
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Accounts
  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/accounts`);
  }
  getAccount(id: string): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/accounts/${id}`);
  }
  createAccount(data: Partial<Account>): Observable<Account> {
    return this.http.post<Account>(`${this.apiUrl}/accounts`, data);
  }
  updateAccount(id: string, data: Partial<Account>): Observable<Account> {
    return this.http.put<Account>(`${this.apiUrl}/accounts/${id}`, data);
  }
  deleteAccount(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/accounts/${id}`);
  }
  getAccountSummary(): Observable<AccountSummary> {
    return this.http.get<AccountSummary>(`${this.apiUrl}/accounts/summary`);
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }
  getCategoryTree(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/tree`);
  }
  createCategory(data: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, data);
  }
  updateCategory(id: string, data: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, data);
  }
  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }

  // Transactions
  getTransactions(filter: TransactionFilter): Observable<PagedResult<Transaction>> {
    let params = new HttpParams()
      .set('page', filter.page.toString())
      .set('pageSize', filter.pageSize.toString());
    if (filter.dateFrom) params = params.set('dateFrom', filter.dateFrom);
    if (filter.dateTo) params = params.set('dateTo', filter.dateTo);
    if (filter.categoryId) params = params.set('categoryId', filter.categoryId);
    if (filter.accountId) params = params.set('accountId', filter.accountId);
    if (filter.type) params = params.set('type', filter.type);
    if (filter.minAmount) params = params.set('minAmount', filter.minAmount.toString());
    if (filter.maxAmount) params = params.set('maxAmount', filter.maxAmount.toString());
    if (filter.search) params = params.set('search', filter.search);
    return this.http.get<PagedResult<Transaction>>(`${this.apiUrl}/transactions`, { params });
  }
  createTransaction(data: any): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/transactions`, data);
  }
  updateTransaction(id: string, data: any): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/transactions/${id}`, data);
  }
  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/transactions/${id}`);
  }
  getTransactionSummary(period: string = 'month'): Observable<TransactionSummary> {
    return this.http.get<TransactionSummary>(`${this.apiUrl}/transactions/summary`, { params: { period } });
  }

  // Goals
  getGoals(): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.apiUrl}/goals`);
  }
  createGoal(data: Partial<Goal>): Observable<Goal> {
    return this.http.post<Goal>(`${this.apiUrl}/goals`, data);
  }
  updateGoal(id: string, data: Partial<Goal>): Observable<Goal> {
    return this.http.put<Goal>(`${this.apiUrl}/goals/${id}`, data);
  }
  deleteGoal(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/goals/${id}`);
  }
  contributeToGoal(id: string, amount: number): Observable<Goal> {
    return this.http.post<Goal>(`${this.apiUrl}/goals/${id}/contribute`, { amount });
  }

  // Budgets
  getBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.apiUrl}/budgets`);
  }
  createBudget(data: Partial<Budget>): Observable<Budget> {
    return this.http.post<Budget>(`${this.apiUrl}/budgets`, data);
  }
  updateBudget(id: string, data: any): Observable<Budget> {
    return this.http.put<Budget>(`${this.apiUrl}/budgets/${id}`, data);
  }
  deleteBudget(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/budgets/${id}`);
  }
  getBudgetOverview(month: number, year: number): Observable<BudgetOverview> {
    return this.http.get<BudgetOverview>(`${this.apiUrl}/budgets/overview`, { params: { month, year } });
  }

  // Dashboard
  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.apiUrl}/dashboard`);
  }

  // Reports
  getMonthlyReport(year: number, month: number): Observable<MonthlyReport> {
    return this.http.get<MonthlyReport>(`${this.apiUrl}/reports/monthly`, { params: { year, month } });
  }
  getYearlyReport(year: number): Observable<YearlyReport> {
    return this.http.get<YearlyReport>(`${this.apiUrl}/reports/yearly`, { params: { year } });
  }
  getCategoryBreakdown(period: string = 'month'): Observable<CategoryBreakdown[]> {
    return this.http.get<CategoryBreakdown[]>(`${this.apiUrl}/reports/category-breakdown`, { params: { period } });
  }
}

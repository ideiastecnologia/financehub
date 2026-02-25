import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../core/services/api.service';
import { Transaction, TransactionFilter, PagedResult, Account, Category } from '../../core/models';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, MatCardModule, MatTableModule, MatPaginatorModule,
    MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatChipsModule, MatSnackBarModule,
    MatTooltipModule, MatProgressSpinnerModule, CurrencyBrlPipe
  ],
  template: `
    <div class="page-header">
      <h1>Transacoes</h1>
      <div class="header-actions">
        <button mat-stroked-button (click)="exportCsv()">
          <mat-icon>download</mat-icon> Exportar CSV
        </button>
        <button mat-raised-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> Nova Transacao
        </button>
      </div>
    </div>

    <!-- Filters -->
    <mat-card class="filter-card">
      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Buscar</mat-label>
          <input matInput [(ngModel)]="searchTerm" (keyup.enter)="applyFilters()" placeholder="Descricao ou tag">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Tipo</mat-label>
          <mat-select [(ngModel)]="filterType" (selectionChange)="applyFilters()">
            <mat-option value="">Todos</mat-option>
            <mat-option value="Income">Receita</mat-option>
            <mat-option value="Expense">Despesa</mat-option>
            <mat-option value="Transfer">Transferencia</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Categoria</mat-label>
          <mat-select [(ngModel)]="filterCategory" (selectionChange)="applyFilters()">
            <mat-option value="">Todas</mat-option>
            @for (cat of categories; track cat.id) {
              <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Conta</mat-label>
          <mat-select [(ngModel)]="filterAccount" (selectionChange)="applyFilters()">
            <mat-option value="">Todas</mat-option>
            @for (acc of accounts; track acc.id) {
              <mat-option [value]="acc.id">{{ acc.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>
    </mat-card>

    <!-- Table -->
    <mat-card class="table-card">
      <table mat-table [dataSource]="transactions" class="full-width">
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Data</th>
          <td mat-cell *matCellDef="let t">{{ t.date | date:'dd/MM/yyyy' }}</td>
        </ng-container>
        <ng-container matColumnDef="description">
          <th mat-header-cell *matHeaderCellDef>Descricao</th>
          <td mat-cell *matCellDef="let t">
            <div class="desc-cell">
              <mat-icon [style.color]="t.categoryColor" class="small-icon">{{ t.categoryIcon }}</mat-icon>
              {{ t.description }}
            </div>
          </td>
        </ng-container>
        <ng-container matColumnDef="category">
          <th mat-header-cell *matHeaderCellDef>Categoria</th>
          <td mat-cell *matCellDef="let t">{{ t.categoryName }}</td>
        </ng-container>
        <ng-container matColumnDef="account">
          <th mat-header-cell *matHeaderCellDef>Conta</th>
          <td mat-cell *matCellDef="let t">{{ t.accountName }}</td>
        </ng-container>
        <ng-container matColumnDef="amount">
          <th mat-header-cell *matHeaderCellDef>Valor</th>
          <td mat-cell *matCellDef="let t" [class]="t.type === 'Income' ? 'income-color' : 'expense-color'" style="font-weight:600;">
            {{ t.type === 'Income' ? '+' : '-' }}{{ t.amount | currencyBrl }}
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let t">
            <button mat-icon-button (click)="editTransaction(t)" matTooltip="Editar"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="deleteTransaction(t.id)" matTooltip="Excluir"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
      <mat-paginator [length]="totalCount" [pageSize]="pageSize" [pageSizeOptions]="[10, 20, 50]"
                     (page)="onPage($event)" showFirstLastButtons></mat-paginator>
    </mat-card>

    <!-- Form Dialog -->
    @if (showForm) {
      <div class="form-overlay" (click)="showForm = false">
        <mat-card class="form-card" (click)="$event.stopPropagation()">
          <mat-card-header><mat-card-title>{{ editing ? 'Editar' : 'Nova' }} Transacao</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="saveTransaction()">
              <div class="form-row">
                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>Tipo</mat-label>
                  <mat-select formControlName="type">
                    <mat-option value="Income">Receita</mat-option>
                    <mat-option value="Expense">Despesa</mat-option>
                    <mat-option value="Transfer">Transferencia</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>Valor</mat-label>
                  <input matInput formControlName="amount" type="number" step="0.01">
                  <span matPrefix>R$&nbsp;</span>
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Descricao</mat-label>
                <input matInput formControlName="description">
              </mat-form-field>
              <div class="form-row">
                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>Conta</mat-label>
                  <mat-select formControlName="accountId">
                    @for (acc of accounts; track acc.id) {
                      <mat-option [value]="acc.id">{{ acc.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>Categoria</mat-label>
                  <mat-select formControlName="categoryId">
                    @for (cat of categories; track cat.id) {
                      <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Data</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="date">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tags (separadas por virgula)</mat-label>
                <input matInput formControlName="tags">
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Notas</mat-label>
                <textarea matInput formControlName="notes" rows="2"></textarea>
              </mat-form-field>
              <div class="form-actions">
                <button mat-button type="button" (click)="showForm = false">Cancelar</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Salvar</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .header-actions { display: flex; gap: 8px; }
    .filter-card { margin-bottom: 20px; padding: 16px; }
    .filters { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-start; }
    .filters mat-form-field { flex: 1; min-width: 150px; }
    .table-card { overflow: hidden; }
    table { width: 100%; }
    .desc-cell { display: flex; align-items: center; gap: 8px; }
    .small-icon { font-size: 18px; width: 18px; height: 18px; }
    .form-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: flex; justify-content: center;
      align-items: center; z-index: 1000; overflow-y: auto; padding: 20px;
    }
    .form-card { max-width: 560px; width: 100%; padding: 24px; }
    .full-width { width: 100%; }
    .form-row { display: flex; gap: 12px; }
    .flex-1 { flex: 1; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
    @media (max-width: 600px) {
      .form-row { flex-direction: column; gap: 0; }
      .filters { flex-direction: column; }
    }
  `]
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  accounts: Account[] = [];
  categories: Category[] = [];
  displayedColumns = ['date', 'description', 'category', 'account', 'amount', 'actions'];
  totalCount = 0;
  pageSize = 20;
  currentPage = 1;
  searchTerm = '';
  filterType = '';
  filterCategory = '';
  filterAccount = '';
  showForm = false;
  editing = false;
  editingId = '';
  form: FormGroup;

  constructor(private apiService: ApiService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      type: ['Expense', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      accountId: ['', Validators.required],
      categoryId: ['', Validators.required],
      date: [new Date(), Validators.required],
      tags: [''],
      notes: [''],
      isRecurring: [false],
      recurrenceRule: ['']
    });
  }

  ngOnInit(): void {
    this.loadTransactions();
    this.apiService.getAccounts().subscribe(a => this.accounts = a);
    this.apiService.getCategories().subscribe(c => this.categories = c);
  }

  loadTransactions(): void {
    const filter: TransactionFilter = {
      page: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm || undefined,
      type: this.filterType || undefined,
      categoryId: this.filterCategory || undefined,
      accountId: this.filterAccount || undefined,
    };
    this.apiService.getTransactions(filter).subscribe(result => {
      this.transactions = result.items;
      this.totalCount = result.totalCount;
    });
  }

  applyFilters(): void { this.currentPage = 1; this.loadTransactions(); }

  onPage(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadTransactions();
  }

  openForm(): void {
    this.editing = false;
    this.form.reset({ type: 'Expense', amount: 0, date: new Date(), isRecurring: false });
    this.showForm = true;
  }

  editTransaction(t: Transaction): void {
    this.editing = true; this.editingId = t.id;
    this.form.patchValue({ ...t, date: new Date(t.date) });
    this.showForm = true;
  }

  saveTransaction(): void {
    if (this.form.invalid) return;
    const data = { ...this.form.value, date: this.form.value.date.toISOString() };
    const obs = this.editing
      ? this.apiService.updateTransaction(this.editingId, data)
      : this.apiService.createTransaction(data);
    obs.subscribe(() => {
      this.showForm = false;
      this.loadTransactions();
      this.snackBar.open('Transacao salva!', 'Fechar', { duration: 3000 });
    });
  }

  deleteTransaction(id: string): void {
    if (confirm('Deseja excluir esta transacao?')) {
      this.apiService.deleteTransaction(id).subscribe(() => {
        this.loadTransactions();
        this.snackBar.open('Transacao excluida', 'Fechar', { duration: 3000 });
      });
    }
  }

  exportCsv(): void {
    const headers = 'Data,Descricao,Categoria,Conta,Tipo,Valor\n';
    const rows = this.transactions.map(t =>
      `${t.date},${t.description},${t.categoryName},${t.accountName},${t.type},${t.amount}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'transacoes.csv'; a.click();
    window.URL.revokeObjectURL(url);
  }
}

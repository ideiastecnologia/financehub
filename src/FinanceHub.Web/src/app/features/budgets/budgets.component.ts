import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';
import { Budget, BudgetOverview, Category } from '../../core/models';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule,
    MatProgressBarModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, CurrencyBrlPipe
  ],
  template: `
    <div class="page-header">
      <h1>Orcamentos</h1>
      <div class="header-actions">
        <button mat-stroked-button (click)="changeMonth(-1)"><mat-icon>chevron_left</mat-icon></button>
        <span class="month-label">{{ monthNames[selectedMonth - 1] }} {{ selectedYear }}</span>
        <button mat-stroked-button (click)="changeMonth(1)"><mat-icon>chevron_right</mat-icon></button>
        <button mat-raised-button color="primary" (click)="openForm()"><mat-icon>add</mat-icon> Novo</button>
      </div>
    </div>

    @if (overview) {
      <div class="card-grid" style="grid-template-columns: 1fr 1fr 1fr;">
        <mat-card class="stat-card">
          <div class="stat-label">Total Planejado</div>
          <div class="stat-value">{{ overview.totalPlanned | currencyBrl }}</div>
        </mat-card>
        <mat-card class="stat-card">
          <div class="stat-label">Total Gasto</div>
          <div class="stat-value expense-color">{{ overview.totalSpent | currencyBrl }}</div>
        </mat-card>
        <mat-card class="stat-card">
          <div class="stat-label">Disponivel</div>
          <div class="stat-value" [class]="(overview.totalPlanned - overview.totalSpent) >= 0 ? 'income-color' : 'expense-color'">
            {{ (overview.totalPlanned - overview.totalSpent) | currencyBrl }}
          </div>
        </mat-card>
      </div>

      <div class="budgets-list">
        @for (b of overview.budgets; track b.id) {
          <mat-card class="budget-card">
            <div class="budget-header">
              <div class="budget-info">
                <mat-icon [style.color]="b.categoryColor">{{ b.categoryIcon }}</mat-icon>
                <span class="budget-name">{{ b.categoryName }}</span>
              </div>
              <div class="budget-amounts">
                <span [class]="b.progressPercentage > 100 ? 'expense-color' : ''">{{ b.spentAmount | currencyBrl }}</span>
                <span class="budget-separator">/</span>
                <span>{{ b.plannedAmount | currencyBrl }}</span>
              </div>
            </div>
            <mat-progress-bar
              [value]="b.progressPercentage > 100 ? 100 : b.progressPercentage"
              [color]="b.progressPercentage > 100 ? 'warn' : b.progressPercentage > 80 ? 'accent' : 'primary'"
            ></mat-progress-bar>
            <div class="budget-footer">
              <span [class]="b.progressPercentage > 100 ? 'budget-danger' : b.progressPercentage > 80 ? 'budget-warning' : ''">
                {{ b.progressPercentage }}%
                @if (b.progressPercentage > 100) { - Estourado! }
                @else if (b.progressPercentage > 80) { - Atencao! }
              </span>
              <button mat-icon-button (click)="deleteBudget(b.id)"><mat-icon>delete</mat-icon></button>
            </div>
          </mat-card>
        }
      </div>
    }

    @if (showForm) {
      <div class="form-overlay" (click)="showForm = false">
        <mat-card class="form-card" (click)="$event.stopPropagation()">
          <mat-card-header><mat-card-title>Novo Orcamento</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="saveBudget()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Categoria</mat-label>
                <mat-select formControlName="categoryId">
                  @for (cat of categories; track cat.id) {
                    <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Valor Planejado</mat-label>
                <input matInput formControlName="plannedAmount" type="number">
                <span matPrefix>R$&nbsp;</span>
              </mat-form-field>
              <div class="form-actions">
                <button mat-button type="button" (click)="showForm = false">Cancelar</button>
                <button mat-raised-button color="primary" type="submit">Salvar</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .header-actions { display: flex; align-items: center; gap: 8px; }
    .month-label { font-size: 16px; font-weight: 500; min-width: 140px; text-align: center; }
    .budgets-list { display: flex; flex-direction: column; gap: 12px; }
    .budget-card { padding: 20px; }
    .budget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .budget-info { display: flex; align-items: center; gap: 12px; }
    .budget-name { font-weight: 500; font-size: 16px; }
    .budget-amounts { font-size: 14px; }
    .budget-separator { margin: 0 4px; color: #999; }
    .budget-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 13px; }
    .form-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .form-card { max-width: 420px; width: 90%; padding: 24px; }
    .full-width { width: 100%; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
    .stat-label { font-size: 13px; color: #666; }
    .stat-value { font-size: 22px; font-weight: 600; }
  `]
})
export class BudgetsComponent implements OnInit {
  overview: BudgetOverview | null = null;
  categories: Category[] = [];
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  monthNames = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  showForm = false;
  form: FormGroup;

  constructor(private apiService: ApiService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      categoryId: ['', Validators.required],
      plannedAmount: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.load();
    this.apiService.getCategories().subscribe(c => this.categories = c.filter(x => x.type === 'Expense'));
  }

  load(): void {
    this.apiService.getBudgetOverview(this.selectedMonth, this.selectedYear).subscribe(o => this.overview = o);
  }

  changeMonth(delta: number): void {
    this.selectedMonth += delta;
    if (this.selectedMonth > 12) { this.selectedMonth = 1; this.selectedYear++; }
    if (this.selectedMonth < 1) { this.selectedMonth = 12; this.selectedYear--; }
    this.load();
  }

  openForm(): void { this.form.reset(); this.showForm = true; }

  saveBudget(): void {
    if (this.form.invalid) return;
    const data = { ...this.form.value, month: this.selectedMonth, year: this.selectedYear };
    this.apiService.createBudget(data).subscribe(() => {
      this.showForm = false; this.load();
      this.snackBar.open('Orcamento criado!', 'Fechar', { duration: 3000 });
    });
  }

  deleteBudget(id: string): void {
    if (confirm('Excluir orcamento?')) {
      this.apiService.deleteBudget(id).subscribe(() => { this.load(); this.snackBar.open('Orcamento excluido', 'Fechar', { duration: 3000 }); });
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ApiService } from '../../core/services/api.service';
import { MonthlyReport, YearlyReport, CategoryBreakdown } from '../../core/models';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule,
    MatTabsModule, MatTableModule, MatSelectModule, MatFormFieldModule,
    NgChartsModule, CurrencyBrlPipe
  ],
  template: `
    <div class="page-header"><h1>Relatorios</h1></div>

    <mat-tab-group animationDuration="200ms">
      <!-- Monthly -->
      <mat-tab label="Mensal">
        <div class="tab-content">
          <div class="report-controls">
            <button mat-stroked-button (click)="changeReportMonth(-1)"><mat-icon>chevron_left</mat-icon></button>
            <span class="month-label">{{ monthNames[reportMonth - 1] }} {{ reportYear }}</span>
            <button mat-stroked-button (click)="changeReportMonth(1)"><mat-icon>chevron_right</mat-icon></button>
          </div>
          @if (monthlyReport) {
            <div class="card-grid" style="grid-template-columns: 1fr 1fr 1fr;">
              <mat-card class="stat-card">
                <div class="stat-label">Receitas</div>
                <div class="stat-value income-color">{{ monthlyReport.totalIncome | currencyBrl }}</div>
              </mat-card>
              <mat-card class="stat-card">
                <div class="stat-label">Despesas</div>
                <div class="stat-value expense-color">{{ monthlyReport.totalExpense | currencyBrl }}</div>
              </mat-card>
              <mat-card class="stat-card">
                <div class="stat-label">Saldo</div>
                <div class="stat-value" [class]="monthlyReport.balance >= 0 ? 'income-color' : 'expense-color'">
                  {{ monthlyReport.balance | currencyBrl }}
                </div>
              </mat-card>
            </div>
            <div class="charts-grid">
              <mat-card>
                <mat-card-header><mat-card-title>Despesas por Categoria</mat-card-title></mat-card-header>
                <mat-card-content>
                  <table mat-table [dataSource]="monthlyReport.expenseByCategory" class="full-width">
                    <ng-container matColumnDef="category">
                      <th mat-header-cell *matHeaderCellDef>Categoria</th>
                      <td mat-cell *matCellDef="let c">
                        <div style="display:flex;align-items:center;gap:8px;">
                          <mat-icon [style.color]="c.color" style="font-size:18px;width:18px;height:18px;">{{ c.icon }}</mat-icon>
                          {{ c.categoryName }}
                        </div>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="amount">
                      <th mat-header-cell *matHeaderCellDef>Valor</th>
                      <td mat-cell *matCellDef="let c">{{ c.amount | currencyBrl }}</td>
                    </ng-container>
                    <ng-container matColumnDef="percentage">
                      <th mat-header-cell *matHeaderCellDef>%</th>
                      <td mat-cell *matCellDef="let c">{{ c.percentage }}%</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="['category','amount','percentage']"></tr>
                    <tr mat-row *matRowDef="let row; columns: ['category','amount','percentage'];"></tr>
                  </table>
                </mat-card-content>
              </mat-card>
              <mat-card>
                <mat-card-header><mat-card-title>Distribuicao</mat-card-title></mat-card-header>
                <mat-card-content>
                  <div class="chart-container">
                    <canvas baseChart [datasets]="monthlyChartData" [labels]="monthlyChartLabels" [options]="pieOptions" type="doughnut"></canvas>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          }
        </div>
      </mat-tab>

      <!-- Yearly -->
      <mat-tab label="Anual">
        <div class="tab-content">
          <div class="report-controls">
            <button mat-stroked-button (click)="changeYear(-1)"><mat-icon>chevron_left</mat-icon></button>
            <span class="month-label">{{ reportYearOnly }}</span>
            <button mat-stroked-button (click)="changeYear(1)"><mat-icon>chevron_right</mat-icon></button>
          </div>
          @if (yearlyReport) {
            <div class="card-grid" style="grid-template-columns: 1fr 1fr 1fr;">
              <mat-card class="stat-card">
                <div class="stat-label">Receitas Anuais</div>
                <div class="stat-value income-color">{{ yearlyReport.totalIncome | currencyBrl }}</div>
              </mat-card>
              <mat-card class="stat-card">
                <div class="stat-label">Despesas Anuais</div>
                <div class="stat-value expense-color">{{ yearlyReport.totalExpense | currencyBrl }}</div>
              </mat-card>
              <mat-card class="stat-card">
                <div class="stat-label">Saldo Anual</div>
                <div class="stat-value" [class]="yearlyReport.balance >= 0 ? 'income-color' : 'expense-color'">
                  {{ yearlyReport.balance | currencyBrl }}
                </div>
              </mat-card>
            </div>
            <mat-card>
              <mat-card-content>
                <div class="chart-container" style="height:400px;">
                  <canvas baseChart [datasets]="yearlyChartData" [labels]="yearlyChartLabels" [options]="barOptions" type="bar"></canvas>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </mat-tab>

      <!-- Category Breakdown -->
      <mat-tab label="Por Categoria">
        <div class="tab-content">
          <mat-card>
            <mat-card-content>
              @for (cat of categoryBreakdown; track cat.categoryName) {
                <div class="breakdown-item">
                  <div class="breakdown-info">
                    <mat-icon [style.color]="cat.color">{{ cat.icon }}</mat-icon>
                    <span>{{ cat.categoryName }}</span>
                  </div>
                  <div class="breakdown-bar">
                    <div class="bar-fill" [style.width.%]="cat.percentage" [style.background]="cat.color"></div>
                  </div>
                  <div class="breakdown-values">
                    <span>{{ cat.amount | currencyBrl }}</span>
                    <span class="percentage">{{ cat.percentage }}%</span>
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [`
    .tab-content { padding: 20px 0; }
    .report-controls { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
    .month-label { font-size: 16px; font-weight: 500; min-width: 140px; text-align: center; }
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
    .stat-label { font-size: 13px; color: #666; }
    .stat-value { font-size: 22px; font-weight: 600; }
    .full-width { width: 100%; }
    .breakdown-item { display: flex; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid #eee; }
    .breakdown-info { display: flex; align-items: center; gap: 8px; min-width: 150px; }
    .breakdown-bar { flex: 1; height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
    .breakdown-values { min-width: 120px; text-align: right; }
    .percentage { margin-left: 8px; color: #666; }
    @media (max-width: 768px) { .charts-grid { grid-template-columns: 1fr; } }
  `]
})
export class ReportsComponent implements OnInit {
  monthlyReport: MonthlyReport | null = null;
  yearlyReport: YearlyReport | null = null;
  categoryBreakdown: CategoryBreakdown[] = [];
  reportMonth = new Date().getMonth() + 1;
  reportYear = new Date().getFullYear();
  reportYearOnly = new Date().getFullYear();
  monthNames = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  monthlyChartLabels: string[] = [];
  monthlyChartData: ChartConfiguration<'doughnut'>['data']['datasets'] = [];
  yearlyChartLabels: string[] = [];
  yearlyChartData: ChartConfiguration<'bar'>['data']['datasets'] = [];

  pieOptions: ChartConfiguration<'doughnut'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };
  barOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void { this.loadMonthly(); this.loadYearly(); this.loadCategoryBreakdown(); }

  loadMonthly(): void {
    this.apiService.getMonthlyReport(this.reportYear, this.reportMonth).subscribe(r => {
      this.monthlyReport = r;
      this.monthlyChartLabels = r.expenseByCategory.map(c => c.categoryName);
      this.monthlyChartData = [{ data: r.expenseByCategory.map(c => c.amount), backgroundColor: r.expenseByCategory.map(c => c.color) }];
    });
  }

  loadYearly(): void {
    this.apiService.getYearlyReport(this.reportYearOnly).subscribe(r => {
      this.yearlyReport = r;
      this.yearlyChartLabels = r.monthlyBreakdown.map(m => this.monthNames[m.month - 1].substring(0, 3));
      this.yearlyChartData = [
        { data: r.monthlyBreakdown.map(m => m.income), label: 'Receitas', backgroundColor: '#4CAF50' },
        { data: r.monthlyBreakdown.map(m => m.expense), label: 'Despesas', backgroundColor: '#F44336' }
      ];
    });
  }

  loadCategoryBreakdown(): void {
    this.apiService.getCategoryBreakdown('month').subscribe(c => this.categoryBreakdown = c);
  }

  changeReportMonth(delta: number): void {
    this.reportMonth += delta;
    if (this.reportMonth > 12) { this.reportMonth = 1; this.reportYear++; }
    if (this.reportMonth < 1) { this.reportMonth = 12; this.reportYear--; }
    this.loadMonthly();
  }

  changeYear(delta: number): void {
    this.reportYearOnly += delta;
    this.loadYearly();
  }
}

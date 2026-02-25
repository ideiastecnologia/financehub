import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ApiService } from '../../core/services/api.service';
import { SignalRService } from '../../core/services/signalr.service';
import { Dashboard } from '../../core/models';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule, MatListModule, MatChipsModule, NgChartsModule, CurrencyBrlPipe],
  template: `
    <div class="page-header">
      <h1>Dashboard</h1>
    </div>

    @if (dashboard) {
      <!-- Summary Cards -->
      <div class="card-grid">
        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #E3F2FD;"><mat-icon style="color: #1976D2;">account_balance_wallet</mat-icon></div>
            <div class="stat-info">
              <span class="stat-label">Saldo Total</span>
              <span class="stat-value">{{ dashboard.totalBalance | currencyBrl }}</span>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon income-bg"><mat-icon class="income-color">trending_up</mat-icon></div>
            <div class="stat-info">
              <span class="stat-label">Receitas do Mes</span>
              <span class="stat-value income-color">{{ dashboard.monthlyIncome | currencyBrl }}</span>
              <span class="stat-variation" [class]="getVariationClass(dashboard.monthlyIncome, dashboard.previousMonthIncome)">
                {{ getVariation(dashboard.monthlyIncome, dashboard.previousMonthIncome) }}
              </span>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon expense-bg"><mat-icon class="expense-color">trending_down</mat-icon></div>
            <div class="stat-info">
              <span class="stat-label">Despesas do Mes</span>
              <span class="stat-value expense-color">{{ dashboard.monthlyExpense | currencyBrl }}</span>
              <span class="stat-variation" [class]="getVariationClass(dashboard.previousMonthExpense, dashboard.monthlyExpense)">
                {{ getVariation(dashboard.monthlyExpense, dashboard.previousMonthExpense) }}
              </span>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Charts -->
      <div class="charts-grid">
        <mat-card class="chart-card">
          <mat-card-header><mat-card-title>Fluxo de Caixa - Ultimos 6 Meses</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="chart-container">
              <canvas baseChart [datasets]="cashFlowData" [labels]="cashFlowLabels" [options]="lineChartOptions" type="line"></canvas>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header><mat-card-title>Despesas por Categoria</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="chart-container">
              <canvas baseChart [datasets]="categoryData" [labels]="categoryLabels" [options]="pieChartOptions" type="doughnut"></canvas>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Bottom Section -->
      <div class="bottom-grid">
        <!-- Recent Transactions -->
        <mat-card>
          <mat-card-header><mat-card-title>Ultimas Transacoes</mat-card-title></mat-card-header>
          <mat-card-content>
            <mat-list>
              @for (t of dashboard.recentTransactions; track t.id) {
                <mat-list-item>
                  <mat-icon matListItemIcon [style.color]="t.categoryColor">{{ t.categoryIcon }}</mat-icon>
                  <span matListItemTitle>{{ t.description }}</span>
                  <span matListItemLine>{{ t.categoryName }} - {{ t.date | date:'dd/MM/yyyy' }}</span>
                  <span class="transaction-amount" [class]="t.type === 'Income' ? 'income-color' : 'expense-color'">
                    {{ t.type === 'Income' ? '+' : '-' }}{{ t.amount | currencyBrl }}
                  </span>
                </mat-list-item>
              }
            </mat-list>
          </mat-card-content>
        </mat-card>

        <!-- Goals -->
        <mat-card>
          <mat-card-header><mat-card-title>Metas</mat-card-title></mat-card-header>
          <mat-card-content>
            @for (goal of dashboard.goals; track goal.id) {
              <div class="goal-item">
                <div class="goal-header">
                  <div class="goal-name">
                    <mat-icon [style.color]="goal.color">{{ goal.icon }}</mat-icon>
                    <span>{{ goal.name }}</span>
                  </div>
                  <span class="goal-percent">{{ goal.progressPercentage }}%</span>
                </div>
                <mat-progress-bar [value]="goal.progressPercentage" [color]="goal.progressPercentage >= 100 ? 'primary' : 'accent'"></mat-progress-bar>
                <div class="goal-amounts">
                  <span>{{ goal.currentAmount | currencyBrl }}</span>
                  <span>{{ goal.targetAmount | currencyBrl }}</span>
                </div>
              </div>
            }
          </mat-card-content>
        </mat-card>
      </div>
    } @else {
      <!-- Loading Skeleton -->
      <div class="card-grid">
        @for (i of [1,2,3]; track i) {
          <mat-card class="stat-card"><div class="skeleton" style="height:80px;"></div></mat-card>
        }
      </div>
    }
  `,
  styles: [`
    .stat-content { display: flex; align-items: center; gap: 16px; }
    .stat-icon { padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-label { font-size: 13px; color: #666; }
    .stat-value { font-size: 22px; font-weight: 600; }
    .stat-variation { font-size: 12px; margin-top: 2px; }
    .variation-up { color: #4CAF50; }
    .variation-down { color: #F44336; }
    .charts-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; margin-bottom: 24px; }
    .chart-card { padding: 16px; }
    .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .transaction-amount { margin-left: auto; font-weight: 600; white-space: nowrap; }
    .goal-item { margin-bottom: 20px; }
    .goal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .goal-name { display: flex; align-items: center; gap: 8px; }
    .goal-percent { font-weight: 600; color: #666; }
    .goal-amounts { display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 4px; }
    @media (max-width: 900px) {
      .charts-grid, .bottom-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  dashboard: Dashboard | null = null;
  cashFlowLabels: string[] = [];
  cashFlowData: ChartConfiguration<'line'>['data']['datasets'] = [];
  categoryLabels: string[] = [];
  categoryData: ChartConfiguration<'doughnut'>['data']['datasets'] = [];

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true } }
  };

  pieChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  constructor(private apiService: ApiService, private signalR: SignalRService) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.signalR.transactionCreated$.subscribe(() => this.loadDashboard());
  }

  loadDashboard(): void {
    this.apiService.getDashboard().subscribe(data => {
      this.dashboard = data;
      this.setupCharts(data);
    });
  }

  setupCharts(data: Dashboard): void {
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    this.cashFlowLabels = data.cashFlow.map(c => months[c.month - 1]);
    this.cashFlowData = [
      { data: data.cashFlow.map(c => c.income), label: 'Receitas', borderColor: '#4CAF50', backgroundColor: 'rgba(76,175,80,0.1)', fill: true, tension: 0.4 },
      { data: data.cashFlow.map(c => c.expense), label: 'Despesas', borderColor: '#F44336', backgroundColor: 'rgba(244,67,54,0.1)', fill: true, tension: 0.4 }
    ];
    this.categoryLabels = data.topCategories.map(c => c.categoryName);
    this.categoryData = [{
      data: data.topCategories.map(c => c.amount),
      backgroundColor: data.topCategories.map(c => c.color)
    }];
  }

  getVariation(current: number, previous: number): string {
    if (previous === 0) return 'N/A';
    const pct = ((current - previous) / previous * 100).toFixed(1);
    return `${+pct > 0 ? '+' : ''}${pct}% vs mes anterior`;
  }

  getVariationClass(current: number, previous: number): string {
    return current >= previous ? 'stat-variation variation-up' : 'stat-variation variation-down';
  }
}

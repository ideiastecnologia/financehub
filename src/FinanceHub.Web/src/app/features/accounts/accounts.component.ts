import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';
import { Account, AccountSummary } from '../../core/models';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule,
    MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, CurrencyBrlPipe
  ],
  template: `
    <div class="page-header">
      <h1>Contas</h1>
      <button mat-raised-button color="primary" (click)="openForm()">
        <mat-icon>add</mat-icon> Nova Conta
      </button>
    </div>

    @if (summary) {
      <mat-card class="stat-card total-card">
        <div class="stat-content">
          <mat-icon style="font-size: 36px; color: #1976D2;">account_balance_wallet</mat-icon>
          <div>
            <div class="stat-label">Saldo Total</div>
            <div class="stat-value">{{ summary.totalBalance | currencyBrl }}</div>
          </div>
        </div>
      </mat-card>
    }

    <div class="card-grid" style="margin-top: 20px;">
      @for (account of accounts; track account.id) {
        <mat-card class="stat-card account-card" [style.border-left]="'4px solid ' + account.color">
          <div class="account-header">
            <div class="account-info">
              <mat-icon [style.color]="account.color">{{ account.icon }}</mat-icon>
              <div>
                <div class="account-name">{{ account.name }}</div>
                <div class="account-type">{{ getTypeLabel(account.type) }}</div>
              </div>
            </div>
            <div class="account-actions">
              <button mat-icon-button (click)="editAccount(account)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="deleteAccount(account.id)"><mat-icon>delete</mat-icon></button>
            </div>
          </div>
          <div class="account-balance" [class]="account.balance >= 0 ? 'income-color' : 'expense-color'">
            {{ account.balance | currencyBrl }}
          </div>
        </mat-card>
      }
    </div>

    @if (showForm) {
      <div class="form-overlay" (click)="showForm = false">
        <mat-card class="form-card" (click)="$event.stopPropagation()">
          <mat-card-header><mat-card-title>{{ editing ? 'Editar' : 'Nova' }} Conta</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="saveAccount()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nome</mat-label>
                <input matInput formControlName="name">
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tipo</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="Checking">Conta Corrente</mat-option>
                  <mat-option value="Savings">Poupanca</mat-option>
                  <mat-option value="CreditCard">Cartao de Credito</mat-option>
                  <mat-option value="Investment">Investimento</mat-option>
                  <mat-option value="Cash">Dinheiro</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Moeda</mat-label>
                <input matInput formControlName="currency" maxlength="3">
              </mat-form-field>
              @if (!editing) {
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Saldo Inicial</mat-label>
                  <input matInput formControlName="balance" type="number">
                </mat-form-field>
              }
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Cor</mat-label>
                <input matInput formControlName="color" type="color">
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
    .total-card { margin-bottom: 8px; }
    .stat-content { display: flex; align-items: center; gap: 16px; padding: 8px; }
    .stat-label { font-size: 13px; color: #666; }
    .stat-value { font-size: 24px; font-weight: 600; }
    .account-card { padding: 20px; }
    .account-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .account-info { display: flex; gap: 12px; align-items: center; }
    .account-name { font-weight: 500; font-size: 16px; }
    .account-type { font-size: 13px; color: #666; }
    .account-balance { font-size: 28px; font-weight: 600; margin-top: 16px; }
    .account-actions { display: flex; }
    .form-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: flex; justify-content: center;
      align-items: center; z-index: 1000;
    }
    .form-card { max-width: 480px; width: 90%; padding: 24px; }
    .full-width { width: 100%; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
  `]
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  summary: AccountSummary | null = null;
  showForm = false;
  editing = false;
  editingId = '';
  form: FormGroup;

  constructor(private apiService: ApiService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['Checking', Validators.required],
      currency: ['BRL'],
      balance: [0],
      color: ['#4CAF50'],
      icon: ['account_balance']
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.apiService.getAccounts().subscribe(a => this.accounts = a);
    this.apiService.getAccountSummary().subscribe(s => this.summary = s);
  }

  openForm(): void { this.editing = false; this.form.reset({ type: 'Checking', currency: 'BRL', balance: 0, color: '#4CAF50', icon: 'account_balance' }); this.showForm = true; }

  editAccount(a: Account): void {
    this.editing = true; this.editingId = a.id;
    this.form.patchValue(a); this.showForm = true;
  }

  saveAccount(): void {
    if (this.form.invalid) return;
    const data = this.form.value;
    const obs = this.editing ? this.apiService.updateAccount(this.editingId, data) : this.apiService.createAccount(data);
    obs.subscribe(() => { this.showForm = false; this.load(); this.snackBar.open('Conta salva!', 'Fechar', { duration: 3000 }); });
  }

  deleteAccount(id: string): void {
    if (confirm('Deseja excluir esta conta?')) {
      this.apiService.deleteAccount(id).subscribe(() => { this.load(); this.snackBar.open('Conta excluida', 'Fechar', { duration: 3000 }); });
    }
  }

  getTypeLabel(t: string): string {
    const m: Record<string, string> = { Checking: 'Conta Corrente', Savings: 'Poupanca', CreditCard: 'Cartao', Investment: 'Investimento', Cash: 'Dinheiro' };
    return m[t] || t;
  }
}

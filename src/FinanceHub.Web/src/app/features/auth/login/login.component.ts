import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <div class="auth-header">
          <mat-icon class="auth-logo">account_balance_wallet</mat-icon>
          <h1>FinanceHub</h1>
          <p>Gerencie suas financas com inteligencia</p>
        </div>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="seu@email.com">
              <mat-icon matSuffix>email</mat-icon>
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>Email obrigatorio</mat-error>
              }
              @if (form.get('email')?.hasError('email')) {
                <mat-error>Email invalido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>Senha obrigatoria</mat-error>
              }
            </mat-form-field>

            <button mat-raised-button color="primary" class="full-width submit-btn" type="submit" [disabled]="loading">
              @if (loading) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Entrar
              }
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <p style="text-align:center;">Nao tem conta? <a routerLink="/register" class="link">Cadastre-se</a></p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh; background: linear-gradient(135deg, #1a237e 0%, #4CAF50 100%);
      padding: 20px;
    }
    .auth-card { max-width: 420px; width: 100%; padding: 32px; border-radius: 16px !important; }
    .auth-header { text-align: center; margin-bottom: 24px; }
    .auth-logo { font-size: 48px; width: 48px; height: 48px; color: #4CAF50; }
    .auth-header h1 { margin: 8px 0 4px; font-size: 28px; }
    .auth-header p { color: #666; margin: 0; }
    .full-width { width: 100%; }
    .submit-btn { height: 48px; font-size: 16px; margin-top: 8px; }
    .link { color: #4CAF50; text-decoration: none; font-weight: 500; }
    mat-card-actions p { margin: 16px 0 0; color: #666; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      email: ['demo@financehub.com', [Validators.required, Validators.email]],
      password: ['demo123', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const { email, password } = this.form.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
        this.snackBar.open('Login realizado com sucesso!', 'Fechar', { duration: 3000 });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Email ou senha invalidos', 'Fechar', { duration: 3000 });
      }
    });
  }
}

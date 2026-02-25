import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule,
    MatDividerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-header"><h1>Configuracoes</h1></div>

    <div class="settings-grid">
      <mat-card>
        <mat-card-header><mat-card-title><mat-icon>person</mat-icon> Perfil</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="profileForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nome Completo</mat-label>
              <input matInput formControlName="fullName">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" [disabled]="true">
            </mat-form-field>
            <button mat-raised-button color="primary">Salvar Perfil</button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header><mat-card-title><mat-icon>palette</mat-icon> Preferencias</mat-card-title></mat-card-header>
        <mat-card-content>
          <div class="preference-item">
            <span>Tema Escuro</span>
            <mat-slide-toggle [checked]="themeService.isDark()" (change)="themeService.toggle()"></mat-slide-toggle>
          </div>
          <mat-divider></mat-divider>
          <div class="preference-item">
            <span>Moeda</span>
            <mat-form-field appearance="outline" style="width: 120px;">
              <mat-select value="BRL">
                <mat-option value="BRL">BRL (R$)</mat-option>
                <mat-option value="USD">USD ($)</mat-option>
                <mat-option value="EUR">EUR</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <mat-divider></mat-divider>
          <div class="preference-item">
            <span>Formato de Data</span>
            <mat-form-field appearance="outline" style="width: 160px;">
              <mat-select value="dd/MM/yyyy">
                <mat-option value="dd/MM/yyyy">dd/MM/yyyy</mat-option>
                <mat-option value="MM/dd/yyyy">MM/dd/yyyy</mat-option>
                <mat-option value="yyyy-MM-dd">yyyy-MM-dd</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header><mat-card-title><mat-icon>lock</mat-icon> Seguranca</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="passwordForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha Atual</mat-label>
              <input matInput formControlName="currentPassword" type="password">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nova Senha</mat-label>
              <input matInput formControlName="newPassword" type="password">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmar Nova Senha</mat-label>
              <input matInput formControlName="confirmPassword" type="password">
            </mat-form-field>
            <button mat-raised-button color="warn" (click)="snackBar.open('Funcionalidade em breve!', 'Fechar', {duration: 3000})">Alterar Senha</button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .settings-grid { display: flex; flex-direction: column; gap: 20px; max-width: 600px; }
    mat-card-title { display: flex; align-items: center; gap: 8px; }
    .full-width { width: 100%; }
    .preference-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; }
  `]
})
export class SettingsComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public themeService: ThemeService,
    public snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({ fullName: [''], email: [''] });
    this.passwordForm = this.fb.group({
      currentPassword: [''], newPassword: ['', Validators.minLength(6)], confirmPassword: ['']
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) { this.profileForm.patchValue({ fullName: user.fullName, email: user.email }); }
    });
  }
}

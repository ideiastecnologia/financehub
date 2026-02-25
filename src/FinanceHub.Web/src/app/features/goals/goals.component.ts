import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../core/services/api.service';
import { Goal } from '../../core/models';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule,
    MatProgressBarModule, MatFormFieldModule, MatInputModule, MatDatepickerModule,
    MatNativeDateModule, MatSnackBarModule, MatChipsModule, CurrencyBrlPipe
  ],
  template: `
    <div class="page-header">
      <h1>Metas Financeiras</h1>
      <button mat-raised-button color="primary" (click)="openForm()"><mat-icon>add</mat-icon> Nova Meta</button>
    </div>

    <div class="card-grid">
      @for (goal of goals; track goal.id) {
        <mat-card class="goal-card" [style.border-top]="'4px solid ' + goal.color">
          <div class="goal-header">
            <div class="goal-title">
              <mat-icon [style.color]="goal.color">{{ goal.icon }}</mat-icon>
              <h3>{{ goal.name }}</h3>
            </div>
            <mat-chip-set>
              <mat-chip [class]="goal.status === 'Completed' ? 'completed-chip' : 'active-chip'">
                {{ goal.status === 'Completed' ? 'Concluida' : 'Ativa' }}
              </mat-chip>
            </mat-chip-set>
          </div>
          <div class="goal-progress">
            <div class="progress-header">
              <span class="current">{{ goal.currentAmount | currencyBrl }}</span>
              <span class="target">de {{ goal.targetAmount | currencyBrl }}</span>
            </div>
            <mat-progress-bar [value]="goal.progressPercentage" [color]="goal.progressPercentage >= 100 ? 'primary' : 'accent'"></mat-progress-bar>
            <div class="progress-footer">
              <span>{{ goal.progressPercentage }}%</span>
              <span>Prazo: {{ goal.deadline | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>
          <div class="goal-actions">
            <button mat-stroked-button color="primary" (click)="openContribute(goal)">
              <mat-icon>add</mat-icon> Contribuir
            </button>
            <button mat-icon-button (click)="editGoal(goal)"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="deleteGoal(goal.id)"><mat-icon>delete</mat-icon></button>
          </div>
        </mat-card>
      }
    </div>

    @if (showForm) {
      <div class="form-overlay" (click)="showForm = false">
        <mat-card class="form-card" (click)="$event.stopPropagation()">
          <mat-card-header><mat-card-title>{{ editing ? 'Editar' : 'Nova' }} Meta</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="saveGoal()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nome</mat-label><input matInput formControlName="name">
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Valor Alvo</mat-label>
                <input matInput formControlName="targetAmount" type="number"><span matPrefix>R$&nbsp;</span>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Prazo</mat-label>
                <input matInput [matDatepicker]="dp" formControlName="deadline">
                <mat-datepicker-toggle matSuffix [for]="dp"></mat-datepicker-toggle>
                <mat-datepicker #dp></mat-datepicker>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Cor</mat-label><input matInput formControlName="color" type="color">
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Icone</mat-label><input matInput formControlName="icon" placeholder="ex: flag, flight, laptop_mac">
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

    @if (showContribute) {
      <div class="form-overlay" (click)="showContribute = false">
        <mat-card class="form-card" (click)="$event.stopPropagation()">
          <mat-card-header><mat-card-title>Contribuir para: {{ contributeGoal?.name }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Valor</mat-label>
              <input matInput [(ngModel)]="contributeAmount" type="number"><span matPrefix>R$&nbsp;</span>
            </mat-form-field>
            <div class="form-actions">
              <button mat-button (click)="showContribute = false">Cancelar</button>
              <button mat-raised-button color="primary" (click)="contribute()">Contribuir</button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .goal-card { padding: 24px; }
    .goal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .goal-title { display: flex; align-items: center; gap: 12px; }
    .goal-title h3 { margin: 0; }
    .goal-progress { margin-bottom: 16px; }
    .progress-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .current { font-size: 18px; font-weight: 600; }
    .target { color: #666; }
    .progress-footer { display: flex; justify-content: space-between; margin-top: 8px; font-size: 13px; color: #666; }
    .goal-actions { display: flex; align-items: center; gap: 8px; }
    .completed-chip { background: #E8F5E9 !important; color: #4CAF50 !important; }
    .active-chip { background: #E3F2FD !important; color: #1976D2 !important; }
    .form-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .form-card { max-width: 480px; width: 90%; padding: 24px; }
    .full-width { width: 100%; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
  `]
})
export class GoalsComponent implements OnInit {
  goals: Goal[] = [];
  showForm = false;
  showContribute = false;
  editing = false;
  editingId = '';
  contributeGoal: Goal | null = null;
  contributeAmount = 0;
  form: FormGroup;

  constructor(private apiService: ApiService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      targetAmount: [0, [Validators.required, Validators.min(1)]],
      deadline: [null, Validators.required],
      color: ['#FF9800'], icon: ['flag']
    });
  }

  ngOnInit(): void { this.load(); }
  load(): void { this.apiService.getGoals().subscribe(g => this.goals = g); }

  openForm(): void { this.editing = false; this.form.reset({ color: '#FF9800', icon: 'flag' }); this.showForm = true; }

  editGoal(g: Goal): void {
    this.editing = true; this.editingId = g.id;
    this.form.patchValue({ ...g, deadline: new Date(g.deadline) }); this.showForm = true;
  }

  saveGoal(): void {
    if (this.form.invalid) return;
    const data = { ...this.form.value, deadline: this.form.value.deadline.toISOString() };
    const obs = this.editing ? this.apiService.updateGoal(this.editingId, data) : this.apiService.createGoal(data);
    obs.subscribe(() => { this.showForm = false; this.load(); this.snackBar.open('Meta salva!', 'Fechar', { duration: 3000 }); });
  }

  deleteGoal(id: string): void {
    if (confirm('Excluir meta?')) {
      this.apiService.deleteGoal(id).subscribe(() => { this.load(); this.snackBar.open('Meta excluida', 'Fechar', { duration: 3000 }); });
    }
  }

  openContribute(g: Goal): void { this.contributeGoal = g; this.contributeAmount = 0; this.showContribute = true; }

  contribute(): void {
    if (!this.contributeGoal || this.contributeAmount <= 0) return;
    this.apiService.contributeToGoal(this.contributeGoal.id, this.contributeAmount).subscribe(() => {
      this.showContribute = false; this.load();
      this.snackBar.open('Contribuicao registrada!', 'Fechar', { duration: 3000 });
    });
  }
}

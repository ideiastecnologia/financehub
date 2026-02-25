import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';
import { Category } from '../../core/models';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatChipsModule,
    MatTreeModule, MatSnackBarModule, CurrencyBrlPipe
  ],
  template: `
    <div class="page-header">
      <h1>Categorias</h1>
      <button mat-raised-button color="primary" (click)="openForm()">
        <mat-icon>add</mat-icon> Nova Categoria
      </button>
    </div>

    <div class="categories-grid">
      <mat-card>
        <mat-card-header><mat-card-title>Receitas</mat-card-title></mat-card-header>
        <mat-card-content>
          @for (cat of incomeCategories; track cat.id) {
            <div class="category-item" [style.border-left]="'4px solid ' + cat.color">
              <div class="cat-info">
                <mat-icon [style.color]="cat.color">{{ cat.icon }}</mat-icon>
                <span>{{ cat.name }}</span>
              </div>
              <div class="cat-actions">
                <button mat-icon-button (click)="editCategory(cat)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn" (click)="deleteCategory(cat.id)"><mat-icon>delete</mat-icon></button>
              </div>
            </div>
            @if (cat.subCategories && cat.subCategories.length) {
              @for (sub of cat.subCategories; track sub.id) {
                <div class="category-item subcategory" [style.border-left]="'4px solid ' + sub.color">
                  <div class="cat-info">
                    <mat-icon [style.color]="sub.color" class="small-icon">{{ sub.icon }}</mat-icon>
                    <span>{{ sub.name }}</span>
                  </div>
                  <div class="cat-actions">
                    <button mat-icon-button (click)="editCategory(sub)"><mat-icon>edit</mat-icon></button>
                    <button mat-icon-button color="warn" (click)="deleteCategory(sub.id)"><mat-icon>delete</mat-icon></button>
                  </div>
                </div>
              }
            }
          }
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header><mat-card-title>Despesas</mat-card-title></mat-card-header>
        <mat-card-content>
          @for (cat of expenseCategories; track cat.id) {
            <div class="category-item" [style.border-left]="'4px solid ' + cat.color">
              <div class="cat-info">
                <mat-icon [style.color]="cat.color">{{ cat.icon }}</mat-icon>
                <span>{{ cat.name }}</span>
                @if (cat.budget) {
                  <mat-chip-set><mat-chip>Orcamento: {{ cat.budget | currencyBrl }}</mat-chip></mat-chip-set>
                }
              </div>
              <div class="cat-actions">
                <button mat-icon-button (click)="editCategory(cat)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn" (click)="deleteCategory(cat.id)"><mat-icon>delete</mat-icon></button>
              </div>
            </div>
            @if (cat.subCategories && cat.subCategories.length) {
              @for (sub of cat.subCategories; track sub.id) {
                <div class="category-item subcategory" [style.border-left]="'4px solid ' + sub.color">
                  <div class="cat-info">
                    <mat-icon [style.color]="sub.color" class="small-icon">{{ sub.icon }}</mat-icon>
                    <span>{{ sub.name }}</span>
                  </div>
                  <div class="cat-actions">
                    <button mat-icon-button (click)="editCategory(sub)"><mat-icon>edit</mat-icon></button>
                    <button mat-icon-button color="warn" (click)="deleteCategory(sub.id)"><mat-icon>delete</mat-icon></button>
                  </div>
                </div>
              }
            }
          }
        </mat-card-content>
      </mat-card>
    </div>

    @if (showForm) {
      <div class="form-overlay" (click)="showForm = false">
        <mat-card class="form-card" (click)="$event.stopPropagation()">
          <mat-card-header><mat-card-title>{{ editing ? 'Editar' : 'Nova' }} Categoria</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="saveCategory()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nome</mat-label>
                <input matInput formControlName="name">
              </mat-form-field>
              @if (!editing) {
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Tipo</mat-label>
                  <mat-select formControlName="type">
                    <mat-option value="Income">Receita</mat-option>
                    <mat-option value="Expense">Despesa</mat-option>
                  </mat-select>
                </mat-form-field>
              }
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Icone</mat-label>
                <input matInput formControlName="icon" placeholder="ex: restaurant, home, work">
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Cor</mat-label>
                <input matInput formControlName="color" type="color">
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Orcamento Mensal</mat-label>
                <input matInput formControlName="budget" type="number">
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
    .categories-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .category-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px; margin: 4px 0; border-radius: 8px;
      background: rgba(0,0,0,0.02); transition: background 0.2s;
    }
    .category-item:hover { background: rgba(0,0,0,0.05); }
    .subcategory { margin-left: 32px; }
    .cat-info { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .cat-actions { display: flex; }
    .small-icon { font-size: 18px; width: 18px; height: 18px; }
    .form-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .form-card { max-width: 480px; width: 90%; padding: 24px; }
    .full-width { width: 100%; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
    @media (max-width: 768px) { .categories-grid { grid-template-columns: 1fr; } }
  `]
})
export class CategoriesComponent implements OnInit {
  incomeCategories: Category[] = [];
  expenseCategories: Category[] = [];
  showForm = false;
  editing = false;
  editingId = '';
  form: FormGroup;

  constructor(private apiService: ApiService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      name: ['', Validators.required], type: ['Expense'], icon: ['category'],
      color: ['#2196F3'], budget: [null]
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.apiService.getCategoryTree().subscribe(cats => {
      this.incomeCategories = cats.filter(c => c.type === 'Income');
      this.expenseCategories = cats.filter(c => c.type === 'Expense');
    });
  }

  openForm(): void { this.editing = false; this.form.reset({ type: 'Expense', icon: 'category', color: '#2196F3' }); this.showForm = true; }

  editCategory(cat: Category): void {
    this.editing = true; this.editingId = cat.id;
    this.form.patchValue(cat); this.showForm = true;
  }

  saveCategory(): void {
    if (this.form.invalid) return;
    const data = this.form.value;
    const obs = this.editing ? this.apiService.updateCategory(this.editingId, data) : this.apiService.createCategory(data);
    obs.subscribe(() => { this.showForm = false; this.load(); this.snackBar.open('Categoria salva!', 'Fechar', { duration: 3000 }); });
  }

  deleteCategory(id: string): void {
    if (confirm('Excluir categoria?')) {
      this.apiService.deleteCategory(id).subscribe(() => { this.load(); this.snackBar.open('Categoria excluida', 'Fechar', { duration: 3000 }); });
    }
  }
}

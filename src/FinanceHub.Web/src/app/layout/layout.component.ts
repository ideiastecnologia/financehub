import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { SignalRService } from '../core/services/signalr.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatSidenavModule, MatToolbarModule,
    MatListModule, MatIconModule, MatButtonModule, MatMenuModule,
    MatDividerModule, MatTooltipModule
  ],
  template: `
    <mat-sidenav-container class="layout-container">
      <mat-sidenav #sidenav [mode]="isMobile ? 'over' : 'side'" [opened]="!isMobile" class="sidenav">
        <div class="sidenav-header">
          <mat-icon class="logo-icon">account_balance_wallet</mat-icon>
          <span class="logo-text">FinanceHub</span>
        </div>
        <mat-divider></mat-divider>
        <mat-nav-list>
          @for (item of navItems; track item.route) {
            <a mat-list-item [routerLink]="item.route" routerLinkActive="active-link"
               (click)="isMobile && sidenav.close()">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-spacer"></span>
          <button mat-icon-button (click)="themeService.toggle()" matTooltip="Alternar tema">
            <mat-icon>{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <div class="user-menu-header" mat-menu-item disabled>
              <strong>{{ (authService.currentUser$ | async)?.fullName }}</strong>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item routerLink="/settings">
              <mat-icon>settings</mat-icon>
              <span>Configuracoes</span>
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Sair</span>
            </button>
          </mat-menu>
        </mat-toolbar>
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .layout-container { height: 100vh; }
    .sidenav { width: 260px; }
    .sidenav-header {
      display: flex; align-items: center; padding: 16px;
      gap: 12px;
    }
    .logo-icon { font-size: 32px; width: 32px; height: 32px; color: #4CAF50; }
    .logo-text { font-size: 20px; font-weight: 600; }
    .toolbar { position: sticky; top: 0; z-index: 100; }
    .toolbar-spacer { flex: 1; }
    .content { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .active-link { background: rgba(76, 175, 80, 0.1) !important; }
    .active-link mat-icon { color: #4CAF50; }
    .user-menu-header { opacity: 1 !important; }
    @media (max-width: 768px) {
      .content { padding: 12px; }
    }
  `]
})
export class LayoutComponent {
  isMobile = false;
  navItems = [
    { route: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { route: '/transactions', icon: 'swap_horiz', label: 'Transacoes' },
    { route: '/accounts', icon: 'account_balance', label: 'Contas' },
    { route: '/categories', icon: 'category', label: 'Categorias' },
    { route: '/budgets', icon: 'pie_chart', label: 'Orcamentos' },
    { route: '/goals', icon: 'flag', label: 'Metas' },
    { route: '/reports', icon: 'bar_chart', label: 'Relatorios' },
    { route: '/settings', icon: 'settings', label: 'Configuracoes' },
  ];

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private signalRService: SignalRService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isMobile = result.matches;
    });
    this.signalRService.startConnection();
  }

  logout(): void {
    this.signalRService.stopConnection();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

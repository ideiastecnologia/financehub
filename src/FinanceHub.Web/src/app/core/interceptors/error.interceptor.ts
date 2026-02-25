import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      } else if (error.status === 0) {
        snackBar.open('Erro de conexao com o servidor', 'Fechar', { duration: 5000 });
      } else {
        const message = error.error?.error || 'Ocorreu um erro inesperado';
        snackBar.open(message, 'Fechar', { duration: 5000 });
      }
      return throwError(() => error);
    })
  );
};

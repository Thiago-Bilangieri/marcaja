import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Auth } from './auth';

/**
 * Corre em todos os pedidos HTTP:
 * - junta `Authorization: Bearer <token>` aos pedidos para a API;
 * - se a API responder 401 (token expirado ou inválido), termina a sessão e vai para o login.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(Auth);
  const router = inject(Router);

  const isApiRequest = request.url.startsWith(environment.apiUrl);
  const isAuthEndpoint = request.url.includes('/api/auth/');
  const token = auth.token();

  const authorized =
    isApiRequest && !isAuthEndpoint && token
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(authorized).pipe(
    catchError((error: unknown) => {
      // No login, 401 significa "credenciais erradas" e é tratado no formulário
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthEndpoint) {
        auth.logout();
        router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => error);
    }),
  );
};

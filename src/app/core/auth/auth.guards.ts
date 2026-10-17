import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';
import { Role, homeFor } from './auth.models';

// Páginas que exigem sessão: sem sessão, vai para o login e volta para cá depois de entrar
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.token() ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

// Páginas só para alguns perfis (ex.: só o CUSTOMER marca para si próprio). Usar depois do authGuard.
export function roleGuard(...roles: Role[]): CanActivateFn {
  return () => {
    const role = inject(Auth).currentUser()?.role;
    return role && roles.includes(role) ? true : inject(Router).createUrlTree([homeFor(role)]);
  };
}

// Login e registo não fazem sentido com sessão iniciada
export const guestGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.token() ? router.createUrlTree([homeFor(auth.currentUser()?.role)]) : true;
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

// Páginas que exigem sessão: sem sessão, vai para o login e volta para cá depois de entrar
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.token() ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

// Login e registo não fazem sentido com sessão iniciada
export const guestGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.token() ? router.createUrlTree(['/account']) : true;
};

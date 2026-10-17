import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guards';

// Lazy loading: o código de cada página só é descarregado quando o utilizador acede à rota.
// O título do separador é definido pelo serviço I18n (muda com o idioma).
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: 'services',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/services/services').then((m) => m.Services),
  },
  {
    path: 'services/:id/book',
    canActivate: [authGuard, roleGuard('CUSTOMER')],
    loadComponent: () => import('./pages/book/book').then((m) => m.Book),
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/account/account').then((m) => m.Account),
  },
  // Qualquer endereço desconhecido volta à página inicial
  { path: '**', redirectTo: '' },
];

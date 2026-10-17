import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'MarcaJá · Seu horário, sem espera',
    // Lazy loading: o código da página só é baixado quando o usuário acessa a rota
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  // Qualquer endereço desconhecido volta para a página inicial
  { path: '**', redirectTo: '' },
];

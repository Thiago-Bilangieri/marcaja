import { Component, inject } from '@angular/core';
import { Auth } from '../../core/auth/auth';
import { I18n } from '../../core/i18n/i18n';

// Página protegida pelo authGuard: placeholder até à Fase 2 (área do cliente)
@Component({
  selector: 'mj-account',
  template: `
    @if (auth.currentUser(); as user) {
      <section class="auth-page">
        <div class="auth-card">
          <h1>{{ t().account.title }}</h1>
          <p>
            {{ t().account.signedInAs }} <strong>{{ user.email }}</strong><br />
            {{ t().account.role }}: <strong>{{ t().roles[user.role] }}</strong>
          </p>
          <p class="form-info">{{ t().account.comingSoon }}</p>
        </div>
      </section>
    }
  `,
})
export class Account {
  protected readonly auth = inject(Auth);
  protected readonly t = inject(I18n).t;
}

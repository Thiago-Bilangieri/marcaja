import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Auth } from './core/auth/auth';
import { I18n } from './core/i18n/i18n';
import { LOCALES } from './core/i18n/translations';
import { Profile } from './core/profile/profile';
import { initials } from './core/profile/profile.models';

@Component({
  imports: [RouterOutlet, RouterLink, MatButtonModule, MatButtonToggleModule, MatMenuModule],
  selector: 'mj-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18n);
  protected readonly auth = inject(Auth);
  protected readonly t = this.i18n.t;
  protected readonly locales = LOCALES;
  protected readonly year = new Date().getFullYear();
  protected readonly isProfessional = computed(
    () => this.auth.currentUser()?.role === 'PROFESSIONAL',
  );
  protected readonly isAdmin = computed(() => this.auth.currentUser()?.role === 'ADMIN');

  // Menu da conta: o login só devolve o email, por isso o nome vem de /api/users/me.
  // Enquanto o perfil carrega, mostra-se a parte do email antes do "@"
  private readonly me = inject(Profile).me;
  protected readonly displayName = computed(() => {
    const name = this.me.hasValue() ? this.me.value().name : '';
    return name.split(/\s+/)[0] || (this.auth.currentUser()?.email.split('@')[0] ?? '');
  });
  protected readonly userInitials = computed(() =>
    this.me.hasValue()
      ? initials(this.me.value().name)
      : this.displayName().charAt(0).toUpperCase(),
  );

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}

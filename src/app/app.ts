import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Auth } from './core/auth/auth';
import { I18n } from './core/i18n/i18n';
import { LOCALES } from './core/i18n/translations';

@Component({
  imports: [RouterOutlet, RouterLink, MatButtonModule, MatButtonToggleModule],
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
  protected readonly isProfessional = computed(() => this.auth.currentUser()?.role === 'PROFESSIONAL');

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}

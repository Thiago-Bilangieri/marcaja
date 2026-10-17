import { Component, computed, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../core/api/api-error';
import { Auth } from '../../core/auth/auth';
import { homeFor } from '../../core/auth/auth.models';
import { I18n } from '../../core/i18n/i18n';

@Component({
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, RouterLink],
  selector: 'mj-login',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  protected readonly t = inject(I18n).t;

  // Vem do query param ?returnUrl=/... (ver withComponentInputBinding em app.config.ts)
  readonly returnUrl = input<string>();

  // Reactive Form: os campos e as validações são definidos no TypeScript
  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected readonly loading = signal(false);
  protected readonly hidePassword = signal(true);
  private readonly failure = signal<unknown>(null);
  // computed: se o idioma mudar com o erro no ecrã, a mensagem é traduzida na hora
  protected readonly errorMessage = computed(() =>
    this.failure() ? apiErrorMessage(this.failure(), this.t(), 'login') : null,
  );

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.failure.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl(this.safeReturnUrl()),
      error: (error: unknown) => {
        this.failure.set(error);
        this.loading.set(false);
      },
    });
  }

  // Só aceita caminhos internos ("/account"), nunca um site externo ("//site.com").
  // Sem returnUrl, vai para a página inicial do perfil (o cliente para /account, o profissional para /agenda).
  private safeReturnUrl(): string {
    const url = this.returnUrl();
    return url?.startsWith('/') && !url.startsWith('//') ? url : homeFor(this.auth.currentUser()?.role);
  }
}

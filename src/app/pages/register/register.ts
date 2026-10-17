import { Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../core/api/api-error';
import { Auth } from '../../core/auth/auth';
import { I18n } from '../../core/i18n/i18n';

type AccountType = 'customer' | 'professional';

@Component({
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
  ],
  selector: 'mj-register',
  templateUrl: './register.html',
})
export class Register {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  protected readonly t = inject(I18n).t;

  // ?type=professional vem do botão "Sou profissional" da página inicial
  readonly type = input<string>();
  // linkedSignal: começa com o valor do query param, mas o utilizador pode trocar no toggle
  protected readonly accountType = linkedSignal<AccountType>(() =>
    this.type() === 'professional' ? 'professional' : 'customer',
  );

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    phone: ['', Validators.required],
  });

  protected readonly loading = signal(false);
  protected readonly hidePassword = signal(true);
  protected readonly professionalRegistered = signal(false);
  private readonly failure = signal<unknown>(null);
  protected readonly errorMessage = computed(() =>
    this.failure() ? apiErrorMessage(this.failure(), this.t(), 'register') : null,
  );

  constructor() {
    // O profissional não tem telefone na API: campo desativado = ignorado na validação e no valor
    effect(() => {
      const phone = this.form.controls.phone;
      if (this.accountType() === 'professional') {
        phone.disable();
      } else {
        phone.enable();
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.failure.set(null);

    const { name, email, password, phone } = this.form.getRawValue();
    const onError = (error: unknown) => {
      this.failure.set(error);
      this.loading.set(false);
    };

    if (this.accountType() === 'customer') {
      this.auth.registerCustomer({ name, email, password, phone }).subscribe({
        next: () => this.router.navigate(['/account']),
        error: onError,
      });
    } else {
      this.auth.registerProfessional({ name, email, password }).subscribe({
        next: () => {
          this.professionalRegistered.set(true);
          this.loading.set(false);
        },
        error: onError,
      });
    }
  }
}

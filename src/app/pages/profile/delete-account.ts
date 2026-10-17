import { Component, computed, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { apiErrorMessage, apiFieldErrors } from '../../core/api/api-error';
import { I18n } from '../../core/i18n/i18n';
import { Profile } from '../../core/profile/profile';
import { UserProfile } from '../../core/profile/profile.models';

/**
 * Eliminar a conta (direito ao apagamento, RGPD). A API anonimiza os dados pessoais e mantém
 * as marcações passadas. Pede a palavra-passe e uma confirmação explícita, porque não há volta atrás.
 * Um ADMIN não pode eliminar a própria conta: a secção só mostra um aviso.
 */
@Component({
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  selector: 'mj-delete-account',
  styleUrl: './profile-section.scss',
  templateUrl: './delete-account.html',
})
export class DeleteAccount {
  private readonly profileService = inject(Profile);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  protected readonly t = inject(I18n).t;

  readonly profile = input.required<UserProfile>();
  protected readonly isAdmin = computed(() => this.profile().role === 'ADMIN');
  protected readonly isProfessional = computed(() => this.profile().role === 'PROFESSIONAL');

  protected readonly form = inject(NonNullableFormBuilder).group({
    currentPassword: ['', Validators.required],
    understood: [false, Validators.requiredTrue],
  });

  protected readonly deleting = signal(false);
  private readonly failure = signal<unknown>(null);
  protected readonly errorMessage = computed(() =>
    this.failure() ? apiErrorMessage(this.failure(), this.t(), 'profile') : null,
  );

  protected remove(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.deleting.set(true);
    this.failure.set(null);

    this.profileService.deleteAccount(this.form.getRawValue().currentPassword).subscribe({
      next: () => {
        this.snackBar.open(this.t().profile.delete.done, this.t().common.close, { duration: 6000 });
        this.router.navigate(['/']);
      },
      error: (error: unknown) => {
        this.deleting.set(false);
        if (apiFieldErrors(error)?.['currentPassword']) {
          this.form.controls.currentPassword.setErrors({ incorrect: true });
          return;
        }
        this.failure.set(error);
      },
    });
  }
}

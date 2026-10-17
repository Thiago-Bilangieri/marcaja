import { Component, computed, inject, signal, viewChild } from '@angular/core';
import {
  FormGroupDirective,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { apiErrorMessage, apiFieldErrors } from '../../core/api/api-error';
import {
  GroupErrorMatcher,
  passwordChange,
  strongPassword,
} from '../../core/auth/password.validators';
import { I18n } from '../../core/i18n/i18n';
import { Profile } from '../../core/profile/profile';

// Mudar a palavra-passe: a atual, a nova (com a política da API) e a confirmação
@Component({
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  selector: 'mj-change-password',
  styleUrl: './profile-section.scss',
  templateUrl: './change-password.html',
})
export class ChangePassword {
  private readonly profileService = inject(Profile);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly t = inject(I18n).t;

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, strongPassword]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordChange },
  );

  // Os erros do grupo aparecem no campo a que dizem respeito
  protected readonly newPasswordMatcher = new GroupErrorMatcher('sameAsCurrent');
  protected readonly confirmMatcher = new GroupErrorMatcher('mismatch');

  private readonly formDirective = viewChild.required(FormGroupDirective);

  // Um só botão de mostrar/esconder para os três campos
  protected readonly hidePasswords = signal(true);
  protected readonly saving = signal(false);
  private readonly failure = signal<unknown>(null);
  protected readonly errorMessage = computed(() =>
    this.failure() ? apiErrorMessage(this.failure(), this.t(), 'profile') : null,
  );

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.failure.set(null);

    const { currentPassword, newPassword } = this.form.getRawValue();
    this.profileService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.saving.set(false);
        this.formDirective().resetForm();
        this.snackBar.open(this.t().profile.password.saved, this.t().common.close, {
          duration: 6000,
        });
      },
      error: (error: unknown) => {
        this.saving.set(false);
        if (apiFieldErrors(error)?.['currentPassword']) {
          this.form.controls.currentPassword.setErrors({ incorrect: true });
          return;
        }
        this.failure.set(error);
      },
    });
  }
}

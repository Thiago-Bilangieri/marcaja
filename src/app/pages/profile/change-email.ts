import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import {
  AbstractControl,
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
import { I18n } from '../../core/i18n/i18n';
import { Profile } from '../../core/profile/profile';
import { UserProfile } from '../../core/profile/profile.models';

// Mudar o email pede a palavra-passe atual; a API devolve um token novo e termina as outras sessões
@Component({
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  selector: 'mj-change-email',
  styleUrl: './profile-section.scss',
  templateUrl: './change-email.html',
})
export class ChangeEmail {
  private readonly profileService = inject(Profile);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly t = inject(I18n).t;

  readonly profile = input.required<UserProfile>();

  // A API normaliza o email (trim + minúsculas); comparamos da mesma forma
  private readonly notCurrentEmail = (control: AbstractControl) =>
    control.value?.trim().toLowerCase() === this.profile().email ? { sameEmail: true } : null;

  protected readonly form = inject(NonNullableFormBuilder).group({
    newEmail: ['', [Validators.required, Validators.email, this.notCurrentEmail]],
    currentPassword: ['', Validators.required],
  });

  // resetForm() da diretiva também limpa o estado 'submitted' (senão os erros de obrigatório apareciam)
  private readonly formDirective = viewChild.required(FormGroupDirective);

  protected readonly hidePassword = signal(true);
  protected readonly saving = signal(false);
  private readonly failure = signal<unknown>(null);
  protected readonly errorMessage = computed(() =>
    this.failure() ? apiErrorMessage(this.failure(), this.t(), 'email') : null,
  );

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.failure.set(null);

    const { newEmail, currentPassword } = this.form.getRawValue();
    this.profileService.changeEmail({ newEmail: newEmail.trim(), currentPassword }).subscribe({
      next: () => {
        this.saving.set(false);
        this.formDirective().resetForm();
        this.snackBar.open(this.t().profile.email.saved, this.t().common.close, { duration: 6000 });
      },
      error: (error: unknown) => {
        this.saving.set(false);
        // Palavra-passe errada: o erro aparece no próprio campo, não no aviso geral
        if (apiFieldErrors(error)?.['currentPassword']) {
          this.form.controls.currentPassword.setErrors({ incorrect: true });
          return;
        }
        this.failure.set(error);
      },
    });
  }
}

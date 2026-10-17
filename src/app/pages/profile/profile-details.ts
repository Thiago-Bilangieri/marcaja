import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { apiErrorMessage } from '../../core/api/api-error';
import { I18n } from '../../core/i18n/i18n';
import { Profile } from '../../core/profile/profile';
import { UserProfile } from '../../core/profile/profile.models';

// Dados pessoais: nome (todos) e telefone (só o cliente tem telefone na API)
@Component({
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  selector: 'mj-profile-details',
  styleUrl: './profile-section.scss',
  templateUrl: './profile-details.html',
})
export class ProfileDetails {
  private readonly profileService = inject(Profile);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly t = inject(I18n).t;

  readonly profile = input.required<UserProfile>();
  protected readonly isCustomer = computed(() => this.profile().role === 'CUSTOMER');

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.maxLength(50)]],
  });

  protected readonly saving = signal(false);
  private readonly failure = signal<unknown>(null);
  protected readonly errorMessage = computed(() =>
    this.failure() ? apiErrorMessage(this.failure(), this.t(), 'profile') : null,
  );

  constructor() {
    // Sempre que o perfil muda (ao carregar ou depois de guardar), o formulário volta a mostrar
    // os dados guardados e fica "pristine": o botão Guardar só ativa quando há alterações
    effect(() => {
      this.discard();
      if (this.isCustomer()) {
        this.form.controls.phone.enable();
      } else {
        this.form.controls.phone.disable();
      }
    });
  }

  // reset() sem argumentos voltaria aos valores iniciais (vazios), não aos dados guardados
  protected discard(): void {
    const { name, phone } = this.profile();
    this.form.reset({ name, phone: phone ?? '' });
    this.failure.set(null);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.failure.set(null);

    // Um campo desativado (telefone de quem não é cliente) não entra no value
    const { name, phone } = this.form.value;
    this.profileService.update({ name: name!.trim(), phone: phone?.trim() }).subscribe({
      next: () => {
        this.saving.set(false);
        this.snackBar.open(this.t().profile.details.saved, this.t().common.close, {
          duration: 4000,
        });
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.failure.set(error);
      },
    });
  }
}

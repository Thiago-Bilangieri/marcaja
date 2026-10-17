import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { I18n } from '../../core/i18n/i18n';
import { Profile as ProfileService } from '../../core/profile/profile';
import { initials } from '../../core/profile/profile.models';
import { ChangeEmail } from './change-email';
import { ChangePassword } from './change-password';
import { DeleteAccount } from './delete-account';
import { ProfileDetails } from './profile-details';

// O meu perfil: resumo da conta e uma secção por tarefa (dados, email, palavra-passe, eliminar)
@Component({
  imports: [
    DatePipe,
    MatButtonModule,
    MatProgressSpinnerModule,
    ProfileDetails,
    ChangeEmail,
    ChangePassword,
    DeleteAccount,
  ],
  selector: 'mj-profile',
  styleUrl: './profile.scss',
  templateUrl: './profile.html',
})
export class Profile {
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  protected readonly me = inject(ProfileService).me;
  protected readonly initials = computed(() =>
    this.me.hasValue() ? initials(this.me.value().name) : '',
  );
}

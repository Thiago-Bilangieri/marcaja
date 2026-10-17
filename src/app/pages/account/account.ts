import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../core/api/api-error';
import { Auth } from '../../core/auth/auth';
import { Booking } from '../../core/booking/booking';
import { Appointment, canCancel } from '../../core/booking/booking.models';
import { I18n } from '../../core/i18n/i18n';
import { AppointmentDetails } from './appointment-details';

// As minhas marcações: próximas (com cancelar) e histórico
@Component({
  imports: [
    AppointmentDetails,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  selector: 'mj-account',
  styleUrl: './account.scss',
  templateUrl: './account.html',
})
export class Account {
  private readonly booking = inject(Booking);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly auth = inject(Auth);
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  protected readonly appointments = this.booking.myAppointments();
  private readonly now = new Date();

  // A API devolve da mais recente para a mais antiga; as próximas mostram-se da mais perto para a mais longe
  protected readonly upcoming = computed(() =>
    this.list()
      .filter((a) => canCancel(a, this.now))
      .reverse(),
  );
  protected readonly history = computed(() => this.list().filter((a) => !canCancel(a, this.now)));

  // Cancelar pede confirmação: guarda o id da marcação a confirmar
  protected readonly confirmingId = signal<number | null>(null);
  protected readonly cancellingId = signal<number | null>(null);

  protected readonly isCustomer = computed(() => this.auth.currentUser()?.role === 'CUSTOMER');

  // O ADMIN tem de indicar o motivo ao cancelar (a API recusa sem ele); para o cliente é opcional
  protected readonly cancelReason = signal('');
  protected readonly canConfirm = computed(
    () => this.isCustomer() || this.cancelReason().trim().length > 0,
  );

  protected askCancel(appointment: Appointment): void {
    this.cancelReason.set('');
    this.confirmingId.set(appointment.id);
  }

  protected onReason(event: Event): void {
    this.cancelReason.set((event.target as HTMLTextAreaElement).value);
  }

  protected cancel(appointment: Appointment): void {
    this.cancellingId.set(appointment.id);
    this.booking.cancelAppointment(appointment.id, this.cancelReason()).subscribe({
      next: () => {
        this.cancellingId.set(null);
        this.confirmingId.set(null);
        this.snackBar.open(this.t().appointments.cancelled, this.t().common.close, { duration: 4000 });
        this.appointments.reload();
      },
      error: (error: unknown) => {
        this.cancellingId.set(null);
        this.confirmingId.set(null);
        this.snackBar.open(apiErrorMessage(error, this.t(), 'booking'), this.t().common.close, {
          duration: 6000,
        });
        this.appointments.reload();
      },
    });
  }

  private list(): Appointment[] {
    return this.appointments.hasValue() ? this.appointments.value().content : [];
  }
}

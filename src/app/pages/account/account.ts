import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
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
  imports: [AppointmentDetails, MatButtonModule, MatProgressSpinnerModule, RouterLink],
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

  protected cancel(appointment: Appointment): void {
    this.cancellingId.set(appointment.id);
    this.booking.cancelAppointment(appointment.id).subscribe({
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

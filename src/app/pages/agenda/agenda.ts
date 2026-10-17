import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { apiErrorMessage } from '../../core/api/api-error';
import { Booking } from '../../core/booking/booking';
import {
  Appointment,
  StatusAction,
  canCancel,
  canConfirm,
  canFinish,
} from '../../core/booking/booking.models';
import { I18n } from '../../core/i18n/i18n';
import { AppointmentDetails } from '../account/appointment-details';

// Agenda do profissional: fechar as que já começaram, confirmar ou cancelar as próximas, ver o histórico
@Component({
  imports: [AppointmentDetails, MatButtonModule, MatProgressSpinnerModule],
  selector: 'mj-agenda',
  styleUrl: '../account/account.scss',
  templateUrl: './agenda.html',
})
export class Agenda {
  private readonly booking = inject(Booking);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly t = inject(I18n).t;

  // O mesmo GET /api/appointments do cliente: para um PROFESSIONAL, a API devolve as que ele recebeu
  protected readonly appointments = this.booking.myAppointments();
  private readonly now = new Date();

  // A API devolve da mais recente para a mais antiga
  protected readonly toClose = computed(() => this.list().filter((a) => canFinish(a, this.now)));
  protected readonly upcoming = computed(() =>
    this.list()
      .filter((a) => canCancel(a, this.now))
      .reverse(),
  );
  protected readonly history = computed(() =>
    this.list().filter((a) => !canFinish(a, this.now) && !canCancel(a, this.now)),
  );

  protected readonly canConfirm = (a: Appointment) => canConfirm(a, this.now);

  // Cancelar pede confirmação; enquanto um pedido corre, os botões dessa marcação ficam desativados
  protected readonly confirmingCancelId = signal<number | null>(null);
  protected readonly busyId = signal<number | null>(null);

  protected updateStatus(appointment: Appointment, action: StatusAction): void {
    this.run(appointment, this.booking.updateStatus(appointment.id, action), this.t().agenda.updated[action]);
  }

  protected cancel(appointment: Appointment): void {
    this.run(appointment, this.booking.cancelAppointment(appointment.id), this.t().appointments.cancelled);
  }

  // Corre o pedido, avisa o resultado e volta a carregar a lista (a marcação muda de secção)
  private run(appointment: Appointment, request: Observable<Appointment>, success: string): void {
    this.busyId.set(appointment.id);
    const done = (message: string, duration: number) => {
      this.busyId.set(null);
      this.confirmingCancelId.set(null);
      this.snackBar.open(message, this.t().common.close, { duration });
      this.appointments.reload();
    };

    request.subscribe({
      next: () => done(success, 4000),
      error: (error: unknown) => done(apiErrorMessage(error, this.t(), 'booking'), 6000),
    });
  }

  private list(): Appointment[] {
    return this.appointments.hasValue() ? this.appointments.value().content : [];
  }
}

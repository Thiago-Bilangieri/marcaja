import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Approvals } from '../../core/admin/approvals';
import { apiErrorMessage } from '../../core/api/api-error';
import { Booking } from '../../core/booking/booking';
import {
  APPOINTMENT_STATUSES,
  Appointment,
  AppointmentStatus,
  canCancel,
} from '../../core/booking/booking.models';
import { I18n } from '../../core/i18n/i18n';
import { AppointmentDetails } from '../account/appointment-details';

/**
 * Todas as marcações da plataforma, para o ADMIN. Os filtros são aplicados na API
 * (estado, profissional, período e pesquisa livre) e a lista vem paginada.
 */
@Component({
  imports: [
    AppointmentDetails,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  selector: 'mj-admin-appointments',
  styleUrls: ['../account/account.scss', './admin-appointments.scss'],
  templateUrl: './admin-appointments.html',
})
export class AdminAppointments {
  private readonly booking = inject(Booking);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  protected readonly statuses = APPOINTMENT_STATUSES;
  protected readonly professionals = inject(Approvals).professionals(() => 'APPROVED');

  // Filtros: quando mudam, o httpResource das marcações volta a pedir à API sozinho
  protected readonly status = signal<AppointmentStatus[]>([]);
  protected readonly professionalId = signal<number | null>(null);
  protected readonly from = signal('');
  protected readonly to = signal('');
  protected readonly query = signal('');

  // Mudar qualquer filtro volta à primeira página
  protected readonly page = linkedSignal({
    source: () => [this.status(), this.professionalId(), this.from(), this.to(), this.query()],
    computation: () => 0,
  });

  // "De" depois de "Até": a API responderia 400, por isso nem se faz o pedido
  protected readonly invalidRange = computed(
    () => this.from() !== '' && this.to() !== '' && this.from() > this.to(),
  );
  protected readonly hasFilters = computed(
    () =>
      this.status().length > 0 ||
      this.professionalId() !== null ||
      this.from() !== '' ||
      this.to() !== '' ||
      this.query().trim() !== '',
  );

  protected readonly appointments = this.booking.appointments(() =>
    this.invalidRange()
      ? undefined
      : {
          status: this.status(),
          professionalId: this.professionalId(),
          from: this.from(),
          to: this.to(),
          q: this.query(),
          page: this.page(),
        },
  );

  private readonly now = new Date();
  protected readonly canCancel = (appointment: Appointment) => canCancel(appointment, this.now);

  // Cancelar pede confirmação e motivo (obrigatório para o ADMIN; o cliente vai vê-lo)
  protected readonly confirmingId = signal<number | null>(null);
  protected readonly cancelReason = signal('');
  protected readonly hasReason = computed(() => this.cancelReason().trim().length > 0);
  protected readonly busyId = signal<number | null>(null);

  protected inputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected clearFilters(): void {
    this.status.set([]);
    this.professionalId.set(null);
    this.from.set('');
    this.to.set('');
    this.query.set('');
  }

  protected askCancel(appointment: Appointment): void {
    this.cancelReason.set('');
    this.confirmingId.set(appointment.id);
  }

  protected cancel(appointment: Appointment): void {
    this.busyId.set(appointment.id);
    const done = (message: string, duration: number) => {
      this.busyId.set(null);
      this.confirmingId.set(null);
      this.snackBar.open(message, this.t().common.close, { duration });
      this.appointments.reload();
    };

    this.booking.cancelAppointment(appointment.id, this.cancelReason()).subscribe({
      next: () => done(this.t().appointments.cancelled, 4000),
      error: (error: unknown) => done(apiErrorMessage(error, this.t(), 'booking'), 6000),
    });
  }
}

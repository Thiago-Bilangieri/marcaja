import { DatePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Appointment } from '../../core/booking/booking.models';
import { I18n } from '../../core/i18n/i18n';

// Detalhes de uma marcação; o componente pai passa os dados: <mj-appointment-details [appointment]="a" />
// Na agenda do profissional: [showCustomer]="true" mostra o cliente em vez do profissional.
@Component({
  imports: [DatePipe],
  selector: 'mj-appointment-details',
  template: `
    @let a = appointment();
    <span class="status" [attr.data-status]="a.status">{{ t().status[a.status] }}</span>
    <strong class="service">{{ a.serviceName }}</strong>
    @if (showCustomer()) {
      <span class="muted">{{ t().agenda.customer }}: {{ a.customerName }}</span>
    } @else {
      <span class="muted">{{ t().services.with }} {{ a.professionalName }}</span>
    }
    <span class="when">
      <span class="material-symbols-outlined" aria-hidden="true">event</span>
      {{ a.startAt | date: 'EEEE, d MMM y · HH:mm' : undefined : i18n.locale() }}
    </span>
    @if (a.notes) {
      <span class="muted">“{{ a.notes }}”</span>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
    .service {
      font-size: 1.0625rem;
    }
    .muted {
      color: var(--mj-text-muted);
    }
    .when {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .when .material-symbols-outlined {
      font-size: 18px;
      color: var(--mj-primary);
    }
  `,
})
export class AppointmentDetails {
  readonly appointment = input.required<Appointment>();
  readonly showCustomer = input(false);
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
}

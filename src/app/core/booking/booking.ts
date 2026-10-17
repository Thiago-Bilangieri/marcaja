import { HttpClient, httpResource } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../api/page';
import {
  Appointment,
  AppointmentCreateRequest,
  AppointmentFilter,
  Category,
  ServiceFilter,
  ServiceItem,
  StatusAction,
  StatusChange,
  TimeSlot,
} from './booking.models';

/**
 * Serviços, horários livres e marcações (do cliente, ou todas para o ADMIN).
 *
 * Leituras usam httpResource: recebem uma função com signals e voltam a pedir à API
 * sempre que esses signals mudam (ex.: trocar a categoria). Têm de ser chamadas
 * na criação do componente (como os campos de classe).
 * Escritas (marcar, cancelar) usam o HttpClient normal e devolvem um Observable.
 */
@Service()
export class Booking {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/api`;

  categories() {
    return httpResource<Category[]>(() => `${this.api}/categories`, { defaultValue: [] });
  }

  services(filter: () => ServiceFilter) {
    return httpResource<Page<ServiceItem>>(() => {
      const { categoryId, q } = filter();
      return {
        url: `${this.api}/services`,
        params: {
          size: 100,
          ...(categoryId ? { categoryId } : {}),
          ...(q?.trim() ? { q: q.trim() } : {}),
        },
      };
    });
  }

  service(id: () => number | undefined) {
    return httpResource<ServiceItem>(() => (id() ? `${this.api}/services/${id()}` : undefined));
  }

  // Sem dia escolhido (undefined), o resource fica parado e não faz pedido
  availability(serviceId: () => number | undefined, date: () => string | undefined) {
    return httpResource<TimeSlot[]>(
      () =>
        serviceId() && date()
          ? { url: `${this.api}/services/${serviceId()}/availability`, params: { date: date()! } }
          : undefined,
      { defaultValue: [] },
    );
  }

  myAppointments() {
    return httpResource<Page<Appointment>>(() => ({
      url: `${this.api}/appointments`,
      params: { sort: 'startAt,desc', size: 100 },
    }));
  }

  // Todas as marcações (ADMIN), filtradas e paginadas na API.
  // Sem filtro (undefined, ex.: período inválido), o resource fica parado e não faz pedido
  appointments(filter: () => AppointmentFilter | undefined, pageSize = 20) {
    return httpResource<Page<Appointment>>(() => {
      const current = filter();
      if (!current) {
        return undefined;
      }
      const { status, professionalId, from, to, q, page } = current;
      return {
        url: `${this.api}/appointments`,
        params: {
          sort: 'startAt,desc',
          size: pageSize,
          page,
          ...(status.length ? { status } : {}),
          ...(professionalId ? { professionalId } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
          ...(q.trim() ? { q: q.trim() } : {}),
        },
      };
    });
  }

  // Sem ID (undefined), o resource fica parado: o histórico só é pedido quando alguém o abre
  history(id: () => number | undefined) {
    return httpResource<StatusChange[]>(
      () => (id() ? `${this.api}/appointments/${id()}/history` : undefined),
      { defaultValue: [] },
    );
  }

  createAppointment(request: AppointmentCreateRequest): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.api}/appointments`, request);
  }

  // O motivo é obrigatório para o profissional e opcional para o cliente (sem motivo, vai sem corpo)
  cancelAppointment(id: number, reason?: string): Observable<Appointment> {
    const body = reason?.trim() ? { reason: reason.trim() } : null;
    return this.http.patch<Appointment>(`${this.api}/appointments/${id}/cancel`, body);
  }

  updateStatus(id: number, action: StatusAction): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.api}/appointments/${id}/${action}`, null);
  }
}

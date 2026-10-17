import { HttpClient, httpResource } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../api/page';
import {
  Appointment,
  AppointmentCreateRequest,
  Category,
  ServiceFilter,
  ServiceItem,
  TimeSlot,
} from './booking.models';

/**
 * Serviços, horários livres e marcações do cliente.
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
      const { categoryId, name } = filter();
      return {
        url: `${this.api}/services`,
        params: {
          size: 100,
          ...(categoryId ? { categoryId } : {}),
          ...(name?.trim() ? { name: name.trim() } : {}),
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

  createAppointment(request: AppointmentCreateRequest): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.api}/appointments`, request);
  }

  cancelAppointment(id: number): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.api}/appointments/${id}/cancel`, null);
  }
}

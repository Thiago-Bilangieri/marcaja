import { HttpClient, httpResource } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../api/page';
import { ServiceItem } from '../booking/booking.models';
import { ServiceRequest, WorkingHours } from './professional.models';

/**
 * Dados do profissional com sessão iniciada. Os endpoints "/me" usam o token para saber quem é,
 * por isso o front-end não precisa do ID do profissional.
 */
@Service()
export class Professional {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/api/professionals/me/working-hours`;
  private readonly servicesUrl = `${environment.apiUrl}/api/services`;

  myWorkingHours() {
    return httpResource<WorkingHours[]>(() => this.url);
  }

  // Substitui a semana inteira: o que não for enviado deixa de existir
  replaceMyWorkingHours(hours: WorkingHours[]): Observable<WorkingHours[]> {
    return this.http.put<WorkingHours[]>(this.url, { hours });
  }

  // Para um PROFESSIONAL, GET /api/services devolve só os seus serviços, incluindo os inativos
  myServices() {
    return httpResource<Page<ServiceItem>>(() => ({
      url: this.servicesUrl,
      params: { size: 100, sort: 'name' },
    }));
  }

  createService(request: ServiceRequest): Observable<ServiceItem> {
    return this.http.post<ServiceItem>(this.servicesUrl, request);
  }

  updateService(id: number, request: ServiceRequest): Observable<ServiceItem> {
    return this.http.put<ServiceItem>(`${this.servicesUrl}/${id}`, request);
  }

  // 409 se o serviço já tiver marcações: nesse caso só se pode desativar
  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.servicesUrl}/${id}`);
  }
}

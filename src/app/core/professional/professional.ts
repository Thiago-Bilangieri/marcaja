import { HttpClient, httpResource } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WorkingHours } from './professional.models';

/**
 * Dados do profissional com sessão iniciada. Os endpoints "/me" usam o token para saber quem é,
 * por isso o front-end não precisa do ID do profissional.
 */
@Service()
export class Professional {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/api/professionals/me/working-hours`;

  myWorkingHours() {
    return httpResource<WorkingHours[]>(() => this.url);
  }

  // Substitui a semana inteira: o que não for enviado deixa de existir
  replaceMyWorkingHours(hours: WorkingHours[]): Observable<WorkingHours[]> {
    return this.http.put<WorkingHours[]>(this.url, { hours });
  }
}

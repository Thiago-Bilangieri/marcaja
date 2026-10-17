import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CategoryRequest } from '../booking/booking.models';

/**
 * Área do administrador: as categorias que os profissionais escolhem nos serviços.
 * A listagem é pública e está em Booking.categories(); aqui ficam só as alterações.
 */
@Service()
export class Categories {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/api/categories`;

  create(request: CategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.url, request);
  }

  update(id: number, request: CategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.url}/${id}`, request);
  }

  // 409 se a categoria ainda tiver serviços associados
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

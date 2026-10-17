import { HttpClient, httpResource } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../api/page';
import { ApprovalAction, ApprovalStatus, ProfessionalAccount } from './approvals.models';

/** Área do administrador: aprovar ou rejeitar os profissionais que se registam. */
@Service()
export class Approvals {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/api/admin/professionals`;

  // Trocar o separador muda o signal `status` e o httpResource volta a pedir à API
  professionals(status: () => ApprovalStatus) {
    return httpResource<Page<ProfessionalAccount>>(() => ({
      url: this.url,
      params: { status: status(), size: 100 },
    }));
  }

  updateApproval(id: number, action: ApprovalAction): Observable<ProfessionalAccount> {
    return this.http.patch<ProfessionalAccount>(`${this.url}/${id}/${action}`, null);
  }
}

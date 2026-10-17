import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Approvals } from '../../core/admin/approvals';
import {
  APPROVAL_STATUSES,
  ApprovalAction,
  ApprovalStatus,
  ProfessionalAccount,
} from '../../core/admin/approvals.models';
import { apiErrorMessage } from '../../core/api/api-error';
import { I18n } from '../../core/i18n/i18n';

// Aprovação de profissionais: um separador por estado. Nada é definitivo:
// um rejeitado pode ser aprovado mais tarde e um aprovado pode perder o acesso.
@Component({
  imports: [DatePipe, MatButtonModule, MatButtonToggleModule, MatProgressSpinnerModule],
  selector: 'mj-admin',
  styleUrls: ['../account/account.scss', './admin.scss'],
  templateUrl: './admin.html',
})
export class Admin {
  private readonly approvals = inject(Approvals);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  protected readonly statuses = APPROVAL_STATUSES;
  protected readonly status = signal<ApprovalStatus>('PENDING');
  protected readonly professionals = this.approvals.professionals(this.status);

  // Enquanto um pedido corre, os botões desse profissional ficam desativados
  protected readonly busyId = signal<number | null>(null);

  protected update(professional: ProfessionalAccount, action: ApprovalAction): void {
    this.busyId.set(professional.id);
    const done = (message: string, duration: number) => {
      this.busyId.set(null);
      this.snackBar.open(message, this.t().common.close, { duration });
      // O profissional muda de estado, por isso sai da lista deste separador
      this.professionals.reload();
    };

    this.approvals.updateApproval(professional.id, action).subscribe({
      next: () => done(this.t().admin.updated[action].replace('{name}', professional.name), 4000),
      error: (error: unknown) => done(apiErrorMessage(error, this.t(), 'admin'), 6000),
    });
  }
}

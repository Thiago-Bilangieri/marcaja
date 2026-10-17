import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { apiErrorMessage } from '../../core/api/api-error';
import { Booking } from '../../core/booking/booking';
import { ServiceItem } from '../../core/booking/booking.models';
import { I18n } from '../../core/i18n/i18n';
import { Professional } from '../../core/professional/professional';
import { ServiceForm } from './service-form';

/**
 * Os serviços do profissional: criar, editar, ativar/desativar e remover.
 * Um serviço inativo deixa de aparecer no catálogo, mas as marcações já feitas mantêm-se.
 */
@Component({
  imports: [CurrencyPipe, MatButtonModule, MatProgressSpinnerModule, ServiceForm],
  selector: 'mj-my-services',
  styleUrl: './my-services.scss',
  templateUrl: './my-services.html',
})
export class MyServices {
  private readonly professional = inject(Professional);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  protected readonly services = this.professional.myServices();
  protected readonly categories = inject(Booking).categories();

  // null = formulário fechado; 'new' = criar; um serviço = editar esse
  protected readonly editing = signal<ServiceItem | 'new' | null>(null);
  protected readonly editingService = computed(() => {
    const editing = this.editing();
    return editing === 'new' ? null : editing;
  });

  protected readonly confirmingDeleteId = signal<number | null>(null);
  protected readonly busyId = signal<number | null>(null);

  protected onSaved(): void {
    const message =
      this.editing() === 'new' ? this.t().myServices.created : this.t().myServices.saved;
    this.editing.set(null);
    this.snackBar.open(message, this.t().common.close, { duration: 4000 });
    this.services.reload();
  }

  protected toggleActive(service: ServiceItem): void {
    const request = this.professional.updateService(service.id, {
      name: service.name,
      description: service.description,
      categoryId: service.categoryId,
      price: service.price,
      durationMinutes: service.durationMinutes,
      active: !service.active,
    });
    const message = service.active
      ? this.t().myServices.deactivated
      : this.t().myServices.activated;
    this.run(service, request, message);
  }

  protected remove(service: ServiceItem): void {
    this.run(service, this.professional.deleteService(service.id), this.t().myServices.removed);
  }

  // Corre o pedido, avisa o resultado e volta a carregar a lista
  private run(service: ServiceItem, request: Observable<unknown>, success: string): void {
    this.busyId.set(service.id);
    const done = (message: string, duration: number) => {
      this.busyId.set(null);
      this.confirmingDeleteId.set(null);
      this.snackBar.open(message, this.t().common.close, { duration });
      this.services.reload();
    };

    request.subscribe({
      next: () => done(success, 4000),
      error: (error: unknown) => done(apiErrorMessage(error, this.t(), 'services'), 6000),
    });
  }
}

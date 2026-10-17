import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { apiErrorMessage } from '../../core/api/api-error';
import { Category, ServiceItem } from '../../core/booking/booking.models';
import { I18n } from '../../core/i18n/i18n';
import { Professional } from '../../core/professional/professional';
import { ServiceRequest } from '../../core/professional/professional.models';

/**
 * Formulário de criar ou editar um serviço. O pai decide qual:
 * <mj-service-form [service]="null" /> cria; [service]="s" edita.
 * Avisa o pai com (saved) ou (cancelled) — o componente não sabe onde está a lista.
 */
@Component({
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  selector: 'mj-service-form',
  styleUrl: './service-form.scss',
  templateUrl: './service-form.html',
})
export class ServiceForm {
  private readonly professional = inject(Professional);
  protected readonly t = inject(I18n).t;

  readonly service = input<ServiceItem | null>(null);
  readonly categories = input<Category[]>([]);
  readonly saved = output<ServiceItem>();
  readonly cancelled = output<void>();

  protected readonly isNew = computed(() => this.service() === null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    // null = sem categoria; por isso este controlo aceita null (os outros não)
    categoryId: new FormControl<number | null>(null),
    price: [0, [Validators.required, Validators.min(0.01)]],
    durationMinutes: [30, [Validators.required, Validators.min(5)]],
  });

  protected readonly saving = signal(false);
  private readonly failure = signal<unknown>(null);
  protected readonly errorMessage = computed(() =>
    this.failure() ? apiErrorMessage(this.failure(), this.t(), 'services') : null,
  );

  constructor() {
    // Ao abrir para editar, o formulário mostra os dados do serviço; para criar, valores por omissão
    effect(() => {
      const service = this.service();
      this.form.reset({
        name: service?.name ?? '',
        description: service?.description ?? '',
        categoryId: service?.categoryId ?? null,
        price: service?.price ?? 0,
        durationMinutes: service?.durationMinutes ?? 30,
      });
      this.failure.set(null);
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.failure.set(null);

    const { name, description, categoryId, price, durationMinutes } = this.form.getRawValue();
    const request: ServiceRequest = {
      name: name.trim(),
      description: description.trim() || null,
      categoryId,
      price,
      durationMinutes,
    };

    const service = this.service();
    // Editar mantém o estado ativo/inativo: muda-se na lista, com o botão próprio
    const call = service
      ? this.professional.updateService(service.id, { ...request, active: service.active })
      : this.professional.createService(request);

    call.subscribe({
      next: (result) => {
        this.saving.set(false);
        this.saved.emit(result);
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.failure.set(error);
      },
    });
  }
}

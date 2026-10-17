import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Categories } from '../../core/admin/categories';
import { apiErrorMessage } from '../../core/api/api-error';
import { Booking } from '../../core/booking/booking';
import { Category } from '../../core/booking/booking.models';
import { I18n } from '../../core/i18n/i18n';

/**
 * Categorias do catálogo, geridas pelo ADMIN. Os profissionais só escolhem entre estas
 * (ou "Sem categoria"), para o filtro dos clientes não se encher de nomes repetidos.
 */
@Component({
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  selector: 'mj-category-admin',
  styleUrls: ['../account/account.scss', './category-admin.scss'],
  templateUrl: './category-admin.html',
})
export class CategoryAdmin {
  private readonly categories = inject(Categories);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly t = inject(I18n).t;

  protected readonly list = inject(Booking).categories();

  // null = formulário fechado; 'new' = criar; uma categoria = editar essa
  protected readonly editing = signal<Category | 'new' | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
  });
  protected readonly formError = signal<string | null>(null);

  protected readonly confirmingDeleteId = signal<number | null>(null);
  protected readonly busy = signal(false);

  protected open(category: Category | 'new'): void {
    this.editing.set(category);
    this.form.reset({
      name: category === 'new' ? '' : category.name,
      description: category === 'new' ? '' : (category.description ?? ''),
    });
    this.formError.set(null);
  }

  protected submit(): void {
    const editing = this.editing();
    if (!editing) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, description } = this.form.getRawValue();
    const request = { name: name.trim(), description: description.trim() || null };
    const call =
      editing === 'new'
        ? this.categories.create(request)
        : this.categories.update(editing.id, request);

    this.busy.set(true);
    this.formError.set(null);
    call.subscribe({
      next: () => {
        this.busy.set(false);
        this.editing.set(null);
        const message =
          editing === 'new' ? this.t().admin.categories.created : this.t().admin.categories.saved;
        this.snackBar.open(message, this.t().common.close, { duration: 4000 });
        this.list.reload();
      },
      error: (error: unknown) => {
        this.busy.set(false);
        this.formError.set(apiErrorMessage(error, this.t(), 'categories'));
      },
    });
  }

  protected remove(category: Category): void {
    this.busy.set(true);
    const done = (message: string, duration: number) => {
      this.busy.set(false);
      this.confirmingDeleteId.set(null);
      this.snackBar.open(message, this.t().common.close, { duration });
      this.list.reload();
    };

    this.categories.delete(category.id).subscribe({
      next: () => done(this.t().admin.categories.removed, 4000),
      error: (error: unknown) => done(apiErrorMessage(error, this.t(), 'categories'), 6000),
    });
  }
}

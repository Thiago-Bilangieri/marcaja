import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { Auth } from '../../core/auth/auth';
import { Booking } from '../../core/booking/booking';
import { I18n } from '../../core/i18n/i18n';

@Component({
  imports: [
    CurrencyPipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  selector: 'mj-services',
  styleUrl: './services.scss',
  templateUrl: './services.html',
})
export class Services {
  private readonly booking = inject(Booking);
  private readonly auth = inject(Auth);
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  // Filtros: quando mudam, o httpResource de serviços volta a pedir à API sozinho
  protected readonly categoryId = signal<number | null>(null);
  protected readonly query = signal('');

  protected readonly categories = this.booking.categories();
  protected readonly services = this.booking.services(() => ({
    categoryId: this.categoryId(),
    q: this.query(),
  }));

  // Só o cliente marca para si próprio; os outros perfis veem a lista sem o botão
  protected readonly canBook = computed(() => this.auth.currentUser()?.role === 'CUSTOMER');

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}

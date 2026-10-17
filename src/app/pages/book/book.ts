import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../core/api/api-error';
import { Booking } from '../../core/booking/booking';
import { TimeSlot, toIsoDate } from '../../core/booking/booking.models';
import { I18n } from '../../core/i18n/i18n';

const DAYS_AHEAD = 14;

@Component({
  imports: [
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  selector: 'mj-book',
  styleUrl: './book.scss',
  templateUrl: './book.html',
})
export class Book {
  private readonly booking = inject(Booking);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  // :id da rota services/:id/book (vem como texto)
  readonly id = input.required<string>();
  private readonly serviceId = computed(() => Number(this.id()) || undefined);

  // Próximos 14 dias, a começar hoje
  protected readonly days = Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() + i);
    return { iso: toIsoDate(day), date: day };
  });

  protected readonly selectedDay = signal<string | undefined>(undefined);
  // linkedSignal: volta a null sempre que o dia muda (a hora escolhida era de outro dia)
  protected readonly selectedSlot = linkedSignal<string | undefined, TimeSlot | null>({
    source: this.selectedDay,
    computation: () => null,
  });
  protected readonly notes = signal('');

  protected readonly service = this.booking.service(this.serviceId);
  protected readonly slots = this.booking.availability(this.serviceId, this.selectedDay);

  protected readonly saving = signal(false);
  private readonly failure = signal<unknown>(null);
  protected readonly errorMessage = computed(() =>
    this.failure() ? apiErrorMessage(this.failure(), this.t(), 'booking') : null,
  );

  // "2026-10-21T09:30:00" → "09:30" (a API já envia a hora local do negócio)
  protected time(dateTime: string): string {
    return dateTime.slice(11, 16);
  }

  protected selectDay(iso: string): void {
    this.selectedDay.set(iso);
    this.failure.set(null);
  }

  protected onNotes(event: Event): void {
    this.notes.set((event.target as HTMLTextAreaElement).value);
  }

  protected confirm(): void {
    const slot = this.selectedSlot();
    const serviceId = this.serviceId();
    if (!slot || !serviceId) {
      return;
    }
    this.saving.set(true);
    this.failure.set(null);

    this.booking
      .createAppointment({ serviceId, startAt: slot.startAt, notes: this.notes().trim() || undefined })
      .subscribe({
        next: () => {
          this.snackBar.open(this.t().book.success, this.t().common.close, { duration: 4000 });
          this.router.navigate(['/account']);
        },
        error: (error: unknown) => {
          this.failure.set(error);
          this.saving.set(false);
          // O horário pode ter sido ocupado entretanto: atualiza a lista
          this.selectedSlot.set(null);
          this.slots.reload();
        },
      });
  }
}

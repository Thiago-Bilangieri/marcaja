import { DatePipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Booking } from '../../core/booking/booking';
import { I18n } from '../../core/i18n/i18n';

/**
 * Histórico de estados de uma marcação (quem marcou, confirmou, cancelou...), fechado por omissão.
 * O pedido à API só é feito quando o utilizador abre: numa lista com 50 marcações não há 50 pedidos.
 */
@Component({
  imports: [DatePipe, MatButtonModule],
  selector: 'mj-appointment-timeline',
  template: `
    <button
      matButton
      type="button"
      class="toggle"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="listId"
      (click)="open.set(!open())"
    >
      <span class="material-symbols-outlined" aria-hidden="true">
        {{ open() ? 'expand_less' : 'history' }}
      </span>
      {{ open() ? t().timeline.hide : t().timeline.show }}
    </button>

    @if (open()) {
      <div [id]="listId">
        @if (history.error()) {
          <p class="muted" role="alert">{{ t().errors.loadFailed }}</p>
        } @else if (history.isLoading()) {
          <p class="muted" role="status">{{ t().common.loading }}</p>
        } @else {
          <ol class="timeline">
            @for (entry of history.value(); track $index) {
              <li>
                <span class="dot" [attr.data-status]="entry.toStatus" aria-hidden="true"></span>
                <div>
                  <strong>{{ t().timeline.events[entry.toStatus] }}</strong>
                  @let role = t().roles[entry.changedByRole];
                  <span class="muted">
                    {{ t().timeline.by }} {{ entry.changedByName }} ({{ role }}) ·
                    {{ entry.changedAt | date: 'd MMM y, HH:mm' : undefined : i18n.locale() }}
                  </span>
                  @if (entry.reason) {
                    <span class="reason">“{{ entry.reason }}”</span>
                  }
                </div>
              </li>
            } @empty {
              <li class="muted">{{ t().timeline.empty }}</li>
            }
          </ol>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .toggle {
      margin-left: -12px;
    }
    .muted {
      color: var(--mj-text-muted);
    }
    .timeline {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 4px 0 0;
      padding: 0 0 0 4px;
      list-style: none;
    }
    li {
      display: flex;
      gap: 10px;
    }
    li > div {
      display: flex;
      flex-direction: column;
    }
    .dot {
      flex-shrink: 0;
      width: 10px;
      height: 10px;
      margin-top: 5px;
      border-radius: 50%;
      background: var(--mj-status-cancelled);
    }
    .dot[data-status='SCHEDULED'] {
      background: var(--mj-status-scheduled);
    }
    .dot[data-status='CONFIRMED'] {
      background: var(--mj-status-confirmed);
    }
    .dot[data-status='COMPLETED'] {
      background: var(--mj-status-completed);
    }
    .dot[data-status='NO_SHOW'] {
      background: var(--mj-status-no-show);
    }
    .reason {
      font-size: 0.875rem;
    }
  `,
})
export class AppointmentTimeline {
  private static nextId = 0;

  readonly appointmentId = input.required<number>();
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  protected readonly open = signal(false);
  protected readonly listId = `mj-timeline-${AppointmentTimeline.nextId++}`;
  protected readonly history = inject(Booking).history(() =>
    this.open() ? this.appointmentId() : undefined,
  );
}

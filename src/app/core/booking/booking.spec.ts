import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Booking } from './booking';
import {
  Appointment,
  AppointmentStatus,
  canCancel,
  canConfirm,
  canFinish,
  toIsoDate,
} from './booking.models';

const API = `${environment.apiUrl}/api`;

function appointment(status: AppointmentStatus, startAt: string): Appointment {
  return {
    id: 1,
    customerName: 'João Silva',
    serviceId: 1,
    serviceName: 'Corte',
    professionalName: 'Ana Ribeiro',
    startAt,
    endAt: startAt,
    status,
    notes: null,
    cancelledByRole: null,
    cancellationReason: null,
  };
}

describe('booking rules', () => {
  const now = new Date('2026-10-17T12:00:00');

  it('canCancel only active appointments that have not started', () => {
    expect(canCancel(appointment('SCHEDULED', '2026-10-18T10:00:00'), now)).toBe(true);
    expect(canCancel(appointment('CONFIRMED', '2026-10-18T10:00:00'), now)).toBe(true);
    expect(canCancel(appointment('SCHEDULED', '2026-10-17T11:00:00'), now)).toBe(false);
    expect(canCancel(appointment('CANCELLED', '2026-10-18T10:00:00'), now)).toBe(false);
    expect(canCancel(appointment('COMPLETED', '2026-10-18T10:00:00'), now)).toBe(false);
  });

  it('canConfirm only scheduled appointments that have not started', () => {
    expect(canConfirm(appointment('SCHEDULED', '2026-10-18T10:00:00'), now)).toBe(true);
    expect(canConfirm(appointment('CONFIRMED', '2026-10-18T10:00:00'), now)).toBe(false);
    expect(canConfirm(appointment('SCHEDULED', '2026-10-17T11:00:00'), now)).toBe(false);
  });

  it('canFinish only active appointments that have already started', () => {
    expect(canFinish(appointment('SCHEDULED', '2026-10-17T11:00:00'), now)).toBe(true);
    expect(canFinish(appointment('CONFIRMED', '2026-10-17T12:00:00'), now)).toBe(true);
    expect(canFinish(appointment('CONFIRMED', '2026-10-17T12:30:00'), now)).toBe(false);
    expect(canFinish(appointment('NO_SHOW', '2026-10-17T11:00:00'), now)).toBe(false);
    expect(canFinish(appointment('CANCELLED', '2026-10-17T11:00:00'), now)).toBe(false);
  });

  it('toIsoDate keeps the local day', () => {
    expect(toIsoDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });
});

describe('Booking', () => {
  let booking: Booking;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    booking = TestBed.inject(Booking);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('services() sends only the filters that are set and refetches when they change', async () => {
    const categoryId = signal<number | null>(null);
    const services = TestBed.runInInjectionContext(() =>
      booking.services(() => ({ categoryId: categoryId(), q: '  ana ' })),
    );

    TestBed.tick();
    const first = http.expectOne((r) => r.url === `${API}/services`);
    expect(first.request.params.get('q')).toBe('ana');
    expect(first.request.params.has('categoryId')).toBe(false);
    first.flush({ content: [], page: { size: 100, number: 0, totalElements: 0, totalPages: 0 } });

    categoryId.set(2);
    TestBed.tick();
    const second = http.expectOne((r) => r.url === `${API}/services`);
    expect(second.request.params.get('categoryId')).toBe('2');
    second.flush({ content: [], page: { size: 100, number: 0, totalElements: 0, totalPages: 0 } });

    await TestBed.inject(ApplicationRef).whenStable();
    expect(services.hasValue()).toBe(true);
  });

  it('availability() waits until a day is picked', () => {
    const day = signal<string | undefined>(undefined);
    TestBed.runInInjectionContext(() => booking.availability(() => 1, day));

    TestBed.tick();
    http.expectNone(() => true);

    day.set('2026-10-21');
    TestBed.tick();
    const request = http.expectOne((r) => r.url === `${API}/services/1/availability`);
    expect(request.request.params.get('date')).toBe('2026-10-21');
    request.flush([]);
  });

  it('createAppointment and cancelAppointment call the right endpoints', () => {
    booking.createAppointment({ serviceId: 1, startAt: '2026-10-21T09:00:00' }).subscribe();
    const create = http.expectOne(`${API}/appointments`);
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual({ serviceId: 1, startAt: '2026-10-21T09:00:00' });
    create.flush(appointment('SCHEDULED', '2026-10-21T09:00:00'));

    booking.cancelAppointment(7).subscribe();
    const cancel = http.expectOne(`${API}/appointments/7/cancel`);
    expect(cancel.request.method).toBe('PATCH');
    expect(cancel.request.body).toBeNull();
    cancel.flush(appointment('CANCELLED', '2026-10-21T09:00:00'));
  });

  it('cancelAppointment sends the trimmed reason when there is one', () => {
    booking.cancelAppointment(7, '  Estou doente  ').subscribe();
    const cancel = http.expectOne(`${API}/appointments/7/cancel`);
    expect(cancel.request.body).toEqual({ reason: 'Estou doente' });
    cancel.flush(appointment('CANCELLED', '2026-10-21T09:00:00'));

    booking.cancelAppointment(8, '   ').subscribe();
    const blank = http.expectOne(`${API}/appointments/8/cancel`);
    expect(blank.request.body).toBeNull();
    blank.flush(appointment('CANCELLED', '2026-10-21T09:00:00'));
  });

  it('updateStatus sends a PATCH to the action endpoint', () => {
    for (const action of ['confirm', 'complete', 'no-show'] as const) {
      booking.updateStatus(7, action).subscribe();
      const request = http.expectOne(`${API}/appointments/7/${action}`);
      expect(request.request.method).toBe('PATCH');
      request.flush(appointment('CONFIRMED', '2026-10-21T09:00:00'));
    }
  });
});

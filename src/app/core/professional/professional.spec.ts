import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Professional } from './professional';
import { WorkingHours } from './professional.models';

const URL = `${environment.apiUrl}/api/professionals/me/working-hours`;

describe('Professional', () => {
  let professional: Professional;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    professional = TestBed.inject(Professional);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('myWorkingHours() reads the signed-in professional schedule', async () => {
    const hours = TestBed.runInInjectionContext(() => professional.myWorkingHours());

    TestBed.tick();
    const request = http.expectOne(URL);
    expect(request.request.method).toBe('GET');
    request.flush([{ dayOfWeek: 'TUESDAY', startTime: '09:00:00', endTime: '13:00:00' }]);

    await TestBed.inject(ApplicationRef).whenStable();
    expect(hours.value()).toHaveLength(1);
  });

  it('replaceMyWorkingHours() sends the whole week in a PUT', () => {
    const week: WorkingHours[] = [{ dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '13:00' }];

    professional.replaceMyWorkingHours(week).subscribe();
    const request = http.expectOne(URL);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ hours: week });
    request.flush(week);
  });

  it('manages the professional services through /api/services', () => {
    const services = `${environment.apiUrl}/api/services`;
    const body = {
      name: 'Corte',
      description: null,
      price: 15,
      durationMinutes: 30,
      categoryId: 1,
    };

    TestBed.runInInjectionContext(() => professional.myServices());
    TestBed.tick();
    const list = http.expectOne((r) => r.url === services && r.method === 'GET');
    expect(list.request.params.get('sort')).toBe('name');
    list.flush({ content: [], page: { size: 100, number: 0, totalElements: 0, totalPages: 0 } });

    professional.createService(body).subscribe();
    const create = http.expectOne((r) => r.url === services && r.method === 'POST');
    expect(create.request.body).toEqual(body);
    create.flush({});

    professional.updateService(3, { ...body, active: false }).subscribe();
    const update = http.expectOne(`${services}/3`);
    expect(update.request.method).toBe('PUT');
    expect(update.request.body.active).toBe(false);
    update.flush({});

    professional.deleteService(3).subscribe();
    const remove = http.expectOne(`${services}/3`);
    expect(remove.request.method).toBe('DELETE');
    remove.flush(null, { status: 204, statusText: 'No Content' });
  });
});

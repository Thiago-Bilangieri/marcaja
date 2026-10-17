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
});

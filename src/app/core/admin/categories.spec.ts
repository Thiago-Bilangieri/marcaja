import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Categories } from './categories';

const URL = `${environment.apiUrl}/api/categories`;

describe('Categories', () => {
  let categories: Categories;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    categories = TestBed.inject(Categories);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('creates, updates and deletes categories through /api/categories', () => {
    const body = { name: 'Massagem', description: null };

    categories.create(body).subscribe();
    const create = http.expectOne(URL);
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(body);
    create.flush({ id: 7, ...body });

    categories.update(7, { ...body, description: 'Relaxante' }).subscribe();
    const update = http.expectOne(`${URL}/7`);
    expect(update.request.method).toBe('PUT');
    expect(update.request.body.description).toBe('Relaxante');
    update.flush({ id: 7, ...body });

    categories.delete(7).subscribe();
    const remove = http.expectOne(`${URL}/7`);
    expect(remove.request.method).toBe('DELETE');
    remove.flush(null, { status: 204, statusText: 'No Content' });
  });
});

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Auth } from './auth';
import { authInterceptor } from './auth.interceptor';
import { homeFor } from './auth.models';

const API = `${environment.apiUrl}/api`;

// JWT de teste: só o payload interessa ({"sub":"joao@email.com","exp":<segundos>})
function fakeJwt(expiresInSeconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  return `header.${btoa(JSON.stringify({ sub: 'joao@email.com', exp }))}.signature`;
}

describe('homeFor', () => {
  it('sends professionals to their agenda and everyone else to their appointments', () => {
    expect(homeFor('PROFESSIONAL')).toBe('/agenda');
    expect(homeFor('CUSTOMER')).toBe('/account');
    expect(homeFor(undefined)).toBe('/account');
  });
});

describe('Auth', () => {
  let auth: Auth;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        // O interceptor navega para /login no 401
        provideRouter([{ path: 'login', children: [] }]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    auth = TestBed.inject(Auth);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('login stores the session and its expiration', () => {
    const token = fakeJwt(3600);
    auth.login({ email: 'joao@email.com', password: 'password' }).subscribe();

    http.expectOne(`${API}/auth/login`).flush({ token, email: 'joao@email.com', role: 'CUSTOMER' });

    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.currentUser()?.role).toBe('CUSTOMER');
    expect(auth.currentUser()?.expiresAt).toBeGreaterThan(Date.now());
    expect(localStorage.getItem('mj.session')).toContain(token);
  });

  it('registerCustomer signs in right after registering', () => {
    auth
      .registerCustomer({ name: 'João', email: 'joao@email.com', password: 'password', phone: '912000000' })
      .subscribe();

    http.expectOne(`${API}/auth/register`).flush(null, { status: 201, statusText: 'Created' });
    http
      .expectOne(`${API}/auth/login`)
      .flush({ token: fakeJwt(3600), email: 'joao@email.com', role: 'CUSTOMER' });

    expect(auth.isAuthenticated()).toBe(true);
  });

  it('an expired token ends the session', () => {
    auth.login({ email: 'joao@email.com', password: 'password' }).subscribe();
    http.expectOne(`${API}/auth/login`).flush({ token: fakeJwt(-60), email: 'joao@email.com', role: 'CUSTOMER' });

    expect(auth.token()).toBeNull();
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('the interceptor sends the token to the API and signs out on 401', () => {
    const token = fakeJwt(3600);
    auth.login({ email: 'joao@email.com', password: 'password' }).subscribe();
    http.expectOne(`${API}/auth/login`).flush({ token, email: 'joao@email.com', role: 'CUSTOMER' });

    TestBed.inject(HttpClient).get(`${API}/customers/me`).subscribe({ error: () => undefined });
    const request = http.expectOne(`${API}/customers/me`);
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${token}`);

    request.flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(auth.isAuthenticated()).toBe(false);
  });
});

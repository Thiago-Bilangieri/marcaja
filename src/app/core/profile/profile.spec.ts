import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Auth } from '../auth/auth';
import { Profile } from './profile';
import { UserProfile, initials } from './profile.models';

const ME = `${environment.apiUrl}/api/users/me`;

function fakeJwt(sub: string): string {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `header.${btoa(JSON.stringify({ sub, exp }))}.signature`;
}

const joao: UserProfile = {
  id: 7,
  name: 'João Silva',
  email: 'joao.silva@email.com',
  role: 'CUSTOMER',
  phone: '912345001',
  createdAt: '2026-10-01T10:00:00',
};

describe('initials', () => {
  it('uses the first and last name', () => {
    expect(initials('Ana Maria Ribeiro')).toBe('AR');
    expect(initials('  joao  ')).toBe('J');
  });
});

describe('Profile', () => {
  let profile: Profile;
  let auth: Auth;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    auth = TestBed.inject(Auth);
    profile = TestBed.inject(Profile);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('only loads /me with a session, and reloads when the token changes', async () => {
    TestBed.tick();
    http.expectNone(ME);

    auth.startSession({
      token: fakeJwt('joao.silva@email.com'),
      email: joao.email,
      role: 'CUSTOMER',
    });
    TestBed.tick();
    http.expectOne(ME).flush(joao);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(profile.me.value()?.name).toBe('João Silva');

    // Token novo (ex.: depois de mudar a palavra-passe) → pede o perfil outra vez
    auth.startSession({
      token: fakeJwt('joao.novo@email.com'),
      email: 'joao.novo@email.com',
      role: 'CUSTOMER',
    });
    TestBed.tick();
    http.expectOne(ME).flush({ ...joao, email: 'joao.novo@email.com' });
  });

  it('changeEmail swaps the stored session for the new token', () => {
    const token = fakeJwt('joao.novo@email.com');
    profile
      .changeEmail({ newEmail: 'joao.novo@email.com', currentPassword: 'password' })
      .subscribe();

    const request = http.expectOne(`${ME}/email`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      newEmail: 'joao.novo@email.com',
      currentPassword: 'password',
    });
    request.flush({ token, email: 'joao.novo@email.com', role: 'CUSTOMER' });

    expect(auth.token()).toBe(token);
    expect(auth.currentUser()?.email).toBe('joao.novo@email.com');
  });

  it('changePassword also keeps the session with the new token', () => {
    const token = fakeJwt('joao.silva@email.com');
    profile
      .changePassword({ currentPassword: 'password', newPassword: 'novaPassword1' })
      .subscribe();

    const request = http.expectOne(`${ME}/password`);
    expect(request.request.method).toBe('PATCH');
    request.flush({ token, email: joao.email, role: 'CUSTOMER' });

    expect(auth.token()).toBe(token);
  });

  it('update sends the details and refreshes the shared profile', () => {
    profile.update({ name: 'João Pedro Silva', phone: '919999999' }).subscribe();

    const request = http.expectOne(ME);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ name: 'João Pedro Silva', phone: '919999999' });
    request.flush({ ...joao, name: 'João Pedro Silva' });

    expect(profile.me.value()?.name).toBe('João Pedro Silva');
  });

  it('deleteAccount sends the password in the body and signs out', () => {
    auth.startSession({ token: fakeJwt(joao.email), email: joao.email, role: 'CUSTOMER' });
    TestBed.tick();
    http.expectOne(ME).flush(joao);

    profile.deleteAccount('password').subscribe();
    const request = http.expectOne((r) => r.url === ME && r.method === 'DELETE');
    expect(request.request.body).toEqual({ currentPassword: 'password' });
    request.flush(null, { status: 204, statusText: 'No Content' });

    expect(auth.isAuthenticated()).toBe(false);
  });
});

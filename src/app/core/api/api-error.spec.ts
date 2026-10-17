import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { translations } from '../i18n/translations';
import { apiErrorMessage } from './api-error';

const t = translations.en;

function httpError(status: number, error: unknown = null, headers?: HttpHeaders): HttpErrorResponse {
  return new HttpErrorResponse({ status, error, headers });
}

describe('apiErrorMessage', () => {
  it('maps login errors by status', () => {
    expect(apiErrorMessage(httpError(0), t, 'login')).toBe(t.errors.network);
    expect(apiErrorMessage(httpError(401), t, 'login')).toBe(t.errors.invalidCredentials);
    expect(apiErrorMessage(httpError(403), t, 'login')).toBe(t.errors.accountBlocked);
  });

  it('uses Retry-After to tell how long the login is locked', () => {
    const error = httpError(429, null, new HttpHeaders({ 'Retry-After': '600' }));
    expect(apiErrorMessage(error, t, 'login')).toBe('Too many failed attempts. Try again in 10 min.');
  });

  it('tells a duplicated email apart from invalid fields on register', () => {
    expect(apiErrorMessage(httpError(400, { detail: 'Já existe...' }), t, 'register')).toBe(t.errors.emailTaken);
    expect(apiErrorMessage(httpError(400, { errors: { email: 'Email inválido' } }), t, 'register')).toBe(
      t.errors.invalidData,
    );
  });
});

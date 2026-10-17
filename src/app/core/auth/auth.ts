import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  ProfessionalRegisterRequest,
  RegisterRequest,
  Session,
} from './auth.models';

const STORAGE_KEY = 'mj.session';

/** Login, registo e sessão do utilizador (token JWT). */
@Service()
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/auth`;

  private readonly session = signal<Session | null>(this.restoreSession());

  readonly currentUser = this.session.asReadonly();
  readonly isAuthenticated = computed(() => this.session() !== null);

  login(request: LoginRequest): Observable<Session> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, request)
      .pipe(map((response) => this.startSession(response)));
  }

  // Também usado quando a API emite um token novo (mudança de email ou de palavra-passe):
  // o antigo deixa de ser aceite, por isso tem de ser substituído logo
  startSession(response: AuthResponse): Session {
    const session = { ...response, expiresAt: readExpiration(response.token) };
    this.saveSession(session);
    return session;
  }

  // O cliente pode entrar logo a seguir ao registo (201), por isso fazemos login automático
  registerCustomer(request: RegisterRequest): Observable<Session> {
    return this.http
      .post<void>(`${this.baseUrl}/register`, request)
      .pipe(switchMap(() => this.login({ email: request.email, password: request.password })));
  }

  // O profissional fica pendente (202) até um ADMIN aprovar: não há login
  registerProfessional(request: ProfessionalRegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/register/professional`, request);
  }

  // A API é stateless: sair é só esquecer o token
  logout(): void {
    this.session.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // nada a limpar
    }
  }

  token(): string | null {
    const session = this.session();
    if (session && session.expiresAt <= Date.now()) {
      this.logout();
      return null;
    }
    return session?.token ?? null;
  }

  private saveSession(session: Session): void {
    this.session.set(session);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Sem localStorage a sessão dura até fechar o separador
    }
  }

  private restoreSession(): Session | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const session = saved ? (JSON.parse(saved) as Session) : null;
      return session && session.expiresAt > Date.now() ? session : null;
    } catch {
      return null;
    }
  }
}

// O JWT tem 3 partes separadas por "."; a do meio é um JSON em base64url com "exp" (segundos)
function readExpiration(token: string): number {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload)) as { exp?: number };
    return exp ? exp * 1000 : Number.MAX_SAFE_INTEGER;
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}

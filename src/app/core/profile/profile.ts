import { HttpClient, httpResource } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Auth } from '../auth/auth';
import { AuthResponse } from '../auth/auth.models';
import {
  EmailChangeRequest,
  PasswordChangeRequest,
  ProfileUpdateRequest,
  UserProfile,
} from './profile.models';

/**
 * Perfil de quem tem sessão iniciada (/api/users/me), igual para os três perfis.
 *
 * `me` é um só resource para toda a aplicação: o menu do topo e a página /profile leem o mesmo valor.
 * Depende do token: ao entrar, sair ou receber um token novo (mudança de email/palavra-passe),
 * volta a pedir à API sozinho; sem sessão fica parado.
 */
@Service()
export class Profile {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly url = `${environment.apiUrl}/api/users/me`;

  readonly me = httpResource<UserProfile>(() =>
    this.auth.currentUser()?.token ? this.url : undefined,
  );

  update(request: ProfileUpdateRequest): Observable<UserProfile> {
    return this.http
      .put<UserProfile>(this.url, request)
      .pipe(tap((profile) => this.me.set(profile)));
  }

  // A API devolve um token novo e invalida os antigos: as outras sessões terminam, esta continua
  changeEmail(request: EmailChangeRequest): Observable<void> {
    return this.http.patch<AuthResponse>(`${this.url}/email`, request).pipe(
      tap((response) => this.auth.startSession(response)),
      map(() => undefined),
    );
  }

  changePassword(request: PasswordChangeRequest): Observable<void> {
    return this.http.patch<AuthResponse>(`${this.url}/password`, request).pipe(
      tap((response) => this.auth.startSession(response)),
      map(() => undefined),
    );
  }

  // Depois do 204 o token já não vale: termina a sessão local
  deleteAccount(currentPassword: string): Observable<void> {
    return this.http
      .delete<void>(this.url, { body: { currentPassword } })
      .pipe(tap(() => this.auth.logout()));
  }
}

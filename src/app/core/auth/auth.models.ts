// Espelham os DTOs da Agendamento API (pacote auth.dto)

export type Role = 'ADMIN' | 'PROFESSIONAL' | 'CUSTOMER';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface ProfessionalRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: Role;
}

// Página inicial de cada perfil depois de entrar (e para onde os guards redirecionam)
export function homeFor(role: Role | undefined): string {
  switch (role) {
    case 'PROFESSIONAL':
      return '/agenda';
    case 'ADMIN':
      return '/admin';
    default:
      return '/account';
  }
}

// Sessão guardada no navegador: a resposta do login + a expiração lida do JWT
export interface Session extends AuthResponse {
  expiresAt: number;
}

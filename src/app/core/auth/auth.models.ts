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

// Sessão guardada no navegador: a resposta do login + a expiração lida do JWT
export interface Session extends AuthResponse {
  expiresAt: number;
}

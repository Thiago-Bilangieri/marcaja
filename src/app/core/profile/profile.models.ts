import { Role } from '../auth/auth.models';

// Espelham os DTOs de /api/users/me da Agendamento API

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: Role;
  // Só o cliente tem telefone (null para PROFESSIONAL e ADMIN)
  phone: string | null;
  createdAt: string;
}

export interface ProfileUpdateRequest {
  name: string;
  phone?: string;
}

export interface EmailChangeRequest {
  newEmail: string;
  currentPassword: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

// "Ana Ribeiro" → "AR"; "joao" → "J"
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return letters.map((word) => word[0].toUpperCase()).join('');
}

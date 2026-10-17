import { Role } from '../auth/auth.models';

// Espelham os DTOs da Agendamento API. As datas vêm como "2026-10-21T09:00:00",
// sem fuso: são a hora local do negócio (Europe/Lisbon).

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface ServiceItem {
  id: number;
  professionalId: number;
  professionalName: string;
  categoryId: number | null;
  categoryName: string | null;
  name: string;
  description: string | null;
  price: number;
  durationMinutes: number;
  active: boolean;
}

export interface ServiceFilter {
  categoryId?: number | null;
  // Texto livre: a API procura no nome do serviço e no do profissional, sem distinguir acentos
  q?: string;
}

export interface TimeSlot {
  startAt: string;
  endAt: string;
}

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Appointment {
  id: number;
  customerName: string;
  serviceId: number;
  serviceName: string;
  professionalName: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  notes: string | null;
  // Só preenchidos quando a marcação foi cancelada (null nas canceladas antes do histórico existir)
  cancelledByRole: Role | null;
  cancellationReason: string | null;
}

export interface AppointmentCreateRequest {
  serviceId: number;
  startAt: string;
  notes?: string;
}

// Mesma regra da API: só se cancela o que está ativo e ainda não começou
export function canCancel(appointment: Appointment, now: Date): boolean {
  const active = appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED';
  return active && new Date(appointment.startAt) > now;
}

// Profissional: confirmar só faz sentido numa marcação ainda por confirmar e que não começou
export function canConfirm(appointment: Appointment, now: Date): boolean {
  return appointment.status === 'SCHEDULED' && new Date(appointment.startAt) > now;
}

// Profissional: concluir ou marcar falta só depois da hora de início (regra da API)
export function canFinish(appointment: Appointment, now: Date): boolean {
  const active = appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED';
  return active && new Date(appointment.startAt) <= now;
}

// Ações do profissional: cada uma é um PATCH /api/appointments/{id}/{ação}
export type StatusAction = 'confirm' | 'complete' | 'no-show';

// "2026-10-21" na hora local (toISOString() usaria UTC e podia mudar o dia)
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

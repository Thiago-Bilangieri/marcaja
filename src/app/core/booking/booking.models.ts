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
  name?: string;
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

// "2026-10-21" na hora local (toISOString() usaria UTC e podia mudar o dia)
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

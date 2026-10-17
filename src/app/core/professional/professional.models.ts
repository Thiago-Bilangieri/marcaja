// Espelham os DTOs da Agendamento API (pacote professional.dto)

// Mesmos nomes do java.time.DayOfWeek, pela ordem da semana
export const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

// Um bloco de trabalho. A API devolve as horas como "09:00:00" e aceita "09:00".
export interface WorkingHours {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

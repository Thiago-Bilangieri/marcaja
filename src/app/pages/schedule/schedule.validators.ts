import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';

// Validadores próprios com as mesmas regras da API (WorkingHoursService.validate).
// As horas vêm do <input type="time"> como "HH:mm", por isso comparar texto já compara horas.

interface Block {
  startTime: string;
  endTime: string;
}

// Num bloco (FormGroup { startTime, endTime }): o fim tem de ser depois do início
export const endAfterStart: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const { startTime, endTime } = control.value as Block;
  return startTime && endTime && startTime >= endTime ? { endBeforeStart: true } : null;
};

// Nos blocos de um dia (FormArray): ordena pelo início e verifica se algum começa antes de o anterior acabar
export const noOverlap: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const blocks = (control as FormArray).getRawValue() as Block[];
  const sorted = blocks
    .filter((b) => b.startTime && b.endTime)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startTime < sorted[i - 1].endTime) {
      return { overlap: true };
    }
  }
  return null;
};

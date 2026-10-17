import {
  AbstractControl,
  FormGroupDirective,
  NgForm,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

// O BCrypt da API só usa os primeiros 72 bytes da palavra-passe
const MAX_BYTES = 72;

/**
 * Mesma política da API (@StrongPassword): 8 a 72 caracteres, com pelo menos uma letra e um número.
 * Vazio é aceite aqui: a obrigatoriedade fica com Validators.required, para mostrar um só erro.
 */
export const strongPassword: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: string = control.value ?? '';
  if (!value) {
    return null;
  }

  const valid =
    value.length >= 8 &&
    new TextEncoder().encode(value).length <= MAX_BYTES &&
    /\p{L}/u.test(value) &&
    /\p{Nd}/u.test(value);
  return valid ? null : { strongPassword: true };
};

/**
 * Validador de grupo para mudar a palavra-passe: a confirmação tem de ser igual à nova,
 * e a nova tem de ser diferente da atual. É de grupo porque compara campos entre si.
 */
export const passwordChange: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const current = group.get('currentPassword')?.value;
  const next = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;

  const errors: ValidationErrors = {};
  if (next && current && next === current) {
    errors['sameAsCurrent'] = true;
  }
  if (confirm && next !== confirm) {
    errors['mismatch'] = true;
  }
  return Object.keys(errors).length ? errors : null;
};

/**
 * O mat-form-field só mostra <mat-error> quando o PRÓPRIO campo é inválido. Este matcher faz o campo
 * mostrar também um erro do grupo (ex.: 'mismatch' na confirmação), depois de o utilizador lhe tocar.
 */
export class GroupErrorMatcher implements ErrorStateMatcher {
  constructor(private readonly groupError: string) {}

  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    if (!control) {
      return false;
    }
    const shown = control.touched || !!form?.submitted;
    return shown && (control.invalid || !!control.parent?.hasError(this.groupError));
  }
}

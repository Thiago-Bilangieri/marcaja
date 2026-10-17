import { FormControl, FormGroup } from '@angular/forms';
import { passwordChange, strongPassword } from './password.validators';

describe('strongPassword', () => {
  const check = (value: string) => strongPassword(new FormControl(value));

  it('accepts 8+ characters with a letter and a number', () => {
    expect(check('novaPassword1')).toBeNull();
    expect(check('çãoçãoç1')).toBeNull();
  });

  it('leaves empty values to Validators.required', () => {
    expect(check('')).toBeNull();
  });

  it('rejects short, letter-only, digit-only and too long passwords', () => {
    expect(check('abc1')).toEqual({ strongPassword: true });
    expect(check('password')).toEqual({ strongPassword: true });
    expect(check('12345678')).toEqual({ strongPassword: true });
    expect(check('a1' + 'x'.repeat(71))).toEqual({ strongPassword: true });
  });
});

describe('passwordChange', () => {
  const group = (currentPassword: string, newPassword: string, confirmPassword: string) =>
    passwordChange(
      new FormGroup({
        currentPassword: new FormControl(currentPassword),
        newPassword: new FormControl(newPassword),
        confirmPassword: new FormControl(confirmPassword),
      }),
    );

  it('passes when the new password is different and confirmed', () => {
    expect(group('antiga123', 'nova12345', 'nova12345')).toBeNull();
  });

  it('flags a confirmation that does not match', () => {
    expect(group('antiga123', 'nova12345', 'nova1234')).toEqual({ mismatch: true });
  });

  it('flags a new password equal to the current one', () => {
    expect(group('igual1234', 'igual1234', 'igual1234')).toEqual({ sameAsCurrent: true });
  });
});

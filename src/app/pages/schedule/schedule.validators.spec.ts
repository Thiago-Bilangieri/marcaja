import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { endAfterStart, noOverlap } from './schedule.validators';

function block(startTime: string, endTime: string) {
  return new FormGroup(
    { startTime: new FormControl(startTime), endTime: new FormControl(endTime) },
    { validators: endAfterStart },
  );
}

describe('schedule validators', () => {
  it('endAfterStart rejects a block that ends before or when it starts', () => {
    expect(block('09:00', '13:00').valid).toBe(true);
    expect(block('13:00', '09:00').hasError('endBeforeStart')).toBe(true);
    expect(block('09:00', '09:00').hasError('endBeforeStart')).toBe(true);
  });

  it('noOverlap accepts back-to-back blocks and rejects overlapping ones', () => {
    // Fora de ordem de propósito: o validador ordena pelo início
    const lunchBreak = new FormArray([block('14:00', '19:00'), block('09:00', '13:00')], noOverlap);
    expect(lunchBreak.hasError('overlap')).toBe(false);

    const backToBack = new FormArray([block('09:00', '12:00'), block('12:00', '16:00')], noOverlap);
    expect(backToBack.hasError('overlap')).toBe(false);

    const overlapping = new FormArray([block('09:00', '13:00'), block('12:00', '18:00')], noOverlap);
    expect(overlapping.hasError('overlap')).toBe(true);
  });
});

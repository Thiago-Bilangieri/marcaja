import { Component, effect, inject, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { apiErrorMessage } from '../../core/api/api-error';
import { I18n } from '../../core/i18n/i18n';
import { Professional } from '../../core/professional/professional';
import { DAYS_OF_WEEK, DayOfWeek, WorkingHours } from '../../core/professional/professional.models';
import { endAfterStart, noOverlap } from './schedule.validators';

type BlockForm = FormGroup<{ startTime: FormControl<string>; endTime: FormControl<string> }>;

/**
 * Horário de trabalho semanal do profissional.
 *
 * Formulário: um FormGroup com um FormArray por dia da semana. Um FormArray é uma lista
 * de controlos de tamanho variável: cada bloco (início/fim) é um FormGroup que se adiciona
 * ou remove com push() e removeAt().
 */
@Component({
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  selector: 'mj-schedule',
  styleUrl: './schedule.scss',
  templateUrl: './schedule.html',
})
export class Schedule {
  private readonly professional = inject(Professional);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly t = inject(I18n).t;

  protected readonly days = DAYS_OF_WEEK;
  protected readonly hours = this.professional.myWorkingHours();
  protected readonly saving = signal(false);

  protected readonly form = new FormGroup(
    Object.fromEntries(DAYS_OF_WEEK.map((day) => [day, this.fb.array<BlockForm>([], noOverlap)])) as Record<
      DayOfWeek,
      FormArray<BlockForm>
    >,
  );

  constructor() {
    // Sempre que o horário da API muda (primeiro carregamento ou depois de guardar), preenche o formulário
    effect(() => {
      if (this.hours.hasValue()) {
        this.fill(this.hours.value());
      }
    });
  }

  protected blocks(day: DayOfWeek): FormArray<BlockForm> {
    return this.form.controls[day];
  }

  // O primeiro bloco do dia sugere a manhã; os seguintes, a tarde
  protected addBlock(day: DayOfWeek): void {
    const empty = this.blocks(day).length === 0;
    this.blocks(day).push(this.block(empty ? '09:00' : '14:00', empty ? '13:00' : '19:00'));
    this.form.markAsDirty();
  }

  protected removeBlock(day: DayOfWeek, index: number): void {
    this.blocks(day).removeAt(index);
    this.form.markAsDirty();
  }

  protected discard(): void {
    if (this.hours.hasValue()) {
      this.fill(this.hours.value());
    }
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);

    // A API recebe uma lista simples: [{ dayOfWeek, startTime, endTime }, ...]
    const hours: WorkingHours[] = DAYS_OF_WEEK.flatMap((dayOfWeek) =>
      this.blocks(dayOfWeek)
        .getRawValue()
        .map((block) => ({ dayOfWeek, ...block })),
    );

    this.professional.replaceMyWorkingHours(hours).subscribe({
      next: (saved) => {
        this.saving.set(false);
        // Atualizar o valor do resource dispara o effect, que volta a preencher o formulário
        this.hours.set(saved);
        this.snackBar.open(this.t().schedule.saved, this.t().common.close, { duration: 4000 });
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.snackBar.open(apiErrorMessage(error, this.t(), 'schedule'), this.t().common.close, {
          duration: 6000,
        });
      },
    });
  }

  // Substitui os blocos de cada dia pelos da API ("09:00:00" → "09:00" para o <input type="time">)
  private fill(hours: WorkingHours[]): void {
    for (const day of DAYS_OF_WEEK) {
      const blocks = this.blocks(day);
      blocks.clear();
      hours
        .filter((h) => h.dayOfWeek === day)
        .forEach((h) => blocks.push(this.block(h.startTime.slice(0, 5), h.endTime.slice(0, 5))));
    }
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private block(startTime: string, endTime: string): BlockForm {
    return this.fb.group(
      {
        startTime: [startTime, Validators.required],
        endTime: [endTime, Validators.required],
      },
      { validators: endAfterStart },
    );
  }
}

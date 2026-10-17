import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProfile } from '../../core/profile/profile.models';
import { ChangeEmail } from './change-email';

describe('ChangeEmail', () => {
  let fixture: ComponentFixture<ChangeEmail>;

  const profile: UserProfile = {
    id: 10,
    name: 'João Silva',
    email: 'joao.silva@email.com',
    role: 'CUSTOMER',
    phone: '912345001',
    createdAt: '2026-10-17T13:02:36',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeEmail],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    // O formulário é criado antes de o input ter valor: isto falhava com NG0950 (página em branco)
    fixture = TestBed.createComponent(ChangeEmail);
    fixture.componentRef.setInput('profile', profile);
    await fixture.whenStable();
  });

  function emailInput(): HTMLInputElement {
    return (fixture.nativeElement as HTMLElement).querySelector('input[type=email]')!;
  }

  it('should reject the current email, ignoring case and spaces', async () => {
    const input = emailInput();
    input.value = '  Joao.Silva@Email.com ';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'This is already your email.',
    );
  });
});

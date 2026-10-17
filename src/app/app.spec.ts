import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { I18n } from './core/i18n/i18n';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('should render the MarcaJá logo', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.logo')?.textContent).toContain('MarcaJá');
  });

  it('should switch texts when the language changes', async () => {
    const fixture = TestBed.createComponent(App);
    const i18n = TestBed.inject(I18n);
    const compiled = fixture.nativeElement as HTMLElement;

    i18n.setLocale('pt-PT');
    await fixture.whenStable();
    expect(compiled.querySelector('.nav')?.textContent).toContain('Entrar');
    expect(document.documentElement.lang).toBe('pt-PT');

    i18n.setLocale('en');
    await fixture.whenStable();
    expect(compiled.querySelector('.nav')?.textContent).toContain('Sign in');
    expect(document.documentElement.lang).toBe('en');
  });
});

import { DOCUMENT, Service, computed, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { LOCALES, Locale, translations } from './translations';

const STORAGE_KEY = 'mj.locale';

/**
 * Idioma da aplicação. Nos componentes: `protected readonly t = inject(I18n).t;`
 * e no template `{{ t().login.title }}`. Como `t` é um signal, trocar de idioma
 * atualiza todos os textos sem recarregar a página.
 */
@Service()
export class I18n {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);

  readonly locale = signal<Locale>(this.initialLocale());
  readonly t = computed(() => translations[this.locale()]);

  constructor() {
    effect(() => {
      const locale = this.locale();
      this.document.documentElement.lang = locale;
      this.title.setTitle(this.t().app.title);
      try {
        localStorage.setItem(STORAGE_KEY, locale);
      } catch {
        // Sem acesso ao localStorage (ex.: navegação privada): o idioma só não fica guardado
      }
    });
  }

  setLocale(locale: Locale): void {
    this.locale.set(locale);
  }

  // Idioma guardado > idioma do navegador (português → pt-PT) > inglês
  private initialLocale(): Locale {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (LOCALES.includes(saved as Locale)) {
        return saved as Locale;
      }
    } catch {
      // ignora: segue para o idioma do navegador
    }
    return this.document.defaultView?.navigator.language.startsWith('pt') ? 'pt-PT' : 'en';
  }
}

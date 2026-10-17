import { HttpErrorResponse } from '@angular/common/http';
import { Translations } from '../i18n/translations';

/**
 * Converte um erro HTTP da API numa mensagem no idioma atual.
 * A API responde em Problem Details ({ title, status, detail, errors }) com textos em pt-PT,
 * por isso usamos o status para escolher a nossa própria mensagem traduzida.
 */
export function apiErrorMessage(
  error: unknown,
  t: Translations,
  context: 'login' | 'register' | 'booking' | 'schedule',
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return t.errors.unexpected;
  }

  switch (error.status) {
    case 0:
      // Sem resposta: API desligada, a acordar (Render) ou bloqueada por CORS
      return t.errors.network;
    case 400:
      // Marcações: regra de negócio (fora do horário de trabalho, já começou, serviço inativo...)
      if (context === 'booking') {
        return t.errors.bookingRejected;
      }
      // No registo, um 400 sem erros de campo é o email repetido (BusinessException na API)
      return context === 'register' && !error.error?.errors ? t.errors.emailTaken : t.errors.invalidData;
    case 409:
      // Outro cliente ficou com o horário entre ver a disponibilidade e confirmar
      return t.errors.slotTaken;
    case 401:
      return t.errors.invalidCredentials;
    case 403:
      // No login: conta pendente/rejeitada/desativada; nas marcações: sem permissão para esta ação
      return context === 'booking' ? t.errors.bookingRejected : t.errors.accountBlocked;
    case 429: {
      const seconds = Number(error.headers.get('Retry-After')) || 900;
      return t.errors.tooManyAttempts.replace('{minutes}', String(Math.ceil(seconds / 60)));
    }
    default:
      return t.errors.unexpected;
  }
}

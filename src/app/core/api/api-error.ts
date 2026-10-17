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
  context:
    'login' | 'register' | 'booking' | 'schedule' | 'admin' | 'email' | 'profile' | 'services',
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return t.errors.unexpected;
  }

  // Aprovar/rejeitar: 404 (o profissional já não existe) ou 403 (sessão sem perfil ADMIN)
  if (context === 'admin' && error.status !== 0) {
    return t.errors.actionFailed;
  }

  switch (error.status) {
    case 0:
      // Sem resposta: API desligada, a acordar (Render) ou bloqueada por CORS
      return t.errors.network;
    case 400:
      // Marcações: regra de negócio (fora do horário de trabalho, já começou, serviço inativo...)
      if (context === 'booking') {
        return t.errors.actionFailed;
      }
      // Serviços do profissional: um 400 sem erros de campo é o nome repetido
      if (context === 'services' && !error.error?.errors) {
        return t.errors.serviceNameTaken;
      }
      // No registo e na mudança de email, um 400 sem erros de campo é o email repetido (BusinessException na API)
      return (context === 'register' || context === 'email') && !error.error?.errors
        ? t.errors.emailTaken
        : t.errors.invalidData;
    case 409:
      // Perfil: o profissional ainda tem marcações futuras e não pode eliminar a conta.
      // Marcações: outro cliente ficou com o horário entre ver a disponibilidade e confirmar
      // Serviços: o serviço já tem marcações e não pode ser removido (só desativado)
      if (context === 'services') {
        return t.errors.serviceInUse;
      }
      return context === 'profile' ? t.errors.hasUpcoming : t.errors.slotTaken;
    case 401:
      return t.errors.invalidCredentials;
    case 403:
      // No login: conta pendente/rejeitada/desativada; nas marcações: sem permissão para esta ação
      return context === 'booking' ? t.errors.actionFailed : t.errors.accountBlocked;
    case 429: {
      const seconds = Number(error.headers.get('Retry-After')) || 900;
      return t.errors.tooManyAttempts.replace('{minutes}', String(Math.ceil(seconds / 60)));
    }
    default:
      return t.errors.unexpected;
  }
}

/**
 * Erros de campo de um 400 da API (`{ errors: { campo: mensagem } }`), ou null se não houver.
 * Serve para marcar o campo certo no formulário (ex.: palavra-passe atual incorreta).
 */
export function apiFieldErrors(error: unknown): Record<string, string> | null {
  if (error instanceof HttpErrorResponse && error.status === 400 && error.error?.errors) {
    return error.error.errors as Record<string, string>;
  }
  return null;
}

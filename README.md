# 📅 MarcaJá

**O seu horário, sem espera.**

**[🇵🇹 Português](#-português) · [🇬🇧 English](#-english)**

![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Angular Material](https://img.shields.io/badge/UI-Angular%20Material%203-0F766E)
![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=white)
![i18n](https://img.shields.io/badge/i18n-PT%20%7C%20EN-64748B)
![Status](https://img.shields.io/badge/estado-em%20desenvolvimento-F25F4C)

---

## 🇵🇹 Português

### Sobre o projeto

O **MarcaJá** é o front-end em **Angular** da [Agendamento API](https://github.com/Thiago-Bilangieri/agendamentos), uma API REST em **Java 21 + Spring Boot** para marcações de serviços entre clientes e profissionais independentes (barbeiros, esteticistas, personal trainers, etc.).

Os dois repositórios formam juntos uma aplicação **full-stack Java + Angular**:

```
┌────────────────────┐   HTTP + JSON (JWT)   ┌──────────────────────────┐
│ MarcaJá (Angular)  │ ────────────────────► │ Agendamento API (Spring) │ ──► PostgreSQL
│ este repositório   │ ◄──────────────────── │ repositório agendamentos │
└────────────────────┘        CORS           └──────────────────────────┘
```

**O que a aplicação vai permitir:**

- **Cliente:** procurar profissionais por categoria, ver os horários livres, marcar e cancelar.
- **Profissional:** definir o horário de trabalho e confirmar, concluir ou marcar falta nas marcações.
- **Administrador:** aprovar os profissionais antes de começarem a atender.
- **Sem conflitos de horário:** a API garante que um profissional nunca tem duas marcações sobrepostas.

### Funcionalidades já disponíveis

- **Interface em português (pt-PT) e inglês**, com troca instantânea no cabeçalho. O idioma é guardado no navegador e, na primeira visita, segue o idioma do sistema.
- **Registo de cliente** (com sessão iniciada automaticamente) e **registo de profissional** (fica pendente de aprovação).
- **Login com JWT**: o token é guardado no navegador, enviado automaticamente nos pedidos à API e descartado quando expira.
- **Rotas protegidas**: `/account` exige sessão; `/login` e `/register` redirecionam quem já tem sessão.
- **Erros da API traduzidos**: credenciais erradas, conta pendente, email repetido, demasiadas tentativas (com o tempo de espera do `Retry-After`) e API indisponível.
- **Serviços**: lista com filtro por categoria e pesquisa por nome, preço em euros e duração.
- **Marcar**: escolher o dia (próximos 14 dias), ver os horários livres e confirmar com observações. Se outro cliente ocupar o horário entretanto (`409`), a lista atualiza-se e o utilizador é avisado.
- **As minhas marcações**: próximas e histórico, com o estado de cada marcação e cancelamento com confirmação.

### Roadmap

- [x] **Fase 1a:** projeto Angular, tema visual da marca e página inicial
- [x] **Fase 1b:** login e registo (JWT, interceptor HTTP, guards), interface em PT e EN
- [x] **Fase 2:** área do cliente (serviços → disponibilidade → marcar → as minhas marcações → cancelar)
- [ ] **Fase 3:** área do profissional (confirmar, concluir, falta, horário de trabalho)
- [ ] **Fase 4:** área do administrador (aprovar profissionais)
- [ ] **Fase 5:** deploy (Vercel) ligado à API em produção

### Tecnologias e conceitos

| Tecnologia | Onde aparece |
|---|---|
| **Angular 22** | Standalone components, zoneless, novo control flow (`@if`, `@for`), lazy loading de rotas |
| **Signals** | Estado da sessão e do idioma (`signal`, `computed`, `linkedSignal`, `effect`) |
| **httpResource** | Leituras da API que voltam a pedir sozinhas quando um filtro (signal) muda |
| **Reactive Forms** | Formulários de login e registo com validação |
| **HttpClient + interceptor** | Envio do token JWT e fim de sessão automático no `401` |
| **Guards** | `authGuard` e `guestGuard` nas rotas |
| **i18n próprio e tipado** | Dicionários pt-PT/EN: se faltar uma tradução, o TypeScript não compila |
| **Angular Material 3** | Componentes de UI com tema gerado a partir das cores da marca |
| **Vitest** | Testes unitários (serviço de autenticação, interceptor, erros, idioma) |

### Como executar

**Pré-requisitos:** [Node.js](https://nodejs.org/) 22+ e Angular CLI (`npm install -g @angular/cli`). Para o login, precisa também da API a correr (o mais simples é com [Docker](https://www.docker.com/)).

**1. API + base de dados** (no repositório [agendamentos](https://github.com/Thiago-Bilangieri/agendamentos)):

```bash
docker compose --profile app up --build -d
```

A API fica em `http://localhost:8080`, com dados de teste e CORS aberto para `http://localhost:4200` (configuração de CORS a partir do [PR #2](https://github.com/Thiago-Bilangieri/agendamentos/pull/2)).

**2. Front-end** (neste repositório):

```bash
git clone https://github.com/Thiago-Bilangieri/marcaja.git
cd marcaja
npm install
npm start
```

Abra **http://localhost:4200** e entre com `joao.silva@email.com` / `password` (cliente de teste).

| Comando | O que faz |
|---|---|
| `npm start` | Servidor de desenvolvimento (`ng serve`), ligado à API em `localhost:8080` |
| `npm test` | Testes unitários com Vitest |
| `npm run build` | Build de produção em `dist/`, ligado à API pública no Render |

O endereço da API está em `src/environments/` (`environment.development.ts` para desenvolvimento e `environment.ts` para produção).

### Estrutura

```
src/
├── environments/            # URL da API (desenvolvimento e produção)
├── styles.scss              # Tema do Material + tokens da marca (--mj-*)
├── styles/                  # Paletas do tema e estilos partilhados das páginas
└── app/
    ├── app.ts / app.html    # Layout: cabeçalho (sessão + idioma), <router-outlet>, rodapé
    ├── app.config.ts        # Providers globais: router, HttpClient + interceptor, locale pt-PT
    ├── app.routes.ts        # Rotas com lazy loading e guards
    ├── core/
    │   ├── auth/            # Serviço Auth, modelos, interceptor JWT, guards (sessão e perfil)
    │   ├── booking/         # Serviço Booking (httpResource) e regras das marcações
    │   ├── api/             # Página genérica e tradução dos erros HTTP da API
    │   └── i18n/            # Serviço I18n e dicionários pt-PT / EN
    └── pages/
        ├── home/            # Página inicial
        ├── login/           # Entrar
        ├── register/        # Criar conta (cliente ou profissional)
        ├── services/        # Lista de serviços com filtros
        ├── book/            # Escolher dia e hora e marcar
        └── account/         # As minhas marcações (protegida)
```

### Identidade visual

| Token | Cor | Uso |
|---|---|---|
| `--mj-primary` | `#0F766E` | Marca, links, ícones |
| `--mj-accent` | `#F25F4C` | Destaque, botão principal, "Já" do logótipo |
| `--mj-background` | `#F8FAFC` | Fundo |
| `--mj-text` | `#0F172A` | Texto |
| `--mj-text-muted` | `#64748B` | Texto secundário |

**Estados das marcações:** `SCHEDULED` `#D97706` · `CONFIRMED` `#2563EB` · `COMPLETED` `#16A34A` · `CANCELLED` `#64748B` · `NO_SHOW` `#7C3AED`

Tipografia: **Inter** · Ícones: **Material Symbols**

---

## 🇬🇧 English

### About

**MarcaJá** ("book it now" in Portuguese) is the **Angular** front-end for the [Agendamento API](https://github.com/Thiago-Bilangieri/agendamentos), a **Java 21 + Spring Boot** REST API for booking appointments between customers and independent professionals. Together they form a **full-stack Java + Angular** portfolio project.

### Features so far

- **Portuguese (pt-PT) and English UI**, switchable from the header. The choice is saved in the browser; on the first visit it follows the system language.
- **Customer sign-up** (signed in automatically) and **professional sign-up** (pending until approved).
- **JWT sign-in**: the token is stored in the browser, attached to API requests by an HTTP interceptor and dropped when it expires.
- **Protected routes** with `authGuard` / `guestGuard`.
- **Translated API errors**: wrong credentials, pending account, duplicated email, too many attempts (using `Retry-After`) and API unavailable.
- **Customer area**: browse services by category or name, pick a day and a free slot, book with notes, see upcoming and past appointments and cancel them. A slot taken in the meantime (`409`) refreshes the list and warns the user.

### Stack

Angular 22 (standalone components, zoneless, signals, built-in control flow, lazy-loaded routes), Reactive Forms, HttpClient with a functional interceptor, a small typed i18n service, Angular Material 3 with a custom brand theme, TypeScript, SCSS and Vitest.

### Run locally

```bash
# 1. API + database (in the agendamentos repository)
docker compose --profile app up --build -d

# 2. Front-end (this repository)
git clone https://github.com/Thiago-Bilangieri/marcaja.git
cd marcaja
npm install
npm start   # http://localhost:4200
```

Sign in with `joao.silva@email.com` / `password` (test customer).

### Roadmap

Brand theme and home page ✅ → sign-in/sign-up with JWT, PT/EN UI ✅ → customer area ✅ → professional area → admin area → deploy.

---

## Autor · Author

**Thiago Bilangieri** · [GitHub](https://github.com/Thiago-Bilangieri)

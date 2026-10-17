# 📅 MarcaJá

**Seu horário, sem espera.**

**[🇧🇷 Português](#-português) · [🇬🇧 English](#-english)**

![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Angular Material](https://img.shields.io/badge/UI-Angular%20Material%203-0F766E)
![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=white)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-F25F4C)

---

## 🇧🇷 Português

### Sobre o projeto

O **MarcaJá** é o front-end em **Angular** da [Agendamento API](https://github.com/Thiago-Bilangieri/agendamentos), uma API REST em **Java 21 + Spring Boot** para agendamento de serviços entre clientes e profissionais autônomos (barbeiros, esteticistas, personal trainers etc.).

Juntos, os dois repositórios formam uma aplicação **full-stack Java + Angular**:

```
┌────────────────────┐   HTTP + JSON (JWT)   ┌─────────────────────────┐
│ MarcaJá (Angular)  │ ────────────────────► │ Agendamento API (Spring)│ ──► PostgreSQL
│ este repositório   │ ◄──────────────────── │ repositório agendamentos│
└────────────────────┘                       └─────────────────────────┘
```

**O que a aplicação vai permitir:**

- **Cliente:** procurar profissionais por categoria, ver os horários livres, marcar e cancelar agendamentos.
- **Profissional:** definir o horário de trabalho e confirmar, concluir ou marcar "não compareceu" nos atendimentos.
- **Administrador:** aprovar os profissionais antes de começarem a atender.
- **Sem conflito de horário:** a API garante que um profissional nunca tem dois agendamentos sobrepostos.

### Roadmap

- [x] **Fase 1a:** projeto Angular, tema visual da marca e página inicial
- [ ] **Fase 1b:** login e cadastro (JWT, interceptor HTTP, rotas protegidas)
- [ ] **Fase 2:** área do cliente (profissionais → disponibilidade → marcar → meus agendamentos)
- [ ] **Fase 3:** área do profissional (confirmar, concluir, não compareceu, horário de trabalho)
- [ ] **Fase 4:** área do administrador (aprovar profissionais)
- [ ] **Fase 5:** deploy (Vercel) com a API em produção

### Tecnologias

| Tecnologia | Uso |
|---|---|
| **Angular 22** | Standalone components, signals, novo control flow (`@if`, `@for`), lazy loading de rotas, zoneless |
| **Angular Material 3** | Componentes de UI com tema gerado a partir das cores da marca |
| **TypeScript** | Tipagem estrita |
| **SCSS** | Estilos com tokens de design (variáveis CSS) |
| **Vitest** | Testes unitários |

### Como executar

**Pré-requisitos:** [Node.js](https://nodejs.org/) 22+ e Angular CLI (`npm install -g @angular/cli`).

```bash
git clone https://github.com/Thiago-Bilangieri/marcaja.git
cd marcaja
npm install
npm start
```

Abra **http://localhost:4200**. A página recarrega sozinha quando você salva um arquivo.

| Comando | O que faz |
|---|---|
| `npm start` | Servidor de desenvolvimento (`ng serve`) |
| `npm test` | Testes unitários com Vitest |
| `npm run build` | Build de produção em `dist/` |

> A integração com a API (login, agendamentos) chega na Fase 1b. Para rodar a API localmente, veja o [README da Agendamento API](https://github.com/Thiago-Bilangieri/agendamentos#readme).

### Estrutura

```
src/
├── index.html              # Página base: título, fonte Inter, ícones
├── styles.scss             # Tema do Material + tokens da marca (--mj-*)
├── styles/
│   └── _theme-colors.scss  # Paletas geradas a partir das cores da marca
└── app/
    ├── app.ts / app.html   # Layout: cabeçalho, <router-outlet>, rodapé
    ├── app.config.ts       # Providers globais (router etc.)
    ├── app.routes.ts       # Rotas (com lazy loading)
    └── pages/
        └── home/           # Página inicial
```

### Identidade visual

| Token | Cor | Uso |
|---|---|---|
| `--mj-primary` | `#0F766E` | Marca, links, ícones |
| `--mj-accent` | `#F25F4C` | Destaque, botão principal, "Já" do logo |
| `--mj-background` | `#F8FAFC` | Fundo |
| `--mj-text` | `#0F172A` | Texto |
| `--mj-text-muted` | `#64748B` | Texto secundário |

**Status dos agendamentos:** `SCHEDULED` `#D97706` · `CONFIRMED` `#2563EB` · `COMPLETED` `#16A34A` · `CANCELLED` `#64748B` · `NO_SHOW` `#7C3AED`

Fonte: **Inter** · Ícones: **Material Symbols**

---

## 🇬🇧 English

**MarcaJá** ("book it now" in Portuguese) is the **Angular** front-end for the [Agendamento API](https://github.com/Thiago-Bilangieri/agendamentos), a **Java 21 + Spring Boot** REST API for booking appointments between customers and independent professionals. Together they form a **full-stack Java + Angular** portfolio project.

**Stack:** Angular 22 (standalone components, signals, built-in control flow, lazy-loaded routes, zoneless), Angular Material 3 with a custom brand theme, TypeScript, SCSS and Vitest.

**Run locally:**

```bash
git clone https://github.com/Thiago-Bilangieri/marcaja.git
cd marcaja
npm install
npm start   # http://localhost:4200
```

**Roadmap:** brand theme and home page ✅ → login/sign-up with JWT → customer area → professional area → admin area → deploy.

---

## Autor

**Thiago Bilangieri** · [GitHub](https://github.com/Thiago-Bilangieri)

// Textos da aplicação em pt-PT e inglês.
// O dicionário `en` tem o tipo de `ptPT`: se faltar ou sobrar uma chave, o TypeScript não compila.

const ptPT = {
  app: {
    title: 'MarcaJá · O seu horário, sem espera',
    homeLabel: 'MarcaJá, página inicial',
    footer: 'MarcaJá · projeto de portfólio · Angular + Spring Boot',
    language: 'Idioma',
    login: 'Entrar',
    register: 'Criar conta',
    account: 'A minha conta',
    logout: 'Sair',
  },
  home: {
    titleStart: 'O seu horário,',
    titleHighlight: 'sem espera.',
    subtitle:
      'Encontre barbeiros, esteticistas e personal trainers e marque o seu horário em poucos cliques.',
    bookCta: 'Marcar horário',
    professionalCta: 'Sou profissional',
    featuresLabel: 'Vantagens',
    features: [
      {
        icon: 'event_busy',
        title: 'Sem conflitos de horário',
        description: 'Um profissional nunca tem duas marcações à mesma hora.',
      },
      {
        icon: 'verified_user',
        title: 'Profissionais aprovados',
        description: 'Cada profissional é aprovado por um administrador antes de começar a atender.',
      },
      {
        icon: 'lock',
        title: 'Os seus dados, só seus',
        description: 'Sessão segura com JWT: cada pessoa vê e altera apenas o que é seu.',
      },
    ],
  },
  form: {
    name: 'Nome',
    email: 'Email',
    password: 'Palavra-passe',
    phone: 'Telefone',
    required: 'Campo obrigatório',
    invalidEmail: 'Email inválido',
    passwordMinLength: 'Mínimo de 8 caracteres',
    showPassword: 'Mostrar palavra-passe',
    hidePassword: 'Esconder palavra-passe',
  },
  login: {
    title: 'Entrar',
    subtitle: 'Aceda à sua conta para gerir as suas marcações.',
    submit: 'Entrar',
    noAccount: 'Ainda não tem conta?',
    registerLink: 'Criar conta',
    demoHint: 'Para experimentar: joao.silva@email.com / password',
  },
  register: {
    title: 'Criar conta',
    accountType: 'Tipo de conta',
    customer: 'Cliente',
    professional: 'Profissional',
    professionalInfo: 'A conta de profissional fica pendente até ser aprovada por um administrador.',
    submit: 'Criar conta',
    hasAccount: 'Já tem conta?',
    loginLink: 'Entrar',
    professionalSuccessTitle: 'Registo recebido!',
    professionalSuccess:
      'A sua conta de profissional está a aguardar aprovação. Poderá entrar assim que um administrador a aprovar.',
    backHome: 'Voltar ao início',
  },
  account: {
    title: 'A minha conta',
    signedInAs: 'Sessão iniciada como',
    role: 'Perfil',
    comingSoon: 'A sua área está em construção: em breve poderá ver e gerir as suas marcações aqui.',
  },
  roles: {
    ADMIN: 'Administrador',
    PROFESSIONAL: 'Profissional',
    CUSTOMER: 'Cliente',
  },
  errors: {
    network: 'Não foi possível contactar o servidor. Se a API estiver a acordar, aguarde um minuto e tente novamente.',
    invalidCredentials: 'Email ou palavra-passe incorretos.',
    accountBlocked: 'Esta conta ainda não pode entrar: aguarda aprovação, foi rejeitada ou está desativada.',
    tooManyAttempts: 'Demasiadas tentativas falhadas. Tente novamente dentro de {minutes} min.',
    emailTaken: 'Já existe uma conta com este email.',
    invalidData: 'Alguns dados são inválidos. Verifique os campos e tente novamente.',
    unexpected: 'Ocorreu um erro inesperado. Tente novamente.',
  },
};

export type Translations = typeof ptPT;

const en: Translations = {
  app: {
    title: 'MarcaJá · Your slot, no waiting',
    homeLabel: 'MarcaJá, home page',
    footer: 'MarcaJá · portfolio project · Angular + Spring Boot',
    language: 'Language',
    login: 'Sign in',
    register: 'Sign up',
    account: 'My account',
    logout: 'Sign out',
  },
  home: {
    titleStart: 'Your slot,',
    titleHighlight: 'no waiting.',
    subtitle: 'Find barbers, beauticians and personal trainers and book your slot in just a few clicks.',
    bookCta: 'Book now',
    professionalCta: "I'm a professional",
    featuresLabel: 'Highlights',
    features: [
      {
        icon: 'event_busy',
        title: 'No double bookings',
        description: 'A professional never has two appointments at the same time.',
      },
      {
        icon: 'verified_user',
        title: 'Approved professionals',
        description: 'Every professional is approved by an administrator before taking bookings.',
      },
      {
        icon: 'lock',
        title: 'Your data stays yours',
        description: 'Secure JWT sessions: everyone sees and changes only what belongs to them.',
      },
    ],
  },
  form: {
    name: 'Name',
    email: 'Email',
    password: 'Password',
    phone: 'Phone',
    required: 'Required field',
    invalidEmail: 'Invalid email',
    passwordMinLength: 'At least 8 characters',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
  },
  login: {
    title: 'Sign in',
    subtitle: 'Access your account to manage your appointments.',
    submit: 'Sign in',
    noAccount: "Don't have an account?",
    registerLink: 'Sign up',
    demoHint: 'To try it out: joao.silva@email.com / password',
  },
  register: {
    title: 'Sign up',
    accountType: 'Account type',
    customer: 'Customer',
    professional: 'Professional',
    professionalInfo: 'Professional accounts stay pending until an administrator approves them.',
    submit: 'Sign up',
    hasAccount: 'Already have an account?',
    loginLink: 'Sign in',
    professionalSuccessTitle: 'Registration received!',
    professionalSuccess:
      'Your professional account is awaiting approval. You can sign in as soon as an administrator approves it.',
    backHome: 'Back to home',
  },
  account: {
    title: 'My account',
    signedInAs: 'Signed in as',
    role: 'Role',
    comingSoon: 'Your area is under construction: soon you will be able to see and manage your appointments here.',
  },
  roles: {
    ADMIN: 'Administrator',
    PROFESSIONAL: 'Professional',
    CUSTOMER: 'Customer',
  },
  errors: {
    network: 'Could not reach the server. If the API is waking up, wait a minute and try again.',
    invalidCredentials: 'Incorrect email or password.',
    accountBlocked: 'This account cannot sign in yet: it is awaiting approval, was rejected or is disabled.',
    tooManyAttempts: 'Too many failed attempts. Try again in {minutes} min.',
    emailTaken: 'An account with this email already exists.',
    invalidData: 'Some details are invalid. Check the fields and try again.',
    unexpected: 'Something went wrong. Please try again.',
  },
};

export const translations = { 'pt-PT': ptPT, en } satisfies Record<string, Translations>;

export type Locale = keyof typeof translations;
export const LOCALES: Locale[] = ['pt-PT', 'en'];

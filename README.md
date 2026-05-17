# Site de Confirmação — Aniversário da Nicole

Projeto completo em Next.js para confirmação de presença.

## Estrutura correta na raiz do Github
- package.json
- app/
- components/
- lib/
- public/
- supabase/

## Supabase
Execute no SQL Editor: supabase/schema.sql

## Variáveis Vercel
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_ADMIN_PASSWORD

Rotas: /, /confirmar, /sucesso, /admin
Senha padrão do admin se não configurar: nicole2026



## Ajuste desta versão

- Página inicial com botão CONFIRMAR MINHA PRESENÇA maior e mais visível no desktop e no celular.
- Formulário reorganizado:
  - Nome da(s) criança(s)
  - Checklist "abaixo de 6 anos" ao lado do nome da criança
  - Nome do(s) adulto(s)
- Campos maiores, com mais espaçamento e melhor leitura no celular.
- Painel admin identifica convidados como adulto, criança ou criança abaixo de 6 anos.

# Site de Confirmação — Aniversário da Nicole

Projeto completo em Next.js + Supabase para confirmação de presença da festa de 8 anos da Nicole.

## Como usar

1. Suba este projeto para um repositório GitHub.
2. Crie um projeto no Supabase.
3. Rode o arquivo `supabase/schema.sql` no SQL Editor do Supabase.
4. Copie `.env.example` para `.env.local`.
5. Preencha:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_PASSWORD`
6. Rode localmente:

```bash
npm install
npm run dev
```

## Deploy na Vercel

1. Importar o repositório GitHub na Vercel.
2. Inserir as mesmas Environment Variables.
3. Deploy.
4. Em Domains, adicionar:

`nicole.resumindoviagens.com.br`

## Registro.br / DNS

Crie um CNAME:

- Nome: `nicole`
- Tipo: `CNAME`
- Valor: `cname.vercel-dns.com`

Depois aguarde a propagação e valide na Vercel.

## Imagens

As imagens geradas foram salvas em:

`public/assets/nicole/`

Nomes principais:

- `layout-geral-site.png`
- `styleguide-ui.png`
- `assets-individuais-preview.png`
- `assets-colecao.png`
- `referencia-convite.png`

## Admin

Acesse:

`/admin`

A senha é definida na variável:

`NEXT_PUBLIC_ADMIN_PASSWORD`

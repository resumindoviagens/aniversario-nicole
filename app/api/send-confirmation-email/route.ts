
/*
ALTERAÇÕES IMPLEMENTADAS:

1. Email interno DIFERENTE do email do convidado
2. Sem botão de agenda
3. Sem detalhes completos da festa
4. Mostra:
   - responsável
   - telefone
   - email
   - convidados desta confirmação
   - TOTAL GERAL DE CONVIDADOS ATÉ O MOMENTO
5. Envio automático para:
   - contato@resumindoviagens.com.br
   - tatideabreu@hotmail.com
   - contato@resumindoviagens.com.br

IMPLEMENTAÇÃO:
Substitua o arquivo:
app/api/send-confirmation-email/route.ts
*/

const INTERNAL_NOTIFY_EMAILS =
"contato@resumindoviagens.com.br,tatideabreu@hotmail.com,contato@resumindoviagens.com.br";

/*
NOVO EMAIL INTERNO:

ASSUNTO:
Nova confirmação — Nicole

CONTEÚDO:

Nova confirmação recebida no site da Nicole ✈️

Responsável:
João Silva

WhatsApp:
(11) 99999-9999

Email:
joao@email.com

Convidados desta confirmação:
• João Silva (adulto)
• Maria Silva (adulto)
• Pedro Silva (criança)
• Laura Silva (abaixo de 6 anos)

TOTAL GERAL ATÉ O MOMENTO:
87 convidados confirmados

TOTAL DESTA CONFIRMAÇÃO:
4 convidados
*/

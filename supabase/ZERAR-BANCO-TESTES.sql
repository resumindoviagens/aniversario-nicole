-- ZERAR BANCO DE TESTES — ANIVERSÁRIO NICOLE
-- Execute no Supabase SQL Editor.
-- Isso apaga todas as confirmações/famílias e todos os convidados cadastrados.
-- Não altera a estrutura das tabelas.

delete from public.guests;
delete from public.confirmations;

-- Confirmação visual após executar:
select 'confirmations' as tabela, count(*) as total from public.confirmations
union all
select 'guests' as tabela, count(*) as total from public.guests;
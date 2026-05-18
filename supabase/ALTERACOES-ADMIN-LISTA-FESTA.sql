
alter table public.confirmations
add column if not exists responsavel_email text;

drop policy if exists "allow update confirmations" on public.confirmations;
create policy "allow update confirmations"
on public.confirmations for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "allow delete guests" on public.guests;
create policy "allow delete guests"
on public.guests for delete
to anon, authenticated
using (true);

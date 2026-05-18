"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Guest = { id?: string; nome: string; idade: number; menor_seis: boolean };
type Confirmation = {
  id: string; created_at: string; responsavel_nome: string; responsavel_telefone: string;
  responsavel_email?: string | null; observacoes?: string | null; quantidade_convidados: number; guests?: Guest[];
};

const digits = (v:string) => (v || "").replace(/\D/g, "");
const fmt = (v:string) => { try { return new Date(v).toLocaleString("pt-BR"); } catch { return v; } };

function whatsappText(item: Confirmation) {
  const nomes = (item.guests || []).map(g => `• ${g.nome}${g.menor_seis ? " (abaixo de 6 anos)" : ""}`).join("%0A");
  return `Olá, ${item.responsavel_nome}!%0A%0AConfirmamos a presença no aniversário da Nicole 🎉✈️%0A%0A📅 Data: 07/06/2026%0A⏰ Horário: 17:00%0A📍 Local: Buffet Vila da Festa%0AEndereço: R. Dr. Jesuíno Maciel, 263 — Campo Belo, São Paulo - SP%0A%0AConvidados confirmados:%0A${nomes || "• Confirmação recebida"}%0A%0AEsperamos vocês para essa viagem pelo mundo com a Nicole! 💕`;
}

function whatsappPlain(item: Confirmation) {
  return decodeURIComponent(whatsappText(item).replaceAll("%0A", "\n"));
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [allowed, setAllowed] = useState(false);
  const [items, setItems] = useState<Confirmation[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("confirmations").select("*, guests(id, nome, idade, menor_seis)").order("created_at", { ascending: false });
    if (error) alert("Erro ao carregar admin: " + error.message);
    else setItems((data || []) as Confirmation[]);
    setLoading(false);
  }

  useEffect(() => { if (allowed) load(); }, [allowed]);

  function login() {
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "nicole2026";
    if (password === adminPass) setAllowed(true);
    else alert("Senha incorreta");
  }

  async function remove(id:string, nome:string) {
    if (!confirm(`Excluir a confirmação de ${nome}?`)) return;
    const { error } = await supabase.from("confirmations").delete().eq("id", id);
    if (error) alert("Erro ao excluir: " + error.message + ". Execute o SQL de permissões no Supabase.");
    else setItems(prev => prev.filter(i => i.id !== id));
  }

  async function copyMsg(item: Confirmation) {
    await navigator.clipboard.writeText(whatsappPlain(item));
    alert("Mensagem copiada.");
  }

  const totals = useMemo(() => ({
    convidados: items.reduce((a,i)=>a+(i.guests?.length || i.quantidade_convidados || 0),0),
    menores: items.reduce((a,i)=>a+(i.guests || []).filter(g=>g.menor_seis).length,0)
  }), [items]);

  if (!allowed) return (
    <main className="min-h-screen bg-[#fff7fb] px-4 py-12">
      <section className="mx-auto max-w-md rounded-[32px] bg-white p-8 shadow-2xl">
        <h1 className="mb-6 text-3xl font-black text-[#0d1b4c]">Painel administrativo</h1>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Senha do admin" className="mb-4 h-14 w-full rounded-2xl border-2 border-pink-100 px-4 text-lg outline-none focus:border-pink-600" />
        <button onClick={login} className="w-full rounded-2xl bg-pink-600 px-6 py-4 text-lg font-black text-white">Entrar</button>
      </section>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#fff7fb] px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-[32px] bg-white p-6 shadow-xl md:flex-row md:items-center md:justify-between">
          <div><p className="font-black tracking-widest text-pink-600">NONO AIRLINES</p><h1 className="text-4xl font-black text-[#0d1b4c]">Admin — Aniversário da Nicole</h1></div>
          <button onClick={load} className="rounded-2xl bg-[#0d1b4c] px-6 py-4 font-black text-white">Atualizar lista</button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] bg-white p-6 shadow-lg"><p className="font-bold text-[#0d1b4c]/70">Confirmações</p><strong className="text-5xl text-[#0d1b4c]">{items.length}</strong></div>
          <div className="rounded-[28px] bg-white p-6 shadow-lg"><p className="font-bold text-[#0d1b4c]/70">Total convidados</p><strong className="text-5xl text-[#0d1b4c]">{totals.convidados}</strong></div>
          <div className="rounded-[28px] bg-white p-6 shadow-lg"><p className="font-bold text-[#0d1b4c]/70">Menores de 6 anos</p><strong className="text-5xl text-[#0d1b4c]">{totals.menores}</strong></div>
        </div>

        {loading ? <div className="rounded-[28px] bg-white p-8 text-center text-xl font-black shadow-lg">Carregando...</div> : (
          <div className="space-y-5">
            {items.map(item => {
              const phone = digits(item.responsavel_telefone);
              const waPhone = phone.startsWith("55") ? phone : `55${phone}`;
              const waHref = `https://wa.me/${waPhone}?text=${whatsappText(item)}`;
              return (
                <article key={item.id} className="rounded-[30px] bg-white p-6 shadow-xl">
                  <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-start">
                    <div>
                      <h2 className="text-2xl font-black text-[#0d1b4c]">{item.responsavel_nome}</h2>
                      <p className="mt-1 font-bold text-[#0d1b4c]/75">WhatsApp: {item.responsavel_telefone}</p>
                      {item.responsavel_email && <p className="font-bold text-[#0d1b4c]/75">E-mail: {item.responsavel_email}</p>}
                      <p className="mt-2 text-sm font-bold text-[#0d1b4c]/60">Confirmado em: {fmt(item.created_at)}</p>
                    </div>

                    <div>
                      <p className="mb-2 font-black text-pink-600">Convidados</p>
                      <ul className="space-y-1 text-sm font-bold text-[#0d1b4c]">
                        {(item.guests || []).map((g,index)=><li key={g.id || index}>• {g.nome} {g.menor_seis ? <span className="text-pink-600">(abaixo de 6)</span> : g.idade >= 18 ? "(adulto)" : "(criança)"}</li>)}
                      </ul>
                    </div>

                    <div>
                      <p className="mb-2 font-black text-pink-600">Mensagem WhatsApp</p>
                      <textarea readOnly value={whatsappPlain(item)} className="h-36 w-full rounded-2xl border-2 border-pink-100 p-3 text-sm outline-none" />
                    </div>

                    <div className="flex flex-col gap-3">
                      <a href={waHref} target="_blank" rel="noreferrer" className="rounded-2xl bg-green-600 px-5 py-4 text-center font-black text-white">Abrir WhatsApp</a>
                      <button onClick={()=>copyMsg(item)} className="rounded-2xl bg-[#0d1b4c] px-5 py-4 font-black text-white">Copiar mensagem</button>
                      <button onClick={()=>remove(item.id, item.responsavel_nome)} className="rounded-2xl border-2 border-red-200 px-5 py-4 font-black text-red-600">Excluir</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
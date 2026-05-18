
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Guest = {
  id: string;
  nome: string;
  idade: number;
  menor_seis: boolean;
};

type Confirmation = {
  id: string;
  created_at: string;
  responsavel_nome: string;
  responsavel_telefone: string;
  responsavel_email?: string | null;
  observacoes?: string | null;
  quantidade_convidados: number;
  guests?: Guest[];
};

function onlyNumbers(value: string) {
  return (value || "").replace(/\D/g, "");
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
}

function guestLabel(guest: Guest) {
  if (guest.menor_seis) return "criança abaixo de 6 anos";
  if (guest.idade >= 18) return "adulto";
  return "criança";
}

function buildWhatsappMessage(item: Confirmation) {
  const guests = item.guests || [];
  const nomes = guests
    .map((g) => `• ${g.nome} (${guestLabel(g)})`)
    .join("%0A");

  return (
    `Olá, ${item.responsavel_nome}!%0A%0A` +
    `Confirmamos a presença no aniversário da Nicole 🎉✈️%0A%0A` +
    `📅 Data: 07/06/2026%0A` +
    `⏰ Horário: 17:00%0A` +
    `📍 Local: Buffet Vila da Festa%0A` +
    `Endereço: R. Dr. Jesuíno Maciel, 263 — Campo Belo, São Paulo - SP%0A%0A` +
    `Convidados confirmados:%0A${nomes || "• Confirmação recebida"}%0A%0A` +
    `Esperamos vocês para essa viagem pelo mundo com a Nicole! 💕`
  );
}

function buildPlainWhatsappMessage(item: Confirmation) {
  return decodeURIComponent(buildWhatsappMessage(item).replaceAll("%0A", "\n"));
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [allowed, setAllowed] = useState(false);
  const [items, setItems] = useState<Confirmation[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("confirmations")
      .select("*, guests(id, nome, idade, menor_seis)")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Erro ao carregar lista: " + error.message);
    } else {
      setItems((data || []) as Confirmation[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (allowed) load();
  }, [allowed]);

  function login() {
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "nicole2026";
    if (password === adminPass) setAllowed(true);
    else alert("Senha incorreta.");
  }

  async function copyWhatsapp(item: Confirmation) {
    await navigator.clipboard.writeText(buildPlainWhatsappMessage(item));
    alert("Mensagem copiada para colar no WhatsApp.");
  }

  async function deleteGuest(item: Confirmation, guest: Guest) {
    const ok = confirm(`Excluir somente o convidado "${guest.nome}" da lista?`);
    if (!ok) return;

    const { error } = await supabase.from("guests").delete().eq("id", guest.id);

    if (error) {
      alert("Erro ao excluir convidado: " + error.message + ". Execute o SQL de permissões no Supabase.");
      return;
    }

    const remainingGuests = (item.guests || []).filter((g) => g.id !== guest.id);
    const newCount = remainingGuests.length;

    await supabase
      .from("confirmations")
      .update({ quantidade_convidados: newCount })
      .eq("id", item.id);

    setItems((prev) =>
      prev.map((confirmation) =>
        confirmation.id === item.id
          ? {
              ...confirmation,
              guests: remainingGuests,
              quantidade_convidados: newCount,
            }
          : confirmation
      )
    );
  }

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return items;

    return items.filter((item) => {
      const guests = item.guests || [];
      return (
        item.responsavel_nome?.toLowerCase().includes(term) ||
        item.responsavel_telefone?.toLowerCase().includes(term) ||
        item.responsavel_email?.toLowerCase().includes(term) ||
        guests.some((g) => g.nome.toLowerCase().includes(term))
      );
    });
  }, [items, search]);

  const totals = useMemo(() => {
    const allGuests = items.flatMap((item) => item.guests || []);
    const adultos = allGuests.filter((g) => g.idade >= 18).length;
    const menoresDe6 = allGuests.filter((g) => g.menor_seis).length;
    const criancas = allGuests.filter((g) => g.idade < 18).length;

    return {
      confirmacoes: items.length,
      convidados: allGuests.length,
      adultos,
      criancas,
      menoresDe6,
    };
  }, [items]);

  if (!allowed) {
    return (
      <main className="min-h-screen bg-[#fff7fb] px-4 py-12">
        <section className="mx-auto max-w-md rounded-[32px] bg-white p-8 shadow-2xl">
          <p className="mb-2 font-black tracking-widest text-pink-600">NONO AIRLINES</p>
          <h1 className="mb-6 text-3xl font-black text-[#0d1b4c]">Painel administrativo</h1>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha do admin"
            className="mb-4 h-14 w-full rounded-2xl border-2 border-pink-100 px-4 text-lg outline-none focus:border-pink-600"
          />

          <button
            onClick={login}
            className="w-full rounded-2xl bg-pink-600 px-6 py-4 text-lg font-black text-white shadow-lg"
          >
            Entrar
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff7fb] px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[34px] bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-black tracking-widest text-pink-600">LISTA DE FESTA</p>
              <h1 className="text-4xl font-black text-[#0d1b4c]">Aniversário da Nicole</h1>
              <p className="mt-2 font-bold text-[#0d1b4c]/70">Controle de confirmações, convidados e mensagens WhatsApp.</p>
            </div>

            <button
              onClick={load}
              className="rounded-2xl bg-[#0d1b4c] px-6 py-4 font-black text-white shadow-lg"
            >
              Atualizar lista
            </button>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por responsável, telefone, email ou convidado..."
            className="mt-6 h-14 w-full rounded-2xl border-2 border-pink-100 px-5 text-lg outline-none focus:border-pink-600"
          />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-[26px] bg-white p-5 shadow-lg">
            <p className="font-bold text-[#0d1b4c]/65">Famílias</p>
            <strong className="text-4xl text-[#0d1b4c]">{totals.confirmacoes}</strong>
          </div>
          <div className="rounded-[26px] bg-white p-5 shadow-lg">
            <p className="font-bold text-[#0d1b4c]/65">Convidados</p>
            <strong className="text-4xl text-[#0d1b4c]">{totals.convidados}</strong>
          </div>
          <div className="rounded-[26px] bg-white p-5 shadow-lg">
            <p className="font-bold text-[#0d1b4c]/65">Adultos</p>
            <strong className="text-4xl text-[#0d1b4c]">{totals.adultos}</strong>
          </div>
          <div className="rounded-[26px] bg-white p-5 shadow-lg">
            <p className="font-bold text-[#0d1b4c]/65">Crianças</p>
            <strong className="text-4xl text-[#0d1b4c]">{totals.criancas}</strong>
          </div>
          <div className="rounded-[26px] bg-white p-5 shadow-lg">
            <p className="font-bold text-[#0d1b4c]/65">Abaixo de 6</p>
            <strong className="text-4xl text-[#0d1b4c]">{totals.menoresDe6}</strong>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[28px] bg-white p-8 text-center text-xl font-black text-[#0d1b4c] shadow-lg">
            Carregando lista...
          </div>
        ) : (
          <div className="space-y-6">
            {filteredItems.map((item) => {
              const phone = onlyNumbers(item.responsavel_telefone);
              const waPhone = phone.startsWith("55") ? phone : `55${phone}`;
              const waHref = `https://wa.me/${waPhone}?text=${buildWhatsappMessage(item)}`;

              return (
                <article key={item.id} className="overflow-hidden rounded-[32px] bg-white shadow-xl">
                  <div className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-white p-6">
                    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr_auto] lg:items-start">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-pink-600">
                          Responsável
                        </p>
                        <h2 className="mt-1 text-2xl font-black text-[#0d1b4c]">{item.responsavel_nome}</h2>
                        <p className="mt-2 font-bold text-[#0d1b4c]/75">WhatsApp: {item.responsavel_telefone}</p>
                        {item.responsavel_email && (
                          <p className="font-bold text-[#0d1b4c]/75">E-mail: {item.responsavel_email}</p>
                        )}
                        <p className="mt-2 text-sm font-bold text-[#0d1b4c]/55">Confirmado em: {formatDate(item.created_at)}</p>
                      </div>

                      <textarea
                        readOnly
                        value={buildPlainWhatsappMessage(item)}
                        className="h-36 w-full rounded-2xl border-2 border-pink-100 bg-white p-3 text-sm font-semibold text-[#0d1b4c] outline-none"
                      />

                      <div className="flex flex-col gap-3">
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-2xl bg-green-600 px-5 py-4 text-center font-black text-white shadow"
                        >
                          Abrir WhatsApp
                        </a>

                        <button
                          onClick={() => copyWhatsapp(item)}
                          className="rounded-2xl bg-[#0d1b4c] px-5 py-4 font-black text-white shadow"
                        >
                          Copiar texto
                        </button>
                      </div>
                    </div>

                    {item.observacoes && (
                      <div className="mt-5 rounded-2xl bg-white p-4 font-bold text-[#0d1b4c]">
                        Observações: {item.observacoes}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-xl font-black text-[#0d1b4c]">Convidados desta confirmação</h3>
                      <span className="rounded-full bg-pink-100 px-4 py-2 text-sm font-black text-pink-700">
                        {(item.guests || []).length} pessoa(s)
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(item.guests || []).map((guest) => (
                        <div
                          key={guest.id}
                          className="grid gap-3 rounded-2xl border border-pink-100 bg-[#fffafd] p-4 md:grid-cols-[1fr_220px_130px] md:items-center"
                        >
                          <div>
                            <p className="text-lg font-black text-[#0d1b4c]">{guest.nome}</p>
                            <p className="font-bold text-[#0d1b4c]/65">{guestLabel(guest)}</p>
                          </div>

                          <div className="rounded-full bg-white px-4 py-2 text-center text-sm font-black text-[#0d1b4c]">
                            {guest.menor_seis ? "abaixo de 6 anos" : guest.idade >= 18 ? "adulto" : "criança"}
                          </div>

                          <button
                            onClick={() => deleteGuest(item, guest)}
                            className="rounded-2xl border-2 border-red-200 bg-white px-5 py-3 font-black text-red-600"
                          >
                            Excluir
                          </button>
                        </div>
                      ))}

                      {(!item.guests || item.guests.length === 0) && (
                        <div className="rounded-2xl border border-pink-100 bg-[#fffafd] p-5 text-center font-black text-[#0d1b4c]/60">
                          Nenhum convidado vinculado a esta confirmação.
                        </div>
                      )}
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

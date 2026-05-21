
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

function escapeHtml(value: string) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function guestLabel(guest: Guest) {
  if (guest.menor_seis) return "criança abaixo de 6 anos";
  if (guest.idade >= 18) return "adulto";
  return "criança";
}

function buildWhatsappMessage(item: Confirmation) {
  const guests = item.guests || [];
  const nomes = guests.map((g) => `• ${g.nome} (${guestLabel(g)})`).join("%0A");

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

function buildRows(items: Confirmation[]) {
  return items.flatMap((item) =>
    (item.guests || []).map((guest) => ({
      nomeConvidado: guest.nome,
      responsavel: item.responsavel_nome,
      menorSeis: guest.menor_seis ? "Sim" : "Não",
      telefone: item.responsavel_telefone || "",
      email: item.responsavel_email || "",
      mensagem: buildPlainWhatsappMessage(item),
    }))
  );
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

    if (error) alert("Erro ao carregar lista: " + error.message);
    else setItems((data || []) as Confirmation[]);

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
      alert("Erro ao excluir convidado: " + error.message);
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
          ? { ...confirmation, guests: remainingGuests, quantidade_convidados: newCount }
          : confirmation
      )
    );
  }

  function openGuestReport() {
    const rows = buildRows(items);
    const tableRows = rows
      .map(
        (row, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(row.nomeConvidado)}</td>
            <td>${escapeHtml(row.responsavel)}</td>
            <td>${escapeHtml(row.menorSeis)}</td>
            <td>${escapeHtml(row.telefone)}</td>
            <td>${escapeHtml(row.email)}</td>
            <td class="message">${escapeHtml(row.mensagem)}</td>
          </tr>
        `
      )
      .join("");

    const html = `
      <!doctype html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Lista de Convidados Aniversário Nicole</title>
        <style>
          @page { size: A4 landscape; margin: 12mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 24px;
            font-family: Arial, Helvetica, sans-serif;
            color: #0d1b4c;
            background: #ffffff;
            font-size: 15px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            border-bottom: 4px solid #e91e63;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          h1 { margin: 0; font-size: 28px; line-height: 1.25; color: #0d1b4c; }
          .subtitle { margin-top: 8px; font-size: 17px; font-weight: bold; color: #e91e63; }
          .summary { text-align: right; font-size: 17px; font-weight: bold; line-height: 1.5; min-width: 220px; }
          .actions { margin: 16px 0 18px; }
          button {
            border: 0;
            background: #e91e63;
            color: white;
            font-size: 17px;
            font-weight: 900;
            padding: 14px 22px;
            border-radius: 14px;
            cursor: pointer;
          }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 14px; }
          th {
            background: #0d1b4c;
            color: white;
            padding: 12px 8px;
            border: 1px solid #0d1b4c;
            text-align: left;
            font-size: 14px;
          }
          td {
            padding: 10px 8px;
            border: 1px solid #d7dbe8;
            vertical-align: top;
            line-height: 1.35;
            word-wrap: break-word;
          }
          tr:nth-child(even) td { background: #fff3f8; }
          th:nth-child(1), td:nth-child(1) { width: 42px; text-align: center; }
          th:nth-child(2), td:nth-child(2) { width: 16%; font-weight: bold; }
          th:nth-child(3), td:nth-child(3) { width: 16%; }
          th:nth-child(4), td:nth-child(4) { width: 9%; text-align: center; }
          th:nth-child(5), td:nth-child(5) { width: 12%; }
          th:nth-child(6), td:nth-child(6) { width: 15%; }
          th:nth-child(7), td:nth-child(7) { width: 30%; }
          .message { white-space: pre-wrap; font-size: 12px; line-height: 1.25; }
          .footer { margin-top: 18px; color: #6b7280; font-size: 13px; font-weight: bold; }
          @media print {
            body { padding: 0; font-size: 13px; }
            .actions { display: none; }
            h1 { font-size: 23px; }
            .subtitle, .summary { font-size: 14px; }
            table { font-size: 11px; }
            th, td { padding: 6px 5px; }
            .message { font-size: 9px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Lista de Convidados Aniversário Nicole - dia 07/06/2026 às 17 horas</h1>
            <div class="subtitle">Relatório para conferência, impressão ou conversão em PDF</div>
          </div>
          <div class="summary">
            Total de convidados: ${rows.length}<br>
            Emitido em: ${new Date().toLocaleString("pt-BR")}
          </div>
        </div>
        <div class="actions"><button onclick="window.print()">Imprimir / Salvar em PDF</button></div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nome do convidado</th>
              <th>Responsável pelo cadastro</th>
              <th>Menor de 6 anos?</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Mensagem</th>
            </tr>
          </thead>
          <tbody>${tableRows || `<tr><td colspan="7">Nenhum convidado confirmado.</td></tr>`}</tbody>
        </table>
        <div class="footer">Lista gerada automaticamente pelo painel do Aniversário da Nicole.</div>
      </body>
      </html>
    `;

    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      alert("O navegador bloqueou a nova aba. Permita pop-ups para gerar o relatório.");
      return;
    }

    reportWindow.document.open();
    reportWindow.document.write(html);
    reportWindow.document.close();
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
    return { confirmacoes: items.length, convidados: allGuests.length, adultos, criancas, menoresDe6 };
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
            className="mb-4 h-16 w-full rounded-2xl border-2 border-pink-100 px-5 text-xl outline-none focus:border-pink-600"
          />
          <button onClick={login} className="w-full rounded-2xl bg-pink-600 px-6 py-5 text-xl font-black text-white shadow-lg">
            Entrar
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff7fb] px-4 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-[36px] bg-white p-7 shadow-xl sm:p-9">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-base font-black tracking-widest text-pink-600">LISTA DE FESTA</p>
              <h1 className="text-4xl font-black leading-tight text-[#0d1b4c] sm:text-5xl">Aniversário da Nicole</h1>
              <p className="mt-3 max-w-3xl text-lg font-bold leading-relaxed text-[#0d1b4c]/75">
                Controle de confirmações, convidados, mensagens WhatsApp e relatório de impressão.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button onClick={load} className="rounded-2xl bg-[#0d1b4c] px-6 py-4 text-lg font-black text-white shadow-lg">
                Atualizar lista
              </button>
              <button onClick={openGuestReport} className="rounded-2xl bg-pink-600 px-6 py-4 text-lg font-black text-white shadow-lg">
                Gerar lista para impressão/PDF
              </button>
            </div>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por responsável, telefone, email ou convidado..."
            className="mt-7 h-16 w-full rounded-2xl border-2 border-pink-100 px-5 text-xl outline-none focus:border-pink-600"
          />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-[28px] bg-white p-6 shadow-lg"><p className="text-lg font-black text-[#0d1b4c]/65">Famílias</p><strong className="text-5xl text-[#0d1b4c]">{totals.confirmacoes}</strong></div>
          <div className="rounded-[28px] bg-white p-6 shadow-lg"><p className="text-lg font-black text-[#0d1b4c]/65">Convidados</p><strong className="text-5xl text-[#0d1b4c]">{totals.convidados}</strong></div>
          <div className="rounded-[28px] bg-white p-6 shadow-lg"><p className="text-lg font-black text-[#0d1b4c]/65">Adultos</p><strong className="text-5xl text-[#0d1b4c]">{totals.adultos}</strong></div>
          <div className="rounded-[28px] bg-white p-6 shadow-lg"><p className="text-lg font-black text-[#0d1b4c]/65">Crianças</p><strong className="text-5xl text-[#0d1b4c]">{totals.criancas}</strong></div>
          <div className="rounded-[28px] bg-white p-6 shadow-lg"><p className="text-lg font-black text-[#0d1b4c]/65">Abaixo de 6</p><strong className="text-5xl text-[#0d1b4c]">{totals.menoresDe6}</strong></div>
        </div>

        {loading ? (
          <div className="rounded-[28px] bg-white p-8 text-center text-2xl font-black text-[#0d1b4c] shadow-lg">Carregando lista...</div>
        ) : (
          <div className="space-y-7">
            {filteredItems.map((item) => {
              const phone = onlyNumbers(item.responsavel_telefone);
              const waPhone = phone.startsWith("55") ? phone : `55${phone}`;
              const waHref = `https://wa.me/${waPhone}?text=${buildWhatsappMessage(item)}`;

              return (
                <article key={item.id} className="overflow-hidden rounded-[34px] bg-white shadow-xl">
                  <div className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-white p-7">
                    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr_auto] lg:items-start">
                      <div>
                        <p className="text-base font-black uppercase tracking-[0.2em] text-pink-600">Responsável</p>
                        <h2 className="mt-2 text-3xl font-black leading-tight text-[#0d1b4c]">{item.responsavel_nome}</h2>
                        <p className="mt-3 text-lg font-bold text-[#0d1b4c]/80">WhatsApp: {item.responsavel_telefone}</p>
                        {item.responsavel_email && <p className="text-lg font-bold text-[#0d1b4c]/80">E-mail: {item.responsavel_email}</p>}
                        <p className="mt-3 text-base font-bold text-[#0d1b4c]/60">Confirmado em: {formatDate(item.created_at)}</p>
                      </div>

                      <textarea
                        readOnly
                        value={buildPlainWhatsappMessage(item)}
                        className="h-40 w-full rounded-2xl border-2 border-pink-100 bg-white p-4 text-base font-semibold leading-relaxed text-[#0d1b4c] outline-none"
                      />

                      <div className="flex flex-col gap-3">
                        <a href={waHref} target="_blank" rel="noreferrer" className="rounded-2xl bg-green-600 px-6 py-4 text-center text-lg font-black text-white shadow">
                          Abrir WhatsApp
                        </a>
                        <button onClick={() => copyWhatsapp(item)} className="rounded-2xl bg-[#0d1b4c] px-6 py-4 text-lg font-black text-white shadow">
                          Copiar texto
                        </button>
                      </div>
                    </div>

                    {item.observacoes && (
                      <div className="mt-5 rounded-2xl bg-white p-5 text-lg font-bold text-[#0d1b4c]">Observações: {item.observacoes}</div>
                    )}
                  </div>

                  <div className="p-7">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-2xl font-black text-[#0d1b4c]">Convidados desta confirmação</h3>
                      <span className="w-fit rounded-full bg-pink-100 px-5 py-2 text-base font-black text-pink-700">
                        {(item.guests || []).length} pessoa(s)
                      </span>
                    </div>

                    <div className="space-y-4">
                      {(item.guests || []).map((guest) => (
                        <div key={guest.id} className="grid gap-4 rounded-2xl border border-pink-100 bg-[#fffafd] p-5 md:grid-cols-[1fr_230px_140px] md:items-center">
                          <div>
                            <p className="text-2xl font-black text-[#0d1b4c]">{guest.nome}</p>
                            <p className="text-lg font-bold text-[#0d1b4c]/65">{guestLabel(guest)}</p>
                          </div>
                          <div className="rounded-full bg-white px-4 py-3 text-center text-base font-black text-[#0d1b4c] shadow-sm">
                            {guest.menor_seis ? "abaixo de 6 anos" : guest.idade >= 18 ? "adulto" : "criança"}
                          </div>
                          <button onClick={() => deleteGuest(item, guest)} className="rounded-2xl border-2 border-red-200 bg-white px-5 py-4 text-lg font-black text-red-600">
                            Excluir
                          </button>
                        </div>
                      ))}

                      {(!item.guests || item.guests.length === 0) && (
                        <div className="rounded-2xl border border-pink-100 bg-[#fffafd] p-6 text-center text-xl font-black text-[#0d1b4c]/60">
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

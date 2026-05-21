
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

type TableRow = {
  guest: Guest;
  confirmation: Confirmation;
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

function buildRows(items: Confirmation[]): TableRow[] {
  return items.flatMap((item) =>
    (item.guests || []).map((guest) => ({
      guest,
      confirmation: item,
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
      .map((row, index) => {
        const item = row.confirmation;
        const guest = row.guest;
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(guest.nome)}</td>
            <td>${escapeHtml(item.responsavel_nome)}</td>
            <td>${guest.menor_seis ? "Sim" : "Não"}</td>
            <td>${escapeHtml(item.responsavel_telefone || "")}</td>
            <td>${escapeHtml(item.responsavel_email || "")}</td>
            <td class="message">${escapeHtml(buildPlainWhatsappMessage(item))}</td>
          </tr>
        `;
      })
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

  const rows = useMemo(() => buildRows(filteredItems), [filteredItems]);

  const totals = useMemo(() => {
    const allGuests = items.flatMap((item) => item.guests || []);
    return {
      familias: items.length,
      convidados: allGuests.length,
      adultos: allGuests.filter((g) => g.idade >= 18).length,
      criancas: allGuests.filter((g) => g.idade < 18).length,
      menores: allGuests.filter((g) => g.menor_seis).length,
    };
  }, [items]);

  if (!allowed) {
    return (
      <main className="admin-root">
        <style jsx global>{`
          html, body { margin: 0; padding: 0; }
          body { background: #f6f7fb !important; }
        `}</style>

        <section className="login-card">
          <div className="login-header">
            <p>LISTA DE FESTA</p>
            <h1>Painel administrativo</h1>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha do admin"
            className="login-input"
          />

          <button onClick={login} className="login-button">
            Entrar
          </button>
        </section>

        <style jsx>{`
          .admin-root {
            min-height: 100vh;
            background: #f6f7fb;
            padding: 48px 16px;
            font-family: Arial, Helvetica, sans-serif;
            color: #0d1b4c;
          }
          .login-card {
            max-width: 460px;
            margin: 0 auto;
            background: #fff;
            border-radius: 24px;
            padding: 32px;
            box-shadow: 0 14px 36px rgba(13, 27, 76, 0.12);
          }
          .login-header {
            border-bottom: 4px solid #e91e63;
            padding-bottom: 16px;
            margin-bottom: 22px;
          }
          .login-header p {
            margin: 0 0 6px;
            color: #e91e63;
            font-weight: 900;
            letter-spacing: 2px;
          }
          .login-header h1 {
            margin: 0;
            font-size: 30px;
            line-height: 1.2;
            color: #0d1b4c;
          }
          .login-input {
            width: 100%;
            height: 58px;
            border-radius: 14px;
            border: 2px solid #d7dbe8;
            padding: 0 18px;
            font-size: 19px;
            outline: none;
          }
          .login-input:focus { border-color: #e91e63; }
          .login-button {
            width: 100%;
            margin-top: 16px;
            border: 0;
            background: #e91e63;
            color: #fff;
            border-radius: 14px;
            padding: 17px 22px;
            font-size: 19px;
            font-weight: 900;
            cursor: pointer;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <style jsx global>{`
        html, body { margin: 0; padding: 0; }
        body { background: #f6f7fb !important; }
      `}</style>

      <section className="admin-shell">
        <header className="admin-header">
          <div>
            <h1>Lista de Convidados Aniversário Nicole</h1>
            <div className="subtitle">dia 07/06/2026 às 17 horas</div>
            <div className="description">Controle de confirmações, convidados, WhatsApp e relatório para impressão/PDF.</div>
          </div>

          <div className="header-actions">
            <button onClick={load} className="btn dark">Atualizar lista</button>
            <button onClick={openGuestReport} className="btn pink">Gerar relatório/PDF</button>
          </div>
        </header>

        <div className="summary-grid">
          <div><span>Famílias</span><strong>{totals.familias}</strong></div>
          <div><span>Convidados</span><strong>{totals.convidados}</strong></div>
          <div><span>Adultos</span><strong>{totals.adultos}</strong></div>
          <div><span>Crianças</span><strong>{totals.criancas}</strong></div>
          <div><span>Abaixo de 6</span><strong>{totals.menores}</strong></div>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por responsável, telefone, email ou convidado..."
          className="search-input"
        />

        {loading ? (
          <div className="loading-box">Carregando lista...</div>
        ) : (
          <div className="table-card">
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="number-col">#</th>
                    <th>Nome do convidado</th>
                    <th>Responsável pelo cadastro</th>
                    <th className="small-col">Menor de 6?</th>
                    <th>Telefone</th>
                    <th>Email</th>
                    <th className="action-col">WhatsApp</th>
                    <th className="action-col">Copiar</th>
                    <th className="action-col">Excluir</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, index) => {
                    const item = row.confirmation;
                    const guest = row.guest;
                    const phone = onlyNumbers(item.responsavel_telefone);
                    const waPhone = phone.startsWith("55") ? phone : `55${phone}`;
                    const waHref = `https://wa.me/${waPhone}?text=${buildWhatsappMessage(item)}`;

                    return (
                      <tr key={guest.id}>
                        <td className="number-col">{index + 1}</td>
                        <td className="guest-name">
                          {guest.nome}
                          <div className="guest-type">{guestLabel(guest)}</div>
                        </td>
                        <td>
                          <strong>{item.responsavel_nome}</strong>
                          <div className="date-line">{formatDate(item.created_at)}</div>
                        </td>
                        <td className="small-col">
                          <span className={guest.menor_seis ? "pill yes" : "pill no"}>
                            {guest.menor_seis ? "Sim" : "Não"}
                          </span>
                        </td>
                        <td>{item.responsavel_telefone || "-"}</td>
                        <td>{item.responsavel_email || "-"}</td>
                        <td className="action-col">
                          <a href={waHref} target="_blank" rel="noreferrer" className="mini-btn green">
                            WhatsApp
                          </a>
                        </td>
                        <td className="action-col">
                          <button onClick={() => copyWhatsapp(item)} className="mini-btn dark">
                            Copiar
                          </button>
                        </td>
                        <td className="action-col">
                          <button onClick={() => deleteGuest(item, guest)} className="mini-btn danger">
                            Excluir
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={9} className="empty-cell">
                        Nenhum convidado encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          background: #f6f7fb;
          color: #0d1b4c;
          font-family: Arial, Helvetica, sans-serif;
          padding: 28px 16px 48px;
        }

        .admin-shell {
          width: min(100%, 1560px);
          margin: 0 auto;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          background: #fff;
          border-radius: 22px;
          padding: 24px;
          box-shadow: 0 14px 36px rgba(13, 27, 76, 0.12);
          border-bottom: 5px solid #e91e63;
        }

        .admin-header h1 {
          margin: 0;
          font-size: 31px;
          line-height: 1.22;
          color: #0d1b4c;
          font-weight: 900;
        }

        .subtitle {
          margin-top: 8px;
          color: #e91e63;
          font-size: 20px;
          font-weight: 900;
        }

        .description {
          margin-top: 8px;
          color: #334155;
          font-size: 17px;
          font-weight: 700;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .btn {
          border: 0;
          color: #fff;
          border-radius: 14px;
          padding: 14px 18px;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
          white-space: nowrap;
        }

        .btn.dark { background: #0d1b4c; }
        .btn.pink { background: #e91e63; }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
          margin: 18px 0;
        }

        .summary-grid div {
          background: #fff;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 10px 26px rgba(13, 27, 76, 0.08);
        }

        .summary-grid span {
          display: block;
          color: #64748b;
          font-size: 15px;
          font-weight: 900;
        }

        .summary-grid strong {
          display: block;
          margin-top: 5px;
          font-size: 36px;
          color: #0d1b4c;
          line-height: 1;
        }

        .search-input {
          width: 100%;
          height: 58px;
          border-radius: 16px;
          border: 2px solid #d7dbe8;
          padding: 0 18px;
          font-size: 18px;
          font-weight: 700;
          outline: none;
          margin-bottom: 18px;
          background: #fff;
          color: #0d1b4c;
        }

        .search-input:focus { border-color: #e91e63; }

        .loading-box {
          background: #fff;
          padding: 26px;
          border-radius: 18px;
          text-align: center;
          font-size: 22px;
          font-weight: 900;
          box-shadow: 0 10px 26px rgba(13, 27, 76, 0.08);
        }

        .table-card {
          background: #fff;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 14px 36px rgba(13, 27, 76, 0.12);
        }

        .table-scroll { overflow-x: auto; }

        .admin-table {
          width: 100%;
          min-width: 1280px;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 16px;
        }

        .admin-table th {
          background: #0d1b4c;
          color: #fff;
          padding: 14px 10px;
          border: 1px solid #0d1b4c;
          text-align: left;
          font-size: 15px;
          line-height: 1.2;
          font-weight: 900;
        }

        .admin-table td {
          border: 1px solid #d7dbe8;
          padding: 13px 10px;
          vertical-align: middle;
          color: #0d1b4c;
          font-weight: 700;
          line-height: 1.25;
          background: #fff;
          word-break: break-word;
        }

        .admin-table tr:nth-child(even) td {
          background: #fff3f8;
        }

        .number-col {
          width: 54px;
          text-align: center !important;
        }

        .small-col {
          width: 118px;
          text-align: center !important;
        }

        .action-col {
          width: 118px;
          text-align: center !important;
        }

        .guest-name {
          font-size: 18px;
          font-weight: 900 !important;
        }

        .guest-type {
          margin-top: 4px;
          font-size: 13px;
          font-weight: 800;
          color: #64748b;
        }

        .date-line {
          margin-top: 4px;
          font-size: 13px;
          color: #64748b;
          font-weight: 800;
        }

        .pill {
          display: inline-block;
          min-width: 54px;
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 14px;
          font-weight: 900;
        }

        .pill.yes {
          background: #e91e63;
          color: #fff;
        }

        .pill.no {
          background: #f1f5f9;
          color: #0d1b4c;
        }

        .mini-btn {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          border: 0;
          border-radius: 12px;
          padding: 11px 9px;
          color: #fff;
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
          cursor: pointer;
          line-height: 1;
        }

        .mini-btn.green { background: #16a34a; }
        .mini-btn.dark { background: #0d1b4c; }
        .mini-btn.danger {
          background: #fff;
          color: #dc2626;
          border: 2px solid #fecaca;
        }

        .empty-cell {
          padding: 28px !important;
          text-align: center;
          font-size: 20px;
          font-weight: 900 !important;
          color: #64748b !important;
        }

        @media (max-width: 900px) {
          .admin-header {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
          }

          .btn {
            width: 100%;
          }

          .summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 520px) {
          .admin-page {
            padding: 18px 10px 34px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .admin-header h1 {
            font-size: 25px;
          }

          .subtitle {
            font-size: 17px;
          }
        }
      `}</style>
    </main>
  );
}

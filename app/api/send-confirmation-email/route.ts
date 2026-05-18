import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Guest = {
  nome: string;
  idade?: number;
  menor_seis?: boolean;
};

function escapeHtml(value: string) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseEmails(value: string) {
  const emails = value
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  // Evita erro de destinatário duplicado no Brevo, caso um email apareça duas vezes.
  return Array.from(new Set(emails));
}

function guestLabel(g: Guest) {
  if (g.menor_seis) return "criança abaixo de 6 anos";
  if (g.idade && g.idade >= 18) return "adulto";
  return "convidado";
}

function buildGoogleCalendarLink() {
  const title = encodeURIComponent("Aniversário da Nicole - 8 anos");
  const details = encodeURIComponent("Prepare as malas para viver uma aventura incrível no aniversário da Nicole!");
  const location = encodeURIComponent("Buffet Vila da Festa, R. Dr. Jesuíno Maciel, 263, Campo Belo, São Paulo - SP");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20260607T200000Z/20260607T230000Z&details=${details}&location=${location}`;
}

function buildMapsLink() {
  return "https://www.google.com/maps/search/?api=1&query=R.%20Dr.%20Jesu%C3%ADno%20Maciel%2C%20263%20Campo%20Belo%20S%C3%A3o%20Paulo%20SP";
}

async function getCurrentGuestCount(convidadosDaConfirmacao: number) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRole) {
    return {
      totalGeral: convidadosDaConfirmacao,
      observacao: "Total calculado apenas com esta confirmação porque SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL não está configurada.",
    };
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRole);

  const { count, error } = await supabaseAdmin
    .from("guests")
    .select("id", { count: "exact", head: true });

  if (error || typeof count !== "number") {
    return {
      totalGeral: convidadosDaConfirmacao,
      observacao: "Não foi possível consultar o total geral no Supabase.",
    };
  }

  return {
    totalGeral: count,
    observacao: "",
  };
}

function buildGuestHtmlEmail(params: {
  responsavelNome: string;
  convidados: Guest[];
  origin: string;
}) {
  const imageUrl = `${params.origin}/assets/nicole/hero-nicole-confirmacao.png`;
  const calendarUrl = buildGoogleCalendarLink();
  const mapsUrl = buildMapsLink();

  const convidadosHtml = params.convidados
    .map((g) => `<li style="margin:8px 0;"><strong>${escapeHtml(g.nome)}</strong> <span style="color:#6b7280;">(${guestLabel(g)})</span></li>`)
    .join("");

  return `
  <!doctype html>
  <html lang="pt-BR">
  <body style="margin:0;padding:0;background:#fff3f8;font-family:Arial,Helvetica,sans-serif;color:#0d1b4c;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff3f8;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 18px 45px rgba(13,27,76,.14);">
            <tr>
              <td><img src="${imageUrl}" alt="Aniversário da Nicole" width="680" style="display:block;width:100%;max-width:680px;height:auto;border:0;"></td>
            </tr>
            <tr>
              <td style="padding:34px 30px 12px;text-align:center;">
                <div style="display:inline-block;background:#e91e63;color:white;font-weight:900;letter-spacing:2px;border-radius:999px;padding:10px 18px;font-size:13px;">NONO AIRLINES</div>
                <h1 style="margin:22px 0 8px;font-size:34px;line-height:1.1;color:#e91e63;">Presença confirmada! ✈️</h1>
                <p style="margin:0 auto;font-size:18px;line-height:1.55;font-weight:700;max-width:540px;">Olá, ${escapeHtml(params.responsavelNome)}! Recebemos sua confirmação para o aniversário da Nicole.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff8fc;border:1px solid #ffd2e4;border-radius:22px;padding:18px;">
                  <tr>
                    <td style="font-size:17px;line-height:1.7;font-weight:800;">
                      📅 07/06/2026 — Domingo<br>
                      ⏰ 17:00 horas<br>
                      📍 Buffet Vila da Festa<br>
                      <span style="font-weight:600;">R. Dr. Jesuíno Maciel, 263 — Campo Belo, São Paulo - SP</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 30px 18px;">
                <h2 style="font-size:22px;margin:0 0 10px;color:#0d1b4c;">Convidados confirmados</h2>
                <ul style="padding-left:22px;margin:0;font-size:16px;line-height:1.5;">${convidadosHtml || "<li>Confirmação recebida.</li>"}</ul>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:12px 30px 34px;">
                <a href="${calendarUrl}" style="display:block;background:#e91e63;color:#ffffff;text-decoration:none;font-weight:900;border-radius:18px;padding:17px 22px;margin-bottom:12px;font-size:17px;">Adicionar ao Google Calendar</a>
                <a href="${mapsUrl}" style="display:block;background:#0d1b4c;color:#ffffff;text-decoration:none;font-weight:900;border-radius:18px;padding:17px 22px;font-size:17px;">Abrir endereço no Google Maps</a>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 30px;background:#0d1b4c;color:white;text-align:center;">
                <p style="margin:0;font-size:15px;line-height:1.5;">Esperamos vocês para uma viagem pelo mundo com a Nicole! 💕</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

function buildInternalHtmlEmail(params: {
  responsavelNome: string;
  responsavelTelefone: string;
  responsavelEmail: string;
  convidados: Guest[];
  totalGeral: number;
  observacaoTotal?: string;
}) {
  const convidadosHtml = params.convidados
    .map((g) => `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f3d7e2;font-weight:800;">${escapeHtml(g.nome)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3d7e2;color:#4b5563;">${guestLabel(g)}</td>
    </tr>`)
    .join("");

  return `
  <!doctype html>
  <html lang="pt-BR">
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#0d1b4c;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 14px 36px rgba(13,27,76,.12);">
            <tr>
              <td style="background:#0d1b4c;color:#ffffff;padding:26px 30px;">
                <p style="margin:0 0 6px;font-size:13px;font-weight:900;letter-spacing:2px;color:#ff8eb8;">LISTA DE FESTA</p>
                <h1 style="margin:0;font-size:28px;line-height:1.2;">Nova confirmação recebida</h1>
              </td>
            </tr>

            <tr>
              <td style="padding:26px 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="width:50%;padding:14px;background:#fff3f8;border-radius:18px;">
                      <p style="margin:0;color:#6b7280;font-size:13px;font-weight:800;">TOTAL GERAL ATÉ AGORA</p>
                      <p style="margin:6px 0 0;font-size:36px;font-weight:900;color:#e91e63;">${params.totalGeral}</p>
                      <p style="margin:0;font-size:14px;font-weight:800;color:#0d1b4c;">convidados confirmados</p>
                    </td>
                    <td style="width:16px;"></td>
                    <td style="width:50%;padding:14px;background:#eef2ff;border-radius:18px;">
                      <p style="margin:0;color:#6b7280;font-size:13px;font-weight:800;">ESTA CONFIRMAÇÃO</p>
                      <p style="margin:6px 0 0;font-size:36px;font-weight:900;color:#0d1b4c;">${params.convidados.length}</p>
                      <p style="margin:0;font-size:14px;font-weight:800;color:#0d1b4c;">convidados</p>
                    </td>
                  </tr>
                </table>

                ${params.observacaoTotal ? `<p style="margin:14px 0 0;color:#b45309;font-size:13px;font-weight:700;">${escapeHtml(params.observacaoTotal)}</p>` : ""}

                <h2 style="margin:28px 0 12px;font-size:20px;color:#0d1b4c;">Responsável</h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fafafa;border:1px solid #eee;border-radius:18px;padding:16px;">
                  <tr><td style="padding:4px 0;font-weight:900;">Nome: ${escapeHtml(params.responsavelNome)}</td></tr>
                  <tr><td style="padding:4px 0;font-weight:700;">WhatsApp: ${escapeHtml(params.responsavelTelefone)}</td></tr>
                  <tr><td style="padding:4px 0;font-weight:700;">Email: ${escapeHtml(params.responsavelEmail || "não informado")}</td></tr>
                </table>

                <h2 style="margin:28px 0 12px;font-size:20px;color:#0d1b4c;">Convidados desta confirmação</h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0;background:#fff8fc;border:1px solid #f3d7e2;border-radius:18px;overflow:hidden;">
                  <thead>
                    <tr>
                      <th align="left" style="padding:12px;background:#ffe3ef;color:#0d1b4c;font-size:13px;">Nome</th>
                      <th align="left" style="padding:12px;background:#ffe3ef;color:#0d1b4c;font-size:13px;">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${convidadosHtml || `<tr><td colspan="2" style="padding:12px;">Nenhum convidado informado.</td></tr>`}
                  </tbody>
                </table>
              </td>
            </tr>

            <tr>
              <td style="background:#f9fafb;color:#6b7280;padding:18px 30px;text-align:center;font-size:13px;">
                Aviso automático do sistema de confirmação da festa da Nicole.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

async function sendBrevoEmail(params: {
  apiKey: string;
  senderName: string;
  senderEmail: string;
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
}) {
  if (!params.to.length) return { skipped: true };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": params.apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: params.senderName, email: params.senderEmail },
      to: params.to,
      subject: params.subject,
      htmlContent: params.htmlContent,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(JSON.stringify(result));
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "contato@resumindoviagens.com.br";
    const senderName = process.env.BREVO_SENDER_NAME || "Aniversário da Nicole";
    const internalEmails =
      process.env.INTERNAL_NOTIFY_EMAILS ||
      "contato@resumindoviagens.com.br,tatideabreu@hotmail.com,contato@resumindoviagens.com.br";

    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "BREVO_API_KEY não configurada." }, { status: 500 });
    }

    const body = await request.json();
    const responsavelNome = String(body.responsavelNome || "").trim();
    const responsavelTelefone = String(body.responsavelTelefone || "").trim();
    const responsavelEmail = String(body.responsavelEmail || "").trim();
    const convidados: Guest[] = Array.isArray(body.convidados) ? body.convidados : [];

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://nicole.resumindoviagens.com.br";

    const { totalGeral, observacao } = await getCurrentGuestCount(convidados.length);

    const results: Record<string, unknown> = {};

    if (responsavelEmail) {
      results.guest = await sendBrevoEmail({
        apiKey,
        senderName,
        senderEmail,
        to: [{ email: responsavelEmail, name: responsavelNome || responsavelEmail }],
        subject: "Presença confirmada — Aniversário da Nicole ✈️💕",
        htmlContent: buildGuestHtmlEmail({
          responsavelNome: responsavelNome || "Tudo bem",
          convidados,
          origin,
        }),
      });
    } else {
      results.guest = { skipped: true, reason: "Responsável sem email." };
    }

    const internalTo = parseEmails(internalEmails).map((email) => ({
      email,
      name: "Controle da Festa",
    }));

    results.internal = await sendBrevoEmail({
      apiKey,
      senderName,
      senderEmail,
      to: internalTo,
      subject: `Nova confirmação — Nicole — total ${totalGeral}`,
      htmlContent: buildInternalHtmlEmail({
        responsavelNome: responsavelNome || "Responsável",
        responsavelTelefone,
        responsavelEmail,
        convidados,
        totalGeral,
        observacaoTotal: observacao,
      }),
    });

    return NextResponse.json({ ok: true, results });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Erro ao enviar email." },
      { status: 500 }
    );
  }
}
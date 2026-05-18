
import { NextRequest, NextResponse } from "next/server";

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
  return value
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
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

function guestLabel(g: Guest) {
  if (g.menor_seis) return "criança abaixo de 6 anos";
  if (g.idade && g.idade >= 18) return "adulto";
  return "convidado";
}

function buildHtmlEmail(params: {
  responsavelNome: string;
  convidados: Guest[];
  origin: string;
  internal?: boolean;
  responsavelTelefone?: string;
  responsavelEmail?: string;
}) {
  const imageUrl = `${params.origin}/assets/nicole/hero-nicole-confirmacao.png`;
  const calendarUrl = buildGoogleCalendarLink();
  const mapsUrl = buildMapsLink();

  const convidadosHtml = params.convidados
    .map((g) => `<li style="margin:8px 0;"><strong>${escapeHtml(g.nome)}</strong> <span style="color:#6b7280;">(${guestLabel(g)})</span></li>`)
    .join("");

  const title = params.internal ? "Nova confirmação recebida ✈️" : "Presença confirmada! ✈️";
  const intro = params.internal
    ? `Nova confirmação no site da Nicole.`
    : `Olá, ${escapeHtml(params.responsavelNome)}! Recebemos sua confirmação para o aniversário da Nicole.`;

  const internalBlock = params.internal
    ? `
      <tr>
        <td style="padding:8px 30px 18px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff8fc;border:1px solid #ffd2e4;border-radius:22px;padding:18px;">
            <tr>
              <td style="font-size:16px;line-height:1.7;font-weight:800;">
                Responsável: ${escapeHtml(params.responsavelNome)}<br>
                WhatsApp: ${escapeHtml(params.responsavelTelefone || "")}<br>
                Email informado: ${escapeHtml(params.responsavelEmail || "não informado")}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
    : "";

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
                <h1 style="margin:22px 0 8px;font-size:34px;line-height:1.1;color:#e91e63;">${title}</h1>
                <p style="margin:0 auto;font-size:18px;line-height:1.55;font-weight:700;max-width:540px;">${intro}</p>
              </td>
            </tr>

            ${internalBlock}

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
    const internalEmails = process.env.INTERNAL_NOTIFY_EMAILS || "contato@resumindoviagens.com.br,tatideabreu@hotmail.com,contato@resumindoviagens.com.br";

    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "BREVO_API_KEY não configurada." }, { status: 500 });
    }

    const body = await request.json();
    const responsavelNome = String(body.responsavelNome || "").trim();
    const responsavelTelefone = String(body.responsavelTelefone || "").trim();
    const responsavelEmail = String(body.responsavelEmail || "").trim();
    const convidados: Guest[] = Array.isArray(body.convidados) ? body.convidados : [];

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://nicole.resumindoviagens.com.br";

    const results: any = {};

    if (responsavelEmail) {
      results.guest = await sendBrevoEmail({
        apiKey,
        senderName,
        senderEmail,
        to: [{ email: responsavelEmail, name: responsavelNome || responsavelEmail }],
        subject: "Presença confirmada — Aniversário da Nicole ✈️💕",
        htmlContent: buildHtmlEmail({
          responsavelNome: responsavelNome || "Tudo bem",
          convidados,
          origin,
          responsavelTelefone,
          responsavelEmail,
        }),
      });
    } else {
      results.guest = { skipped: true, reason: "Responsável sem email." };
    }

    const internalTo = parseEmails(internalEmails).map((email) => ({ email, name: "Controle da Festa" }));

    results.internal = await sendBrevoEmail({
      apiKey,
      senderName,
      senderEmail,
      to: internalTo,
      subject: `Nova confirmação — Nicole — ${responsavelNome || "Responsável"}`,
      htmlContent: buildHtmlEmail({
        responsavelNome: responsavelNome || "Responsável",
        convidados,
        origin,
        internal: true,
        responsavelTelefone,
        responsavelEmail,
      }),
    });

    return NextResponse.json({ ok: true, results });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Erro ao enviar email." }, { status: 500 });
  }
}

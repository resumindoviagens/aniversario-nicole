import { NextRequest, NextResponse } from "next/server";

type Guest = { nome: string; idade?: number; menor_seis?: boolean };

function htmlEscape(v: string) {
  return String(v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function calendarLink() {
  const title = encodeURIComponent("Aniversário da Nicole - 8 anos");
  const details = encodeURIComponent("Confirmação de presença no aniversário da Nicole.");
  const location = encodeURIComponent("Buffet Vila da Festa, R. Dr. Jesuíno Maciel, 263, Campo Belo, São Paulo - SP");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20260607T200000Z/20260607T230000Z&details=${details}&location=${location}`;
}

function mapsLink() {
  return "https://www.google.com/maps/search/?api=1&query=R.%20Dr.%20Jesu%C3%ADno%20Maciel%2C%20263%20Campo%20Belo%20S%C3%A3o%20Paulo%20SP";
}

function emailHtml({ responsavelNome, convidados, origin }: { responsavelNome: string; convidados: Guest[]; origin: string }) {
  const imageUrl = `${origin}/assets/nicole/hero-nicole-confirmacao.png`;
  const list = convidados.map((g) => {
    const tipo = g.menor_seis ? "criança abaixo de 6 anos" : g.idade && g.idade >= 18 ? "adulto" : "convidado";
    return `<li style="margin:8px 0;"><strong>${htmlEscape(g.nome)}</strong> <span style="color:#64748b;">(${tipo})</span></li>`;
  }).join("");

  return `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;background:#fff3f8;font-family:Arial,Helvetica,sans-serif;color:#0d1b4c;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background:#fff3f8;padding:24px 12px;">
    <tr><td align="center">
      <table width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:white;border-radius:28px;overflow:hidden;box-shadow:0 18px 45px rgba(13,27,76,.14);">
        <tr><td><img src="${imageUrl}" width="680" alt="Aniversário da Nicole" style="display:block;width:100%;height:auto;border:0;"></td></tr>
        <tr><td style="padding:34px 30px 12px;text-align:center;">
          <div style="display:inline-block;background:#e91e63;color:white;font-weight:900;letter-spacing:2px;border-radius:999px;padding:10px 18px;font-size:13px;">NONO AIRLINES</div>
          <h1 style="margin:22px 0 8px;font-size:34px;line-height:1.1;color:#e91e63;">Presença confirmada! ✈️</h1>
          <p style="margin:0 auto;font-size:18px;line-height:1.55;font-weight:700;max-width:540px;">Olá, ${htmlEscape(responsavelNome)}! Recebemos sua confirmação para o aniversário da Nicole.</p>
        </td></tr>
        <tr><td style="padding:18px 30px;">
          <div style="background:#fff8fc;border:1px solid #ffd2e4;border-radius:22px;padding:18px;font-size:17px;line-height:1.7;font-weight:800;">
            📅 07/06/2026 — Domingo<br>
            ⏰ 17:00 horas<br>
            📍 Buffet Vila da Festa<br>
            <span style="font-weight:600;">R. Dr. Jesuíno Maciel, 263 — Campo Belo, São Paulo - SP</span>
          </div>
        </td></tr>
        <tr><td style="padding:8px 30px 18px;">
          <h2 style="font-size:22px;margin:0 0 10px;color:#0d1b4c;">Convidados confirmados</h2>
          <ul style="padding-left:22px;margin:0;font-size:16px;line-height:1.5;">${list || "<li>Confirmação recebida.</li>"}</ul>
        </td></tr>
        <tr><td align="center" style="padding:12px 30px 34px;">
          <a href="${calendarLink()}" style="display:block;background:#e91e63;color:#fff;text-decoration:none;font-weight:900;border-radius:18px;padding:17px 22px;margin-bottom:12px;font-size:17px;">Adicionar ao Google Calendar</a>
          <a href="${mapsLink()}" style="display:block;background:#0d1b4c;color:#fff;text-decoration:none;font-weight:900;border-radius:18px;padding:17px 22px;font-size:17px;">Abrir endereço no Google Maps</a>
        </td></tr>
        <tr><td style="padding:24px 30px;background:#0d1b4c;color:white;text-align:center;">
          <p style="margin:0;font-size:15px;line-height:1.5;">Esperamos vocês para uma viagem pelo mundo com a Nicole! 💕</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) return NextResponse.json({ ok: false, error: "BREVO_API_KEY ausente na Vercel." }, { status: 500 });

    const body = await request.json();
    const responsavelEmail = String(body.responsavelEmail || "").trim();
    const responsavelNome = String(body.responsavelNome || "").trim();
    const convidados: Guest[] = Array.isArray(body.convidados) ? body.convidados : [];

    if (!responsavelEmail) return NextResponse.json({ ok: true, skipped: true, reason: "Sem e-mail informado." });

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://nicole.resumindoviagens.com.br";
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "contato@resumindoviagens.com.br";
    const senderName = process.env.BREVO_SENDER_NAME || "Aniversário da Nicole";

    const brevo = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: responsavelEmail, name: responsavelNome || responsavelEmail }],
        subject: "Presença confirmada — Aniversário da Nicole ✈️💕",
        htmlContent: emailHtml({ responsavelNome: responsavelNome || "Tudo bem", convidados, origin })
      })
    });

    const result = await brevo.json().catch(() => ({}));
    if (!brevo.ok) return NextResponse.json({ ok: false, error: "Erro Brevo", details: result }, { status: brevo.status });

    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro desconhecido." }, { status: 500 });
  }
}
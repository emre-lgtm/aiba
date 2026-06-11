import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transporter } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Ad, e-posta ve mesaj zorunludur" }, { status: 400 });
    }

    // Settings'ten alıcı bilgilerini al
    const supabase = await createClient();
    const { data: settingsRow } = await supabase
      .from("site_settings").select("data").eq("id", 1).single();

    const settings  = settingsRow?.data as Record<string, string> | null;
    const toEmail   = process.env.SMTP_USER || settings?.email || "info@aibastone.com";
    const fromEmail = process.env.SMTP_USER!;
    const siteName  = settings?.site_name || "AIBA STONE";

    // DB'ye kaydet
    await supabase.from("contact_submissions").insert({
      name, email,
      phone:   phone   || null,
      subject: subject || "Website Contact Form",
      message,
    }).maybeSingle();

    // ── Yöneticiye bildirim e-postası ─────────────────────────────────────
    await transporter.sendMail({
      from:    `"${siteName}" <${fromEmail}>`,
      to:      toEmail,
      replyTo: `"${name}" <${email}>`,
      subject: `[${siteName}] Yeni Mesaj: ${subject || name}`,
      html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
  <div style="background:#292524;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px">
    <h2 style="color:#FAC775;margin:0;font-size:20px">${siteName}</h2>
    <p style="color:#a8a29e;margin:6px 0 0;font-size:13px">Yeni iletişim formu mesajı</p>
  </div>

  <div style="background:#f5f5f4;border-radius:12px;padding:20px;margin-bottom:16px">
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:8px 0;color:#78716c;font-size:13px;width:110px">Ad Soyad</td>
        <td style="padding:8px 0;font-weight:600;color:#1c1917">${name}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#78716c;font-size:13px">E-posta</td>
        <td style="padding:8px 0"><a href="mailto:${email}" style="color:#d97706;text-decoration:none">${email}</a></td>
      </tr>
      ${phone ? `<tr>
        <td style="padding:8px 0;color:#78716c;font-size:13px">Telefon</td>
        <td style="padding:8px 0"><a href="tel:${phone}" style="color:#d97706;text-decoration:none">${phone}</a></td>
      </tr>` : ""}
      ${subject ? `<tr>
        <td style="padding:8px 0;color:#78716c;font-size:13px">Konu</td>
        <td style="padding:8px 0;font-weight:600;color:#1c1917">${subject}</td>
      </tr>` : ""}
    </table>
  </div>

  <div style="background:#fff;border:1px solid #e7e5e4;border-radius:12px;padding:20px;margin-bottom:24px">
    <p style="color:#78716c;font-size:11px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.06em">Mesaj</p>
    <p style="color:#1c1917;line-height:1.7;margin:0;white-space:pre-wrap">${message}</p>
  </div>

  <div style="text-align:center">
    <a href="mailto:${email}" style="display:inline-block;background:#d97706;color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:500;font-size:14px">
      Yanıtla →
    </a>
  </div>

  <p style="color:#a8a29e;font-size:11px;text-align:center;margin-top:24px">
    Bu e-posta ${siteName} web sitesinden gönderilmiştir.
  </p>
</div>`,
    });

    // ── Kullanıcıya otomatik onay e-postası ───────────────────────────────
    await transporter.sendMail({
      from:    `"${siteName}" <${fromEmail}>`,
      to:      `"${name}" <${email}>`,
      subject: `Mesajınız alındı — ${siteName}`,
      html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
  <div style="background:#292524;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px">
    <h2 style="color:#FAC775;margin:0;font-size:20px">${siteName}</h2>
  </div>

  <p style="color:#1c1917;font-size:16px;margin-bottom:8px">Merhaba ${name},</p>
  <p style="color:#57534e;line-height:1.7;margin-bottom:20px">
    Mesajınız başarıyla alındı. Ekibimiz en kısa sürede size geri dönecektir.
  </p>

  <div style="background:#f5f5f4;border-radius:12px;padding:20px;margin-bottom:24px">
    <p style="color:#78716c;font-size:11px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.06em">İlettiğiniz mesaj</p>
    <p style="color:#1c1917;line-height:1.7;margin:0;white-space:pre-wrap">${message}</p>
  </div>

  <p style="color:#a8a29e;font-size:12px;text-align:center">
    ${siteName} — <a href="mailto:${toEmail}" style="color:#d97706;text-decoration:none">${toEmail}</a>
  </p>
</div>`,
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Mesaj gönderilemedi" }, { status: 500 });
  }
}

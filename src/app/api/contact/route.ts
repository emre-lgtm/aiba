import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Ad, e-posta ve mesaj zorunludur" }, { status: 400 });
    }

    // Settings'ten alıcı e-posta al
    const supabase = await createClient();
    const { data: settingsRow } = await supabase
      .from("site_settings").select("data").eq("id", 1).single();

    const settings = settingsRow?.data as Record<string, string> | null;
    const toEmail  = settings?.email || process.env.CONTACT_EMAIL || "info@aibastone.com";
    const siteName = settings?.site_name || "AIBA STONE";

    // DB'ye kaydet
    await supabase.from("contact_submissions").insert({
      name, email,
      phone: phone || null,
      subject: subject || "Website Contact Form",
      message,
    }).maybeSingle();

    // Resend ile e-posta gönder
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);

      await resend.emails.send({
        from: `${siteName} <onboarding@resend.dev>`,
        to: [toEmail],
        replyTo: email,
        subject: `[${siteName}] Yeni Mesaj: ${subject || name}`,
        html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
  <div style="background:#292524;padding:24px;border-radius:12px;margin-bottom:24px;text-align:center">
    <h2 style="color:#FAC775;margin:0">${siteName}</h2>
    <p style="color:#a8a29e;margin:6px 0 0;font-size:13px">Yeni iletişim formu mesajı</p>
  </div>
  <div style="background:#f5f5f4;border-radius:12px;padding:24px;margin-bottom:16px">
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:8px 0;color:#78716c;font-size:13px;width:120px">Ad Soyad</td><td style="padding:8px 0;font-weight:500">${name}</td></tr>
      <tr><td style="padding:8px 0;color:#78716c;font-size:13px">E-posta</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#d97706">${email}</a></td></tr>
      ${phone ? `<tr><td style="padding:8px 0;color:#78716c;font-size:13px">Telefon</td><td style="padding:8px 0"><a href="tel:${phone}" style="color:#d97706">${phone}</a></td></tr>` : ""}
      ${subject ? `<tr><td style="padding:8px 0;color:#78716c;font-size:13px">Konu</td><td style="padding:8px 0;font-weight:500">${subject}</td></tr>` : ""}
    </table>
  </div>
  <div style="background:#fff;border:1px solid #e7e5e4;border-radius:12px;padding:20px;margin-bottom:24px">
    <p style="color:#78716c;font-size:12px;margin:0 0 8px;text-transform:uppercase">Mesaj</p>
    <p style="color:#1c1917;line-height:1.6;margin:0;white-space:pre-wrap">${message}</p>
  </div>
  <p style="color:#a8a29e;font-size:12px;text-align:center">Bu e-posta ${siteName} web sitesinden gönderilmiştir.</p>
</div>`,
      });

      // Kullanıcıya otomatik yanıt
      await resend.emails.send({
        from: `${siteName} <onboarding@resend.dev>`,
        to: [email],
        subject: `Mesajınız alındı — ${siteName}`,
        html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
  <div style="background:#292524;padding:24px;border-radius:12px;margin-bottom:24px;text-align:center">
    <h2 style="color:#FAC775;margin:0">${siteName}</h2>
  </div>
  <p style="color:#1c1917;font-size:16px">Merhaba ${name},</p>
  <p style="color:#57534e;line-height:1.6">Mesajınız alındı. En kısa sürede size geri döneceğiz.</p>
  <div style="background:#f5f5f4;border-radius:12px;padding:20px;margin:24px 0">
    <p style="color:#78716c;font-size:12px;margin:0 0 8px">Mesajınız:</p>
    <p style="color:#1c1917;margin:0;white-space:pre-wrap">${message}</p>
  </div>
  <p style="color:#a8a29e;font-size:12px;text-align:center">${siteName}</p>
</div>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Mesaj gönderilemedi" }, { status: 500 });
  }
}

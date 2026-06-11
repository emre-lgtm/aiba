"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Send, CheckCircle2, Loader2 } from "lucide-react";
import { springs, staggerContainer, staggerItem, sectionHeader, easings } from "@/lib/motion";
import { Magnetic } from "@/components/motion/magnetic";
import { useSettings } from "@/hooks/use-settings";

export function ContactSection() {
  const { phone, email, address, sections } = useSettings();
  const sec = sections.contact;
  const titleBase = sec.title.replace(sec.title_accent, "").trim();
  const titleAccentFirst = sec.title.startsWith(sec.title_accent);

  const mapQuery = encodeURIComponent(address.replace(/\s+/g, " ").trim());
  const mapSrc = `https://www.google.com/maps?q=${mapQuery}&z=17&output=embed`;

  const [form, setForm] = useState({
    name: "", email: "", phone: "", subject: "", message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Ad, e-posta ve mesaj alanları zorunludur.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Gönderilemedi");
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setError("Mesaj gönderilemedi. Lütfen tekrar deneyin.");
    }
    setSubmitting(false);
  };

  const contactInfo = [
    { icon: MapPin, label: "Adres", value: address },
    { icon: Phone, label: "Telefon", value: phone, href: `https://wa.me/${phone.replace(/[^0-9]/g, "").replace(/^0/, "")}` },
    { icon: Mail,  label: "E-posta", value: email, href: `mailto:${email}` },
  ];

  const inputClass = "w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all";

  return (
    <section id="contact" className="section-padding bg-white">
      <div className="container-luxury">
        {/* Header */}
        <motion.div
          variants={sectionHeader} initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-bronze-600 text-sm font-semibold tracking-[0.2em] uppercase">
            {sec.subtitle}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mt-4 mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}>
            {titleAccentFirst
              ? <><span className="text-gradient">{sec.title_accent}</span>{" "}{titleBase}</>
              : <>{titleBase}{" "}<span className="text-gradient">{sec.title_accent}</span></>}
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed">{sec.description}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
          {/* Left: info + map */}
          <motion.div
            variants={staggerContainer(0.1)} initial="hidden"
            whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            className="space-y-8"
          >
            <div className="space-y-5">
              {contactInfo.map((item, i) => (
                <motion.div key={i} variants={staggerItem} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-bronze-50 border border-bronze-100 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-bronze-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">{item.label}</p>
                    {item.href
                      ? <a href={item.href} className="text-stone-700 hover:text-bronze-600 transition-colors">{item.value}</a>
                      : <p className="text-stone-700">{item.value}</p>}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={staggerItem}
              className="rounded-2xl overflow-hidden h-64 border border-stone-100 shadow-sm">
              <iframe src={mapSrc} width="100%" height="100%" style={{ border: 0 }}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                title="Location Map" />
            </motion.div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: easings.enter }}
          >
            <form onSubmit={handleSubmit}
              className="bg-stone-50 rounded-2xl p-6 md:p-10 border border-stone-100 space-y-5">
              <div>
                <h3 className="text-2xl font-bold text-stone-900 mb-1"
                  style={{ fontFamily: "var(--font-playfair)" }}>Teklif Alın</h3>
                <p className="text-stone-500 text-sm">24 saat içinde size geri döneceğiz.</p>
              </div>

              {submitted ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 text-lg">Mesajınız alındı!</p>
                    <p className="text-stone-500 text-sm mt-1">En kısa sürede size ulaşacağız.</p>
                  </div>
                  <button type="button" onClick={() => setSubmitted(false)}
                    className="text-sm text-bronze-600 hover:underline mt-2">Yeni mesaj gönder</button>
                </motion.div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">Ad Soyad *</label>
                      <input type="text" value={form.name} onChange={set("name")}
                        placeholder="Adınız Soyadınız" className={inputClass} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">E-posta *</label>
                      <input type="email" value={form.email} onChange={set("email")}
                        placeholder="ornek@mail.com" className={inputClass} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">Telefon</label>
                      <input type="tel" value={form.phone} onChange={set("phone")}
                        placeholder="+90 555 123 45 67" className={inputClass} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">Taş Türü</label>
                      <select value={form.subject} onChange={set("subject")} className={inputClass}>
                        <option value="">Seçiniz</option>
                        <option>Mermer</option>
                        <option>Traverten</option>
                        <option>Kireçtaşı</option>
                        <option>Granit</option>
                        <option>Oniks</option>
                        <option>Diğer</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-1.5 block">Mesaj *</label>
                    <textarea rows={4} value={form.message} onChange={set("message")}
                      placeholder="Projeniz hakkında bize bilgi verin..."
                      className={inputClass + " resize-none"} required />
                  </div>

                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <Magnetic strength={0.1}>
                    <motion.button type="submit" disabled={submitting}
                      whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(168,108,45,0.3)" }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 bg-bronze-600 hover:bg-bronze-700 disabled:opacity-60 text-white px-8 py-4 rounded-xl font-medium transition-colors cursor-pointer">
                      {submitting
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor...</>
                        : <><Send className="w-4 h-4" /> Mesaj Gönder</>}
                    </motion.button>
                  </Magnetic>
                </>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

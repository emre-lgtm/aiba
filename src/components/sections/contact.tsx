"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, Send, CheckCircle2, Loader2 } from "lucide-react";
import { staggerContainer, staggerItem, sectionHeader, easings } from "@/lib/motion";
import { Magnetic } from "@/components/motion/magnetic";
import { useSettings } from "@/hooks/use-settings";

export function ContactSection() {
  const { phone, email, sections } = useSettings();
  const sec = sections.contact;
  const titleBase = sec.title.replace(sec.title_accent, "").trim();
  const titleAccentFirst = sec.title.startsWith(sec.title_accent);

  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Name, email and message are required.");
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
      if (!res.ok) throw new Error();
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setError("Failed to send message. Please try again.");
    }
    setSubmitting(false);
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-start">

          {/* Left: contact info */}
          <motion.div
            variants={staggerContainer(0.12)} initial="hidden"
            whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            className="space-y-6"
          >
            <motion.div variants={staggerItem} className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-bronze-50 border border-bronze-100 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-bronze-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Phone</p>
                <a href={`https://wa.me/${phone.replace(/[^0-9]/g, "").replace(/^0/, "")}`}
                  className="text-stone-700 hover:text-bronze-600 transition-colors text-lg font-medium">
                  {phone}
                </a>
              </div>
            </motion.div>

            <motion.div variants={staggerItem} className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-bronze-50 border border-bronze-100 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-bronze-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Email</p>
                <a href={`mailto:${email}`}
                  className="text-stone-700 hover:text-bronze-600 transition-colors text-lg font-medium">
                  {email}
                </a>
              </div>
            </motion.div>

            {/* Decorative quote */}
            <motion.div variants={staggerItem}
              className="mt-8 p-6 rounded-2xl bg-stone-50 border border-stone-100">
              <p className="text-stone-500 text-sm leading-relaxed italic">
                "We source premium natural stone directly from the finest quarries in Turkey, Europe and worldwide — bringing quality and elegance to every project."
              </p>
              <p className="mt-3 text-xs font-semibold text-bronze-600 uppercase tracking-wider">AIBA STONE</p>
            </motion.div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: easings.enter }}
          >
            <form onSubmit={handleSubmit}
              className="bg-stone-50 rounded-2xl p-6 md:p-10 border border-stone-100 space-y-5">
              <div>
                <h3 className="text-2xl font-bold text-stone-900 mb-1"
                  style={{ fontFamily: "var(--font-playfair)" }}>Get a Quote</h3>
                <p className="text-stone-500 text-sm">We'll get back to you within 24 hours.</p>
              </div>

              {submitted ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 text-lg">Message received!</p>
                    <p className="text-stone-500 text-sm mt-1">We'll be in touch soon.</p>
                  </div>
                  <button type="button" onClick={() => setSubmitted(false)}
                    className="text-sm text-bronze-600 hover:underline mt-2">Send another message</button>
                </motion.div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">Full Name *</label>
                      <input type="text" value={form.name} onChange={set("name")}
                        placeholder="Your full name" className={inputClass} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">Email *</label>
                      <input type="email" value={form.email} onChange={set("email")}
                        placeholder="your@email.com" className={inputClass} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">Phone</label>
                      <input type="tel" value={form.phone} onChange={set("phone")}
                        placeholder="+90 555 123 45 67" className={inputClass} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">Stone Type</label>
                      <select value={form.subject} onChange={set("subject")} className={inputClass}>
                        <option value="">Select...</option>
                        <option>Marble</option>
                        <option>Travertine</option>
                        <option>Limestone</option>
                        <option>Granite</option>
                        <option>Onyx</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-1.5 block">Message *</label>
                    <textarea rows={4} value={form.message} onChange={set("message")}
                      placeholder="Tell us about your project..."
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
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                        : <><Send className="w-4 h-4" /> Send Message</>}
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

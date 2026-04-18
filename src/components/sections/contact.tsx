"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import { SITE as FALLBACK_SITE } from "@/lib/constants";

export function ContactSection() {
  const [phone, setPhone] = useState("+90 500 123 45 67");
  const [email, setEmail] = useState("info@aibastone.com");
  const [address, setAddress] = useState(FALLBACK_SITE.address);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.phone) setPhone(data.phone);
          if (data.email) setEmail(data.email);
          if (data.address && data.address !== "Antalya, Turkey") setAddress(data.address);
        }
      } catch {}
    };
    load();
  }, []);

  const mapQuery = encodeURIComponent(address.replace(/\s+/g, " ").trim());
  const mapSrc = `https://www.google.com/maps?q=${mapQuery}&z=17&output=embed`;

  const contactInfo = [
    { icon: MapPin, label: "Address", value: address },
    { icon: Phone, label: "Phone", value: phone, href: `tel:${phone.replace(/\s/g, "")}` },
    { icon: Mail, label: "Email", value: email, href: `mailto:${email}` },
  ];

  return (
    <section id="contact" className="section-padding bg-white">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-bronze-600 text-sm font-semibold tracking-[0.2em] uppercase">
            Get In Touch
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mt-4 mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Contact <span className="text-gradient">Us</span>
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed">
            Ready to transform your space with natural stone? Get in touch with
            our team for a free consultation and quote.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <div className="space-y-8">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-bronze-100 to-bronze-200 rounded-xl flex items-center justify-center shrink-0 group-hover:from-bronze-500 group-hover:to-bronze-700 transition-all duration-500">
                    <item.icon className="w-5 h-5 text-bronze-700 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <div>
                    <span className="text-stone-400 text-sm font-medium block mb-1">
                      {item.label}
                    </span>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-stone-900 font-medium hover:text-bronze-600 transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="text-stone-900 font-medium">
                        {item.value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-2xl overflow-hidden h-64 bg-stone-200">
              <iframe
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Location Map - ${address}`}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <form
              onSubmit={(e) => e.preventDefault()}
              className="bg-stone-50 rounded-2xl p-8 md:p-10 border border-stone-100"
            >
              <h3
                className="text-2xl font-bold text-stone-900 mb-2"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Request a Quote
              </h3>
              <p className="text-stone-500 mb-8">
                Fill out the form below and we&apos;ll get back to you within 24 hours.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-sm font-medium text-stone-700 mb-2 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-bronze-500/20 focus:border-bronze-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700 mb-2 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-bronze-500/20 focus:border-bronze-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-sm font-medium text-stone-700 mb-2 block">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+90 555 123 45 67"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-bronze-500/20 focus:border-bronze-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700 mb-2 block">
                    Stone Type
                  </label>
                  <select className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-bronze-500/20 focus:border-bronze-500 transition-all">
                    <option value="">Select stone type</option>
                    <option value="marble">Marble</option>
                    <option value="travertine">Travertine</option>
                    <option value="limestone">Limestone</option>
                    <option value="granite">Granite</option>
                    <option value="onyx">Onyx</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-stone-700 mb-2 block">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your project..."
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-bronze-500/20 focus:border-bronze-500 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-bronze-600 hover:bg-bronze-700 text-white px-8 py-4 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-bronze-600/25"
              >
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

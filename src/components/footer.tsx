import { MapPin, Phone, Mail } from "lucide-react";
import { SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="container-luxury section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-bronze-500 to-bronze-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AS</span>
              </div>
              <span
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {SITE.name}
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed max-w-md">
              Premium doğal taş ve mermer çözümleri ile mekanlarınıza değer
              katıyoruz. Kalite, estetik ve güvenilirlik.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Hızlı Erişim</h4>
            <ul className="space-y-3">
              {[
                "Ana Sayfa",
                "Hizmetlerimiz",
                "Portfolyo",
                "Hakkımızda",
                "İletişim",
              ].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace(" ", "-")}`}
                    className="text-stone-400 hover:text-bronze-400 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">İletişim</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-bronze-500 mt-0.5 shrink-0" />
                <span className="text-stone-400">Antalya, Türkiye</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-bronze-500 shrink-0" />
                <a
                  href="tel:+905001234567"
                  className="text-stone-400 hover:text-bronze-400 transition-colors"
                >
                  +90 500 123 45 67
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-bronze-500 shrink-0" />
                <a
                  href="mailto:info@aibastone.com"
                  className="text-stone-400 hover:text-bronze-400 transition-colors"
                >
                  info@aibastone.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-stone-500 text-sm">
            &copy; {new Date().getFullYear()} {SITE.name}. Tüm hakları
            saklıdır.
          </p>
          <p className="text-stone-600 text-xs">
            Premium Doğal Taş & Mermer Çözümleri
          </p>
        </div>
      </div>
    </footer>
  );
}

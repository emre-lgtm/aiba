import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1a1816] flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-8">
        <span className="inline-flex items-center justify-center rounded-2xl bg-white p-3 shadow-2xl shadow-amber-600/20">
          <Logo className="h-12 w-auto max-w-36" />
        </span>
      </div>
      <p className="text-amber-500 text-sm font-semibold tracking-[0.25em] uppercase mb-4">404</p>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4"
        style={{ fontFamily: "Georgia, serif" }}>
        Sayfa Bulunamadı
      </h1>
      <p className="text-stone-400 text-lg max-w-md mb-10 leading-relaxed">
        Aradığınız sayfa mevcut değil ya da taşınmış olabilir.
      </p>
      <Link href="/"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-8 py-3.5 rounded-full font-medium transition-all hover:scale-105">
        ← Ana Sayfaya Dön
      </Link>
    </div>
  );
}

# Proje Teknoloji Yığını

## Framework & Dil
- **Frontend Framework:** Next.js 16 (React 19)
- **Backend Framework:** Next.js (API Routes / Server Actions)
- **Dil:** TypeScript 5+
- **Styling:** Tailwind CSS 4 + `clsx` + `tailwind-merge`
- **Animasyon:** Framer Motion
- **İkonlar:** Lucide React

## Node.js & Paket Yöneticisi
- **Node.js:** 18.x, 20.x, 22.x, 24.x desteklenir
- **Paket Yöneticisi:** npm (varsayılan)

## Önemli Kurallar

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

- Her zaman TypeScript kullan
- Stil için Tailwind CSS sınıfları kullan, özel CSS yazma
- `@/*` path alias'ı `./src/*` dizinine işaret eder
- Vercel'a deploy ediliyor, `output: "standalone"` kullanılmıyor
- `src/` dizini altında çalış
- Yorum ekleme
- Değişiklik sonrası `npm run lint` ve `npm run build` çalıştır

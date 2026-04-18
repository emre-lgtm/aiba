# Proje Teknoloji Yığını

## Framework & Dil
- **Frontend Framework:** Next.js 16 (React 19)
- **Backend Framework:** Next.js (API Routes / Server Actions)
- **Dil:** TypeScript 5+
- **Styling:** Tailwind CSS 4 + `clsx` + `tailwind-merge`
- **Animasyon:** Framer Motion
- **İkonlar:** Lucide React
- **UI Components:** shadcn/ui (new-york style, stone base color)
- **Database & Auth:** Supabase (PostgreSQL + Auth + Storage)
- **Form:** react-hook-form + @hookform/resolvers + zod

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

## Mimari & Keşifler

### Next.js 16 Breaking Changes
- `middleware.ts` → `proxy.ts` (fonksiyon `middleware` → `proxy`). Eski convention Vercel'da `MIDDLEWARE_INVOCATION_FAILED` hatası verir.
- `src/app/icon.ts` — Next.js 16'da favicon/icon için route handler kullanılır (eski `favicon.ico` veya `icon.svg` yerine)

### ESLint Kuralları (React 19 Strict)
- `react-hooks/set-state-in-effect` — useEffect içinde doğrudan setState yasak, inline async + cancellation token kullan
- `Date.now()` ve `Math.random()` → `react-hooks/purity` hatası, yerine `crypto.randomUUID()` kullan
- `@next/next/no-img-element` — `<img>` yerine `<Image>` veya `background-image` CSS kullan

### Supabase
- Join'ler array döner: `category: { name: string }[]` (tek obje değil)
- `build-standalone.js` dosyasında önceden var olan `no-require-imports` hataları — yoksayılır (legacy dosya)

### Admin Layout
- `src/app/admin/layout.tsx` → `export const dynamic = "force-dynamic"` (Supabase client env var gerektirir)
- Admin sidebar ve login page standalone — `<Navbar>` / `<Footer>` yok

### Site Layout (Route Groups)
- `src/app/(site)/layout.tsx` — public sayfalar için ortak layout (Navbar + Footer)
- `src/app/(site)/page.tsx` — homepage
- `src/app/layout.tsx` — root layout (fontlar, FaviconSync, globals.css)

### Logo Sistemi
- `src/components/logo.tsx` — client component, `/api/settings`'den `logo_data_url` çeker
- `public/logo.svg` — varsayılan fallback logo (siyah deniz kabuğu/mermer deseni SVG)
- `src/app/icon.ts` — favicon route handler, Supabase'den custom logo veya fallback `public/logo.svg` döner
- `src/components/favicon-sync.tsx` — client-side favicon güncelleme, logo değiştiğinde `<link rel="icon">` günceller
- `src/lib/site-settings.ts` — `SiteSettings` type, `DEFAULT_LOGO_SRC`, `LOGO_UPDATED_EVENT`, `normalizeSiteSettings()`, `getLogoSrc()`, `isLogoDataUrl()`
- Settings'de logo upload → base64 data URL olarak saklanır, tüm component'ler `LOGO_UPDATED_EVENT` ile güncellenir

## Proje Durumu (2026-04-18)

### Tamamlanan Özellikler
1. ✅ Vercel uyumluluğu (`output: "standalone"` kaldırıldı, `proxy.ts` kullanılıyor)
2. ✅ Supabase Auth (email/password) ile admin girişi
3. ✅ Admin panel: Dashboard, Hero Slides, Services, Portfolio CRUD, Categories CRUD, About Us CMS, Settings
4. ✅ Logo yönetimi: Settings'den logo upload → navbar, footer, admin sidebar, login page, favicon otomatik güncellenir
5. ✅ Homepage: Hero slider, Services, Portfolio, About Us, Contact bölümleri
6. ✅ Tüm içerik Supabase API'den çekilir, `constants.ts` fallback olarak kalır
7. ✅ About Us CMS: başlık, açıklama, görsel, badge, özellikler, istatistikler düzenlenebilir
8. ✅ Contact: iletişim bilgileri API'den, Google Maps embed, teklif formu
9. ✅ AI görsel üretme kaldırıldı (Z.ai API bakiye yetersiz)

### Supabase Migration
- `supabase/migration.sql` — idempotent (DROP POLICY IF EXISTS + ON CONFLICT DO NOTHING)
- Tablolar: `portfolio_categories`, `portfolio_items`, `hero_slides`, `services`, `site_settings`
- `site_settings` JSONB yapısı: genel ayarlar + `about` objesi + `logo_data_url`

## Dosya Yapısı

### Configuration
- `next.config.ts` — images remote patterns (supabase.co, unsplash.com)
- `package.json` — Supabase, shadcn/ui, form libs, framer-motion
- `components.json` — shadcn/ui config (new-york, stone)
- `tsconfig.json` — `@/*` → `./src/*`
- `.env.local` — Supabase env vars (gitignored)
- `.env.example` — şablon (Supabase URL, anon key, service role key)

### Supabase
- `src/lib/supabase/client.ts` — browser client
- `src/lib/supabase/server.ts` — server client (cookies)
- `src/lib/supabase/middleware.ts` — session update helper
- `src/lib/site-settings.ts` — settings type, logo helpers, event system
- `supabase/migration.sql` — full idempotent migration

### Auth & Proxy
- `src/proxy.ts` — Next.js 16 proxy, `/admin/*` route protection

### Public Pages (Route Group: `(site)`)
- `src/app/(site)/layout.tsx` — Navbar + Footer layout
- `src/app/(site)/page.tsx` — Homepage (Hero, Services, Portfolio, About, Contact)

### Admin Pages
- `src/app/admin/layout.tsx` — admin layout (force-dynamic, Toaster)
- `src/app/admin/login/page.tsx` — login (Logo component kullanır)
- `src/app/admin/page.tsx` — dashboard
- `src/app/admin/portfolio/page.tsx`
- `src/app/admin/portfolio/new/page.tsx`
- `src/app/admin/portfolio/[id]/edit/page.tsx`
- `src/app/admin/categories/page.tsx`
- `src/app/admin/hero/page.tsx`
- `src/app/admin/services/page.tsx`
- `src/app/admin/about/page.tsx` — About CMS
- `src/app/admin/settings/page.tsx` — Settings + Logo Upload + Favicon

### API Routes
- `src/app/api/portfolio/route.ts` — GET (public), POST (auth)
- `src/app/api/portfolio/[id]/route.ts` — GET, PUT, DELETE
- `src/app/api/categories/route.ts` — GET, POST
- `src/app/api/categories/[id]/route.ts` — PUT, DELETE
- `src/app/api/hero/route.ts` — GET, POST
- `src/app/api/hero/[id]/route.ts` — PUT, DELETE
- `src/app/api/services/route.ts` — GET, POST
- `src/app/api/services/[id]/route.ts` — PUT, DELETE
- `src/app/api/settings/route.ts` — GET, PUT (JSONB)
- `src/app/icon.ts` — favicon route (Supabase logo veya fallback SVG)

### Admin Components
- `src/components/admin/admin-guard.tsx` — client-side auth check
- `src/components/admin/admin-sidebar.tsx` — dark sidebar (Logo component kullanır)
- `src/components/admin/portfolio-list.tsx` — grid/list view
- `src/components/admin/portfolio-form.tsx` — form (upload only, AI kaldırıldı)
- `src/components/admin/categories-manager.tsx` — card grid + modal
- `src/components/admin/hero-manager.tsx` — slide CRUD (upload only, AI kaldırıldı)
- `src/components/admin/services-manager.tsx` — service CRUD
- `src/components/admin/about-manager.tsx` — About section CMS
- `src/components/admin/settings-form.tsx` — site settings + logo upload + nav links

### Public Components
- `src/components/logo.tsx` — dynamic logo (API'den, cache + event system)
- `src/components/favicon-sync.tsx` — client-side favicon güncelleme
- `src/components/navbar.tsx` — fixed navbar (glass effect, logo)
- `src/components/footer.tsx` — footer (logo, quick links, contact)
- `src/components/sections/hero.tsx` — slider (API + fallback)
- `src/components/sections/services.tsx` — service cards (API + fallback)
- `src/components/sections/portfolio.tsx` — gallery (API + fallback)
- `src/components/sections/about.tsx` — about section (API + fallback)
- `src/components/sections/contact.tsx` — contact form + map

### UI Components (shadcn/ui)
- `src/components/ui/` — button, input, label, card, table, dialog, badge, select, switch, separator, sheet, textarea, sonner, dropdown-menu, skeleton, tooltip

### Constants (Fallback)
- `src/lib/constants.ts` — SITE (name, url, address), NAV_LINKS, HERO_SLIDES, SERVICES, PORTFOLIO_ITEMS, PORTFOLIO_CATEGORIES

### Static Assets
- `public/logo.svg` — varsayılan logo (siyah deniz kabuğu deseni)

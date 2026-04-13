# AIBA STONE — Premium Doğal Taş & Mermer

Modern, animasyonlu ve lüks tasarıma sahip AIBA STONE kurumsal web sitesi.

## Teknolojiler

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS 4**
- **Framer Motion** (animasyonlar)
- **Lucide React** (ikonlar)

## Başlangıç

```bash
npm install
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

## Deploy

```bash
npm run build
npm start
```

Vercel'e deploy için git push yeterlidir.

## Proje Yapısı

```
src/
  app/
    layout.tsx          # Root layout (Navbar + Footer)
    page.tsx            # Ana sayfa (sections birleşimi)
    globals.css         # Tema ve global stiller
  components/
    navbar.tsx          # Sticky glass navbar
    footer.tsx          # Footer bileşeni
    sections/
      hero.tsx          # Slayt tarzı hero section
      services.tsx      # Hizmetler grid section
      portfolio.tsx     # Gallery + lightbox portfolio
  lib/
    constants.ts        # Site verileri (slides, services, portfolio)
    utils.ts            # cn() utility
public/
  images/
    hero/               # Hero slayt görselleri
    portfolio/          # Portfolio ürün görselleri
```

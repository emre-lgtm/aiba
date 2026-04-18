-- AIBA STONE — Supabase Migration (v2)
-- Run this in Supabase SQL Editor

-- ============================================
-- EXISTING TABLES (from v1)
-- ============================================

CREATE TABLE IF NOT EXISTS portfolio_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  stone_type text NOT NULL,
  category_id uuid REFERENCES portfolio_categories(id) ON DELETE SET NULL,
  image_url text NOT NULL,
  description text,
  featured boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- NEW TABLES (v2 — CMS)
-- ============================================

CREATE TABLE IF NOT EXISTS hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  accent text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL DEFAULT 'Gem',
  title text NOT NULL,
  description text NOT NULL,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- ============================================
-- RLS
-- ============================================

ALTER TABLE portfolio_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "Public read categories" ON portfolio_categories;
DROP POLICY IF EXISTS "Public read portfolio" ON portfolio_items;
DROP POLICY IF EXISTS "Public read hero" ON hero_slides;
DROP POLICY IF EXISTS "Public read services" ON services;
DROP POLICY IF EXISTS "Public read settings" ON site_settings;
CREATE POLICY "Public read categories" ON portfolio_categories FOR SELECT TO anon USING (true);
CREATE POLICY "Public read portfolio" ON portfolio_items FOR SELECT TO anon USING (true);
CREATE POLICY "Public read hero" ON hero_slides FOR SELECT TO anon USING (true);
CREATE POLICY "Public read services" ON services FOR SELECT TO anon USING (true);
CREATE POLICY "Public read settings" ON site_settings FOR SELECT TO anon USING (true);

-- Auth full access
DROP POLICY IF EXISTS "Auth full categories" ON portfolio_categories;
DROP POLICY IF EXISTS "Auth full portfolio" ON portfolio_items;
DROP POLICY IF EXISTS "Auth full hero" ON hero_slides;
DROP POLICY IF EXISTS "Auth full services" ON services;
DROP POLICY IF EXISTS "Auth full settings" ON site_settings;
CREATE POLICY "Auth full categories" ON portfolio_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full portfolio" ON portfolio_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full hero" ON hero_slides FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full services" ON services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full settings" ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Auth portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Public read hero images" ON storage.objects;
DROP POLICY IF EXISTS "Auth hero images" ON storage.objects;
CREATE POLICY "Public read portfolio images" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'portfolio-images');
CREATE POLICY "Auth portfolio images" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'portfolio-images') WITH CHECK (bucket_id = 'portfolio-images');
CREATE POLICY "Public read hero images" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'hero-images');
CREATE POLICY "Auth hero images" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'hero-images') WITH CHECK (bucket_id = 'hero-images');

-- ============================================
-- TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS portfolio_items_updated_at ON portfolio_items;
CREATE TRIGGER portfolio_items_updated_at
  BEFORE UPDATE ON portfolio_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO portfolio_categories (name, slug, sort_order) VALUES
  ('Kitchen', 'kitchen', 1),
  ('Bathroom', 'bathroom', 2),
  ('Flooring', 'flooring', 3),
  ('Exterior', 'exterior', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO hero_slides (title, accent, description, image_url, sort_order) VALUES
  ('The Elegance', 'of Natural Stone', 'We bring elegance to your spaces with our premium marble and natural stone collection sourced from the finest quarries in the world.', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80', 1),
  ('Built with', 'Excellence', 'With years of experience and our expert team, we deliver the highest quality standards in every project.', 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1920&q=80', 2),
  ('The Art', 'of Stone', 'Every stone is nature''s masterpiece. Unique veining and colors that bring character to your spaces.', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80', 3)
ON CONFLICT DO NOTHING;

INSERT INTO services (icon, title, description, sort_order) VALUES
  ('Gem', 'Marble Supply', 'Carefully selected premium marble varieties from the most prestigious quarries in Italy, Turkey, and India.', 1),
  ('Ruler', 'Measurement & Cutting', 'Precision cutting solutions with CNC technology and our master craftsmen.', 2),
  ('Home', 'Interior Architecture', 'Comprehensive applications from kitchen countertops to bathroom cladding, flooring to wall coverings.', 3),
  ('Truck', 'Logistics & Installation', 'Turn-key service including secure transportation, professional installation, and final finishing.', 4),
  ('Palette', 'Color & Pattern Consultancy', 'Professional consultancy for stone selection that matches your space''s concept.', 5),
  ('ShieldCheck', 'Maintenance & Restoration', 'Periodic maintenance and restoration services for long-lasting natural stone surfaces.', 6)
ON CONFLICT DO NOTHING;

INSERT INTO site_settings (id, data) VALUES (1, '{
  "site_name": "AIBA STONE",
  "site_description": "Premium natural stone and marble solutions. Adding elegance to luxury spaces.",
  "site_url": "https://www.aibastone.com",
  "phone": "+90 500 123 45 67",
  "email": "info@aibastone.com",
  "address": "Antalya, Turkey",
  "nav_links": [
    {"label": "Home", "href": "#hero"},
    {"label": "Services", "href": "#services"},
    {"label": "Portfolio", "href": "#portfolio"},
    {"label": "About", "href": "#about"},
    {"label": "Contact", "href": "#contact"}
  ],
  "footer_text": "Premium Natural Stone & Marble Solutions",
  "about": {
    "subtitle": "About Us",
    "title": "Crafting Timeless Beauty",
    "title_accent": "Timeless",
    "description": "For over 15 years, AIBA STONE has been the premier destination for luxury natural stone. We source the world''s finest marble, travertine, and limestone to transform your vision into reality.",
    "image_url": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    "badge_value": "15+",
    "badge_label": "Years of Excellence",
    "section_title": "From Quarry to Your Space",
    "section_p1": "We partner directly with quarries in Italy, Turkey, India, and Brazil to bring you the rarest and most exquisite natural stones. Every slab is hand-selected by our expert team to ensure uncompromising quality.",
    "section_p2": "Our master craftsmen combine traditional techniques with cutting-edge CNC technology to deliver precision results that exceed expectations. From concept to installation, we handle every detail.",
    "features": ["Premium Quality Materials", "Expert Craftsmanship", "Global Sourcing", "Turnkey Solutions"],
    "stats": [
      {"icon": "Award", "value": "15+", "label": "Years Experience"},
      {"icon": "Users", "value": "500+", "label": "Happy Clients"},
      {"icon": "Globe", "value": "30+", "label": "Countries Served"},
      {"icon": "TrendingUp", "value": "2000+", "label": "Projects Completed"}
    ]
  }
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

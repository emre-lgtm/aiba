-- AIBA STONE — Supabase Migration
-- Run this in Supabase SQL Editor

-- Portfolio kategorileri
CREATE TABLE IF NOT EXISTS portfolio_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Portfolio ogeleri
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

-- RLS
ALTER TABLE portfolio_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read categories" ON portfolio_categories FOR SELECT TO anon USING (true);
CREATE POLICY "Public read portfolio" ON portfolio_items FOR SELECT TO anon USING (true);

-- Authenticated full access
CREATE POLICY "Auth full access categories" ON portfolio_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full access portfolio" ON portfolio_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read images" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'portfolio-images');
CREATE POLICY "Auth upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio-images');
CREATE POLICY "Auth update images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio-images');
CREATE POLICY "Auth delete images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio-images');

-- Baslangic verileri
INSERT INTO portfolio_categories (name, slug, sort_order) VALUES
  ('Kitchen', 'kitchen', 1),
  ('Bathroom', 'bathroom', 2),
  ('Flooring', 'flooring', 3),
  ('Exterior', 'exterior', 4)
ON CONFLICT (slug) DO NOTHING;

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS portfolio_items_updated_at ON portfolio_items;
CREATE TRIGGER portfolio_items_updated_at
  BEFORE UPDATE ON portfolio_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

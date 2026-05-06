// ─── Site Settings ────────────────────────────────────────────────────────────

export type NavLink = { label: string; href: string };

export type SiteSettings = {
  site_name: string;
  site_description: string;
  site_url: string;
  phone: string;
  email: string;
  address: string;
  nav_links: NavLink[];
  footer_text: string;
  logo_data_url: string;
};

// ─── Hero ──────────────────────────────────────────────────────────────────────

export type HeroSlide = {
  id: string;
  title: string;
  accent: string;
  description: string;
  image_url: string;
  sort_order?: number;
};

// ─── Services ─────────────────────────────────────────────────────────────────

export type Service = {
  icon: string;
  title: string;
  description: string;
};

// ─── Portfolio ────────────────────────────────────────────────────────────────

export type PortfolioItem = {
  id: string;
  title: string;
  stone_type: string;
  image_url: string;
  description: string | null;
  category: { id: string; name: string; slug: string } | null;
};

export type PortfolioUiItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  stone: string;
};

export type Category = { id: string; name: string; slug: string };

// ─── About ────────────────────────────────────────────────────────────────────

export type Stat = { icon: string; value: string; label: string };

export type AboutData = {
  subtitle: string;
  title: string;
  title_accent: string;
  description: string;
  image_url: string;
  badge_value: string;
  badge_label: string;
  section_title: string;
  section_p1: string;
  section_p2: string;
  features: string[];
  stats: Stat[];
};

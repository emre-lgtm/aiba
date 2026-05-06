import { NAV_LINKS, SITE } from "@/lib/constants";

export type NavLink = { label: string; href: string };

export type SectionHeader = {
  subtitle: string;
  title: string;
  title_accent: string;
  description: string;
};

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
  sections: {
    services: SectionHeader;
    portfolio: SectionHeader;
    contact: SectionHeader;
  };
};

export const DEFAULT_LOGO_SRC = "/logo.webp";
export const LOGO_UPDATED_EVENT = "aiba:logo-updated";

export const DEFAULT_SECTIONS: SiteSettings["sections"] = {
  services: {
    subtitle: "What We Do",
    title: "Our Services",
    title_accent: "Services",
    description:
      "With our expertise in the natural stone world, we are with you at every stage of your project. Comprehensive solutions from supply to installation.",
  },
  portfolio: {
    subtitle: "Materials",
    title: "Featured Materials",
    title_accent: "Materials",
    description:
      "Every project is a work of art that brings the unique beauty of natural stone to life in your spaces.",
  },
  contact: {
    subtitle: "Get In Touch",
    title: "Contact Us",
    title_accent: "Us",
    description:
      "Ready to transform your space with natural stone? Get in touch with our team for a free consultation and quote.",
  },
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_name: SITE.name,
  site_description:
    "Premium natural stone and marble solutions. Adding elegance to luxury spaces.",
  site_url: SITE.url,
  phone: "+90 500 123 45 67",
  email: "info@aibastone.com",
  address: SITE.address,
  nav_links: NAV_LINKS.map((link) => ({ ...link })),
  footer_text: "Premium Natural Stone & Marble Solutions",
  logo_data_url: "",
  sections: DEFAULT_SECTIONS,
};

export function isLogoDataUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^data:image\/(?:svg\+xml|png|jpeg|jpg|webp);base64,/i.test(value)
  );
}

export function getLogoSrc(value?: string | null) {
  return isLogoDataUrl(value) ? value : DEFAULT_LOGO_SRC;
}

export function normalizeSiteSettings(
  data?: Partial<SiteSettings> | null
): SiteSettings {
  const navLinks =
    Array.isArray(data?.nav_links) && data.nav_links.length > 0
      ? data.nav_links.filter(
          (link): link is NavLink =>
            typeof link?.label === "string" && typeof link?.href === "string"
        )
      : DEFAULT_SITE_SETTINGS.nav_links;

  const sections: SiteSettings["sections"] = {
    services: { ...DEFAULT_SECTIONS.services, ...(data?.sections?.services ?? {}) },
    portfolio: { ...DEFAULT_SECTIONS.portfolio, ...(data?.sections?.portfolio ?? {}) },
    contact: { ...DEFAULT_SECTIONS.contact, ...(data?.sections?.contact ?? {}) },
  };

  return {
    ...DEFAULT_SITE_SETTINGS,
    ...data,
    address:
      data?.address && data.address !== "Antalya, Turkey"
        ? data.address
        : DEFAULT_SITE_SETTINGS.address,
    nav_links: navLinks.length > 0 ? navLinks : DEFAULT_SITE_SETTINGS.nav_links,
    logo_data_url: isLogoDataUrl(data?.logo_data_url) ? data.logo_data_url : "",
    sections,
  };
}

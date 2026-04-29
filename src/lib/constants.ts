export const SITE = {
  name: "AIBA STONE",
  description:
    "Premium natural stone and marble solutions. Adding elegance to luxury spaces.",
  url: "https://www.aibastone.com",
  address:
    "AIBA DIS TICARET LIMITED SIRKETI, YENIGUN MAH. MEVLANA CAD. B BLOK NO: 54 B/203, MURATPASA-ANTALYA-TURKEY",
};

export const NAV_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "Services", href: "#services" },
  { label: "Materials", href: "#portfolio" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const HERO_SLIDES = [
  {
    id: 1,
    title: "The Elegance",
    accent: "of Natural Stone",
    description:
      "We bring elegance to your spaces with our premium marble and natural stone collection sourced from the finest quarries in the world.",
    image: "/images/hero/hero-1.jpg",
  },
  {
    id: 2,
    title: "Built with",
    accent: "Excellence",
    description:
      "With years of experience and our expert team, we deliver the highest quality standards in every project.",
    image: "/images/hero/hero-2.jpg",
  },
  {
    id: 3,
    title: "The Art",
    accent: "of Stone",
    description:
      "Every stone is nature's masterpiece. Unique veining and colors that bring character to your spaces.",
    image: "/images/hero/hero-3.jpg",
  },
];

export const SERVICES = [
  {
    icon: "Gem" as const,
    title: "Marble Supply",
    description:
      "Carefully selected premium marble varieties from the most prestigious quarries in Italy, Turkey, and India.",
  },
  {
    icon: "Ruler" as const,
    title: "Measurement & Cutting",
    description:
      "Precision cutting solutions with CNC technology and our master craftsmen.",
  },
  {
    icon: "Home" as const,
    title: "Interior Architecture",
    description:
      "Comprehensive applications from kitchen countertops to bathroom cladding, flooring to wall coverings.",
  },
  {
    icon: "Truck" as const,
    title: "Logistics & Installation",
    description:
      "Turn-key service including secure transportation, professional installation, and final finishing.",
  },
  {
    icon: "Palette" as const,
    title: "Color & Pattern Consultancy",
    description:
      "Professional consultancy for stone selection that matches your space's concept.",
  },
  {
    icon: "ShieldCheck" as const,
    title: "Maintenance & Restoration",
    description:
      "Periodic maintenance and restoration services for long-lasting natural stone surfaces.",
  },
];

export const PORTFOLIO_CATEGORIES = [
  "All",
  "Kitchen",
  "Bathroom",
  "Flooring",
  "Exterior",
] as const;

export type PortfolioCategory = (typeof PORTFOLIO_CATEGORIES)[number];

export const PORTFOLIO_ITEMS = [
  {
    id: 1,
    title: "Calacatta Oro Kitchen",
    category: "Kitchen" as PortfolioCategory,
    description: "Luxury kitchen countertop crafted with Calacatta Oro marble",
    image: "/images/portfolio/calacatta-kitchen.jpg",
    stone: "Calacatta Oro",
  },
  {
    id: 2,
    title: "Noce Travertine Spa",
    category: "Bathroom" as PortfolioCategory,
    description: "Spa pool and bathroom clad in Noce Travertine",
    image: "/images/portfolio/travertine-spa.jpg",
    stone: "Noce Travertine",
  },
  {
    id: 3,
    title: "Nero Marquina Lobby",
    category: "Flooring" as PortfolioCategory,
    description: "Nero Marquina marble flooring — hotel lobby application",
    image: "/images/portfolio/nero-marquina-lobby.jpg",
    stone: "Nero Marquina",
  },
  {
    id: 4,
    title: "Honey Onyx Bar",
    category: "Kitchen" as PortfolioCategory,
    description: "Backlit Honey Onyx bar countertop — custom design",
    image: "/images/portfolio/honey-onyx-bar.jpg",
    stone: "Honey Onyx",
  },
  {
    id: 5,
    title: "White Limestone Villa",
    category: "Exterior" as PortfolioCategory,
    description: "White Limestone natural stone villa facade cladding",
    image: "/images/portfolio/limra-villa.jpg",
    stone: "White Limestone",
  },
  {
    id: 6,
    title: "Statuario Bathroom",
    category: "Bathroom" as PortfolioCategory,
    description: "Minimalist bathroom design with Statuario Venato marble",
    image: "/images/portfolio/statuario-bath.jpg",
    stone: "Statuario Venato",
  },
  {
    id: 7,
    title: "Emperador Office",
    category: "Flooring" as PortfolioCategory,
    description: "Emperador Dark marble flooring — corporate office entrance",
    image: "/images/portfolio/emperador-office.jpg",
    stone: "Emperador Dark",
  },
  {
    id: 8,
    title: "Cherry Marble Villas",
    category: "Exterior" as PortfolioCategory,
    description: "Prestigious villa exterior with Elazig Cherry marble",
    image: "/images/portfolio/cherry-villas.jpg",
    stone: "Elazig Cherry",
  },
];

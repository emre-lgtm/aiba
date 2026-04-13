export const SITE = {
  name: "AIBA STONE",
  description:
    "Premium doğal taş ve mermer çözümleri. Lüks mekanlara estetik dokunuşlar.",
  url: "https://www.aibastone.com",
};

export const NAV_LINKS = [
  { label: "Ana Sayfa", href: "#hero" },
  { label: "Hizmetlerimiz", href: "#services" },
  { label: "Portfolyo", href: "#portfolio" },
  { label: "Hakkımızda", href: "#about" },
  { label: "İletişim", href: "#contact" },
];

export const HERO_SLIDES = [
  {
    id: 1,
    title: "Doğal Taşın",
    accent: "Zarafeti",
    description:
      "Dünyanın en seçkin ocaklarından getirilen premium mermer ve doğal taş koleksiyonumuzla mekanlarınıza estetik katıyoruz.",
    image: "/images/hero/hero-1.jpg",
  },
  {
    id: 2,
    title: "Mükemmellik",
    accent: "İnşaatında",
    description:
      "Yılların deneyimi ve uzman kadromuzla, her projede en yüksek kalite standartlarını sağlıyoruz.",
    image: "/images/hero/hero-2.jpg",
  },
  {
    id: 3,
    title: "Taş",
    accent: "Sanatı",
    description:
      "Her bir taş, doğanın sanat eseri. Eşsiz damar yapıları ve renkleriyle mekanlarınıza karakter katıyor.",
    image: "/images/hero/hero-3.jpg",
  },
];

export const SERVICES = [
  {
    icon: "Gem" as const,
    title: "Mermer Tedarik",
    description:
      "İtalya, Türkiye ve Hindistan'ın en prestijli ocaklarından özenle seçilmiş premium mermer çeşitleri.",
  },
  {
    icon: "Ruler" as const,
    title: "Ölçü ve Kesim",
    description:
      "CNC teknolojisi ve uzman ustalarımızla milimetrik hassasiyette özel kesim çözümleri.",
  },
  {
    icon: "Home" as const,
    title: "İç Mimarlık",
    description:
      "Mutfak tezgahından banyo kaplamasına, zemin döşemesinden duvar kaplamasına kadar kapsamlı uygulama.",
  },
  {
    icon: "Truck" as const,
    title: "Lojistik & Montaj",
    description:
      "Güvenli nakliye, profesyonel montaj ve son detay cilası dahil turn-key hizmet anlayışı.",
  },
  {
    icon: "Palette" as const,
    title: "Renk & Desen Danışmanlığı",
    description:
      "Mekanınızın konseptine uygun taş seçimi için profesyonel danışmanlık hizmeti.",
  },
  {
    icon: "ShieldCheck" as const,
    title: "Bakım & Restorasyon",
    description:
      "Doğal taş yüzeylerin uzun ömürlü olması için periyodik bakım ve restorasyon hizmetleri.",
  },
];

export const PORTFOLIO_CATEGORIES = [
  "Tümü",
  "Mutfak",
  "Banyo",
  "Zemin",
  "Dış Cephe",
] as const;

export type PortfolioCategory = (typeof PORTFOLIO_CATEGORIES)[number];

export const PORTFOLIO_ITEMS = [
  {
    id: 1,
    title: "Calacatta Oro Mutfak",
    category: "Mutfak" as PortfolioCategory,
    description: "Calacatta Oro mermer ile tasarlanmış lüks mutfak tezgahı",
    image: "/images/portfolio/calacatta-kitchen.jpg",
    stone: "Calacatta Oro",
  },
  {
    id: 2,
    title: "Noce Traverten Spa",
    category: "Banyo" as PortfolioCategory,
    description: "Noce Traverten ile kaplanmış spa havuzu ve banyo",
    image: "/images/portfolio/travertine-spa.jpg",
    stone: "Noce Traverten",
  },
  {
    id: 3,
    title: "Nero Marquina Lobi",
    category: "Zemin" as PortfolioCategory,
    description: "Nero Marquina mermer zemin uygulaması - otel lobisi",
    image: "/images/portfolio/nero-marquina-lobby.jpg",
    stone: "Nero Marquina",
  },
  {
    id: 4,
    title: "Honey Onyx Bar",
    category: "Mutfak" as PortfolioCategory,
    description: "Işıklı Honey Onyx bar tezgahı - özel tasarım",
    image: "/images/portfolio/honey-onyx-bar.jpg",
    stone: "Honey Onyx",
  },
  {
    id: 5,
    title: "Beyaz Lafteri Villa",
    category: "Dış Cephe" as PortfolioCategory,
    description: "Beyaz Lafteri doğal taş villa cephe kaplaması",
    image: "/images/portfolio/limra-villa.jpg",
    stone: "Beyaz Lafteri",
  },
  {
    id: 6,
    title: "Statuario Banyo",
    category: "Banyo" as PortfolioCategory,
    description: "Statuario Venato mermer ile minimalist banyo tasarımı",
    image: "/images/portfolio/statuario-bath.jpg",
    stone: "Statuario Venato",
  },
  {
    id: 7,
    title: "Kaplan Mermer Ofis",
    category: "Zemin" as PortfolioCategory,
    description: "Kaplan Grey mermer zemin - kurumsal ofis girişi",
    image: "/images/portfolio/emperador-office.jpg",
    stone: "Kaplan Grey",
  },
  {
    id: 8,
    title: "Elazığ Vişne Villalar",
    category: "Dış Cephe" as PortfolioCategory,
    description: "Elazığ Vişne mermer ile prestijli villa dış cephe",
    image: "/images/portfolio/cherry-villas.jpg",
    stone: "Elazığ Vişne",
  },
];

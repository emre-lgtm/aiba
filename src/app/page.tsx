import { HeroSection } from "@/components/sections/hero";
import { ServicesSection } from "@/components/sections/services";
import { PortfolioSection } from "@/components/sections/portfolio";
import { AboutSection } from "@/components/sections/about";
import { ContactSection } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <PortfolioSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}

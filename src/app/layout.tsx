import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIBA STONE | Premium Doğal Taş & Mermer",
  description:
    "Premium doğal taş ve mermer çözümleri. Lüks mekanlara estetik dokunuşlar. Mutfak tezgahı, banyo, zemin kaplama ve dış cephe uygulamaları.",
  keywords: [
    "mermer",
    "doğal taş",
    "mutfak tezgahı",
    "banyo kaplama",
    "zemin döşeme",
    "dış cephe",
    "traverten",
    "onyx",
    "AIBA STONE",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${playfair.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

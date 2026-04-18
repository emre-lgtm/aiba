import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIBA STONE | Premium Natural Stone & Marble",
  description:
    "Premium natural stone and marble solutions. Adding elegance to luxury spaces. Kitchen countertops, bathroom, flooring and exterior applications.",
  keywords: [
    "marble",
    "natural stone",
    "kitchen countertop",
    "bathroom cladding",
    "flooring",
    "exterior",
    "travertine",
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
      lang="en"
      className={`${geistSans.variable} ${playfair.variable} antialiased`}
    >
      <body className="min-h-screen bg-stone-50 text-stone-900">{children}</body>
    </html>
  );
}

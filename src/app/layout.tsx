import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { FaviconSync } from "@/components/favicon-sync";
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
  icons: {
    icon: [
      { url: "/favicon.ico", rel: "shortcut icon" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
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
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="min-h-screen bg-stone-50 text-stone-900">
        <FaviconSync />
        {children}
      </body>
    </html>
  );
}

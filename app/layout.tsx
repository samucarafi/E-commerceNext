import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Cart from "@/components/layout/Cart";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001",
  ),
  title: {
    default: "Royal Parfums | Alta Perfumaria",
    template: "%s | Royal Parfums",
  },
  description:
    "Descubra fragrâncias selecionadas na Royal Parfums. Perfumes e decantes para encontrar sua assinatura.",
  applicationName: "Royal Parfums",
  openGraph: {
    type: "website",
    siteName: "Royal Parfums",
    title: "Royal Parfums | Alta Perfumaria",
    description:
      "Perfumes e decantes selecionados para encontrar sua assinatura.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        <AppProviders>
          <Header />

          {children}

          <Footer />

          <Cart />
        </AppProviders>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Royal Parfums | Alta Perfumaria",
    template: "%s | Royal Parfums",
  },
  description:
    "Descubra fragrâncias exclusivas das melhores maisons de perfumaria do mundo.",
  keywords: ["perfumes", "alta perfumaria", "fragrâncias", "decantes", "Royal Parfums"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Royal Parfums",
    title: "Royal Parfums | Alta Perfumaria",
    description: "Essência & Luxo. Fragrâncias exclusivas.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${playfair.variable} ${inter.variable}`}>
        <div className="site-shell">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}

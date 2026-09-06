import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Cart from "@/components/layout/Cart";
import AffiliateTracker from "@/components/affiliate/AffiliateTracker";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://royalparfums.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Royal Parfums | Alta Perfumaria",
    template: "%s | Royal Parfums",
  },
  description:
    "Descubra fragrâncias selecionadas na Royal Parfums. Perfumes e decantes para encontrar sua assinatura.",
  applicationName: "Royal Parfums",
  keywords: [
    "Royal Parfums",
    "perfumes",
    "perfumes importados",
    "decantes",
    "fragrâncias",
    "perfumaria",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Royal Parfums",
    title: "Royal Parfums | Alta Perfumaria",
    description:
      "Perfumes e decantes selecionados para encontrar sua assinatura.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Royal Parfums",
  url: siteUrl,
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Royal Parfums",
  alternateName: "Royal Parfums Perfumaria",
  url: siteUrl,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        <AppProviders>
          <AffiliateTracker />
          <Header />

          {children}

          <Footer />

          <Cart />
        </AppProviders>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema, websiteSchema]).replace(
              /</g,
              "\u003c",
            ),
          }}
        />
      </body>
    </html>
  );
}

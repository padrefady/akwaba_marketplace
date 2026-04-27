import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agryva - La plateforme agricole n°1 au Cameroun",
  description: "Achetez, vendez et échangez produits et services agricoles au Cameroun. Marketplace agricole avec IA, traduction automatique et prédictions de marché.",
  keywords: ["Agryva", "agriculture", "Cameroun", "marketplace", "produits agricoles", "marché", "cacao", "café", "manioc", "maïs", "plantain"],
  authors: [{ name: "Agryva Team" }],
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Agryva - La plateforme agricole n°1 au Cameroun",
    description: "Connectez-vous avec des milliers d'agriculteurs camerounais. Achetez, vendez produits et services agricoles.",
    siteName: "Agryva",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agryva - Marketplace Agricole",
    description: "La plateforme agricole n°1 au Cameroun",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Merriweather, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LeadModalProvider } from "@/components/LeadModal";

const merriweather = Merriweather({
  subsets: ["latin"], weight: ["700", "900"], variable: "--font-merriweather", display: "swap", fallback: ["Georgia", "serif"],
});
const publicSans = Public_Sans({
  subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-public-sans", display: "swap", fallback: ["system-ui", "sans-serif"],
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap", fallback: ["monospace"],
});

export const metadata: Metadata = {
  title: "Florida HOA Registry — Community Association Public Records",
  description:
    "Search Florida's community association records: 37,159 associations, 32,599 management firms, 23,293 licensed managers, and 15,766 developers. Registration status, licenses, and compliance facts from official state records.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${merriweather.variable} ${publicSans.variable} ${plexMono.variable}`}>
      <body className="bg-paper text-ink font-sans antialiased">
        <LeadModalProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </LeadModalProvider>
      </body>
    </html>
  );
}

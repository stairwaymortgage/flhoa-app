import type { Metadata } from "next";
import { Merriweather, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { InquiryProvider } from "@/components/InquiryModal";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { JsonLd, organizationAndWebsite } from "@/components/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const merriweather = Merriweather({
  subsets: ["latin"], weight: ["700", "900"], variable: "--font-merriweather", display: "swap", fallback: ["Georgia", "serif"],
});
const publicSans = Public_Sans({
  subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-public-sans", display: "swap", fallback: ["system-ui", "sans-serif"],
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap", fallback: ["monospace"],
});

const DESCRIPTION =
  "Search Florida's community association records: 37,159 associations, 32,599 management firms, 23,293 licensed managers, and 15,766 developers. Registration status, licenses, and compliance facts from official state records.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Florida HOA Registry — Community Association Public Records",
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Florida HOA Registry — Community Association Public Records",
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Florida HOA Registry — Community Association Public Records",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${merriweather.variable} ${publicSans.variable} ${plexMono.variable}`}>
      <body className="bg-paper text-ink font-sans antialiased">
        <JsonLd data={organizationAndWebsite()} />
        <InquiryProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </InquiryProvider>
        <Analytics />
        <GoogleAnalytics />
      </body>
    </html>
  );
}

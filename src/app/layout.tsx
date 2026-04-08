import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MarketTopBar } from "@/components/market-top-bar";
import { CategoryStrip } from "@/components/category-strip";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "PazarKapısı — Elektronik, moda, ev, süpermarket",
    template: "%s · PazarKapısı",
  },
  description:
    "Milyonlarca ürün, kampanyalı fiyatlar, hızlı teslimat. Elektronikten giyime, ev yaşamdan kozmetiğe tek yerden alışveriş.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <Script src="/runtime-config.js" strategy="beforeInteractive" />
      </head>
      <body
        className={`${jakarta.variable} flex min-h-screen flex-col antialiased`}
      >
        <Providers>
          <div className="sticky top-0 z-50 shadow-sm">
            <MarketTopBar />
            <SiteHeader />
            <CategoryStrip />
          </div>
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}

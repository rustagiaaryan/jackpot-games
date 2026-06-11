import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import "./globals.css";
import { getPrizeAmount } from "@/lib/settings";
import { getTodaySponsor } from "@/lib/sponsor";
import { SessionProvider } from "@/components/SessionProvider";
import { SponsorBanner } from "@/components/SponsorBanner";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "1K Arcade — Beat a game. Win $1,000.",
  description:
    "Free-to-play arcade games with a real $1,000 prize. Beat High Low or Dice Sweep and the money is yours — no strings attached.",
};

export const viewport: Viewport = {
  themeColor: "#0c1a26",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [prize, sponsor] = await Promise.all([getPrizeAmount(), getTodaySponsor()]);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <SessionProvider>
          {/* Sponsor banner + nav travel together and stay pinned on every
              page — the sponsor is always on screen (PRD §7.1). */}
          <div className="sticky top-0 z-40">
            <SponsorBanner
              sponsor={
                sponsor
                  ? {
                      id: sponsor.id,
                      name: sponsor.name,
                      logoUrl: sponsor.logoUrl,
                      websiteUrl: sponsor.websiteUrl,
                      tagline: sponsor.tagline,
                    }
                  : null
              }
            />
            <NavBar initialPrize={prize} />
          </div>
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import "./globals.css";
import { getJackpotAmount } from "@/lib/settings";
import { getTodaySponsor } from "@/lib/sponsor";
import { SessionProvider } from "@/components/SessionProvider";
import { SponsorBanner } from "@/components/SponsorBanner";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jackpot Arcade — Two games. One $1,000 jackpot.",
  description:
    "Free-to-play jackpot mini-games. Complete High Low or Dice Sweep to win the $1,000 jackpot.",
};

export const viewport: Viewport = {
  themeColor: "#08080f",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [jackpot, sponsor] = await Promise.all([getJackpotAmount(), getTodaySponsor()]);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <SessionProvider>
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
          <NavBar initialJackpot={jackpot} />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}

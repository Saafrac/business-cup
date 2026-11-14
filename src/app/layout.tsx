import type { Metadata, Viewport } from "next";
import { Lexend, Manrope, Silkscreen } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Chip In: the group gift for any event, in one link",
  description:
    "One link in the group chat collects RSVPs and money for a gift: birthdays, weddings, farewells, teacher thank-yous. Organizers run every group collection from one wallet.",
};

export const viewport: Viewport = {
  themeColor: "#5B42DC",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${lexend.variable} ${manrope.variable} ${silkscreen.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

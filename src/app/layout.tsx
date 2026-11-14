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
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Class Gift: the class birthday gift in one link",
  description:
    "One link in the class group chat collects RSVPs and money for a kid’s birthday gift. Room parents run every class collection from one wallet.",
};

export const viewport: Viewport = {
  themeColor: "#5B42DC",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${lexend.variable} ${manrope.variable} ${silkscreen.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

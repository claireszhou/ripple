import type { Metadata } from "next";
import { Playfair_Display, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { RippleBackground } from "@/components/RippleBackground";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ripple",
  description: "Share what you're grateful for",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSerif.variable}`}>
      <body className="relative antialiased">
        <RippleBackground />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}

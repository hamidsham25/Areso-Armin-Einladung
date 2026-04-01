import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Cormorant_SC } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const cormorantSC = Cormorant_SC({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-cormorant-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Areso & Armin — Wedding Invitation",
  description:
    "You are cordially invited to celebrate the wedding of Areso & Armin.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#FAF8F4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${cormorant.variable} ${cormorantSC.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

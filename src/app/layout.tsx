import type { Metadata, Viewport } from "next";
import { Archivo, Figtree } from "next/font/google";

import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scrambler RJ",
  description:
    "Área dos riders do Scrambler RJ, grupo de quem tem Triumph Scrambler no Rio de Janeiro.",
};

export const viewport: Viewport = {
  themeColor: "#0c0b0a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${archivo.variable} ${figtree.variable}`}
    >
      <head>
        <noscript>
          <style>{".logo-intro{display:none!important}"}</style>
        </noscript>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

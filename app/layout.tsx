import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontLogo = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-playfair',
  display: 'swap',
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});


export const metadata: Metadata = {
  title: "Ma.Vi Dashboard",
  description: "Dashboard de Atendimento Ma.Vi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${fontSans.variable} ${fontMono.variable} ${fontLogo.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
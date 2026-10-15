import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Los Makileros: Sobreviviendo al Piso",
  description:
    "Arcade caótico de manufactura. Completa tickets en la planta antes de que el Gringo te corra. Drag & drop + combos + humor.",
  keywords: [
    "Los Makileros",
    "arcade",
    "manufactura",
    "drag and drop",
    "juego",
    "planta",
    "juego arcade",
  ],
  authors: [{ name: "Planta de Makileros" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Los Makileros: Sobreviviendo al Piso",
    description:
      "Arcade caótico de manufactura con drag & drop, supervisor enojado y El Gringo.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}

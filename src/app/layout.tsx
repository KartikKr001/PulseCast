import { cn } from "../lib/utils"
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pulsecast",
  description:
    "PulseCast is a web audio player built for multi-device playback.",
  keywords: ["music", "sync", "audio", "collaboration", "real-time"],
  authors: [{ name: "Kartik Kumar" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
        <body
          className={cn(
            geistSans.variable,
            geistMono.variable,
            inter.variable,
            "antialiased font-sans dark selection:bg-primary-800 selection:text-white"
          )}
          >
            {children}
            <Toaster />
        </body>
      </html>
  );
}

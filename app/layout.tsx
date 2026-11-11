import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LamarLoker — Portal Lamaran Kerja",
  description:
    "Daftar sebagai pelamar, lengkapi profil dan CV, ikuti tes seleksi (interview & psikotes), dan pantau status kelulusan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-brand-bg text-slate-900">
        <Suspense
          fallback={<header className="sticky top-0 z-40 h-16 border-b-2 border-slate-900 bg-white" />}
        >
          <Nav />
        </Suspense>
        <main className="flex-1">{children}</main>
        <footer className="border-t-2 border-slate-900 bg-white py-6 text-center text-sm font-medium text-slate-600">
          LamarLoker — portal lamaran kerja. Skor tes 70 ke atas dinyatakan lulus.
        </footer>
      </body>
    </html>
  );
}

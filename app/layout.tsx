import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "LamarLoker — Portal Lamaran Kerja",
  description:
    "Daftar sebagai pelamar, lengkapi profil dan CV, ikuti tes seleksi (interview & psikotes), dan pantau status kelulusan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-slate-800">
        <Suspense
          fallback={<header className="grad-header sticky top-0 z-40 h-16 rounded-b-3xl shadow-sm" />}
        >
          <Nav />
        </Suspense>
        <main className="flex-1">{children}</main>
        <footer className="grad-footer mt-16 py-8 text-center text-sm font-medium text-white">
          <p className="font-bold">LamarLoker — Portal Lamaran Kerja</p>
          <p className="mt-1 text-white/80">Skor tes 70 ke atas dinyatakan lulus.</p>
        </footer>
      </body>
    </html>
  );
}

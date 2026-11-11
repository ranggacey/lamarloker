import Link from "next/link";
import { IconArrowRight, IconBriefcase, IconCheckCircle, IconClipboard, IconShieldCheck, IconUser } from "@/components/icons";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-bg px-3 py-1 text-xs font-semibold text-brand-text ring-1 ring-inset ring-brand/20">
              <IconBriefcase className="h-4 w-4" />
              Portal lamaran kerja
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Lamar kerja jadi lebih mudah dan transparan
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Daftar sebagai pelamar, lengkapi profil dan CV, lalu ikuti tes seleksi. HR memantau semua
              pelamar dari satu dashboard — skor tes 70 ke atas langsung dinyatakan lulus.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-base font-semibold text-white hover:bg-brand-dark sm:w-auto"
              >
                Daftar Sekarang
                <IconArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 hover:bg-brand-bg sm:w-auto"
              >
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-bg text-brand-text">
              <IconUser className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Profil &amp; CV online</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Pelamar mengisi profil dan mengunggah CV (PDF) serta foto langsung dari halaman profil. Semua
              tersimpan rapi dan aman.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-bg text-brand-text">
              <IconClipboard className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Tes &amp; skor transparan</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              HR menginput skor interview dan psikotes. Skor 70 ke atas berarti lulus, 69 ke bawah tidak lolos
              — status terlihat jelas oleh pelamar dan HR.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-bg text-brand-text">
              <IconShieldCheck className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Dashboard HR</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              HR melihat daftar pelamar, mencari berdasarkan nama, memfilter berdasarkan status, mengunduh CV,
              dan mengekspor data ke CSV.
            </p>
          </div>
        </div>
      </section>

      {/* Cara kerja */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">Cara kerja</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "1", t: "Daftar akun", d: "Pilih peran Pelamar atau HR, isi nama, email, dan password." },
              { n: "2", t: "Lengkapi profil", d: "Isi data diri dan unggah CV (PDF) serta foto profil." },
              { n: "3", t: "Ikuti tes", d: "HR menginput skor interview dan psikotes untuk setiap pelamar." },
              { n: "4", t: "Lihat status", d: "Skor 70+ lulus, di bawah 70 tidak lolos. Status tampil di dashboard." },
            ].map((s) => (
              <li key={s.n} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {s.n}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{s.t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 flex items-start gap-2 rounded-xl bg-success-bg px-4 py-3 text-sm text-success-text ring-1 ring-inset ring-success/20">
            <IconCheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
            Aturan kelulusan: skor tes 70–100 dinyatakan lulus, skor 0–69 dinyatakan tidak lolos.
          </p>
        </div>
      </section>
    </div>
  );
}

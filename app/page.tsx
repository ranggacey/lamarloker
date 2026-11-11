"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconArrowRight,
  IconBriefcase,
  IconBuilding,
  IconCheckCircle,
  IconClipboard,
  IconMapPin,
  IconShieldCheck,
  IconUser,
} from "@/components/icons";

interface JobPreview {
  id: string;
  title: string;
  division: string;
  type: string;
  location: string;
}

export default function Home() {
  const [jobs, setJobs] = useState<JobPreview[]>([]);

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.ok && Array.isArray(j.data?.jobs)) {
          setJobs(j.data.jobs.slice(0, 3) as JobPreview[]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-[linear-gradient(180deg,#f6efff_0%,#ffffff_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="chip !px-3 !py-1 !text-xs">
              <IconBriefcase className="h-4 w-4" />
              Portal lamaran kerja
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.15] tracking-tight text-ink sm:text-5xl">
              Lamar kerja jadi lebih{" "}
              <span className="grad-text">mudah</span> dan transparan
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Daftar sebagai pelamar, lengkapi profil dan dokumen, pilih posisi yang mau dilamar, lalu
              ikuti tes seleksi. Skor tes 70 ke atas langsung dinyatakan lulus.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register" className="btn-action w-full !px-6 !py-3 !text-base sm:w-auto">
                Daftar Sekarang
                <IconArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/lowongan" className="btn-secondary w-full !px-6 !py-3 !text-base sm:w-auto">
                Lihat Lowongan
              </Link>
              <Link href="/login" className="btn-ghost w-full !px-6 !py-3 !text-base sm:w-auto">
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Lowongan terbaru */}
      {jobs.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Lowongan Terbaru</p>
              <h2 className="mt-1 text-xl font-extrabold text-ink">Posisi yang sedang dibuka</h2>
            </div>
            <Link href="/lowongan" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-text hover:underline">
              Lihat semua <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {jobs.map((job) => (
              <Link key={job.id} href="/lowongan" className="card block p-5 transition-all hover:-translate-y-1 hover:shadow-lg">
                <span className="chip">{job.type}</span>
                <h3 className="mt-3 text-base font-bold text-ink">{job.title}</h3>
                {job.division && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                    <IconBuilding className="h-4 w-4" /> {job.division}
                  </p>
                )}
                {job.location && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                    <IconMapPin className="h-4 w-4" /> {job.location}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Fitur */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <p className="eyebrow text-center">Kenapa LamarLoker</p>
        <h2 className="mt-1 text-center text-xl font-extrabold text-ink">Semua proses seleksi dalam satu tempat</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="card p-6">
            <span className="grad-primary flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md shadow-brand/30">
              <IconUser className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-ink">Profil &amp; dokumen online</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Pelamar mengisi data diri, riwayat pengalaman, dan mengunggah CV, ijazah, transkrip nilai,
              serta foto langsung dari halaman profil.
            </p>
          </div>
          <div className="card p-6">
            <span className="grad-primary flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md shadow-brand/30">
              <IconClipboard className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-ink">Tes &amp; skor transparan</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              HR menginput skor interview dan psikotes. Skor 70 ke atas berarti lulus, 69 ke bawah tidak
              lolos — status terlihat jelas oleh pelamar dan HR.
            </p>
          </div>
          <div className="card p-6">
            <span className="grad-primary flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md shadow-brand/30">
              <IconShieldCheck className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-ink">Dashboard HR</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              HR melihat daftar pelamar, mencari berdasarkan nama, memfilter berdasarkan status, mengunduh
              dokumen, dan mengekspor data ke Excel / PDF / CSV.
            </p>
          </div>
        </div>
      </section>

      {/* Cara kerja */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="card p-6 sm:p-8">
          <p className="eyebrow">Cara Kerja</p>
          <h2 className="mt-1 text-xl font-extrabold text-ink">Empat langkah menuju pekerjaan</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "1", t: "Daftar akun", d: "Daftar sebagai pelamar: isi nama, email, dan password." },
              { n: "2", t: "Lengkapi profil", d: "Isi data diri, riwayat pengalaman, dan unggah CV, ijazah, transkrip, dan foto." },
              { n: "3", t: "Pilih lowongan", d: "Buka halaman Lamar Pekerjaan dan pilih posisi yang mau dilamar." },
              { n: "4", t: "Ikuti tes", d: "HR menginput skor interview dan psikotes. Skor 70+ lulus, di bawah 70 tidak lolos." },
            ].map((s) => (
              <li key={s.n} className="flex gap-3">
                <span className="grad-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold text-white shadow-md shadow-brand/30">
                  {s.n}
                </span>
                <div>
                  <p className="font-bold text-ink">{s.t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 flex items-start gap-2 rounded-xl bg-success-bg px-4 py-3 text-sm font-medium text-success-text">
            <IconCheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
            Aturan kelulusan: skor tes 70–100 dinyatakan lulus, skor 0–69 dinyatakan tidak lolos.
          </p>
        </div>
      </section>
    </div>
  );
}

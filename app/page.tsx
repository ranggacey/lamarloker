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
      <section>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="chip-brutal !px-3 !py-1 !text-xs">
              <IconBriefcase className="h-4 w-4" />
              Portal lamaran kerja
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Lamar kerja jadi lebih{" "}
              <span className="inline-block rounded-xl border-2 border-slate-900 bg-brand px-2 text-white shadow-[4px_4px_0_#0f172a]">
                mudah
              </span>{" "}
              dan transparan
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Daftar sebagai pelamar, lengkapi profil dan dokumen, pilih posisi yang mau dilamar, lalu
              ikuti tes seleksi. Skor tes 70 ke atas langsung dinyatakan lulus.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register" className="btn-brutal w-full !px-6 !py-3 !text-base sm:w-auto">
                Daftar Sekarang
                <IconArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/lowongan" className="btn-brutal-white w-full !px-6 !py-3 !text-base sm:w-auto">
                Lihat Lowongan
              </Link>
              <Link href="/login" className="btn-brutal-dark w-full !px-6 !py-3 !text-base sm:w-auto">
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
            <h2 className="text-xl font-black text-slate-900">Lowongan terbaru</h2>
            <Link href="/lowongan" className="inline-flex items-center gap-1 text-sm font-bold text-brand-text hover:underline">
              Lihat semua <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {jobs.map((job) => (
              <Link key={job.id} href="/lowongan" className="card-brutal block p-5 transition-transform hover:-translate-y-0.5">
                <span className="chip-brutal">{job.type}</span>
                <h3 className="mt-3 text-base font-black text-slate-900">{job.title}</h3>
                {job.division && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                    <IconBuilding className="h-4 w-4" /> {job.division}
                  </p>
                )}
                {job.location && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
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
        <div className="grid gap-5 md:grid-cols-3">
          <div className="card-brutal p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-900 bg-brand-bg text-brand-text shadow-[2px_2px_0_#0f172a]">
              <IconUser className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-black text-slate-900">Profil &amp; dokumen online</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Pelamar mengisi data diri, riwayat pengalaman, dan mengunggah CV, ijazah, transkrip nilai,
              serta foto langsung dari halaman profil.
            </p>
          </div>
          <div className="card-brutal p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-900 bg-brand-bg text-brand-text shadow-[2px_2px_0_#0f172a]">
              <IconClipboard className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-black text-slate-900">Tes &amp; skor transparan</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              HR menginput skor interview dan psikotes. Skor 70 ke atas berarti lulus, 69 ke bawah tidak
              lolos — status terlihat jelas oleh pelamar dan HR.
            </p>
          </div>
          <div className="card-brutal p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-900 bg-brand-bg text-brand-text shadow-[2px_2px_0_#0f172a]">
              <IconShieldCheck className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-black text-slate-900">Dashboard HR</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              HR melihat daftar pelamar, mencari berdasarkan nama, memfilter berdasarkan status, mengunduh
              dokumen, dan mengekspor data ke Excel / PDF / CSV.
            </p>
          </div>
        </div>
      </section>

      {/* Cara kerja */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="card-brutal p-6 sm:p-8">
          <h2 className="text-xl font-black text-slate-900">Cara kerja</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "1", t: "Daftar akun", d: "Daftar sebagai pelamar: isi nama, email, dan password." },
              { n: "2", t: "Lengkapi profil", d: "Isi data diri, riwayat pengalaman, dan unggah CV, ijazah, transkrip, dan foto." },
              { n: "3", t: "Pilih lowongan", d: "Buka halaman Lamar Pekerjaan dan pilih posisi yang mau dilamar." },
              { n: "4", t: "Ikuti tes", d: "HR menginput skor interview dan psikotes. Skor 70+ lulus, di bawah 70 tidak lolos." },
            ].map((s) => (
              <li key={s.n} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-slate-900 bg-brand text-sm font-black text-white shadow-[2px_2px_0_#0f172a]">
                  {s.n}
                </span>
                <div>
                  <p className="font-bold text-slate-900">{s.t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 flex items-start gap-2 rounded-xl border-2 border-slate-900 bg-success-bg px-4 py-3 text-sm font-medium text-success-text shadow-[3px_3px_0_#0f172a]">
            <IconCheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
            Aturan kelulusan: skor tes 70–100 dinyatakan lulus, skor 0–69 dinyatakan tidak lolos.
          </p>
        </div>
      </section>
    </div>
  );
}

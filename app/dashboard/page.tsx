"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { IconArrowRight, IconBriefcase, IconCheck, IconCheckCircle, IconFileText, IconUser, IconXCircle } from "@/components/icons";
import { StatusBadge, ScoreBadge } from "@/components/StatusBadge";

interface AppliedJob {
  id: string;
  title: string;
  division: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  education: string;
  experience: string;
  address: string;
  cvUrl: string;
  photoUrl: string;
  ijazahUrl: string;
  transcriptUrl: string;
  experiences: Experience[];
  appliedJob: AppliedJob | null;
  appliedAt: string | null;
  status: "baru" | "proses" | "lulus" | "tidak lolos";
  createdAt: string;
}

interface Score {
  id: string;
  type: string;
  score: number;
  status: string;
  note: string;
  updatedAt: string;
}

const statusText: Record<Profile["status"], string> = {
  baru: "Lamaranmu sudah masuk. Lengkapi profil dan dokumen, lalu pilih posisi di halaman Lamar Pekerjaan.",
  proses: "Kamu sudah mengikuti sebagian tes. Lengkapi tes yang tersisa dan pantau skornya di bawah.",
  lulus: "Selamat! Kamu dinyatakan lulus seleksi. HR akan menghubungimu untuk tahap selanjutnya.",
  "tidak lolos": "Mohon maaf, kamu belum lolos pada salah satu tes (skor di bawah 70).",
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/profile");
      const j = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: { profile: Profile; scores: Score[] };
      };
      if (!j.ok || !j.data) {
        setError(j.error ?? "Gagal memuat profil");
        return;
      }
      setProfile(j.data.profile);
      setScores(j.data.scores);
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="text-slate-500">Memuat beranda...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="rounded-xl border-2 border-slate-900 bg-danger-bg px-4 py-3 text-sm font-medium text-danger-text shadow-[3px_3px_0_#0f172a]">
          {error || "Profil tidak ditemukan."}
        </p>
      </div>
    );
  }

  const checklist = [
    { label: "Data diri (nama, HP, pendidikan, alamat)", done: !!(profile.phone && profile.education && profile.address) },
    { label: "CV (PDF)", done: !!profile.cvUrl },
    { label: "Foto profil", done: !!profile.photoUrl },
    { label: "Ijazah", done: !!profile.ijazahUrl },
    { label: "Transkrip nilai", done: !!profile.transcriptUrl },
    { label: "Riwayat pengalaman", done: profile.experiences.length > 0 || !!profile.experience.trim() },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Halo, {profile.name}</h1>
          <p className="mt-1 text-sm text-slate-600">{profile.email}</p>
        </div>
        <StatusBadge status={profile.status} />
      </div>

      {/* Status lamaran */}
      <div className="card-brutal mt-6 p-5 sm:p-6">
        <h2 className="text-base font-black text-slate-900">Status lamaran</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{statusText[profile.status]}</p>
        <p className="mt-3 text-xs text-slate-500">
          Aturan: skor tes 70–100 dinyatakan lulus, skor 0–69 dinyatakan tidak lolos.
        </p>
      </div>

      {/* Posisi yang dilamar */}
      <div className="card-brutal mt-6 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-black text-slate-900">
          <IconBriefcase className="h-5 w-5 text-brand-text" />
          Posisi yang dilamar
        </h2>
        {profile.appliedJob ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-slate-900 bg-brand-bg px-4 py-3 shadow-[3px_3px_0_#0f172a]">
            <div>
              <p className="text-sm font-black text-slate-900">{profile.appliedJob.title}</p>
              {profile.appliedJob.division && (
                <p className="text-xs text-slate-600">{profile.appliedJob.division}</p>
              )}
              {profile.appliedAt && (
                <p className="text-xs text-slate-500">
                  Dilamar {new Date(profile.appliedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
            </div>
            <Link href="/lowongan" className="btn-brutal-white !px-3 !py-1.5 !text-xs">
              Ganti posisi
            </Link>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">Kamu belum memilih posisi. Yuk, lihat lowongan yang sedang buka.</p>
            <Link href="/lowongan" className="btn-brutal !px-4 !py-2 !text-sm">
              Lamar Pekerjaan <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Skor tes */}
      <div className="card-brutal mt-6 p-5 sm:p-6">
        <h2 className="text-base font-black text-slate-900">Skor tes saya</h2>
        {scores.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Belum ada skor tes. HR akan menginput skor setelah kamu mengikuti tes.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {scores.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-slate-900 bg-brand-bg px-4 py-3 shadow-[2px_2px_0_#0f172a]">
                <div>
                  <p className="text-sm font-bold capitalize text-slate-900">{s.type}</p>
                  {s.note && <p className="text-xs text-slate-500">{s.note}</p>}
                  <p className="text-xs text-slate-400">
                    {new Date(s.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <ScoreBadge score={s.score} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Kelengkapan profil + jalan pintas */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card-brutal p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-black text-slate-900">
              <IconUser className="h-5 w-5 text-brand-text" />
              Kelengkapan profil
            </h2>
            <span className="chip-brutal">
              {doneCount}/{checklist.length} lengkap
            </span>
          </div>
          <ul className="mt-4 space-y-2.5">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-center gap-2.5 text-sm">
                {c.done ? (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 bg-success text-slate-900">
                    <IconCheck className="h-4 w-4" />
                  </span>
                ) : (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 bg-white text-slate-400">
                    <IconXCircle className="h-4 w-4" />
                  </span>
                )}
                <span className={c.done ? "font-medium text-slate-900" : "text-slate-500"}>{c.label}</span>
              </li>
            ))}
          </ul>
          <Link href="/profil" className="btn-brutal mt-5 w-full !py-2.5 sm:w-auto">
            Lengkapi Profil <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="card-brutal p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-base font-black text-slate-900">
            <IconFileText className="h-5 w-5 text-brand-text" />
            Langkah selanjutnya
          </h2>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-slate-900 bg-brand text-xs font-black text-white shadow-[2px_2px_0_#0f172a]">1</span>
              <span><b className="text-slate-900">Lengkapi profil</b> — data diri, dokumen (CV, ijazah, transkrip, foto), dan riwayat pengalaman.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-slate-900 bg-brand text-xs font-black text-white shadow-[2px_2px_0_#0f172a]">2</span>
              <span><b className="text-slate-900">Pilih posisi</b> — buka Lamar Pekerjaan dan lamar posisi yang kamu mau.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-slate-900 bg-brand text-xs font-black text-white shadow-[2px_2px_0_#0f172a]">3</span>
              <span><b className="text-slate-900">Ikuti tes</b> — HR akan menghubungimu untuk interview dan psikotes.</span>
            </li>
          </ol>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/lowongan" className="btn-brutal !py-2.5">
              Lamar Pekerjaan <IconArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/profil" className="btn-brutal-white !py-2.5">
              Profil Saya
            </Link>
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
            <IconCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success-text" />
            Pastikan dokumenmu lengkap sebelum tes — HR mengunduh CV, ijazah, dan transkrip dari halaman detail pelamar.
          </p>
        </div>
      </div>
    </div>
  );
}

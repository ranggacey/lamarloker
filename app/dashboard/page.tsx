"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { IconArrowRight, IconCheck, IconCheckCircle, IconFileText, IconUser, IconXCircle } from "@/components/icons";
import { StatusBadge } from "@/components/StatusBadge";
import ApplicationTracker from "@/components/ApplicationTracker";

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
        <p className="text-muted">Memuat beranda...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger-text">
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
          <p className="eyebrow">Beranda Pelamar</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">Halo, {profile.name}</h1>
          <p className="mt-1 text-sm text-muted">{profile.email}</p>
        </div>
        <StatusBadge status={profile.status} />
      </div>

      {/* Pelacak lamaran: posisi + status + alur + skor + hasil */}
      <div className="mt-6">
        <ApplicationTracker
          appliedJob={profile.appliedJob}
          appliedAt={profile.appliedAt}
          status={profile.status}
          scores={scores}
          context="pelamar"
        />
      </div>

      {/* Kelengkapan profil + jalan pintas */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <IconUser className="h-5 w-5 text-brand-text" />
              Kelengkapan profil
            </h2>
            <span className="chip">
              {doneCount}/{checklist.length} lengkap
            </span>
          </div>
          <ul className="mt-4 space-y-2.5">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-center gap-2.5 text-sm">
                {c.done ? (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-bg text-success-text">
                    <IconCheck className="h-4 w-4" />
                  </span>
                ) : (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <IconXCircle className="h-4 w-4" />
                  </span>
                )}
                <span className={c.done ? "font-medium text-ink" : "text-muted"}>{c.label}</span>
              </li>
            ))}
          </ul>
          <Link href="/profil" className="btn-primary mt-5 w-full !py-2.5 sm:w-auto">
            Lengkapi Profil <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="card p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <IconFileText className="h-5 w-5 text-brand-text" />
            Langkah selanjutnya
          </h2>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
            <li className="flex gap-3">
              <span className="grad-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white shadow-md shadow-brand/30">1</span>
              <span><b className="text-ink">Lengkapi profil</b> — data diri, dokumen (CV, ijazah, transkrip, foto), dan riwayat pengalaman.</span>
            </li>
            <li className="flex gap-3">
              <span className="grad-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white shadow-md shadow-brand/30">2</span>
              <span><b className="text-ink">Pilih posisi</b> — buka Lamar Pekerjaan dan lamar posisi yang kamu mau.</span>
            </li>
            <li className="flex gap-3">
              <span className="grad-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white shadow-md shadow-brand/30">3</span>
              <span><b className="text-ink">Ikuti tes</b> — HR akan menghubungimu untuk interview dan psikotes.</span>
            </li>
          </ol>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/lowongan" className="btn-action !py-2.5">
              Lamar Pekerjaan <IconArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/profil" className="btn-secondary !py-2.5">
              Profil Saya
            </Link>
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted">
            <IconCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success-text" />
            Pastikan dokumenmu lengkap sebelum tes — HR mengunduh CV, ijazah, dan transkrip dari halaman detail pelamar.
          </p>
        </div>
      </div>
    </div>
  );
}

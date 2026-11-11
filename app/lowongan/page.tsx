"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/components/LoadingOverlay";
import { IconArrowRight, IconBriefcase, IconBuilding, IconCheckCircle, IconMapPin } from "@/components/icons";

interface Job {
  id: string;
  title: string;
  division: string;
  type: string;
  location: string;
  description: string;
  requirements: string;
  status: string;
  createdAt: string;
}

export default function LowonganPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appliedJobId, setAppliedJobId] = useState<string | null>(null);
  const [appliedJobTitle, setAppliedJobTitle] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [applyMsg, setApplyMsg] = useState("");
  const [applyError, setApplyError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/jobs");
      const j = (await res.json()) as { ok: boolean; error?: string; data?: { jobs: Job[] } };
      if (!j.ok || !j.data) {
        setError(j.error ?? "Gagal memuat lowongan");
        return;
      }
      setJobs(j.data.jobs);
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMe = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        setLoggedIn(false);
        return;
      }
      const j = (await res.json()) as {
        ok: boolean;
        data?: { profile: { appliedJob: { id: string; title: string } | null } };
      };
      if (j.ok && j.data) {
        setLoggedIn(true);
        setAppliedJobId(j.data.profile.appliedJob?.id ?? null);
        setAppliedJobTitle(j.data.profile.appliedJob?.title ?? "");
      }
    } catch {
      setLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
    loadMe();
  }, [loadJobs, loadMe]);

  async function apply(job: Job) {
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    setApplying(job.id);
    setApplyMsg("");
    setApplyError("");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });
      const j = (await res.json()) as { ok: boolean; error?: string; data?: { appliedJob: { title: string } } };
      if (!j.ok) {
        setApplyError(j.error ?? "Gagal melamar");
        return;
      }
      setAppliedJobId(job.id);
      setAppliedJobTitle(job.title);
      setApplyMsg(`Lamaran untuk "${job.title}" berhasil dikirim. Mengarahkan ke Beranda...`);
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch {
      setApplyError("Tidak bisa terhubung ke server");
    } finally {
      setApplying(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <LoadingOverlay show={applying !== null} message="Mengirim lamaran..." />
      <p className="eyebrow">Lowongan</p>
      <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-ink sm:text-3xl">
        <IconBriefcase className="h-7 w-7 text-brand-text" />
        Lamar Pekerjaan
      </h1>
      <p className="mt-1 text-sm text-muted">
        Pilih posisi yang mau kamu lamar. Satu akun melamar satu posisi — kamu bisa ganti posisi kapan saja.
      </p>

      {appliedJobId && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-success-bg px-4 py-3 text-sm font-medium text-success-text">
          <IconCheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
          Kamu sedang melamar posisi “{appliedJobTitle}”. Pilih posisi lain di bawah kalau mau ganti lamaran.
        </p>
      )}
      {!loggedIn && (
        <p className="card mt-4 px-4 py-3 text-sm text-slate-700">
          Kamu belum masuk.{" "}
          <Link href="/login" className="font-semibold text-brand-text hover:underline">
            Masuk dulu
          </Link>{" "}
          atau{" "}
          <Link href="/register" className="font-semibold text-brand-text hover:underline">
            daftar akun
          </Link>{" "}
          untuk bisa melamar.
        </p>
      )}
      {applyMsg && (
        <p className="mt-4 rounded-xl bg-success-bg px-4 py-3 text-sm font-medium text-success-text">
          {applyMsg}
        </p>
      )}
      {applyError && (
        <p className="mt-4 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger-text">
          {applyError}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger-text">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-muted">Memuat lowongan...</p>
      ) : jobs.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="text-sm font-bold text-ink">Belum ada lowongan yang dibuka.</p>
          <p className="mt-1 text-sm text-muted">HR akan membuka lowongan baru — cek lagi nanti.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => {
            const isApplied = appliedJobId === job.id;
            const open = expanded === job.id;
            return (
              <article key={job.id} className="card flex flex-col p-5 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip">{job.type}</span>
                  {isApplied && <span className="chip chip-green">Sudah Dilamar</span>}
                </div>
                <h2 className="mt-3 text-lg font-bold leading-snug text-ink">{job.title}</h2>
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
                {job.description && (
                  <p className={`mt-3 text-sm leading-relaxed text-muted ${open ? "" : "line-clamp-3"}`}>
                    {job.description}
                  </p>
                )}
                {open && job.requirements && (
                  <div className="mt-3 rounded-xl bg-white p-3 ring-1 ring-line">
                    <p className="eyebrow">Kualifikasi &amp; Persyaratan</p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted">{job.requirements}</p>
                  </div>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  Dibuka {new Date(job.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => apply(job)}
                    disabled={applying === job.id || isApplied}
                    className="btn-action flex-1 !py-2.5"
                  >
                    {applying === job.id ? "Mengirim..." : isApplied ? "Sudah Dilamar" : "Lamar"}
                    {!isApplied && <IconArrowRight className="h-4 w-4" />}
                  </button>
                  {(job.description || job.requirements) && (
                    <button onClick={() => setExpanded(open ? null : job.id)} className="btn-secondary !px-3 !py-2.5 !text-xs">
                      {open ? "Tutup" : "Detail"}
                    </button>
                  )}
                </div>
                {isApplied && (
                  <p className="mt-2 text-xs text-muted">
                    Mau ganti posisi? Lamar posisi lain — lamaranmu akan pindah ke posisi itu.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

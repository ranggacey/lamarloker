"use client";

import { Suspense, useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  IconBriefcase,
  IconCalendar,
  IconChevronRight,
  IconDownload,
  IconEye,
  IconFileText,
  IconGraduation,
  IconMail,
  IconPhone,
  IconUser,
} from "@/components/icons";
import { StatusBadge, ScoreBadge } from "@/components/StatusBadge";
import LoadingOverlay from "@/components/LoadingOverlay";

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  education: string;
  experience: string;
  address: string;
  cvUrl: string;
  photoUrl: string;
  ijazahUrl: string;
  transcriptUrl: string;
  experiences: Experience[];
  appliedJob: { id: string; title: string; division: string } | null;
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

const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function formatMonth(ym: string): string {
  const m = ym.match(/^(\d{4})-(\d{2})$/);
  if (!m) return ym || "-";
  const idx = Number(m[2]) - 1;
  return idx >= 0 && idx < 12 ? `${MONTHS_ID[idx]} ${m[1]}` : ym;
}

function formatPeriod(e: Experience): string {
  const start = e.startDate ? formatMonth(e.startDate) : "-";
  const end = e.isCurrent ? "Sekarang" : e.endDate ? formatMonth(e.endDate) : "-";
  return `${start} – ${end}`;
}

function safeFilename(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "pelamar";
}

function HrDetailContent() {
  const params = useParams();
  const id = String(params.id ?? "");

  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const [type, setType] = useState<"interview" | "psikotes">("interview");
  const [score, setScore] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/hr/applicants/${id}`);
      const j = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: { applicant: Applicant; scores: Score[] };
      };
      if (!j.ok || !j.data) {
        setError(j.error ?? "Pelamar tidak ditemukan");
        return;
      }
      setApplicant(j.data.applicant);
      setScores(j.data.scores);
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function exportOne() {
    if (!applicant) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/hr/applicants/${applicant.id}/export`);
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        setError(j.error ?? "Export pelamar gagal");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pelamar-${safeFilename(applicant.name)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setExporting(false);
    }
  }

  async function submitScore(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedMsg("");
    setError("");
    try {
      const res = await fetch(`/api/hr/applicants/${id}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, score: Number(score), note }),
      });
      const j = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: { applicantStatus: string };
      };
      if (!j.ok) {
        setError(j.error ?? "Gagal menyimpan skor");
        return;
      }
      setSavedMsg(`Skor ${type} tersimpan. Status pelamar sekarang: ${j.data?.applicantStatus}.`);
      setScore("");
      setNote("");
      await load();
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="text-slate-500">Memuat detail pelamar...</p>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="rounded-xl border-2 border-slate-900 bg-danger-bg px-4 py-3 text-sm font-medium text-danger-text shadow-[3px_3px_0_#0f172a]">
          {error || "Pelamar tidak ditemukan."}
        </p>
        <Link href="/hr" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-text hover:underline">
          Kembali ke daftar pelamar
        </Link>
      </div>
    );
  }

  const inputCls = "input-brutal";

  const docRow = (title: string, url: string, icon: React.ReactNode) => (
    <div className="flex flex-col gap-3 rounded-xl border-2 border-slate-900 bg-white p-4 shadow-[2px_2px_0_#0f172a] sm:flex-row sm:items-center">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-900 bg-brand-bg text-brand-text">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{url ? "Tersimpan di Cloudinary" : "Belum diunggah pelamar"}</p>
      </div>
      {url ? (
        <div className="flex shrink-0 gap-2">
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn-brutal-white !px-3 !py-2 !text-xs">
            <IconEye className="h-4 w-4" /> Lihat
          </a>
          <a href={url} download target="_blank" rel="noopener noreferrer" className="btn-brutal !px-3 !py-2 !text-xs">
            <IconDownload className="h-4 w-4" /> Download
          </a>
        </div>
      ) : (
        <span className="text-xs font-medium text-slate-400">-</span>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <LoadingOverlay show={saving} message="Menyimpan..." />
      <Link href="/hr" className="inline-flex items-center gap-1 text-sm font-bold text-brand-text hover:underline">
        <IconChevronRight className="h-4 w-4 rotate-180" />
        Kembali ke daftar pelamar
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          {applicant.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={applicant.photoUrl} alt={applicant.name} className="h-20 w-20 rounded-2xl border-2 border-slate-900 object-cover shadow-[3px_3px_0_#0f172a]" />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-slate-900 bg-brand-bg text-slate-400 shadow-[3px_3px_0_#0f172a]">
              <IconUser className="h-10 w-10" />
            </span>
          )}
          <div>
            <h1 className="text-2xl font-black text-slate-900">{applicant.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
              <IconMail className="h-4 w-4" /> {applicant.email}
            </p>
            {applicant.phone && (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
                <IconPhone className="h-4 w-4" /> {applicant.phone}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-400">
              Mendaftar {new Date(applicant.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={applicant.status} />
          <button onClick={exportOne} disabled={exporting} className="btn-brutal !py-2 !text-xs">
            <IconDownload className="h-4 w-4" />
            {exporting ? "Menyiapkan..." : "Export Excel Pelamar"}
          </button>
        </div>
      </div>

      {/* Posisi yang dilamar */}
      <div className="card-brutal mt-6 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-black text-slate-900">
          <IconBriefcase className="h-5 w-5 text-brand-text" />
          Posisi yang dilamar
        </h2>
        {applicant.appliedJob ? (
          <div className="mt-3">
            <span className="chip-brutal !text-sm">{applicant.appliedJob.title}</span>
            {applicant.appliedJob.division && (
              <span className="ml-2 text-sm text-slate-600">{applicant.appliedJob.division}</span>
            )}
            {applicant.appliedAt && (
              <p className="mt-2 text-xs text-slate-500">
                Dilamar {new Date(applicant.appliedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">Pelamar belum memilih posisi.</p>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Profil + dokumen + pengalaman */}
        <div className="space-y-6 lg:col-span-3">
          <div className="card-brutal p-5 sm:p-6">
            <h2 className="text-base font-black text-slate-900">Profil pelamar</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <dt className="w-36 shrink-0 font-bold text-slate-500">Pendidikan</dt>
                <dd className="text-slate-900">{applicant.education || "-"}</dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <dt className="w-36 shrink-0 font-bold text-slate-500">Alamat</dt>
                <dd className="text-slate-900">{applicant.address || "-"}</dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <dt className="w-36 shrink-0 font-bold text-slate-500">Ringkasan pengalaman</dt>
                <dd className="whitespace-pre-line text-slate-900">{applicant.experience || "-"}</dd>
              </div>
            </dl>
          </div>

          {/* Riwayat pengalaman */}
          <div className="card-brutal p-5 sm:p-6">
            <h2 className="text-base font-black text-slate-900">Riwayat pengalaman</h2>
            {applicant.experiences.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Pelamar belum mengisi riwayat pengalaman.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {applicant.experiences.map((exp) => (
                  <li key={exp.id} className="rounded-xl border-2 border-slate-900 bg-brand-bg px-4 py-3 shadow-[2px_2px_0_#0f172a]">
                    <p className="text-sm font-black text-slate-900">
                      {exp.position || "-"} <span className="font-medium text-slate-500">di</span> {exp.company || "-"}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <IconCalendar className="h-4 w-4" /> {formatPeriod(exp)}
                    </p>
                    {exp.description && (
                      <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{exp.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Dokumen */}
          <div className="card-brutal p-5 sm:p-6">
            <h2 className="text-base font-black text-slate-900">Dokumen pelamar</h2>
            <div className="mt-4 space-y-3">
              {docRow("CV", applicant.cvUrl, <IconFileText className="h-6 w-6" />)}
              {docRow("Ijazah", applicant.ijazahUrl, <IconGraduation className="h-6 w-6" />)}
              {docRow("Transkrip Nilai", applicant.transcriptUrl, <IconFileText className="h-6 w-6" />)}
              {docRow("Foto", applicant.photoUrl, <IconUser className="h-6 w-6" />)}
            </div>
          </div>

          {/* Riwayat skor */}
          <div className="card-brutal p-5 sm:p-6">
            <h2 className="text-base font-black text-slate-900">Riwayat skor tes</h2>
            {scores.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Belum ada skor. Input skor pertama lewat form di samping.</p>
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
        </div>

        {/* Form input skor */}
        <form onSubmit={submitScore} className="card-brutal h-fit p-5 sm:p-6 lg:col-span-2">
          <h2 className="text-base font-black text-slate-900">Input skor tes</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Skor 70–100 = lulus, skor 0–69 = tidak lolos. Input ulang akan memperbarui skor tes yang sama.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="type" className="mb-1.5 block text-sm font-bold text-slate-700">Jenis tes</label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value as "interview" | "psikotes")} className={inputCls}>
                <option value="interview">Interview</option>
                <option value="psikotes">Psikotes</option>
              </select>
            </div>
            <div>
              <label htmlFor="score" className="mb-1.5 block text-sm font-bold text-slate-700">Skor (0–100)</label>
              <input
                id="score"
                type="number"
                min={0}
                max={100}
                required
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="cth: 85"
                className={inputCls}
              />
              {score !== "" && Number(score) >= 0 && Number(score) <= 100 && (
                <p className="mt-2">
                  <ScoreBadge score={Number(score)} />
                </p>
              )}
            </div>
            <div>
              <label htmlFor="note" className="mb-1.5 block text-sm font-bold text-slate-700">Catatan (opsional)</label>
              <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="cth: Komunikasi baik, perlu pendalaman teknis." className={inputCls} />
            </div>
          </div>
          {error && (
            <p className="mt-4 rounded-xl border-2 border-slate-900 bg-danger-bg px-4 py-3 text-sm font-medium text-danger-text shadow-[3px_3px_0_#0f172a]">
              {error}
            </p>
          )}
          {savedMsg && (
            <p className="mt-4 rounded-xl border-2 border-slate-900 bg-success-bg px-4 py-3 text-sm font-medium text-success-text shadow-[3px_3px_0_#0f172a]">
              {savedMsg}
            </p>
          )}
          <button type="submit" disabled={saving} className="btn-brutal mt-5 w-full !py-3">
            {saving ? "Menyimpan..." : "Simpan skor"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function HrDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <p className="text-slate-500">Memuat detail pelamar...</p>
        </div>
      }
    >
      <HrDetailContent />
    </Suspense>
  );
}

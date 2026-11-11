"use client";

import { Suspense, useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { IconChevronRight, IconDownload, IconEye, IconFileText, IconMail, IconPhone, IconUser } from "@/components/icons";
import { StatusBadge, ScoreBadge } from "@/components/StatusBadge";

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

function HrDetailContent() {
  const params = useParams();
  const id = String(params.id ?? "");

  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <p className="rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger-text">{error || "Pelamar tidak ditemukan."}</p>
        <Link href="/hr" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-text">
          Kembali ke daftar pelamar
        </Link>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/hr" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-text hover:text-brand-text">
        <IconChevronRight className="h-4 w-4 rotate-180" />
        Kembali ke daftar pelamar
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          {applicant.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={applicant.photoUrl} alt={applicant.name} className="h-20 w-20 rounded-2xl object-cover ring-2 ring-slate-200" />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-bg text-slate-400">
              <IconUser className="h-10 w-10" />
            </span>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{applicant.name}</h1>
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
        <StatusBadge status={applicant.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Profil + CV */}
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-slate-900">Profil pelamar</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <dt className="w-36 shrink-0 font-medium text-slate-500">Pendidikan</dt>
                <dd className="text-slate-900">{applicant.education || "-"}</dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <dt className="w-36 shrink-0 font-medium text-slate-500">Alamat</dt>
                <dd className="text-slate-900">{applicant.address || "-"}</dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <dt className="w-36 shrink-0 font-medium text-slate-500">Pengalaman</dt>
                <dd className="whitespace-pre-line text-slate-900">{applicant.experience || "-"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-slate-900">CV pelamar</h2>
            {applicant.cvUrl ? (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-bg text-brand-text">
                  <IconFileText className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">CV — {applicant.name}.pdf</p>
                  <p className="text-xs text-slate-500">Tersimpan di Cloudinary</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={applicant.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-bg"
                  >
                    <IconEye className="h-4 w-4" /> Lihat
                  </a>
                  <a
                    href={applicant.cvUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
                  >
                    <IconDownload className="h-4 w-4" /> Download
                  </a>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Pelamar belum mengunggah CV.</p>
            )}
          </div>

          {/* Riwayat skor */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-slate-900">Riwayat skor tes</h2>
            {scores.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Belum ada skor. Input skor pertama lewat form di samping.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {scores.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-bg px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold capitalize text-slate-900">{s.type}</p>
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
        <form onSubmit={submitScore} className="h-fit rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">Input skor tes</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Skor 70–100 = lulus, skor 0–69 = tidak lolos. Input ulang akan memperbarui skor tes yang sama.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-slate-700">Jenis tes</label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value as "interview" | "psikotes")} className={inputCls}>
                <option value="interview">Interview</option>
                <option value="psikotes">Psikotes</option>
              </select>
            </div>
            <div>
              <label htmlFor="score" className="mb-1.5 block text-sm font-medium text-slate-700">Skor (0–100)</label>
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
              <label htmlFor="note" className="mb-1.5 block text-sm font-medium text-slate-700">Catatan (opsional)</label>
              <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="cth: Komunikasi baik, perlu pendalaman teknis." className={inputCls} />
            </div>
          </div>
          {error && <p className="mt-4 rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger-text">{error}</p>}
          {savedMsg && <p className="mt-4 rounded-xl bg-success-bg px-4 py-3 text-sm text-success-text">{savedMsg}</p>}
          <button type="submit" disabled={saving} className="mt-5 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
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

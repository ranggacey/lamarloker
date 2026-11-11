"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { IconChevronRight, IconDownload, IconEye, IconFilter, IconSearch, IconUsers } from "@/components/icons";
import { StatusBadge, ScoreBadge } from "@/components/StatusBadge";

interface ApplicantScore {
  type: string;
  score: number;
  status: string;
  updatedAt: string;
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  education: string;
  status: "baru" | "proses" | "lulus" | "tidak lolos";
  cvUrl: string;
  photoUrl: string;
  appliedJob: string;
  createdAt: string;
  scores: ApplicantScore[];
}

const statusOptions = [
  { value: "", label: "Semua status" },
  { value: "baru", label: "Baru" },
  { value: "proses", label: "Proses" },
  { value: "lulus", label: "Lulus" },
  { value: "tidak lolos", label: "Tidak lolos" },
] as const;

function scoreOf(a: Applicant, type: string): ApplicantScore | undefined {
  return a.scores.find((s) => s.type === type);
}

function safeFilename(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "pelamar";
}

export default function HrPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportingOne, setExportingOne] = useState<string | null>(null);

  const load = useCallback(async (query: string, st: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (st) params.set("status", st);
      const res = await fetch(`/api/hr/applicants?${params.toString()}`);
      const j = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: { total: number; applicants: Applicant[] };
      };
      if (!j.ok || !j.data) {
        setError(j.error ?? "Gagal memuat daftar pelamar");
        return;
      }
      setApplicants(j.data.applicants);
      setTotal(j.data.total);
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce pencarian 400ms.
  useEffect(() => {
    const t = setTimeout(() => load(q, status), 400);
    return () => clearTimeout(t);
  }, [q, status, load]);

  const counts = {
    lulus: applicants.filter((a) => a.status === "lulus").length,
    proses: applicants.filter((a) => a.status === "proses").length,
    baru: applicants.filter((a) => a.status === "baru").length,
    tidakLolos: applicants.filter((a) => a.status === "tidak lolos").length,
  };

  async function exportFile(format: "csv" | "xlsx" | "pdf", filename: string) {
    setExporting(true);
    try {
      const res = await fetch(`/api/hr/export?format=${format}`);
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        setError(j.error ?? "Export gagal");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setExporting(false);
    }
  }

  async function exportOne(a: Applicant) {
    setExportingOne(a.id);
    try {
      const res = await fetch(`/api/hr/applicants/${a.id}/export`);
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        setError(j.error ?? "Export pelamar gagal");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const el = document.createElement("a");
      el.href = url;
      el.download = `pelamar-${safeFilename(a.name)}.xlsx`;
      el.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setExportingOne(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900">
            <IconUsers className="h-7 w-7 text-brand-text" />
            Dashboard HR
          </h1>
          <p className="mt-1 text-sm text-slate-600">Kelola pelamar, lihat dokumen, dan input skor tes (interview &amp; psikotes).</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => exportFile("xlsx", "daftar-pelamar.xlsx")} disabled={exporting} className="btn-brutal">
            <IconDownload className="h-4 w-4" />
            {exporting ? "Menyiapkan..." : "Export Excel"}
          </button>
          <button onClick={() => exportFile("pdf", "daftar-pelamar.pdf")} disabled={exporting} className="btn-brutal-white">
            <IconDownload className="h-4 w-4" />
            Export PDF
          </button>
          <button onClick={() => exportFile("csv", "daftar-pelamar.csv")} disabled={exporting} className="btn-brutal-white">
            <IconDownload className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistik */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total pelamar", value: total, cls: "text-slate-900" },
          { label: "Lulus", value: counts.lulus, cls: "text-success-text" },
          { label: "Proses", value: counts.proses, cls: "text-amber-600" },
          { label: "Baru", value: counts.baru, cls: "text-brand-text" },
          { label: "Tidak lolos", value: counts.tidakLolos, cls: "text-danger" },
        ].map((s) => (
          <div key={s.label} className="card-brutal p-4">
            <p className="text-xs font-bold text-slate-500">{s.label}</p>
            <p className={`mt-1 text-2xl font-black ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Cari + filter */}
      <div className="card-brutal mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama atau email pelamar..."
            className="input-brutal !pl-10"
          />
        </div>
        <div className="relative">
          <IconFilter className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-brutal w-full appearance-none !pl-10 sm:w-48"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border-2 border-slate-900 bg-danger-bg px-4 py-3 text-sm font-medium text-danger-text shadow-[3px_3px_0_#0f172a]">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Memuat daftar pelamar...</p>
      ) : applicants.length === 0 ? (
        <div className="card-brutal mt-6 p-10 text-center">
          <p className="text-sm font-bold text-slate-900">Belum ada pelamar yang cocok.</p>
          <p className="mt-1 text-sm text-slate-500">Coba ubah kata kunci pencarian atau filter status.</p>
        </div>
      ) : (
        <>
          {/* Tabel (desktop) */}
          <div className="card-brutal mt-6 hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b-2 border-slate-900 bg-brand-bg text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-5 py-3.5 font-black">Pelamar</th>
                  <th className="px-5 py-3.5 font-black">Pendidikan</th>
                  <th className="px-5 py-3.5 font-black">Posisi Dilamar</th>
                  <th className="px-5 py-3.5 font-black">Status</th>
                  <th className="px-5 py-3.5 font-black">Interview</th>
                  <th className="px-5 py-3.5 font-black">Psikotes</th>
                  <th className="px-5 py-3.5 font-black">CV</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-brand-bg">
                {applicants.map((a) => {
                  const iv = scoreOf(a, "interview");
                  const ps = scoreOf(a, "psikotes");
                  return (
                    <tr key={a.id} className="hover:bg-brand-bg">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">{a.name}</p>
                        <p className="text-xs text-slate-500">{a.email}</p>
                        {a.phone && <p className="text-xs text-slate-500">{a.phone}</p>}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{a.education || "-"}</td>
                      <td className="px-5 py-4 text-slate-900">{a.appliedJob ? <span className="chip-brutal">{a.appliedJob}</span> : <span className="text-slate-400">-</span>}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-5 py-4">{iv ? <ScoreBadge score={iv.score} /> : <span className="text-slate-400">-</span>}</td>
                      <td className="px-5 py-4">{ps ? <ScoreBadge score={ps.score} /> : <span className="text-slate-400">-</span>}</td>
                      <td className="px-5 py-4">
                        {a.cvUrl ? (
                          <a href={a.cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-brand-text hover:underline">
                            <IconEye className="h-4 w-4" /> Lihat
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => exportOne(a)}
                            disabled={exportingOne === a.id}
                            title="Export Excel pelamar ini"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-slate-900 bg-white text-slate-900 shadow-[2px_2px_0_#0f172a] hover:bg-brand-bg disabled:opacity-60"
                          >
                            <IconDownload className="h-4 w-4" />
                          </button>
                          <Link href={`/hr/${a.id}`} className="inline-flex items-center gap-1 font-bold text-brand-text hover:underline">
                            Detail <IconChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Kartu (mobile) */}
          <div className="mt-6 space-y-3 md:hidden">
            {applicants.map((a) => {
              const iv = scoreOf(a, "interview");
              const ps = scoreOf(a, "psikotes");
              return (
                <div key={a.id} className="card-brutal p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-black text-slate-900">{a.name}</p>
                      <p className="text-xs text-slate-500">{a.email}</p>
                      {a.education && <p className="mt-0.5 text-xs text-slate-500">{a.education}</p>}
                      {a.appliedJob && <p className="mt-1.5"><span className="chip-brutal">{a.appliedJob}</span></p>}
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Interview:</span>
                    {iv ? <ScoreBadge score={iv.score} /> : <span className="text-xs text-slate-400">belum ada</span>}
                    <span className="text-xs font-bold text-slate-500">Psikotes:</span>
                    {ps ? <ScoreBadge score={ps.score} /> : <span className="text-xs text-slate-400">belum ada</span>}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Link href={`/hr/${a.id}`} className="btn-brutal flex-1 !py-2 !text-xs">
                      Lihat detail <IconChevronRight className="h-4 w-4" />
                    </Link>
                    <button onClick={() => exportOne(a)} disabled={exportingOne === a.id} className="btn-brutal-white !px-3 !py-2 !text-xs">
                      <IconDownload className="h-4 w-4" />
                      Excel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <p className="mt-4 text-xs text-slate-500">
        Aturan kelulusan: skor 70–100 lulus, skor 0–69 tidak lolos.
      </p>
    </div>
  );
}

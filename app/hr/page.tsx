"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { IconCheckCircle, IconChevronRight, IconClock, IconDownload, IconEye, IconFilter, IconSearch, IconUser, IconUsers, IconXCircle } from "@/components/icons";
import { StatusBadge, ScoreBadge } from "@/components/StatusBadge";
import CustomSelect from "@/components/CustomSelect";

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
  { value: "baru", label: "Baru", color: "#8b5cf6" },
  { value: "proses", label: "Proses", color: "#d97706" },
  { value: "lulus", label: "Lulus", color: "#16a34a" },
  { value: "tidak lolos", label: "Tidak lolos", color: "#dc2626" },
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

  /* ---------- Data grafik (dihitung dari pelamar yang sudah dimuat) ---------- */
  const tooltipStyle: CSSProperties = {
    borderRadius: 12,
    border: "1px solid #ede7f6",
    fontSize: 12,
    boxShadow: "0 8px 24px rgba(109, 72, 181, 0.12)",
  };

  const statusData = [
    { name: "Lulus", value: counts.lulus, color: "#16a34a" },
    { name: "Tidak Lolos", value: counts.tidakLolos, color: "#dc2626" },
    { name: "Proses", value: counts.proses, color: "#d97706" },
    { name: "Baru", value: counts.baru, color: "#8b5cf6" },
  ];
  const statusTotal = statusData.reduce((s, d) => s + d.value, 0);

  const jobCounts = new Map<string, number>();
  for (const a of applicants) {
    const key = a.appliedJob?.trim() || "Belum memilih posisi";
    jobCounts.set(key, (jobCounts.get(key) ?? 0) + 1);
  }
  const jobData = [...jobCounts.entries()]
    .map(([name, jumlah]) => ({ name, jumlah }))
    .sort((x, y) => y.jumlah - x.jumlah);

  const scoreBuckets = [
    { name: "0–50", jumlah: 0, color: "#f87171" },
    { name: "51–69", jumlah: 0, color: "#f59e0b" },
    { name: "70–100", jumlah: 0, color: "#22c55e" },
  ];
  for (const a of applicants) {
    const iv = scoreOf(a, "interview");
    if (!iv) continue;
    if (iv.score <= 50) scoreBuckets[0].jumlah += 1;
    else if (iv.score <= 69) scoreBuckets[1].jumlah += 1;
    else scoreBuckets[2].jumlah += 1;
  }
  const totalScored = scoreBuckets.reduce((s, b) => s + b.jumlah, 0);

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
          <p className="eyebrow">Panel HR</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-ink sm:text-3xl">
            <IconUsers className="h-7 w-7 text-brand-text" />
            Dashboard HR
          </h1>
          <p className="mt-1 text-sm text-muted">Kelola pelamar, lihat dokumen, dan input skor tes (interview &amp; psikotes).</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => exportFile("xlsx", "daftar-pelamar.xlsx")} disabled={exporting} className="btn-primary">
            <IconDownload className="h-4 w-4" />
            {exporting ? "Menyiapkan..." : "Export Excel"}
          </button>
          <button onClick={() => exportFile("pdf", "daftar-pelamar.pdf")} disabled={exporting} className="btn-secondary">
            <IconDownload className="h-4 w-4" />
            Export PDF
          </button>
          <button onClick={() => exportFile("csv", "daftar-pelamar.csv")} disabled={exporting} className="btn-secondary">
            <IconDownload className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistik — kartu enterprise: ikon + label + angka besar + subteks */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          {
            label: "Total pelamar",
            value: total,
            sub: "semua pelamar terdaftar",
            icon: <IconUsers className="h-5 w-5" />,
            iconCls: "grad-primary text-white shadow-md shadow-brand/30",
            valueCls: "text-ink",
            span: "col-span-2 sm:col-span-1",
          },
          {
            label: "Lulus",
            value: counts.lulus,
            sub: total ? `${Math.round((counts.lulus / total) * 100)}% dari total` : "belum ada yang lulus",
            icon: <IconCheckCircle className="h-5 w-5" />,
            iconCls: "bg-success-bg text-success-text",
            valueCls: "text-success-text",
            span: "",
          },
          {
            label: "Proses",
            value: counts.proses,
            sub: "sedang diseleksi",
            icon: <IconClock className="h-5 w-5" />,
            iconCls: "bg-warning-bg text-warning-text",
            valueCls: "text-warning-text",
            span: "",
          },
          {
            label: "Baru",
            value: counts.baru,
            sub: "menunggu diproses",
            icon: <IconUser className="h-5 w-5" />,
            iconCls: "bg-info-bg text-info-text",
            valueCls: "text-brand-text",
            span: "",
          },
          {
            label: "Tidak lolos",
            value: counts.tidakLolos,
            sub: total ? `${Math.round((counts.tidakLolos / total) * 100)}% dari total` : "belum ada",
            icon: <IconXCircle className="h-5 w-5" />,
            iconCls: "bg-danger-bg text-danger-text",
            valueCls: "text-danger",
            span: "",
          },
        ].map((s) => (
          <div key={s.label} className={`card p-4 sm:p-5 ${s.span}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-muted">{s.label}</p>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.iconCls}`}>
                {s.icon}
              </span>
            </div>
            <p className={`mt-1 text-3xl font-extrabold tracking-tight ${s.valueCls}`}>{s.value}</p>
            <p className="mt-1 text-[11px] leading-tight text-muted">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Grafik */}
      {!loading && (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Donut status pelamar */}
          <div className="card p-5">
            <p className="eyebrow">Grafik</p>
            <h2 className="mt-1 text-base font-bold text-ink">Status pelamar</h2>
            {statusTotal === 0 ? (
              <p className="mt-8 text-center text-sm text-muted">Belum ada data</p>
            ) : (
              <>
                <div className="relative mx-auto mt-2 h-[190px] w-full max-w-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={56}
                        outerRadius={86}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {statusData.map((d) => (
                          <Cell key={d.name} fill={d.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-ink">{statusTotal}</span>
                    <span className="text-xs font-semibold text-muted">pelamar</span>
                  </div>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {statusData.map((d) => (
                    <li key={d.name} className="flex items-center gap-2 text-sm">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
                      <span className="font-medium text-ink">{d.name}</span>
                      <span className="ml-auto font-bold text-ink">{d.value}</span>
                      <span className="w-11 text-right text-xs text-muted">
                        {statusTotal ? `${Math.round((d.value / statusTotal) * 100)}%` : "0%"}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Bar pelamar per posisi */}
          <div className="card p-5">
            <p className="eyebrow">Grafik</p>
            <h2 className="mt-1 text-base font-bold text-ink">Pelamar per posisi</h2>
            {jobData.length === 0 ? (
              <p className="mt-8 text-center text-sm text-muted">Belum ada data</p>
            ) : (
              <div className="mt-4 h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobData} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="jobBar" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#c383ff" />
                        <stop offset="100%" stopColor="#d884db" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ede7f6" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#5b6472" }} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={108}
                      tick={{ fontSize: 11, fill: "#1f2430" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: string) => (v.length > 15 ? `${v.slice(0, 14)}…` : v)}
                    />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f8f5ff" }} />
                    <Bar dataKey="jumlah" fill="url(#jobBar)" radius={[0, 6, 6, 0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Bar distribusi skor interview */}
          <div className="card p-5">
            <p className="eyebrow">Grafik</p>
            <h2 className="mt-1 text-base font-bold text-ink">Distribusi skor interview</h2>
            {totalScored === 0 ? (
              <p className="mt-8 text-center text-sm text-muted">Belum ada skor interview</p>
            ) : (
              <div className="mt-4 h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreBuckets} margin={{ top: 0, right: 8, bottom: 0, left: -12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ede7f6" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5b6472" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#5b6472" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f8f5ff" }} />
                    <Bar dataKey="jumlah" radius={[6, 6, 0, 0]} barSize={44}>
                      {scoreBuckets.map((b) => (
                        <Cell key={b.name} fill={b.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Aktivitas terbaru — 5 pelamar paling baru (dari data yang sudah dimuat) */}
      {!loading && applicants.length > 0 && (
        <div className="card mt-6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="eyebrow">Aktivitas Terbaru</p>
              <h2 className="mt-1 text-base font-bold text-ink">Pelamar terbaru</h2>
            </div>
            <span className="chip">{Math.min(5, applicants.length)} terbaru</span>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {[...applicants]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((a) => (
                <li key={a.id}>
                  <Link href={`/hr/${a.id}`} className="flex flex-wrap items-center gap-3 py-3 transition-colors hover:bg-[#fbfaff]">
                    <span className="grad-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white">
                      {a.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-ink">{a.name}</span>
                      <span className="block truncate text-xs text-muted">
                        {a.appliedJob || "Belum memilih posisi"} ·{" "}
                        {new Date(a.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </span>
                    <StatusBadge status={a.status} />
                    <IconChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Cari + filter */}
      <div className="card mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama atau email pelamar..."
            className="input !pl-10"
          />
        </div>
        <CustomSelect
          value={status}
          onChange={setStatus}
          options={[...statusOptions]}
          ariaLabel="Filter berdasarkan status"
          icon={<IconFilter className="h-5 w-5" />}
          className="w-full sm:w-56"
        />
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger-text">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-muted">Memuat daftar pelamar...</p>
      ) : applicants.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="text-sm font-bold text-ink">Belum ada pelamar yang cocok.</p>
          <p className="mt-1 text-sm text-muted">Coba ubah kata kunci pencarian atau filter status.</p>
        </div>
      ) : (
        <>
          {/* Tabel (desktop) */}
          <div className="card mt-6 hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-[#f8f5ff] text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Pelamar</th>
                  <th className="px-5 py-3.5 font-bold">Pendidikan</th>
                  <th className="px-5 py-3.5 font-bold">Posisi Dilamar</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 font-bold">Interview</th>
                  <th className="px-5 py-3.5 font-bold">Psikotes</th>
                  <th className="px-5 py-3.5 font-bold">CV</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {applicants.map((a) => {
                  const iv = scoreOf(a, "interview");
                  const ps = scoreOf(a, "psikotes");
                  return (
                    <tr key={a.id} className="transition-colors hover:bg-[#fbfaff]">
                      <td className="px-5 py-4">
                        <p className="font-bold text-ink">{a.name}</p>
                        <p className="text-xs text-muted">{a.email}</p>
                        {a.phone && <p className="text-xs text-muted">{a.phone}</p>}
                      </td>
                      <td className="px-5 py-4 text-muted">{a.education || "-"}</td>
                      <td className="px-5 py-4 text-ink">{a.appliedJob ? <span className="chip">{a.appliedJob}</span> : <span className="text-slate-400">-</span>}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-5 py-4">{iv ? <ScoreBadge score={iv.score} /> : <span className="text-slate-400">-</span>}</td>
                      <td className="px-5 py-4">{ps ? <ScoreBadge score={ps.score} /> : <span className="text-slate-400">-</span>}</td>
                      <td className="px-5 py-4">
                        {a.cvUrl ? (
                          <a href={a.cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-text hover:underline">
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
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-ink ring-1 ring-line transition-colors hover:bg-[#fbf7ff] disabled:opacity-60"
                          >
                            <IconDownload className="h-4 w-4" />
                          </button>
                          <Link href={`/hr/${a.id}`} className="inline-flex items-center gap-1 font-semibold text-brand-text hover:underline">
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
                <div key={a.id} className="card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-ink">{a.name}</p>
                      <p className="text-xs text-muted">{a.email}</p>
                      {a.education && <p className="mt-0.5 text-xs text-muted">{a.education}</p>}
                      {a.appliedJob && <p className="mt-1.5"><span className="chip">{a.appliedJob}</span></p>}
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-muted">Interview:</span>
                    {iv ? <ScoreBadge score={iv.score} /> : <span className="text-xs text-slate-400">belum ada</span>}
                    <span className="text-xs font-semibold text-muted">Psikotes:</span>
                    {ps ? <ScoreBadge score={ps.score} /> : <span className="text-xs text-slate-400">belum ada</span>}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Link href={`/hr/${a.id}`} className="btn-primary flex-1 !py-2 !text-xs">
                      Lihat detail <IconChevronRight className="h-4 w-4" />
                    </Link>
                    <button onClick={() => exportOne(a)} disabled={exportingOne === a.id} className="btn-secondary !px-3 !py-2 !text-xs">
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

      <p className="mt-4 text-xs text-muted">
        Aturan kelulusan: skor 70–100 lulus, skor 0–69 tidak lolos.
      </p>
    </div>
  );
}

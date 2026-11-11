"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import LoadingOverlay from "@/components/LoadingOverlay";
import { IconBriefcase, IconBuilding, IconMapPin, IconPlus, IconTrash } from "@/components/icons";

interface Job {
  id: string;
  title: string;
  division: string;
  type: string;
  location: string;
  description: string;
  requirements: string;
  status: "buka" | "tutup";
  createdAt: string;
}

const TYPE_OPTIONS = ["Full-time", "Part-time", "Magang", "Kontrak"];

export default function HrLowonganPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [division, setDivision] = useState("");
  const [type, setType] = useState("Full-time");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/jobs?all=1");
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

  useEffect(() => {
    load();
  }, [load]);

  async function createJob(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setMsg("");
    setError("");
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, division, type, location, description, requirements }),
      });
      const j = (await res.json()) as { ok: boolean; error?: string };
      if (!j.ok) {
        setError(j.error ?? "Gagal membuat lowongan");
        return;
      }
      setMsg(`Lowongan "${title}" berhasil dibuat dan sudah bisa dilamar.`);
      setTitle("");
      setDivision("");
      setType("Full-time");
      setLocation("");
      setDescription("");
      setRequirements("");
      await load();
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setCreating(false);
    }
  }

  async function toggleStatus(job: Job) {
    const next = job.status === "buka" ? "tutup" : "buka";
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const j = (await res.json()) as { ok: boolean; error?: string };
      if (!j.ok) {
        setError(j.error ?? "Gagal mengubah status lowongan");
        return;
      }
      await load();
    } catch {
      setError("Tidak bisa terhubung ke server");
    }
  }

  async function deleteJob(job: Job) {
    if (!window.confirm(`Hapus lowongan "${job.title}"? Pelamar yang sudah melamar posisi ini akan kehilangan info posisinya.`)) return;
    try {
      const res = await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
      const j = (await res.json()) as { ok: boolean; error?: string };
      if (!j.ok) {
        setError(j.error ?? "Gagal menghapus lowongan");
        return;
      }
      setMsg(`Lowongan "${job.title}" dihapus.`);
      await load();
    } catch {
      setError("Tidak bisa terhubung ke server");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <LoadingOverlay show={creating} message="Menyimpan..." />
      <p className="eyebrow">Kelola Lowongan</p>
      <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-ink sm:text-3xl">
        <IconBriefcase className="h-7 w-7 text-brand-text" />
        Kelola Lowongan
      </h1>
      <p className="mt-1 text-sm text-muted">
        Buat lowongan baru supaya pelamar bisa memilih posisi. Tutup lowongan yang sudah tidak dibuka.
      </p>

      {error && (
        <p className="mt-4 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger-text">
          {error}
        </p>
      )}
      {msg && (
        <p className="mt-4 rounded-xl bg-success-bg px-4 py-3 text-sm font-medium text-success-text">
          {msg}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Form buat lowongan */}
        <form onSubmit={createJob} className="card h-fit p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <IconPlus className="h-5 w-5 text-brand-text" />
            Buat lowongan baru
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="title" className="mb-1.5 block text-sm font-semibold text-slate-700">Judul posisi *</label>
              <input id="title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="cth: Staff Administrasi" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="division" className="mb-1.5 block text-sm font-semibold text-slate-700">Divisi</label>
                <input id="division" className="input" value={division} onChange={(e) => setDivision(e.target.value)} placeholder="cth: Administrasi" />
              </div>
              <div>
                <label htmlFor="type" className="mb-1.5 block text-sm font-semibold text-slate-700">Tipe</label>
                <select id="type" className="input" value={type} onChange={(e) => setType(e.target.value)}>
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="location" className="mb-1.5 block text-sm font-semibold text-slate-700">Lokasi</label>
              <input id="location" className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="cth: Semarang" />
            </div>
            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-semibold text-slate-700">Deskripsi pekerjaan</label>
              <textarea id="description" rows={3} className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tulis gambaran pekerjaan dan tanggung jawabnya." />
            </div>
            <div>
              <label htmlFor="requirements" className="mb-1.5 block text-sm font-semibold text-slate-700">Syarat</label>
              <textarea id="requirements" rows={3} className="input" value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="cth: Minimal D3, bisa Microsoft Office, domisili Semarang." />
            </div>
          </div>
          <button type="submit" disabled={creating} className="btn-action mt-5 w-full !py-3 sm:w-auto sm:!px-6">
            <IconPlus className="h-4 w-4" />
            {creating ? "Menyimpan..." : "Buat lowongan"}
          </button>
        </form>

        {/* Daftar lowongan */}
        <div>
          <h2 className="text-base font-bold text-ink">Semua lowongan ({jobs.length})</h2>
          {loading ? (
            <p className="mt-3 text-sm text-muted">Memuat lowongan...</p>
          ) : jobs.length === 0 ? (
            <div className="card mt-3 p-6 text-center">
              <p className="text-sm font-bold text-ink">Belum ada lowongan.</p>
              <p className="mt-1 text-sm text-muted">Buat lowongan pertama lewat form di samping.</p>
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {jobs.map((job) => (
                <li key={job.id} className="card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink">{job.title}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                        {job.division && <span className="inline-flex items-center gap-1"><IconBuilding className="h-3.5 w-3.5" /> {job.division}</span>}
                        {job.location && <span className="inline-flex items-center gap-1"><IconMapPin className="h-3.5 w-3.5" /> {job.location}</span>}
                        <span>{job.type}</span>
                      </p>
                    </div>
                    {job.status === "buka" ? (
                      <span className="chip chip-green shrink-0">Buka</span>
                    ) : (
                      <span className="chip chip-gray shrink-0">Tutup</span>
                    )}
                  </div>
                  {job.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted">{job.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => toggleStatus(job)} className="btn-secondary !px-3 !py-1.5 !text-xs">
                      {job.status === "buka" ? "Tutup lowongan" : "Buka lagi"}
                    </button>
                    <button
                      onClick={() => deleteJob(job)}
                      className="btn-danger-soft"
                    >
                      <IconTrash className="h-4 w-4" />
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

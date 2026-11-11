"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { IconDownload, IconEye, IconFileText, IconUpload, IconUser } from "@/components/icons";
import { StatusBadge, ScoreBadge } from "@/components/StatusBadge";

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
  baru: "Lamaranmu sudah masuk. Lengkapi profil dan unggah CV, lalu tunggu jadwal tes dari HR.",
  proses: "Kamu sudah mengikuti sebagian tes. Lengkapi tes yang tersisa dan pantau skornya di bawah.",
  lulus: "Selamat! Kamu dinyatakan lulus seleksi. HR akan menghubungimu untuk tahap selanjutnya.",
  "tidak lolos": "Mohon maaf, kamu belum lolos pada salah satu tes (skor di bawah 70).",
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [uploading, setUploading] = useState<"cv" | "foto" | null>(null);
  const [uploadMsg, setUploadMsg] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [address, setAddress] = useState("");

  const cvInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);

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
      setName(j.data.profile.name);
      setPhone(j.data.profile.phone);
      setEducation(j.data.profile.education);
      setExperience(j.data.profile.experience);
      setAddress(j.data.profile.address);
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedMsg("");
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, education, experience, address }),
      });
      const j = (await res.json()) as { ok: boolean; error?: string; data?: { profile: Profile } };
      if (!j.ok || !j.data) {
        setError(j.error ?? "Gagal menyimpan profil");
        return;
      }
      setProfile(j.data.profile);
      setSavedMsg("Profil berhasil disimpan.");
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setSaving(false);
    }
  }

  async function upload(kind: "cv" | "foto", file: File | undefined) {
    if (!file) return;
    setUploading(kind);
    setUploadMsg("");
    setError("");
    try {
      const form = new FormData();
      form.append("kind", kind);
      form.append("file", file);
      const res = await fetch("/api/profile/upload", { method: "POST", body: form });
      const j = (await res.json()) as { ok: boolean; error?: string; data?: { url: string } };
      if (!j.ok) {
        setError(j.error ?? "Upload gagal");
        return;
      }
      setUploadMsg(kind === "cv" ? "CV berhasil diunggah." : "Foto berhasil diunggah.");
      await load();
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setUploading(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="text-slate-500">Memuat dashboard...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger-text">{error || "Profil tidak ditemukan."}</p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Halo, {profile.name}</h1>
          <p className="mt-1 text-sm text-slate-600">{profile.email}</p>
        </div>
        <StatusBadge status={profile.status} />
      </div>

      {/* Status */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">Status lamaran</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{statusText[profile.status]}</p>
        <p className="mt-3 text-xs text-slate-500">
          Aturan: skor tes 70–100 dinyatakan lulus, skor 0–69 dinyatakan tidak lolos.
        </p>
      </div>

      {/* Skor tes */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">Skor tes saya</h2>
        {scores.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Belum ada skor tes. HR akan menginput skor setelah kamu mengikuti tes.</p>
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

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Profil */}
        <form onSubmit={saveProfile} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-3">
          <h2 className="text-base font-semibold text-slate-900">Profil saya</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">Nama lengkap</label>
              <input id="name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">No. HP / WhatsApp</label>
                <input id="phone" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
              </div>
              <div>
                <label htmlFor="education" className="mb-1.5 block text-sm font-medium text-slate-700">Pendidikan terakhir</label>
                <input id="education" className={inputCls} value={education} onChange={(e) => setEducation(e.target.value)} placeholder="cth: S1 Teknik Informatika" />
              </div>
            </div>
            <div>
              <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-slate-700">Alamat</label>
              <input id="address" className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Kota / Kabupaten" />
            </div>
            <div>
              <label htmlFor="experience" className="mb-1.5 block text-sm font-medium text-slate-700">Pengalaman kerja</label>
              <textarea
                id="experience"
                rows={4}
                className={inputCls}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Tulis pengalaman kerja / magang, atau tulis 'Fresh graduate' bila belum ada."
              />
            </div>
          </div>
          {error && <p className="mt-4 rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger-text">{error}</p>}
          {savedMsg && <p className="mt-4 rounded-xl bg-success-bg px-4 py-3 text-sm text-success-text">{savedMsg}</p>}
          <button type="submit" disabled={saving} className="mt-5 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60 sm:w-auto sm:px-6">
            {saving ? "Menyimpan..." : "Simpan profil"}
          </button>
        </form>

        {/* Dokumen */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">Dokumen</h2>

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              {profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photoUrl} alt="Foto profil" className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-200" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-bg text-slate-400">
                  <IconUser className="h-8 w-8" />
                </span>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900">Foto profil</p>
                <p className="text-xs text-slate-500">JPG/PNG, maks. 2 MB</p>
              </div>
            </div>
            <input
              ref={photoInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => upload("foto", e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => photoInput.current?.click()}
              disabled={uploading === "foto"}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-bg disabled:opacity-60"
            >
              <IconUpload className="h-4 w-4" />
              {uploading === "foto" ? "Mengunggah..." : profile.photoUrl ? "Ganti foto" : "Unggah foto"}
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-bg text-brand-text">
                <IconFileText className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">CV (PDF)</p>
                <p className="text-xs text-slate-500">Maks. 5 MB</p>
                {profile.cvUrl && (
                  <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-text hover:text-brand-text">
                    <IconEye className="h-4 w-4" /> Lihat CV
                  </a>
                )}
              </div>
            </div>
            <input
              ref={cvInput}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => upload("cv", e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => cvInput.current?.click()}
              disabled={uploading === "cv"}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              <IconUpload className="h-4 w-4" />
              {uploading === "cv" ? "Mengunggah..." : profile.cvUrl ? "Ganti CV" : "Unggah CV"}
            </button>
            {profile.cvUrl && (
              <a
                href={profile.cvUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-bg"
              >
                <IconDownload className="h-4 w-4" />
                Unduh CV saya
              </a>
            )}
          </div>

          {uploadMsg && <p className="mt-4 rounded-xl bg-success-bg px-4 py-3 text-sm text-success-text">{uploadMsg}</p>}
          {error && <p className="mt-4 rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger-text">{error}</p>}
        </div>
      </div>
    </div>
  );
}

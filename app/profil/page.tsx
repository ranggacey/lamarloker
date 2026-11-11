"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import LoadingOverlay from "@/components/LoadingOverlay";
import { IconBriefcase, IconCalendar, IconDownload, IconEye, IconFileText, IconGraduation, IconPlus, IconTrash, IconUpload, IconUser } from "@/components/icons";

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
  appliedJob: { id: string; title: string; division: string } | null;
  appliedAt: string | null;
  status: "baru" | "proses" | "lulus" | "tidak lolos";
  createdAt: string;
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

type DocKind = "cv" | "foto" | "ijazah" | "transkrip";

export default function ProfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [uploading, setUploading] = useState<DocKind | null>(null);
  const [uploadMsg, setUploadMsg] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [address, setAddress] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([]);

  // Form tambah pengalaman.
  const [expCompany, setExpCompany] = useState("");
  const [expPosition, setExpPosition] = useState("");
  const [expStart, setExpStart] = useState("");
  const [expEnd, setExpEnd] = useState("");
  const [expCurrent, setExpCurrent] = useState(false);
  const [expDesc, setExpDesc] = useState("");
  const [expError, setExpError] = useState("");

  const cvInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const ijazahInput = useRef<HTMLInputElement>(null);
  const transkripInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/profile");
      const j = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: { profile: Profile };
      };
      if (!j.ok || !j.data) {
        setError(j.error ?? "Gagal memuat profil");
        return;
      }
      const p = j.data.profile;
      setProfile(p);
      setName(p.name);
      setPhone(p.phone);
      setEducation(p.education);
      setExperience(p.experience);
      setAddress(p.address);
      setExperiences(p.experiences ?? []);
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveProfile(e?: FormEvent, experiencesOverride?: Experience[]) {
    e?.preventDefault();
    setSaving(true);
    setSavedMsg("");
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          education,
          experience,
          address,
          experiences: experiencesOverride ?? experiences,
        }),
      });
      const j = (await res.json()) as { ok: boolean; error?: string; data?: { profile: Profile } };
      if (!j.ok || !j.data) {
        setError(j.error ?? "Gagal menyimpan profil");
        return false;
      }
      setProfile(j.data.profile);
      setExperiences(j.data.profile.experiences ?? []);
      setSavedMsg("Profil berhasil disimpan.");
      return true;
    } catch {
      setError("Tidak bisa terhubung ke server");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function addExperience(e: FormEvent) {
    e.preventDefault();
    setExpError("");
    if (!expCompany.trim() && !expPosition.trim()) {
      setExpError("Isi nama perusahaan atau jabatan.");
      return;
    }
    if (!expStart) {
      setExpError("Isi tanggal mulai.");
      return;
    }
    const item: Experience = {
      id: `tmp-${Date.now()}`,
      company: expCompany.trim(),
      position: expPosition.trim(),
      startDate: expStart,
      endDate: expCurrent ? "" : expEnd,
      isCurrent: expCurrent,
      description: expDesc.trim(),
    };
    const next = [...experiences, item];
    setExperiences(next);
    const ok = await saveProfile(undefined, next);
    if (ok) {
      setExpCompany("");
      setExpPosition("");
      setExpStart("");
      setExpEnd("");
      setExpCurrent(false);
      setExpDesc("");
    }
  }

  async function deleteExperience(id: string) {
    const next = experiences.filter((x) => x.id !== id);
    setExperiences(next);
    await saveProfile(undefined, next);
  }

  async function upload(kind: DocKind, file: File | undefined) {
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
      const label = kind === "cv" ? "CV" : kind === "foto" ? "Foto" : kind === "ijazah" ? "Ijazah" : "Transkrip nilai";
      setUploadMsg(`${label} berhasil diunggah.`);
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
        <p className="text-muted">Memuat profil...</p>
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

  const inputCls = "input";

  const docCard = (
    kind: DocKind,
    title: string,
    hint: string,
    url: string,
    accept: string,
    ref: React.RefObject<HTMLInputElement | null>,
    icon: React.ReactNode
  ) => (
    <div className="rounded-xl bg-white p-4 ring-1 ring-line">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info-bg text-brand-text">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">{title}</p>
          <p className="text-xs text-muted">{hint}</p>
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-text hover:underline">
              <IconEye className="h-4 w-4" /> Lihat dokumen
            </a>
          ) : (
            <p className="mt-1 text-xs font-medium text-slate-400">Belum diunggah</p>
          )}
        </div>
      </div>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => upload(kind, e.target.files?.[0])} />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading === kind}
        className="btn-action mt-3 w-full !py-2.5"
      >
        <IconUpload className="h-4 w-4" />
        {uploading === kind ? "Mengunggah..." : url ? `Ganti ${title}` : `Unggah ${title}`}
      </button>
      {url && (
        <a href={url} download target="_blank" rel="noopener noreferrer" className="btn-secondary mt-2 w-full !py-2.5">
          <IconDownload className="h-4 w-4" />
          Unduh
        </a>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <LoadingOverlay show={saving || uploading !== null} message={uploading ? "Mengunggah..." : "Menyimpan..."} />
      <p className="eyebrow">Profil Saya</p>
      <h1 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">Profil Saya</h1>
      <p className="mt-1 text-sm text-muted">
        Lengkapi data diri, riwayat pengalaman, dan dokumen. HR melihat semua ini saat menilai lamaranmu.
      </p>

      {error && (
        <p className="mt-4 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger-text">
          {error}
        </p>
      )}
      {savedMsg && (
        <p className="mt-4 rounded-xl bg-success-bg px-4 py-3 text-sm font-medium text-success-text">
          {savedMsg}
        </p>
      )}
      {uploadMsg && (
        <p className="mt-4 rounded-xl bg-success-bg px-4 py-3 text-sm font-medium text-success-text">
          {uploadMsg}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Data diri */}
        <form onSubmit={(e) => saveProfile(e)} className="card h-fit p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <IconUser className="h-5 w-5 text-brand-text" />
            Data diri
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-700">Nama lengkap</label>
              <input id="name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-slate-700">No. HP / WhatsApp</label>
                <input id="phone" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
              </div>
              <div>
                <label htmlFor="education" className="mb-1.5 block text-sm font-semibold text-slate-700">Pendidikan terakhir</label>
                <input id="education" className={inputCls} value={education} onChange={(e) => setEducation(e.target.value)} placeholder="cth: S1 Teknik Informatika" />
              </div>
            </div>
            <div>
              <label htmlFor="address" className="mb-1.5 block text-sm font-semibold text-slate-700">Alamat</label>
              <input id="address" className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Kota / Kabupaten" />
            </div>
            <div>
              <label htmlFor="experience" className="mb-1.5 block text-sm font-semibold text-slate-700">Ringkasan pengalaman</label>
              <textarea
                id="experience"
                rows={4}
                className={inputCls}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Tulis pengalaman kerja / magang singkat, atau tulis 'Fresh graduate' bila belum ada."
              />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-action mt-5 w-full !py-3 sm:w-auto sm:!px-6">
            {saving ? "Menyimpan..." : "Simpan profil"}
          </button>
          <p className="mt-3 text-xs text-muted">Email terdaftar: {profile.email}</p>
        </form>

        {/* Dokumen */}
        <div className="card h-fit p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <IconFileText className="h-5 w-5 text-brand-text" />
            Dokumen
          </h2>
          <p className="mt-1 text-xs text-muted">Dokumen tersimpan di Cloudinary dan bisa diunduh HR.</p>

          {/* Foto */}
          <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-line">
            <div className="flex items-center gap-3">
              {profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photoUrl} alt="Foto profil" className="h-16 w-16 rounded-full object-cover ring-2 ring-line" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-info-bg text-slate-400">
                  <IconUser className="h-8 w-8" />
                </span>
              )}
              <div>
                <p className="text-sm font-bold text-ink">Foto profil</p>
                <p className="text-xs text-muted">JPG/PNG, maks. 2 MB</p>
              </div>
            </div>
            <input ref={photoInput} type="file" accept="image/*" className="hidden" onChange={(e) => upload("foto", e.target.files?.[0])} />
            <button type="button" onClick={() => photoInput.current?.click()} disabled={uploading === "foto"} className="btn-secondary mt-3 w-full !py-2.5">
              <IconUpload className="h-4 w-4" />
              {uploading === "foto" ? "Mengunggah..." : profile.photoUrl ? "Ganti foto" : "Unggah foto"}
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {docCard("cv", "CV", "PDF, maks. 5 MB", profile.cvUrl, "application/pdf", cvInput, <IconFileText className="h-5 w-5" />)}
            {docCard("ijazah", "Ijazah", "PDF / gambar, maks. 5 MB", profile.ijazahUrl, "application/pdf,image/*", ijazahInput, <IconGraduation className="h-5 w-5" />)}
            {docCard("transkrip", "Transkrip Nilai", "PDF / gambar, maks. 5 MB", profile.transcriptUrl, "application/pdf,image/*", transkripInput, <IconFileText className="h-5 w-5" />)}
          </div>
        </div>
      </div>

      {/* Riwayat Pengalaman */}
      <div className="card mt-6 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-ink">
          <IconBriefcase className="h-5 w-5 text-brand-text" />
          Riwayat Pengalaman
        </h2>
        <p className="mt-1 text-xs text-muted">
          Tambahkan pengalaman kerja / magang. HR melihat daftar ini di detail pelamar dan di export Excel.
        </p>

        {experiences.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line bg-[#f8f5ff] px-4 py-3 text-sm text-muted">
            Belum ada riwayat pengalaman. Tambahkan lewat form di bawah.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {experiences.map((exp) => (
              <li key={exp.id} className="flex items-start justify-between gap-3 rounded-xl bg-white p-4 ring-1 ring-line">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">
                    {exp.position || "-"} <span className="font-medium text-muted">di</span> {exp.company || "-"}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                    <IconCalendar className="h-4 w-4" /> {formatPeriod(exp)}
                  </p>
                  {exp.description && (
                    <p className="mt-1 whitespace-pre-line text-sm text-muted">{exp.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => deleteExperience(exp.id)}
                  className="btn-danger-soft shrink-0 !px-2.5"
                  aria-label="Hapus pengalaman"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Form tambah pengalaman */}
        <form onSubmit={addExperience} className="mt-5 rounded-xl bg-[#f8f5ff] p-4 ring-1 ring-line">
          <p className="text-sm font-bold text-ink">Tambah pengalaman</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="expCompany" className="mb-1.5 block text-sm font-semibold text-slate-700">Nama perusahaan</label>
              <input id="expCompany" className={inputCls} value={expCompany} onChange={(e) => setExpCompany(e.target.value)} placeholder="cth: PT Maju Bersama" />
            </div>
            <div>
              <label htmlFor="expPosition" className="mb-1.5 block text-sm font-semibold text-slate-700">Jabatan / posisi</label>
              <input id="expPosition" className={inputCls} value={expPosition} onChange={(e) => setExpPosition(e.target.value)} placeholder="cth: Staff Administrasi" />
            </div>
            <div>
              <label htmlFor="expStart" className="mb-1.5 block text-sm font-semibold text-slate-700">Tanggal mulai</label>
              <input id="expStart" type="month" className={inputCls} value={expStart} onChange={(e) => setExpStart(e.target.value)} />
            </div>
            <div>
              <label htmlFor="expEnd" className="mb-1.5 block text-sm font-semibold text-slate-700">Tanggal selesai</label>
              <input
                id="expEnd"
                type="month"
                className={inputCls}
                value={expEnd}
                onChange={(e) => setExpEnd(e.target.value)}
                disabled={expCurrent}
              />
              <label className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={expCurrent} onChange={(e) => setExpCurrent(e.target.checked)} className="h-4 w-4 accent-[#d884db]" />
                Masih bekerja di sini
              </label>
            </div>
          </div>
          <div className="mt-3">
            <label htmlFor="expDesc" className="mb-1.5 block text-sm font-semibold text-slate-700">Deskripsi singkat (opsional)</label>
            <textarea id="expDesc" rows={2} className={inputCls} value={expDesc} onChange={(e) => setExpDesc(e.target.value)} placeholder="cth: Mengelola dokumen dan arsip perusahaan." />
          </div>
          {expError && <p className="mt-3 text-sm font-medium text-danger-text">{expError}</p>}
          <button type="submit" disabled={saving} className="btn-action mt-4 !py-2.5">
            <IconPlus className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Tambah pengalaman"}
          </button>
        </form>
      </div>
    </div>
  );
}

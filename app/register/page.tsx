"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconBriefcase } from "@/components/icons";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak sama");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const j = (await res.json()) as { ok: boolean; error?: string };
      if (!j.ok) {
        setError(j.error ?? "Pendaftaran gagal");
        return;
      }
      router.push("/login");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12 sm:px-6">
      <LoadingOverlay show={loading} message="Mendaftar..." />
      <div className="card-solid w-full p-6 shadow-xl sm:p-8">
        <span className="grad-primary flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md shadow-brand/30">
          <IconBriefcase className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-ink">Daftar akun baru</h1>
        <p className="mt-1 text-sm text-muted">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-brand-text hover:underline">
            Masuk di sini
          </Link>
        </p>
        <p className="mt-2 text-sm text-muted">
          Pendaftaran ini untuk <span className="font-bold text-ink">pelamar</span>. Akun HR dibuat
          oleh admin, bukan dari halaman ini.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Nama lengkap
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Anda"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="input"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 karakter"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Ulangi password
              </label>
              <input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Ulangi password"
                className="input"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger-text">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-action w-full !py-3">
            {loading ? "Memproses..." : "Buat akun"}
          </button>
        </form>
      </div>
    </div>
  );
}

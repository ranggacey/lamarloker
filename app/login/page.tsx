"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconBriefcase, IconMail } from "@/components/icons";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = (await res.json()) as { ok: boolean; error?: string; data?: { user: { role: string } } };
      if (!j.ok) {
        setError(j.error ?? "Login gagal");
        return;
      }
      const role = j.data?.user.role;
      router.push(role === "hr" ? "/hr" : "/dashboard");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12 sm:px-6">
      <LoadingOverlay show={loading} message="Masuk..." />
      <div className="card-solid w-full p-6 shadow-xl sm:p-8">
        <span className="grad-primary flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md shadow-brand/30">
          <IconBriefcase className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-ink">Masuk ke LamarLoker</h1>
        <p className="mt-1 text-sm text-muted">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-brand-text hover:underline">
            Daftar di sini
          </Link>
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Email
            </label>
            <div className="relative">
              <IconMail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="input !pl-10"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password Anda"
              className="input"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger-text">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-action w-full !py-3">
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}

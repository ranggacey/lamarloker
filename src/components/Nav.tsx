"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { IconBriefcase, IconLogOut, IconMenu, IconUser, IconUsers, IconX } from "@/components/icons";

interface MeUser {
  id: string;
  name: string;
  email: string;
  role: "pelamar" | "hr";
  status: string;
}

export default function Nav() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (alive && j?.ok) setUser(j.data.user as MeUser);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  }

  const home = user?.role === "hr" ? "/hr" : "/dashboard";
  const linkCls = (href: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium ${
      pathname === href ? "bg-brand-bg text-brand-text" : "text-slate-600 hover:bg-brand-bg hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
            <IconBriefcase className="h-5 w-5" />
          </span>
          LamarLoker
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/" className={linkCls("/")}>
            Beranda
          </Link>
          {loaded && user && user.role === "pelamar" && (
            <Link href="/dashboard" className={linkCls("/dashboard")}>
              Dashboard
            </Link>
          )}
          {loaded && user && user.role === "hr" && (
            <Link href="/hr" className={linkCls("/hr")}>
              Dashboard HR
            </Link>
          )}
          {loaded && !user && (
            <>
              <Link href="/login" className={linkCls("/login")}>
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Daftar
              </Link>
            </>
          )}
          {loaded && user && (
            <div className="ml-2 flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full bg-brand-bg px-3 py-1.5 text-xs font-medium text-slate-700 lg:inline-flex">
                {user.role === "hr" ? <IconUsers className="h-4 w-4" /> : <IconUser className="h-4 w-4" />}
                {user.name}
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-brand-bg"
              >
                <IconLogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          )}
        </nav>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-brand-bg md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <IconX className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <Link href="/" className={linkCls("/")} onClick={() => setOpen(false)}>
              Beranda
            </Link>
            {user && user.role === "pelamar" && (
              <Link href="/dashboard" className={linkCls("/dashboard")} onClick={() => setOpen(false)}>
                Dashboard
              </Link>
            )}
            {user && user.role === "hr" && (
              <Link href="/hr" className={linkCls("/hr")} onClick={() => setOpen(false)}>
                Dashboard HR
              </Link>
            )}
            {!user && loaded && (
              <>
                <Link href="/login" className={linkCls("/login")} onClick={() => setOpen(false)}>
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => setOpen(false)}
                >
                  Daftar
                </Link>
              </>
            )}
            {user && (
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="mt-1 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700"
              >
                <IconLogOut className="h-4 w-4" />
                Keluar ({user.name})
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

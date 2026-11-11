"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { IconBriefcase, IconLogOut, IconUser, IconUsers } from "@/components/icons";

interface MeUser {
  id: string;
  name: string;
  email: string;
  role: "pelamar" | "hr";
  status: string;
}

interface NavLink {
  href: string;
  label: string;
}

const pelamarLinks: NavLink[] = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/lowongan", label: "Lamar Pekerjaan" },
  { href: "/profil", label: "Profil Saya" },
];

const hrLinks: NavLink[] = [
  { href: "/hr", label: "Dashboard" },
  { href: "/hr/lowongan", label: "Kelola Lowongan" },
];

const guestLinks: NavLink[] = [
  { href: "/", label: "Beranda" },
  { href: "/lowongan", label: "Lamar Pekerjaan" },
];

export default function Nav() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loaded, setLoaded] = useState(false);
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

  const links = !loaded ? guestLinks : user?.role === "hr" ? hrLinks : user ? pelamarLinks : guestLinks;
  const home = user?.role === "hr" ? "/hr" : "/dashboard";

  const linkCls = (href: string) => {
    const active = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
    return active
      ? "shrink-0 rounded-lg border-2 border-slate-900 bg-slate-900 px-3 py-1.5 text-sm font-bold text-white shadow-[2px_2px_0_#fa699e]"
      : "shrink-0 rounded-lg border-2 border-transparent px-3 py-1.5 text-sm font-bold text-slate-700 hover:border-slate-900 hover:bg-brand-bg";
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-slate-900 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link href={user ? home : "/"} className="flex shrink-0 items-center gap-2 text-lg font-black tracking-tight text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-slate-900 bg-brand text-white shadow-[2px_2px_0_#0f172a]">
            <IconBriefcase className="h-5 w-5" />
          </span>
          LamarLoker
        </Link>

        {/* Desktop: link nav di bar atas */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkCls(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {loaded && !user && (
            <>
              <Link href="/login" className="btn-brutal-white !px-3 !py-1.5">
                Masuk
              </Link>
              <Link href="/register" className="btn-brutal !px-3 !py-1.5">
                Daftar
              </Link>
            </>
          )}
          {loaded && user && (
            <>
              <span className="hidden items-center gap-1.5 rounded-full border-2 border-slate-900 bg-brand-bg px-3 py-1.5 text-xs font-bold text-slate-900 lg:inline-flex">
                {user.role === "hr" ? <IconUsers className="h-4 w-4" /> : <IconUser className="h-4 w-4" />}
                {user.name}
              </span>
              <button onClick={logout} className="btn-brutal-white !px-3 !py-1.5">
                <IconLogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile: link nav sebagai strip yang bisa di-scroll horizontal */}
      <nav className="flex gap-1 overflow-x-auto border-t-2 border-slate-900 bg-brand-bg px-4 py-2 md:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={linkCls(l.href)}>
            {l.label}
          </Link>
        ))}
        {loaded && user && (
          <span className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg border-2 border-slate-900 bg-white px-3 py-1.5 text-xs font-bold text-slate-900">
            {user.role === "hr" ? <IconUsers className="h-4 w-4" /> : <IconUser className="h-4 w-4" />}
            {user.name}
          </span>
        )}
      </nav>
    </header>
  );
}

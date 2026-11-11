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
  const [menuOpen, setMenuOpen] = useState(false);
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

  // Tutup menu mobile setiap pindah halaman.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMenuOpen(false);
    router.push("/login");
    router.refresh();
  }

  const links = !loaded ? guestLinks : user?.role === "hr" ? hrLinks : user ? pelamarLinks : guestLinks;
  const home = user?.role === "hr" ? "/hr" : "/dashboard";

  const linkCls = (href: string) => {
    const active = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
    return active
      ? "shrink-0 rounded-full bg-white px-3.5 py-1.5 text-sm font-bold text-brand-deep shadow-sm"
      : "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/15 hover:text-white";
  };

  const mobileLinkCls = (href: string) => {
    const active = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
    return active
      ? "block rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-deep shadow-sm"
      : "block rounded-xl px-4 py-2.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/15 hover:text-white";
  };

  return (
    <header className="grad-header sticky top-0 z-40 rounded-b-3xl shadow-[0_8px_30px_rgba(139,92,246,0.25)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link href={user ? home : "/"} className="flex min-w-0 shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight text-white">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white ring-1 ring-white/40">
            <IconBriefcase className="h-5 w-5" />
          </span>
          {/* Di layar sangat sempit (<400px) hanya ikon yang tampil supaya tidak terpotong. */}
          <span className="hidden min-[400px]:inline">LamarLoker</span>
        </Link>

        {/* Desktop: link nav di bar atas */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkCls(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop: aksi kanan */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          {loaded && !user && (
            <>
              <Link
                href="/login"
                className="rounded-xl bg-white px-3.5 py-2 text-sm font-bold text-brand-deep shadow-sm transition-all hover:-translate-y-px hover:shadow"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-gold px-3.5 py-2 text-sm font-bold text-ink shadow-sm transition-all hover:-translate-y-px hover:shadow"
              >
                Daftar
              </Link>
            </>
          )}
          {loaded && user && (
            <>
              <span className="hidden items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/30 lg:inline-flex">
                {user.role === "hr" ? <IconUsers className="h-4 w-4" /> : <IconUser className="h-4 w-4" />}
                {user.name}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 text-sm font-bold text-white ring-1 ring-white/30 transition-colors hover:bg-white/30"
              >
                <IconLogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile: tombol hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white ring-1 ring-white/30 transition-colors hover:bg-white/30 md:hidden"
        >
          {menuOpen ? <IconX className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile: panel menu (bukan strip scroll — tidak ada yang terpotong) */}
      {menuOpen && (
        <nav className="border-t border-white/20 px-4 pb-4 pt-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={mobileLinkCls(l.href)}>
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 border-t border-white/20 pt-3">
            {loaded && !user && (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 rounded-xl bg-white px-3.5 py-2.5 text-center text-sm font-bold text-brand-deep shadow-sm"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="flex-1 rounded-xl bg-gold px-3.5 py-2.5 text-center text-sm font-bold text-ink shadow-sm"
                >
                  Daftar
                </Link>
              </div>
            )}
            {loaded && user && (
              <div className="flex items-center gap-2">
                <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-white/20 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/30">
                  {user.role === "hr" ? <IconUsers className="h-4 w-4 shrink-0" /> : <IconUser className="h-4 w-4 shrink-0" />}
                  <span className="truncate">{user.name}</span>
                </span>
                <button
                  onClick={logout}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white/20 px-3.5 py-2 text-sm font-bold text-white ring-1 ring-white/30 transition-colors hover:bg-white/30"
                >
                  <IconLogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

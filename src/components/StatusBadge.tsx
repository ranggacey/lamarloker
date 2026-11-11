import type { ReactNode } from "react";

export type BadgeStatus = "lulus" | "tidak lolos" | "baru" | "proses";

const styles: Record<BadgeStatus, string> = {
  lulus: "bg-success text-slate-900",
  "tidak lolos": "bg-danger text-white",
  proses: "bg-amber-300 text-slate-900",
  baru: "bg-brand-light text-slate-900",
};

const dots: Record<BadgeStatus, string> = {
  lulus: "bg-slate-900",
  "tidak lolos": "bg-white",
  proses: "bg-slate-900",
  baru: "bg-slate-900",
};

export function StatusBadge({ status, children }: { status: BadgeStatus; children?: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-slate-900 px-2.5 py-0.5 text-xs font-bold shadow-[2px_2px_0_#0f172a] ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {children ?? status}
    </span>
  );
}

/** Badge skor tes: hijau kalau >= 70 (lulus), merah kalau < 70. */
export function ScoreBadge({ score }: { score: number }) {
  const status: BadgeStatus = score >= 70 ? "lulus" : "tidak lolos";
  return <StatusBadge status={status}>{`${score} · ${status}`}</StatusBadge>;
}

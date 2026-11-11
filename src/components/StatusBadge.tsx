import type { ReactNode } from "react";

export type BadgeStatus = "lulus" | "tidak lolos" | "baru" | "proses";

const styles: Record<BadgeStatus, string> = {
  lulus: "bg-success-bg text-success-text ring-success/20",
  "tidak lolos": "bg-danger-bg text-danger-text ring-danger/20",
  proses: "bg-amber-50 text-amber-700 ring-amber-600/20",
  baru: "bg-brand-bg text-brand-text ring-brand/20",
};

const dots: Record<BadgeStatus, string> = {
  lulus: "bg-success",
  "tidak lolos": "bg-danger",
  proses: "bg-amber-500",
  baru: "bg-brand-light",
};

export function StatusBadge({ status, children }: { status: BadgeStatus; children?: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}
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

import type { ReactNode } from "react";

export type BadgeStatus = "lulus" | "tidak lolos" | "baru" | "proses";

const styles: Record<BadgeStatus, string> = {
  lulus: "bg-success-bg text-success-text",
  "tidak lolos": "bg-danger-bg text-danger-text",
  proses: "bg-warning-bg text-warning-text",
  baru: "bg-info-bg text-info-text",
};

const dots: Record<BadgeStatus, string> = {
  lulus: "bg-success",
  "tidak lolos": "bg-danger",
  proses: "bg-warning",
  baru: "bg-info",
};

export function StatusBadge({ status, children }: { status: BadgeStatus; children?: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
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

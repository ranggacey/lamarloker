"use client";

import Link from "next/link";
import { IconArrowRight, IconBriefcase, IconCheck, IconCheckCircle, IconClock, IconXCircle } from "@/components/icons";
import { StatusBadge, ScoreBadge } from "@/components/StatusBadge";

export type TrackerStatus = "baru" | "proses" | "lulus" | "tidak lolos";

export interface TrackerJob {
  id: string;
  title: string;
  division: string;
}

export interface TrackerScore {
  type: string;
  score: number;
}

const statusLabel: Record<TrackerStatus, string> = {
  baru: "Baru Daftar",
  proses: "Proses",
  lulus: "Lolos",
  "tidak lolos": "Tidak Lolos",
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

type StepState = "done" | "current" | "todo";

function Step({
  state,
  n,
  title,
  sub,
  last,
}: {
  state: StepState;
  n: number;
  title: string;
  sub: string;
  last?: boolean;
}) {
  return (
    <div className="flex flex-1 items-start">
      <div className="flex flex-col items-center">
        <span
          className={
            state === "done"
              ? "grad-primary flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md shadow-brand/30"
              : state === "current"
                ? "flex h-9 w-9 items-center justify-center rounded-full border-2 border-gold bg-white text-warning-text shadow-sm"
                : "flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-400"
          }
        >
          {state === "done" ? <IconCheck className="h-5 w-5" /> : n}
        </span>
        <p className={`mt-2 text-center text-xs font-bold ${state === "todo" ? "text-slate-400" : "text-ink"}`}>
          {title}
        </p>
        <p className="mt-0.5 max-w-[110px] text-center text-[11px] leading-tight text-muted">{sub}</p>
      </div>
      {!last && (
        <div
          className={`mx-2 mt-[17px] h-0.5 flex-1 rounded-full ${state === "done" ? "grad-primary" : "bg-slate-200"}`}
        />
      )}
    </div>
  );
}

/**
 * Pelacak lamaran untuk satu posisi yang dilamar — dipakai di dashboard
 * pelamar dan di halaman detail HR. Menampilkan posisi, status lamaran,
 * alur Daftar -> Interview -> Hasil, skor tes, dan hasil akhir yang
 * ditentukan skor interview (>= 70 lolos, <= 69 tidak lolos).
 */
export default function ApplicationTracker({
  appliedJob,
  appliedAt,
  status,
  scores,
  context,
}: {
  appliedJob: TrackerJob | null;
  appliedAt: string | null;
  status: TrackerStatus;
  scores: TrackerScore[];
  context: "pelamar" | "hr";
}) {
  const interview = scores.find((s) => s.type === "interview");
  const psikotes = scores.find((s) => s.type === "psikotes");

  if (!appliedJob) {
    return (
      <div className="card p-5 sm:p-6">
        <p className="eyebrow">Posisi yang Dilamar</p>
        {context === "pelamar" ? (
          <>
            <p className="mt-3 text-sm text-muted">
              Kamu belum memilih posisi. Yuk, lihat lowongan yang sedang buka dan lamar posisi yang kamu
              mau.
            </p>
            <Link href="/lowongan" className="btn-action mt-4">
              Lamar Pekerjaan <IconArrowRight className="h-4 w-4" />
            </Link>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted">Pelamar belum memilih posisi.</p>
        )}
      </div>
    );
  }

  const interviewDone = !!interview;
  const resultDone = status === "lulus" || status === "tidak lolos";
  const result: "lulus" | "tidak lolos" | null = interview
    ? interview.score >= 70
      ? "lulus"
      : "tidak lolos"
    : null;

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Posisi yang Dilamar</p>
          <h2 className="mt-2 flex items-center gap-2 text-lg font-extrabold text-ink">
            <IconBriefcase className="h-5 w-5 text-brand-text" />
            {appliedJob.title}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {appliedJob.division || "—"}
            {appliedAt ? ` · Dilamar ${formatDate(appliedAt)}` : ""}
          </p>
        </div>
        <StatusBadge status={status}>{statusLabel[status]}</StatusBadge>
      </div>

      {/* Alur lamaran */}
      <div className="mt-6 flex">
        <Step
          state="done"
          n={1}
          title="Daftar"
          sub={appliedAt ? `Lamaran masuk ${formatDate(appliedAt)}` : "Lamaran masuk"}
        />
        <Step
          state={interviewDone ? "done" : "current"}
          n={2}
          title="Interview"
          sub={interviewDone ? `Skor ${interview.score}` : "Menunggu skor interview"}
        />
        <Step
          state={resultDone ? "done" : "todo"}
          n={3}
          title="Hasil"
          sub={
            resultDone
              ? status === "lulus"
                ? "Dinyatakan lulus"
                : "Dinyatakan tidak lolos"
              : "Menunggu hasil seleksi"
          }
          last
        />
      </div>

      {/* Skor tes */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-4 ring-1 ring-line">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Skor Interview</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            {interview ? (
              <>
                <span className="text-2xl font-extrabold text-ink">{interview.score}</span>
                <ScoreBadge score={interview.score} />
              </>
            ) : (
              <span className="text-sm text-slate-400">Belum ada skor</span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted">Penentu utama kelulusan (≥ 70 lolos).</p>
        </div>
        <div className="rounded-xl bg-white p-4 ring-1 ring-line">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Skor Psikotes</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            {psikotes ? (
              <>
                <span className="text-2xl font-extrabold text-ink">{psikotes.score}</span>
                <ScoreBadge score={psikotes.score} />
              </>
            ) : (
              <span className="text-sm text-slate-400">Belum ada skor</span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted">Skor pendukung, tidak mengubah status.</p>
        </div>
      </div>

      {/* Banner hasil */}
      {result === "lulus" ? (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-success-bg px-4 py-3 text-sm font-semibold text-success-text">
          <IconCheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
          Selamat! Kamu dinyatakan LOLOS untuk posisi {appliedJob.title} (skor interview{" "}
          {interview!.score} ≥ 70).
        </p>
      ) : result === "tidak lolos" ? (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-danger-bg px-4 py-3 text-sm font-semibold text-danger-text">
          <IconXCircle className="mt-0.5 h-5 w-5 shrink-0" />
          Mohon maaf, kamu dinyatakan TIDAK LOLOS untuk posisi {appliedJob.title} (skor interview{" "}
          {interview!.score} &lt; 70).
        </p>
      ) : (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-info-bg px-4 py-3 text-sm font-medium text-info-text">
          <IconClock className="mt-0.5 h-5 w-5 shrink-0" />
          Menunggu hasil interview. HR akan menginput skor setelah kamu mengikuti tes.
        </p>
      )}
    </div>
  );
}

"use client";

import { IconCheck } from "@/components/icons";

export type StatusValue = "baru" | "proses" | "lulus" | "tidak lolos";

export interface StatusSegmentedOption {
  value: StatusValue;
  label: string;
}

interface StatusSegmentedProps {
  value: StatusValue;
  onChange: (value: StatusValue) => void;
  options?: StatusSegmentedOption[];
  ariaLabel?: string;
  disabled?: boolean;
}

const META: Record<
  StatusValue,
  { dot: string; selectedBg: string; selectedText: string; selectedRing: string }
> = {
  baru: {
    dot: "bg-info",
    selectedBg: "bg-info-bg",
    selectedText: "text-info-text",
    selectedRing: "ring-info",
  },
  proses: {
    dot: "bg-warning",
    selectedBg: "bg-warning-bg",
    selectedText: "text-warning-text",
    selectedRing: "ring-warning",
  },
  lulus: {
    dot: "bg-success",
    selectedBg: "bg-success-bg",
    selectedText: "text-success-text",
    selectedRing: "ring-success",
  },
  "tidak lolos": {
    dot: "bg-danger",
    selectedBg: "bg-danger-bg",
    selectedText: "text-danger-text",
    selectedRing: "ring-danger",
  },
};

export const DEFAULT_STATUS_OPTIONS: StatusSegmentedOption[] = [
  { value: "baru", label: "Baru Daftar" },
  { value: "proses", label: "Proses" },
  { value: "lulus", label: "Lolos" },
  { value: "tidak lolos", label: "Tidak Lolos" },
];

/**
 * Pemilih status ala segmented control — pill berwarna, bukan <select>.
 * Dipakai di halaman detail HR untuk mengubah status pelamar.
 * Bisa dipakai keyboard (tombol radio semantik).
 */
export default function StatusSegmented({
  value,
  onChange,
  options = DEFAULT_STATUS_OPTIONS,
  ariaLabel = "Pilih status pelamar",
  disabled = false,
}: StatusSegmentedProps) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid grid-cols-2 gap-2"
    >
      {options.map((o) => {
        const meta = META[o.value];
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
              selected
                ? `${meta.selectedBg} ${meta.selectedText} ring-2 ${meta.selectedRing} shadow-sm`
                : "bg-white text-slate-600 ring-1 ring-line hover:bg-[#fbf7ff] hover:text-ink hover:ring-brand/50"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} />
            <span className="truncate">{o.label}</span>
            {selected && <IconCheck className="h-4 w-4 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

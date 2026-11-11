"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { IconCheck } from "@/components/icons";

export interface CustomSelectOption {
  value: string;
  label: string;
  /** Warna dot (hex) di depan label — mis. untuk opsi status. */
  color?: string;
}

interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  /** Ikon kecil di kiri tombol (mis. ikon filter). */
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * Dropdown custom pengganti <select> bawaan browser.
 * Tombol + menu (listbox) dengan chevron, dot warna opsional, hover ungu
 * lembut, tanpa highlight biru bawaan browser. Bisa dipakai keyboard:
 * Enter/Space/ArrowDown membuka, ArrowUp/ArrowDown pindah opsi,
 * Enter memilih, Escape menutup.
 */
export default function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  ariaLabel,
  icon,
  className = "",
  disabled = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selected = options.find((o) => o.value === value);

  // Tutup saat klik di luar / tekan Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  // Saat dibuka, sorot opsi yang sedang terpilih.
  useEffect(() => {
    if (open) {
      const idx = options.findIndex((o) => o.value === value);
      setHighlight(idx >= 0 ? idx : 0);
    }
  }, [open, options, value]);

  // Fokus ke opsi yang disorot saat navigasi keyboard.
  useEffect(() => {
    if (open && highlight >= 0) {
      optionRefs.current[highlight]?.focus();
    }
  }, [open, highlight]);

  function choose(v: string) {
    onChange(v);
    setOpen(false);
    btnRef.current?.focus();
  }

  function onBtnKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
    }
  }

  function onListKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(options.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (highlight >= 0) choose(options[highlight].value);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={btnRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onBtnKeyDown}
        className="input flex w-full cursor-pointer items-center gap-2 !py-2.5 text-left"
      >
        {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
        {selected?.color && (
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: selected.color }} />
        )}
        <span className={`min-w-0 flex-1 truncate font-medium ${selected ? "text-ink" : "text-slate-400"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel ?? "Pilihan"}
          onKeyDown={onListKeyDown}
          className="absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-line bg-white p-1.5 shadow-[0_16px_40px_rgba(109,72,181,0.18)]"
        >
          {options.map((o, i) => {
            const isSelected = o.value === value;
            const isHighlighted = i === highlight;
            return (
              <button
                key={o.value}
                ref={(el) => {
                  optionRefs.current[i] = el;
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => choose(o.value)}
                onMouseEnter={() => setHighlight(i)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  isSelected
                    ? "bg-[#f6f0ff] font-bold text-brand-text"
                    : isHighlighted
                      ? "bg-[#fbf7ff] font-medium text-ink"
                      : "font-medium text-slate-700"
                }`}
              >
                {o.color ? (
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: o.color }} />
                ) : (
                  <span className="h-2.5 w-2.5 shrink-0" />
                )}
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                {isSelected && <IconCheck className="h-4 w-4 shrink-0 text-brand-text" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

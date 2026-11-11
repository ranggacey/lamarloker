"use client";

interface LoadingOverlayProps {
  /** Tampilkan overlay atau tidak. */
  show: boolean;
  /** Teks di bawah spinner, mis. "Menyimpan..." atau "Mengunggah...". */
  message?: string;
}

/**
 * Overlay loading di tengah layar — menutupi seluruh layar dengan backdrop
 * semi-transparan gelap + kartu soft neobrutalism berisi spinner dan pesan.
 * Dipakai saat menyimpan / mengunggah supaya user jelas prosesnya berjalan.
 */
export default function LoadingOverlay({ show, message = "Memproses..." }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="card-brutal flex w-full max-w-xs flex-col items-center px-6 py-8 text-center">
        <span
          className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-brand"
          aria-hidden="true"
        />
        <p className="mt-4 text-base font-black text-slate-900">{message}</p>
        <p className="mt-1 text-xs text-slate-500">Mohon tunggu sebentar...</p>
      </div>
    </div>
  );
}

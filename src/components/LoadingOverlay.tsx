"use client";

interface LoadingOverlayProps {
  /** Tampilkan overlay atau tidak. */
  show: boolean;
  /** Teks di bawah spinner, mis. "Menyimpan..." atau "Mengunggah...". */
  message?: string;
}

/**
 * Overlay loading di tengah layar — backdrop lembut + kartu putih membulat
 * dengan bayangan halus, berisi spinner dan pesan. Dipakai saat menyimpan /
 * mengunggah supaya user jelas prosesnya berjalan.
 */
export default function LoadingOverlay({ show, message = "Memproses..." }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 px-4 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="card-solid flex w-full max-w-xs flex-col items-center px-6 py-8 text-center shadow-xl">
        <span
          className="h-12 w-12 animate-spin rounded-full border-4 border-brand-light border-t-brand"
          aria-hidden="true"
        />
        <p className="mt-4 text-base font-bold text-ink">{message}</p>
        <p className="mt-1 text-xs text-muted">Mohon tunggu sebentar...</p>
      </div>
    </div>
  );
}

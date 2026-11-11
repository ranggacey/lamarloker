/** Aturan skor — PENTING: skor >= 70 lulus, skor <= 69 tidak lolos. */

export type TestStatus = "lulus" | "tidak lolos";

export function scoreStatus(score: number): TestStatus {
  return score >= 70 ? "lulus" : "tidak lolos";
}

export type ApplicantStatus = "baru" | "proses" | "lulus" | "tidak lolos";

/**
 * Status pelamar ditentukan oleh skor INTERVIEW — penentu utama
 * lolos/tidak lolos untuk posisi yang dilamar:
 * - skor interview >= 70 -> "lulus"
 * - skor interview <= 69 -> "tidak lolos"
 *
 * Skor psikotes TIDAK mengubah status pelamar.
 * Status "baru" (baru daftar/lamar) adalah nilai awal, dan "proses"
 * (sedang dalam proses seleksi) diisi manual oleh HR — keduanya bisa
 * diubah manual oleh HR lewat endpoint PATCH pelamar. Kalau skor
 * interview diubah, status ikut diperbarui sesuai skor terbaru.
 *
 * Skor terikat ke LAMARAN (per posisi yang dilamar), bukan ke pelamar:
 * TestScore punya field `job` (posisi yang dinilai). Melamar posisi baru
 * mereset status ke "baru" dan menghapus skor untuk posisi itu, jadi skor
 * lamaran lama tidak terbawa ke lamaran baru.
 */

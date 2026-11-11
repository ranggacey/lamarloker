/** Aturan skor — PENTING: skor >= 70 lulus, skor <= 69 tidak lolos. */

export type TestStatus = "lulus" | "tidak lolos";

export function scoreStatus(score: number): TestStatus {
  return score >= 70 ? "lulus" : "tidak lolos";
}

export type ApplicantStatus = "baru" | "proses" | "lulus" | "tidak lolos";

/**
 * Status pelamar dari skor-skor tesnya:
 * - belum ada skor            -> "baru"
 * - ada skor yang tidak lolos  -> "tidak lolos"
 * - interview + psikotes lulus -> "lulus"
 * - selain itu                 -> "proses"
 */
export function applicantStatusFromScores(scores: { type: string; status: TestStatus }[]): ApplicantStatus {
  if (scores.length === 0) return "baru";
  if (scores.some((s) => s.status === "tidak lolos")) return "tidak lolos";
  const types = new Set(scores.map((s) => s.type));
  if (types.has("interview") && types.has("psikotes")) return "lulus";
  return "proses";
}

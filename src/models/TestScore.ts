import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { TestStatus } from "@/lib/score";

export type TestType = "interview" | "psikotes";

export interface ITestScore extends Document {
  applicant: mongoose.Types.ObjectId;
  /** Lamaran/posisi yang dinilai. Skor terikat ke SATU lamaran: pelamar
      yang melamar posisi baru mulai dari nol (skor lamaran lama tidak
      terbawa). Null untuk record lama (sebelum field ini ada) atau pelamar
      yang belum melamar posisi apa pun. */
  job?: mongoose.Types.ObjectId | null;
  type: TestType;
  score: number;
  status: TestStatus;
  note?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TestScoreSchema = new Schema<ITestScore>(
  {
    applicant: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    job: { type: Schema.Types.ObjectId, ref: "Job", default: null, index: true },
    type: { type: String, enum: ["interview", "psikotes"], required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    status: { type: String, enum: ["lulus", "tidak lolos"], required: true },
    note: { type: String, trim: true, maxlength: 500, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Satu skor terbaru per (pelamar, lamaran/posisi, jenis tes) — input ulang
// untuk lamaran yang sama menimpa skor lama; lamaran baru mulai bersih.
TestScoreSchema.index({ applicant: 1, job: 1, type: 1 }, { unique: true });

export const TestScore: Model<ITestScore> =
  mongoose.models.TestScore || mongoose.model<ITestScore>("TestScore", TestScoreSchema);

// Migrasi satu kali: hapus index unik lama {applicant, type} yang memaksa
// satu skor per pelamar tanpa membedakan lamaran. Kalau index itu tetap
// ada, skor untuk lamaran kedua akan gagal (duplicate key E11000).
// Abaikan error kalau index sudah tidak ada / belum pernah dibuat.
TestScore.collection.dropIndex("applicant_1_type_1").catch(() => undefined);

import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { TestStatus } from "@/lib/score";

export type TestType = "interview" | "psikotes";

export interface ITestScore extends Document {
  applicant: mongoose.Types.ObjectId;
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
    type: { type: String, enum: ["interview", "psikotes"], required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    status: { type: String, enum: ["lulus", "tidak lolos"], required: true },
    note: { type: String, trim: true, maxlength: 500, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Satu skor terbaru per (pelamar, jenis tes) — input ulang menimpa skor lama.
TestScoreSchema.index({ applicant: 1, type: 1 }, { unique: true });

export const TestScore: Model<ITestScore> =
  mongoose.models.TestScore || mongoose.model<ITestScore>("TestScore", TestScoreSchema);

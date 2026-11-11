import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { jsonOk, jsonError, handleError } from "@/lib/http";
import { scoreStatus } from "@/lib/score";
import { User } from "@/models/User";
import { TestScore, type TestType } from "@/models/TestScore";

/** Input / update skor tes pelamar (HR saja). Skor >= 70 = lulus.
    Skor INTERVIEW otomatis mengubah status pelamar (penentu lolos/tidak
    lolos untuk posisi yang dilamar); skor psikotes tidak mengubah status. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return jsonError("Belum login", 401);
    if (auth.role !== "hr") return jsonError("Hanya HR yang boleh menginput skor", 403);

    const { id } = await ctx.params;
    const body = (await req.json()) as { type?: string; score?: number; note?: string };
    const type = body.type as TestType;
    const score = Number(body.score);
    const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) : "";

    if (type !== "interview" && type !== "psikotes") {
      return jsonError("Jenis tes tidak valid (interview / psikotes)", 400);
    }
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      return jsonError("Skor harus angka 0–100", 400);
    }

    await connectDB();
    const applicant = await User.findOne({ _id: id, role: "pelamar" });
    if (!applicant) return jsonError("Pelamar tidak ditemukan", 404);

    // Skor terikat ke LAMARAN yang sedang berjalan (appliedJobId saat ini),
    // bukan ke pelamar secara umum — jadi skor lamaran lama tidak terbawa
    // saat pelamar melamar posisi baru.
    const jobId = applicant.appliedJobId ?? null;
    const status = scoreStatus(score);
    const saved = await TestScore.findOneAndUpdate(
      { applicant: applicant._id, job: jobId, type },
      { score, status, note, createdBy: auth.id, job: jobId },
      { upsert: true, new: true }
    );

    // Status pelamar ditentukan oleh skor INTERVIEW saja (penentu utama
    // lolos/tidak lolos). Skor psikotes tidak mengubah status.
    // HR tetap bisa mengubah status manual lewat endpoint PATCH pelamar.
    let applicantStatus = applicant.status;
    if (type === "interview") {
      applicantStatus = status;
      applicant.status = applicantStatus;
      await applicant.save();
    }

    return jsonOk({
      score: {
        id: String(saved._id),
        type: saved.type,
        score: saved.score,
        status: saved.status,
        note: saved.note ?? "",
        updatedAt: saved.updatedAt,
      },
      applicantStatus,
    });
  } catch (err) {
    return handleError(err);
  }
}

import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { jsonOk, jsonError, handleError } from "@/lib/http";
import { User } from "@/models/User";
import { Job } from "@/models/Job";

/** Lamar satu lowongan (pelamar saja). Boleh ganti lamaran ke posisi lain
    (appliedJobId ditimpa). Body: { jobId }. */
export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return jsonError("Belum login", 401);
    if (auth.role !== "pelamar") return jsonError("Hanya pelamar yang boleh melamar", 403);

    const body = (await req.json()) as { jobId?: string };
    const jobId = typeof body.jobId === "string" ? body.jobId.trim() : "";
    if (!jobId) return jsonError("Lowongan tidak dipilih", 400);

    await connectDB();
    const job = await Job.findById(jobId);
    if (!job) return jsonError("Lowongan tidak ditemukan", 404);
    if (job.status !== "buka") return jsonError("Lowongan ini sudah ditutup", 400);

    const user = await User.findByIdAndUpdate(
      auth.id,
      { appliedJobId: job._id, appliedAt: new Date() },
      { new: true }
    );
    if (!user) return jsonError("Pengguna tidak ditemukan", 401);

    return jsonOk({
      appliedJob: { id: String(job._id), title: job.title, division: job.division ?? "" },
      appliedAt: user.appliedAt,
    });
  } catch (err) {
    return handleError(err);
  }
}

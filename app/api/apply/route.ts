import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { jsonOk, jsonError, handleError } from "@/lib/http";
import { User } from "@/models/User";
import { Job } from "@/models/Job";
import { TestScore } from "@/models/TestScore";

/** Lamar satu lowongan (pelamar saja). Boleh ganti lamaran ke posisi lain
    (appliedJobId ditimpa). Skor terikat ke LAMARAN: melamar (baru atau
    ganti posisi) selalu mulai bersih — status kembali "baru" dan skor lama
    untuk posisi itu dihapus, jadi skor lamaran lama tidak terbawa ke
    lamaran baru. Body: { jobId }. */
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
      { appliedJobId: job._id, appliedAt: new Date(), status: "baru" },
      { new: true }
    );
    if (!user) return jsonError("Pengguna tidak ditemukan", 401);

    // Lamaran baru = mulai dari nol: hapus skor lama untuk posisi ini
    // (melamar ulang ke posisi yang sama juga bersih). Skor untuk posisi
    // lain tetap tersimpan di database tapi tidak ditampilkan, karena
    // semua pembacaan skor difilter ke appliedJobId saat ini.
    await TestScore.deleteMany({ applicant: user._id, job: job._id });

    return jsonOk({
      appliedJob: { id: String(job._id), title: job.title, division: job.division ?? "" },
      appliedAt: user.appliedAt,
    });
  } catch (err) {
    return handleError(err);
  }
}

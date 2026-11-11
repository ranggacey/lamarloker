import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { jsonOk, jsonError, handleError } from "@/lib/http";
import { User, type IExperience } from "@/models/User";
import { TestScore } from "@/models/TestScore";

/** Detail satu pelamar + riwayat skornya (HR saja). */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return jsonError("Belum login", 401);
    if (auth.role !== "hr") return jsonError("Hanya HR yang boleh melihat detail pelamar", 403);

    const { id } = await ctx.params;
    await connectDB();
    const user = await User.findOne({ _id: id, role: "pelamar" }).populate(
      "appliedJobId",
      "title division"
    );
    if (!user) return jsonError("Pelamar tidak ditemukan", 404);

    const scores = await TestScore.find({ applicant: user._id }).sort({ updatedAt: -1 }).lean();

    const job = user.appliedJobId as unknown as { _id?: unknown; title?: string; division?: string } | null;
    const appliedJob =
      job && typeof job === "object" && "title" in job
        ? { id: String(job._id ?? ""), title: job.title ?? "", division: job.division ?? "" }
        : null;

    return jsonOk({
      applicant: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        education: user.education ?? "",
        experience: user.experience ?? "",
        address: user.address ?? "",
        cvUrl: user.cvUrl ?? "",
        photoUrl: user.photoUrl ?? "",
        ijazahUrl: user.ijazahUrl ?? "",
        transcriptUrl: user.transcriptUrl ?? "",
        experiences: (user.experiences ?? []).map((e: IExperience) => ({
          id: String(e._id ?? ""),
          company: e.company ?? "",
          position: e.position ?? "",
          startDate: e.startDate ?? "",
          endDate: e.endDate ?? "",
          isCurrent: !!e.isCurrent,
          description: e.description ?? "",
        })),
        appliedJob,
        appliedAt: user.appliedAt ?? null,
        status: user.status,
        createdAt: user.createdAt,
      },
      scores: scores.map((s) => ({
        id: String(s._id),
        type: s.type,
        score: s.score,
        status: s.status,
        note: s.note ?? "",
        updatedAt: s.updatedAt,
      })),
    });
  } catch (err) {
    return handleError(err);
  }
}

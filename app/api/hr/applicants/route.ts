import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { jsonOk, jsonError, handleError } from "@/lib/http";
import { User } from "@/models/User";
import { TestScore } from "@/models/TestScore";

interface ScoreOut {
  type: string;
  score: number;
  status: string;
  updatedAt: Date;
}

/** Daftar semua pelamar (HR saja). Query: ?q=nama&status=lulus */
export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return jsonError("Belum login", 401);
    if (auth.role !== "hr") return jsonError("Hanya HR yang boleh melihat daftar pelamar", 403);

    const sp = req.nextUrl.searchParams;
    const q = (sp.get("q") ?? "").trim();
    const status = (sp.get("status") ?? "").trim();

    const filter: Record<string, unknown> = { role: "pelamar" };
    if (q) {
      filter.$or = [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }];
    }
    if (status && ["baru", "proses", "lulus", "tidak lolos"].includes(status)) {
      filter.status = status;
    }

    await connectDB();
    const users = await User.find(filter)
      .populate("appliedJobId", "title")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    const ids = users.map((u) => u._id);
    const scores = await TestScore.find({ applicant: { $in: ids } }).lean();

    const byApplicant = new Map<string, ScoreOut[]>();
    for (const s of scores) {
      const key = String(s.applicant);
      const arr = byApplicant.get(key) ?? [];
      arr.push({ type: s.type, score: s.score, status: s.status, updatedAt: s.updatedAt });
      byApplicant.set(key, arr);
    }

    return jsonOk({
      total: users.length,
      applicants: users.map((u) => {
        const job = u.appliedJobId as unknown as { title?: string } | null;
        return {
          id: String(u._id),
          name: u.name,
          email: u.email,
          phone: u.phone ?? "",
          education: u.education ?? "",
          status: u.status,
          cvUrl: u.cvUrl ?? "",
          photoUrl: u.photoUrl ?? "",
          appliedJob: job && typeof job === "object" && job.title ? job.title : "",
          createdAt: u.createdAt,
          scores: byApplicant.get(String(u._id)) ?? [],
        };
      }),
    });
  } catch (err) {
    return handleError(err);
  }
}

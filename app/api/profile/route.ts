import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { jsonOk, jsonError, handleError } from "@/lib/http";
import { User, type IExperience } from "@/models/User";
import { TestScore } from "@/models/TestScore";

interface AppliedJobOut {
  id: string;
  title: string;
  division: string;
}

interface ExperienceOut {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

function experienceOut(e: IExperience): ExperienceOut {
  return {
    id: String(e._id ?? ""),
    company: e.company ?? "",
    position: e.position ?? "",
    startDate: e.startDate ?? "",
    endDate: e.endDate ?? "",
    isCurrent: !!e.isCurrent,
    description: e.description ?? "",
  };
}

function publicProfile(user: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  phone?: string;
  education?: string;
  experience?: string;
  address?: string;
  cvUrl?: string;
  photoUrl?: string;
  ijazahUrl?: string;
  transcriptUrl?: string;
  experiences?: IExperience[];
  appliedJobId?: { _id?: unknown; title?: string; division?: string } | null;
  appliedAt?: Date | null;
  status: string;
  createdAt: Date;
}) {
  const job = user.appliedJobId;
  const appliedJob: AppliedJobOut | null =
    job && typeof job === "object" && "title" in job
      ? { id: String(job._id ?? ""), title: job.title ?? "", division: job.division ?? "" }
      : null;
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone ?? "",
    education: user.education ?? "",
    experience: user.experience ?? "",
    address: user.address ?? "",
    cvUrl: user.cvUrl ?? "",
    photoUrl: user.photoUrl ?? "",
    ijazahUrl: user.ijazahUrl ?? "",
    transcriptUrl: user.transcriptUrl ?? "",
    experiences: (user.experiences ?? []).map(experienceOut),
    appliedJob,
    appliedAt: user.appliedAt ?? null,
    status: user.status,
    createdAt: user.createdAt,
  };
}

/** Profil user yang sedang login + skor tesnya (untuk pelamar). */
export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return jsonError("Belum login", 401);

    await connectDB();
    const user = await User.findById(auth.id);
    if (!user) return jsonError("Pengguna tidak ditemukan", 401);

    // Skor hanya untuk lamaran yang sedang berjalan (appliedJobId saat
    // ini). Skor lamaran lama (posisi lain / record lama tanpa job) tidak
    // ditampilkan, jadi lamaran baru mulai bersih.
    const scores = await TestScore.find({ applicant: user._id, job: user.appliedJobId ?? null })
      .sort({ updatedAt: -1 })
      .lean();
    await user.populate("appliedJobId", "title division");
    return jsonOk({
      profile: publicProfile(user),
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

function cleanExperience(raw: unknown): IExperience | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const company = typeof r.company === "string" ? r.company.trim().slice(0, 150) : "";
  const position = typeof r.position === "string" ? r.position.trim().slice(0, 150) : "";
  if (!company && !position) return null;
  const startDate = typeof r.startDate === "string" ? r.startDate.trim().slice(0, 7) : "";
  const endDate = typeof r.endDate === "string" ? r.endDate.trim().slice(0, 7) : "";
  return {
    company,
    position,
    startDate,
    endDate: r.isCurrent === true ? "" : endDate,
    isCurrent: r.isCurrent === true,
    description: typeof r.description === "string" ? r.description.trim().slice(0, 1000) : "",
  };
}

/** Update profil (nama, telepon, pendidikan, pengalaman, alamat, riwayat pengalaman). */
export async function PUT(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return jsonError("Belum login", 401);

    const body = (await req.json()) as {
      name?: string;
      phone?: string;
      education?: string;
      experience?: string;
      address?: string;
      experiences?: unknown;
    };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return jsonError("Nama wajib diisi", 400);

    const patch: Record<string, unknown> = { name };
    if (typeof body.phone === "string") patch.phone = body.phone.trim().slice(0, 20);
    if (typeof body.education === "string") patch.education = body.education.trim().slice(0, 200);
    if (typeof body.experience === "string") patch.experience = body.experience.trim().slice(0, 2000);
    if (typeof body.address === "string") patch.address = body.address.trim().slice(0, 300);
    if (Array.isArray(body.experiences)) {
      const cleaned = body.experiences.slice(0, 20).map(cleanExperience).filter((e): e is IExperience => e !== null);
      patch.experiences = cleaned;
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(auth.id, patch, { new: true }).populate(
      "appliedJobId",
      "title division"
    );
    if (!user) return jsonError("Pengguna tidak ditemukan", 401);

    return jsonOk({ profile: publicProfile(user) });
  } catch (err) {
    return handleError(err);
  }
}

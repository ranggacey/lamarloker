import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { jsonOk, jsonError, handleError } from "@/lib/http";
import { User } from "@/models/User";
import { TestScore } from "@/models/TestScore";

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
  status: string;
  createdAt: Date;
}) {
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

    const scores = await TestScore.find({ applicant: user._id }).sort({ updatedAt: -1 }).lean();
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

/** Update profil (nama, telepon, pendidikan, pengalaman, alamat). */
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
    };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return jsonError("Nama wajib diisi", 400);

    const patch: Record<string, string> = { name };
    if (typeof body.phone === "string") patch.phone = body.phone.trim().slice(0, 20);
    if (typeof body.education === "string") patch.education = body.education.trim().slice(0, 200);
    if (typeof body.experience === "string") patch.experience = body.experience.trim().slice(0, 2000);
    if (typeof body.address === "string") patch.address = body.address.trim().slice(0, 300);

    await connectDB();
    const user = await User.findByIdAndUpdate(auth.id, patch, { new: true });
    if (!user) return jsonError("Pengguna tidak ditemukan", 401);

    return jsonOk({ profile: publicProfile(user) });
  } catch (err) {
    return handleError(err);
  }
}

import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { jsonOk, jsonError, handleError } from "@/lib/http";
import { Job } from "@/models/Job";

function jobOut(j: {
  _id: unknown;
  title: string;
  division?: string;
  type?: string;
  location?: string;
  description?: string;
  requirements?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: String(j._id),
    title: j.title,
    division: j.division ?? "",
    type: j.type ?? "Full-time",
    location: j.location ?? "",
    description: j.description ?? "",
    requirements: j.requirements ?? "",
    status: j.status,
    createdAt: j.createdAt,
    updatedAt: j.updatedAt,
  };
}

/**
 * Daftar lowongan.
 * Publik: hanya yang berstatus "buka" (untuk halaman Lamar Pekerjaan).
 * HR (?all=1): semua lowongan, termasuk yang sudah ditutup (untuk Kelola Lowongan).
 */
export async function GET(req: NextRequest) {
  try {
    const all = req.nextUrl.searchParams.get("all") === "1";
    await connectDB();

    if (all) {
      const auth = getAuthUser(req);
      if (!auth) return jsonError("Belum login", 401);
      if (auth.role !== "hr") return jsonError("Hanya HR yang boleh melihat semua lowongan", 403);
      const jobs = await Job.find({}).sort({ createdAt: -1 }).lean();
      return jsonOk({ jobs: jobs.map(jobOut) });
    }

    const jobs = await Job.find({ status: "buka" }).sort({ createdAt: -1 }).lean();
    return jsonOk({ jobs: jobs.map(jobOut) });
  } catch (err) {
    return handleError(err);
  }
}

/** Buat lowongan baru (HR saja). */
export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return jsonError("Belum login", 401);
    if (auth.role !== "hr") return jsonError("Hanya HR yang boleh membuat lowongan", 403);

    const body = (await req.json()) as {
      title?: string;
      division?: string;
      type?: string;
      location?: string;
      description?: string;
      requirements?: string;
    };
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return jsonError("Judul posisi wajib diisi", 400);

    await connectDB();
    const job = await Job.create({
      title: title.slice(0, 150),
      division: typeof body.division === "string" ? body.division.trim().slice(0, 100) : "",
      type: typeof body.type === "string" ? body.type.trim().slice(0, 50) : "Full-time",
      location: typeof body.location === "string" ? body.location.trim().slice(0, 100) : "",
      description: typeof body.description === "string" ? body.description.trim().slice(0, 3000) : "",
      requirements: typeof body.requirements === "string" ? body.requirements.trim().slice(0, 3000) : "",
      status: "buka",
    });

    return jsonOk({ job: jobOut(job) }, 201);
  } catch (err) {
    return handleError(err);
  }
}

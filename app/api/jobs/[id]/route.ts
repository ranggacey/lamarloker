import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { jsonOk, jsonError, handleError } from "@/lib/http";
import { Job } from "@/models/Job";

/** Ubah lowongan (HR saja): status buka/tutup atau edit isi. */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return jsonError("Belum login", 401);
    if (auth.role !== "hr") return jsonError("Hanya HR yang boleh mengubah lowongan", 403);

    const { id } = await ctx.params;
    const body = (await req.json()) as {
      title?: string;
      division?: string;
      type?: string;
      location?: string;
      description?: string;
      requirements?: string;
      status?: string;
    };

    const patch: Record<string, string> = {};
    if (typeof body.title === "string" && body.title.trim()) patch.title = body.title.trim().slice(0, 150);
    if (typeof body.division === "string") patch.division = body.division.trim().slice(0, 100);
    if (typeof body.type === "string") patch.type = body.type.trim().slice(0, 50);
    if (typeof body.location === "string") patch.location = body.location.trim().slice(0, 100);
    if (typeof body.description === "string") patch.description = body.description.trim().slice(0, 3000);
    if (typeof body.requirements === "string") patch.requirements = body.requirements.trim().slice(0, 3000);
    if (body.status === "buka" || body.status === "tutup") patch.status = body.status;
    if (Object.keys(patch).length === 0) return jsonError("Tidak ada perubahan", 400);

    await connectDB();
    const job = await Job.findByIdAndUpdate(id, patch, { new: true });
    if (!job) return jsonError("Lowongan tidak ditemukan", 404);

    return jsonOk({
      job: {
        id: String(job._id),
        title: job.title,
        division: job.division ?? "",
        type: job.type ?? "Full-time",
        location: job.location ?? "",
        description: job.description ?? "",
        requirements: job.requirements ?? "",
        status: job.status,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

/** Hapus lowongan (HR saja). Pelamar yang sudah melamar posisi ini tetap tersimpan,
    posisi dilamarnya akan tampil "-" karena lowongannya sudah tidak ada. */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return jsonError("Belum login", 401);
    if (auth.role !== "hr") return jsonError("Hanya HR yang boleh menghapus lowongan", 403);

    const { id } = await ctx.params;
    await connectDB();
    const job = await Job.findByIdAndDelete(id);
    if (!job) return jsonError("Lowongan tidak ditemukan", 404);

    return jsonOk({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}

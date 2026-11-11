import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { jsonOk, jsonError, handleError } from "@/lib/http";
import { uploadBuffer, deleteAsset } from "@/lib/cloudinary";
import { User } from "@/models/User";

const MAX_CV_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2 MB

/** Upload CV (PDF) atau foto (gambar) ke Cloudinary, URL-nya disimpan di MongoDB. */
export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return jsonError("Belum login", 401);

    const form = await req.formData();
    const kind = form.get("kind");
    const file = form.get("file");
    if (kind !== "cv" && kind !== "foto") {
      return jsonError("Jenis upload tidak valid (cv / foto)", 400);
    }
    if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
      return jsonError("File tidak ditemukan", 400);
    }
    const f = file as File;

    if (kind === "cv") {
      if (f.type !== "application/pdf") return jsonError("CV harus berupa file PDF", 400);
      if (f.size > MAX_CV_BYTES) return jsonError("Ukuran CV maksimal 5 MB", 400);
    } else {
      if (!f.type.startsWith("image/")) return jsonError("Foto harus berupa file gambar", 400);
      if (f.size > MAX_PHOTO_BYTES) return jsonError("Ukuran foto maksimal 2 MB", 400);
    }

    const buffer = Buffer.from(await f.arrayBuffer());
    const publicId = `${auth.id}_${kind}_${Date.now()}`;
    const result = await uploadBuffer(buffer, {
      folder: kind === "cv" ? "lamarloker/cv" : "lamarloker/foto",
      publicId,
      resourceType: "auto",
    });

    await connectDB();
    const user = await User.findById(auth.id);
    if (!user) return jsonError("Pengguna tidak ditemukan", 401);

    // Hapus file lama (best-effort) supaya Cloudinary tidak menumpuk.
    if (kind === "cv" && user.cvPublicId) await deleteAsset(user.cvPublicId, "raw");
    if (kind === "foto" && user.photoPublicId) await deleteAsset(user.photoPublicId, "image");

    if (kind === "cv") {
      user.cvUrl = result.secure_url;
      user.cvPublicId = result.public_id;
    } else {
      user.photoUrl = result.secure_url;
      user.photoPublicId = result.public_id;
    }
    await user.save();

    return jsonOk({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    return handleError(err);
  }
}

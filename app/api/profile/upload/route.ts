import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { jsonOk, jsonError, handleError } from "@/lib/http";
import { uploadBuffer, deleteAsset } from "@/lib/cloudinary";
import { User } from "@/models/User";

const MAX_CV_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_DOC_BYTES = 5 * 1024 * 1024; // 5 MB (ijazah / transkrip)
const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2 MB

type Kind = "cv" | "foto" | "ijazah" | "transkrip";

const KIND_LABEL: Record<Kind, string> = {
  cv: "CV",
  foto: "Foto",
  ijazah: "Ijazah",
  transkrip: "Transkrip nilai",
};

const KIND_FOLDER: Record<Kind, string> = {
  cv: "lamarloker/cv",
  foto: "lamarloker/foto",
  ijazah: "lamarloker/ijazah",
  transkrip: "lamarloker/transkrip",
};

/** Upload dokumen ke Cloudinary, URL-nya disimpan di MongoDB.
    kind: cv (PDF ≤5MB) | foto (gambar ≤2MB) | ijazah (PDF/gambar ≤5MB) | transkrip (PDF/gambar ≤5MB). */
export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return jsonError("Belum login", 401);

    const form = await req.formData();
    const kind = form.get("kind");
    const file = form.get("file");
    if (kind !== "cv" && kind !== "foto" && kind !== "ijazah" && kind !== "transkrip") {
      return jsonError("Jenis upload tidak valid (cv / foto / ijazah / transkrip)", 400);
    }
    if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
      return jsonError("File tidak ditemukan", 400);
    }
    const f = file as File;
    const k = kind as Kind;

    if (k === "cv") {
      if (f.type !== "application/pdf") return jsonError("CV harus berupa file PDF", 400);
      if (f.size > MAX_CV_BYTES) return jsonError("Ukuran CV maksimal 5 MB", 400);
    } else if (k === "foto") {
      if (!f.type.startsWith("image/")) return jsonError("Foto harus berupa file gambar", 400);
      if (f.size > MAX_PHOTO_BYTES) return jsonError("Ukuran foto maksimal 2 MB", 400);
    } else {
      // Ijazah & transkrip: PDF atau gambar, maks 5 MB.
      const isPdf = f.type === "application/pdf";
      const isImage = f.type.startsWith("image/");
      if (!isPdf && !isImage) return jsonError(`${KIND_LABEL[k]} harus berupa PDF atau gambar`, 400);
      if (f.size > MAX_DOC_BYTES) return jsonError(`Ukuran ${KIND_LABEL[k]} maksimal 5 MB`, 400);
    }

    const buffer = Buffer.from(await f.arrayBuffer());
    const publicId = `${auth.id}_${k}_${Date.now()}`;
    const result = await uploadBuffer(buffer, {
      folder: KIND_FOLDER[k],
      publicId,
      resourceType: "auto",
    });

    await connectDB();
    const user = await User.findById(auth.id);
    if (!user) return jsonError("Pengguna tidak ditemukan", 401);

    // Hapus file lama (best-effort) supaya Cloudinary tidak menumpuk.
    // Ijazah/transkrip bisa berupa PDF (raw) atau gambar — coba hapus keduanya.
    if (k === "cv" && user.cvPublicId) await deleteAsset(user.cvPublicId, "raw");
    if (k === "foto" && user.photoPublicId) await deleteAsset(user.photoPublicId, "image");
    if (k === "ijazah" && user.ijazahPublicId) {
      await deleteAsset(user.ijazahPublicId, "raw");
      await deleteAsset(user.ijazahPublicId, "image");
    }
    if (k === "transkrip" && user.transcriptPublicId) {
      await deleteAsset(user.transcriptPublicId, "raw");
      await deleteAsset(user.transcriptPublicId, "image");
    }

    if (k === "cv") {
      user.cvUrl = result.secure_url;
      user.cvPublicId = result.public_id;
    } else if (k === "foto") {
      user.photoUrl = result.secure_url;
      user.photoPublicId = result.public_id;
    } else if (k === "ijazah") {
      user.ijazahUrl = result.secure_url;
      user.ijazahPublicId = result.public_id;
    } else {
      user.transcriptUrl = result.secure_url;
      user.transcriptPublicId = result.public_id;
    }
    await user.save();

    return jsonOk({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    return handleError(err);
  }
}

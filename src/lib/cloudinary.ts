import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

let configured = false;

/** Konfigurasi Cloudinary dibaca dari env saat runtime (bukan saat build). */
export function getCloudinary() {
  if (!configured) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        "Cloudinary belum dikonfigurasi di .env — isi CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET"
      );
    }
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
    configured = true;
  }
  return cloudinary;
}

export interface UploadOptions {
  folder: string;
  publicId: string;
  resourceType: "auto" | "image" | "raw";
}

/** Upload buffer (dari FormData) ke Cloudinary via stream. */
export function uploadBuffer(buffer: Buffer, opts: UploadOptions): Promise<UploadApiResponse> {
  const cl = getCloudinary();
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cl.uploader.upload_stream(
      { folder: opts.folder, public_id: opts.publicId, resource_type: opts.resourceType },
      (err, result) => {
        if (err || !result) reject(err ?? new Error("Upload ke Cloudinary gagal"));
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/** Hapus aset lama (best-effort, error diabaikan). */
export async function deleteAsset(publicId: string, resourceType: "image" | "raw"): Promise<void> {
  try {
    const cl = getCloudinary();
    await cl.uploader.destroy(publicId, { resource_type: resourceType });
  } catch {
    // abaikan — file lama yang gagal dihapus tidak menggagalkan upload baru
  }
}

import mongoose from "mongoose";

// Daftarkan semua model di sini supaya tersedia di setiap serverless
// function (Vercel). Tanpa ini, route yang populate ref "Job" (mis.
// appliedJobId) akan error "Schema hasn't been registered for model
// 'Job'" — karena di serverless, model hanya terdaftar kalau file-nya
// di-import oleh function itu, dan route profil/HR tidak meng-import
// Job. Di dev server lokal bug ini ketutup karena prosesnya panjang dan
// Job sudah terdaftar lewat route /api/jobs.
import "@/models/Job";
import "@/models/TestScore";
import "@/models/User";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __lamarlokerMongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.__lamarlokerMongoose ?? { conn: null, promise: null };
if (!global.__lamarlokerMongoose) global.__lamarlokerMongoose = cached;

/** Koneksi Mongoose dengan cache (pola resmi untuk Next.js serverless). */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI belum di-set di .env — tambahkan MONGODB_URI ke file .env");
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { dbName: "lamarloker" });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

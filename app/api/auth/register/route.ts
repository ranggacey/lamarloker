import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { hashPassword, type Role } from "@/lib/auth";
import { jsonOk, jsonError, handleError } from "@/lib/http";
import { User } from "@/models/User";

function publicUser(user: { _id: unknown; name: string; email: string; role: Role; status: string }) {
  return { id: String(user._id), name: user.name, email: user.email, role: user.role, status: user.status };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { name?: string; email?: string; password?: string };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    // Pendaftaran publik hanya untuk pelamar. Akun HR dibuat admin/seed, bukan dari sini.
    const role: Role = "pelamar";

    if (!name) return jsonError("Nama wajib diisi", 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError("Format email tidak valid", 400);
    if (password.length < 8) return jsonError("Password minimal 8 karakter", 400);

    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) return jsonError("Email sudah terdaftar, silakan login", 409);

    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, passwordHash, role, status: "baru" });

    // Tidak auto-login: setelah daftar, pengguna diarahkan ke halaman login.
    return jsonOk({ user: publicUser(user) }, 201);
  } catch (err) {
    return handleError(err);
  }
}

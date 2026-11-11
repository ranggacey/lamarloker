import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyPassword, signToken, setAuthCookie } from "@/lib/auth";
import { jsonOk, jsonError, handleError } from "@/lib/http";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) return jsonError("Email dan password wajib diisi", 400);

    await connectDB();
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) return jsonError("Akun tidak ditemukan", 404);

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return jsonError("Password salah", 401);

    const token = signToken({ id: user._id.toString(), email: user.email, role: user.role });
    const res = jsonOk({
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role, status: user.status },
    });
    setAuthCookie(res, token);
    return res;
  } catch (err) {
    return handleError(err);
  }
}

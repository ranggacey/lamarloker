import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ ok: true, data }, { status });
}

export function jsonError(message: string, status = 400): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/** Ubah error tak terduga jadi respons JSON 500 dengan pesan yang jelas. */
export function handleError(err: unknown): NextResponse {
  const message = err instanceof Error ? err.message : "Terjadi kesalahan di server";
  // eslint-disable-next-line no-console
  console.error(err);
  return jsonError(message, 500);
}

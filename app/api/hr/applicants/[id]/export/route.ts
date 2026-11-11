import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { jsonError, handleError } from "@/lib/http";
import { User, type IExperience } from "@/models/User";
import { TestScore } from "@/models/TestScore";
import * as XLSX from "xlsx";

const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function formatMonth(ym: string): string {
  const m = ym.match(/^(\d{4})-(\d{2})$/);
  if (!m) return ym || "-";
  const idx = Number(m[2]) - 1;
  return idx >= 0 && idx < 12 ? `${MONTHS_ID[idx]} ${m[1]}` : ym;
}

function formatPeriod(e: IExperience): string {
  const start = e.startDate ? formatMonth(e.startDate) : "-";
  const end = e.isCurrent ? "Sekarang" : e.endDate ? formatMonth(e.endDate) : "-";
  return `${start} – ${end}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function safeFilename(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "pelamar";
}

/**
 * Export SATU pelamar ke Excel (HR saja, format xlsx).
 * Sheet "Profil Pelamar": identitas + dokumen (hyperlink yang bisa diklik)
 * + riwayat pengalaman.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return jsonError("Belum login", 401);
    if (auth.role !== "hr") return jsonError("Hanya HR yang boleh mengekspor data pelamar", 403);

    const { id } = await ctx.params;
    await connectDB();
    const user = await User.findOne({ _id: id, role: "pelamar" }).populate(
      "appliedJobId",
      "title division"
    );
    if (!user) return jsonError("Pelamar tidak ditemukan", 404);

    const scores = await TestScore.find({ applicant: user._id }).lean();
    const scoreOf = (type: string): string => {
      const s = scores.find((x) => x.type === type);
      return s ? String(s.score) : "-";
    };

    const job = user.appliedJobId as unknown as { title?: string } | null;
    const appliedJob = job && typeof job === "object" && job.title ? job.title : "-";

    const dash = (v: string | undefined | null): string => (v && v.trim() ? v : "-");

    // Bagian profil: Label | Nilai. Nilai digabung (merge) kolom B:D.
    const profileRows: [string, string][] = [
      ["Nama", dash(user.name)],
      ["Email", dash(user.email)],
      ["Telepon", dash(user.phone)],
      ["Pendidikan", dash(user.education)],
      ["Alamat", dash(user.address)],
      ["Pengalaman", dash(user.experience)],
      ["Posisi Dilamar", appliedJob],
      ["Status", dash(user.status)],
      ["Skor Interview", scoreOf("interview")],
      ["Skor Psikotes", scoreOf("psikotes")],
      ["Tanggal Daftar", formatDate(user.createdAt)],
      ["CV", user.cvUrl ? "Lihat CV" : "-"],
      ["Ijazah", user.ijazahUrl ? "Lihat Ijazah" : "-"],
      ["Transkrip Nilai", user.transcriptUrl ? "Lihat Transkrip" : "-"],
      ["Foto", user.photoUrl ? "Lihat Foto" : "-"],
    ];

    const aoa: (string | number)[][] = [["Profil Pelamar", "", "", ""]];
    for (const [label, value] of profileRows) aoa.push([label, value, "", ""]);

    // Bagian riwayat pengalaman.
    aoa.push(["", "", "", ""]);
    aoa.push(["Riwayat Pengalaman", "", "", ""]);
    aoa.push(["Perusahaan", "Jabatan", "Periode", "Deskripsi"]);
    const experiences = (user.experiences ?? []) as IExperience[];
    if (experiences.length === 0) {
      aoa.push(["-", "-", "-", "-"]);
    } else {
      for (const e of experiences) {
        aoa.push([
          dash(e.company),
          dash(e.position),
          formatPeriod(e),
          dash(e.description),
        ]);
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Merge: judul + nilai profil (kolom B:D) + judul seksi pengalaman (kolom A:D).
    const merges: XLSX.Range[] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
    for (let r = 1; r <= profileRows.length; r++) {
      merges.push({ s: { r, c: 1 }, e: { r, c: 3 } });
    }
    const expTitleRow = profileRows.length + 2;
    merges.push({ s: { r: expTitleRow, c: 0 }, e: { r: expTitleRow, c: 3 } });
    ws["!merges"] = merges;

    // Hyperlink dokumen (bisa diklik langsung di Excel).
    const docLinks: Record<number, string> = {};
    const cvRow = 1 + profileRows.findIndex(([label]) => label === "CV");
    const ijazahRow = 1 + profileRows.findIndex(([label]) => label === "Ijazah");
    const transkripRow = 1 + profileRows.findIndex(([label]) => label === "Transkrip Nilai");
    const fotoRow = 1 + profileRows.findIndex(([label]) => label === "Foto");
    if (user.cvUrl) docLinks[cvRow] = user.cvUrl;
    if (user.ijazahUrl) docLinks[ijazahRow] = user.ijazahUrl;
    if (user.transcriptUrl) docLinks[transkripRow] = user.transcriptUrl;
    if (user.photoUrl) docLinks[fotoRow] = user.photoUrl;
    for (const [rowStr, url] of Object.entries(docLinks)) {
      const ref = XLSX.utils.encode_cell({ r: Number(rowStr), c: 1 });
      const cell = ws[ref] as XLSX.CellObject | undefined;
      if (cell) cell.l = { Target: url };
    }

    ws["!cols"] = [{ wch: 20 }, { wch: 28 }, { wch: 22 }, { wch: 45 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Profil Pelamar");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

    const filename = `pelamar-${safeFilename(user.name)}.xlsx`;
    return new Response(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

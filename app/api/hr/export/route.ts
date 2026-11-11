import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { jsonError, handleError } from "@/lib/http";
import { User } from "@/models/User";
import { TestScore } from "@/models/TestScore";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function csvCell(value: string | number | undefined): string {
  const v = value === undefined ? "" : String(value);
  return `"${v.replace(/"/g, '""')}"`;
}

type Row = (string | number)[];

async function getRows(): Promise<Row[]> {
  await connectDB();
  const users = await User.find({ role: "pelamar" }).sort({ createdAt: -1 }).lean();
  const ids = users.map((u) => u._id);
  const scores = await TestScore.find({ applicant: { $in: ids } }).lean();

  const scoreMap = new Map<string, Map<string, number>>();
  for (const s of scores) {
    const key = String(s.applicant);
    if (!scoreMap.has(key)) scoreMap.set(key, new Map());
    scoreMap.get(key)!.set(s.type, s.score);
  }

  const header: Row = ["Nama", "Email", "Telepon", "Pendidikan", "Status", "Skor Interview", "Skor Psikotes", "Link CV"];
  const rows: Row[] = [header];
  for (const u of users) {
    const sm = scoreMap.get(String(u._id));
    rows.push([
      u.name,
      u.email,
      u.phone ?? "",
      u.education ?? "",
      u.status,
      sm?.get("interview") ?? "",
      sm?.get("psikotes") ?? "",
      u.cvUrl ?? "",
    ]);
  }
  return rows;
}

function toCsv(rows: Row[]): string {
  const lines = rows.map((r) => r.map(csvCell).join(","));
  return "﻿" + lines.join("\r\n");
}

function toXlsx(rows: Row[]): Buffer {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  // Lebar kolom biar enak dibaca di Excel.
  ws["!cols"] = [
    { wch: 22 },
    { wch: 28 },
    { wch: 14 },
    { wch: 22 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 40 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pelamar");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

function toPdf(rows: Row[]): Buffer {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  doc.setFontSize(14);
  doc.text("Daftar Pelamar — Lamarloker", 40, 40);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Total: ${rows.length - 1} pelamar`, 40, 56);
  autoTable(doc, {
    startY: 70,
    head: [rows[0].map(String)],
    body: rows.slice(1).map((r) => r.map((v) => (v === "" ? "-" : String(v)))),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [250, 105, 158], textColor: 255 },
    alternateRowStyles: { fillColor: [255, 231, 240] },
    columnStyles: { 7: { cellWidth: 110 } },
  });
  return Buffer.from(doc.output("arraybuffer"));
}

/**
 * Export daftar pelamar (HR saja).
 * ?format=csv (default) | xlsx | pdf
 */
export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return jsonError("Belum login", 401);
    if (auth.role !== "hr") return jsonError("Hanya HR yang boleh mengekspor data", 403);

    const format = req.nextUrl.searchParams.get("format") ?? "csv";
    const rows = await getRows();

    if (format === "xlsx") {
      const buf = toXlsx(rows);
      return new Response(new Uint8Array(buf), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="daftar-pelamar.xlsx"',
        },
      });
    }

    if (format === "pdf") {
      const buf = toPdf(rows);
      return new Response(new Uint8Array(buf), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="daftar-pelamar.pdf"',
        },
      });
    }

    const csv = toCsv(rows);
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="daftar-pelamar.csv"',
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

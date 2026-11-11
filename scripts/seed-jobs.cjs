// Seed 4 lowongan contoh — hanya mengisi kalau koleksi jobs masih kosong.
// Jalankan dari folder proyek: node scripts/seed-jobs.cjs
// Membaca MONGODB_URI dari .env.local. Database: lamarloker, koleksi: jobs.
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

function readMongoUri() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const text = fs.readFileSync(envPath, "utf8");
  const m = text.match(/^MONGODB_URI=(.*)$/m);
  if (!m) return "";
  return m[1].trim().replace(/^["']|["']$/g, "");
}

const SAMPLE_JOBS = [
  {
    title: "Staff Administrasi",
    division: "Administrasi",
    type: "Full-time",
    location: "Semarang",
    description:
      "Mengelola dokumen dan arsip perusahaan, menyusun surat dan laporan administrasi, serta membantu kelancaran operasional kantor sehari-hari.",
    requirements:
      "Minimal D3 semua jurusan.\nBisa mengoperasikan Microsoft Office (Word, Excel).\nTeliti, rapi, dan komunikatif.\nDomisili Semarang dan sekitarnya.",
    status: "buka",
  },
  {
    title: "Web Developer",
    division: "IT",
    type: "Full-time",
    location: "Semarang",
    description:
      "Membangun dan memelihara aplikasi web perusahaan, berkolaborasi dengan tim desain dan HR untuk kebutuhan sistem internal.",
    requirements:
      "Minimal S1 Teknik Informatika atau setara.\nMenguasai JavaScript/TypeScript dan salah satu framework (React/Next.js/Laravel).\nMemahami database (MySQL/PostgreSQL/MongoDB).\nPunya portofolio project menjadi nilai tambah.",
    status: "buka",
  },
  {
    title: "IT Support",
    division: "IT",
    type: "Full-time",
    location: "Semarang",
    description:
      "Menangani kendala perangkat keras dan lunak karyawan, instalasi dan perawatan komputer, serta dukungan teknis untuk aplikasi internal.",
    requirements:
      "Minimal D3 Teknik Informatika / Sistem Informasi.\nMemahami troubleshooting hardware, jaringan dasar, dan Windows.\nSabar dan komunikatif saat membantu pengguna.",
    status: "buka",
  },
  {
    title: "Staff Gudang",
    division: "Operasional",
    type: "Full-time",
    location: "Demak",
    description:
      "Menerima, menyimpan, dan mengeluarkan barang sesuai prosedur, melakukan stock opname berkala, serta menjaga kerapian dan keamanan gudang.",
    requirements:
      "Minimal SMA/SMK sederajat.\nBersedia bekerja shift.\nJujur, disiplin, dan mampu bekerja dalam tim.\nDomisili Demak dan sekitarnya.",
    status: "buka",
  },
];

async function main() {
  const uri = readMongoUri();
  if (!uri) {
    console.error("MONGODB_URI tidak ditemukan di .env.local");
    process.exit(1);
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("lamarloker");
  const jobs = db.collection("jobs");
  const count = await jobs.countDocuments();
  if (count > 0) {
    console.log(`Koleksi jobs sudah berisi ${count} lowongan, tidak di-seed.`);
  } else {
    const now = new Date();
    await jobs.insertMany(
      SAMPLE_JOBS.map((j) => ({ ...j, createdAt: now, updatedAt: now }))
    );
    console.log("Lowongan contoh dibuat:", SAMPLE_JOBS.map((j) => j.title).join(", "));
  }
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

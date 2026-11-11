// Tes end-to-end: daftar pelamar -> lamar lowongan -> HR export Excel per pelamar (cek hyperlink CV).
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
const XLSX = require("xlsx");

const BASE = "http://localhost:3000";
const TEST_EMAIL = "teslamar@example.com";

function readMongoUri() {
  const text = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
  const m = text.match(/^MONGODB_URI=(.*)$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
}

async function main() {
  const uri = readMongoUri();
  const client = new MongoClient(uri);
  await client.connect();
  const users = client.db("lamarloker").collection("users");
  await users.deleteOne({ email: TEST_EMAIL });

  // 1. Daftar pelamar tes (dengan CV dummy biar ada link CV).
  const reg = await fetch(BASE + "/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Tes Lamar", email: TEST_EMAIL, password: "password123" }),
  });
  console.log("register status:", reg.status);
  const regBody = await reg.json();
  const pelamarId = regBody.data.user.id;
  // Register tidak auto-login (by design) -> login dulu untuk dapat cookie.
  const pelamarLogin = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL, password: "password123" }),
  });
  console.log("login pelamar status:", pelamarLogin.status);
  const pelamarCookie = (pelamarLogin.headers.get("set-cookie") || "").split(";")[0];

  // Isi CV dummy langsung ke DB (simulasi upload) supaya export punya link CV.
  await users.updateOne(
    { email: TEST_EMAIL },
    { $set: { cvUrl: "https://res.cloudinary.com/demo/lamarloker/cv/tes-cv.pdf", phone: "081234567890", education: "S1 Teknik Informatika", address: "Demak" } }
  );

  // 2. Ambil lowongan, lamar yang pertama (Web Developer).
  const jobsRes = await fetch(BASE + "/api/jobs");
  const jobsBody = await jobsRes.json();
  const job = jobsBody.data.jobs.find((j) => j.title === "Web Developer") || jobsBody.data.jobs[0];
  console.log("lowongan dilamar:", job.title);
  const apply = await fetch(BASE + "/api/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: pelamarCookie },
    body: JSON.stringify({ jobId: job.id }),
  });
  console.log("apply status:", apply.status, (await apply.text()).slice(0, 200));

  // 3. Login HR, export Excel pelamar ini.
  const login = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "hr@lamarloker.com", password: "hrlamarloker123" }),
  });
  const hrCookie = (login.headers.get("set-cookie") || "").split(";")[0];
  const exp = await fetch(BASE + "/api/hr/applicants/" + pelamarId + "/export", {
    headers: { Cookie: hrCookie },
  });
  console.log("export per-pelamar status:", exp.status, "type:", exp.headers.get("content-type"));
  const buf = Buffer.from(await exp.arrayBuffer());
  console.log("export bytes:", buf.length, "magic PK:", buf.slice(0, 2).toString() === "PK");
  // Baca balik Excel, cek hyperlink CV.
  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  let cvLink = null;
  let posisi = null;
  for (const addr of Object.keys(ws)) {
    if (addr.startsWith("!")) continue;
    const cell = ws[addr];
    if (cell.v === "Lihat CV" && cell.l) cvLink = cell.l.Target;
    if (cell.v === "Web Developer") posisi = "Web Developer";
  }
  console.log("posisi dilamar tampil di Excel:", posisi || "TIDAK");
  console.log("hyperlink CV di Excel:", cvLink || "TIDAK ADA");
  console.log("hyperlink CV benar:", cvLink === "https://res.cloudinary.com/demo/lamarloker/cv/tes-cv.pdf");

  // 4. Bersihkan akun tes.
  await users.deleteOne({ email: TEST_EMAIL });
  console.log("akun tes dihapus. sisa user:", await users.countDocuments());
  await client.close();
  console.log("TES LAMAR + EXPORT SELESAI");
}

main().catch((e) => {
  console.error("TES GAGAL:", e);
  process.exit(1);
});

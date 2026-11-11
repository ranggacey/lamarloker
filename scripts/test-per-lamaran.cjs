// Tes skor per-lamaran: lamar X (skor 34 -> tidak lolos), lamar Y (reset baru, skor kosong), skor 85 -> lulus.
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const BASE = "http://localhost:3000";
const TEST_EMAIL = "tesperlamaran@example.com";

function readMongoUri() {
  const text = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
  const m = text.match(/^MONGODB_URI=(.*)$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
}

async function login(email, password) {
  const r = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return (r.headers.get("set-cookie") || "").split(";")[0];
}

async function getProfile(cookie) {
  const r = await fetch(BASE + "/api/profile", { headers: { Cookie: cookie } });
  return r.json();
}

async function main() {
  const uri = readMongoUri();
  const client = new MongoClient(uri);
  await client.connect();
  const users = client.db("lamarloker").collection("users");
  await users.deleteOne({ email: TEST_EMAIL });

  // 1. Daftar + login pelamar tes.
  const reg = await fetch(BASE + "/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Tes Perlamaran", email: TEST_EMAIL, password: "password123" }),
  });
  const regBody = await reg.json();
  const pelamarId = regBody.data.user.id;
  const pelamarCookie = await login(TEST_EMAIL, "password123");
  console.log("register:", reg.status, "| login pelamar: OK");

  // 2. Ambil lowongan.
  const jobsRes = await fetch(BASE + "/api/jobs");
  const jobs = (await jobsRes.json()).data.jobs;
  const jobX = jobs.find((j) => j.title === "Web Developer");
  const jobY = jobs.find((j) => j.title === "Staff Administrasi");
  console.log("job X:", jobX.title, "| job Y:", jobY.title);

  // 3. Lamar job X.
  let apply = await fetch(BASE + "/api/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: pelamarCookie },
    body: JSON.stringify({ jobId: jobX.id }),
  });
  console.log("lamar X status:", apply.status);

  // 4. HR beri skor interview 34 untuk job X.
  const hrCookie = await login("hr@lamarloker.com", "hrlamarloker123");
  let score = await fetch(BASE + "/api/hr/applicants/" + pelamarId + "/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: hrCookie },
    body: JSON.stringify({ type: "interview", score: 34 }),
  });
  let scoreBody = await score.json();
  console.log("skor interview 34 -> status:", scoreBody.data?.applicantStatus || scoreBody);

  // 5. Pelamar lamar job Y (posisi baru).
  apply = await fetch(BASE + "/api/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: pelamarCookie },
    body: JSON.stringify({ jobId: jobY.id }),
  });
  console.log("lamar Y status:", apply.status);

  // 6. Cek profil: status harus "baru", skor harus kosong (untuk lamaran Y).
  const prof = await getProfile(pelamarCookie);
  const d = prof.data;
  console.log("setelah lamar Y -> status:", d.status, "| posisi:", d.appliedJob?.title, "| skor interview:", d.scores?.interview?.score ?? "KOSONG", "| skor psikotes:", d.scores?.psikotes?.score ?? "KOSONG");
  const resetOK = d.status === "baru" && (d.scores?.interview?.score == null);
  console.log("RESET KE BARU + SKOR KOSONG:", resetOK ? "YA (BENAR)" : "TIDAK (MASALAH)");

  // 7. HR beri skor interview 85 untuk job Y.
  score = await fetch(BASE + "/api/hr/applicants/" + pelamarId + "/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: hrCookie },
    body: JSON.stringify({ type: "interview", score: 85 }),
  });
  scoreBody = await score.json();
  console.log("skor interview 85 -> status:", scoreBody.data?.applicantStatus || scoreBody);

  // 8. Bersihkan akun tes.
  await users.deleteOne({ email: TEST_EMAIL });
  console.log("akun tes dihapus.");
  await client.close();
  console.log("TES PER-LAMARAN SELESAI");
}

main().catch((e) => {
  console.error("TES GAGAL:", e);
  process.exit(1);
});

// Seed akun HR default — HR tidak bisa daftar sendiri, jadi akun HR dibuat lewat script ini.
// Jalankan dari folder proyek: node scripts/seed-hr.cjs
// Membaca MONGODB_URI dari .env.local. Database: lamarloker, koleksi: users.
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const HR_EMAIL = "hr@lamarloker.com";
const HR_PASSWORD = "hrlamarloker123";
const HR_NAME = "HR Lamarloker";

function readMongoUri() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const text = fs.readFileSync(envPath, "utf8");
  const m = text.match(/^MONGODB_URI=(.*)$/m);
  if (!m) return "";
  return m[1].trim().replace(/^["']|["']$/g, "");
}

async function main() {
  const uri = readMongoUri();
  if (!uri) {
    console.error("MONGODB_URI tidak ditemukan di .env.local");
    process.exit(1);
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("lamarloker");
  const users = db.collection("users");
  const existing = await users.findOne({ email: HR_EMAIL });
  if (existing) {
    console.log("Akun HR sudah ada:", HR_EMAIL);
  } else {
    const passwordHash = await bcrypt.hash(HR_PASSWORD, 12);
    const now = new Date();
    await users.insertOne({
      name: HR_NAME,
      email: HR_EMAIL,
      passwordHash,
      role: "hr",
      phone: "",
      education: "",
      experience: "",
      address: "",
      cvUrl: "",
      cvPublicId: "",
      photoUrl: "",
      photoPublicId: "",
      status: "baru",
      createdAt: now,
      updatedAt: now,
    });
    console.log("Akun HR dibuat:", HR_EMAIL);
  }
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

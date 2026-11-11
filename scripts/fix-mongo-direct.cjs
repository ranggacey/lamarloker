// Ubah MONGODB_URI dari SRV (mongodb+srv://) ke direct (mongodb://) agar tidak
// tergantung DNS SRV yang di laptop ini mengembalikan hostname pendek.
// - Backup .env.local ke .env.local.bak dulu.
// - Hanya mengganti baris MONGODB_URI; baris lain (Cloudinary, JWT_SECRET) dipertahankan.
// - Username/password diambil dari URI lama (tidak ditampilkan).
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
const text = fs.readFileSync(envPath, "utf8");
const m = text.match(/^MONGODB_URI=(.*)$/m);
if (!m) {
  console.error("MONGODB_URI tidak ditemukan di .env.local");
  process.exit(1);
}
const oldUri = m[1].trim().replace(/^["']|["']$/g, "");
if (!oldUri.startsWith("mongodb+srv://")) {
  console.log("MONGODB_URI sudah bukan SRV, tidak diubah.");
  process.exit(0);
}

// Ambil user:pass dari URI SRV (format: mongodb+srv://user:pass@host/db?query)
const credMatch = oldUri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)/);
if (!credMatch) {
  console.error("Format MONGODB_URI tidak dikenali.");
  process.exit(1);
}
const user = credMatch[1];
const pass = credMatch[2];
// Ambil nama database dari path URI, default lamarloker.
const dbMatch = oldUri.match(/@[^/?]+\/([^?]+)/);
const dbName = dbMatch ? dbMatch[1] : "lamarloker";

const hosts = [
  "ac-5z50ekx-shard-00-00.u4vyh2a.mongodb.net:27017",
  "ac-5z50ekx-shard-00-01.u4vyh2a.mongodb.net:27017",
  "ac-5z50ekx-shard-00-02.u4vyh2a.mongodb.net:27017",
].join(",");
const directUri =
  `mongodb://${user}:${pass}@${hosts}/${dbName}` +
  `?replicaSet=atlas-hcadzh-shard-0&authSource=admin&ssl=true`;

// Backup + ganti.
fs.copyFileSync(envPath, envPath + ".bak");
const newText = text.replace(/^MONGODB_URI=.*$/m, "MONGODB_URI=" + directUri);
fs.writeFileSync(envPath, newText);
console.log("MONGODB_URI diubah ke direct (backup: .env.local.bak).");
console.log("Host:", hosts.split(",")[0], "(+2 shard lain), db:", dbName);

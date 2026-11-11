// Tes register pelamar end-to-end: POST ke API, lalu cek MongoDB.
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const BASE = "http://localhost:3000";
const TEST_EMAIL = "tespelamar@example.com";

function readMongoUri() {
  const text = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
  const m = text.match(/^MONGODB_URI=(.*)$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
}

async function main() {
  // 1. Hapus user tes lama bila ada (biar bersih).
  const uri = readMongoUri();
  const client = new MongoClient(uri);
  await client.connect();
  const users = client.db("lamarloker").collection("users");
  await users.deleteOne({ email: TEST_EMAIL });
  const before = await users.countDocuments();
  console.log("jumlah user sebelum register:", before);

  // 2. Register via API.
  const res = await fetch(BASE + "/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Tes Pelamar", email: TEST_EMAIL, password: "password123" }),
  });
  const text = await res.text();
  console.log("register status:", res.status);
  console.log("register body:", text.slice(0, 500));

  // 3. Cek apakah user masuk DB.
  const after = await users.countDocuments();
  const found = await users.findOne({ email: TEST_EMAIL });
  console.log("jumlah user sesudah register:", after);
  console.log("user tes ditemukan di DB:", found ? `YA (role=${found.role}, status=${found.status})` : "TIDAK");
  await client.close();
}

main().catch((e) => {
  console.error("TES GAGAL:", e);
  process.exit(1);
});

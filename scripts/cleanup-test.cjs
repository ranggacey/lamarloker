// Hapus akun tes (tespelamar@example.com) dari database.
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

async function main() {
  const text = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
  const m = text.match(/^MONGODB_URI=(.*)$/m);
  const uri = m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
  const client = new MongoClient(uri);
  await client.connect();
  const users = client.db("lamarloker").collection("users");
  const r = await users.deleteOne({ email: "tespelamar@example.com" });
  console.log("akun tes dihapus:", r.deletedCount);
  console.log("sisa user:", await users.countDocuments());
  await client.close();
}
main().catch((e) => { console.error(e); process.exit(1); });

// Reset akun hidayat: status kembali "baru" (belum ada skor untuk lamaran IT Support),
// dan hapus skor lama tanpa job (record usang sebelum perbaikan per-lamaran).
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const EMAIL = "hidayat@gmail.com";

async function main() {
  const text = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
  const m = text.match(/^MONGODB_URI=(.*)$/m);
  const uri = m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("lamarloker");
  const users = db.collection("users");
  const scores = db.collection("testscores");

  const user = await users.findOne({ email: EMAIL });
  if (!user) {
    console.log("user tidak ditemukan:", EMAIL);
    await client.close();
    return;
  }
  console.log("sebelum: status =", user.status, "| posisi dilamar =", user.appliedJobId ? String(user.appliedJobId) : "-");

  // Reset status ke "baru" karena lamaran saat ini belum ada skor.
  await users.updateOne({ _id: user._id }, { $set: { status: "baru" } });

  // Hapus skor lama tanpa job (record usang) untuk user ini.
  const del = await scores.deleteMany({ applicant: user._id, job: { $exists: false } });
  console.log("skor lama tanpa job dihapus:", del.deletedCount);

  const after = await users.findOne({ email: EMAIL });
  console.log("sesudah: status =", after.status);
  await client.close();
  console.log("RESET SELESAI");
}

main().catch((e) => {
  console.error("RESET GAGAL:", e);
  process.exit(1);
});

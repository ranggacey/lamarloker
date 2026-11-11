// Diagnosis SRV: lihat record SRV MongoDB Atlas yang dikembalikan DNS laptop.
const fs = require("fs");
const path = require("path");
const dns = require("dns");

const text = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
const m = text.match(/^MONGODB_URI=(.*)$/m);
const uri = m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
// Ambil host dari mongodb+srv://user:pass@HOST/db
const hostMatch = uri.match(/@([^/?]+)/);
const host = hostMatch ? hostMatch[1] : "";
console.log("cluster host:", host);
console.log("uri scheme:", uri.startsWith("mongodb+srv://") ? "srv" : "direct");

dns.resolveSrv("_mongodb._tcp." + host, (err, records) => {
  if (err) {
    console.log("SRV lookup GAGAL:", err.code, err.message);
    return;
  }
  console.log("SRV records (" + records.length + "):");
  for (const r of records) console.log(" -", r.name, "port", r.port);
});

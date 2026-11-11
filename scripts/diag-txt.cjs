// Ambil TXT record Atlas (berisi replicaSet + authSource) untuk bikin direct URI.
const dns = require("dns");

const host = "negaraemas.u4vyh2a.mongodb.net";
dns.resolveTxt(host, (err, records) => {
  if (err) {
    console.log("TXT lookup GAGAL:", err.code, err.message);
    return;
  }
  console.log("TXT records:");
  for (const r of records) console.log(" -", r.join(""));
});

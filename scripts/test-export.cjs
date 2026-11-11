// Tes export HR end-to-end: login HR, lalu download xlsx + pdf + csv.
const BASE = "http://localhost:3000";

async function main() {
  // Login HR.
  const login = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "hr@lamarloker.com", password: "hrlamarloker123" }),
  });
  const loginText = await login.text();
  console.log("login HR status:", login.status);
  if (!login.ok) {
    console.log("login body:", loginText.slice(0, 300));
    return;
  }
  const setCookie = login.headers.get("set-cookie") || "";
  const cookie = setCookie.split(";")[0];
  console.log("cookie didapat:", cookie ? "YA" : "TIDAK");

  for (const fmt of ["xlsx", "pdf", "csv"]) {
    const res = await fetch(BASE + "/api/hr/export?format=" + fmt, {
      headers: { Cookie: cookie },
    });
    const buf = Buffer.from(await res.arrayBuffer());
    console.log(
      `export ${fmt}: status ${res.status}, type ${res.headers.get("content-type")}, bytes ${buf.length}`
    );
    // Cek magic bytes: xlsx = PK (zip), pdf = %PDF, csv = teks.
    if (fmt === "xlsx") console.log("  xlsx magic PK:", buf.slice(0, 2).toString() === "PK");
    if (fmt === "pdf") console.log("  pdf magic %PDF:", buf.slice(0, 4).toString() === "%PDF");
    if (fmt === "csv") console.log("  csv awal:", buf.slice(0, 40).toString().replace(/\r/g, "\\r"));
  }
  console.log("TES EXPORT SELESAI");
}

main().catch((e) => {
  console.error("TES GAGAL:", e);
  process.exit(1);
});

import { clearAuthCookie } from "@/lib/auth";
import { jsonOk } from "@/lib/http";

export async function POST() {
  const res = jsonOk({ loggedOut: true });
  clearAuthCookie(res);
  return res;
}

import { base44 } from "@/api/base44Client";

// Phase A: local sign-in without MFA. TOTP can be added later.
export async function loginWithMfa(email, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(result.error?.message || result.detail || "Unable to sign in");
  if (result.access_token) base44.auth.setToken(result.access_token);
  return result;
}

export async function continueMfa() { throw new Error("MFA is not enabled locally yet."); }
export async function loginWithSocial() { throw new Error("Social sign-in is not available locally."); }
export function loginWithGoogle() { return loginWithSocial(); }
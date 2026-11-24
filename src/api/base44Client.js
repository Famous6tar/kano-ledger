// Local replacement for @base44/sdk.
// Provides the same API surface as the Base44 SDK but talks to /api/* on this app's own Express server.

const TOKEN_KEY = "kano.auth.token";

function readToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
function writeToken(t) {
  if (typeof window === "undefined") return;
  if (t) window.localStorage.setItem(TOKEN_KEY, t);
  else window.localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, headers = {}, auth = true } = {}) {
  const h = { ...headers };
  if (body !== undefined && !(body instanceof FormData)) h["Content-Type"] = "application/json";
  if (auth) {
    const t = readToken();
    if (t) h.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(path, {
    method,
    headers: h,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || data?.message || data?.detail || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function toQuery(obj) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj || {})) {
    if (v === undefined || v === null) continue;
    p.set(k, String(v));
  }
  return p.toString();
}

function entity(name) {
  return {
    async list({ limit = 500, sort } = {}) {
      return request(`/api/entities/${name}?${toQuery({ limit, sort })}`);
    },
    async filter(filterObj, { limit = 500, sort } = {}) {
      return request(`/api/entities/${name}?${toQuery({ ...filterObj, limit, sort })}`);
    },
    async get(id) {
      return request(`/api/entities/${name}/${id}`);
    },
    async create(values) {
      return request(`/api/entities/${name}`, { method: "POST", body: values });
    },
    async update(id, values) {
      return request(`/api/entities/${name}/${id}`, { method: "PATCH", body: values });
    },
    async delete(id) {
      return request(`/api/entities/${name}/${id}`, { method: "DELETE" });
    },
  };
}

export const base44 = {
  auth: {
    hasToken: () => !!readToken(),
    setToken: (t) => writeToken(t),
    async me() {
      return request("/api/auth/me");
    },
    logout(url) {
      writeToken(null);
      if (typeof window !== "undefined") window.location.href = url || "/login";
    },
    redirectToLogin(url) {
      if (typeof window === "undefined") return;
      const returnTo = url || window.location.href;
      window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`;
    },
    async register({ email, password }) {
      return request("/api/auth/register", { method: "POST", body: { email, password }, auth: false });
    },
    async verifyOtp({ email, otpCode }) {
      const result = await request("/api/auth/verify-otp", { method: "POST", body: { email, code: otpCode }, auth: false });
      if (result.access_token) writeToken(result.access_token);
      return result;
    },
    async resendOtp(email) {
      return request("/api/auth/resend-otp", { method: "POST", body: { email }, auth: false });
    },
    async loginWithProvider() {
      throw new Error("Social sign-in is not available locally. Use email and password.");
    },
    async resetPasswordRequest(email) {
      return request("/api/auth/forgot-password", { method: "POST", body: { email }, auth: false });
    },
    async resetPassword({ resetToken, newPassword }) {
      return request("/api/auth/reset-password", { method: "POST", body: { token: resetToken, password: newPassword }, auth: false });
    },
  },
  entities: {
    BusinessProfile: entity("BusinessProfile"),
    Customer: entity("Customer"),
    Transaction: entity("Transaction"),
    User: entity("User"),
  },
  integrations: {
    Core: {
      async UploadPublicFile({ file }) {
        const fd = new FormData();
        fd.append("file", file);
        return request("/api/upload", { method: "POST", body: fd });
      },
    },
  },
  mcp: {
    getConsentInfo() { throw new Error("MCP is not available locally."); },
    respondToConsent() { throw new Error("MCP is not available locally."); },
  },
};
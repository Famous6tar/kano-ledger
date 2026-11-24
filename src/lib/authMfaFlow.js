import { base44 } from "@/api/base44Client";

export class MfaError extends Error {
  constructor(message, status, retryAfter) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
  get mustSignInAgain() { return this.status === 401; }
}

const unavailable = () => { throw new MfaError("MFA is not enabled locally yet.", 501); };

export function mfaSession() {
  return {
    verify: unavailable, sendSignInCode: unavailable,
    setupAuthenticator: unavailable, confirmAuthenticator: unavailable,
    sendPhoneCode: unavailable, confirmPhone: unavailable,
    status: unavailable, sendProofCode: unavailable,
    removeMethod: unavailable, forgetDevices: unavailable,
  };
}

export function signInToManageMfa() { return Promise.reject(new MfaError("MFA is not enabled locally yet.", 501)); }
export function resumeMfa() { return Promise.resolve(null); }
export function loadSignInOptions() {
  return Promise.resolve({ auth_config: { mfa_policy: "optional", enable_username_password: true, enable_google_login: false } });
}
export function signInWithProvider() { return Promise.reject(new MfaError("Social sign-in is not available locally.", 501)); }
export function finishSignIn(accessToken, returnTo) {
  if (accessToken) base44.auth.setToken(accessToken);
  if (typeof window !== "undefined") window.location.href = returnTo || "/";
}
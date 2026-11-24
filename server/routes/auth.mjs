import { Router } from "express";
import { db } from "../db.mjs";
import { hashPassword, verifyPassword, signToken, newId, nowISO, requireAuth } from "../auth.mjs";

const router = Router();

function issueOtp(userId, email) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expires = Date.now() + 10 * 60 * 1000;
  db.prepare("UPDATE users SET otp_code=?, otp_expires=?, updated_date=? WHERE id=?")
    .run(code, expires, nowISO(), userId);
  console.log(`\n\x1b[36m📧 OTP for ${email}: ${code}\x1b[0m  (expires in 10 min)\n`);
  return code;
}

function publicUser(u) {
  return { id: u.id, email: u.email, role: u.role, created_date: u.created_date, full_name: u.email.split("@")[0] };
}

router.post("/register", (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: { message: "Email and password required" } });
    if (String(password).length < 6) return res.status(400).json({ error: { message: "Password must be at least 6 characters" } });
    if (db.prepare("SELECT id FROM users WHERE email=?").get(email)) {
      return res.status(409).json({ error: { message: "Email already registered" } });
    }
    const id = newId();
    const now = nowISO();
    db.prepare(`INSERT INTO users (id,email,password_hash,role,email_verified,created_date,updated_date)
                VALUES (?,?,?,?,?,?,?)`).run(id, email, hashPassword(password), "user", 0, now, now);
    issueOtp(id, email);
    res.json({ ok: true, email });
  } catch (e) { next(e); }
});

router.post("/resend-otp", (req, res, next) => {
  try {
    const { email } = req.body || {};
    const user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
    if (!user) return res.status(404).json({ error: { message: "No account with that email" } });
    if (user.email_verified) return res.status(400).json({ error: { message: "Already verified" } });
    issueOtp(user.id, user.email);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post("/verify-otp", (req, res, next) => {
  try {
    const { email, code } = req.body || {};
    const user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
    if (!user) return res.status(404).json({ error: { message: "No account" } });
    if (user.email_verified) return res.status(400).json({ error: { message: "Already verified" } });
    if (!user.otp_code || user.otp_code !== code) return res.status(400).json({ error: { message: "Invalid code" } });
    if (!user.otp_expires || user.otp_expires < Date.now()) return res.status(400).json({ error: { message: "Code expired" } });
    db.prepare("UPDATE users SET email_verified=1, otp_code=NULL, otp_expires=NULL, updated_date=? WHERE id=?")
      .run(nowISO(), user.id);
    const token = signToken(user);
    res.json({ access_token: token, user: publicUser(user) });
  } catch (e) { next(e); }
});

router.post("/login", (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: { message: "Invalid email or password" } });
    }
    if (!user.email_verified) {
      db.prepare("UPDATE users SET email_verified=1, updated_date=? WHERE id=?").run(nowISO(), user.id);
    }
    const token = signToken(user);
    res.json({ access_token: token, user: publicUser(user) });
  } catch (e) { next(e); }
});

router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id=?").get(req.user.id);
  if (!user) return res.status(401).json({ error: { message: "Unauthorized" } });
  res.json(publicUser(user));
});

router.post("/forgot-password", (req, res) => {
  const { email } = req.body || {};
  const user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (user) {
    const token = newId();
    const expires = Date.now() + 60 * 60 * 1000;
    db.prepare("UPDATE users SET reset_token=?, reset_expires=?, updated_date=? WHERE id=?")
      .run(token, expires, nowISO(), user.id);
    console.log(`\n\x1b[36m🔑 Password reset for ${email}:\x1b[0m  http://localhost:5173/reset-password?token=${token}\n`);
  }
  res.json({ ok: true }); // always generic — don't leak account existence
});

router.post("/reset-password", (req, res, next) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ error: { message: "Token and password required" } });
    if (String(password).length < 6) return res.status(400).json({ error: { message: "Password too short" } });
    const user = db.prepare("SELECT * FROM users WHERE reset_token=?").get(token);
    if (!user) return res.status(400).json({ error: { message: "Invalid reset link" } });
    if (!user.reset_expires || user.reset_expires < Date.now()) {
      return res.status(400).json({ error: { message: "Reset link expired" } });
    }
    db.prepare("UPDATE users SET password_hash=?, reset_token=NULL, reset_expires=NULL, updated_date=? WHERE id=?")
      .run(hashPassword(password), nowISO(), user.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
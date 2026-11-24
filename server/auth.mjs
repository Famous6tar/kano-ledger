import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

const JWT_SECRET = process.env.JWT_SECRET || "kano-ledger-dev-secret-change-in-production";
const JWT_EXPIRES = "30d";

export const hashPassword = (pw) => bcrypt.hashSync(pw, 10);
export const verifyPassword = (pw, hash) => bcrypt.compareSync(pw, hash);
export const newId = () => randomUUID();
export const nowISO = () => new Date().toISOString();

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: { message: "Unauthorized" } });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: { message: "Unauthorized" } });
  req.user = { id: payload.sub, email: payload.email, role: payload.role };
  next();
}
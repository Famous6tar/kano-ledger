import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.mjs";
import entitiesRouter from "./routes/entities.mjs";
import uploadRouter from "./routes/upload.mjs";
import { UPLOAD_DIR } from "./db.mjs";

const app = express();
const PORT = 3001;

app.use(express.json({ limit: "15mb" }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/entities", entitiesRouter);
app.use("/api/upload", uploadRouter);
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "1d" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  console.error("[api]", err);
  res.status(err.status || 500).json({ error: { message: err.message || "Server error" } });
});

app.listen(PORT, () => {
  console.log(`\n\x1b[32m✅ Kano Ledger API listening on http://localhost:${PORT}\x1b[0m`);
  console.log(`   Database:   data/kano.db`);
  console.log(`   Uploads:    data/uploads/\n`);
});
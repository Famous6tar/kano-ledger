import { Router } from "express";
import multer from "multer";
import { extname } from "node:path";
import { randomUUID } from "node:crypto";
import { UPLOAD_DIR } from "../db.mjs";
import { requireAuth } from "../auth.mjs";

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname || "")}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

router.post("/", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: { message: "No file" } });
  res.json({ file_url: `/uploads/${req.file.filename}` });
});

export default router;
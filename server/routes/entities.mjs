import { Router } from "express";
import { db } from "../db.mjs";
import { requireAuth, newId, nowISO } from "../auth.mjs";

const router = Router();
router.use(requireAuth);

const ENTITIES = {
  BusinessProfile: {
    table: "business_profiles",
    fields: ["business_name","tagline","logo_url","brand_color","accent_color","phone","email","address","currency","receipt_note"],
    required: ["business_name"],
    sortable: ["business_name","created_date","updated_date"],
  },
  Customer: {
    table: "customers",
    fields: ["name","phone","address","notes","balance","total_credit","total_paid","last_activity"],
    required: ["name"],
    sortable: ["name","phone","balance","last_activity","created_date","updated_date"],
  },
  Transaction: {
    table: "transactions",
    fields: ["customer_id","customer_name","type","amount","note","balance_after","reference","date"],
    required: ["customer_id","type","amount"],
    sortable: ["date","amount","type","created_date"],
  },
  User: {
    table: "users",
    fields: ["email","role"],
    required: ["email"],
    sortable: ["email","created_date"],
    readOnly: true,
  },
};

const pickFields = (cfg, body) => {
  const out = {};
  for (const f of cfg.fields) if (body && f in body) out[f] = body[f];
  return out;
};

function buildWhere(cfg, query, userId) {
  const where = ["created_by_id = ?"];
  const params = [userId];
  const known = new Set(cfg.fields);
  for (const [k, v] of Object.entries(query)) {
    if (["limit","offset","sort"].includes(k)) continue;
    if (!known.has(k)) continue;
    where.push(`${k} = ?`);
    params.push(v);
  }
  return { sql: where.join(" AND "), params };
}

function orderClause(cfg, sort) {
  if (!sort) return "created_date DESC";
  const desc = String(sort).startsWith("-");
  const field = desc ? String(sort).slice(1) : String(sort);
  const allowed = new Set([...cfg.sortable, "created_date", "updated_date"]);
  return `${allowed.has(field) ? field : "created_date"} ${desc ? "DESC" : "ASC"}`;
}

function userSafe(row) {
  return { id: row.id, email: row.email, role: row.role, created_date: row.created_date };
}

router.get("/:entity", (req, res, next) => {
  try {
    const cfg = ENTITIES[req.params.entity];
    if (!cfg) return res.status(404).json({ error: { message: "Unknown entity" } });
    const { sql, params } = buildWhere(cfg, req.query, req.user.id);
    const limit = Math.min(Number(req.query.limit) || 500, 2000);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const rows = db.prepare(`SELECT * FROM ${cfg.table} WHERE ${sql} ORDER BY ${orderClause(cfg, req.query.sort)} LIMIT ? OFFSET ?`)
      .all(...params, limit, offset);
    res.json({ items: req.params.entity === "User" ? rows.map(userSafe) : rows });
  } catch (e) { next(e); }
});

router.get("/:entity/:id", (req, res, next) => {
  try {
    const cfg = ENTITIES[req.params.entity];
    if (!cfg) return res.status(404).json({ error: { message: "Unknown entity" } });
    const row = db.prepare(`SELECT * FROM ${cfg.table} WHERE id=? AND created_by_id=?`).get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ error: { message: "Not found" } });
    res.json(req.params.entity === "User" ? userSafe(row) : row);
  } catch (e) { next(e); }
});

router.post("/:entity", (req, res, next) => {
  try {
    const cfg = ENTITIES[req.params.entity];
    if (!cfg) return res.status(404).json({ error: { message: "Unknown entity" } });
    if (cfg.readOnly) return res.status(403).json({ error: { message: "Read-only entity" } });
    const body = pickFields(cfg, req.body);
    for (const r of cfg.required) {
      if (body[r] === undefined || body[r] === null || body[r] === "") {
        return res.status(400).json({ error: { message: `Missing required field: ${r}` } });
      }
    }
    const id = newId();
    const now = nowISO();
    const cols = ["id","created_by_id", ...Object.keys(body), "created_date","updated_date"];
    const vals = [id, req.user.id, ...Object.values(body), now, now];
    db.prepare(`INSERT INTO ${cfg.table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`).run(...vals);
    res.json(db.prepare(`SELECT * FROM ${cfg.table} WHERE id=?`).get(id));
  } catch (e) { next(e); }
});

router.patch("/:entity/:id", (req, res, next) => {
  try {
    const cfg = ENTITIES[req.params.entity];
    if (!cfg) return res.status(404).json({ error: { message: "Unknown entity" } });
    if (cfg.readOnly) return res.status(403).json({ error: { message: "Read-only entity" } });
    const existing = db.prepare(`SELECT id FROM ${cfg.table} WHERE id=? AND created_by_id=?`).get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: { message: "Not found" } });
    const body = pickFields(cfg, req.body);
    if (Object.keys(body).length === 0) return res.json(db.prepare(`SELECT * FROM ${cfg.table} WHERE id=?`).get(req.params.id));
    const set = Object.keys(body).map(k => `${k}=?`).join(",");
    db.prepare(`UPDATE ${cfg.table} SET ${set}, updated_date=? WHERE id=?`)
      .run(...Object.values(body), nowISO(), req.params.id);
    res.json(db.prepare(`SELECT * FROM ${cfg.table} WHERE id=?`).get(req.params.id));
  } catch (e) { next(e); }
});

router.delete("/:entity/:id", (req, res, next) => {
  try {
    const cfg = ENTITIES[req.params.entity];
    if (!cfg) return res.status(404).json({ error: { message: "Unknown entity" } });
    if (cfg.readOnly) return res.status(403).json({ error: { message: "Read-only entity" } });
    db.prepare(`DELETE FROM ${cfg.table} WHERE id=? AND created_by_id=?`).run(req.params.id, req.user.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
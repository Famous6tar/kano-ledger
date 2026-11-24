import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DB_PATH = resolve(__dirname, "..", "data", "kano.db");
export const UPLOAD_DIR = resolve(__dirname, "..", "data", "uploads");

mkdirSync(dirname(DB_PATH), { recursive: true });
mkdirSync(UPLOAD_DIR, { recursive: true });

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    email_verified INTEGER NOT NULL DEFAULT 0,
    otp_code TEXT,
    otp_expires INTEGER,
    reset_token TEXT,
    reset_expires INTEGER,
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS business_profiles (
    id TEXT PRIMARY KEY,
    created_by_id TEXT NOT NULL,
    business_name TEXT NOT NULL,
    tagline TEXT DEFAULT '',
    logo_url TEXT DEFAULT '',
    brand_color TEXT DEFAULT '#0E7C66',
    accent_color TEXT DEFAULT '#D97706',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    address TEXT DEFAULT '',
    currency TEXT DEFAULT 'NGN',
    receipt_note TEXT DEFAULT '',
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    created_by_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    balance REAL NOT NULL DEFAULT 0,
    total_credit REAL NOT NULL DEFAULT 0,
    total_paid REAL NOT NULL DEFAULT 0,
    last_activity TEXT,
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    created_by_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT DEFAULT '',
    type TEXT NOT NULL CHECK (type IN ('credit', 'payment')),
    amount REAL NOT NULL,
    note TEXT DEFAULT '',
    balance_after REAL NOT NULL DEFAULT 0,
    reference TEXT,
    date TEXT NOT NULL,
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_customers_owner ON customers(created_by_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_owner ON transactions(created_by_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
  CREATE INDEX IF NOT EXISTS idx_bp_owner ON business_profiles(created_by_id);
`);
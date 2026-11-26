import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
const rootDir = isProduction ? "/var/data" : resolve(__dirname, "..", "data");

export const DB_PATH = resolve(rootDir, "kano.db");
export const UPLOAD_DIR = resolve(rootDir, "uploads");

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
    bank_details TEXT DEFAULT '',
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

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    created_by_id TEXT NOT NULL,
    name TEXT NOT NULL,
    sku TEXT,
    category TEXT DEFAULT 'General',
    cost_price REAL DEFAULT 0,
    price REAL NOT NULL DEFAULT 0,
    stock_quantity REAL DEFAULT 0,
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

  CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    created_by_id TEXT NOT NULL,
    customer_id TEXT,
    sale_number TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'pos',
    status TEXT DEFAULT 'PAID',
    items_json TEXT NOT NULL,
    sub_total REAL NOT NULL,
    discount REAL DEFAULT 0,
    tax REAL DEFAULT 0,
    total REAL NOT NULL,
    amount_paid REAL DEFAULT 0,
    balance REAL NOT NULL DEFAULT 0,
    payment_method TEXT DEFAULT 'Cash',
    date TEXT NOT NULL,
    due_date TEXT,
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    created_by_id TEXT NOT NULL,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT DEFAULT 'General',
    date TEXT NOT NULL,
    note TEXT,
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    created_by_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_customers_owner ON customers(created_by_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_owner ON transactions(created_by_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
  CREATE INDEX IF NOT EXISTS idx_products_owner ON products(created_by_id);
  CREATE INDEX IF NOT EXISTS idx_sales_owner ON sales(created_by_id);
  CREATE INDEX IF NOT EXISTS idx_expenses_owner ON expenses(created_by_id);
`);
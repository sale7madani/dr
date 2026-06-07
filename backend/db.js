/* ============================================================
   قاعدة البيانات — SQLite حقيقية عبر node:sqlite (مدمجة، بلا تبعيات)
   Real relational DB via Node's built-in node:sqlite
   ============================================================ */
"use strict";

const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const DB_PATH = process.env.SONBOL_DB || path.join(__dirname, "sonbol.db");
const db = new DatabaseSync(DB_PATH);

db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      role          TEXT    NOT NULL CHECK(role IN ('customer','restaurant','captain','admin')),
      name          TEXT    NOT NULL,
      phone         TEXT    NOT NULL UNIQUE,
      email         TEXT,
      pass_hash     TEXT    NOT NULL,
      pass_salt     TEXT    NOT NULL,
      restaurant_id TEXT,
      created_at    INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      number         TEXT    NOT NULL UNIQUE,
      status         TEXT    NOT NULL,
      customer_id    INTEGER NOT NULL REFERENCES users(id),
      customer_name  TEXT,
      customer_phone TEXT,
      restaurant_id  TEXT    NOT NULL,
      restaurant_name TEXT,
      captain_id     INTEGER REFERENCES users(id),
      captain_name   TEXT,
      items          TEXT    NOT NULL,
      subtotal       INTEGER NOT NULL,
      delivery_fee   INTEGER NOT NULL,
      total          INTEGER NOT NULL,
      pay_method     TEXT    NOT NULL,
      paid           INTEGER NOT NULL DEFAULT 0,
      note           TEXT,
      reject_reason  TEXT,
      address        TEXT,
      area           TEXT,
      eta_min        INTEGER,
      eta_max        INTEGER,
      created_at     INTEGER NOT NULL,
      updated_at     INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_events (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   INTEGER NOT NULL REFERENCES orders(id),
      type       TEXT    NOT NULL,
      actor_role TEXT,
      actor_id   INTEGER,
      from_status TEXT,
      to_status  TEXT,
      payload    TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_rest   ON orders(restaurant_id);
    CREATE INDEX IF NOT EXISTS idx_orders_cust   ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_cap    ON orders(captain_id);
    CREATE INDEX IF NOT EXISTS idx_events_order  ON order_events(order_id);
  `);
  // ترقية آمنة لقواعد بيانات قديمة (يتجاهل الخطأ لو العمود موجود)
  try { db.exec("ALTER TABLE users ADD COLUMN email TEXT"); } catch (e) {}
}

module.exports = { db, init, DB_PATH };

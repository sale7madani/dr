/* ============================================================
   المصادقة — تشفير كلمات المرور (scrypt) + توكنات JWT موقّعة (HS256)
   كلها عبر crypto المدمجة، بلا تبعيات
   ============================================================ */
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { db } = require("./db");

const ROLES = ["customer", "restaurant", "captain", "admin"];

/* سرّ التوقيع — يُولّد مرّة ويُحفظ خارج Git */
const SECRET_FILE = path.join(__dirname, ".secret");
function loadSecret() {
  try {
    return fs.readFileSync(SECRET_FILE);
  } catch (e) {
    const s = crypto.randomBytes(48);
    try { fs.writeFileSync(SECRET_FILE, s, { mode: 0o600 }); } catch (x) {}
    return s;
  }
}
const SECRET = loadSecret();

/* ---------- كلمات المرور (scrypt) ---------- */
function hashPassword(pw, salt) {
  salt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(pw), salt, 64).toString("hex");
  return { salt, hash };
}
function verifyPassword(pw, salt, hash) {
  const h = crypto.scryptSync(String(pw), salt, 64).toString("hex");
  const a = Buffer.from(h, "hex"), b = Buffer.from(hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ---------- توكنات (JWT HS256) ---------- */
function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlJSON(o) { return b64url(JSON.stringify(o)); }
function fromB64url(s) { return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64"); }

function signToken(payload, ttlSec) {
  ttlSec = ttlSec || 60 * 60 * 24 * 7; // أسبوع
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body = Object.assign({}, payload, { iat: now, exp: now + ttlSec });
  const data = b64urlJSON(header) + "." + b64urlJSON(body);
  const sig = b64url(crypto.createHmac("sha256", SECRET).update(data).digest());
  return data + "." + sig;
}
function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const data = parts[0] + "." + parts[1];
  const expected = b64url(crypto.createHmac("sha256", SECRET).update(data).digest());
  const a = Buffer.from(expected), b = Buffer.from(parts[2]);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let body;
  try { body = JSON.parse(fromB64url(parts[1]).toString("utf8")); } catch (e) { return null; }
  if (!body.exp || body.exp < Math.floor(Date.now() / 1000)) return null;
  return body;
}

/* ---------- مستخدمون ---------- */
function userById(id) {
  return db.prepare("SELECT id, role, name, phone, restaurant_id FROM users WHERE id = ?").get(id) || null;
}
function userByPhone(phone) {
  return db.prepare("SELECT * FROM users WHERE phone = ?").get(phone) || null;
}
function createUser({ role, name, phone, password, restaurant_id }) {
  if (!ROLES.includes(role)) throw new Error("invalid role");
  const { salt, hash } = hashPassword(password);
  const info = db.prepare(
    "INSERT INTO users(role, name, phone, pass_hash, pass_salt, restaurant_id, created_at) VALUES(?,?,?,?,?,?,?)"
  ).run(role, name, String(phone), hash, salt, restaurant_id != null ? restaurant_id : null, Date.now());
  return userById(Number(info.lastInsertRowid));
}

module.exports = {
  ROLES, hashPassword, verifyPassword, signToken, verifyToken,
  userById, userByPhone, createUser,
};

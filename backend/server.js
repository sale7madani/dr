/* ============================================================
   Sonbol API server — باك-إند حقيقي (بلا تبعيات)
   - REST API مؤمّن بالأدوار
   - Realtime عبر SSE (مصادقة بالتوكن)
   - يخدم واجهات المشروع أيضاً
   ============================================================ */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const { db, init } = require("./db");
const auth = require("./auth");
const catalog = require("./catalog");
const orders = require("./orders");

const ROOT = path.resolve(__dirname, "..");

/* ---------- أدوات ---------- */
const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8", ".jsx": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml", ".webp": "image/webp",
  ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2", ".mp4": "video/mp4",
};

function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "", size = 0;
    req.on("data", (c) => { size += c.length; if (size > 1e6) { reject(new Error("body too large")); req.destroy(); } data += c; });
    req.on("end", () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(Object.assign(new Error("bad json"), { status: 400 })); } });
    req.on("error", reject);
  });
}
function ipOf(req) { return (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "?").toString().split(",")[0]; }

function getAuthUser(req, parsed) {
  let token = null;
  const h = req.headers["authorization"];
  if (h && h.startsWith("Bearer ")) token = h.slice(7);
  if (!token && parsed.query.token) token = parsed.query.token;
  if (!token) return null;
  const body = auth.verifyToken(token);
  if (!body) return null;
  return auth.userById(body.uid);
}

/* ---------- منع الإفراط على نقاط المصادقة ---------- */
const rl = new Map();
function rateOk(ip) {
  const now = Date.now();
  const e = rl.get(ip) || { n: 0, t: now };
  if (now - e.t > 60000) { e.n = 0; e.t = now; }
  e.n++; rl.set(ip, e);
  return e.n <= 20;
}

/* ---------- SSE ---------- */
const clients = new Set();
function broadcastOrder(o) {
  const msg = `event: order\ndata: ${JSON.stringify(o)}\n\n`;
  for (const c of clients) { if (orders.canView(c.user, o)) { try { c.res.write(msg); } catch (e) {} } }
}
function sse(req, res, user) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform", "Connection": "keep-alive", "X-Accel-Buffering": "no",
  });
  res.write("retry: 2000\n\n");
  res.write(`event: init\ndata: ${JSON.stringify({ orders: orders.listForUser(user), user: { id: user.id, role: user.role, name: user.name } })}\n\n`);
  const client = { res, user };
  clients.add(client);
  const ping = setInterval(() => { try { res.write(": ping\n\n"); } catch (e) {} }, 25000);
  req.on("close", () => { clearInterval(ping); clients.delete(client); });
}

/* ---------- ملفات ثابتة ---------- */
function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === "/" || rel === "") rel = "/index.html";
  const filePath = path.normalize(path.join(ROOT, rel));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.stat(filePath, (err, st) => {
    let target = filePath;
    if (!err && st.isDirectory()) target = path.join(filePath, "index.html");
    fs.readFile(target, (e, buf) => {
      if (e) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("404 — " + rel); }
      res.writeHead(200, { "Content-Type": MIME[path.extname(target).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-cache" });
      res.end(buf);
    });
  });
}

/* ---------- مصادقة: تسجيل/دخول ---------- */
function register(res, b) {
  const role = b.role === "captain" ? "captain" : "customer"; // العام يسجّل زبون/كابتن فقط
  if (!b.name || !b.phone || !b.password) return json(res, 400, { error: "name, phone, password required" });
  if (String(b.password).length < 6) return json(res, 400, { error: "password must be at least 6 chars" });
  if (auth.userByPhone(String(b.phone))) return json(res, 409, { error: "phone already registered" });
  const u = auth.createUser({ role, name: String(b.name).slice(0, 60), phone: String(b.phone).slice(0, 30), password: String(b.password) });
  return json(res, 201, { token: auth.signToken({ uid: u.id, role: u.role }), user: u });
}
function login(res, b) {
  const u = auth.userByPhone(String(b.phone || ""));
  if (!u || !auth.verifyPassword(String(b.password || ""), u.pass_salt, u.pass_hash)) return json(res, 401, { error: "invalid credentials" });
  const pub = { id: u.id, role: u.role, name: u.name, phone: u.phone, restaurant_id: u.restaurant_id };
  return json(res, 200, { token: auth.signToken({ uid: u.id, role: u.role }), user: pub });
}

/* ---------- التوجيه ---------- */
const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const p = parsed.pathname, m = req.method;
  try {
    if (p.startsWith("/api/")) {
      if (p === "/api/health") return json(res, 200, { ok: true, ts: Date.now() });
      if (p === "/api/auth/register" && m === "POST") { if (!rateOk(ipOf(req))) return json(res, 429, { error: "too many requests" }); return register(res, await readBody(req)); }
      if (p === "/api/auth/login" && m === "POST") { if (!rateOk(ipOf(req))) return json(res, 429, { error: "too many requests" }); return login(res, await readBody(req)); }
      if (p === "/api/stream" && m === "GET") { const u = getAuthUser(req, parsed); if (!u) return json(res, 401, { error: "unauthorized" }); return sse(req, res, u); }

      // ما بعده يتطلّب مصادقة
      const user = getAuthUser(req, parsed);
      if (!user) return json(res, 401, { error: "unauthorized" });

      if (p === "/api/me" && m === "GET") return json(res, 200, { user });
      if (p === "/api/catalog" && m === "GET") return json(res, 200, { restaurants: catalog.restaurants(), mods: catalog.modGroups() });
      if (p === "/api/catalog/restaurants" && m === "GET") return json(res, 200, { restaurants: catalog.restaurants() });
      let mm;
      if ((mm = p.match(/^\/api\/catalog\/restaurants\/([\w-]+)\/menu$/)) && m === "GET") {
        const rr = catalog.getRestaurant(mm[1]);
        if (!rr) return json(res, 404, { error: "not found" });
        return json(res, 200, { menu: rr.menu });
      }
      if (p === "/api/captains" && m === "GET") {
        if (user.role !== "admin") return json(res, 403, { error: "forbidden" });
        return json(res, 200, { captains: db.prepare("SELECT id, name, phone FROM users WHERE role = 'captain'").all() });
      }
      if (p === "/api/orders" && m === "GET") return json(res, 200, { orders: orders.listForUser(user) });
      if (p === "/api/orders" && m === "POST") {
        if (user.role !== "customer") return json(res, 403, { error: "only customers place orders" });
        const o = orders.createOrder(user, await readBody(req)); broadcastOrder(o); return json(res, 201, { order: o });
      }
      if ((mm = p.match(/^\/api\/orders\/(\d+)$/)) && m === "GET") {
        const o = orders.getOrder(Number(mm[1]));
        if (!o || !orders.canView(user, o)) return json(res, 404, { error: "not found" });
        return json(res, 200, { order: o });
      }
      if ((mm = p.match(/^\/api\/orders\/(\d+)\/transition$/)) && m === "POST") {
        const b = await readBody(req);
        const o = orders.transition(user, Number(mm[1]), b.action, b); broadcastOrder(o); return json(res, 200, { order: o });
      }
      return json(res, 404, { error: "no such endpoint" });
    }

    if (m === "GET" || m === "HEAD") return serveStatic(req, res, p);
    res.writeHead(405); res.end("Method Not Allowed");
  } catch (e) {
    return json(res, e.status || 500, { error: e.message || "server error" });
  }
});

/* ---------- تهيئة + بيانات أولية ---------- */
function seedUsers() {
  if (db.prepare("SELECT COUNT(*) AS c FROM users").get().c > 0) return;
  const rests = catalog.restaurants();
  const firstSlug = rests[0] && rests[0].id;
  const firstName = rests[0] ? (rests[0].nameAr || rests[0].name) : "مطعم";
  auth.createUser({ role: "admin", name: "مدير سنبل", phone: "0000", password: "admin1234" });
  auth.createUser({ role: "captain", name: "محمود العلي", phone: "2222", password: "cap1234" });
  auth.createUser({ role: "customer", name: "سيف", phone: "3333", password: "cust1234" });
  auth.createUser({ role: "restaurant", name: "كاشير " + firstName, phone: "1111", password: "rest1234", restaurant_id: firstSlug });
}
function bootstrap() { init(); seedUsers(); }

function start(port) {
  bootstrap();
  server.listen(port, () => {
    const pt = server.address().port;
    console.log("\n  🌾  Sonbol API + apps running");
    console.log("  ──────────────────────────────────────────");
    console.log(`  http://localhost:${pt}/            (لوحة التشغيل)`);
    console.log(`  http://localhost:${pt}/api/health  (فحص الـ API)`);
    console.log("  حسابات تجريبية: admin 0000 / rest 1111 / captain 2222 / customer 3333 (pw: <role>1234 أو admin1234)");
    console.log("  ──────────────────────────────────────────\n");
  });
  return server;
}

if (require.main === module) start(process.env.PORT ? Number(process.env.PORT) : 4000);

module.exports = { server, start, bootstrap, broadcastOrder };

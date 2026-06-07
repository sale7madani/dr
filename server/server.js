#!/usr/bin/env node
/* ============================================================
   Sonbol Hub — خادم تشغيل + ناقل أحداث الطلبات (بدون أي تبعيات)
   Sonbol Hub — static server + realtime order event bus (zero deps)

   - يخدم كل ملفات المشروع (so one command runs every app)
   - يربط الواجهات ببعضها عبر SSE: حدث طلب من الزبون يصل فوراً للمطعم والكابتن والإدارة
   - يحفظ حالة الطلبات في server/hub-state.json
   ============================================================ */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const ROOT = path.resolve(__dirname, "..");
const STATE_FILE = path.join(__dirname, "hub-state.json");
const PORT = process.env.PORT ? Number(process.env.PORT) : 5173;

/* ----- ترتيب الحالات (يمنع رجوع الطلب للخلف) ----- */
const RANK = { unpaid: 1, processing: 2, new: 3, preparing: 4, ready: 5, onway: 6, delivered: 7, rejected: 100, canceled: 100 };
const rank = (s) => (RANK[s] != null ? RANK[s] : 0);

/* ----- الحالة المشتركة ----- */
let state = { orders: {} };
try {
  if (fs.existsSync(STATE_FILE)) state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) || { orders: {} };
  if (!state.orders) state.orders = {};
} catch (e) { console.warn("[hub] could not read state:", e.message); state = { orders: {} }; }

let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), (e) => { if (e) console.warn("[hub] save failed:", e.message); });
  }, 120);
}

/* ----- عملاء SSE ----- */
const clients = new Set();
function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) { try { res.write(payload); } catch (e) { /* ignore */ } }
}

/* دمج طلب وارد مع المحفوظ مع حارس الترتيب */
function upsertOrder(incoming) {
  if (!incoming || !incoming.id) return null;
  const prev = state.orders[incoming.id];
  let merged;
  if (!prev) {
    merged = Object.assign({}, incoming);
  } else {
    merged = Object.assign({}, prev, incoming); // المفاتيح الموجودة فقط تُحدِّث
    // حارس الحالة: لا ترجع للخلف إلا إذا كانت حالة نهائية (rejected/canceled)
    if (incoming.status && rank(incoming.status) < rank(prev.status) && rank(incoming.status) < 100) {
      merged.status = prev.status;
    }
  }
  merged.updatedAt = Date.now();
  if (!merged.createdAt) merged.createdAt = merged.updatedAt;
  state.orders[merged.id] = merged;
  persist();
  return merged;
}

/* ----- أنواع الملفات ----- */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".jsx": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".gif": "image/gif", ".svg": "image/svg+xml", ".webp": "image/webp",
  ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2",
  ".mp4": "video/mp4", ".webmanifest": "application/manifest+json",
};

function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(body) });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "", size = 0;
    req.on("data", (c) => { size += c.length; if (size > 1e6) { reject(new Error("body too large")); req.destroy(); } data += c; });
    req.on("end", () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === "/" || rel === "") rel = "/index.html";
  // منع الخروج من جذر المشروع
  const filePath = path.normalize(path.join(ROOT, rel));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.stat(filePath, (err, st) => {
    let target = filePath;
    if (!err && st.isDirectory()) target = path.join(filePath, "index.html");
    fs.readFile(target, (e, buf) => {
      if (e) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("404 — " + rel); }
      const ext = path.extname(target).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": "no-cache" });
      res.end(buf);
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  /* === تيار الأحداث الحيّة === */
  if (pathname === "/hub/stream" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.write("retry: 2000\n\n");
    res.write(`event: init\ndata: ${JSON.stringify({ orders: Object.values(state.orders) })}\n\n`);
    clients.add(res);
    const ping = setInterval(() => { try { res.write(": ping\n\n"); } catch (e) {} }, 25000);
    req.on("close", () => { clearInterval(ping); clients.delete(res); });
    return;
  }

  /* === نشر/تحديث طلب === */
  if (pathname === "/hub/publish" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const merged = upsertOrder(body.order);
      if (!merged) return sendJSON(res, 400, { ok: false, error: "order.id required" });
      broadcast("order", merged);
      return sendJSON(res, 200, { ok: true, order: merged });
    } catch (e) { return sendJSON(res, 400, { ok: false, error: e.message }); }
  }

  /* === لقطة الحالة === */
  if (pathname === "/hub/state" && req.method === "GET") {
    return sendJSON(res, 200, { orders: Object.values(state.orders), clients: clients.size });
  }

  /* === إعادة الضبط === */
  if (pathname === "/hub/reset" && req.method === "POST") {
    state = { orders: {} }; persist(); broadcast("reset", {});
    return sendJSON(res, 200, { ok: true });
  }

  /* === ملفات ثابتة === */
  if (req.method === "GET" || req.method === "HEAD") return serveStatic(req, res, pathname);
  res.writeHead(405); res.end("Method Not Allowed");
});

server.listen(PORT, () => {
  console.log("\n  🌾  سنبل — Sonbol platform running");
  console.log("  ──────────────────────────────────────────");
  console.log(`  لوحة التشغيل · launcher:   http://localhost:${PORT}/`);
  console.log(`  الزبون · customer:         http://localhost:${PORT}/apps/customer/`);
  console.log(`  المطعم · restaurant:       http://localhost:${PORT}/apps/restaurant/`);
  console.log(`  الكابتن · captain:         http://localhost:${PORT}/apps/captain/`);
  console.log(`  الإدارة · admin:           http://localhost:${PORT}/apps/admin/`);
  console.log("  ──────────────────────────────────────────");
  console.log("  الطلبات تنتقل حيّاً بين الواجهات عبر /hub  (SSE)\n");
});

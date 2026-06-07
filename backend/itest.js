/* اختبار تكامل شامل: رحلة طلب كاملة عبر كل الأدوار + SSE حيّ */
"use strict";
const http = require("http");
const path = require("path");
const fs = require("fs");
const TMP = path.join(__dirname, "itest.db");
for (const f of [TMP, TMP + "-wal", TMP + "-shm"]) { try { fs.unlinkSync(f); } catch (e) {} }
process.env.SONBOL_DB = TMP;
const { start } = require("./server");
const srv = start(0);
let base = "", pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ✓ " + m); } else { fail++; console.log("  ✗ FAIL: " + m); } };
async function api(method, p, token, body) {
  const r = await fetch(base + p, { method, headers: Object.assign({ "Content-Type": "application/json" }, token ? { Authorization: "Bearer " + token } : {}), body: body ? JSON.stringify(body) : undefined });
  let j = null; try { j = await r.json(); } catch (e) {} return { status: r.status, body: j };
}
function streamCollect(token, seconds) { // يجمع أحداث order لمدة
  return new Promise((resolve) => {
    const events = [];
    const req = http.get(base + "/api/stream?token=" + token, (r) => {
      r.setEncoding("utf8"); let buf = "";
      r.on("data", (d) => { buf += d; let i; while ((i = buf.indexOf("\n\n")) >= 0) { const chunk = buf.slice(0, i); buf = buf.slice(i + 2); const mm = chunk.match(/event: (\w+)\ndata: (.*)/s); if (mm) { try { events.push({ ev: mm[1], data: JSON.parse(mm[2]) }); } catch (e) {} } } });
    });
    setTimeout(() => { try { req.destroy(); } catch (e) {} resolve(events); }, seconds * 1000);
    resolve._req = req;
  });
}
(async () => {
  await new Promise((r) => (srv.listening ? r() : srv.once("listening", r)));
  base = "http://localhost:" + srv.address().port;
  const tok = {};
  for (const [role, ph, pw] of [["admin", "0000", "admin1234"], ["rest", "1111", "rest1234"], ["cap", "2222", "cap1234"], ["cust", "3333", "cust1234"]])
    tok[role] = (await api("POST", "/api/auth/login", null, { phone: ph, password: pw })).body.token;
  ok(tok.admin && tok.rest && tok.cap && tok.cust, "all four roles authenticate");

  // افتح بثّ الإدارة والكابتن بالتوازي
  const adminEvents = []; const capEvents = [];
  const adminReq = http.get(base + "/api/stream?token=" + tok.admin, (r) => { r.setEncoding("utf8"); r.on("data", (d) => { (d.match(/event: order/g) || []).forEach(() => adminEvents.push(1)); }); });
  const capReq = http.get(base + "/api/stream?token=" + tok.cap, (r) => { r.setEncoding("utf8"); r.on("data", (d) => { (d.match(/event: order/g) || []).forEach(() => capEvents.push(1)); }); });
  await new Promise((r) => setTimeout(r, 250));

  // 1) الزبون يطلب
  const cat = (await api("GET", "/api/catalog", tok.cust)).body;
  const r = cat.restaurants[0];
  const item = r.menu[0].items.find((x) => !x.soldout);
  const ord = (await api("POST", "/api/orders", tok.cust, { restaurantId: r.id, payMethod: "cash", items: [{ id: item.id, qty: 2 }] })).body.order;
  ok(ord && ord.status === "processing", "1. customer places order → processing");
  await new Promise((r) => setTimeout(r, 150));
  ok(adminEvents.length >= 1, "   admin received it live (SSE)");

  // 2) المطعم: قبول ثم جاهز
  ok((await api("POST", "/api/orders/" + ord.id + "/transition", tok.rest, { action: "accept" })).body.order.status === "preparing", "2. restaurant accept → preparing");
  ok((await api("POST", "/api/orders/" + ord.id + "/transition", tok.rest, { action: "ready" })).body.order.status === "ready", "3. restaurant ready → ready");
  await new Promise((r) => setTimeout(r, 150));
  ok(capEvents.length >= 1, "   captain received the ready order live (SSE)");

  // 3) الكابتن: يراه متاحاً، يحجز، يستلم، يوصّل
  const avail = (await api("GET", "/api/orders", tok.cap)).body.orders;
  ok(avail.some((o) => o.id === ord.id && o.status === "ready"), "4. captain sees the available ready order");
  ok((await api("POST", "/api/orders/" + ord.id + "/transition", tok.cap, { action: "claim" })).body.order.captainId, "5. captain claim → assigned");
  ok((await api("POST", "/api/orders/" + ord.id + "/transition", tok.cap, { action: "pickup" })).body.order.status === "onway", "6. captain pickup → onway");
  const done = (await api("POST", "/api/orders/" + ord.id + "/transition", tok.cap, { action: "deliver" })).body.order;
  ok(done.status === "delivered" && done.paid === true, "7. captain deliver → delivered + paid");

  // 4) الإدارة ترى الحالة النهائية
  const adminView = (await api("GET", "/api/orders", tok.admin)).body.orders.find((o) => o.id === ord.id);
  ok(adminView && adminView.status === "delivered" && adminView.captainName, "8. admin sees final delivered + captain name");

  // 5) الزبون يرى طلبه مكتمل
  const custView = (await api("GET", "/api/orders", tok.cust)).body.orders.find((o) => o.id === ord.id);
  ok(custView && custView.status === "delivered", "9. customer sees own order delivered");

  try { adminReq.destroy(); capReq.destroy(); } catch (e) {}
  console.log("\nINTEGRATION: " + pass + " passed, " + fail + " failed\n");
  srv.close();
  for (const f of [TMP, TMP + "-wal", TMP + "-shm"]) { try { fs.unlinkSync(f); } catch (e) {} }
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); try { srv.close(); } catch (x) {} process.exit(1); });

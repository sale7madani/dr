/* ============================================================
   اختبارات الـ API — تثبت السلوك الحقيقي بلا متصفح
   تشغّل خادماً على منفذ مؤقت وقاعدة بيانات مؤقتة وتفحص:
   المصادقة، الأدوار، التسعير على الخادم، قواعد الانتقال، العزل، الـ SSE
   ============================================================ */
"use strict";

const http = require("http");
const path = require("path");
const fs = require("fs");

const TMP_DB = path.join(__dirname, "test.db");
for (const f of [TMP_DB, TMP_DB + "-wal", TMP_DB + "-shm"]) { try { fs.unlinkSync(f); } catch (e) {} }
process.env.SONBOL_DB = TMP_DB;

const { start } = require("./server");
const srv = start(0);

let base = "";
let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; console.log("  ✓ " + msg); } else { fail++; console.log("  ✗ FAIL: " + msg); } }

async function api(method, p, token, body) {
  const res = await fetch(base + p, {
    method,
    headers: Object.assign({ "Content-Type": "application/json" }, token ? { Authorization: "Bearer " + token } : {}),
    body: body ? JSON.stringify(body) : undefined,
  });
  let j = null; try { j = await res.json(); } catch (e) {}
  return { status: res.status, body: j };
}

function cleanup() { for (const f of [TMP_DB, TMP_DB + "-wal", TMP_DB + "-shm"]) { try { fs.unlinkSync(f); } catch (e) {} } }

(async () => {
  await new Promise((r) => (srv.listening ? r() : srv.once("listening", r)));
  base = "http://localhost:" + srv.address().port;

  console.log("\n— المصادقة والأدوار —");
  const admin = (await api("POST", "/api/auth/login", null, { phone: "0000", password: "admin1234" })).body;
  const cust = (await api("POST", "/api/auth/login", null, { phone: "3333", password: "cust1234" })).body;
  const rest = (await api("POST", "/api/auth/login", null, { phone: "1111", password: "rest1234" })).body;
  const cap = (await api("POST", "/api/auth/login", null, { phone: "2222", password: "cap1234" })).body;
  ok(admin && admin.token, "admin login");
  ok(cust && cust.token && cust.user.role === "customer", "customer login");
  ok(rest && rest.token && rest.user.restaurant_id, "restaurant login (linked to a restaurant)");
  ok(cap && cap.token, "captain login");
  ok((await api("POST", "/api/auth/login", null, { phone: "0000", password: "nope" })).status === 401, "wrong password rejected");
  ok((await api("GET", "/api/orders", null)).status === 401, "request without token rejected");
  ok((await api("GET", "/api/orders", "garbage.token.here")).status === 401, "forged token rejected");

  console.log("\n— الكتالوج والتسعير على الخادم —");
  const cat = (await api("GET", "/api/catalog/restaurants", cust.token)).body;
  ok(cat.restaurants.length >= 1, "catalog lists restaurants");
  const r = cat.restaurants[0];
  const menu = (await api("GET", "/api/catalog/restaurants/" + r.id + "/menu", cust.token)).body.menu;
  ok(menu.length >= 2, "menu lists items");
  const a = menu[0], b = menu[1];

  // محاولة تلاعب بالسعر/الإجمالي — يجب أن يتجاهلها الخادم
  const created = await api("POST", "/api/orders", cust.token, {
    restaurantId: r.id, payMethod: "cash",
    items: [{ itemId: a.id, qty: 2, price: 99999 }, { itemId: b.id, qty: 1 }],
    subtotal: 1, total: 1,
  });
  ok(created.status === 201, "customer places order");
  const order = created.body.order;
  const expectSub = a.price * 2 + b.price * 1;
  ok(order.subtotal === expectSub, "server computes subtotal ignoring client tamper (= " + expectSub + ")");
  ok(order.total === expectSub + r.delivery_fee, "server adds delivery fee for total");
  ok(order.status === "processing", "cash order starts at processing");

  console.log("\n— العزل بين الأدوار —");
  ok((await api("POST", "/api/orders", rest.token, { restaurantId: r.id, items: [{ itemId: a.id, qty: 1 }] })).status === 403, "non-customer cannot place order");
  const custList = (await api("GET", "/api/orders", cust.token)).body.orders;
  ok(custList.every((o) => o.customerId === cust.user.id), "customer sees only own orders");
  const restList = (await api("GET", "/api/orders", rest.token)).body.orders;
  ok(restList.some((o) => o.id === order.id), "restaurant sees its incoming order");
  let capList = (await api("GET", "/api/orders", cap.token)).body.orders;
  ok(!capList.some((o) => o.id === order.id), "captain does NOT see order before it is ready");
  ok((await api("GET", "/api/orders/" + order.id, cap.token)).status === 404, "captain cannot view a not-yet-ready order");

  console.log("\n— دورة حياة الطلب وقواعد الانتقال —");
  ok((await api("POST", "/api/orders/" + order.id + "/transition", cap.token, { action: "accept" })).status === 403, "captain cannot accept (restaurant action)");
  ok((await api("POST", "/api/orders/" + order.id + "/transition", rest.token, { action: "accept" })).body.order.status === "preparing", "restaurant accept -> preparing");
  ok((await api("POST", "/api/orders/" + order.id + "/transition", cap.token, { action: "deliver" })).status >= 400, "cannot deliver before ready");
  ok((await api("POST", "/api/orders/" + order.id + "/transition", rest.token, { action: "ready" })).body.order.status === "ready", "restaurant ready");
  capList = (await api("GET", "/api/orders", cap.token)).body.orders;
  ok(capList.some((o) => o.id === order.id), "captain now sees the ready order");
  ok((await api("POST", "/api/orders/" + order.id + "/transition", cap.token, { action: "claim" })).body.order.captainId === cap.user.id, "captain claims order");
  ok((await api("POST", "/api/orders/" + order.id + "/transition", cap.token, { action: "pickup" })).body.order.status === "onway", "captain pickup -> onway");
  const delivered = (await api("POST", "/api/orders/" + order.id + "/transition", cap.token, { action: "deliver" })).body.order;
  ok(delivered.status === "delivered" && delivered.paid === true, "captain deliver -> delivered + marked paid");
  ok((await api("POST", "/api/orders/" + order.id + "/transition", rest.token, { action: "accept" })).status >= 400, "rank guard: no transition after delivered");
  ok((await api("POST", "/api/orders/" + order.id + "/transition", cap.token, { action: "cancel" })).status === 403, "captain cannot cancel");

  console.log("\n— الدفع الأونلاين والإلغاء —");
  const onlineOrder = (await api("POST", "/api/orders", cust.token, { restaurantId: r.id, payMethod: "online", items: [{ itemId: a.id, qty: 1 }] })).body.order;
  ok(onlineOrder.status === "unpaid" && onlineOrder.paid === false, "online order starts unpaid");
  ok((await api("POST", "/api/orders/" + onlineOrder.id + "/transition", rest.token, { action: "accept" })).status >= 400, "restaurant cannot accept an unpaid order");
  const confirmed = (await api("POST", "/api/orders/" + onlineOrder.id + "/transition", admin.token, { action: "confirm-payment" })).body.order;
  ok(confirmed.status === "processing" && confirmed.paid === true, "admin confirm-payment -> processing + paid");
  const canceled = (await api("POST", "/api/orders/" + onlineOrder.id + "/transition", cust.token, { action: "cancel" })).body.order;
  ok(canceled.status === "canceled", "customer cancels own order");

  console.log("\n— Realtime (SSE) —");
  const events = [];
  await new Promise((resolve) => {
    const req = http.get(base + "/api/stream?token=" + admin.token, (rr) => {
      rr.setEncoding("utf8");
      rr.on("data", (d) => { if (d.includes("event: order")) { events.push("order"); try { req.destroy(); } catch (e) {} resolve(); } });
    });
    setTimeout(() => { api("POST", "/api/orders", cust.token, { restaurantId: r.id, payMethod: "cash", items: [{ itemId: a.id, qty: 1 }] }); }, 250);
    setTimeout(() => { try { req.destroy(); } catch (e) {} resolve(); }, 2500);
  });
  ok(events.includes("order"), "admin receives realtime order event over SSE");

  console.log("\n— التسجيل العام —");
  const reg = await api("POST", "/api/auth/register", null, { role: "customer", name: "زبون جديد", phone: "5555", password: "secret1" });
  ok(reg.status === 201 && reg.body.token, "public can register as customer");
  const sneaky = await api("POST", "/api/auth/register", null, { role: "admin", name: "x", phone: "9999", password: "secret1" });
  ok(sneaky.body.user.role !== "admin", "register cannot self-assign admin role");

  console.log("\nRESULT: " + pass + " passed, " + fail + " failed\n");
  srv.close();
  cleanup();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); try { srv.close(); } catch (x) {} cleanup(); process.exit(1); });

/* ============================================================
   منطق الطلبات — التسعير على الخادم + قواعد الانتقال حسب الدور والحالة
   كل قاعدة عمل تُفرض هنا (لا نثق بالعميل)
   ============================================================ */
"use strict";

const { db } = require("./db");
const catalog = require("./catalog");

/* ترتيب الحالات — يمنع الرجوع للخلف */
const RANK = { unpaid: 1, processing: 2, new: 3, preparing: 4, ready: 5, onway: 6, delivered: 7, rejected: 100, canceled: 100 };

function httpErr(code, msg) { const e = new Error(msg); e.status = code; return e; }

function genNumber() {
  return "SB-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(Math.random() * 900 + 100);
}

function rowToOrder(r) {
  if (!r) return null;
  return {
    id: r.id, number: r.number, status: r.status,
    customerId: r.customer_id, customerName: r.customer_name, customerPhone: r.customer_phone,
    restaurantId: r.restaurant_id, restaurantName: r.restaurant_name,
    captainId: r.captain_id, captainName: r.captain_name,
    items: JSON.parse(r.items || "[]"),
    subtotal: r.subtotal, deliveryFee: r.delivery_fee, total: r.total,
    payMethod: r.pay_method, paid: !!r.paid, note: r.note, rejectReason: r.reject_reason,
    address: r.address, area: r.area, etaMin: r.eta_min, etaMax: r.eta_max,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function getOrder(id) {
  return rowToOrder(db.prepare("SELECT * FROM orders WHERE id = ?").get(id));
}

function recordEvent(orderId, type, role, actorId, from, to, payload) {
  db.prepare(
    "INSERT INTO order_events(order_id, type, actor_role, actor_id, from_status, to_status, payload, created_at) VALUES(?,?,?,?,?,?,?,?)"
  ).run(orderId, type, role || null, actorId != null ? actorId : null, from || null, to || null, JSON.stringify(payload || {}), Date.now());
}

/* ---------- إنشاء طلب (التسعير من الكتالوج، يتجاهل أي سعر من العميل) ---------- */
function createOrder(user, body) {
  const rid = Number(body && body.restaurantId);
  const rest = catalog.getRestaurant(rid);
  if (!rest || rest.status !== "active") throw httpErr(400, "restaurant not found");
  if (!body || !Array.isArray(body.items) || body.items.length === 0) throw httpErr(400, "items required");

  let subtotal = 0;
  const items = [];
  for (const line of body.items) {
    const it = catalog.getItem(Number(line && line.itemId));
    if (!it || it.restaurant_id !== rid) throw httpErr(400, "invalid item " + (line && line.itemId));
    if (!it.available) throw httpErr(400, "item unavailable: " + it.name);
    const qty = Math.max(1, Math.min(50, parseInt(line.qty, 10) || 1));
    subtotal += it.price * qty;
    items.push({ id: it.id, name: it.name, price: it.price, qty });
  }

  const deliveryFee = rest.delivery_fee;
  const total = subtotal + deliveryFee;
  const payMethod = body.payMethod === "online" ? "online" : "cash";
  const status = payMethod === "online" ? "unpaid" : "processing"; // أونلاين ينتظر تأكيد الإدارة
  const now = Date.now();
  const number = genNumber();

  const info = db.prepare(`INSERT INTO orders
    (number, status, customer_id, customer_name, customer_phone, restaurant_id, restaurant_name,
     items, subtotal, delivery_fee, total, pay_method, paid, note, address, area, eta_min, eta_max, created_at, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    number, status, user.id, user.name, user.phone, rid, rest.name,
    JSON.stringify(items), subtotal, deliveryFee, total, payMethod, 0,
    String(body.note || ""), String(body.address || ""), String(body.area || rest.area || ""),
    rest.eta_min, rest.eta_max, now, now
  );
  const id = Number(info.lastInsertRowid);
  recordEvent(id, "created", user.role, user.id, null, status, { payMethod });
  return getOrder(id);
}

/* ---------- قواعد الانتقال ---------- */
const TRANSITIONS = {
  "confirm-payment": { roles: ["admin"], from: ["unpaid"], to: "processing", apply: () => ({ paid: 1 }) },
  accept:   { roles: ["restaurant"], from: ["processing", "new"], to: "preparing", owner: "restaurant" },
  ready:    { roles: ["restaurant"], from: ["preparing"], to: "ready", owner: "restaurant" },
  reject:   { roles: ["restaurant"], from: ["processing", "new", "preparing"], to: "rejected", owner: "restaurant", reason: true },
  claim:    { roles: ["captain"], from: ["ready"], to: "ready", requireUnassigned: true, assignCaptain: true },
  pickup:   { roles: ["captain"], from: ["ready"], to: "onway", owner: "captain" },
  deliver:  { roles: ["captain"], from: ["onway"], to: "delivered", owner: "captain", apply: () => ({ paid: 1 }) },
  dispatch: { roles: ["admin"], from: ["processing", "new", "preparing", "ready"], to: null, assignFromBody: true },
  cancel:   { roles: ["admin", "customer"], from: ["unpaid", "processing", "new", "preparing", "ready"], to: "canceled", customerOwn: true },
};

function transition(user, orderId, action, body) {
  const t = TRANSITIONS[action];
  if (!t) throw httpErr(400, "unknown action");
  if (!t.roles.includes(user.role)) throw httpErr(403, "role not allowed for " + action);

  const o = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  if (!o) throw httpErr(404, "order not found");

  if (t.owner === "restaurant" && o.restaurant_id !== user.restaurant_id) throw httpErr(403, "not your restaurant");
  if (t.owner === "captain" && o.captain_id !== user.id) throw httpErr(403, "not your delivery");
  if (t.customerOwn && user.role === "customer" && o.customer_id !== user.id) throw httpErr(403, "not your order");
  if (t.from && !t.from.includes(o.status)) throw httpErr(409, "invalid transition: " + o.status + " -> " + action);
  if (t.requireUnassigned && o.captain_id) throw httpErr(409, "order already claimed");

  const fields = {};
  let to = t.to;

  if (t.reason) fields.reject_reason = String((body && body.reason) || "");
  if (t.assignCaptain) { fields.captain_id = user.id; fields.captain_name = user.name; }
  if (t.assignFromBody) {
    const cap = require("./auth").userById(Number(body && body.captainId));
    if (!cap || cap.role !== "captain") throw httpErr(400, "valid captainId required");
    fields.captain_id = cap.id; fields.captain_name = cap.name;
  }
  if (t.apply) Object.assign(fields, t.apply(o));

  if (to && to !== o.status) {
    if (RANK[to] < RANK[o.status] && RANK[to] < 100) throw httpErr(409, "cannot move backwards");
    fields.status = to;
  }
  fields.updated_at = Date.now();

  const keys = Object.keys(fields);
  const sets = keys.map((k) => k + " = ?").join(", ");
  const vals = keys.map((k) => fields[k]);
  db.prepare("UPDATE orders SET " + sets + " WHERE id = ?").run(...vals, orderId);

  recordEvent(orderId, action, user.role, user.id, o.status, fields.status || o.status, body || {});
  return getOrder(orderId);
}

/* ---------- قراءة محصورة حسب الدور ---------- */
function listForUser(user) {
  if (user.role === "admin")
    return db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all().map(rowToOrder);
  if (user.role === "restaurant")
    return db.prepare("SELECT * FROM orders WHERE restaurant_id = ? ORDER BY created_at DESC").all(user.restaurant_id).map(rowToOrder);
  if (user.role === "captain")
    return db.prepare("SELECT * FROM orders WHERE (status = 'ready' AND captain_id IS NULL) OR captain_id = ? ORDER BY created_at DESC").all(user.id).map(rowToOrder);
  return db.prepare("SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC").all(user.id).map(rowToOrder);
}

function canView(user, o) {
  if (!o) return false;
  if (user.role === "admin") return true;
  if (user.role === "restaurant") return o.restaurantId === user.restaurant_id;
  if (user.role === "captain") return (o.status === "ready" && !o.captainId) || o.captainId === user.id;
  return o.customerId === user.id;
}

module.exports = { createOrder, transition, listForUser, getOrder, canView, recordEvent, RANK, httpErr };

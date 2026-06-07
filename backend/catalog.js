/* ============================================================
   الكتالوج — المطاعم والمنيو (مصدر الأسعار الموثوق على الخادم)
   التسعير يُحسب من هنا، لا يُؤخذ من العميل أبداً
   ============================================================ */
"use strict";

const { db } = require("./db");

const SEED_RESTAURANTS = [
  {
    name: "مطعم بيت الشام", area: "شارع الجامعة", phone: "0791 234 567",
    delivery_fee: 8, eta_min: 20, eta_max: 35,
    items: [
      { name: "شاورما عربي دجاج", price: 6 },
      { name: "بطاطا مقلية وسط", price: 3 },
      { name: "صحن حمص", price: 4 },
      { name: "كولا ١ لتر", price: 2 },
    ],
  },
  {
    name: "بيتزا فورنو", area: "وسط البلد", phone: "0792 888 444",
    delivery_fee: 10, eta_min: 25, eta_max: 45,
    items: [
      { name: "بيتزا خضار كبير", price: 18 },
      { name: "بيتزا سجق وسط", price: 15 },
      { name: "خبز بالثوم", price: 5 },
      { name: "عصير برتقال", price: 3 },
    ],
  },
];

function seedCatalog() {
  if (db.prepare("SELECT COUNT(*) AS c FROM restaurants").get().c > 0) return;
  const insR = db.prepare(
    "INSERT INTO restaurants(name, area, phone, delivery_fee, eta_min, eta_max, status, created_at) VALUES(?,?,?,?,?,?,?,?)"
  );
  const insI = db.prepare("INSERT INTO menu_items(restaurant_id, name, price, available) VALUES(?,?,?,1)");
  for (const r of SEED_RESTAURANTS) {
    const info = insR.run(r.name, r.area, r.phone, r.delivery_fee, r.eta_min, r.eta_max, "active", Date.now());
    const rid = Number(info.lastInsertRowid);
    for (const it of r.items) insI.run(rid, it.name, it.price);
  }
}

function listRestaurants() {
  return db.prepare("SELECT id, name, area, phone, delivery_fee, eta_min, eta_max, status FROM restaurants WHERE status = 'active'").all();
}
function listMenu(rid) {
  return db.prepare("SELECT id, name, price, available FROM menu_items WHERE restaurant_id = ? AND available = 1").all(rid);
}
function getRestaurant(rid) {
  return db.prepare("SELECT * FROM restaurants WHERE id = ?").get(rid) || null;
}
function getItem(id) {
  return db.prepare("SELECT * FROM menu_items WHERE id = ?").get(id) || null;
}

module.exports = { seedCatalog, listRestaurants, listMenu, getRestaurant, getItem, SEED_RESTAURANTS };

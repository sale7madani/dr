/* ============================================================
   الكتالوج — مصدر واحد للحقيقة
   يُحمّل كتالوج الزبون الغني من apps/customer/customer-data.js (نفس البيانات،
   بلا تكرار) ويوفّر تسعيراً موثوقاً على الخادم (يتجاهل أي سعر من العميل).
   ============================================================ */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

let SB = null;
function load() {
  if (SB) return SB;
  const file = path.join(__dirname, "..", "apps", "customer", "customer-data.js");
  const code = fs.readFileSync(file, "utf8");
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: "customer-data.js" });
  SB = sandbox.window.SB;
  if (!SB || !SB.RESTAURANTS) throw new Error("catalog: failed to load customer-data.js");
  return SB;
}

function restaurants() { return load().RESTAURANTS; }
function modGroups() { return load().MOD_GROUPS; }
function getRestaurant(rid) { return load().findRestaurant(rid); }
function findItem(rid, iid) { return load().findItem(rid, iid); }

/* تسعير موثوق: السعر الأساس من الصنف + أسعار الإضافات من MOD_GROUPS */
function unitPrice(rid, line) {
  const it = findItem(rid, line.id != null ? line.id : line.itemId);
  if (!it) return null;
  let unit = it.price;
  const MG = modGroups();
  const selected = line.mods || {};
  (it.mods || []).forEach((gid) => {
    const g = MG[gid]; if (!g) return;
    const sel = selected[gid] || [];
    (g.options || []).forEach((o) => { if (sel.includes(o.id)) unit += (o.price || 0); });
  });
  return { item: it, unit };
}

module.exports = { restaurants, modGroups, getRestaurant, findItem, unitPrice, load };

/* ============================================================
   البريد — تأكيد الطلب وتحديثات الحالة عبر الإيميل
   نقل قابل للتبديل: SMTP حقيقي عند ضبط متغيّرات البيئة (SMTP_HOST...)،
   وإلا "صندوق صادر" محليّ (ملفّات + سجلّ + /api/emails) — جاهز للتجربة الآن.
   ============================================================ */
"use strict";

const fs = require("fs");
const path = require("path");

const OUTBOX_DIR = path.join(__dirname, "outbox");
const mem = []; // آخر الرسائل (لـ /api/emails)
let transport = null;

function smtpConfigured() { return !!process.env.SMTP_HOST; }

function record(msg, via, error) {
  mem.unshift({ to: msg.to, subject: msg.subject, text: msg.text, via, error: error || null, at: Date.now() });
  if (mem.length > 200) mem.pop();
  console.log("[email] " + via + " → " + msg.to + " : " + msg.subject + (error ? " (" + error + ")" : ""));
}

async function deliver(msg) {
  if (!msg || !msg.to) return { ok: false, error: "no recipient" };
  // 1) SMTP حقيقي إن توفّر (يحتاج nodemailer + شبكة)
  if (smtpConfigured()) {
    try {
      if (!transport) {
        const nodemailer = require("nodemailer"); // اختياري — يُحمّل فقط عند ضبط SMTP
        transport = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === "true",
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
        });
      }
      await transport.sendMail({ from: process.env.MAIL_FROM || "Sonbol <no-reply@sonbol.app>", to: msg.to, subject: msg.subject, text: msg.text });
      record(msg, "smtp");
      return { ok: true, via: "smtp" };
    } catch (e) {
      record(msg, "smtp-failed", e.message); // ثم نقع على الصندوق المحلّي
    }
  }
  // 2) صندوق صادر محلّي
  try {
    fs.mkdirSync(OUTBOX_DIR, { recursive: true });
    const id = Date.now() + "-" + Math.floor(Math.random() * 1e4);
    fs.writeFileSync(path.join(OUTBOX_DIR, id + ".txt"), "TO: " + msg.to + "\nSUBJECT: " + msg.subject + "\n\n" + msg.text);
  } catch (e) {}
  record(msg, "outbox");
  return { ok: true, via: "outbox" };
}

function outbox() { return mem; }

/* ---------- قوالب ---------- */
function money(n) { return Math.round(n) + " ₪"; }
function lines(o) { return (o.items || []).map((i) => "• " + i.name + " ×" + i.qty).join("\n"); }

function sendOrderConfirmation(o, email) {
  if (!email) return Promise.resolve();
  const text =
    "مرحباً " + (o.customerName || "") + "،\n\n" +
    "تم استلام طلبك في سنبل وتأكيده ✅\n\n" +
    "رقم الطلب: " + o.number + "\n" +
    "المطعم: " + (o.restaurantName || "") + "\n\n" +
    lines(o) + "\n\n" +
    "المجموع: " + money(o.total) + "  (يشمل التوصيل " + money(o.deliveryFee) + ")\n" +
    "الدفع: نقداً عند الاستلام\n\n" +
    "سنُعلمك عند تحديث حالة طلبك. شكراً لاختيارك سنبل 🌾";
  return deliver({ to: email, subject: "تأكيد طلبك #" + o.number + " — سنبل", text });
}

const STATUS_AR = {
  preparing: "يُحضَّر الآن في المطعم",
  ready: "جاهز بانتظار الكابتن",
  onway: "المندوب في الطريق إليك 🛵",
  delivered: "تم التسليم — صحتين وعافية 🌿",
  rejected: "اعتذر المطعم عن تنفيذ الطلب",
  canceled: "تم إلغاء الطلب",
};
function sendStatusUpdate(o, email, status) {
  if (!email || !STATUS_AR[status]) return Promise.resolve();
  const text =
    "تحديث على طلبك #" + o.number + "\n\n" +
    "الحالة الآن: " + STATUS_AR[status] + "\n" +
    "المطعم: " + (o.restaurantName || "") + "\n" +
    (o.captainName ? "الكابتن: " + o.captainName + "\n" : "") +
    "المجموع: " + money(o.total) + "\n\n" +
    "سنبل 🌾";
  return deliver({ to: email, subject: "طلبك #" + o.number + " — " + STATUS_AR[status], text });
}

module.exports = { deliver, outbox, sendOrderConfirmation, sendStatusUpdate, smtpConfigured, STATUS_AR };

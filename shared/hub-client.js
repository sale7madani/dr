/* ============================================================
   Sonbol Hub client — عميل ناقل الأحداث للمتصفح
   يوفّر window.SonbolHub: connect / publish / on / all / reset

   الاستخدام في كل تطبيق:
     SonbolHub.connect();
     SonbolHub.on('order', o => { ...حدّث حالتك... });
     SonbolHub.on('init',  list => { ...الطلبات الحالية... });
     SonbolHub.publish({ id, status, ... });   // عند أي إجراء من المستخدم

   ملاحظة: يعمل فقط عند التشغيل عبر خادم الـ hub (node server/server.js)،
   لأن EventSource لا يعمل على file://
   ============================================================ */
(function () {
  "use strict";

  // ترتيب الحالات (نسخة من الخادم) — للاستخدام في المنطق المحلي إن لزم
  var RANK = { unpaid: 1, processing: 2, new: 3, preparing: 4, ready: 5, onway: 6, delivered: 7, rejected: 100, canceled: 100 };

  var listeners = {};        // event -> [cb]
  var cache = {};            // id -> order
  var es = null;
  var connected = false;
  var cid = "c" + Math.random().toString(36).slice(2, 9);

  function emit(ev, data) {
    var arr = listeners[ev] || [];
    for (var i = 0; i < arr.length; i++) {
      try { arr[i](data); } catch (e) { console.error("[hub] listener error", ev, e); }
    }
  }

  function connect() {
    if (es || typeof EventSource === "undefined") {
      if (typeof EventSource === "undefined") console.warn("[hub] EventSource غير مدعوم في هذا المتصفح");
      return;
    }
    es = new EventSource("/hub/stream?cid=" + cid);

    es.addEventListener("init", function (e) {
      var s = {};
      try { s = JSON.parse(e.data); } catch (x) {}
      var list = s.orders || [];
      for (var i = 0; i < list.length; i++) cache[list[i].id] = list[i];
      connected = true;
      emit("init", list);
      emit("status", { connected: true });
    });

    es.addEventListener("order", function (e) {
      var o;
      try { o = JSON.parse(e.data); } catch (x) { return; }
      cache[o.id] = o;
      emit("order", o);
    });

    es.addEventListener("reset", function () {
      cache = {};
      emit("reset");
    });

    es.onopen = function () { connected = true; emit("status", { connected: true }); };
    es.onerror = function () { connected = false; emit("status", { connected: false }); }; // EventSource يعيد الاتصال تلقائياً
  }

  function publish(order) {
    if (!order || !order.id) { console.warn("[hub] publish: order.id required"); return Promise.resolve(); }
    order.updatedAt = Date.now();
    cache[order.id] = Object.assign({}, cache[order.id], order);
    return fetch("/hub/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cid: cid, order: order }),
    }).catch(function (e) { console.warn("[hub] publish failed", e); });
  }

  function reset() {
    return fetch("/hub/reset", { method: "POST" }).catch(function () {});
  }

  function on(ev, cb) {
    (listeners[ev] = listeners[ev] || []).push(cb);
    return function off() { listeners[ev] = (listeners[ev] || []).filter(function (f) { return f !== cb; }); };
  }

  function all() { return Object.keys(cache).map(function (k) { return cache[k]; }); }
  function get(id) { return cache[id]; }

  window.SonbolHub = {
    connect: connect, publish: publish, reset: reset, on: on, all: all, get: get, RANK: RANK,
    get cid() { return cid; },
    get connected() { return connected; },
  };
})();

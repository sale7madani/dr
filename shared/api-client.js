/* ============================================================
   Sonbol API client — عميل الباك-إند الحقيقي للمتصفح
   window.SonbolAPI: مصادقة + كتالوج + طلبات + بثّ حيّ مصادق

   الاستخدام:
     SonbolAPI.configure({ tokenKey: "sonbol_token_customer" });
     await SonbolAPI.login(phone, password);     // أو register/loginAs
     const { restaurants, mods } = await SonbolAPI.catalog();
     const { order } = await SonbolAPI.createOrder({ restaurantId, items, payMethod });
     const stop = SonbolAPI.connectStream({ onInit, onOrder, onStatus });

   يعمل فقط عبر خادم الباك-إند (npm run backend).
   ============================================================ */
(function () {
  "use strict";

  var cfg = { base: "", tokenKey: "sonbol_token" };
  function configure(o) { if (o) Object.assign(cfg, o); }

  function getToken() { try { return localStorage.getItem(cfg.tokenKey); } catch (e) { return null; } }
  function setToken(t) { try { t ? localStorage.setItem(cfg.tokenKey, t) : localStorage.removeItem(cfg.tokenKey); } catch (e) {} }
  function clearToken() { setToken(null); }
  function authed() { return !!getToken(); }

  async function request(method, path, body) {
    var headers = { "Content-Type": "application/json" };
    var tok = getToken();
    if (tok) headers["Authorization"] = "Bearer " + tok;
    var res;
    try {
      res = await fetch(cfg.base + path, { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined });
    } catch (e) {
      var ne = new Error("network"); ne.status = 0; ne.offline = true; throw ne;
    }
    var data = null;
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) {
      var err = new Error((data && data.error) || ("HTTP " + res.status));
      err.status = res.status; err.body = data;
      if (res.status === 401) clearToken();
      throw err;
    }
    return data;
  }

  /* ---------- مصادقة ---------- */
  async function register(d) { var r = await request("POST", "/api/auth/register", d); if (r && r.token) setToken(r.token); return r; }
  async function login(phone, password) { var r = await request("POST", "/api/auth/login", { phone: phone, password: password }); if (r && r.token) setToken(r.token); return r; }
  async function me() { return request("GET", "/api/me"); }
  function logout() { clearToken(); }

  /* ---------- كتالوج ---------- */
  async function catalog() { return request("GET", "/api/catalog"); }

  /* ---------- طلبات ---------- */
  async function listOrders() { return request("GET", "/api/orders"); }
  async function getOrder(id) { return request("GET", "/api/orders/" + id); }
  async function createOrder(body) { return request("POST", "/api/orders", body); }
  async function transition(id, action, extra) { return request("POST", "/api/orders/" + id + "/transition", Object.assign({ action: action }, extra || {})); }
  async function captains() { return request("GET", "/api/captains"); }

  /* ---------- بثّ حيّ مصادق (SSE) ---------- */
  function connectStream(handlers) {
    handlers = handlers || {};
    var tok = getToken();
    if (!tok || typeof EventSource === "undefined") { handlers.onStatus && handlers.onStatus({ connected: false }); return function () {}; }
    var es = new EventSource(cfg.base + "/api/stream?token=" + encodeURIComponent(tok));
    es.addEventListener("init", function (e) {
      var d = {}; try { d = JSON.parse(e.data); } catch (x) {}
      handlers.onInit && handlers.onInit(d.orders || [], d.user);
      handlers.onStatus && handlers.onStatus({ connected: true });
    });
    es.addEventListener("order", function (e) {
      var o; try { o = JSON.parse(e.data); } catch (x) { return; }
      handlers.onOrder && handlers.onOrder(o);
    });
    es.onopen = function () { handlers.onStatus && handlers.onStatus({ connected: true }); };
    es.onerror = function () { handlers.onStatus && handlers.onStatus({ connected: false }); };
    return function close() { try { es.close(); } catch (e) {} };
  }

  window.SonbolAPI = {
    configure: configure, getToken: getToken, setToken: setToken, clearToken: clearToken, authed: authed,
    request: request, register: register, login: login, me: me, logout: logout,
    catalog: catalog, listOrders: listOrders, getOrder: getOrder, createOrder: createOrder,
    transition: transition, captains: captains, connectStream: connectStream,
  };
})();

/* ============================================================
   سنبل — تنبيه صوتي للطلب الجديد (Web Audio، بدون ملفات)
   نغمة "دينغ-دونغ" متكررة تلفت الانتباه دون إزعاج حاد.
   ============================================================ */
(function () {
  "use strict";

  let ctx = null;
  let loopTimer = null;
  let muted = false;

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // نغمة واحدة (تردد، بداية، مدة، قوة)
  function tone(freq, start, dur, gainVal) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ctx.destination);
    const t = ctx.currentTime + start;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gainVal, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  // جرس مزدوج لطيف + لمسة علوية للفت الانتباه
  function chime() {
    if (muted) return;
    ensureCtx();
    const v = 0.32;
    tone(880, 0, 0.5, v);      // دينغ
    tone(660, 0.32, 0.6, v);   // دونغ
    tone(1320, 0.05, 0.22, v * 0.5); // بريق علوي
  }

  function startAlert() {
    chime();
    if (loopTimer) return;
    loopTimer = setInterval(chime, 2600); // يتكرر حتى يتعامل الكاشير
  }

  function stopAlert() {
    if (loopTimer) {
      clearInterval(loopTimer);
      loopTimer = null;
    }
  }

  // نقرة تأكيد قصيرة (قبول/جاهز)
  function blip(ok) {
    if (muted) return;
    ensureCtx();
    if (ok === false) {
      tone(300, 0, 0.18, 0.25);
    } else {
      tone(720, 0, 0.12, 0.22);
      tone(960, 0.1, 0.14, 0.22);
    }
  }

  function setMuted(m) {
    muted = m;
    if (m) stopAlert();
  }

  function isMuted() { return muted; }

  // تهيئة السياق عند أول تفاعل مستخدم (سياسة المتصفح)
  function prime() { ensureCtx(); }

  window.SunbulAudio = {
    startAlert,
    stopAlert,
    blip,
    setMuted,
    isMuted,
    prime,
  };
})();

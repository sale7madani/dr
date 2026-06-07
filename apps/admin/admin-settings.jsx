/* ============================================================
   الإعدادات — لوحة تحكم سنبل
   ============================================================ */
function SettingToggle({ on, onToggle }){
  return <button className={"switch" + (on ? " on" : "")} onClick={onToggle} aria-pressed={on}></button>;
}
function SetRow({ icon, title, sub, children }){
  return (
    <div className="set-row">
      <div className="set-row-l">
        {icon ? <span className="set-ic"><Ic2 name={icon} /></span> : null}
        <div><div className="set-t">{title}</div>{sub ? <div className="set-s">{sub}</div> : null}</div>
      </div>
      <div className="set-row-r">{children}</div>
    </div>
  );
}

function SettingsScreen({ settings, onChange, onReset, restaurants, team, onTeam }){
  const s = settings;
  const set = (patch) => onChange(patch);
  return (
    <div className="page-in">
      <div className="page-head">
        <div><div className="page-title">الإعدادات</div><div className="page-sub">إعدادات منصّة سنبل المالية والتشغيلية</div></div>
      </div>

      <div className="row-2">
        <div className="stack">
          {/* معلومات المنصّة */}
          <Panel title="معلومات المنصّة">
            <div className="grid-2">
              <div className="field" style={{ marginBottom: 0 }}><label>اسم المنصّة</label><input value={s.name} onChange={(e) => set({ name: e.target.value })} /></div>
              <div className="field" style={{ marginBottom: 0 }}><label>المدينة</label><input value={s.city} onChange={(e) => set({ city: e.target.value })} /></div>
              <div className="field" style={{ marginBottom: 0 }}><label>هاتف الدعم</label><input value={s.support} onChange={(e) => set({ support: e.target.value })} style={{ direction: "ltr", textAlign: "right" }} /></div>
              <div className="field" style={{ marginBottom: 0 }}><label>العملة</label><input value={s.currency} onChange={(e) => set({ currency: e.target.value })} /></div>
            </div>
          </Panel>

          {/* الإعدادات المالية */}
          <Panel title="الإعدادات المالية" sub="القيم الافتراضية للطلبات الجديدة">
            <div className="field">
              <label>عمولة المطاعم الافتراضية (٠٪ – ٣٠٪)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <input type="range" className="twk-slider" style={{ flex: 1 }} min="0" max="30" step="1" value={s.defaultCommission} onChange={(e) => set({ defaultCommission: Number(e.target.value) })} />
                <span style={{ fontSize: 22, fontWeight: 900, minWidth: 54, textAlign: "center", color: "var(--gold-deep)" }} className="tnum">{s.defaultCommission}%</span>
              </div>
            </div>
            <div className="grid-2">
              <div className="field" style={{ marginBottom: 0 }}><label>رسوم التوصيل (₪)</label><input type="number" value={s.deliveryFee} min="0" onChange={(e) => set({ deliveryFee: Number(e.target.value) })} /></div>
              <div className="field" style={{ marginBottom: 0 }}><label>الحد الأدنى للطلب (₪)</label><input type="number" value={s.minOrder} min="0" onChange={(e) => set({ minOrder: Number(e.target.value) })} /></div>
            </div>
            <div className="field" style={{ marginTop: 15, marginBottom: 0 }}>
              <label>يوم انتهاء الأسبوع المالي (صرف مستحقات الكباتن)</label>
              <select value={s.weekEnd} onChange={(e) => set({ weekEnd: e.target.value })}>
                {A.DAY_NAMES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </Panel>

          {/* إعدادات الكباتن */}
          <Panel title="إعدادات الكباتن">
            <SetRow icon="flame" title="الحافز الافتراضي لكل طلب" sub="يُطبّق على الكباتن الجدد">
              <div className="suffix-mini"><input type="number" value={s.defaultIncentive} min="0" step="0.5" onChange={(e) => set({ defaultIncentive: Number(e.target.value) })} /><span>₪</span></div>
            </SetRow>
            <SetRow icon="money" title="اليومية الافتراضية للكابتن الموظف" sub="عند الإضافة كموظف">
              <div className="suffix-mini"><input type="number" value={s.defaultDailyWage} min="0" onChange={(e) => set({ defaultDailyWage: Number(e.target.value) })} /><span>₪</span></div>
            </SetRow>
            <SetRow icon="navigation" title="نطاق التعيين التلقائي" sub="أقصى مسافة لاقتراح كابتن">
              <div className="suffix-mini"><input type="number" value={s.assignRadius} min="1" onChange={(e) => set({ assignRadius: Number(e.target.value) })} /><span>كم</span></div>
            </SetRow>
          </Panel>
        </div>

        <div className="stack">
          {/* حسابات استلام المنصّة */}
          <Panel title="حسابات استلام المنصّة" sub="الحسابات التي تصلها تحويلات الزبائن">
            {[
              { k: "bankPalestine", icon: "card", labelField: "رقم الحساب" },
              { k: "jawwalPay", icon: "phone", labelField: "رقم المحفظة" },
              { k: "palPay", icon: "wallet", labelField: "رقم المحفظة" },
            ].map((m) => {
              const meta = A.PAY_METHODS[m.k];
              return (
                <div key={m.k} className="pay-acc">
                  <div className="pay-acc-h">
                    <span className="pay-dot" style={{ background: meta.color }}></span>
                    <b>{meta.label}</b>
                    <span style={{ marginInlineStart: "auto" }}><SettingToggle on={s.accounts[m.k].on} onToggle={() => set({ accounts: { ...s.accounts, [m.k]: { ...s.accounts[m.k], on: !s.accounts[m.k].on } } })} /></span>
                  </div>
                  {s.accounts[m.k].on ? (
                    <div className="grid-2" style={{ marginTop: 11 }}>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <label>اسم صاحب الحساب</label>
                        <input value={s.accounts[m.k].holder} onChange={(e) => set({ accounts: { ...s.accounts, [m.k]: { ...s.accounts[m.k], holder: e.target.value } } })} placeholder="الاسم الذي يحوّل إليه الزبون" />
                      </div>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <label>{m.labelField}</label>
                        <input value={s.accounts[m.k].num} onChange={(e) => set({ accounts: { ...s.accounts, [m.k]: { ...s.accounts[m.k], num: e.target.value } } })} style={{ direction: "ltr", textAlign: "right" }} />
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </Panel>

          {/* التنبيهات */}
          <Panel title="التنبيهات">
            <SetRow icon="bag" title="طلب جديد بانتظار الاعتماد" sub="تنبيه فوري عند وصول طلب">
              <SettingToggle on={s.notif.newOrder} onToggle={() => set({ notif: { ...s.notif, newOrder: !s.notif.newOrder } })} />
            </SetRow>
            <SetRow icon="wallet" title="تحويل بنكي بانتظار التحقق" sub="عند رفع الزبون لوصل">
              <SettingToggle on={s.notif.transfer} onToggle={() => set({ notif: { ...s.notif, transfer: !s.notif.transfer } })} />
            </SetRow>
            <SetRow icon="store" title="طلب انضمام مطعم" sub="عند تقديم مطعم جديد">
              <SettingToggle on={s.notif.joinReq} onToggle={() => set({ notif: { ...s.notif, joinReq: !s.notif.joinReq } })} />
            </SetRow>
            <SetRow icon="bike" title="طلب سحب مستحقات كابتن" sub="نهاية الأسبوع المالي">
              <SettingToggle on={s.notif.payout} onToggle={() => set({ notif: { ...s.notif, payout: !s.notif.payout } })} />
            </SetRow>
          </Panel>

          {/* الأشخاص والأذونات */}
          <Panel title="الأشخاص والأذونات" sub={(team || []).length + " عضو في فريق اللوحة"} more="إضافة عضو" onMore={() => onTeam && onTeam("add")}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {(team || []).map((m) => {
                const role = A.ROLES[m.role] || A.ROLES.custom;
                const allowed = A.PERMISSIONS.filter((p) => m.perms[p.k] && m.perms[p.k] !== "none").length;
                return (
                  <div key={m.id} className="kv-row feed-clickable" onClick={() => onTeam && onTeam("edit", m)}>
                    <span className="k" style={{ gap: 11 }}><Avatar name={m.name} gold={m.role === "owner"} />
                      <span><span style={{ fontWeight: 800, color: "var(--text)", display: "block" }}>{m.name}{m.you ? " (أنت)" : ""}</span><small style={{ color: "var(--text-faint)", fontWeight: 700, fontSize: 12 }}>{m.email} · {m.role === "owner" ? "كل الأقسام" : allowed + " أقسام"}</small></span>
                    </span>
                    <span className="v" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{!m.active ? <Badge meta={{ label: "معطّل", cls: "b-gray" }} /> : null}<Badge meta={role} /></span>
                  </div>
                );
              })}
            </div>
          </Panel>

          <button className="btn btn-red-line btn-block" onClick={onReset}><Ic.refresh s={17} /> إعادة ضبط بيانات العرض التجريبي</button>
        </div>
      </div>

      <DeliveryPricing s={s} set={set} restaurants={restaurants} />
    </div>
  );
}

/* ===================== حساب التوصيل (مطعم × وجهة) ===================== */
function DeliveryPricing({ s, set, restaurants }){
  const activeRests = (restaurants || []).filter((r) => ["active", "busy", "closed"].includes(r.status));
  const [restId, setRestId] = useState(activeRests[0] ? activeRests[0].id : null);
  const matrix = s.deliveryMatrix || {};
  const priceFor = (rid, dest) => {
    const v = matrix[rid] && matrix[rid][dest];
    return v != null ? v : A.DELIVERY_DEFAULTS[dest];
  };
  const setPrice = (rid, dest, val) => {
    const next = { ...matrix, [rid]: { ...(matrix[rid] || {}), [dest]: val } };
    set({ deliveryMatrix: next });
  };
  const copyToAll = () => {
    const src = {};
    A.DESTINATIONS.forEach((d) => { src[d] = priceFor(restId, d); });
    const next = { ...matrix };
    activeRests.forEach((r) => { next[r.id] = { ...src }; });
    set({ deliveryMatrix: next });
  };

  return (
    <div style={{ marginTop: 15 }}>
      <Panel title="حساب التوصيل" sub="سعر التوصيل من المطعم إلى كل وجهة (١٤ وجهة)">
        <div className="field">
          <label>طريقة احتساب التوصيل</label>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button className={"reason-opt" + (s.deliveryMode === "flat" ? " sel" : "")} style={{ flex: 1, minWidth: 150, justifyContent: "center" }} onClick={() => set({ deliveryMode: "flat" })}>سعر ثابت</button>
            <button className={"reason-opt" + (s.deliveryMode === "km" ? " sel" : "")} style={{ flex: 1, minWidth: 150, justifyContent: "center" }} onClick={() => set({ deliveryMode: "km" })}>حسب المسافة (سعر/كم)</button>
            <button className={"reason-opt" + (s.deliveryMode === "matrix" ? " sel" : "")} style={{ flex: 1, minWidth: 150, justifyContent: "center" }} onClick={() => set({ deliveryMode: "matrix" })}>حسب المطعم والوجهة</button>
          </div>
        </div>

        {s.deliveryMode === "km" ? (
          <div style={{ maxWidth: 460 }}>
            <div className="grid-2">
              <div className="field"><label>سعر التوصيل الأساسي (₪)</label><input type="number" min="0" value={s.deliveryBase} onChange={(e) => set({ deliveryBase: Number(e.target.value) })} /></div>
              <div className="field"><label>سعر الكيلومتر (₪/كم)</label><input type="number" min="0" step="0.5" value={s.deliveryPerKm} onChange={(e) => set({ deliveryPerKm: Number(e.target.value) })} /></div>
            </div>
            <div className="notice warn" style={{ marginBottom: 0 }}><Ic.route s={18} style={{ color: "var(--gold-deep)" }} /> مثال: طلب على بعد ٤ كم = {A.money(s.deliveryBase)} + ٤ × {A.money(s.deliveryPerKm)} = <b style={{ margin: "0 4px" }}>{A.money(s.deliveryBase + 4 * s.deliveryPerKm)}</b></div>
          </div>
        ) : s.deliveryMode === "flat" ? (
          <div className="field" style={{ marginBottom: 0, maxWidth: 320 }}>
            <label>سعر التوصيل الموحّد (₪)</label>
            <input type="number" min="0" value={s.deliveryFee} onChange={(e) => set({ deliveryFee: Number(e.target.value) })} />
            <div style={{ fontSize: 12.5, color: "var(--text-faint)", fontWeight: 700, marginTop: 8 }}>يُطبّق على جميع الطلبات بغضّ النظر عن المطعم أو الوجهة.</div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              <div className="field" style={{ marginBottom: 0, minWidth: 240 }}>
                <label>اختر المطعم</label>
                <select value={restId || ""} onChange={(e) => setRestId(e.target.value)}>
                  {activeRests.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <button className="btn btn-line" onClick={copyToAll}><Ic.copy s={16} /> نسخ هذه الأسعار لكل المطاعم</button>
            </div>
            <div className="dest-grid">
              {A.DESTINATIONS.map((dest) => (
                <div className="dest-row" key={dest}>
                  <span className="dest-n"><Ic.pin s={14} style={{ color: "var(--text-faint)" }} /> {dest}</span>
                  <div className="suffix-mini">
                    <input type="number" min="0" value={priceFor(restId, dest)} onChange={(e) => setPrice(restId, dest, Number(e.target.value))} />
                    <span>₪</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="notice warn" style={{ marginTop: 16, marginBottom: 0 }}><Ic.alert s={18} style={{ color: "var(--gold-deep)" }} /> يُحتسب سعر التوصيل تلقائياً حسب مطعم الطلب ووجهة الزبون.</div>
          </>
        )}
      </Panel>
    </div>
  );
}

/* ===================== نموذج عضو الفريق (إضافة/تعديل) + الأذونات ===================== */
function TeamModal({ initial, onClose, onSubmit, onRemove }){
  const editing = !!initial;
  const [f, setF] = useState(() => initial ? { ...initial, perms: { ...initial.perms } } : {
    name: "", email: "", phone: "", role: "support", active: true, perms: A.rolePerms("support"),
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setRole = (role) => setF((p) => ({ ...p, role, perms: role === "custom" ? p.perms : A.rolePerms(role) }));
  const setPerm = (k, lvl) => setF((p) => ({ ...p, role: "custom", perms: { ...p.perms, [k]: lvl } }));
  const valid = f.name.trim() && f.email.trim();
  const isOwner = initial && initial.role === "owner";
  const LVL = [{ k: "none", l: "بدون" }, { k: "view", l: "عرض" }, { k: "edit", l: "تعديل" }];
  return (
    <Modal icon="shield" iconTone="b-purple" title={editing ? "تعديل العضو والأذونات" : "إضافة عضو للفريق"} onClose={onClose} wide
      foot={[
        editing && !isOwner ? <button key="d" className="btn btn-red-line" onClick={() => onRemove(initial)}><Ic.trash s={16} /> إزالة</button> : <button key="x" className="btn btn-line" onClick={onClose}>إلغاء</button>,
        <button key="s" className="btn btn-gold btn-block" disabled={!valid} style={!valid ? { opacity: .5 } : null} onClick={() => valid && onSubmit(f)}>{editing ? "حفظ" : "إضافة العضو"}</button>,
      ]}>
      <div className="grid-2">
        <div className="field"><label>الاسم</label><input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="الاسم الكامل" /></div>
        <div className="field"><label>البريد الإلكتروني</label><input value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="name@sonbol.ps" style={{ direction: "ltr", textAlign: "right" }} /></div>
        <div className="field"><label>الجوال</label><input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="05XX-XXX-XXX" style={{ direction: "ltr", textAlign: "right" }} /></div>
        <div className="field"><label>الحالة</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 4 }}>
            <button className={"switch" + (f.active ? " on" : "")} onClick={() => set("active", !f.active)} disabled={isOwner}></button>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{f.active ? "مُفعّل" : "معطّل"}</span>
          </div>
        </div>
      </div>
      <div className="field"><label>الدور</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.keys(A.ROLES).map((rk) => (
            <button key={rk} className={"reason-opt" + (f.role === rk ? " sel" : "")} style={{ flex: "1 1 30%", minWidth: 130, justifyContent: "flex-start", gap: 10, opacity: (isOwner && rk !== "owner") ? .4 : 1 }} onClick={() => !isOwner && setRole(rk)} disabled={isOwner && rk !== "owner"}>
              <span className="rdot"></span>
              <span style={{ textAlign: "right" }}><b style={{ display: "block", fontSize: 14 }}>{A.ROLES[rk].label}</b><small style={{ fontSize: 11.5, color: "var(--text-faint)", fontWeight: 700 }}>{A.ROLES[rk].desc}</small></span>
            </button>
          ))}
        </div>
      </div>
      <div className="sec-l" style={{ margin: "6px 0 11px" }}>الأذونات حسب القسم</div>
      <div className="perm-list">
        {A.PERMISSIONS.map((p) => (
          <div className="perm-row" key={p.k}>
            <span className="perm-n">{p.label}</span>
            <div className="seg perm-seg">
              {LVL.map((l) => <button key={l.k} className={f.perms[p.k] === l.k ? "on" : ""} onClick={() => !isOwner && setPerm(p.k, l.k)} disabled={isOwner}>{l.l}</button>)}
            </div>
          </div>
        ))}
      </div>
      {isOwner ? <div className="notice warn" style={{ marginTop: 14, marginBottom: 0 }}><Ic.shield s={18} style={{ color: "var(--gold-deep)" }} /> المالك يملك صلاحية كاملة دائماً ولا يمكن تقييده.</div> : null}
    </Modal>
  );
}

Object.assign(window, { SettingsScreen, TeamModal });

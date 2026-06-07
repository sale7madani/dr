/* ============================================================
   محرّر المطعم — المعلومات + الغلاف + المنيو + الأسعار + ساعات العمل
   ============================================================ */
function deepMenu(r){
  const src = (r && r.menu) || (r && A.restMenu(r.id)) || [];
  return src.map((s) => ({ cat: s.cat, items: s.items.map((it) => Array.isArray(it) ? [it[0], it[1], it[2] || null] : [it.name, it.price, it.img || null]) }));
}
function deepHours(r){
  const src = (r && r.hours) || A.DEFAULT_HOURS;
  return src.map((h) => ({ ...h }));
}

function RestaurantEditor({ initial, onClose, onSubmit }){
  const editing = !!initial;
  const [tab, setTab] = useState("info");
  const [f, setF] = useState(() => initial ? {
    name: initial.name, cuisine: initial.cuisine, area: initial.area, commission: initial.commission,
    prep: initial.prep || 30, desc: initial.desc || "", cover: initial.cover || null, grad: initial.grad,
    hours: deepHours(initial), menu: deepMenu(initial),
  } : {
    name: "", cuisine: "", area: A.AREAS[0], commission: 15, prep: 30, desc: "", cover: null,
    grad: "linear-gradient(135deg,#b8742a,#8f561a)", hours: deepHours(null), menu: [{ cat: "الأصناف", items: [["", 0]] }],
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const valid = f.name.trim() && f.cuisine.trim();

  // الغلاف
  const fileRef = useRef(null);
  const onPickCover = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => set("cover", rd.result);
    rd.readAsDataURL(file);
  };

  // المنيو
  const setCat = (ci, name) => setF((p) => { const m = p.menu.map((s) => ({ ...s, items: s.items.map((x) => [...x]) })); m[ci].cat = name; return { ...p, menu: m }; });
  const delCat = (ci) => setF((p) => ({ ...p, menu: p.menu.filter((_, i) => i !== ci) }));
  const addCat = () => setF((p) => ({ ...p, menu: [...p.menu, { cat: "فئة جديدة", items: [["", 0]] }] }));
  const setItem = (ci, ii, field, val) => setF((p) => { const m = p.menu.map((s) => ({ ...s, items: s.items.map((x) => [...x]) })); m[ci].items[ii][field] = field === 1 ? Number(val) : val; return { ...p, menu: m }; });
  const setItemImg = (ci, ii, e) => { const file = e.target.files && e.target.files[0]; if (!file) return; const rd = new FileReader(); rd.onload = () => setItem(ci, ii, 2, rd.result); rd.readAsDataURL(file); };
  const delItem = (ci, ii) => setF((p) => { const m = p.menu.map((s) => ({ ...s, items: s.items.map((x) => [...x]) })); m[ci].items = m[ci].items.filter((_, i) => i !== ii); return { ...p, menu: m }; });
  const addItem = (ci) => setF((p) => { const m = p.menu.map((s) => ({ ...s, items: s.items.map((x) => [...x]) })); m[ci].items.push(["", 0]); return { ...p, menu: m }; });

  // ساعات العمل
  const setHour = (i, field, val) => setF((p) => { const h = p.hours.map((x) => ({ ...x })); h[i][field] = val; return { ...p, hours: h }; });

  const submit = () => {
    if (!valid) return;
    const cleanMenu = f.menu.map((s) => ({ cat: s.cat, items: s.items.filter((it) => (it[0] || "").trim()).map((it) => [it[0].trim(), Number(it[1]) || 0, it[2] || null]) })).filter((s) => s.items.length);
    onSubmit({ ...f, menu: cleanMenu });
  };

  const TABS = [{ k: "info", l: "المعلومات" }, { k: "hours", l: "ساعات العمل" }, { k: "menu", l: "المنيو" }];

  return (
    <Modal icon="store" iconTone="b-cyan" title={editing ? "تعديل المطعم" : "إضافة مطعم"} onClose={onClose} wide
      foot={[<button key="x" className="btn btn-line" onClick={onClose}>إلغاء</button>, <button key="s" className="btn btn-gold" disabled={!valid} style={!valid ? { opacity: .5 } : null} onClick={submit}>{editing ? "حفظ التعديلات" : "إضافة المطعم"}</button>]}>
      <div className="filterbar" style={{ marginBottom: 18 }}>
        {TABS.map((t) => <button key={t.k} className={"ftab" + (tab === t.k ? " active" : "")} onClick={() => setTab(t.k)}>{t.l}{t.k === "menu" ? <span className="fp tnum">{f.menu.reduce((a, s) => a + s.items.length, 0)}</span> : null}</button>)}
      </div>

      {tab === "info" ? (
        <>
          {/* صورة الغلاف */}
          <div className="re-cover" style={f.cover ? { backgroundImage: "url(" + f.cover + ")" } : { background: f.grad }} onClick={() => fileRef.current && fileRef.current.click()}>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickCover} style={{ display: "none" }} />
            <div className="re-cover-ov"><Ic.eye s={20} /> {f.cover ? "تغيير صورة الغلاف" : "اضغط لرفع صورة الغلاف"}</div>
          </div>
          <div className="grid-2">
            <div className="field"><label>اسم المطعم</label><input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="مطعم الأصيل" /></div>
            <div className="field"><label>المنطقة</label><select value={f.area} onChange={(e) => set("area", e.target.value)}>{A.AREAS.map((a) => <option key={a} value={a}>{a}</option>)}</select></div>
          </div>
          <div className="field"><label>نوع المأكولات</label><input value={f.cuisine} onChange={(e) => set("cuisine", e.target.value)} placeholder="مشاوي ووجبات" /></div>
          <div className="field"><label>وصف المطعم</label><textarea value={f.desc} onChange={(e) => set("desc", e.target.value)} placeholder="نبذة قصيرة عن المطعم وتخصّصه…" style={{ minHeight: 64, resize: "none" }} /></div>
          <div className="grid-2">
            <div className="field" style={{ marginBottom: 0 }}><label>متوسط التحضير (دقيقة)</label><input type="number" min="5" max="90" value={f.prep} onChange={(e) => set("prep", Number(e.target.value))} /></div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>عمولة سنبل (٠٪ – ٣٠٪)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="range" className="twk-slider" style={{ flex: 1 }} min="0" max="30" step="1" value={f.commission} onChange={(e) => set("commission", Number(e.target.value))} />
                <span style={{ fontSize: 20, fontWeight: 900, minWidth: 48, textAlign: "center", color: "var(--gold-deep)" }} className="tnum">{f.commission}%</span>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {tab === "hours" ? (
        <div className="hours-edit">
          {f.hours.map((h, i) => (
            <div className={"hedit" + (h.on ? "" : " off")} key={i}>
              <button className={"switch" + (h.on ? " on" : "")} onClick={() => setHour(i, "on", !h.on)}></button>
              <span className="hedit-d">{h.d}</span>
              {h.on ? (
                <div className="hedit-times">
                  <input type="time" value={h.open} onChange={(e) => setHour(i, "open", e.target.value)} />
                  <span>–</span>
                  <input type="time" value={h.close} onChange={(e) => setHour(i, "close", e.target.value)} />
                </div>
              ) : <span className="hedit-closed">مغلق</span>}
            </div>
          ))}
        </div>
      ) : null}

      {tab === "menu" ? (
        <div className="menu-edit">
          <div className="notice warn" style={{ marginTop: -2 }}><Ic.eye s={18} style={{ color: "var(--gold-deep)" }} /> صورة الصنف تظهر في <b style={{ margin: "0 3px" }}>تطبيق الزبون</b> فقط — ولا تظهر في تطبيق المطعم.</div>
          {f.menu.map((sec, ci) => (
            <div className="me-cat" key={ci}>
              <div className="me-cat-h">
                <input className="me-cat-in" value={sec.cat} onChange={(e) => setCat(ci, e.target.value)} placeholder="اسم الفئة" />
                <button className="me-del" onClick={() => delCat(ci)} title="حذف الفئة"><Ic.trash s={16} /></button>
              </div>
              {sec.items.map((it, ii) => (
                <div className="me-item" key={ii}>
                  <label className="me-img" style={it[2] ? { backgroundImage: "url(" + it[2] + ")" } : null} title="صورة الصنف (تطبيق الزبون)">
                    <input type="file" accept="image/*" onChange={(e) => setItemImg(ci, ii, e)} style={{ display: "none" }} />
                    {!it[2] ? <Ic.plus s={14} /> : null}
                  </label>
                  <input className="me-name" value={it[0]} onChange={(e) => setItem(ci, ii, 0, e.target.value)} placeholder="اسم الصنف" />
                  <div className="suffix-mini"><input type="number" min="0" value={it[1]} onChange={(e) => setItem(ci, ii, 1, e.target.value)} /><span>₪</span></div>
                  <button className="me-del" onClick={() => delItem(ci, ii)} title="حذف"><Ic.x s={16} /></button>
                </div>
              ))}
              <button className="btn btn-sm btn-line" style={{ marginTop: 4 }} onClick={() => addItem(ci)}><Ic.plus s={15} /> إضافة صنف</button>
            </div>
          ))}
          <button className="btn btn-ghost btn-block" onClick={addCat}><Ic.plus s={17} /> إضافة فئة جديدة</button>
        </div>
      ) : null}
    </Modal>
  );
}

window.RestaurantEditor = RestaurantEditor;

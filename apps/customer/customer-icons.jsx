/* ============================================================
   أيقونات إضافية لواجهة الزبون — تُدمج في Ic
   ============================================================ */
(function () {
  function mk(children, sw) {
    return function Icon(props) {
      const s = (props && props.s) || 22;
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={sw || 2}
          strokeLinecap="round" strokeLinejoin="round"
          style={props && props.style} aria-hidden="true">
          {children}
        </svg>
      );
    };
  }
  function mkFill(children) {
    return function Icon(props) {
      const s = (props && props.s) || 22;
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"
          style={props && props.style} aria-hidden="true">
          {children}
        </svg>
      );
    };
  }

  const extra = {
    star: mkFill(<path d="M12 2.2l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.9 6.1 20.2l1.2-6.5L2.5 9.1l6.6-.9z" />),
    starline: mk(<path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.3 19.6l1-6L3 9.4l6-.9z" />, 1.8),
    heart: mk(<path d="M12 20s-7-4.5-7-9.5A3.7 3.7 0 0 1 12 7a3.7 3.7 0 0 1 7 3.5C19 15.5 12 20 12 20z" />, 1.9),
    heartFill: mkFill(<path d="M12 20.5s-7.5-4.7-7.5-10A4 4 0 0 1 12 7a4 4 0 0 1 7.5 3.5c0 5.3-7.5 10-7.5 10z" />),
    upload: mk(<><path d="M12 16V5" /><path d="M8 9l4-4 4 4" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></>),
    camera: mk(<><path d="M3 8a2 2 0 0 1 2-2h2l1.2-2h7.6L19 6h0a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><circle cx="12" cy="12.5" r="3.3" /></>, 1.8),
    image: mk(<><rect x="3" y="4" width="18" height="16" rx="2.5" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="M21 16l-5-5L5 20" /></>, 1.8),
    home: mk(<><path d="M4 11l8-6 8 6" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" /></>, 1.9),
    work: mk(<><rect x="3.5" y="8" width="17" height="11" rx="2" /><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></>, 1.9),
    plusc: mk(<><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>, 1.9),
    minus: mk(<path d="M5 12h14" />, 2.4),
    cart: mk(<><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2.5 3h2.2l2.3 12.5h11l2-9H6.5" /></>, 1.9),
    receipt: mk(<><path d="M6 3h12v18l-2-1.4L14 21l-2-1.4L10 21l-2-1.4L6 21z" /><path d="M9 8h6M9 12h6M9 16h3" /></>, 1.7),
    shield: mk(<><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></>, 1.8),
    chevL: mk(<path d="M15 5l-7 7 7 7" />, 2.3),
    chevR: mk(<path d="M9 5l7 7-7 7" />, 2.3),
    chevDown: mk(<path d="M6 9l6 6 6-6" />, 2.2),
    sliders: mk(<><path d="M4 7h10M18 7h2" /><path d="M4 12h2M10 12h10" /><path d="M4 17h8M16 17h4" /><circle cx="15" cy="7" r="2.2" /><circle cx="8" cy="12" r="2.2" /><circle cx="14" cy="17" r="2.2" /></>, 1.8),
    tag: mk(<><path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9z" /><circle cx="8" cy="8" r="1.4" /></>, 1.8),
    percent: mk(<><circle cx="7.5" cy="7.5" r="2.2" /><circle cx="16.5" cy="16.5" r="2.2" /><path d="M18 6L6 18" /></>, 1.8),
    info: mk(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>, 1.9),
    chat: mk(<path d="M4 5h16v11H9l-4 3.5V16H4z" />, 1.9),
    wrap: mk(<><path d="M12 3v18" /><path d="M7 6c3 1 7 1 10 0M6 12c4 1.5 8 1.5 12 0M7 18c3-1 7-1 10 0" /></>, 1.7),
    cake: mk(<><path d="M4 21h16v-7H4z" /><path d="M4 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" /><path d="M12 6v4M12 4l1 2h-2z" /></>, 1.7),
    burger: mk(<><path d="M4 9a8 4 0 0 1 16 0z" /><path d="M4 12h16" /><path d="M5 15h14a4 4 0 0 1-4 3H9a4 4 0 0 1-4-3z" /></>, 1.7),
    cup: mk(<><path d="M6 8h12l-1 11H7z" /><path d="M9 8V5a3 3 0 0 1 6 0v3" /></>, 1.7),
    grid2: mk(<><rect x="4" y="4" width="6" height="6" rx="1.5" /><rect x="14" y="4" width="6" height="6" rx="1.5" /><rect x="4" y="14" width="6" height="6" rx="1.5" /><rect x="14" y="14" width="6" height="6" rx="1.5" /></>, 1.8),
    rows: mk(<><rect x="4" y="5" width="16" height="5" rx="1.5" /><rect x="4" y="14" width="16" height="5" rx="1.5" /></>, 1.8),
    edit: mk(<><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M14 6l4 4" /></>, 1.8),
    logout: mk(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>, 1.9),
    check2: mk(<path d="M5 13l4 4L19 7" />, 2.6),
    close: mk(<path d="M6 6l12 12M18 6L6 18" />, 2.2),
    timer: mk(<><circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2M9 2h6" /></>, 1.9),
    alert: mk(<><path d="M12 3l9 16H3z" /><path d="M12 10v4M12 17h.01" /></>, 1.9),
    wallet: mk(<><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18" /><circle cx="17" cy="14" r="1.4" fill="currentColor" stroke="none" /></>, 1.8),
    bank: mk(<><path d="M4 10h16M5 10l7-5 7 5M6 10v7M10 10v7M14 10v7M18 10v7M4 20h16" /></>, 1.7),
    copy: mk(<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></>, 1.8),
    refresh: mk(<><path d="M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2" /><path d="M18 3v6h-6M6 21v-6h6" /></>, 1.8),
    motor: mk(<><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M6 17l5-7h3l2 7" /><path d="M11 10l-1-3H8" /><path d="M15 10h3" /></>, 1.8),
  };

  function attach() {
    if (window.Ic) { Object.assign(window.Ic, extra); }
    else { setTimeout(attach, 0); }
  }
  attach();
})();

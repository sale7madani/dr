/* ============================================================
   أيقونات خطية — لوحة تحكم سنبل
   ============================================================ */
function mkIcon(children, sw){
  return function Icon(props){
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

const Ic = {
  grid: mkIcon(<><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></>),
  bag: mkIcon(<><path d="M6 8h12l-1 12H7z"/><path d="M9 8a3 3 0 0 1 6 0"/></>),
  bike: mkIcon(<><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-8h5l3 8"/><path d="M10 9l-1-3H7"/><path d="M15 9h3"/></>, 1.8),
  store: mkIcon(<><path d="M4 9l1-4h14l1 4"/><path d="M4 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M5 9.5V20h14V9.5"/><path d="M9.5 20v-5h5v5"/></>, 1.8),
  users: mkIcon(<><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3 3 0 0 1 0 5.6"/><path d="M16.5 14.2A5.5 5.5 0 0 1 20.5 19"/></>, 1.8),
  map: mkIcon(<><path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2z"/><path d="M9 4v14"/><path d="M15 6v14"/></>, 1.8),
  wallet: mkIcon(<><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><circle cx="17" cy="14.5" r="1.3" fill="currentColor" stroke="none"/></>, 1.8),
  chart: mkIcon(<><path d="M4 20V4"/><path d="M4 20h16"/><rect x="7" y="11" width="3" height="6"/><rect x="13" y="7" width="3" height="10"/></>, 1.9),
  bell: mkIcon(<><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></>),
  clock: mkIcon(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>),
  user: mkIcon(<><circle cx="12" cy="8" r="3.4"/><path d="M5.5 19a6.5 6.5 0 0 1 13 0"/></>),
  phone: mkIcon(<path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V18a2 2 0 0 1-2.2 2A15 15 0 0 1 4 6.2 2 2 0 0 1 6 4"/>),
  pin: mkIcon(<><path d="M12 21s7-5.6 7-11a7 7 0 0 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></>),
  note: mkIcon(<><path d="M5 4h14v16l-3-2-3 2-3-2-3 2z"/><path d="M9 9h6"/><path d="M9 13h4"/></>),
  check: mkIcon(<path d="M5 13l4 4L19 7"/>, 2.4),
  checkCircle: mkIcon(<><circle cx="12" cy="12" r="9"/><path d="M8.5 12l2.5 2.5 5-5"/></>),
  x: mkIcon(<path d="M6 6l12 12M18 6L6 18"/>, 2.2),
  search: mkIcon(<><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-3.5-3.5"/></>),
  money: mkIcon(<><rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9v6M18 9v6" strokeWidth="1.6"/></>),
  card: mkIcon(<><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 9.5h19"/></>),
  arrow: mkIcon(<path d="M14 6l-6 6 6 6"/>, 2.4),
  arrowL: mkIcon(<path d="M10 6l6 6-6 6"/>, 2.4),
  plus: mkIcon(<path d="M12 5v14M5 12h14"/>, 2.2),
  truck: mkIcon(<><path d="M2.5 7h11v9h-11z"/><path d="M13.5 10h4l3 3v3h-7z"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></>),
  coffee: mkIcon(<><path d="M4 8h13v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M17 9h2a2 2 0 0 1 0 4h-2"/><path d="M7 3v2M11 3v2"/></>),
  pencil: mkIcon(<><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/></>),
  trash: mkIcon(<><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M6 7l1 13h10l1-13"/></>),
  gear: mkIcon(<><circle cx="12" cy="12" r="3"/><path d="M12 2.5l1.4 2.6 2.9-.6.6 2.9 2.6 1.4-1.4 2.6 1.4 2.6-2.6 1.4-.6 2.9-2.9-.6L12 21.5l-1.4-2.6-2.9.6-.6-2.9L4.5 15l1.4-2.6L4.5 9.8l2.6-1.4.6-2.9 2.9.6z"/></>, 1.7),
  download: mkIcon(<><path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/></>),
  filter: mkIcon(<path d="M4 5h16l-6 7v5l-4 2v-7z"/>, 1.9),
  star: mkIcon(<path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z"/>, 1.6),
  alert: mkIcon(<><path d="M12 3 2.5 20h19z"/><path d="M12 10v4"/><path d="M12 17h.01"/></>, 1.9),
  refresh: mkIcon(<><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 4v4h-4"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 20v-4h4"/></>, 1.9),
  more: mkIcon(<><circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/></>),
  eye: mkIcon(<><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></>, 1.8),
  ban: mkIcon(<><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></>, 1.9),
  building: mkIcon(<><rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/><path d="M9.5 20.5v-3h5v3"/></>, 1.7),
  route: mkIcon(<><circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="6" r="2.4"/><path d="M8 17h6a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h2"/></>, 1.8),
  navigation: mkIcon(<path d="M3 11l18-8-8 18-2-7z"/>, 1.8),
  logout: mkIcon(<><path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M10 8l-4 4 4 4"/><path d="M6 12h11"/></>, 1.9),
  list: mkIcon(<><path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/></>),
  rows: mkIcon(<><rect x="3.5" y="4.5" width="17" height="6" rx="1.5"/><rect x="3.5" y="13.5" width="17" height="6" rx="1.5"/></>, 1.8),
  cols: mkIcon(<><rect x="3.5" y="3.5" width="7" height="17" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="17" rx="1.5"/></>, 1.8),
  flame: mkIcon(<path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 11 9 13 9 13s-2-1-2-4c0-2 3-3 5-6z"/>),
  trend: mkIcon(<><path d="M3 17l6-6 4 4 8-8"/><path d="M21 7v5h-5"/></>, 1.9),
  receipt: mkIcon(<><path d="M5 3h14v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21z"/><path d="M9 8h6M9 12h6"/></>, 1.7),
  send: mkIcon(<><path d="M4 12l16-7-7 16-2-7z"/></>, 1.8),
  shield: mkIcon(<><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z"/><path d="M9 12l2 2 4-4"/></>, 1.7),
  hash: mkIcon(<><path d="M5 9h14M5 15h14M9 4l-1.5 16M16.5 4 15 20"/></>, 1.7),
  calendar: mkIcon(<><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></>, 1.8),
  power: mkIcon(<><path d="M12 4v8"/><path d="M7 6.5a7 7 0 1 0 10 0"/></>, 1.9),
  ticket: mkIcon(<><path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.5a1.8 1.8 0 0 0 0 5V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5a1.8 1.8 0 0 0 0-5z"/><path d="M14 5v14" strokeDasharray="2 2"/></>, 1.7),
  copy: mkIcon(<><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>, 1.8),
  tag: mkIcon(<><path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9z"/><circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none"/></>, 1.7),
};

window.Ic = Ic;

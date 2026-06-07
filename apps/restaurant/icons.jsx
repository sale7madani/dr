/* ============================================================
   أيقونات خطية بسيطة — سنبل
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
  bell: mkIcon(<><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></>),
  bellOff: mkIcon(<><path d="M9.5 4.5A6 6 0 0 1 18 9c0 2 .4 3.4.9 4.4"/><path d="M5 9c0 5-2 6-2 6h12"/><path d="M10 19a2 2 0 0 0 4 0"/><path d="M3 3l18 18"/></>),
  clock: mkIcon(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>),
  user: mkIcon(<><circle cx="12" cy="8" r="3.4"/><path d="M5.5 19a6.5 6.5 0 0 1 13 0"/></>),
  phone: mkIcon(<path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V18a2 2 0 0 1-2.2 2A15 15 0 0 1 4 6.2 2 2 0 0 1 6 4"/>),
  pin: mkIcon(<><path d="M12 21s7-5.6 7-11a7 7 0 0 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></>),
  note: mkIcon(<><path d="M5 4h14v16l-3-2-3 2-3-2-3 2z"/><path d="M9 9h6"/><path d="M9 13h4"/></>),
  check: mkIcon(<path d="M5 13l4 4L19 7"/>, 2.4),
  checkCircle: mkIcon(<><circle cx="12" cy="12" r="9"/><path d="M8.5 12l2.5 2.5 5-5"/></>),
  x: mkIcon(<path d="M6 6l12 12M18 6L6 18"/>, 2.2),
  flame: mkIcon(<path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 11 9 13 9 13s-2-1-2-4c0-2 3-3 5-6z"/>),
  bag: mkIcon(<><path d="M6 8h12l-1 12H7z"/><path d="M9 8a3 3 0 0 1 6 0"/></>),
  list: mkIcon(<><path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/></>),
  grid: mkIcon(<><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></>),
  chart: mkIcon(<><path d="M4 20V4"/><path d="M4 20h16"/><rect x="7" y="11" width="3" height="6"/><rect x="13" y="7" width="3" height="10"/></>, 1.9),
  search: mkIcon(<><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-3.5-3.5"/></>),
  money: mkIcon(<><rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9v6M18 9v6" strokeWidth="1.6"/></>),
  card: mkIcon(<><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 9.5h19"/></>),
  arrow: mkIcon(<path d="M14 6l-6 6 6 6"/>, 2.4),
  plus: mkIcon(<path d="M12 5v14M5 12h14"/>, 2.2),
  pause: mkIcon(<><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></>),
  coffee: mkIcon(<><path d="M4 8h13v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M17 9h2a2 2 0 0 1 0 4h-2"/><path d="M7 3v2M11 3v2"/></>),
  truck: mkIcon(<><path d="M2.5 7h11v9h-11z"/><path d="M13.5 10h4l3 3v3h-7z"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></>),
  pencil: mkIcon(<><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/></>),
  trash: mkIcon(<><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M6 7l1 13h10l1-13"/></>),
  gear: mkIcon(<><circle cx="12" cy="12" r="3"/><path d="M12 2.5l1.4 2.6 2.9-.6.6 2.9 2.6 1.4-1.4 2.6 1.4 2.6-2.6 1.4-.6 2.9-2.9-.6L12 21.5l-1.4-2.6-2.9.6-.6-2.9L4.5 15l1.4-2.6L4.5 9.8l2.6-1.4.6-2.9 2.9.6z"/></>, 1.7),
  store: mkIcon(<><path d="M4 9l1-4h14l1 4"/><path d="M4 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M5 9.5V20h14V9.5"/><path d="M9.5 20v-5h5v5"/></>, 1.8),
  bike: mkIcon(<><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-8h5l3 8"/><path d="M10 9l-1-3H7"/><path d="M15 9h3"/></>, 1.8),
  image: mkIcon(<><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="M4 17l5-5 4 4 3-3 4 4"/></>, 1.8),
  download: mkIcon(<><path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/></>),
  table: mkIcon(<><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17"/><path d="M9 9.5v10"/></>, 1.8),
  filter: mkIcon(<path d="M4 5h16l-6 7v5l-4 2v-7z"/>, 1.9),
};

window.Ic = Ic;

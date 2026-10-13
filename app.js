'use strict';
/*
 * Aplikácia obce Podbranč (PWA) – bez knižníc a bez zostavovania.
 *
 * Údaje:
 *   data/obec.json  – kontakty, úradné hodiny, odkazy (upravuje sa ručne)
 *   data/feed.json  – novinky, hlásenia rozhlasu, kalendár (generuje scripts/update_data.py)
 *
 * Obrazovky sa prepínajú cez adresu za # (napr. #odpad), takže funguje aj tlačidlo Späť.
 */

// ------------------------------------------------------------------ ikony
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  radio: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
  calplus: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 13v5"/><path d="M9.5 15.5h5"/>',
  trash: '<path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/><path d="M9 7V4h6v3"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  next: '<path d="M9 18l6-6-6-6"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  pin: '<path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  cloud: '<path d="M17.5 19H8a5 5 0 1 1 1.1-9.9A6 6 0 0 1 20 11.5a3.75 3.75 0 0 1-2.5 7.5z"/>',
  ext: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  close: '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h6"/>',
  board: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 9h10"/><path d="M7 12h6"/>',
  ball: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5l4 2.9-1.5 4.6h-5L8 10.4z"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  hill: '<path d="M3 20l6-10 4 6 3-4 5 8z"/>',
  leaf: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19l7-7"/>',
  plus: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8"/><path d="M8 12h8"/>',
  text: '<path d="M4 7V5h10v2"/><path d="M9 5v14"/><path d="M7 19h4"/><path d="M14 12v-1h7v1"/><path d="M17.5 11v8"/><path d="M16 19h3"/>',
  download: '<path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>'
};
const ic = (name, size = 22, attrs = '') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${attrs}>${ICONS[name] || ''}</svg>`;

// ------------------------------------------------------------- pomocníci
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem('pb.' + key); return v === null ? fallback : JSON.parse(v); } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('pb.' + key, JSON.stringify(value)); } catch { /* súkromný režim */ }
  }
};
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
const safeUrl = (u) => (/^https:\/\//i.test(u || '') ? esc(u) : '#');
const telHref = (n) => 'tel:' + String(n).replace(/[^\d+]/g, '');
const pressed = (b) => `aria-pressed="${b ? 'true' : 'false'}"`;
const pad = (n) => String(n).padStart(2, '0');

// Nadpisy písané celé veľkými písmenami prevedie na bežný tvar.
function niceTitle(t) {
  const letters = (t.match(/\p{L}/gu) || []);
  const upper = letters.filter((c) => c === c.toUpperCase() && c !== c.toLowerCase()).length;
  if (letters.length > 6 && upper / letters.length > 0.7) {
    const low = t.toLocaleLowerCase('sk');
    return low.charAt(0).toLocaleUpperCase('sk') + low.slice(1);
  }
  return t;
}

// ------------------------------------------------------------------ dátumy
const WD = ['nedeľa', 'pondelok', 'utorok', 'streda', 'štvrtok', 'piatok', 'sobota'];
const WD_SHORT = ['ne', 'po', 'ut', 'st', 'št', 'pi', 'so'];
const WD_IN = ['v nedeľu', 'v pondelok', 'v utorok', 'v stredu', 'vo štvrtok', 'v piatok', 'v sobotu'];
const MONTHS = ['Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún', 'Júl', 'August', 'September', 'Október', 'November', 'December'];
const MONTHS_GEN = ['januára', 'februára', 'marca', 'apríla', 'mája', 'júna', 'júla', 'augusta', 'septembra', 'októbra', 'novembra', 'decembra'];
const MON_SHORT = ['jan', 'feb', 'mar', 'apr', 'máj', 'jún', 'júl', 'aug', 'sep', 'okt', 'nov', 'dec'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysFromToday = (d) => Math.round((midnight(d) - midnight(new Date())) / 86400000);
const longDate = (d) => `${cap(WD[d.getDay()])} ${d.getDate()}. ${MONTHS_GEN[d.getMonth()]}`;
const numDate = (d) => `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
const hm = (d) => `${d.getHours()}:${pad(d.getMinutes())}`;
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function relDays(n) {
  if (n === 0) return 'dnes';
  if (n === 1) return 'zajtra';
  if (n > 1) return n < 5 ? `o ${n} dni` : `o ${n} dní`;
  return '';
}
const evDate = (e) => (e.start ? new Date(e.start) : new Date(e.date + 'T00:00:00'));
const evTime = (e) => (e.start ? 'od ' + hm(new Date(e.start)) : 'celý deň');
const evMeta = (e) => [evTime(e), e.sub].filter(Boolean).join(' · ');

// --------------------------------------------------------------- stav
const SCREENS = ['home', 'spravy', 'kalendar', 'odpad', 'viac', 'kontakty', 'podnet', 'upozornenia', 'plocha'];
const SUB = ['kontakty', 'podnet', 'upozornenia', 'plocha'];
const TITLES = {
  spravy: 'Správy', kalendar: 'Kalendár', odpad: 'Odvoz odpadu', viac: 'Viac', kontakty: 'Kontakty',
  podnet: 'Nahlásiť problém', upozornenia: 'Upozornenia', plocha: 'Pridať na plochu'
};
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

const screenFromHash = () => {
  const h = decodeURIComponent(location.hash.slice(1));
  return SCREENS.includes(h) ? h : 'home';
};

const S = {
  screen: screenFromHash(),
  newsTab: 'rozhlas',
  filter: 'vsetko',
  day: null,
  month: null,
  cat: 'osvetlenie',
  loc: null,
  locBusy: false,
  platform: isIOS ? 'iphone' : 'android',
  large: store.get('large', false),
  installHidden: store.get('installHidden', false),
  weather: store.get('weather', null),
  toast: '',
  obec: null,
  feed: null,
  loadError: false,
  loadedAt: 0,
  offline: !navigator.onLine
};
let installEvent = null;
let toastTimer;

// ------------------------------------------------------------- údaje
async function loadJSON(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(url + ': ' + res.status);
  return res.json();
}

async function loadData() {
  try {
    const [obec, feed] = await Promise.all([loadJSON('data/obec.json'), loadJSON('data/feed.json')]);
    S.obec = obec;
    S.feed = feed;
    S.loadError = false;
    S.loadedAt = Date.now();
  } catch (err) {
    console.warn('Údaje sa nepodarilo načítať', err);
    S.loadError = true;
  }
  render();
  if (S.obec) loadWeather();
}

const WMO = (c) => (c === 0 ? 'jasno' : c === 1 ? 'prevažne jasno' : c === 2 ? 'polojasno' : c === 3 ? 'zamračené'
  : c <= 48 ? 'hmla' : c <= 57 ? 'mrholenie' : c <= 67 ? 'dážď' : c <= 77 ? 'sneženie'
  : c <= 82 ? 'prehánky' : c <= 86 ? 'snehové prehánky' : 'búrka');

async function loadWeather() {
  if (S.weather && Date.now() - S.weather.t < 30 * 60e3) return;
  const { lat, lon } = S.obec.weather || {};
  if (lat == null) return;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=Europe%2FBratislava`;
    const j = await (await fetch(url)).json();
    S.weather = { t: Date.now(), temp: Math.round(j.current.temperature_2m), text: WMO(j.current.weather_code) };
    store.set('weather', S.weather);
    render();
  } catch { /* počasie je len doplnok */ }
}

const upcoming = (cat) => (S.feed?.events || [])
  .filter((e) => daysFromToday(evDate(e)) >= 0 && (!cat || e.category === cat))
  .sort((a, b) => evDate(a) - evDate(b));

// ------------------------------------------------------------ úradné hodiny
function officeStatus(hours) {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const short = (s) => s.replace(/^0/, '');
  const today = hours.find((h) => h.day === now.getDay());
  for (const [from, to] of today?.slots || []) {
    if (mins >= toMin(from) && mins < toMin(to)) return { open: true, title: 'Obecný úrad je otvorený', sub: `Dnes do ${short(to)}` };
  }
  const startedToday = (today?.slots || []).some(([from]) => toMin(from) <= mins);
  for (let i = 0; i < 8; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const h = hours.find((x) => x.day === d.getDay());
    for (const [from] of h?.slots || []) {
      if (i === 0 && toMin(from) <= mins) continue;
      const when = i === 0 ? 'dnes' : i === 1 ? 'zajtra' : WD_IN[d.getDay()];
      const title = i === 0 ? 'Obecný úrad je teraz zatvorený' : startedToday ? 'Obecný úrad má dnes už zatvorené' : 'Obecný úrad je dnes zatvorený';
      return { open: false, title, sub: `Otvára ${when} o ${short(from)}` };
    }
  }
  return { open: false, title: 'Obecný úrad je zatvorený', sub: '' };
}

// -------------------------------------------------------- export do kalendára
const icsEsc = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (m) => '\\' + m);
const icsStamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const icsDay = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

function icsEvent(e, remind) {
  const start = evDate(e);
  const lines = ['BEGIN:VEVENT', `UID:${e.id}@podbranc-aplikacia`, `DTSTAMP:${icsStamp(new Date())}`];
  if (e.start) {
    lines.push(`DTSTART:${icsStamp(start)}`, `DTEND:${icsStamp(new Date(start.getTime() + 3600e3))}`);
  } else {
    const next = new Date(start);
    next.setDate(next.getDate() + 1);
    lines.push(`DTSTART;VALUE=DATE:${icsDay(start)}`, `DTEND;VALUE=DATE:${icsDay(next)}`);
  }
  lines.push(`SUMMARY:${icsEsc(e.title + (e.sub ? ' – ' + e.sub : ''))}`, `URL:${e.url}`);
  if (remind) {
    // pripomienka večer pred odvozom o 18:00
    const at = midnight(start);
    at.setDate(at.getDate() - 1);
    at.setHours(18, 0, 0, 0);
    lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc('Zajtra: ' + e.title)}`,
      `TRIGGER;VALUE=DATE-TIME:${icsStamp(at)}`, 'END:VALARM');
  }
  lines.push('END:VEVENT');
  return lines;
}

function downloadIcs(filename, events, remind) {
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Obec Podbranc//Aplikacia//SK', 'CALSCALE:GREGORIAN',
    ...events.flatMap((e) => icsEvent(e, remind)), 'END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// -------------------------------------------------------------- obrazovky
const toggle = (on, act, labelId) =>
  `<button class="toggle" data-act="${act}" aria-labelledby="${labelId}" ${pressed(on)}><span></span></button>`;
const datebox = (d, grey) =>
  `<span class="datebox${grey ? ' grey' : ''}"><b>${d.getDate()}</b><span>${grey ? MON_SHORT[d.getMonth()] : WD_SHORT[d.getDay()]}</span></span>`;
const extLink = (url, label) => `<a class="textbtn" href="${safeUrl(url)}" target="_blank" rel="noopener">${label} ${ic('ext', 16)}</a>`;

function installCard() {
  if (standalone || S.installHidden) return '';
  const action = installEvent
    ? `<button class="primary" data-act="install" style="min-height:44px">${ic('download', 18)}Inštalovať</button>`
    : `<button class="primary" data-act="go:plocha" style="min-height:44px">Ako na to</button>`;
  return `<section class="card pad" style="display:flex;gap:12px;align-items:flex-start">
    <img src="icons/icon-192.png" alt="" width="44" height="44" style="border-radius:10px;flex:none">
    <div class="col" style="gap:8px"><span><b>Pridajte si aplikáciu na plochu</b><br><span class="sm muted">Budete ju mať vždy poruke, ako bežnú aplikáciu.</span></span>
      <span style="display:flex">${action}</span></div>
    <button class="roundbtn" data-act="hideinstall" aria-label="Zavrieť" style="margin:-10px -10px 0 0">${ic('close', 20)}</button>
  </section>`;
}

function home() {
  const f = S.feed;
  const o = S.obec;
  const h = f.hlasenia[0];
  const waste = upcoming('odpad')[0];
  const events = upcoming('podujatia').slice(0, 3);
  const st = officeStatus(o.office.hours);

  let hlasenie = '';
  if (h) {
    const first = h.paragraphs[0];
    const short = first.length > 220 ? first.slice(0, 210).replace(/\s+\S*$/, '') + '…' : first;
    hlasenie = `<section class="alert" aria-label="Posledné hlásenie rozhlasu">
      ${ic('radio', 24, 'style="flex:none;margin-top:2px;color:var(--warn-icon)"')}
      <div class="col" style="gap:4px">
        <span class="eyebrow" style="font-size:.78em">Hlásenie rozhlasu${h.firstSeen ? ' · ' + numDate(new Date(h.firstSeen)) : ''}</span>
        <span style="font-weight:600">${esc(short)}</span>
        <button class="textbtn" data-act="go:spravy">Všetky hlásenia</button>
      </div></section>`;
  }

  let wasteCard;
  if (waste) {
    const d = evDate(waste);
    const n = daysFromToday(d);
    wasteCard = `<button class="wastecard" data-act="go:odpad">
      <span class="secthead" style="width:100%">
        <span class="eyebrow muted" style="display:flex;align-items:center;gap:8px">${ic('trash', 18)}Najbližší odvoz odpadu</span>
        <span class="pill" style="align-self:center">${relDays(n)}</span>
      </span>
      <span class="big">${longDate(d)}</span>
      <span><strong>${esc(waste.title)}</strong>${waste.sub ? '<br>' + esc(waste.sub) : ''}</span>
      <span class="sm muted">${evTime(waste)}</span>
    </button>`;
  } else {
    wasteCard = `<button class="wastecard" data-act="go:odpad"><span class="eyebrow muted">Odvoz odpadu</span><span>Ďalší termín zatiaľ nie je zverejnený.</span></button>`;
  }

  const eventList = events.length
    ? `<div class="card list">${events.map((e) => `<div class="row">${datebox(evDate(e))}<span class="col"><span class="b">${esc(e.title)}</span><span class="sm muted">${esc(evMeta(e))}</span></span></div>`).join('')}</div>`
    : `<p class="card pad muted">V kalendári obce teraz nie sú žiadne podujatia. Pozvánky nájdete aj v hláseniach rozhlasu.</p>`;

  return `<div class="stack">
  ${installCard()}
  ${hlasenie}
  ${wasteCard}
  <section class="card row" style="padding:14px 16px">
    <span class="roundbtn" style="background:${st.open ? 'var(--soft)' : '#E6E9E5'};color:${st.open ? 'var(--accent)' : '#2B312D'}">${ic('clock')}</span>
    <div class="col"><span class="b">${st.title}</span><span class="muted" style="font-size:.9em">${st.sub}</span></div>
    <a class="roundbtn callbtn" href="${telHref(o.office.callNumber)}" aria-label="Zavolať na obecný úrad">${ic('phone', 20)}</a>
  </section>
  <section class="stack" style="gap:8px">
    <div class="secthead"><h2>Najbližšie v obci</h2><button class="textbtn" data-act="go:kalendar">Kalendár</button></div>
    ${eventList}
  </section>
  <section class="stack" style="gap:8px">
    <div class="secthead"><h2>Oznamy</h2><button class="textbtn" data-act="oznamy">Všetky oznamy</button></div>
    <div class="card list">${f.news.slice(0, 3).map((n) => `<a href="${safeUrl(n.url)}" target="_blank" rel="noopener" style="display:flex;flex-direction:column;gap:2px;padding:12px 16px;text-decoration:none">
      <span class="muted" style="font-size:.82em;font-weight:600">${n.date ? numDate(new Date(n.date)) : ''}</span><span class="b">${esc(niceTitle(n.title))}</span></a>`).join('')}</div>
  </section>
</div>`;
}

function spravy() {
  const rozhlas = S.newsTab === 'rozhlas';
  const body = rozhlas
    ? `<p class="muted" style="font-size:.92em">Hlásenia obecného rozhlasu v texte – aj keď ste ich nepočuli.</p>
       ${S.feed.hlasenia.map((h) => `<article class="card pad stack" style="gap:8px">
          ${h.firstSeen ? `<span class="pill">Pridané ${numDate(new Date(h.firstSeen))}</span>` : ''}
          <div class="prose">${h.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
        </article>`).join('') || '<p class="card pad muted">Momentálne nie sú žiadne hlásenia.</p>'}
       ${extLink('https://www.podbranc.sk/p/9960/hlasenia-obecneho-rozhlasu.html', 'Hlásenia na webe obce')}`
    : S.feed.news.map((n) => `<article class="card pad stack" style="gap:8px">
        <div style="display:flex;gap:12px;align-items:flex-start">
          <div class="col" style="gap:4px">
            <span class="muted" style="font-size:.85em;font-weight:600">${n.date ? numDate(new Date(n.date)) : ''}</span>
            <h2 style="font-size:1.1em;line-height:1.3">${esc(niceTitle(n.title))}</h2>
          </div>
          ${n.image ? `<img class="thumb" src="${safeUrl(n.image)}" alt="" loading="lazy">` : ''}
        </div>
        ${n.text ? `<p class="muted">${esc(n.text)}</p>` : ''}
        ${extLink(n.url, 'Čítať na webe obce')}
      </article>`).join('');
  return `<div class="stack">
  <div class="seg" role="group" aria-label="Druh správ"><button data-act="tab:rozhlas" ${pressed(rozhlas)}>Rozhlas</button><button data-act="tab:oznamy" ${pressed(!rozhlas)}>Oznamy</button></div>
  <div class="stack" style="gap:12px">${body}</div></div>`;
}

function kalendar() {
  const today = new Date();
  const { y, m } = S.month || { y: today.getFullYear(), m: today.getMonth() };
  const inMonth = (S.feed.events || [])
    .filter((e) => { const d = evDate(e); return d.getFullYear() === y && d.getMonth() === m; })
    .filter((e) => S.filter === 'vsetko' || e.category === S.filter)
    .sort((a, b) => evDate(a) - evDate(b));
  const eventDays = new Set(inMonth.map((e) => evDate(e).getDate()));
  const list = inMonth.filter((e) => S.day === null || evDate(e).getDate() === S.day);

  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const dim = new Date(y, m + 1, 0).getDate();
  const total = Math.ceil((offset + dim) / 7) * 7;
  let cells = '';
  for (let i = 0; i < total; i++) {
    const d = i - offset + 1;
    if (d < 1 || d > dim) { cells += '<span></span>'; continue; }
    const date = new Date(y, m, d);
    const has = eventDays.has(d);
    const sel = S.day === d;
    const cls = ['day', daysFromToday(date) < 0 ? 'past' : '', sameDay(date, today) ? 'today' : '', has ? 'has' : '', sel ? 'sel' : ''].join(' ');
    cells += has
      ? `<button class="${cls}" data-act="day:${d}" ${pressed(sel)} aria-label="${d}. ${MONTHS_GEN[m]} – zobraziť udalosti"><span>${d}</span><i></i></button>`
      : `<span class="${cls}"><span>${d}</span><i></i></span>`;
  }
  const isCurrent = y === today.getFullYear() && m === today.getMonth();
  const filters = [['vsetko', 'Všetko'], ['podujatia', 'Podujatia'], ['odpad', 'Odpad']];
  const title = S.day === null ? `Udalosti – ${MONTHS[m].toLowerCase()}` : `Udalosti ${S.day}. ${MONTHS_GEN[m]}`;

  return `<div class="stack">
  <div class="chips" role="group" aria-label="Filter udalostí">${filters.map(([k, l]) => `<button class="chip" data-act="filter:${k}" ${pressed(S.filter === k)}>${l}</button>`).join('')}</div>
  <section class="card stack" style="padding:12px;gap:8px" aria-label="${MONTHS[m]} ${y}">
    <div class="secthead">
      <button class="iconbtn" data-act="month:-1" aria-label="Predchádzajúci mesiac" ${isCurrent ? 'disabled' : ''}>${ic('back', 20)}</button>
      <h2 style="font-size:1.1em">${MONTHS[m]} ${y}</h2>
      <button class="iconbtn" data-act="month:1" aria-label="Nasledujúci mesiac">${ic('next', 20)}</button>
    </div>
    <div class="cal">${['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'].map((w) => `<span class="wd">${w}</span>`).join('')}${cells}</div>
  </section>
  <div class="secthead"><h2>${title}</h2>${S.day !== null ? '<button class="textbtn" data-act="clearday">Celý mesiac</button>' : ''}</div>
  <div class="card list">${list.length ? list.map((e) => `<div class="row">${datebox(evDate(e))}
      <span class="col"><span class="b">${esc(e.title)}</span><span class="sm muted">${esc(evMeta(e))}</span></span>
      <button class="iconbtn" data-act="ics:${esc(e.id)}" aria-label="Pridať do kalendára v telefóne">${ic('calplus', 20)}</button></div>`).join('')
    : '<p class="muted" style="padding:16px">V tomto výbere nie sú žiadne udalosti.</p>'}</div>
</div>`;
}

function odpad() {
  const all = upcoming('odpad');
  const [next, ...rest] = all;
  const o = S.obec;
  const nextCard = next
    ? (() => {
      const d = evDate(next);
      return `<section style="background:var(--accent);color:#fff;border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:6px">
        <span class="eyebrow" style="opacity:.92">Najbližší odvoz · ${relDays(daysFromToday(d))}</span>
        <span style="font-size:1.6em;font-weight:700;line-height:1.2">${longDate(d)}</span>
        <span style="font-size:1.05em"><strong>${esc(next.title)}</strong>${next.sub ? ': ' + esc(next.sub) : ''}</span>
        <span style="font-size:.92em;opacity:.92">Vývoz ${evTime(next)} – nádobu vyložte večer vopred.</span>
      </section>`;
    })()
    : '<p class="card pad">Ďalší termín odvozu zatiaľ nie je zverejnený.</p>';
  return `<div class="stack">
  ${nextCard}
  ${all.length ? `<section class="card pad stack" style="gap:10px">
    <span><b>Pripomienka deň vopred</b><br><span class="sm muted">Pridajte si všetky termíny do kalendára v telefóne. Večer pred odvozom o 18:00 vám pripomenie, že treba vyložiť nádobu.</span></span>
    <button class="secondary" data-act="icswaste">${ic('calplus', 20)}Pridať odvozy do kalendára</button>
  </section>` : ''}
  ${rest.length ? `<section class="stack" style="gap:8px">
    <h2 style="font-size:1.1em">Ďalšie termíny</h2>
    <div class="card list">${rest.map((e) => {
      const d = evDate(e);
      const sorted = /triede/i.test(e.title);
      return `<div class="row">${datebox(d, true)}<span class="col" style="gap:3px">
        <span style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span class="pill${sorted ? '' : ' grey'}" style="font-size:.78em">${sorted ? 'Triedený' : 'Komunálny'}</span><span class="sm muted">${WD[d.getDay()]} ${evTime(e)}</span></span>
        <span>${esc(e.sub || e.title)}</span></span></div>`;
    }).join('')}</div>
  </section>` : ''}
  <section class="card pad stack" style="gap:8px">
    <h2 style="font-size:1.05em">Ako to funguje</h2>
    <p>${esc(o.wasteInfo)}</p>
    ${extLink(o.wasteUrl, 'Ako správne triediť')}
  </section>
</div>`;
}

const menuBtn = (act, icon, label, sub) =>
  `<button class="menu" data-act="${act}"><span class="ic">${ic(icon, 20)}</span><span class="label">${label}${sub ? `<small>${sub}</small>` : ''}</span>${ic('next', 20, 'style="color:var(--muted)"')}</button>`;
const menuLink = (l) =>
  `<a class="menu" href="${safeUrl(l.url)}" target="_blank" rel="noopener"><span class="ic">${ic(l.icon, 20)}</span><span class="label">${esc(l.label)}${l.sub ? `<small>${esc(l.sub)}</small>` : ''}</span>${ic('ext', 18, 'style="color:var(--muted)"')}</a>`;

function viac() {
  const o = S.obec;
  const updated = S.feed.updated ? new Date(S.feed.updated) : null;
  return `<div class="stack" style="gap:16px">
  <section class="stack" style="gap:8px"><h2 class="menuhead">Obec a úrad</h2><div class="card list">
    ${menuBtn('go:kontakty', 'phone', 'Kontakty a úradné hodiny')}
    ${menuBtn('go:podnet', 'flag', 'Nahlásiť problém')}
    ${o.links.uradne.map(menuLink).join('')}
  </div></section>
  <section class="stack" style="gap:8px"><h2 class="menuhead">Život v obci</h2><div class="card list">
    ${o.links.zivot.map(menuLink).join('')}
  </div></section>
  <section class="stack" style="gap:8px"><h2 class="menuhead">Aplikácia</h2><div class="card list">
    ${menuBtn('go:upozornenia', 'bell', 'Upozornenia', o.push?.enabled ? '' : 'Pripravujeme')}
    ${standalone ? '' : menuBtn('go:plocha', 'plus', 'Pridať aplikáciu na plochu')}
    <div class="menu"><span class="ic">${ic('text', 20)}</span><span class="label" id="lbl-large">Väčšie písmo</span>${toggle(S.large, 'large', 'lbl-large')}</div>
  </div></section>
  <p class="sm muted" style="text-align:center">Údaje z webu obce <a href="${safeUrl(o.web)}" target="_blank" rel="noopener">podbranc.sk</a>${updated ? `<br>Posledná zmena ${numDate(updated)} o ${hm(updated)}` : ''}</p>
</div>`;
}

function kontakty() {
  const o = S.obec.office;
  const todayDay = new Date().getDay();
  return `<div class="stack">
  <section class="card pad stack" style="gap:12px">
    <div><h2 style="font-size:1.15em">${esc(o.name)}</h2><span class="muted">${esc(o.address)}</span></div>
    <div class="grid2">
      <a class="primary" href="${telHref(o.callNumber)}" style="min-height:48px">${ic('phone', 18)}Zavolať</a>
      <a class="secondary" href="${safeUrl(o.mapUrl)}" target="_blank" rel="noopener">${ic('pin', 18)}Navigovať</a>
    </div>
    <div>
      ${o.phones.map((p) => `<a class="kv" href="${telHref(p.number)}"><span class="muted">${esc(p.label)}</span><span class="b">${esc(p.number)}</span></a>`).join('')}
      ${o.emails.map((e) => `<a class="kv" href="mailto:${esc(e.email)}"><span class="muted">${esc(e.label)}</span><span class="b">${esc(e.email)}</span></a>`).join('')}
    </div>
  </section>
  <section class="card pad stack" style="gap:6px">
    <h2 style="font-size:1.05em;margin-bottom:4px">Úradné hodiny</h2>
    <div class="hours">${o.hours.map((h) => {
      const cls = h.day === todayDay ? ' class="today"' : '';
      const val = h.slots.length ? h.slots.map(([a, b]) => `${a.replace(/^0/, '')} – ${b.replace(/^0/, '')}`).join(', ') : `<span class="muted">${esc(h.note || 'Zatvorené')}</span>`;
      return `<b${cls}>${esc(h.label)}</b><span${cls}>${val}</span>`;
    }).join('')}</div>
  </section>
  <section class="card pad stack" style="gap:12px">
    <h2 style="font-size:1.05em">Napíšte nám</h2>
    <div class="field"><label for="k-meno">Meno a priezvisko</label><input id="k-meno" type="text" autocomplete="name"></div>
    <div class="field"><label for="k-kontakt">Telefón (nepovinné)</label><input id="k-kontakt" type="tel" autocomplete="tel"></div>
    <div class="field"><label for="k-sprava">Správa</label><textarea id="k-sprava" rows="4"></textarea></div>
    <button class="primary" data-act="sendcontact">${ic('mail', 18)}Pripraviť e-mail</button>
    <p class="sm muted">Otvorí sa vaša e-mailová aplikácia s pripravenou správou pre obecný úrad.</p>
  </section>
  <section class="stack" style="gap:8px">
    <h2 style="margin:0 4px;font-size:1.05em">Užitočné čísla</h2>
    <div class="card list">${S.obec.numbers.map((n) => `<a class="row" href="${telHref(n.number)}" style="text-decoration:none"><span class="col"><span class="b">${esc(n.name)}</span><span class="muted" style="font-size:.85em">${esc(n.desc)}</span></span><span class="b" style="color:var(--accent);white-space:nowrap">${esc(n.number)}</span></a>`).join('')}
      ${S.obec.numbersNote ? `<div class="muted" style="padding:12px 16px;font-size:.9em">${esc(S.obec.numbersNote)}</div>` : ''}</div>
  </section>
</div>`;
}

const PODNET_CATS = [['osvetlenie', 'Osvetlenie'], ['cesty', 'Cesty a chodníky'], ['odpad', 'Odpad'], ['zelen', 'Zeleň'], ['ine', 'Iné']];

function podnet() {
  const locLabel = S.locBusy ? 'Zisťujem polohu…' : S.loc ? 'Poloha pridaná' : 'Pridať moju polohu';
  return `<div class="stack">
  <p class="muted">Pokazená lampa, diera na ceste, čierna skládka? Dajte nám vedieť – správa pôjde na obecný úrad.</p>
  <section class="card pad stack">
    <div class="stack" style="gap:8px"><span class="b" style="font-size:.9em">Čoho sa to týka?</span>
      <div class="chips" role="group" aria-label="Kategória podnetu">${PODNET_CATS.map(([k, l]) => `<button class="chip" data-act="cat:${k}" ${pressed(S.cat === k)}>${l}</button>`).join('')}</div></div>
    <div class="field"><label for="p-popis">Čo sa stalo a kde?</label><textarea id="p-popis" rows="4"></textarea></div>
    <button class="dashed" data-act="loc" ${S.locBusy ? 'disabled' : ''}>${ic(S.loc ? 'check' : 'pin', 20)}${locLabel}</button>
    <div class="field"><label for="p-meno">Meno</label><input id="p-meno" type="text" autocomplete="name"></div>
    <button class="primary" data-act="sendpodnet">${ic('mail', 18)}Pripraviť e-mail</button>
    <p class="sm muted">Otvorí sa vaša e-mailová aplikácia. Fotku môžete priložiť priamo v e-maile.</p>
  </section>
  <section class="card pad stack" style="gap:6px">
    <span class="b">Podnet cez web obce</span>
    <span class="sm muted">Na webe obce môžete podnet poslať aj s fotkou a sledovať, ako sa rieši.</span>
    ${extLink(S.obec.podnetUrl, 'Otvoriť formulár na webe')}
  </section>
</div>`;
}

function upozornenia() {
  if (S.obec.push?.enabled) {
    return '<p class="card pad">Upozornenia zatiaľ nie sú nastavené.</p>';
  }
  return `<div class="stack">
  <section class="card pad stack center" style="gap:10px">
    <span class="roundbtn" style="width:64px;height:64px;border-radius:32px;background:var(--soft);color:var(--accent)">${ic('bell', 30)}</span>
    <h2 style="font-size:1.2em">Upozornenia pripravujeme</h2>
    <p class="muted">Čoskoro vám aplikácia bude posielať nové hlásenia rozhlasu a dôležité oznamy priamo do telefónu.</p>
  </section>
  <section class="card pad stack" style="gap:10px">
    <span><b>Odvoz odpadu už teraz</b><br><span class="sm muted">Pridajte si termíny odvozu do kalendára v telefóne – pripomenie vám ich večer vopred.</span></span>
    <button class="secondary" data-act="icswaste">${ic('calplus', 20)}Pridať odvozy do kalendára</button>
  </section>
</div>`;
}

function plocha() {
  const ip = S.platform === 'iphone';
  const steps = ip
    ? ['Otvorte túto stránku v prehliadači Safari.', 'Ťuknite dole na tlačidlo Zdieľať (štvorček so šípkou nahor).', 'Zvoľte „Pridať na plochu“ a potvrďte „Pridať“.', 'Odteraz aplikáciu otvárajte ikonou na ploche.']
    : ['Otvorte túto stránku v prehliadači Chrome.', 'Ťuknite vpravo hore na ponuku (tri bodky).', 'Zvoľte „Inštalovať aplikáciu“ alebo „Pridať na plochu“.', 'Odteraz aplikáciu otvárajte ikonou na ploche.'];
  return `<div class="stack">
  <p>Aplikáciu nemusíte sťahovať z obchodu. Stačí si ju pridať na plochu telefónu – bude mať vlastnú ikonu a otvorí sa ako bežná aplikácia.</p>
  ${installEvent ? `<button class="primary" data-act="install">${ic('download', 20)}Inštalovať aplikáciu</button>` : ''}
  <div class="seg" role="group" aria-label="Typ telefónu"><button data-act="plat:iphone" ${pressed(ip)}>iPhone</button><button data-act="plat:android" ${pressed(!ip)}>Android</button></div>
  <ol class="steps">${steps.map((t, i) => `<li class="card row" style="align-items:flex-start;padding:14px 16px;gap:14px"><span class="num">${i + 1}</span><span style="padding-top:4px">${t}</span></li>`).join('')}</ol>
</div>`;
}

const RENDER = { home, spravy, kalendar, odpad, viac, kontakty, podnet, upozornenia, plocha };

// ------------------------------------------------------------ vykreslenie
const app = document.getElementById('app');
let lastScreen = null;

function body() {
  if (S.feed && S.obec) return RENDER[S.screen]();
  if (S.loadError) {
    return `<section class="card pad stack center" style="gap:12px;margin-top:24px">
      <h2 style="font-size:1.15em">Údaje sa nepodarilo načítať</h2>
      <p class="muted">Skontrolujte pripojenie na internet a skúste to znova.</p>
      <button class="primary" data-act="reload">${ic('refresh', 18)}Skúsiť znova</button></section>`;
  }
  return '<div class="skeleton">Načítavam…</div>';
}

function render() {
  const main = app.querySelector('main');
  const keepScroll = main && lastScreen === S.screen ? main.scrollTop : 0;
  const values = {};
  app.querySelectorAll('input[id], textarea[id]').forEach((el) => { values[el.id] = el.value; });

  const tab = SUB.includes(S.screen) ? 'viac' : S.screen;
  const navBtn = (key, icon, label) =>
    `<button data-act="go:${key}" aria-current="${tab === key ? 'page' : 'false'}"><span class="p">${ic(icon)}</span>${label}</button>`;
  const now = new Date();
  const weather = S.weather && Date.now() - S.weather.t < 3 * 3600e3
    ? `<span aria-hidden="true">·</span>${ic('cloud', 18)}<span>${S.weather.temp} °C, ${esc(S.weather.text)}</span>` : '';
  const header = S.screen === 'home'
    ? `<header class="hero"><div><small>Vitajte v obci</small><h1 tabindex="-1">Podbranč</h1></div>
        <div class="meta"><span>${longDate(now)}</span>${weather}</div></header>`
    : `<header class="bar">${SUB.includes(S.screen) ? `<button class="roundbtn" data-act="go:viac" aria-label="Späť">${ic('back', 24)}</button>` : ''}<h1 tabindex="-1">${TITLES[S.screen]}</h1></header>`;

  app.className = 'app' + (S.large ? ' large' : '');
  app.innerHTML = `${header}
  ${S.offline ? '<div class="offline" role="status">Ste offline – zobrazujú sa naposledy stiahnuté údaje.</div>' : ''}
  <main>${body()}</main>
  <nav aria-label="Hlavná navigácia">${navBtn('home', 'home', 'Domov')}${navBtn('spravy', 'radio', 'Správy')}${navBtn('kalendar', 'cal', 'Kalendár')}${navBtn('odpad', 'trash', 'Odpad')}${navBtn('viac', 'grid', 'Viac')}</nav>
  ${S.toast ? `<div class="toast" role="status">${ic('check', 20, 'style="flex:none"')}<span>${esc(S.toast)}</span></div>` : ''}`;

  app.querySelectorAll('input[id], textarea[id]').forEach((el) => { if (el.id in values) el.value = values[el.id]; });
  app.querySelector('main').scrollTop = keepScroll;
  if (lastScreen !== null && lastScreen !== S.screen) app.querySelector('h1')?.focus({ preventScroll: true });
  lastScreen = S.screen;
}

function set(patch) {
  Object.assign(S, patch);
  render();
}

function toast(msg) {
  clearTimeout(toastTimer);
  set({ toast: msg });
  toastTimer = setTimeout(() => set({ toast: '' }), 3000);
}

function go(screen) {
  const hash = screen === 'home' ? '' : '#' + screen;
  if (location.hash !== hash) {
    // pushState nevyvolá hashchange, preto vykreslíme sami
    history.pushState(null, '', hash || location.pathname + location.search);
  }
  set({ screen, day: null });
}

function mailto(to, subject, lines) {
  location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.filter(Boolean).join('\n'))}`;
}

const fieldValue = (id) => (document.getElementById(id)?.value || '').trim();

// ------------------------------------------------------------- udalosti
app.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const [act, arg] = el.dataset.act.split(':');
  switch (act) {
    case 'go': go(arg); break;
    case 'oznamy': S.newsTab = 'oznamy'; go('spravy'); break;
    case 'tab': set({ newsTab: arg }); break;
    case 'filter': set({ filter: arg, day: null }); break;
    case 'day': set({ day: S.day === +arg ? null : +arg }); break;
    case 'clearday': set({ day: null }); break;
    case 'month': {
      const t = new Date();
      const cur = S.month || { y: t.getFullYear(), m: t.getMonth() };
      const d = new Date(cur.y, cur.m + Number(arg), 1);
      set({ month: { y: d.getFullYear(), m: d.getMonth() }, day: null });
      break;
    }
    case 'ics': {
      const ev = S.feed.events.find((x) => x.id === arg);
      if (ev) { downloadIcs('podbranc-udalost.ics', [ev], false); toast('Otvorte stiahnutý súbor a udalosť sa pridá do kalendára.'); }
      break;
    }
    case 'icswaste': {
      const list = upcoming('odpad');
      if (list.length) { downloadIcs('podbranc-odvoz-odpadu.ics', list, true); toast('Otvorte stiahnutý súbor a termíny sa pridajú do kalendára.'); }
      break;
    }
    case 'large': store.set('large', !S.large); set({ large: !S.large }); break;
    case 'hideinstall': store.set('installHidden', true); set({ installHidden: true }); break;
    case 'install':
      if (installEvent) {
        installEvent.prompt();
        installEvent.userChoice.finally(() => { installEvent = null; render(); });
      }
      break;
    case 'plat': set({ platform: arg }); break;
    case 'cat': set({ cat: arg }); break;
    case 'loc':
      if (!navigator.geolocation) { toast('Tento telefón nevie zistiť polohu.'); break; }
      set({ locBusy: true });
      navigator.geolocation.getCurrentPosition(
        (pos) => set({ locBusy: false, loc: { lat: pos.coords.latitude.toFixed(5), lon: pos.coords.longitude.toFixed(5) } }),
        () => { set({ locBusy: false }); toast('Polohu sa nepodarilo zistiť. Opíšte miesto v texte.'); },
        { enableHighAccuracy: true, timeout: 15000 }
      );
      break;
    case 'sendpodnet': {
      const text = fieldValue('p-popis');
      if (!text) { toast('Napíšte prosím, čo sa stalo.'); document.getElementById('p-popis')?.focus(); break; }
      const cat = PODNET_CATS.find(([k]) => k === S.cat)?.[1] || '';
      mailto(S.obec.office.contactEmail, `Podnet z aplikácie: ${cat}`, [
        text, '',
        S.loc ? `Poloha: https://www.google.com/maps?q=${S.loc.lat},${S.loc.lon}` : '',
        fieldValue('p-meno') ? `Meno: ${fieldValue('p-meno')}` : ''
      ]);
      break;
    }
    case 'sendcontact': {
      const text = fieldValue('k-sprava');
      if (!text) { toast('Napíšte prosím správu.'); document.getElementById('k-sprava')?.focus(); break; }
      mailto(S.obec.office.contactEmail, 'Správa z aplikácie obce', [
        text, '',
        fieldValue('k-meno') ? `Meno: ${fieldValue('k-meno')}` : '',
        fieldValue('k-kontakt') ? `Telefón: ${fieldValue('k-kontakt')}` : ''
      ]);
      break;
    }
    case 'reload': set({ loadError: false }); loadData(); break;
  }
});

window.addEventListener('popstate', () => set({ screen: screenFromHash(), day: null }));
window.addEventListener('hashchange', () => set({ screen: screenFromHash(), day: null }));
window.addEventListener('online', () => { set({ offline: false }); loadData(); });
window.addEventListener('offline', () => set({ offline: true }));
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && Date.now() - S.loadedAt > 10 * 60e3) loadData();
});
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installEvent = e;
  render();
});
window.addEventListener('appinstalled', () => { installEvent = null; store.set('installHidden', true); set({ installHidden: true }); });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch((err) => console.warn('Service worker:', err)));
}

render();
loadData();

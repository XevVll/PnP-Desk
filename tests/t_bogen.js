/* ==========================================================
   CHARAKTERBOGEN UND KARTE — die drei Punkte vom 14.10.2026
   ----------------------------------------------------------
   1. Der aufgeklappte Bogen liegt ÜBER der Würfelleiste.
   2. Talente und Schwächen erklären sich beim Hovern.
   3. Von der Karte führt ein Weg zurück ins Hub.

   Die Tooltip-Funktionen werden AUS DEM QUELLTEXT von
   heldenbrief.html geschnitten und wirklich ausgeführt - eine
   nachgebaute Kopie würde genau das nicht prüfen, was gemeldet
   war. Für die Ebenen reicht der Quelltext: Ein z-index ist eine
   Zahl in einer CSS-Regel, und ihr Verhältnis zueinander ist
   genau das, worum es geht.
   ========================================================== */
const fs = require('fs'), path = require('path'), vm = require('vm');
const BASIS = path.join(__dirname, '..');
const R = require(path.join(BASIS, 'js/regelwerk.js'));

let f = 0, anzahl = 0;
const chk = (n, c, x) => { anzahl++; console.log((c ? 'OK  ' : 'FAIL') + ' ' + n + (c ? '' : '  <<< ' + JSON.stringify(x))); if (!c) f++; };

const KARTE = fs.readFileSync(path.join(BASIS, 'karte.html'), 'utf8');
const BOGEN = fs.readFileSync(path.join(BASIS, 'heldenbrief.html'), 'utf8');
const nlSep = String.fromCharCode(10);

/* Den z-index einer Regel aus dem Stylesheet holen. Ohne Treffer wird
   abgebrochen statt 0 zurueckzugeben - ein stiller Nulltreffer haette
   jede Ebenenpruefung wertlos gemacht. */
function zIndex(quelle, selektor) {
  const i = quelle.indexOf(selektor);
  if (i < 0) return null;
  const block = quelle.slice(i, quelle.indexOf('}', i));
  const m = block.match(/z-index:\s*(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

console.log('=== 1. DER BOGEN LIEGT ÜBER DER WÜRFELLEISTE ===');
const zLeiste = 350;   // aus js/dice.js, DICE_STIL
const zDrawer = zIndex(KARTE, '#charSheetDrawer {');
const zBack = zIndex(KARTE, '#charSheetBackdrop {');
chk('die Leiste steht wirklich auf ' + zLeiste,
  fs.readFileSync(path.join(BASIS, 'js/dice.js'), 'utf8')
    .indexOf('z-index:' + zLeiste) >= 0);
chk('Drawer gefunden', zDrawer !== null, zDrawer);
chk('Backdrop gefunden', zBack !== null, zBack);
chk('der Drawer liegt über der Leiste', zDrawer > zLeiste, { drawer: zDrawer, leiste: zLeiste });
chk('der Backdrop auch', zBack > zLeiste, { backdrop: zBack, leiste: zLeiste });
chk('der Drawer liegt über seinem eigenen Backdrop', zDrawer > zBack, { zDrawer, zBack });
/* Der Griff darf NICHT mitwandern: Er sitzt am linken Rand und klebte sonst
   ueber dem aufgeschlagenen Bogen. */
chk('der Griff bleibt unter dem Drawer',
  zIndex(KARTE, '#charSheetHandle {') < zDrawer, zIndex(KARTE, '#charSheetHandle {'));

console.log('');
console.log('=== 3. VON DER KARTE ZURÜCK INS HUB ===');
chk('der Link steht im Markup', KARTE.indexOf('id="zumHub"') >= 0);
chk('und zeigt auf das Hub', /id="zumHub"[^>]*href="index\.html"/.test(KARTE),
  (KARTE.match(/<a id="zumHub"[^>]*>/) || [])[0]);
chk('er ist ein echter Link, kein onclick',
  /<a id="zumHub"/.test(KARTE) && !/id="zumHub"[^>]*onclick/.test(KARTE));
const zHub = zIndex(KARTE, '#zumHub {');
/* Zuerst lag er UEBER dem Bogen, damit der Weg hinaus nie verstellt ist -
   im Bild klebte er dann auf dessen Kopfzeile. Jetzt darunter. Verstellt ist
   der Weg trotzdem nicht: Der Bogen hat seinen eigenen Hub-Knopf, und der
   fuehrt die GANZE Seite dorthin (target="_top"). Beides gehoert zusammen -
   deshalb steht die Pruefung dafuer direkt daneben. */
chk('er liegt unter dem offenen Bogen', zHub < zBack && zHub < zDrawer,
  { hub: zHub, backdrop: zBack, drawer: zDrawer });
chk('aber über der Karte selbst', zHub > 100, zHub);
chk('dafür führt der Hub-Knopf IM Bogen die ganze Seite',
  /<a class="btn" href="index\.html" target="_top">Hub<\/a>/.test(BOGEN),
  (BOGEN.match(/<a class="btn" href="index\.html"[^>]*>/) || [])[0]);
chk('ebenso "Figur ändern"',
  /href="charaktererstellung\.html" target="_top"/.test(BOGEN));
/* Dieselbe Falle traf die Sitzungssperre: Sie erscheint auch im Rahmen. */
const SITZUNG = fs.readFileSync(path.join(BASIS, 'js/sitzung.js'), 'utf8');
chk('und die Sitzungssperre ebenso',
  SITZUNG.indexOf('target=\"_top\"') >= 0 &&
  SITZUNG.indexOf('knopfZiel') >= 0);
/* Das Schliessen-Kreuz des Drawers lag auf dem Hub-Knopf des Bogens. */
chk('im Rahmen bleibt Platz fürs Schließen-Kreuz',
  BOGEN.indexOf('.imRahmen .tbin{padding-right') >= 0);
chk('und die Klasse wird nur im Rahmen gesetzt',
  BOGEN.indexOf('window.top !== window.self') >= 0 &&
  BOGEN.indexOf("classList.add('imRahmen')") >= 0);
/* In der Vorschau der Spielleitung hat ein Spieler-Hub nichts zu suchen -
   dieselbe Regel wie fuer Wuerfelleiste und Bogen. */
chk('in der Vorschau ausgeblendet', KARTE.indexOf('.preview-mode #zumHub') >= 0);
chk('die Ecke oben links war frei',
  /#zumHub \{[^}]*top: 14px; left: 14px/.test(KARTE));

console.log('');
console.log('=== 2. TALENTE UND SCHWÄCHEN ERKLÄREN SICH ===');

/* Die Funktionen aus dem Bogen schneiden und ausfuehren. */
function schnitt(von, bis) {
  const a = BOGEN.indexOf(von);
  const b = BOGEN.indexOf(bis, a);
  if (a < 0 || b < 0) { console.log('ABBRUCH: ' + von + ' nicht gefunden.'); process.exit(1); }
  return BOGEN.slice(a, b);
}
/* Die Chips kommen weiter aus heldenbrief.html, die Mechanik dahinter
   aber aus js/marken.js: Sie wird seit dem 15.10.2026 geteilt, weil
   besatzung.html dieselbe braucht. Beides zusammen in einen Kontext -
   so prueft der Test weiterhin, was die Seite wirklich ausfuehrt. */
const code = schnitt('function tagFeld(', '/* Die Marken-Mechanik') + nlSep +
  fs.readFileSync(path.join(BASIS, 'js/marken.js'), 'utf8');

const tagsEl = { innerHTML: '' };
let tipEl = null, modalEl = null;
const lauscher = {};

/* Ein Knoten, der so viel kann, wie der geschnittene Code braucht. Bewusst
   schlicht: querySelector sucht nur nach den Marken, die der Code selbst
   setzt - ein echter Selektor-Parser waere hier mehr Fehlerquelle als Nutzen. */
function knoten() {
  const n = {
    id: '', innerHTML: '', textContent: '', style: {}, onclick: null,
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
      contains(c) { return this._s.has(c); }
    },
    kinder: {},
    querySelector(sel) {
      if (!n.kinder[sel]) { n.kinder[sel] = knoten(); n.kinder[sel].id = sel; }
      return n.kinder[sel];
    },
    focus() { n._fokus = true; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 300, height: 120 }; }
  };
  return n;
}

const ctx = {
  Math, Object, String, Array, Number, Date, console, RegExp, Set,
  F: { tal: [], hnd: [] },
  TAL_BY_ID: R.TAL_BY_ID, HND_BY_ID: R.HND_BY_ID, RAENGE: R.RAENGE,
  DLBL: R.DLBL, TALENT_KOSTEN: R.TALENT_KOSTEN,
  esc: function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  },
  window: { innerWidth: 400, innerHeight: 700 },   // schmal wie der iframe auf der Karte
  document: {
    addEventListener: function (e, cb) { (lauscher[e] = lauscher[e] || []).push(cb); },
    getElementById: function (id) {
      if (id === 'tags') return tagsEl;
      if (id === 'tagTip') return tipEl;
      if (id === 'tagModal') return modalEl;
      return null;
    },
    createElement: function (tag) { var n = knoten(); n.tagName = tag; return n; },
    head: { appendChild: function (e) { return e; } },
    body: {
      appendChild: function (el) {
        if (el.id === 'tagModal') modalEl = el; else tipEl = el;
        return el;
      }
    }
  }
};
vm.createContext(ctx);
vm.runInContext(code, ctx);
/* Seit die Mechanik in js/marken.js liegt, haengen die Lauscher nicht mehr
   auf oberster Ebene, sondern in markenAktivieren(). Genau so macht es die
   Seite auch - der Test muss es deshalb ebenso tun. */
ctx.markenAktivieren();

function feuer(art, ev) { (lauscher[art] || []).forEach(function (cb) { cb(ev); }); }
function alsZiel(chip) { return { dataset: chip.dataset, closest: function () { return chip; } }; }

// Eine Figur mit einem Talent und zwei Schwächen - eine davon mit Haken.
const einTalent = R.TALENTE[0];
const schwere = R.HANDICAPS.filter(h => h.schwer)[0];
const mitHaken = R.HANDICAPS.filter(h => h.haken)[0];
ctx.F = { tal: [einTalent.id], hnd: [schwere.id, mitHaken.id] };
ctx.renderTags();
const m = tagsEl.innerHTML;

chk('das Talent steht da', m.indexOf('>' + einTalent.n + '<') >= 0, m.slice(0, 200));
chk('seine Wirkung hängt als Erklärung dran', m.indexOf(ctx.esc(einTalent.d)) >= 0);
chk('mit Kategorie und Rang', m.indexOf(einTalent.kat) >= 0 &&
  m.indexOf(R.RAENGE[einTalent.rang].name) >= 0);
chk('die Schwäche nennt ihr Gewicht', m.indexOf('schwer · 2 Punkte') >= 0);
chk('ein Haken wird als solcher erklärt', m.indexOf('verpflichtet, senkt keinen Würfel') >= 0,
  m.indexOf('verpflichtet'));
chk('jeder Chip ist mit der Tastatur erreichbar',
  (m.match(/tabindex="0"/g) || []).length === 3, m.match(/tabindex="0"/g));
chk('kein nackter title-Tooltip mehr', m.indexOf('title=') < 0);

/* Eine Figur, deren Talent es nicht mehr gibt, darf den Bogen nicht sprengen -
   genau so etwas entsteht, wenn eine Regelliste sich aendert. */
ctx.F = { tal: ['gibtsnichtmehr'], hnd: [] };
ctx.renderTags();
chk('ein unbekanntes Talent bricht nicht',
  tagsEl.innerHTML.indexOf('gibtsnichtmehr') >= 0 &&
  tagsEl.innerHTML.indexOf('gibt es im Regelwerk nicht mehr') >= 0, tagsEl.innerHTML);
ctx.F = { tal: [], hnd: [] };
ctx.renderTags();
chk('keine Talente, keine leere Liste', tagsEl.innerHTML.indexOf('keine') >= 0);

console.log('');
console.log('=== DAS ERKLÄRFELD WIRD WIRKLICH GESETZT ===');
function chip(ueber) {
  return {
    dataset: { tipn: 'Seebein', tipk: 'Hintergrund · ab Novize', tipt: 'Schwankender Untergrund.' },
    getBoundingClientRect: function () { return ueber; }
  };
}
// Normal: unterhalb des Chips.
ctx.tipZeigen(chip({ left: 20, top: 100, bottom: 118, width: 60, height: 18 }));
chk('das Feld erscheint', tipEl && tipEl.style.display === 'block');
chk('es nennt Namen, Einordnung und Wirkung',
  tipEl.innerHTML.indexOf('Seebein') >= 0 && tipEl.innerHTML.indexOf('ab Novize') >= 0 &&
  tipEl.innerHTML.indexOf('Schwankender Untergrund') >= 0);
chk('es steht unter dem Chip', parseInt(tipEl.style.top, 10) === 125, tipEl.style.top);

/* Am rechten Rand muss es umklappen statt abgeschnitten zu werden - der Bogen
   laeuft auf der Karte in einem schmalen iframe. */
ctx.tipZeigen(chip({ left: 380, top: 100, bottom: 118, width: 60, height: 18 }));
chk('am rechten Rand rückt es nach innen',
  parseInt(tipEl.style.left, 10) + 300 <= 400, tipEl.style.left);
chk('und bleibt im Bild', parseInt(tipEl.style.left, 10) >= 10, tipEl.style.left);

// Unten muss es nach oben klappen.
ctx.tipZeigen(chip({ left: 20, top: 650, bottom: 668, width: 60, height: 18 }));
chk('unten klappt es nach oben', parseInt(tipEl.style.top, 10) < 650, tipEl.style.top);
chk('und bleibt im Bild', parseInt(tipEl.style.top, 10) >= 10, tipEl.style.top);

ctx.tipWeg();
chk('und es verschwindet wieder', tipEl.style.display === 'none');

console.log('');
console.log('=== KLICK ÖFFNET DAS OVERLAY ===');
/* Hendriks Vorgabe: Das Hover-Feld ist der schnelle Blick, der Klick das
   Nachlesen. Auf einem Tablet am Tisch gibt es ueberhaupt kein Hovern -
   dort ist der Klick der einzige Weg. */
const talChip = {
  dataset: { tipid: einTalent.id, tipart: 'tal', tipn: einTalent.n,
             tipk: einTalent.kat, tipt: einTalent.d },
  getBoundingClientRect: function () { return { left: 20, top: 100, bottom: 118, width: 60, height: 18 }; }
};
feuer('click', { target: { closest: function () { return talChip; } } });
chk('das Overlay ist offen', modalEl && modalEl.classList.contains('auf'));
chk('es nennt das Talent', modalEl.querySelector('#tagModalName').textContent === einTalent.n,
  modalEl.querySelector('#tagModalName').textContent);
chk('und seine Wirkung', modalEl.querySelector('.wirkung').textContent === einTalent.d);
chk('es nennt die Voraussetzung',
  modalEl.querySelector('.zusatz').innerHTML.indexOf('Voraussetzung') >= 0,
  modalEl.querySelector('.zusatz').innerHTML);
chk('und dass der Rang hart sperrt',
  modalEl.querySelector('.zusatz').innerHTML.indexOf('harte Sperre') >= 0);
chk('das Hover-Feld ist dabei weg', tipEl.style.display === 'none');
chk('der Schließen-Knopf hat den Fokus', modalEl.querySelector('#tagModalZu')._fokus === true);

/* Eine Schwaeche mit Haken muss erklaeren, WARUM sie keinen Wuerfel senkt -
   sonst liest sie sich wie ein Nachteil ohne Gegenwert. */
const hakenChip = {
  dataset: { tipid: mitHaken.id, tipart: 'hnd', tipn: mitHaken.n, tipk: 'leicht', tipt: mitHaken.d }
};
feuer('click', { target: { closest: function () { return hakenChip; } } });
chk('ein Haken wird im Overlay erklärt',
  modalEl.querySelector('.zusatz').innerHTML.indexOf('Haken') >= 0 &&
  modalEl.querySelector('.zusatz').innerHTML.indexOf('senkt keinen Würfel') >= 0,
  modalEl.querySelector('.zusatz').innerHTML);
chk('und was sie einbringt',
  modalEl.querySelector('.zusatz').innerHTML.indexOf('Punkt') >= 0);

// Escape schliesst.
feuer('keydown', { key: 'Escape', target: {} });
chk('Escape schließt das Overlay', !modalEl.classList.contains('auf'));

// Tastatur oeffnet ebenso - ein role="button" muss auf Enter hoeren.
let verhindert = false;
feuer('keydown', { key: 'Enter', target: { closest: function () { return talChip; } },
                   preventDefault: function () { verhindert = true; } });
chk('Enter öffnet es', modalEl.classList.contains('auf'));
chk('und schluckt die Taste', verhindert);
feuer('keydown', { key: 'Escape', target: {} });
feuer('keydown', { key: ' ', target: { closest: function () { return talChip; } },
                   preventDefault: function () {} });
chk('die Leertaste auch', modalEl.classList.contains('auf'));

// Ein Klick daneben darf nichts oeffnen.
modalEl.classList.remove('auf');
feuer('click', { target: { closest: function () { return null; } } });
chk('ein Klick daneben öffnet nichts', !modalEl.classList.contains('auf'));

// Ein unbekanntes Talent: Overlay geht auf, aber ohne erfundenen Zusatz.
const totChip = { dataset: { tipn: 'Weg', tipk: 'Talent', tipt: 'Gibt es nicht mehr.' } };
feuer('click', { target: { closest: function () { return totChip; } } });
chk('auch ein unbekanntes Talent bricht nicht', modalEl.classList.contains('auf'));
chk('und erfindet keinen Zusatz', modalEl.querySelector('.zusatz').innerHTML === '' &&
  modalEl.querySelector('.zusatz').style.display === 'none');

/* Steht seit der Auslagerung in js/marken.js, nicht mehr im Bogen. */
const MARKEN = fs.readFileSync(path.join(BASIS, 'js/marken.js'), 'utf8');
chk('das Hover-Feld weist auf den Klick hin',
  MARKEN.indexOf('Anklicken für die ganze Erklärung') >= 0);
chk('die Mechanik liegt in einer geteilten Datei, nicht doppelt',
  BOGEN.indexOf('function tagModalAuf(') < 0 &&
  MARKEN.indexOf('function tagModalAuf(') > 0);
chk('und der Bogen bindet sie ein',
  BOGEN.indexOf('js/marken.js') > 0 && BOGEN.indexOf('markenAktivieren()') > 0);
chk('die Chips sind als Knopf ausgewiesen', (tagsEl.innerHTML.match(/role="button"/g) || []).length > 0 ||
  BOGEN.indexOf('role="button"') >= 0);

console.log('');
console.log('=== DER LADEN STEHT AM ORT, MIT EIGENEM SORTIMENT ===');
/* Hendriks Vorgabe: Nicht im Charakterfenster aufmachen, sondern direkt im
   Krämerladen oder auf dem Markt - und jeder Laden führt, was zu ihm passt. */
const SZENEN_DATEIEN = ['scenes', 'golden_lion_scenes', 'schatzinsel_scenes',
  'spanischer_hafen_scenes', 'schmugglernest_scenes', 'artefakthandel_scenes',
  'riffinsel_scenes', 'grabesinsel_scenes', 'abspann_scenes', 'arena_scenes'];

/* Gelesen wird direkt aus den Szenendateien. Bis zum 15.10.2026 lieh sich
   dieser Test zwei Helfer aus heldenbrief.html - die sind mit dem
   Einkaufs-Hinweis entfallen. Richtig so: Der Laden gehoert den
   Szenendaten, nicht einer Seite, die ihn zufaellig anzeigt. */
const lctx = { Object, Array, String, console };
vm.createContext(lctx);
SZENEN_DATEIEN.forEach(function (d) {
  vm.runInContext(fs.readFileSync(path.join(BASIS, 'js/' + d + '.js'), 'utf8'), lctx);
});
const CONTAINER = ['SCENES', 'GOLDEN_LION_SCENES', 'SCHATZINSEL_SCENES',
  'SPANISCHER_HAFEN_SCENES', 'SCHMUGGLERNEST_SCENES', 'ARTEFAKTHANDEL_SCENES',
  'RIFFINSEL_SCENES', 'GRABESINSEL_SCENES', 'ABSPANN_SCENES', 'ARENA_SCENES'];
const ALLE_SZENEN = {};
CONTAINER.forEach(function (n) {
  const c = vm.runInContext('typeof ' + n + ' !== "undefined" ? ' + n + ' : null', lctx);
  if (c) Object.keys(c).forEach(function (id) { ALLE_SZENEN[id] = c[id]; });
});
function laedenDerSzene(id) {
  const sz = ALLE_SZENEN[id];
  if (!sz || !sz.markers) return [];
  return sz.markers.filter(function (m) { return m && m.laden; })
                   .map(function (m) { return m.laden; });
}
/* "laden" war bis zum 14.10.2026 ein blosser Name und ist seitdem ein
   Objekt. Wer ihn anzeigt, muss beides vertragen. */
function ladenName(l) {
  if (!l) return 'Laden';
  return (typeof l === 'string') ? l : (l.name || 'Laden');
}
chk('alle Szenendateien sind gelesen', Object.keys(ALLE_SZENEN).length >= 13,
  Object.keys(ALLE_SZENEN).length);

const alleLaeden = [];
Object.keys(ALLE_SZENEN).forEach(function (id) {
  laedenDerSzene(id).forEach(function (l) { alleLaeden.push({ szene: id, l: l }); });
});
chk('es gibt überhaupt Händler', alleLaeden.length > 0, alleLaeden.length);
chk('Grimsgate hat zwei', laedenDerSzene('1.1').length === 2);
chk('der spanische Hafen einen', laedenDerSzene('7.1').length === 1);
chk('das Schmugglernest einen', laedenDerSzene('8.1').length === 1);
chk('auf dem Schiff keinen', laedenDerSzene('2.1').length === 0);
/* Der Screenshot vom 15.10.2026 zeigte "[object Object]": Das Feld "laden"
   ist seit dem 14.10. ein Objekt, die Anzeige las es noch als Namen. */
chk('jeder Laden hat einen Namen zum Anzeigen',
  alleLaeden.every(function (x) { return ladenName(x.l) && ladenName(x.l).indexOf('[object') < 0; }),
  alleLaeden.map(function (x) { return ladenName(x.l); }));
chk('auch die alte Schreibweise als blosser Name',
  ladenName('Alter Laden') === 'Alter Laden' && ladenName(null) === 'Laden');
chk('auf der Schatzinsel keinen', laedenDerSzene('4.1').length === 0);
chk('eine unbekannte Szene ergibt nichts', laedenDerSzene('99.9').length === 0);

/* Waren liegen jetzt in Schubladen bzw. Staenden, nicht mehr flach. Fuer die
   Pruefungen flach ziehen - was WO liegt, wird darunter eigens geprueft. */
function alleWaren(l) {
  return (l.gruppen || []).reduce(function (acc, g) { return acc.concat(g.waren || []); }, []);
}

/* Der tragende Punkt: Jede Ware muss es wirklich geben. Beim Schreiben der
   Sortimente habe ich eine ID erfunden ("verbandszeug_platzhalter") - genau
   das fängt diese Prüfung. Ein Laden mit einer toten ID zeigt sie einfach
   nicht an, und niemand merkt, dass die Ware fehlt. */
let toteWaren = [];
alleLaeden.forEach(function (e) {
  alleWaren(e.l).forEach(function (id) {
    if (!R.AUSR_BY_ID[id]) toteWaren.push(e.szene + ': ' + id);
  });
});
chk('jede Ware gibt es wirklich', toteWaren.length === 0, toteWaren);
chk('jeder Laden hat einen Namen',
  alleLaeden.every(function (e) { return !!e.l.name; }));
chk('jeder Laden sagt, was er führt',
  alleLaeden.every(function (e) { return !!e.l.was; }));
chk('und führt überhaupt etwas',
  alleLaeden.every(function (e) { return alleWaren(e.l).length > 0; }),
  alleLaeden.filter(function (e) { return !alleWaren(e.l).length; }).map(function (e) { return e.l.name; }));

console.log('');
console.log('=== SCHUBLADEN UND STÄNDE ===');
/* Hendriks Vorgabe: beim Krämer Schubladen, auf dem Markt Stände. */
const alleFaecher = [];
alleLaeden.forEach(function (e) {
  (e.l.gruppen || []).forEach(function (g) { alleFaecher.push({ laden: e.l.name, g: g }); });
});
chk('es gibt überhaupt Fächer', alleFaecher.length > 0, alleFaecher.length);
chk('jedes Fach hat einen Namen', alleFaecher.every(function (f) { return !!f.g.n; }),
  alleFaecher.filter(function (f) { return !f.g.n; }).map(function (f) { return f.laden; }));
chk('kein Fach ist leer', alleFaecher.every(function (f) { return (f.g.waren || []).length > 0; }),
  alleFaecher.filter(function (f) { return !(f.g.waren || []).length; }).map(function (f) { return f.g.n; }));
/* Eine Ware zweimal im selben Laden waere ein Kopierfehler, der am Tisch wie
   ein zweites Angebot aussieht. */
let doppelt = [];
alleLaeden.forEach(function (e) {
  const w = alleWaren(e.l), gesehen = {};
  w.forEach(function (id) {
    if (gesehen[id]) doppelt.push(e.l.name + ': ' + id);
    gesehen[id] = true;
  });
});
chk('keine Ware liegt zweimal im selben Laden', doppelt.length === 0, doppelt);
chk('jedes Fach hat mindestens vier Zeichen Beschreibung oder keine',
  alleFaecher.every(function (f) { return !f.g.d || f.g.d.length > 4; }));
chk('der Krämer hat mehrere Schubladen',
  laedenDerSzene('1.1').filter(function (l) { return l.name.indexOf('Krämer') >= 0; })[0]
    .gruppen.length >= 4);

/* Die Sortimente sollen sich unterscheiden - sonst waere die Trennung eine
   Behauptung. */
function waren(szene, name) {
  const l = laedenDerSzene(szene).filter(function (x) { return x.name.indexOf(name) >= 0; })[0];
  return l ? alleWaren(l) : [];
}
const kraemer = waren('1.1', 'Krämer'), markt = waren('1.1', 'Markt');
chk('Krämer und Markt führen Verschiedenes',
  kraemer.join(',') !== markt.join(','));
chk('der Krämer führt Werkzeug und Vorrat',
  kraemer.indexOf('seil') >= 0 && kraemer.indexOf('laterne') >= 0 && kraemer.indexOf('proviant') >= 0);
chk('aber keine Kriegswaffen', kraemer.indexOf('saebel') < 0 && kraemer.indexOf('muskete') < 0, kraemer);
chk('der Markt führt Klingen', markt.indexOf('saebel') >= 0);
/* Schusswaffen gibt es in der ganzen Kampagne nur bei den Schmugglern -
   das ist eine Aussage ueber die Welt, nicht nur ueber eine Liste. */
const mitPulver = alleLaeden.filter(function (e) {
  return alleWaren(e.l).some(function (id) {
    return ['pistole', 'tromblon', 'muskete'].indexOf(id) >= 0;
  });
});
chk('Schusswaffen nur im Schmugglernest',
  mitPulver.length === 1 && mitPulver[0].szene === '8.1',
  mitPulver.map(function (e) { return e.szene + '/' + e.l.name; }));

console.log('');
console.log('=== MUNITION ===');
/* Savage Worlds fuehrt je Fernwaffe "Shots". 1701 ist alles Vorderlader:
   ein Schuss, dann nachladen. Siehe KAMPAGNEN-BIBEL.md 4.5. */
/* "Schusswaffe" ist nicht dasselbe wie "Fernkampf": Das Wurfmesser ist
   Fernkampf und braucht trotzdem kein Pulver. Woran man sie unterscheidet,
   ist das Feld "schuss" - genau das wird hier geprueft, in beide Richtungen. */
const mitSchuss = R.AUSRUESTUNG.filter(function (a) { return a.schuss; });
chk('genau die drei Feuerwaffen haben einen Schusswert',
  mitSchuss.map(function (a) { return a.id; }).sort().join(',') === 'muskete,pistole,tromblon',
  mitSchuss.map(function (a) { return a.id; }));
chk('und zwar je genau einen \u2014 1701 ist alles Vorderlader',
  mitSchuss.every(function (a) { return a.schuss === 1; }),
  mitSchuss.map(function (a) { return a.n + ':' + a.schuss; }));
chk('das Wurfmesser braucht keine Ladung', !R.AUSR_BY_ID['wurfmesser'].schuss);

const muni = R.AUSRUESTUNG.filter(function (a) { return a.art === 'Munition'; });
chk('es gibt Munition zu kaufen', muni.length >= 3, muni.length);
chk('mindestens eine bringt gleich Ladungen mit',
  muni.some(function (a) { return a.ladungen > 0; }));
chk('alle Munition ist bezahlbar f\u00fcr eine frische Figur',
  muni.every(function (a) { return a.preis <= R.STARTGELD; }),
  muni.filter(function (a) { return a.preis > R.STARTGELD; }).map(function (a) { return a.n; }));

chk('eine frische Figur hat keine Ladungen', R.alsFigur({}).ladungen === 0);
chk('Ladungen werden \u00fcbernommen', R.alsFigur({ ladungen: 14 }).ladungen === 14);
chk('und nie negativ', R.alsFigur({ ladungen: -3 }).ladungen === 0);
/* Der haeufigste stille Datenverlust: ein Feld, das die Figur kennt, aber der
   Bogen nicht hochschreibt. Dann zaehlt man am Tisch mit und es ist beim
   naechsten Laden wieder weg. */
chk('der Bogen speichert die Ladungen', BOGEN.indexOf('ladungen: F.ladungen') >= 0);



console.log('');
console.log('=== ALLERLEI: DINGE, DIE NICHTS TUN ===');
/* Hendriks Vorgabe: Es duerfen Dinge dabei sein, mit denen man erst einmal
   gar nichts anfangen kann. Die stehen in einer eigenen Art - wer sie kauft,
   soll nicht glauben, etwas uebersehen zu haben. */
const allerlei = R.AUSRUESTUNG.filter(function (a) { return a.art === 'Allerlei'; });
chk('es gibt die Art \u00fcberhaupt', allerlei.length > 0, allerlei.length);
chk('und sie tut wirklich nichts',
  allerlei.every(function (a) { return !a.schaden && !a.ruest && !a.ladungen && !a.schuss; }),
  allerlei.filter(function (a) { return a.schaden || a.ruest; }).map(function (a) { return a.n; }));
chk('jede Ware hat eine Beschreibung',
  R.AUSRUESTUNG.every(function (a) { return a.d && a.d.length > 10; }),
  R.AUSRUESTUNG.filter(function (a) { return !a.d || a.d.length <= 10; }).map(function (a) { return a.n; }));
chk('jede Ware hat ein Gewicht', R.AUSRUESTUNG.every(function (a) { return a.gew !== undefined; }));
chk('jede Art kommt in AUSR_ARTEN vor',
  R.AUSRUESTUNG.every(function (a) { return R.AUSR_ARTEN.indexOf(a.art) >= 0; }),
  R.AUSRUESTUNG.filter(function (a) { return R.AUSR_ARTEN.indexOf(a.art) < 0; }).map(function (a) { return a.art; }));

console.log('');
console.log('=== GEKAUFT WIRD AUF DER KARTE ===');
chk('die Karte hat einen Laden im Ort-Fenster', KARTE.indexOf('id="ladenBox"') >= 0);
chk('er wird beim Öffnen eines Ortes gezeichnet', KARTE.indexOf('zeichneLaden(marker)') >= 0);
chk('er nennt den Geldstand', KARTE.indexOf('Du hast <b>') >= 0);
chk('die Fächer sind zu, bis man sie aufzieht',
  KARTE.indexOf("'<div class=\"fach' + (offen ? '' : ' zu')") >= 0);
chk('sie lassen sich anklicken', KARTE.indexOf('data-fach=') >= 0 &&
  KARTE.indexOf('ladenFaecherOffen[i] = !ladenFaecherOffen[i]') >= 0);
chk('ein Fach sagt, wie viel davon bezahlbar ist', KARTE.indexOf('bezahlbar') >= 0);
chk('beim Ortswechsel sind wieder alle zu',
  KARTE.indexOf('ladenFaecherOffen = {};') >= 0 && KARTE.indexOf('ladenFuerMarker') >= 0);
chk('welches Fach offen ist, geht nicht in die Datenbank',
  KARTE.indexOf("ref('ladenFaecher") < 0 && KARTE.indexOf('let ladenFaecherOffen = {}') >= 0);
/* Gekauft wird NICHT direkt in die Figur geschrieben - derselbe Grund wie bei
   der Uebergabe durch die Regie. */
chk('ein Kauf geht ins Postfach, nicht in die Figur',
  /figuren\/' \+ k \+ '\/zuteilung'\)\.push/.test(KARTE), 'kauf-pfad');
chk('die Karte schreibt NICHT ausr oder muenzen',
  !/db\.ref\('figuren\/[^']*'\)\.update/.test(KARTE) &&
  KARTE.indexOf("'/muenzen').set") < 0);
chk('der Bogen wird im Voraus geladen, damit Käufe ankommen',
  KARTE.indexOf('setTimeout(bogenLaden') >= 0);
chk('der Bogen bietet selbst keinen Katalog mehr',
  BOGEN.indexOf('onclick="kaufen(') < 0 && BOGEN.indexOf('function kaufen(') < 0);
/* Seit dem 15.10.2026 steht dort auch kein HINWEIS mehr (Hendriks
   Vorgabe). Mit ihm sind die zehn Szenendateien entfallen, die der
   Bogen allein dafuer geladen hat - rund 64 KB bei jedem Oeffnen. */
chk('und auch keinen Hinweis darauf mehr',
  BOGEN.indexOf('Eingekauft wird beim Händler') < 0 && BOGEN.indexOf('id="laden"') < 0);
chk('die Szenendateien laedt er deshalb nicht mehr mit',
  SZENEN_DATEIEN.every(function (d) { return BOGEN.indexOf('js/' + d + '.js') < 0; }),
  SZENEN_DATEIEN.filter(function (d) { return BOGEN.indexOf('js/' + d + '.js') >= 0; }));
chk('und kennt die Szene gar nicht mehr',
  BOGEN.indexOf('laedenDerSzene') < 0 && BOGEN.indexOf('alleSzenen') < 0 &&
  BOGEN.indexOf("ref('currentScene')") < 0);

console.log('');
console.log('=== WAS DIE SPIELLEITUNG ÜBERGIBT, KOMMT AN ===');
const zCode = schnitt('function zuteilungAnnehmen(', 'function muenzenAendern(');
const geschrieben = [];
let gespeichert = 0, gezeichnet = 0;
const zctx = {
  Object, Array, String, Number, Math, Date, console, setTimeout, clearTimeout,
  AUSR_BY_ID: R.AUSR_BY_ID,
  F: { ausr: [], muenzen: 100 },
  ladeBereit: true,
  codeJetzt: function () { return 'anna'; },
  speichern: function () { gespeichert++; },
  renderAlles: function () { gezeichnet++; },
  esc: function (x) { return String(x == null ? '' : x); },
  db: { ref: function (p) { return { remove: function () {
    geschrieben.push('REMOVE ' + p); return { catch: function () {} };
  } }; } },
  document: {
    getElementById: function () { return null; },
    createElement: function () { return { id: '', innerHTML: '', className: '' }; },
    body: { appendChild: function (e) { return e; } }
  }
};
vm.createContext(zctx);
vm.runInContext(zCode, zctx);

zctx.zuteilungAnnehmen({ a: { art: 'gegenstand', id: 'saebel' } });
chk('der Gegenstand liegt im Bogen', zctx.F.ausr.indexOf('saebel') >= 0, zctx.F.ausr);
chk('und wird gespeichert', gespeichert === 1, gespeichert);
chk('das Postfach wird geräumt',
  geschrieben.indexOf('REMOVE figuren/anna/zuteilung') >= 0, geschrieben);

zctx.zuteilungAnnehmen({ b: { art: 'muenzen', wert: 250 } });
chk('Münzen kommen dazu', zctx.F.muenzen === 350, zctx.F.muenzen);
zctx.zuteilungAnnehmen({ c: { art: 'muenzen', wert: -1000 } });
chk('und rutschen nie ins Minus', zctx.F.muenzen === 0, zctx.F.muenzen);

zctx.zuteilungAnnehmen({ d: { art: 'nehmen', id: 'saebel' } });
chk('Einziehen nimmt den Gegenstand weg', zctx.F.ausr.indexOf('saebel') < 0, zctx.F.ausr);

/* Mehrere Uebergaben auf einmal - die Spielleitung verteilt Beute oft in
   einem Rutsch. */
zctx.zuteilungAnnehmen({ e: { art: 'gegenstand', id: 'messer' },
                         f: { art: 'gegenstand', id: 'seil' },
                         g: { art: 'muenzen', wert: 40 } });
chk('mehrere auf einmal kommen alle an',
  zctx.F.ausr.length === 2 && zctx.F.muenzen === 40, { ausr: zctx.F.ausr, m: zctx.F.muenzen });

/* Unsinn darf den Bogen nicht sprengen - und nicht liegen bleiben. */
const vorher = gespeichert;
geschrieben.length = 0;
zctx.zuteilungAnnehmen({ h: { art: 'gegenstand', id: 'gibtsnicht' } });
chk('ein unbekannter Gegenstand wird nicht eingetragen', zctx.F.ausr.length === 2);
chk('aber das Postfach trotzdem geräumt',
  geschrieben.indexOf('REMOVE figuren/anna/zuteilung') >= 0, geschrieben);
chk('und nichts gespeichert', gespeichert === vorher, gespeichert);
chk('ein leeres Postfach tut nichts', (function () {
  const g = gespeichert; zctx.zuteilungAnnehmen({}); return gespeichert === g;
})());

/* Vor dem ersten Lesen der Figur darf nichts angenommen werden - sonst
   traegt der Bogen etwas in eine Figur ein, die er noch gar nicht kennt. */
zctx.ladeBereit = false;
const g2 = gespeichert;
zctx.zuteilungAnnehmen({ i: { art: 'gegenstand', id: 'messer' } });
chk('vor dem ersten Lesen wird nichts angenommen', gespeichert === g2 && zctx.F.ausr.length === 2);
zctx.ladeBereit = true;

/* ---- Der Kauf vom Laden auf der Karte ----
   Der Laden prueft das Geld auch, aber er sieht einen Stand, der eine
   Sekunde alt sein kann. Massgeblich ist der Bogen: Hier steht die Figur. */
zctx.F = { ausr: [], muenzen: 300 };
zctx.zuteilungAnnehmen({ k1: { art: 'kauf', id: 'saebel' } });   // 250 M.
chk('ein Kauf bucht ab', zctx.F.muenzen === 50, zctx.F.muenzen);
chk('und legt die Ware in den Bogen', zctx.F.ausr.indexOf('saebel') >= 0);

const vorKauf = JSON.stringify(zctx.F);
zctx.zuteilungAnnehmen({ k2: { art: 'kauf', id: 'muskete' } });  // 500 M., hat 50
chk('zu teuer wird NICHT gekauft', JSON.stringify(zctx.F) === vorKauf, zctx.F);
chk('und das Postfach trotzdem geräumt',
  geschrieben.indexOf('REMOVE figuren/anna/zuteilung') >= 0);

/* Zwei Kaeufe auf einmal, von denen nur der erste bezahlbar ist: Der erste
   geht durch, der zweite nicht - und das Geld reicht genau fuer einen. */
zctx.F = { ausr: [], muenzen: 260 };
zctx.zuteilungAnnehmen({ a1: { art: 'kauf', id: 'saebel' },
                         a2: { art: 'kauf', id: 'saebel' } });
chk('von zwei gleichen geht nur der bezahlbare durch',
  zctx.F.ausr.length === 1 && zctx.F.muenzen === 10,
  { ausr: zctx.F.ausr, m: zctx.F.muenzen });
chk('Geld geht dabei nie ins Minus', zctx.F.muenzen >= 0);

chk('der Spieler erfährt davon', BOGEN.indexOf('Von der Spielleitung') >= 0);
chk('und erfährt auch, wenn das Geld nicht reichte',
  BOGEN.indexOf('reicht dein Geld nicht') >= 0);

/* Kauf von Munition fuellt den Vorrat auf. */
zctx.F = { ausr: [], muenzen: 500, ladungen: 0 };
zctx.zuteilungAnnehmen({ m1: { art: 'kauf', id: 'pulverhorn' } });
chk('ein gekauftes Pulverhorn f\u00fcllt auf',
  zctx.F.ladungen === R.AUSR_BY_ID['pulverhorn'].ladungen, zctx.F.ladungen);
chk('und liegt trotzdem im Gep\u00e4ck', zctx.F.ausr.indexOf('pulverhorn') >= 0);
zctx.zuteilungAnnehmen({ m2: { art: 'kauf', id: 'patronen' } });
chk('ein zweiter Kauf z\u00e4hlt dazu',
  zctx.F.ladungen === R.AUSR_BY_ID['pulverhorn'].ladungen + R.AUSR_BY_ID['patronen'].ladungen,
  zctx.F.ladungen);
/* Auch ein Geschenk der Spielleitung muss Ladungen bringen - sonst steht ein
   geschenktes Pulverhorn leer im Gepaeck. */
zctx.F = { ausr: [], muenzen: 0, ladungen: 0 };
zctx.zuteilungAnnehmen({ g1: { art: 'gegenstand', id: 'pulverhorn' } });
chk('auch ein geschenktes Pulverhorn f\u00fcllt auf', zctx.F.ladungen > 0, zctx.F.ladungen);
/* Die Kugelform bringt bewusst KEINE fertigen Ladungen - man giesst sie erst. */
zctx.F = { ausr: [], muenzen: 500, ladungen: 0 };
zctx.zuteilungAnnehmen({ g2: { art: 'kauf', id: 'kugelform' } });
chk('die Kugelform bringt keine fertigen Ladungen', zctx.F.ladungen === 0, zctx.F.ladungen);
chk('erst eintragen, dann räumen',
  BOGEN.indexOf('speichern();') < BOGEN.indexOf("'/zuteilung').remove()"),
  { speichern: BOGEN.indexOf('speichern();'), remove: BOGEN.indexOf("'/zuteilung').remove()") });

console.log('');
console.log('=== EIGENE GEGENSTAENDE DER SPIELLEITUNG ===');
/* Hendriks Vorgabe vom 15.10.2026: Die Spielleitung soll Gegenstaende
   erfinden und vergeben koennen. Sie koennen nicht im Code stehen, also
   liegen sie je Sitzung in der Datenbank und werden nachgetragen. */
const wId = R.eigeneWareId('Jaguar-Säbel');
chk('die Kennung ist als erfunden erkennbar', R.istEigeneWare(wId) && wId.indexOf('sl_') === 0, wId);
chk('Umlaute werden umgeschrieben', wId.indexOf('saebel') > 0, wId);
chk('eine Ware aus dem Regelwerk gilt nicht als erfunden', !R.istEigeneWare('saebel'));
chk('zwei gleiche Namen geben zwei Kennungen',
  R.eigeneWareId('Brief') !== R.eigeneWareId('Brief'));

const wEin = R.eigeneWareEintragen({ id: wId, n: 'Jaguar-Säbel', d: 'Ein Jaguar ist eingraviert.',
  art: 'Nahkampf', schaden: 3, gew: 5, preis: 400 });
chk('sie laesst sich eintragen', !!wEin && R.AUSR_BY_ID[wId].n === 'Jaguar-Säbel');
chk('und ist danach ganz normale Ware',
  R.AUSRUESTUNG.indexOf(R.AUSR_BY_ID[wId]) >= 0 && R.AUSR_BY_ID[wId].schaden === 3);
/* Der eigentliche Punkt: Traglast und Robustheit rechnen ohne Sonderweg
   mit ihr, weil alles ueber AUSR_BY_ID laeuft. */
const wFig = R.alsFigur({ ausr: [wId] });
chk('sie wiegt in der Traglast mit', R.getragen(wFig) === 5, R.getragen(wFig));
const wPanzer = R.eigeneWareEintragen({ id: R.eigeneWareId('Brustpanzer'), n: 'Alter Brustpanzer',
  art: 'Schutz', ruest: 2, gew: 8, preis: 0 });
chk('und hebt die Robustheit', R.robustheit(R.alsFigur({ ausr: [wPanzer.id] })) ===
  R.robustheit(R.alsFigur({})) + 2);

/* Regel 1: Nie eine Ware aus dem Regelwerk ueberschreiben. Sonst koennte
   eine Sitzung den Saebel umdefinieren, und niemand faende den Grund. */
chk('eine kanonische Ware wird nicht überschrieben',
  R.eigeneWareEintragen({ id: 'saebel', n: 'Gefälscht', art: 'Nahkampf', gew: 1 }) === null &&
  R.AUSR_BY_ID['saebel'].n === 'Säbel');
chk('eine Kennung ohne Präfix wird abgelehnt',
  R.eigeneWareEintragen({ id: 'eigenbau', n: 'X', art: 'Allerlei', gew: 1 }) === null);
chk('ein halber Gegenstand wird abgelehnt',
  R.eigeneWarePruefen({ id: R.eigeneWareId('x'), n: '   ' }) === null);
/* Unsinnige Zahlen werden geklemmt statt uebernommen - eine Ware mit
   Schaden 99 waere kein Gegenstand, sondern ein Fehler. */
const wWild = R.eigeneWarePruefen({ id: R.eigeneWareId('Wild'), n: 'Wild', art: 'Quatsch',
  schaden: 99, ruest: -4, gew: -3, preis: 1e9 });
chk('Zahlen werden geklemmt', wWild.schaden === 5 && !wWild.ruest && wWild.gew === 0 &&
  wWild.preis === 99999, wWild);
chk('eine unbekannte Art fällt auf Allerlei zurück', wWild.art === 'Allerlei', wWild.art);

/* Was die Spielleitung loescht, verschwindet - sonst wiegt eine
   Karteileiche weiter, die niemand mehr sieht. */
R.eigeneWarenSetzen({ a: { id: wId, n: 'Jaguar-Säbel', art: 'Nahkampf', schaden: 3, gew: 5 } });
chk('der Säbel bleibt', !!R.AUSR_BY_ID[wId]);
chk('der Panzer ist weg', R.AUSR_BY_ID[wPanzer.id] === undefined);
chk('und wiegt auch nichts mehr', R.getragen(R.alsFigur({ ausr: [wPanzer.id] })) === 0);
chk('die Liste traegt ihn nicht mehr',
  R.AUSRUESTUNG.filter(a => a.id === wPanzer.id).length === 0);
R.eigeneWarenSetzen({});
chk('ein leerer Knoten räumt alles weg',
  R.AUSRUESTUNG.filter(a => a.vonSl).length === 0 && R.AUSR_BY_ID[wId] === undefined);
chk('das Regelwerk selbst ist unversehrt',
  R.AUSRUESTUNG.length === 53 && !!R.AUSR_BY_ID['saebel'], R.AUSRUESTUNG.length);

console.log('');
console.log('=== DER KAUF MELDET SICH ===');
/* Hendriks Meldung vom 15.10.2026: Beim Kaufen passierte sichtbar nichts.
   Das lag in der Natur der Sache - der Klick legt die Ware ins Postfach,
   verbucht wird sie im Bogen, und der steht zugeklappt hinter der Karte.
   Geprueft wird deshalb der ganze Weg, ausgefuehrt statt gelesen. */
const kcode = (function () {
  const a = KARTE.indexOf('let kaufOffen'), b = KARTE.indexOf('let ladenFaecherOffen');
  if (a < 0 || b < 0) { console.log('FAIL Kauf-Code nicht gefunden'); process.exit(1); }
  return KARTE.slice(a, b);
})();

let gepusht = null, schluessel = 0;
const kctx = {
  console, setTimeout, clearTimeout, Object,
  AUSR_BY_ID: R.AUSR_BY_ID,
  figurSchluessel: () => 'anna',
  currentOverlayMarker: null,          // kein Neuzeichnen noetig
  zeichneLaden: () => {},
  meineFigur: { muenzen: 300, ausr: [] },
  db: { ref: () => ({ push: o => { gepusht = o; const k = 'k' + (++schluessel);
          return { key: k, catch: () => {} }; } }) }
};
vm.createContext(kctx);
vm.runInContext(kcode, kctx);
/* "let kaufMeld" im vm ist von aussen NICHT als kctx.kaufMeld sichtbar -
   dieselbe Falle wie am 05.09.2026 beim State S. Also ueber Funktionen
   lesen, die im Kontext selbst stehen. */
vm.runInContext('globalThis.meldLesen = function () { return kaufMeld; };' +
                'globalThis.offenLesen = function () { return kaufOffen; };', kctx);
const meld = () => kctx.meldLesen();

/* 1. Zu teuer: Vorher tat der Klick GAR NICHTS - kein Kauf, keine Antwort. */
kctx.meineFigur = { muenzen: 10, ausr: [] };
kctx.kaufen('saebel');
chk('zu teuer sagt, woran es liegt',
  meld() && meld().art === 'schlecht' &&
  meld().text.indexOf('250') >= 0, meld());
chk('und schickt nichts ins Postfach', gepusht === null, gepusht);

/* 2. Der normale Weg: erst "wird verbucht", dann die Bestaetigung - und
      die kommt erst, wenn die Ware wirklich in der Figur steht. */
kctx.meineFigur = { muenzen: 300, ausr: [] };
kctx.kaufen('saebel');
chk('der Kauf geht ins Postfach', gepusht && gepusht.art === 'kauf' && gepusht.id === 'saebel', gepusht);
chk('und der Spieler sieht sofort, dass etwas passiert',
  meld().art === 'warte' && meld().text.indexOf('verbucht') >= 0, meld());
/* Eine Figur-Aenderung ohne die Ware bestaetigt NICHTS - sonst meldete
   jede Uebergabe der Spielleitung einen fremden Kauf als erledigt. */
kctx.meineFigur = { muenzen: 300, ausr: ['messer'] };
kctx.kaufPruefen();
chk('eine fremde Änderung bestätigt nichts', meld().art === 'warte', meld());
kctx.meineFigur = { muenzen: 50, ausr: ['messer', 'saebel'] };
kctx.kaufPruefen();
chk('steht die Ware in der Figur, ist es gekauft',
  meld().art === 'gut' && meld().text.indexOf('250') >= 0, meld());
chk('und nichts bleibt offen', Object.keys(kctx.offenLesen()).length === 0, kctx.offenLesen());

/* 3. Zweimal dasselbe Stueck: Der zweite Kauf darf nicht vom ersten
      bestaetigt werden - deshalb zaehlt der Test die STUECKZAHL. */
kctx.meineFigur = { muenzen: 300, ausr: ['saebel'] };
kctx.kaufen('saebel');
kctx.kaufPruefen();
chk('ein zweites gleiches Stück wartet auf sich selbst',
  meld().art === 'warte', meld());
kctx.meineFigur = { muenzen: 50, ausr: ['saebel', 'saebel'] };
kctx.kaufPruefen();
chk('und wird erst beim zweiten Stück bestätigt', meld().art === 'gut', meld());

console.log('');
console.log('=== AUCH DIE REGIE SIEHT, WAS EIN TALENT TUT ===');
const REGIE = fs.readFileSync(path.join(BASIS, 'regie_figuren.html'), 'utf8');
chk('die Chips tragen dort eine Erklärung',
  /class="tag pos" title="/.test(REGIE) && /class="tag neg" title="/.test(REGIE));
chk('mit der Wirkung, nicht nur dem Namen', REGIE.indexOf('x.d') >= 0);
chk('und der Mauszeiger sagt es an', REGIE.indexOf('cursor:help') >= 0);

console.log('');
console.log(f === 0 ? 'OK: ' + anzahl + '   FEHLER: 0' : 'OK: ' + (anzahl - f) + '   FEHLER: ' + f);
process.exit(f ? 1 : 0);

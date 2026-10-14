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
/* Alles von tagFeld() bis einschliesslich der Lauscher - also auch das
   Overlay. Der Schnitt endet am Scroll-Lauscher, der letzten Zeile des
   Blocks. */
const code = schnitt('function tagFeld(', "document.addEventListener('scroll'") +
  "document.addEventListener('scroll', tipWeg, true);";

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
    createElement: function () { return knoten(); },
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

chk('das Hover-Feld weist auf den Klick hin',
  BOGEN.indexOf('Anklicken für die ganze Erklärung') >= 0);
chk('die Chips sind als Knopf ausgewiesen', (tagsEl.innerHTML.match(/role="button"/g) || []).length > 0 ||
  BOGEN.indexOf('role="button"') >= 0);

console.log('');
console.log('=== DER LADEN GEHT AM ORT AUF ===');
/* Eingekauft wird, wo es etwas zu kaufen gibt. Der Katalog stand vorher
   immer offen, auch mitten auf See. Aufgemacht wird er vom SPIELER, nicht
   von der Spielleitung. (Hendriks Vorgabe, 14.10.2026.) */
const SZENEN_DATEIEN = ['scenes', 'golden_lion_scenes', 'schatzinsel_scenes',
  'spanischer_hafen_scenes', 'schmugglernest_scenes', 'artefakthandel_scenes',
  'riffinsel_scenes', 'grabesinsel_scenes', 'abspann_scenes', 'arena_scenes'];

/* Die Fundstellen-Logik aus dem Bogen schneiden und mit gesetztem Zustand
   ausfuehren. Die Zustandsvariablen stehen im Bogen weiter oben; sie werden
   hier davorgesetzt, damit der geschnittene Teil fuer sich laeuft. */
const ladenCode = 'let aktuelleSzene = null, szeneGehoert = false;\n' +
  schnitt('function alleSzenen()', 'function renderTags()') +
  '\nfunction setzeOrt(sz, gehoert) { aktuelleSzene = sz; szeneGehoert = gehoert; }';

const lctx = { Object, Array, String, console };
vm.createContext(lctx);
SZENEN_DATEIEN.forEach(function (d) {
  vm.runInContext(fs.readFileSync(path.join(BASIS, 'js/' + d + '.js'), 'utf8'), lctx);
});
vm.runInContext(ladenCode, lctx);

/* Zuerst: Gibt es ueberhaupt Haendler? Eine Kennzeichnung, die nirgends
   gesetzt ist, waere eine Sperre ohne Ausweg - niemand koennte je kaufen. */
const mitLaden = Object.keys(lctx.alleSzenen()).filter(function (id) {
  return lctx.laedenDerSzene(id).length > 0;
});
chk('es gibt überhaupt Händler-Orte', mitLaden.length > 0, mitLaden);
chk('Grimsgate ist einer davon', lctx.laedenDerSzene('1.1').length === 2,
  lctx.laedenDerSzene('1.1'));
chk('Markt und Krämer, beide benannt',
  lctx.laedenDerSzene('1.1').join('|').indexOf('Markt') >= 0 &&
  lctx.laedenDerSzene('1.1').join('|').indexOf('Krämer') >= 0, lctx.laedenDerSzene('1.1'));
chk('der spanische Hafen auch', lctx.laedenDerSzene('7.1').length === 1, lctx.laedenDerSzene('7.1'));
chk('das Schmugglernest auch', lctx.laedenDerSzene('8.1').length === 1, lctx.laedenDerSzene('8.1'));
chk('auf dem Schiff dagegen nicht', lctx.laedenDerSzene('2.1').length === 0);
chk('auf der Schatzinsel auch nicht', lctx.laedenDerSzene('4.1').length === 0);
chk('eine unbekannte Szene ergibt nichts', lctx.laedenDerSzene('99.9').length === 0);
chk('und keine Szene bricht nicht', lctx.laedenDerSzene(null).length === 0);

lctx.setzeOrt('1.1', true);
chk('beim Krämer ist Einkaufen möglich', lctx.ladenMoeglich() === true);
lctx.setzeOrt('2.1', true);
chk('auf See nicht', lctx.ladenMoeglich() === false);
/* Ohne Verbindung wird NICHT gesperrt: Wir wissen dann nicht, wo die Gruppe
   steht, und eine Sperre aus Unwissen waere schlimmer als ein offener Laden -
   der Bogen soll offline benutzbar bleiben. */
lctx.setzeOrt(null, false);
chk('ohne Verbindung bleibt er offen', lctx.ladenMoeglich() === true);

chk('der Katalog ist im Quelltext hinter dem Schalter',
  BOGEN.indexOf('if (!ladenOffen)') >= 0 && BOGEN.indexOf('ladenAufschlagen()') >= 0);
chk('ein Szenenwechsel schließt ihn wieder',
  BOGEN.indexOf('aktuelleSzene = neu; ladenOffen = false;') >= 0);
chk('die Szene wird nur gelesen, nie geschrieben',
  BOGEN.indexOf("db.ref('currentScene').on(") >= 0 &&
  BOGEN.indexOf("db.ref('currentScene').set") < 0);

console.log('');
console.log('=== WAS DIE SPIELLEITUNG ÜBERGIBT, KOMMT AN ===');
const zCode = schnitt('function zuteilungAnnehmen(', 'function ladenAufschlagen()');
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

chk('der Spieler erfährt davon', BOGEN.indexOf('Von der Spielleitung') >= 0);
chk('erst eintragen, dann räumen',
  BOGEN.indexOf('speichern();') < BOGEN.indexOf("'/zuteilung').remove()"),
  { speichern: BOGEN.indexOf('speichern();'), remove: BOGEN.indexOf("'/zuteilung').remove()") });

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

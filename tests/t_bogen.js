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
chk('er liegt über dem offenen Bogen', zHub > zDrawer, { hub: zHub, drawer: zDrawer });
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
const code = schnitt('function tagFeld(', 'document.addEventListener(\'mouseover\'');

const tagsEl = { innerHTML: '' };
let tipEl = null;
const ctx = {
  Math, Object, String, Array, Number, Date, console, RegExp,
  F: { tal: [], hnd: [] },
  TAL_BY_ID: R.TAL_BY_ID, HND_BY_ID: R.HND_BY_ID, RAENGE: R.RAENGE,
  esc: function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  },
  window: { innerWidth: 400, innerHeight: 700 },   // schmal wie der iframe auf der Karte
  document: {
    getElementById: function (id) { return id === 'tags' ? tagsEl : tipEl; },
    createElement: function () {
      return {
        id: '', innerHTML: '', style: {},
        getBoundingClientRect: function () { return { left: 0, top: 0, width: 300, height: 120 }; }
      };
    },
    body: { appendChild: function (el) { tipEl = el; return el; } }
  }
};
vm.createContext(ctx);
vm.runInContext(code, ctx);

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
console.log('=== AUCH DIE REGIE SIEHT, WAS EIN TALENT TUT ===');
const REGIE = fs.readFileSync(path.join(BASIS, 'regie_figuren.html'), 'utf8');
chk('die Chips tragen dort eine Erklärung',
  /class="tag pos" title="/.test(REGIE) && /class="tag neg" title="/.test(REGIE));
chk('mit der Wirkung, nicht nur dem Namen', REGIE.indexOf('x.d') >= 0);
chk('und der Mauszeiger sagt es an', REGIE.indexOf('cursor:help') >= 0);

console.log('');
console.log(f === 0 ? 'OK: ' + anzahl + '   FEHLER: 0' : 'OK: ' + (anzahl - f) + '   FEHLER: ' + f);
process.exit(f ? 1 : 0);

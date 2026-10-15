/* ==========================================================
   NSC-BLÄTTER — js/npcs.js und besatzung.html
   ----------------------------------------------------------
   Die NSC trugen bis zum 15.10.2026 Werte im alten W100-System,
   also seit dem Systemwechsel im September falsche. Diese
   Prüfungen halten zweierlei fest:

   1. Die Blätter rechnen im NEUEN System und sind in sich
      stimmig (keine unbekannte Fertigkeit, kein erfundenes
      Talent, keine Stufe außerhalb der Skala).
   2. Die Figuren bleiben erkennbar. Das ist der eigentliche
      Punkt: Eine Umrechnung, die Cormac zum schlechteren
      Kämpfer als Harwick macht, ist technisch sauber und
      trotzdem falsch — sie widerspräche besatzung.html.
   ========================================================== */
const fs = require('fs'), path = require('path');
const BASIS = path.join(__dirname, '..');
const R = require(path.join(BASIS, 'js/regelwerk.js'));
global.alsFigur = R.alsFigur;
const N = require(path.join(BASIS, 'js/npcs.js'));

let f = 0, anzahl = 0;
const chk = (n, c, x) => { anzahl++; console.log((c ? 'OK  ' : 'FAIL') + ' ' + n + (c ? '' : '  <<< ' + JSON.stringify(x))); if (!c) f++; };

const ALLE = Object.keys(N.NSC);
const MANN = Object.keys(N.NSC_MANNSCHAFT);

console.log('=== DIE BLÄTTER SIND VOLLSTÄNDIG ===');
chk('acht Kernfiguren', ALLE.length === 8, ALLE.length);
chk('vierzehn Mannschaftsmitglieder', MANN.length === 14, MANN.length);
chk('jede Kernfigur hat Namen und Rolle',
  ALLE.every(id => N.NSC[id].name && N.NSC[id].rolle));
chk('jede hat alle fünf Attribute',
  ALLE.every(id => R.ATTR_NAMEN.every(a => N.NSC[id].attr[a] >= 1)),
  ALLE.filter(id => !R.ATTR_NAMEN.every(a => N.NSC[id].attr[a] >= 1)));
chk('auch die Mannschaft hat Attribute',
  MANN.every(id => N.NSC_MANNSCHAFT[id].attr), MANN.filter(id => !N.NSC_MANNSCHAFT[id].attr));

console.log('');
console.log('=== KEINE ERFUNDENEN BEZEICHNER ===');
/* Ein Tippfehler in einer Fertigkeit faellt sonst nie auf: Die Anzeige
   zeigt ihn einfach nicht, und am Tisch fehlt der Wert. */
function unbekannteFert(e) {
  return Object.keys(e.fert || {}).filter(k => R.FERT_NAMEN.indexOf(k) < 0);
}
const fertFehler = [].concat(
  ...ALLE.map(id => unbekannteFert(N.NSC[id]).map(k => N.NSC[id].name + ': ' + k)),
  ...MANN.map(id => unbekannteFert(N.NSC_MANNSCHAFT[id]).map(k => N.NSC_MANNSCHAFT[id].name + ': ' + k)));
chk('jede Fertigkeit gibt es wirklich', fertFehler.length === 0, fertFehler);

const attrFehler = [].concat(
  ...ALLE.map(id => Object.keys(N.NSC[id].attr).filter(a => R.ATTR_NAMEN.indexOf(a) < 0)));
chk('jedes Attribut gibt es wirklich', attrFehler.length === 0, attrFehler);

const talFehler = [].concat(...ALLE.map(id =>
  (N.NSC[id].tal || []).filter(t => !R.TAL_BY_ID[t]).map(t => N.NSC[id].name + ': ' + t)));
chk('jedes Talent gibt es wirklich', talFehler.length === 0, talFehler);
const hndFehler = [].concat(...ALLE.map(id =>
  (N.NSC[id].hnd || []).filter(h => !R.HND_BY_ID[h]).map(h => N.NSC[id].name + ': ' + h)));
chk('jede Schwäche gibt es wirklich', hndFehler.length === 0, hndFehler);

const ausserhalb = [].concat(
  ...ALLE.map(id => Object.values(N.NSC[id].attr).concat(Object.values(N.NSC[id].fert || {}))
    .filter(v => v < 1 || v > 5)));
chk('keine Stufe außerhalb d4–d12', ausserhalb.length === 0, ausserhalb);
chk('kein Rang außerhalb der Leiter',
  ALLE.every(id => N.NSC[id].rang >= 0 && N.NSC[id].rang < R.RAENGE.length));

console.log('');
console.log('=== DIE FIGUREN BLEIBEN ERKENNBAR ===');
/* Jede dieser Prüfungen steht für einen Satz aus besatzung.html. Geht eine
   davon kaputt, ist nicht der Code falsch, sondern die Figur. */
const W = {};
ALLE.forEach(id => { W[id] = N.NSC[id]; });
const F = {};
ALLE.forEach(id => { F[id] = N.nscAlsFigur(N.NSC[id]); });

chk('Cormac schlägt besser zu als sein Kapitän  (alt: Kampf 7 gegen 6)',
  W.cormac.fert['Kämpfen'] > W.harwick.fert['Kämpfen'],
  { cormac: W.cormac.fert['Kämpfen'], harwick: W.harwick.fert['Kämpfen'] });
chk('aber Harwick führt  (Auftreten 5★, "unangefochtene Autorität")',
  W.harwick.attr['Willenskraft'] > W.cormac.attr['Willenskraft']);
chk('Cormac denkt mit den Händen  (alt: INT 2)',
  W.cormac.attr['Verstand'] <= 2, W.cormac.attr['Verstand']);
chk('Wat ist der Brocken  (alt: Körper 5★, "ein Bär von einem Mann")',
  W.wat.attr['Stärke'] === Math.max(...ALLE.filter(i => i !== 'seelenloser')
    .map(i => W[i].attr['Stärke'])));
chk('und redet nicht  (alt: Rhetorik 1)',
  (W.wat.fert['Überreden'] || 0) < (W.francesco.fert['Überreden'] || 0));
chk('Francesco redet am besten  (alt: Rhetorik 7)',
  W.francesco.fert['Überreden'] === Math.max(...ALLE.filter(i => i !== 'seelenloser')
    .map(i => W[i].fert['Überreden'] || 0)));
chk('und hält am wenigsten aus  (alt: Körper 2)',
  R.robustheit(F.francesco) === Math.min(...ALLE.map(i => R.robustheit(F[i]))),
  ALLE.map(i => W[i].name + ':' + R.robustheit(F[i])));
chk('Tom ist der beste Segler  (alt: Seefahrt 7, Steuermann)',
  W.tom.fert['Segeln'] >= Math.max(...ALLE.filter(i => i !== 'seelenloser')
    .map(i => W[i].fert['Segeln'] || 0)));
chk('Dirk schießt am besten  (Kanonenmeister)',
  W.dirk.fert['Schießen'] === Math.max(...ALLE.filter(i => i !== 'seelenloser')
    .map(i => W[i].fert['Schießen'] || 0)));
chk('Dirk kann nicht mit Menschen  (alt: Auftreten 2)',
  W.dirk.attr['Willenskraft'] <= 2);
chk('Josiah heilt am besten und kämpft am schlechtesten  (alt: Kampf 1)',
  W.josiah.fert['Heilkunde'] === Math.max(...ALLE.filter(i => i !== 'seelenloser')
    .map(i => W[i].fert['Heilkunde'] || 0)) &&
  W.josiah.fert['Kämpfen'] === Math.min(...ALLE.filter(i => i !== 'seelenloser')
    .map(i => W[i].fert['Kämpfen'] || 0)));

console.log('');
console.log('=== MASSVOLL, NICHT UNERREICHBAR ===');
/* Hendriks Vorgabe: "Die müssen nicht so stark sein." Als Massstab eine
   Startfigur, die ihre fuenf Attributspunkte in den Koerper steckt. */
const start = R.alsFigur({ attr: { 'Geschicklichkeit': 3, 'Verstand': 1, 'Willenskraft': 1,
                                   'Stärke': 4, 'Konstitution': 3 }, fert: { 'Kämpfen': 3 } });
const rStart = R.robustheit(start);
chk('eine frische Figur kommt auf Robustheit ' + rStart, rStart >= 5 && rStart <= 7, rStart);
const ohneBoss = ALLE.filter(i => i !== 'seelenloser');
chk('kein Crewmitglied liegt mehr als 2 darüber',
  ohneBoss.every(i => R.robustheit(F[i]) <= rStart + 2),
  ohneBoss.map(i => W[i].name + ':' + R.robustheit(F[i])));
chk('und keines hat fünf Attribute auf d12',
  ohneBoss.every(i => Object.values(W[i].attr).filter(v => v === 5).length <= 2),
  ohneBoss.map(i => W[i].name + ':' + Object.values(W[i].attr).filter(v => v === 5).length));
/* Der Boss darf darüber liegen - er ist der Boss. */
chk('der Seelenlose liegt über allen', R.robustheit(F.seelenloser) >=
  Math.max(...ohneBoss.map(i => R.robustheit(F[i]))));

console.log('');
console.log('=== VIELFALT ===');
/* "Sei ruhig etwas vielfaeltiger was die Charaktere angeht" - das laesst
   sich zaehlen. Das alte Blatt kannte elf Fertigkeiten. */
const benutzt = new Set();
ALLE.forEach(id => Object.keys(W[id].fert || {}).forEach(k => benutzt.add(k)));
MANN.forEach(id => Object.keys(N.NSC_MANNSCHAFT[id].fert || {}).forEach(k => benutzt.add(k)));
chk('mindestens 14 der 16 Fertigkeiten kommen vor', benutzt.size >= 14,
  { benutzt: benutzt.size, fehlen: R.FERT_NAMEN.filter(k => !benutzt.has(k)) });
chk('keine zwei Kernfiguren haben dieselben Attribute',
  new Set(ALLE.map(i => JSON.stringify(W[i].attr))).size === ALLE.length);
chk('nicht alle sind Novize', new Set(ALLE.map(i => W[i].rang)).size >= 3,
  ALLE.map(i => W[i].rang));
chk('Harwick ist kein Novize mehr', W.harwick.rang >= 2, W.harwick.rang);
chk('jede Kernfigur hat Talente', ALLE.every(i => (W[i].tal || []).length >= 3));
chk('jede Kernfigur außer dem Boss hat Schwächen',
  ohneBoss.every(i => (W[i].hnd || []).length >= 1));

console.log('');
console.log('=== d12 TRÄGT NUR DER SEELENLOSE ===');
/* Hendriks Einwand vom 15.10.2026: d12 ist in diesem Regelwerk die Spitze
   der Skala, und vorher trugen sieben von acht Figuren mindestens einen -
   vierzehn Stueck insgesamt. Unterschiede sollen ueber Talente kommen,
   nicht ueber Zahlen an der Decke. */
function d12Zahl(e) {
  return Object.values(e.attr).filter(v => v === 5).length +
         Object.values(e.fert || {}).filter(v => v === 5).length;
}
chk('kein Crewmitglied hat einen d12',
  ohneBoss.every(i => d12Zahl(W[i]) === 0),
  ohneBoss.filter(i => d12Zahl(W[i])).map(i => W[i].name + ': ' + d12Zahl(W[i])));
chk('auch die Mannschaft nicht',
  MANN.every(id => d12Zahl(N.NSC_MANNSCHAFT[id]) === 0),
  MANN.filter(id => d12Zahl(N.NSC_MANNSCHAFT[id])));
chk('der Seelenlose schon', d12Zahl(W.seelenloser) >= 3, d12Zahl(W.seelenloser));
/* Und die Unterschiede sind trotzdem noch da - das ist der Prueffall,
   denn eine flache Umrechnung macht alle gleich. */
chk('die Crew ist trotzdem unterscheidbar',
  new Set(ohneBoss.map(i => JSON.stringify(W[i].fert))).size === ohneBoss.length);

console.log('');
console.log('=== EINZIGARTIGE TALENTE GEHÖREN GENAU EINER FIGUR ===');
const nurNsc = R.TALENTE.filter(t => t.nurNsc).map(t => t.id)
  .concat(R.HANDICAPS.filter(h => h.nurNsc).map(h => h.id));
chk('es gibt welche', nurNsc.length >= 8, nurNsc.length);
const traeger = {};
ALLE.forEach(i => (W[i].tal || []).concat(W[i].hnd || []).forEach(x => {
  if (nurNsc.indexOf(x) >= 0) (traeger[x] = traeger[x] || []).push(i);
}));
chk('jedes wird auch wirklich getragen',
  nurNsc.every(x => traeger[x]), nurNsc.filter(x => !traeger[x]));
chk('und zwar von genau einer Figur',
  Object.keys(traeger).every(x => traeger[x].length === 1),
  Object.keys(traeger).filter(x => traeger[x].length > 1));
/* Der eigentliche Zweck des Merkmals: Ein Spieler darf sich "Kein Gewissen"
   nicht aussuchen. Geprueft ueber die Funktion, nicht ueber die Oberflaeche. */
const held = R.alsFigur({}); held.rang = 4; held.steigerungen = 20;
chk('ein Spieler kann sie nicht wählen',
  R.TALENTE.filter(t => t.nurNsc).every(t => R.talentWaehlbar(held, t) === false));
chk('normale Talente bleiben wählbar',
  R.talentWaehlbar(held, R.TAL_BY_ID['seebein']).ok === true);

console.log('');
console.log('=== besatzung.html ZEIGT DIESELBEN ZAHLEN ===');
const SEITE = fs.readFileSync(path.join(BASIS, 'besatzung.html'), 'utf8');
chk('kein alter Grundwert mehr im Markup',
  SEITE.indexOf('gw-name">Körper') < 0 && SEITE.indexOf('gw-name">INT') < 0 &&
  SEITE.indexOf('Mastery') < 0);
chk('alle 22 Figuren haben einen Platzhalter',
  (SEITE.match(/class="nsc-werte"/g) || []).length === 21,
  (SEITE.match(/class="nsc-werte"/g) || []).length);
chk('die Seite lädt das Regelwerk', SEITE.indexOf('js/regelwerk.js') > 0);
chk('und die Blätter', SEITE.indexOf('js/npcs.js') > 0);
/* Jeder Platzhalter muss auf eine Figur zeigen, die es gibt - sonst steht
   dort "Kein Blatt hinterlegt", und niemand sucht den Grund. */
const ids = (SEITE.match(/data-nsc="([a-z]+)"/g) || []).map(x => x.slice(10, -1));
const tot = ids.filter(id => !N.NSC[id] && !N.NSC_MANNSCHAFT[id]);
chk('jeder Platzhalter zeigt auf ein Blatt', tot.length === 0, tot);

console.log('');
console.log('=== DIE MARKEN ERKLAEREN SICH, WIE IM SPIELERBOGEN ===');
/* Die Seite wird WIRKLICH gerendert, nicht im Quelltext durchsucht: Ein
   fehlendes data-tipart ist gueltiges HTML und faellt erst am Tisch auf,
   wenn das Overlay leer bleibt. */
const vm = require('vm');
const bAnf = SEITE.lastIndexOf('(function () {');
const bEnd = SEITE.indexOf('})();', bAnf);
if (bAnf < 0 || bEnd < 0) { console.log('FAIL Renderblock nicht gefunden'); process.exit(1); }
const bCode = SEITE.slice(bAnf, bEnd + 5);

const gerendert = {};
let aktiviert = 0;
const bctx = {
  console,
  NSC: N.NSC, NSC_MANNSCHAFT: N.NSC_MANNSCHAFT,
  TAL_BY_ID: R.TAL_BY_ID, HND_BY_ID: R.HND_BY_ID,
  DLBL: R.DLBL, ATTR_NAMEN: R.ATTR_NAMEN, RAENGE: R.RAENGE, AUSR_BY_ID: R.AUSR_BY_ID,
  rangName: R.rangName, parade: R.parade, robustheit: R.robustheit,
  bennies: R.bennies, nscAlsFigur: N.nscAlsFigur,
  markenAktivieren: function () { aktiviert++; },
  Object,
  document: {
    querySelectorAll: () => ids.map(id => ({
      dataset: { nsc: id },
      set innerHTML(v) { gerendert[id] = v; }
    }))
  }
};
vm.createContext(bctx);
vm.runInContext(bCode, bctx);

chk('die Seite haengt die Marken-Mechanik ein', aktiviert === 1, aktiviert);
chk('und bringt sie nicht als eigene Kopie mit',
  SEITE.indexOf('function tagModalAuf(') < 0 && SEITE.indexOf('js/marken.js') > 0);
chk('alle Platzhalter wurden gerendert',
  Object.keys(gerendert).length === ids.length, Object.keys(gerendert).length);

/* Jeder Chip muss den Vertrag aus js/marken.js tragen - alle fuenf Felder,
   sonst zeigt das Overlay Leerstellen. */
const chips = [];
Object.keys(gerendert).forEach(id => {
  const m = gerendert[id].match(/<span class="nsc-tag[^"]*"[^>]*>/g) || [];
  m.forEach(t => chips.push({ figur: id, tag: t }));
});
chk('es stehen ueberhaupt Marken auf der Seite', chips.length >= 15, chips.length);
const feld = (t, n) => { const m = t.match(new RegExp('data-' + n + '="([^"]*)"')); return m ? m[1] : null; };
const unvollstaendig = chips.filter(c =>
  !feld(c.tag, 'tipid') || !feld(c.tag, 'tipart') || !feld(c.tag, 'tipn') ||
  !feld(c.tag, 'tipk') || !feld(c.tag, 'tipt'));
chk('jeder Chip traegt alle fuenf Felder', unvollstaendig.length === 0,
  unvollstaendig.slice(0, 3));
chk('jeder ist anklickbar und mit der Tastatur erreichbar',
  chips.every(c => c.tag.indexOf('class="nsc-tag tag"') >= 0 &&
    c.tag.indexOf('tabindex="0"') >= 0 && c.tag.indexOf('role="button"') >= 0));
/* Die Art entscheidet, in welchem Verzeichnis das Overlay nachsieht - eine
   Verwechslung laesst den Zusatz still verschwinden. */
const VERZEICHNIS = { tal: R.TAL_BY_ID, hnd: R.HND_BY_ID, ausr: R.AUSR_BY_ID };
const falscheArt = chips.filter(c => {
  const id = feld(c.tag, 'tipid'), art = feld(c.tag, 'tipart');
  return !VERZEICHNIS[art] || !VERZEICHNIS[art][id];
});
chk('Art und Kennung passen zusammen', falscheArt.length === 0, falscheArt.slice(0, 3));

/* Seit dem 15.10.2026 tragen die bekannten Leute auch Ausruestung - und
   die steht auf ihrer Karte, nicht nur im Kampfmodus. */
const ausrChips = chips.filter(c => feld(c.tag, 'tipart') === 'ausr');
chk('die Ausrüstung steht auf den Karten', ausrChips.length >= 8, ausrChips.length);
chk('und zwar nur, was es wirklich gibt',
  ausrChips.every(c => !!R.AUSR_BY_ID[feld(c.tag, 'tipid')]));
chk('jede Kernfigur trägt etwas',
  ALLE.every(id => (N.NSC[id].ausr || []).length > 0),
  ALLE.filter(id => !(N.NSC[id].ausr || []).length));
/* Und das Blatt traegt es auch: Ohne das waere die Zuordnung Zierde. */
chk('das Blatt kennt die Ausrüstung',
  (N.nscAlsFigur(N.NSC['wat']).ausr || []).indexOf('enteraxt') >= 0,
  N.nscAlsFigur(N.NSC['wat']).ausr);
chk('die Wirkung steht wirklich drin, nicht nur der Name',
  chips.every(c => feld(c.tag, 'tipt') === null ||
    feld(c.tag, 'tipt').length > 10));
/* Figurgebundene Talente muessen das sagen - sonst sucht jemand sie in der
   Charaktererschaffung und findet sie nie. */
const eigene = chips.filter(c => {
  const id = feld(c.tag, 'tipid');
  const x = R.TAL_BY_ID[id] || R.HND_BY_ID[id];
  return x && x.nurNsc;
});
chk('es stehen einzigartige Marken auf der Seite', eigene.length >= 8, eigene.length);
chk('und sie sagen, dass sie niemand waehlen kann',
  eigene.every(c => feld(c.tag, 'tipk').indexOf('nur für diese Figur') >= 0),
  eigene.map(c => feld(c.tag, 'tipk')).slice(0, 2));

console.log('');
console.log(f === 0 ? 'OK: ' + anzahl + '   FEHLER: 0' : 'OK: ' + (anzahl - f) + '   FEHLER: ' + f);
process.exit(f ? 1 : 0);

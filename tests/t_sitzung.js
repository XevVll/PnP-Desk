/* ==========================================================
   SITZUNGEN — Festlegung gegen Zeiger
   ----------------------------------------------------------
   Hendriks Meldung vom 15.10.2026: „Irgendwie bleibt die
   gesetzte Sitzung nicht. Ich werde ständig von der Sitzung
   Test wieder in die pnpgang geholt."

   Es gibt zwei Zustände, und sie hießen beide „die Sitzung":

     aktiveSitzung      - der Zeiger. Dort sind die Spieler.
     pnp_sitzung_fest   - die Festlegung DIESES Browsers. Sie
                          schlägt den Zeiger und folgt ihm nicht.

   Dass die Festlegung gewinnt, ist Absicht — sonst würde ein
   Blick in eine ruhende Runde die ganze Gruppe mitnehmen. Der
   Fehler war, dass sie NIRGENDS stand: Der Hub zeigte den
   Zeiger, die Werkzeug-Links folgten der Festlegung, und beide
   konnten auseinanderliegen, ohne dass man es sah.

   Diese Prüfungen halten beides fest: das gewollte Verhalten
   UND dass es sichtbar ist.
   ========================================================== */
const fs = require('fs'), path = require('path'), vm = require('vm');
const BASIS = path.join(__dirname, '..');

let f = 0, anzahl = 0;
const chk = (n, c, x) => { anzahl++; console.log((c ? 'OK  ' : 'FAIL') + ' ' + n + (c ? '' : '  <<< ' + JSON.stringify(x))); if (!c) f++; };

/* Ein localStorage, das sich wie eines verhält. js/sitzung.js greift auf
   das GLOBALE zu, nicht auf einen Seitenkontext - die Lehre vom 11.10. */
const speicher = {};
global.localStorage = {
  getItem: k => (k in speicher ? speicher[k] : null),
  setItem: (k, v) => { speicher[k] = String(v); },
  removeItem: k => { delete speicher[k]; }
};
global.location = { search: '' };
const S = require(path.join(BASIS, 'js/sitzung.js'));

/* Eine Datenbank, die nur mitschreibt, wer worauf horcht. */
function fakeDb(werte) {
  const lauscher = {};
  return {
    lauscher,
    ref: function (p) {
      return {
        on: function (ev, cb) { (lauscher[p] = lauscher[p] || []).push(cb); cb({ val: () => werte[p] }); },
        once: function () { return Promise.resolve({ val: () => werte[p] }); },
        set: function () { return Promise.resolve(); }
      };
    },
    setze: function (p, v) {
      werte[p] = v;
      (lauscher[p] || []).forEach(cb => cb({ val: () => v }));
    }
  };
}

console.log('=== DIE FESTLEGUNG SCHLAEGT DEN ZEIGER, UND ZWAR ABSICHTLICH ===');
S.loeseSitzung();
let geladen = 0;
global.location = { search: '', reload: () => { geladen++; } };

/* Ohne Festlegung folgt der Browser dem Zeiger - das ist der Spielerfall.
   Achtung, und das ist Absicht: Die Huelle entsteht SOFORT aus dem Cache,
   nicht aus dem Zeiger - sonst waere in sieben Dateien der Ablauf von
   synchron auf asynchron umzubauen (Begruendung vom 07.09.2026). Weicht
   der Cache ab, korrigiert sich die Seite durch ein Neuladen. */
let db = fakeDb({ aktiveSitzung: 'test' });
let h = S.sitzungsDbJetzt(db);
chk('ohne Cache gilt zunaechst die Vorgabe', h.sitzung === S.SITZUNG_VORGABE, h.sitzung);
chk('der Zeiger korrigiert das durch Neuladen', geladen === 1, geladen);
chk('und steht danach im Cache', S.sitzungAusCache() === 'test', S.sitzungAusCache());
/* Beim naechsten Laden stimmt es dann ohne Umweg. */
geladen = 0;
chk('der zweite Aufruf trifft die laufende Sitzung sofort',
  S.sitzungsDbJetzt(fakeDb({ aktiveSitzung: 'test' })).sitzung === 'test');
chk('und laedt dann auch nicht neu', geladen === 0, geladen);
db = fakeDb({ aktiveSitzung: 'test' });
S.sitzungsDbJetzt(db);
db.setze('aktiveSitzung', 'pnpgang');
chk('ein Wechsel des Zeigers laedt die Seite neu', geladen === 1, geladen);

/* Mit Festlegung NICHT - sonst koennte die Spielleitung nicht in eine
   ruhende Sitzung sehen, ohne die Gruppe mitzunehmen. */
S.setzeSitzungFest('pnpgang');
geladen = 0;
db = fakeDb({ aktiveSitzung: 'test' });
h = S.sitzungsDbJetzt(db);
chk('die Festlegung gewinnt gegen den Zeiger', h.sitzung === 'pnpgang', h.sitzung);
db.setze('aktiveSitzung', 'anders');
chk('und folgt ihm nachweislich nicht', geladen === 0, geladen);
chk('sie haengt auch keinen Lauscher ein',
  Object.keys(db.lauscher).length === 0, Object.keys(db.lauscher));

/* Eine Sitzung in der Adresse ist eine bewusste Wahl - und sie
   ueberschreibt die Festlegung fuer den GANZEN Browser. Genau deshalb
   muss sie sichtbar sein. */
global.location = { search: '?sitzung=test', reload: () => {} };
h = S.sitzungsDbJetzt(fakeDb({ aktiveSitzung: 'pnpgang' }));
chk('eine Sitzung in der Adresse legt fest', S.sitzungFest() === 'test', S.sitzungFest());
chk('und wirkt sofort', h.sitzung === 'test', h.sitzung);
global.location = { search: '', reload: () => {} };
chk('die Festlegung ueberlebt den naechsten Aufruf ohne Adresse',
  S.sitzungsDbJetzt(fakeDb({ aktiveSitzung: 'pnpgang' })).sitzung === 'test');
S.loeseSitzung();
chk('loesen laesst wieder dem Zeiger folgen',
  S.sitzungsDbJetzt(fakeDb({ aktiveSitzung: 'pnpgang' })).sitzung === 'pnpgang');

console.log('');
console.log('=== DER HUB ZEIGT BEIDE ZUSTAENDE ===');
/* Der gemeldete Fall, Schritt fuer Schritt: Der Zeiger steht auf "test",
   der Browser ist auf "pnpgang" festgelegt. Vorher sah man nur "test". */
const HUB = fs.readFileSync(path.join(BASIS, 'regie_hub.html'), 'utf8');
function schnitt(von, bis) {
  const a = HUB.indexOf(von), b = HUB.indexOf(bis, a);
  if (a < 0 || b < 0) { console.log('FAIL Schnitt misslungen: ' + von); process.exit(1); }
  return HUB.slice(a, b);
}
const hubCode = schnitt('function zeichneKopf()', 'function regieOeffnen(');

const knoten = {};
function neu(id) {
  return knoten[id] = { id, textContent: '', title: '', href: '', dataset: {}, style: {} };
}
['festBadge', 'festLoesen', 'wzHinweis'].forEach(neu);
const links = ['regie.html', 'regie_figuren.html', 'arena_admin.html', 'karte.html'].map(z => {
  const n = neu('link_' + z); n.dataset.ziel = z; return n;
});
let gemeldet = '';
const hctx = {
  console, encodeURIComponent, Array,
  document: { querySelectorAll: () => links },
  el: id => knoten[id] || null,
  meld: (id, t) => { gemeldet = t; },
  sitzungFest: S.sitzungFest, loeseSitzung: S.loeseSitzung,
  zeichneSitzungen: () => {},
  sitzungen: { test: { meta: { name: 'Test' } }, pnpgang: { meta: { name: 'PnPGang' } } },
  aktiv: 'test'
};
vm.createContext(hctx);
vm.runInContext(hubCode, hctx);

S.setzeSitzungFest('pnpgang');
hctx.zeichneKopf();
chk('der Hub nennt die Festlegung beim Namen',
  knoten.festBadge.textContent.indexOf('PnPGang') >= 0, knoten.festBadge.textContent);
chk('und faerbt sie, wenn sie von der laufenden abweicht',
  knoten.festBadge.style.color === '#ca6702', knoten.festBadge.style.color);
chk('der Hinweis sagt, dass die Spieler woanders sind',
  knoten.festBadge.title.indexOf('PnPGang') >= 0 && knoten.festBadge.title.indexOf('Test') >= 0,
  knoten.festBadge.title);
chk('der Loesen-Knopf ist da', knoten.festLoesen.style.display === '');
/* Der Kern des gemeldeten Fehlers: Die Werkzeug-Links fuehrten in die
   Festlegung, waehrend der Hub daneben die laufende Sitzung anzeigte. */
chk('jeder Werkzeug-Link sagt, wohin er fuehrt',
  links.every(a => a.href === a.dataset.ziel + '?sitzung=pnpgang'),
  links.map(a => a.href));
chk('und der Hinweistext nennt dieselbe Sitzung',
  knoten.wzHinweis.textContent.indexOf('PnPGang') >= 0, knoten.wzHinweis.textContent);

/* Loesen muss wirklich loesen - und zwar den Schluessel, nicht nur die Anzeige. */
hctx.festLoesen();
chk('loesen raeumt die Festlegung weg', S.sitzungFest() === '', S.sitzungFest());
chk('die Links zeigen danach auf die laufende Sitzung',
  links.every(a => a.href === a.dataset.ziel + '?sitzung=test'), links.map(a => a.href));
chk('der Loesen-Knopf verschwindet', knoten.festLoesen.style.display === 'none');
chk('und der Spielleitung wird es gesagt', gemeldet.indexOf('gelöst') >= 0, gemeldet);
chk('ohne Festlegung ist die Anzeige nicht mehr orange',
  knoten.festBadge.style.color === '', knoten.festBadge.style.color);

/* Ohne laufende und ohne festgelegte Sitzung darf kein Link ins Leere
   zeigen - sonst landet die Spielleitung in der Vorgabe-Sitzung. */
hctx.aktiv = null;
hctx.zeichneKopf();
chk('ohne jede Sitzung tragen die Links keine',
  links.every(a => a.href === a.dataset.ziel), links.map(a => a.href));
chk('und der Hinweis sagt, was zu tun ist',
  knoten.wzHinweis.textContent.indexOf('Wähl') >= 0, knoten.wzHinweis.textContent);
hctx.aktiv = 'test';

console.log('');
console.log('=== JEDE SL-SEITE SAGT, IN WELCHER SITZUNG SIE STEHT ===');
/* Vorher tat das nur regie.html. Die Figuren-Uebersicht und das
   Schlachtfeld zeigten gar nichts - man konnte den Endkampf einer
   ruhenden Runde vor sich haben. */
['regie.html', 'regie_figuren.html', 'arena_admin.html'].forEach(function (seite) {
  const q = fs.readFileSync(path.join(BASIS, seite), 'utf8');
  chk(seite + ' hat die Anzeige', q.indexOf('id="sitzungBadge"') > 0);
});
['regie_figuren.html', 'arena_admin.html'].forEach(function (seite) {
  const q = fs.readFileSync(path.join(BASIS, seite), 'utf8');
  chk(seite + ' fuellt sie auch', q.indexOf("sitzungBadge(db, 'sitzungBadge')") > 0);
});
const VAULT = fs.readFileSync(path.join(BASIS, 'js/regie_vault.js'), 'utf8');
chk('regie_vault.js bringt keine eigene Kopie mehr mit',
  VAULT.indexOf('sitzungBadge(db') > 0 && VAULT.indexOf("ref('aktiveSitzung').on") < 0);

/* Die Anzeige selbst: orange genau dann, wenn die gezeigte Sitzung nicht
   die laufende ist. Wirklich ausgefuehrt, nicht im Quelltext gesucht. */
const feld = { textContent: '', title: '', style: {} };
global.document = { getElementById: id => (id === 'sitzungBadge' ? feld : null) };
const zdb = fakeDb({ 'sitzungen/pnpgang/meta/name': 'PnPGang', aktiveSitzung: 'test' });
S.sitzungBadge({ sitzung: 'pnpgang', echt: zdb }, 'sitzungBadge');
chk('die Anzeige warnt in der falschen Sitzung', feld.style.color === '#ca6702', feld.style);
chk('und sagt, dass die Spieler woanders sind', feld.title.indexOf('woanders') >= 0, feld.title);
zdb.setze('aktiveSitzung', 'pnpgang');
chk('in der laufenden warnt sie nicht', feld.style.color === '', feld.style);
chk('sie faellt ohne Datenbank nicht um',
  (function () { try { S.sitzungBadge({ sitzung: 'x', echt: null }, 'sitzungBadge'); return true; } catch (e) { return false; } })());

console.log('');
console.log('=== DIE SPIELERBILDER GEHOEREN IN DIE SITZUNG ===');
/* Das Charakterbild eines Spielers liegt unter pcLeiste. Dass dieser Pfad
   in SITZUNGS_PFADE steht, ist keine Ordnungsfrage, sondern die ganze
   Begruendung dafuer, dass KEINE Firebase-Regel von Hand veroeffentlicht
   werden muss: Er landet damit unter sitzungen/{sid}/stand/, und
   "sitzungen" ist laengst freigegeben. Faellt er aus der Liste, wird er
   ein neuer Top-Level-Pfad - und jeder Upload schlaegt STILL fehl. */
chk('pcLeiste ist ein Sitzungspfad', S.istSitzungsPfad('pcLeiste'));
chk('und landet unter dem Sitzungsstand',
  S.sitzungsPfad('test', 'pcLeiste/anna') === 'sitzungen/test/stand/pcLeiste/anna',
  S.sitzungsPfad('test', 'pcLeiste/anna'));
/* Zwei Sitzungen duerfen sich die Bilder nicht teilen - sonst steht in
   Runde B das Portraet aus Runde A. */
chk('zwei Sitzungen teilen sich kein Bild',
  S.sitzungsPfad('a', 'pcLeiste/anna') !== S.sitzungsPfad('b', 'pcLeiste/anna'));
/* Gegenprobe: Ein Pfad, der NICHT in der Liste steht, bleibt global -
   genau das waere der stille Fehlschlag. */
chk('ein unbekannter Pfad bliebe global',
  S.sitzungsPfad('test', 'pcBilder/anna') === 'pcBilder/anna',
  S.sitzungsPfad('test', 'pcBilder/anna'));

console.log('');
console.log(f === 0 ? 'OK: ' + anzahl + '   FEHLER: 0' : 'OK: ' + (anzahl - f) + '   FEHLER: ' + f);
process.exit(f ? 1 : 0);

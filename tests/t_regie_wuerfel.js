/* ==========================================================
   WÜRFE IN DER REGIE — regie_figuren.html
   ----------------------------------------------------------
   Die Seite wird hier WIRKLICH AUSGEFÜHRT, nicht nur geparst.
   Dieselbe Begründung wie bei tests/t_wuerfel.js: Ein nackter
   Bezeichner im Code ist gültiges JavaScript und knallt erst
   zur Laufzeit; eine Syntaxprüfung ist dafür blind.

   Der Prüfstein dieser Seite ist aber ein zweiter, schärferer:
   Sie war bis Oktober 2026 BEWUSST rein lesend ("geändert wird
   eine Figur ausschließlich von ihrem Spieler"). Jetzt schreibt
   sie — und darf dabei die Figur selbst nicht anfassen. Genau
   das wird hier erhoben: über ALLE Schreibzugriffe, die
   tatsächlich stattfinden, nicht über eine Liste bekannter
   Stellen.
   ========================================================== */
const fs = require('fs'), path = require('path'), vm = require('vm');
const BASIS = path.join(__dirname, '..');
const RW = require(path.join(BASIS, 'js/regelwerk.js'));

let f = 0, anzahl = 0;
const chk = (n, c, x) => { anzahl++; console.log((c ? 'OK  ' : 'FAIL') + ' ' + n + (c ? '' : '  <<< ' + JSON.stringify(x))); if (!c) f++; };

const SZENEN_DATEIEN = [
  'js/scenes.js', 'js/golden_lion_scenes.js', 'js/schatzinsel_scenes.js',
  'js/spanischer_hafen_scenes.js', 'js/schmugglernest_scenes.js',
  'js/artefakthandel_scenes.js', 'js/riffinsel_scenes.js',
  'js/grabesinsel_scenes.js', 'js/abspann_scenes.js', 'js/arena_scenes.js'
];

const SEITE = fs.readFileSync(path.join(BASIS, 'regie_figuren.html'), 'utf8');

/* Den eigenen Skriptblock der Seite herausschneiden - den letzten
   <script> ohne src. Findet das Muster nichts, bricht der Test ab:
   Eine Prüfung, die bei leerer Eingabe "OK" sagt, ist schlimmer als
   keine (karte.html, 09/2026). */
function seitenSkript() {
  const stellen = [];
  let i = 0;
  while ((i = SEITE.indexOf('<script', i)) >= 0) { stellen.push(i); i += 7; }
  for (let k = stellen.length - 1; k >= 0; k--) {
    const auf = SEITE.indexOf('>', stellen[k]);
    const tag = SEITE.slice(stellen[k], auf + 1);
    if (tag.indexOf('src=') >= 0) continue;
    const zu = SEITE.indexOf('</script>', auf);
    return SEITE.slice(auf + 1, zu);
  }
  return '';
}
const SKRIPT = seitenSkript();
if (SKRIPT.length < 2000) {
  console.log('ABBRUCH: Skriptblock der Seite nicht gefunden (' + SKRIPT.length + ' Zeichen).');
  process.exit(1);
}

/* ---------- Umgebung ---------- */
function bau() {
  const nachId = {};
  function knoten(id) {
    const n = {
      id: id, _html: '', textContent: '', className: '',
      classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
                   toggle(c, an) { if (an) this._s.add(c); else this._s.delete(c); },
                   contains(c) { return this._s.has(c); } },
      get innerHTML() { return n._html; }, set innerHTML(v) { n._html = v; },
      focus() { n._fokus = true; }, select() {}
    };
    nachId[id] = n;
    return n;
  }
  ['anzahl', 'inhalt', 'fbNote', 'erschLeiste', 'btnFiguren', 'btnProtokoll', 'btnBrief', 'btnAlle']
    .forEach(knoten);

  const schreib = [];      // jeder Schreibzugriff, der stattfindet
  const lauscher = {};
  function ref(p) {
    return {
      update(paket) { Object.keys(paket).forEach(k => schreib.push({ p: k, v: paket[k], op: 'update' })); return Promise.resolve(); },
      set(v) { schreib.push({ p: p, v: v, op: 'set' }); return Promise.resolve(); },
      push(v) { schreib.push({ p: p, v: v, op: 'push' }); return Promise.resolve({ key: 'k1' }); },
      remove() { schreib.push({ p: p, op: 'remove' }); return Promise.resolve(); },
      on(e, cb) { lauscher[p] = cb; },
      off() { delete lauscher[p]; }
    };
  }
  const db = { sitzung: 'test', ref: function (p) { return ref(p === undefined ? '' : p); } };

  const ctx = {
    Math, Object, String, Array, Number, Boolean, parseInt, parseFloat, Date, JSON,
    RegExp, Promise, Set, console, setTimeout, isNaN,
    localStorage: { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; },
                    removeItem(k) { delete this._d[k]; } },
    firebaseConfig: {},
    firebase: { initializeApp() {}, database() { return {}; },
                database_ServerValue: null },
    document: {
      getElementById(id) { return nachId[id] || null; },
      addEventListener(e, cb) { ctx.document['on_' + e] = cb; }
    }
  };
  ctx.firebase.database.ServerValue = { TIMESTAMP: 1 };
  // Der Export-Block der Seite ist der Zugang des Tests zu ihrem Zustand.
  ctx.module = { exports: {} };
  ctx.window = ctx;
  vm.createContext(ctx);

  vm.runInContext(fs.readFileSync(path.join(BASIS, 'js/sitzung.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(BASIS, 'js/identitaet.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(BASIS, 'js/regelwerk.js'), 'utf8'), ctx);
  SZENEN_DATEIEN.forEach(d => vm.runInContext(fs.readFileSync(path.join(BASIS, d), 'utf8'), ctx));
  // Die Hülle durch die Aufzeichnung ersetzen, BEVOR die Seite initFirebase() ruft.
  ctx.sitzungsDbJetzt = function () { return db; };
  vm.runInContext(SKRIPT, ctx);

  const u = { ctx, db, nachId, schreib, lauscher };
  u.inhalt = () => nachId['inhalt']._html;
  u.kopf = () => nachId['erschLeiste']._html;
  /* Klick auf ein Element mit diesen data-Attributen. closest() wird
     gestubbt, weil der Handler delegiert arbeitet. */
  u.klick = function (daten) {
    const ziel = { dataset: daten, closest: function () { return ziel; } };
    ctx.document.on_click({ target: { closest: function () { return ziel; } } });
  };
  u.tippe = function (text, taste) {
    ctx.document.on_keydown({ target: { id: 'kommFeld', value: text }, key: taste });
  };
  return u;
}

const FIGUREN = {
  anna: { name: 'Mara Quint', spieler: 'Anna', aktualisiert: Date.now(),
          attr: { 'Geschicklichkeit': 3, 'Verstand': 2, 'Willenskraft': 2, 'Stärke': 2, 'Konstitution': 2 },
          fert: { 'Kämpfen': 3, 'Segeln': 2 } },
  bert: { name: 'Tom Ash', spieler: 'Bert', aktualisiert: Date.now(),
          attr: { 'Geschicklichkeit': 2, 'Verstand': 3, 'Willenskraft': 2, 'Stärke': 2, 'Konstitution': 2 },
          fert: { 'Aufmerksamkeit': 2 } },
  cord: { name: 'Nell', spieler: 'Cord', aktualisiert: Date.now(), wunden: 4,
          attr: { 'Geschicklichkeit': 1, 'Verstand': 1, 'Willenskraft': 1, 'Stärke': 1, 'Konstitution': 1 },
          fert: {} }
};

console.log('=== DIE SEITE LÄUFT ÜBERHAUPT ===');
let u = bau();
const M = u.ctx.module.exports;
M.setFiguren(JSON.parse(JSON.stringify(FIGUREN)));
chk('drei Figuren gezeichnet', u.inhalt().indexOf('Mara Quint') >= 0 && u.inhalt().indexOf('Tom Ash') >= 0);
chk('Zähler stimmt', u.nachId['anzahl'].textContent === '3 Figuren', u.nachId['anzahl'].textContent);
chk('keine Warnung', u.nachId['fbNote'].className !== 'fbnote warn', u.nachId['fbNote'].textContent);

console.log('');
console.log('=== WERTE SIND ANKLICKBAR ===');
chk('Attribut trägt Wert und Figur', u.inhalt().indexOf('data-pid="anna" data-wert="Geschicklichkeit"') >= 0);
chk('Fertigkeit ebenso', u.inhalt().indexOf('data-wert="Kämpfen"') >= 0);
chk('Chip ist als klickbar markiert', u.inhalt().indexOf('class="w kl d3"') >= 0);
// Eine ungelernte Fertigkeit steht nur in der Vollansicht - aber auch dort klickbar.
M.setzeAnsicht('figuren');
u.klick({}); // ein Klick ohne Daten darf nichts tun
chk('Klick ohne Daten ändert nichts', M.zustand().menu === null);

console.log('');
console.log('=== ERSCHWERNIS: MODIFIKATOR UND VORGELESENE ZAHL ===');
/* Nicht ueber ctx: const auf oberster Ebene eines vm-Skripts landet im
   lexikalischen Scope des Kontexts, nicht als Eigenschaft des globalen
   Objekts (dieselbe Falle wie die dokumentierte TDZ-Falle). */
const Z = require(path.join(BASIS, 'js/regelwerk.js')).ZIELZAHL;
chk('vier Stufen angeboten', (u.kopf().match(/data-ersch=/g) || []).length === 4);
chk('normal ist vorgewählt', M.zustand().erschwernis === 0);
[[2, Z - 2], [0, Z], [-2, Z + 2], [-4, Z + 4]].forEach(function (pr) {
  u.klick({ ersch: String(pr[0]) });
  chk('Mod ' + pr[0] + ' heißt nötig ' + pr[1],
    M.zustand().erschwernis === pr[0] && u.kopf().indexOf('nötig ' + pr[1]) >= 0);
});
/* Das ist der tragende Punkt: "du brauchst eine 8" IST -4, weil das Ziel
   immer 4 ist. Beides muss am selben Knopf stehen, sonst rechnet die
   Spielleitung mit der einen Zahl und liest die andere vor. */
u.klick({ ersch: '-4' });
chk('der -4-Knopf nennt beides', u.kopf().indexOf('-4') >= 0 && u.kopf().indexOf('nötig 8') >= 0);

console.log('');
console.log('=== ANFORDERN: EINZELN ===');
u = bau(); const M1 = u.ctx.module.exports;
M1.setFiguren(JSON.parse(JSON.stringify(FIGUREN)));
u.klick({ ersch: '-4' });
u.klick({ pid: 'anna', wert: 'Kämpfen' });
chk('Menü offen', !!M1.zustand().menu && M1.zustand().menu.wert === 'Kämpfen');
chk('Menü nennt die nötige Zahl', u.inhalt().indexOf('nötig 8') >= 0);
chk('Menü bietet beide Wege', u.inhalt().indexOf('data-einzeln') >= 0 && u.inhalt().indexOf('data-alle') >= 0);
u.schreib.length = 0;
u.klick({ einzeln: '1' });
chk('genau EIN Schreibzugriff', u.schreib.length === 1, u.schreib);
chk('und zwar auf die Anfrage dieser Figur', u.schreib[0] && u.schreib[0].p === 'figuren/anna/anfrage', u.schreib[0]);
chk('mit Wert und Modifikator', u.schreib[0] && u.schreib[0].v.wert === 'Kämpfen' && u.schreib[0].v.mod === -4, u.schreib[0] && u.schreib[0].v);
chk('Menü schließt sich danach', M1.zustand().menu === null);

console.log('');
console.log('=== ANFORDERN: AN ALLE ===');
u = bau(); const M2 = u.ctx.module.exports;
M2.setFiguren(JSON.parse(JSON.stringify(FIGUREN)));
chk('die außer Gefecht gesetzte Figur zählt nicht mit', M2.gruppe().indexOf('cord') < 0, M2.gruppe());
chk('die beiden anderen schon', M2.gruppe().length === 2, M2.gruppe());
u.klick({ pid: 'anna', wert: 'Aufmerksamkeit' });
u.schreib.length = 0;
u.klick({ alle: '1' });
chk('zwei Schreibzugriffe, einer je Figur', u.schreib.length === 2, u.schreib.map(s => s.p));
chk('beide als EIN Sammel-Update', u.schreib.every(s => s.op === 'update'));
chk('Anna dabei', u.schreib.some(s => s.p === 'figuren/anna/anfrage'));
chk('Bert dabei', u.schreib.some(s => s.p === 'figuren/bert/anfrage'));
chk('Cord NICHT dabei', !u.schreib.some(s => s.p === 'figuren/cord/anfrage'));
/* Eine Gruppenprobe geht ausdrücklich auch an die Figur, die den Wert nicht
   gelernt hat - sie würfelt dann d4-2. Sonst wüsste der Spieler aus dem
   Ausbleiben der Bitte, dass er hier nichts kann. */
chk('auch die ungelernte Figur wird gefragt',
  u.schreib.some(s => s.p === 'figuren/anna/anfrage' && s.v.wert === 'Aufmerksamkeit'));

console.log('');
console.log('=== DIE FIGUR SELBST WIRD NIE ANGEFASST ===');
/* Die eigentliche Regel dieser Seite. Erhoben über alles, was tatsächlich
   geschrieben wurde - nicht über eine Liste bekannter Stellen. */
u = bau(); const M3 = u.ctx.module.exports;
M3.setFiguren(JSON.parse(JSON.stringify(FIGUREN)));
M3.setProtokoll({ p1: { szene: '4.1', ort: 'hoehle', spieler: 'Anna', figur: 'Mara Quint',
                        wert: 'Kämpfen', stufe: 3, band: 'erfolg', roh: 6, ziel: 4, ts: 10 } });
u.schreib.length = 0;
u.klick({ pid: 'anna', wert: 'Kämpfen' }); u.klick({ einzeln: '1' });
u.klick({ pid: 'bert', wert: 'Segeln' }); u.klick({ alle: '1' });
u.klick({ weg: 'anna' });
M3.uebergeben('anna', { art: 'gegenstand', id: 'saebel' });
M3.uebergeben('bert', { art: 'muenzen', wert: 100 });
M3.uebergeben('anna', { art: 'nehmen', id: 'saebel' });
M3.setzeAnsicht('protokoll');
u.klick({ komm: 'p1' });
u.klick({ sichern: 'p1' });
/* Drei erlaubte Ziele, und alle drei liegen NEBEN der Figur, nicht in ihr:
   die Bitte zu wuerfeln, die Notiz am Wurf, und seit 14.10.2026 das Postfach
   fuer uebergebene Ausruestung. Der Kern der Regel bleibt derselbe: Kein
   Schreibzugriff dieser Seite fasst einen WERT der Figur an. */
const erlaubt = /^(figuren\/[a-z0-9_-]+\/(anfrage|zuteilung)|sitzungen\/test\/protokoll\/[A-Za-z0-9_-]+\/notiz)$/;
chk('es wurde überhaupt geschrieben', u.schreib.length >= 4, u.schreib.length);
chk('JEDER Schreibzugriff ist Anfrage oder Notiz',
  u.schreib.every(s => erlaubt.test(s.p)), u.schreib.filter(s => !erlaubt.test(s.p)).map(s => s.p));
chk('kein Zugriff auf einen Wert der Figur',
  !u.schreib.some(s => /\/(attr|fert|tal|hnd|wunden|bennies|ausr|brief|name|rang)/.test(s.p)),
  u.schreib.map(s => s.p));
/* Auch im Quelltext darf keine zweite Wahrheit entstehen: Die Seite darf
   nirgends figuren/{x} als Ganzes setzen. */
chk('Quelltext setzt keinen Figurenknoten', SKRIPT.indexOf("'figuren/' + pid + '/anfrage'") >= 0 &&
  SKRIPT.indexOf("db.ref('figuren/' + pid).set") < 0);

console.log('');
console.log('=== ANFRAGE ZURÜCKNEHMEN ===');
u = bau(); const M4 = u.ctx.module.exports;
const mitAnfrage = JSON.parse(JSON.stringify(FIGUREN));
mitAnfrage.anna.anfrage = { wert: 'Kämpfen', mod: -4, von: 'Spielleitung', ts: 1 };
M4.setFiguren(mitAnfrage);
chk('die offene Bitte steht an der Karte', u.inhalt().indexOf('Wartet auf') >= 0);
chk('mit der nötigen Zahl', u.inhalt().indexOf('nötig 8') >= 0);
chk('und mit dem Modifikator', u.inhalt().indexOf('(-4)') >= 0);
chk('Figur ohne Bitte zeigt keine', (u.inhalt().match(/Wartet auf/g) || []).length === 1);
u.schreib.length = 0;
u.klick({ weg: 'anna' });
chk('Zurücknehmen löscht genau die Anfrage',
  u.schreib.length === 1 && u.schreib[0].op === 'remove' && u.schreib[0].p === 'figuren/anna/anfrage',
  u.schreib);

console.log('');
console.log('=== AUSRÜSTUNG ÜBERGEBEN ===');
/* Warum ein Postfach und kein direkter Schreibzugriff: heldenbrief.html liest
   die Figur genau EINMAL und schreibt danach seine eigene Fassung hoch, samt
   ausr und muenzen. Ein direkter Zugriff von hier wäre beim nächsten Klick
   des Spielers lautlos weg gewesen. */
u = bau(); const MU = u.ctx.module.exports;
MU.setFiguren(JSON.parse(JSON.stringify(FIGUREN)));
u.schreib.length = 0;
MU.uebergeben('anna', { art: 'gegenstand', id: 'saebel' });
chk('ein Schreibzugriff', u.schreib.length === 1, u.schreib);
chk('und zwar ins Postfach, nicht in die Figur',
  u.schreib[0] && u.schreib[0].p === 'figuren/anna/zuteilung', u.schreib[0]);
chk('er legt etwas ab, statt zu setzen', u.schreib[0] && u.schreib[0].op === 'push',
  u.schreib[0] && u.schreib[0].op);
chk('mit Gegenstand, Absender und Zeit',
  u.schreib[0].v.id === 'saebel' && u.schreib[0].v.art === 'gegenstand' &&
  u.schreib[0].v.von === 'Spielleitung' && !!u.schreib[0].v.ts, u.schreib[0].v);

u.schreib.length = 0;
MU.uebergeben('bert', { art: 'muenzen', wert: -50 });
chk('auch Münzen gehen übers Postfach',
  u.schreib[0].p === 'figuren/bert/zuteilung' && u.schreib[0].v.wert === -50, u.schreib[0]);

u.schreib.length = 0;
MU.uebergeben('anna', { art: 'nehmen', id: 'saebel' });
chk('einziehen ebenso', u.schreib[0].v.art === 'nehmen' && u.schreib[0].v.id === 'saebel');

const gb = MU.gebenBlock('anna', { muenzen: 120, zuteilung: { a: {}, b: {} } });
chk('die Auswahl listet alle Gegenstände',
  (gb.match(/<option /g) || []).length === RW.AUSRUESTUNG.length,
  (gb.match(/<option /g) || []).length);
chk('nach Art gruppiert', (gb.match(/<optgroup /g) || []).length === RW.AUSR_ARTEN.length);
chk('der Preis steht dabei', gb.indexOf('M.)') >= 0);
chk('der Münzstand wird genannt', gb.indexOf('hat 120 M.') >= 0);
chk('offene Übergaben werden gezählt', gb.indexOf('liegt bereit') >= 0 && gb.indexOf('2 Übergabe') >= 0, gb);
chk('und gesagt, dass es nichts kostet', gb.indexOf('kein Kauf') >= 0);
chk('ohne offene Übergabe kein Hinweis',
  MU.gebenBlock('anna', { muenzen: 0 }).indexOf('liegt bereit') < 0);

const mitAusr = JSON.parse(JSON.stringify(FIGUREN));
mitAusr.anna.ausr = ['saebel'];
MU.setFiguren(mitAusr);
chk('Getragenes lässt sich anklicken', u.inhalt().indexOf('data-nehmen="anna|saebel"') >= 0);

console.log('');
console.log('=== PROTOKOLL: SZENE UND ORT IM KLARTEXT ===');
u = bau(); const M5 = u.ctx.module.exports;
M5.setFiguren(JSON.parse(JSON.stringify(FIGUREN)));
M5.setProtokoll({
  a: { szene: '4.1', ort: 'schiffswrack', spieler: 'Anna', figur: 'Mara Quint', wert: 'Kämpfen',
       stufe: 3, band: 'steigerung', roh: 11, ziel: 4, steigerungen: 1, ts: 100 },
  b: { szene: '4.1', ort: 'schiffswrack', spieler: 'Bert', figur: 'Tom Ash', wert: 'Segeln',
       stufe: 2, band: 'miss', roh: 2, ziel: 4, ts: 200 },
  c: { szene: '4.1', ort: 'stammesdorf', spieler: 'Anna', figur: 'Mara Quint', wert: 'Überreden',
       stufe: 2, band: 'erfolg', roh: 5, ziel: 4, ts: 300 },
  d: { szene: '1.1', ort: 'taverne', spieler: 'Bert', figur: 'Tom Ash', wert: 'Aufmerksamkeit',
       stufe: 2, band: 'patzer', roh: 1, ziel: 4, ts: 50 }
});
M5.setzeAnsicht('protokoll');
chk('Zähler zählt Würfe, nicht Figuren', u.nachId['anzahl'].textContent === '4 Würfe', u.nachId['anzahl'].textContent);
chk('Szene im Klartext', u.inhalt().indexOf('Schatzinsel') >= 0, M5.szenenLabel('4.1'));
chk('Szenen-ID bleibt daneben stehen', u.inhalt().indexOf('(4.1)') >= 0);
chk('Ort im Klartext', u.inhalt().indexOf('Die gestrandete Golden Lion') >= 0, M5.ortTitel('schiffswrack'));
chk('zweiter Ort derselben Szene eigene Gruppe', u.inhalt().indexOf('Das Dorf am knorrigen Baum') >= 0);
chk('zwei Szenen, zwei Überschriften', (u.inhalt().match(/class="pszene"/g) || []).length === 2);
chk('drei Orte insgesamt', (u.inhalt().match(/class="port"/g) || []).length === 3);
chk('alle vier Zeilen da', (u.inhalt().match(/class="pz"/g) || []).length === 4);
// Zeitliche Ordnung: der früheste Wurf steht in der ersten Szene.
const zl = M5.protokollZeilen();
chk('nach Zeit sortiert', zl.map(z => z.ts).join(',') === '50,100,200,300', zl.map(z => z.ts));
chk('früheste Szene steht oben', u.inhalt().indexOf('Grimsgate') < u.inhalt().indexOf('Schatzinsel'));

console.log('');
console.log('=== PROTOKOLL: DAS ERGEBNIS IST LESBAR ===');
chk('Band im Klartext', u.inhalt().indexOf('Erfolg mit Steigerung') >= 0);
chk('Wurf gegen Ziel', u.inhalt().indexOf('11 gegen 4') >= 0);
chk('Patzer eigene Farbe', u.inhalt().indexOf('b-patzer') >= 0);
chk('Spieler und Figur genannt', u.inhalt().indexOf('Anna') >= 0 && u.inhalt().indexOf('Mara Quint') >= 0);
chk('Würfelstufe genannt', u.inhalt().indexOf('d8') >= 0);
chk('mehrere Steigerungen werden gezählt',
  M5.bandKurz({ band: 'steigerung', steigerungen: 2, roh: 14, ziel: 4 }).indexOf('×2') >= 0,
  M5.bandKurz({ band: 'steigerung', steigerungen: 2, roh: 14, ziel: 4 }));
chk('eine Steigerung wird NICHT gezählt',
  M5.bandKurz({ band: 'steigerung', steigerungen: 1, roh: 9, ziel: 4 }).indexOf('×') < 0);

console.log('');
console.log('=== NOTIZ AM WURF ===');
u.schreib.length = 0;
u.klick({ komm: 'a' });
chk('Feld offen', u.inhalt().indexOf('id="kommFeld"') >= 0);
chk('kein Schreibzugriff beim Öffnen', u.schreib.length === 0, u.schreib);
u.tippe('Der Balken gibt nach, Wat zieht sie heraus.', 'Enter');
chk('Enter sichert', u.schreib.length === 1, u.schreib);
chk('an der richtigen Stelle', u.schreib[0] && u.schreib[0].p === 'sitzungen/test/protokoll/a/notiz', u.schreib[0]);
chk('mit dem getippten Text', u.schreib[0] && u.schreib[0].v.indexOf('Wat zieht sie heraus') >= 0, u.schreib[0]);
chk('Feld danach zu', M5.zustand().kommentiert === null);

u.klick({ komm: 'b' });
u.schreib.length = 0;
u.tippe('egal', 'Escape');
chk('Escape schreibt NICHT', u.schreib.length === 0, u.schreib);
chk('und schließt das Feld', M5.zustand().kommentiert === null);

u.klick({ komm: 'b' });
u.schreib.length = 0;
u.klick({ kabbruch: '1' });
chk('abbrechen schreibt NICHT', u.schreib.length === 0, u.schreib);

// Eine schon notierte Zeile zeigt die Notiz an und markiert den Knopf.
u = bau(); const M6 = u.ctx.module.exports;
M6.setProtokoll({ a: { szene: '4.1', ort: 'schiffswrack', spieler: 'Anna', wert: 'Kämpfen', stufe: 3,
                       band: 'erfolg', roh: 6, ziel: 4, ts: 1, notiz: 'Sie kommt frei.' } });
M6.setzeAnsicht('protokoll');
chk('bestehende Notiz steht da', u.inhalt().indexOf('Sie kommt frei.') >= 0);
chk('Knopf ist als notiert markiert', u.inhalt().indexOf('class="k hat"') >= 0);
chk('und heißt nicht mehr "+ Notiz"', u.inhalt().indexOf('>notiert<') >= 0);

console.log('');
console.log('=== GRENZFÄLLE ===');
u = bau(); const M7 = u.ctx.module.exports;
M7.setProtokoll({});
M7.setzeAnsicht('protokoll');
chk('leeres Protokoll bricht nicht', u.inhalt().indexOf('Noch kein Wurf') >= 0);
M7.setProtokoll({ x: { spieler: 'Anna', wert: 'Kämpfen', stufe: 3, band: 'erfolg', roh: 5, ziel: 4, ts: 1 } });
chk('Wurf ohne Szene und Ort bricht nicht',
  u.inhalt().indexOf('Ohne Szene') >= 0 && u.inhalt().indexOf('Nicht an einem Ort') >= 0);
M7.setProtokoll({ y: { szene: '99.9', ort: 'gibtsnicht', spieler: 'Anna', wert: 'x', stufe: 2,
                       band: 'erfolg', roh: 5, ziel: 4, ts: 1 } });
chk('unbekannte Szene fällt auf die ID zurück', u.inhalt().indexOf('99.9') >= 0);
chk('unbekannter Ort ebenso', u.inhalt().indexOf('gibtsnicht') >= 0);
M7.setProtokoll({ z: { szene: '4.1', ort: 'hoehle', spieler: '<b>böse</b>', wert: 'Kämpfen', stufe: 3,
                       band: 'erfolg', roh: 5, ziel: 4, ts: 1, notiz: '<script>x</script>' } });
chk('Spielername wird maskiert', u.inhalt().indexOf('<b>böse</b>') < 0 && u.inhalt().indexOf('&lt;b&gt;') >= 0);
chk('Notiz wird maskiert', u.inhalt().indexOf('<script>x') < 0);

u = bau(); const M8 = u.ctx.module.exports;
M8.setFiguren({});
chk('keine Figur bricht nicht', u.inhalt().indexOf('Noch keine Figur') >= 0);
chk('Anfordern an niemanden schreibt nichts', (function () {
  u.schreib.length = 0; M8.anfordern([], 'Kämpfen'); return u.schreib.length === 0;
})());

console.log('');
console.log('=== AUSSER GEFECHT UEBERLEBT DAS LADEN ===');
/* Beim Bau der Gruppenanforderung gefunden, und es war kein Testfehler:
   alsFigur() klemmte wunden auf MAX_WUNDEN, waehrend ausserGefecht() auf
   > MAX_WUNDEN prueft. Der Zustand war damit nach jedem Laden weg - im
   Heldenbrief wie in dieser Uebersicht. Die Pruefung schlaegt auf dem
   alten Code nachweislich an. */
chk('vier Wunden bleiben vier', RW.alsFigur({ wunden: 4 }).wunden === 4,
  RW.alsFigur({ wunden: 4 }).wunden);
chk('und gelten als ausser Gefecht', RW.ausserGefecht(RW.alsFigur({ wunden: 4 })) === true);
chk('drei Wunden gelten es NICHT', RW.ausserGefecht(RW.alsFigur({ wunden: 3 })) === false);
chk('der Abzug bleibt bei drei gedeckelt', RW.wundenAbzug(RW.alsFigur({ wunden: 4 })) === 3,
  RW.wundenAbzug(RW.alsFigur({ wunden: 4 })));
chk('Unsinn wird weiter geklemmt', RW.alsFigur({ wunden: 99 }).wunden === 4 &&
  RW.alsFigur({ wunden: -5 }).wunden === 0);

console.log('');
console.log('=== DIE ANSICHTEN TRENNEN SAUBER ===');
u = bau(); const M9 = u.ctx.module.exports;
M9.setFiguren(JSON.parse(JSON.stringify(FIGUREN)));
M9.setProtokoll({ a: { szene: '4.1', ort: 'hoehle', spieler: 'Anna', wert: 'Kämpfen', stufe: 3,
                       band: 'erfolg', roh: 6, ziel: 4, ts: 1 } });
chk('Figurenansicht zeigt keine Würfe', u.inhalt().indexOf('class="pszene"') < 0);
M9.setzeAnsicht('protokoll');
chk('Protokollansicht zeigt keine Figurenkarten', u.inhalt().indexOf('class="fig"') < 0);
chk('Knopf umgeschaltet', u.nachId['btnProtokoll'].classList.contains('on') &&
  !u.nachId['btnFiguren'].classList.contains('on'));
// Ein offenes Menü darf den Wechsel nicht überleben - es gehört zu einer Karte.
M9.setzeAnsicht('figuren');
u.klick({ pid: 'anna', wert: 'Kämpfen' });
M9.setzeAnsicht('protokoll');
chk('Menü überlebt den Wechsel nicht', M9.zustand().menu === null);
M9.setzeAnsicht('figuren');
chk('zurück zu den Figuren', u.inhalt().indexOf('Mara Quint') >= 0);

console.log('');
console.log('=== DER EXPORT NIMMT DIE WUERFE MIT ===');
/* wuerfeSection() wird AUS DEM QUELLTEXT von js/regie_vault.js geschnitten
   und ausgefuehrt, nicht hier nachgebaut - eine zweite Fassung wuerde
   auseinanderlaufen, und genau dann stimmt der Export nicht mehr mit dem
   ueberein, was die Regie anzeigt. Dasselbe Vorgehen wie in t_termine.js. */
const VAULT = fs.readFileSync(path.join(BASIS, 'js/regie_vault.js'), 'utf8');
const anf = VAULT.indexOf('function wuerfeSection(');
const ende = VAULT.indexOf('function buildSessionExportMarkdown(');
if (anf < 0 || ende < anf) {
  console.log('ABBRUCH: wuerfeSection() nicht im Quelltext gefunden.');
  process.exit(1);
}
const SCHNITT = VAULT.slice(anf, ende);

const MARKER = {
  '4.1': [{ id: 'schiffswrack', title: 'Die gestrandete Golden Lion' },
          { id: 'stammesdorf',  title: 'Das Dorf am knorrigen Baum' }],
  '1.1': [{ id: 'taverne', title: 'Die Taverne' }]
};
const vctx = {
  Object, Array, String, Number, Math, Date, console,
  DLBL: RW.DLBL, BAND_NAMEN: RW.BAND_NAMEN,
  getSceneLabel: function (id) { return ({ '4.1': 'Schatzinsel (Strandung)', '1.1': 'Grimsgate' })[id] || id; },
  getMarkersForScene: function (id) { return MARKER[id] || []; }
};
vm.createContext(vctx);
vm.runInContext(SCHNITT, vctx);

const PROT = {
  a: { szene: '4.1', ort: 'schiffswrack', spieler: 'Anna', figur: 'Mara Quint', wert: 'Kämpfen',
       stufe: 3, band: 'steigerung', roh: 11, ziel: 4, steigerungen: 2, ts: 300,
       notiz: 'Der Balken gibt nach, Wat zieht sie heraus.' },
  b: { szene: '4.1', ort: 'stammesdorf', spieler: 'Bert', figur: 'Tom Ash', wert: 'Überreden',
       stufe: 2, band: 'miss', roh: 2, ziel: 4, ts: 400 },
  c: { szene: '1.1', ort: 'taverne', spieler: 'Anna', figur: 'Mara Quint', wert: 'Aufmerksamkeit',
       stufe: 2, band: 'erfolg', roh: 5, ziel: 4, ts: 100 },
  d: { szene: '4.1', ort: '', spieler: 'Cord', figur: 'Nell', wert: 'Stärke',
       stufe: 2, band: 'patzer', roh: 1, ziel: 4, ts: 500 }
};

let ex = vctx.wuerfeSection(['4.1', '1.1'], PROT);
chk('Szenen im Klartext', ex.indexOf('### Schatzinsel (Strandung)') >= 0 && ex.indexOf('### Grimsgate') >= 0);
chk('Orte im Klartext', ex.indexOf('**Die gestrandete Golden Lion**') >= 0);
chk('Spieler und Figur', ex.indexOf('Anna (Mara Quint)') >= 0);
chk('Wert mit Würfelstufe', ex.indexOf('Kämpfen d8') >= 0);
chk('Band im Klartext', ex.indexOf('Erfolg mit Steigerung ×2') >= 0);
chk('Wurf gegen Ziel', ex.indexOf('(11 gegen 4)') >= 0);
chk('Kommentar als kursive Zeile', ex.indexOf('  _Der Balken gibt nach, Wat zieht sie heraus._') >= 0, ex);
chk('Wurf ohne Kommentar hat keine', (ex.match(/  _/g) || []).length === 1, ex.match(/  _/g));
chk('Wurf ohne Ort bekommt eine eigene Gruppe', ex.indexOf('**Nicht an einem Ort**') >= 0);
/* Die Ortsreihenfolge folgt der Karte, nicht der Uhrzeit: Der Export soll
   sich lesen wie die Szene. Das Wrack steht auf der Karte vor dem Dorf,
   also auch hier - obwohl im Dorf spaeter gewuerfelt wurde. */
chk('Orte in Kartenreihenfolge',
  ex.indexOf('Die gestrandete Golden Lion') < ex.indexOf('Das Dorf am knorrigen Baum'));
chk('Szenen in der Reihenfolge des Bereichs',
  ex.indexOf('Schatzinsel') < ex.indexOf('Grimsgate'));

// Nur eine Szene gewaehlt: die uebrigen Wuerfe werden GEZAEHLT, nicht verschwiegen.
ex = vctx.wuerfeSection(['4.1'], PROT);
chk('fremde Szene fehlt', ex.indexOf('Grimsgate') < 0);
chk('aber sie wird erwähnt', ex.indexOf('1 weiterer Wurf') >= 0, ex);
ex = vctx.wuerfeSection(['1.1'], PROT);
chk('Mehrzahl stimmt', ex.indexOf('3 weitere Würfe') >= 0, ex);

chk('leeres Protokoll ergibt nichts', vctx.wuerfeSection(['4.1'], {}) === '');
chk('fehlendes Protokoll bricht nicht', vctx.wuerfeSection(['4.1'], null) === '');
chk('eine Zeile ohne Wert wird übersprungen',
  vctx.wuerfeSection(['4.1'], { x: { szene: '4.1', ort: 'schiffswrack', ts: 1 } }) === '');
chk('unbekannter Ort geht nicht verloren',
  vctx.wuerfeSection(['4.1'], { x: { szene: '4.1', ort: 'gibtsnicht', spieler: 'Anna',
    wert: 'Kämpfen', stufe: 3, band: 'erfolg', roh: 5, ziel: 4, ts: 1 } }).indexOf('Anna') >= 0);

// Der Abschnitt haengt wirklich im Export, nicht nur daneben.
chk('Export ruft wuerfeSection auf', VAULT.indexOf('wuerfeSection(sceneIds') >= 0);
chk('Export hat eine Würfe-Überschrift', VAULT.indexOf("'## Würfe") >= 0);
chk('und einen Satz, wenn nichts da ist', VAULT.indexOf('Keine Würfe im gewählten Bereich') >= 0);

console.log('');
console.log(f === 0 ? 'OK: ' + anzahl + '   FEHLER: 0' : 'OK: ' + (anzahl - f) + '   FEHLER: ' + f);
process.exit(f ? 1 : 0);

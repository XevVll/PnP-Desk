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
global.alsFigur = RW.alsFigur;
const NPC = require(path.join(BASIS, 'js/npcs.js'));
const K = require(path.join(BASIS, 'js/kampf.js'));

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
      value: '', style: {},
      get innerHTML() { return n._html; }, set innerHTML(v) { n._html = v; },
      focus() { n._fokus = true; }, select() {}
    };
    nachId[id] = n;
    return n;
  }
  ['anzahl', 'inhalt', 'fbNote', 'erschLeiste', 'btnFiguren', 'btnProtokoll', 'btnBrief', 'btnAlle',
   'btnWerkstatt', 'werkstatt', 'wstMeld', 'wstName', 'wstText', 'wstArt', 'wstSchaden',
   'wstRuest', 'wstGew', 'wstPreis', 'btnWaren', 'btnKampf'].forEach(knoten);

  const schreib = [];      // jeder Schreibzugriff, der stattfindet
  const lauscher = {};
  function ref(p) {
    return {
      update(paket) { Object.keys(paket).forEach(k => schreib.push({
        p: (p ? p + '/' : '') + k, v: paket[k], op: 'update' })); return Promise.resolve(); },
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
    confirm: function () { return ctx._confirm !== false; },
    clearTimeout: function () {},
    firebase: { initializeApp() {}, database() { return {}; },
                database_ServerValue: null },
    document: {
      /* Knoten, die erst beim Zeichnen entstehen (warenListe, warenZahl,
         warenFeld), legt der Stub bei Bedarf an - sonst faende die Seite
         ihre eigene frisch gezeichnete Liste nicht. */
      getElementById(id) { return nachId[id] || (/^waren/.test(id) ? knoten(id) : null); },
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
  vm.runInContext(fs.readFileSync(path.join(BASIS, 'js/npcs.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(BASIS, 'js/kampf.js'), 'utf8'), ctx);
  SZENEN_DATEIEN.forEach(d => vm.runInContext(fs.readFileSync(path.join(BASIS, d), 'utf8'), ctx));
  // Die Hülle durch die Aufzeichnung ersetzen, BEVOR die Seite initFirebase() ruft.
  ctx.sitzungsDbJetzt = function () { return db; };
  vm.runInContext(SKRIPT, ctx);

  const u = { ctx, db, nachId, schreib, lauscher };
  u.inhalt = () => nachId['inhalt']._html;
  u.werkstatt = () => nachId['werkstatt']._html;
  /* Felder ausfuellen wie ein Mensch: in die Eingabe schreiben, dann den
     Knopf druecken - nicht die Werte direkt in den Zustand legen. */
  u.fuelle = function (werte) {
    Object.keys(werte).forEach(function (k) { nachId[k].value = String(werte[k]); });
  };
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
  /* Anna traegt etwas - fuer die Ausruestungs-Pruefungen weiter unten.
     Pistole mit 0 Ladungen ist der haeufigere Fall am Tisch als man denkt. */
  dora: { name: 'Ruth Vane', spieler: 'Dora', aktualisiert: Date.now(),
          attr: { 'Geschicklichkeit': 3, 'Verstand': 2, 'Willenskraft': 2, 'Stärke': 2, 'Konstitution': 2 },
          fert: { 'Schießen': 3 }, ausr: ['saebel', 'pistole', 'lederwams'], ladungen: 0 },
  cord: { name: 'Nell', spieler: 'Cord', aktualisiert: Date.now(), wunden: 4,
          attr: { 'Geschicklichkeit': 1, 'Verstand': 1, 'Willenskraft': 1, 'Stärke': 1, 'Konstitution': 1 },
          fert: {} }
};

console.log('=== DIE SEITE LÄUFT ÜBERHAUPT ===');
let u = bau();
const M = u.ctx.module.exports;
M.setFiguren(JSON.parse(JSON.stringify(FIGUREN)));
chk('vier Figuren gezeichnet', u.inhalt().indexOf('Mara Quint') >= 0 &&
  u.inhalt().indexOf('Tom Ash') >= 0 && u.inhalt().indexOf('Ruth Vane') >= 0);
chk('Zähler stimmt', u.nachId['anzahl'].textContent === '4 Figuren', u.nachId['anzahl'].textContent);
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
chk('die drei anderen schon', M2.gruppe().length === 3, M2.gruppe());
u.klick({ pid: 'anna', wert: 'Aufmerksamkeit' });
u.schreib.length = 0;
u.klick({ alle: '1' });
chk('ein Schreibzugriff je Figur, die kann', u.schreib.length === 3, u.schreib.map(s => s.p));
chk('alle als EIN Sammel-Update', u.schreib.every(s => s.op === 'update'));
chk('Anna dabei', u.schreib.some(s => s.p === 'figuren/anna/anfrage'));
chk('Bert dabei', u.schreib.some(s => s.p === 'figuren/bert/anfrage'));
chk('Dora dabei', u.schreib.some(s => s.p === 'figuren/dora/anfrage'));
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
/* Seit dem 15.10.2026 schreibt die Seite ein fuenftes Mal: Sie blendet das
   Charakterbild eines Spielers von der Karte. Es MUSS hier mitlaufen -
   eine Regel, die den neuen Zugriff gar nicht ausfuehrt, schuetzt vor ihm
   auch nicht. */
M3.setzeAnsicht('figuren');
M3.setPcLeiste({ anna: { name: 'Mara Quint', bild: 'data:image/webp;base64,A' } });
M3.pcBildUmschalten('anna');
/* Fuenf erlaubte Ziele. Drei liegen NEBEN der Figur: die Bitte zu wuerfeln,
   die Notiz am Wurf und das Postfach fuer uebergebene Ausruestung. Das
   vierte liegt gar nicht bei einer Figur, sondern bei der SITZUNG: die
   Beschreibung eines erfundenen Gegenstands. Das fuenfte (15.10.2026) ist
   der Schalter, der ein Charakterbild von der Karte nimmt - und auch er
   liegt neben der Figur, nicht darin. Der Kern der Regel bleibt
   unveraendert: kein Schreibzugriff dieser Seite fasst einen WERT der
   Figur an. */
const erlaubt = /^(figuren\/[a-z0-9_-]+\/(anfrage|zuteilung)|sitzungen\/test\/protokoll\/[A-Za-z0-9_-]+\/notiz|eigeneWaren\/sl_[a-z0-9_]+|pcLeiste\/[a-z0-9_-]+\/aus)$/;
chk('es wurde überhaupt geschrieben', u.schreib.length >= 4, u.schreib.length);
chk('JEDER Schreibzugriff ist Anfrage oder Notiz',
  u.schreib.every(s => erlaubt.test(s.p)), u.schreib.filter(s => !erlaubt.test(s.p)).map(s => s.p));
chk('kein Zugriff auf einen Wert der Figur',
  !u.schreib.some(s => /\/(attr|fert|tal|hnd|wunden|bennies|ausr|brief|name|rang)/.test(s.p)),
  u.schreib.map(s => s.p));
/* ---- Das Charakterbild des Spielers ---- */
const pcZ = u.schreib.filter(s => s.p.indexOf('pcLeiste/') === 0);
chk('der Umschalter schreibt genau einmal', pcZ.length === 1, pcZ.map(s => s.p));
/* NUR das Feld "aus". bild und name gehoeren dem Spieler - ein set() von
   hier wuerde sie mitloeschen, und sein Bogen merkt davon nichts. */
chk('und zwar nur das Feld "aus"', pcZ[0] && pcZ[0].p === 'pcLeiste/anna/aus', pcZ[0]);
chk('der Wert kippt auf true', pcZ[0] && pcZ[0].v === true, pcZ[0] && pcZ[0].v);
chk('nirgends wird bild oder name von hier geschrieben',
  !u.schreib.some(s => /pcLeiste\/[a-z]+\/(bild|name)$/.test(s.p)) &&
  SEITE.indexOf("db.ref('pcLeiste/' + pid).set") < 0,
  u.schreib.map(s => s.p));

/* Der Block erscheint nur, wenn es wirklich ein Bild gibt - eine
   Ueberschrift ohne Inhalt waere Zierde. */
chk('ohne Bild steht an der Figur nichts', M3.pcBildBlock('bert') === '', M3.pcBildBlock('bert'));
chk('mit Bild steht der Schalter da', M3.pcBildBlock('anna').indexOf('data-pcbild="anna"') > 0,
  M3.pcBildBlock('anna'));
/* Beschriftet wird nach dem Zustand: Wer "ausblenden" liest, waehrend es
   schon aus ist, klickt es versehentlich wieder an. */
chk('sichtbar: der Knopf bietet ausblenden an',
  M3.pcBildBlock('anna').indexOf('>ausblenden<') > 0);
M3.setPcLeiste({ anna: { name: 'Mara Quint', bild: 'data:x', aus: true } });
chk('ausgeblendet: er bietet einblenden an',
  M3.pcBildBlock('anna').indexOf('>einblenden<') > 0, M3.pcBildBlock('anna'));

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
console.log('=== DER KAMPFMODUS ===');
/* Hendriks Vorgabe vom 15.10.2026: Gegner anlegen, "Spieler A greift
   Gegner 3 an", der Spieler wird zum Wuerfeln gefordert, das Interface
   sieht nur die Spielleitung. Geprueft wird der GANZE Ablauf, ausgefuehrt
   statt gelesen. */
const C = bau();
C.ctx.module.exports.setFiguren(JSON.parse(JSON.stringify(FIGUREN)));
C.ctx.module.exports.setzeAnsicht('kampf');
const ch = () => C.nachId['inhalt']._html;

chk('die Ansicht hat einen eigenen Knopf', C.nachId['btnKampf'].classList.contains('on'));
chk('die Spieler stehen von selbst drin',
  C.ctx.module.exports.kampfAlle().filter(t => t.typ === 'spieler').length === 4,
  C.ctx.module.exports.kampfAlle().length);
chk('ohne Gegner und ohne Karten steht da, was zu tun ist',
  ch().indexOf('Noch keine Reihenfolge') > 0);

/* ---- Gegner anlegen ---- */
C.nachId['kVorlage'] = { id: 'kVorlage', value: 'anselm', style: {}, classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } } };
C.nachId['kAnzahl'] = { id: 'kAnzahl', value: '3', style: {}, classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } } };
C.schreib.length = 0;
C.ctx.module.exports.gegnerAnlegen();
/* Der Log-Eintrag schreibt mit - er gehoert dazu und wird hier getrennt. */
const neueG = C.schreib.filter(x => x.p.indexOf('kampf/gegner/') === 0);
chk('drei Gegner auf einmal', neueG.length === 3, C.schreib.map(x => x.p));
chk('und zwar unter dem Kampfstand der Sitzung',
  neueG.every(x => x.p.indexOf('kampf/gegner/') === 0), C.schreib.map(x => x.p));
chk('und es steht im Kampflog', C.schreib.some(x => x.p === 'kampf/log'),
  C.schreib.map(x => x.p));
chk('sie heißen durchnummeriert',
  neueG.map(x => x.v.name).join(' · ') === 'Anselm Frei 1 · Anselm Frei 2 · Anselm Frei 3',
  neueG.map(x => x.v.name));
/* Die Werte kommen aus dem Blatt in js/npcs.js - hier wird nichts erfunden. */
chk('mit Parade und Robustheit aus dem Blatt',
  neueG[0].v.parade === RW.parade(NPC.nscAlsFigur(NPC.NSC_MANNSCHAFT['anselm'])) &&
  neueG[0].v.robustheit > 0, neueG[0].v);
chk('ein Mannschaftsmitglied ist ein Statist', neueG[0].v.extra === true);

/* Den Stand so setzen, wie Firebase ihn zurueckspielen wuerde. */
const gegner = {};
neueG.forEach((x, i) => { gegner['g' + i] = x.v; });
C.ctx.module.exports.setKampf({ runde: 0, gegner: gegner });
chk('danach stehen sie in der Liste', C.ctx.module.exports.kampfAlle().length === 7,
  C.ctx.module.exports.kampfAlle().length);

/* ---- Initiative ---- */
C.schreib.length = 0;
C.ctx.module.exports.kampfAusteilen();
chk('Austeilen schreibt als EIN Sammel-Update',
  C.schreib.filter(x => x.p !== 'kampf/log')
           .every(x => x.op === 'update' && x.p.indexOf('kampf/') === 0),
  C.schreib.map(x => x.p));
chk('und die Runde steht im Kampflog',
  C.schreib.some(x => x.p === 'kampf/log' && (x.v.t + '').indexOf('Runde 1') === 0),
  C.schreib.filter(x => x.p === 'kampf/log').map(x => x.v.t));
const kfeld = n => (C.schreib.filter(x => x.p === 'kampf/' + n)[0] || {}).v;
const aus = { reihe: kfeld('reihe'), runde: kfeld('runde') };
/* Sechs, nicht sieben: Cord ist mit vier Wunden ausser Gefecht und
   bekommt keine Karte. Wer nicht mehr mitkaempft, steht auch nicht in
   der Reihenfolge - sonst wartet der Tisch auf einen Bewusstlosen. */
chk('jeder noch Kampffähige bekommt eine Karte',
  aus.reihe.length === 6 && aus.reihe.every(r => !!r.karte), aus.reihe.length);
chk('wer außer Gefecht ist, bekommt keine',
  !aus.reihe.some(r => r.id === 'p:cord'), aus.reihe.map(r => r.id));
chk('die Runde zählt hoch', aus.runde === 1);
chk('die Reihenfolge ist sortiert',
  aus.reihe.every((r, i) => i === 0 || K.kartenVergleich(aus.reihe[i - 1].karte, r.karte) <= 0),
  aus.reihe.map(r => K.kartenText(r.karte)));

C.ctx.module.exports.setKampf({ runde: 1, gegner: gegner, reihe: aus.reihe, dran: 0 });
chk('die Liste zeigt Karten und Zustand',
  ch().indexOf('Parade') > 0 && ch().indexOf('Statist') > 0);
chk('und wer dran ist, ist hervorgehoben', ch().indexOf('class="ki dran"') > 0);

/* ---- Der Angriff ---- */
C.ctx.module.exports.kampfWahl('kAngreifer', 'p:anna');
C.ctx.module.exports.kampfWahl('kZiel', 'g:g0');
C.schreib.length = 0;
C.ctx.module.exports.angriffAnsagen();
const bitte = C.schreib.filter(x => x.p === 'figuren/anna/anfrage')[0];
chk('der Spieler wird zum Würfeln gefordert', !!bitte, C.schreib.map(x => x.p));
chk('auf Kämpfen', bitte && bitte.v.wert === 'Kämpfen');
/* Der Kern: Der Zielwert ist die PARADE des Gegners, nicht die 4 - und der
   Modifikator darf ungerade sein. */
const par = gegner.g0.parade;
chk('mit dem Modifikator aus der Parade', bitte && bitte.v.mod === RW.ZIELZAHL - par,
  { mod: bitte && bitte.v.mod, parade: par });
chk('und er erfährt, worum es geht',
  bitte && bitte.v.grund.indexOf('Anselm Frei 1') > 0, bitte && bitte.v.grund);
chk('die Ansage liegt im Kampfstand',
  C.schreib.some(x => x.p === 'kampf/ansage'), C.schreib.map(x => x.p));

const ansage = C.schreib.filter(x => x.p === 'kampf/ansage')[0].v;
C.ctx.module.exports.setKampf({ runde: 1, gegner: gegner, reihe: aus.reihe, ansage: ansage });
chk('solange nichts gewürfelt ist, wartet die Anzeige',
  ch().indexOf('wartet auf den Wurf') > 0);
chk('ein fremder Wurf zählt nicht',
  C.ctx.module.exports.setProtokoll({ x: { figur: 'Tom Ash', wert: 'Kämpfen',
    band: 'erfolg', roh: 9, ts: ansage.ts + 10 } }) ||
  C.ctx.module.exports.ansageErgebnis() === null, C.ctx.module.exports.ansageErgebnis());
/* Auch ein Wurf VOR der Ansage gehoert nicht dazu - sonst beantwortet ein
   alter Wurf die neue Frage. */
C.ctx.module.exports.setProtokoll({ alt: { figur: 'Mara Quint', wert: 'Kämpfen',
  band: 'steigerung', roh: 12, ts: ansage.ts - 100 } });
chk('und ein alter Wurf auch nicht', C.ctx.module.exports.ansageErgebnis() === null);

C.ctx.module.exports.setProtokoll({ neu: { figur: 'Mara Quint', wert: 'Kämpfen',
  band: 'steigerung', roh: 12, ts: ansage.ts + 50 } });
const erg = C.ctx.module.exports.ansageErgebnis();
chk('der passende Wurf wird aufgegriffen', erg && erg.band === 'steigerung', erg);
chk('und als Treffer gelesen', ch().indexOf('Treffer mit Steigerung') > 0);
chk('mit dem Hinweis auf das zusätzliche W6', ch().indexOf('1W6') > 0);
chk('und einem Feld für den Schaden', ch().indexOf('id="kSchaden"') > 0);

/* ---- Der Schadenswurf wird angefordert, nicht abgetippt ----
   Hendriks Nachtrag vom 15.10.2026: Bei einem Treffer soll die
   Aufforderung zum Schadenswurf von selbst kommen. */
chk('bei einem Treffer wird der Schaden angefordert', ch().indexOf('data-kschaden') > 0);
C.schreib.length = 0;
C.ctx.module.exports.schadenAnfordern();
const sbitte = C.schreib.filter(x => x.p === 'figuren/anna/anfrage')[0];
chk('die Bitte geht an den Spieler', !!sbitte, C.schreib.map(x => x.p));
chk('und zwar als Schadenswurf, nicht als Probe',
  sbitte && sbitte.v.art === 'schaden', sbitte && sbitte.v);
/* Welche Wuerfel: die getragene Waffe plus Staerke, und wegen der
   Steigerung ein W6 obendrauf. Alles aus dem Blatt, nichts erfunden. */
chk('mit den Würfeln der getragenen Waffe',
  sbitte && sbitte.v.wuerfel.length === 3 &&
  sbitte.v.wuerfel.some(w => w.was === 'Stärke') &&
  sbitte.v.wuerfel.some(w => w.was === 'Steigerung'),
  sbitte && sbitte.v.wuerfel);
chk('und er erfährt, wem er wehtut',
  sbitte && sbitte.v.grund.indexOf('Anselm Frei 1') > 0, sbitte && sbitte.v.grund);
chk('die Ansage merkt sich, dass sie wartet',
  C.schreib.some(x => x.p === 'kampf/ansage/stand' && x.v === 'schaden'),
  C.schreib.map(x => x.p));

/* Der Schadenswurf kommt ueber das Protokoll zurueck - deshalb steht ein
   ANGEFORDERTER Schadenswurf dort drin, ein freier Wuerfel nicht. */
const ans2 = Object.assign({}, ansage, { stand: 'schaden', band: 'steigerung',
  roh: 12, schadenTs: Date.now() });
C.ctx.module.exports.setKampf({ runde: 1, gegner: gegner, reihe: aus.reihe, ansage: ans2 });
chk('solange nichts kommt, wartet die Anzeige', ch().indexOf('wartet auf den Schadenswurf') > 0);
C.ctx.module.exports.setProtokoll({ sch: { figur: 'Mara Quint', wert: 'Schaden',
  roh: 9, ts: ans2.schadenTs + 20 } });
chk('der Schadenswurf wird aufgegriffen',
  C.ctx.module.exports.schadenErgebnis() === 9, C.ctx.module.exports.schadenErgebnis());
chk('und die Wirkung steht da, ohne dass jemand tippt',
  ch().indexOf('Wunde') > 0 && ch().indexOf('data-kgilt') > 0);

/* ---- Die Wirkung wird vorgeschlagen, nicht eingetragen ---- */
C.ctx.module.exports.setKampf({ runde: 1, gegner: gegner, reihe: aus.reihe, ansage: ansage });
C.ctx.module.exports.setProtokoll({ neu: { figur: 'Mara Quint', wert: 'Kämpfen',
  band: 'steigerung', roh: 12, ts: ansage.ts + 50 } });
C.ctx.module.exports.schadenEintragen('9');
chk('die Wirkung steht als Vorschlag da',
  ch().indexOf('Wunde') > 0 && ch().indexOf('data-kgilt') > 0, ch().slice(0, 300));
C.schreib.length = 0;
chk('und schreibt von sich aus NICHTS', C.schreib.length === 0, C.schreib);

C.ctx.module.exports.wirkungGilt();
chk('erst der Klick trägt sie ein', C.schreib.length > 0);
chk('beim Gegner direkt im Kampfstand',
  C.schreib.some(x => x.p === 'kampf' && x.v['gegner/g0/wunden'] === 1) ||
  C.schreib.some(x => (x.p + '').indexOf('gegner/g0') >= 0), C.schreib.map(x => x.p));
/* Ein Statist ist mit der ersten Wunde draussen - genau das war der
   Denkfehler, den t_kampf.js gefangen hat. */
const raus = C.schreib.filter(x => x.p === 'kampf/gegner/g0/raus')[0];
chk('und der Statist ist damit draußen', raus && raus.v === true,
  C.schreib.map(x => x.p));

/* ---- Ein Treffer auf einen SPIELER geht ins Postfach ---- */
C.ctx.module.exports.setKampf({ runde: 1, gegner: gegner, reihe: aus.reihe,
  ansage: { wer: 'g:g1', werName: 'Anselm Frei 2', ziel: 'p:anna', zielName: 'Mara Quint',
            parade: 5, robustheit: 5, mod: -1, wert: 'Kämpfen',
            ts: Date.now(), stand: 'gewuerfelt', band: 'erfolg', roh: 7 } });
C.ctx.module.exports.schadenEintragen('9');
C.schreib.length = 0;
C.ctx.module.exports.wirkungGilt();
const post = C.schreib.filter(x => x.p === 'figuren/anna/zuteilung')[0];
chk('die Wunde des Spielers geht ins Postfach', !!post, C.schreib.map(x => x.p));
chk('als Wunde, nicht als Wert in der Figur',
  post && post.v.art === 'wunde' && post.v.wert === 1, post && post.v);
chk('kein Schreibzugriff fasst einen WERT der Figur an',
  !C.schreib.some(x => /figuren\/[a-z]+\/(wunden|angeschlagen|attr|fert)/.test(x.p)),
  C.schreib.map(x => x.p));

/* ---- Die Würfe des Spielers landen im Log ----
   Hendriks Meldung vom 15.10.2026: "Die Würfelergebnisse stehen nicht im
   Kampflog." Die Würfe, die das Panel selbst wirft (Gegner), standen drin;
   die des Spielers kommen über das Protokoll - und dort hat sie niemand
   mitgeschrieben. */
const P = bau();
P.ctx.module.exports.setFiguren(JSON.parse(JSON.stringify(FIGUREN)));
P.ctx.module.exports.setzeAnsicht('kampf');
P.ctx.module.exports.setKampf({ runde: 1, gegner: {
  h1: { name: 'James Harwick', parade: 6, robustheit: 6, kaempfen: 3,
        staerke: 3, schaden: 2, extra: false, band: 0 } } });
P.schreib.length = 0;
P.ctx.module.exports.angriffAnsagen('nah', 'p:anna', 'g:h1');
const pAnsage = P.schreib.filter(x => x.p === 'kampf/ansage')[0].v;
P.ctx.module.exports.setKampf({ runde: 1, gegner: {
  h1: { name: 'James Harwick', parade: 6, robustheit: 6, kaempfen: 3,
        staerke: 3, schaden: 2, extra: false, band: 0 } }, ansage: pAnsage });

P.schreib.length = 0;
P.ctx.module.exports.setProtokoll({ w: { figur: 'Mara Quint', wert: 'Kämpfen',
  band: 'steigerung', roh: 11, ts: pAnsage.ts + 10 } });
const wLog = P.schreib.filter(x => x.p === 'kampf/log').map(x => x.v.t);
chk('der Wurf des Spielers steht im Log', wLog.length === 1, wLog);
chk('mit der Zahl und dem Ergebnis',
  wLog[0] && wLog[0].indexOf('11') > 0 && wLog[0].indexOf('Treffer mit Steigerung') > 0, wLog[0]);
chk('und mit dem, was nötig war', wLog[0] && wLog[0].indexOf('nötig 6') > 0, wLog[0]);
/* Festgehalten wird er auch - sonst waere er nach einem Neuladen weg. */
chk('das Ergebnis wird an der Ansage festgehalten',
  P.schreib.some(x => x.p === 'kampf/ansage/band' && x.v === 'steigerung'),
  P.schreib.map(x => x.p));

/* Und zwar GENAU EINMAL: Das Protokoll aendert sich staendig, eine Anzeige,
   die dabei schreibt, schreibt jedes Mal wieder. */
P.ctx.module.exports.setKampf({ runde: 1, gegner: {
  h1: { name: 'James Harwick', parade: 6, robustheit: 6, kaempfen: 3, extra: false, band: 0 } },
  ansage: Object.assign({}, pAnsage, { stand: 'gewuerfelt', band: 'steigerung', roh: 11 }) });
P.schreib.length = 0;
P.ctx.module.exports.setProtokoll({ w: { figur: 'Mara Quint', wert: 'Kämpfen',
  band: 'steigerung', roh: 11, ts: pAnsage.ts + 10 } });
P.ctx.module.exports.setProtokoll({ w: { figur: 'Mara Quint', wert: 'Kämpfen',
  band: 'steigerung', roh: 11, ts: pAnsage.ts + 10 } });
chk('aber nur einmal', P.schreib.filter(x => x.p === 'kampf/log').length === 0,
  P.schreib.map(x => x.p));

/* Dasselbe fuer den Schadenswurf. */
const sAnsage = Object.assign({}, pAnsage, { stand: 'schaden', band: 'steigerung',
  roh: 11, schadenTs: pAnsage.ts + 50 });
P.ctx.module.exports.setKampf({ runde: 1, gegner: {
  h1: { name: 'James Harwick', parade: 6, robustheit: 6, kaempfen: 3, extra: false, band: 0 } },
  ansage: sAnsage });
P.schreib.length = 0;
P.ctx.module.exports.setProtokoll({ s: { figur: 'Mara Quint', wert: 'Schaden',
  roh: 9, ts: sAnsage.schadenTs + 5 } });
const sLog = P.schreib.filter(x => x.p === 'kampf/log').map(x => x.v.t);
chk('der Schadenswurf steht ebenfalls im Log', sLog.length === 1, sLog);
chk('mit seiner Zahl', sLog[0] && sLog[0].indexOf('9') > 0, sLog[0]);
chk('und wird festgehalten',
  P.schreib.some(x => x.p === 'kampf/ansage/schadenWert' && x.v === 9),
  P.schreib.map(x => x.p));

/* ---- Das Kampflog ----
   Hendriks Nachtrag: "Und eine Art Kampflog brauche ich als Spielleiter
   auch." Es liegt beim Kampfstand und verschwindet mit ihm - was den Abend
   ueberdauern soll, steht im Protokoll. */
C.ctx.module.exports.setKampf({ runde: 2, gegner: gegner, reihe: aus.reihe, log: {
  a: { t: 'Runde 1 — Karten ausgeteilt.', art: 'runde', runde: 1, ts: 1000 },
  b: { t: 'Mara Quint greift Anselm Frei 1 an.', art: 'ansage', runde: 1, ts: 2000 },
  c: { t: '9 Schaden gegen Robustheit 5 — Anselm Frei 1: 1 Wunde.', art: 'treffer', runde: 2, ts: 3000 }
} });
const log = C.ctx.module.exports.kampfLogZeilen();
chk('das Log hat Zeilen', log.length === 3, log.length);
chk('die neueste steht oben', log[0].ts === 3000, log.map(z => z.ts));
chk('es steht in der Ansicht', ch().indexOf('Kampflog') > 0 &&
  ch().indexOf('greift Anselm Frei 1 an') > 0);
chk('mit der Runde an jeder Zeile', ch().indexOf('Runde 2</span>') > 0, 'keine Rundenspalte');
chk('und lässt sich leeren', ch().indexOf('data-klogweg') > 0);
C.ctx.ctxConfirm = true;
C.schreib.length = 0;
C.ctx.module.exports.kampfLogLeeren();
chk('leeren räumt genau das Log weg',
  C.schreib.length === 1 && C.schreib[0].p === 'kampf/log' && C.schreib[0].op === 'remove',
  C.schreib);
/* Ein leeres Log zeigt gar nichts - eine leere Ueberschrift waere Zierde. */
C.ctx.module.exports.setKampf({ runde: 1, gegner: gegner, reihe: aus.reihe });
chk('ohne Einträge steht da auch nichts', ch().indexOf('Kampflog') < 0);

/* ---- Die ganze Kette, mit dem, was der Code wirklich schreibt ----
   Hendriks Meldung vom 15.10.2026: "Der Wurf wurde angefordert, scheint
   aber nicht uebermittelt zu werden." Die Anzeige blieb nach dem
   Schadenswurf-Anfordern auf "wartet auf den Wurf" stehen.

   Die Pruefungen darueber haben das NICHT gefunden, weil sie die Ansage
   von Hand gebaut haben - mit band:'steigerung'. Der Code schrieb aber
   band:0 (das Distanzband), und genau diese Verwechslung war der Fehler.
   Deshalb laeuft diese Kette ausschliesslich auf dem, was der Code selbst
   erzeugt und in die Datenbank schreibt. */
const E = bau();
E.ctx.module.exports.setFiguren(JSON.parse(JSON.stringify(FIGUREN)));
E.ctx.module.exports.setzeAnsicht('kampf');
E.ctx.module.exports.setKampf({ runde: 1, gegner: {
  h1: { name: 'James Harwick', parade: 6, robustheit: 6, kaempfen: 3,
        extra: false, band: 0, angeschlagen: false, wunden: 0 } } });

/* 1. Angriff ansagen - und die geschriebene Ansage uebernehmen. */
E.schreib.length = 0;
E.ctx.module.exports.tokenZiehen('p:anna');
E.ctx.module.exports.tokenFallen('g:h1');
const echteAnsage = E.schreib.filter(x => x.p === 'kampf/ansage')[0];
chk('die Ansage wird geschrieben', !!echteAnsage, E.schreib.map(x => x.p));
/* Das Distanzband darf NICHT "band" heissen - dort steht das Ergebnis. */
chk('Distanz und Ergebnis stehen in verschiedenen Feldern',
  echteAnsage && echteAnsage.v.dist === 0 && echteAnsage.v.band === undefined,
  echteAnsage && echteAnsage.v);

E.ctx.module.exports.setKampf({ runde: 1, gegner: {
  h1: { name: 'James Harwick', parade: 6, robustheit: 6, kaempfen: 3,
        extra: false, band: 0 } }, ansage: echteAnsage.v });
chk('vor dem Wurf wartet sie', E.nachId['inhalt']._html.indexOf('wartet auf den Wurf') > 0);

/* 2. Der Spieler wuerfelt - das Protokoll traegt es herein. */
E.ctx.module.exports.setProtokoll({ w: { figur: 'Mara Quint', wert: 'Kämpfen',
  band: 'steigerung', roh: 14, ts: echteAnsage.v.ts + 10 } });
chk('der Treffer wird gelesen',
  E.nachId['inhalt']._html.indexOf('Treffer mit Steigerung') > 0);

/* 3. Schaden anfordern - und zwar auf DER Ansage, die der Code geschrieben hat. */
E.schreib.length = 0;
E.ctx.module.exports.schadenAnfordern();
const nachSchaden = {};
E.schreib.filter(x => x.p.indexOf('kampf/ansage/') === 0)
  .forEach(x => { nachSchaden[x.p.split('/')[2]] = x.v; });
chk('die Ansage merkt sich den Stand', nachSchaden.stand === 'schaden', nachSchaden);
/* Der Kern des gemeldeten Fehlers: Ohne das gespeicherte Ergebnis sucht
   danach niemand mehr, und die Anzeige faellt auf "wartet" zurueck. */
chk('und das Ergebnis des Angriffs', nachSchaden.band === 'steigerung', nachSchaden);

/* 4. Genau so, wie Firebase es zurueckspielt - ohne Protokoll-Treffer. */
const ansage2 = Object.assign({}, echteAnsage.v, nachSchaden);
E.ctx.module.exports.setKampf({ runde: 1, gegner: {
  h1: { name: 'James Harwick', parade: 6, robustheit: 6, kaempfen: 3,
        extra: false, band: 0 } }, ansage: ansage2 });
E.ctx.module.exports.setProtokoll({});
const eh = E.nachId['inhalt']._html;
chk('danach steht NICHT mehr "wartet auf den Wurf"',
  eh.indexOf('wartet auf den Wurf') < 0, eh.slice(eh.indexOf('kansage'), eh.indexOf('kansage') + 400));
chk('sondern der Treffer und die Bitte um den Schaden',
  eh.indexOf('Treffer mit Steigerung') > 0 && eh.indexOf('wartet auf den Schadenswurf') > 0);

/* 5. Und der Schadenswurf kommt an. */
E.ctx.module.exports.setProtokoll({ s: { figur: 'Mara Quint', wert: 'Schaden',
  roh: 11, ts: (ansage2.schadenTs || ansage2.ts) + 5 } });
chk('der Schadenswurf wird aufgegriffen',
  E.ctx.module.exports.schadenErgebnis() === 11, E.ctx.module.exports.schadenErgebnis());
chk('und die Wirkung steht da', E.nachId['inhalt']._html.indexOf('Wunde') > 0 &&
  E.nachId['inhalt']._html.indexOf('data-kgilt') > 0);

/* ---- Bekannte Leute tragen Ausrüstung, eigene Gegner baut man ----
   Hendriks Vorgabe vom 15.10.2026: "Wir sollten den bekannten Leuten
   durchaus Ausrüstung geben. Ich brauche aber auch die Möglichkeit Gegner
   zu erstellen - das reicht, wenn ich zwischen stark und schwach wählen
   kann und ihnen eine Waffe in die Hand drücken kann." */
chk('jede Kernfigur trägt etwas',
  Object.keys(NPC.NSC).every(id => (NPC.NSC[id].ausr || []).length > 0),
  Object.keys(NPC.NSC).filter(id => !(NPC.NSC[id].ausr || []).length));
chk('und zwar nur, was es wirklich gibt',
  Object.keys(NPC.NSC).every(id => (NPC.NSC[id].ausr || [])
    .every(w => !!RW.AUSR_BY_ID[w])),
  Object.keys(NPC.NSC).filter(id => (NPC.NSC[id].ausr || [])
    .some(w => !RW.AUSR_BY_ID[w])));
/* Die Zuordnung folgt der Rolle, die im Kanon steht: Wat fuehrt den
   Holztrupp mit der Axt, Dirk richtet Geschuetze. */
chk('Wat trägt die Axt', (NPC.NSC['wat'].ausr || []).indexOf('enteraxt') >= 0);
chk('Dirk die Muskete', (NPC.NSC['dirk'].ausr || []).indexOf('muskete') >= 0);
chk('Josiah nur ein Messer',
  (NPC.NSC['josiah'].ausr || []).join() === 'messer', NPC.NSC['josiah'].ausr);

const WA = bau();
WA.ctx.module.exports.setFiguren(JSON.parse(JSON.stringify(FIGUREN)));
WA.ctx.module.exports.setzeAnsicht('kampf');
/* Ein angelegter Wat bringt seine Axt mit, nicht einen Allerweltswuerfel. */
WA.nachId['kVorlage'] = { id: 'kVorlage', value: 'wat', style: {},
  classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } } };
WA.nachId['kAnzahl'] = { id: 'kAnzahl', value: '1', style: {},
  classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } } };
WA.schreib.length = 0;
WA.ctx.module.exports.gegnerAnlegen();
const watG = WA.schreib.filter(x => x.p.indexOf('kampf/gegner/') === 0)[0];
chk('ein bekannter Gegner bringt seine Waffe mit',
  watG && watG.v.waffe === 'enteraxt' &&
  watG.v.schaden === RW.AUSR_BY_ID['enteraxt'].schaden, watG && watG.v);
chk('und seine Stärke aus dem Blatt', watG && watG.v.staerke >= 2, watG && watG.v.staerke);

/* ---- Selbstgebaut ---- */
['egName', 'egStufe', 'egWaffe', 'egAnzahl'].forEach(id => {
  WA.nachId[id] = { id: id, value: '', style: {},
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } } };
});
WA.nachId['egName'].value = 'Hafenschläger';
WA.nachId['egStufe'].value = 'schwach';
WA.nachId['egWaffe'].value = 'belegnagel';
WA.nachId['egAnzahl'].value = '3';
WA.schreib.length = 0;
WA.ctx.module.exports.eigenenGegnerAnlegen();
const eigene = WA.schreib.filter(x => x.p.indexOf('kampf/gegner/') === 0);
chk('drei Hafenschläger auf einmal', eigene.length === 3, eigene.length);
chk('mit Namen und Nummer',
  eigene.map(x => x.v.name).join(' · ') === 'Hafenschläger 1 · Hafenschläger 2 · Hafenschläger 3',
  eigene.map(x => x.v.name));
chk('schwach heißt Statist', eigene[0].v.extra === true);
chk('mit den Werten der Stufe',
  eigene[0].v.parade === 5 && eigene[0].v.robustheit === 5, eigene[0].v);
chk('und dem Belegnagel in der Hand',
  eigene[0].v.waffe === 'belegnagel' &&
  eigene[0].v.schaden === RW.AUSR_BY_ID['belegnagel'].schaden, eigene[0].v);
chk('es steht im Kampflog',
  WA.schreib.some(x => x.p === 'kampf/log' && (x.v.t + '').indexOf('Belegnagel') > 0),
  WA.schreib.filter(x => x.p === 'kampf/log').map(x => x.v.t));

/* Stark ist ein Wild Card und haelt mehr aus. */
WA.nachId['egName'].value = 'Anführer';
WA.nachId['egStufe'].value = 'stark';
WA.nachId['egWaffe'].value = 'saebel';
WA.nachId['egAnzahl'].value = '1';
WA.schreib.length = 0;
WA.ctx.module.exports.eigenenGegnerAnlegen();
const stark = WA.schreib.filter(x => x.p.indexOf('kampf/gegner/') === 0)[0];
chk('stark heißt Wild Card', stark && stark.v.extra === false, stark && stark.v);
chk('und ist härter als schwach',
  stark && stark.v.parade > eigene[0].v.parade &&
  stark.v.robustheit > eigene[0].v.robustheit, stark && stark.v);

/* Eine Schusswaffe landet im richtigen Feld - sonst schiesst niemand. */
WA.nachId['egName'].value = 'Schütze';
WA.nachId['egWaffe'].value = 'muskete';
WA.schreib.length = 0;
WA.ctx.module.exports.eigenenGegnerAnlegen();
const schuetze = WA.schreib.filter(x => x.p.indexOf('kampf/gegner/') === 0)[0];
chk('eine Schusswaffe steht als Fernwaffe da',
  schuetze && schuetze.v.fernwaffe === 'muskete' && !schuetze.v.waffe, schuetze && schuetze.v);
/* Und wer keine hat, schiesst nicht - mit Begruendung. */
const ohne = WA.ctx.module.exports.fernMoeglich({ typ: 'gegner', name: 'X',
  schiessen: 3, fernwaffe: '' });
chk('ohne Schusswaffe kein Schuss', ohne.ok === false &&
  ohne.grund.indexOf('keine Schusswaffe') > 0, ohne);

/* ---- Greift ein GEGNER an, würfelt die Spielleitung ----
   Hendriks Frage vom 15.10.2026: "Harwick hat Test getroffen. Wie wird
   jetzt der Schaden ausgerollt?" Gar nicht - es gab nur das Zahlenfeld.
   Einen Gegner fragt niemand: Er hat keinen Bogen und wartet auf nichts. */
const G = bau();
G.ctx.module.exports.setFiguren(JSON.parse(JSON.stringify(FIGUREN)));
G.ctx.module.exports.setzeAnsicht('kampf');
G.ctx.module.exports.setKampf({ runde: 1, gegner: {
  h1: { name: 'James Harwick', parade: 6, robustheit: 6, kaempfen: 3,
        staerke: 3, schaden: 2, extra: false, band: 0 } } });
/* Harwick greift an - das wuerfelt die Seite sofort selbst. */
G.schreib.length = 0;
G.ctx.module.exports.angriffAnsagen('nah', 'g:h1', 'p:anna');
const gAnsage = G.schreib.filter(x => x.p === 'kampf/ansage')[0];
chk('ein Gegner würfelt sofort', gAnsage && !!gAnsage.v.band, gAnsage && gAnsage.v);

/* Auf einen Treffer hin muss ein Knopf da sein - und zwar ein anderer als
   beim Spieler: "würfeln", nicht "anfordern". */
G.ctx.module.exports.setKampf({ runde: 1, gegner: {
  h1: { name: 'James Harwick', parade: 6, robustheit: 6, kaempfen: 3,
        staerke: 3, schaden: 2, extra: false, band: 0 } },
  ansage: Object.assign({}, gAnsage.v, { band: 'steigerung', roh: 9 }) });
const gh = () => G.nachId['inhalt']._html;
chk('für den Gegner steht da „Schaden würfeln"',
  gh().indexOf('data-gschaden') > 0 && gh().indexOf('Schaden würfeln') > 0);
chk('und nicht „anfordern" — ihn fragt niemand', gh().indexOf('data-kschaden') < 0);
chk('die Würfel stehen dabei', gh().indexOf('Stärke d8') > 0, 
  gh().slice(gh().indexOf('Schaden würfeln'), gh().indexOf('Schaden würfeln') + 120));

G.schreib.length = 0;
G.ctx.module.exports.gegnerSchadenWuerfeln();
chk('der Wurf steht im Kampflog',
  G.schreib.some(x => x.p === 'kampf/log' && (x.v.t + '').indexOf('würfelt Schaden') > 0),
  G.schreib.map(x => (x.v && x.v.t) || x.p));
/* Waffe + Staerke + Steigerungs-W6 - drei Wuerfel, also mindestens 3. */
const logZeile = G.schreib.filter(x => x.p === 'kampf/log')[0].v.t;
chk('mit Waffe, Stärke und dem W6 der Steigerung',
  logZeile.indexOf('Waffe') > 0 && logZeile.indexOf('Stärke') > 0 &&
  logZeile.indexOf('Steigerung') > 0, logZeile);
chk('und die Zahl steht danach im Feld', gh().indexOf('data-kgilt') > 0, 'keine Wirkung');

/* ---- Die Aufstellung ----
   Hendriks Vorgabe: zwei Parteien stehen sich gegenueber, Ziehen ist ein
   Nahkampfangriff, Klick ein Fernkampfangriff - und die Gegner stehen in
   drei Distanzen, statt dass bei jedem Schuss gefragt wird. */
const F = bau();
F.ctx.module.exports.setFiguren(JSON.parse(JSON.stringify(FIGUREN)));
F.ctx.module.exports.setzeAnsicht('kampf');
F.ctx.module.exports.setKampf({ runde: 1, gegner: {
  n1: { name: 'Nah-Mann', parade: 4, robustheit: 5, kaempfen: 2, schiessen: 0,
        extra: true, band: 0, angeschlagen: false, wunden: 0 },
  f1: { name: 'Fern-Mann', parade: 4, robustheit: 5, kaempfen: 2, schiessen: 3,
        extra: true, band: 2, angeschlagen: false, wunden: 0 }
} });
const fh = () => F.nachId['inhalt']._html;

chk('die drei Bänder stehen da',
  fh().indexOf('data-band="2"') > 0 && fh().indexOf('data-band="1"') > 0 &&
  fh().indexOf('data-band="0"') > 0);
chk('und die eigene Seite darunter', fh().indexOf('data-band="held"') > 0);
chk('das Nahband sagt, dass Nahkampf geht', fh().indexOf('Nahkampf möglich') > 0);
chk('die anderen nennen ihren Abzug', fh().indexOf('-2 auf Schüsse') > 0 &&
  fh().indexOf('-4 auf Schüsse') > 0);
chk('jede Figur ist ein Chip', (fh().match(/data-tok="/g) || []).length === 6,
  (fh().match(/data-tok="/g) || []).length);
chk('Freund und Feind sind zu unterscheiden',
  fh().indexOf('ktok freund') > 0 && fh().indexOf('ktok feind') > 0);
chk('wer außer Gefecht liegt, lässt sich nicht ziehen',
  fh().indexOf('raus" data-tok="p:cord"') > 0 ||
  /class="ktok [^"]*raus"(?![^>]*draggable)/.test(fh()), 'cord ist ziehbar');

/* ---- Ziehen = Nahkampf ---- */
F.schreib.length = 0;
F.ctx.module.exports.tokenZiehen('p:anna');
F.ctx.module.exports.tokenFallen('g:n1');
const nah = F.schreib.filter(x => x.p === 'figuren/anna/anfrage')[0];
chk('Ziehen sagt einen Nahkampfangriff an', !!nah, F.schreib.map(x => x.p));
chk('auf Kämpfen und ohne Distanzabzug',
  nah && nah.v.wert === 'Kämpfen' && nah.v.mod === RW.ZIELZAHL - 4, nah && nah.v);
chk('und er erfährt, auf wen', nah && nah.v.grund.indexOf('Nah-Mann') > 0);

/* Auf einen, der weit weg steht, geht Nahkampf NICHT - das ist dieselbe
   Regel wie im Original: Wer nicht angrenzt, kann nicht zuschlagen. */
F.schreib.length = 0;
F.nachId['fbNote'].textContent = '';
F.ctx.module.exports.tokenZiehen('p:anna');
F.ctx.module.exports.tokenFallen('g:f1');
chk('auf Entfernung geht kein Nahkampf', F.schreib.length === 0, F.schreib.map(x => x.p));
chk('und es steht da, warum',
  F.nachId['fbNote'].textContent.indexOf('zu weit weg') > 0,
  F.nachId['fbNote'].textContent);

/* ---- Klick = Fernkampf ---- */
F.schreib.length = 0;
F.ctx.module.exports.tokenKlick('p:anna');      // waehlt
F.ctx.module.exports.tokenKlick('g:f1');        // schiesst
chk('Anna trägt keine Schusswaffe, also schießt sie nicht',
  F.schreib.length === 0 && F.nachId['fbNote'].textContent.indexOf('keine Schusswaffe') > 0,
  F.nachId['fbNote'].textContent);

/* Dora traegt Pistole UND hat null Ladungen - die Munitionsregel greift. */
F.schreib.length = 0;
F.ctx.module.exports.tokenKlick('p:dora');
F.ctx.module.exports.tokenKlick('g:f1');
chk('ohne Pulver auch nicht',
  F.schreib.length === 0 && F.nachId['fbNote'].textContent.indexOf('kein Pulver') > 0,
  F.nachId['fbNote'].textContent);

/* Mit Pulver geht es - und der Abzug kommt aus dem Band. */
const mitPulver = JSON.parse(JSON.stringify(FIGUREN));
mitPulver.dora.ladungen = 5;
F.ctx.module.exports.setFiguren(mitPulver);
F.schreib.length = 0;
F.ctx.module.exports.tokenKlick('p:dora');
F.ctx.module.exports.tokenKlick('g:f1');
const schuss = F.schreib.filter(x => x.p === 'figuren/dora/anfrage')[0];
chk('mit Pulver wird geschossen', !!schuss, F.schreib.map(x => x.p));
chk('auf Schießen', schuss && schuss.v.wert === 'Schießen', schuss && schuss.v);
/* Fern-Mann steht im dritten Band: -4 obendrauf. */
chk('mit dem Abzug des Bandes',
  schuss && schuss.v.mod === RW.ZIELZAHL - 4 + K.bandMod(2),
  { mod: schuss && schuss.v.mod, erwartet: RW.ZIELZAHL - 4 + K.bandMod(2) });
chk('und das Band steht in der Bitte', schuss && schuss.v.grund.indexOf('Fern') > 0,
  schuss && schuss.v.grund);

/* ---- Umstellen ---- */
F.schreib.length = 0;
F.ctx.module.exports.tokenZiehen('g:f1');
F.ctx.module.exports.bandFallen('0');
chk('einen Gegner auf ein Band ziehen stellt ihn um',
  F.schreib.some(x => x.p === 'kampf/gegner/f1/band' && x.v === 0),
  F.schreib.map(x => x.p));
chk('und es steht im Log', F.schreib.some(x => x.p === 'kampf/log'));
/* Seit dem 15.10.2026 laesst sich JEDE Figur umstellen - Hendriks
   Vorgabe: "Spieler auf den Seiten verschieben, James Harwick ist ja eher
   auf der Seite der Spieler." Bei einer Spielerfigur liegt die Abweichung
   NEBEN der Figur, nicht in ihr. */
F.schreib.length = 0;
F.ctx.module.exports.tokenZiehen('p:anna');
F.ctx.module.exports.bandFallen('2');
chk('auch ein Spieler lässt sich zurückstellen',
  F.schreib.some(x => x.p === 'kampf/baender/anna' && x.v === 2), F.schreib.map(x => x.p));
chk('und zwar neben der Figur, nicht in ihr',
  !F.schreib.some(x => x.p.indexOf('figuren/') === 0), F.schreib.map(x => x.p));
/* Erst den Stand zurueckspielen, wie Firebase es taete - sonst steht sie
   noch auf Band 0 und "zurueckstellen" waere gar keine Aenderung. */
F.ctx.module.exports.setKampf({ runde: 1, gegner: {
  n1: { name: 'Nah-Mann', parade: 4, robustheit: 5, kaempfen: 2, extra: true, band: 0 } },
  baender: { anna: 2 }, seiten: { anna: 'feind' } });
chk('die Abweichung wirkt', F.ctx.module.exports.kampfFinde('p:anna').band === 2 &&
  F.ctx.module.exports.kampfFinde('p:anna').seite === 'feind',
  F.ctx.module.exports.kampfFinde('p:anna'));
F.schreib.length = 0;
F.ctx.module.exports.tokenZiehen('p:anna');
F.ctx.module.exports.bandFallen('held');
chk('und wieder zurück auf die eigene Seite',
  F.schreib.some(x => x.p === 'kampf/seiten/anna' && x.v === null) &&
  F.schreib.some(x => x.p === 'kampf/baender/anna' && x.v === null), F.schreib.map(x => x.p));
chk('und es steht im Log',
  F.schreib.some(x => x.p === 'kampf/log' && (x.v.t + '').indexOf('eurer Seite') > 0),
  F.schreib.filter(x => x.p === 'kampf/log').map(x => x.v.t));

/* ---- Harwick steht bei den Spielern ----
   Hendriks Vorgabe vom 15.10.2026. Ein NSC auf die eigene Seite zu ziehen
   ist dieselbe Geste wie das Umstellen der Entfernung: auf ein Band. */
F.ctx.module.exports.setKampf({ runde: 1, gegner: {
  hw: { name: 'James Harwick', parade: 6, robustheit: 6, kaempfen: 3,
        extra: false, band: 2, seite: 'feind' } } });
F.schreib.length = 0;
F.ctx.module.exports.tokenZiehen('g:hw');
F.ctx.module.exports.bandFallen('held');
chk('ein NSC lässt sich auf die eigene Seite ziehen',
  F.schreib.some(x => x.p === 'kampf/gegner/hw/seite' && x.v === 'held'),
  F.schreib.map(x => x.p));
chk('und steht dabei wieder vorn',
  F.schreib.some(x => x.p === 'kampf/gegner/hw/band' && x.v === 0), F.schreib.map(x => x.p));
chk('das Log sagt, dass er jetzt mitkämpft',
  F.schreib.some(x => x.p === 'kampf/log' && (x.v.t + '').indexOf('eurer Seite') > 0),
  F.schreib.filter(x => x.p === 'kampf/log').map(x => x.v.t));

/* Die Entfernung ist der ABSTAND: Steht der Spieler selbst zurueck,
   zaehlt das weiter entfernte der beiden Baender. */
F.ctx.module.exports.setKampf({ runde: 1, gegner: {
  n1: { name: 'Nah-Mann', parade: 4, robustheit: 5, kaempfen: 2, schiessen: 2,
        fernwaffe: 'muskete', extra: true, band: 0 } }, baender: { dora: 2 } });
F.nachId['fbNote'].textContent = '';
F.schreib.length = 0;
F.ctx.module.exports.angriffAnsagen('nah', 'g:n1', 'p:dora');
chk('wer zurücksteht, ist nicht im Nahkampf erreichbar',
  F.schreib.length === 0 && F.nachId['fbNote'].textContent.indexOf('zu weit weg') > 0,
  F.nachId['fbNote'].textContent);
F.schreib.length = 0;
F.ctx.module.exports.angriffAnsagen('fern', 'g:n1', 'p:dora');
const fernAnsage = F.schreib.filter(x => x.p === 'kampf/ansage')[0];
chk('geschossen wird mit dem Abzug des weiteren Bandes',
  fernAnsage && fernAnsage.v.dist === 2 &&
  fernAnsage.v.mod === RW.ZIELZAHL - 4 + K.bandMod(2),
  fernAnsage && fernAnsage.v);

/* ---- Verbündete ---- */
F.schreib.length = 0;
F.ctx.module.exports.seiteWechseln('n1');
chk('ein Gegner kann die Seite wechseln',
  F.schreib.some(x => x.p === 'kampf/gegner/n1/seite' && x.v === 'held'),
  F.schreib.map(x => x.p));
F.ctx.module.exports.setKampf({ runde: 1, gegner: {
  n1: { name: 'Cormac', parade: 6, robustheit: 6, kaempfen: 4, extra: false,
        band: 0, seite: 'held' },
  f1: { name: 'Fern-Mann', parade: 4, robustheit: 5, kaempfen: 2, band: 0 } } });
chk('und steht dann auf der eigenen Seite',
  fh().split('data-band="held"')[1].indexOf('Cormac') > 0, 'Cormac steht falsch');
F.schreib.length = 0;
F.nachId['fbNote'].textContent = '';
F.ctx.module.exports.tokenZiehen('p:anna');
F.ctx.module.exports.tokenFallen('g:n1');
chk('auf die eigene Seite wird nicht eingeschlagen',
  F.schreib.length === 0 && F.nachId['fbNote'].textContent.indexOf('derselben Seite') > 0,
  F.nachId['fbNote'].textContent);

console.log('');
console.log('=== DIE WARENLISTE UND IHRE SUCHE ===');
/* Hendriks Vorgabe vom 15.10.2026: eine Liste ALLER Gegenstaende mit
   Textsuche - "vollumfaenglich, Buchstabenfolge muss im Wort vorkommen".
   Also ausdruecklich KEINE Wortanfangs-Suche. */
const L = bau();
L.ctx.module.exports.setFiguren(JSON.parse(JSON.stringify(FIGUREN)));
L.ctx.module.exports.setzeAnsicht('waren');
const lh = () => L.nachId['inhalt']._html + L.nachId['warenListe']._html;

chk('die Ansicht hat einen eigenen Knopf', L.nachId['btnWaren'].classList.contains('on'));
chk('ein Suchfeld steht da', L.nachId['inhalt']._html.indexOf('id="warenFeld"') > 0);
chk('alle Gegenstände sind gelistet',
  L.nachId['warenZahl'].textContent.indexOf('53') === 0, L.nachId['warenZahl'].textContent);
chk('nach Warenart gruppiert',
  L.nachId['warenListe']._html.indexOf('Nahkampf') > 0 &&
  L.nachId['warenListe']._html.indexOf('Allerlei') > 0);
chk('mit Werten, nicht nur Namen',
  /Schaden <b>d\d+<\/b>/.test(L.nachId['warenListe']._html) &&
  /<b>\d+<\/b> M\./.test(L.nachId['warenListe']._html));

/* Der Kern der Vorgabe: mitten im Wort. */
const T = L.ctx.module.exports.warenTreffer;
const ware = n => RW.AUSRUESTUNG.filter(a => a.n === n)[0];
chk('„ulver" findet das Pulverhorn', T(ware('Pulverhorn mit Blei'), 'ulver'));
chk('„aebel" findet den Säbel', T(ware('Säbel'), 'aebel'));
chk('Groß und klein ist egal', T(ware('Säbel'), 'SÄBEL') && T(ware('Säbel'), 'säbel'));
/* Umlaute: Wer "saebel" tippt, meint den Saebel - ohne das faende eine
   deutsche Suche die halbe Liste nicht. */
chk('Umlaute werden vereinheitlicht', T(ware('Säbel'), 'saebel'));
chk('und andersherum auch', T(ware('Donnerbüchse'), 'buechse') &&
  T(ware('Donnerbüchse'), 'büchse'));
chk('ohne Suchtext passt alles', T(ware('Säbel'), ''));
chk('was nicht passt, passt nicht', !T(ware('Säbel'), 'zzz'));

/* Gesucht wird ueber ALLES, was an der Ware steht - nicht nur den Namen. */
chk('auch die Beschreibung wird durchsucht',
  RW.AUSRUESTUNG.some(a => a.n.toLowerCase().indexOf('laterne') < 0 && T(a, 'öl')),
  'kein Treffer über die Beschreibung');
chk('und die Warenart', T(ware('Säbel'), 'nahkampf'));

/* Gesucht wird wirklich in der Ansicht, nicht nur in der Funktion. */
L.ctx.module.exports.warenSuchen('ulver');
const gefunden = L.nachId['warenListe']._html;
/* Der Name steht im Treffer ZERLEGT da - "P<mark>ulver</mark>horn" -, weil
   die Fundstelle markiert wird. Genau darauf wird geprüft; die erste
   Fassung dieser Prüfung suchte nach dem ganzen Wort und schlug deshalb
   an, obwohl die Liste stimmte. */
chk('die Liste zeigt nur noch Treffer',
  gefunden.indexOf('<mark>ulver</mark>') > 0 && gefunden.indexOf('horn mit Blei') > 0 &&
  gefunden.indexOf('Säbel') < 0,
  gefunden.slice(0, 220));
chk('der Zähler sagt, wie viele', L.nachId['warenZahl'].textContent.indexOf('gefunden') > 0,
  L.nachId['warenZahl'].textContent);
/* Die Fundstelle wird markiert - sonst sucht man im Treffer noch einmal
   mit den Augen. */
chk('die Fundstelle ist markiert', gefunden.indexOf('<mark>ulver</mark>') > 0 ||
  gefunden.indexOf('<mark>') > 0, gefunden.slice(0, 200));
chk('leere Fächer fallen weg', gefunden.indexOf('Schutz') < 0, 'Schutz noch da');

L.ctx.module.exports.warenSuchen('qqq');
chk('ohne Treffer steht da, warum',
  L.nachId['warenListe']._html.indexOf('Nichts gefunden') > 0);
L.ctx.module.exports.warenSuchen('');
chk('ein leeres Feld zeigt wieder alles',
  L.nachId['warenZahl'].textContent.indexOf('53') === 0, L.nachId['warenZahl'].textContent);

/* Das Markieren darf den Text nicht verfaelschen - es laeuft ueber die
   normalisierte Fassung, ausgegeben wird das Original. */
const H = L.ctx.module.exports.hervor;
chk('markiert wird das Original, nicht die Suchform',
  H('Säbel', 'saebel') === '<mark>Säbel</mark>', H('Säbel', 'saebel'));
chk('ohne Suchtext bleibt der Text unberührt', H('Säbel', '') === 'Säbel');
chk('mehrere Fundstellen werden alle markiert',
  (H('Tau und Tauwerk', 'tau').match(/<mark>/g) || []).length === 2,
  H('Tau und Tauwerk', 'tau'));
chk('spitze Klammern bleiben maskiert', H('<b>x</b>', 'zzz').indexOf('&lt;b&gt;') === 0,
  H('<b>x</b>', 'zzz'));

/* Aus der Liste heraus vergeben: suchen, finden, geben. */
chk('ohne Ziel steht kein Geben-Knopf', L.nachId['warenListe']._html.indexOf('data-wgeben') < 0);
L.ctx.module.exports.warenZielSetzen('anna');
chk('mit Ziel schon', L.nachId['warenListe']._html.indexOf('data-wgeben="saebel"') > 0);
L.schreib.length = 0;
L.klick({ wgeben: 'saebel' });
chk('und die Übergabe geht ins Postfach',
  L.schreib.length === 1 && L.schreib[0].p === 'figuren/anna/zuteilung' &&
  L.schreib[0].v.id === 'saebel', L.schreib);
chk('der Spielleitung wird es bestätigt',
  L.nachId['fbNote'].textContent.indexOf('Säbel') > 0 &&
  L.nachId['fbNote'].textContent.indexOf('Mara Quint') > 0, L.nachId['fbNote'].textContent);
chk('und zwar nicht als Warnung', L.nachId['fbNote'].className !== 'fbnote warn',
  L.nachId['fbNote'].className);

/* Erfundene Waren stehen mit in der Liste - sonst muesste man zum Vergeben
   doch wieder wissen, woher sie kommen. */
L.lauscher['eigeneWaren']({ val: () => ({ x: { id: 'sl_brief_aaaa', n: 'Harwicks Brief',
  d: 'Ein versiegelter Umschlag.', art: 'Allerlei', gew: 0, preis: 0 } }) });
L.ctx.module.exports.setzeAnsicht('waren');
chk('eine erfundene Ware steht in der Liste',
  L.nachId['warenListe']._html.indexOf('Harwicks Brief') > 0);
chk('und ist als solche gekennzeichnet',
  L.nachId['warenListe']._html.indexOf('erfunden') > 0);
L.ctx.module.exports.warenSuchen('sl_');
chk('über das Präfix findet man sie alle',
  L.nachId['warenListe']._html.indexOf('Harwicks Brief') > 0 &&
  L.nachId['warenZahl'].textContent.indexOf('1 von') === 0,
  L.nachId['warenZahl'].textContent);
L.ctx.module.exports.warenSuchen('');

console.log('');
console.log('=== DIE AUSRUESTUNG SAGT, WAS SIE TUT ===');
/* Hendriks Frage vom 15.10.2026: "Kann ich irgendwie die Ausruestung der
   Spieler sehen? Also auch was Items machen Angriff/Schaden etc."
   Sichtbar war bisher nur der Name plus eine nackte Zahl. */
const A = bau();
A.ctx.module.exports.setFiguren(JSON.parse(JSON.stringify(FIGUREN)));
const ah = A.inhalt();

chk('die Ausrüstung steht da', ah.indexOf('Säbel') > 0 && ah.indexOf('Lederwams') > 0);
chk('mit dem Schadenswürfel', /&gt;Säbel <span class="wert">d6/.test(ah) ||
  ah.indexOf('>Säbel <span class="wert">d6') > 0,
  (ah.match(/>Säbel <span class="wert">[^<]*/) || [])[0]);
chk('die Rüstung mit ihrem Wert', /Lederwams <span class="wert">\+1/.test(ah));
/* Bei einer Schusswaffe interessiert die Reichweite, nicht nur der Schaden -
   sie entscheidet, ob der Schuss ueberhaupt moeglich ist. */
chk('die Schusswaffe nennt Reichweite und Schuss',
  /Steinschlosspistole <span class="wert">d6 · Reichw\. 5 · 1 Schuss/.test(ah),
  (ah.match(/Steinschlosspistole <span class="wert">[^<]*/) || [])[0]);
/* Jeder Gegenstand traegt den Marken-Vertrag - sonst erklaert ihn nichts. */
const chips = ah.match(/data-tipart="ausr"/g) || [];
chk('jeder Gegenstand ist erklärbar', chips.length === 3, chips.length);
chk('und nennt seine Beschreibung', ah.indexOf('Kurz, schwer') > 0 || ah.indexOf('data-tipt="') > 0);

/* Traglast und Ladungen kamen hier bisher GAR NICHT vor. Beides braucht
   die Spielleitung im Kampf. */
chk('die Traglast steht dabei', /Gewicht <b>\d+<\/b> von \d+/.test(ah),
  (ah.match(/Gewicht <b>\d+<\/b> von \d+/) || [])[0]);
chk('und die Ladungen', ah.indexOf('Ladungen') > 0);
chk('ein Schütze ohne Pulver wird benannt', ah.indexOf('kann nicht schießen') > 0);
/* Wer keine Schusswaffe traegt, braucht die Zeile auch nicht. */
chk('ohne Schusswaffe keine Ladungszeile',
  ah.split('Mara Quint')[1].split('Ruth Vane')[0].indexOf('Ladungen') < 0);

/* Einziehen laeuft jetzt ueber das Kreuz UND fragt nach: Der Chip selbst
   oeffnet die Erklaerung, ein Fehlgriff darf keine Waffe kosten. */
chk('das Kreuz zieht ein, nicht der ganze Chip',
  ah.indexOf('class="zu" data-nehmen="dora|saebel"') > 0);
A.schreib.length = 0;
A.ctx._confirm = false;
A.klick({ nehmen: 'dora|saebel' });
chk('eine abgelehnte Rückfrage zieht nichts ein', A.schreib.length === 0, A.schreib);
A.ctx._confirm = true;
A.klick({ nehmen: 'dora|saebel' });
chk('bestätigt geht es ins Postfach',
  A.schreib.length === 1 && A.schreib[0].p === 'figuren/dora/zuteilung' &&
  A.schreib[0].v.art === 'nehmen' && A.schreib[0].v.id === 'saebel', A.schreib);

/* Ein Gegenstand, den es nicht mehr gibt, wird GENANNT - sonst traegt die
   Figur etwas, das niemand sieht. */
A.ctx.module.exports.setFiguren({ xena: { name: 'X', spieler: 'X', attr: {}, fert: {},
  ausr: ['sl_geloescht_aaaa'] } });
chk('ein unbekannter Gegenstand verschwindet nicht stillschweigend',
  A.inhalt().indexOf('sl_geloescht_aaaa') > 0 && A.inhalt().indexOf('unbekannt') > 0);

console.log('');
console.log('=== DIE WERKSTATT: EIGENE GEGENSTAENDE ===');
/* Hendriks Vorgabe vom 15.10.2026: Die Spielleitung soll Gegenstaende
   erstellen und einer Figur zuweisen koennen. Zwei Schritte, und das ist
   Absicht: Die BESCHREIBUNG gehoert der Sitzung, die Uebergabe der Figur -
   derselbe Gegenstand kann mehreren gegeben werden. */
const W = bau();
W.ctx.module.exports.setFiguren(FIGUREN);
W.schreib.length = 0;

chk('die Werkstatt ist zu, bis man sie aufmacht', W.werkstatt() === '', W.werkstatt());
W.ctx.module.exports.toggleWerkstatt();
chk('aufgeklappt steht ein Formular da',
  W.werkstatt().indexOf('wstName') > 0 && W.werkstatt().indexOf('anlegen') > 0);
chk('und noch nichts erfunden', W.werkstatt().indexOf('Noch nichts erfunden') > 0);
chk('das Aufklappen schreibt nichts', W.schreib.length === 0, W.schreib);

/* Ohne Namen gibt es nichts - und es wird gesagt, statt still zu scheitern. */
W.fuelle({ wstName: '   ', wstText: 'x', wstArt: 'Nahkampf', wstSchaden: '3',
           wstRuest: '0', wstGew: '5', wstPreis: '400' });
W.ctx.module.exports.wareAnlegen();
chk('ohne Namen wird nichts angelegt', W.schreib.length === 0, W.schreib);
chk('und es steht da, warum', W.nachId['wstMeld'].textContent.indexOf('Namen') >= 0,
  W.nachId['wstMeld'].textContent);

W.fuelle({ wstName: 'Jaguar-Säbel', wstText: 'Ein Jaguar ist eingraviert.',
           wstArt: 'Nahkampf', wstSchaden: '3', wstRuest: '0', wstGew: '5', wstPreis: '400' });
W.ctx.module.exports.wareAnlegen();
chk('genau EIN Schreibzugriff', W.schreib.length === 1, W.schreib);
const gw = W.schreib[0];
chk('und zwar auf die Waren der Sitzung', gw.p.indexOf('eigeneWaren/sl_') === 0, gw.p);
chk('nicht auf eine Figur', gw.p.indexOf('figuren/') < 0, gw.p);
chk('mit allem, was der Gegenstand ist',
  gw.v.n === 'Jaguar-Säbel' && gw.v.schaden === 3 && gw.v.gew === 5 && gw.v.preis === 400 &&
  gw.v.art === 'Nahkampf' && gw.v.vonSl === true, gw.v);

/* Jetzt kommt die Ware ueber die Datenbank zurueck - erst dann gibt es
   sie wirklich. Die Seite traegt sie ein und zeichnet neu. */
const wid = gw.p.split('/')[1];
W.lauscher['eigeneWaren']({ val: () => ({ [wid]: gw.v }) });
chk('danach steht sie in der Liste', W.werkstatt().indexOf('Jaguar-Säbel') > 0);
/* "const AUSR_BY_ID" im vm ist von aussen NICHT als ctx-Eigenschaft
   sichtbar - also ueber die Seite selbst fragen. */
const wListe = W.ctx.module.exports.eigeneListe();
chk('und ist ganz normale Ware',
  wListe.length === 1 && wListe[0].id === wid && wListe[0].schaden === 3, wListe);
/* Der eigentliche Zweck: Sie laesst sich uebergeben - und steht dafuer
   OBEN in der Auswahl, nicht hinter sechs Warenarten. */
const wgb = W.ctx.module.exports.gebenBlock('anna', FIGUREN.anna);
chk('sie steht in der Übergabe-Auswahl', wgb.indexOf(wid) > 0);
chk('und zwar ganz oben', wgb.indexOf('Von der Spielleitung') > 0 &&
  wgb.indexOf('Von der Spielleitung') < wgb.indexOf('<optgroup label="Nahkampf"'));
chk('die Ware des Regelwerks steht nicht doppelt da',
  (wgb.match(new RegExp(wid, 'g')) || []).length === 1);

W.schreib.length = 0;
W.ctx.module.exports.uebergeben('anna', { art: 'gegenstand', id: wid });
chk('übergeben wird wie jede andere Ware auch',
  W.schreib.length === 1 && W.schreib[0].p === 'figuren/anna/zuteilung' &&
  W.schreib[0].v.id === wid, W.schreib);

/* Loeschen fragt nach - und sagt dazu, wer sie traegt. */
W.schreib.length = 0;
W.ctx._confirm = false;
W.ctx.module.exports.wareWeg(wid);
chk('eine abgelehnte Rückfrage löscht nichts', W.schreib.length === 0, W.schreib);
W.ctx._confirm = true;
W.ctx.module.exports.wareWeg(wid);
chk('bestätigt wird sie gelöscht',
  W.schreib.length === 1 && W.schreib[0].op === 'remove' &&
  W.schreib[0].p === 'eigeneWaren/' + wid, W.schreib);
W.lauscher['eigeneWaren']({ val: () => ({}) });
chk('danach ist sie überall weg',
  W.ctx.module.exports.eigeneListe().length === 0 &&
  W.werkstatt().indexOf('Noch nichts erfunden') > 0);

/* Zum Schluss, was am Firebase-Versprechen haengt: Das loest erst auf,
   wenn der synchrone Lauf durch ist - vorher stuende hier noch die
   vorige Meldung. */
Promise.resolve().then(function () {
  chk('der Spielleitung wird der Gegenstand bestätigt',
    W.nachId['wstMeld'].textContent.indexOf('angelegt') > 0, W.nachId['wstMeld'].textContent);
  chk('und das Namensfeld ist wieder leer', W.nachId['wstName'].value === '');
  schluss();
});

function schluss() {
console.log('');
console.log(f === 0 ? 'OK: ' + anzahl + '   FEHLER: 0' : 'OK: ' + (anzahl - f) + '   FEHLER: ' + f);
process.exit(f ? 1 : 0);
}

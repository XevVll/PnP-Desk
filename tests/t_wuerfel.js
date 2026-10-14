/* ==========================================================
   WÜRFELLEISTE — js/dice.js
   ----------------------------------------------------------
   Die Leiste wird hier WIRKLICH AUSGEFÜHRT, nicht nur geparst.
   Grund: Beim Bauen stand versehentlich ein nackter Bezeichner
   im Code ("why"). Das ist gültiges JavaScript und parst
   anstandslos — es knallt erst zur Laufzeit. Eine reine
   Syntaxprüfung ist für diese Fehlerklasse blind, genau wie
   node --check für ein top-level return.

   Geprüft wird deshalb über einen aufzeichnenden DOM-Stub:
   gerendertes Markup, echte Würfe gegen js/regelwerk.js, und
   was tatsächlich in die Datenbank geschrieben wird.
   ========================================================== */
const fs = require('fs'), path = require('path'), vm = require('vm');
const BASIS = path.join(__dirname, '..');
const R = require(path.join(BASIS, 'js/regelwerk.js'));

let f = 0, anzahl = 0;
const chk = (n, c, x) => { anzahl++; console.log((c ? 'OK  ' : 'FAIL') + ' ' + n + (c ? '' : '  <<< ' + JSON.stringify(x))); if (!c) f++; };

/* ---------- Umgebung ---------- */
function bau() {
  const nachId = {};
  function knoten(tag) {
    const n = {
      tagName: tag, _html: '', textContent: '', className: '', id: '', style: {}, dataset: {},
      kinder: [], checked: false,
      classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); }, contains(c) { return this._s.has(c); } },
      appendChild(k) { n.kinder.push(k); if (k.id) nachId[k.id] = k; return k; },
      remove() {}, addEventListener(e, cb) { n['on_' + e] = cb; },
      get innerHTML() { return n._html; }, set innerHTML(v) { n._html = v; }
    };
    return n;
  }
  const body = knoten('body'), head = knoten('head');
  const geschrieben = [], lauscher = {};
  function ref(p) {
    return {
      push(v) { geschrieben.push({ p: p, v: v }); return Promise.resolve({ key: 'k' }); },
      remove() { geschrieben.push({ p: p, op: 'remove' }); return Promise.resolve(); },
      on(e, cb) { lauscher[p + '#' + e] = cb; },
      off() { delete lauscher[p + '#value']; }
    };
  }
  const db = { sitzung: 'test', ref: ref };
  const ctx = {
    Math, Object, String, Array, Number, parseInt, Date, console, setTimeout,
    localStorage: { _d: { korsaren_playername: 'Marie' }, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; } },
    firebase: { database: { ServerValue: { TIMESTAMP: 1 } } },
    document: { head: head, body: body, createElement: knoten, getElementById(id) { return nachId[id] || null; } }
  };
  ctx.window = ctx;
  ctx.window.prompt = function () { return 'Marie'; };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(BASIS, 'js/regelwerk.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(BASIS, 'js/dice.js'), 'utf8'), ctx);
  return { ctx, db, nachId, geschrieben, lauscher };
}

const FIGUR = {
  schluessel: 'marie', name: 'Mara Quint', abzug: 0,
  attr: { 'Geschicklichkeit': 3, 'Verstand': 2, 'Willenskraft': 2, 'Stärke': 2, 'Konstitution': 2 },
  fert: { 'Kämpfen': 3, 'Segeln': 2, 'Aufmerksamkeit': 2 }
};

function start(figur, kontext, opt) {
  const u = bau();
  u.figur = figur;
  u.kontext = kontext || { szene: '4.1', ort: 'hoehle' };
  u.handle = u.ctx.initDiceRoller(u.db, Object.assign({
    holeFigur: function () { return u.figur; },
    holeKontext: function () { return u.kontext; }
  }, opt || {}));
  u.markup = function () { return u.nachId['wuerfelLeiste']._html; };
  u.klick = function (treffer) {
    // Den Klick-Handler der Leiste mit einem passenden Ziel aufrufen.
    u.nachId['wuerfelLeiste'].on_click({ target: { closest: function () { return treffer; } } });
  };
  return u;
}

console.log('=== DIE LEISTE BAUT SICH AUF ===');
let u = start(FIGUR);
chk('Leiste angelegt', !!u.nachId['wuerfelLeiste']);
chk('Feed angelegt', !!u.nachId['diceFeed']);
chk('zeigt Attribute', u.markup().indexOf('Geschicklichkeit') >= 0);
chk('zeigt gelernte Fertigkeiten', u.markup().indexOf('Kämpfen') >= 0);
chk('zeigt ungelernte NICHT', u.markup().indexOf('Diebeskunst') < 0);
chk('alle fünf Würfel da', [4, 6, 8, 10, 12].every(s => u.markup().indexOf('data-frei="' + s + '"') >= 0));

console.log('');
console.log('=== DAS W100-ERBE IST WEG ===');
const quelle = fs.readFileSync(path.join(BASIS, 'js/dice.js'), 'utf8');
chk('kein 1×100-Knopf im Markup', u.markup().indexOf('1×100') < 0);
chk('kein diceD100Btn mehr', quelle.indexOf('diceD100Btn') < 0);
chk('keine freie Seitenzahl bis 1000', quelle.indexOf('DICE_SIDES_MAX') < 0);
chk('keine Vorgabe d20', !/value="20"/.test(quelle));

console.log('');
console.log('=== WERTPROBE: FEED UND PROTOKOLL ===');
u = start(FIGUR);
u.geschrieben.length = 0;
u.klick({ dataset: { wert: 'Kämpfen', stufe: '3' } });
const feedS = u.geschrieben.filter(g => g.p === 'diceRolls');
const protS = u.geschrieben.filter(g => g.p.indexOf('/protokoll') >= 0);
chk('ein Feed-Eintrag', feedS.length === 1, u.geschrieben.map(g => g.p));
chk('ein Protokoll-Eintrag', protS.length === 1);
chk('Protokoll liegt unter der Sitzung', protS[0].p === 'sitzungen/test/protokoll', protS[0].p);
chk('Protokoll trägt die Szene', protS[0].v.szene === '4.1', protS[0].v);
chk('Protokoll trägt den Ort', protS[0].v.ort === 'hoehle');
chk('Protokoll trägt Spieler und Figur', protS[0].v.spieler === 'Marie' && protS[0].v.figur === 'Mara Quint');
chk('Protokoll trägt Wert, Band und Schwelle',
    protS[0].v.wert === 'Kämpfen' && !!protS[0].v.band && protS[0].v.ziel === 4, protS[0].v);
chk('Protokoll hat ein leeres Notizfeld', protS[0].v.notiz === '');
chk('Feed trägt die Einordnung', !!feedS[0].v.band && typeof feedS[0].v.ergebnis === 'number', feedS[0].v);

console.log('');
console.log('=== FREIE WÜRFEL KOMMEN NICHT INS PROTOKOLL ===');
u = start(FIGUR);
u.geschrieben.length = 0;
u.klick({ dataset: { frei: '6' } });
u.klick({ dataset: { frei: '12' } });
chk('zwei Feed-Einträge', u.geschrieben.filter(g => g.p === 'diceRolls').length === 2);
chk('kein Protokoll-Eintrag', u.geschrieben.filter(g => g.p.indexOf('/protokoll') >= 0).length === 0,
    u.geschrieben.map(g => g.p));

console.log('');
console.log('=== DIE WÜRFE STIMMEN MIT DEM REGELWERK ÜBEREIN ===');
u = start(FIGUR);
[1, 3, 5].forEach(function (stufe) {
  u.geschrieben.length = 0;
  const z = { steigerung: 0, erfolg: 0, miss: 0, patzer: 0 };
  const N = 40000;
  for (let i = 0; i < N; i++) {
    u.geschrieben.length = 0;
    u.klick({ dataset: { wert: 'Probe', stufe: String(stufe) } });
    z[u.geschrieben.filter(g => g.p.indexOf('/protokoll') >= 0)[0].v.band]++;
  }
  const c = R.chancen(stufe, {});
  const max = Math.max.apply(null, R.BAENDER.map(k => Math.abs(z[k] / N - c[k])));
  chk(R.DLBL[stufe] + ' weicht um ' + (max * 100).toFixed(2) + 'pp ab', max < 0.008, z);
});

console.log('');
console.log('=== ANFORDERUNG DER SPIELLEITUNG ===');
u = start(FIGUR);
chk('horcht am Figurenschlüssel', !!u.lauscher['figuren/marie/anfrage#value']);
u.lauscher['figuren/marie/anfrage#value']({ val: () => ({ wert: 'Segeln', mod: -4, von: 'SL' }) });
chk('die Bitte erscheint', u.markup().indexOf('bittet um') >= 0);
chk('mit der richtigen Zielzahl', u.markup().indexOf('nötig 8') >= 0, u.markup().slice(0, 300));
u.geschrieben.length = 0;
u.klick({ dataset: { bitte: '1' } });
const p2 = u.geschrieben.filter(g => g.p.indexOf('/protokoll') >= 0)[0];
chk('gewürfelt wurde der angeforderte Wert', p2.v.wert === 'Segeln', p2.v);
chk('gegen die angeforderte Schwelle', p2.v.ziel === 8, p2.v);
chk('die Anfrage wird abgeräumt',
    u.geschrieben.some(g => g.op === 'remove' && g.p === 'figuren/marie/anfrage'),
    u.geschrieben.map(g => g.p + (g.op || '')));

console.log('');
console.log('=== WUNDEN ZIEHEN ZUSÄTZLICH AB ===');
u = start(Object.assign({}, FIGUR, { abzug: 2 }));
u.geschrieben.length = 0;
u.klick({ dataset: { wert: 'Kämpfen', stufe: '3' } });
const p3 = u.geschrieben.filter(g => g.p.indexOf('/protokoll') >= 0)[0];
chk('Zielzahl steigt um die Wunden', p3.v.ziel === 6, p3.v);
chk('die Leiste zeigt den Abzug', u.markup().indexOf('−2') >= 0);

console.log('');
console.log('=== OHNE FIGUR BLEIBEN DIE WÜRFEL ===');
u = start(null);
chk('keine Werteliste', u.markup().indexOf('Attribute') < 0);
chk('aber alle fünf Würfel', [4, 6, 8, 10, 12].every(s => u.markup().indexOf('data-frei="' + s + '"') >= 0));
chk('kein Lauscher ohne Schlüssel', !u.lauscher['figuren/marie/anfrage#value']);

console.log('');
console.log('=== EINGEKLAPPT BLEIBEN DIE WÜRFEL STEHEN ===');
u = start(FIGUR);
u.klick({ dataset: { zu: '1' } });
chk('Werteliste weg', u.markup().indexOf('Attribute') < 0);
chk('Würfel noch da', [4, 6, 8, 10, 12].every(s => u.markup().indexOf('data-frei="' + s + '"') >= 0));
chk('Weg zurück zu den Werten', u.markup().indexOf('data-auf="1"') >= 0);
// Eine offene Bitte muss die Leiste von selbst aufklappen, sonst geht sie unter.
u.lauscher['figuren/marie/anfrage#value']({ val: () => ({ wert: 'Kämpfen', mod: 0 }) });
chk('eine Bitte klappt von selbst auf', u.markup().indexOf('bittet um') >= 0);

console.log('');
console.log('=== PRIVATER WURF DER SPIELLEITUNG ===');
u = start(FIGUR, null, { allowPrivate: true });
chk('Privat-Haken nur dort', u.markup().indexOf('dicePrivate') >= 0);
u.nachId['dicePrivate'] = { checked: true };
u.geschrieben.length = 0;
u.klick({ dataset: { wert: 'Kämpfen', stufe: '3' } });
chk('geht NICHT über die Datenbank', u.geschrieben.length === 0, u.geschrieben.map(g => g.p));
chk('und nicht ins Protokoll', u.geschrieben.filter(g => g.p && g.p.indexOf('/protokoll') >= 0).length === 0);

console.log('');
console.log('OK: ' + (anzahl - f) + '   FEHLER: ' + f);
process.exit(f ? 1 : 0);

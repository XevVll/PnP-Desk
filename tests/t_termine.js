/* ==========================================================
   TERMINE — js/termine.js und die Terminansicht des Regie-Hubs
   ----------------------------------------------------------
   Aufruf:  node tests/t_termine.js

   Die Rechnung liegt seit Oktober 2026 in js/termine.js, weil
   Spieler-Hub UND Regie-Hub sie brauchen. Der wichtigste Test
   hier ist deshalb nicht eine einzelne Zahl, sondern dass die
   Terminansicht der Spielleitung dieselben Fenster findet wie
   die Seite der Spieler - sonst veroeffentlicht die Regie einen
   Termin, den der Spieler-Hub nicht fuer den besten haelt.
   ========================================================== */
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const T = require(path.join(ROOT, 'js/termine.js'));
let ok = 0, bad = 0;
function t(n, c, x) { if (c) ok++; else { bad++; console.log('FEHLER: ' + n + (x ? '  [' + x + ']' : '')); } }

const cfg = T.mitCfg();
const N = T.slotAnzahl(cfg), W = T.fensterSlots(cfg);
const tage = T.tagListe(cfg).map(T.iso);
const morgen = tage[1], spaeter = tage[3];
const voll = '1'.repeat(N);
function mit(bits, tag) {
  return { cfg: cfg, spieler: { a: { name: 'A' } }, verfuegbar: { a: { [tag || morgen]: bits } } };
}

/* ---------- Fenstersuche ---------- */
t('durchgehender Tag ergibt genau ein Fenster', T.besteFenster(mit(voll)).length === 1);
const genau = '0'.repeat(N - W) + '1'.repeat(W);
t('genau passender Block reicht', T.besteFenster(mit(genau)).length === 1);
const kurz = '0'.repeat(N - W + 1) + '1'.repeat(W - 1);
t('ein Slot zu kurz reicht nicht', T.besteFenster(mit(kurz)).length === 0);

/* Eine Luecke bricht ein Fenster - der Kern der ganzen Rechnung. */
const halb = Math.floor(N / 2);
const luecke = voll.slice(0, halb) + '0' + voll.slice(halb + 1);
const erwartetLeer = (halb < W && (N - halb - 1) < W);
t('eine Luecke bricht das Fenster' + (erwartetLeer ? '' : ' (hier passt eine Haelfte noch)'),
  erwartetLeer ? T.besteFenster(mit(luecke)).length === 0
               : T.besteFenster(mit(luecke)).length === 1,
  'N=' + N + ' W=' + W);

/* Fehlende Eintragung zaehlt nicht mit und gilt als "kann nicht". */
const zwei = { cfg: cfg, spieler: { a: { name: 'A' }, b: { name: 'B' } },
               verfuegbar: { a: { [morgen]: voll } } };
const r2 = T.besteFenster(zwei);
t('fehlende Eintragung zaehlt nicht mit', r2.length === 1 && r2[0].wer.length === 1);
t('hatEingetragen trennt Schweigen von Absage',
  T.hatEingetragen(zwei.verfuegbar, 'b') === false && T.hatEingetragen(zwei.verfuegbar, 'a') === true);

/* Mehr Leute schlaegt frueher. */
const vgl = { cfg: cfg, spieler: { a: { name: 'A' }, b: { name: 'B' } },
  verfuegbar: { a: { [morgen]: voll, [spaeter]: voll }, b: { [spaeter]: voll } } };
const rv = T.besteFenster(vgl);
t('mehr Leute schlaegt frueher', rv[0].datum === spaeter && rv[0].wer.length === 2,
  JSON.stringify(rv.map(x => x.datum + ':' + x.wer.length)));
t('je Tag nur ein Fenster', new Set(T.besteFenster(vgl).map(x => x.datum)).size === rv.length);

/* Bitstrings. */
t('kurzer Bitstring wird aufgefuellt', T.holeTag({ a: { [morgen]: '11' } }, 'a', morgen, cfg).length === N);
t('fehlender Tag ist komplett 0', T.holeTag({}, 'a', morgen, cfg) === '0'.repeat(N));
t('zaehle addiert ueber alle Spieler',
  T.zaehle(vgl.spieler, vgl.verfuegbar, spaeter, 0, cfg) === 2);

/* ---------- Klartext-Spannen ---------- */
const sp = T.spannen({ a: { [morgen]: '0011110' + '0'.repeat(Math.max(0, N - 7)) } }, 'a', morgen, cfg);
t('Spannen werden zusammengefasst', sp.length === 1 && sp[0].von === 2 && sp[0].bis === 6,
  JSON.stringify(sp));
t('Spannen-Text ist eine Uhrzeit', T.spannenText(cfg, sp) === '17:00–19:00', T.spannenText(cfg, sp));
t('zwei getrennte Spannen bleiben getrennt',
  T.spannen({ a: { [morgen]: '1100110' + '0'.repeat(Math.max(0, N - 7)) } }, 'a', morgen, cfg).length === 2);
/* Eine Spanne bis zum letzten Slot darf nicht verschluckt werden -
   die Schleife muss ueber das Ende hinauslaufen, sonst fehlt sie. */
const spEnde = T.spannen({ a: { [morgen]: '0'.repeat(N - 2) + '11' } }, 'a', morgen, cfg);
t('Spanne bis Tagesende wird erfasst', spEnde.length === 1 && spEnde[0].bis === N, JSON.stringify(spEnde));
t('Spanne bis Tagesende endet auf bisStunde',
  T.spannenText(cfg, spEnde).endsWith(T.uhr(cfg.bisStunde * 60)), T.spannenText(cfg, spEnde));

/* ---------- Uebersicht fuer die Regie ---------- */
const ub = T.uebersicht(zwei);
t('Uebersicht listet alle Spieler', ub.length === 2);
t('wer nichts eingetragen hat, steht unten',
  ub[0].eingetragen === true && ub[1].eingetragen === false,
  JSON.stringify(ub.map(x => x.name + ':' + x.eingetragen)));
t('Uebersicht nennt die Tage im Klartext', ub[0].tage.length === 1 && !!ub[0].tage[0].text);
/* Vergangene Tage gehoeren nicht in eine Terminsuche. */
const gestern = T.iso(new Date(Date.now() - 36e5 * 24));
const mitGestern = { cfg: cfg, spieler: { a: { name: 'A' } },
                     verfuegbar: { a: { [gestern]: voll, [morgen]: voll } } };
t('vergangene Tage fallen aus dem Plan', T.spielerPlan(mitGestern, 'a').length === 1,
  JSON.stringify(T.spielerPlan(mitGestern, 'a').map(x => x.datum)));

/* ---------- ausKnoten / cfg ---------- */
t('ausKnoten ueberlebt null',
  (() => { try { const s = T.ausKnoten(null); return !!s.cfg && !!s.spieler && s.gewaehlt === null; } catch (e) { return false; } })());
t('ausKnoten nimmt echte Werte', T.ausKnoten({ config: { dauerMin: 120 } }).cfg.dauerMin === 120);
t('bisStunde unter vonStunde wird korrigiert', T.mitCfg({ vonStunde: 20, bisStunde: 2 }).bisStunde > 20);
t('Unsinn faellt auf die Vorgabe zurueck', T.mitCfg({ tage: 'abc' }).tage === T.STD_CFG.tage);

/* ==========================================================
   DIE BEIDEN SEITEN
   ========================================================== */
function inlineCode(datei) {
  const html = fs.readFileSync(path.join(ROOT, datei), 'utf8');
  const out = []; const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m; while ((m = re.exec(html))) out.push(m[1]);
  return out.join('\n');
}
function roh(datei) { return fs.readFileSync(path.join(ROOT, datei), 'utf8'); }

/* Beide Seiten laden den gemeinsamen Kern, und zwar VOR dem Block,
   der ihn benutzt - sonst ist TERMINE beim Auswerten nicht da. */
['index.html', 'regie_hub.html'].forEach(function (f) {
  const h = roh(f);
  const iSrc = h.indexOf('src="js/termine.js"');
  t(f + ' haengt js/termine.js ein', iSrc > 0);
  const iNutzung = h.indexOf('TERMINE.', iSrc > 0 ? iSrc : 0);
  t(f + ': der Kern steht vor seiner ersten Nutzung', iSrc > 0 && iSrc < iNutzung,
    'src=' + iSrc + ' nutzung=' + iNutzung);
});

/* Keine zweite Fassung der Rechnung: die alten Innereien duerfen
   in keiner Seite mehr stehen. */
['index.html', 'regie_hub.html'].forEach(function (f) {
  const c = inlineCode(f);
  const reste = ['proTag', 'gefiltert.slice'].filter(r => c.indexOf(r) >= 0);
  t(f + ' rechnet die Fenster nicht selbst', reste.length === 0, reste.join(','));
});

/* Der Regie-Hub schreibt den Termin genau dorthin, wo der
   Spieler-Hub ihn liest. Laufen die Pfade auseinander, setzt die
   Spielleitung einen Termin, den niemand sieht. */
const hubC = inlineCode('regie_hub.html');
t('Regie-Hub schreibt nach stand/termine/gewaehlt',
  hubC.indexOf("'sitzungen/' + id + '/stand/termine/gewaehlt'") > 0);
const spielerC = inlineCode('index.html');
t('Spieler-Hub liest termine/gewaehlt', spielerC.indexOf("'termine/gewaehlt'") > 0);
t('Spieler-Hub laeuft dabei ueber die Sitzungs-Huelle',
  spielerC.indexOf("db.ref('termine/gewaehlt')") > 0);
/* Die Huelle stellt sitzungen/{sid}/stand/ voran - beide Pfade
   zeigen damit auf denselben Knoten. */
const sitzC = fs.readFileSync(path.join(ROOT, 'js/sitzung.js'), 'utf8');
t('die Huelle kennt den Pfad termine', /'termine'/.test(sitzC));
t('die Huelle praefixt mit stand/', sitzC.indexOf('/stand/') > 0);

/* ---------- Die Regie-Ansicht wirklich ausfuehren ---------- */
function ladeHubAnsicht() {
  const c = inlineCode('regie_hub.html');
  function schneide(name) {
    const i = c.indexOf('function ' + name + '(');
    if (i < 0) throw new Error('fehlt: ' + name);
    let j = c.indexOf('{', i), tief = 0;
    for (let k = j; k < c.length; k++) {
      if (c[k] === '{') tief++;
      else if (c[k] === '}') { tief--; if (tief === 0) return c.slice(i, k + 1); }
    }
    throw new Error('Klammern: ' + name);
  }
  const ctx = {
    console, Date, Math, JSON, Object, String, Array, TERMINE: T,
    sitzungen: {}, termineOffen: {}, tagOffen: {},
    zeichneSitzungen() {}, meld() {},
    db: { ref() { return { set() { return Promise.resolve(); } }; } }
  };
  vm.createContext(ctx);
  const code = [
    schneide('esc'), schneide('terminStand'), schneide('terminGesetztText'),
    schneide('zeichneTermine'), schneide('termineUmschalten'), schneide('terminSetzen')
  ].join('\n');
  new vm.Script(code, { filename: 'regie_hub.html:termine' }).runInContext(ctx);
  return ctx;
}
const H = ladeHubAnsicht();
t('Terminansicht des Hubs ist ausfuehrbar', typeof H.zeichneTermine === 'function');

/* Eine Sitzung mit echten Daten durchschicken. */
H.sitzungen = { s1: { stand: { termine: {
  config: { vonStunde: 16, bisStunde: 24, tage: 14, dauerMin: 210 },
  spieler: { a: { name: 'Anna' }, b: { name: 'Bert' }, c: { name: 'Clara' } },
  verfuegbar: { a: { [morgen]: voll }, b: { [morgen]: voll } }
} } } };
let html1 = H.zeichneTermine('s1');
t('zugeklappt nennt die Ansicht keine Namen',
  html1.indexOf('Anna') < 0 && html1.indexOf('Zeiten zeigen') > 0);
H.termineOffen = { s1: true };
let html2 = H.zeichneTermine('s1');
t('aufgeklappt stehen alle drei Spieler da',
  ['Anna', 'Bert', 'Clara'].every(n => html2.indexOf(n) >= 0));
t('der Zaehler nennt 2 von 3', html2.indexOf('2/3') > 0);
t('wer nichts eingetragen hat, wird benannt', html2.indexOf('nichts eingetragen') > 0);
t('die Uhrzeit steht im Klartext', html2.indexOf('16:00') > 0 || html2.indexOf('–') > 0);
t('ein Fenster ist veroeffentlichbar', html2.indexOf('veröffentlichen') > 0);
t('kein Termin gesetzt wird gesagt', html2.indexOf('noch kein Termin veröffentlicht') > 0);

/* Mit gesetztem Termin. */
const best = T.besteFenster(T.ausKnoten(H.sitzungen.s1.stand.termine))[0];
H.sitzungen.s1.stand.termine.gewaehlt = { datum: best.datum, slot: best.slot };
let html3 = H.zeichneTermine('s1');
t('gesetzter Termin erscheint im Kopf', html3.indexOf('▶') > 0);
t('gesetzter Termin ist zurueckzunehmen', html3.indexOf('zurücknehmen') > 0);

/* Leere Sitzung bricht nicht. */
H.sitzungen.leer = {};
H.termineOffen.leer = true;
t('Sitzung ohne Termine bricht nicht',
  (() => { try { const x = H.zeichneTermine('leer'); return x.indexOf('Noch kein Spieler') > 0; }
           catch (e) { console.log('  ' + e.message); return false; } })());
/* Eine Sitzung, die es gar nicht gibt. */
t('unbekannte Sitzung bricht nicht',
  (() => { try { H.zeichneTermine('gibtesnicht'); return true; } catch (e) { return false; } })());
/* Kaputte Daten aus der Datenbank. */
H.sitzungen.muell = { stand: { termine: { spieler: 'kaputt', verfuegbar: 7 } } };
H.termineOffen.muell = true;
t('kaputte Daten brechen die Ansicht nicht',
  (() => { try { H.zeichneTermine('muell'); return true; } catch (e) { console.log('  ' + e.message); return false; } })());

/* Namen werden maskiert - sie kommen von Spielern. */
H.sitzungen.xss = { stand: { termine: {
  spieler: { a: { name: '<img src=x onerror=boom>' } },
  verfuegbar: { a: { [morgen]: voll } } } } };
H.termineOffen.xss = true;
const hx = H.zeichneTermine('xss');
t('Spielernamen werden maskiert', hx.indexOf('<img') < 0 && hx.indexOf('&lt;img') >= 0);

/* Dieselben Fenster wie beim Spieler-Hub - der tragende Test. */
let seed = 4711;
function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
let faelle = 0, abw = 0;
for (let runde = 0; runde < 40; runde++) {
  const nS = 1 + Math.floor(rnd() * 6);
  const knoten = { config: { vonStunde: 16, bisStunde: 24, tage: 14, dauerMin: 210 },
                   spieler: {}, verfuegbar: {} };
  for (let i = 0; i < nS; i++) {
    const pid = 'p' + i;
    knoten.spieler[pid] = { name: 'S' + i };
    knoten.verfuegbar[pid] = {};
    tage.forEach(d => {
      if (rnd() < 0.4) return;
      let bits = '', an = rnd() < 0.5;
      for (let k = 0; k < N; k++) { if (rnd() < 0.18) an = !an; bits += an ? '1' : '0'; }
      knoten.verfuegbar[pid][d] = bits;
    });
  }
  // Die Regie rechnet ueber ausKnoten, der Spieler-Hub ueber seinen
  // eigenen Zustand - beides muss dasselbe ergeben.
  const vonRegie = T.besteFenster(T.ausKnoten(knoten));
  const vonSpieler = T.besteFenster({ cfg: T.mitCfg(knoten.config),
    spieler: knoten.spieler, verfuegbar: knoten.verfuegbar });
  faelle++;
  if (JSON.stringify(vonRegie) !== JSON.stringify(vonSpieler)) abw++;
}
t('Regie und Spieler-Hub finden in allen ' + faelle + ' Faellen dieselben Fenster',
  abw === 0, 'Abweichungen=' + abw);

/* ==========================================================
   WER DARF DEN TERMIN FESTLEGEN
   ----------------------------------------------------------
   Nur die Regie. Vorher konnte JEDER Spieler den Termin der
   ganzen Gruppe setzen und wieder umwerfen, und zwar still -
   der Schreibzugriff ging direkt nach termine/gewaehlt, und
   die einzige Spur war ein "von <Name>" daneben.
   ========================================================== */
const spC = inlineCode('index.html');

/* Kein Schreibzugriff des Spielers auf den gesetzten Termin. */
function schreibtAuf(code, pfad) {
  // ohne Regex: Vorkommen von ref('<pfad>') suchen und danach auf
  // einen schreibenden Aufruf pruefen
  const marke = "ref('" + pfad + "')";
  let p = 0;
  while ((p = code.indexOf(marke, p)) >= 0) {
    const rest = code.slice(p + marke.length, p + marke.length + 12);
    if (rest.indexOf('.set(') === 0 || rest.indexOf('.update(') === 0 ||
        rest.indexOf('.remove(') === 0) return true;
    p += marke.length;
  }
  return false;
}
t('Spieler-Hub schreibt NICHT auf termine/gewaehlt',
  schreibtAuf(spC, 'termine/gewaehlt') === false);
t('waehle() ist aus dem Spieler-Hub verschwunden', spC.indexOf('function waehle(') < 0);
t('kein festlegen-Knopf mehr im Spieler-Hub', spC.indexOf('onclick="waehle(') < 0);
t('kein waehle-Aufruf ausserhalb des erklaerenden Kommentars',
  spC.split('waehle(').length - 1 === 1 && spC.indexOf('/* waehle()') > 0,
  'Vorkommen=' + (spC.split('waehle(').length - 1));

/* Lesen muss er weiterhin - sonst sieht er den Termin nicht. */
t('Spieler-Hub LIEST termine/gewaehlt weiter', spC.indexOf("db.ref('termine/gewaehlt').on") > 0);
t('Spieler-Hub zeigt den Termin an', spC.indexOf('function renderChosen(') > 0);
t('Spieler-Hub sagt, wer festlegt',
  spC.indexOf('legt die Spielleitung fest') > 0 && spC.indexOf('von der Spielleitung festgelegt') > 0);
t('das gesetzte Fenster ist in der Liste markiert', spC.indexOf('gesetzt') > 0);

/* ==========================================================
   EIN SPIELER AENDERT NUR SEINE EIGENEN ZEITEN
   ----------------------------------------------------------
   Hendriks Regel, und sie gilt hier als GANZES, nicht als
   Einzelfall: JEDER schreibende Zugriff des Spieler-Hubs auf
   termine/... muss unter seiner eigenen Kennung liegen.

   Die Einstellung (termine/config) war die letzte Ausnahme -
   angezeigter Zeitraum und Fensterdauer galten fuer die ganze
   Sitzung und waren fuer jeden aenderbar. Das ist keine eigene
   Zeit, und die Dauer entscheidet mit, welche Fenster die
   Regie zum Veroeffentlichen vorgelegt bekommt. Liegt jetzt
   ebenfalls bei der Spielleitung.
   ========================================================== */
const schreibStellen = [];
(function () {
  const marke = "db.ref('termine/";
  let p = 0;
  while ((p = spC.indexOf(marke, p)) >= 0) {
    const zeilenEnde = spC.indexOf(';', p);
    const ausdruck = spC.slice(p, zeilenEnde < 0 ? p + 200 : zeilenEnde);
    if (ausdruck.indexOf('.set(') > 0 || ausdruck.indexOf('.update(') > 0 ||
        ausdruck.indexOf('.remove(') > 0) {
      schreibStellen.push(ausdruck.split(')')[0] + ')');
    }
    p += marke.length;
  }
})();
t('der Spieler-Hub schreibt ueberhaupt noch etwas', schreibStellen.length > 0,
  'gefunden=' + schreibStellen.length);
/* Kein Schreibzugriff darf die Browser-Kennung benutzen. Wo der
   Schluessel ueber eine lokale Variable laeuft, wird zusaetzlich
   geprueft, dass diese aus meinKey() stammt - sonst waere die Regel
   per Umbenennung aushebelbar. */
const mitPid = schreibStellen.filter(function (a) { return a.indexOf('meinePid') >= 0; });
t('KEIN Schreibzugriff laeuft noch ueber die Browser-Kennung',
  mitPid.length === 0, mitPid.join(' | '));
const ueberVariable = schreibStellen.filter(function (a) {
  return a.indexOf('meinKey()') < 0;
});
ueberVariable.forEach(function (a) {
  const v = (a.match(/\+ ([A-Za-z_][A-Za-z0-9_]*)/) || [])[1];
  t('der Schluessel "' + v + '" stammt aus meinKey()',
    !!v && spC.indexOf('const ' + v + ' = meinKey();') > 0, a);
});

/* ==========================================================
   NAME STATT BROWSER-KENNUNG
   ----------------------------------------------------------
   Hendriks Meldung vom 12.10.: Nach einer erneuten Anmeldung im
   abgesicherten Modus stand "Peter" ZWEIMAL in der Liste -
   einmal mit Zeiten, einmal als "nichts eingetragen". Ursache
   war der Schluessel: pnp_player_id entsteht je Browser neu.

   Jetzt haengt alles am Namen, wie die Figuren auch. Hendriks
   Entscheidung dazu ausdruecklich: Wer denselben Namen eintippt,
   kommt an dieselben Sachen - "P&P Runden sind ja lokal und da
   brauchen wir solchen Schutz nicht".
   ========================================================== */
t('es gibt einen Namensschluessel', spC.indexOf('function meinKey()') > 0);
t('er kommt aus spielerKennung', spC.indexOf('return spielerKennung(meinName)') > 0);
t('die Browser-Kennung ist kein Schluessel mehr',
  spC.indexOf("'termine/spieler/' + meinePid") < 0 &&
  spC.indexOf("'termine/verfuegbar/' + meinePid") < 0);
t('auch beim Malen nicht', spC.indexOf('verfuegbar[meinePid]') < 0);
t('ohne Namen wird nichts geschrieben',
  spC.indexOf('if (!k) return;') > 0);

/* Der Umzug alter Eintraege. */
t('es gibt einen Umzug', spC.indexOf('function umzugAlterEintraege(') > 0);
(function () {
  const i = spC.indexOf('function umzugAlterEintraege(');
  let j = spC.indexOf('{', i), tief = 0, ende = -1;
  for (let k = j; k < spC.length; k++) {
    if (spC[k] === '{') tief++;
    else if (spC[k] === '}') { tief--; if (tief === 0) { ende = k; break; } }
  }
  const koerper = spC.slice(i, ende);
  t('ein Alteintrag wird am Namen erkannt, nicht am Format der Kennung',
    koerper.indexOf("spielerKennung(e.name || '') === ziel") > 0);
  t('der eigene Eintrag wird dabei nicht angefasst', koerper.indexOf('k !== ziel') > 0);
  t('zusammengefuehrt wird tagweise', koerper.indexOf('meins[tag] === undefined') > 0);
  const iSetzen = koerper.indexOf("set(meins)");
  const iLoeschen = koerper.indexOf("= null;");
  t('erst zusammenfuehren, dann loeschen',
    iSetzen > 0 && iLoeschen > 0 && iSetzen < iLoeschen,
    'setzen=' + iSetzen + ' loeschen=' + iLoeschen);
  t('ohne Namen passiert nichts', koerper.indexOf('if (!db || !ziel)') > 0);
})();
t('der Umzug laeuft beim Anmelden', (function () {
  const i = spC.indexOf('function anmeldenBeiDb(');
  const j = spC.indexOf('function ', i + 30);
  const koerper = spC.slice(i, j);
  return koerper.indexOf('umzugAlterEintraege()') > 0 &&
         koerper.indexOf('umzugAlterEintraege()') < koerper.indexOf("'termine/spieler/'");
})());

t('cfgAendern() ist aus dem Spieler-Hub verschwunden', spC.indexOf('function cfgAendern(') < 0);
t('Spieler-Hub schreibt NICHT auf termine/config', schreibtAuf(spC, 'termine/config') === false);
t('Spieler-Hub ZEIGT die Einstellung weiter an', spC.indexOf('cfgZeig') > 0);
t('keine Auswahlfelder fuer die Einstellung mehr',
  spC.indexOf('cfgVon') < 0 && spC.indexOf('cfgBis') < 0 && spC.indexOf('cfgDauer') < 0);

/* Die Regie stellt es jetzt ein - je Sitzung. */
t('Regie-Hub stellt das Raster ein', hubC.indexOf('function cfgSetzen(') > 0);
t('Regie-Hub schreibt nach stand/termine/config',
  hubC.indexOf("'sitzungen/' + id + '/stand/termine/config'") > 0);

/* Was der Spieler schreibt, gehoert ihm: Name und eigene Zeiten. */
t('Spieler schreibt seinen eigenen Namen',
  spC.indexOf("db.ref('termine/spieler/' + meinKey()).set(") > 0);
t('Spieler schreibt seine eigenen Zeiten',
  spC.indexOf("db.ref('termine/verfuegbar/' + k + '/' + datum).set(bits)") > 0);

/* Die Regie schreibt, und zwar in die Sitzung. */
t('Regie-Hub setzt den Termin', hubC.indexOf('function terminSetzen(') > 0);
t('Regie-Hub kann ihn auch zuruecknehmen', hubC.indexOf('zur') > 0 && hubC.indexOf('cknehmen') > 0);

/* ==========================================================
   BLAETTERN UND UNBEGRENZTER HORIZONT
   ----------------------------------------------------------
   Der gefaehrliche Fehler beim Blaettern ist nicht die Anzeige,
   sondern die Suche: Blaettert ein Spieler vier Wochen vor und
   traegt dort ein, wird es gespeichert - und war vorher NIE
   gefunden worden, weil besteFenster() nur die ersten
   cfg.tage Tage ansah. Genau das pruefen die naechsten Faelle.
   ========================================================== */
function tagInTagen(n) {
  const d = T.heute0(); d.setDate(d.getDate() + n); return T.iso(d);
}

/* Seitenweise blaettern. */
const s0 = T.tagListe(cfg, null, 0).map(T.iso);
const s14 = T.tagListe(cfg, null, 14).map(T.iso);
const s28 = T.tagListe(cfg, null, 28).map(T.iso);
t('eine Seite umfasst cfg.tage Tage', s0.length === cfg.tage);
t('Seite 2 beginnt, wo Seite 1 endet', s14[0] === tagInTagen(14));
t('Seiten ueberschneiden sich nicht', s0.indexOf(s14[0]) < 0 && s14.indexOf(s28[0]) < 0);
t('Versatz 0 beginnt heute', s0[0] === tagInTagen(0));
t('negativer Versatz wird auf heute geklemmt',
  T.tagListe(cfg, null, -70).map(T.iso)[0] === tagInTagen(0));
t('sehr weiter Versatz funktioniert',
  T.tagListe(cfg, null, 3650).map(T.iso)[0] === tagInTagen(3650));

/* Der tragende Fall: Eintrag weit vorn wird gefunden. */
const weit = tagInTagen(30);
const stWeit = { cfg: cfg, spieler: { a: { name: 'A' } }, verfuegbar: { a: { [weit]: voll } } };
const rWeit = T.besteFenster(stWeit);
t('ein Eintrag 30 Tage vorn wird GEFUNDEN', rWeit.length === 1 && rWeit[0].datum === weit,
  JSON.stringify(rWeit.map(x => x.datum)));
const sehrWeit = tagInTagen(400);
const rSehr = T.besteFenster({ cfg: cfg, spieler: { a: { name: 'A' } },
  verfuegbar: { a: { [sehrWeit]: voll } } });
t('auch 400 Tage vorn wird gefunden', rSehr.length === 1 && rSehr[0].datum === sehrWeit);
t('der Horizont haengt NICHT an cfg.tage',
  T.besteFenster({ cfg: T.mitCfg({ tage: 1 }), spieler: { a: { name: 'A' } },
    verfuegbar: { a: { [weit]: voll } } }).length === 1);

/* Vergangenes bleibt draussen. */
const gestern2 = tagInTagen(-1);
t('ein Eintrag von gestern ergibt kein Fenster',
  T.besteFenster({ cfg: cfg, spieler: { a: { name: 'A' } },
    verfuegbar: { a: { [gestern2]: voll } } }).length === 0);
t('datenTage laesst Vergangenes weg',
  T.datenTage({ spieler: { a: {} }, verfuegbar: { a: { [gestern2]: voll, [weit]: voll } } })
    .join(',') === weit);

/* datenTage: nur Tage mit echter Eintragung, sortiert, ohne Dubletten. */
const dt = T.datenTage({ spieler: { a: {}, b: {} }, verfuegbar: {
  a: { [tagInTagen(5)]: voll, [tagInTagen(2)]: '0'.repeat(N) },
  b: { [tagInTagen(5)]: voll, [tagInTagen(9)]: voll } } });
t('datenTage ist sortiert und ohne Dubletten',
  dt.join(',') === [tagInTagen(5), tagInTagen(9)].join(','), dt.join(','));
t('ein Tag ohne eine einzige 1 zaehlt nicht', dt.indexOf(tagInTagen(2)) < 0);
t('datenTage ignoriert Spieler, die nicht in der Sitzung sind',
  T.datenTage({ spieler: {}, verfuegbar: { x: { [weit]: voll } } }).length === 0);

/* Die Regie sieht ebenfalls, was weiter vorn liegt. */
const planWeit = T.spielerPlan({ cfg: cfg, spieler: { a: { name: 'A' } },
  verfuegbar: { a: { [weit]: voll, [tagInTagen(200)]: voll } } }, 'a');
t('spielerPlan reicht ueber cfg.tage hinaus', planWeit.length === 2,
  JSON.stringify(planWeit.map(x => x.datum)));
const ubWeit = T.uebersicht({ cfg: cfg, spieler: { a: { name: 'A' } },
  verfuegbar: { a: { [weit]: voll } } });
t('die Regie-Uebersicht zeigt Zeiten weit vorn',
  ubWeit[0].eingetragen === true && ubWeit[0].tage.length === 1);

/* Der Spieler-Hub: Knoepfe da, Versatz nur Ansicht. */
t('Spieler-Hub hat Blaetter-Knoepfe',
  spC.indexOf('function blaettern(') > 0 && spC.indexOf('function blaetternHeute(') > 0);
t('Blaettern ist auf heute abgeriegelt', spC.indexOf('Math.max(0, versatz') > 0);
t('Schrittweite sind zwei Wochen', spC.indexOf('SEITE_TAGE = 14') > 0);
t('der Versatz geht NICHT in die Datenbank',
  schreibtAuf(spC, 'termine/config') === false && spC.indexOf("versatz)") > 0);
t('die Rasteranzeige benutzt den Versatz',
  spC.indexOf('TERMINE.tagListe(cfg, null, versatz)') > 0);
/* Und die Suche benutzt ihn NICHT - sonst waere sie wieder begrenzt. */
t('besteFenster wird ohne Versatz aufgerufen',
  spC.indexOf('TERMINE.besteFenster({ cfg: cfg, spieler: spieler, verfuegbar: verfuegbar })') > 0);

/* ==========================================================
   ALLE ZEITEN EINES TAGES
   ----------------------------------------------------------
   Hendriks Meldung vom 12.10.: "Ich kann nur eine Zeit am Tag
   wählen. Auch wenn von 18 Uhr zb verfügbar ist."

   Je Tag nur das beste Fenster zu zeigen ist fuer die Uebersicht
   richtig - es nimmt der Spielleitung aber die Wahl. Wenn jemand
   von 17 bis 23 Uhr kann, ist 19:00-22:30 nur EIN Schnitt daraus.
   ========================================================== */
(function () {
  const tag = T.iso(T.tagListe(cfg)[1]);
  function bitsVon(von, bis) {
    let b = '';
    for (let i = 0; i < N; i++) b += (i >= von && i < bis) ? '1' : '0';
    return b;
  }
  // Peter 17:00-23:00 (Slot 2..13), SL 17:30-21:30 (Slot 3..10), von = 16:00
  const st = { cfg: cfg, spieler: { peter: { name: 'Peter' }, sl: { name: 'SL' } },
    verfuegbar: { peter: { [tag]: bitsVon(2, 14) }, sl: { [tag]: bitsVon(3, 11) } } };

  const alle = T.fensterAmTag(st, tag);
  t('ein Tag liefert mehrere Anfangszeiten', alle.length > 1, 'n=' + alle.length);
  t('sie sind nach Uhrzeit sortiert',
    alle.every(function (x, i) { return i === 0 || alle[i - 1].slot < x.slot; }),
    alle.map(x => x.slot).join(','));
  t('alle gehoeren zu diesem Tag', alle.every(function (x) { return x.datum === tag; }));
  t('jedes Fenster hat mindestens einen, der kann',
    alle.every(function (x) { return x.wer.length > 0; }));

  /* Das beste Fenster des Tages muss in der Liste vorkommen - sonst
     koennte man den Vorschlag von oben unten nicht wiederfinden. */
  const best = T.besteFenster(st).filter(function (x) { return x.datum === tag; })[0];
  t('das beste Fenster steht auch in der Tagesliste',
    !!best && alle.some(function (x) { return x.slot === best.slot; }),
    best && T.fensterUhrzeit(cfg, best));
  t('kein Fenster der Tagesliste ist besser als das beste',
    alle.every(function (x) { return x.wer.length <= best.wer.length; }));

  /* Der konkrete Fall aus Hendriks Meldung: 18:00 muss waehlbar sein. */
  const umAcht = alle.filter(function (x) { return T.slotZeit(cfg, x.slot) === '18:00'; })[0];
  t('18:00 ist als Anfangszeit waehlbar', !!umAcht,
    alle.map(function (x) { return T.slotZeit(cfg, x.slot); }).join(' '));
  t('und sagt richtig, wer dann kann', !!umAcht && umAcht.wer.length === 2,
    umAcht && umAcht.wer.join(','));
  /* Eine Zeit, zu der nur einer kann, faellt nicht unter den Tisch. */
  const umHalbSieben = alle.filter(function (x) { return T.slotZeit(cfg, x.slot) === '19:30'; })[0];
  t('auch eine Zeit mit nur einem erscheint', !!umHalbSieben && umHalbSieben.wer.length === 1,
    umHalbSieben && umHalbSieben.wer.join(','));

  /* Grenzen. */
  t('ein Tag ohne Eintrag ergibt nichts',
    T.fensterAmTag(st, T.iso(T.tagListe(cfg)[5])).length === 0);
  const gestern = T.iso(new Date(Date.now() - 36e5 * 24));
  t('ein vergangener Tag ergibt nichts', T.fensterAmTag(st, gestern).length === 0);
  t('ohne Spieler ergibt nichts',
    T.fensterAmTag({ cfg: cfg, spieler: {}, verfuegbar: {} }, tag).length === 0);
  /* Ist die Sitzung laenger als der angezeigte Zeitraum, gibt es nichts. */
  t('ein zu langes Fenster ergibt nichts',
    T.fensterAmTag({ cfg: T.mitCfg({ dauerMin: 24 * 60 }), spieler: st.spieler,
      verfuegbar: st.verfuegbar }, tag).length === 0);

  /* ---- Die Regie-Ansicht zeigt sie ---- */
  H.sitzungen = { tagtest: { stand: { termine: {
    config: { vonStunde: 16, bisStunde: 24, tage: 14, dauerMin: 210 },
    spieler: st.spieler, verfuegbar: st.verfuegbar } } } };
  H.termineOffen = { tagtest: true };
  H.tagOffen = {};
  const zu = H.zeichneTermine('tagtest');
  t('zugeklappt wird auf die anderen Zeiten hingewiesen',
    zu.indexOf('t-mehr') > 0 && zu.indexOf('andere Zeit') > 0);
  t('zugeklappt stehen sie noch nicht da', zu.indexOf('t-tagz') < 0);

  H.tagOffen = { ['tagtest|' + tag]: true };
  const auf = H.zeichneTermine('tagtest');
  t('aufgeklappt stehen alle Anfangszeiten da',
    (auf.match(/t-tagz/g) || []).length === alle.length,
    (auf.match(/t-tagz/g) || []).length + ' statt ' + alle.length);
  t('jede ist veroeffentlichbar',
    (auf.match(/terminSetzen\(/g) || []).length >= alle.length);
  t('18:00 steht in der aufgeklappten Liste', auf.indexOf('18:00') > 0);
  t('das gerade gezeigte Fenster ist markiert', auf.indexOf('dies') > 0);
  t('aufgeklappt gibt es ein "weniger"', auf.indexOf('weniger') > 0);

  /* Ein Tag mit nur einer moeglichen Zeit braucht keinen Umschalter. */
  const einTag = T.iso(T.tagListe(cfg)[2]);
  H.sitzungen.eins = { stand: { termine: {
    config: { vonStunde: 16, bisStunde: 24, tage: 14, dauerMin: 210 },
    spieler: { peter: { name: 'Peter' } },
    verfuegbar: { peter: { [einTag]: bitsVon(0, 7) } } } } };
  H.termineOffen = { eins: true };
  const nurEins = H.zeichneTermine('eins');
  // Auf den KNOPF pruefen, nicht auf den Wortlaut: Der Schlusshinweis
  // der Ansicht nennt "andere Zeiten" ebenfalls.
  t('bei nur einer moeglichen Zeit kein Umschalter',
    nurEins.indexOf('t-mehr') < 0, nurEins.indexOf('t-mehr'));
})();

console.log('\nOK: ' + ok + '   FEHLER: ' + bad);
process.exit(bad ? 1 : 0);

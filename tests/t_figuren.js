/* ==========================================================
   FIGUREN — Name + Sitzung IST der Schluessel
   ----------------------------------------------------------
   Aufruf:  node tests/t_figuren.js

   Eine Figur liegt unter
       sitzungen/{sid}/stand/figuren/{spielerKennung(name)}

   "Hoechstens eine Figur je Spieler und Sitzung" ist damit
   keine Regel mehr, die der Code einhalten muss, sondern eine
   Eigenschaft des Pfades: An derselben Stelle kann keine
   zweite liegen. Vorher war der Schluessel ein Zufallscode und
   die Zuordnung zum Menschen hing am localStorage - auf einem
   zweiten Geraet entstand still eine zweite Figur.

   Entscheidend fuer diese Pruefungen: Der Name kommt aus der
   ANMELDUNG (js/identitaet.js), nicht aus dem editierbaren
   Feld "Spieler" im Assistenten. Ein Tippfehler dort wuerde
   sonst genau die zweite Figur erzeugen.
   ========================================================== */
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
let ok = 0, bad = 0;
function t(n, c, x) { if (c) ok++; else { bad++; console.log('FEHLER: ' + n + (x ? '  [' + x + ']' : '')); } }

const S = require(path.join(ROOT, 'js/sitzung.js'));

/* ---------- Der Schluessel ---------- */
t('Schluessel aus dem Namen', S.figurSchluessel('Anna') === 'anna', S.figurSchluessel('Anna'));
t('Schreibweise aendert den Schluessel nicht',
  S.figurSchluessel('Anna') === S.figurSchluessel('  ANNA  '),
  S.figurSchluessel('  ANNA  '));
t('Umlaute werden umgeschrieben', S.figurSchluessel('Jörg') === 'joerg', S.figurSchluessel('Jörg'));
t('zwei Leute, zwei Schluessel', S.figurSchluessel('Anna') !== S.figurSchluessel('Bert'));
t('ohne Namen KEIN Schluessel',
  S.figurSchluessel('') === '' && S.figurSchluessel(null) === '' && S.figurSchluessel('   ') === '');
t('Sonderzeichen ergeben keinen leeren Pfadteil mit Schraegstrich',
  S.figurSchluessel('a/b.c#d').indexOf('/') < 0 && S.figurSchluessel('a/b.c#d').indexOf('.') < 0,
  S.figurSchluessel('a/b.c#d'));
t('der Schluessel ist derselbe wie der des Spielereintrags',
  S.figurSchluessel('Anna') === S.spielerKennung('Anna'));

/* Der harte Punkt: derselbe Name ergibt IMMER denselben Pfad.
   Damit ist eine zweite Figur strukturell unmoeglich. */
(function () {
  const varianten = ['Anna', 'anna', 'ANNA', ' Anna ', 'AnNa'];
  const schluessel = varianten.map(S.figurSchluessel);
  const einer = schluessel.every(function (k) { return k === schluessel[0]; });
  t('alle Schreibweisen desselben Namens treffen denselben Pfad', einer, schluessel.join(','));
})();

/* ---------- Alte Zufallscodes erkennen ---------- */
t('ein Zufallscode wird als alt erkannt', S.istAltSchluessel('K7M3QP') === true);
t('ein Name wird NICHT als alt erkannt', S.istAltSchluessel('anna') === false);
t('ein langer Name wird nicht als alt erkannt', S.istAltSchluessel('anna-maria') === false);
t('ein Name mit Bindestrich in Codelaenge gilt nicht als Code',
  S.istAltSchluessel('an-na') === false);
t('Kleinbuchstaben sind kein Code (Codes sind gross)',
  S.istAltSchluessel('k7m3qp') === false);
t('leer ist kein Code', S.istAltSchluessel('') === false && S.istAltSchluessel(null) === false);
/* Ein sechsbuchstabiger Name, der zufaellig nur Code-Zeichen enthaelt,
   wird faelschlich als Code gelesen. Das ist bekannt und harmlos: Die
   Folge ist nur, dass die Regie ihn zum Zuordnen anbietet. */
t('bekannte Unschaerfe: ein Name wie "mark" bleibt unauffaellig',
  S.istAltSchluessel('mark') === false);

/* ==========================================================
   DER ASSISTENT
   ========================================================== */
function inlineCode(datei) {
  const html = fs.readFileSync(path.join(ROOT, datei), 'utf8');
  const out = []; const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m; while ((m = re.exec(html))) out.push(m[1]);
  return out.join('\n');
}
const aC = inlineCode('charaktererstellung.html');

t('der Assistent nimmt den Anmeldenamen als Schluessel',
  aC.indexOf('figurSchluessel(spielerName())') > 0);
t('er erzeugt KEINE Zufallscodes mehr', aC.indexOf('freienFigurCode(') < 0);
t('es gibt kein besitzer-Feld mehr (der Pfad sagt es)',
  aC.indexOf('besitzer:') < 0);

/* Das Feld "Spieler" darf den Schluessel nicht bestimmen. */
(function () {
  // Das Feld steht im Markup, nicht im Inline-Skript - aC traegt nur das Skript.
  const roh = fs.readFileSync(path.join(ROOT, 'charaktererstellung.html'), 'utf8');
  const i = roh.indexOf('id="fSpieler"');
  t('das Spieler-Feld existiert', i > 0);
  const feld = roh.slice(i, roh.indexOf('>', i));
  t('das Spieler-Feld ist nicht mehr tippbar', feld.indexOf('readonly') > 0, feld.replace(/\s+/g, ' '));
  t('es hat kein oninput mehr', feld.indexOf('oninput') < 0, feld.replace(/\s+/g, ' '));
})();
t('setName liest den Spielernamen NICHT aus dem Feld',
  aC.indexOf("META.spieler = document.getElementById('fSpieler').value") < 0);
t('META.spieler kommt aus der Anmeldung', aC.indexOf('META.spieler = spielerName()') > 0);

/* Ohne Namen kein Schreibzugriff. */
t('ohne Anmeldenamen sperrt der Assistent',
  aC.indexOf('if (!figurSchluessel(spielerName()))') > 0);
(function () {
  const i = aC.indexOf('if (!figurSchluessel(spielerName()))');
  const j = aC.indexOf('firebase.initializeApp');
  t('die Namenssperre steht VOR initializeApp', i > 0 && j > 0 && i < j, 'sperre=' + i + ' init=' + j);
})();

/* Kein Schreibzugriff, bevor gelesen ist. */
t('es gibt eine Startsperre', aC.indexOf('let startBereit = false') > 0);
t('nachFirebase schreibt nicht vor der Uebernahme', aC.indexOf('if (!startBereit) return;') > 0);
(function () {
  const i = aC.indexOf('if (!startBereit) return;');
  const j = aC.indexOf("db.ref('figuren/' + code).update(");
  t('die Sperre steht VOR dem Schreibzugriff', i > 0 && j > 0 && i < j, 'sperre=' + i + ' schreib=' + j);
})();
t('eine gefundene Figur wird GELADEN', aC.indexOf('F = alsFigur(roh)') > 0);
t('die Uebernahme wird dem Spieler gesagt', aC.indexOf('function zeigeUebernahme(') > 0);
t('der Hinweis sagt, dass eine zweite nicht geht',
  aC.indexOf('Eine zweite kannst du nicht anlegen') > 0);
t('der Umzug liegt NICHT doppelt in der Seite', aC.indexOf('function umzugAltfigur') < 0);
t('der Assistent ruft den gemeinsamen Umzug', aC.indexOf('figurUmzug(db,') > 0);

/* ==========================================================
   DER HELDENBRIEF
   ========================================================== */
const hC = inlineCode('heldenbrief.html');
t('der Bogen nimmt denselben Schluessel', hC.indexOf('figurSchluessel(spielerName())') > 0);
t('ohne Anmeldenamen sperrt der Bogen', hC.indexOf('if (!figurSchluessel(spielerName()))') > 0);
t('"Figur laden" per Code ist entfallen', hC.indexOf('function figurLaden(') < 0);
t('und der Knopf dazu auch', hC.indexOf('onclick="figurLaden()"') < 0);
t('der Bogen schreibt nicht, bevor er gelesen hat', hC.indexOf('if (!ladeBereit) return;') > 0);
(function () {
  const i = hC.indexOf('if (!ladeBereit) return;');
  const j = hC.indexOf("db.ref('figuren/' + codeJetzt()).update(");
  t('die Ladesperre steht VOR dem Schreibzugriff', i > 0 && j > 0 && i < j);
})();
/* Der Wettlauf, den ich mir beim Bauen erst eingebaut hatte: Umzug und
   Lesen gleichzeitig zu starten. Das Lesen MUSS im Callback stehen. */
(function () {
  const i = hC.indexOf('figurUmzug(db,');
  const rest = hC.slice(i, i + 400);
  t('erst der Umzug, dann das Lesen (kein Wettlauf)',
    rest.indexOf('function ()') > 0 && rest.indexOf("db.ref('figuren/' + codeJetzt()).once") >
      rest.indexOf('function ()'),
    rest.slice(0, 120).replace(/\s+/g, ' '));
})();
t('eine Frist verhindert ein stummes Haengen', hC.indexOf('ladeBereit = true; }, 8000)') > 0);

/* ==========================================================
   DER UMZUG ALTER FIGUREN
   ========================================================== */
t('figurUmzug liegt in js/sitzung.js', typeof S.figurUmzug === 'function');

function fakeDb(bestand) {
  const DB = JSON.parse(JSON.stringify(bestand));
  const log = [];
  return {
    DB: DB, log: log,
    ref: function (p) {
      const c = p.replace('figuren/', '');
      return {
        once: function () { return Promise.resolve({ val: function () { return DB[c] || null; } }); },
        update: function (d) { log.push('write:' + c); DB[c] = Object.assign({}, DB[c] || {}, d); return Promise.resolve(); },
        remove: function () { log.push('remove:' + c); delete DB[c]; return Promise.resolve(); }
      };
    }
  };
}
/* Der localStorage, auf den js/sitzung.js im Node-Kontext zugreift,
   existiert dort nicht - figurCode() faengt das ab und liefert ''.
   Fuer den Umzug wird der alte Code deshalb hier gesetzt. */
global.localStorage = {
  _d: {},
  getItem: function (k) { return k in this._d ? this._d[k] : null; },
  setItem: function (k, v) { this._d[k] = String(v); },
  removeItem: function (k) { delete this._d[k]; }
};

(function () {
  // Fall 1: alte Figur zieht um
  const db = fakeDb({ K7M3QP: { name: 'Mara', spieler: 'Anna', fert: { 'Kämpfen': 3 } } });
  S.setzeFigurCode('korsaren', 'K7M3QP');
  let fertig = false, zurueck = null;
  S.figurUmzug(db, 'korsaren', 'anna', function (roh) { fertig = true; zurueck = roh; });
  setTimeout(function () {
    t('Umzug: Figur liegt jetzt unter dem Namen', !!db.DB.anna && db.DB.anna.name === 'Mara',
      JSON.stringify(Object.keys(db.DB)));
    t('Umzug: der alte Code ist weg', !db.DB.K7M3QP);
    t('Umzug: der Inhalt ist mitgekommen',
      db.DB.anna && db.DB.anna.fert && db.DB.anna.fert['Kämpfen'] === 3);
    t('Umzug: die Herkunft ist vermerkt', db.DB.anna && db.DB.anna.umgezogenVon === 'K7M3QP');
    t('Umzug: erst schreiben, dann loeschen',
      db.log.indexOf('write:anna') >= 0 && db.log.indexOf('write:anna') < db.log.indexOf('remove:K7M3QP'),
      db.log.join(' '));
    t('Umzug: der Aufrufer bekommt die Figur zurueck', fertig && zurueck && zurueck.name === 'Mara');
    t('Umzug: der alte Code ist vergessen', S.figurCode('korsaren') === '');

    // Fall 2: unter dem Namen liegt schon eine Figur -> NICHTS anfassen
    const db2 = fakeDb({
      K7M3QP: { name: 'Alt' },
      anna: { name: 'Aktuell', fert: { 'Kämpfen': 5 } }
    });
    S.setzeFigurCode('korsaren', 'K7M3QP');
    S.figurUmzug(db2, 'korsaren', 'anna', function () {});
    setTimeout(function () {
      t('bestehende Figur am Namen wird NICHT ueberschrieben',
        db2.DB.anna.name === 'Aktuell' && db2.DB.anna.fert['Kämpfen'] === 5);
      t('und nichts wird dabei geschrieben', db2.log.filter(function (x) {
        return x.indexOf('write') === 0; }).length === 0, db2.log.join(' '));

      // Fall 3: kein alter Code -> nichts zu tun
      const db3 = fakeDb({});
      S.vergissFigurCode('korsaren');
      let lief = false;
      S.figurUmzug(db3, 'korsaren', 'anna', function () { lief = true; });
      t('ohne alten Code passiert nichts', lief === true && db3.log.length === 0);

      // Fall 4: der alte Code zeigt auf nichts
      const db4 = fakeDb({});
      S.setzeFigurCode('korsaren', 'ZZZ999');
      S.figurUmzug(db4, 'korsaren', 'anna', function () {
        t('ein Code ohne Figur raeumt sich auf',
          db4.log.filter(function (x) { return x.indexOf('write') === 0; }).length === 0);
        abschluss();
      });
    }, 60);
  }, 60);
})();

/* ==========================================================
   DIE REGIE
   ========================================================== */
function regiePruefen() {
  const rC = inlineCode('regie_hub.html');
  t('der Regie-Hub zeigt Figuren ohne Spieler', rC.indexOf('function zeichneAltfiguren(') > 0);
  t('er kann sie zuordnen', rC.indexOf('function figurZuordnen(') > 0);
  t('und loeschen', rC.indexOf('function figurWeg(') > 0);
  t('Zuordnen schreibt NICHT ueber eine bestehende Figur',
    rC.indexOf('hat schon eine Figur') > 0);
(function () {
  const i = rC.indexOf('function figurZuordnen(');
  let j = rC.indexOf('{', i), tief = 0, ende = -1;
  for (let k = j; k < rC.length; k++) {
    if (rC[k] === '{') tief++;
    else if (rC[k] === '}') { tief--; if (tief === 0) { ende = k; break; } }
  }
  const koerper = rC.slice(i, ende);
  const iSchreib = koerper.indexOf("'/stand/figuren/' + ziel");
  const iLoesch = koerper.indexOf("'/stand/figuren/' + schluessel");
  t('Zuordnen: erst schreiben, dann loeschen',
    iSchreib > 0 && iLoesch > 0 && iSchreib < iLoesch,
    'schreib=' + iSchreib + ' loesch=' + iLoesch);
  t('Zuordnen prueft vorher auf eine bestehende Figur',
    koerper.indexOf('figuren[ziel]') > 0 && koerper.indexOf('figuren[ziel]') < iSchreib);
})();
  t('Loeschen fragt vorher nach', (function () {
    const i = rC.indexOf('function figurWeg(');
    const k = rC.slice(i, i + 400);
    return k.indexOf('if (!confirm(') >= 0 && k.indexOf('return;') > k.indexOf('if (!confirm(');
  })());

  const ctx = {
    console, Date, Math, JSON, Object, String, Array,
    sitzungen: {}, istAltSchluessel: S.istAltSchluessel,
    figurCodeLesbar: S.figurCodeLesbar, figurSchluessel: S.figurSchluessel,
    meld() {}, confirm() { return true; }, prompt() { return '1'; },
    db: { ref() { return { update() { return Promise.resolve(); }, remove() { return Promise.resolve(); } }; } }
  };
  function cut(name) {
    const i = rC.indexOf('function ' + name + '(');
    if (i < 0) throw new Error('fehlt: ' + name);
    let j = rC.indexOf('{', i), tief = 0;
    for (let k = j; k < rC.length; k++) {
      if (rC[k] === '{') tief++;
      else if (rC[k] === '}') { tief--; if (tief === 0) return rC.slice(i, k + 1); }
    }
  }
  vm.createContext(ctx);
  new vm.Script([cut('esc'), cut('datum'), cut('zeichneAltfiguren')].join('\n'),
    { filename: 'regie_hub.html:alt' }).runInContext(ctx);

  ctx.sitzungen = { s1: { spieler: { anna: { name: 'Anna' } }, stand: { figuren: {
    anna:   { name: 'Mara', spieler: 'Anna', angelegt: 1000 },
    K7M3QP: { name: 'Verwaist', spieler: 'Bert', angelegt: 2000 }
  } } } };
  const h = ctx.zeichneAltfiguren('s1');
  t('nur die verwaiste Figur wird gemeldet', h.indexOf('Verwaist') > 0 && h.indexOf('Mara') < 0);
  t('die Zahl stimmt', h.indexOf('1 Figur(en) ohne Spieler') > 0, h.slice(0, 120));
  t('sie laesst sich zuordnen und loeschen',
    h.indexOf('zuordnen') > 0 && h.indexOf('löschen') > 0);

  ctx.sitzungen.sauber = { stand: { figuren: { anna: { name: 'Mara' } } } };
  t('bei sauberem Stand erscheint nichts', ctx.zeichneAltfiguren('sauber') === '');
  t('ohne Figuren erscheint nichts', ctx.zeichneAltfiguren('gibtesnicht') === '');
  ctx.sitzungen.muell = { stand: { figuren: { a: null, K7M3QP: 0 } } };
  t('kaputte Daten brechen die Ansicht nicht', (function () {
    try { ctx.zeichneAltfiguren('muell'); return true; }
    catch (e) { console.log('  ' + e.message); return false; } })());

  ctx.sitzungen.xss = { stand: { figuren: {
    AAA111: { name: '<img src=x onerror=boom>', spieler: '<b>X</b>', angelegt: 1 } } } };
  const hx = ctx.zeichneAltfiguren('xss');
  t('Namen werden maskiert', hx.indexOf('<img') < 0 && hx.indexOf('&lt;img') >= 0);
}

function abschluss() {
  regiePruefen();
  console.log('\nOK: ' + ok + '   FEHLER: ' + bad);
  process.exit(bad ? 1 : 0);
}

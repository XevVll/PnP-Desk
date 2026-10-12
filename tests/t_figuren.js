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
const R = require(path.join(ROOT, 'js/regelwerk.js'));

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
        loeschenPruefen();
      });
    }, 60);
  }, 60);
})();

/* ==========================================================
   DIE REGIE
   ========================================================== */
function regiePruefen() {
  const rC = inlineCode('regie_hub.html');
  t('der Regie-Hub listet die Figuren', rC.indexOf('function zeichneFiguren(') > 0);
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
  new vm.Script([cut('esc'), cut('datum'), cut('zeichneFiguren')].join('\n'),
    { filename: 'regie_hub.html:alt' }).runInContext(ctx);

  ctx.sitzungen = { s1: { spieler: { anna: { name: 'Anna' } }, stand: { figuren: {
    anna:   { name: 'Mara', spieler: 'Anna', angelegt: 1000 },
    K7M3QP: { name: 'Verwaist', spieler: 'Bert', angelegt: 2000 }
  } } } };
  const h = ctx.zeichneFiguren('s1');
  t('beide Figuren werden gelistet', h.indexOf('Verwaist') > 0 && h.indexOf('Mara') > 0);
  t('die Verwaisten werden gezaehlt', h.indexOf('1 von 2 Figur(en) ohne Spieler') > 0,
    h.slice(0, 160).replace(/<[^>]*>/g, ' '));
  t('nur die verwaiste laesst sich zuordnen',
    (h.match(/figurZuordnen\(/g) || []).length === 1);
  t('beide lassen sich loeschen', (h.match(/figurWeg\(/g) || []).length === 2);
  t('die verwaiste steht oben', h.indexOf('Verwaist') < h.indexOf('Mara'));

  ctx.sitzungen.sauber = { stand: { figuren: { anna: { name: 'Mara' } } } };
  const hs = ctx.zeichneFiguren('sauber');
  t('bei sauberem Stand keine Warnung', hs.indexOf('ohne Spieler') < 0 && hs.indexOf('1 Figur(en)') > 0,
    hs.slice(0, 140).replace(/<[^>]*>/g, ' '));
  t('auch dort kann die SL loeschen', hs.indexOf('figurWeg(') > 0);
  t('aber nichts zuzuordnen', hs.indexOf('figurZuordnen(') < 0);
  t('ohne Figuren erscheint nichts', ctx.zeichneFiguren('gibtesnicht') === '');
  ctx.sitzungen.muell = { stand: { figuren: { a: null, K7M3QP: 0 } } };
  t('kaputte Daten brechen die Ansicht nicht', (function () {
    try { ctx.zeichneFiguren('muell'); return true; }
    catch (e) { console.log('  ' + e.message); return false; } })());

  ctx.sitzungen.xss = { stand: { figuren: {
    AAA111: { name: '<img src=x onerror=boom>', spieler: '<b>X</b>', angelegt: 1 } } } };
  const hx = ctx.zeichneFiguren('xss');
  t('Namen werden maskiert', hx.indexOf('<img') < 0 && hx.indexOf('&lt;img') >= 0);
}

function loeschenPruefen() {
  /* ==========================================================
     LOESCHEN
     ----------------------------------------------------------
     Die Falle ist nicht das Loeschen, sondern die
     Wiederauferstehung: speichern() plant nachFirebase() 800 ms
     spaeter ein. Laeuft so einer noch, als geloescht wird, legt
     er die Figur wieder an - und der Spieler weiss nicht, warum
     sie zurueck ist. Deshalb muss der Timer VORHER weg und eine
     Flagge jeden weiteren Schreibzugriff sperren.
     ========================================================== */
  t('figurLoeschen liegt in js/sitzung.js', typeof S.figurLoeschen === 'function');

  const hC = inlineCode('heldenbrief.html');
  const aC2 = inlineCode('charaktererstellung.html');

  [['heldenbrief.html', hC, 'figurLoeschenFragen'],
   ['charaktererstellung.html', aC2, 'figurVerwerfenFragen']].forEach(function (p) {
    const name = p[0], code = p[1], fn = p[2];
    const i = code.indexOf('function ' + fn + '(');
    t(name + ': ' + fn + ' existiert', i > 0);
    if (i < 0) return;
    let j = code.indexOf('{', i), tief = 0, ende = -1;
    for (let k = j; k < code.length; k++) {
      if (code[k] === '{') tief++;
      else if (code[k] === '}') { tief--; if (tief === 0) { ende = k; break; } }
    }
    const koerper = code.slice(i, ende);

    t(name + ': fragt zweimal nach (confirm UND prompt)',
      koerper.indexOf('confirm(') > 0 && koerper.indexOf('prompt(') > koerper.indexOf('confirm('));
    t(name + ': der Name muss abgetippt werden',
      koerper.indexOf('toLowerCase()') > 0 && koerper.indexOf('stimmt nicht') > 0);
    t(name + ': bricht bei Abbruch ab',
      koerper.indexOf('=== null) return;') > 0);
    t(name + ': die Figur wird namentlich genannt', koerper.indexOf('bezeichnung') > 0);

    const iTimer = koerper.indexOf('clearTimeout(syncTimer)');
    const iFlagge = koerper.indexOf('geloescht = true');
    const iLoesch = koerper.indexOf('figurLoeschen(db,');
    t(name + ': der entprellte Schreibvorgang wird abgeraeumt', iTimer > 0);
    t(name + ': und zwar VOR dem Loeschen', iTimer > 0 && iLoesch > 0 && iTimer < iLoesch,
      'timer=' + iTimer + ' loesch=' + iLoesch);
    t(name + ': die Schreibsperre steht vor dem Loeschen',
      iFlagge > 0 && iLoesch > 0 && iFlagge < iLoesch);
    t(name + ': ein Fehlschlag wird ehrlich gemeldet',
      koerper.indexOf('if (fehler)') > 0 && koerper.indexOf('nicht gelöscht') > 0);
    t(name + ': nach einem Fehlschlag darf wieder geschrieben werden',
      koerper.indexOf('geloescht = false') > 0);

    // Die Sperre muss im Schreibpfad wirklich gelesen werden.
    t(name + ': nachFirebase bricht nach dem Loeschen ab',
      code.indexOf('if (geloescht) return;') > 0);
  });

  /* Der Assistent soll danach leer auf Schritt 1 stehen. */
  t('der Assistent fängt danach von vorn an',
    aC2.indexOf('F = leereFigur();') > 0 && aC2.indexOf('schritt = 0;') > 0);
  /* Der Heldenbrief fuehrt weiter zur Erschaffung. */
  t('der Heldenbrief führt danach zur Erschaffung',
    hC.indexOf("location.href = 'charaktererstellung.html'") > 0);

  /* Knoepfe da, und als Gefahr gekennzeichnet. */
  const hRoh = fs.readFileSync(path.join(ROOT, 'heldenbrief.html'), 'utf8');
  const aRoh = fs.readFileSync(path.join(ROOT, 'charaktererstellung.html'), 'utf8');
  t('der Heldenbrief hat einen Löschknopf', hRoh.indexOf('onclick="figurLoeschenFragen()"') > 0);
  t('und er ist als Gefahr gekennzeichnet',
    hRoh.indexOf('class="btn gefahr" onclick="figurLoeschenFragen()"') > 0);
  t('der Assistent hat einen Verwerfen-Knopf', aRoh.indexOf('onclick="figurVerwerfenFragen()"') > 0);

  /* ---- figurLoeschen wirklich ausfuehren ---- */
  const DB = { anna: { name: 'Mara' }, bert: { name: 'Finn' } };
  const log = [];
  const db = { ref: function (p) { return { remove: function () {
    log.push(p); delete DB[p.replace('figuren/', '')]; return Promise.resolve(); } }; } };
  global.localStorage.setItem('kors_figur_korsaren', '{"F":{}}');
  S.setzeFigurCode('korsaren', 'anna');
  S.figurLoeschen(db, 'korsaren', 'anna', function (fehler) {
    t('Loeschen: kein Fehler', !fehler, fehler && fehler.message);
    t('Loeschen: der Knoten ist weg', !DB.anna, JSON.stringify(Object.keys(DB)));
    t('Loeschen: fremde Figuren bleiben', !!DB.bert);
    t('Loeschen: der lokale Rueckfall ist weg',
      global.localStorage.getItem('kors_figur_korsaren') === null);
    t('Loeschen: der gemerkte Schluessel ist weg', S.figurCode('korsaren') === '');

    /* Ohne Schluessel darf nichts passieren. */
    S.figurLoeschen(db, 'korsaren', '', function (f2) {
      t('ohne Schluessel wird nicht geloescht', !!f2 && log.length === 1, 'log=' + log.length);

      /* Ein Fehler der Datenbank muss durchgereicht werden - sonst meldet
         die Seite Erfolg, obwohl die Figur noch da ist. */
      const dbKaputt = { ref: function () { return { remove: function () {
        return Promise.reject(new Error('PERMISSION_DENIED')); } }; } };
      S.figurLoeschen(dbKaputt, 'korsaren', 'bert', function (f3) {
        t('ein Datenbankfehler wird durchgereicht', !!f3 && /PERMISSION/.test(f3.message),
          f3 && f3.message);
        t('die Figur ist dann noch da', !!DB.bert);
        kachelPruefen();
      });
    });
  });
}

function kachelPruefen() {
  /* ==========================================================
     DER HELDENBRIEF GIBT ES NUR MIT FIGUR
     ----------------------------------------------------------
     Ein Bogen ohne Figur ist ein leeres Blatt mit Knoepfen -
     und schlimmer: Wer darauf etwas anklickt, LEGT damit eine
     leere Figur an. Deshalb zwei Schranken: die ausgegraute
     Kachel im Hub (wie die Karte, solange die Sitzung nicht
     laeuft) und eine Sperre in der Seite selbst, denn die
     Adresse kann jeder direkt aufrufen.
     ========================================================== */
  const iC = inlineCode('index.html');
  const iRoh = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const hC2 = inlineCode('heldenbrief.html');

  t('die Kachel hat eine Kennung', iRoh.indexOf('id="kachelBrief"') > 0);
  t('es gibt eine Umschaltfunktion', iC.indexOf('function briefKachel(') > 0);
  t('und einen Lauscher auf die eigene Figur', iC.indexOf('function beobachteFigur(') > 0);
  t('der Lauscher laeuft auf figuren/{schluessel}',
    iC.indexOf("db.ref('figuren/' + schluessel)") > 0);
  t('es ist ein Lauscher, kein einmaliger Blick',
    iC.indexOf('figurRef.on(') > 0 && iC.indexOf("figuren/' + schluessel).once") < 0);
  t('der Lauscher haengt beim Namenswechsel um', iC.indexOf('figurRef.off()') > 0);

  /* Die Kachel darf nicht offen aufblitzen, bevor etwas bekannt ist. */
  t('vor dem ersten Ergebnis ist die Kachel zu',
    iC.indexOf("briefKachel(false, '');\nzeigeSeite();") > 0 ||
    iC.indexOf("briefKachel(false, '')") < iC.indexOf('zeigeSeite();'));

  /* An- und Abmelden muessen den Lauscher mitnehmen. */
  (function () {
    function koerper(code, name) {
      const i = code.indexOf('function ' + name + '(');
      if (i < 0) return '';
      let j = code.indexOf('{', i), tief = 0;
      for (let k = j; k < code.length; k++) {
        if (code[k] === '{') tief++;
        else if (code[k] === '}') { tief--; if (tief === 0) return code.slice(i, k + 1); }
      }
      return '';
    }
    t('nach dem Anmelden wird neu eingehaengt',
      koerper(iC, 'anmelden').indexOf('beobachteFigur()') > 0);
    t('nach dem Abmelden ebenso', koerper(iC, 'abmelden').indexOf('beobachteFigur()') > 0);
  })();

  /* Das Ausgrauen muss dasselbe Mittel benutzen wie bei der Karte -
     sonst sieht es anders aus als das, was der Spieler schon kennt. */
  (function () {
    const i = iC.indexOf('function briefKachel(');
    let j = iC.indexOf('{', i), tief = 0, ende = -1;
    for (let k = j; k < iC.length; k++) {
      if (iC[k] === '{') tief++;
      else if (iC[k] === '}') { tief--; if (tief === 0) { ende = k; break; } }
    }
    const kb = iC.slice(i, ende);
    t('ausgegraut wie die Karte: Deckkraft .4',
      kb.indexOf("opacity = '.4'") > 0);
    t('nicht klickbar', kb.indexOf("pointerEvents = 'none'") > 0);
    t('und ohne Ziel', kb.indexOf("removeAttribute('href')") > 0);
    t('mit Erklaerung am Mauszeiger',
      kb.indexOf('setAttribute(\'title\'') > 0 && kb.indexOf('noch keine Figur') > 0);
    t('mit Figur wird alles zurueckgenommen',
      kb.indexOf("opacity = ''") > 0 && kb.indexOf("pointerEvents = ''") > 0 &&
      kb.indexOf("setAttribute('href', 'heldenbrief.html')") > 0);
    t('der Name der Figur steht in der Kachel', kb.indexOf('wie') > 0);
  })();

  /* Die Seite selbst sperrt bei direktem Aufruf. */
  t('der Heldenbrief sperrt ohne Figur',
    hC2.indexOf("sitzungsSperre('Noch keine Figur'") > 0);
  t('und schickt zur Erschaffung',
    hC2.indexOf("'Figur erschaffen', 'charaktererstellung.html'") > 0);
  /* Aber nicht, wenn lokal eine Figur liegt - ohne Verbindung ist der
     Rueckfall die einzige Wahrheit. */
  t('eine lokale Figur verhindert die Sperre', hC2.indexOf('if (hatLokaleFigur())') > 0);
  t('hatLokaleFigur existiert', hC2.indexOf('function hatLokaleFigur(') > 0);
  (function () {
    const i = hC2.indexOf('function hatLokaleFigur(');
    let j = hC2.indexOf('{', i), tief = 0, ende = -1;
    for (let k = j; k < hC2.length; k++) {
      if (hC2[k] === '{') tief++;
      else if (hC2[k] === '}') { tief--; if (tief === 0) { ende = k; break; } }
    }
    const fn = hC2.slice(i, ende);
    t('ein leeres Geruest zaehlt NICHT als Figur',
      fn.indexOf('return false;') > 0 && fn.indexOf('d.META.name') > 0,
      'sonst sperrt ein einmal geoeffneter, nie gefuellter Bogen den Spieler aus');
  })();
  /* Und ein Fehlschlag der Datenbank darf nicht sperren. */
  (function () {
    const i = hC2.indexOf("sitzungsSperre('Noch keine Figur'");
    const nachher = hC2.slice(i, i + 400);
    t('ein Datenbankfehler sperrt nicht, sondern laesst den Bogen offen',
      nachher.indexOf('.catch(') > 0 && nachher.indexOf('ladeBereit = true') > nachher.indexOf('.catch('),
      nachher.slice(-120).replace(/\s+/g, ' '));
    t('die Lade-Frist wird bei der Sperre abgeraeumt',
      nachher.indexOf('clearTimeout(ladeFrist)') >= 0 ||
      hC2.indexOf('// Gesperrt: Die Frist darf') > 0);
  })();

  /* ---- briefKachel wirklich ausfuehren ---- */
  const knoten = {};
  function el(id) {
    if (!knoten[id]) knoten[id] = {
      id: id, style: {}, _attr: {}, textContent: '',
      setAttribute: function (k, v) { this._attr[k] = v; },
      removeAttribute: function (k) { delete this._attr[k]; },
      getAttribute: function (k) { return this._attr[k]; }
    };
    return knoten[id];
  }
  const ctx = { console, document: { getElementById: el } };
  vm.createContext(ctx);
  (function () {
    const i = iC.indexOf('function briefKachel(');
    let j = iC.indexOf('{', i), tief = 0, ende = -1;
    for (let k = j; k < iC.length; k++) {
      if (iC[k] === '{') tief++;
      else if (iC[k] === '}') { tief--; if (tief === 0) { ende = k + 1; break; } }
    }
    new vm.Script(iC.slice(i, ende), { filename: 'index.html:briefKachel' }).runInContext(ctx);
  })();

  ctx.briefKachel(false, '');
  const k = el('kachelBrief');
  t('ohne Figur: ausgegraut', k.style.opacity === '.4');
  t('ohne Figur: nicht klickbar', k.style.pointerEvents === 'none');
  t('ohne Figur: kein Ziel', k.getAttribute('href') === undefined);
  t('ohne Figur: Erklaerung vorhanden', /noch keine Figur/.test(k.getAttribute('title') || ''));
  t('ohne Figur: der Text weist auf die Erschaffung hin',
    /erschaffe/i.test(el('kachelBriefText').textContent), el('kachelBriefText').textContent);

  ctx.briefKachel(true, 'Mara Quint');
  t('mit Figur: offen', k.style.opacity === '' && k.style.pointerEvents === '');
  t('mit Figur: Ziel gesetzt', k.getAttribute('href') === 'heldenbrief.html');
  t('mit Figur: keine Erklaerung mehr', k.getAttribute('title') === undefined);
  t('mit Figur: der Name steht drin',
    el('kachelBriefText').textContent.indexOf('Mara Quint') >= 0,
    el('kachelBriefText').textContent);

  ctx.briefKachel(true, '');
  t('Figur ohne Namen bricht nicht',
    el('kachelBriefText').textContent.length > 0 &&
    el('kachelBriefText').textContent.indexOf('undefined') < 0);

  // Und wieder zu, wenn die Figur geloescht wird.
  ctx.briefKachel(false, '');
  t('nach dem Loeschen geht die Kachel wieder zu', k.style.opacity === '.4');

  /* Die Beschreibung der Erschaffungs-Kachel nennt die zwei Regelsaetze
     nicht mehr - die Wahl ist im September entfallen. */
  t('keine Rede mehr von zwei Regelsaetzen',
    iRoh.indexOf('Korsaren-Variante') < 0);

  huellePruefen();
}

function huellePruefen() {
  /* ==========================================================
     LEERE HUELLEN
     ----------------------------------------------------------
     Hendriks Meldung vom 12.10.: "Trotz ich den Charakter
     gelöscht habe, ist der Heldenbrief immer noch klickbar und
     ruft einen leeren Charakterbogen auf, den man theoretisch
     wieder löschen kann."

     Ursache war ein Kreis: Der Heldenbrief leitet nach dem
     Loeschen zur Erschaffung weiter, und der Assistent schrieb
     beim Oeffnen IMMER einmal hoch - was im selben Moment eine
     leere Huelle anlegte. Fuer den Hub sah das aus wie eine
     Figur.

     Zwei Schranken dagegen, beide hier geprueft:
       1. Der Assistent legt beim blossen Oeffnen nichts an.
       2. Eine Huelle gilt NIRGENDS als Figur (istFigurEcht).
     ========================================================== */
  t('istFigurEcht gibt es', typeof S.istFigurEcht === 'function');

  const leer = R.leereFigur();
  const huelle = {
    name: '', spieler: 'Anna', rang: 0, steigerungen: 0,
    attr: leer.attr, fert: leer.fert, tal: [], hnd: [], brief: leer.brief,
    aktualisiert: Date.now()
  };
  t('eine frische, unberuehrte Figur ist KEINE Figur', S.istFigurEcht(huelle) === false,
    JSON.stringify(huelle).slice(0, 120));
  t('null ist keine Figur', S.istFigurEcht(null) === false);
  t('ein leeres Objekt ist keine Figur', S.istFigurEcht({}) === false);
  t('Muell ist keine Figur',
    S.istFigurEcht(7) === false && S.istFigurEcht('x') === false && S.istFigurEcht([]) === false);

  /* Alles, was ein Spieler tun kann, macht sie echt. */
  function mit(aenderung) {
    const o = JSON.parse(JSON.stringify(huelle));
    aenderung(o);
    return S.istFigurEcht(o);
  }
  t('ein Name macht sie echt', mit(o => { o.name = 'Mara'; }));
  t('ein Name aus Leerzeichen NICHT', mit(o => { o.name = '   '; }) === false);
  t('ein Talent macht sie echt', mit(o => { o.tal = ['seebein']; }));
  t('eine Schwaeche macht sie echt', mit(o => { o.hnd = ['stolz']; }));
  t('Ausruestung macht sie echt', mit(o => { o.ausr = ['saebel']; }));
  t('eine Steigerung macht sie echt', mit(o => { o.steigerungen = 1; }));
  t('ein Rang macht sie echt', mit(o => { o.rang = 1; }));
  t('eine Wunde macht sie echt', mit(o => { o.wunden = 1; }));
  t('angeschlagen macht sie echt', mit(o => { o.angeschlagen = true; }));
  t('eine Notiz macht sie echt', mit(o => { o.notizen = 'Hat Angst vor Wasser.'; }));
  t('ein Steckbrief-Feld macht sie echt', mit(o => { o.brief.antrieb = 'Weg von hier.'; }));
  t('ein gesteigertes Attribut macht sie echt', mit(o => { o.attr['Stärke'] = 2; }));
  t('eine gesteigerte Fertigkeit macht sie echt', mit(o => { o.fert['Kämpfen'] = 2; }));
  /* Firebase macht aus lueckenhaften Arrays Objekte. */
  t('Talente als Firebase-Objekt zaehlen auch', mit(o => { o.tal = { 0: 'seebein' }; }));

  /* ---- Der Assistent legt beim Oeffnen nichts an ---- */
  const aC2 = inlineCode('charaktererstellung.html');
  t('der Start schreibt nur bedingt hoch',
    aC2.indexOf('if (gabEsSchon || istFigurEcht(figurFuerDb())) nachFirebase();') > 0);
  t('kein unbedingtes nachFirebase im Start mehr', (function () {
    const i = aC2.indexOf('const weiter = function (gabEsSchon)');
    if (i < 0) return false;
    const bis = aC2.indexOf('};', i);
    const koerper = aC2.slice(i, bis);
    // nachFirebase darf dort nur hinter der Bedingung stehen
    return koerper.indexOf('nachFirebase()') > koerper.indexOf('istFigurEcht(');
  })());
  t('ein vorhandener Knoten wird weiter synchronisiert',
    aC2.indexOf('weiter(true);') > 0);
  t('eine umgezogene Figur ebenso', aC2.indexOf('weiter(!!alt);') > 0);

  /* ---- Hub und Bogen pruefen Inhalt, nicht Existenz ---- */
  const iC2 = inlineCode('index.html');
  t('die Kachel prueft den Inhalt', iC2.indexOf('const echt = istFigurEcht(roh);') > 0);
  t('die Kachel haengt NICHT mehr an der blossen Existenz',
    iC2.indexOf('briefKachel(!!roh,') < 0);
  const hC3 = inlineCode('heldenbrief.html');
  t('der Bogen prueft den Inhalt', hC3.indexOf('if (istFigurEcht(roh)) {') > 0);
  t('hatLokaleFigur benutzt dieselbe Pruefung',
    hC3.indexOf('return istFigurEcht(zusammen);') > 0);

  rangPruefen();
}

function rangPruefen() {
  /* ==========================================================
     STARTRANG
     ----------------------------------------------------------
     Hendriks Vorgabe vom 12.10.: "Diese sind immer Novize außer
     die SL gibt explizit das anders frei."

     Die eigentliche Falle lag nicht in der Oberflaeche, sondern
     im Regelwerk: steigerungAnwenden() rechnete den Rang aus den
     STEIGERUNGEN zurueck. Eine Figur, die als Veteran beginnt,
     waere bei der ersten Steigerung Novize geworden.
     ========================================================== */
  t('die Figur merkt sich ihren Startrang', R.leereFigur().startRang === 0);
  t('rangJetzt gibt es', typeof R.rangJetzt === 'function');

  const v = R.leereFigur(); v.startRang = 2; v.rang = 2;
  t('Startrang gilt ohne Steigerungen', R.rangJetzt(v) === 2, R.rangJetzt(v));
  const ok1 = R.steigerungAnwenden(v, 'neueFert', 'Segeln');
  t('eine Steigerung laeuft durch', ok1.ok === true, JSON.stringify(ok1));
  t('der Startrang geht dabei NICHT verloren', v.rang === 2, R.rangName(v.rang));

  /* Erspielt darf er weiter steigen. */
  const e = R.leereFigur(); e.steigerungen = 3;
  R.steigerungAnwenden(e, 'neueFert', 'Segeln');
  t('vier Steigerungen machen einen Novizen zu Erfahren', e.rang === 1, R.rangName(e.rang));
  /* Und ein hoher Start wird vom Erspielten ueberholt, nicht gesenkt. */
  const h2 = R.leereFigur(); h2.startRang = 1; h2.steigerungen = 7;
  R.steigerungAnwenden(h2, 'neueFert', 'Segeln');
  t('erspielter Rang ueberholt den Startrang', h2.rang === 2, R.rangName(h2.rang));
  t('rangJetzt senkt nie', R.rangJetzt({ startRang: 3, steigerungen: 0 }) === 3);

  t('alsFigur uebernimmt den Startrang', R.alsFigur({ startRang: 2 }).startRang === 2);
  t('alsFigur klemmt Unsinn',
    R.alsFigur({ startRang: 99 }).startRang === R.RAENGE.length - 1 &&
    R.alsFigur({ startRang: -5 }).startRang === 0);

  /* ---- Der Assistent ---- */
  const aC3 = inlineCode('charaktererstellung.html');
  t('der Assistent kennt eine Freigabe', aC3.indexOf('let rangFrei = 0;') > 0);
  t('Vorgabe ist Novize', aC3.indexOf('let rangFrei = 0;') > 0);
  t('die Freigabe kommt aus dem meta der Sitzung',
    aC3.indexOf("'/meta/startRang'") > 0);
  t('sie wird beobachtet, nicht einmal gelesen',
    aC3.indexOf("/meta/startRang').on(") > 0);
  t('der Startrang wird mitgespeichert', aC3.indexOf('startRang: F.startRang || 0,') > 0);

  /* Die Klemmung muss im Code stehen, nicht nur in der Anzeige. */
  (function () {
    const i = aC3.indexOf('function waehleRang(');
    let j = aC3.indexOf('{', i), tief = 0, ende = -1;
    for (let k = j; k < aC3.length; k++) {
      if (aC3[k] === '{') tief++;
      else if (aC3[k] === '}') { tief--; if (tief === 0) { ende = k; break; } }
    }
    const koerper = aC3.slice(i, ende);
    t('waehleRang klemmt auf die Freigabe',
      koerper.indexOf('Math.min(rangFrei') > 0, koerper.replace(/\s+/g, ' ').slice(0, 140));
    t('und setzt startRang, nicht nur rang', koerper.indexOf('F.startRang = r;') > 0);
  })();

  /* ---- Die Anzeige wirklich ausfuehren ---- */
  const knoten = {};
  function el(id) {
    if (!knoten[id]) knoten[id] = { innerHTML: '', textContent: '' };
    return knoten[id];
  }
  function schneide(code, name) {
    const i = code.indexOf('function ' + name + '(');
    let j = code.indexOf('{', i), tief = 0;
    for (let k = j; k < code.length; k++) {
      if (code[k] === '{') tief++;
      else if (code[k] === '}') { tief--; if (tief === 0) return code.slice(i, k + 1); }
    }
  }
  const ctx = {
    console, Object, String, Array, Math, JSON, document: { getElementById: el },
    RAENGE: R.RAENGE, rangName: R.rangName, rangJetzt: R.rangJetzt, TAL_BY_ID: R.TAL_BY_ID,
    talentWaehlbar: R.talentWaehlbar, speichern() {}, renderAlles() {},
    F: R.leereFigur(), rangFrei: 0
  };
  vm.createContext(ctx);
  new vm.Script([schneide(aC3, 'renderRang'), schneide(aC3, 'waehleRang')].join(String.fromCharCode(10)),
    { filename: 'charaktererstellung.html:rang' }).runInContext(ctx);

  ctx.renderRang();
  const ohne = el('rangWahl').innerHTML;
  t('ohne Freigabe steht dort nur Novize',
    ohne.indexOf('Novize') >= 0 && ohne.indexOf('Veteran') < 0 && ohne.indexOf('Erfahren') < 0);
  t('ohne Freigabe gibt es nichts anzuklicken', ohne.indexOf('onclick') < 0, ohne.slice(0, 120));
  t('ohne Freigabe wird gesagt, wer das ändern kann',
    ohne.indexOf('Spielleitung') > 0);

  ctx.rangFrei = 2;
  ctx.renderRang();
  const mit = el('rangWahl').innerHTML;
  t('mit Freigabe stehen die erlaubten Ränge da',
    mit.indexOf('Novize') >= 0 && mit.indexOf('Erfahren') > 0 && mit.indexOf('Veteran') > 0);
  t('nicht freigegebene Ränge fehlen',
    mit.indexOf('Heroisch') < 0 && mit.indexOf('Legendär') < 0);
  t('und sie sind anklickbar', mit.indexOf('onclick="waehleRang(') > 0);

  ctx.waehleRang(2);
  t('Wahl bis zur Freigabe geht', ctx.F.startRang === 2 && ctx.F.rang === 2);
  ctx.waehleRang(4);
  t('darüber hinaus wird geklemmt', ctx.F.startRang === 2, ctx.F.startRang);
  ctx.waehleRang(0);
  t('niedriger als die Freigabe geht auch', ctx.F.startRang === 0);

  /* ---- Die Regie gibt frei ---- */
  const rC2 = inlineCode('regie_hub.html');
  t('der Regie-Hub kann den Startrang setzen', rC2.indexOf('function startRangSetzen(') > 0);
  t('er schreibt ins meta der Sitzung',
    rC2.indexOf("'sitzungen/' + id + '/meta/startRang'") > 0);
  t('er klemmt auf 0..4', rC2.indexOf('Math.min(4, +wert || 0)') > 0);
  t('und zeigt den Stand an', rC2.indexOf('function zeichneStartRang(') > 0);

  const rctx = {
    console, Object, String, Array, Math, JSON,
    sitzungen: {}, meld() {}, db: { ref() { return { set() { return Promise.resolve(); } }; } }
  };
  vm.createContext(rctx);
  const konst = rC2.slice(rC2.indexOf('const RANG_NAMEN'),
    rC2.indexOf(';', rC2.indexOf('const RANG_NAMEN')) + 1);
  new vm.Script([konst, schneide(rC2, 'zeichneStartRang')].join(String.fromCharCode(10)),
    { filename: 'regie_hub.html:rang' }).runInContext(rctx);
  rctx.sitzungen = { a: { meta: { name: 'A' } }, b: { meta: { name: 'B', startRang: 2 } } };
  const oA = rctx.zeichneStartRang('a'), oB = rctx.zeichneStartRang('b');
  t('ohne Vorgabe steht Novize gewählt', oA.indexOf('value="0" selected') > 0);
  t('und es wird erklärt', oA.indexOf('sind Novize') > 0);
  t('mit Vorgabe steht der freigegebene Rang gewählt', oB.indexOf('value="2" selected') > 0);
  t('und es wird erklärt, dass niedriger auch geht', oB.indexOf('niedriger geht auch') > 0);
  t('alle fünf Ränge stehen zur Wahl', (oA.match(/<option/g) || []).length === 5);
  rctx.sitzungen.kaputt = { meta: { startRang: 99 } };
  t('Unsinn im meta bricht nichts',
    (function () { try { rctx.zeichneStartRang('kaputt'); return true; } catch (e) { return false; } })());

  abschluss();
}

function abschluss() {
  regiePruefen();
  console.log('\nOK: ' + ok + '   FEHLER: ' + bad);
  process.exit(bad ? 1 : 0);
}

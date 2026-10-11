/* ==========================================================
   FIGUREN — hoechstens eine je Spieler und Sitzung
   ----------------------------------------------------------
   Aufruf:  node tests/t_figuren.js

   Die Zuordnung "dieser Mensch -> diese Figur" lag bis Oktober
   2026 allein im localStorage. Auf einem zweiten Geraet war sie
   weg, der Assistent legte eine zweite Figur an, und die
   Spielleitung sah "2 Figur(en)" bei einer Person.

   Jetzt traegt die Figur ihren Besitzer. Der gefaehrlichste
   Punkt dabei ist NICHT das Finden, sondern was danach
   geschieht: Findet der Assistent die Figur vom Laptop, ist
   der lokale Stand aber leer, darf er sie nicht ueberschreiben.
   Genau das pruefen die Faelle unten.
   ========================================================== */
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
let ok = 0, bad = 0;
function t(n, c, x) { if (c) ok++; else { bad++; console.log('FEHLER: ' + n + (x ? '  [' + x + ']' : '')); } }

/* js/sitzung.js laedt im Node-Kontext ohne Browser. */
const S = require(path.join(ROOT, 'js/sitzung.js'));

/* ---------- spielerKennung: ueber Geraete stabil ---------- */
t('Kennung ist ueber Schreibweisen stabil',
  S.spielerKennung('Anna') === S.spielerKennung('  anna  ') &&
  S.spielerKennung('Anna') === S.spielerKennung('ANNA'),
  [S.spielerKennung('Anna'), S.spielerKennung('  anna  '), S.spielerKennung('ANNA')].join(' / '));
t('Umlaute werden umgeschrieben', S.spielerKennung('Jörg') === 'joerg', S.spielerKennung('Jörg'));
t('zwei verschiedene Leute, zwei Kennungen',
  S.spielerKennung('Anna') !== S.spielerKennung('Bert'));
t('leerer Name gibt keine Kennung', S.spielerKennung('') === '' && S.spielerKennung(null) === '');

/* ---------- figurVonBesitzer ---------- */
const anna = S.spielerKennung('Anna'), bert = S.spielerKennung('Bert');
const figuren = {
  K7M3QP: { name: 'Mara', spieler: 'Anna', besitzer: anna, angelegt: 1000 },
  T4R8ZX: { name: 'Finn', spieler: 'Bert', besitzer: bert, angelegt: 2000 }
};
t('findet die Figur ihres Besitzers', S.figurVonBesitzer(figuren, anna) === 'K7M3QP');
t('verwechselt die Besitzer nicht', S.figurVonBesitzer(figuren, bert) === 'T4R8ZX');
t('ohne Figur kommt nichts zurueck', S.figurVonBesitzer(figuren, S.spielerKennung('Clara')) === '');
t('ohne Kennung kommt nichts zurueck', S.figurVonBesitzer(figuren, '') === '');
t('ueberlebt einen leeren Knoten',
  S.figurVonBesitzer(null, anna) === '' && S.figurVonBesitzer({}, anna) === '');
t('ueberlebt kaputte Eintraege',
  (function () { try { return S.figurVonBesitzer({ a: null, b: 7, c: { besitzer: anna } }, anna) === 'c'; }
                 catch (e) { return false; } })());
/* Gibt es doch zwei, muss IMMER dieselbe gewinnen - sonst bearbeitet
   der Spieler bei jedem Oeffnen eine andere Figur. */
const zwei = {
  NEU111: { besitzer: anna, angelegt: 5000 },
  ALT222: { besitzer: anna, angelegt: 1000 }
};
t('bei zwei Figuren gewinnt die aeltere', S.figurVonBesitzer(zwei, anna) === 'ALT222');
t('die Wahl ist stabil, nicht zufaellig',
  S.figurVonBesitzer(zwei, anna) === S.figurVonBesitzer(zwei, anna));
/* Ohne Zeitstempel darf die Reihenfolge nicht vom Zufall abhaengen. */
const ohneZeit = { ZZZ999: { besitzer: anna }, AAA111: { besitzer: anna } };
t('ohne Zeitstempel entscheidet der Code, nicht die Laune',
  S.figurVonBesitzer(ohneZeit, anna) === 'AAA111');

/* ---------- figurenDoppelt ---------- */
t('keine Doppelten bei saubarem Stand', Object.keys(S.figurenDoppelt(figuren)).length === 0);
const dopp = S.figurenDoppelt(zwei);
t('zwei Figuren eines Besitzers werden gemeldet',
  Object.keys(dopp).length === 1 && dopp[anna].length === 2, JSON.stringify(dopp));
t('Figuren OHNE Besitzer gelten nicht als doppelt',
  Object.keys(S.figurenDoppelt({ a: { spieler: 'Anna' }, b: { spieler: 'Anna' } })).length === 0);
t('figurenDoppelt ueberlebt Muell',
  (function () { try { S.figurenDoppelt(null); S.figurenDoppelt({ x: null }); return true; }
                 catch (e) { return false; } })());

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

t('der Assistent sucht die Figur des Besitzers', aC.indexOf('figurVonBesitzer(alle, kennung)') > 0);
t('der Assistent schreibt den Besitzer an die Figur', aC.indexOf('besitzer: spielerKennung(') > 0);
t('der Besitzer ist der normalisierte NAME, nicht die Browser-Kennung',
  aC.indexOf('besitzer: spielerKennung(') > 0 && aC.indexOf('besitzer: spielerId(') < 0);

/* Der tragende Punkt: kein Schreibzugriff, bevor geklaert ist,
   welche Figur bearbeitet wird. */
t('es gibt eine Startsperre', aC.indexOf('let startBereit = false') > 0);
t('nachFirebase schreibt nicht vor der Uebernahme',
  aC.indexOf('if (!startBereit) return;') > 0);
const iSperre = aC.indexOf('if (!startBereit) return;');
const iSchreib = aC.indexOf("db.ref('figuren/' + code).update(");
t('die Sperre steht VOR dem Schreibzugriff', iSperre > 0 && iSchreib > 0 && iSperre < iSchreib,
  'sperre=' + iSperre + ' schreib=' + iSchreib);
t('der Start laeuft ueber die Uebernahme, nicht direkt ins Schreiben',
  aC.indexOf('startUebernahme();') > 0);
t('initFirebase ruft NICHT mehr direkt nachFirebase',
  (function () {
    const i = aC.indexOf('function initFirebase()');
    const j = aC.indexOf('function ', i + 30);
    return aC.slice(i, j).indexOf('nachFirebase()') < 0;
  })());
t('eine gefundene Figur wird GELADEN', aC.indexOf('F = alsFigur(roh);') > 0);
t('die Uebernahme wird dem Spieler gesagt', aC.indexOf('function zeigeUebernahme(') > 0);
t('es gibt eine Frist, falls die Datenbank haengt',
  aC.indexOf('setTimeout(weiter, 8000)') > 0);
t('angelegt wird nur beim Anlegen gesetzt', aC.indexOf('if (istNeueFigur)') > 0);

/* Der Heldenbrief bleibt der bewusste Ausweg: "Figur laden" bindet
   der Index nicht, und er fasst den Besitzer nicht an. */
const hC = inlineCode('heldenbrief.html');
t('der Heldenbrief kann weiter eine Figur per Code laden', hC.indexOf('function figurLaden(') > 0);
t('der Heldenbrief aendert den Besitzer NICHT', hC.indexOf('besitzer') < 0);

/* ==========================================================
   DIE REGIE SIEHT DOPPELTE
   ========================================================== */
const rC = inlineCode('regie_hub.html');
t('der Regie-Hub zeigt doppelte Figuren', rC.indexOf('function zeichneDoppelte(') > 0);
t('der Regie-Hub kann eine Figur loeschen', rC.indexOf('function figurWeg(') > 0);
t('Loeschen fragt vorher nach', rC.indexOf('confirm(') > 0 &&
  rC.slice(rC.indexOf('function figurWeg('), rC.indexOf('function figurWeg(') + 400).indexOf('confirm(') > 0);
t('geloescht wird in der Sitzung, nicht in der Wurzel',
  rC.indexOf("'sitzungen/' + id + '/stand/figuren/' + code") > 0);
(function () {
  const pfad = "'/stand/figuren/' + code";
  const vorkommen = rC.split(pfad).length - 1;
  t('der Figuren-Loeschpfad kommt genau einmal vor', vorkommen === 1, 'n=' + vorkommen);
  const i = rC.indexOf('function figurWeg(');
  // Koerper von figurWeg per Klammerzaehlung
  let j = rC.indexOf('{', i), tief = 0, ende = -1;
  for (let k = j; k < rC.length; k++) {
    if (rC[k] === '{') tief++;
    else if (rC[k] === '}') { tief--; if (tief === 0) { ende = k; break; } }
  }
  const koerper = rC.slice(i, ende);
  t('der Loeschzugriff liegt IM Koerper von figurWeg', koerper.indexOf(pfad) > 0);
  t('und erst hinter der Rueckfrage',
    koerper.indexOf('confirm(') >= 0 && koerper.indexOf('confirm(') < koerper.indexOf(pfad));
  t('die Rueckfrage bricht ab, wenn abgelehnt wird',
    koerper.indexOf('if (!confirm(') >= 0 && koerper.indexOf('return;') > koerper.indexOf('if (!confirm('));
  // Nirgends sonst wird eine Figur entfernt.
  t('keine andere Stelle entfernt Figuren',
    rC.split("stand/figuren/").length - 1 === 1);
})();
t('der Zaehler weist auf doppelt vergebene Figuren hin',
  rC.indexOf('doppelt vergeben') > 0);

/* Die Ansicht wirklich ausfuehren. */
function ladeHub() {
  function cut(name) {
    const i = rC.indexOf('function ' + name + '(');
    if (i < 0) throw new Error('fehlt: ' + name);
    let j = rC.indexOf('{', i), tief = 0;
    for (let k = j; k < rC.length; k++) {
      if (rC[k] === '{') tief++;
      else if (rC[k] === '}') { tief--; if (tief === 0) return rC.slice(i, k + 1); }
    }
    throw new Error('Klammern: ' + name);
  }
  const ctx = {
    console, Date, Math, JSON, Object, String, Array,
    sitzungen: {}, figurenDoppelt: S.figurenDoppelt,
    figurCodeLesbar: S.figurCodeLesbar, meld() {}, confirm() { return true; },
    db: { ref() { return { remove() { return Promise.resolve(); } }; } }
  };
  vm.createContext(ctx);
  new vm.Script([cut('esc'), cut('datum'), cut('zeichneDoppelte'), cut('figurWeg')].join('\n'),
    { filename: 'regie_hub.html:doppelt' }).runInContext(ctx);
  return ctx;
}
const H = ladeHub();
t('zeichneDoppelte ist ausfuehrbar', typeof H.zeichneDoppelte === 'function');

H.sitzungen = { s1: { stand: { figuren: {
  ALT222: { name: 'Mara', spieler: 'Anna', besitzer: anna, angelegt: 1000 },
  NEU111: { name: 'Mara (2)', spieler: 'Anna', besitzer: anna, angelegt: 5000 },
  T4R8ZX: { name: 'Finn', spieler: 'Bert', besitzer: bert, angelegt: 2000 }
} } } };
const h1 = H.zeichneDoppelte('s1');
t('die Warnung erscheint', h1.indexOf('Mehr als eine Figur') > 0);
t('nur der betroffene Spieler wird genannt', h1.indexOf('Anna') > 0 && h1.indexOf('Bert') < 0);
t('beide Codes stehen da', h1.indexOf('ALT-222') > 0 && h1.indexOf('NEU-111') > 0,
  h1.indexOf('ALT-222') + '/' + h1.indexOf('NEU-111'));
t('die aeltere ist als geltende markiert',
  h1.indexOf('ALT-222') < h1.indexOf('(gilt)') &&
  h1.indexOf('(gilt)') < h1.indexOf('NEU-111'));
t('beide lassen sich loeschen', (h1.match(/figurWeg\(/g) || []).length === 2);

H.sitzungen.sauber = { stand: { figuren: {
  K7M3QP: { spieler: 'Anna', besitzer: anna, angelegt: 1 } } } };
t('bei sauberem Stand erscheint nichts', H.zeichneDoppelte('sauber') === '');
t('ohne Figuren erscheint nichts', H.zeichneDoppelte('gibtesnicht') === '');
H.sitzungen.muell = { stand: { figuren: { a: null, b: 7 } } };
t('kaputte Daten brechen die Ansicht nicht',
  (function () { try { H.zeichneDoppelte('muell'); return true; }
                 catch (e) { console.log('  ' + e.message); return false; } })());

/* Namen kommen von Spielern - maskieren. */
H.sitzungen.xss = { stand: { figuren: {
  AAA111: { name: '<img src=x onerror=boom>', spieler: '<b>X</b>', besitzer: 'x', angelegt: 1 },
  BBB222: { name: 'zwei', spieler: '<b>X</b>', besitzer: 'x', angelegt: 2 }
} } };
const hx = H.zeichneDoppelte('xss');
t('Figuren- und Spielernamen werden maskiert',
  hx.indexOf('<img') < 0 && hx.indexOf('<b>X</b>') < 0 && hx.indexOf('&lt;img') >= 0);

console.log('\nOK: ' + ok + '   FEHLER: ' + bad);
process.exit(bad ? 1 : 0);

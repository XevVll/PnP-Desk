/* ==========================================================
   REGELREFERENZ.md — ist sie aktuell, und bleibt der Text stehen?
   ----------------------------------------------------------
   Eine Referenz, die veraltet, ist schlimmer als keine: Man liest
   sie, glaubt ihr und spielt nach einer Regel, die nicht mehr gilt.
   Deshalb laeuft hier bei jedem Testlauf mit, ob die eingecheckte
   Datei noch zu js/regelwerk.js passt.

   Die zweite Pruefung ist die wichtigere: Der Generator darf
   ausschliesslich den Block zwischen den Marken ersetzen. Faesst er
   den handgeschriebenen Spickzettel an, waere Hendriks Text beim
   naechsten Lauf weg - und zwar lautlos.
   ========================================================== */
const fs = require('fs'), path = require('path'), os = require('os');
const { execFileSync } = require('child_process');

const BASIS = path.join(__dirname, '..');
const DATEI = path.join(BASIS, 'REGELREFERENZ.md');
const TOOL = path.join(BASIS, 'tools/regelreferenz.js');

let f = 0, anzahl = 0;
const chk = (n, c, x) => { anzahl++; console.log((c ? 'OK  ' : 'FAIL') + ' ' + n + (c ? '' : '  <<< ' + JSON.stringify(x))); if (!c) f++; };

function lauf(args) {
  try {
    return { code: 0, aus: execFileSync(process.execPath, [TOOL].concat(args || []),
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }) };
  } catch (e) {
    return { code: e.status === undefined ? 1 : e.status, aus: (e.stdout || '') + (e.stderr || '') };
  }
}

console.log('=== DIE DATEI IST DA UND AKTUELL ===');
chk('REGELREFERENZ.md existiert', fs.existsSync(DATEI));
const inhalt = fs.existsSync(DATEI) ? fs.readFileSync(DATEI, 'utf8') : '';
const pruef = lauf(['--pruefen']);
chk('sie passt zu js/regelwerk.js', pruef.code === 0, pruef.aus.trim());
chk('--pruefen schreibt nicht', fs.readFileSync(DATEI, 'utf8') === inhalt);

console.log('');
console.log('=== DER HANDGESCHRIEBENE TEIL IST GESCHUETZT ===');
const tmp = path.join(os.tmpdir(), 'regelref_test_' + Date.now() + '.md');
const SATZ = 'ZZ-PRUEFSATZ-HANDGESCHRIEBEN-ZZ';
// Den Satz VOR die Marke setzen - dort steht der Spickzettel.
const marke = inhalt.indexOf('<!-- ERZEUGT:ANFANG');
chk('die Marken stehen in der Datei', marke > 0 && inhalt.indexOf('<!-- ERZEUGT:ENDE -->') > marke);
fs.writeFileSync(tmp, inhalt.slice(0, marke) + SATZ + '\n\n' + inhalt.slice(marke), 'utf8');
const l2 = lauf(['--ziel', tmp]);
const nachher = fs.readFileSync(tmp, 'utf8');
chk('der Lauf geht durch', l2.code === 0, l2.aus.trim());
chk('der handgeschriebene Satz steht noch da', nachher.indexOf(SATZ) >= 0);
chk('und zwar vor der Marke', nachher.indexOf(SATZ) < nachher.indexOf('<!-- ERZEUGT:ANFANG'));
chk('der erzeugte Block ist unveraendert',
  nachher.slice(nachher.indexOf('<!-- ERZEUGT:ANFANG')) ===
  inhalt.slice(inhalt.indexOf('<!-- ERZEUGT:ANFANG')));

// Zweiter Lauf auf derselben Datei darf nichts mehr aendern.
const vorher2 = fs.readFileSync(tmp, 'utf8');
lauf(['--ziel', tmp]);
chk('ein zweiter Lauf aendert nichts', fs.readFileSync(tmp, 'utf8') === vorher2);

/* Fehlen die Marken, muss der Generator ABBRECHEN statt die Datei neu zu
   schreiben - sonst waere der handgeschriebene Teil genau dann weg, wenn
   jemand die Marken aus Versehen geloescht hat. */
fs.writeFileSync(tmp, 'Nur handgeschriebener Text, keine Marken.\n', 'utf8');
const l3 = lauf(['--ziel', tmp]);
chk('ohne Marken bricht er ab', l3.code === 2, l3.code);
chk('und laesst die Datei in Ruhe',
  fs.readFileSync(tmp, 'utf8') === 'Nur handgeschriebener Text, keine Marken.\n');
try { fs.unlinkSync(tmp); } catch (e) { /* egal */ }

console.log('');
console.log('=== INHALT: DIE ZAHLEN STIMMEN MIT DEM REGELWERK UEBEREIN ===');
const R = require(path.join(BASIS, 'js/regelwerk.js'));
/* Nur die SPIELBAREN. Talente mit nurNsc gehoeren zu einer bestimmten Figur
   und haben in einem Katalog moeglicher Talente nichts verloren - wer sie
   dort liest, haelt sie fuer waehlbar. */
const talSpielbar = R.TALENTE.filter(function (t) { return !t.nurNsc; });
const hndSpielbar = R.HANDICAPS.filter(function (h) { return !h.nurNsc; });
chk('alle ' + talSpielbar.length + ' spielbaren Talente kommen vor',
  talSpielbar.every(function (t) { return inhalt.indexOf('**' + t.n + '**') >= 0; }),
  talSpielbar.filter(function (t) { return inhalt.indexOf('**' + t.n + '**') < 0; }).map(t => t.n));
chk('die NSC-eigenen stehen NICHT drin',
  R.TALENTE.filter(function (t) { return t.nurNsc; })
    .every(function (t) { return inhalt.indexOf(t.n) < 0; }),
  R.TALENTE.filter(function (t) { return t.nurNsc && inhalt.indexOf(t.n) >= 0; }).map(t => t.n));
chk('alle ' + hndSpielbar.length + ' spielbaren Schwaechen kommen vor',
  hndSpielbar.every(function (h) { return inhalt.indexOf('**' + h.n + '**') >= 0; }),
  hndSpielbar.filter(function (h) { return inhalt.indexOf('**' + h.n + '**') < 0; }).map(h => h.n));
chk('und auch hier keine NSC-eigene',
  R.HANDICAPS.filter(function (h) { return h.nurNsc; })
    .every(function (h) { return inhalt.indexOf(h.n) < 0; }));
chk('alle ' + R.FERTIGKEITEN.length + ' Fertigkeiten kommen vor',
  R.FERTIGKEITEN.every(function (s) { return inhalt.indexOf('**' + s.name + '**') >= 0; }));
chk('alle ' + R.AUSRUESTUNG.length + ' Gegenstaende kommen vor',
  R.AUSRUESTUNG.every(function (a) { return inhalt.indexOf('**' + a.n + '**') >= 0; }),
  R.AUSRUESTUNG.filter(function (a) { return inhalt.indexOf('**' + a.n + '**') < 0; }).map(a => a.n));

/* Der Spickzettel nennt Zahlen. Nennt er die falschen, lehrt er Falsches -
   genau der Fehler, der im Oktober beim Rechenbeispiel im Assistenten schon
   einmal gepruefet werden musste. */
chk('Zielwert ' + R.ZIELZAHL + ' steht drin', inhalt.indexOf('Zielwert **immer ' + R.ZIELZAHL + '**') >= 0);
chk('die Steigerungsschwellen stimmen',
  inhalt.indexOf('| 4–7 | 8–11 | 12–15 | 16+ |') >= 0 &&
  R.ZIELZAHL === 4 && R.STEIGERUNG_SCHRITT === 4);
chk('der Wild Die wird als d' + R.WILD_DIE + ' genannt',
  inhalt.indexOf('separater d' + R.WILD_DIE + ')') >= 0);
chk('ungelernt steht als d' + R.UNGELERNT_WUERFEL + ' −' + R.UNGELERNT_ABZUG,
  inhalt.indexOf('d' + R.UNGELERNT_WUERFEL + ' mit **−' + R.UNGELERNT_ABZUG + '**') >= 0);
chk('hoechstens ' + R.MAX_WUNDEN + ' Wunden',
  inhalt.indexOf('höchstens ' + R.MAX_WUNDEN) >= 0);
chk('Startgeld ' + R.STARTGELD, inhalt.indexOf('Startgeld ' + R.STARTGELD) >= 0);
chk('die Erschwernis-Tabelle nennt die noetigen Zahlen',
  [2, 4, 6, 8].every(function (n) { return inhalt.indexOf('| ' + n + ' |') >= 0 ||
    inhalt.indexOf('| ' + n + ' |\n') >= 0; }) &&
  inhalt.indexOf('| nötig | 2 | 4 | 6 | 8 |') >= 0);

/* Rechtliches: Das Repo ist oeffentlich, und die Fan License erlaubt keinen
   uebernommenen Regeltext. Der Hinweis darauf muss stehen bleiben. */
chk('der Lizenzhinweis steht drin',
  inhalt.indexOf('Fan License') >= 0 && inhalt.indexOf('selbst geschrieben') >= 0);
chk('sie verweist auf die Bibel als Regelquelle',
  inhalt.indexOf('KAMPAGNEN-BIBEL.md') >= 0);

console.log('');
console.log(f === 0 ? 'OK: ' + anzahl + '   FEHLER: 0' : 'OK: ' + (anzahl - f) + '   FEHLER: ' + f);
process.exit(f ? 1 : 0);

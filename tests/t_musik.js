/* ==========================================================
   MUSIK — jede Szene bringt ihre eigene mit
   ----------------------------------------------------------
   ANLASS (14.10.2026): Im gestarteten Spiel lief keine Musik.
   Ursache war nicht die Tonwiedergabe, sondern WO die Zuordnung
   lag: Neun von dreizehn Szenen hatten gar kein soundFile im
   Code. Ihre Musik kam ausschliesslich aus der Sound-Leiste der
   Regie, und die schrieb nach sceneAudioFile in die Datenbank.

   Mit der Umstellung auf Sitzungen liest die Karte
   sitzungen/{sid}/stand/sceneAudioFile — in einer frischen
   Sitzung leer. Die fuenfzehn ueber Monate gesetzten
   Zuordnungen lagen weiter in der Wurzel und kamen nicht mit.

   LEHRE, die diese Datei festhaelt: Die Musik einer Szene ist
   INHALT DES ABENTEUERS, kein Spielstand. Sie gehoert ins
   Szenenfile. Die Sound-Leiste bleibt fuer den Live-Wechsel
   (Finale: ritual -> temple -> ending) und ueberschreibt den
   statischen Wert weiterhin — aber ohne Datenbank muss Musik
   laufen.
   ========================================================== */
const fs = require('fs'), path = require('path'), vm = require('vm');
const BASIS = path.join(__dirname, '..');

let f = 0, anzahl = 0;
const chk = (n, c, x) => { anzahl++; console.log((c ? 'OK  ' : 'FAIL') + ' ' + n + (c ? '' : '  <<< ' + JSON.stringify(x))); if (!c) f++; };

/* Szenen ohne Musik — bewusst, nicht vergessen. Wer hier etwas
   eintraegt, soll den Grund danebenschreiben. */
const OHNE_MUSIK = {
  '6.1': 'Golden Lion in der Flaute — hatte auch vor der Umstellung nie eine Zuordnung'
};

const DATEIEN = ['js/scenes.js', 'js/golden_lion_scenes.js', 'js/schatzinsel_scenes.js',
  'js/riffinsel_scenes.js', 'js/grabesinsel_scenes.js', 'js/spanischer_hafen_scenes.js',
  'js/schmugglernest_scenes.js', 'js/artefakthandel_scenes.js', 'js/abspann_scenes.js',
  'js/arena_scenes.js'];
const CONTAINER = ['SCENES', 'GOLDEN_LION_SCENES', 'SCHATZINSEL_SCENES', 'RIFFINSEL_SCENES',
  'GRABESINSEL_SCENES', 'SPANISCHER_HAFEN_SCENES', 'SCHMUGGLERNEST_SCENES',
  'ARTEFAKTHANDEL_SCENES', 'ABSPANN_SCENES', 'ARENA_SCENES'];

const ctx = { console: { log() {}, warn() {} } };
ctx.window = ctx;
vm.createContext(ctx);
DATEIEN.forEach(function (d) {
  try { vm.runInContext(fs.readFileSync(path.join(BASIS, d), 'utf8'), ctx); }
  catch (e) { chk('laedt ' + d, false, e.message); }
});
vm.runInContext('__szenen = [' + CONTAINER.join(',') + '];', ctx);

const szenen = {};
ctx.__szenen.forEach(function (g) {
  if (!g) return;
  Object.keys(g).forEach(function (id) {
    if (g[id] && typeof g[id] === 'object') szenen[id] = g[id];
  });
});

console.log('=== ES GIBT UEBERHAUPT SZENEN ===');
chk('mindestens zehn Szenen geladen', Object.keys(szenen).length >= 10, Object.keys(szenen).length);

console.log('');
console.log('=== JEDE SZENE BRINGT IHRE MUSIK SELBST MIT ===');
Object.keys(szenen).forEach(function (id) {
  const ton = szenen[id].soundFile;
  if (OHNE_MUSIK[id]) {
    chk(id + ' darf ohne Musik sein (' + OHNE_MUSIK[id].split(' — ')[0] + ')', !ton, ton);
    return;
  }
  chk(id + ' hat ein soundFile', !!ton, ton);
});

console.log('');
console.log('=== JEDE GENANNTE DATEI LIEGT WIRKLICH IN audio/ ===');
// Ein Dateiname, der ins Leere zeigt, ist schlimmer als keiner: Die Seite
// setzt die Quelle, der Browser laedt nichts, und es sieht aus wie ein
// Tonproblem statt wie ein Tippfehler.
Object.keys(szenen).forEach(function (id) {
  const ton = szenen[id].soundFile;
  if (!ton) return;
  chk(id + ' -> audio/' + ton, fs.existsSync(path.join(BASIS, 'audio', ton)));
});

console.log('');
console.log('=== MUSIK HAENGT NICHT AN DER DATENBANK ===');
// Der entscheidende Punkt: karte.html liest den Firebase-Wert, faellt aber
// auf das statische Feld zurueck. Ohne Datenbank MUSS also Musik laufen.
const karte = fs.readFileSync(path.join(BASIS, 'karte.html'), 'utf8');
chk('karte.html kennt einen statischen Rueckfall',
    karte.indexOf('getStaticSoundForScene') >= 0);
chk('ohne Datenbank wird der Rueckfall benutzt',
    /if \(!db\) \{ syncAudioForScene\(fallback\); return; \}/.test(karte));
chk('der Firebase-Wert hat Vorrang, faellt aber zurueck',
    karte.indexOf('syncAudioForScene(snap.val() || fallback)') >= 0);
chk('auch ein Lesefehler fuehrt auf den Rueckfall',
    /\}, function \(\) \{\s*syncAudioForScene\(fallback\);/.test(karte));

console.log('');
console.log('OK: ' + (anzahl - f) + '   FEHLER: ' + f);
process.exit(f ? 1 : 0);

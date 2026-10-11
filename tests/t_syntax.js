/* ==========================================================
   SYNTAX — prueft, wie der BROWSER parst
   ----------------------------------------------------------
   Jeden Inline-<script>-Block jeder HTML-Seite und jede
   .js-Datei, als SKRIPT, nicht als Modul - genau so laedt eine
   Seite sie per <script src=...>.

   WARUM NICHT `node --check`:
   Es prueft als CommonJS-Modul, und das ist in eine Funktion
   gewickelt. Ein `return` auf oberster Ebene ist dort ERLAUBT.
   Im Browser ist es ein Syntaxfehler, der die GANZE Datei nicht
   ausfuehrt. Genau das hat im September 2026 die Spielerkarte
   lahmgelegt: Die Sitzungssperre in karte.html brach mit
   `return` ab, die Seite hing stumm auf "verbinde", und
   `node --check` meldete bei jedem Lauf "OK".

   Dazu eine Selbstprobe: Eine Pruefung, die bei leerer Eingabe
   oder kaputtem Muster stillschweigend Erfolg meldet, ist
   schlimmer als keine. Das zweite Teil des Septemberfehlers war
   ein awk-Muster, das den eingerueckten <script>-Tag nicht traf
   und null Zeilen extrahierte.

   Aufruf:  node tests/t_syntax.js
   ========================================================== */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
let ok = 0, bad = 0;

function check(label, code) {
  try { new vm.Script(code, { filename: label }); ok++; }
  catch (e) { bad++; console.log('FEHLER ' + label + ': ' + e.message); }
}

/* Selbstprobe: meldet die Pruefung ein top-level return ueberhaupt? */
let selbstprobe = false;
try { new vm.Script('return 1;', { filename: 'selbstprobe' }); }
catch (e) { selbstprobe = true; }
if (!selbstprobe) {
  console.log('FEHLER: Selbstprobe schlug fehl — ein top-level return wird NICHT gemeldet. ' +
              'Diese Pruefung ist damit wertlos.');
  process.exit(1);
}
console.log('Selbstprobe: ein top-level return wird gemeldet. ✓');

const htmls = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
if (!htmls.length) { console.log('FEHLER: keine HTML-Seite gefunden'); process.exit(1); }

let blocks = 0;
for (const f of htmls) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m, i = 0;
  while ((m = re.exec(src))) {
    // Reine Datenbloecke (JSON-LD o. ae.) waeren hier falsch - gibt es
    // in diesem Projekt nicht, faellt aber auf, wenn es mal welche gibt.
    i++; blocks++; check(f + ' #inline' + i, m[1]);
  }
}
if (!blocks) { console.log('FEHLER: kein Inline-Block gefunden — Muster kaputt?'); process.exit(1); }

const jsdir = path.join(ROOT, 'js');
const jss = fs.readdirSync(jsdir).filter(f => f.endsWith('.js'));
if (!jss.length) { console.log('FEHLER: keine .js-Datei gefunden'); process.exit(1); }
for (const f of jss) check('js/' + f, fs.readFileSync(path.join(jsdir, f), 'utf8'));

console.log('Inline-Blocks: ' + blocks + ' aus ' + htmls.length + ' HTML-Seiten · ' +
            '.js-Dateien: ' + jss.length);

/* ==========================================================
   HAENGENDE REFERENZEN
   ----------------------------------------------------------
   Syntaktisch heile Dateien koennen auf Dinge zeigen, die es
   nicht gibt. Beim Aufraeumen des Figurencode-Modells im
   Oktober 2026 blieben zwei solche Stellen stehen: ein Aufruf
   einer geloeschten Funktion und ein Export, der sie nannte.
   Beides haette im Browser zur Laufzeit geknallt - die
   Syntaxpruefung oben sah nichts.

   Ein require() loest genau das aus: Der Export-Block wird
   ausgefuehrt, und ein unbekannter Name wirft sofort. Geprueft
   werden die Module, die ohne Browser laden koennen.
   ========================================================== */
const MODULE = ['regelwerk', 'sitzung', 'termine', 'arena'];
let mOk = 0;
for (const name of MODULE) {
  const p = path.join(jsdir, name + '.js');
  if (!fs.existsSync(p)) { bad++; console.log('FEHLER: js/' + name + '.js fehlt'); continue; }
  try {
    delete require.cache[require.resolve(p)];
    const mod = require(p);
    const leer = Object.keys(mod).filter(k => mod[k] === undefined);
    if (leer.length) {
      bad++;
      console.log('FEHLER js/' + name + '.js: Export ohne Wert: ' + leer.join(', '));
    } else { ok++; mOk++; }
  } catch (e) {
    bad++;
    console.log('FEHLER js/' + name + '.js laedt nicht: ' + e.message);
  }
}
console.log('Module geladen und Exporte geprueft: ' + mOk + '/' + MODULE.length);
console.log('\nOK: ' + ok + '   FEHLER: ' + bad);
process.exit(bad ? 1 : 0);

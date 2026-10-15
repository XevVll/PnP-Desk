/* ==========================================================
   ABENTEUERTEXT AUF DAS NEUE WERTESYSTEM
   ----------------------------------------------------------
   Seit dem Systemwechsel am 07.09.2026 gibt es Körper, INT,
   Auftreten und Wahrnehmung nicht mehr - der Abenteuertext in
   js/regie.js nannte sie aber weiter. Diese Prüfung begleitet
   die Umstellung Szene für Szene.

   UMGESTELLT listet die Szenen, die durch sind. Eine Szene
   kommt erst dazu, wenn sie wirklich umgestellt ist - so
   wächst die Prüfung mit der Arbeit, statt von Anfang an
   rot zu stehen und damit nichts mehr zu sagen.

   Zwei Dinge, die beim Umstellen leicht kaputtgehen und
   deshalb hier festgenagelt sind:

   1. TRIGGER-IDs DÜRFEN SICH NICHT ÄNDERN. Sie liegen als
      questDone/{szene}/{triggerId} in Firebase. Ein
      umbenanntes "koerper_gut" nimmt der laufenden Kampagne
      ihre gesetzten Haken - und zwar lautlos.

   2. ALTE WERTENAMEN NUR DORT ERSETZEN, WO SIE EINE PROBE
      SIND. "keine feste Mechanik" und Harwicks
      "selbstsicheres Auftreten" sind Prosa und müssen stehen
      bleiben. Ein blindes Suchen-und-Ersetzen hätte genau
      diese beiden zerschossen - deshalb sucht die Prüfung
      nach dem Probenzusammenhang, nicht nach dem Wort.
   ========================================================== */
const fs = require('fs'), path = require('path'), vm = require('vm');
const BASIS = path.join(__dirname, '..');
const R = require(path.join(BASIS, 'js/regelwerk.js'));

let f = 0, anzahl = 0;
const chk = (n, c, x) => { anzahl++; console.log((c ? 'OK  ' : 'FAIL') + ' ' + n + (c ? '' : '  <<< ' + JSON.stringify(x))); if (!c) f++; };

/* Welche Szenen sind durch? */
const UMGESTELLT = ['1.1'];

const SZENEN_DATEIEN = ['scenes', 'golden_lion_scenes', 'schatzinsel_scenes',
  'spanischer_hafen_scenes', 'schmugglernest_scenes', 'riffinsel_scenes',
  'grabesinsel_scenes'];

const ctx = { window: {}, console: { log() {} } };
vm.createContext(ctx);
SZENEN_DATEIEN.concat(['regie']).forEach(d => {
  const p = path.join(BASIS, 'js/' + d + '.js');
  if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx);
});
/* const auf oberster Ebene ist im vm von aussen NICHT als ctx.X
   sichtbar (dokumentierte Falle seit 05.09.2026) - im Kontext holen. */
const ORTE = vm.runInContext('ORTE', ctx);
const alleSzenen = {};
SZENEN_DATEIEN.forEach(d => {
  const name = { scenes: 'SCENES', golden_lion_scenes: 'GOLDEN_LION_SCENES',
    schatzinsel_scenes: 'SCHATZINSEL_SCENES', spanischer_hafen_scenes: 'SPANISCHER_HAFEN_SCENES',
    schmugglernest_scenes: 'SCHMUGGLERNEST_SCENES', riffinsel_scenes: 'RIFFINSEL_SCENES',
    grabesinsel_scenes: 'GRABESINSEL_SCENES' }[d];
  let o = null;
  try { o = vm.runInContext(name, ctx); } catch (e) { /* Datei gibt es nicht */ }
  if (o) Object.keys(o).forEach(k => { alleSzenen[k] = o[k]; });
});

const ALT = ['Körper', 'Auftreten', 'Wahrnehmung', 'Geschick', 'Mechanik', 'Rhetorik',
  'Instinkt', 'Klettern', 'Intelligenz', 'Geheim', 'Menschenkenntnis', 'Seefahrt', 'Survival'];
const ALTE_BAENDER = ['Guter Erfolg', 'Normaler Erfolg', 'Schlechter Erfolg'];
const NEU = R.ATTR_NAMEN.concat(R.FERTIGKEITEN.map(s => s.name));

/* Die Prüfung muss überhaupt etwas zu prüfen finden - sonst meldet sie
   bei leerer Eingabe zuverlässig "OK" (Lehre vom 07.09.2026). */
chk('Szenen geladen', Object.keys(alleSzenen).length >= 10, Object.keys(alleSzenen).length);
chk('Orte geladen', Object.keys(ORTE).length >= 30, Object.keys(ORTE).length);

function markerVon(sid) {
  const s = alleSzenen[sid] || {};
  if (s.markers) return s.markers.map(m => m.id);
  // Basis/Override-Muster (Golden Lion): Marker stehen woanders.
  let basis = null;
  try { basis = vm.runInContext('GOLDEN_LION_MARKERS_BASE', ctx); } catch (e) {}
  if (!basis) return [];
  const versteckt = s.hiddenMarkers || [];
  return basis.map(m => m.id).filter(id => versteckt.indexOf(id) < 0);
}

function textVon(sid) {
  return markerVon(sid).map(id => {
    const o = ORTE[id];
    if (!o || !o.interaktionen) return '';
    return Object.keys(o.interaktionen).map(k => JSON.stringify(o.interaktionen[k])).join(' ');
  }).join(' ');
}

UMGESTELLT.forEach(sid => {
  console.log('');
  console.log('=== SZENE ' + sid + ' — "' + ((alleSzenen[sid] || {}).label || '?') + '" ===');
  const text = textVon(sid);
  chk(sid + ': hat überhaupt GM-Text', text.length > 500, text.length);

  ALT.forEach(w => {
    /* Nur als Probe, nicht als Wort: "Probe: Körper", "Körper-Probe",
       "Probe auf Körper", "Probe der Wache gegen Auftreten". */
    const alsProbe = new RegExp('(' + w + '[- ]?Probe|Probe[^.]{0,40}' + w + ')', 'g');
    const treffer = text.match(alsProbe) || [];
    chk(sid + ': kein "' + w + '" mehr als Probe', treffer.length === 0, treffer);
  });

  ALTE_BAENDER.forEach(b => {
    chk(sid + ': kein Band "' + b + '"', text.indexOf(b) < 0);
  });

  /* Jeder Wert, der als Probe genannt wird, muss es wirklich geben -
     ein Tippfehler wäre sonst eine Probe auf nichts. */
  const genannt = new Set();
  (text.match(/Probe[: ]+([A-ZÄÖÜ][a-zäöüß]+)/g) || []).forEach(m => {
    const w = m.replace(/Probe[: ]+/, '');
    if (w.length > 3) genannt.add(w);
  });
  chk(sid + ': nennt überhaupt Proben', genannt.size > 0, [...genannt]);
  [...genannt].forEach(w => {
    chk(sid + ': "' + w + '" ist ein echter Wert', NEU.indexOf(w) >= 0, [...genannt]);
  });
});

/* ---- Die Trigger-IDs der umgestellten Szenen, festgenagelt ----
   Diese Liste ist bewusst eine KOPIE der IDs, nicht aus dem Code
   abgeleitet: Sie soll anschlagen, wenn jemand eine ID ändert. */
console.log('');
console.log('=== TRIGGER-IDs LIEGEN IN FIREBASE ===');
const ERWARTET = {
  '1.1': ['heuer/zwillinge/koerper_gut', 'heuer/zwillinge/koerper_normal',
    'heuer/zwillinge/koerper_schlecht', 'heuer/zwillinge/auftreten_versucht',
    'heuer/zwillinge/ohnmacht', 'lagerhaeuser/beobachtung/probe_versucht',
    'hafenmeisterei/sonderfall/erkannt_rufmalus', 'bordell/wat_falle/flucht_auftreten',
    'bordell/wat_falle/flucht_fesseln', 'bordell/raubein/sozial']
};
Object.keys(ERWARTET).forEach(sid => {
  const da = [];
  markerVon(sid).forEach(id => {
    const o = ORTE[id];
    if (!o || !o.interaktionen) return;
    Object.keys(o.interaktionen).forEach(k =>
      (o.interaktionen[k].trigger || []).forEach(t => da.push(id + '/' + k + '/' + t.id)));
  });
  ERWARTET[sid].forEach(id => {
    chk(sid + ': Trigger "' + id.split('/').pop() + '" unverändert', da.indexOf(id) >= 0,
      da.filter(x => x.indexOf(id.split('/')[0]) === 0));
  });
});

console.log('');
console.log(f === 0 ? 'OK: ' + anzahl + '   FEHLER: 0' : 'OK: ' + (anzahl - f) + '   FEHLER: ' + f);
process.exit(f ? 1 : 0);

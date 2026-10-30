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
const UMGESTELLT = ['1.1', '3.1'];

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
  /* Die Basis ist beim Golden-Lion-Muster ein OBJEKT (id -> marker),
     beim flachen Muster ein Array. Beides zulassen - sonst bricht die
     Pruefung an der ersten Szene, die nicht Grimsgate ist. */
  const ids = Array.isArray(basis) ? basis.map(m => m.id) : Object.keys(basis);
  return ids.filter(id => versteckt.indexOf(id) < 0);
}

function textVon(sid) {
  return markerVon(sid).map(id => {
    const o = ORTE[id];
    if (!o || !o.interaktionen) return '';
    return Object.keys(o.interaktionen).filter(k => {
      /* Nur was in DIESER Szene wirklich im Panel erscheint. Ohne diesen
         Filter zog eine Szene den Text ihrer Nachbarszenen mit herein -
         eine Szene, die ihre Orte mit einer noch nicht umgestellten teilt
         (3.1 mit 2.1 auf der Golden Lion), waere damit nie eintragbar
         gewesen, obwohl sie selbst sauber ist. */
      const i = o.interaktionen[k];
      if (i.nurSzenen && i.nurSzenen.indexOf(sid) < 0) return false;
      if (i.nichtInSzenen && i.nichtInSzenen.indexOf(sid) >= 0) return false;
      return true;
    }).map(k => JSON.stringify(o.interaktionen[k])).join(' ');
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

console.log('=== DIE INSEL HAT EINEN PUNKTESTAND (4.1) ===');
/* Am 23.10.2026 habe ich zehn der Dorf-Aufgaben mit [BEIWERK] beklebt und ins
   Szenenziel geschrieben, man solle drei bis vier davon spielen und "den Rest
   liegen lassen". Die Rede an der Hoehle verlangt aber eine Mindestzahl
   geloester Aufgaben - bei drei von fuenfzehn ist die Schwelle NIE erreichbar.
   Die Gegenrede waere damit lautlos ausgefallen und jede Gruppe in den
   Fehlschlag-Pfad gezwungen; fuer die Spielleitung nicht als Fehler erkennbar,
   weil es sich wie ihre eigene Entscheidung anfuehlt.

   Dieselbe Fehlerklasse wie arenaBossLebt() am 18.10.: eine Pflichtmechanik,
   die wirkungslos wird, statt sichtbar zu brechen. Diese Pruefung haelt drei
   Dinge zusammen, die auseinanderlaufen koennen:
     - jede Dorf-Aufgabe traegt ihre Marke
     - die Zahl im Szenenziel stimmt mit der gezaehlten
     - die genannte SCHWELLE ist ueberhaupt erreichbar                      */
const DORF_ORTE = { dorf_platz: 'Dorfplatz', dorf_markt: 'Markt',
  dorf_heilerin: 'Heilerin', dorf_tempel: 'Tempel' };
const gez = {};
let aufgaben = 0;
Object.keys(DORF_ORTE).forEach(id => {
  const o = ORTE[id];
  const ks = (o && o.interaktionen) ? Object.keys(o.interaktionen) : [];
  gez[id] = 0;
  ks.forEach(k => {
    const kurz = o.interaktionen[k].kurz || '';
    chk(id + '/' + k + ' traegt [DORF-AUFGABE]', kurz.indexOf('[DORF-AUFGABE]') === 0,
      kurz.slice(0, 40));
    if (kurz.indexOf('[DORF-AUFGABE]') === 0) { gez[id]++; aufgaben++; }
  });
  chk(id + ' hat ueberhaupt Aufgaben', gez[id] > 0, gez[id]);
});

const SZ = vm.runInContext('SZENEN_REGIE', ctx);
const ziel = (SZ['4.1'] || {}).uebergeordnetesZiel || '';
const mZahl = ziel.match(/Die (\d+) Begegnungen mit der Marke/);
chk('Szenenziel nennt die Zahl der Dorf-Aufgaben', !!mZahl, ziel.slice(0, 80));
if (mZahl) chk('Szenenziel: ' + mZahl[1] + ' == gezaehlt ' + aufgaben,
  Number(mZahl[1]) === aufgaben, { ziel: mZahl[1], gezaehlt: aufgaben, je: gez });

/* Die Aufschluesselung je Ort (Dorfplatz 7 / Markt 5 / ...) stand bis zum
   25.10.2026 im Szenenziel und wurde hier dagegen geprueft. Das Ziel ist
   jetzt kurz, die Aufschluesselung steht in Bibel 7.1a - eine Markdown-
   Tabelle zu parsen waere fragiler als nuetzlich. Die Zahlen je Ort werden
   weiter gezaehlt und in der Fehlermeldung der Gesamtzahl mitgegeben. */

/* DER KERN: die genannte Schwelle muss erreichbar sein. */
const mS = ziel.match(/(\d+) bis (\d+) reichen/);
chk('Szenenziel nennt eine Schwelle', !!mS, ziel.slice(0, 120));
if (mS) {
  chk('Schwelle ' + mS[1] + '-' + mS[2] + ' ist erreichbar (<= ' + aufgaben + ')',
    Number(mS[2]) <= aufgaben, { schwelle: mS[2], aufgaben: aufgaben });
  chk('Schwelle ist keine Null', Number(mS[1]) > 0, mS[1]);
}

/* Keine Insel-Interaktion ohne Marke - eine unmarkierte ist im Panel nicht als
   tragend oder optional zu erkennen. */
markerVon('4.1').forEach(id => {
  const o = ORTE[id];
  if (!o || !o.interaktionen) return;
  Object.keys(o.interaktionen).forEach(k => {
    const it = o.interaktionen[k];
    if (it.nurSzenen && it.nurSzenen.indexOf('4.1') < 0) return;
    if (it.nichtInSzenen && it.nichtInSzenen.indexOf('4.1') >= 0) return;
    chk(id + '/' + k + ' hat eine Marke', /^\[[^\]]+\]/.test(it.kurz || ''),
      (it.kurz || '').slice(0, 40));
  });
});

/* Die Rede ist der Hoehepunkt und liegt seit dem 25.10.2026 an der HOEHLE.
   Haengt sie jemand zurueck ins Dorf, bricht Hendriks Reihenfolge
   (Dorf -> Schiff -> Hoehle) und der Aufruhr hat keine Buehne mehr. */
chk('die_gegenrede liegt an "hoehle"',
  !!((ORTE.hoehle.interaktionen || {}).die_gegenrede), Object.keys(ORTE.hoehle.interaktionen));
chk('die_gegenrede liegt NICHT mehr an "stammesdorf"',
  !((ORTE.stammesdorf.interaktionen || {}).die_gegenrede),
  Object.keys(ORTE.stammesdorf.interaktionen));
chk('das Handgemenge ist der Fehlschlag-Pfad',
  !!((ORTE.hoehle.interaktionen || {}).das_handgemenge), Object.keys(ORTE.hoehle.interaktionen));
chk('die_warnung ist das Scharnier ins zweite Tagwerk',
  !!((ORTE.stammesdorf.interaktionen || {}).die_warnung),
  Object.keys(ORTE.stammesdorf.interaktionen));

/* Die sechs Trigger-IDs der Rede sind beim Umzug mitgewandert. Sie liegen als
   questDone/4.1/{id} in Firebase - umbenannt nehmen sie der laufenden Kampagne
   lautlos ihre Haken. Als KOPIE festgenagelt, nicht aus dem Code abgeleitet. */
['sorathi_unterbricht', 'menge_bildet_sich', 'haeuptling_rede_gegen_vanthei',
  'gegenrede_erfolg', 'gegenrede_misslingt', 'zeit_abgelaufen_diebstahl'].forEach(id => {
  const da = (ORTE.hoehle.interaktionen.die_gegenrede.trigger || []).map(t => t.id);
  chk('Rede-Trigger "' + id + '" unveraendert', da.indexOf(id) >= 0, da);
});
chk('die Rede hat weiterhin drei redeTeile',
  (ORTE.hoehle.interaktionen.die_gegenrede.redeTeile || []).length === 3,
  (ORTE.hoehle.interaktionen.die_gegenrede.redeTeile || []).length);


/* ===== DER ARTEFAKTHANDEL (9.1) UND DER WEG ZUR PFLICHTINSEL =====
   Hendrik, 30.10.2026: Der Spieler mit Harwicks Abschriften soll die Insel mit
   dem Jaguar-Saebel SELBST entdecken - "Diesen Hinweis soll er dann mit den
   Artefakten zusammen bekommen." Damit haengt der Pflichtweg ins Finale an
   dieser Kette, und drei Dinge koennen daran lautlos brechen. */
const HANDEL = ORTE.handelstreffen.interaktionen || {};

/* 1. Die Reihenfolge. Das Artefakt wird VOR dem Hoehepunkt gesichert - nur dann
   kann der Spieler es mit seinen Abschriften vergleichen. Lag es wieder am Ende
   der Szene (so stand es bis zum 30.10.), ist "die_lage_der_insel" unspielbar. */
['das_fremde_schiff', 'verrat_gefangen', 'erster_kampf', 'kinder_entdeckt',
  'harwicks_wahn', 'kinder_retten', 'artefakt_und_uebergabe',
  'die_lage_der_insel'].forEach(k => {
  chk('9.1 Kette: "' + k + '" vorhanden', !!HANDEL[k], Object.keys(HANDEL));
});
const REIHE = Object.keys(HANDEL);
chk('das Artefakt ist gesichert, BEVOR die Lage der Insel gelesen wird',
  REIHE.indexOf('artefakt_und_uebergabe') >= 0
  && REIHE.indexOf('artefakt_und_uebergabe') < REIHE.indexOf('die_lage_der_insel'),
  REIHE);

/* 2. Der Buendel-Faden muss 9.1 ERREICHEN. Bis zum 30.10. trug er
   nurSzenen: ["2.1","5.1","6.1"] - auf der Spanier-Route (7.1 -> 9.1) erschien
   die Interaktion damit gar nicht im Panel, die drei Lesetage waren
   unerreichbar. Geprueft wird die Erreichbarkeit, nicht der Wortlaut. */
const BUENDEL = (ORTE.kapitaenskajuete.interaktionen || {}).das_buendel;
chk('das_buendel existiert', !!BUENDEL, Object.keys(ORTE.kapitaenskajuete.interaktionen));
['2.1', '5.1', '6.1', '7.1', '9.1'].forEach(sz => {
  chk('das_buendel ist in "' + sz + '" erreichbar',
    (BUENDEL.nurSzenen || []).indexOf(sz) >= 0, BUENDEL.nurSzenen);
});

/* 3. Der Notausgang. Der Weg zur Pflichtinsel darf an keinem Wurf scheitern
   (dieselbe Regel wie in der Flaute, Bibel 7.4). Ohne diesen Trigger kann eine
   Gruppe, die nicht darauf kommt, den Jaguar-Saebel nie erreichen - und das
   Finale ist ohne ihn nicht zu gewinnen (12.1). */
const LAGE = HANDEL.die_lage_der_insel;
const LAGE_IDS = (LAGE.trigger || []).map(t => t.id);
['artefakt_in_der_hand', 'zeichen_wiedererkannt', 'lage_erfolg', 'lage_misserfolg',
  'harwick_bestaetigt', 'keine_begruendung',
  'kurs_steht_dann_flucht'].forEach(id => {
  chk('die_lage_der_insel traegt "' + id + '"', LAGE_IDS.indexOf(id) >= 0, LAGE_IDS);
});
chk('der Notausgang steht ausdruecklich da (Harwick nennt die Lage selbst)',
  /harwick_bestaetigt/.test(LAGE_IDS.join(',')) && /nicht an einem Wurf|kein Wurf|darf nicht/i
    .test(JSON.stringify(LAGE)), LAGE_IDS);

/* 4. Tom ENTDECKT die Insel nicht mehr. Stand der Kurs schon, waere ein Tom,
   der das Eiland findet, ein Widerspruch - nicht nur ein doppelter Beat.
   Die ID bleibt (questDone/10.1/riffinsel_erkannt), die Bedeutung wechselt. */
const KURS = (ORTE.achterdeck.interaktionen || {}).kurs_aufs_riff;
chk('kurs_aufs_riff existiert weiterhin', !!KURS,
  Object.keys(ORTE.achterdeck.interaktionen));
chk('Trigger-ID "riffinsel_erkannt" unveraendert',
  (KURS.trigger || []).map(t => t.id).indexOf('riffinsel_erkannt') >= 0,
  (KURS.trigger || []).map(t => t.id));
chk('Tom bestaetigt das Riff, er findet die Insel nicht',
  /bestätigt|bestaetigt/i.test(KURS.title + ' '
    + (KURS.trigger || []).map(t => t.label).join(' ')),
  KURS.title);

console.log('');
console.log(f === 0 ? 'OK: ' + anzahl + '   FEHLER: 0' : 'OK: ' + (anzahl - f) + '   FEHLER: ' + f);
process.exit(f ? 1 : 0);

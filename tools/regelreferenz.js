/* ==========================================================
   REGELREFERENZ.md erzeugen
   ----------------------------------------------------------
   Aufruf:  node tools/regelreferenz.js
            node tools/regelreferenz.js --pruefen   (schreibt nicht)

   WAS DIESES SKRIPT ERZEUGT UND WAS NICHT - die Trennung ist der
   eigentliche Punkt:

     Die REGEL wird von Hand geschrieben und steht in
     KAMPAGNEN-BIBEL.md Abschnitt 4. Sie kommt aus Savage Worlds,
     nicht aus unserem Code. Der Spickzettel oben in REGELREFERENZ.md
     ist ihre Kurzfassung und wird ebenfalls von Hand gepflegt -
     dieses Skript fasst ihn nicht an.

     Die TABELLEN sind unsere eigenen Inhalte: unsere 41 Talente,
     unsere 20 Schwaechen, unsere Ausruestung. Die stehen in
     js/regelwerk.js, und von dort werden sie hier abgeschrieben.
     Eine Liste von Hand zu pflegen, die daneben schon im Code
     steht, heisst nur, zwei Fassungen auseinanderlaufen zu lassen.

   Deshalb ersetzt der Lauf AUSSCHLIESSLICH den Block zwischen
   ERZEUGT:ANFANG und ERZEUGT:ENDE. Alles davor und danach bleibt,
   wie Hendrik es geschrieben hat.

   Rechtliches, kurz: Savage Worlds hat keinen SRD, und die Fan
   License erlaubt nicht, Regeltext aus dem Buch zu uebernehmen.
   Dieses Repo ist oeffentlich. Was hier steht, ist deshalb
   durchweg selbst geschrieben - Mechanik uebernommen, Worte eigene.
   ========================================================== */
const fs = require('fs');
const path = require('path');

const BASIS = path.join(__dirname, '..');
/* --ziel <pfad> laesst den Generator auf eine Kopie laufen. Nur fuer den Test
   da: Er muss belegen koennen, dass ein Lauf den handgeschriebenen Teil nicht
   anfasst - und das soll er nicht am echten Repo ausprobieren. */
const zielArg = process.argv.indexOf('--ziel');
const ZIEL = zielArg >= 0 && process.argv[zielArg + 1]
  ? path.resolve(process.argv[zielArg + 1])
  : path.join(BASIS, 'REGELREFERENZ.md');
const R = require(path.join(BASIS, 'js/regelwerk.js'));

const ANFANG = '<!-- ERZEUGT:ANFANG — alles bis ERZEUGT:ENDE kommt aus js/regelwerk.js. ' +
  'Nicht von Hand ändern, sondern `node tools/regelreferenz.js` laufen lassen. -->';
const ENDE = '<!-- ERZEUGT:ENDE -->';

/* Eine Tabellenzelle darf die Tabelle nicht sprengen. */
function z(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ').trim();
}
function wuerfel(stufe) { return R.DLBL[stufe] || '—'; }

function vorText(vor) {
  if (!vor || !vor.length) return '—';
  return vor.map(function (v) { return v[0] + ' ' + wuerfel(v[1]); }).join(', ');
}

function erzeuge() {
  const t = [];
  t.push(ANFANG);
  t.push('');

  /* ---------- Attribute ---------- */
  t.push('## Attribute');
  t.push('');
  t.push('Fünf Stück, jedes beginnt auf d4. Stärke und Konstitution tragen bewusst **keine**');
  t.push('Fertigkeiten — sie werden direkt gewürfelt.');
  t.push('');
  t.push('| Attribut | Kurz | Wofür | Fertigkeiten daran |');
  t.push('|---|---|---|---|');
  R.ATTRIBUTE.forEach(function (a) {
    const n = R.FERTIGKEITEN.filter(function (f) { return f.attr === a.name; }).length;
    t.push('| **' + z(a.name) + '** | ' + z(a.kurz) + ' | ' + z(a.d) + ' | ' + n + ' |');
  });
  t.push('');

  /* ---------- Fertigkeiten ---------- */
  const kern = R.FERTIGKEITEN.filter(function (f) { return f.kern; });
  t.push('## Fertigkeiten');
  t.push('');
  t.push('Jede hängt an **genau einem** Attribut. Eine Stufe kostet 1 Punkt bis zur Höhe ihres');
  t.push('Attributs, darüber 2 — ein hohes Attribut macht also alles billiger, was daran hängt.');
  t.push('**Kernfertigkeiten** (' + kern.map(function (f) { return f.name; }).join(', ') +
    ') starten frei auf d4.');
  t.push('');
  t.push('| Fertigkeit | Attribut | Kern | Wofür |');
  t.push('|---|---|---|---|');
  R.FERTIGKEITEN.slice().sort(function (a, b) {
    return a.attr.localeCompare(b.attr, 'de') || a.name.localeCompare(b.name, 'de');
  }).forEach(function (f) {
    t.push('| **' + z(f.name) + '** | ' + z(f.attr) + ' | ' + (f.kern ? 'ja' : '—') +
      ' | ' + z(f.d) + ' |');
  });
  t.push('');

  /* ---------- Ränge ---------- */
  t.push('## Ränge');
  t.push('');
  t.push('Je vier Steigerungen ein Rang. Am Rang hängen die Talente — das ist sein eigentlicher');
  t.push('Zweck. Neue Figuren sind Novize, sofern die Spielleitung nichts anderes freigibt.');
  t.push('');
  t.push('| Rang | ab Steigerung | Talente, die er freischaltet |');
  t.push('|---|---|---|');
  R.RAENGE.forEach(function (r) {
    const n = R.TALENTE.filter(function (x) { return x.rang === r.id; }).length;
    t.push('| **' + z(r.name) + '** | ' + r.abSteigerung + ' | ' + n + ' |');
  });
  t.push('');

  /* ---------- Steigerungen ---------- */
  t.push('## Was eine Steigerung kaufen kann');
  t.push('');
  t.push('| Art | Einschränkung |');
  t.push('|---|---|');
  R.STEIGERUNG_ARTEN.forEach(function (s) {
    t.push('| **' + z(s.n) + '** | ' + z(s.d) + ' |');
  });
  t.push('');

  /* ---------- Talente ---------- */
  /* nurNsc bleibt draussen: Diese Referenz ist fuer Spieler. Die
     figurgebundenen Talente stehen in js/npcs.js bei ihrer Figur. */
  const talSpielbar = R.TALENTE.filter(function (x) { return !x.nurNsc; });
  t.push('## Talente (' + talSpielbar.length + ')');
  t.push('');
  t.push('Eine neue Figur hat ' + R.GRATIS_TALENTE + ' freies Talent; jedes weitere kostet ' +
    R.TALENT_KOSTEN + ' Punkte aus Schwächen.');
  t.push('Der **Rang ist eine harte Sperre** — den kauft man sich nicht. Eine fehlende');
  t.push('**Wert**-Voraussetzung sperrt bei der Erschaffung dagegen nicht, sie wird zum Ziel.');
  t.push('');
  R.TALENT_KATEGORIEN.forEach(function (kat) {
    const liste = talSpielbar.filter(function (x) { return x.kat === kat; });
    if (!liste.length) return;
    const fuerNovizen = liste.filter(function (x) { return x.rang === 0; }).length;
    t.push('### ' + z(kat) + ' — ' + liste.length + ', davon ' + fuerNovizen + ' für Novizen');
    t.push('');
    t.push('| Talent | ab Rang | Voraussetzung | Wirkung |');
    t.push('|---|---|---|---|');
    liste.forEach(function (x) {
      t.push('| **' + z(x.n) + '** | ' + z(R.RAENGE[x.rang] ? R.RAENGE[x.rang].name : x.rang) +
        ' | ' + z(vorText(x.vor)) + ' | ' + z(x.d) + ' |');
    });
    t.push('');
  });

  /* ---------- Schwächen ---------- */
  const hndSpielbar = R.HANDICAPS.filter(function (h) { return !h.nurNsc; });
  const schwer = hndSpielbar.filter(function (h) { return h.schwer; });
  const leicht = hndSpielbar.filter(function (h) { return !h.schwer; });
  t.push('## Schwächen (' + hndSpielbar.length + ')');
  t.push('');
  t.push('Vollständig **freiwillig**. Höchstens ' + R.MAX_SCHWER + ' schwere (2 Punkte) und ' +
    R.MAX_LEICHT + ' leichte (1 Punkt), also nie mehr als ' +
    (R.MAX_SCHWER * 2 + R.MAX_LEICHT) + ' Punkte.');
  t.push('Punkte kaufen in dieser Fassung **ausschließlich** Talente — ein ungerader Punkt');
  t.push('verfällt also.');
  t.push('');
  t.push('**Haken** heißt: Die Schwäche senkt keinen Würfel, sondern verpflichtet. Sie gibt der');
  t.push('Spielleitung etwas, woran sie die Figur aufhängt. ' +
    hndSpielbar.filter(function (h) { return h.haken; }).length + ' der ' +
    R.HANDICAPS.length + ' sind von dieser Art.');
  t.push('');
  [['Schwer (2 Punkte)', schwer], ['Leicht (1 Punkt)', leicht]].forEach(function (paar) {
    t.push('### ' + paar[0] + ' — ' + paar[1].length);
    t.push('');
    t.push('| Schwäche | Art | Wirkung |');
    t.push('|---|---|---|');
    paar[1].forEach(function (h) {
      t.push('| **' + z(h.n) + '** | ' + (h.haken ? 'Haken' : 'Wert') + ' | ' + z(h.d) + ' |');
    });
    t.push('');
  });

  /* ---------- Ausrüstung ---------- */
  t.push('## Ausrüstung (' + R.AUSRUESTUNG.length + ')');
  t.push('');
  t.push('Startgeld ' + R.STARTGELD + ' Münzen. **Waffen bringen einen eigenen Schadenswürfel**');
  t.push('mit, keinen Bonus — in diesem System wird nichts addiert. Rüstung hebt die Robustheit.');
  t.push('Die Traglast hängt an der Stärke (doppelte Seitenzahl); **Überladung kostet eine');
  t.push('Würfelstufe**, genau wie eine Wunde.');
  t.push('');
  R.AUSR_ARTEN.forEach(function (art) {
    const liste = R.AUSRUESTUNG.filter(function (a) { return a.art === art; });
    if (!liste.length) return;
    t.push('### ' + z(art));
    t.push('');
    t.push('| Gegenstand | Schaden | Rüstung | Schuss/Ladungen | Gewicht | Preis | Anmerkung |');
    t.push('|---|---|---|---|---|---|---|');
    liste.forEach(function (a) {
      /* Munition bringt Ladungen statt Schaden - ohne die Spalte waere die
         wichtigste Zahl der ganzen Ware nicht zu sehen. */
      const zusatz = a.ladungen ? a.ladungen + ' Ladungen'
                   : (a.schuss ? a.schuss + ' Schuss' : '—');
      t.push('| **' + z(a.n) + '** | ' + (a.schaden ? wuerfel(a.schaden) : '—') +
        ' | ' + (a.ruest ? '+' + a.ruest : '—') + ' | ' + zusatz +
        ' | ' + (a.gew || 0) +
        ' | ' + (a.preis || 0) + ' | ' + z(a.d) + ' |');
    });
    t.push('');
  });

  /* ---------- Steckbrief ---------- */
  t.push('## Steckbrief');
  t.push('');
  t.push('Fünf Felder ohne Zahlen. **Prüfstein: Jede Frage muss zum Zeitpunkt der Erschaffung');
  t.push('beantwortbar sein** — die Figur kennt weder die Gruppe noch ein Schiff.');
  t.push('');
  t.push('| Feld | Frage |');
  t.push('|---|---|');
  R.STECKBRIEF.forEach(function (b) {
    t.push('| **' + z(b.n) + '** | ' + z(b.frage) + ' |');
  });
  t.push('');

  /* ---------- Chancen ---------- */
  t.push('## Wie oft gelingt eine Probe?');
  t.push('');
  t.push('Gegen Zielwert ' + R.ZIELZAHL + ', ohne Erschwernis, mit Wild Die. Aus `chancen()`,');
  t.push('also exakt gerechnet und nicht simuliert.');
  t.push('');
  t.push('| Wert | Steigerung | Erfolg | Misserfolg | Patzer |');
  t.push('|---|---|---|---|---|');
  function zeile(label, c) {
    const p = function (x) { return (x * 100).toFixed(1).replace('.', ',') + ' %'; };
    t.push('| ' + label + ' | ' + p(c.steigerung) + ' | ' + p(c.erfolg) + ' | ' +
      p(c.miss) + ' | ' + p(c.patzer) + ' |');
  }
  zeile('ungelernt (d4−2)', R.chancen(0));
  [1, 2, 3, 4, 5].forEach(function (st) { zeile(wuerfel(st), R.chancen(st)); });
  t.push('');
  t.push('Eine Eigenheit des Originals, die am Tisch auffällt: **d6 holt öfter eine Steigerung');
  t.push('als d8**, weil ein d6 häufiger explodiert. Das ist kein Fehler im Code.');
  t.push('');

  t.push('---');
  t.push('');
  t.push('_Erzeugt aus `js/regelwerk.js` durch `node tools/regelreferenz.js`._');
  t.push(ENDE);
  return t.join('\n');
}

/* ---------- Gerüst, falls die Datei noch nicht existiert ----------
   Der Spickzettel wird danach von Hand gepflegt. */
const GERUEST = [
  '# Regelreferenz — Korsaren',
  '',
  'Schnelles Nachschlagen am Tisch. **Die Regel selbst steht in',
  '[KAMPAGNEN-BIBEL.md](KAMPAGNEN-BIBEL.md), Abschnitt 4** — hier steht ihre Kurzfassung plus',
  'alle Listen dieser Kampagne.',
  '',
  '> Gespielt wird **Savage Worlds**. Savage Worlds hat keinen SRD, und die Fan License erlaubt',
  '> nicht, Regeltext aus dem Buch zu übernehmen — dieses Repo ist öffentlich. Alles hier ist',
  '> deshalb selbst geschrieben: Mechanik übernommen, Worte eigene. Für Regelfragen, die hier',
  '> nicht beantwortet sind, gilt das Original.',
  '',
  '---',
  '',
  '## Spickzettel',
  '',
  '**Die Probe.** Ein Würfel, Zielwert **immer 4**. Nichts wird addiert. Dazu wirft jede',
  'Heldenfigur einen **Wild Die** (separater d6) — **das höhere der beiden Gesamtergebnisse',
  'zählt**, nie die Summe. Statisten haben keinen Wild Die.',
  '',
  '**Ass (explodierender Würfel).** Zeigt ein Würfel **seine eigene Höchstzahl**, wird er sofort',
  'erneut geworfen und addiert — Kettenreaktion möglich. Maßgeblich ist die Höchstzahl *dieses',
  'einen Würfels*: Wer d8 hat, dessen Wild Die ist trotzdem ein d6 und explodiert bei einer 6.',
  '',
  '**Steigerung.** Je **volle 4 Punkte über dem Zielwert**:',
  '',
  '| Ergebnis | 4–7 | 8–11 | 12–15 | 16+ |',
  '|---|---|---|---|---|',
  '| | Erfolg | 1 Steigerung | 2 Steigerungen | 3 Steigerungen |',
  '',
  'Eine Steigerung hat **nichts** mit dem Maximalwurf zu tun. Ein d12 mit einer 8 bringt eine,',
  'ohne zu explodieren; ein d4, der auf 4 explodiert und 3 nachwirft, bringt mit 7 keine.',
  'Im Kampf heißt eine Steigerung beim Schadenswurf mehr Schaden.',
  '',
  '**Erschwernis** ist ein **flacher Modifikator**, keine höhere Zielzahl und keine gesenkte',
  'Würfelstufe. „Du brauchst eine 8" **ist** −4, weil der Zielwert immer 4 bleibt:',
  '',
  '| Modifikator | +2 | 0 | −2 | −4 |',
  '|---|---|---|---|---|',
  '| nötig | 2 | 4 | 6 | 8 |',
  '',
  '**Wunden.** Jede zieht flach **1** ab, höchstens 3; die vierte ist *außer Gefecht*.',
  'Überladung zieht ebenso ab. **Angeschlagen** kostet **keinen** Abzug — das ist eine',
  'Zeitstrafe, keine Werteinbuße.',
  '',
  '**Bennie.** 3 je Sitzung (mit *Glückspilz* 4). Einer wiederholt eine misslungene Probe',
  'vollständig — das bessere Ergebnis zählt, wobei erst das Band zählt und dann die Zahl.',
  '',
  '**Kritischer Patzer.** Beide Würfel zeigen eine natürliche 1.',
  '',
  '**Ungelernt** ist d4 mit **−2** — nicht „gar kein Würfel". Gelingt also, nur selten.',
  '',
  '---',
  ''
].join('\n');

/* ---------- Lauf ---------- */
const erzeugt = erzeuge();
const pruefen = process.argv.indexOf('--pruefen') >= 0;

let alt = fs.existsSync(ZIEL) ? fs.readFileSync(ZIEL, 'utf8') : null;
let neu;
if (alt === null) {
  neu = GERUEST + erzeugt + '\n';
} else {
  const a = alt.indexOf(ANFANG);
  const e = alt.indexOf(ENDE);
  if (a < 0 || e < 0) {
    console.error('ABBRUCH: Die Marken ERZEUGT:ANFANG / ERZEUGT:ENDE fehlen in ' + ZIEL + '.');
    console.error('Ohne sie waere nicht zu erkennen, was von Hand geschrieben ist - und ein');
    console.error('Lauf wuerde Hendriks Text ueberschreiben. Marken wiederherstellen.');
    process.exit(2);
  }
  neu = alt.slice(0, a) + erzeugt + alt.slice(e + ENDE.length);
}

if (pruefen) {
  if (alt === neu) { console.log('REGELREFERENZ.md ist aktuell.'); process.exit(0); }
  console.error('REGELREFERENZ.md ist VERALTET — `node tools/regelreferenz.js` laufen lassen.');
  process.exit(1);
}

if (alt === neu) { console.log('REGELREFERENZ.md war schon aktuell.'); process.exit(0); }
fs.writeFileSync(ZIEL, neu, 'utf8');
console.log((alt === null ? 'REGELREFERENZ.md angelegt' : 'REGELREFERENZ.md aktualisiert') +
  ' — ' + neu.split('\n').length + ' Zeilen.');

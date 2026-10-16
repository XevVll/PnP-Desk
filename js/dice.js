// Würfelleiste und szenenübergreifender Würfel-Feed.
//
// Läuft identisch auf karte.html UND regie.html - initDiceRoller(db, optionen)
// wird von beiden Seiten direkt nach dem Aufbau der Datenbank aufgerufen.
// `db` kommt als Parameter herein statt aus geteiltem Scope gelesen zu werden,
// damit es keine Rolle spielt, in welcher Reihenfolge die Seiten ihre eigenen
// Skripte laden (kein TDZ-Risiko).
//
// ---- Umbau Oktober 2026: die Leiste kennt jetzt die Regeln ----
// Vorher bot sie prominent einen W100 an und per Vorgabe einen d20 - beide
// gibt es im Regelwerk seit dem Systemwechsel nicht mehr. Gewürfelt wurde roh,
// ohne Wild Die, ohne Explodieren, ohne Einordnung. Der Heldenbrief konnte all
// das längst; am Tisch standen damit zwei Würfel nebeneinander, von denen einer
// das Spiel nicht kannte.
//
// Jetzt zwei Ebenen:
//   1. DIE WERTE DER FIGUR, prominent. In Savage Worlds ist der Würfel keine
//      Wahl - er kommt aus dem Wert. Gewürfelt wird über wurf() aus
//      js/regelwerk.js, also DIESELBE Funktion wie im Heldenbrief, nicht eine
//      zweite Fassung derselben Regel.
//   2. FREIE WÜRFEL d4-d12, klein, aber IMMER sichtbar - auch eingeklappt.
//      Schaden hängt an keiner Fertigkeit (elf Waffen tragen einen eigenen
//      Schadenswürfel), die Spielleitung würfelt für Statisten, und "wirf mir
//      mal einen d6" passiert an jedem Tisch. Sie explodieren wie eine Probe,
//      weil Schaden das in Savage Worlds ebenso tut - abschaltbar, weil eine
//      Zufallstabelle es nicht darf.
//
// ---- Zwei Pfade, zwei Lebensdauern ----
//   diceRolls/{pushId}              - der Feed. Flüchtig, siehe MAX_AGE unten.
//   sitzungen/{sid}/protokoll/{id}  - das Protokoll. BLEIBT, trägt Szene und
//                                     Ort und landet im Session-Export.
// Nur Wertproben kommen ins Protokoll. Freie Würfel sind Schaden und Zufall;
// sie würden das Dokument zuschütten, ohne über den Abend etwas zu sagen.
// "sitzungen" ist kein Spielstands-Pfad und geht deshalb ungefiltert durch die
// Sitzungs-Hülle - die Sitzung muss selbst in den Pfad.
//
// ---- Anforderung der Spielleitung ----
//   figuren/{schluessel}/anfrage = { wert, mod, von, ts, grund? }
//                                 oder, seit 15.10.2026:
//     { art:'schaden', wuerfel:[{stufe,was}], grund, von, ts }
// Bewusst am Figurenknoten und NICHT als eigener Top-Level-Pfad: Ein neuer
// Pfad müsste in SITZUNGS_PFADE UND in firebase-rules.json stehen und von Hand
// veröffentlicht werden. "figuren" ist beides längst. Überschrieben wird die
// Anfrage dabei nicht - beide Figurenseiten schreiben mit update(), nie set().
//
// "Prune on read": jeder Client mit offenem Feed räumt bei jedem Snapshot
// Einträge auf, die älter als MAX_AGE_MS sind - kein Cron/Cloud-Function
// nötig. .remove() auf einen bereits entfernten Key ist ein No-Op, mehrere
// Clients können also gleichzeitig aufräumen, ohne sich ins Gehege zu kommen.
// `ts` wird über ServerValue.TIMESTAMP gesetzt (nicht Date.now()), weil hier
// mehrere Spieler-Geräte mit potenziell abweichenden Uhren Einträge anlegen.

const DICE_MAX_AGE_MS = 90000;      // Feed-Einträge werden nach 90s entfernt
/* Wie lange der Würfel im Porträt rollt, bevor das Ergebnis steht.
   Steht HIER und nicht in karte.html: Die Karte lässt den Würfel
   rollen, der Feed muss genauso lange warten - sonst steht das
   Ergebnis schon in der Einblendung, während der Würfel noch dreht,
   und die Animation wäre Zierde statt Spannung. */
const DICE_ANIM_MS = 2000;
const DICE_VISIBLE_MS = 60000;      // Toast bleibt 60s sichtbar
const DICE_FADE_MS = 400;
const DICE_NAME_MAX_LEN = 24;
const DICE_ANZ_MIN = 1, DICE_ANZ_MAX = 6;
const DICE_EX_GRENZE = 50;          // Sicherung gegen eine endlose Explosion

// Umrisse der echten Körper. Die Form trägt die Erkennung, nicht die
// Beschriftung: Dreieck, Quadrat, Raute, Drachen, Fünfeck.
//
// Alle Zahlen stehen auf DERSELBEN Hoehe (DICE_ZAHL_Y). Vorher trug jede Form
// ihren eigenen Mittelpunkt - den Schwerpunkt der Flaeche, also beim Dreieck
// und beim Fuenfeck deutlich tiefer. Jede Zahl sass damit zwar schoen in ihrer
// Form, aber die Reihe las sich als Zickzack: 4 und 12 standen sichtbar tiefer
// als 6, 8 und 10. Nebeneinander wiegt die gemeinsame Linie schwerer als die
// optische Mitte der einzelnen Form. (Hendriks Meldung, 14.10.2026.)
const DICE_ZAHL_Y = 50;
const DICE_FORMEN = {
  4:  { punkte: '50,14 93,85 7,85' },
  6:  { punkte: '14,14 86,14 86,86 14,86' },
  8:  { punkte: '50,9 89,50 50,91 11,50' },
  10: { punkte: '50,6 90,38 50,94 10,38' },
  12: { punkte: '50,9 93,40 77,90 23,90 7,40' }
};

// Der Stil wohnt hier und nicht in den Seiten: Die Leiste läuft auf zwei
// Seiten, und zwei Kopien desselben CSS laufen auseinander.
const DICE_STIL = [
  // Mittig unten: links lag sie ueber der Spieler-Portraetleiste.
  '#wuerfelLeiste{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:350;',
  '  max-width:min(26rem,calc(100vw - 32px));background:rgba(15,12,8,.88);',
  '  border:1px solid #3a2a18;border-radius:14px;padding:9px 12px;backdrop-filter:blur(3px);',
  '  font-family:Georgia,"Times New Roman",serif;font-size:12.5px;color:#e6ddc7}',
  '#wuerfelLeiste button{font-family:inherit;cursor:pointer}',
  '#wuerfelLeiste button:focus-visible{outline:2px solid #c9a24b;outline-offset:2px}',
  '#wuerfelLeiste .wl-kopf{display:flex;align-items:baseline;gap:8px;justify-content:space-between;margin-bottom:7px}',
  '#wuerfelLeiste .wl-wer{color:#a89d81;font-size:12px;min-width:0;overflow:hidden;',
  '  text-overflow:ellipsis;white-space:nowrap;cursor:pointer}',
  '#wuerfelLeiste .wl-wer:hover{color:#e6ddc7}',
  '#wuerfelLeiste .wl-wer b{color:#e6ddc7;font-weight:400}',
  '#wuerfelLeiste .wl-abzug{color:#c0504a;font-size:11px}',
  '#wuerfelLeiste .wl-zu{background:transparent;border:1px solid #3a2a18;color:#a89d81;',
  '  border-radius:4px;font-size:11px;padding:2px 7px;flex:none}',
  '#wuerfelLeiste .wl-zu:hover{border-color:#c9a24b;color:#e6ddc7}',
  '#wuerfelLeiste .wl-gruppe{margin-bottom:7px}',
  '#wuerfelLeiste .wl-gl{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#a89d81;margin-bottom:4px}',
  '#wuerfelLeiste .wl-chips{display:flex;flex-wrap:wrap;gap:4px}',
  '#wuerfelLeiste .wl-chip{display:inline-flex;align-items:baseline;gap:4px;',
  '  background:rgba(201,162,75,.05);border:1px solid #3a2a18;border-radius:12px;',
  '  padding:3px 9px;font-size:12px;color:#e6ddc7}',
  '#wuerfelLeiste .wl-chip:hover{border-color:#c9a24b;background:rgba(201,162,75,.14)}',
  '#wuerfelLeiste .wl-chip s{text-decoration:none;font-size:11.5px}',
  '#wuerfelLeiste .wl-s1{color:#8a8172}#wuerfelLeiste .wl-s2{color:#a89d81}',
  '#wuerfelLeiste .wl-s3{color:#c9a24b}#wuerfelLeiste .wl-s4{color:#ddb864}',
  '#wuerfelLeiste .wl-s5{color:#f0d080}',
  '#wuerfelLeiste .wl-trenn{border-top:1px solid #3a2a18;margin:8px 0 7px}',
  '#wuerfelLeiste .wl-frei{display:flex;align-items:center;gap:5px;flex-wrap:wrap}',
  '#wuerfelLeiste .wl-wuerfel{background:transparent;border:0;padding:0;line-height:0;border-radius:5px}',
  '#wuerfelLeiste .wl-wuerfel svg{display:block;width:37px;height:37px}',
  '#wuerfelLeiste .wl-korpus{fill:rgba(201,162,75,.07);stroke:#a89d81;stroke-width:5;stroke-linejoin:round}',
  '#wuerfelLeiste .wl-zahl{fill:#a89d81;font-family:Georgia,serif;font-size:34px}',
  '#wuerfelLeiste .wl-wuerfel:hover .wl-korpus{stroke:#c9a24b;fill:rgba(201,162,75,.18)}',
  '#wuerfelLeiste .wl-wuerfel:hover .wl-zahl{fill:#c9a24b}',
  '#wuerfelLeiste .wl-anz{display:inline-flex;align-items:center;gap:3px;margin-right:3px}',
  '#wuerfelLeiste .wl-anz button{background:transparent;border:1px solid #3a2a18;color:#a89d81;',
  '  border-radius:3px;width:19px;height:19px;line-height:1;padding:0}',
  '#wuerfelLeiste .wl-anz button:hover{border-color:#c9a24b;color:#e6ddc7}',
  '#wuerfelLeiste .wl-anz span{min-width:22px;text-align:center;color:#e6ddc7}',
  '#wuerfelLeiste .wl-ex{font-size:9px;letter-spacing:.1em;text-transform:uppercase;',
  '  background:transparent;border:1px solid #3a2a18;color:#a89d81;border-radius:11px;',
  '  padding:4px 9px;flex:none}',
  '#wuerfelLeiste .wl-ex:hover{border-color:#c9a24b;color:#e6ddc7}',
  '#wuerfelLeiste .wl-ex[aria-pressed="true"]{border-color:#e8c96a;color:#e8c96a;background:rgba(232,201,106,.12)}',
  '#wuerfelLeiste .wl-bitte{border:1px solid #e8c96a;background:rgba(232,201,106,.12);',
  '  border-radius:8px;padding:8px 10px;margin-bottom:8px}',
  '#wuerfelLeiste .wl-bk{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#e8c96a}',
  '#wuerfelLeiste .wl-bg{font-size:12px;color:#fefcf8;margin:2px 0 1px}',
  '#wuerfelLeiste .wl-bt{font-size:13px;margin:2px 0 6px}',
  '#wuerfelLeiste .wl-bt b{color:#e8c96a;font-weight:400}',
  '#wuerfelLeiste .wl-jetzt{background:#e8c96a;border:1px solid #e8c96a;color:#1a130b;',
  '  border-radius:4px;padding:5px 13px;font-size:12px}',
  '#wuerfelLeiste .wl-jetzt:hover{filter:brightness(1.08)}',
  '#wuerfelLeiste .wl-erg{border:1px solid #c9a24b;background:rgba(201,162,75,.1);',
  '  border-radius:8px;padding:7px 10px;margin-bottom:8px}',
  '#wuerfelLeiste .wl-probe{font-size:9px;letter-spacing:.11em;text-transform:uppercase;color:#a89d81}',
  '#wuerfelLeiste .wl-band{font-size:15px;margin:1px 0 3px}',
  '#wuerfelLeiste .wl-zeile{font-size:12px;line-height:1.5;color:#a89d81}',
  '#wuerfelLeiste .wl-zeile.aus{opacity:.45}',
  '#wuerfelLeiste .wl-zeile em{font-style:normal;color:#e6ddc7}',
  '#wuerfelLeiste .wl-zaehlt{color:#5fae9f;font-size:10px;letter-spacing:.05em}',
  '#wuerfelLeiste .wl-fest{font-size:10.5px;color:#8a8172}',
  '#wuerfelLeiste .wl-deut{color:#e6ddc7;font-size:12px;margin-top:3px}',
  '#wuerfelLeiste .wl-b-steigerung{color:#e8c96a}#wuerfelLeiste .wl-b-erfolg{color:#5fae9f}',
  '#wuerfelLeiste .wl-b-miss{color:#a89d81}#wuerfelLeiste .wl-b-patzer{color:#c0504a}',
  '#wuerfelLeiste .wl-lauf{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}',
  '#wuerfelLeiste .wl-auf{background:transparent;border:1px solid #3a2a18;color:#a89d81;',
  '  border-radius:4px;font-size:11.5px;padding:4px 9px;flex:none}',
  '#wuerfelLeiste .wl-auf:hover{border-color:#c9a24b;color:#e6ddc7}',
  '#wuerfelLeiste .wl-priv{font-size:10px;color:#a89d81;display:inline-flex;align-items:center;gap:4px;cursor:pointer}',
  '.preview-mode #wuerfelLeiste{display:none!important}'
].join('\n');

function initDiceRoller(db, options) {
  if (!db) return; // keine Firebase-Verbindung - Feature bleibt inert, kein Crash

  const opt = options || {};
  // Nur regie.html übergibt allowPrivate. Ein privater Wurf geht NIE über
  // Firebase, sondern wird nur lokal angezeigt - Spieler bekommen ihn
  // dadurch grundsätzlich nie zu sehen, ganz ohne eigene Regeln dafür.
  const allowPrivate = !!opt.allowPrivate;
  // Die Seite weiß, wer gerade spielt und wo. Die Leiste fragt nach, statt es
  // selbst zu ermitteln - karte.html und regie.html wissen es verschieden.
  const holeFigur   = opt.holeFigur   || function () { return null; };
  const holeKontext = opt.holeKontext || function () { return {}; };

  let eingeklappt = false;
  let anzahl = 1;
  let explodiert = true;
  /* "Privat" ist eine HALTUNG, keine Einzelentscheidung: Wer verdeckt wuerfelt,
     tut das fast immer. Der Haken stand frueher im Markup und wurde bei jedem
     Neuzeichnen - also nach JEDEM Wurf - wieder leer gerendert; man musste ihn
     vor jedem Wurf neu setzen. Jetzt traegt ihn der Zustand, und er ueberlebt
     auch das Neuladen der Seite. (Hendriks Meldung, 14.10.2026.) */
  let privat = allowPrivate && (function () {
    try { return localStorage.getItem('korsaren_wuerfel_privat') === '1'; }
    catch (e) { return false; }
  })();
  let letztes = null;           // zuletzt gewürfelte Probe, für die Anzeige
  let anfrage = null;           // Bitte der Spielleitung, aus Firebase
  let anfrageSchluessel = null; // Figurenschlüssel, auf dem der Lauscher hängt
  let anfrageRef = null;

  /* ---------- Spielername ---------- */
  function getSavedName() {
    try { return (localStorage.getItem('korsaren_playername') || '').trim() || null; }
    catch (e) { return null; }
  }
  function promptForName(existing) {
    const input = window.prompt('Dein Spielername für den Würfel-Verlauf:', existing || '');
    if (input === null) return null;
    const trimmed = input.trim().slice(0, DICE_NAME_MAX_LEN);
    if (!trimmed) return null;
    try { localStorage.setItem('korsaren_playername', trimmed); } catch (e) {}
    zeichneLeiste();
    return trimmed;
  }
  function ensurePlayerName() {
    return getSavedName() || promptForName('');
  }

  /* ---------- Figur ---------- */
  // Ein Wert, den die Figur nicht hat, ist nicht verboten - er ist ungelernt.
  // Das Regelwerk würfelt dafür d4 mit Abzug (Stufe 0).
  function stufeAus(f, name) {
    if (!f) return 0;
    if (f.attr && f.attr[name] !== undefined) return f.attr[name];
    if (f.fert && f.fert[name] !== undefined) return f.fert[name];
    return 0;
  }

  /* ---------- Würfeln ---------- */
  // Ein freier Würfel explodiert genau wie eine Probe, wenn eingeschaltet.
  function freierWurf(seiten) {
    if (!explodiert) return { summe: 1 + Math.floor(Math.random() * seiten), teile: null };
    const teile = [];
    let t;
    do { t = 1 + Math.floor(Math.random() * seiten); teile.push(t); }
    while (t === seiten && teile.length < DICE_EX_GRENZE);
    const summe = teile.reduce(function (a, b) { return a + b; }, 0);
    return { summe: summe, teile: teile.length > 1 ? teile : null };
  }

  function istPrivat() {
    return allowPrivate && privat;
  }
  function setzePrivat(an) {
    privat = !!an;
    try { localStorage.setItem('korsaren_wuerfel_privat', privat ? '1' : '0'); }
    catch (e) { /* ohne Speicher gilt die Wahl nur fuer diese Sitzung */ }
  }

  function schreibeFeed(eintrag) {
    if (istPrivat()) { addToast(formatRollText(eintrag), true); return; }
    db.ref('diceRolls').push(Object.assign({}, eintrag, {
      ts: firebase.database.ServerValue.TIMESTAMP
    })).catch(function () { /* Feed ist Beiwerk - ein Wurf gilt auch ohne ihn */ });
  }

  // Das Protokoll ist ein Dokument, kein Feed: Es bleibt, trägt Szene und Ort
  // und wird in der Regie kommentiert. Ein privater SL-Wurf gehört nicht hinein.
  function schreibeProtokoll(zeile) {
    if (istPrivat() || !db.sitzung) return;
    const k = holeKontext() || {};
    db.ref('sitzungen/' + db.sitzung + '/protokoll').push(Object.assign({
      szene: k.szene || null, ort: k.ort || null, notiz: '', ts: Date.now()
    }, zeile)).catch(function () {});
  }

  /* Der Name der FIGUR, nicht des Spielers. Steht an einer Stelle,
     weil ihn alle drei Wurfarten brauchen - und weil "mal mit, mal
     ohne" im Feed schlimmer waere als gar nicht. Leer, solange keine
     Figur geladen ist (die Spielleitung wuerfelt ohne). */
  function figurName() {
    const f = holeFigur() || {};
    return (f.name || '').trim();
  }

  function wuerfleWert(wertName, stufe, mod) {
    const name = ensurePlayerName();
    if (!name) return;
    const f = holeFigur() || {};
    const abzug = f.abzug || 0;
    const r = wurf(stufe, { mod: (mod || 0) - abzug });
    letztes = { wert: wertName, stufe: stufe, r: r };

    schreibeFeed({
      name: name, figur: figurName(), probe: wertName + ' ' + stufeText(stufe),
      /* Die Wuerfelgroesse als eigenes Feld, nicht nur im Text: Die
         Karte zeichnet daraus die FORM (Dreieck, Wuerfel, Drachen …).
         Aus "Kämpfen d8" die 8 herauszuschneiden waere geraten - und
         ungelernt stuende dort "ungelernt (d4−2)". */
      seiten: wuerfelSeiten(stufe),
      band: BAND_NAMEN[r.band], ergebnis: r.roh, ziel: r.ziel,
      steigerungen: r.steigerungen, total: r.roh
    });
    schreibeProtokoll({
      spieler: name, figur: f.name || '', wert: wertName, stufe: stufe,
      band: r.band, roh: r.roh, ziel: r.ziel, steigerungen: r.steigerungen
    });
    // Die Bitte ist beantwortet. Erst räumen, dann neu zeichnen.
    if (anfrage && anfrage.wert === wertName && anfrageSchluessel) {
      db.ref('figuren/' + anfrageSchluessel + '/anfrage').remove().catch(function () {});
      anfrage = null;
    }
    zeichneLeiste();
  }

  function wuerfleFrei(seiten) {
    const name = ensurePlayerName();
    if (!name) return;
    const wuerfe = [];
    let summe = 0, knallte = false;
    for (let i = 0; i < anzahl; i++) {
      const w = freierWurf(seiten);
      if (w.teile) knallte = true;
      wuerfe.push(w); summe += w.summe;
    }
    letztes = null;
    schreibeFeed({
      name: name, figur: figurName(), count: anzahl, sides: seiten, total: summe,
      results: wuerfe.map(function (w) { return w.summe; }),
      explodiert: knallte,
      ketten: wuerfe.map(function (w) { return w.teile ? w.teile.join('+') : String(w.summe); })
    });
    zeichneLeiste();
  }

  /* Ein angeforderter Schadenswurf. Anders als ein freier Würfel steht er
     IM PROTOKOLL: Er ist die Antwort auf eine Bitte und gehört zum Abend -
     und nur so findet der Kampfmodus ihn wieder. Freie Würfel bleiben
     draußen, die sind Zufall und Beiwerk. */
  function wuerfleSchaden() {
    const name = ensurePlayerName();
    if (!name || !anfrage || anfrage.art !== 'schaden') return;
    const teile = (anfrage.wuerfel || []).map(function (w) {
      const e = freierWurf(wuerfelSeiten(w.stufe));
      return { was: w.was || '', stufe: w.stufe, summe: e.summe, kette: e.teile || null };
    });
    let summe = 0;
    teile.forEach(function (t) { summe += t.summe; });
    letztes = null;

    schreibeFeed({
      name: name, figur: figurName(), probe: 'Schaden',
      band: null, ergebnis: summe, total: summe,
      /* Ein Schadenswurf wirft MEHRERE Wuerfel (Waffe + Stärke, bei
         einer Steigerung noch 1W6). Gezeigt wird der groesste - er
         ist der, den man vor sich sieht, wenn jemand "Säbel und
         Stärke" sagt. */
      seiten: teile.reduce(function (a, t) {
        return Math.max(a, wuerfelSeiten(t.stufe));
      }, 4),
      results: teile.map(function (t) { return t.summe; })
    });
    const f = holeFigur() || {};
    schreibeProtokoll({
      spieler: name, figur: f.name || '', wert: 'Schaden', stufe: 0,
      band: null, roh: summe, ziel: 0, steigerungen: 0,
      grund: anfrage.grund || ''
    });
    if (anfrageSchluessel) {
      db.ref('figuren/' + anfrageSchluessel + '/anfrage').remove().catch(function () {});
      anfrage = null;
    }
    zeichneLeiste();
  }

  /* ---------- Anforderung der Spielleitung ---------- */
  // Der Lauscher hängt am Schlüssel der eigenen Figur und zieht um, sobald
  // sich der Name ändert - sonst liefe er auf einer fremden Figur weiter.
  function pruefeAnfrage() {
    const f = holeFigur();
    const k = f && f.schluessel ? f.schluessel : null;
    if (k === anfrageSchluessel) return;
    if (anfrageRef) { anfrageRef.off(); anfrageRef = null; }
    anfrageSchluessel = k;
    anfrage = null;
    if (!k) return;
    anfrageRef = db.ref('figuren/' + k + '/anfrage');
    anfrageRef.on('value', function (snap) {
      anfrage = snap.val() || null;
      zeichneLeiste();
    }, function () { anfrage = null; });
  }

  /* ---------- Darstellung ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function wuerfelSymbol(seiten) {
    const fo = DICE_FORMEN[seiten];
    return '<button class="wl-wuerfel" data-frei="' + seiten + '" type="button" ' +
      'title="d' + seiten + ' werfen" aria-label="d' + seiten + ' werfen">' +
      '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<polygon class="wl-korpus" points="' + fo.punkte + '"></polygon>' +
      '<text class="wl-zahl" x="50" y="' + DICE_ZAHL_Y + '" text-anchor="middle" ' +
      'dominant-baseline="central">' + seiten + '</text></svg></button>';
  }
  function freiZeile() {
    let h = '<div class="wl-frei"><span class="wl-anz">' +
      '<button type="button" data-anz="-1" aria-label="weniger">−</button>' +
      '<span>' + anzahl + '×</span>' +
      '<button type="button" data-anz="1" aria-label="mehr">+</button></span>';
    [4, 6, 8, 10, 12].forEach(function (s) { h += wuerfelSymbol(s); });
    h += '<button type="button" class="wl-ex" data-ex="1" aria-pressed="' +
      (explodiert ? 'true' : 'false') +
      '" title="Höchste Zahl wirft erneut — richtig für Schaden, falsch für Zufallstabellen">' +
      'explodiert</button>';
    if (allowPrivate) {
      h += '<label class="wl-priv" title="Bleibt in diesem Browser, geht nie über die Datenbank">' +
        '<input type="checkbox" id="dicePrivate"' + (privat ? ' checked' : '') +
        '> privat</label>';
    }
    return h + '</div>';
  }
  /* Jeder Wuerfel explodiert bei SEINER eigenen Hoechstzahl - der Wild Die ist
     immer ein d6, also bei 6, auch wenn der eigene Wert d8 oder d12 ist. Genau
     das stand hier als blankes "explodiert!" und wurde als Aussage ueber den
     eigenen Wuerfel gelesen ("obwohl ich d8 habe, explodiert er schon bei 6").
     Die Zahl steht deshalb dabei. (Hendriks Meldung, 14.10.2026.) */
  function kette(w, seiten) {
    const k = w.teile.length > 1 ? w.teile.join(' + ') + ' = ' + w.summe : String(w.summe);
    return 'd' + seiten + ' <em>' + k + '</em>' +
      (w.teile.length > 1 ? ' explodiert bei ' + seiten : '');
  }
  function chip(name, stufe) {
    return '<button type="button" class="wl-chip" data-wert="' + esc(name) +
      '" data-stufe="' + stufe + '">' + esc(name) +
      ' <s class="wl-s' + stufe + '">' + DLBL[stufe] + '</s></button>';
  }
  function ergebnisBlock() {
    const r = letztes.r;
    const deut = {
      steigerung: r.steigerungen > 1
        ? 'Ergebnis ' + r.roh + ' — ' + r.steigerungen + ' Steigerungen. Herausragend.'
        : 'Ergebnis ' + r.roh + ' — mit Steigerung (nötig war ' + r.zielSteigerung + ').',
      erfolg: 'Ergebnis ' + r.roh + ' — es gelingt (nötig: ' + r.ziel + ').',
      miss:   'Ergebnis ' + r.roh + ' — das reicht nicht (nötig: ' + r.ziel + ').',
      patzer: 'Zwei Einsen. Es geht nicht nur schief, es geht schief.'
    }[r.band];
    /* Bei einem ungelernten Wert stand hier ein blosser Gedankenstrich
       (DLBL[0]) - das liest sich wie ein Fehler, und die Regel dahinter
       (d4 mit -2) stand nirgends. */
    let h = '<div class="wl-erg"><div class="wl-probe">' + esc(letztes.wert) + ' ' +
      stufeText(letztes.stufe) + ' · nötig ' + r.ziel + '</div>' +
      '<div class="wl-band wl-b-' + r.band + '">' + BAND_NAMEN[r.band] + '</div>' +
      '<div class="wl-zeile' + (r.zaehlt === 'wert' ? '' : ' aus') + '">Wert: ' +
        kette(r.wert, r.seiten) +
        (r.zaehlt === 'wert' ? ' <span class="wl-zaehlt">— zählt</span>' : '') + '</div>';
    if (r.wildWurf) {
      /* "(immer d6)" steht fest da und nicht nur als Tooltip: Die Verwechslung
         mit dem eigenen Wert passiert genau in dem Moment, in dem man das
         Ergebnis liest, und dort greift niemand zur Maus. */
      h += '<div class="wl-zeile' + (r.zaehlt === 'wild' ? '' : ' aus') +
        '" title="Jede Heldenfigur wirft zusätzlich diesen Würfel, unabhängig vom eigenen ' +
        'Wert. Der höhere der beiden zählt.">Wild Die <span class="wl-fest">(immer d' +
        r.wildSeiten + ')</span>: ' +
        kette(r.wildWurf, r.wildSeiten) +
        (r.zaehlt === 'wild' ? ' <span class="wl-zaehlt">— zählt</span>' : '') + '</div>';
    }
    return h + '<div class="wl-deut">' + esc(deut) + '</div></div>';
  }

  function zeichneLeiste() {
    const el = document.getElementById('wuerfelLeiste');
    if (!el) return;
    pruefeAnfrage();
    const f = holeFigur();
    const name = getSavedName();

    // Eingeklappt bleiben die Würfel stehen - sie sind das, was man jederzeit
    // braucht. Weggeklappt wird nur die Werteliste. Eine offene Bitte der
    // Spielleitung klappt die Leiste von selbst auf, sonst ginge sie unter.
    if (eingeklappt && !anfrage) {
      el.innerHTML = '<div class="wl-lauf">' + freiZeile() +
        (f ? '<button type="button" class="wl-auf" data-auf="1">▲ ' +
             esc(f.name || 'Werte') + '</button>' : '') + '</div>';
      return;
    }

    let h = '<div class="wl-kopf"><div class="wl-wer" data-name="1" title="Namen ändern">' +
      (name ? 'Würfle als <b>' + esc(name) + '</b>' : 'Würfle als: –') +
      (f && f.name ? ' · ' + esc(f.name) : '');
    if (f && f.abzug) h += ' <span class="wl-abzug">−' + f.abzug + '</span>';
    h += '</div>' + (f ? '<button type="button" class="wl-zu" data-zu="1">einklappen</button>' : '') +
      '</div>';

    if (anfrage && f) {
      /* Der Grund steht DRIN, nicht daneben: "Kämpfen, nötig 4" sagt nicht,
         worum es geht - und am Tisch wird genau danach gefragt. Kommt die
         Bitte aus dem Kampfmodus, trägt sie "Angriff auf Anselm Frei 1". */
      const grund = anfrage.grund
        ? '<div class="wl-bg">' + esc(anfrage.grund) + '</div>' : '';
      if (anfrage.art === 'schaden') {
        /* Ein Schadenswurf ist KEINE Probe: kein Zielwert, kein Wild Die,
           und die Wunden ziehen nichts ab - der Säbel wird nicht stumpfer,
           weil man blutet. Deshalb eine eigene Darstellung. */
        const liste = (anfrage.wuerfel || []).map(function (w) {
          return esc(w.was || '') + ' ' + DLBL[w.stufe];
        }).join(' + ');
        h += '<div class="wl-bitte"><div class="wl-bk">Die Spielleitung bittet um</div>' +
          grund +
          '<div class="wl-bt"><b>Schaden</b> — ' + (liste || '—') + '</div>' +
          '<button type="button" class="wl-jetzt" data-schaden="1">Würfeln</button></div>';
      } else {
        const st = stufeAus(f, anfrage.wert);
        const mod = anfrage.mod || 0;
        h += '<div class="wl-bitte"><div class="wl-bk">Die Spielleitung bittet um</div>' +
          grund +
          '<div class="wl-bt"><b>' + esc(anfrage.wert) + ' ' + stufeText(st) + '</b> — nötig ' +
          (ZIELZAHL - mod) +
          (f.abzug ? ', deine Wunden ziehen ' + f.abzug + ' ab' : '') + '</div>' +
          '<button type="button" class="wl-jetzt" data-bitte="1">Würfeln</button></div>';
      }
    }

    if (letztes) h += ergebnisBlock();

    if (f) {
      h += '<div class="wl-gruppe"><div class="wl-gl">Attribute</div><div class="wl-chips">';
      ATTR_NAMEN.forEach(function (a) { h += chip(a, (f.attr && f.attr[a]) || 1); });
      h += '</div></div>';
      const gelernt = Object.keys(f.fert || {}).filter(function (k) { return f.fert[k] > 0; });
      if (gelernt.length) {
        gelernt.sort(function (a, b) { return f.fert[b] - f.fert[a] || a.localeCompare(b, 'de'); });
        h += '<div class="wl-gruppe"><div class="wl-gl">Fertigkeiten</div><div class="wl-chips">';
        gelernt.forEach(function (k) { h += chip(k, f.fert[k]); });
        h += '</div></div>';
      }
      h += '<div class="wl-trenn"></div><div class="wl-gruppe">' +
        '<div class="wl-gl">Frei — Schaden, Statisten</div>' + freiZeile() + '</div>';
    } else {
      h += '<div class="wl-gruppe">' + freiZeile() + '</div>';
    }
    el.innerHTML = h;
  }

  /* ---------- Aufbau ---------- */
  const stilEl = document.createElement('style');
  stilEl.textContent = DICE_STIL;
  document.head.appendChild(stilEl);

  const leisteEl = document.createElement('div');
  leisteEl.id = 'wuerfelLeiste';
  document.body.appendChild(leisteEl);

  const feedEl = document.createElement('div');
  feedEl.id = 'diceFeed';
  document.body.appendChild(feedEl);

  leisteEl.addEventListener('change', function (ev) {
    if (ev.target && ev.target.id === 'dicePrivate') setzePrivat(ev.target.checked);
  });

  leisteEl.addEventListener('click', function (ev) {
    const t = ev.target.closest('button, .wl-wer');
    if (!t) return;
    if (t.dataset.name) { promptForName(getSavedName() || ''); return; }
    if (t.dataset.zu)   { eingeklappt = true;  zeichneLeiste(); return; }
    if (t.dataset.auf)  { eingeklappt = false; zeichneLeiste(); return; }
    if (t.dataset.ex)   { explodiert = !explodiert; zeichneLeiste(); return; }
    if (t.dataset.anz) {
      anzahl = Math.max(DICE_ANZ_MIN, Math.min(DICE_ANZ_MAX, anzahl + parseInt(t.dataset.anz, 10)));
      zeichneLeiste(); return;
    }
    if (t.dataset.frei) { wuerfleFrei(parseInt(t.dataset.frei, 10)); return; }
    if (t.dataset.schaden) { wuerfleSchaden(); return; }
    if (t.dataset.bitte) {
      const f = holeFigur();
      if (anfrage && f) wuerfleWert(anfrage.wert, stufeAus(f, anfrage.wert), anfrage.mod || 0);
      return;
    }
    if (t.dataset.wert !== undefined && t.dataset.stufe !== undefined) {
      wuerfleWert(t.dataset.wert, parseInt(t.dataset.stufe, 10), 0);
      return;
    }
  });

  /* ---------- Feed ---------- */
  /* Wer hat geworfen? Am Tisch zaehlt die FIGUR - der Feed beschreibt,
     was in der Szene geschieht. Der Spielername steht daneben, damit
     man weiss, wen man ansehen muss. Ohne Figur (Spielleitung, alte
     Eintraege) bleibt es beim Spielernamen allein. */
  function werfer(roll) {
    const fig = (roll.figur || '').trim();
    if (!fig || fig === roll.name) return roll.name;
    return fig + ' (' + roll.name + ')';
  }

  function formatRollText(roll) {
    // Probenwurf: Der höhere der beiden Würfe gegen das Ziel, je volle 4
    // darüber eine Steigerung. Die Einordnung ist damit eindeutig - unter
    // W100 war sie es nicht, deshalb zeigte der Feed früher nur die rohe Zahl.
    if (roll.probe && roll.band) {
      const zahl = (roll.ergebnis === undefined || roll.ergebnis === null) ? '' : ' (' + roll.ergebnis + ')';
      const ziel = (roll.ziel && roll.ziel !== ZIELZAHL) ? ' [Ziel ' + roll.ziel + ']' : '';
      return werfer(roll) + ' — ' + roll.probe + ziel + ': ' + roll.band + zahl;
    }
    /* Ein angeforderter Schadenswurf: kein Band, kein Ziel, aber auch kein
       freier Wuerfel - der hat count und sides, dieser hat Teilwuerfe.
       Ohne diesen Zweig stand im Feed "1xdundefined". */
    if (roll.probe === 'Schaden') {
      const teile = (roll.results && roll.results.length > 1)
        ? ' (' + roll.results.join(' + ') + ')' : '';
      return werfer(roll) + ' — Schaden: ' + roll.total + teile;
    }
    const label = (roll.count || 1) + '×d' + roll.sides;
    let detail = '';
    if (roll.ketten && roll.ketten.length > 1) detail = ' (' + roll.ketten.join(', ') + ')';
    else if (roll.ketten && roll.ketten[0] && roll.ketten[0].indexOf('+') >= 0) detail = ' (' + roll.ketten[0] + ')';
    else if (roll.results && roll.results.length > 1) detail = ' (' + roll.results.join(', ') + ')';
    return werfer(roll) + ' würfelt ' + label + ': ' + roll.total + detail +
      (roll.explodiert ? ' explodiert!' : '');
  }

  function addToast(text, isPrivate) {
    const node = document.createElement('div');
    node.className = 'dice-toast' + (isPrivate ? ' private' : '');
    node.textContent = text;
    feedEl.appendChild(node);
    setTimeout(function () {
      node.classList.add('fade');
      setTimeout(function () { node.remove(); }, DICE_FADE_MS);
    }, DICE_VISIBLE_MS);
  }

  db.ref('diceRolls').on('child_added', function (snap) {
    const roll = snap.val();
    if (!roll) return;
    const alter = roll.ts ? (Date.now() - roll.ts) : 0;
    if (alter > DICE_MAX_AGE_MS) return;
    /* Frische Würfe warten, bis der Würfel im Porträt ausgerollt hat.
       Alte (beim Neuladen nachgereichte) nicht - die soll niemand
       zwei Sekunden lang erwarten. */
    const warten = Math.max(0, DICE_ANIM_MS - alter);
    if (!warten) { addToast(formatRollText(roll), false); return; }
    setTimeout(function () { addToast(formatRollText(roll), false); }, warten);
  });

  db.ref('diceRolls').on('value', function (snap) {
    const now = Date.now();
    snap.forEach(function (child) {
      const roll = child.val();
      if (roll && roll.ts && (now - roll.ts) > DICE_MAX_AGE_MS) {
        db.ref('diceRolls/' + child.key).remove();
      }
    });
  });

  zeichneLeiste();

  // Die Seite ruft das auf, wenn sich Figur, Szene oder Ort geändert haben.
  return { neuZeichnen: zeichneLeiste };
}

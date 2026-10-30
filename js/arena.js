/* ==========================================================
   ARENA — das Brett des Endkampfs (Szene 15.1, Bibel 12.1)
   ----------------------------------------------------------
   Bewusst als eigene Datei ohne DOM- und ohne Firebase-Zugriff:
   dieselbe Logik laeuft in karte.html (Spieleransicht),
   arena_admin.html (SL-Schlachtfeld) und js/regie_vault.js
   (Kompakt-Panel), und sie laesst sich mit Node ohne Browser
   gegen die Regeln pruefen.

   ==========================================================
   UMGESTELLT AUF SAVAGE WORLDS (2026-10-30)
   ----------------------------------------------------------
   Bis heute rechnete diese Datei nach dem alten W100-System
   (Schwelle = Wert x 10, vier Baender, "Mastery"). Das war seit
   dem Systemwechsel am 07.09.2026 die letzte Stelle im Projekt,
   die noch so rechnete - Bibel 4.7 fuehrte sie ausdruecklich als
   offene Baustelle.

   DIE TRAGENDE ENTSCHEIDUNG: Sie rechnet die Regeln jetzt NICHT
   MEHR SELBST. Ein dritter Regelkern neben js/regelwerk.js und
   js/kampf.js waere genau der Fehler, gegen den beide Dateien
   geschrieben sind - zwei Fassungen derselben Rechnung laufen
   auseinander, und hier waere der Preis, dass das Finale nach
   anderen Regeln laeuft als jeder Kampf davor.

     Probe/Angriffswurf  -> wurf()            js/regelwerk.js
     Zielwert Nahkampf   -> angriffsMod()     js/kampf.js
     Entfernungsabzug    -> fernkampfMod()    js/kampf.js
     Schadenswuerfel     -> schadensWuerfel() js/kampf.js
     Schadenswurf        -> wuerfelWurf()     js/regelwerk.js
     Wirkung am Ziel     -> wirkung()         js/kampf.js

   WAS HIER BLEIBT, ist das Brett: Raster, Entfernung, Bewegung,
   Rundenwechsel - und die drei Kampagnenregeln, die Savage
   Worlds nicht kennt: Wiederauferstehung, Nachschub und der
   Jaguar-Saebel (Bibel 12.1).

   Dazu seit dem 30.10.2026 (Fortsetzung) zwei Dinge, die das
   Brett selbst betreffen und nirgends sonst hingehoeren - beide
   weiter unten mit eigener Begruendung:
     INITIATIVE  Das Aktionsdeck aus js/kampf.js wird hier
                 ausgeteilt; eine Karte je Wild Card, EINE fuer
                 alle Diener zusammen (Savage Worlds). Die Reihe
                 bestimmt, wer am Zug ist - nicht mehr die Hand
                 der SL.
     DIENER-KI   Die Wiedergaenger gehen von selbst auf den
                 naechstgelegenen Gegner los (Hendriks Vorgabe);
                 den Seelenlosen steuert weiter die SL.

   DESHALB BRAUCHT JEDE SEITE DREI SCRIPT-TAGS:
     js/regelwerk.js, js/kampf.js, js/arena.js
   Die Reihenfolge ist beliebig (alle Aufrufe stehen in
   Funktionen, nicht auf oberster Ebene) - aber FEHLT eines,
   bricht die Arena erst zur LAUFZEIT, und zwar still. Genau
   diese haengende Referenz hat dieses Projekt schon einmal
   gekostet. arena_admin.html lud bis heute keines von beiden.

   ==========================================================
   DIE REGEL, KURZ (Quellen in dieser Reihenfolge:
   Savage Worlds -> Bibel 4 -> Code)
   ----------------------------------------------------------
   1. ANGRIFF ist eine ganz normale Probe (Bibel 4.1): ein
      Wuerfel, Ziel 4, explodierend, Wild Cards zusaetzlich mit
      Wild Die. Je volle 4 darueber eine Steigerung.
   2. NAHKAMPF wird gegen die PARADE des Ziels geworfen - als
      Modifikator, weil der Zielwert immer 4 bleibt
      (angriffsMod: 4 - Parade).
   3. FERNKAMPF geht NICHT gegen die Parade. Die ist eine
      Nahkampfgroesse; geschossen wird gegen die 4, modifiziert
      allein durch die Entfernung (fernkampfMod: Reichweite = 0,
      doppelte = -2, vierfache = -4, darueber kein Schuss).
   4. GANG UP (Savage Worlds): Jeder ZUSAETZLICHE Angreifer, der
      im Nahkampf am ZIEL steht, gibt +1 auf den Angriff,
      hoechstens +4. Jeder Verbuendete des Ziels, der beim Ziel
      steht, hebt einen Punkt davon wieder auf.
   5. SCHADEN: Waffenwuerfel + Staerke im Nahkampf, im Fernkampf
      nur die Waffe; bei einer Steigerung +1W6. Alle Wuerfel
      explodieren, KEIN Wild Die (Bibel 4.3).
   6. WIRKUNG gegen die Robustheit: darunter nichts, gleich oder
      darueber angeschlagen, je volle 4 darueber eine Wunde. Wer
      schon angeschlagen ist, nimmt statt des zweiten Hakens eine
      Wunde. Ein Statist traegt KEINE Wunde - die erste nimmt ihn
      raus.
   7. WUNDEN ziehen flach ab, je Wunde -1 (Bibel 4.4).
   8. ANGESCHLAGEN kostet die Handlung, nicht den Wuerfel: Wer
      angeschlagen ist, darf sich bewegen, aber nicht angreifen.

   BEWUSSTE ABWEICHUNGEN, alle drei an einer Stelle, damit sie
   nicht verstreut im Code stehen:
   a) Savage Worlds laesst eine angeschlagene Figur zu Beginn
      ihres Zuges eine WILLENSKRAFT-Probe werfen, um den Haken
      loszuwerden. Auf diesem Brett stehen bis zu einem Dutzend
      Diener - das waeren ein Dutzend Wuerfe je Runde, nur um
      den Zustand zu verwalten. Hier raeumt ihn der
      Rundenwechsel ab, die Figur verliert also genau eine
      Handlung. Ein Bennie, der das sofort erledigen wuerde,
      bleibt moeglich: Die SL hakt "angeschlagen" von Hand aus.
   b) Beim Gang Up wird nicht geprueft, ob ein mithelfender
      Verbuendeter selbst gerade von jemand anderem gebunden ist.
      Das ist die Art Buchhaltung, die das Projekt bewusst
      weglaesst (vgl. Bibel 4.5).
   c) Der WUNDEN-Abzug ist bei 3 gedeckelt (MAX_WUNDEN), auch
      wenn eine Figur mehr Wunden tragen kann.
   ========================================================== */

/* ---------- Raster ----------
   Positionen sind ganzzahlige Feldkoordinaten. Entfernung als
   Chebyshev-Distanz (diagonal zaehlt wie gerade) - am Tisch die
   unstrittigste Variante: "angrenzend" heisst genau Distanz 1,
   egal ob schraeg oder gerade. */
function arenaDistanz(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

function arenaInReichweite(a, b, reichweite) {
  return arenaDistanz(a, b) <= reichweite;
}

/* Zwei Seiten, vier Typen (seit 2026-08-23): "spieler" und
   "verbuendeter" (mitkaempfende NSC wie Harwick oder Cormac) stehen
   auf der Helden-Seite, "diener" und "seelenloser" auf der
   Gegner-Seite. Der Unterschied zwischen spieler und verbuendeter ist
   NICHT die Seite, sondern die Steuerung: Spieler duerfen
   ausschliesslich Figuren vom Typ "spieler" bewegen (karte.html
   prueft das) - alles andere steuert die SL ueber arena_admin.html. */
function arenaSeite(t) {
  return (t && (t.typ === 'spieler' || t.typ === 'verbuendeter')) ? 'helden' : 'gegner';
}
function arenaIstSpieler(t) { return t && t.typ === 'spieler'; }
function arenaIstFeind(a, b) { return arenaSeite(a) !== arenaSeite(b); }

/* ---------- Zustand einer Figur ----------
   HP sind mit der Umstellung ersatzlos entfallen. Eine Figur traegt
   jetzt, was Savage Worlds kennt: einen Haken "angeschlagen" und eine
   Zahl Wunden. Wie viele sie TRAEGT, entscheidet wild/Statist - die
   Zahl steht in js/kampf.js und nicht hier, damit Arena und
   Kampfmodus dieselbe Antwort geben. Ein Token darf sie mit
   "wundenMax" ueberschreiben (die SL kann es je Figur stellen). */
function arenaWundenMax(t) {
  if (t && t.wundenMax != null) return Math.max(0, t.wundenMax | 0);
  const R = (typeof KAMPF_REGELN !== 'undefined') ? KAMPF_REGELN
    : { wundenStatist: 0, wundenWildCard: 3 };
  return (t && t.wild) ? R.wundenWildCard : R.wundenStatist;
}

/* Flacher Abzug je Wunde, gedeckelt (Bibel 4.4). Ueberladung bildet
   das Brett nicht ab - wer hier steht, traegt, was er traegt. */
function arenaWundenAbzug(t) {
  const deckel = (typeof MAX_WUNDEN !== 'undefined') ? MAX_WUNDEN : 3;
  return Math.min(deckel, Math.max(0, (t && t.wunden) || 0));
}

/* Angeschlagen kostet die HANDLUNG, nicht den Wuerfel: bewegen ja,
   angreifen nein. */
function arenaKannAngreifen(t) {
  return !!t && !t.tot && !t.angeschlagen;
}

function arenaZustandText(t) {
  if (!t) return '';
  if (t.tot) return t.endgueltig ? 'endgültig tot' : 'am Boden';
  const w = Math.max(0, t.wunden || 0);
  const max = arenaWundenMax(t);
  const teile = [];
  if (w > 0) teile.push(w + (w > 1 ? ' Wunden' : ' Wunde') + (max > 0 ? ' von ' + max : ''));
  if (t.angeschlagen) teile.push('angeschlagen');
  return teile.length ? teile.join(' · ') : 'unversehrt';
}

/* Anteil der noch freien Wundenkapazitaet, fuer die Leiste am Token.
   Ein Statist traegt keine Wunde - dort gibt es nichts zu fuellen, und
   eine Leiste, die nur zwischen voll und leer springt, waere eine
   Luege. Dann null, und die Anzeige nimmt stattdessen den Haken. */
function arenaWundenAnteil(t) {
  const max = arenaWundenMax(t);
  if (!max) return null;
  const w = Math.min(max, Math.max(0, (t && t.wunden) || 0));
  return (max - w) / max;
}

/* ---------- Angriffsart ----------
   Hendriks Vorgabe: in Nahkampfreichweite ist es Nahkampf, sonst
   Fernkampf. Es gibt also keine Wahl - die Distanz entscheidet.

   Fernkampf setzt eine Schusswaffe voraus ("fernwaffe", die
   Wuerfelstufe ihres Schadens). Ohne diese Pruefung konnte eine reine
   Nahkampf-Figur auf Distanz "schiessen" - im alten System war das
   Fehler Nr. 6 der Fehlergeschichte, und die Pruefung bleibt noetig:
   "Schiessen" ist auch ungelernt eine gueltige Probe (d4-2), ein
   fehlender Fertigkeitswert hindert also niemanden am Abdruecken. Nur
   die fehlende WAFFE tut das. */
function arenaAngriffsart(angreifer, ziel, regeln) {
  const d = arenaDistanz(angreifer, ziel);
  if (d <= regeln.nahkampfReichweite) return 'nah';
  if (d > regeln.fernkampfReichweite) return null;
  if (((angreifer && angreifer.fernwaffe) || 0) <= 0) return null;
  /* Die eigentliche Grenze ist seit dem 30.10.2026 die WAFFE, nicht das
     Brett: fernkampfMod() liefert null jenseits der vierfachen Reichweite.
     Das muss schon HIER geprueft werden - sonst zeigt die Oberflaeche einen
     Schuss an, der beim Klick abgelehnt wird. Diese Funktion ist die EINE
     Stelle, die "kann der den ueberhaupt angreifen" beantwortet. */
  return fernkampfMod(angreifer.reichweite || 1, d) === null ? null : 'fern';
}

/* ---------- Gang Up (Savage Worlds) ----------
   +1 je zusaetzlichem Angreifer im Nahkampf AM ZIEL, hoechstens +4;
   jeder Verbuendete des Ziels, der beim Ziel steht, hebt einen Punkt
   auf.

   DAS IST DIE GEGENRICHTUNG der alten Hausregel. Bis heute stand hier
   "Bedraengnis": zusaetzliche Gegner neben MIR verschoben MEIN
   Ergebnis nach unten - umgeben zu sein machte den eigenen Angriff
   schlechter. Savage Worlds dreht beides um: Es ist ein BONUS fuer den
   Angreifer, und gezaehlt wird um das ZIEL, nicht um den Angreifer.
   In Bibel 4 stand die Regel ueberhaupt nicht (4.4 kennt nur
   Erschwernisse, Wunden und Bennies) - das war der eigentliche
   Befund, und sie ist dort nachgetragen.

   Praktisch ist das die taktische Antwort auf den Seelenlosen: Seine
   Parade 8 kostet jeden Angriff -4, und genau +4 kann die Gruppe
   zurueckholen, wenn sie ihn gemeinsam stellt. */
const GANG_UP_MAX = 4;

function arenaGangUp(angreifer, ziel, alleTokens, regeln) {
  let mit = 0, dagegen = 0;
  Object.keys(alleTokens || {}).forEach(function (id) {
    const t = alleTokens[id];
    if (!t || t.tot) return;
    if (arenaDistanz(t, ziel) > regeln.nahkampfReichweite) return;
    if (arenaSeite(t) === arenaSeite(angreifer)) {
      if (id !== angreifer.id) mit++;          // zusaetzlicher Angreifer
    } else if (id !== ziel.id) {
      dagegen++;                                // Verbuendeter des Ziels
    }
  });
  return Math.max(0, Math.min(GANG_UP_MAX, mit - dagegen));
}

/* ---------- Der Modifikator des Angriffswurfs ----------
   Eigene Funktion, damit sich die Rechnung einzeln pruefen laesst -
   sonst waere sie nur als Nebenwirkung eines Wurfs sichtbar.
   Liefert null, wenn ausser Reichweite geschossen wuerde. */
function arenaAngriffMod(angreifer, ziel, art, alleTokens, regeln) {
  let mod;
  if (art === 'nah') {
    // Nahkampf gegen die Parade des Ziels, plus Gang Up.
    mod = angriffsMod(ziel.parade != null ? ziel.parade : 2);
    mod += arenaGangUp(angreifer, ziel, alleTokens, regeln);
  } else {
    // Fernkampf gegen die 4. Die Parade zaehlt hier NICHT.
    const fm = fernkampfMod(angreifer.reichweite || 1, arenaDistanz(angreifer, ziel));
    if (fm === null) return null;
    mod = fm;
  }
  return mod - arenaWundenAbzug(angreifer);
}

/* ---------- Schadenswuerfel ----------
   Die Regel steht in js/kampf.js (Staerke mitzaehlen ja/nein, +1W6 bei
   Steigerung) und wird von dort geholt, nicht nachgebaut. Diese
   Funktion ist nur der Adapter: ein Token ist keine Figur. */
function arenaSchadensWuerfel(angreifer, art, steigerung) {
  const fern = art === 'fern';
  const stufe = fern ? (angreifer.fernwaffe || 0) : (angreifer.waffe || 0);
  const figur = { attr: { 'Stärke': Math.max(1, angreifer.staerke || 1) } };
  const ware = {
    n: fern ? 'Schusswaffe' : 'Waffe',
    art: fern ? 'Fernkampf' : 'Nahkampf',
    schaden: stufe > 0 ? stufe : 0
  };
  return schadensWuerfel(figur, ware, { steigerung: !!steigerung });
}

/* Die Schadenswuerfel wirklich werfen: jeder explodiert, kein Wild Die
   (Bibel 4.3). "vorgabe" ist eine Zahl und ersetzt das Werfen - dafuer
   gedacht, die Wirkung deterministisch zu pruefen. */
function arenaSchadenWerfen(wuerfel, vorgabe) {
  if (typeof vorgabe === 'number') {
    return { summe: vorgabe, teile: [], vorgegeben: true };
  }
  const teile = (wuerfel || []).map(function (w) {
    const seiten = wuerfelSeiten(w.stufe);
    const r = wuerfelWurf(seiten);
    return { was: w.was, stufe: w.stufe, seiten: seiten, summe: r.summe, teile: r.teile };
  });
  return {
    summe: teile.reduce(function (a, t) { return a + t.summe; }, 0),
    teile: teile
  };
}

/* ---------- Angriff ----------
   Liefert ein reines Ergebnisobjekt; das Anwenden auf den Zustand
   macht der Aufrufer (regie_vault.js / arena_admin.html / karte.html),
   damit ein einziger atomarer Firebase-Schreibzugriff daraus wird.

   saebeltraegerId: von der SL gesetzt, den Spielern NICHT angezeigt.

   vorgabe (nur fuer Tests): { probeBand, steigerungen, schaden } -
   setzt den Ausgang des Angriffswurfs und/oder die Schadenssumme fest.

   bonus: ein flacher Zuschlag auf Wurf UND Schaden. In der Praxis ist
   das genau der JOKER aus dem Aktionsdeck (+2 auf beides, js/kampf.js);
   er steht als Zahl und nicht als Jokerflagge hier, weil diese Funktion
   die Initiative nicht kennen muss. */
function arenaAngriff(angreifer, ziel, alleTokens, regeln, saebeltraegerId, vorgabe, bonus) {
  const v = vorgabe || {};
  const zuschlag = Math.max(0, bonus || 0);
  if (ziel && ziel.tot) return { ok: false, grund: 'ziel_liegt' };
  if (angreifer && angreifer.angeschlagen) return { ok: false, grund: 'angeschlagen' };

  const art = arenaAngriffsart(angreifer, ziel, regeln);
  if (!art) return { ok: false, grund: 'ausser_reichweite' };
  if (art === 'fern' && !angreifer.geladen) return { ok: false, grund: 'nicht_geladen' };

  let mod = arenaAngriffMod(angreifer, ziel, art, alleTokens, regeln);
  if (mod === null) return { ok: false, grund: 'ausser_reichweite' };
  mod += zuschlag;

  const stufe = art === 'nah' ? (angreifer.kaempfen || 0) : (angreifer.schiessen || 0);
  const gangUp = art === 'nah' ? arenaGangUp(angreifer, ziel, alleTokens, regeln) : 0;

  /* Der Wurf selbst kommt aus js/regelwerk.js. "wild" ist dasselbe wie
     "ist eine Wild Card" - das alte Feld "mastery" ist genau hierin
     aufgegangen. */
  let probe;
  if (v.probeBand) {
    probe = { band: v.probeBand, steigerungen: v.steigerungen || 0, mod: mod, vorgegeben: true };
  } else {
    probe = wurf(stufe, { mod: mod, wild: !!angreifer.wild });
  }
  const trifft = probe.band === 'erfolg' || probe.band === 'steigerung';

  const erg = {
    ok: true, art: art, mod: mod, gangUp: gangUp, bonus: zuschlag, stufe: stufe,
    probe: probe, band: probe.band, trifft: trifft,
    schadensWuerfel: [], schaden: 0, schadenWurf: null,
    wirkung: null, angeschlagenNeu: !!ziel.angeschlagen,
    wundenNeu: Math.max(0, ziel.wunden || 0), neueWunden: 0,
    toetet: false, endgueltig: false, mitSaebel: false,
    // Fernkampf leert die Waffe; das Nachladen dauert eine volle Runde
    // und wird beim Rundenwechsel aufgeloest (Bibel 4.5: ein Schuss).
    entlaedt: art === 'fern'
  };

  const mitSaebel = !!saebeltraegerId && angreifer.id === saebeltraegerId;
  erg.mitSaebel = mitSaebel;
  if (!trifft) return erg;

  /* Jaguar-Saebel, Hendriks Regel (23.08. / 18.10.2026): JEDER Treffer
     des Traegers gegen einen normalen Diener nimmt ihn sofort und
     ENDGUELTIG aus dem Gefecht - unabhaengig vom Schaden. Gezaehlt wird
     der TREFFER, nicht die Wirkung: Auch ein Schlag, der die Robustheit
     nicht erreicht haette, laesst den Diener zu Staub fallen.
     Gegen den Seelenlosen zaehlt der Schaden dagegen ganz normal - der
     Saebel ist die Bedingung, nicht die Abkuerzung. */
  const saebelZerfall = mitSaebel && ziel.typ === 'diener';

  const wuerfel = arenaSchadensWuerfel(angreifer, art, probe.band === 'steigerung');
  const wurfS = arenaSchadenWerfen(wuerfel, v.schaden);
  erg.schadensWuerfel = wuerfel;
  erg.schadenWurf = wurfS;
  // Der Joker zaehlt auch auf den Schaden (js/kampf.js, JOKER_BONUS) -
  // beides zusammen, nicht wahlweise.
  erg.schaden = wurfS.summe + zuschlag;

  const max = arenaWundenMax(ziel);
  const w = wirkung(erg.schaden, ziel.robustheit != null ? ziel.robustheit : 4, {
    angeschlagen: !!ziel.angeschlagen,
    wunden: Math.max(0, ziel.wunden || 0),
    extra: !ziel.wild,
    wundenMax: max
  });
  erg.wirkung = w;
  erg.angeschlagenNeu = w.angeschlagen;
  erg.wundenNeu = w.wunden;
  erg.neueWunden = w.neueWunden;

  if (saebelZerfall) {
    erg.angeschlagenNeu = true;
    erg.wundenNeu = max;
    erg.neueWunden = Math.max(w.neueWunden, 1);
    erg.wirkung = { angeschlagen: true, wunden: max, neueWunden: erg.neueWunden,
                    ausserGefecht: true, text: 'zerfällt — endgültig' };
    erg.toetet = true;
  } else {
    erg.toetet = !!w.ausserGefecht;
  }

  /* ENDGUELTIG toetet ausschliesslich der Saebel - Diener UND
     Seelenlosen (Hendriks Vorgabe, 18.10.2026: "Nur mit dem Saebel
     sterben die Wiedergaenger und auch der Boss selbst"). Ohne ihn geht
     jeder von beiden nur zu Boden und steht wieder auf, siehe
     arenaRundenwechsel. */
  erg.endgueltig = erg.toetet && mitSaebel
    && (ziel.typ === 'diener' || ziel.typ === 'seelenloser');

  return erg;
}

/* ---------- Bewegung ----------
   Angeschlagen hindert nicht am Bewegen, nur am Angreifen. */
function arenaBewegungErlaubt(token, ziel, regeln, alleTokens) {
  if (!token || token.tot) return { ok: false, grund: 'tot' };
  if (token.hatGezogen) return { ok: false, grund: 'schon_gezogen' };
  if (ziel.x < 0 || ziel.y < 0 || ziel.x >= regeln.breite || ziel.y >= regeln.hoehe) {
    return { ok: false, grund: 'ausserhalb' };
  }
  if (arenaDistanz(token, ziel) > (token.bewegung || regeln.bewegung)) {
    return { ok: false, grund: 'zu_weit' };
  }
  const besetzt = Object.keys(alleTokens || {}).some(function (id) {
    const t = alleTokens[id];
    return t && id !== token.id && !t.tot && t.x === ziel.x && t.y === ziel.y;
  });
  if (besetzt) return { ok: false, grund: 'besetzt' };
  return { ok: true };
}

/* ---------- Rundenwechsel ----------
   Liefert die Aenderungen als flaches Objekt {pfad: wert}, damit die
   SL-Seite daraus EIN atomares update() bauen kann (gleiche Begruendung
   wie beim Erkundungs-Graphen: sonst feuert der Live-Listener mehrfach
   auf Zwischenstaenden). */

/* Lebt der Seelenlose noch? Wiederauferstehung UND Nachschub sind seine
   Taten (Hendriks Vorgabe: "Der Seelenlose schlaegt zu, wird aber alle
   paar Runden neue Skelette beschwoeren oder die alten beleben"). */
function arenaBossLebt(tokens) {
  return Object.keys(tokens || {}).some(function (id) {
    const t = tokens[id];
    return t && t.typ === 'seelenloser' && !t.tot;
  });
}

/* GEBANNT heisst: endgueltig tot, und das kann nur der Jaguar-Saebel.
   Der Unterschied zu arenaBossLebt() ist der Kern des Finales: Liegt
   der Seelenlose nur am Boden, laufen Wiederauferstehung UND Nachschub
   WEITER - er steht selbst wieder auf, und die Toten kommen weiter.
   Haengte es an arenaBossLebt(), wuerde ein normaler Niederschlag den
   Nachschub stoppen und die Pflichtwaffe waere wirkungslos.

   Ohne Boss-Token im Feld gilt "gebannt" - sonst stuenden Diener in
   einem Gefecht ohne Seelenlosen endlos wieder auf. */
function arenaBossGebannt(tokens) {
  let gesehen = false, alleGebannt = true;
  Object.keys(tokens || {}).forEach(function (id) {
    const t = tokens[id];
    if (!t || t.typ !== 'seelenloser') return;
    gesehen = true;
    if (!(t.tot && t.endgueltig)) alleGebannt = false;
  });
  return gesehen ? alleGebannt : true;
}

function arenaRundenwechsel(tokens, regeln, alteRunde) {
  const runde = (alteRunde || 0) + 1;
  const aenderungen = { runde: runde, freigegeben: null };
  const auferstanden = [];
  const erholt = [];
  const bossLebt = arenaBossLebt(tokens);
  const gebannt = arenaBossGebannt(tokens);

  Object.keys(tokens || {}).forEach(function (id) {
    const t = tokens[id];
    if (!t) return;
    aenderungen['tokens/' + id + '/hatGezogen'] = null;
    aenderungen['tokens/' + id + '/hatAngegriffen'] = null;

    /* Angeschlagen abschuetteln. Savage Worlds wuerfelt dafuer
       Willenskraft; auf diesem Brett waere das ein Dutzend Wuerfe je
       Runde, nur um einen Haken zu verwalten (siehe Abweichung a oben).
       Die Figur verliert dadurch genau eine Handlung. */
    if (t.angeschlagen && !t.tot) {
      aenderungen['tokens/' + id + '/angeschlagen'] = null;
      erholt.push(id);
    }

    // Nachladen: wer geschossen hat, ist die volle Runde darauf wieder bereit.
    if (!t.geladen && !t.tot) {
      if (t.entladenSeitRunde != null && runde > t.entladenSeitRunde) {
        aenderungen['tokens/' + id + '/geladen'] = true;
        aenderungen['tokens/' + id + '/entladenSeitRunde'] = null;
      }
    }

    /* Wiederauferstehung: alles, was NICHT vom Saebel gefallen ist,
       steht wieder auf - Diener wie Seelenloser, und zwar unversehrt.
       Die Schranke ist, ob der Seelenlose gebannt ist, nicht ob er
       steht. */
    const stehtWiederAuf = t.typ === 'diener' || t.typ === 'seelenloser';
    if (!gebannt && t.tot && !t.endgueltig && stehtWiederAuf && t.totSeitRunde != null) {
      if (runde - t.totSeitRunde >= regeln.wiederauferstehenNach) {
        aenderungen['tokens/' + id + '/tot'] = null;
        aenderungen['tokens/' + id + '/totSeitRunde'] = null;
        aenderungen['tokens/' + id + '/wunden'] = null;
        aenderungen['tokens/' + id + '/angeschlagen'] = null;
        auferstanden.push(id);
      }
    }
  });

  // Nachschub: der Seelenlose beschwoert alle paar Runden neue Diener -
  // bis er GEBANNT ist, nicht bis er faellt (siehe arenaBossGebannt).
  const nachschub = (!gebannt && regeln.nachschubAlle > 0 && runde % regeln.nachschubAlle === 0)
    ? (regeln.nachschubAnzahl || 0) : 0;

  return {
    runde: runde, aenderungen: aenderungen, auferstanden: auferstanden,
    erholt: erholt, nachschub: nachschub, bossLebt: bossLebt, bossGebannt: gebannt
  };
}

// Freie Felder am Rand, auf denen Nachschub erscheinen kann.
function arenaFreieRandfelder(tokens, regeln, anzahl) {
  const belegt = {};
  Object.keys(tokens || {}).forEach(function (id) {
    const t = tokens[id];
    if (t && !t.tot) belegt[t.x + ':' + t.y] = true;
  });
  const kandidaten = [];
  for (let x = 0; x < regeln.breite; x++) {
    for (let y = 0; y < regeln.hoehe; y++) {
      const amRand = x === 0 || y === 0 || x === regeln.breite - 1 || y === regeln.hoehe - 1;
      if (amRand && !belegt[x + ':' + y]) kandidaten.push({ x: x, y: y });
    }
  }
  for (let i = kandidaten.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = kandidaten[i]; kandidaten[i] = kandidaten[j]; kandidaten[j] = tmp;
  }
  return kandidaten.slice(0, Math.max(0, anzahl));
}

/* Eine Zeile fuers Kampflog. Liegt HIER, damit alle drei Ansichten
   dieselbe schreiben - und damit die Regel "der Saebel wird nirgends
   benannt" an genau einer Stelle einzuhalten ist. */
function arenaLogZeile(angreifer, ziel, erg) {
  const an = (angreifer && angreifer.name) || '?';
  const zi = (ziel && ziel.name) || '?';
  const kopf = erg.art === 'fern'
    ? an + ' schießt auf ' + zi
    : an + ' greift ' + zi + ' an';
  const bn = (typeof BAND_NAMEN !== 'undefined' && BAND_NAMEN[erg.band])
    ? BAND_NAMEN[erg.band] : erg.band;
  if (!erg.trifft) return kopf + ': ' + bn;
  const w = erg.wirkung || {};
  let folge = w.text || 'keine Wirkung';
  if (w.ausserGefecht) folge = 'außer Gefecht';
  return kopf + ': ' + bn + ', Schaden ' + erg.schaden + ' — ' + folge;
}

/* ==========================================================
   INITIATIVE — das Aktionsdeck auf dem Brett (30.10.2026)
   ----------------------------------------------------------
   Bis heute gab die SL reihum EINE Figur frei, und die
   Reihenfolge war allein ihre Entscheidung. Jetzt teilt das
   Brett Karten aus - mit DEMSELBEN Deck wie der Kampfmodus
   (js/kampf.js: neuesDeck/austeilen/kartenVergleich/jokerBonus).
   Ein zweites Aktionsdeck hier waere derselbe Fehler wie ein
   zweiter Regelkern: zwei Fassungen derselben Sache, die
   auseinanderlaufen.

   WER EINE KARTE BEKOMMT, ist die Savage-Worlds-Regel und nicht
   gegriffen: Jede Wild Card bekommt eine eigene Karte, jede
   Gegner-SORTE teilt sich eine. Auf diesem Brett heisst das:
   Spieler, Verbuendete und der Seelenlose je eine - ALLE DIENER
   ZUSAMMEN EINE. Zwoelf Diener sind damit ein Eintrag in der
   Reihe und nicht zwoelf, und genau das ist der Grund, warum
   die Reihe am Tisch lesbar bleibt.

   Wer AM BODEN liegt, bekommt keine Karte (dieselbe Regel wie
   im Kampfmodus). Ein Eintrag, dessen Figuren im Laufe der
   Runde alle fallen, wird beim Weiterschalten UEBERSPRUNGEN
   statt leer durchlaufen - sonst wartete der Tisch auf einen
   Toten.

   DIE DIENER-GRUPPE HAELT KEINE FESTE LISTE: Welche Figuren auf
   ihrer Karte handeln, wird erst beantwortet, wenn die Karte
   dran ist (arenaIniTokens). Nur so handelt der Nachschub, der
   mitten in der Runde erscheint, noch auf derselben Karte -
   eine beim Austeilen eingefrorene Liste wuerde ihn bis zur
   naechsten Runde stillstehen lassen.
   ========================================================== */
const ARENA_DIENER_SCHLUESSEL = 'diener';

/* Die Teilnehmer einer Runde, in der Form, die austeilen() erwartet.
   Sortiert nach Token-Kennung, damit die Reihenfolge VOR dem Mischen
   reproduzierbar ist - sonst waere ein Test auf ein gezinktes Deck
   wertlos. */
function arenaIniEintraege(tokens) {
  const eintraege = [];
  const diener = [];
  Object.keys(tokens || {}).sort().forEach(function (id) {
    const t = tokens[id];
    if (!t || t.tot) return;
    if (t.typ === 'diener') { diener.push(id); return; }
    eintraege.push({ key: 't:' + id, name: t.name || id, tokens: [id] });
  });
  if (diener.length) {
    eintraege.push({
      key: ARENA_DIENER_SCHLUESSEL,
      name: diener.length > 1 ? 'Die Wiedergänger (' + diener.length + ')' : 'Ein Wiedergänger',
      tokens: diener
    });
  }
  return eintraege;
}

/* Welche Figuren handeln JETZT auf diesem Eintrag? Fuer die
   Diener-Karte live aus dem Feld, fuer alle anderen die eine Figur -
   und nur, solange sie steht. */
function arenaIniTokens(eintrag, tokens) {
  if (!eintrag) return [];
  if (eintrag.key === ARENA_DIENER_SCHLUESSEL) {
    return Object.keys(tokens || {}).sort().filter(function (id) {
      const t = tokens[id];
      return t && !t.tot && t.typ === 'diener';
    });
  }
  return (eintrag.tokens || []).filter(function (id) {
    const t = (tokens || {})[id];
    return t && !t.tot;
  });
}

/* Austeilen. "deck" ist der Rest der Vorrunde; ist er leer, nimmt
   austeilen() von selbst ein frisches, frisch gemischtes Deck. */
function arenaAusteilen(tokens, deck, zufall) {
  const erg = austeilen(arenaIniEintraege(tokens), deck, zufall);
  return {
    reihe: erg.reihe.map(function (e) {
      return { key: e.key, name: e.name, tokens: e.tokens, karte: e.karte };
    }),
    index: 0,
    deck: erg.deck,
    mischenNoetig: erg.mischenNoetig
  };
}

/* Der naechste Index ab "von", dessen Eintrag ueberhaupt noch jemanden
   hat. -1 heisst: die Runde ist durch. */
function arenaIniIndex(ini, tokens, von) {
  const reihe = (ini && ini.reihe) || [];
  for (let i = Math.max(0, von || 0); i < reihe.length; i++) {
    if (arenaIniTokens(reihe[i], tokens).length) return i;
  }
  return -1;
}

function arenaIniAmZug(ini, tokens) {
  const i = arenaIniIndex(ini, tokens, (ini && ini.index) || 0);
  if (i < 0) return null;
  return Object.assign({ index: i }, ini.reihe[i]);
}

function arenaIniWeiter(ini, tokens) {
  const i = arenaIniIndex(ini, tokens, ((ini && ini.index) || 0) + 1);
  return { index: i < 0 ? null : i, rundeFertig: i < 0 };
}

/* Welche Figur wird freigegeben, wenn dieser Eintrag dran ist? Bei
   einem Einzeleintrag die Figur selbst - auch wenn es ein Gegner ist:
   karte.html laesst Spieler ohnehin nur Figuren vom Typ "spieler"
   steuern und zeigt alles andere als "handelt ...", und so steht dort
   immer, WER am Zug ist. Auf der Diener-Karte handelt niemand einzeln,
   also niemand. */
function arenaIniFreigabe(eintrag, tokens) {
  if (!eintrag || eintrag.key === ARENA_DIENER_SCHLUESSEL) return null;
  const ids = arenaIniTokens(eintrag, tokens);
  return ids.length === 1 ? ids[0] : null;
}

/* Der Joker gibt +2 auf jede Probe UND auf den Schaden (js/kampf.js).
   Ohne diese Stelle waere die Jokerkarte auf dem Brett eine Karte ohne
   Wirkung - dann koennte man das Deck auch weglassen. */
function arenaIniBonus(ini, tokenId, tokens) {
  const reihe = (ini && ini.reihe) || [];
  for (let i = 0; i < reihe.length; i++) {
    if (arenaIniTokens(reihe[i], tokens).indexOf(tokenId) >= 0) return jokerBonus(reihe[i]);
  }
  return 0;
}

/* ==========================================================
   DIE DIENER HANDELN VON SELBST (30.10.2026)
   ----------------------------------------------------------
   Hendriks Vorgabe: "Ich steuer den Seelenlosen, aber die
   kleinen Untoten sollten automatisch auf den naechstgelegenen
   gehen."

   DIE REGEL IST BEWUSST DUMM, und das ist der Punkt: Ein
   Wiedergaenger geht auf den NAECHSTEN - nicht auf den
   schwaechsten, nicht auf den gefaehrlichsten, nicht auf den
   schon verwundeten. Er sucht sich kein Ziel aus, er geht
   einfach los. Alles Kluegere waere Taktik, und Taktik gehoert
   der SL und den Spielern, nicht dem Brett.

   Bei gleicher Entfernung entscheidet die Token-Kennung. Das
   ist willkuerlich, aber REPRODUZIERBAR - eine Zufallswahl
   waere am Tisch nicht nachvollziehbar und im Test nicht
   pruefbar.

   DER WEG WIRD GESUCHT, nicht geraten (seit 30.10.2026,
   Fortsetzung 4). Erst stand hier ein gieriger Schritt: das
   angrenzende freie Feld, das dem Ziel naeher liegt. Der laeuft
   vor eine geschlossene Reihe und bleibt dort stehen - auf einem
   Brett, auf dem bis zu einem Dutzend Diener in der Gegend
   herumstehen, ist das nicht der Ausnahmefall, sondern der
   Normalfall, sobald es eng wird. Eine Automatik, die genau dann
   aufgibt, wenn sie gebraucht wird, nimmt der SL die Arbeit nicht
   ab, sondern gibt sie ihr zurueck.

   Gesucht wird mit einer BREITENSUCHE (arenaWeg) bis zu einem
   Feld, das am Ziel angrenzt; gelaufen werden dann die ersten
   paar Schritte dieses Weges. Chebyshev-Nachbarschaft, besetzte
   Felder sind gesperrt, das ZIEL selbst ist kein Hindernis (es
   ist der Gegner, auf den eingeschlagen werden soll). Die
   Suchreihenfolge ist fest, also ist der Weg reproduzierbar -
   dieselbe Begruendung wie bei der Zielwahl.

   Gibt es GAR KEINEN Weg (komplett eingemauert), bleibt der
   gierige Schritt als Rueckfall: Lieber ein Feld naeher als
   gar nichts. Steht auch dort nichts offen, bleibt die Figur
   stehen, statt hin und her zu wackeln.

   Angeschlagen hindert nicht am Gehen, nur am Zuschlagen
   (arenaKannAngreifen) - ein angeschlagener Diener laeuft also
   trotzdem los und steht in der naechsten Runde schon da.
   ========================================================== */
function arenaFeldFrei(f, tokens, ausserId) {
  return !Object.keys(tokens || {}).some(function (id) {
    const t = tokens[id];
    return t && id !== ausserId && !t.tot && t.x === f.x && t.y === f.y;
  });
}

function arenaNaechstesZiel(figur, tokens) {
  let best = null;
  Object.keys(tokens || {}).sort().forEach(function (id) {
    const t = tokens[id];
    if (!t || t.tot || !arenaIstFeind(figur, t)) return;
    const dist = arenaDistanz(figur, t);
    if (!best || dist < best.dist) best = { id: id, dist: dist, token: t };
  });
  return best;
}

/* Die acht Nachbarfelder in FESTER Reihenfolge. Die Reihenfolge entscheidet,
   welcher von mehreren gleich kurzen Wegen gefunden wird - sie ist also kein
   Beiwerk, sondern der Grund, warum derselbe Stand immer denselben Weg ergibt.
   Gerade Richtungen zuerst, dann die Diagonalen: Ein Weg, der geradeaus geht,
   wo er geradeaus gehen kann, sieht am Tisch richtig aus. */
const ARENA_NACHBARN = [
  { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
  { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
];

/* Der kuerzeste Weg bis zu einem Feld, das am Ziel ANGRENZT - als Liste der
   Felder ohne das Startfeld. Leere Liste heisst "steht schon dort", null heisst
   "es gibt keinen Weg".

   Breitensuche und nicht A*: Das Brett hat 256 Felder, da ist die Heuristik
   gespart. Was zaehlt, ist die Sperrung - besetzte Felder sind Mauern, das Ziel
   selbst nicht (auf das soll ja eingeschlagen werden). */
function arenaWeg(von, ziel, tokens, regeln, ausserId) {
  if (arenaDistanz(von, ziel) <= regeln.nahkampfReichweite) return [];
  const start = von.x + ':' + von.y;
  const vorher = {};
  vorher[start] = null;
  let rand = [{ x: von.x, y: von.y }];
  while (rand.length) {
    const naechsterRand = [];
    for (let i = 0; i < rand.length; i++) {
      const hier = rand[i];
      for (let n = 0; n < ARENA_NACHBARN.length; n++) {
        const f = { x: hier.x + ARENA_NACHBARN[n].dx, y: hier.y + ARENA_NACHBARN[n].dy };
        if (f.x < 0 || f.y < 0 || f.x >= regeln.breite || f.y >= regeln.hoehe) continue;
        const k = f.x + ':' + f.y;
        if (k in vorher) continue;
        if (!arenaFeldFrei(f, tokens, ausserId)) continue;
        vorher[k] = hier.x + ':' + hier.y;
        if (arenaDistanz(f, ziel) <= regeln.nahkampfReichweite) {
          // Rueckwaerts aufrollen und umdrehen.
          const weg = [];
          let lauf = k;
          while (lauf && lauf !== start) {
            const t = lauf.split(':');
            weg.unshift({ x: +t[0], y: +t[1] });
            lauf = vorher[lauf];
          }
          return weg;
        }
        naechsterRand.push(f);
      }
    }
    rand = naechsterRand;
  }
  return null;
}

/* Der gierige Schritt - seit dem 30.10.2026 nur noch der RUECKFALL fuer den
   Fall, dass es gar keinen Weg gibt (komplett eingemauert). Lieber ein Feld
   naeher als gar nichts; bringt kein Feld eine echte Annaeherung, bleibt die
   Figur stehen, statt hin und her zu wackeln. */
function arenaSchrittGierig(figur, ziel, tokens, regeln) {
  const weite = Math.max(1, figur.bewegung || regeln.bewegung);
  let x = figur.x, y = figur.y, gelaufen = 0;
  for (let s = 0; s < weite; s++) {
    const hier = { x: x, y: y };
    if (arenaDistanz(hier, ziel) <= regeln.nahkampfReichweite) break;
    let best = null;
    for (let n = 0; n < ARENA_NACHBARN.length; n++) {
      const f = { x: x + ARENA_NACHBARN[n].dx, y: y + ARENA_NACHBARN[n].dy };
      if (f.x < 0 || f.y < 0 || f.x >= regeln.breite || f.y >= regeln.hoehe) continue;
      if (!arenaFeldFrei(f, tokens, figur.id)) continue;
      const dist = arenaDistanz(f, ziel);
      if (dist >= arenaDistanz(hier, ziel)) continue;   // nur echte Annaeherung
      /* Bei gleicher Entfernung entscheidet die LUFTLINIE, und das ist keine
         Feinheit: Chebyshev zaehlt diagonal wie gerade, also sind "schraeg weg
         in x, naeher in y" und "geradeaus" gleich weit. Nach reiner Kennung
         driftete die ganze Reihe sichtbar zur Seite, statt auf das Ziel
         zuzulaufen. Die Kennung bleibt als letzter Entscheid, damit das
         Ergebnis reproduzierbar ist. */
      const luft = (f.x - ziel.x) * (f.x - ziel.x) + (f.y - ziel.y) * (f.y - ziel.y);
      const schl = f.x * 10000 + f.y;
      if (!best || dist < best.dist
        || (dist === best.dist && luft < best.luft)
        || (dist === best.dist && luft === best.luft && schl < best.schl)) {
        best = { f: f, dist: dist, luft: luft, schl: schl };
      }
    }
    if (!best) break;
    x = best.f.x; y = best.f.y; gelaufen++;
  }
  return gelaufen ? { x: x, y: y } : null;
}

/* Wohin die Figur in diesem Zug laeuft, oder null fuer "bleibt stehen".
   Gelaufen werden die ersten "bewegung" Schritte des gesuchten Weges. */
function arenaSchrittZu(figur, ziel, tokens, regeln) {
  const weite = Math.max(1, figur.bewegung || regeln.bewegung);
  const weg = arenaWeg(figur, ziel, tokens, regeln, figur.id);
  if (weg === null) return arenaSchrittGierig(figur, ziel, tokens, regeln);
  if (!weg.length) return null;                       // steht schon daneben
  return weg[Math.min(weg.length, weite) - 1];
}

/* ---------- Die Aenderungen eines Angriffs ----------
   Bis heute stand diese Rechnung WORTGLEICH in karte.html und in
   arena_admin.html. Die Diener-Automatik waere die dritte Kopie
   geworden - also liegt sie jetzt hier, wie die Logzeile. */
function arenaAngriffAenderungen(a, z, erg, runde) {
  const aenderungen = {};
  aenderungen['tokens/' + a.id + '/hatAngegriffen'] = true;
  if (erg.entlaedt) {
    aenderungen['tokens/' + a.id + '/geladen'] = false;
    aenderungen['tokens/' + a.id + '/entladenSeitRunde'] = runde || 1;
  }
  if (erg.endgueltig) {
    aenderungen['tokens/' + z.id] = null;              // verschwindet ganz
  } else if (erg.trifft) {
    aenderungen['tokens/' + z.id + '/angeschlagen'] = erg.angeschlagenNeu ? true : null;
    aenderungen['tokens/' + z.id + '/wunden'] = erg.wundenNeu > 0 ? erg.wundenNeu : null;
    if (erg.toetet) {
      aenderungen['tokens/' + z.id + '/tot'] = true;
      aenderungen['tokens/' + z.id + '/totSeitRunde'] = runde || 1;
    }
  }
  return aenderungen;
}

/* Die volle Logzeile samt Zusaetzen - arenaLogZeile() bleibt der Kern,
   damit die Regel "der Saebel wird nirgends benannt" eine Stelle hat. */
function arenaAngriffText(a, z, erg) {
  let text = arenaLogZeile(a, z, erg);
  if (erg.bonus > 0) text += ' (Joker, +' + erg.bonus + ')';
  if (erg.gangUp > 0) text += ' (gemeinsam, +' + erg.gangUp + ')';
  if (erg.endgueltig) text += ' — zerfällt zu Staub.';
  else if (erg.toetet) text += ' — geht zu Boden.';
  return text;
}

/* Flache Firebase-Pfade auf eine LOKALE Tokenkarte anwenden. Gebraucht,
   damit mehrere Diener hintereinander einen konsistenten Stand sehen:
   Ohne das liefen zwei auf dasselbe Feld, und der zweite schluege auf
   einen Toten ein. Versteht genau die Pfade, die diese Datei schreibt. */
function arenaAnwenden(tokens, aenderungen) {
  const neu = {};
  Object.keys(tokens || {}).forEach(function (id) {
    neu[id] = Object.assign({}, tokens[id]);
  });
  Object.keys(aenderungen || {}).forEach(function (pfad) {
    const teile = pfad.split('/');
    if (teile[0] !== 'tokens' || !teile[1]) return;
    const id = teile[1], wert = aenderungen[pfad];
    if (teile.length === 2) {
      if (wert == null) delete neu[id]; else neu[id] = Object.assign({}, wert);
      return;
    }
    if (!neu[id]) return;
    if (wert == null) delete neu[id][teile[2]]; else neu[id][teile[2]] = wert;
  });
  return neu;
}

/* Ein Diener handelt: hingehen, und wenn er dann dran ist, zuschlagen.
   Liefert zusaetzlich die FORTGESCHRIEBENE Tokenkarte, damit der naechste
   Diener auf dem neuen Stand rechnet. */
function arenaDienerZug(dienerId, tokens, regeln, saebeltraegerId, runde, bonus) {
  const roh = (tokens || {})[dienerId];
  const leer = { ok: false, aenderungen: {}, log: [], tokens: tokens, gezogen: false, angriff: null };
  if (!roh || roh.tot || roh.typ !== 'diener') return Object.assign(leer, { grund: 'kein_diener' });
  if (roh.hatGezogen || roh.hatAngegriffen) return Object.assign(leer, { grund: 'schon_gehandelt' });

  const d = Object.assign({ id: dienerId }, roh);
  const ziel = arenaNaechstesZiel(d, tokens);
  if (!ziel) return Object.assign(leer, { grund: 'kein_ziel' });

  const aenderungen = {};
  const log = [];
  let stand = tokens;
  let gezogen = false;

  const schritt = arenaSchrittZu(d, ziel.token, tokens, regeln);
  if (schritt) {
    aenderungen['tokens/' + dienerId + '/x'] = schritt.x;
    aenderungen['tokens/' + dienerId + '/y'] = schritt.y;
    aenderungen['tokens/' + dienerId + '/hatGezogen'] = true;
    stand = arenaAnwenden(stand, aenderungen);
    gezogen = true;
  }

  const jetzt = Object.assign({ id: dienerId }, stand[dienerId]);
  let erg = null;
  if (arenaKannAngreifen(jetzt)) {
    const z = Object.assign({ id: ziel.id }, stand[ziel.id] || {});
    if (z.typ) {
      const a = arenaAngriff(jetzt, z, stand, regeln, saebeltraegerId, null, bonus);
      if (a.ok) {
        erg = a;
        const na = arenaAngriffAenderungen(jetzt, z, a, runde);
        Object.keys(na).forEach(function (p) { aenderungen[p] = na[p]; });
        stand = arenaAnwenden(stand, na);
        log.push(arenaAngriffText(jetzt, z, a));
      }
    }
  }

  return {
    ok: gezogen || !!erg, aenderungen: aenderungen, log: log,
    tokens: stand, gezogen: gezogen, angriff: erg, zielId: ziel.id
  };
}

/* Alle Diener der Reihe nach - EIN Paket Aenderungen fuer EIN atomares
   update(). Die Reihenfolge ist die Token-Kennung, also dieselbe wie
   ueberall sonst; wer schon gehandelt hat, wird uebersprungen, ein
   zweiter Klick wiederholt also nichts. */
function arenaDienerRunde(tokens, regeln, saebeltraegerId, runde, bonus) {
  let stand = tokens || {};
  const aenderungen = {};
  const log = [];
  let gezogen = 0, angriffe = 0, treffer = 0;
  Object.keys(stand).sort().filter(function (id) {
    const t = stand[id];
    return t && !t.tot && t.typ === 'diener';
  }).forEach(function (id) {
    const z = arenaDienerZug(id, stand, regeln, saebeltraegerId, runde, bonus);
    if (!z.ok) return;
    Object.keys(z.aenderungen).forEach(function (p) { aenderungen[p] = z.aenderungen[p]; });
    z.log.forEach(function (l) { log.push(l); });
    stand = z.tokens;
    if (z.gezogen) gezogen++;
    if (z.angriff) { angriffe++; if (z.angriff.trifft) treffer++; }
  });
  return {
    aenderungen: aenderungen, log: log, tokens: stand,
    gezogen: gezogen, angriffe: angriffe, treffer: treffer
  };
}

/* ==========================================================
   EIN BLATT AUF EIN TOKEN (30.10.2026, Fortsetzung 5)
   ----------------------------------------------------------
   Hendriks Frage: "Kann man die Spieler direkt mit den wirklich
   vorhandenen Spielern in dieser Session verknuepfen?"

   Ja - und zwar erst seit dem 15.10.2026: Bis dahin lagen die
   Charakterboegen nur im localStorage der jeweiligen Spieler, die
   SL kam an die Werte nicht heran, und die Arena stellte deshalb
   "Spieler 1-4" mit Harwicks Werten als Massstab auf. Seitdem
   liegt jede Figur unter sitzungen/{sid}/stand/figuren/{kennung},
   also genau dort, wo auch diese Seite liest.

   DIESE FUNKTION IST DIE EINE ABLEITUNG Blatt -> Token. Sie nimmt
   eine FIGUR im Sinne von js/regelwerk.js (alsFigur), egal ob sie
   aus dem Bogen eines Spielers oder aus einem NSC-Blatt
   (nscAlsFigur) kommt - vorher stand die Rechnung nur in
   arena_admin.html an den NSC, und der Spieler-Weg waere die
   zweite Kopie geworden.

   Die Waffe ist die BESTE getragene ihrer Art. Das ist eine
   Vereinfachung: Wer Saebel und Dolch traegt, schlaegt mit dem
   Saebel - auf dem Brett gibt es keine Waffenwahl, und die
   Alternative waere, bei jedem Angriff zu fragen.

   WICHTIG: Traegt die Figur eine von der SL ERFUNDENE Ware
   (eigeneWaren, z. B. den Jaguar-Saebel), muss die aufrufende
   Seite sie vorher ueber eigeneWarenSetzen() ins Regelwerk
   eingetragen haben - sonst findet AUSR_BY_ID sie nicht und die
   Waffe faellt STILL weg. Genau dieselbe Reihenfolge wie in
   heldenbrief.html und regie_figuren.html.
   ========================================================== */
function arenaBesteWaffe(figur, art) {
  const liste = (figur && figur.ausr) || [];
  let best = null;
  liste.forEach(function (id) {
    const a = (typeof AUSR_BY_ID !== 'undefined') ? AUSR_BY_ID[id] : null;
    if (!a || a.art !== art) return;
    if (!best || (a.schaden || 0) > (best.schaden || 0)) best = a;
  });
  return best;
}

function arenaWerteAusFigur(figur, name) {
  if (!figur) return null;
  const nah = arenaBesteWaffe(figur, 'Nahkampf');
  const fern = arenaBesteWaffe(figur, 'Fernkampf');
  return {
    name: name || figur.name || '',
    kaempfen: (figur.fert && figur.fert['Kämpfen']) || 0,
    schiessen: (figur.fert && figur.fert['Schießen']) || 0,
    staerke: (figur.attr && figur.attr['Stärke']) || 1,
    waffe: nah ? (nah.schaden || 0) : 0,
    fernwaffe: fern ? (fern.schaden || 0) : 0,
    reichweite: fern ? (fern.reichweite || 1) : 0,
    parade: parade(figur),
    robustheit: robustheit(figur),
    /* Wild Card: Spielerfiguren immer, NSC laut Blatt. nscAlsFigur() setzt
       das Feld; ein Spielerbogen hat es nicht, und dort ist "true" richtig. */
    wild: (figur.wild === undefined) ? true : !!figur.wild
  };
}

/* Der ZUSTAND der Figur, getrennt von ihren Werten - damit die SL wahlweise
   nur die Werte stempeln oder die Figur so aufs Brett stellen kann, wie sie
   gerade dasteht. Geklemmt auf die Tragfaehigkeit: Eine Figur, die laut Bogen
   ausser Gefecht ist, steht auf dem Brett mit voller Wundenzahl, aber nicht
   schon gefallen - ob sie ueberhaupt mitkaempft, entscheidet die SL. */
function arenaZustandAusFigur(figur, wundenMax) {
  const max = (wundenMax == null) ? 3 : Math.max(0, wundenMax | 0);
  return {
    wunden: Math.min(max, Math.max(0, (figur && figur.wunden) || 0)),
    angeschlagen: !!(figur && figur.angeschlagen)
  };
}

/* ---------- Zwei Aenderungspakete pfadsicher zusammenlegen ----------
   DAS IST KEINE BEQUEMLICHKEIT, SONDERN EINE FIREBASE-REGEL: Ein update()
   lehnt es ab, wenn ein Pfad Vorfahre eines anderen ist ("contains an
   ancestor of another path"). Genau das entsteht hier an zwei Stellen von
   selbst:

     initiative        (das ganze Objekt beim Austeilen)
     initiative/index  (das Landen auf einer Karte)

     tokens/t7         (frisch beschworener Nachschub, ganzes Objekt)
     tokens/t7/x       (derselbe Diener laeuft in derselben Runde los)

   Beides faellt erst am Tisch auf, weil das update() dann KOMPLETT
   scheitert - also wird hier gemischt statt stumpf zugewiesen: Gibt es
   schon den Vorfahren als Objekt, wandert das Feld HINEIN. Ist der
   Vorfahre auf null gesetzt (Token geloescht), wird das Feld verworfen -
   ein Feld an einer geloeschten Figur hat keinen Sinn. */
function arenaMischen(ziel, quelle) {
  Object.keys(quelle || {}).forEach(function (pfad) {
    const teile = pfad.split('/');
    let eingebaut = false;
    for (let i = teile.length - 1; i > 0 && !eingebaut; i--) {
      const vorfahr = teile.slice(0, i).join('/');
      if (!(vorfahr in ziel)) continue;
      const wert = ziel[vorfahr];
      if (wert == null) { eingebaut = true; break; }   // Figur ist weg
      let knoten = wert;
      const rest = teile.slice(i);
      for (let k = 0; k < rest.length - 1; k++) {
        if (knoten[rest[k]] == null || typeof knoten[rest[k]] !== 'object') knoten[rest[k]] = {};
        knoten = knoten[rest[k]];
      }
      knoten[rest[rest.length - 1]] = quelle[pfad];
      eingebaut = true;
    }
    if (eingebaut) return;
    // Umgekehrt: Dieser Pfad ist Vorfahre schon vorhandener - die fallen weg.
    Object.keys(ziel).forEach(function (vorhanden) {
      if (vorhanden.indexOf(pfad + '/') === 0) delete ziel[vorhanden];
    });
    ziel[pfad] = quelle[pfad];
  });
  return ziel;
}

/* ---------- Der Ablauf einer Runde, als reine Funktionen ----------
   "Wir landen jetzt auf Karte i" und "neue Runde, neue Karten" standen beim
   ersten Anlauf in arena_admin.html. Das Kompakt-Panel in js/regie_vault.js
   braucht genau dasselbe - also liegt es hier, statt zweimal dort. Beide
   liefern ein flaches { aenderungen, logs }, aus dem der Aufrufer EIN
   atomares update() baut. */

/* Landen auf einem Eintrag: Index setzen, die Figur freigeben - und wenn es
   die Diener-Karte ist, handeln sie SOFORT. Das ist Hendriks "automatisch":
   Die SL schaltet weiter, die Wiedergaenger laufen von selbst. */
function arenaIniLanden(ini, tokens, index, regeln, saebeltraegerId, runde) {
  const aenderungen = {};
  const logs = [];
  aenderungen['initiative/index'] = (index == null) ? null : index;
  const eintrag = (index == null) ? null : (((ini && ini.reihe) || [])[index] || null);
  aenderungen['freigegeben'] = eintrag ? (arenaIniFreigabe(eintrag, tokens) || null) : null;
  if (!eintrag || eintrag.key !== ARENA_DIENER_SCHLUESSEL) {
    return { aenderungen: aenderungen, logs: logs, tokens: tokens, eintrag: eintrag };
  }
  const erg = arenaDienerRunde(tokens, regeln, saebeltraegerId, runde, jokerBonus(eintrag));
  arenaMischen(aenderungen, erg.aenderungen);
  if (erg.gezogen) {
    logs.push(erg.gezogen > 1
      ? erg.gezogen + ' Wiedergänger drängen vor.'
      : 'Ein Wiedergänger drängt vor.');
  }
  erg.log.forEach(function (l) { logs.push(l); });
  if (!erg.gezogen && !erg.angriffe) logs.push('Die Wiedergänger kommen nicht weiter.');
  return { aenderungen: aenderungen, logs: logs, tokens: erg.tokens, eintrag: eintrag };
}

/* Austeilen und auf die erste Karte landen. Das RESTDECK der Vorrunde wird
   weitergereicht - ein Deck, das nie kleiner wird, waere kein Deck
   (js/kampf.js). Nur wenn der Joker gefallen ist, wird neu gemischt. */
function arenaIniNeueRunde(altIni, tokens, regeln, saebeltraegerId, runde, zufall, ohneLanden) {
  const alt = altIni || {};
  const deck = alt.mischenNoetig ? null : (alt.deck || null);
  const ini = arenaAusteilen(tokens, deck, zufall);
  const aenderungen = { initiative: ini };
  const logs = [];
  if (ini.mischenNoetig) logs.push('Der Joker ist gefallen — danach wird neu gemischt.');
  if (ohneLanden) return { ini: ini, aenderungen: aenderungen, logs: logs, tokens: tokens };
  const i = arenaIniIndex(ini, tokens, 0);
  const gelandet = arenaIniLanden(ini, tokens, i < 0 ? null : i, regeln, saebeltraegerId, runde);
  arenaMischen(aenderungen, gelandet.aenderungen);
  gelandet.logs.forEach(function (l) { logs.push(l); });
  return { ini: ini, aenderungen: aenderungen, logs: logs, tokens: gelandet.tokens };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GANG_UP_MAX,
    arenaDistanz, arenaInReichweite, arenaAngriffsart, arenaGangUp, arenaAngriffMod,
    arenaSeite, arenaIstSpieler, arenaIstFeind,
    arenaWundenMax, arenaWundenAbzug, arenaWundenAnteil, arenaKannAngreifen, arenaZustandText,
    arenaSchadensWuerfel, arenaSchadenWerfen,
    arenaAngriff, arenaBewegungErlaubt,
    arenaBossLebt, arenaBossGebannt, arenaRundenwechsel, arenaFreieRandfelder,
    arenaLogZeile, arenaAngriffAenderungen, arenaAngriffText, arenaAnwenden,
    ARENA_DIENER_SCHLUESSEL,
    arenaIniEintraege, arenaIniTokens, arenaAusteilen, arenaIniIndex,
    arenaIniAmZug, arenaIniWeiter, arenaIniFreigabe, arenaIniBonus,
    arenaFeldFrei, arenaNaechstesZiel, arenaWeg, arenaSchrittGierig, arenaSchrittZu,
    ARENA_NACHBARN,
    arenaDienerZug, arenaDienerRunde,
    arenaIniLanden, arenaIniNeueRunde, arenaMischen,
    arenaBesteWaffe, arenaWerteAusFigur, arenaZustandAusFigur
  };
}

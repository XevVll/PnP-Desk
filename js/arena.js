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
   setzt den Ausgang des Angriffswurfs und/oder die Schadenssumme fest. */
function arenaAngriff(angreifer, ziel, alleTokens, regeln, saebeltraegerId, vorgabe) {
  const v = vorgabe || {};
  if (ziel && ziel.tot) return { ok: false, grund: 'ziel_liegt' };
  if (angreifer && angreifer.angeschlagen) return { ok: false, grund: 'angeschlagen' };

  const art = arenaAngriffsart(angreifer, ziel, regeln);
  if (!art) return { ok: false, grund: 'ausser_reichweite' };
  if (art === 'fern' && !angreifer.geladen) return { ok: false, grund: 'nicht_geladen' };

  const mod = arenaAngriffMod(angreifer, ziel, art, alleTokens, regeln);
  if (mod === null) return { ok: false, grund: 'ausser_reichweite' };

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
    ok: true, art: art, mod: mod, gangUp: gangUp, stufe: stufe,
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
  erg.schaden = wurfS.summe;

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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GANG_UP_MAX,
    arenaDistanz, arenaInReichweite, arenaAngriffsart, arenaGangUp, arenaAngriffMod,
    arenaSeite, arenaIstSpieler, arenaIstFeind,
    arenaWundenMax, arenaWundenAbzug, arenaWundenAnteil, arenaKannAngreifen, arenaZustandText,
    arenaSchadensWuerfel, arenaSchadenWerfen,
    arenaAngriff, arenaBewegungErlaubt,
    arenaBossLebt, arenaBossGebannt, arenaRundenwechsel, arenaFreieRandfelder,
    arenaLogZeile
  };
}

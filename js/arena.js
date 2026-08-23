// Regel-Engine fuer die Arena (Endkampf, Bibel 12.1). Bewusst als eigene
// Datei ohne DOM- und ohne Firebase-Zugriff: dieselbe Logik laeuft in
// karte.html (Spieleransicht) und regie.html (Adminpanel), und sie laesst
// sich mit Node ohne Browser testen.
//
// Alles hier rechnet nach dem Probensystem der Bibel (4.1):
//   Schwelle = Wert x 10
//   Guter Erfolg      1 .. Schwelle/2
//   Normaler Erfolg   Schwelle/2+1 .. Schwelle
//   Schlechter Erfolg Schwelle+1 .. Schwelle + (100-Schwelle)/2
//   Misserfolg        Rest
// Ohne Mastery entfaellt das Band "Schlechter Erfolg" und faellt in den
// Misserfolg - die Zahlenschwellen selbst verschieben sich NICHT (4.2).
//
// Bedraengnis (4.4): jeder ZUSAETZLICHE Angreifer neben dem ersten
// verschiebt das Ergebnis um ein Band nach unten.

const ARENA_BAENDER = ['gut', 'normal', 'schlecht', 'miss'];

// Grenzen der vier Baender fuer einen Wert. Rein rechnerisch, unabhaengig
// von Mastery - die wirkt erst bei der Zuordnung (siehe arenaBand).
function arenaSchwellen(wert) {
  const schwelle = Math.max(0, Math.min(100, Math.round(wert * 10)));
  return {
    schwelle: schwelle,
    gutBis: Math.floor(schwelle / 2),
    normalBis: schwelle,
    schlechtBis: schwelle + Math.floor((100 - schwelle) / 2)
  };
}

function arenaBand(wurf, wert, mastery) {
  const s = arenaSchwellen(wert);
  if (wurf <= s.gutBis && s.gutBis >= 1) return 'gut';
  if (wurf <= s.normalBis) return 'normal';
  if (mastery && wurf <= s.schlechtBis) return 'schlecht';
  return 'miss';
}

// Ein Band nach unten je zusaetzlichem Angreifer. "miss" ist das Ende.
function arenaVerschiebe(band, stufen) {
  let i = ARENA_BAENDER.indexOf(band);
  if (i < 0) return 'miss';
  i = Math.min(ARENA_BAENDER.length - 1, i + Math.max(0, stufen | 0));
  return ARENA_BAENDER[i];
}

// Schaden je Band. "Guter Erfolg zaehlt doppelt" ist an die Formulierung der
// Bibel angelehnt (10.11); schlechter Erfolg ist noch ein Erfolg, macht aber
// nur die Haelfte, mindestens 1.
function arenaSchaden(band, grundschaden) {
  const g = Math.max(0, grundschaden | 0);
  if (band === 'gut') return g * 2;
  if (band === 'normal') return g;
  if (band === 'schlecht') return Math.max(1, Math.floor(g / 2));
  return 0;
}

// ---------- Raster ----------
// Positionen sind ganzzahlige Feldkoordinaten. Entfernung als Chebyshev-
// Distanz (diagonal zaehlt wie gerade) - am Tisch die unstrittigste Variante:
// "angrenzend" heisst genau Distanz 1, egal ob schraeg oder gerade.
function arenaDistanz(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

function arenaInReichweite(a, b, reichweite) {
  return arenaDistanz(a, b) <= reichweite;
}

// Welche Angriffsart greift? Hendriks Vorgabe: in Nahkampfreichweite ist es
// Nahkampf, sonst Fernkampf. Es gibt also keine Wahl - die Distanz entscheidet.
function arenaAngriffsart(angreifer, ziel, regeln) {
  const d = arenaDistanz(angreifer, ziel);
  if (d <= regeln.nahkampfReichweite) return 'nah';
  if (d <= regeln.fernkampfReichweite) return 'fern';
  return null; // ausser Reichweite
}

// Zahl der zusaetzlichen Gegner im Nahkampf am Angreifer (Bedraengnis, 4.4).
function arenaBedraengnis(angreifer, alleTokens, regeln) {
  let feinde = 0;
  Object.keys(alleTokens).forEach(function (id) {
    const t = alleTokens[id];
    if (!t || t.tot || id === angreifer.id) return;
    if (arenaIstFeind(angreifer, t) && arenaDistanz(angreifer, t) <= regeln.nahkampfReichweite) feinde++;
  });
  return Math.max(0, feinde - 1);
}

// Zwei Seiten, vier Typen (seit 2026-08-23): "spieler" und "verbuendeter"
// (mitkaempfende NSC wie Harwick oder Cormac) stehen auf der Helden-Seite,
// "diener" und "seelenloser" auf der Gegner-Seite. Der Unterschied zwischen
// spieler und verbuendeter ist NICHT die Seite, sondern die Steuerung:
// Spieler duerfen ausschliesslich Figuren vom Typ "spieler" bewegen
// (karte.html prueft das) - alles andere steuert die SL ueber
// arena_admin.html.
function arenaSeite(t) {
  return (t && (t.typ === 'spieler' || t.typ === 'verbuendeter')) ? 'helden' : 'gegner';
}
function arenaIstSpieler(t) { return t && t.typ === 'spieler'; }
function arenaIstFeind(a, b) { return arenaSeite(a) !== arenaSeite(b); }

// ---------- Angriff ----------
// Liefert ein reines Ergebnisobjekt; das Anwenden auf den Zustand macht der
// Aufrufer (regie_vault.js), damit ein einziger atomarer Firebase-Schreib-
// zugriff daraus wird.
//
// saebeltraegerId: von der SL gesetzt, den Spielern NICHT angezeigt. Nur ein
// Diener ("Skelett"), der vom Saebeltraeger getoetet wird, verschwindet
// endgueltig - alle anderen stehen nach regeln.wiederauferstehenNach Runden
// wieder auf (Bibel 12.1 / Hendriks Vorgabe).
function arenaAngriff(angreifer, ziel, alleTokens, regeln, saebeltraegerId, wurfVorgabe) {
  const art = arenaAngriffsart(angreifer, ziel, regeln);
  if (!art) return { ok: false, grund: 'ausser_reichweite' };
  if (art === 'fern' && !angreifer.geladen) return { ok: false, grund: 'nicht_geladen' };

  const wert = art === 'nah' ? (angreifer.nahWert || 0) : (angreifer.fernWert || 0);
  const wurf = (typeof wurfVorgabe === 'number') ? wurfVorgabe : (1 + Math.floor(Math.random() * 100));
  const rohBand = arenaBand(wurf, wert, !!angreifer.mastery);
  const bedraengnis = arenaBedraengnis(angreifer, alleTokens, regeln);
  const band = arenaVerschiebe(rohBand, bedraengnis);

  const grund = art === 'nah' ? (angreifer.nahSchaden || 0) : (angreifer.fernSchaden || 0);
  const schaden = arenaSchaden(band, grund);
  const hpNeu = Math.max(0, (ziel.hp || 0) - schaden);
  const toetet = hpNeu === 0 && (ziel.hp || 0) > 0;
  const mitSaebel = !!saebeltraegerId && angreifer.id === saebeltraegerId;
  const endgueltig = toetet && ziel.typ === 'diener' && mitSaebel;

  return {
    ok: true, art: art, wurf: wurf, wert: wert, schwelle: arenaSchwellen(wert).schwelle,
    rohBand: rohBand, bedraengnis: bedraengnis, band: band,
    schaden: schaden, zielHpNeu: hpNeu, toetet: toetet, endgueltig: endgueltig,
    // Fernkampf leert die Waffe; das Nachladen dauert eine volle Runde und
    // wird beim Rundenwechsel aufgeloest (siehe arenaRundenwechsel).
    entlaedt: art === 'fern'
  };
}

// ---------- Bewegung ----------
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

// ---------- Rundenwechsel ----------
// Liefert die Aenderungen als flaches Objekt {pfad: wert}, damit die SL-Seite
// daraus EIN atomares update() bauen kann (gleiche Begruendung wie beim
// Erkundungs-Graphen: sonst feuert der Live-Listener mehrfach auf
// Zwischenstaenden).
// Lebt der Seelenlose noch? Wiederauferstehung UND Nachschub sind seine
// Taten (Hendriks Vorgabe: "Der Seelenlose schlaegt zu, wird aber alle paar
// Runden neue Skelette beschwoeren oder die alten beleben"). Faellt er, hoert
// beides auf - damit ist er das eigentliche Ziel des Kampfes und nicht nur
// der dickste Gegner.
function arenaBossLebt(tokens) {
  return Object.keys(tokens || {}).some(function (id) {
    const t = tokens[id];
    return t && t.typ === 'seelenloser' && !t.tot;
  });
}

function arenaRundenwechsel(tokens, regeln, alteRunde) {
  const runde = (alteRunde || 0) + 1;
  const aenderungen = { runde: runde, freigegeben: null };
  const auferstanden = [];
  const bossLebt = arenaBossLebt(tokens);

  Object.keys(tokens || {}).forEach(function (id) {
    const t = tokens[id];
    if (!t) return;
    aenderungen['tokens/' + id + '/hatGezogen'] = null;
    aenderungen['tokens/' + id + '/hatAngegriffen'] = null;

    // Nachladen: wer geschossen hat, ist die volle Runde darauf wieder bereit.
    if (!t.geladen && !t.tot) {
      if (t.entladenSeitRunde != null && runde > t.entladenSeitRunde) {
        aenderungen['tokens/' + id + '/geladen'] = true;
        aenderungen['tokens/' + id + '/entladenSeitRunde'] = null;
      }
    }

    // Wiederauferstehung: nur normal getoetete Diener, nicht die vom Saebel -
    // und nur, solange der Seelenlose lebt.
    if (bossLebt && t.tot && !t.endgueltig && t.typ === 'diener' && t.totSeitRunde != null) {
      if (runde - t.totSeitRunde >= regeln.wiederauferstehenNach) {
        aenderungen['tokens/' + id + '/tot'] = null;
        aenderungen['tokens/' + id + '/totSeitRunde'] = null;
        aenderungen['tokens/' + id + '/hp'] = t.hpMax || 1;
        auferstanden.push(id);
      }
    }
  });

  // Nachschub: der Seelenlose beschwoert alle paar Runden neue Diener.
  const nachschub = (bossLebt && regeln.nachschubAlle > 0 && runde % regeln.nachschubAlle === 0)
    ? (regeln.nachschubAnzahl || 0) : 0;

  return {
    runde: runde, aenderungen: aenderungen, auferstanden: auferstanden,
    nachschub: nachschub, bossLebt: bossLebt
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ARENA_BAENDER, arenaSchwellen, arenaBand, arenaVerschiebe, arenaSchaden,
    arenaDistanz, arenaInReichweite, arenaAngriffsart, arenaBedraengnis,
    arenaSeite, arenaIstSpieler, arenaIstFeind, arenaAngriff, arenaBewegungErlaubt,
    arenaBossLebt, arenaRundenwechsel, arenaFreieRandfelder
  };
}

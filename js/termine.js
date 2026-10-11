/* ==========================================================
   TERMINE — Verfuegbarkeits-Rechnung, gemeinsamer Kern
   ----------------------------------------------------------
   Ohne DOM, ohne Firebase, ohne globalen Zustand. Jede Funktion
   bekommt, was sie braucht, als Argument. Damit ist sie von
   beiden Seiten aus benutzbar:

     index.html      Spieler tragen ihre Zeiten ein
     regie_hub.html  die Spielleitung sieht sie je Sitzung und
                     veroeffentlicht einen Termin

   ---- Warum ueberhaupt eine eigene Datei ----
   Die Fenstersuche stand bis Oktober 2026 nur in index.html.
   Haette der Regie-Hub sie nachgebaut, waere genau das passiert,
   was in diesem Projekt schon einmal passiert ist: Zwei Fassungen
   derselben Rechnung laufen auseinander. Bei spielerKennung() war
   die Folge, dass derselbe Mensch zwei Schluessel bekam und
   doppelt in der Liste stand. Hier waere die Folge schlimmer -
   die Spielleitung wuerde einen Termin veroeffentlichen, den
   der Hub der Spieler gar nicht als den besten ansieht. Deshalb
   gibt es die Rechnung genau einmal.

   ---- Datenmodell (Firebase) ----
   Alles liegt je Sitzung unter sitzungen/{sid}/stand/termine:

     config      { vonStunde, bisStunde, tage, dauerMin }
     spieler     { pid -> { name, zuletzt } }
     verfuegbar  { pid -> { "2026-10-11" -> "0011110000..." } }
     gewaehlt    { datum, slot, von, am }  (null = nichts gesetzt)

   Ein Tag ist ein BITSTRING, ein Zeichen je halbe Stunde, ab
   cfg.vonStunde. "1" heisst "kann". Fehlende Zeichen gelten als
   "0" - ein kurzer String wird rechts aufgefuellt.

   ---- Fehlende Eintragung heisst "kann nicht" ----
   Bewusst so, und nicht "unbekannt": Ein Kalender, der Schweigen
   als Zustimmung deutet, schlaegt Termine vor, an denen niemand
   kann. Wer nichts eintraegt, muss deshalb in der Anzeige
   ausdruecklich als "nichts eingetragen" auftauchen - sonst
   sieht die Spielleitung einen Zaehler 3/5 und weiss nicht, ob
   zwei Leute abgesagt oder nur geschwiegen haben.
   ========================================================== */

var TERMINE = (function () {
  'use strict';

  var STD_CFG  = { vonStunde: 16, bisStunde: 24, tage: 14, dauerMin: 210 };
  var SLOT_MIN = 30;
  var WT       = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  /* Nimmt den rohen Firebase-Wert und macht daraus eine brauchbare
     Konfiguration. Grenzen bewusst hier und nicht in der Seite:
     ein unsinniges bisStunde < vonStunde wuerde slotAnzahl() sonst
     auf 1 klemmen und das ganze Raster still unbrauchbar machen. */
  function mitCfg(roh) {
    var c = {}, k;
    for (k in STD_CFG) if (STD_CFG.hasOwnProperty(k)) c[k] = STD_CFG[k];
    if (roh) for (k in STD_CFG) if (roh[k] != null && isFinite(roh[k])) c[k] = +roh[k];
    c.vonStunde = Math.max(0,  Math.min(23, Math.round(c.vonStunde)));
    c.bisStunde = Math.max(c.vonStunde + 1, Math.min(24, Math.round(c.bisStunde)));
    c.tage      = Math.max(1,  Math.min(60, Math.round(c.tage)));
    c.dauerMin  = Math.max(SLOT_MIN, Math.round(c.dauerMin));
    return c;
  }

  function slotAnzahl(cfg)   { return Math.max(1, (cfg.bisStunde - cfg.vonStunde) * (60 / SLOT_MIN)); }
  function fensterSlots(cfg) { return Math.max(1, Math.round(cfg.dauerMin / SLOT_MIN)); }

  /* ---------- Datum ---------- */
  function heute0(jetzt) {
    var d = jetzt ? new Date(jetzt.getTime()) : new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  /* Die Tage EINER SEITE des Rasters. cfg.tage ist damit die
     Seitengroesse, nicht der Horizont: Mit versatzTage blaettert
     der Spieler-Hub beliebig weit nach vorn (und bis heute
     zurueck). Ein Versatz vor heute waere sinnlos - in die
     Vergangenheit traegt niemand eine Verfuegbarkeit ein. */
  function tagListe(cfg, jetzt, versatzTage) {
    var out = [], start = heute0(jetzt), i, d;
    var v = Math.max(0, Math.round(versatzTage || 0));
    start.setDate(start.getDate() + v);
    for (i = 0; i < cfg.tage; i++) {
      d = new Date(start); d.setDate(start.getDate() + i);
      out.push(d);
    }
    return out;
  }

  /* ==========================================================
     ALLE TAGE MIT DATEN
     ----------------------------------------------------------
     Der Horizont der Suche darf NICHT an der angezeigten Seite
     haengen. Sonst entsteht genau der stille Fehler, der beim
     Blaettern droht: Ein Spieler blaettert vier Wochen vor,
     traegt dort ein - gespeichert wird es, gefunden nie, weil
     die Suche nur die ersten 14 Tage ansah.

     Gesucht wird deshalb ueber die Tage, zu denen tatsaechlich
     etwas eingetragen ist. Damit ist die Suche von sich aus
     unbegrenzt und kostet trotzdem nichts, wenn niemand weit
     vorausgeplant hat. Vergangene Tage fallen weg.
     ========================================================== */
  function datenTage(st, jetzt) {
    var verfuegbar = st.verfuegbar || {}, spieler = st.spieler || {};
    var heuteIso = iso(heute0(jetzt));
    var gesehen = {};
    Object.keys(spieler).forEach(function (pid) {
      var v = verfuegbar[pid];
      if (!v) return;
      Object.keys(v).forEach(function (d) {
        if (d >= heuteIso && String(v[d] || '').indexOf('1') >= 0) gesehen[d] = true;
      });
    });
    // ISO-Datum sortiert sich als Text korrekt.
    return Object.keys(gesehen).sort();
  }
  function iso(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
  function minutenVon(cfg, i) { return cfg.vonStunde * 60 + i * SLOT_MIN; }
  function uhr(min) {
    return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
  }
  function slotZeit(cfg, i) { return uhr(minutenVon(cfg, i)); }
  function langDatum(isoStr) {
    var p = String(isoStr).split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]);
    return WT[d.getDay()] + '. ' + p[2] + '.' + p[1] + '.';
  }

  /* ---------- Bitstrings ---------- */
  function holeTag(verfuegbar, pid, datum, cfg) {
    var s = (verfuegbar && verfuegbar[pid] && verfuegbar[pid][datum]) || '';
    var n = slotAnzahl(cfg);
    return (s + '0'.repeat(n)).slice(0, n);
  }
  function kann(verfuegbar, pid, datum, i, cfg) {
    return holeTag(verfuegbar, pid, datum, cfg)[i] === '1';
  }
  function zaehle(spieler, verfuegbar, datum, i, cfg) {
    var n = 0;
    Object.keys(spieler || {}).forEach(function (pid) {
      if (holeTag(verfuegbar, pid, datum, cfg)[i] === '1') n++;
    });
    return n;
  }
  /* Hat dieser Spieler ueberhaupt irgendwann etwas eingetragen? */
  function hatEingetragen(verfuegbar, pid) {
    var v = verfuegbar && verfuegbar[pid];
    if (!v) return false;
    return Object.keys(v).some(function (d) { return String(v[d] || '').indexOf('1') >= 0; });
  }

  /* ==========================================================
     BESTE FENSTER
     Fuer jeden Tag und jeden moeglichen Start wird gezaehlt, wie
     viele Spieler das GANZE Fenster ueber koennen. Ein Fenster
     zaehlt nur, wenn es durchgehend passt - eine Luecke in der
     Mitte bricht es.
     ========================================================== */
  function besteFenster(st, jetzt) {
    var cfg = st.cfg, spieler = st.spieler || {}, verfuegbar = st.verfuegbar || {};
    var pids = Object.keys(spieler);
    var n = slotAnzahl(cfg), w = fensterSlots(cfg), out = [];
    if (!pids.length || w > n) return out;
    var nun = jetzt || new Date();
    var heuteIso = iso(heute0(nun));

    // Ueber alle Tage mit Daten, nicht ueber die angezeigte Seite -
    // sonst findet die Suche nicht, was weiter vorn eingetragen ist.
    datenTage(st, nun).forEach(function (ds) {
      var d = new Date(+ds.slice(0, 4), +ds.slice(5, 7) - 1, +ds.slice(8, 10));
      var tage = {};
      pids.forEach(function (p) { tage[p] = holeTag(verfuegbar, p, ds, cfg); });
      for (var s = 0; s + w <= n; s++) {
        // Ein Fenster, das heute schon vorbei ist, nicht mehr vorschlagen.
        if (ds === heuteIso) {
          var ende = new Date(d);
          ende.setHours(cfg.vonStunde, 0, 0, 0);
          ende.setMinutes(ende.getMinutes() + (s + w) * SLOT_MIN);
          if (ende < nun) continue;
        }
        var wer = pids.filter(function (p) {
          for (var k = s; k < s + w; k++) if (tage[p][k] !== '1') return false;
          return true;
        });
        if (wer.length) out.push({ datum: ds, slot: s, wer: wer });
      }
    });

    // Beste zuerst: mehr Leute schlaegt frueher; danach das frueheste Fenster.
    out.sort(function (a, b) {
      if (b.wer.length !== a.wer.length) return b.wer.length - a.wer.length;
      if (a.datum !== b.datum) return a.datum < b.datum ? -1 : 1;
      return a.slot - b.slot;
    });

    // Je Tag nur das jeweils beste Fenster, sonst stehen dort
    // zwoelf sich ueberlappende Varianten desselben Abends.
    var proTag = {}, gefiltert = [];
    out.forEach(function (r) {
      if (proTag[r.datum]) return;
      proTag[r.datum] = true; gefiltert.push(r);
    });
    return gefiltert.slice(0, 6);
  }

  function fensterText(cfg, r) {
    var bis = r.slot + fensterSlots(cfg);
    return langDatum(r.datum) + ' ' + slotZeit(cfg, r.slot) + '–' + uhr(minutenVon(cfg, bis));
  }
  /* Nur die Uhrzeit, ohne Datum - fuer Zeilen, die das Datum schon tragen. */
  function fensterUhrzeit(cfg, r) {
    var bis = r.slot + fensterSlots(cfg);
    return slotZeit(cfg, r.slot) + '–' + uhr(minutenVon(cfg, bis));
  }

  /* ==========================================================
     KLARTEXT-SPANNEN
     Der Spieler-Hub zeigt die Zeiten nur als Dichtekarte - gut
     zum Finden eines Fensters, unbrauchbar zum Vorlesen. Die
     Spielleitung muss aber sagen koennen "Anna kann Dienstag ab
     18 Uhr". Deshalb werden die Bits hier zu Spannen
     zusammengefasst.
     ========================================================== */
  function spannen(verfuegbar, pid, datum, cfg) {
    var bits = holeTag(verfuegbar, pid, datum, cfg), out = [], i, start = -1;
    for (i = 0; i <= bits.length; i++) {
      var an = bits[i] === '1';
      if (an && start < 0) start = i;
      if (!an && start >= 0) { out.push({ von: start, bis: i }); start = -1; }
    }
    return out;
  }
  function spannenText(cfg, sp) {
    return sp.map(function (s) {
      return slotZeit(cfg, s.von) + '–' + uhr(minutenVon(cfg, s.bis));
    }).join(', ');
  }

  /* Alle Tage eines Spielers, an denen er ueberhaupt kann.
     Vergangene Tage fallen weg - sie sind fuer eine Terminsuche
     ohne Wert und wuerden die Liste nur lang machen. */
  /* Alle Tage eines Spielers, an denen er kann - ebenfalls ueber
     die Daten, nicht ueber die angezeigte Seite. Sonst stuende in
     der Regie nicht, was ein Spieler weiter vorn eingetragen hat. */
  function spielerPlan(st, pid, jetzt) {
    var cfg = st.cfg, out = [];
    var nur = {};
    nur[pid] = st.spieler && st.spieler[pid] ? st.spieler[pid] : {};
    datenTage({ spieler: nur, verfuegbar: st.verfuegbar }, jetzt).forEach(function (ds) {
      var sp = spannen(st.verfuegbar, pid, ds, cfg);
      if (sp.length) out.push({ datum: ds, spannen: sp, text: spannenText(cfg, sp) });
    });
    return out;
  }

  /* Alle Spieler einer Sitzung, fertig zum Anzeigen. */
  function uebersicht(st, jetzt) {
    var spieler = st.spieler || {};
    return Object.keys(spieler).map(function (pid) {
      var plan = spielerPlan(st, pid, jetzt);
      return {
        pid: pid,
        name: (spieler[pid] && spieler[pid].name) || pid,
        eingetragen: hatEingetragen(st.verfuegbar, pid),
        tage: plan
      };
    }).sort(function (a, b) {
      // Wer nichts eingetragen hat, nach unten - oben steht, was brauchbar ist.
      if (a.eingetragen !== b.eingetragen) return a.eingetragen ? -1 : 1;
      return a.name.localeCompare(b.name, 'de');
    });
  }

  /* Liest den rohen termine-Knoten einer Sitzung in einen Zustand,
     mit dem alle Funktionen hier arbeiten koennen. */
  function ausKnoten(roh) {
    roh = roh || {};
    return {
      cfg:        mitCfg(roh.config),
      spieler:    roh.spieler    || {},
      verfuegbar: roh.verfuegbar || {},
      gewaehlt:   roh.gewaehlt   || null
    };
  }

  return {
    STD_CFG: STD_CFG, SLOT_MIN: SLOT_MIN, WT: WT,
    mitCfg: mitCfg, ausKnoten: ausKnoten,
    slotAnzahl: slotAnzahl, fensterSlots: fensterSlots,
    heute0: heute0, tagListe: tagListe, datenTage: datenTage, iso: iso,
    slotZeit: slotZeit, uhr: uhr, minutenVon: minutenVon, langDatum: langDatum,
    holeTag: holeTag, kann: kann, zaehle: zaehle, hatEingetragen: hatEingetragen,
    besteFenster: besteFenster, fensterText: fensterText, fensterUhrzeit: fensterUhrzeit,
    spannen: spannen, spannenText: spannenText, spielerPlan: spielerPlan,
    uebersicht: uebersicht
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = TERMINE;

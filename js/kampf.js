/* ==========================================================
   KAMPF — Initiative, Angriff, Wirkung
   ----------------------------------------------------------
   Der Regel-Kern des Kampfmodus: ohne DOM, ohne Firebase, ohne
   globalen Zustand. Genau wie js/termine.js und js/arena.js
   — und aus demselben Grund: Zwei Fassungen derselben Rechnung
   laufen auseinander, und hier wäre der Preis, dass die Regie
   etwas anderes ausrechnet als die Probe des Spielers ergibt.

   NICHT die Arena. Die (`js/arena.js`, Szene 15.1) ist ein
   Brett mit Positionen für EINEN Kampf, das Finale, und rechnet
   bewusst weiter nach W100 (Bibel 4.7). Das hier ist die Liste
   für alle anderen Kämpfe: keine Felder, keine Bewegung, keine
   Reichweiten — nur Reihenfolge, Treffer und Wirkung.

   Quelle der Regeln: Savage Worlds (Pinnacle), nachgelesen im
   frei veröffentlichten Test Drive. Reihenfolge der Quellen wie
   immer: Savage Worlds → Bibel §4 → dieser Code. Wo das Projekt
   bewusst abweicht, steht es als Schalter in KAMPF_REGELN und
   nicht verstreut im Code.
   ========================================================== */

/* ----------------------------------------------------------
   DIE DREI STELLSCHRAUBEN
   ----------------------------------------------------------
   Hier stehen die Punkte, an denen dieses Projekt von Savage
   Worlds abweichen KANN. Sie stehen zusammen an einer Stelle,
   damit eine Regelentscheidung eine Zeile ist und keine Suche.
   Die Vorgaben unten sind die Regel aus dem Original.
   ---------------------------------------------------------- */
const KAMPF_REGELN = {
  /* Nahkampfschaden: Stärke-Würfel UND Waffen-Würfel, addiert.
     Steht das auf false, zählt nur die Waffe — das war bis zum
     15.10.2026 die Hausregel, und sie senkt die Wirkung eines
     Säbeltreffers gegen Robustheit 5 von 83 % auf 33 %. */
  schadenMitStaerke: true,

  /* Eine Steigerung am Angriff gibt +1W6 Schaden. Nur einmal,
     auch bei zwei Steigerungen. */
  bonusWuerfelBeiSteigerung: true,

  /* Wie viele Wunden eine Figur TRÄGT und trotzdem weiterkämpft.
     Im Original: Ein Wild Card hält drei aus, die vierte nimmt ihn
     raus. Ein Statist trägt KEINE — "Extras only have one wound and
     are Incapacitated", die erste Wunde ist bei ihm das Ende.
     (Die Null ist genau dieser Satz, nicht ein Tippfehler: Sie
     stand erst auf 1, und die eigene Prüfung hat den Denkfehler
     gefangen.) */
  wundenStatist: 0,
  wundenWildCard: 3
};

/* ==========================================================
   1. INITIATIVE — das Aktionsdeck
   ----------------------------------------------------------
   Savage Worlds würfelt die Reihenfolge nicht aus, es teilt
   Karten: Ass zuerst, dann abwärts bis zur Zwei, bei gleichem
   Wert nach Farbe (Pik, Herz, Karo, Kreuz).

   Drei Eigenheiten, die es am Tisch einfacher machen als Zahlen:
     - Jeder Wild Card bekommt EINE Karte; Verbündete handeln auf
       seiner Karte mit.
     - Jede Gegner-SORTE teilt sich eine Karte. Vier Spieler,
       drei Matrosen und Anselm sind sechs Karten, nicht acht.
     - Der Joker handelt, wann er will, und gibt +2 auf alle
       Proben UND auf den Schaden. Danach wird neu gemischt.
   ========================================================== */
const KARTEN_FARBEN = [
  { id: 'pik',   n: 'Pik',   z: '♠', rang: 4 },
  { id: 'herz',  n: 'Herz',  z: '♥', rang: 3 },
  { id: 'karo',  n: 'Karo',  z: '♦', rang: 2 },
  { id: 'kreuz', n: 'Kreuz', z: '♣', rang: 1 }
];
const KARTEN_WERTE = [
  { w: 14, n: 'A' }, { w: 13, n: 'K' }, { w: 12, n: 'D' }, { w: 11, n: 'B' },
  { w: 10, n: '10' }, { w: 9, n: '9' }, { w: 8, n: '8' }, { w: 7, n: '7' },
  { w: 6, n: '6' }, { w: 5, n: '5' }, { w: 4, n: '4' }, { w: 3, n: '3' }, { w: 2, n: '2' }
];
/* Der Joker steht ÜBER dem Ass: Er handelt ohnehin, wann er will -
   oben in der Liste zu stehen ist nur die ehrlichste Darstellung. */
const JOKER_WERT = 99;

function neuesDeck() {
  const d = [];
  KARTEN_FARBEN.forEach(function (f) {
    KARTEN_WERTE.forEach(function (k) {
      d.push({ wert: k.w, farbe: f.id, joker: false });
    });
  });
  d.push({ wert: JOKER_WERT, farbe: 'rot',    joker: true });
  d.push({ wert: JOKER_WERT, farbe: 'schwarz', joker: true });
  return d;
}

/* Fisher-Yates. Die Zufallsquelle ist austauschbar, damit ein Test
   eine gezinkte Reihenfolge vorgeben kann - sonst liesse sich
   "der Joker mischt neu" nicht pruefen, ohne zu warten. */
function mischen(deck, zufall) {
  const r = zufall || Math.random;
  const d = deck.slice();
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = d[i]; d[i] = d[j]; d[j] = t;
  }
  return d;
}

function kartenText(k) {
  if (!k) return '—';
  if (k.joker) return 'Joker';
  const f = KARTEN_FARBEN.filter(function (x) { return x.id === k.farbe; })[0];
  const w = KARTEN_WERTE.filter(function (x) { return x.w === k.wert; })[0];
  return (w ? w.n : k.wert) + (f ? f.z : '');
}

/* Vergleich fuer die Reihenfolge: hoeherer Wert zuerst, bei Gleichstand
   die hoehere Farbe. Gibt <0, wenn a vor b handelt. */
function kartenVergleich(a, b) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  if (a.wert !== b.wert) return b.wert - a.wert;
  const fa = KARTEN_FARBEN.filter(function (x) { return x.id === a.farbe; })[0];
  const fb = KARTEN_FARBEN.filter(function (x) { return x.id === b.farbe; })[0];
  return (fb ? fb.rang : 0) - (fa ? fa.rang : 0);
}

/* Eine Runde austeilen.
   teilnehmer: [{ id, name, ... }] - je Eintrag EINE Karte. Wer sich
   eine Karte teilt (eine Gegnersorte, Verbuendete eines Spielers),
   ist vorher zu einem Eintrag zusammengefasst worden; das ist eine
   Frage der Aufstellung, nicht der Regel.

   Rueckgabe: { reihe, deck, mischenNoetig } - "reihe" ist sortiert
   und traegt die Karte an jedem Teilnehmer. Das Deck kommt
   zurueck, damit die naechste Runde dort weitermacht, wo diese
   aufgehoert hat: Ein Deck, das nie kleiner wird, waere kein Deck. */
function austeilen(teilnehmer, deck, zufall) {
  const leute = (teilnehmer || []).slice();
  let d = (deck && deck.length) ? deck.slice() : mischen(neuesDeck(), zufall);
  let joker = false;
  const reihe = leute.map(function (t) {
    if (!d.length) d = mischen(neuesDeck(), zufall);   // Deck leer: neu mischen
    const k = d.shift();
    if (k.joker) joker = true;
    return Object.assign({}, t, { karte: k });
  });
  reihe.sort(function (a, b) { return kartenVergleich(a.karte, b.karte); });
  return { reihe: reihe, deck: d, mischenNoetig: joker };
}

/* Der Joker gibt +2 auf JEDE Probe dieser Runde und +2 auf den
   Schaden. Beides zusammen, nicht wahlweise. */
const JOKER_BONUS = 2;
function jokerBonus(teilnehmer) {
  return (teilnehmer && teilnehmer.karte && teilnehmer.karte.joker) ? JOKER_BONUS : 0;
}

/* ==========================================================
   2. DER ANGRIFF
   ----------------------------------------------------------
   "Roll a Fighting skill roll and compare it to the opponent's
   Parry." Der Zielwert ist also die PARADE des Ziels, nicht die
   4 - und weil unser Probensystem immer gegen 4 rechnet, wird
   die Differenz zum Modifikator.

   Genau hier lag der taegliche Schmerz: Paraden sind 4, 5, 6, 7,
   die Erschwernis-Knoepfe gingen aber in Zweierschritten. Gegen
   Parade 5 braucht es -1, und das war gar nicht einstellbar.
   ========================================================== */
function angriffsMod(parade, zusatz) {
  const p = Math.max(0, Math.round(Number(parade) || 0));
  return (typeof ZIELZAHL === 'number' ? ZIELZAHL : 4) - p + (Math.round(Number(zusatz) || 0));
}

/* ---------- Die drei Distanzen ----------
   Savage Worlds kennt kurz / mittel / lang mit 0 / -2 / -4. Auf einem
   Brett ergibt sich das aus Feldern; wir haben keins. Statt bei jedem
   Schuss zu fragen, STEHEN die Gegner in einem der drei Baender - die
   Aufstellung ist damit die Entfernung, und sie umzustellen ist selbst
   eine Handlung der Spielleitung.

   Nahkampf geht nur im ersten Band. Das ist keine Willkuer, sondern
   dieselbe Regel: Wer nicht angrenzt, kann nicht zuschlagen. */
const FERN_BAENDER = [
  { id: 0, n: 'Nah',    mod: 0,  nahkampf: true },
  { id: 1, n: 'Mittel', mod: -2, nahkampf: false },
  { id: 2, n: 'Fern',   mod: -4, nahkampf: false }
];
function band(i) {
  return FERN_BAENDER[Math.max(0, Math.min(FERN_BAENDER.length - 1, Math.round(Number(i) || 0)))];
}
function bandMod(i) { return band(i).mod; }
function nahkampfMoeglich(i) { return band(i).nahkampf; }

/* Fernkampf nach Waffenreichweite - fuer den Fall, dass doch einmal in
   Feldern gerechnet wird (etwa in der Arena). Unsere Waffen tragen EINE
   Reichweitenzahl statt drei Baendern: Das kurze Band ist diese Zahl, das
   mittlere das Doppelte, das lange das Vierfache. Das ist der
   Umrechnungsschluessel des Originals und keine eigene Erfindung. */
function fernkampfMod(reichweite, entfernung) {
  const r = Math.max(1, Math.round(Number(reichweite) || 1));
  const e = Math.max(0, Math.round(Number(entfernung) || 0));
  if (e <= r) return 0;
  if (e <= r * 2) return -2;
  if (e <= r * 4) return -4;
  return null;                 // ausser Reichweite - kein Schuss
}

/* ==========================================================
   3. DIE WIRKUNG
   ----------------------------------------------------------
   Schaden gegen Robustheit:
     darunter            - nichts
     gleich oder darueber - angeschlagen
     je volle 4 darueber  - eine Wunde

   Und die Regel, die den Kampf traegt: Wer SCHON angeschlagen
   ist und erneut angeschlagen wuerde, bekommt stattdessen eine
   Wunde. Zwei schwache Treffer sind damit ein Plan gegen einen
   Zaehen. Wer eine Wunde bekommt und nicht angeschlagen war,
   ist es anschliessend zusaetzlich.
   ========================================================== */
function wirkung(schaden, robustheit, zustand) {
  const z = zustand || {};
  const vorher = { angeschlagen: !!z.angeschlagen, wunden: Math.max(0, z.wunden || 0) };
  const max = z.extra ? KAMPF_REGELN.wundenStatist : KAMPF_REGELN.wundenWildCard;
  const s = Math.round(Number(schaden) || 0);
  const r = Math.max(1, Math.round(Number(robustheit) || 1));

  const erg = {
    angeschlagen: vorher.angeschlagen,
    wunden: vorher.wunden,
    neueWunden: 0,
    ausserGefecht: false,
    text: ''
  };

  if (s < r) { erg.text = 'keine Wirkung'; return erg; }

  const steigerungen = Math.floor((s - r) / 4);
  if (steigerungen >= 1) {
    erg.neueWunden = steigerungen;
  } else if (vorher.angeschlagen) {
    /* Schon angeschlagen und wieder getroffen: eine Wunde statt
       eines zweiten Hakens. */
    erg.neueWunden = 1;
  } else {
    erg.angeschlagen = true;
    erg.text = 'angeschlagen';
    return erg;
  }

  erg.wunden = vorher.wunden + erg.neueWunden;
  erg.angeschlagen = true;            // eine Wunde macht immer auch angeschlagen
  if (erg.wunden > max) {
    erg.ausserGefecht = true;
    erg.wunden = max;
  }
  erg.text = erg.neueWunden + (erg.neueWunden > 1 ? ' Wunden' : ' Wunde') +
    (erg.ausserGefecht ? ' — außer Gefecht' : '');
  return erg;
}

/* Wie viele Wuerfel ein Schadenswurf wirft, und warum.
   Nahkampf: Staerke + Waffe (Original), bei Steigerung +1W6.
   Fernkampf: nur die Waffe - die Staerke zaehlt dort nicht mit.
   Kein Wild Die, nie: den gibt es ausschliesslich auf Proben. */
function schadensWuerfel(figur, ware, opts) {
  const o = opts || {};
  const w = [];
  const fern = !!(ware && ware.art === 'Fernkampf');
  if (ware && ware.schaden) w.push({ stufe: ware.schaden, was: ware.n });
  if (!fern && KAMPF_REGELN.schadenMitStaerke && figur && figur.attr) {
    w.push({ stufe: figur.attr['Stärke'] || 1, was: 'Stärke' });
  }
  if (!w.length) w.push({ stufe: figur && figur.attr ? (figur.attr['Stärke'] || 1) : 1, was: 'Stärke' });
  if (o.steigerung && KAMPF_REGELN.bonusWuerfelBeiSteigerung) {
    w.push({ stufe: 2, was: 'Steigerung' });    // +1W6
  }
  return w;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    KAMPF_REGELN, KARTEN_FARBEN, KARTEN_WERTE, JOKER_WERT, JOKER_BONUS,
    neuesDeck, mischen, kartenText, kartenVergleich, austeilen, jokerBonus,
    FERN_BAENDER, band, bandMod, nahkampfMoeglich,
    angriffsMod, fernkampfMod, wirkung, schadensWuerfel
  };
}

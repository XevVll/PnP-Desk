// Kampf-Arena fuer den Endkampf in der Ritualkammer (Bibel 12.1).
//
// NEUER SZENENTYP, wie der Abspann: "arena: true" schaltet karte.html auf die
// Arena-Darstellung um (Raster statt Marker-Karte). Das MAP_REGISTRY-Muster
// bleibt unangetastet, jede andere Szene verhaelt sich unveraendert.
//
// Szenen-ID "15.1": naechste freie fuehrende Ziffer nach dem Abspann (14.x).
//
// ===================== WICHTIG: VERHAELTNIS ZUM TEXT-FINALE =====================
// Der eigentliche Ablauf des Finales steht als sechs Interaktionen an
// ORTE.die_ritualkammer (js/regie.js): der_beginn_des_rituals -> die_ersten_wellen
// -> wat_und_josiah_fallen -> die_zermuerbung -> harwicks_anklage ->
// die_entscheidung_um_den_saebel.
//
// Die Arena ersetzt diesen Ablauf NICHT. Sie ist die taktische Ebene darunter:
// Die Kernbeats (Wats und Josiahs Tod, Harwicks Anklage, die Entscheidung um
// den Saebel) bleiben fest und werden von der SL ausgeloest - die Arena
// bestimmt nur, WIE TEUER der Weg dorthin wird, nicht OB diese Beats
// geschehen. Deshalb kann die SL jederzeit Figuren setzen, entfernen und
// Werte aendern; nichts davon haengt an einer Siegbedingung.
//
// ===================== REGELN =====================
// Gerechnet wird nach dem Probensystem der Bibel (4.1), Umsetzung in
// js/arena.js. Bedraengnis (4.4) wird automatisch aus den angrenzenden
// Gegnern ermittelt.
//
// Ablauf pro Figur: Bewegung, dann Angriff. Die Angriffsart ergibt sich aus
// der Entfernung - in Nahkampfreichweite Nahkampf, sonst Fernkampf. Nach
// einem Schuss ist die Waffe leer und erst in der uebernaechsten Runde wieder
// bereit (eine volle Runde Nachladen).
//
// Der Seelenlose schlaegt selbst zu und ist zugleich die Quelle des
// Nachschubs: solange er lebt, stehen normal getoetete Diener nach
// "wiederauferstehenNach" Runden wieder auf, und alle "nachschubAlle" Runden
// erscheinen neue. Faellt er, hoert beides auf.
//
// Nur der Traeger des Jaguar-Saebels toetet Diener endgueltig (Bibel 12.1).
// Wer ihn traegt, traegt die SL im Adminpanel ein - den Spielern wird das
// NICHT angezeigt, es geht nur in die Schadensberechnung ein.
//
// ===================== ZAHLEN =====================
// Arena-Groesse und Bewegung sind Hendriks Vorgabe (8x8, 2 Felder). Alle
// uebrigen Werte sind ein erster Aufschlag und im Adminpanel je Figur
// aenderbar - es gibt dafuer keine Kanon-Vorgabe, die Bibel kennt nur
// "Schadenspunkte" als kleine ganze Zahlen.
const ARENA_SCENES = {
  "15.1": {
    label: "Endkampf — Die Ritualkammer",
    arena: true,
    hintergrund: "images/interior_ritualkammer.webp",
    soundFile: "ritual.ogg",
    regeln: {
      breite: 16,
      hoehe: 16,
      bewegung: 2,              // Felder pro Runde (Hendriks Vorgabe, bleibt)
      nahkampfReichweite: 1,    // angrenzend (auch diagonal)
      // Auf 16x16 waeren die urspruenglichen 4 Felder sehr kurz - das Brett
      // hat die vierfache Flaeche, die Bewegung ist gleich geblieben. 6 ist
      // ein Vorschlag, nicht Hendriks Vorgabe.
      fernkampfReichweite: 6,
      wiederauferstehenNach: 2, // Runden, bis ein normal getoeteter Diener aufsteht
      nachschubAlle: 3,         // alle wie viele Runden beschwoert der Seelenlose
      nachschubAnzahl: 2
    },
    // Vorlagen fuer neue Figuren im Adminpanel. "wert" ist der Fertigkeitswert
    // aus dem Probensystem (Schwelle = Wert x 10).
    vorlagen: {
      spieler: {
        typ: "spieler", symbol: "☘", farbe: "#c9a24b",
        hpMax: 6, nahWert: 5, fernWert: 5, nahSchaden: 2, fernSchaden: 3, mastery: true
      },
      // Mitkaempfende NSC (Harwick, Cormac, ...): gleiche Seite wie die
      // Spieler, aber NUR von der SL steuerbar (arena_admin.html) - Spieler
      // duerfen ausschliesslich Figuren vom Typ "spieler" bewegen.
      verbuendeter: {
        typ: "verbuendeter", symbol: "⚓", farbe: "#8fb3c9",
        hpMax: 6, nahWert: 6, fernWert: 5, nahSchaden: 2, fernSchaden: 3, mastery: true
      },
      diener: {
        typ: "diener", symbol: "☠", farbe: "#7fa87f",
        hpMax: 3, nahWert: 4, fernWert: 0, nahSchaden: 1, fernSchaden: 0, mastery: false
      },
      seelenloser: {
        typ: "seelenloser", symbol: "✦", farbe: "#a8391e",
        hpMax: 18, nahWert: 7, fernWert: 0, nahSchaden: 3, fernSchaden: 0, mastery: true
      }
    }
  }
};

const DEFAULT_ARENA_SCENE = "15.1";

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ARENA_SCENES, DEFAULT_ARENA_SCENE };
}

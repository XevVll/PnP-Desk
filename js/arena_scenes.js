// Kampf-Arena fuer den Endkampf in der Ritualkammer (Bibel 12.1).
//
// NEUER SZENENTYP, wie der Abspann: "arena: true" schaltet karte.html auf die
// Arena-Darstellung um (Raster statt Marker-Karte). Das MAP_REGISTRY-Muster
// bleibt unangetastet, jede andere Szene verhaelt sich unveraendert.
//
// Szenen-ID "15.1": naechste freie fuehrende Ziffer nach dem Abspann (14.x).
//
// ===================== WICHTIG: VERHAELTNIS ZUM TEXT-FINALE =====================
// Der eigentliche Ablauf des Finales steht als sieben Interaktionen an
// ORTE.die_ritualkammer (js/regie.js): das_kind_auf_dem_stein ->
// der_beginn_des_rituals -> die_ersten_wellen -> wat_und_josiah_fallen ->
// die_zermuerbung -> harwicks_anklage -> die_entscheidung_um_den_saebel.
//
// Die Arena ersetzt diesen Ablauf NICHT. Sie ist die taktische Ebene darunter:
// Die Kernbeats (Wats und Josiahs Tod, Harwicks Anklage, die Entscheidung um
// den Saebel) bleiben fest und werden von der SL ausgeloest - die Arena
// bestimmt nur, WIE TEUER der Weg dorthin wird, nicht OB diese Beats
// geschehen. Deshalb kann die SL jederzeit Figuren setzen, entfernen und
// Werte aendern; nichts davon haengt an einer Siegbedingung.
//
// ===================== REGELN =====================
// Seit dem 30.10.2026 rechnet die Arena nach SAVAGE WORLDS wie der Rest des
// Projekts - vorher nach dem alten W100-System. Die Regel steht nicht hier und
// auch nicht in js/arena.js, sondern in js/regelwerk.js und js/kampf.js;
// js/arena.js ruft sie auf. Im Kopf jener Datei steht, welche Funktion was
// macht und welche drei <script>-Tags eine Seite dafuer braucht.
//
// Kurz: Der Angriff ist eine normale Probe (Ziel 4, explodierend, Wild Die bei
// Wild Cards). Nahkampf wirft gegen die PARADE des Ziels, Fernkampf gegen die 4
// mit Entfernungsabzug. Gang Up gibt +1 je zusaetzlichem Angreifer am Ziel
// (max +4). Schaden ist Waffe + Staerke (im Fernkampf nur die Waffe), bei einer
// Steigerung +1W6; gegen die Robustheit ergibt das angeschlagen bzw. Wunden.
//
// HP SIND ERSATZLOS WEG. Eine Figur traegt "angeschlagen" und "wunden" - ein
// Statist (Diener) faellt bei der ersten Wunde, eine Wild Card traegt drei.
//
// Ablauf pro Figur: Bewegung, dann Angriff. Die Angriffsart ergibt sich aus der
// Entfernung. Nach einem Schuss ist die Waffe leer und erst in der
// uebernaechsten Runde wieder bereit (Bibel 4.5: ein Schuss, 1701 ist alles
// Vorderlader). Wer angeschlagen ist, darf sich bewegen, aber nicht angreifen.
//
// Der Seelenlose schlaegt selbst zu und ist zugleich die Quelle des
// Nachschubs: solange er nicht GEBANNT ist, stehen normal getoetete Diener nach
// "wiederauferstehenNach" Runden wieder auf, und alle "nachschubAlle" Runden
// erscheinen neue. Gebannt kann ihn nur der Jaguar-Saebel (Bibel 12.1) - ohne
// ihn richtet er sich selbst wieder auf.
//
// Nur der Traeger des Saebels toetet endgueltig. Wer ihn traegt, traegt die SL
// im Schlachtfeld ein - den Spielern wird das NICHT angezeigt.
//
// ===================== ZAHLEN =====================
// Arena-Groesse und Bewegung sind Hendriks Vorgabe (16x16, 2 Felder). Die
// Kampfwerte der Vorlagen sind seit dem 30.10.2026 NICHT mehr frei gegriffen,
// sondern aus den NSC-Blaettern in js/npcs.js GEMESSEN (parade()/robustheit()
// aus js/regelwerk.js, beste getragene Waffe aus AUSRUESTUNG). Woher jede Zahl
// kommt, steht an der Vorlage. Je Figur im Schlachtfeld weiter aenderbar; dort
// laesst sich auch ein echtes NSC-Blatt auf ein Token stempeln.
const ARENA_SCENES = {
  "15.1": {
    label: "Endkampf — Die Ritualkammer",
    arena: true,
    // Eigene Draufsicht als Brett-Untergrund (quadratisch 1:1 wie das
    // 16x16-Raster, Anhoehe mit Jessica im unteren Drittel) - die
    // Seitenansicht interior_ritualkammer.webp passte perspektivisch nicht
    // unter senkrecht stehende Spielfiguren. Prompt: BILD-PROMPTS.md,
    // "Das Schlachtfeld".
    hintergrund: "images/interior_ritualkammer_schlachtfeld.webp",
    soundFile: "ritual.ogg",
    regeln: {
      breite: 16,
      hoehe: 16,
      bewegung: 2,              // Felder pro Runde (Hendriks Vorgabe, bleibt)
      nahkampfReichweite: 1,    // angrenzend (auch diagonal)
      /* Nur noch eine Bremse fuers Brett. Die echte Grenze ist seit dem
         30.10.2026 die WAFFE: fernkampfMod() gibt ihre Reichweite 0, das
         Doppelte -2, das Vierfache -4 und darueber keinen Schuss. Auf 16x16
         liegen nie mehr als 15 Felder zwischen zwei Figuren, diese Zahl bindet
         also nicht mehr - vorher stand sie auf 6, weil es ueberhaupt keinen
         Entfernungsabzug gab und unbegrenzte Reichweite ohne Abzug kaputt
         waere. Eine Pistole (Reichweite 5) traegt damit bis 20 Felder, jenseits
         von 10 mit -4; ein Wurfmesser (3) hoert bei 12 auf. */
      fernkampfReichweite: 16,
      wiederauferstehenNach: 2, // Runden, bis ein normal getoeteter Diener aufsteht
      nachschubAlle: 3,         // alle wie viele Runden beschwoert der Seelenlose
      nachschubAnzahl: 2
    },
    /* Vorlagen fuer neue Figuren. Die Felder sind Wuerfelstufen wie in
       js/regelwerk.js: 1=d4 2=d6 3=d8 4=d10 5=d12, 0=ungelernt (d4-2).
         kaempfen/schiessen  Fertigkeitsstufe fuer den Angriffswurf
         staerke             zaehlt im Nahkampf zum Schaden
         waffe/fernwaffe     Stufe des Schadenswuerfels; fernwaffe 0 = keine
         reichweite          Felder; das Doppelte kostet -2, das Vierfache -4
         parade/robustheit   feste Zahlen, aus dem Blatt gerechnet
         wild                Wild Card: Wild Die und drei Wunden
         wundenMax           ueberschreibt die Tragfaehigkeit (optional) */
    vorlagen: {
      /* Die Spielerfiguren haben kein Blatt im Repo - ihre Boegen liegen im
         localStorage der jeweiligen Spieler. Als Massstab stehen hier
         HARWICKS gemessene Werte (js/npcs.js, Veteran, Saebel und Pistole):
         Kaempfen d8, Schiessen d8, Staerke d8, Parade 6, Robustheit 6. Das ist
         eine erfahrene, keine frische Figur - im Finale angemessen. Die SL
         traegt die echten Werte je Spieler im Schlachtfeld nach. */
      spieler: {
        typ: "spieler", symbol: "☘", farbe: "#c9a24b",
        kaempfen: 3, schiessen: 3, staerke: 3,
        waffe: 2, fernwaffe: 2, reichweite: 5,
        parade: 6, robustheit: 6, wild: true, wundenMax: 3
      },
      /* Mitkaempfende NSC (Harwick, Cormac, ...): gleiche Seite wie die
         Spieler, aber NUR von der SL steuerbar (arena_admin.html) - Spieler
         duerfen ausschliesslich Figuren vom Typ "spieler" bewegen.
         Werte = CORMAC gemessen (bester Kaempfer an Bord, Kampf 7 gegen
         Harwicks 6 ist Kanon): Kaempfen d10, Staerke d10, Entermesser d6,
         Parade 7, Robustheit 7, keine Schusswaffe. */
      verbuendeter: {
        typ: "verbuendeter", symbol: "⚓", farbe: "#8fb3c9",
        kaempfen: 4, schiessen: 2, staerke: 4,
        waffe: 2, fernwaffe: 0, reichweite: 0,
        parade: 7, robustheit: 7, wild: true, wundenMax: 3
      },
      /* Die Wiedergaenger sind STATISTEN: kein Wild Die, und die erste Wunde
         nimmt sie raus (KAMPF_REGELN.wundenStatist = 0). Gefaehrlich sind sie
         in der Menge - vier um eine Figur herum geben dem Angreifer +3 Gang Up.
         Werte wie ein Mannschaftsmitglied aus js/npcs.js: Kaempfen d6,
         Staerke d6, Parade 5, Robustheit 5; die Waffe ist, was sie in der Hand
         halten (d4). */
      diener: {
        typ: "diener", symbol: "☠", farbe: "#7fa87f",
        kaempfen: 2, schiessen: 0, staerke: 2,
        waffe: 1, fernwaffe: 0, reichweite: 0,
        parade: 5, robustheit: 5, wild: false, wundenMax: 0
      },
      /* "bild" (optional, jede Vorlage kann es haben): fuellt den runden
         Token anstelle des Symbols aus. Hier der Kopf-Ausschnitt aus dem
         Portrait images/Der_Seelenlose.webp - der Boss soll auf dem Brett
         sofort als eigene Figur erkennbar sein, nicht als weiteres Zeichen.
         "symbol" bleibt als Rueckfallwert stehen, falls das Bild fehlt.

         Werte = SEIN EIGENES BLATT (js/npcs.js, Legendaer, der einzige d12
         der Kampagne): Kaempfen d12, Staerke d12, Saebel d6, Parade 8,
         Robustheit 8, reine Nahkampffigur. Parade 8 kostet jeden Angriff -4 -
         genau die +4, die die Gruppe sich mit Gang Up zurueckholen kann, wenn
         sie ihn gemeinsam stellt. Drei Wunden sind die Regel; wird er damit zu
         weich oder zu zaeh, ist "wundenMax" der erste Hebel. */
      seelenloser: {
        typ: "seelenloser", symbol: "✦", farbe: "#a8391e",
        bild: "images/token_seelenloser.webp",
        kaempfen: 5, schiessen: 0, staerke: 5,
        waffe: 2, fernwaffe: 0, reichweite: 0,
        parade: 8, robustheit: 8, wild: true, wundenMax: 3
      }
    }
  }
};

const DEFAULT_ARENA_SCENE = "15.1";

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ARENA_SCENES, DEFAULT_ARENA_SCENE };
}

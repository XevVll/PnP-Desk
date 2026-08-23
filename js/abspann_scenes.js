// Abschluss-/Erinnerungsszene (Hendriks Wunsch, 2026-08-22): Nach dem Finale
// auf der Grabesinsel laufen alle Bilder des Abenteuers noch einmal als
// Erinnerung durch - eine Art Abspann.
//
// NEUER SZENENTYP: Diese Szene hat KEINE Marker und KEINEN Hintergrund im
// ueblichen Sinn. Das Feld "abspann: true" schaltet karte.html auf die
// Collage-Darstellung um (siehe dort: startSlideshow()). Damit bleibt das
// MAP_REGISTRY-Muster unangetastet - jede andere Szene verhaelt sich
// unveraendert.
//
// Szenen-ID "14.1": naechste freie fuehrende Ziffer nach der Grabesinsel
// (13.x) - siehe CLAUDE.md, Szenen-ID-Konvention.
//
// ===================== BILDAUSWAHL: AUTOMATISCH =====================
// Hier steht bewusst KEINE Bildliste mehr. karte.html sammelt die Bilder
// selbst aus allen geladenen Szenendateien ein (sammleSzenenBilder()):
// Hintergruende, Marker-Bilder, Bildvarianten und imgOverrides, dazu die
// Golden-Lion-Basismarker. Neue Szenen und neue Ortsbilder tauchen damit
// automatisch im Abspann auf, ohne dass hier etwas nachgetragen werden muss.
//
// Warum nicht einfach den images/-Ordner auslesen? Das geht im Browser
// nicht - die Seite ist statisch (GitHub Pages), es gibt kein
// Verzeichnis-Listing. Der Umweg ueber die Szenendaten liefert dieselbe
// Menge, laesst aber verwaiste Dateien draussen (z.B. Bilder, die zu keiner
// Szene mehr gehoeren).
//
// Feinsteuerung, alles optional:
//   mitPortraits: true          - auch die NSC-Portraits aus js/characters.js
//   zusatzBilder: ["images/..."] - einzelne Bilder zusaetzlich aufnehmen
//   ohneBilder:   ["images/..."] - einzelne Bilder ausschliessen
//   slideshow:    [...]          - feste Liste, ersetzt die Automatik ganz
//
// ===================== DARSTELLUNG =====================
// KEINE Diashow, sondern eine Collage: mehrere Bilder gleichzeitig, jedes in
// seinem eigenen Rhythmus ein- und ausblendend, einander leicht ueberlappend.
// Die Auswahl ist zufaellig und ausdruecklich SZENENUEBERGREIFEND gemischt -
// nebeneinander haengen Grimsgate, der Sturm und die Grabesinsel.
//
// Gemischt wird per Fisher-Yates ueber die ganze Menge; erst wenn alle Bilder
// einmal dran waren, wird neu gemischt. Damit kommt garantiert jedes Bild
// vor, bevor sich etwas wiederholt, und nie haengt dasselbe Bild zweimal
// gleichzeitig.
//
// EINSTELLUNGEN:
//   gleichzeitig - wie viele Bilder gleichzeitig zu sehen sind
//   slideDauer   - Standzeit je Bild in ms (je Ebene um +-25% variiert)
//   blendDauer   - Ein-/Ausblendzeit in ms
//   dankText     - fest im unteren Bildbereich stehender Schriftzug
// Die Bildgroesse skaliert automatisch mit "gleichzeitig" (mehr Bilder =
// etwas kleiner), damit sie sich ueberlappen, ohne einander zuzudecken.
// Die Sequenz laeuft endlos weiter, bis die SL die Szene wechselt - bei
// einer Collage gibt es kein natuerliches Ende wie bei einer Diashow.
const ABSPANN_SCENES = {
  "14.1": {
    label: "Abspann — Erinnerungen",
    abspann: true,
    gleichzeitig: 6,
    slideDauer: 11000,
    blendDauer: 4000,
    dankText: "Vielen Dank",
    soundFile: "ending.ogg"
    // mitPortraits: true,
    // zusatzBilder: ["images/interior_abschied.webp"],
    // ohneBilder: ["images/interior_frachtraum_leer.webp"]
  }
};

const DEFAULT_ABSPANN_SCENE = "14.1";

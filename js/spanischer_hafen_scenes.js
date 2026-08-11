// Szenen-Definition für den Spanischen Hafen (Bibel 7.2, Verzweigung 1 -
// einer von drei freien Wegen nach der Schatzinsel: "Suche nach
// Heilkräutern", Risiko einer Begegnung mit dem spanischen Offizier).
//
// Gleiches flaches Muster wie schatzinsel_scenes.js - bisher nur ein
// einziger Marker/Szenen-Zustand, lohnt sich (noch) nicht als Basis/
// Override wie beim Schiff.
//
// Szenen-ID "7.1": nächste freie führende Ziffer nach Grimsgate (1.x),
// Golden Lion (2.x/3.x/5.x/6.x) und Schatzinsel (4.x) - siehe CLAUDE.md,
// Szenen-ID-Konvention, und der Hinweis am Ende von golden_lion_scenes.js.
//
// STAND: bewusst nur ein technisches Grundgerüst (ein Marker, Platzhalter-
// bild) - Inhalt/NPCs/Interaktionen noch nicht ausgearbeitet, siehe
// KAMPAGNEN-BIBEL.md Abschnitt 7.2. Bild ist ein Platzhalter (bestehendes
// Grimsgate-Hafenmeisterei-Bild) bis eigenes Referenzbild existiert - siehe
// CLAUDE.md, "Bild-Overlay-Fallback".
const SPANISCHER_HAFEN_SCENES = {
  "7.1": {
    label: "Spanischer Hafen",
    background: "images/interior_hafenmeisterei.webp", // Platzhalter, siehe Kommentar oben
    markers: [
      {
        id: "hafen_anlegestelle",
        top: 50, left: 50,
        title: "Anlegestelle",
        desc: "Ein spanischer Hafen — geschäftiges Kommen und Gehen am Kai, fremde Sprache in der Luft. [Platzhalter — Ortsbeschreibung folgt.]",
        img: "images/interior_hafenmeisterei.webp" // Platzhalter, siehe Kommentar oben
      }
    ]
  }
};

const DEFAULT_SPANISCHER_HAFEN_SCENE = "7.1";

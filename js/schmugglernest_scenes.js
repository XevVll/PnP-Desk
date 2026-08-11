// Szenen-Definition für das Schmugglernest (Bibel 7.2, Verzweigung 1 -
// einer von drei freien Wegen nach der Schatzinsel: "Untergrundwissen /
// Artefakt", schaltet später die Schamanen-Insel frei, Bibel 7.4).
//
// Gleiches flaches Muster wie schatzinsel_scenes.js/spanischer_hafen_scenes.js.
//
// Szenen-ID "8.1": nächste freie führende Ziffer, siehe Kommentar in
// spanischer_hafen_scenes.js und golden_lion_scenes.js.
//
// STAND: bewusst nur ein technisches Grundgerüst (ein Marker, Platzhalter-
// bild) - Inhalt/NPCs/Interaktionen noch nicht ausgearbeitet, siehe
// KAMPAGNEN-BIBEL.md Abschnitt 7.2. Bild ist ein Platzhalter (bestehendes
// Grimsgate-Lagerhäuser-Bild) bis eigenes Referenzbild existiert - siehe
// CLAUDE.md, "Bild-Overlay-Fallback".
const SCHMUGGLERNEST_SCENES = {
  "8.1": {
    label: "Schmugglernest",
    background: "images/interior_lagerhaeuser.webp", // Platzhalter, siehe Kommentar oben
    markers: [
      {
        id: "schmuggler_lager",
        top: 50, left: 50,
        title: "Verstecktes Lager",
        desc: "Ein verborgener Umschlagplatz abseits der offiziellen Häfen — gedämpfte Stimmen, wachsame Blicke. [Platzhalter — Ortsbeschreibung folgt.]",
        img: "images/interior_lagerhaeuser.webp" // Platzhalter, siehe Kommentar oben
      }
    ]
  }
};

const DEFAULT_SCHMUGGLERNEST_SCENE = "8.1";

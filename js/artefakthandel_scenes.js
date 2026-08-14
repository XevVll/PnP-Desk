// Szenen-Definition für den Artefakthandel (Bibel 7.3, fest - "wuchtiger
// Auftakt" von Session 2, kein freier Weg wie 7.1/8.1). Golden Lion trifft
// ein fremdes, exotisch wirkendes Schiff zum Handel.
//
// Flaches Muster, EIN einziger Marker - auf Hendriks ausdrücklichen Wunsch
// bewusst KEINE Sub-Orte für diese Szene ("Hier gibt es keine Unterorte").
//
// Szenen-ID "9.1": nächste freie führende Ziffer nach Grimsgate (1.x),
// Golden Lion (2.x/3.x/5.x/6.x), Schatzinsel (4.x), Spanischer Hafen (7.x)
// und Schmugglernest (8.x) - siehe CLAUDE.md, Szenen-ID-Konvention.
//
// STAND: bewusst nur ein technisches Grundgerüst (ein Marker, aber schon
// mit echtem Referenzbild) - Inhalt/NPCs/Interaktionen noch nicht
// ausgearbeitet, siehe KAMPAGNEN-BIBEL.md Abschnitt 7.3. Aus dem bisherigen
// Gespräch mit Hendrik schon feststehend (noch nicht in Interaktionen
// gegossen): Nebel liegt auf fast stillem Wasser, ein exotisch wirkendes
// fremdes Schiff mit noch exotischer wirkender Crew, spürbar bedrohliche
// Grundstimmung; Harwick geht mit Cormac/Wat/Tom in die Kajüte des anderen
// Schiffs, während der Rest der Gruppe ein paar Minuten Zeit zur
// Vorbereitung hat, ohne zu wissen, was kommt.
//
// Bild: "scene_artefakthandel.webp" existiert bereits (PNG->WebP schon
// konvertiert, siehe CLAUDE.md-Changelog 14.08.) - zeigt Golden Lion neben
// dem fremden Schiff, bisher nur noch nicht verknüpft.
const ARTEFAKTHANDEL_SCENES = {
  "9.1": {
    label: "Artefakthandel",
    background: "images/scene_artefakthandel.webp",
    markers: [
      {
        id: "handelstreffen",
        top: 50, left: 50,
        title: "Das Handelstreffen",
        desc: "Nebel liegt auf fast stillem Wasser. Die Golden Lion liegt neben einem fremden, exotisch wirkenden Schiff — noch exotischer als das Schiff selbst wirkt die Crew an Bord. [Platzhalter — weitere Ortsbeschreibung folgt.]",
        img: "images/scene_artefakthandel.webp"
      }
    ]
  }
};

const DEFAULT_ARTEFAKTHANDEL_SCENE = "9.1";
